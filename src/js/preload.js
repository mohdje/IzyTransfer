const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    selectFolder: () => ipcRenderer.invoke('dialog:openFolder'),
    getQRCode: () => ipcRenderer.invoke('generateQrCode'),
    getServerUrl: () => ipcRenderer.invoke('getServerUrl'),
    getDefaultFolderPath: () => ipcRenderer.invoke('getDefaultFolderPath'),
    onDataTransferProgress: (callback) => ipcRenderer.on('dataTransferProgress', (_event, value) => callback(value)),
    cancelDataTransfer: () => ipcRenderer.invoke('cancelDataTransfer'),
    openFolder: (path) => ipcRenderer.invoke('openFolder', path)
})
