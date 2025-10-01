const express = require('express');
const router = express.Router();
const Agendamento = require('../modelos/agendamento');
const ConfiguracaoHorarios = require('../modelos/configuracaoHorarios');
const Cliente = require('../modelos/cliente');

router.get('/horarios-disponiveis', async (req, res) => {
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0);
        const dataLimite = new Date(hoje);
        dataLimite.setDate(hoje.getDate() + 7);

        const [configuracoes, agendamentosFuturos] = await Promise.all([
            ConfiguracaoHorarios.find(),
            Agendamento.find({ dataHora: { $gte: hoje, $lt: dataLimite } })
        ]);

        const contagemAgendamentos = agendamentosFuturos.reduce((acc, ag) => {
            const chave = ag.dataHora.toISOString();
            acc[chave] = (acc[chave] || 0) + 1;
            return acc;
        }, {});

        const horariosDisponiveis = [];
        const agora = new Date();

        for (let i = 0; i < 7; i++) {
            const dataCorrente = new Date(hoje);
            dataCorrente.setDate(hoje.getDate() + i);
            const diaSemana = dataCorrente.getDay();

            const configsDoDia = configuracoes.filter(c => c.diaSemana === diaSemana);

            for (const config of configsDoDia) {
                const [hora, minuto] = config.hora.split(':');
                const dataSlot = new Date(dataCorrente);
                dataSlot.setHours(parseInt(hora), parseInt(minuto), 0, 0);
                
                if (dataSlot < agora) continue;
                
                const chave = dataSlot.toISOString();
                const agendados = contagemAgendamentos[chave] || 0;
                const vagas = config.capacidade - agendados;

                if (vagas > 0) {
                    horariosDisponiveis.push({
                        data: dataSlot,
                        vagas: vagas
                    });
                }
            }
        }

        res.status(200).json(horariosDisponiveis);

    } catch (error) {
        res.status(500).json({ message: 'Erro ao buscar horários disponíveis.', error: error.message });
    }
});

router.post('/', async (req, res) => {
  const { cpf, pet, dataHora, servico } = req.body;

  if (!cpf) {
    return res.status(400).json({ message: 'O CPF do cliente é obrigatório.' });
  }

  try {
    const cpfLimpo = cpf.replace(/[.\-]/g, '');
    const clienteEncontrado = await Cliente.findOne({
        $or: [{ cpf: cpf }, { cpf: { $regex: cpfLimpo } }]
    });

    if (!clienteEncontrado) {
      return res.status(404).json({ message: 'Cliente com este CPF não encontrado. Verifique o CPF ou cadastre o cliente.' });
    }

    const dataAgendamento = new Date(dataHora);
    const diaSemana = dataAgendamento.getDay();
    const hora = `${dataAgendamento.getHours().toString().padStart(2, '0')}:${dataAgendamento.getMinutes().toString().padStart(2, '0')}`;

    const config = await ConfiguracaoHorarios.findOne({ diaSemana, hora });
    if (!config) {
      return res.status(400).json({ message: 'Este horário não está disponível para agendamento.' });
    }
    const agendamentosNoSlot = await Agendamento.countDocuments({ dataHora: dataAgendamento });
    if (agendamentosNoSlot >= config.capacidade) {
      return res.status(400).json({ message: 'Desculpe, não há mais vagas neste horário.' });
    }

    const novoAgendamento = new Agendamento({
      cliente: clienteEncontrado._id,
      pet: { nome: pet.nome, raca: pet.raca },
      dataHora: dataAgendamento,
      servico,
    });
    await novoAgendamento.save();

    clienteEncontrado.historico.push({
      nomePet: pet.nome,
      raca: pet.raca,
      dataHoraAtendimento: dataAgendamento,
      servicoRealizado: servico,
    });
    await clienteEncontrado.save();

    res.status(201).json({ message: 'Agendamento realizado com sucesso!', data: novoAgendamento });
  } catch (error) {
    console.error("Erro detalhado no agendamento:", error);
    res.status(400).json({ message: 'Erro ao criar agendamento.', error: error.message });
  }
});

module.exports = router;