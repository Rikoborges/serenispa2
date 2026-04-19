const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log(" MongoDB Conectado: Pronto para o SereniSpa");
  } catch (error) {
    console.error(" Erro ao conectar ao MongoDB:", error.message);
    process.exit(1); // Para o programa se não conseguir conectar
  }
};

module.exports = connectDB;