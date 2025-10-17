# Design do Esquema do Banco de Dados MySQL para o Sistema de Permissões PróFuturo

Este documento detalha o design do esquema do banco de dados MySQL proposto para o sistema de permissões do projeto Electron PróFuturo. O objetivo é persistir as informações de usuários e suas permissões de forma relacional, substituindo o uso atual do `localStorage`.

## 1. Tabelas Propostas

Com base nos requisitos de usuários (Professor, RH, TI, Gerência) e suas permissões, as seguintes tabelas são propostas:

### 1.1. `usuarios`
Esta tabela armazenará as informações básicas de cada usuário do sistema.

| Coluna       | Tipo de Dado      | Restrições           | Descrição                               |
|--------------|-------------------|----------------------|-----------------------------------------|
| `id_usuario` | INT               | PRIMARY KEY, AUTO_INCREMENT | Identificador único do usuário.         |
| `funcional`  | VARCHAR(20)       | UNIQUE, NOT NULL     | Identificador funcional do usuário (login). |
| `senha`      | VARCHAR(255)      | NOT NULL             | Senha do usuário (deve ser armazenada como hash). |
| `nome`       | VARCHAR(100)      | NOT NULL             | Nome completo do usuário.               |
| `id_tipo_usuario` | INT            | NOT NULL, FOREIGN KEY | Chave estrangeira para a tabela `tipos_usuario`. |

### 1.2. `tipos_usuario`
Esta tabela armazenará os diferentes tipos de usuário (perfis) existentes no sistema.

| Coluna        | Tipo de Dado      | Restrições           | Descrição                               |
|---------------|-------------------|----------------------|-----------------------------------------|
| `id_tipo_usuario` | INT           | PRIMARY KEY, AUTO_INCREMENT | Identificador único do tipo de usuário. |
| `nome_tipo`   | VARCHAR(50)       | UNIQUE, NOT NULL     | Nome do tipo de usuário (e.g., 'Professor', 'RH'). |

### 1.3. `permissoes`
Esta tabela listará todas as permissões granulares que podem ser atribuídas no sistema.

| Coluna        | Tipo de Dado      | Restrições           | Descrição                               |
|---------------|-------------------|----------------------|-----------------------------------------|
| `id_permissao` | INT              | PRIMARY KEY, AUTO_INCREMENT | Identificador único da permissão.       |
| `nome_permissao` | VARCHAR(100)   | UNIQUE, NOT NULL     | Nome descritivo da permissão (e.g., 'canViewCourses'). |

### 1.4. `tipo_usuario_permissoes`
Esta tabela de junção (muitos-para-muitos) associará os tipos de usuário às permissões que eles possuem.

| Coluna        | Tipo de Dado      | Restrições           | Descrição                               |
|---------------|-------------------|----------------------|-----------------------------------------|
| `id_tipo_usuario` | INT            | PRIMARY KEY, FOREIGN KEY | Chave estrangeira para `tipos_usuario`. |
| `id_permissao` | INT             | PRIMARY KEY, FOREIGN KEY | Chave estrangeira para `permissoes`.    |

## 2. Relacionamentos

- **`usuarios`** para **`tipos_usuario`**: Um relacionamento de muitos para um (N:1). Muitos usuários podem pertencer a um único tipo de usuário. A coluna `id_tipo_usuario` em `usuarios` é uma chave estrangeira referenciando `id_tipo_usuario` em `tipos_usuario`.

- **`tipos_usuario`** para **`tipo_usuario_permissoes`**: Um relacionamento de um para muitos (1:N). Um tipo de usuário pode ter muitas permissões associadas. A coluna `id_tipo_usuario` em `tipo_usuario_permissoes` é uma chave estrangeira referenciando `id_tipo_usuario` em `tipos_usuario`.

- **`permissoes`** para **`tipo_usuario_permissoes`**: Um relacionamento de um para muitos (1:N). Uma permissão pode ser atribuída a muitos tipos de usuário. A coluna `id_permissao` em `tipo_usuario_permissoes` é uma chave estrangeira referenciando `id_permissao` em `permissoes`.

## 3. Considerações para RLS (Row-Level Security)

Embora o MySQL não possua RLS nativo como alguns outros bancos de dados (e.g., SQL Server, PostgreSQL), a lógica de segurança de nível de linha pode ser implementada na camada de aplicação (no Electron/Node.js) ou através de `VIEWS` e `Stored Procedures` no banco de dados, combinadas com o uso de usuários de banco de dados específicos para cada tipo de perfil ou com a passagem do `id_tipo_usuario` como parâmetro para as consultas.

**Abordagem na Camada de Aplicação (Recomendado para este projeto):**
Dado que a lógica de permissões já está bem definida no JavaScript (`auth.js` e `ui-controller.js`), a forma mais direta de implementar o RLS é continuar a filtrar os dados na aplicação. Por exemplo, ao buscar cursos, a aplicação consultaria o banco de dados e, antes de exibir, filtraria os resultados com base nas permissões do `currentUser`.

**Exemplo de Lógica de Filtragem na Aplicação:**
- Se o usuário é 'Professor', a consulta de cursos buscaria apenas os cursos associados a esse professor.
- Se o usuário é 'RH', a consulta de cursos buscaria apenas informações básicas (e.g., contagem de alunos) e não detalhes de conteúdo.

**Abordagem com Views (Alternativa mais complexa para este projeto):**
Seria possível criar `VIEWS` para cada tipo de usuário que já filtrariam os dados no nível do banco. Por exemplo:

```sql
CREATE VIEW professor_cursos AS
SELECT c.* FROM cursos c
JOIN professor_curso pc ON c.id_curso = pc.id_curso
WHERE pc.id_professor = CURRENT_USER_ID(); -- Função fictícia para obter o ID do usuário logado
```

Esta abordagem exigiria um gerenciamento mais complexo de usuários de banco de dados e sessões, o que pode ser excessivo para um projeto Electron que já gerencia a autenticação na aplicação.

**Conclusão do Esquema:**
Este esquema relacional fornece uma base sólida para persistir os dados de usuários e permissões, permitindo uma migração do `localStorage` para um banco de dados MySQL. A implementação do RLS é mais prática e segura na camada de aplicação para este contexto, aproveitando a lógica de permissões já existente.

