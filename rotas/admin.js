const express = require('express');
const router = express.Router();
const Agendamento = require('../modelos/agendamento');
const ConfiguracaoHorarios = require('../modelos/configuracaoHorarios');

router.post('/configuracao-horarios', async (req, res) => {
  try {
    const { diaSemana, hora, capacidade } = req.body;
    const config = await ConfiguracaoHorarios.findOneAndUpdate(
      { diaSemana, hora },
      { capacidade },
      { new: true, upsert: true, runValidators: true } // "upsert: true" cria se não existir
    );
    res.status(201).json({ message: 'Configuração de horário salva com sucesso!', data: config });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao salvar configuração.', error: error.message });
  }
});

router.get('/configuracao-horarios', async (req, res) => {
  try {
    const configs = await ConfiguracaoHorarios.find().sort({ diaSemana: 1, hora: 1 });
    res.status(200).json(configs);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar configurações.', error: error.message });
  }
});


router.get('/agenda', async (req, res) => {
  try {
    const todosOsAgendamentos = await Agendamento.find({}) // Busca todos os documentos
      .populate('cliente', 'nome') // Popula com o nome do cliente
      .sort({ dataHora: 1 }); // Ordena pela data, do mais antigo ao mais novo

    res.status(200).json(todosOsAgendamentos);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar a agenda.', error: error.message });
  }
});

router.patch('/agendamentos/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        const agendamento = await Agendamento.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!agendamento) {
            return res.status(404).json({ message: "Agendamento não encontrado." });
        }
        res.status(200).json({ message: "Status do agendamento atualizado!", data: agendamento });
    } catch (error) {
        res.status(400).json({ message: "Erro ao atualizar status.", error: error.message });
    }
});

module.exports = router;
