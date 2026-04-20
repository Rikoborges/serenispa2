const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  try {
    // 1. Récupérer le token dans l'en-tête "Authorization"
    const token = req.headers.authorization.split(' ')[1]; // Format: "Bearer TOKEN"
    
    // 2. Vérifier et décoder le token
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    
    // 3. Ajouter les infos de l'utilisateur à la requête pour la suite
    req.auth = { userId: decodedToken.userId, isAdmin: decodedToken.isAdmin === true, role: decodedToken.role };
    
    // 4. Passer à l'étape suivante
    next();
  } catch (error) {
    res.status(401).json({ message: "Requête non authentifiée ! Vous devez être connecté." });
  }
};