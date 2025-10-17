const { executeQuery } = require('../config/database');

class Course {
    constructor(data) {
        this.id_curso = data.id_curso;
        this.nome_curso = data.nome_curso;
        this.descricao = data.descricao;
        this.id_professor_responsavel = data.id_professor_responsavel;
        this.professor_responsavel = data.professor_responsavel;
    }

    static async findAll() {
        try {
            const query = `
                SELECT c.*, u.nome as professor_responsavel 
                FROM cursos c 
                LEFT JOIN usuarios u ON c.id_professor_responsavel = u.id_usuario 
                ORDER BY c.nome_curso
            `;
            
            const result = await executeQuery(query);
            return result.map(courseData => new Course(courseData));
        } catch (error) {
            console.error('Erro ao buscar cursos:', error);
            throw error;
        }
    }

    static async findByProfessor(professorId) {
        try {
            const query = `
                SELECT c.*, u.nome as professor_responsavel 
                FROM cursos c 
                LEFT JOIN usuarios u ON c.id_professor_responsavel = u.id_usuario 
                WHERE c.id_professor_responsavel = ?
                ORDER BY c.nome_curso
            `;
            
            const result = await executeQuery(query, [professorId]);
            return result.map(courseData => new Course(courseData));
        } catch (error) {
            console.error('Erro ao buscar cursos por professor:', error);
            throw error;
        }
    }

    static async findBasicInfo() {
        try {
            const query = `
                SELECT 
                    c.id_curso,
                    c.nome_curso,
                    c.descricao,
                    COUNT(DISTINCT u.id_usuario) as total_alunos
                FROM cursos c 
                LEFT JOIN usuarios u ON u.id_tipo_usuario = 2 -- Assumindo que tipo 2 são alunos
                GROUP BY c.id_curso, c.nome_curso, c.descricao
                ORDER BY c.nome_curso
            `;
            
            const result = await executeQuery(query);
            return result;
        } catch (error) {
            console.error('Erro ao buscar informações básicas dos cursos:', error);
            throw error;
        }
    }

  
    static async findById(id) {
        try {
            const query = `
                SELECT c.*, u.nome as professor_responsavel 
                FROM cursos c 
                LEFT JOIN usuarios u ON c.id_professor_responsavel = u.id_usuario 
                WHERE c.id_curso = ?
            `;
            
            const result = await executeQuery(query, [id]);
            
            if (result.length > 0) {
                return new Course(result[0]);
            }
            return null;
        } catch (error) {
            console.error('Erro ao buscar curso por ID:', error);
            throw error;
        }
    }

    
    static async create(courseData) {
        try {
            const query = `
                INSERT INTO cursos (nome_curso, descricao, id_professor_responsavel) 
                VALUES (?, ?, ?)
            `;
            
            const result = await executeQuery(query, [
                courseData.nome_curso,
                courseData.descricao,
                courseData.id_professor_responsavel
            ]);

            return await Course.findById(result.insertId);
        } catch (error) {
            console.error('Erro ao criar curso:', error);
            throw error;
        }
    }

    
    async update(courseData) {
        try {
            const query = `
                UPDATE cursos 
                SET nome_curso = ?, descricao = ?, id_professor_responsavel = ?
                WHERE id_curso = ?
            `;
            
            await executeQuery(query, [
                courseData.nome_curso || this.nome_curso,
                courseData.descricao || this.descricao,
                courseData.id_professor_responsavel || this.id_professor_responsavel,
                this.id_curso
            ]);

            return await Course.findById(this.id_curso);
        } catch (error) {
            console.error('Erro ao atualizar curso:', error);
            throw error;
        }
    }

    
    async delete() {
        try {
            const query = 'DELETE FROM cursos WHERE id_curso = ?';
            await executeQuery(query, [this.id_curso]);
            return true;
        } catch (error) {
            console.error('Erro ao deletar curso:', error);
            throw error;
        }
    }
}

module.exports = Course;
