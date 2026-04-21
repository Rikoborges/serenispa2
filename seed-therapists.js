const mongoose = require('mongoose');
const Therapist = require('./src/models/Therapist');
const Massage = require('./src/models/massage');
require('dotenv').config();

async function seedTherapists() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/serenispa');

    // Vider les therapists existants
    await Therapist.deleteMany({});

    // Créer les 3 therapists
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

    console.log('✅ Therapists créés:', therapists.length);

    // Associer les therapists aux massages
    const massageMap = {
      'Massage Relaxant': therapists[0]._id,      // Ana
      'Massage Thaïlandais': therapists[1]._id,   // Léo (adapté: récup sportive)
      'Pierres Chaudes': therapists[2]._id,       // Julie (aromathérapie)
      'Massage Récupération': therapists[1]._id   // Léo
    };

    // Mettre à jour les massages avec les IDs des therapists
    for (const [massageName, therapistId] of Object.entries(massageMap)) {
      await Massage.updateOne(
        { nom: massageName },
        { therapistId: therapistId, duree: 55 } // 55 min comme spécifié
      );
    }

    console.log('✅ Massages associés aux therapists');
    console.log('\nTherapists créés:');
    therapists.forEach(t => console.log(`  - ${t.nom} (${t.specialite})`));

    await mongoose.connection.close();
  } catch (error) {
    console.error('❌ Erreur:', error.message);
    process.exit(1);
  }
}

seedTherapists();
