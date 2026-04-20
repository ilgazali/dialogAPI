const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronDialog', {
  // App utilities
  getHomePath: () => ipcRenderer.invoke('app:getHomePath'),

  // Open
  showOpenDialog: (options) => ipcRenderer.invoke('dialog:showOpenDialog', options),
  showOpenDialogSync: (options) => ipcRenderer.invoke('dialog:showOpenDialogSync', options),

  // Save
  showSaveDialog: (options) => ipcRenderer.invoke('dialog:showSaveDialog', options),
  showSaveDialogSync: (options) => ipcRenderer.invoke('dialog:showSaveDialogSync', options),

  // Message Box
  showMessageBox: (options) => ipcRenderer.invoke('dialog:showMessageBox', options),
  showMessageBoxAbortable: () => ipcRenderer.invoke('dialog:showMessageBoxAbortable'),
  showMessageBoxSync: (options) => ipcRenderer.invoke('dialog:showMessageBoxSync', options),

  // Error Box
  showErrorBox: (title, content) => ipcRenderer.invoke('dialog:showErrorBox', title, content),

  // Certificate Trust
  showCertificateTrustDialog: () => ipcRenderer.invoke('dialog:showCertificateTrustDialog'),
});
