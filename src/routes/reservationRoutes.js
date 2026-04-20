const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware'); // Notre douane
// (Supposons que vous créerez le reservationController après)
const reservationController = require('../controllers/reservationController');

router.post('/', auth, reservationController.creerReservation);
router.put('/:id', auth, reservationController.modifierReservation);
router.delete('/:id', auth, reservationController.supprimerReservation);

module.exports = router;