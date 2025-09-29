const express = require('express');
const router = express.Router();
const Agendamento = require('../modelos/agendamento');
const ConfiguracaoHorarios = require('../modelos/configuracaoHorarios');

// ROTA: Listar horários disponíveis para a próxima semana
router.get('/horarios-disponiveis', async (req, res) => {
    try {
        const hoje = new Date();
        hoje.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data
        const dataLimite = new Date(hoje);
        dataLimite.setDate(hoje.getDate() + 7); // Limite de 7 dias à frente

        // 1. Buscar a configuração de horários e os agendamentos futuros
        const [configuracoes, agendamentosFuturos] = await Promise.all([
            ConfiguracaoHorarios.find(),
            Agendamento.find({ dataHora: { $gte: hoje, $lt: dataLimite } })
        ]);

        // 2. Mapear agendamentos existentes por data e hora para contagem rápida
        const contagemAgendamentos = agendamentosFuturos.reduce((acc, ag) => {
            const chave = ag.dataHora.toISOString();
            acc[chave] = (acc[chave] || 0) + 1;
            return acc;
        }, {});

        // 3. Construir a lista de horários disponíveis
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
                
                // Ignorar horários que já passaram no dia de hoje
                if (dataSlot < agora) {
                    continue;
                }
                
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


// ROTA: Criar um novo agendamento
router.post('/', async (req, res) => {
  try {
    const { cliente, pet, dataHora, servico } = req.body;

    const dataAgendamento = new Date(dataHora);
    const diaSemana = dataAgendamento.getDay();
    const hora = `${dataAgendamento.getHours().toString().padStart(2, '0')}:${dataAgendamento.getMinutes().toString().padStart(2, '0')}`;

    // 1. Verificar se o slot de horário é válido de acordo com a configuração
    const config = await ConfiguracaoHorarios.findOne({ diaSemana, hora });
    if (!config) {
      return res.status(400).json({ message: 'Este horário não está disponível para agendamento.' });
    }

    // 2. Verificar se ainda há vagas no slot desejado (prevenindo concorrência)
    const agendamentosNoSlot = await Agendamento.countDocuments({ dataHora: dataAgendamento });
    if (agendamentosNoSlot >= config.capacidade) {
      return res.status(400).json({ message: 'Desculpe, não há mais vagas neste horário.' });
    }

    // 3. Criar o agendamento
    const novoAgendamento = new Agendamento({ cliente, pet, dataHora: dataAgendamento, servico });
    await novoAgendamento.save();

    res.status(201).json({ message: 'Agendamento realizado com sucesso!', data: novoAgendamento });
  } catch (error) {
    res.status(400).json({ message: 'Erro ao criar agendamento.', error: error.message });
  }
});

// ROTA: Listar agendamentos de um cliente específico
router.get('/cliente/:clienteId', async (req, res) => {
    try {
        const agendamentos = await Agendamento.find({ cliente: req.params.clienteId }).sort({ dataHora: -1 });
        res.status(200).json(agendamentos);
    } catch (error) {
        res.status(500).json({ message: "Erro ao buscar agendamentos do cliente.", error: error.message });
    }
});


module.exports = router;
