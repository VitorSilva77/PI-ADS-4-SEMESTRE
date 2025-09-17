const express = require('express');
const router = express.Router();
const Ticket = require('../models/Ticket');
const { requireAuth, requirePermission, requireUserType } = require('../middleware/auth');

// Rota para listar chamados (baseado nas permissões do usuário)
router.get('/', requireAuth, requirePermission('canAccessTickets'), async (req, res) => {
    try {
        const user = req.session.user;
        let tickets;

        if (user.permissions.includes('canResolveTickets')) {
            // TI vê todos os chamados
            tickets = await Ticket.findAll();
        } else {
            // Outros usuários veem apenas seus próprios chamados
            tickets = await Ticket.findByUser(user.id_usuario);
        }

        res.json({
            success: true,
            tickets: tickets
        });
    } catch (error) {
        console.error('Erro ao listar chamados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para obter chamados abertos (apenas TI)
router.get('/open', requireAuth, requirePermission('canResolveTickets'), async (req, res) => {
    try {
        const tickets = await Ticket.findOpen();

        res.json({
            success: true,
            tickets: tickets
        });
    } catch (error) {
        console.error('Erro ao listar chamados abertos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para obter chamado específico
router.get('/:id', requireAuth, requirePermission('canAccessTickets'), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.session.user;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Chamado não encontrado.'
            });
        }

        // Verificar se o usuário pode ver este chamado
        if (!user.permissions.includes('canResolveTickets') && 
            ticket.id_usuario_abertura !== user.id_usuario) {
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para visualizar este chamado.'
            });
        }

        res.json({
            success: true,
            ticket: ticket
        });
    } catch (error) {
        console.error('Erro ao obter chamado:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para criar chamado
router.post('/', requireAuth, requirePermission('canAccessTickets'), async (req, res) => {
    try {
        const { titulo, descricao } = req.body;
        const user = req.session.user;

        // Validar dados de entrada
        if (!titulo || !descricao) {
            return res.status(400).json({
                success: false,
                message: 'Título e descrição são obrigatórios.'
            });
        }

        const newTicket = await Ticket.create({
            titulo,
            descricao,
            id_usuario_abertura: user.id_usuario
        });

        res.status(201).json({
            success: true,
            message: 'Chamado criado com sucesso.',
            ticket: newTicket
        });
    } catch (error) {
        console.error('Erro ao criar chamado:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para atribuir chamado para TI
router.put('/:id/assign', requireAuth, requirePermission('canResolveTickets'), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.session.user;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Chamado não encontrado.'
            });
        }

        const updatedTicket = await ticket.assignToTI(user.id_usuario);

        res.json({
            success: true,
            message: 'Chamado atribuído com sucesso.',
            ticket: updatedTicket
        });
    } catch (error) {
        console.error('Erro ao atribuir chamado:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para resolver chamado (apenas TI)
router.put('/:id/resolve', requireAuth, requirePermission('canResolveTickets'), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.session.user;

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Chamado não encontrado.'
            });
        }

        const resolvedTicket = await ticket.resolve(user.id_usuario);

        res.json({
            success: true,
            message: 'Chamado resolvido com sucesso.',
            ticket: resolvedTicket
        });
    } catch (error) {
        console.error('Erro ao resolver chamado:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para atualizar status do chamado (apenas TI)
router.put('/:id/status', requireAuth, requirePermission('canResolveTickets'), async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const user = req.session.user;

        // Validar status
        const validStatuses = ['Aberto', 'Em Andamento', 'Resolvido'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Status inválido.'
            });
        }

        const ticket = await Ticket.findById(id);
        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Chamado não encontrado.'
            });
        }

        const updatedTicket = await ticket.updateStatus(status, user.id_usuario);

        res.json({
            success: true,
            message: 'Status do chamado atualizado com sucesso.',
            ticket: updatedTicket
        });
    } catch (error) {
        console.error('Erro ao atualizar status do chamado:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para obter estatísticas de chamados
router.get('/stats/overview', requireAuth, requireUserType(['TI', 'Gerencia']), async (req, res) => {
    try {
        const stats = await Ticket.getStatistics();

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas de chamados:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

module.exports = router;

