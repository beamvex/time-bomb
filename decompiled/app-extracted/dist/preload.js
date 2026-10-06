"use strict";

// src/preload.ts
var import_electron = require("electron");
import_electron.contextBridge.exposeInMainWorld("timebomb", {
  quit: () => import_electron.ipcRenderer.send("timebomb:quit")
});
//# sourceMappingURL=preload.js.map
