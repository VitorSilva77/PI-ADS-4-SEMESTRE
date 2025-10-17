const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { requireAuth, requirePermission, requireUserType } = require('../middleware/auth');

router.get('/', requireAuth, async (req, res) => {
    try {
        const user = req.session.user;
        let courses;

        if (user.permissions.includes('viewAllCourses')) {

            if (user.tipo_usuario === 'Professor') {

                courses = await Course.findByProfessor(user.id_usuario);
            } else {

                courses = await Course.findAll();
            }
        } else if (user.permissions.includes('viewReports')) {

            courses = await Course.findBasicInfo();
        } else {
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para visualizar cursos.'
            });
        }

        res.json({
            success: true,
            courses: courses
        });
    } catch (error) {
        console.error('Erro ao listar cursos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

router.get('/:id', requireAuth, requirePermission('viewAllCourses'), async (req, res) => {
    try {
        const { id } = req.params;
        const user = req.session.user;

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso não encontrado.'
            });
        }

        // Se for professor verifica se e o responsavel pelo curso
        if (user.tipo_usuario === 'Professor' && course.id_professor_responsavel !== user.id_usuario) {
            return res.status(403).json({
                success: false,
                message: 'Você não tem permissão para visualizar este curso.'
            });
        }

        res.json({
            success: true,
            course: course
        });
    } catch (error) {
        console.error('Erro ao obter curso:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para criar curso (apenas gerência)
router.post('/', requireAuth, requireUserType('Gerencia'), async (req, res) => {
    try {
        const { nome_curso, descricao, id_professor_responsavel } = req.body;

        // Validar dados de entrada
        if (!nome_curso || !descricao) {
            return res.status(400).json({
                success: false,
                message: 'Nome do curso e descrição são obrigatórios.'
            });
        }

        const newCourse = await Course.create({
            nome_curso,
            descricao,
            id_professor_responsavel
        });

        res.status(201).json({
            success: true,
            message: 'Curso criado com sucesso.',
            course: newCourse
        });
    } catch (error) {
        console.error('Erro ao criar curso:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para atualizar curso (apenas gerência)
router.put('/:id', requireAuth, requireUserType('Gerencia'), async (req, res) => {
    try {
        const { id } = req.params;
        const { nome_curso, descricao, id_professor_responsavel } = req.body;

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso não encontrado.'
            });
        }

        const updatedCourse = await course.update({
            nome_curso,
            descricao,
            id_professor_responsavel
        });

        res.json({
            success: true,
            message: 'Curso atualizado com sucesso.',
            course: updatedCourse
        });
    } catch (error) {
        console.error('Erro ao atualizar curso:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para deletar curso (apenas gerência)
router.delete('/:id', requireAuth, requireUserType('Gerencia'), async (req, res) => {
    try {
        const { id } = req.params;

        const course = await Course.findById(id);
        if (!course) {
            return res.status(404).json({
                success: false,
                message: 'Curso não encontrado.'
            });
        }

        await course.delete();

        res.json({
            success: true,
            message: 'Curso deletado com sucesso.'
        });
    } catch (error) {
        console.error('Erro ao deletar curso:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

// Rota para obter estatísticas de cursos (RH e Gerência)
router.get('/stats/overview', requireAuth, requireUserType(['RH', 'Gerencia']), async (req, res) => {
    try {
        const courses = await Course.findAll();
        const basicInfo = await Course.findBasicInfo();

        const stats = {
            total_cursos: courses.length,
            cursos_com_professor: courses.filter(c => c.id_professor_responsavel).length,
            cursos_sem_professor: courses.filter(c => !c.id_professor_responsavel).length,
            total_alunos: basicInfo.reduce((sum, course) => sum + (course.total_alunos || 0), 0)
        };

        res.json({
            success: true,
            stats: stats
        });
    } catch (error) {
        console.error('Erro ao obter estatísticas de cursos:', error);
        res.status(500).json({
            success: false,
            message: 'Erro interno do servidor.'
        });
    }
});

module.exports = router;
