CREATE DATABASE IF NOT EXISTS profuturo_db;
USE profuturo_db;

-- Tabela para tipos de usuário
CREATE TABLE IF NOT EXISTS tipos_usuario (
    id_tipo_usuario INT AUTO_INCREMENT PRIMARY KEY,
    nome_tipo VARCHAR(50) UNIQUE NOT NULL
);

-- Tabela para usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT AUTO_INCREMENT PRIMARY KEY,
    funcional VARCHAR(20) UNIQUE NOT NULL,
    senha VARCHAR(255) NOT NULL,
    nome VARCHAR(100) NOT NULL,
    id_tipo_usuario INT NOT NULL,
    FOREIGN KEY (id_tipo_usuario) REFERENCES tipos_usuario(id_tipo_usuario)
);

-- Tabela para permissões
CREATE TABLE IF NOT EXISTS permissoes (
    id_permissao INT AUTO_INCREMENT PRIMARY KEY,
    nome_permissao VARCHAR(100) UNIQUE NOT NULL
);

-- Tabela de junção para tipo_usuario_permissoes (muitos-para-muitos)
CREATE TABLE IF NOT EXISTS tipo_usuario_permissoes (
    id_tipo_usuario INT NOT NULL,
    id_permissao INT NOT NULL,
    PRIMARY KEY (id_tipo_usuario, id_permissao),
    FOREIGN KEY (id_tipo_usuario) REFERENCES tipos_usuario(id_tipo_usuario)
);

-- Tabela para cursos
CREATE TABLE IF NOT EXISTS cursos (
    id_curso INT AUTO_INCREMENT PRIMARY KEY,
    nome_curso VARCHAR(255) NOT NULL,
    descricao TEXT,
    id_professor_responsavel INT,
    FOREIGN KEY (id_professor_responsavel) REFERENCES usuarios(id_usuario)
);

-- Tabela para chamados
CREATE TABLE IF NOT EXISTS chamados (
    id_chamado INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(255) NOT NULL,
    descricao TEXT NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Aberto',
    id_usuario_abertura INT NOT NULL,
    id_usuario_responsavel_ti INT,
    FOREIGN KEY (id_usuario_abertura) REFERENCES usuarios(id_usuario),
    FOREIGN KEY (id_usuario_responsavel_ti) REFERENCES usuarios(id_usuario)
);

