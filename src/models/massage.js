const mongoose = require('mongoose');

// Schéma basé sur le cahier des charges SereniSpa [cite: 26]
const massageSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  duree: { type: Number, required: true }, // durée en minutes
  prix: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String } // URL de l'image (format WebP recommandé pour l'éco-conception) [cite: 11]
});

module.exports = mongoose.model('Massage', massageSchema);