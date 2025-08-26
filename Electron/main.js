const { app, BrowserWindow } = require('electron')

const CreateWindow = () => {
    const win = new BrowserWindow({
        width: 800,
        height: 800
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
