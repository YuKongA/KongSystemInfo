const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
    getDiskInfo: () => ipcRenderer.invoke('get-disk-info'),
    getSystemInfo: () => ipcRenderer.invoke('get-system-info'),
    getCpuLoad: () => ipcRenderer.invoke('get-cpu-load'),
    getSystemTheme: () => ipcRenderer.invoke('get-system-theme'),
    onThemeChange: (callback) => ipcRenderer.on('theme-changed', callback)
})

window.addEventListener('DOMContentLoaded', () => {
    const replaceText = (selector, text) => {
        const element = document.getElementById(selector)
        if (element) element.innerText = text
    }

    for (const dependency of ['chrome', 'node', 'electron']) {
        replaceText(`${dependency}-version`, process.versions[dependency])
    }
});
