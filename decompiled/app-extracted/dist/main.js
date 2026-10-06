"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/main.ts
var import_electron = require("electron");
var import_node_path = __toESM(require("node:path"));
var mainWindow = null;
var DEFAULT_SECONDS = 10;
var getSecondsFromArgs = () => {
  const flagPrefix = "--seconds=";
  const raw = process.argv.find((arg) => arg.startsWith(flagPrefix));
  if (!raw) return void 0;
  const value = Number(raw.slice(flagPrefix.length));
  if (!Number.isFinite(value)) return void 0;
  return Math.max(1, Math.floor(value));
};
var getSeconds = () => {
  const fromArgs = getSecondsFromArgs();
  if (typeof fromArgs === "number") return fromArgs;
  const rawEnv = process.env.TIMEBOMB_SECONDS;
  if (rawEnv) {
    const value = Number(rawEnv);
    if (Number.isFinite(value)) return Math.max(1, Math.floor(value));
  }
  return DEFAULT_SECONDS;
};
var createWindow = () => {
  const seconds = getSeconds();
  mainWindow = new import_electron.BrowserWindow({
    width: 420,
    height: 260,
    resizable: false,
    webPreferences: {
      preload: import_node_path.default.join(__dirname, "preload.js")
    }
  });
  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(import_node_path.default.join(__dirname, "index.html"), {
    query: { seconds: String(seconds) }
  });
  mainWindow.on("closed", () => {
    mainWindow = null;
  });
};
import_electron.app.whenReady().then(() => {
  createWindow();
  import_electron.app.on("activate", () => {
    if (import_electron.BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});
import_electron.ipcMain.on("timebomb:quit", () => {
  import_electron.app.quit();
});
import_electron.app.on("window-all-closed", () => {
  if (process.platform !== "darwin") import_electron.app.quit();
});
//# sourceMappingURL=main.js.map
