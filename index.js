const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
require('dotenv').config();
const connectDB = require('./src/config/db');

// Importation des routes
const authRoutes = require('./src/routes/authRoutes');
const reservationRoutes = require('./src/routes/reservationRoutes');
const massageRoutes = require('./src/routes/massageRoutes');
const adminRoutes = require('./src/routes/adminRoutes');

// Modèles pour la route utilisateur
const User = require('./src/models/user');
const auth = require('./src/middleware/authMiddleware');

// Documentation Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

// Connexion Base de données
connectDB();

// Middlewares de Sécurité
app.use(helmet()); 
app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://127.0.0.1:5500',
    'https://serenispa2.vercel.app',
  ],
  credentials: true,
}));
app.use(express.json());

// Configuration Swagger 
const options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "SereniSpa API",
      version: "1.0.0",
      description: "Documentation de l'API pour la plateforme SereniSpa",
    },
    servers: [{ url: "http://localhost:3000" }],
  },
  apis: ["./src/routes/*.js"], 
};
const specs = swaggerJsdoc(options);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(specs));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/massages', massageRoutes);
app.use('/api/admin', adminRoutes);

// Route RGPD : supprimer son propre compte
app.delete('/api/users/me', auth, async (req, res) => {
    try {
        await User.findByIdAndDelete(req.auth.userId);
        res.status(200).json({ message: "Compte supprimé avec succès." });
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la suppression." });
    }
});

// Servir les fichiers statiques du frontend (HTML, CSS, JS)
app.use(express.static(__dirname));

// Démarrage du serveur
const PORT = process.env.PORT || 3000;
if (process.env.NODE_ENV !== 'test') {
    app.listen(PORT, () => console.log(`🚀 Serveur SereniSpa actif sur le port ${PORT}`));
}

module.exports = app;