const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const reservationController = require('../controllers/reservationController');
const availabilityService = require('../services/availabilityService');
const Reservation = require('../models/Reservation');

// Créer une réservation (therapist requiert)
router.post('/', auth, reservationController.creerReservation);

// Modifier une réservation
router.put('/:id', auth, reservationController.modifierReservation);

// Supprimer une réservation
router.delete('/:id', auth, reservationController.supprimerReservation);

// GET crénaux disponibles pour un massage et therapist
router.get('/available-slots/:massageId/:therapistId', async (req, res) => {
  try {
    const { massageId, therapistId } = req.params;
    const slots = await availabilityService.getAvailableSlots(massageId, therapistId);
    res.json({ slots });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// GET mes réservations (utilisateur logé)
router.get('/my-reservations', auth, async (req, res) => {
  try {
    const reservations = await Reservation.find({ userId: req.auth.userId })
      .populate('massageId', 'nom prix duree')
      .populate('therapistId', 'nom specialite')
      .sort({ date: -1 });

    res.json({ reservations });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;