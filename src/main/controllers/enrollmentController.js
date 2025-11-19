const enrollmentService = require('../services/enrollmentService');

async function handleCreateEnrollment(event, { aluno_id, curso_id }) {
  try {
    const newEnrollment = await enrollmentService.createEnrollment(aluno_id, curso_id);
    return { success: true, data: newEnrollment };
  } catch (error) {
    console.error('Erro ao criar matrícula:', error.message);
    return { success: false, error: error.message };
  }
}

async function handleGetEnrollmentsByCourse(event, curso_id) {
  try {
    const enrollments = await enrollmentService.getEnrollmentsByCourse(curso_id);
    return { success: true, data: enrollments };
  } catch (error) {
    console.error('Erro ao buscar matrículas por curso:', error.message);
    return { success: false, error: error.message };
  }
}

async function handleUpdateEnrollmentGrade(event, { enrollment_id, nota_final }) {
  try {
    const updated = await enrollmentService.updateEnrollmentGrade(enrollment_id, nota_final);
    return { success: true, data: updated };
  } catch (error) {
    console.error('Erro ao atualizar nota:', error.message);
    return { success: false, error: error.message };
  }
}

module.exports = {
  handleCreateEnrollment,
  handleGetEnrollmentsByCourse,
  handleUpdateEnrollmentGrade
};