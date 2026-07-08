// ============================================================
//  SQUARE QUEST -- a bare-bones platformer to learn on.
//  Look for comments starting with "TODO" -- each one matches
//  a numbered assignment in the README. Do them in order!
// ============================================================

const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreDisplay = document.getElementById("scoreDisplay");
const winMessage = document.getElementById("winMessage");

// ---------- Tunable numbers ----------
// TODO 1: Change PLAYER_COLOR to any CSS color ("blue", "#2ecc71", etc.)
const PLAYER_COLOR = ["#0000ff"];
// TODO 3: These three numbers control how the game FEELS. Try changing
// one at a time and reloading the page to see what each one does.
const GRAVITY = 0.6;      // how fast the player falls
const MOVE_SPEED = 4;     // how fast the player walks
const JUMP_POWER = -12;   // how high the player jumps (more negative = higher)

// ---------- Player ----------
const player = {
  x: 50,
  y: 50,
  // TODO 2: Change width/height to make the player bigger or smaller.
  width: 32,
  height: 32,
  vx: 0,
  vy: 0,
  onGround: false,
  startX: 50, // remembered so we can respawn the player here
  startY: 50,
};

// ---------- Level: platforms ----------
// TODO 4: Add another platform! Copy one of the lines below and change
// the numbers. x/y is the top-left corner, in pixels.
const platforms = [
  { x: 0, y: 368, width: 800, height: 32, color: "#5a3921" }, // the ground
  { x: 200, y: 280, width: 120, height: 16, color: "#5a3921" },
  { x: 420, y: 220, width: 120, height: 16, color: "#5a3921" },
  { x: 620, y: 300, width: 100, height: 16, color: "#5a3921" },
];

// ---------- Level: treasure ----------
// TODO 6: Add more treasure to collect! Each one just needs an x and y
// (try to place them somewhere the player can actually reach).
const treasures = [
  { x: 240, y: 240, size: 16, collected: false },
  { x: 460, y: 180, size: 16, collected: false },
];

// ---------- Level: enemies ----------
// TODO 8: Give an enemy a starting vx (velocity) like 2, then make it
// patrol back and forth between minX and maxX in the update loop below.
const enemies = [
  { x: 640, y: 268, width: 28, height: 28, vx: 0, minX: 620, maxX: 700, color: "#8e44ad" },
];

let score = 0;
// TODO 10: Use "lives" to build a game-over system. Show it in the HUD,
// subtract one every time the player is hurt, and show a "Game Over"
// screen (just like winMessage) when it reaches 0.
let lives = 3;

// TODO 13: Read a saved best score when the game loads, e.g.
//   let bestScore = Number(localStorage.getItem("bestScore")) || 0;
// and write it back with localStorage.setItem("bestScore", score)
// whenever the player beats it.

// ---------- Input ----------
// Both the keyboard and the on-screen buttons just flip these three
// switches on and off -- the game loop below doesn't care which one did it.
const input = { left: false, right: false, jump: false };

window.addEventListener("keydown", (e) => {
  if (["ArrowLeft", "ArrowRight", "ArrowUp", "Space", "KeyA", "KeyD", "KeyW"].includes(e.code)) {
    e.preventDefault(); // stop the arrow keys/space from scrolling the page
  }
  if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = true;
  if (e.code === "ArrowRight" || e.code === "KeyD") input.right = true;
  if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") input.jump = true;
});

window.addEventListener("keyup", (e) => {
  if (e.code === "ArrowLeft" || e.code === "KeyA") input.left = false;
  if (e.code === "ArrowRight" || e.code === "KeyD") input.right = false;
  if (e.code === "ArrowUp" || e.code === "KeyW" || e.code === "Space") input.jump = false;
});

function bindTouchButton(buttonId, inputProp) {
  const btn = document.getElementById(buttonId);
  const press = (e) => { e.preventDefault(); input[inputProp] = true; };
  const release = (e) => { e.preventDefault(); input[inputProp] = false; };
  btn.addEventListener("touchstart", press);
  btn.addEventListener("touchend", release);
  btn.addEventListener("touchcancel", release);
  // mouse events too, so the buttons also work when testing on a laptop
  btn.addEventListener("mousedown", press);
  btn.addEventListener("mouseup", release);
  btn.addEventListener("mouseleave", release);
}
bindTouchButton("btn-left", "left");
bindTouchButton("btn-right", "right");
bindTouchButton("btn-jump", "jump");

// ---------- Helpers ----------
function rectsOverlap(a, b) {
  return (
    a.x < b.x + b.width &&
    a.x + a.width > b.x &&
    a.y < b.y + b.height &&
    a.y + a.height > b.y
  );
}

function treasureRect(t) {
  return { x: t.x - t.size / 2, y: t.y - t.size / 2, width: t.size, height: t.size };
}

function respawnPlayer() {
  player.x = player.startX;
  player.y = player.startY;
  player.vx = 0;
  player.vy = 0;
}

// Pushes the player back out of any platform it is overlapping with,
// one axis at a time. Called once after moving horizontally and once
// after moving vertically -- that's what keeps the collision simple.
function resolveCollisions(axis) {
  for (const p of platforms) {
    if (!rectsOverlap(player, p)) continue;

    if (axis === "x") {
      if (player.vx > 0) player.x = p.x - player.width;
      else if (player.vx < 0) player.x = p.x + p.width;
    } else {
      if (player.vy > 0) {
        // falling onto the top of a platform
        player.y = p.y - player.height;
        player.vy = 0;
        player.onGround = true;
      } else if (player.vy < 0) {
        // jumping up into the bottom of a platform
        player.y = p.y + p.height;
        player.vy = 0;
      }
    }
  }
}

// ---------- Update ----------
function update() {
  // Horizontal movement
  if (input.left) player.vx = -MOVE_SPEED;
  else if (input.right) player.vx = MOVE_SPEED;
  else player.vx = 0;

  // Jumping (only allowed while standing on something)
  if (input.jump && player.onGround) {
    player.vy = JUMP_POWER;
    player.onGround = false;
    // TODO 11: play a jump sound here!
  }

  // Gravity
  player.vy += GRAVITY;

  // Move + collide, one axis at a time
  player.x += player.vx;
  resolveCollisions("x");

  player.y += player.vy;
  player.onGround = false;
  resolveCollisions("y");

  // Don't let the player walk off the left/right edge of the canvas
  if (player.x < 0) player.x = 0;
  if (player.x + player.width > canvas.width) player.x = canvas.width - player.width;

  // Fall off the bottom of the screen -> back to start
  if (player.y > canvas.height) {
    respawnPlayer();
  }

  // Treasure collection
  for (const t of treasures) {
    if (!t.collected && rectsOverlap(player, treasureRect(t))) {
      t.collected = true;
      score++;
      scoreDisplay.textContent = score;
      // TODO 11: play a "collect" sound here!
      // TODO 13: if score > bestScore, save it with localStorage.
    }
  }

  // TODO 7: Once all the treasure is collected, show the win message:
  //   winMessage.classList.remove("hidden");
  // Hint: treasures.every(t => t.collected) is true when every single
  // treasure object has collected === true.

  // Enemy patrol + collisions
  for (const enemy of enemies) {
    // TODO 8: move the enemy back and forth, e.g.
    //   enemy.x += enemy.vx;
    //   if (enemy.x <= enemy.minX || enemy.x >= enemy.maxX) enemy.vx *= -1;

    if (rectsOverlap(player, enemy)) {
      // TODO 9: right now touching an enemy does nothing at all.
      // Make landing on TOP of the enemy defeat it (hint: player.vy > 0
      // means the player is falling), and make touching it from the
      // side call respawnPlayer() -- or subtract a life, see TODO 10.
    }
  }
}

// ---------- Draw ----------
function draw() {
  // Background / sky
  // TODO 5: change this color to whatever sky (or cave, or space) you want.
  ctx.fillStyle = "#87ceeb";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Platforms
  for (const p of platforms) {
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.width, p.height);
  }

  // Treasure
  for (const t of treasures) {
    if (t.collected) continue;
    ctx.fillStyle = "#ffd166";
    const r = treasureRect(t);
    ctx.fillRect(r.x, r.y, r.width, r.height);
  }

  // Enemies
  for (const enemy of enemies) {
    ctx.fillStyle = enemy.color;
    ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
  }

  // Player
  // TODO 14 (polish): try ctx.save()/ctx.translate()/ctx.scale() here to
  // squash the player slightly on landing, for a juicier feel.
  ctx.fillStyle = PLAYER_COLOR;
  ctx.fillRect(player.x, player.y, player.width, player.height);
}

// ---------- Main loop ----------
function gameLoop() {
  update();
  draw();
  requestAnimationFrame(gameLoop);
}

gameLoop();

// TODO 12: Add a "Play Again" button (in index.html) that resets score,
// lives, player position, and every treasure's `collected` flag back to
// false -- or go further and build a second level to switch to on win.
