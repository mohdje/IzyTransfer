const { app, BrowserWindow, ipcMain } = require('electron')
const path = require('path')
const { createServer, closeServer } = require('./server')
const { setIpc } = require('./ipc')

try {
    require('electron-reloader')(module, {
        debug: true,
        watchRenderer: true
    });
} catch (err) {
    console.log('Error: ', err);
}

function createWindow() {
    let iconPath;
    if (process.platform === 'darwin') {
        iconPath = path.join(__dirname, '..', 'assets', 'logo.icns');
    }
    else {
        iconPath = path.join(__dirname, '..', 'assets', 'logo.ico');
    }

    const win = new BrowserWindow({
        width: 600,
        height: 500,
        resizable: false,
        autoHideMenuBar: true,
        title: 'Izy Transfer',
        icon: iconPath,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            preload: path.join(__dirname, 'preload.js')
        }
    })

    win.loadFile(path.join(__dirname, '..', 'index.html'))

    setIpc(win);
}

app.whenReady().then(() => {
    createServer(app.getPath('desktop'));

    createWindow()
    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow()
        }
    })
})

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        closeServer();
        app.quit()
    }
})
