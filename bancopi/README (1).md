# Sistema de Permissões PróFuturo

## Visão Geral

Este projeto implementa um sistema completo de controle de permissões para uma aplicação Electron corporativa acadêmica. O sistema possui quatro tipos de usuário com diferentes níveis de acesso e funcionalidades.

## Tipos de Usuário

### Professor
- Visualiza cursos que ministra
- Acessa e publica no mural
- Pode abrir chamados

### RH
- Visualiza informações básicas dos cursos
- Cadastra usuários do tipo "Professor"
- Pode abrir chamados

### TI
- Acessa painel de chamados completo
- Resolve chamados
- Cadastra usuários "TI" e "RH"

### Gerência
- Acesso total ao sistema (exceto resolver chamados)
- Pode cadastrar qualquer tipo de usuário
- Visualiza todos os relatórios

## Instalação e Execução

### Pré-requisitos
- Node.js versão 16 ou superior
- npm (incluído com Node.js)

### Passos para Execução

1. **Extrair o projeto:**
   ```bash
   unzip PI-ADS-4-SEMESTRE-MODIFICADO.zip
   cd PI-ADS-4-SEMESTRE-main/Electron
   ```

2. **Instalar dependências:**
   ```bash
   npm install
   ```

3. **Executar a aplicação:**
   ```bash
   npm start
   ```

## Usuários de Teste

O sistema vem com usuários pré-cadastrados para teste:

| Tipo | Funcional | Senha | Nome |
|---|---|---|---|
| Gerência | 12345 | admin123 | Administrador Geral |
| Professor | 11111 | prof123 | João Professor |
| RH | 22222 | rh123 | Maria RH |
| TI | 33333 | ti123 | Carlos TI |

## Funcionalidades Implementadas

### Sistema de Autenticação
- Login seguro com validação de credenciais
- Manutenção de sessão
- Logout automático

### Interface Dinâmica
- Menu lateral adaptado às permissões do usuário
- Conteúdo principal baseado no tipo de usuário
- Informações personalizadas no dashboard

### Gestão de Usuários
- Cadastro de novos usuários respeitando hierarquia
- Validação de permissões para cadastro
- Interface específica para cada tipo de usuário

### Sistema de Chamados
- Abertura de chamados por qualquer usuário
- Resolução exclusiva pela equipe de TI
- Acompanhamento de status

### Mural de Avisos
- Publicação de avisos por professores e gerência
- Visualização cronológica
- Interface intuitiva

### Relatórios
- Dashboards específicos por tipo de usuário
- Estatísticas de cursos e usuários
- Indicadores de performance

## Estrutura do Projeto

```
Electron/
├── css/                    # Estilos da aplicação
├── images/                 # Imagens e recursos
├── js/                     # Scripts JavaScript
│   ├── auth.js            # Sistema de autenticação
│   ├── ui-controller.js   # Controle da interface
│   └── login.js           # Script de login
├── index.html             # Página de login
├── userPage.html          # Dashboard principal
├── main.js                # Arquivo principal do Electron
└── package.json           # Configurações do projeto
```

## Arquivos Principais

- **auth.js**: Contém toda a lógica de autenticação e autorização
- **ui-controller.js**: Gerencia a interface dinâmica baseada em permissões
- **login.js**: Controla o processo de login
- **userPage.html**: Interface principal adaptativa
- **index.html**: Tela de login

## Segurança

- Validação de permissões em todas as operações
- Controle de acesso baseado em perfis
- Armazenamento seguro de dados no localStorage
- Validação de entrada em todos os formulários

## Manual de Uso

Consulte o arquivo `Manual_de_Uso_Sistema_Permissoes.md` para instruções detalhadas sobre:
- Como usar cada funcionalidade
- Guias específicos por tipo de usuário
- Solução de problemas
- Melhores práticas de segurança

## Desenvolvimento

### Tecnologias Utilizadas
- Electron
- HTML5/CSS3
- JavaScript (ES6+)
- Font Awesome (ícones)
- localStorage (persistência)

### Padrões de Código
- Código modular e bem documentado
- Separação clara entre lógica e apresentação
- Validação robusta de dados
- Interface responsiva

## Suporte

Para dúvidas ou problemas:
1. Consulte o manual de uso
2. Verifique os usuários de teste
3. Utilize o sistema de chamados interno
4. Entre em contato com a equipe de desenvolvimento

## Licença

Este projeto foi desenvolvido para fins acadêmicos e corporativos.

---

**Versão:** 1.0  
**Data:** 28 de Agosto de 2025  
**Desenvolvido por:** Manus AI

