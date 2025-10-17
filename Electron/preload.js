const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('auth', {
    login: (credentials) => ipcRenderer.invoke('login', credentials),
    logout: () => ipcRenderer.send('logout'),
    getUserSession: () => ipcRenderer.invoke('get-user-session')
});

contextBridge.exposeInMainWorld('api', {
  
  getCourses: () => ipcRenderer.invoke('get-courses'),
  createUser: (userData) => ipcRenderer.send('create-user', userData),
  
});