# PróFuturo - Aplicação de Desktop

## Descrição do Projeto

O **PróFuturo** é uma aplicação de desktop desenvolvida para o Projeto Integrado (PI) do 4º Semestre de Análise e Desenvolvimento de Sistemas (ADS). O objetivo principal é fornecer uma plataforma robusta para a gestão de usuários, cursos, matrículas e relatórios, focada em um ambiente educacional ou de treinamento.

A aplicação é construída utilizando o **Electron**, o que permite que ela rode de forma nativa em diferentes sistemas operacionais (Windows, Linux e macOS), oferecendo uma experiência de usuário rica e integrada.

## Tecnologias Utilizadas

O projeto é baseado em uma arquitetura moderna que combina tecnologias de desenvolvimento web com a capacidade de empacotamento de desktop do Electron.

| Categoria | Tecnologia | Descrição |
| :--- | :--- | :--- |
| **Framework Principal** | **Electron** | Utilizado para construir a aplicação de desktop multiplataforma. |
| **Linguagem** | **JavaScript / Node.js** | Linguagem principal para o desenvolvimento do *backend* (processo *main*) e *frontend* (processo *renderer*). |
| **Banco de Dados** | **Knex.js** | Construtor de *queries* SQL, permitindo flexibilidade entre diferentes bancos de dados. |
| **Drivers de BD** | **MySQL2** e **pg (PostgreSQL)** | Suporte a conexões com bancos de dados MySQL e PostgreSQL. |
| **Segurança** | **bcryptjs** | Utilizado para *hashing* seguro de senhas de usuários. |
| **Interface** | **HTML, CSS, JavaScript** | Tecnologias padrão para a construção da interface de usuário. |
| **Visualização de Dados** | **Chart.js** | Biblioteca para a criação de gráficos e visualizações nos relatórios. |
| **Outras** | **dotenv**, **@google-cloud/storage**, **xlsx** | Gerenciamento de variáveis de ambiente, integração com Google Cloud Storage e manipulação de planilhas Excel. |

## Estrutura do Projeto

A estrutura de diretórios segue o padrão de aplicações Electron, separando a lógica principal (`main`) da interface de usuário (`renderer`).

```
PI-ADS-4-SEMESTRE-main/
├── build/                 # Arquivos de build e ícones
├── database/              # Scripts de banco de dados e arquivos de configuração (ex: SSL)
├── src/
│   ├── main/              # Processo principal (Backend/Lógica de Negócio)
│   │   ├── controllers/   # Lógica de manipulação de requisições
│   │   ├── database/      # Configuração de conexão com o banco de dados
│   │   ├── repositories/  # Camada de acesso a dados (DAO)
│   │   ├── services/      # Regras de negócio e serviços
│   │   └── index.js       # Ponto de entrada do processo principal
│   └── renderer/          # Processo de renderização (Frontend/Interface)
│       ├── assets/        # Arquivos estáticos (CSS, imagens)
│       ├── js/            # Lógica JavaScript do frontend (API calls, charts, etc.)
│       └── views/         # Arquivos HTML (telas da aplicação)
└── package.json           # Metadados do projeto, dependências e scripts
```

## Instalação e Configuração

Para configurar e rodar o projeto localmente, siga os passos abaixo:

### Pré-requisitos

Certifique-se de ter o **Node.js** e o **npm** (ou **yarn**) instalados em sua máquina.

### 1. Clonar o Repositório

Como o projeto foi fornecido via ZIP, assumimos que os arquivos já estão em um diretório local.

### 2. Instalar Dependências

Navegue até o diretório raiz do projeto e instale as dependências:

```bash
cd PI-ADS-4-SEMESTRE-main
npm install
# ou
yarn install
```

### 3. Configuração do Banco de Dados

O projeto utiliza o Knex.js e suporta MySQL e PostgreSQL.

1.  **Crie um arquivo `.env`** na raiz do projeto (`PI-ADS-4-SEMESTRE-main/`) com as credenciais do seu banco de dados.
2.  **Configure as variáveis de ambiente** necessárias para a conexão (exemplo para PostgreSQL):

    ```
    # Exemplo de configuração de Banco de Dados (PostgreSQL)
    DB_CLIENT=pg
    DB_HOST=localhost
    DB_USER=seu_usuario
    DB_PASSWORD=sua_senha
    DB_NAME=profuturo_db
    DB_PORT=5432
    ```

    *Nota: Consulte o código em `src/main/database/connection.js` para as variáveis de ambiente exatas esperadas.*

### 4. Rodar a Aplicação

Para iniciar a aplicação em modo de desenvolvimento:

```bash
npm start
# ou
npm run dev  # Para rodar com o inspetor do Electron
```

## Scripts Disponíveis

Os seguintes scripts estão definidos no `package.json`:

| Script | Comando | Descrição |
| :--- | :--- | :--- |
| `start` | `electron .` | Inicia a aplicação Electron em modo de desenvolvimento. |
| `dev` | `electron . --inspect` | Inicia a aplicação em modo de desenvolvimento com o inspetor ativado. |
| `build` | `electron-builder` | Empacota a aplicação para distribuição (Windows, Linux, macOS). |

## Contribuição

Este projeto foi desenvolvido como parte de um Projeto Integrado de curso. Contribuições futuras podem incluir:

*   Melhoria da interface de usuário (UX/UI).
*   Implementação de testes unitários e de integração.
*   Otimização das consultas ao banco de dados.
*   Expansão dos recursos de relatórios e gráficos.

## Licença

Este projeto está licenciado sob a licença **ISC**.

## Autor

**Pró Futuro** (Conforme `package.json`)
