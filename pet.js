const pet = document.getElementById("pet");
const sprite = document.getElementById("sprite");
const bubble = document.getElementById("bubble");

const speed = 320; // pixels per second
const clickDistance = 5; // moving less than this counts as a click, not a drag

const controls = document.getElementById("controls");
const chatButton = document.getElementById("chat-button");
const micButton = document.getElementById("mic-button");
const chatPanel = document.getElementById("chat-panel");
const chatLog = document.getElementById("chat-log");
const chatForm = document.getElementById("chat-form");
const chatInput = document.getElementById("chat-input");

let character = null;
let state = "idle"; // idle, walking, hovered, held or a custom state
let x = 0;
let y = 0;
let homeX = 0; // the pet's spot in the bottom right corner
let targetX = 0; // where the pet is walking to
let errand = null; // the errand the pet is on, if any
let direction = -1; // 1 = right, -1 = left
let lastTime = 0;
let hideTimer = null;
let animationTime = 0;
let customTimeLeft = 0; // seconds left in a custom state

let cursorX = -1;
let cursorY = -1;
let hovering = false;
let grabX = 0;
let grabY = 0;
let pressX = 0;
let pressY = 0;
let chatMessages = []; // everything said so far, for the model

window.petWindow.onCursor((cursor) => {
  cursorX = cursor.x;
  cursorY = cursor.y;
});

pet.addEventListener("mousedown", () => {
  setState("excited");
  grabX = cursorX - x;
  grabY = cursorY - y;
  pressX = cursorX;
  pressY = cursorY;
});

// These sit inside #pet, so stop their clicks from grabbing the pet
controls.addEventListener("mousedown", (event) => event.stopPropagation());
chatPanel.addEventListener("mousedown", (event) => event.stopPropagation());

chatButton.addEventListener("click", () => {
  const opened = chatPanel.classList.toggle("open");

  if (opened) {
    customTimeLeft = character.animations.excit.seconds;
    setState("excit");
    chatInput.focus();
  }
});

chatForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const text = chatInput.value.trim();
  if (text) sendChat(text);
  chatInput.value = "";
});

micButton.addEventListener("mousedown", () => {
  micButton.classList.add("listening");
});

window.addEventListener("mouseup", () => {
  micButton.classList.remove("listening");
  if (state !== "excited") return;

  y = window.innerHeight - pet.offsetHeight;

  const moved = Math.hypot(cursorX - pressX, cursorY - pressY);
  if (moved < clickDistance && character.clickState) {
    customTimeLeft = character.animations[character.clickState].seconds;
    setState(character.clickState);
  } else {
    setState(restingState());
  }
});

function sheetUrl(animation) {
  return `characters/${character.folder}/${animation.sheet}`;
}

function say(text) {
  bubble.textContent = text;
  bubble.classList.add("show");

  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => {
    bubble.classList.remove("show");
  }, 2500);
}

function addMessage(text, sender) {
  const message = document.createElement("div");
  message.className = `message ${sender}`;
  message.textContent = text;

  chatLog.append(message);
  chatLog.scrollTop = chatLog.scrollHeight;
  return message;
}

async function sendChat(text) {
  addMessage(text, "you");
  chatMessages.push({ role: "user", content: text });

  const reply = addMessage("...", "pet");
  const answer = await window.petWindow.chat(chatMessages);

  reply.textContent = answer;
  chatLog.scrollTop = chatLog.scrollHeight;
  chatMessages.push({ role: "assistant", content: answer });
}

function showAnimation() {
  const animation = character.animations[state];
  const columns = character.sheetColumns || animation.frames;
  const rows = character.sheetRows || 1;

  sprite.style.backgroundImage = `url("${sheetUrl(animation)}")`;
  sprite.style.backgroundSize = `${columns * character.width}px ${rows * character.height}px`;
  animationTime = 0;
}

function setState(newState) {
  if (newState === state) return;

  state = newState;
  showAnimation();

  const lines = character.speech[state];
  if (lines) say(lines[Math.floor(Math.random() * lines.length)]);
}

function restingState() {
  return x === targetX ? "idle" : "walking";
}

function startErrand(newErrand) {
  if (x !== homeX) return; // only leave from home

  errand = newErrand;
  targetX = (window.innerWidth - pet.offsetWidth) * errand.walkTo;
}

function arrive() {
  x = targetX;

  if (errand) {
    customTimeLeft = character.animations[errand.state].seconds;
    setState(errand.state);
    errand = null;
    targetX = homeX;
  } else {
    direction = -1; // look back at the screen
    setState("idle");
  }
}

function updateWalk(dt) {
  const step = speed * dt;

  if (Math.abs(targetX - x) <= step) {
    arrive();
  } else {
    direction = targetX > x ? 1 : -1;
    x += step * direction;
  }
}

function isOver(element) {
  const box = element.getBoundingClientRect();

  return (
    cursorX >= box.left &&
    cursorX < box.right &&
    cursorY >= box.top &&
    cursorY < box.bottom
  );
}

function updateHover(dt) {
  const overSomething = isOver(pet) || isOver(controls) || isOver(chatPanel);

  if (overSomething !== hovering) {
    hovering = overSomething;
    window.petWindow.setClickable(hovering);
  }

  customTimeLeft -= dt;
  if (customTimeLeft <= 0) {
    setState(hovering ? "hovered" : restingState());
  }
}

function updateSprite(dt) {
  const animation = character.animations[state];

  animationTime += dt;
  const frame = Math.floor(animationTime * animation.fps) % animation.frames;
  const row = animation.row || 0;
  const facing = animation.facesLeft ? -direction : direction;

  sprite.style.backgroundPosition = `${-frame * character.width}px ${-row * character.height}px`;
  sprite.style.transform = `scaleX(${facing})`;
}

function updateBubble() {
  const maxLeft = window.innerWidth - bubble.offsetWidth - 8;
  const left = x + pet.offsetWidth / 2 - bubble.offsetWidth / 2;
  const top = y - bubble.offsetHeight - 12;

  const bubbleX = Math.min(Math.max(left, 8), maxLeft);
  const bubbleY = Math.max(top, 8);

  bubble.style.transform = `translate(${bubbleX}px, ${bubbleY}px)`;
}

function update(now) {
  const dt = (now - lastTime) / 1000; // seconds since the last frame
  lastTime = now;

  if (state === "excited") {
    x = cursorX - grabX;
    y = cursorY - grabY;
  } else {
    updateHover(dt);
  }

  if (state === "walking") {
    updateWalk(dt);
  }

  pet.style.transform = `translate(${x}px, ${y}px)`;
  chatPanel.classList.toggle("on-right", x < chatPanel.offsetWidth + 16);
  updateSprite(dt);
  updateBubble();
  requestAnimationFrame(update);
}

async function start() {
  character = await window.petWindow.getCharacter();

  // Load every sheet now, so nothing flashes on the first state change
  for (const animation of Object.values(character.animations)) {
    new Image().src = sheetUrl(animation);
  }

  pet.style.width = `${character.width}px`;
  pet.style.height = `${character.height}px`;
  showAnimation();

  homeX = window.innerWidth - pet.offsetWidth;
  x = homeX;
  targetX = homeX;
  y = window.innerHeight - pet.offsetHeight;

  for (const newErrand of character.errands) {
    setInterval(() => startErrand(newErrand), newErrand.everyMinutes * 60000);
  }

  lastTime = performance.now();
  requestAnimationFrame(update);
}

start();
