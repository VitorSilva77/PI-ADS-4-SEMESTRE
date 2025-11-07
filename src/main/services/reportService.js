const reportRepository = require('../repositories/reportRepository');
const { getCurrentUser } = require('./authService');
const { checkRole } = require('../utils/security');
const { ROLES } = require('../utils/constants');

async function getCoursePerformanceReport(courseId = null) { 
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Não autenticado.');
  }

  checkRole(user.role_name, [ROLES.TI, ROLES.RH, ROLES.PROFESSOR]); 

  return reportRepository.getCoursePerformance(courseId); 
}

async function getEnrollmentStatusReport(courseId = null) {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Não autenticado.');
  }
  checkRole(user.role_name, [ROLES.TI, ROLES.RH, ROLES.PROFESSOR]);
  return reportRepository.getEnrollmentStatus(courseId);
}

async function getGradeDistributionReport(courseId = null) {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Não autenticado.');
  }
  checkRole(user.role_name, [ROLES.TI, ROLES.RH, ROLES.PROFESSOR]);
  return reportRepository.getGradeDistribution(courseId); 
}

async function getCourseAveragesReport() {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Não autenticado.');
  }
  checkRole(user.role_name, [ROLES.TI, ROLES.RH, ROLES.PROFESSOR]);
  return reportRepository.getCourseAverages(); 
}

async function getDetailedEnrollmentsReport() {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Não autenticado.');
  }
  checkRole(user.role_name, [ROLES.TI, ROLES.RH, ROLES.PROFESSOR]);
  return reportRepository.getDetailedEnrollments();
}

async function getTotalStudentsPerCourseReport() {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Não autenticado.');
  }
  checkRole(user.role_name, [ROLES.TI, ROLES.RH, ROLES.PROFESSOR]);
  return reportRepository.getTotalStudentsPerCourse();
}



async function getStudentsPerProfessorReport() {
  const user = getCurrentUser();
  if (!user) {
    throw new Error('Não autenticado.');
  }
  checkRole(user.role_name, [ROLES.TI, ROLES.RH, ROLES.PROFESSOR]);
  
  const rawData = await reportRepository.getStudentsPerProfessorRaw();

  // Agrupar os dados por professor
  const report = rawData.reduce((acc, row) => {
    const professorName = row.professor_nome;
    const aluno = { nome: row.aluno_nome, curso: row.curso_titulo };

    if (!acc[professorName]) {
      acc[professorName] = {
        professor_nome: professorName,
        total_alunos: 0,
        alunos: [],
        cursos: new Set()
      };
    }

    // Contar alunos únicos por professor
    const isNewStudent = !acc[professorName].alunos.some(a => a.nome === aluno.nome);
    if (isNewStudent) {
        acc[professorName].total_alunos += 1;
    }
    
    // Adicionar aluno e curso para exibição detalhada
    acc[professorName].alunos.push(aluno);
    acc[professorName].cursos.add(aluno.curso);

    return acc;
  }, {});

  // Converter o objeto agrupado em um array e formatar
  return Object.values(report).map(item => ({
    professor_nome: item.professor_nome,
    total_alunos: item.total_alunos,
    alunos: item.alunos.map(a => `${a.nome} (${a.curso})`).join('; '), // Lista de alunos formatada
    cursos: Array.from(item.cursos).join(', ')
  }));
}

module.exports = { 
  getCoursePerformanceReport,
  getEnrollmentStatusReport,
  getGradeDistributionReport,
  getCourseAveragesReport,
  getDetailedEnrollmentsReport,
  getTotalStudentsPerCourseReport,

  getStudentsPerProfessorReport
};