const { app, BrowserWindow, screen, ipcMain } = require("electron");
const path = require("path");

app.whenReady().then(() => {
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  const win = new BrowserWindow({
    x,
    y,
    width,
    height,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
    },
  });

  win.setIgnoreMouseEvents(true);

  ipcMain.on("set-clickable", (_event, clickable) => {
    win.setIgnoreMouseEvents(!clickable);
  });

  setInterval(() => {
    if (win.isDestroyed()) return;
    const cursor = screen.getCursorScreenPoint();
    win.webContents.send("cursor", { x: cursor.x - x, y: cursor.y - y });
  }, 30);

  win.loadFile("index.html");
});
