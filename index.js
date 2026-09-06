import { camera } from "./camera.js";
import { draw } from "./draw.js";
import { player, Player, Thing } from "./objects.js";

// so you can do list.remove(item in list)
if (!Array.prototype.remove) {
  Array.prototype.remove = function(value) {
    const index = this.indexOf(value);
    if (index >= 0) {
      this.splice(index, 1);
      return value;
    }
  };
}

export const canvas = document.querySelector("canvas");
export const ctx = canvas.getContext("2d");

export const main = {
  width: window.innerWidth,
  height: window.innerHeight,
  cx: window.innerWidth / 2,
  cy: window.innerHeight / 2,
  size: 1,
  mobile: false,
  keys: {},
};

function arvind() {
  console.log("A.A. Greeneswaran Tea");
  console.log("greentea");
};

function init() {
  arvind();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  test();
  resize();
  requestAnimationFrame(tick);
};

function test() {
  // test stuff here
  player.name = "arvind";
  player.width = 32;
  player.height = 32;
  player.nc(100, 100);
};


function draw_main() {
  ctx.save();
  ctx.fillStyle = "darkslategray";
  ctx.fillRect(0, 0, main.width, main.height);
  ctx.fillStyle = "skyblue";
  ctx.beginPath();
  draw.rectangle(main.cx, main.cy, main.size, main.size);
  ctx.fill();
  ctx.clip();
  camera.draw_before();
  Thing.draw_all();
  camera.draw_after();
  ctx.restore();
};

function tick(time) {
  draw_main();
  camera.tick();
  Thing.tick_all();
  const dx = (main.keys["KeyA"] || main.keys["ArrowLeft"]) ? -1 : (main.keys["KeyD"] || main.keys["ArrowRight"]) ? 1: 0;
  player.move(dx * 5, 0);
  if (main.keys["KeyE"] === 2 || main.keys["Enter"] === 2){
    player.interact();
  }
  keytick();
  requestAnimationFrame(tick);
};

function resize() {
  main.width = window.innerWidth;
  main.height = window.innerHeight;
  main.ratio = Math.min(2, window.devicePixelRatio);
  canvas.width = main.width * main.ratio;
  canvas.height = main.height * main.ratio;
  ctx.scale(main.ratio, main.ratio);
  main.mobile = main.width < main.height;
  main.cx = main.width / 2;
  main.cy = main.height / 2;
  main.size = Math.min(main.width, main.height);
};

function keytick() {
  for (const k in main.keys) {
    if (main.keys[k] === 2) main.keys[k] = 1;
  }
};
function keydown(event) {
  if (event.repeat) return;
  main.keys[event.code] = 2;
};
function keyup(event) {
  if (event.repeat) return;
  main.keys[event.code] = 0;
};
function keyclear() {
  main.keys = {};
};

window.addEventListener("load", init);
window.addEventListener("resize", resize);
window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);
window.addEventListener("blur", keyclear);
document.addEventListener("visibilitychange", function() { if (document.hidden) keyclear(); });