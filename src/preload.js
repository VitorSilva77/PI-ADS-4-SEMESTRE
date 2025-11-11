const { contextBridge, ipcRenderer } = require('electron');

const apiKey = 'api';

const api = {

  /**
   * Restaura a sessão no main process
   * @param {object} user 
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  restoreSession: (user) => ipcRenderer.invoke('auth:restore-session', user),

  /**
   * Tenta fazer login 
   * @param {object} credentials 
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
  login: (credentials) => ipcRenderer.invoke('auth:login', credentials),

  /**
   * Faz logout do sistema.
   * @returns {Promise<{success: boolean, error?: string}>}
   */
  logout: () => ipcRenderer.invoke('auth:logout'),

  /**
   * Verifica se há uma sessão de usuário ativa 
   * @returns {Promise<{success: boolean, user?: object, error?: string}>}
   */
 

  //cursos
  /**
   * Busca todos os cursos.
   * @returns {Promise<{success: boolean, data?: object[], error?: string}>}
   */
  getAllCourses: () => ipcRenderer.invoke('courses:get-all'),
  getCoursesByProfessor: (professorId) => ipcRenderer.invoke('courses:getByProfessor', professorId),

  /**
   * Cria um novo curso
   * @param {object} courseData - { titulo, descricao, carga_horaria, professor_id }
   * @returns {Promise<{success: boolean, data?: object, error?: string}>}
   */
  createCourse: (courseData) => ipcRenderer.invoke('courses:create', courseData),
  
  //usuários
  createUser: (userData) => ipcRenderer.invoke('users:create', userData),
  getAllUsers: () => ipcRenderer.invoke('users:get-all'), 
  getUserById: (id) => ipcRenderer.invoke('users:get-by-id', id), 
  updateUser: (id, userData) => ipcRenderer.invoke('users:update', id, userData), 
  deleteUser: (id) => ipcRenderer.invoke('users:delete', id), 

  //relatórios
  getCoursePerformanceReport: (courseId) => ipcRenderer.invoke('reports:course-performance', courseId),
  getEnrollmentStatusReport: (courseId) => ipcRenderer.invoke('reports:enrollment-status', courseId),
  getGradeDistributionReport: (courseId) => ipcRenderer.invoke('reports:grade-distribution', courseId),
  getCourseAveragesReport: () => ipcRenderer.invoke('reports:course-averages'),
  getDetailedEnrollmentsReport: () => ipcRenderer.invoke('reports:detailed-enrollments'),
  getTotalStudentsPerCourseReport: () => ipcRenderer.invoke('reports:total-students-per-course'),

  getStudentsPerProfessorReport: () => ipcRenderer.invoke('reports:students-per-professor'),
  //auditoria
  getAuditLogs: () => ipcRenderer.invoke('audit:get-logs'),
  
};

try {
  contextBridge.exposeInMainWorld(apiKey, api);
} catch (error) {
  console.error('Falha ao expor a API do preload:', error);
}