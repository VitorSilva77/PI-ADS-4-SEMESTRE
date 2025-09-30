USE profuturo_db;

-- Inserção de tipos de usuário
INSERT IGNORE INTO tipos_usuario (id_tipo_usuario, nome_tipo) VALUES
(1, 'Gerencia'),
(2, 'Professor'),
(3, 'RH'),
(4, 'TI');

-- Inserção de usuários padrão (senhas hashadas para segurança, aqui como exemplo simples)
-- Em um ambiente real, use funções de hash como SHA256, bcrypt, etc.
INSERT IGNORE INTO usuarios (id_usuario, funcional, senha, nome, id_tipo_usuario) VALUES
(1, '12345', 'admin123', 'Administrador Geral', 1), -- Gerencia
(2, '11111', 'prof123', 'João Professor', 2),    -- Professor
(3, '22222', 'rh123', 'Maria RH', 3),         -- RH
(4, '33333', 'ti123', 'Carlos TI', 4);         -- TI

-- Inserção de permissões
INSERT IGNORE INTO permissoes (id_permissao, nome_permissao) VALUES
(1, 'canViewCourses'),
(2, 'canAccessBoard'),
(3, 'canPostToBoard'),
(4, 'canViewBasicCourseInfo'),
(5, 'canRegisterUsers'),
(6, 'canRegisterProfessors'),
(7, 'canRegisterTI'),
(8, 'canRegisterRH'),
(9, 'canAccessTickets'),
(10, 'canResolveTickets'),
(11, 'canAccessEverything');

-- Atribuição de permissões aos tipos de usuário
-- Gerencia (id_tipo_usuario = 1)
INSERT IGNORE INTO tipo_usuario_permissoes (id_tipo_usuario, id_permissao) VALUES
(1, 1),  -- canViewCourses
(1, 2),  -- canAccessBoard
(1, 3),  -- canPostToBoard
(1, 4),  -- canViewBasicCourseInfo
(1, 5),  -- canRegisterUsers
(1, 6),  -- canRegisterProfessors
(1, 7),  -- canRegisterTI
(1, 8),  -- canRegisterRH
(1, 9),  -- canAccessTickets
(1, 11); -- canAccessEverything (não pode resolver chamados)

-- Professor (id_tipo_usuario = 2)
INSERT IGNORE INTO tipo_usuario_permissoes (id_tipo_usuario, id_permissao) VALUES
(2, 1), -- canViewCourses
(2, 2), -- canAccessBoard
(2, 3), -- canPostToBoard
(2, 9); -- canAccessTickets

-- RH (id_tipo_usuario = 3)
INSERT IGNORE INTO tipo_usuario_permissoes (id_tipo_usuario, id_permissao) VALUES
(3, 4), -- canViewBasicCourseInfo
(3, 5), -- canRegisterUsers
(3, 6), -- canRegisterProfessors
(3, 9); -- canAccessTickets

-- TI (id_tipo_usuario = 4)
INSERT IGNORE INTO tipo_usuario_permissoes (id_tipo_usuario, id_permissao) VALUES
(4, 5),  -- canRegisterUsers
(4, 7),  -- canRegisterTI
(4, 8),  -- canRegisterRH
(4, 9),  -- canAccessTickets
(4, 10); -- canResolveTickets

-- Inserção de dados de exemplo para cursos e chamados
INSERT IGNORE INTO cursos (id_curso, nome_curso, descricao, id_professor_responsavel) VALUES
(1, 'Programação Web Avançada', 'Desenvolvimento de aplicações web modernas.', 2), -- João Professor
(2, 'Banco de Dados Relacionais', 'Fundamentos e prática com SQL.', 2), -- João Professor
(3, 'Engenharia de Software', 'Metodologias e processos de desenvolvimento.', 1); -- Administrador Geral (exemplo de curso gerencial)

INSERT IGNORE INTO chamados (id_chamado, titulo, descricao, status, id_usuario_abertura, id_usuario_responsavel_ti) VALUES
(1, 'Problema de Login', 'Usuários não conseguem acessar o sistema.', 'Aberto', 1, NULL),
(2, 'Lentidão no Sistema', 'Sistema está muito lento após a atualização.', 'Em Andamento', 2, 4),
(3, 'Erro ao Cadastrar Aluno', 'RH não consegue cadastrar novos alunos.', 'Aberto', 3, NULL);

