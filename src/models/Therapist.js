const mongoose = require('mongoose');

const therapistSchema = new mongoose.Schema({
  nom: { type: String, required: true, unique: true },
  specialite: { type: String, required: true }, // ex: "Massage Relaxant", "Récupération sportive"
  bio: { type: String },
  email: { type: String },
  telephone: { type: String },
  actif: { type: Boolean, default: true }
});

module.exports = mongoose.model('Therapist', therapistSchema);
