document.addEventListener('DOMContentLoaded', () => {
    const downloadSwitch = document.getElementById('downloadSwitch');
    const sendSwitch = document.getElementById('sendSwitch');
    const downloadContent = document.getElementById('downloadContent');
    const sendContent = document.getElementById('sendContent');
    const selectFilesBtn = document.getElementById('selectFilesBtn');
    const fileInput = document.getElementById('fileInput');

    sendContent.style.display = 'flex';

    downloadSwitch.addEventListener('click', () => {
        downloadSwitch.classList.add('active');
        sendSwitch.classList.remove('active');

        downloadContent.style.display = 'flex';
        sendContent.style.display = 'none';

        getAvailableFilesToDownload();
    });
    sendSwitch.addEventListener('click', () => {
        sendSwitch.classList.add('active');
        downloadSwitch.classList.remove('active');

        downloadContent.style.display = 'none';
        sendContent.style.display = 'flex';

        clearContent('sendContent');
    });

    selectFilesBtn.addEventListener('click', () => {
        fileInput.click();
    });

    fileInput.addEventListener('change', (event) => {
        const files = Array.from(event.target.files);
        if (files.length > 0) {
            clearContent('sendContent');
            selectedFiles.splice(0, selectedFiles.length, ...files);
            displayFilesList(selectedFiles, 'sendContent', false);
            const bottomAction = document.querySelector(`#sendContent .bottom-action`);
            bottomAction.classList.add('visible');
        }
    });
});


function clearContent(containerId) {
    const container = document.getElementById(containerId);
    const existingFiles = container.querySelectorAll('.file');
    existingFiles.forEach(element => element.remove());

    const bottomAction = document.querySelector(`#${containerId} .bottom-action`);
    bottomAction.classList.remove('visible');

    selectedFiles.splice(0, selectedFiles.length);
}

function displayFilesList(files, containerId, selectable) {
    for (const file of files) {
        const fileElement = document.createElement('div');
        fileElement.classList.add('file');

        const fileInfo = document.createElement('div');
        fileInfo.classList.add('file-info');

        const fileName = document.createElement('h4');
        fileName.textContent = file.name;

        const fileSize = document.createElement('p');
        fileSize.textContent = typeof file.size === 'number' ? formatFileSize(file.size) : file.size;

        fileInfo.appendChild(fileName);
        fileInfo.appendChild(fileSize);

        fileElement.appendChild(fileInfo);

        if (selectable) {
            const checkBox = document.createElement('input');
            checkBox.type = 'checkbox';
            checkBox.addEventListener('change', (event) => {
                const bottomAction = document.querySelector(`#${containerId} .bottom-action`);

                if (event.target.checked) {
                    selectedFiles.push(file.name);
                }
                else {
                    selectedFiles.splice(selectedFiles.indexOf(file.name), 1);
                }

                if (selectedFiles.length === 0) {
                    bottomAction.classList.remove('visible');
                }
                else {
                    bottomAction.classList.add('visible');
                }
            });
            fileElement.insertBefore(checkBox, fileInfo);
        }

        document.getElementById(containerId).appendChild(fileElement);
    }
}


function showModal(text) {
    const modal = document.getElementById('modal');
    modal.style.opacity = '1';
    modal.style.visibility = 'visible';

    modal.getElementsByTagName('h3')[0].textContent = text;
}

function hideModal() {
    const modal = document.getElementById('modal');
    modal.style.opacity = '0';
    modal.style.visibility = 'hidden';
}

function showToast(message) {
    const toast = document.getElementById('toastMessage');
    toast.getElementsByTagName('p')[0].textContent = message;
    toast.classList.add('visible');
    setTimeout(() => {
        toast.classList.remove('visible');
    }, 3000);
}

