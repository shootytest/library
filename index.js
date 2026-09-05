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


function drawmain() {
  ctx.fillStyle = "skyblue";
  ctx.fillRect(0, 0, main.width, main.height);
  Thing.drawall();
};

function tick(time) {
  drawmain();
  camera.tick();
  camera.draw();
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