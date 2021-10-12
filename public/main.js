const {
  app,
  BrowserWindow,
  globalShortcut,
  ipcMain,
  shell,
  dialog,
  Menu,
} = require('electron');
const fs = require('fs');
const path = require('path');

app.name = 'PipeScore';

const isMac = process.platform === 'darwin';
let win;
function createWindow() {
  win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  globalShortcut.register('f5', function () {
    win.reload();
  });

  win.loadFile('public/pipescore.html');
}

let currentFileName = null;
async function openFile() {
  const f = await dialog.showOpenDialog({ properties: ['openFile'] });
  const file = f.filePaths[0];
  if (file) {
    app.addRecentDocument(file);
    fs.readFile(file, 'utf8', function (err, contents) {
      if (!err) {
        win.webContents.send('open-file', contents);
      }
    });
  }
}
async function saveAsFile() {
  win.webContents.send('get-file');
  ipcMain.once('receive-file', async (_, score) => {
    const { filePath } = await dialog.showSaveDialog({
      title: 'my_tune.pipescore',
    });
    if (filePath) {
      currentFileName = filePath;
      fs.writeFile(currentFileName, score, (err) => {
        console.error(err);
      });
    }
  });
}
async function saveFile() {
  if (currentFileName) {
    win.webContents.send('get-file');
    ipcMain.once('receive-file', (_, score) => {
      fs.writeFile(currentFileName, score, (err) => {
        console.error(err);
      });
    });
  } else {
    saveAsFile();
  }
}

app.applicationMenu = Menu.buildFromTemplate([
  ...(isMac
    ? [
        {
          label: app.name,
          submenu: [
            { role: 'hide' },
            { role: 'hideOthers' },
            { role: 'unhide' },
            { type: 'separator' },
            { role: 'quit' },
          ],
        },
      ]
    : []),
  {
    label: 'File',
    submenu: [
      {
        label: 'Open',
        accelerator: 'Ctrl+O',
        click: openFile,
      },
      {
        label: 'Save as',
        accelerator: 'Ctrl+Shift+S',
        click: saveAsFile,
      },
      {
        label: 'Save',
        accelerator: 'Ctrl+S',
        click: saveFile,
      },
    ],
  },
  { role: 'editMenu' },
  { label: 'Advanced', submenu: [{ role: 'toggleDevTools' }] },
  {
    label: 'Help',
    submenu: [
      {
        label: 'View online help',
        accelerator: 'Ctrl+H',
        click() {
          shell.openExternal('https://pipescore.web.app/docs');
        },
      },
    ],
  },
]);

app.whenReady().then(() => {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (!isMac) app.quit();
});
