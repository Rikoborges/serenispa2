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
    nom: 'Massage Suédois',
    description: "Détente profonde du corps et de l'esprit, idéal pour évacuer le stress du quotidien.",
    prix: 80,
    duree: 60,
    image: 'src/assets/massage-sueca.webp'
  },
  {
    nom: 'Massage Thaïlandais',
    description: "Technique dynamique qui libère les tensions, stimule la circulation et redonne de l'énergie.",
    prix: 90,
    duree: 60,
    image: 'src/assets/massage-tailandesa.webp'
  },
  {
    nom: 'Pierres Chaudes',
    description: 'Chaleur thérapeutique des pierres volcaniques pour libérer les tensions les plus profondes.',
    prix: 100,
    duree: 90,
    image: 'src/assets/massagem-hotstone.webp'
  },
  {
    nom: 'Massage Relaxant',
    description: 'Massage thérapeutique doux pour favoriser une détente profonde et apaiser le corps.',
    prix: 75,
    duree: 60,
    image: 'src/assets/massage-relaxante.webp'
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log('Conectado ao MongoDB');

  await Massage.deleteMany({});
  console.log('Massages antigos apagados');

  await Massage.insertMany(massages);
  console.log('4 massages novos inseridos com sucesso');

  await mongoose.disconnect();
  process.exit(0);
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
