const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');
const Reservation = require('../models/Reservation');
const Therapist = require('../models/Therapist');
const Massage = require('../models/massage');
const User = require('../models/user');

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

// POST /api/admin/setup-admin — Ativar isAdmin para usuário (via API, seguro)
router.post('/setup-admin', auth, async (req, res) => {
  try {
    const user = await User.findById(req.auth.userId);

    if (!user) return res.status(404).json({ message: "Usuário não encontrado" });

    user.isAdmin = true;
    user.role = 'admin';
    await user.save();

    res.json({ message: "Você agora é admin!", user: { nom: user.nom, isAdmin: user.isAdmin } });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/admin/seed-therapists — Créer les therapists
router.post('/seed-therapists', async (req, res) => {
  try {
    // Vérifier si therapists existent déjà
    const count = await Therapist.countDocuments();
    if (count > 0) {
      return res.json({ message: 'Therapists déjà créés', count });
    }

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

    // Associer les therapists aux massages (45 minutos)
    const massageUpdates = [
      { nom: 'Massage Suédois', therapistId: therapists[0]._id, duree: 45 },
      { nom: 'Massage Thaïlandais', therapistId: therapists[1]._id, duree: 45 },
      { nom: 'Pierres Chaudes', therapistId: therapists[2]._id, duree: 45 },
      { nom: 'Massage Relaxant', therapistId: therapists[0]._id, duree: 45 }
    ];

    for (const update of massageUpdates) {
      await Massage.updateOne({ nom: update.nom }, update, { upsert: true });
    }

    res.json({ message: 'Therapists créés et massages mis à jour', therapists });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
