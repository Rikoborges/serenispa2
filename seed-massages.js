const mongoose = require('mongoose');
require('dotenv').config();

const massageSchema = new mongoose.Schema({
  nom: String,
  duree: Number,
  prix: Number,
  description: String,
  image: String
});
const Massage = mongoose.model('Massage', massageSchema);

const massages = [
  {
    nom: 'Massage Relaxant',
    description: "Détente profonde du corps et de l'esprit, idéal pour évacuer le stress du quotidien.",
    prix: 60,
    duree: 60,
    image: 'src/assets/masage relaxante.webp'
  },
  {
    nom: 'Récupération Sportive',
    description: "Ciblé sur les muscles fatigués pour une récupération rapide après l'effort physique.",
    prix: 70,
    duree: 45,
    image: 'src/assets/depp muscle.webp'
  },
  {
    nom: 'Aromathérapie',
    description: "Huiles essentielles biologiques sélectionnées pour éveiller vos sens et régénérer la peau.",
    prix: 65,
    duree: 60,
    image: 'src/assets/creme.webp'
  },
  {
    nom: 'Pierres Chaudes',
    description: 'Chaleur thérapeutique des pierres volcaniques pour libérer les tensions les plus profondes.',
    prix: 85,
    duree: 90,
    image: 'src/assets/hotstone.webp'
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado ao MongoDB');

  await Massage.deleteMany({});
  console.log('Massages antigos apagados');

  await Massage.insertMany(massages);
  console.log('3 massages novos inseridos com sucesso');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
