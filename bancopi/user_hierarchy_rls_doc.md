# Hierarquia de Usuários e Regras de RLS (Row-Level Security) no Sistema PróFuturo

Este documento detalha a hierarquia de usuários definida para o sistema de permissões PróFuturo e explica como as regras de Row-Level Security (RLS) seriam aplicadas para garantir que cada usuário acesse apenas os dados relevantes ao seu perfil.

## 1. Hierarquia de Usuários

O sistema PróFuturo opera com uma estrutura de quatro tipos de usuários, cada um com um conjunto distinto de responsabilidades e níveis de acesso. Esta hierarquia é fundamental para a organização das permissões e para a segregação de funções dentro da plataforma.

### 1.1. Gerência

No topo da hierarquia, os usuários com perfil de Gerência possuem o acesso mais abrangente ao sistema. Eles têm uma visão holística das operações e a capacidade de gerenciar usuários de todos os outros níveis.

**Características:**
- **Acesso Total:** Podem visualizar todos os cursos, acessar e publicar no mural, e acessar o sistema de chamados.
- **Gestão de Usuários:** Capacidade de cadastrar usuários de qualquer tipo (Professor, RH, TI).
- **Relatórios Abrangentes:** Acesso a todos os relatórios e estatísticas do sistema.
- **Exceção:** Não podem resolver chamados técnicos, pois esta é uma responsabilidade específica da equipe de TI.

### 1.2. TI (Tecnologia da Informação)

Os usuários de TI são responsáveis pela infraestrutura e suporte técnico do sistema. Seu acesso é focado em funcionalidades de manutenção e resolução de problemas.

**Características:**
- **Gestão de Chamados:** Acesso completo ao painel de chamados, com a capacidade exclusiva de resolver chamados.
- **Cadastro de Usuários Específicos:** Podem cadastrar usuários dos tipos RH e TI, garantindo o controle sobre as equipes de suporte e recursos humanos.
- **Foco Técnico:** Suas permissões são orientadas para a operação e manutenção do sistema, sem acesso a conteúdos acadêmicos detalhados.

### 1.3. RH (Recursos Humanos)

O perfil de RH é voltado para a gestão de pessoal e informações básicas sobre a operação acadêmica. Suas permissões são mais restritas, focando em aspectos administrativos.

**Características:**
- **Informações Básicas de Cursos:** Podem visualizar dados estatísticos dos cursos (e.g., quantidade de alunos), mas não o conteúdo detalhado.
- **Cadastro de Professores:** Possuem a permissão exclusiva de cadastrar novos usuários com o perfil de Professor.
- **Relatórios de RH:** Acesso a relatórios específicos relacionados a recursos humanos e indicadores de pessoal.

### 1.4. Professor

Os professores são os usuários com o acesso mais focado, concentrando-se em suas atividades de ensino e comunicação com os alunos.

**Características:**
- **Visualização de Cursos:** Acesso aos cursos que ministram, incluindo detalhes e listas de alunos.
- **Mural:** Podem acessar o mural e fazer postagens para seus alunos.
- **Abertura de Chamados:** Capacidade de abrir chamados técnicos para problemas que enfrentam no sistema.
- **Restrições:** Não possuem permissões administrativas ou de gestão de usuários, nem acesso a relatórios abrangentes.

## 2. Regras de RLS (Row-Level Security)

Row-Level Security (RLS) é um conceito de segurança de dados que restringe o acesso a linhas individuais em uma tabela de banco de dados com base nas características do usuário que executa uma consulta. No contexto do MySQL, que não possui RLS nativo como o SQL Server ou PostgreSQL, a implementação é tipicamente realizada na camada de aplicação ou através de `VIEWS` e `Stored Procedures`.

Para o projeto PróFuturo, dada a arquitetura atual baseada em Electron e JavaScript, a abordagem mais eficiente e alinhada com o código existente é a **implementação de RLS na camada de aplicação**.

### 2.1. RLS na Camada de Aplicação

Nesta abordagem, o banco de dados armazena todos os dados, mas a lógica de filtragem e exibição é aplicada pelo código JavaScript (no `ui-controller.js` e em módulos de dados) antes que os dados sejam apresentados ao usuário. Isso significa que, ao invés de o banco de dados restringir o que o usuário pode *ver*, a aplicação restringe o que o usuário *recebe* e *exibe*.

**Como Funciona:**
1. **Autenticação:** O usuário faz login, e seu `tipo` de usuário é identificado e armazenado na sessão (via `localStorage` no exemplo atual).
2. **Verificação de Permissões:** Antes de carregar qualquer dado ou exibir uma funcionalidade, o `ui-controller.js` consulta o objeto `authSystem` para verificar as permissões do `currentUser`.
3. **Filtragem de Dados:** Quando dados são solicitados (e.g., lista de cursos, chamados), a aplicação executa consultas ao banco de dados (se houvesse um backend) e, em seguida, filtra os resultados com base nas permissões do usuário logado.

**Exemplos de Aplicação de RLS na Camada de Aplicação:**

- **Visualização de Cursos (Professor):**
  - A aplicação buscaria todos os cursos.
  - Se o usuário logado for um `Professor`, a interface filtraria e exibiria apenas os cursos nos quais ele está associado como professor.
  - Se o usuário for `Gerencia`, todos os cursos seriam exibidos.

- **Acesso ao Mural (Professor vs. RH):**
  - O `ui-controller.js` verificaria se `currentUser.hasPermission('canAccessBoard')`.
  - Se verdadeiro, o componente do mural seria renderizado. Se falso (como para o RH), o componente não seria exibido.
  - Para postagens, a permissão `canPostToBoard` seria verificada antes de permitir a submissão de um novo aviso.

- **Cadastro de Usuários (RH vs. TI vs. Gerência):**
  - A interface de cadastro de usuários (`addRegistrationSection` no `ui-controller.js`) dinamicamente preenche o dropdown de tipos de usuário (`reg-tipo`) com base na função `authSystem.getRegisterableUserTypes()`.
  - Isso garante que um RH só possa selecionar 'Professor', um TI só 'TI' ou 'RH', e a Gerência todos os tipos.
  - Além disso, a função `authSystem.registerUser` possui uma validação interna (`canRegisterUserType`) que impede o cadastro de tipos não autorizados, mesmo que a interface seja manipulada.

- **Resolução de Chamados (TI vs. Outros):**
  - O botão "Resolver" para chamados (`resolve-ticket`) é renderizado condicionalmente no `addTicketsSection` apenas se `permissions.canResolveTickets` for verdadeiro (ou seja, para usuários de TI).
  - Qualquer tentativa de resolver um chamado sem a permissão adequada seria bloqueada pela lógica da aplicação.

### 2.2. Vantagens e Desvantagens da Abordagem na Aplicação

**Vantagens:**
- **Flexibilidade:** Permite lógica de filtragem complexa que pode ser facilmente adaptada e testada no código da aplicação.
- **Controle Total:** O desenvolvedor tem controle total sobre como os dados são apresentados e manipulados.
- **Desempenho:** Para aplicações com `localStorage` ou backends simples, evita a sobrecarga de gerenciar RLS no banco de dados.
- **Alinhamento:** Aproveita a lógica de permissões já existente no projeto Electron.

**Desvantagens:**
- **Segurança (Potencial):** Se a camada de aplicação não for robusta, um usuário mal-intencionado pode tentar contornar as restrições (embora o `auth.js` já tenha validações internas para isso).
- **Duplicação de Lógica:** Em sistemas maiores com múltiplos clientes (web, mobile, etc.), a lógica de RLS precisaria ser replicada em cada cliente ou centralizada em uma API robusta.

### 2.3. Conclusão sobre RLS

Para o contexto do projeto PróFuturo, a implementação de RLS na camada de aplicação é a escolha mais prática e eficiente. Ela se integra perfeitamente com a arquitetura Electron existente e a lógica de permissões já desenvolvida, garantindo que a interface e as funcionalidades sejam adaptadas dinamicamente ao perfil de cada usuário, proporcionando uma experiência segura e personalizada.

