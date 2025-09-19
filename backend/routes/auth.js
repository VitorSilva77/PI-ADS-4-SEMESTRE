const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { requireAuth } = require('../middleware/auth');

// Rota de login
router.post('/login', async (req, res) => {
    try {
        const { funcional, senha } = req.body;

        // Validar dados de entrada
        if (!funcional || !senha) {
            return res.status(400).json({
                success: false,
                message: 'Funcional e senha são obrigatórios.'
            });
        }

        // Buscar usuário por funcional
        const user = await User.findByFuncional(funcional);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Funcional ou senha incorretos.'
            });
        }

        // Verificar senha
        const isValidPassword = await user.verifyPassword(senha);
        if (!isValidPassword) {
            return res.status(401).json({
                success: false,
                message: 'Funcional ou senha incorretos.'
            });
        }

        // Obter permissões do usuário
        const permissions = await user.getPermissions();

        // Criar sessão
        req.session.user = {
            id_usuario: user.id_usuario,
            funcional: user.funcional,
            nome: user.nome,
            tipo_usuario: user.tipo_usuario,
            permissions: permissions
        };

        // Resposta de sucesso (sem senha)
        res.json({
            success: true,
            message: 'Login realizado com sucesso.',
            user: {
                id_usuario: user.id_usuario,
                funcional: user.funcional,
                nome: user.nome,
                tipo_usuario: user.tipo_usuario,
                permissions: permissions
            }
        });

    } catch (error) {
        console.error('Erro no login:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

router.post('/logout', (req, res) => {
    try {
        req.session.destroy((err) => {
            if (err) {
                console.error('Erro ao destruir sessão:', err);
                return res.status(500).json({ error: 'Erro no logout' });
            }
            res.clearCookie('connect.sid');
            res.status(200).json({ message: 'Logout realizado com sucesso' });
        });
    } catch (error) {
        console.error('Erro no logout:', error);
        res.status(500).json({ error: 'Erro no logout' });
    }
});

// Rota para verificar se o usuário está logado
router.get('/me', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id_usuario);
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Usuário não encontrado.'
            });
        }

        const permissions = await user.getPermissions();

        res.json({
            success: true,
            user: {
                id_usuario: user.id_usuario,
                funcional: user.funcional,
                nome: user.nome,
                tipo_usuario: user.tipo_usuario,
                permissions: permissions
            }
        });
    } catch (error) {
        console.error('Erro ao obter dados do usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para verificar status da sessão
router.get('/status', (req, res) => {
    res.json({
        success: true,
        isAuthenticated: !!req.session.user,
        user: req.session.user || null
    });
});

module.exports = router;

