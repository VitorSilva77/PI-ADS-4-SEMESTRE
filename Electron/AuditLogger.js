const fs = require('fs');
const path = require('path');

const logFilePath = path.join(__dirname, 'audit.log'); 

/**
 * @param {object} logData
 * @param {string} logData.level 
 * @param {string} logData.userId
 * @param {string} logData.role 
 * @param {string} logData.action 
 * @param {string} [logData.target] 
 * @param {object} [logData.details] 
 */
function log(logData) {
  const timestamp = new Date().toISOString();
  const detailsString = logData.details ? JSON.stringify(logData.details) : '{}';
  
  const logEntry = `${timestamp} | Level: 'AUDIT' | UserID: '${logData.userId}' | Role: '${logData.role}' | Action: '${logData.action}' | Target: '${logData.target || 'N/A'}' | Details: ${detailsString}\n`;

  try {
    fs.appendFileSync(logFilePath, logEntry);
  } catch (error) {
    console.error('Falha ao escrever no log de auditoria:', error);
  }
}

const audit = {
    loginSuccess: (userId, role) => log({ userId, role, action: 'LOGIN_SUCCESS' }),
    loginFailure: (username) => log({ userId: 'anonymous', role: 'N/A', action: 'LOGIN_FAILURE', details: { attemptedUser: username } }),
    userCreated: (creatorId, creatorRole, createdUser) => log({ userId: creatorId, role: creatorRole, action: 'USER_CREATED', target: createdUser.id, details: { newRole: createdUser.role } }),
    courseCreated: (creatorId, creatorRole, courseId) => log({ userId: creatorId, role: creatorRole, action: 'COURSE_CREATED', target: courseId }),
    professorAssigned: (assignerId, assignerRole, professorId, courseId) => log({ userId: assignerId, role: assignerRole, action: 'PROFESSOR_ASSIGNED', target: courseId, details: { professorId } }),
    dataViewedCourses: (viewerId, viewerRole, courseIds) => log({ userId: viewerId, role: viewerRole, action: 'DATA_VIEWED_COURSES', details: { viewed: courseIds } }),
};

module.exports = audit;