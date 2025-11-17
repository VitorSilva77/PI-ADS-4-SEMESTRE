const enrollmentRepository = require('../repositories/enrollmentRepository');
const { getCurrentUser } = require('./authService');
const { checkRole } = require('../utils/security');
const { ROLES } = require('../utils/constants');
const auditService = require('./auditService');

async function createEnrollment(aluno_id, curso_id) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Não autenticado.');
  
  checkRole(currentUser.role_name, [ROLES.TI]);

  if (!aluno_id || !curso_id) {
    throw new Error('ID do Aluno e ID do Curso são obrigatórios.');
  }

  const activeEnrollment = await enrollmentRepository.findActiveByStudent(aluno_id);
  if (activeEnrollment) {
    throw new Error('Este aluno já está matriculado e cursando outro curso. Ele deve concluir o curso atual primeiro.');
  }

  const existingEnrollment = await enrollmentRepository.findByStudentAndCourse(aluno_id, curso_id);
  if (existingEnrollment) {
    throw new Error('Este aluno já foi matriculado neste curso (status: ' + existingEnrollment.status + ').');
  }

  const newEnrollment = await enrollmentRepository.create(aluno_id, curso_id);

  await auditService.log(
    currentUser.id, 
    'CREATE_ENROLLMENT', 
    'matriculas', 
    newEnrollment.id, 
    { aluno_id: aluno_id, curso_id: curso_id }
  );

  return newEnrollment;
}

module.exports = {
  createEnrollment
};