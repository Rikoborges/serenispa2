const reservationService = require('../services/reservationService');
const User = require('../models/user');
const Massage = require('../models/massage');
const { sendReservationConfirmation } = require('../services/emailService');

exports.creerReservation = async (req, res) => {
  try {
    const reservation = await reservationService.createReservation(
      req.auth.userId,
      req.body.massageId,
      req.body.date
    );

    res.status(201).json({ message: "Réservation confirmée !", reservation });

    // Email en arrière-plan (ne bloque pas la réponse)
    try {
      const [user, massage] = await Promise.all([
        User.findById(req.auth.userId),
        Massage.findById(req.body.massageId),
      ]);
      if (user && massage) {
        await sendReservationConfirmation({
          to: user.email,
          nom: user.nom,
          massage: massage.nom,
          date: req.body.date,
        });
      }
    } catch (_) {}

  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.modifierReservation = async (req, res) => {
  try {
    const reservation = await reservationService.updateReservation(
      req.params.id,
      req.auth.userId,
      req.body.date
    );
    res.status(200).json({ message: "Réservation mise à jour !", reservation });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.supprimerReservation = async (req, res) => {
  try {
    const result = await reservationService.deleteReservation(
      req.params.id,
      req.auth.userId
    );
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};
