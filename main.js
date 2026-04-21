const { app, BrowserWindow, Menu, dialog, ipcMain, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const chokidar = require('chokidar');

let mainWindow;
let watcher;
let currentFile = null;

// ── Recent file history ──────────────────────────────────────────────────────
let historyPath;

function loadHistory() {
  try {
    return JSON.parse(fs.readFileSync(historyPath, 'utf-8'));
  } catch {
    return { md: [], mermaid: [] };
  }
}

function saveHistory(history) {
  try {
    fs.mkdirSync(path.dirname(historyPath), { recursive: true });
    fs.writeFileSync(historyPath, JSON.stringify(history));
  } catch (e) {
    console.error('Could not save history:', e);
  }
}

function addToHistory(filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const key = (ext === '.mmd' || ext === '.mermaid') ? 'mermaid' : 'md';
  const history = loadHistory();
  history[key] = [filePath, ...history[key].filter(p => p !== filePath)].slice(0, 20);
  saveHistory(history);
  return history;
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    titleBarStyle: 'hiddenInset',
    backgroundColor: '#1e1e2e',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, 'assets', 'icon.png'),
  });

  mainWindow.loadFile('index.html');

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function buildMenu() {
  const template = [
    {
      label: app.name,
      submenu: [
        { role: 'about' },
        { type: 'separator' },
        { role: 'hide' },
        { role: 'hideOthers' },
        { role: 'unhide' },
        { type: 'separator' },
        { role: 'quit' },
      ],
    },
    {
      label: 'File',
      submenu: [
        {
          label: 'Open File…',
          accelerator: 'CmdOrCtrl+O',
          click: openFileDialog,
        },
        { type: 'separator' },
        {
          label: 'Reload',
          accelerator: 'CmdOrCtrl+R',
          click: () => {
            if (currentFile) loadFile(currentFile);
          },
        },
        {
          label: 'Reveal in Finder',
          accelerator: 'CmdOrCtrl+Shift+R',
          click: () => {
            if (currentFile) shell.showItemInFolder(currentFile);
          },
        },
      ],
    },
    {
      label: 'View',
      submenu: [
        {
          label: 'Toggle Sidebar',
          accelerator: 'CmdOrCtrl+\\',
          click: () => mainWindow?.webContents.send('toggle-sidebar'),
        },
        {
          label: 'Toggle Source',
          accelerator: 'CmdOrCtrl+U',
          click: () => mainWindow?.webContents.send('toggle-source'),
        },
        { type: 'separator' },
        { type: 'separator' },
        { role: 'togglefullscreen' },
      ],
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'copy' },
        { role: 'selectAll' },
        { type: 'separator' },
        {
          label: 'Find',
          accelerator: 'CmdOrCtrl+F',
          click: () => mainWindow?.webContents.send('find'),
        },
      ],
    },
    {
      label: 'Window',
      submenu: [
        { role: 'minimize' },
        { role: 'zoom' },
        { type: 'separator' },
        { role: 'front' },
      ],
    },
  ];

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
}

async function openFileDialog() {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openFile'],
    filters: [
      { name: 'Markdown Files', extensions: ['md', 'markdown', 'mmd', 'mermaid'] },
      { name: 'All Files', extensions: ['*'] },
    ],
  });

  if (!result.canceled && result.filePaths.length > 0) {
    loadFile(result.filePaths[0]);
  }
}

function loadFile(filePath) {
  currentFile = filePath;

  // Stop previous watcher
  if (watcher) {
    watcher.close();
    watcher = null;
  }

  try {
    const content = fs.readFileSync(filePath, 'utf-8');

    // Scan sibling files for the file browser
    const dir = path.dirname(filePath);
    const EXTS = new Set(['.md', '.markdown', '.mmd', '.mermaid']);
    const siblings = fs.readdirSync(dir)
      .filter(f => EXTS.has(path.extname(f).toLowerCase()))
      .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
      .map(f => ({ name: f, filePath: path.join(dir, f) }));

    const history = addToHistory(filePath);

    mainWindow?.webContents.send('file-loaded', {
      content,
      filePath,
      fileName: path.basename(filePath),
      dirName: path.basename(dir),
      siblings,
      history,
    });

    app.addRecentDocument(filePath);

    // Watch for changes
    watcher = chokidar.watch(filePath, { ignoreInitial: true });
    watcher.on('change', () => {
      try {
        const updated = fs.readFileSync(filePath, 'utf-8');
        mainWindow?.webContents.send('file-changed', { content: updated, filePath });
      } catch (e) {
        console.error('Error reading file on change:', e);
      }
    });
  } catch (err) {
    dialog.showErrorBox('Error', `Could not open file:\n${err.message}`);
  }
}

// IPC handlers
ipcMain.handle('open-file-dialog', openFileDialog);

ipcMain.handle('open-folder-dialog', async () => {
  const result = await dialog.showOpenDialog(mainWindow, {
    properties: ['openDirectory'],
  });
  if (result.canceled || !result.filePaths.length) return null;
  const dir = result.filePaths[0];
  const EXTS = new Set(['.md', '.markdown', '.mmd', '.mermaid']);
  const files = fs.readdirSync(dir)
    .filter(f => EXTS.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { sensitivity: 'base' }))
    .map(f => ({ name: f, filePath: path.join(dir, f) }));
  return { dirName: path.basename(dir), siblings: files };
});

ipcMain.handle('open-path', (_event, filePath) => {
  loadFile(filePath);
});

ipcMain.handle('get-file-content', (_event, filePath) => {
  try {
    return { content: fs.readFileSync(filePath, 'utf-8'), filePath };
  } catch (e) {
    return { error: e.message };
  }
});

ipcMain.handle('get-history', () => loadHistory());

ipcMain.handle('save-file', async (_event, filePath, content) => {
  try {
    fs.writeFileSync(filePath, content, 'utf-8');
    return { success: true };
  } catch (e) {
    return { error: e.message };
  }
});

ipcMain.handle('save-file-as', async (_event, content, defaultName) => {
  const startDir = currentFile ? path.dirname(currentFile) : app.getPath('documents');
  const result = await dialog.showSaveDialog(mainWindow, {
    defaultPath: path.join(startDir, defaultName || 'untitled.md'),
    filters: [
      { name: 'Markdown',   extensions: ['md', 'markdown'] },
      { name: 'Mermaid',    extensions: ['mmd', 'mermaid'] },
      { name: 'All Files',  extensions: ['*'] },
    ],
  });
  if (result.canceled || !result.filePath) return { canceled: true };
  try {
    fs.writeFileSync(result.filePath, content, 'utf-8');
    loadFile(result.filePath);
    return { success: true, filePath: result.filePath };
  } catch (e) {
    return { error: e.message };
  }
});

ipcMain.on('set-title', (_event, title) => {
  mainWindow?.setTitle(title);
});

// Handle file opens from Finder / CLI
app.on('open-file', (event, filePath) => {
  event.preventDefault();
  if (mainWindow) {
    loadFile(filePath);
  } else {
    app.once('ready', () => loadFile(filePath));
  }
});

app.whenReady().then(() => {
  historyPath = path.join(app.getPath('userData'), 'history.json');
  createWindow();
  buildMenu();

  // Open file passed via command line (e.g. `electron . myfile.md`)
  const argv = process.argv.slice(app.isPackaged ? 1 : 2);
  const fileArg = argv.find(a => a.endsWith('.md') || a.endsWith('.markdown') || a.endsWith('.mmd') || a.endsWith('.mermaid'));
  if (fileArg) {
    const resolved = path.resolve(fileArg);
    mainWindow.webContents.once('did-finish-load', () => loadFile(resolved));
  }

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
  if (watcher) watcher.close();
});
