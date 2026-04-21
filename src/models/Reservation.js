const mongoose = require('mongoose');

const reservationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  massageId: { type: mongoose.Schema.Types.ObjectId, ref: 'Massage', required: true },
  therapistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Therapist', required: true },
  date: { type: Date, required: true },
  statut: { type: String, default: 'confirmé' }, // Ex: confirmé, annulé
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Reservation', reservationSchema);