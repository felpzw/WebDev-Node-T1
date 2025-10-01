const mongoose = require('../db/conexao');
const Schema = mongoose.Schema;


const EsquemaAgendamento = new Schema(
  {
    cliente: {
      type: Schema.Types.ObjectId,
      ref: 'Cliente', // Referência ao modelo Cliente
      required: [true, 'O cliente é obrigatório para o agendamento.'],
    },
    // Armazena uma cópia dos dados do pet para facilitar a visualização
    // sem a necessidade de popular o documento do cliente toda vez.
    pet: {
      nome: { type: String, required: true },
      raca: { type: String },
    },
    dataHora: {
      type: Date,
      required: [true, 'A data e hora do agendamento são obrigatórias.'],
    },
    servico: {
      type: String,
      required: [true, 'O serviço é obrigatório.'],
      enum: ['Banho', 'Tosa', 'Banho e Tosa'], // Garante que o serviço seja um dos valores permitidos
      default: 'Banho e Tosa',
    },
    status: {
      type: String,
      enum: ['Agendado', 'Concluído', 'Cancelado'],
      default: 'Agendado',
    },
  },
  {
    versionKey: false,
    timestamps: true,
  }
);

// Cria um índice na data do agendamento para otimizar consultas por período
EsquemaAgendamento.index({ dataHora: 1 });

const Agendamento = mongoose.model('Agendamento', EsquemaAgendamento);

module.exports = Agendamento;
