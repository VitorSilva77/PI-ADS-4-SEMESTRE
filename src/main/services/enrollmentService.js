const enrollmentRepository = require('../repositories/enrollmentRepository');
const courseRepository = require('../repositories/courseRepository')
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


//Busca alunos matriculados para a seção de notas.
//Valida se o professor que solicita é o dono do curso.
async function getEnrollmentsByCourse(curso_id) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Não autenticado.');

  checkRole(currentUser.role_name, [ROLES.TI, ROLES.PROFESSOR]);

  // Se for professor, validar se ele é o dono do curso
  if (currentUser.role_name === ROLES.PROFESSOR) {
    const curso = await courseRepository.findById(curso_id); 
    if (!curso || curso.professor_id !== currentUser.id) {
      throw new Error('ACESSO_NEGADO: Você só pode ver alunos dos seus próprios cursos.');
    }
  }

  return enrollmentRepository.findByCourse(curso_id);
}

//Atualiza a nota e o status de uma matrícula
//Valida as permissões (TI pode tudo, Professor só pode concluir)
async function updateEnrollmentGrade(enrollment_id, nota_final) {
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Não autenticado.');
  
  const matricula = await enrollmentRepository.findById(enrollment_id);
  if (!matricula) throw new Error('Matrícula não encontrada.');

  const updateData = {
    nota_final: parseFloat(nota_final),
    status: 'concluido'
  };

  if (matricula.status === 'cursando') {
    checkRole(currentUser.role_name, [ROLES.TI, ROLES.PROFESSOR]);
    // Poderia haver uma lógica extra para verificar se o professor é dono do curso, mas simplificamos aqui
  } 
  else if (matricula.status === 'concluido') {
    checkRole(currentUser.role_name, [ROLES.TI]);
  }

  const updatedEnrollment = await enrollmentRepository.update(enrollment_id, updateData);

  await auditService.log(
    currentUser.id, 
    'UPDATE_ENROLLMENT_GRADE', 
    'matriculas', 
    updatedEnrollment.id, 
    { aluno_id: updatedEnrollment.aluno_id, curso_id: updatedEnrollment.curso_id, nota: nota_final }
  );

  return updatedEnrollment;
}

module.exports = {
  createEnrollment,
  getEnrollmentsByCourse,
  updateEnrollmentGrade
};