addEventListener('DOMContentLoaded', async () => {
    const desktopPath = await window.electronAPI.getDefaultFolderPath();
    updateSelectedFolderPath(desktopPath);

    const qrCodeDataURL = await window.electronAPI.getQRCode();
    if (qrCodeDataURL) {
        const qrCodeImage = document.getElementById('qrCodeImage');
        qrCodeImage.src = qrCodeDataURL;
        document.getElementById('qrCodeContainer').style.display = 'flex';
    }

    window.electronAPI.onDataTransferProgress((dataProgress) => {
        updateDataTransferProgress(dataProgress);
    });
});

async function selectFolder() {
    const folderPath = await window.electronAPI.selectFolder();
    if (folderPath) {
        updateSelectedFolderPath(folderPath);
    }
}

function cancelTransfer() {
    window.electronAPI.cancelDataTransfer();
}

function updateSelectedFolderPath(path) {
    const selectedFolderPath = document.getElementById('selectedFolderPath');
    selectedFolderPath.textContent = path;

    const selectedFolderElement = document.getElementById('selectedFolderContainer');
    selectedFolderElement.style.display = 'flex';
}

function updateDataTransferProgress(dataProgress) {
    const transferInfoContainer = document.getElementById('transferInfoContainer');

    if (dataProgress.canceled) {
        transferInfoContainer.classList.remove('visible');
        return;
    }

    transferInfoContainer.classList.add('visible');

    const deviceInfo = `${dataProgress.deviceType.toLowerCase()}_${dataProgress.deviceOs.toLowerCase()}`;
    const supportedDevices = ['desktop_windows', 'desktop_apple', 'desktop_linux', 'tablet_apple', 'tablet_android', 'mobile_apple', 'mobile_android'];
    const displayDeviceInfoImage = supportedDevices.includes(deviceInfo);

    const deviceInfoImage = document.getElementById('deviceInfoImage');
    deviceInfoImage.style.display = displayDeviceInfoImage ? 'block' : 'none';
    deviceInfoImage.src = `./assets/${deviceInfo}.svg`;

    const defaultTransferImage = document.getElementById('defaultTransferImage');
    defaultTransferImage.style.display = displayDeviceInfoImage ? 'none' : 'block';

    const transferInfoMessage = document.getElementById('transferInfoMessage');
    transferInfoMessage.innerText = `Transfer in progress: ${dataProgress.fileIndex} on ${dataProgress.totalFiles} files (${dataProgress.percentage}%)`;

    const progressBar = document.getElementById('progressBar');
    progressBar.style.width = `${dataProgress.percentage}%`;
    if (dataProgress.percentage === 100 && dataProgress.fileIndex === dataProgress.totalFiles) {
        progressBar.classList.add('complete');
        setTimeout(() => {
            transferInfoContainer.classList.remove('visible');
            progressBar.classList.remove('complete');
        }, 2000);
    }
}
