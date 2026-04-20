const reservationService = require('../services/reservationService');

exports.creerReservation = async (req, res) => {
  try {
    // Le controller ne sait pas COMMENT on crée, il demande juste au SERVICE de le faire
    const reservation = await reservationService.createReservation(
      req.auth.userId,
      req.body.massageId,
      req.body.date
    );

    res.status(201).json({ message: "Réservation confirmée !", reservation });
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