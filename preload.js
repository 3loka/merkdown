const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  openFileDialog: () => ipcRenderer.invoke('open-file-dialog'),
  openFolderDialog: () => ipcRenderer.invoke('open-folder-dialog'),
  openPath: (filePath) => ipcRenderer.invoke('open-path', filePath),
  getFileContent: (filePath) => ipcRenderer.invoke('get-file-content', filePath),
  getHistory: () => ipcRenderer.invoke('get-history'),
  saveFile: (filePath, content) => ipcRenderer.invoke('save-file', filePath, content),
  saveFileAs: (content, defaultName) => ipcRenderer.invoke('save-file-as', content, defaultName),
  setTitle: (title) => ipcRenderer.send('set-title', title),

  onFileLoaded: (callback) => ipcRenderer.on('file-loaded', (_e, data) => callback(data)),
  onFileChanged: (callback) => ipcRenderer.on('file-changed', (_e, data) => callback(data)),
  onToggleSidebar: (callback) => ipcRenderer.on('toggle-sidebar', () => callback()),
  onToggleSource: (callback) => ipcRenderer.on('toggle-source', () => callback()),
  onFind: (callback) => ipcRenderer.on('find', () => callback()),
});
