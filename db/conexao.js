const mongoose = require("mongoose");


const MONGODB_URI = "mongodb://root:root@localhost:27017/PETSHOP?authSource=admin";

mongoose.set('strictQuery', true);

mongoose
  .connect(MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Conectado ao MongoDB: PETSHOP"))
  .catch((err) => {
    console.error("Erro ao conectar ao MongoDB:", err.message);
    process.exit(1);
  });

module.exports = mongoose;

