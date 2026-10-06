import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'node:path';

let mainWindow: BrowserWindow | null = null;

const DEFAULT_SECONDS = 10;

const getSecondsFromArgs = (): number | undefined => {
  const flagPrefix = '--seconds=';
  const raw = process.argv.find(arg => arg.startsWith(flagPrefix));
  if (!raw) return undefined;
  const value = Number(raw.slice(flagPrefix.length));
  if (!Number.isFinite(value)) return undefined;
  return Math.max(1, Math.floor(value));
};

const getSeconds = (): number => {
  const fromArgs = getSecondsFromArgs();
  if (typeof fromArgs === 'number') return fromArgs;

  const rawEnv = process.env.TIMEBOMB_SECONDS;
  if (rawEnv) {
    const value = Number(rawEnv);
    if (Number.isFinite(value)) return Math.max(1, Math.floor(value));
  }

  return DEFAULT_SECONDS;
};

const createWindow = () => {
  const seconds = getSeconds();

  mainWindow = new BrowserWindow({
    width: 420,
    height: 260,
    resizable: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'index.html'), {
    query: { seconds: String(seconds) },
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

ipcMain.on('timebomb:quit', () => {
  app.quit();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
