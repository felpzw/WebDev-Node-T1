const mongoose = require('../db/conexao');
const Schema = mongoose.Schema;

/**
 * Esquema do Cliente
 * Armazena os dados dos donos dos pets que utilizam o serviço.
 */
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
    telefone: {
      type: String,
      required: [true, 'O telefone é obrigatório.'],
      trim: true,
    },
    // Subdocumento para armazenar informações dos pets do cliente
    pets: [
      {
        nome: {
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
      },
    ],
  },
  {
    versionKey: false, // Desabilita o campo de versão __v
    timestamps: true, // Adiciona os campos createdAt e updatedAt
  }
);

const Cliente = mongoose.model('Cliente', EsquemaCliente);

module.exports = Cliente;
