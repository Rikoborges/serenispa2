const express = require('express');
const router = express.Router();
const massageController = require('../controllers/massageController');

// Définition des points d'entrée (Endpoints)
router.get('/', massageController.listerMassages);
router.post('/', massageController.creerMassage);

module.exports = router;