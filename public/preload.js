const { contextBridge, ipcRenderer } = require('electron');

let latest = '';
let openFile = function () {};

contextBridge.exposeInMainWorld('electron', {
  async updateScore(score) {
    latest = score;
  },
  onOpenFile(callback) {
    openFile = callback;
  },
});

ipcRenderer.on('get-file', () => {
  ipcRenderer.send('receive-file', latest);
});
ipcRenderer.on('open-file', (_, file) => {
  openFile(file);
});
