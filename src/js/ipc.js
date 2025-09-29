const qrcode = require('qrcode')
const { ipcMain, dialog, shell } = require('electron')
const { getStaticFolderPath, setStaticFolderPath, getClientPageUrl, setDataTransferProgressCallback, cancelDataTransfer } = require('./server')

function setIpc(window) {
    ipcMain.handle('dialog:openFolder', async () => {
        const result = await dialog.showOpenDialog({
            properties: ['openDirectory']
        })
        if (!result.canceled) {
            const folderPath = result.filePaths[0];
            setStaticFolderPath(folderPath);
            return folderPath
        }
        else
            return null
    });

    ipcMain.handle('getDefaultFolderPath', () => {
        return getStaticFolderPath();
    });

    ipcMain.handle('generateQrCode', async () => {
        return await qrcode.toDataURL(getClientPageUrl())
    });

    ipcMain.handle('cancelDataTransfer', () => {
        cancelDataTransfer();
    });

    ipcMain.handle('openFolder', async (_event, path) => {
        await shell.openPath(path);
    });

    ipcMain.handle('getServerUrl', () => {
        return getClientPageUrl();
    });

    setDataTransferProgressCallback((dataProgress) => {
        window.webContents.send('dataTransferProgress', dataProgress);
    });
}
module.exports = { setIpc };