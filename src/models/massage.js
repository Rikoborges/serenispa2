const mongoose = require('mongoose');

const massageSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  duree: { type: Number, required: true }, // 55 minutes
  prix: { type: Number, required: true },
  description: { type: String, required: true },
  image: { type: String },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist' } // Qui fait ce massage
});

module.exports = mongoose.model('Massage', massageSchema);