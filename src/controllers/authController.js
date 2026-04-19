const User = require('../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// Inscription (Signup)
exports.inscription = async (req, res) => {
  try {
    const { nom, email, password, telephone } = req.body;

    // Hashage du mot de passe (10 tours de sel)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const nouveauUser = new User({
      nom,
      email,
      hashedPassword,
      telephone
    });

    await nouveauUser.save();
    res.status(201).json({ message: "Utilisateur créé avec succès !" });
  } catch (error) {
    res.status(400).json({ message: "Erreur lors de l'inscription", error });
  }
};
/*==================================*/

// Connexion (Login)
exports.connexion = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Chercher l'utilisateur par son email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // 2. Vérifier si le mot de passe est correct avec bcrypt
    const isMatch = await bcrypt.compare(password, user.hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ message: "Email ou mot de passe incorrect" });
    }

    // 3. Créer le Token JWT (valable 7 jours comme dans le PDF)
    const token = jwt.sign(
      { userId: user._id, role: 'client' },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    res.status(200).json({ token, user: { nom: user.nom }, message: "Connexion réussie !" });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
};