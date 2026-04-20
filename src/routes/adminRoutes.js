const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Reservation = require('../models/Reservation');

// GET /api/admin/stats — tableau de bord admin
router.get('/stats', auth, adminMiddleware, async (req, res) => {
  try {
    const total = await Reservation.countDocuments();

    const byMassage = await Reservation.aggregate([
      {
        $lookup: {
          from: 'massages',
          localField: 'massageId',
          foreignField: '_id',
          as: 'massage'
        }
      },
      { $unwind: '$massage' },
      {
        $group: {
          _id: '$massage._id',
          nom: { $first: '$massage.nom' },
          prix: { $first: '$massage.prix' },
          count: { $sum: 1 },
          revenue: { $sum: '$massage.prix' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const recent = await Reservation.find()
      .sort({ date: -1 })
      .limit(10)
      .populate('userId', 'nom email')
      .populate('massageId', 'nom prix');

    res.json({ total, byMassage, recent });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

module.exports = router;
