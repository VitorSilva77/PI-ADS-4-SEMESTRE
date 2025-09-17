# PróFuturo Backend API

Backend Node.js com Express.js para o sistema de permissões PróFuturo.

## Características

- **Autenticação**: Sistema de login com bcrypt para hash de senhas
- **Sessões**: Gerenciamento de sessões com express-session
- **Permissões**: Controle granular de permissões por tipo de usuário
- **Banco de dados**: MySQL com pool de conexões
- **API RESTful**: Endpoints organizados por funcionalidade
- **CORS**: Habilitado para comunicação com frontend

## Pré-requisitos

- Node.js (versão 14 ou superior)
- MySQL Server
- npm ou yarn

## Instalação

1. **Instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   - Copiar `.env.example` para `.env` (se existir)
   - Ou editar o arquivo `.env` com suas configurações:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sua_senha_mysql
   DB_NAME=profuturo_db
   DB_PORT=3306
   PORT=3000
   SESSION_SECRET=sua_chave_secreta
   NODE_ENV=development
   ```

## Execução

### Desenvolvimento
```bash
npm start
```

### Com nodemon (desenvolvimento)
```bash
npm run dev
```

O servidor será iniciado em `http://localhost:3000`

## Estrutura do Projeto

```
backend/
├── config/
│   └── database.js          # Configuração do banco de dados
├── middleware/
│   └── auth.js              # Middlewares de autenticação
├── models/
│   ├── User.js              # Modelo de usuário
│   ├── Course.js            # Modelo de curso
│   └── Ticket.js            # Modelo de chamado
├── routes/
│   ├── auth.js              # Rotas de autenticação
│   ├── users.js             # Rotas de usuários
│   ├── courses.js           # Rotas de cursos
│   └── tickets.js           # Rotas de chamados
├── .env                     # Variáveis de ambiente
├── package.json             # Dependências e scripts
└── server.js                # Servidor principal
```

## API Endpoints

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout do usuário
- `GET /api/auth/me` - Dados do usuário logado
- `GET /api/auth/status` - Status da sessão

### Usuários
- `GET /api/users` - Listar usuários (apenas gerência)
- `POST /api/users/register` - Cadastrar usuário
- `GET /api/users/registerable-types` - Tipos que o usuário pode cadastrar
- `GET /api/users/profile` - Perfil do usuário logado

### Cursos
- `GET /api/courses` - Listar cursos (baseado nas permissões)
- `GET /api/courses/:id` - Obter curso específico
- `POST /api/courses` - Criar curso (apenas gerência)
- `PUT /api/courses/:id` - Atualizar curso (apenas gerência)
- `DELETE /api/courses/:id` - Deletar curso (apenas gerência)
- `GET /api/courses/stats/overview` - Estatísticas de cursos

### Chamados
- `GET /api/tickets` - Listar chamados (baseado nas permissões)
- `GET /api/tickets/open` - Chamados abertos (apenas TI)
- `GET /api/tickets/:id` - Obter chamado específico
- `POST /api/tickets` - Criar chamado
- `PUT /api/tickets/:id/assign` - Atribuir chamado (apenas TI)
- `PUT /api/tickets/:id/resolve` - Resolver chamado (apenas TI)
- `PUT /api/tickets/:id/status` - Atualizar status (apenas TI)
- `GET /api/tickets/stats/overview` - Estatísticas de chamados

### Utilitários
- `GET /api/health` - Status do servidor
- `GET /api/info` - Informações do servidor

## Tipos de Usuário e Permissões

### Gerência
- Acesso total ao sistema (exceto resolver chamados)
- Pode cadastrar qualquer tipo de usuário
- Visualiza todos os dados

### Professor
- Visualiza apenas seus cursos
- Acessa e publica no mural
- Pode abrir chamados

### RH
- Visualiza informações básicas dos cursos
- Cadastra apenas usuários do tipo "Professor"
- Acessa relatórios de RH

### TI
- Acesso completo ao sistema de chamados
- Resolve chamados técnicos
- Cadastra usuários "TI" e "RH"

## Usuários de Teste

O sistema vem com usuários pré-configurados para teste:

| Tipo | Funcional | Senha | Descrição |
|------|-----------|-------|-----------|
| Gerência | 12345 | admin123 | Administrador geral |
| Professor | 11111 | prof123 | Professor de exemplo |
| RH | 22222 | rh123 | Usuário de RH |
| TI | 33333 | ti123 | Usuário de TI |

## Segurança

- Senhas são hasheadas com bcrypt (salt rounds: 10)
- Sessões são gerenciadas com express-session
- Validação de permissões em todas as rotas protegidas
- CORS configurado para desenvolvimento

## Logs

O servidor exibe logs detalhados no console, incluindo:
- Status da conexão com o banco de dados
- Rotas disponíveis
- Erros de autenticação e autorização
- Operações do banco de dados

## Troubleshooting

### Erro de conexão com o banco
1. Verifique se o MySQL está rodando
2. Confirme as credenciais no arquivo `.env`
3. Certifique-se de que o banco `profuturo_db` existe

### Erro de CORS
- O CORS está configurado para aceitar qualquer origem em desenvolvimento
- Para produção, configure origens específicas

### Erro de sessão
- Verifique se o `SESSION_SECRET` está configurado
- Certifique-se de que os cookies estão habilitados no frontend

## Licença

Este projeto é parte do sistema acadêmico PróFuturo.

