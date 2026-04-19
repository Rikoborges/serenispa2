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
    // Si le service lance une erreur (date passée, etc.), elle est capturée ici
    res.status(400).json({ message: error.message });
  }
};