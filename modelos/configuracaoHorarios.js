const mongoose = require('../db/conexao');
const Schema = mongoose.Schema;


const EsquemaConfiguracaoHorarios = new Schema(
  {
    diaSemana: {
      type: Number,
      required: true,
      min: 0, 
      max: 6,
    },
    hora: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido. Use HH:MM.'],
    },
    capacidade: {
      type: Number,
      required: true,
      min: 0, // A capacidade não pode ser negativa
      default: 1,
    },
  },
  {
    versionKey: false,
    // Cria um índice composto para garantir que cada combinação de dia/hora seja única
    indexes: [{ unique: true, fields: ['diaSemana', 'hora'] }]
  }
);

const ConfiguracaoHorarios = mongoose.model('ConfiguracaoHorarios', EsquemaConfiguracaoHorarios);

module.exports = ConfiguracaoHorarios;
