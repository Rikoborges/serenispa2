const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.post('/signup', authController.inscription);
router.post('/login', authController.connexion);

module.exports = router;