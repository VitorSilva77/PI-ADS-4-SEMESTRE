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

module.exports = {
  handleCreateEnrollment
};