const Massage = require('../models/massage');

exports.listerMassages = async (req, res) => {
    try {
        const massages = await Massage.find().populate('therapistId', 'nom specialite');
        res.status(200).json(massages);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.creerMassage = async (req, res) => {
    try {
        const massage = new Massage({
            nom: req.body.nom,
            duree: req.body.duree,
            prix: req.body.prix,
            description: req.body.description,
            image: req.body.image
        });
        const saved = await massage.save();
        res.status(201).json(saved);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};
