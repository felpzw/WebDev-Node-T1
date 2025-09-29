const express = require('express');
const router = express.Router();
const Agendamento = require('../modelos/agendamento');
const ConfiguracaoHorarios = require('../modelos/configuracaoHorarios');

// --- ROTAS DE CONFIGURAÇÃO DE HORÁRIOS ---

// ROTA: Criar ou atualizar uma configuração de horário
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

// ROTA: Listar todas as configurações de horários
router.get('/configuracao-horarios', async (req, res) => {
  try {
    const configs = await ConfiguracaoHorarios.find().sort({ diaSemana: 1, hora: 1 });
    res.status(200).json(configs);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar configurações.', error: error.message });
  }
});

// --- ROTAS DE VISUALIZAÇÃO DA AGENDA ---

// ROTA: Visualizar a agenda para uma data específica
router.get('/agenda/:data', async (req, res) => {
  try {
    const dataSelecionada = new Date(req.params.data);
    const inicioDia = new Date(dataSelecionada.setHours(0, 0, 0, 0));
    const fimDia = new Date(dataSelecionada.setHours(23, 59, 59, 999));

    const agendamentosDoDia = await Agendamento.find({
      dataHora: { $gte: inicioDia, $lte: fimDia }
    })
    .populate('cliente', 'nome telefone') // Popula com nome e telefone do cliente
    .sort({ dataHora: 1 });

    res.status(200).json(agendamentosDoDia);
  } catch (error) {
    res.status(500).json({ message: 'Erro ao buscar a agenda do dia.', error: error.message });
  }
});

// ROTA: Atualizar o status de um agendamento (ex: para "Concluído")
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
