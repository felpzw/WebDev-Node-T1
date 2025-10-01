const express = require('express');
const router = express.Router();
const Cliente = require('../modelos/cliente');

router.post('/', async (req, res) => {
  try {
    const novoCliente = new Cliente(req.body);
    await novoCliente.save();
    res.status(201).json({ message: 'Cliente cadastrado com sucesso!', data: novoCliente });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao cadastrar cliente.', error: error.message });
  }
});

router.get('/', async (req, res) => {
  try {
    const clientes = await Cliente.find();
    res.status(200).json(clientes);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar clientes.', error: error.message });
  }
});

router.get('/cpf/:cpf', async (req, res) => {
  try {
    const cpfFormatado = req.params.cpf.replace(/[.\-]/g, ''); // Remove pontos e traços para busca
    // Busca flexível por CPF com ou sem formatação
    const cliente = await Cliente.findOne({ 
        $or: [
            { cpf: req.params.cpf }, 
            { cpf: { $regex: cpfFormatado } }
        ]
    });

    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar cliente por CPF.', error: error.message });
  }
});

// ROTA: Buscar um cliente específico por ID
router.get('/:id', async (req, res) => {
  try {
    const cliente = await Cliente.findById(req.params.id);
    if (!cliente) {
      return res.status(404).json({ message: 'Cliente não encontrado.' });
    }
    res.status(200).json(cliente);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar cliente.', error: error.message });
  }
});
// Nao ultilizei no front
// ROTA: Atualizar um cliente por ID
router.put('/:id', async (req, res) => {
  try {
    const clienteAtualizado = await Cliente.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!clienteAtualizado) {
      return res.status(404).json({ message: 'Cliente não encontrado para atualização.' });
    }
    res.status(200).json({ message: 'Cliente atualizado com sucesso!', data: clienteAtualizado });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao atualizar cliente.', error: error.message });
  }
});

// ROTA: Apagar um cliente por ID
router.delete('/:id', async (req, res) => {
  try {
    const clienteApagado = await Cliente.findByIdAndDelete(req.params.id);
    if (!clienteApagado) {
      return res.status(404).json({ message: 'Cliente não encontrado para exclusão.' });
    }
    res.status(200).json({ message: 'Cliente apagado com sucesso!' });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao apagar cliente.', error: error.message });
  }
});

module.exports = router;
