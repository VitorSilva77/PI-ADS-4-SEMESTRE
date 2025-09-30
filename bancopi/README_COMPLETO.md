# Sistema PróFuturo - Projeto Completo

Sistema corporativo acadêmico desenvolvido com Electron (frontend), Node.js/Express (backend) e MySQL (banco de dados), implementando um sistema robusto de autenticação e controle de permissões.

## 📋 Visão Geral

O sistema PróFuturo é uma aplicação corporativa acadêmica que permite diferentes tipos de usuários acessarem funcionalidades específicas baseadas em suas permissões. O projeto implementa:

- **Frontend**: Aplicação Electron com interface responsiva
- **Backend**: API RESTful em Node.js com Express.js
- **Banco de Dados**: MySQL com controle de permissões via VIEWS
- **Segurança**: Autenticação com bcrypt e sessões seguras

## 🏗️ Arquitetura do Sistema

```
┌─────────────────┐    HTTP/API    ┌─────────────────┐    SQL    ┌─────────────────┐
│   Frontend      │ ◄────────────► │    Backend      │ ◄────────► │   MySQL DB      │
│   (Electron)    │                │  (Node.js/      │           │                 │
│                 │                │   Express)      │           │                 │
└─────────────────┘                └─────────────────┘           └─────────────────┘
```

## 👥 Tipos de Usuário e Permissões

### 🎯 Gerência
- ✅ Acesso total ao sistema (exceto resolver chamados)
- ✅ Cadastra qualquer tipo de usuário
- ✅ Visualiza todos os cursos e relatórios
- ✅ Acessa mural e estatísticas completas

### 👨‍🏫 Professor
- ✅ Visualiza apenas os cursos que ministra
- ✅ Acessa e publica no mural de avisos
- ✅ Pode abrir chamados técnicos
- ❌ Não pode cadastrar usuários

### 👔 RH (Recursos Humanos)
- ✅ Visualiza informações básicas dos cursos
- ✅ Cadastra apenas usuários do tipo "Professor"
- ✅ Acessa relatórios de RH
- ❌ Não pode resolver chamados

### 💻 TI (Tecnologia da Informação)
- ✅ Acesso completo ao sistema de chamados
- ✅ Resolve chamados técnicos
- ✅ Cadastra usuários "TI" e "RH"
- ❌ Não tem acesso total como gerência

## 🚀 Instalação e Configuração

### Pré-requisitos

- **Node.js** (versão 14 ou superior)
- **MySQL Server** (versão 5.7 ou superior)
- **npm** ou **yarn**
- **Electron** (será instalado automaticamente)

### 1. Configuração do Banco de Dados

1. **Criar o banco de dados:**
   ```sql
   CREATE DATABASE profuturo_db;
   ```

2. **Executar os scripts SQL na ordem:**
   ```bash
   mysql -u root -p profuturo_db < schema.sql
   mysql -u root -p profuturo_db < data_and_users.sql
   mysql -u root -p profuturo_db < users_and_views.sql
   ```

### 2. Configuração do Backend

1. **Navegar para o diretório do backend:**
   ```bash
   cd backend
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Configurar variáveis de ambiente:**
   Editar o arquivo `.env`:
   ```env
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sua_senha_mysql
   DB_NAME=profuturo_db
   DB_PORT=3306
   PORT=3000
   SESSION_SECRET=profuturo_secret_key_2025
   NODE_ENV=development
   ```

4. **Iniciar o servidor backend:**
   ```bash
   npm start
   ```

### 3. Configuração do Frontend (Electron)

1. **Navegar para o diretório do Electron:**
   ```bash
   cd Electron
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Iniciar a aplicação Electron:**
   ```bash
   npm start
   ```

## 🔐 Usuários de Teste

O sistema vem com usuários pré-configurados para teste:

| Tipo de Usuário | Funcional | Senha | Descrição |
|------------------|-----------|-------|-----------|
| **Gerência** | `12345` | `admin123` | Administrador geral do sistema |
| **Professor** | `11111` | `prof123` | Professor de exemplo |
| **RH** | `22222` | `rh123` | Usuário de Recursos Humanos |
| **TI** | `33333` | `ti123` | Usuário de Tecnologia da Informação |

## 📁 Estrutura do Projeto

```
PI-ADS-4-SEMESTRE-main/
├── backend/                          # Backend Node.js/Express
│   ├── config/
│   │   └── database.js              # Configuração do MySQL
│   ├── middleware/
│   │   └── auth.js                  # Middlewares de autenticação
│   ├── models/
│   │   ├── User.js                  # Modelo de usuário
│   │   ├── Course.js                # Modelo de curso
│   │   └── Ticket.js                # Modelo de chamado
│   ├── routes/
│   │   ├── auth.js                  # Rotas de autenticação
│   │   ├── users.js                 # Rotas de usuários
│   │   ├── courses.js               # Rotas de cursos
│   │   └── tickets.js               # Rotas de chamados
│   ├── .env                         # Variáveis de ambiente
│   ├── package.json                 # Dependências do backend
│   ├── server.js                    # Servidor principal
│   └── README.md                    # Documentação do backend
├── Electron/                        # Frontend Electron
│   ├── css/                         # Estilos CSS
│   ├── js/
│   │   ├── api.js                   # Cliente da API
│   │   ├── login.js                 # Lógica de login
│   │   └── ui-controller-api.js     # Controlador da interface
│   ├── images/                      # Imagens e assets
│   ├── index.html                   # Tela de login
│   ├── userPage.html                # Dashboard principal
│   ├── main.js                      # Processo principal do Electron
│   └── package.json                 # Dependências do frontend
├── schema.sql                       # Script de criação das tabelas
├── data_and_users.sql              # Script de dados iniciais
├── users_and_views.sql             # Script de usuários MySQL e VIEWS
├── db_schema_design_v2.md          # Documentação do banco de dados
├── user_hierarchy_rls_doc.md       # Documentação de permissões
└── README_COMPLETO.md              # Este arquivo
```

## 🔧 Funcionalidades Implementadas

### 🔐 Sistema de Autenticação
- Login seguro com validação de credenciais
- Hash de senhas com bcrypt (salt rounds: 10)
- Gerenciamento de sessões com express-session
- Logout seguro com destruição de sessão

### 👤 Gerenciamento de Usuários
- Cadastro de usuários baseado em permissões
- Validação de tipos de usuário permitidos
- Listagem de usuários (apenas gerência)
- Perfil do usuário com permissões

### 📚 Sistema de Cursos
- Visualização de cursos baseada em permissões
- Professores veem apenas seus cursos
- RH vê informações básicas (quantidade de alunos)
- Gerência tem acesso completo

### 🎯 Mural de Avisos
- Professores podem publicar avisos
- Visualização de posts por data
- Interface intuitiva para criação de conteúdo

### 🎫 Sistema de Chamados
- Abertura de chamados por qualquer usuário
- TI pode resolver e gerenciar chamados
- Status de chamados (Aberto, Em Andamento, Resolvido)
- Atribuição automática de responsáveis

### 📊 Relatórios e Estatísticas
- Estatísticas de cursos para RH e Gerência
- Métricas de chamados para TI e Gerência
- Dashboards personalizados por tipo de usuário

## 🛡️ Segurança Implementada

### Backend
- **Autenticação**: bcrypt para hash de senhas
- **Sessões**: express-session com cookies seguros
- **Autorização**: Middleware de verificação de permissões
- **CORS**: Configurado para desenvolvimento
- **Validação**: Validação de entrada em todas as rotas

### Banco de Dados
- **RLS Simulado**: VIEWS específicas por tipo de usuário
- **Usuários MySQL**: Contas dedicadas com permissões limitadas
- **Prepared Statements**: Proteção contra SQL Injection
- **Pool de Conexões**: Gerenciamento eficiente de conexões

### Frontend
- **Validação de Sessão**: Verificação contínua de autenticação
- **Interface Dinâmica**: Menus baseados em permissões
- **Tratamento de Erros**: Feedback adequado ao usuário
- **Logout Seguro**: Limpeza de dados locais

## 🌐 API Endpoints

### Autenticação
- `POST /api/auth/login` - Login do usuário
- `POST /api/auth/logout` - Logout do usuário
- `GET /api/auth/me` - Dados do usuário logado
- `GET /api/auth/status` - Status da sessão

### Usuários
- `GET /api/users` - Listar usuários
- `POST /api/users/register` - Cadastrar usuário
- `GET /api/users/registerable-types` - Tipos cadastráveis
- `GET /api/users/profile` - Perfil do usuário

### Cursos
- `GET /api/courses` - Listar cursos
- `GET /api/courses/:id` - Obter curso específico
- `POST /api/courses` - Criar curso
- `GET /api/courses/stats/overview` - Estatísticas

### Chamados
- `GET /api/tickets` - Listar chamados
- `POST /api/tickets` - Criar chamado
- `PUT /api/tickets/:id/resolve` - Resolver chamado
- `GET /api/tickets/stats/overview` - Estatísticas

## 🧪 Como Testar

### 1. Teste de Autenticação
1. Iniciar backend e frontend
2. Tentar login com credenciais inválidas
3. Fazer login com cada tipo de usuário
4. Verificar redirecionamentos e permissões

### 2. Teste de Permissões
1. Logar como Professor e verificar acesso limitado
2. Logar como RH e testar cadastro de professores
3. Logar como TI e gerenciar chamados
4. Logar como Gerência e verificar acesso total

### 3. Teste de Funcionalidades
1. Cadastrar novos usuários (respeitando permissões)
2. Criar e resolver chamados
3. Visualizar cursos e estatísticas
4. Testar logout e segurança de sessão

## 🔍 Troubleshooting

### Problemas Comuns

**Erro de conexão com o banco:**
- Verificar se o MySQL está rodando
- Confirmar credenciais no `.env`
- Verificar se o banco `profuturo_db` existe

**Frontend não conecta com backend:**
- Verificar se o backend está rodando na porta 3000
- Confirmar configuração de CORS
- Verificar console do navegador para erros

**Erro de permissões:**
- Verificar se os scripts SQL foram executados
- Confirmar se o usuário tem as permissões corretas
- Verificar logs do backend

## 📈 Melhorias Futuras

- [ ] Implementar refresh tokens
- [ ] Adicionar logs de auditoria
- [ ] Implementar notificações em tempo real
- [ ] Adicionar testes automatizados
- [ ] Implementar backup automático
- [ ] Adicionar dashboard de métricas avançadas

## 👨‍💻 Desenvolvimento

Este projeto foi desenvolvido como parte do curso de Análise e Desenvolvimento de Sistemas, implementando conceitos de:

- **Arquitetura de Software**: Separação clara entre frontend, backend e banco
- **Segurança**: Autenticação, autorização e controle de acesso
- **Banco de Dados**: Modelagem relacional e controle de permissões
- **APIs RESTful**: Design de endpoints e comunicação HTTP
- **Interface de Usuário**: Design responsivo e experiência do usuário

## 📄 Licença

Este projeto é parte do sistema acadêmico PróFuturo e foi desenvolvido para fins educacionais.

---

**Desenvolvido com ❤️ para o curso de ADS - 4º Semestre**

