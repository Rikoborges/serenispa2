const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  hashedPassword: { type: String, required: true }, // Sécurité : jamais en clair !
  telephone: { type: String },
  isAdmin: { type: Boolean, default: false }
});

module.exports = mongoose.model('User', userSchema);