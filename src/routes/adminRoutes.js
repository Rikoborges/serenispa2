const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Reservation = require('../models/Reservation');
const Therapist = require('../models/Therapist');
const Massage = require('../models/massage');

// GET /api/admin/stats — tableau de bord admin amélioré
router.get('/stats', auth, adminMiddleware, async (req, res) => {
  try {
    const total = await Reservation.countDocuments();

    // Par massage
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

    // Par therapist
    const byTherapist = await Reservation.aggregate([
      {
        $lookup: {
          from: 'therapists',
          localField: 'therapistId',
          foreignField: '_id',
          as: 'therapist'
        }
      },
      { $unwind: '$therapist' },
      {
        $group: {
          _id: '$therapist._id',
          nom: { $first: '$therapist.nom' },
          count: { $sum: 1 },
          specialite: { $first: '$therapist.specialite' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    // Réservations récentes
    const recent = await Reservation.find()
      .sort({ date: -1 })
      .limit(15)
      .populate('userId', 'nom email')
      .populate('massageId', 'nom prix')
      .populate('therapistId', 'nom specialite');

    // Prochaines réservations (futurs 7 jours)
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);

    const upcoming = await Reservation.find({
      date: { $gte: tomorrow, $lte: nextWeek },
      statut: 'confirmé'
    })
      .sort({ date: 1 })
      .populate('userId', 'nom email telephone')
      .populate('massageId', 'nom')
      .populate('therapistId', 'nom');

    res.json({ total, byMassage, byTherapist, recent, upcoming });
  } catch (error) {
    res.status(500).json({ message: "Erreur serveur", error });
  }
});

// POST /api/admin/seed-therapists — Créer les therapists (dev only)
router.post('/seed-therapists', async (req, res) => {
  try {
    await Therapist.deleteMany({});

    const therapists = await Therapist.insertMany([
      {
        nom: 'Ana',
        specialite: 'Massage Relaxant',
        bio: 'Spécialiste en relaxation et bien-être',
        email: 'ana@serenispa.fr',
        telephone: '06 12 34 56 78'
      },
      {
        nom: 'Léo',
        specialite: 'Récupération sportive',
        bio: 'Expert en récupération sportive et thérapie',
        email: 'leo@serenispa.fr',
        telephone: '06 12 34 56 79'
      },
      {
        nom: 'Julie',
        specialite: 'Aromathérapie',
        bio: 'Spécialiste en aromathérapie et soins énergétiques',
        email: 'julie@serenispa.fr',
        telephone: '06 12 34 56 80'
      }
    ]);

    // Associer les therapists aux massages
    const massageUpdates = [
      { nom: 'Massage Relaxant', therapistId: therapists[0]._id, duree: 55 },
      { nom: 'Massage Thaïlandais', therapistId: therapists[1]._id, duree: 55 },
      { nom: 'Pierres Chaudes', therapistId: therapists[2]._id, duree: 55 },
      { nom: 'Massage Récupération', therapistId: therapists[1]._id, duree: 55 }
    ];

    for (const update of massageUpdates) {
      await Massage.updateOne({ nom: update.nom }, update, { upsert: false });
    }

    res.json({ message: 'Therapists créés et massages mis à jour', therapists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
