

-- Criação de usuários MySQL dedicados para a aplicação
CREATE USER IF NOT EXISTS 'app_gerencia'@'localhost' IDENTIFIED BY 'gerencia_pass';
CREATE USER IF NOT EXISTS 'app_professor'@'localhost' IDENTIFIED BY 'professor_pass';
CREATE USER IF NOT EXISTS 'app_rh'@'localhost' IDENTIFIED BY 'rh_pass';
CREATE USER IF NOT EXISTS 'app_ti'@'localhost' IDENTIFIED BY 'ti_pass';

FLUSH PRIVILEGES;

-- Criação de VIEWS para RLS

-- VIEW para Gerência: Acesso a todos os dados
CREATE OR REPLACE VIEW vw_gerencia_usuarios AS
SELECT id_usuario, funcional, nome, tu.nome_tipo AS tipo_usuario
FROM usuarios u
JOIN tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario;

CREATE OR REPLACE VIEW vw_gerencia_cursos AS
SELECT c.id_curso, c.nome_curso, c.descricao, u.nome AS professor_responsavel
FROM cursos c
LEFT JOIN usuarios u ON c.id_professor_responsavel = u.id_usuario;

CREATE OR REPLACE VIEW vw_gerencia_chamados AS
SELECT ch.id_chamado, ch.titulo, ch.descricao, ch.status,
       ua.nome AS usuario_abertura, uti.nome AS usuario_responsavel_ti
FROM chamados ch
JOIN usuarios ua ON ch.id_usuario_abertura = ua.id_usuario
LEFT JOIN usuarios uti ON ch.id_usuario_responsavel_ti = uti.id_usuario;

-- VIEW para Professor: Apenas seus cursos e chamados que abriu
-- Nota: Para simular o RLS para o professor, a aplicação precisaria passar o ID do professor logado
-- ou o usuário MySQL 'app_professor' precisaria ser mapeado para um ID de usuário específico no banco.
-- Aqui, faremos uma VIEW genérica que a aplicação filtraria, ou uma VIEW parametrizada se o MySQL permitisse.
-- Para fins de teste no Workbench, vamos criar uma VIEW que mostra cursos de um professor específico (id=2)
-- Em um cenário real, a aplicação passaria o ID do professor logado na query para esta VIEW.
CREATE OR REPLACE VIEW vw_professor_meus_cursos AS
SELECT c.id_curso, c.nome_curso, c.descricao, u.nome AS professor_responsavel
FROM cursos c
JOIN usuarios u ON c.id_professor_responsavel = u.id_usuario
WHERE u.funcional = SUBSTRING_INDEX(USER(), '@', 1); -- Simula RLS baseado no usuário MySQL

CREATE OR REPLACE VIEW vw_professor_meus_chamados AS
SELECT ch.id_chamado, ch.titulo, ch.descricao, ch.status, ua.nome AS usuario_abertura
FROM chamados ch
JOIN usuarios ua ON ch.id_usuario_abertura = ua.id_usuario
WHERE ua.funcional = SUBSTRING_INDEX(USER(), '@', 1); -- Simula RLS baseado no usuário MySQL

-- VIEW para RH: Informações básicas de cursos e usuários Professor
CREATE OR REPLACE VIEW vw_rh_cursos_basico AS
SELECT id_curso, nome_curso, descricao
FROM cursos;

CREATE OR REPLACE VIEW vw_rh_usuarios_professores AS
SELECT u.id_usuario, u.funcional, u.nome
FROM usuarios u
JOIN tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
WHERE tu.nome_tipo = 'Professor';

-- VIEW para TI: Todos os chamados e usuários TI/RH
CREATE OR REPLACE VIEW vw_ti_todos_chamados AS
SELECT ch.id_chamado, ch.titulo, ch.descricao, ch.status,
       ua.nome AS usuario_abertura, uti.nome AS usuario_responsavel_ti
FROM chamados ch
JOIN usuarios ua ON ch.id_usuario_abertura = ua.id_usuario
LEFT JOIN usuarios uti ON ch.id_usuario_responsavel_ti = uti.id_usuario;

CREATE OR REPLACE VIEW vw_ti_usuarios_ti_rh AS
SELECT u.id_usuario, u.funcional, u.nome, tu.nome_tipo AS tipo_usuario
FROM usuarios u
JOIN tipos_usuario tu ON u.id_tipo_usuario = tu.id_tipo_usuario
WHERE tu.nome_tipo IN ('TI', 'RH');

-- Concessão de permissões aos usuários MySQL

-- Permissões para app_gerencia
GRANT SELECT ON profuturo_db.* TO 'app_gerencia'@'localhost';
GRANT SELECT ON profuturo_db.vw_gerencia_usuarios TO 'app_gerencia'@'localhost';
GRANT SELECT ON profuturo_db.vw_gerencia_cursos TO 'app_gerencia'@'localhost';
GRANT SELECT ON profuturo_db.vw_gerencia_chamados TO 'app_gerencia'@'localhost';

-- Permissões para app_professor
GRANT SELECT ON profuturo_db.vw_professor_meus_cursos TO 'app_professor'@'localhost';
GRANT SELECT ON profuturo_db.vw_professor_meus_chamados TO 'app_professor'@'localhost';

-- Permissões para app_rh
GRANT SELECT ON profuturo_db.vw_rh_cursos_basico TO 'app_rh'@'localhost';
GRANT SELECT ON profuturo_db.vw_rh_usuarios_professores TO 'app_rh'@'localhost';
-- RH pode inserir professores
GRANT INSERT ON profuturo_db.usuarios TO 'app_rh'@'localhost';

-- Permissões para app_ti
GRANT SELECT ON profuturo_db.vw_ti_todos_chamados TO 'app_ti'@'localhost';
GRANT SELECT ON profuturo_db.vw_ti_usuarios_ti_rh TO 'app_ti'@'localhost';
-- TI pode inserir TI e RH
GRANT INSERT ON profuturo_db.usuarios TO 'app_ti'@'localhost';
-- TI pode atualizar e deletar chamados
GRANT UPDATE, DELETE ON profuturo_db.chamados TO 'app_ti'@'localhost';

FLUSH PRIVILEGES;


