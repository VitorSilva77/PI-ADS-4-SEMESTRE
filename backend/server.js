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

const allowedOrigins = [
    'http://localhost:3000',
];

app.use(cors({
    origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.indexOf(origin) === -1) {
            const msg = 'A política de CORS para este site não permite acesso da origem especificada.';
            return callback(new Error(msg), false);
        }
        return callback(null, true);
    },
    credentials: true 
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(session({
    secret: process.env.SESSION_SECRET || 'default_fallback_secret_key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', 
        httpOnly: true,
        maxAge: 24 * 60 * 60 * 1000 
    }
}));

app.use(addUserToRequest);

app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/tickets', ticketRoutes);

app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        message: 'Servidor PróFuturo funcionando!',
        timestamp: new Date().toISOString()
    });
});

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

app.use((err, req, res, next) => {
    console.error('Erro não tratado:', err);
    res.status(500).json({
        success: false,
        message: 'Erro interno do servidor.',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.use((req, res) => {
    res.status(404).json({
        success: false,
        message: 'Rota não encontrada.'
    });
});

async function startServer() {
    try {

        console.log('🔄 Testando conexão com o banco de dados...');
        const dbConnected = await testConnection();
        
        if (!dbConnected) {
            console.error('❌ Falha na conexão com o banco de dados. Verifique as configurações.');
            process.exit(1);
        }

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


process.on('SIGINT', () => {
    console.log('\n🔄 Encerrando servidor...');
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🔄 Encerrando servidor...');
    process.exit(0);
});

startServer();

module.exports = app;

