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

//ROTA: Popular os clientes
/*
router.post('/popular', async (req, res) => {
  try {
    // Array de pseudoclientes
    const pseudoclientes = [
      {
        nome: 'Ana Paula',
        email: 'ana.paula@email.com',
        cpf: '555.666.777-88',
        telefone: '(48) 96666-4444',
        historico: [
          {
            nomePet: 'Luna',
            raca: 'Poodle',
            observacoes: 'Medrosa',
            dataHoraAtendimento: new Date(),
            servicoRealizado: 'Vacinação'
          }
        ]
      },
      {
        nome: 'Bruno Ferreira',
        email: 'bruno.ferreira@email.com',
        cpf: '222.333.444-55',
        telefone: '(48) 95555-5555',
        historico: [
          {
            nomePet: 'Thor',
            raca: 'Bulldog',
            observacoes: 'Alergia a shampoo',
            dataHoraAtendimento: new Date(),
            servicoRealizado: 'Banho'
          }
        ]
      },
      {
        nome: 'Fernanda Lima',
        email: 'fernanda.lima@email.com',
        cpf: '666.777.888-99',
        telefone: '(48) 94444-6666',
        historico: [
          {
            nomePet: 'Mel',
            raca: 'Siamês',
            observacoes: 'Muito dócil',
            dataHoraAtendimento: new Date(),
            servicoRealizado: 'Consulta'
          }
        ]
      },
      {
        nome: 'Ricardo Alves',
        email: 'ricardo.alves@email.com',
        cpf: '333.444.555-66',
        telefone: '(48) 93333-7777',
        historico: [
          {
            nomePet: 'Simba',
            raca: 'Golden Retriever',
            observacoes: 'Ansioso',
            dataHoraAtendimento: new Date(),
            servicoRealizado: 'Tosa'
          }
        ]
      },
      {
      nome: 'João Silva',
      email: 'joao.silva@email.com',
      cpf: '123.456.789-00',
      telefone: '(48) 99999-1111',
      historico: [
        {
        nomePet: 'Rex',
        raca: 'Labrador',
        observacoes: 'Muito agitado',
        dataHoraAtendimento: new Date(),
        servicoRealizado: 'Banho'
        }
      ]
      },
      {
      nome: 'Maria Oliveira',
      email: 'maria.oliveira@email.com',
      cpf: '987.654.321-00',
      telefone: '(48) 98888-2222',
      historico: [
        {
        nomePet: 'Mimi',
        raca: 'Persa',
        observacoes: 'Gosta de carinho',
        dataHoraAtendimento: new Date(),
        servicoRealizado: 'Tosa'
        }
      ]
      },
      {
      nome: 'Carlos Souza',
      email: 'carlos.souza@email.com',
      cpf: '111.222.333-44',
      telefone: '(48) 97777-3333',
      historico: [
        {
        nomePet: 'Bolt',
        raca: 'Vira-lata',
        observacoes: '',
        dataHoraAtendimento: new Date(),
        servicoRealizado: 'Banho e Tosa'
      }
    ]
  }
];

const results = [];
for (const cliente of pseudoclientes) {
      try {
        const novoCliente = new Cliente(cliente);
        await novoCliente.save();
        results.push(novoCliente);
      } catch (error) {
        //results.push({ error: error.message, cliente });
      }
    }
    
    res.status(201).json({ message: 'Clientes populados com sucesso!', data: results });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao popular clientes.', error: error.message });
  }
});
*/

module.exports = router;
