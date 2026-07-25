const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('desktopPet', {
  setPaused: (paused) => ipcRenderer.send('pet:set-paused', paused),
  onDirection: (listener) => {
    ipcRenderer.on('pet:direction', (_event, direction) => listener(direction));
  },
  onPaused: (listener) => {
    ipcRenderer.on('pet:paused', (_event, paused) => listener(paused));
  },
});
