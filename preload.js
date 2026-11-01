const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("petWindow", {
  setClickable: (clickable) => ipcRenderer.send("set-clickable", clickable),
  onCursor: (callback) => ipcRenderer.on("cursor", (_event, cursor) => callback(cursor)),
});
