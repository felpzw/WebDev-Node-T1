const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Esquema de Configuração de Horários
 * Define o template da agenda semanal do Pet Shop, especificando a capacidade
 * de atendimento para cada dia e hora.
 */
const EsquemaConfiguracaoHorarios = new Schema(
  {
    diaSemana: {
      type: Number,
      required: true,
      min: 0, // 0 para Domingo, 1 para Segunda, ..., 6 para Sábado
      max: 6,
    },
    hora: {
      type: String,
      required: true,
      // Validação simples para o formato HH:MM
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
