const pet = document.getElementById("pet");

const speed = 320; // pixels per second
let x = 0;
let direction = 1; // 1 = right, -1 = left
let lastTime = performance.now();
let pauseLeft = 0;

function update(now) {
  const dt = (now - lastTime) / 1000; // seconds since the last frame
  lastTime = now;
  if (pauseLeft > 0) {
    dt -= pauseLeft;
  }
  x += speed * direction * dt;
  pauseLeft = Math.floor(Math.random() * 3) + 1;

  const maxX = window.innerWidth - pet.offsetWidth;
  if (x >= maxX) {
    x = maxX;
    direction = -1;
  } else if (x <= 0) {
    x = 0;
    direction = 1;
  }

  pet.style.transform = `translateX(${x}px)`;
  requestAnimationFrame(update);
}

requestAnimationFrame(update);
