const { app, BrowserWindow, screen } = require("electron");

app.whenReady().then(() => {
  const { x, y, width, height } = screen.getPrimaryDisplay().workArea;
  console.log(x, y, width, height);
  const win = new BrowserWindow({
    width: 200,
    height: 200,
    x: width - 200,
    y: height - 200,
    transparent: true,
    frame: false,
    alwaysOnTop: true,
    resizable: false,
    hasShadow: false,
  });

  win.loadFile("index.html");
});
