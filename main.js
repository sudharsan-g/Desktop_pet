const { app, BrowserWindow, screen, ipcMain } = require("electron");
const fs = require("fs");
const path = require("path");

const characterName = "pochita"; // a folder inside characters/
const model = "lfm3:1.7b"; // the Ollama model that answers the chat

function loadCharacter(name) {
  let folder = path.join(__dirname, "characters", name);
  if (!fs.existsSync(folder)) {
    name = "blob";
    folder = path.join(__dirname, "characters", name);
  }

  const config = fs.readFileSync(path.join(folder, "character.json"), "utf8");

  return { ...JSON.parse(config), folder: name };
}

async function askModel(messages) {
  const character = loadCharacter(characterName);
  const personality = character.personality || "You are a small desktop pet.";

  const response = await fetch("http://127.0.0.1:11434/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [{ role: "system", content: personality }, ...messages],
    }),
  });

  const data = await response.json();
  return data.message.content;
}

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
  ipcMain.handle("get-character", () => loadCharacter(characterName));

  ipcMain.handle("chat", async (_event, messages) => {
    try {
      return await askModel(messages);
    } catch {
      return "I can't reach my brain. Is Ollama running?";
    }
  });

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
