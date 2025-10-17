-- Excluir o banco de dados se ele já existir (Comentado por segurança)
-- DROP DATABASE IF EXISTS pro_futuro;

-- Criar o banco de dados
CREATE DATABASE pro_futuro;

-- Usar o banco de dados recém-criado
USE pro_futuro;

-- Tabela de tipos de usuário
CREATE TABLE tipos_usuario (
    id_tipo_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_tipo VARCHAR(50) NOT NULL UNIQUE,
    descricao TEXT
);

-- Tabela de usuários
CREATE TABLE usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    funcional VARCHAR(50) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    id_tipo_usuario INT,
    FOREIGN KEY (id_tipo_usuario) REFERENCES tipos_usuario(id_tipo_usuario)
);

-- Tabela de permissões
CREATE TABLE permissoes (
    id_permissao INT AUTO_INCREMENT PRIMARY KEY,
    nome_permissao VARCHAR(100) NOT NULL UNIQUE,
    descricao TEXT
);

-- Tabela de associação entre tipos de usuário e permissões
CREATE TABLE tipo_usuario_permissoes (
    id_tipo_usuario INT,
    id_permissao INT,
    PRIMARY KEY (id_tipo_usuario, id_permissao),
    FOREIGN KEY (id_tipo_usuario) REFERENCES tipos_usuario(id_tipo_usuario),
    FOREIGN KEY (id_permissao) REFERENCES permissoes(id_permissao)
);

-- Tabela de cursos
CREATE TABLE cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nome_curso VARCHAR(100) NOT NULL,
    descricao TEXT,
    data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabela de chamados
CREATE TABLE chamados (
    id_chamado INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    descricao TEXT NOT NULL,
    status ENUM('Aberto', 'Em Andamento', 'Resolvido', 'Fechado') NOT NULL DEFAULT 'Aberto',
    id_usuario_abertura INT,
    id_usuario_atendimento INT,
    data_abertura TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    data_fechamento TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario_abertura) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_usuario_atendimento) REFERENCES usuarios(id_usuario)
);

-- Tabela do mural
CREATE TABLE mural (
    id_post INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(100) NOT NULL,
    conteudo TEXT NOT NULL,
    id_usuario INT,
    data_postagem TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario)
);

-- Inserir tipos de usuário
INSERT INTO tipos_usuario (nome_tipo, descricao) VALUES
('Gerencia', 'Acesso total ao sistema, com exceção de resolver chamados técnicos.'),
('TI', 'Acesso para manutenção do sistema e resolução de chamados.'),
('RH', 'Acesso para gestão de pessoal e cadastro de professores.'),
('Professor', 'Acesso focado em atividades de ensino e comunicação com alunos.');

-- Inserir permissões
INSERT INTO permissoes (nome_permissao, descricao) VALUES
('viewAllCourses', 'Visualizar todos os cursos'),
('manageUsers', 'Gerenciar todos os usuários (criar, editar, excluir)'),
('viewAllTickets', 'Visualizar todos os chamados'),
('resolveTickets', 'Resolver chamados técnicos'),
('registerUsers', 'Cadastrar novos usuários'),
('viewReports', 'Visualizar relatórios gerenciais'),
('postOnMural', 'Publicar no mural'),
('openTicket', 'Abrir um chamado técnico');

-- Associar permissões aos tipos de usuário
-- Gerência
INSERT INTO tipo_usuario_permissoes (id_tipo_usuario, id_permissao) VALUES
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'Gerencia'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'viewAllCourses')),
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'Gerencia'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'manageUsers')),
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'Gerencia'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'viewAllTickets')),
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'Gerencia'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'registerUsers')),
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'Gerencia'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'viewReports')),
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'Gerencia'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'postOnMural')),
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'Gerencia'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'openTicket'));

-- TI
INSERT INTO tipo_usuario_permissoes (id_tipo_usuario, id_permissao) VALUES
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'TI'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'viewAllTickets')),
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'TI'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'resolveTickets')),
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'TI'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'registerUsers')),
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'TI'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'openTicket'));

-- RH
INSERT INTO tipo_usuario_permissoes (id_tipo_usuario, id_permissao) VALUES
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'RH'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'registerUsers')),
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'RH'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'viewReports')),
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'RH'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'openTicket'));

-- Professor
INSERT INTO tipo_usuario_permissoes (id_tipo_usuario, id_permissao) VALUES
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'Professor'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'postOnMural')),
((SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'Professor'), (SELECT id_permissao FROM permissoes WHERE nome_permissao = 'openTicket'));

-- Inserir um usuário de exemplo para cada tipo
-- A senha para todos é 'senha123'
INSERT INTO usuarios (funcional, senha, nome, id_tipo_usuario) VALUES
('gerencia01', '$2b$10$D8.a2.G3h2j5K/P8e9f7f.e.Y.Z/a.b.c.d.e.f.g.h.i', 'Admin Geral', (SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'Gerencia')),
('ti01', '$2b$10$D8.a2.G3h2j5K/P8e9f7f.e.Y.Z/a.b.c.d.e.f.g.h.i', 'Suporte TI', (SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'TI')),
('rh01', '$2b$10$D8.a2.G3h2j5K/P8e9f7f.e.Y.Z/a.b.c.d.e.f.g.h.i', 'Recursos Humanos', (SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'RH')),
('prof01', '$2b$10$D8.a2.G3h2j5K/P8e9f7f.e.Y.Z/a.b.c.d.e.f.g.h.i', 'Professor Exemplo', (SELECT id_tipo_usuario FROM tipos_usuario WHERE nome_tipo = 'Professor'));
