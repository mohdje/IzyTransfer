const selectedFiles = [];

async function getAvailableFilesToDownload() {
    const containerId = 'downloadContent';
    showModal('Loading files...');
    clearContent(containerId);

    const result = await fetch('/files');

    if (result.ok) {
        const files = await result.json();
        displayFilesList(files, containerId, true);
    }
    hideModal();
}

async function downloadFiles() {
    if (selectedFiles.length === 0) return;
    let errorOccurred = false;

    try {
        showModal(`Downloading ${selectedFiles.length} file(s)...`);

        let fileIndex = 0;
        const totalFiles = selectedFiles.length;
        const deviceInfo = getDeviceInfo();
        const transferId = generateUniqueId();
        for (const fileName of selectedFiles) {
            try {
                fileIndex++;
                const response = await fetch(`/download/${encodeURIComponent(fileName)}?fileIndex=${fileIndex}&totalFiles=${totalFiles}&deviceType=${deviceInfo.type}&deviceOs=${deviceInfo.os}&transferId=${transferId}`);
                if (!response.ok) {
                    errorOccurred = true;
                    break;
                }

                const blob = await response.blob();
                saveViaBlob(blob, fileName);

            } catch (error) {
                console.error(`Error processing ${fileName}:`, error);
                errorOccurred = true;
                break;
            }
        }

        const checkboxes = document.querySelectorAll('#downloadContent input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = false;
            checkbox.dispatchEvent(new Event('change'));
        });

    } catch (error) {
        console.error('Error occured:', error);
        errorOccurred = true;
    } finally {
        hideModal();
        if (errorOccurred) {
            showToast('Downloading of files aborted. Try again later.');
        } else {
            showToast('All files downloaded successfully.');
        }
    }
}


async function sendFiles() {
    if (selectedFiles.length === 0) return;

    let errorOccurred = false;
    try {
        showModal(`Sending ${selectedFiles.length} file(s)...`);
        let fileIndex = 0;
        const totalFiles = selectedFiles.length;
        const deviceInfo = getDeviceInfo();
        const transferId = generateUniqueId();

        for (const file of selectedFiles) {
            fileIndex++;
            try {
                const response = await fetch(`/upload/${encodeURIComponent(file.name)}?fileIndex=${fileIndex}&totalFiles=${totalFiles}&deviceType=${deviceInfo.type}&deviceOs=${deviceInfo.os}&transferId=${transferId}`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/octet-stream',
                        'Content-Length': file.size.toString()
                    },
                    body: file
                });

                if (!response.ok) {
                    errorOccurred = true;
                    break;
                }

            } catch (error) {
                errorOccurred = true;
                console.error(`Error processing ${file.name}:`, error);
                break;
            }
        }

    } catch (error) {
        console.error('Error during upload:', error);
        errorOccurred = true;
    } finally {
        hideModal();
        if (errorOccurred) {
            showToast('Sending of files aborted. Try again later.');
        } else {
            showToast('All files sent successfully.');
        }
    }
}
