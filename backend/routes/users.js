const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { executeQuery } = require('../config/database');
const { requireAuth, requirePermission, canRegisterUserType, requireUserType } = require('../middleware/auth');

// Rota para cadastrar usuário
router.post('/register', requireAuth, requirePermission('canRegisterUsers'), canRegisterUserType, async (req, res) => {
    try {
        const { funcional, senha, nome, tipo_usuario } = req.body;

        // Validar dados de entrada
        if (!funcional || !senha || !nome || !tipo_usuario) {
            return res.status(400).json({
                success: false,
                message: 'Todos os campos são obrigatórios.'
            });
        }

        // Verificar se a funcional já existe
        const existingUser = await User.findByFuncional(funcional);
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Funcional já cadastrada.'
            });
        }

        // Obter ID do tipo de usuário
        const tipoQuery = 'SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = ?';
        const tipoResult = await executeQuery(tipoQuery, [tipo_usuario]);
        
        if (tipoResult.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Tipo de usuário inválido.'
            });
        }

        // Criar usuário
        const newUser = await User.create({
            funcional,
            senha,
            nome,
            id_tipo_usuario: tipoResult[0].id_tipo_usuario
        });

        res.status(201).json({
            success: true,
            message: 'Usuário cadastrado com sucesso.',
            user: newUser.toJSON()
        });

    } catch (error) {
        console.error('Erro ao cadastrar usuário:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para listar usuários (apenas gerência)
router.get('/', requireAuth, requireUserType('Gerencia'), async (req, res) => {
    try {
        const users = await User.findAll();
        
        res.json({
            success: true,
            users: users.map(user => user.toJSON())
        });
    } catch (error) {
        console.error('Erro ao listar usuários:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para obter tipos de usuário que o usuário atual pode cadastrar
router.get('/registerable-types', requireAuth, requirePermission('canRegisterUsers'), async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id_usuario);
        const registerableTypes = await User.getRegisterableUserTypes(user.tipo_usuario);
        
        res.json({
            success: true,
            types: registerableTypes
        });
    } catch (error) {
        console.error('Erro ao obter tipos cadastráveis:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para obter usuários professores (para RH)
router.get('/professors', requireAuth, requireUserType(['RH', 'Gerencia']), async (req, res) => {
    try {
        const query = `
            SELECT u.id_usuario, u.funcional, u.nome 
            FROM usuarios u 
            JOIN tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario 
            WHERE tu.nome_tipo = 'Professor'
            ORDER BY u.nome
        `;
        
        const professors = await executeQuery(query);
        
        res.json({
            success: true,
            professors: professors
        });
    } catch (error) {
        console.error('Erro ao listar professores:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para obter usuários TI e RH (para TI)
router.get('/ti-rh', requireAuth, requireUserType(['TI', 'Gerencia']), async (req, res) => {
    try {
        const query = `
            SELECT u.id_usuario, u.funcional, u.nome, tu.nome_tipo as tipo_usuario
            FROM usuarios u 
            JOIN tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario 
            WHERE tu.nome_tipo IN ('TI', 'RH')
            ORDER BY tu.nome_tipo, u.nome
        `;
        
        const users = await executeQuery(query);
        
        res.json({
            success: true,
            users: users
        });
    } catch (error) {
        console.error('Erro ao listar usuários TI e RH:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para obter perfil do usuário
router.get('/profile', requireAuth, async (req, res) => {
    try {
        const user = await User.findById(req.session.user.id_usuario);
        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'Usuário não encontrado.'
            });
        }

        const permissions = await user.getPermissions();

        res.json({
            success: true,
            user: {
                ...user.toJSON(),
                permissions: permissions
            }
        });
    } catch (error) {
        console.error('Erro ao obter perfil:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

module.exports = router;

