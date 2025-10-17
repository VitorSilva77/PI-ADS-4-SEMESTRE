# 🚀 Guia Rápido de Instalação - Sistema PróFuturo

## ⚡ Instalação Rápida (5 minutos)

### 1️⃣ Pré-requisitos
- ✅ Node.js (versão 14+)
- ✅ MySQL Server
- ✅ npm

### 2️⃣ Configurar Banco de Dados
```bash
# 1. Criar banco
mysql -u root -p
CREATE DATABASE profuturo_db;
exit

# 2. Executar scripts (na ordem)
mysql -u root -p profuturo_db < schema.sql
mysql -u root -p profuturo_db < data_and_users.sql
mysql -u root -p profuturo_db < users_and_views.sql
```

### 3️⃣ Configurar Backend
```bash
# 1. Entrar na pasta
cd backend

# 2. Instalar dependências
npm install

# 3. Configurar .env (editar com suas credenciais MySQL)
# DB_PASSWORD=sua_senha_mysql

# 4. Iniciar servidor
npm start
```

### 4️⃣ Configurar Frontend
```bash
# 1. Nova aba do terminal
cd Electron

# 2. Instalar dependências
npm install

# 3. Iniciar aplicação
npm start
```

## 🔐 Usuários de Teste

| Tipo | Funcional | Senha |
|------|-----------|-------|
| Gerência | `12345` | `admin123` |
| Professor | `11111` | `prof123` |
| RH | `22222` | `rh123` |
| TI | `33333` | `ti123` |

## ✅ Verificação

1. **Backend**: Acesse http://localhost:3000/api/health
2. **Frontend**: Aplicação Electron deve abrir automaticamente
3. **Login**: Use qualquer usuário de teste acima

## 🆘 Problemas?

- **Erro MySQL**: Verifique se o MySQL está rodando
- **Erro Backend**: Confirme as credenciais no arquivo `.env`
- **Erro Frontend**: Certifique-se que o backend está rodando

---
📖 **Documentação completa**: Veja `README_COMPLETO.md`

