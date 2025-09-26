const qrcode = require('qrcode')
const { ipcMain, dialog } = require('electron')
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

    setDataTransferProgressCallback((dataProgress) => {
        window.webContents.send('dataTransferProgress', dataProgress);
    });
}
module.exports = { setIpc };