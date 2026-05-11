/**
 * Minimal platformer — local stub JSON only, no external APIs.
 */

const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const hudTip = document.getElementById("hud-tip");
const overlay = document.getElementById("overlay");
const overlayTitle = document.getElementById("overlay-title");
const overlayBody = document.getElementById("overlay-body");
const overlayBtn = document.getElementById("overlay-btn");

const W = canvas.width;
const H = canvas.height;
const GROUND_Y = H - 48;
const GRAVITY = 0.45;
const MOVE_SPEED = 0.55;
const JUMP = -11;
const FRICTION = 0.82;

let keys = {};
let tips = [];
let tipIndex = 0;
let won = false;

const player = { x: 40, y: GROUND_Y - 44, w: 28, h: 36, vx: 0, vy: 0, onGround: false };

const platforms = [
	{ x: 0, y: GROUND_Y, w: W, h: 48 },
	{ x: 180, y: GROUND_Y - 90, w: 120, h: 16 },
	{ x: 380, y: GROUND_Y - 130, w: 100, h: 16 },
	{ x: 560, y: GROUND_Y - 100, w: 140, h: 16 },
	{ x: 720, y: GROUND_Y - 140, w: 100, h: 16 },
];

const goal = { x: W - 72, y: GROUND_Y - 120, w: 40, h: 120 };

const checkpoints = [
	{ x: 200, label: "customers" },
	{ x: 420, label: "products" },
	{ x: 640, label: "releases" },
	{ x: 780, label: "sdlc" },
];

let hitCheckpoint = new Set();

async function loadStubs() {
	const paths = [
		"./content/customers.json",
		"./content/products.json",
		"./content/releases.stub.json",
		"./content/sdlc.json",
	];
	const chunks = await Promise.all(
		paths.map(async (p) => {
			const r = await fetch(p);
			if (!r.ok) throw new Error(`Failed ${p}`);
			return r.json();
		}),
	);
	tips = chunks.flatMap((j) => j.tips || []);
	if (!tips.length) tips = ["Stub tips missing — check web/content/*.json"];
	setHudTip();
}

function setHudTip() {
	hudTip.textContent = tips[tipIndex % tips.length] || "";
}

function rectsOverlap(a, b) {
	return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function resolvePlatform(p, plat) {
	const next = { ...p, x: p.x + p.vx, y: p.y + p.vy };
	if (!rectsOverlap(next, plat)) return;

	const prevX = { ...p, x: p.x + p.vx, y: p.y };
	const prevY = { ...p, x: p.x, y: p.y + p.vy };

	if (!rectsOverlap(prevX, plat)) {
		if (p.vx > 0) p.x = plat.x - p.w;
		else if (p.vx < 0) p.x = plat.x + plat.w;
		p.vx = 0;
	} else if (!rectsOverlap(prevY, plat)) {
		if (p.vy > 0) {
			p.y = plat.y - p.h;
			p.vy = 0;
			p.onGround = true;
		} else if (p.vy < 0) {
			p.y = plat.y + plat.h;
			p.vy = 0;
		}
	}
}

function update() {
	if (won) return;

	if (keys.ArrowLeft || keys.a) player.vx -= MOVE_SPEED;
	if (keys.ArrowRight || keys.d) player.vx += MOVE_SPEED;
	player.vx *= FRICTION;
	player.vy += GRAVITY;
	player.onGround = false;

	player.x += player.vx;
	player.y += player.vy;

	for (const plat of platforms) {
		resolvePlatform(player, plat);
	}

	if (player.y > H + 80) resetRun(false);

	for (const cp of checkpoints) {
		if (!hitCheckpoint.has(cp.label) && player.x + player.w > cp.x && player.x < cp.x + 24) {
			hitCheckpoint.add(cp.label);
			tipIndex++;
			setHudTip();
		}
	}

	if (rectsOverlap(player, goal)) {
		won = true;
		overlayTitle.textContent = "Flag reached!";
		overlayBody.textContent =
			"You cleared the run. Takeaways: Cursor helps across the SDLC; ships often; customers range from indie devs to teams. (All copy is stubbed locally — see PRD.)";
		overlay.classList.remove("hidden");
	}
}

function drawCloud(cx, cy) {
	ctx.fillStyle = "rgba(255,255,255,0.06)";
	ctx.beginPath();
	ctx.arc(cx, cy, 28, 0, Math.PI * 2);
	ctx.arc(cx + 26, cy + 4, 22, 0, Math.PI * 2);
	ctx.arc(cx + 52, cy, 24, 0, Math.PI * 2);
	ctx.fill();
}

function draw() {
	ctx.clearRect(0, 0, W, H);
	for (let i = 0; i < 6; i++) drawCloud(80 + i * 140, 50 + (i % 3) * 12));

	for (const plat of platforms) {
		ctx.fillStyle = plat.y >= GROUND_Y ? "#2f3d4d" : "#3d5166";
		ctx.fillRect(plat.x, plat.y, plat.w, plat.h);
	}

	ctx.fillStyle = "#6ca06c";
	ctx.fillRect(goal.x, goal.y, goal.w, goal.h);
	ctx.fillStyle = "#e8c547";
	ctx.beginPath();
	ctx.moveTo(goal.x + goal.w + 6, goal.y + 8);
	ctx.lineTo(goal.x + goal.w + 46, goal.y + 22);
	ctx.lineTo(goal.x + goal.w + 6, goal.y + 36);
	ctx.fill();

	ctx.fillStyle = "#e5c07b";
	ctx.fillRect(player.x, player.y, player.w, player.h);
	ctx.fillStyle = "#1f1a12";
	ctx.fillRect(player.x + 6, player.y + 10, 6, 6);
	ctx.fillRect(player.x + 16, player.y + 10, 6, 6);

	ctx.fillStyle = "rgba(255,255,255,0.35)";
	for (const cp of checkpoints) {
		if (!hitCheckpoint.has(cp.label)) {
			ctx.fillRect(cp.x, GROUND_Y - 56, 8, 56);
		}
	}
}

function loop() {
	update();
	draw();
	requestAnimationFrame(loop);
}

function resetRun(full) {
	player.x = 40;
	player.y = GROUND_Y - 44;
	player.vx = 0;
	player.vy = 0;
	hitCheckpoint = new Set();
	tipIndex = 0;
	won = false;
	overlay.classList.add("hidden");
	if (full) setHudTip();
	else setHudTip();
}

window.addEventListener("keydown", (e) => {
	keys[e.code] = true;
	if (e.code === "Space" || e.code === "ArrowUp") e.preventDefault();
	if (e.code === "KeyR") resetRun(true);
	if ((e.code === "Space" || e.code === "ArrowUp") && player.onGround) {
		player.vy = JUMP;
		player.onGround = false;
	}
});

window.addEventListener("keyup", (e) => {
	keys[e.code] = false;
});

overlayBtn.addEventListener("click", () => resetRun(true));

loadStubs()
	.then(() => {
		requestAnimationFrame(loop);
	})
	.catch((err) => {
		hudTip.textContent = "Could not load stub JSON.";
		console.error(err);
	});
