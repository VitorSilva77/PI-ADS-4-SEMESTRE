const { app, BrowserWindow, ipcMain, contextBridge } = require('electron');
const path = require('path');
const audit = require('./AuditLogger.js');

let userSession = null;

const CreateWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            nodeIntegration: false, 
            contextIsolation: true, 
            webSecurity: true 
        }
    })
    win.loadFile('index.html')
}

app.whenReady().then(() => {
    CreateWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})


ipcMain.handle('login', async (event, credentials) => {

    const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
    });
    const data = await response.json();
    if (data.success) {
        userSession = data.user; 
    }
    return data;
});

ipcMain.on('logout', () => {
    userSession = null;
});

ipcMain.handle('get-user-session', () => {

    if (userSession) {
        return {
            nome: userSession.nome,
            tipo_usuario: userSession.tipo_usuario,
            permissions: userSession.permissions
        };
    }
    return null;
});

ipcMain.handle('get-courses', async (event) => {

  if (!userSession || !userSession.permissions.includes('viewAllCourses')) {
    return { success: false, message: 'Acesso negado.' };

  }


  let allCourses = [
    { id: 'CS101', name: 'Introdução à Computação', professorId: 'user123' },
    { id: 'MA202', name: 'Cálculo Avançado', professorId: 'user456' },
    { id: 'PH303', name: 'Física Quântica', professorId: 'user123' },
  ];

 
  let coursesForUser;
  if (userSession.tipo_usuario === 'Professor') {
    coursesForUser = allCourses.filter(course => course.professorId === userSession.id);
  } else {
    
    coursesForUser = allCourses;
  }
  
  
  const courseIds = coursesForUser.map(c => c.id);
  audit.dataViewedCourses(userSession.id, userSession.tipo_usuario, courseIds);

  return coursesForUser;
});


ipcMain.on('create-user', (event, newUser) => {

    if (!userSession || !userSession.permissions.includes('manageUsers')) {
        console.log(`Tentativa de criar usuário sem permissão.`);
        return; 
    }


    console.log(`Usuário ${userSession.id} criando novo usuário...`);
    const createdUser = { id: 'newUser789', ...newUser }; 

    audit.userCreated(userSession.id, userSession.tipo_usuario, createdUser);
});
