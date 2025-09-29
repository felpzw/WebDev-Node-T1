const mongoose = require("mongoose");

mongoose
  .connect("mongodb://localhost:27017/PETSHOP", {})
  .then(() => console.log("Conectado ao MongoDB:PETSHOP"))
  .catch((err) => console.error("Erro ao conectar:", err));

module.exports = mongoose;


