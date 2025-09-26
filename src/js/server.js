const express = require('express');
const path = require('path');
const fs = require('fs').promises;
const fsSync = require('fs');

const { getFiles, getLANIP } = require('./helpers');

let serverInstance = null;
let dataTransferProgressCallback = null;
let currentTransferId = undefined;
let abortTransfer = false;

function createServer(staticFolderPath) {
    const app = express();
    const PORT = 3000;

    useStaticRoute(app);
    addGetFilesRoute(app);
    addDownloadFileRoute(app);
    addUploadFileRoute(app);

    serverInstance = app.listen(PORT, () => {
        const lanIP = getLANIP();
        serverInstance.pageUrl = `http://${lanIP}:${PORT}/index.html`;
    });

    serverInstance.folderPath = staticFolderPath || null;
}

function closeServer() {
    if (serverInstance) {
        serverInstance.close()
    }
}

function getStaticFolderPath() {
    if (serverInstance && serverInstance.folderPath) {
        return serverInstance.folderPath;
    }
    return null;
}

function setStaticFolderPath(folderPath) {
    if (serverInstance) {
        serverInstance.folderPath = folderPath;
    }
    return null;
}

function getClientPageUrl() {
    if (serverInstance) {
        return serverInstance.pageUrl;
    }
    return null;
}

function setDataTransferProgressCallback(callback) {
    dataTransferProgressCallback = callback;
}

function cancelDataTransfer() {
    abortTransfer = true;
}

module.exports = {
    createServer,
    closeServer,
    getStaticFolderPath,
    setStaticFolderPath,
    getClientPageUrl,
    setDataTransferProgressCallback,
    cancelDataTransfer
};

function useStaticRoute(app) {
    app.use(express.static(path.join(__dirname, '..', 'client')));
}

function addGetFilesRoute(app) {
    app.get('/files', async (_, res) => {
        const files = await getFiles(serverInstance.folderPath);
        return res.status(200).json(files);
    });
}

function addDownloadFileRoute(app) {
    app.get('/download/:filename', async (req, res) => {
        try {
            if (!serverInstance.folderPath) {
                return res.status(400).json({ error: 'No selected folder' });
            }

            const { filePath, transferId, filename, fileIndex, totalFiles, deviceType, deviceOs } = getQueryParams(req);

            if (!filePath.startsWith(serverInstance.folderPath)) {
                return res.status(404).json({ error: 'File does not exist' })
            }

            try {
                await fs.access(filePath);
            } catch {
                return res.status(404).json({ error: 'File does not exist' })
            }

            if (currentTransferId === undefined)
                currentTransferId = transferId;
            else if (currentTransferId !== transferId)
                return res.status(409).end();

            const stat = await fs.stat(filePath);
            const fileSize = stat.size;
            let bytesTransferred = 0;

            res.setHeader('Content-Length', fileSize);
            res.setHeader('Content-Type', 'application/octet-stream');
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

            const fileStream = fsSync.createReadStream(filePath);
            fileStream.on('data', (chunk) => {
                if (abortTransfer) {
                    fileStream.destroy(499);
                }
                else {
                    bytesTransferred += chunk.length;
                    onDataReceived(bytesTransferred, fileSize, fileIndex, totalFiles, deviceType, deviceOs);
                }
            });
            fileStream.on('error', (error) => {
                if (error === 499) {
                    res.status(499).end();
                    onTransferCanceled();
                }
                else {
                    console.error('Error streaming file:', error);
                    res.status(500).end();
                }
            });
            fileStream.pipe(res);

        } catch (error) {
            console.error('An error occured:', error);
            res.status(500).end();
        }
    });
}

function addUploadFileRoute(app) {
    app.use('/upload:filename', express.raw({
        type: '*/*',
        limit: '5gb'
    }));

    app.post('/upload/:filename', async (req, res) => {
        try {
            if (!serverInstance.folderPath) {
                return res.status(400).json({ error: 'No destination folder selected' });
            }

            const { filePath, transferId, filename, fileIndex, totalFiles, deviceType, deviceOs } = getQueryParams(req);
            const fileSize = parseInt(req.headers['content-length']);

            if (!filePath.startsWith(serverInstance.folderPath)) {
                return res.status(403).json({ error: 'Invalid destination path' });
            }

            if (currentTransferId === undefined)
                currentTransferId = transferId;
            else if (currentTransferId !== transferId)
                req.destroy();

            const writeStream = fsSync.createWriteStream(filePath);
            let bytesReceived = 0;

            req.on('data', (chunk) => {
                bytesReceived += chunk.length;
                onDataReceived(bytesReceived, fileSize, fileIndex, totalFiles, deviceType, deviceOs);
                writeStream.write(chunk, () => {
                    //wait for the chunk to be written before checking for abort, otherwise destroy will throw an error
                    if (abortTransfer) {
                        req.destroy();
                        writeStream.destroy();
                        onTransferCanceled();
                    }
                });
            });

            req.on('end', () => {
                writeStream.end();
                res.status(200).json({ message: 'File uploaded successfully' });
            });

            writeStream.on('error', (error) => {
                console.error('Write stream error:', error);
                res.status(500).json({ error: 'Failed to write file' });
            });

        } catch (error) {
            console.error('Upload error:', error);
            res.status(500).json({ error: 'Failed to upload file' });
        }
    });
}

function getQueryParams(req) {
    const filename = decodeURIComponent(req.params.filename);
    const filePath = path.join(serverInstance.folderPath, filename);
    const fileIndex = parseInt(req.query.fileIndex) || 1;
    const totalFiles = parseInt(req.query.totalFiles) || 1;
    const deviceType = req.query.deviceType || null;
    const deviceOs = req.query.deviceOs || null;
    const transferId = req.query.transferId || null;
    return { filePath, transferId, filename, fileIndex, totalFiles, deviceType, deviceOs };
}


function onDataReceived(bytesTransferred, fileSize, fileIndex, totalFiles, deviceType, deviceOs) {
    const progress = (bytesTransferred / fileSize) * 100;
    if (dataTransferProgressCallback) {
        dataTransferProgressCallback({
            percentage: Math.round(progress),
            fileIndex,
            totalFiles,
            deviceType,
            deviceOs,
        });
    }

    if (progress === 100 && fileIndex === totalFiles) {
        currentTransferId = undefined;
    }
}

function onTransferCanceled() {
    if (dataTransferProgressCallback) {
        abortTransfer = false;
        currentTransferId = undefined;
        dataTransferProgressCallback({ canceled: true });
    }
}