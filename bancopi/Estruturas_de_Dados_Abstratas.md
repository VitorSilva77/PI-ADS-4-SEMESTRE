# Tipos de Dados Abstratos (TDAs) no Projeto PróFuturo

Este documento descreve os principais Tipos de Dados Abstratos (TDAs) utilizados no projeto do sistema de permissões PróFuturo, com foco na sua aplicação e representação lógica, independentemente da implementação específica.

## 1. TDA Usuário

### Definição
O TDA `Usuário` representa uma entidade individual que interage com o sistema. Ele encapsula todas as informações necessárias para identificar e autenticar um usuário, bem como seu perfil dentro da instituição.

### Atributos
- `id`: Identificador único do usuário (geralmente um número ou string).
- `funcional`: Credencial de login do usuário (string, geralmente um número de matrícula ou identificador funcional).
- `senha`: Senha de acesso do usuário (string, armazenada de forma segura).
- `tipo`: O tipo de perfil do usuário (string, e.g., "Professor", "RH", "TI", "Gerencia").
- `nome`: Nome completo do usuário (string).

### Operações
- `criar(funcional, senha, tipo, nome)`: Cria uma nova instância de Usuário.
- `obterFuncional()`: Retorna a funcional do usuário.
- `obterTipo()`: Retorna o tipo de perfil do usuário.
- `validarCredenciais(funcional, senha)`: Verifica se a funcional e a senha fornecidas correspondem às do usuário.
- `atualizarInformacoes(novosDados)`: Modifica os atributos do usuário.

### Representação Lógica
O TDA `Usuário` pode ser logicamente visto como um **Registro (Record)** ou **Estrutura (Struct)**, onde cada atributo é um campo com um tipo de dado específico. A coleção de usuários pode ser gerenciada como uma **Lista** ou **Conjunto** de registros de Usuário.

## 2. TDA Permissão

### Definição
O TDA `Permissão` representa uma capacidade ou direito específico que um usuário pode ter dentro do sistema. Cada permissão é uma flag booleana que indica se uma determinada funcionalidade está habilitada ou desabilitada para um perfil.

### Atributos
Cada instância de `Permissão` é um conjunto de flags booleanas, como:
- `canViewCourses`: Pode visualizar cursos (booleano).
- `canAccessBoard`: Pode acessar o mural (booleano).
- `canPostToBoard`: Pode postar no mural (booleano).
- `canRegisterUsers`: Pode cadastrar usuários (booleano).
- `canResolveTickets`: Pode resolver chamados (booleano).
- `canAccessEverything`: Tem acesso total (booleano).
(e outras permissões específicas conforme definido no sistema)

### Operações
- `verificar(nomePermissao)`: Retorna o valor booleano de uma permissão específica.
- `habilitar(nomePermissao)`: Define uma permissão como verdadeira.
- `desabilitar(nomePermissao)`: Define uma permissão como falsa.

### Representação Lógica
O TDA `Permissão` para um tipo de usuário específico pode ser modelado como um **Registro (Record)** ou **Estrutura (Struct)** de campos booleanos. Coletivamente, as permissões para todos os tipos de usuários formam um **Mapa (Map)** ou **Dicionário (Dictionary)**, onde a chave é o `tipo` de usuário (string) e o valor é o registro de `Permissão` associado a esse tipo.

## 3. TDA Sistema de Autenticação e Autorização

### Definição
O TDA `Sistema de Autenticação e Autorização` é uma abstração de alto nível que gerencia o processo de login, logout e a verificação de permissões para todos os usuários do sistema. Ele atua como um controlador central para o acesso e segurança.

### Atributos
- `usuarios`: Uma coleção (Lista/Conjunto) de TDAs `Usuário`.
- `mapaPermissoes`: Um Mapa/Dicionário que associa cada `tipo` de usuário a um TDA `Permissão`.
- `usuarioAtual`: O TDA `Usuário` que está logado no momento (ou nulo, se ninguém estiver logado).

### Operações
- `login(funcional, senha)`: Tenta autenticar um usuário e, se bem-sucedido, define `usuarioAtual`.
- `logout()`: Desloga o `usuarioAtual`.
- `estaLogado()`: Retorna verdadeiro se um usuário estiver logado, falso caso contrário.
- `obterUsuarioAtual()`: Retorna o TDA `Usuário` atualmente logado.
- `temPermissao(nomePermissao)`: Verifica se o `usuarioAtual` possui uma `Permissão` específica.
- `cadastrarUsuario(dadosUsuario)`: Adiciona um novo TDA `Usuário` à coleção, respeitando as regras de permissão de cadastro.
- `obterPermissoesUsuarioAtual()`: Retorna o TDA `Permissão` completo do `usuarioAtual`.

### Representação Lógica
Este TDA é um exemplo de um **Objeto Complexo** ou **Módulo**, que agrega e coordena a interação entre outros TDAs (`Usuário` e `Permissão`) e estruturas de dados subjacentes (como Listas e Mapas). Ele abstrai a complexidade das regras de negócio de autenticação e autorização, oferecendo uma interface limpa para o restante da aplicação.

## Conclusão

Os Tipos de Dados Abstratos descritos acima fornecem uma base sólida para a organização e manipulação dos dados de usuários e permissões no projeto PróFuturo. Ao pensar nesses componentes como TDAs, o projeto ganha em modularidade, reusabilidade e facilidade de manutenção, pois a lógica de como os dados são usados é separada de como eles são implementados internamente.

