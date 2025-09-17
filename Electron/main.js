const { app, BrowserWindow } = require('electron')

const CreateWindow = () => {
    const win = new BrowserWindow({
        width: 1200,
        height: 800,
        webPreferences: {
            nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false
        }
    })
    win.loadFile('userPage.html')
}

app.whenReady().then(() => {
    CreateWindow()
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit()
    }
})
