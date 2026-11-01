const pet = document.getElementById("pet");

const speed = 320; // pixels per second
let x = 0;
let y = window.innerHeight - pet.offsetHeight;
let direction = 1; // 1 = right, -1 = left
let lastTime = performance.now();

let cursorX = -1;
let cursorY = -1;
let hovering = false;
let dragging = false;
let grabX = 0;
let grabY = 0;

window.petWindow.onCursor((cursor) => {
  cursorX = cursor.x;
  cursorY = cursor.y;
});

pet.addEventListener("mousedown", () => {
  dragging = true;
  grabX = cursorX - x;
  grabY = cursorY - y;
});

window.addEventListener("mouseup", () => {
  dragging = false;
  y = window.innerHeight - pet.offsetHeight;
});

function updateHover() {
  const overPet =
    cursorX >= x &&
    cursorX <= x + pet.offsetWidth &&
    cursorY >= y &&
    cursorY <= y + pet.offsetHeight;

  if (overPet !== hovering) {
    hovering = overPet;
    window.petWindow.setClickable(hovering);
  }
}

function update(now) {
  const dt = (now - lastTime) / 1000; // seconds since the last frame
  lastTime = now;

  if (dragging) {
    x = cursorX - grabX;
    y = cursorY - grabY;
  } else {
    updateHover();
    if (!hovering) {
      x += speed * direction * dt;
    }
  }

  const maxX = window.innerWidth - pet.offsetWidth;
  if (x >= maxX) {
    x = maxX;
    direction = -1;
  } else if (x <= 0) {
    x = 0;
    direction = 1;
  }

  pet.style.transform = `translate(${x}px, ${y}px)`;
  requestAnimationFrame(update);
}

requestAnimationFrame(update);
