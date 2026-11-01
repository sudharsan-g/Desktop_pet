const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("petWindow", {
  getCharacter: () => ipcRenderer.invoke("get-character"),
  setClickable: (clickable) => ipcRenderer.send("set-clickable", clickable),
  onCursor: (callback) =>
    ipcRenderer.on("cursor", (_event, cursor) => callback(cursor)),
  chat: (messages) => ipcRenderer.invoke("chat", messages),
});
