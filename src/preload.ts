import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('timebomb', {
  quit: () => ipcRenderer.send('timebomb:quit'),
});

declare global {
  interface Window {
    timebomb: {
      quit: () => void;
    };
  }
}
