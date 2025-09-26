function formatFileSize(bytes) {
    if (bytes === 0) return '0 B';

    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    const k = 1024;
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    const size = (bytes / Math.pow(k, i));
    const formattedSize = size >= 10 ? Math.round(size) : Number(size.toFixed(1));

    return `${formattedSize} ${units[i]}`;
}

function saveViaBlob(content, filename) {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

function getDeviceInfo() {
    const deviceInfo = {};

    const userAgent = navigator.userAgent.toLowerCase();

    if (/mobile/i.test(userAgent)) {
        deviceInfo.type = "mobile";
    } else if (/tablet|ipad/i.test(userAgent)) {
        deviceInfo.type = "tablet";
    } else {
        deviceInfo.type = "desktop";
    }

    if (navigator.userAgent.indexOf("Win") != -1) deviceInfo.os = "windows";
    else if (navigator.userAgent.indexOf("Mac") != -1) deviceInfo.os = "apple";
    else if (/android/i.test(userAgent)) deviceInfo.os = "android";
    else if (/(iPhone|iPad|iPod)/.test(navigator.userAgent)) deviceInfo.os = "apple";
    else if (navigator.userAgent.indexOf("Linux") != -1) deviceInfo.os = "linux";

    return deviceInfo;
}

function generateUniqueId() {
    return Date.now().toString(36) + Math.random().toString(36).substring(2);
}