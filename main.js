const { app, BrowserWindow, screen } = require("electron");

app.whenReady().then(() => {
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  console.log(x, y, width, height);
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
  });
  win.setIgnoreMouseEvents(true);
  win.loadFile("index.html");
});
