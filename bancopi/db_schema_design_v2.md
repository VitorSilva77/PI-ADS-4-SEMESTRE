# Design do Esquema do Banco de Dados MySQL para o Sistema de Permissões PróFuturo (v2)

Este documento revisa o design do esquema do banco de dados MySQL para o sistema de permissões do projeto Electron PróFuturo, com foco na implementação de usuários MySQL dedicados para cada perfil de usuário e na aplicação de Row-Level Security (RLS) através de `VIEWS`.

## 1. Tabelas Propostas (Revisadas)

Além das tabelas de `usuarios`, `tipos_usuario`, `permissoes` e `tipo_usuario_permissoes`, adicionaremos tabelas para simular dados que seriam acessados com RLS.

### 1.1. `usuarios`
Armazena as informações básicas de cada usuário do sistema.

| Coluna       | Tipo de Dado      | Restrições           | Descrição                               |
|--------------|-------------------|----------------------|-----------------------------------------|
| `id_usuario` | INT               | PRIMARY KEY, AUTO_INCREMENT | Identificador único do usuário.         |
| `funcional`  | VARCHAR(20)       | UNIQUE, NOT NULL     | Identificador funcional do usuário (login). |
| `senha`      | VARCHAR(255)      | NOT NULL             | Senha do usuário (deve ser armazenada como hash). |
| `nome`       | VARCHAR(100)      | NOT NULL             | Nome completo do usuário.               |
| `id_tipo_usuario` | INT            | NOT NULL, FOREIGN KEY | Chave estrangeira para a tabela `tipos_usuario`. |

### 1.2. `tipos_usuario`
Armazena os diferentes tipos de usuário (perfis) existentes no sistema.

| Coluna        | Tipo de Dado      | Restrições           | Descrição                               |
|---------------|-------------------|----------------------|-----------------------------------------|
| `id_tipo_usuario` | INT           | PRIMARY KEY, AUTO_INCREMENT | Identificador único do tipo de usuário. |
| `nome_tipo`   | VARCHAR(50)       | UNIQUE, NOT NULL     | Nome do tipo de usuário (e.g., 'Professor', 'RH'). |

### 1.3. `permissoes`
Lista todas as permissões granulares que podem ser atribuídas no sistema.

| Coluna        | Tipo de Dado      | Restrições           | Descrição                               |
|---------------|-------------------|----------------------|-----------------------------------------|
| `id_permissao` | INT              | PRIMARY KEY, AUTO_INCREMENT | Identificador único da permissão.       |
| `nome_permissao` | VARCHAR(100)   | UNIQUE, NOT NULL     | Nome descritivo da permissão (e.g., 'canViewCourses'). |

### 1.4. `tipo_usuario_permissoes`
Tabela de junção (muitos-para-muitos) que associa os tipos de usuário às permissões que eles possuem.

| Coluna        | Tipo de Dado      | Restrições           | Descrição                               |
|---------------|-------------------|----------------------|-----------------------------------------|
| `id_tipo_usuario` | INT            | PRIMARY KEY, FOREIGN KEY | Chave estrangeira para `tipos_usuario`. |
| `id_permissao` | INT             | PRIMARY KEY, FOREIGN KEY | Chave estrangeira para `permissoes`.    |

### 1.5. `cursos` (Nova Tabela para RLS)
Simula a tabela de cursos acadêmicos.

| Coluna       | Tipo de Dado      | Restrições           | Descrição                               |
|--------------|-------------------|----------------------|-----------------------------------------|
| `id_curso`   | INT               | PRIMARY KEY, AUTO_INCREMENT | Identificador único do curso.           |
| `nome_curso` | VARCHAR(255)      | NOT NULL             | Nome do curso.                          |
| `descricao`  | TEXT              | NULL                 | Descrição detalhada do curso.           |
| `id_professor_responsavel` | INT | NULL, FOREIGN KEY | Professor responsável pelo curso. |

### 1.6. `chamados` (Nova Tabela para RLS)
Simula a tabela de chamados técnicos.

| Coluna       | Tipo de Dado      | Restrições           | Descrição                               |
|--------------|-------------------|----------------------|-----------------------------------------|
| `id_chamado` | INT               | PRIMARY KEY, AUTO_INCREMENT | Identificador único do chamado.         |
| `titulo`     | VARCHAR(255)      | NOT NULL             | Título do chamado.                      |
| `descricao`  | TEXT              | NOT NULL             | Descrição do problema.                  |
| `status`     | VARCHAR(50)       | NOT NULL             | Status do chamado (e.g., 'Aberto', 'Em Andamento', 'Resolvido'). |
| `id_usuario_abertura` | INT      | NOT NULL, FOREIGN KEY | Usuário que abriu o chamado.            |
| `id_usuario_responsavel_ti` | INT | NULL, FOREIGN KEY | Usuário de TI responsável pela resolução. |

## 2. Relacionamentos (Revisados)

- **`usuarios`** para **`tipos_usuario`**: Muitos para um (N:1).
- **`tipos_usuario`** para **`tipo_usuario_permissoes`**: Um para muitos (1:N).
- **`permissoes`** para **`tipo_usuario_permissoes`**: Um para muitos (1:N).
- **`cursos`** para **`usuarios`**: Um para um (1:1) ou um para muitos (1:N) se um professor puder ser responsável por vários cursos. Usaremos 1:N (`id_professor_responsavel` em `cursos` referencia `id_usuario` em `usuarios`).
- **`chamados`** para **`usuarios`**: Muitos para um (N:1) para `id_usuario_abertura` e `id_usuario_responsavel_ti`.

## 3. Usuários MySQL Dedicados e Permissões

Para testar o RLS via `VIEWS`, criaremos usuários MySQL específicos para cada perfil de aplicação. Cada usuário terá permissões limitadas apenas às `VIEWS` e tabelas que lhes são relevantes.

### 3.1. Usuários MySQL Propostos

- `app_gerencia`@`localhost`
- `app_professor`@`localhost`
- `app_rh`@`localhost`
- `app_ti`@`localhost`

### 3.2. Permissões de Banco de Dados

Cada usuário MySQL terá permissões `SELECT` apenas nas `VIEWS` e tabelas que são relevantes para seu perfil. As permissões `INSERT`, `UPDATE`, `DELETE` serão concedidas apenas onde estritamente necessário (e.g., `app_ti` em `chamados`).

## 4. Implementação de RLS via VIEWS

As `VIEWS` serão criadas para filtrar os dados de forma que cada usuário MySQL (conectado com seu respectivo perfil) veja apenas as linhas que lhe são permitidas. Isso simula o RLS no nível do banco de dados.

### 4.1. `VIEW` para Gerência

- `vw_gerencia_usuarios`: Todos os usuários.
- `vw_gerencia_cursos`: Todos os cursos.
- `vw_gerencia_chamados`: Todos os chamados.

### 4.2. `VIEW` para Professor

- `vw_professor_meus_cursos`: Cursos onde o professor logado é o responsável.
- `vw_professor_mural`: Todos os posts do mural (se houver uma tabela de mural).
- `vw_professor_meus_chamados`: Chamados abertos pelo professor logado.

### 4.3. `VIEW` para RH

- `vw_rh_cursos_basico`: Informações básicas de todos os cursos (e.g., nome, quantidade de alunos, sem detalhes de conteúdo).
- `vw_rh_usuarios_professores`: Apenas usuários do tipo 'Professor' (para cadastro).

### 4.4. `VIEW` para TI

- `vw_ti_todos_chamados`: Todos os chamados (para resolução).
- `vw_ti_usuarios_ti_rh`: Apenas usuários do tipo 'TI' e 'RH' (para cadastro).

## 5. Fluxo de Conexão e Teste

Para testar o RLS:
1. A aplicação (ou o MySQL Workbench) se conectaria ao banco de dados usando as credenciais do usuário MySQL correspondente ao perfil logado na aplicação (e.g., `app_professor`).
2. Ao consultar `SELECT * FROM vw_professor_meus_cursos;`, o usuário `app_professor` veria apenas os cursos que ele ministra, enquanto `app_gerencia` veria todos os cursos ao consultar `SELECT * FROM vw_gerencia_cursos;`.

Esta abordagem permite testar as permissões no nível do banco de dados, garantindo que a segregação de dados funcione conforme o esperado para cada perfil de usuário.

