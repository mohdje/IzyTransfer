const os = require('os');
const fs = require('fs').promises;
const path = require('path');

function getLANIP() {
    const interfaces = os.networkInterfaces();

    for (const [name, addrs] of Object.entries(interfaces)) {
        if (!name.includes("WSL")) {
            for (const addr of addrs) {
                if (addr.family === 'IPv4' && !addr.internal &&
                    (addr.address.startsWith('192.168.') ||
                        addr.address.startsWith('10.') ||
                        /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(addr.address))) {
                    return addr.address;
                }
            }
        }
    }

    return 'localhost';
}

async function getFiles(folderPath) {
    try {
        if (!folderPath) {
            return [];
        }

        const files = await fs.readdir(folderPath);
        const filesDetails = await Promise.all(files.map(async (filename) => {
            const filePath = path.join(folderPath, filename);
            const stats = await fs.stat(filePath);

            return {
                name: filename,
                size: stats.size,
                isDirectory: stats.isDirectory(),
                lastModified: stats.mtime
            };
        }));

        return filesDetails.filter(file => !file.isDirectory);
    } catch (error) {
        console.error('Error trying to read content of the folder dossier:', error);
        return [];
    }
}

module.exports = { getFiles, getLANIP };


