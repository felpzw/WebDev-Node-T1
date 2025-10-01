const mongoose = require('../db/conexao');
const Schema = mongoose.Schema;


const EsquemaCliente = new Schema(
  {
    nome: {
      type: String,
      required: [true, 'O nome do cliente é obrigatório.'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'O e-mail é obrigatório.'],
      unique: true,
      trim: true,
      lowercase: true,
    },
    cpf: {
      type: String,
      required: [true, 'O CPF é obrigatório.'],
      unique: true,
      trim: true,
      match: [/^\d{3}\.\d{3}\.\d{3}-\d{2}$/, 'Formato de CPF inválido. Use XXX.XXX.XXX-XX.'],
    },
    telefone: {
      type: String,
      required: [true, 'O telefone é obrigatório.'],
      trim: true,
    },
    historico: [
      {
        nomePet: {
          type: String,
          required: [true, 'O nome do pet é obrigatório.'],
          trim: true,
        },
        raca: {
          type: String,
          default: 'Não informada',
          trim: true,
        },
        observacoes: {
          type: String,
          trim: true,
        },
        dataHoraAtendimento: {
          type: Date,
          required: [true, 'A data e hora do atendimento são obrigatórias.'],
        },
        servicoRealizado: {
          type: String,
          required: [true, 'O serviço realizado é obrigatório.'],
          enum: ['Banho', 'Tosa', 'Banho e Tosa'],
        },
      },
    ],
  },
  {
    versionKey: false,
    timestamps: true, 
  }
);

const Cliente = mongoose.model('Cliente', EsquemaCliente);

module.exports = Cliente;
