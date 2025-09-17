const express = require('express');
const session = require('express-session');
const cors = require('cors');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { addUserToRequest } = require('./middleware/auth');


const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/users');
const courseRoutes = require('./routes/courses');
const ticketRoutes = require('./routes/tickets');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: true, // Permite qualquer origem para desenvolvimento
    credentials: true // Permite cookies/sessões
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Configuração de sessão
app.use(session({
    secret: process.env.SESSION_SECRET || 'profuturo_secret_key_2025',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false, // Para desenvolvimento (HTTP)
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 // 24 horas
    }
}));

// Middleware para adicionar usuário à requisição
app.use(addUserToRequest);

// Rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tickets', ticketRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor PróFuturo funcionando!',
        timestamp: new Date().toISOString()
    });
});

// Rota para informações do servidor
app.get('/api/info', (req, res) => {
    res.json({
        success: true,
        server: 'PróFuturo Backend API',
        version: '1.0.0',
        environment: process.env.NODE_ENV || 'development',
        database: 'MySQL',
        features: [
            'Autenticação com bcrypt',
            'Sessões com express-session',
            'Controle de permissões granular',
            'API RESTful',
            'CORS habilitado'
        ]
    });
});

// Middleware de tratamento de erros
app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

// Middleware para rotas não encontradas
app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada.'
    });
});

// Inicializar servidor
async function startServer() {
    try {
        // Testar conexão com o banco de dados
        console.log('🔄 Testando conexão com o banco de dados...');
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ Falha na conexão com o banco de dados. Verifique as configurações.');
            process.exit(1);
        }

        // Iniciar servidor
        app.listen(PORT, '0.0.0.0', () => {
            console.log('🚀 Servidor PróFuturo iniciado com sucesso!');
            console.log(`📍 URL: http://localhost:${PORT}`);
            console.log(`🌍 Ambiente: ${process.env.NODE_ENV || 'development'}`);
            console.log(`💾 Banco de dados: ${process.env.DB_NAME || 'profuturo_db'}`);
            console.log('📋 Rotas disponíveis:');
            console.log('   - GET  /api/health - Status do servidor');
            console.log('   - GET  /api/info - Informações do servidor');
            console.log('   - POST /api/auth/login - Login');
            console.log('   - POST /api/auth/logout - Logout');
            console.log('   - GET  /api/auth/me - Dados do usuário logado');
            console.log('   - GET  /api/users - Listar usuários');
            console.log('   - POST /api/users/register - Cadastrar usuário');
            console.log('   - GET  /api/courses - Listar cursos');
            console.log('   - GET  /api/tickets - Listar chamados');
            console.log('   - POST /api/tickets - Criar chamado');
            console.log('✅ Servidor pronto para receber requisições!');
        });

    } catch (error) {
        console.error('❌ Erro ao inicializar servidor:', error);
        process.exit(1);
    }
}

// Tratamento de sinais para encerramento gracioso
process.on('SIGINT', () => {
    console.log('\n🔄 Encerrando servidor...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🔄 Encerrando servidor...');
    process.exit(0);
});

// Inicializar
startServer();

module.exports = app;

