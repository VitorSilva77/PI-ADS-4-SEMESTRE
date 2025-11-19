require('dotenv').config();

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');


const dbConnection = require('./database/connection');
const authController = require('./controllers/authController');
const courseController = require('./controllers/courseController');
const userController = require('./controllers/userController'); 
const reportController = require('./controllers/reportController'); 
const enrollmentController = require('./controllers/enrollmentController');

function registerIpcHandlers() {
  // Autenticação
  ipcMain.handle('auth:login', authController.handleLogin);
  ipcMain.handle('auth:logout', authController.handleLogout);
  ipcMain.handle('auth:restore-session', authController.handleRestoreSession);
  

  // Cursos
  ipcMain.handle('courses:get-all', courseController.handleGetAllCourses);
  ipcMain.handle('courses:getByProfessor', courseController.getCoursesByProfessor);
  ipcMain.handle('courses:create', courseController.handleCreateCourse);

  // Usuários 
  ipcMain.handle('users:create', userController.handleCreateUser);
  ipcMain.handle('users:get-all', userController.handleGetAllUsers);    
  ipcMain.handle('users:get-by-id', userController.handleGetUserById);  
  ipcMain.handle('users:update', userController.handleUpdateUser);    
  ipcMain.handle('users:delete', userController.handleDeleteUser);
  ipcMain.handle('users:get-available-students', userController.handleGetAvailableStudents);

  // Relatórios 
  ipcMain.handle('reports:course-performance', reportController.handleGetCoursePerformance);
  ipcMain.handle('reports:enrollment-status', reportController.handleGetEnrollmentStatus);
  ipcMain.handle('reports:grade-distribution', reportController.handleGetGradeDistribution);
  ipcMain.handle('reports:course-averages', reportController.handleGetCourseAverages);
  ipcMain.handle('reports:detailed-enrollments', reportController.handleGetDetailedEnrollments);
  ipcMain.handle('reports:total-students-per-course', reportController.handleGetTotalStudentsPerCourse);

  ipcMain.handle('reports:students-per-professor', reportController.handleGetStudentsPerProfessor);

  // Matrículas 
  ipcMain.handle('enrollments:create', enrollmentController.handleCreateEnrollment);
  ipcMain.handle('enrollments:get-by-course', enrollmentController.handleGetEnrollmentsByCourse);
  ipcMain.handle('enrollments:update-grade', enrollmentController.handleUpdateEnrollmentGrade);
}

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      preload: path.join(__dirname, '../preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '../renderer/views/index.html'));
  
  mainWindow.webContents.openDevTools();
}

// Ciclo de vida da aplicação
app.whenReady().then(() => {
  dbConnection.init();

  registerIpcHandlers();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});