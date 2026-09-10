import { camera } from "./camera.js";
import { draw } from "./draw.js";
import { Newspaper, NPC, player, Thing } from "./objects.js";

// for list.remove(item in list)
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
export const music = new Audio("jam.mp3");

music.loop = true;
music.volume = 0.9;
music.addEventListener("canplaythrough", function(event) {
  music.play();
});

export const main = {
  width: window.innerWidth,
  height: window.innerHeight,
  cx: window.innerWidth / 2,
  cy: window.innerHeight / 2,
  level: 1,
  size: 1,
  mobile: false,
  keys: {},
  time: 0,
  ticks: 0,
};

export const mouse = {
  touches: [],
  newtaps: [],
  newdbls: [],
  newdrags: [],
  x: false,
  y: false,
  hovering: function() {
    if (ctx.isPointInPath(mouse.x, mouse.y)) return true;
    for (const t of mouse.newtaps.concat(mouse.newdrags)) {
      if (ctx.isPointInPath(t.x, t.y)) {
        return true;
      }
    }
    return false;
  },
  check: function(double = false) {
    for (const t of double ? mouse.newdbls : mouse.newtaps) {
      if (ctx.isPointInPath(t.x, t.y)) {
        return t;
      }
    }
    return false;
  },
};

function __arvind() {
  console.log("A.A. Greeneswaran Tea");
  console.log("greentea");
};

function init() {
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.imageSmoothingEnabled = false;
  resize();
  requestAnimationFrame(tick);
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
  camera.sky();
  if (!camera.menumode) {
    Thing.draw_all();
    camera.draw();
    Thing.draw_after();
  } else {
    camera.draw_menu();
  }
  ctx.restore();
};

function tick(time) {
  const dt = time - main.time;
  main.time = time;
  main.ticks++;
  draw_main();
  camera.tick();
  if (main.keys["KeyE"] === 2 || main.keys["Enter"] === 2) {
    player?.interact();
  }
  if (main.keys["Shift"] && main.keys["Digit0"] === 2) {
    for (const n of Newspaper.newspapers) {
      n.interact();
    }
  }
  if (main.keys["Shift"] && main.keys["Backquote"] === 2) {
    player?.launch();
  }
  if (main.keys["KeyF"] === 2 || main.keys["KeyB"] === 2 || main.keys["Backslash"] === 2) {
    camera.newsmode = !camera.newsmode;
  }
  if (main.keys["Escape"] === 2) {
    camera.newsmode = false;
    camera.talkmode = false;
  }
  if (player?.inVENTory?.length ?? 0 > 0) {
    for (let i = 1; i <= player.inVENTory.length; i++) {
      if (main.keys["Digit" + i] === 2 || main.keys["Numpad" + i] === 2) {
        if (player.inVENTdex === i - 1) {
          camera.newsmode = !camera.newsmode;
          continue;
        }
        player.inVENTdex = i - 1;
        camera.newsmode = true;
        Newspaper.newspapers[player.inVENTory[player.inVENTdex]].click();
      }
    }
    if (main.keys["BracketLeft"] === 2) {
      player.inVENTdex = (player.inVENTdex + player.inVENTory.length - 1) % player.inVENTory.length;
      Newspaper.newspapers[player.inVENTory[player.inVENTdex]]?.click();
    }
    if (main.keys["BracketRight"] === 2 || main.keys["KeyQ"] === 2) {
      player.inVENTdex = (player.inVENTdex + 1) % player.inVENTory.length;
      Newspaper.newspapers[player.inVENTory[player.inVENTdex]]?.click();
    }
  }
  Thing.tick_physics(dt);
  Thing.tick_all(dt);
  keytick();
  mouse.newtaps = [];
  mouse.newdbls = [];
  mouse.newdrags = [];
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
  const no_mod = !event.ctrlKey && !event.metaKey && !event.altKey;
  if (no_mod) event.preventDefault();
  music.play();
  main.keys[event.code] = 2;
  main.keys["Shift"] = event.shiftKey ? 2 : 0;
};
function keyup(event) {
  if (event.repeat) return;
  main.keys[event.code] = 0;
  main.keys["Shift"] = event.shiftKey ? 1 : 0;
};
function keyclear() {
  main.keys = {};
};
function touchdown(event) {
  event.preventDefault();
  music.play();
  for (const touch of event.changedTouches) {
    const o = {
      x: touch.clientX * main.ratio,
      y: touch.clientY * main.ratio,
      id: touch.identifier,
      active: true,
    };
    mouse.newtaps.push(o);
  }
};
function mousedown(event) {
  music.play();
  const o = {
    x: event.clientX * main.ratio,
    y: event.clientY * main.ratio,
    id: -1,
    active: true,
  };
  mouse.newtaps.push(o);
};
function mousedouble(event) {
  const o = {
    x: event.clientX * main.ratio,
    y: event.clientY * main.ratio,
    id: -1,
    active: true,
  };
  mouse.newdbls.push(o);
};
function touchmove(event) {
  event.preventDefault();
  mouse.touches = [];
  for (const touch of event.touches) {
    mouse.touches.push([touch.clientX * main.ratio, touch.clientY * main.ratio, touch.identifier]);
    const o = {
      x: touch.clientX * main.ratio,
      y: touch.clientY * main.ratio,
      id: touch.identifier,
      drag: true,
      active: true,
    };
    mouse.newdrags.push(o);
  }
  if (event.touches.length > 0) {
    mouse.x = mouse.touches[0][0];
    mouse.y = mouse.touches[0][1];
    mouse.id = mouse.touches[0][2];
  } else {
    // mouse.x = false;
    // mouse.y = false;
  }
};
function mousemove(event) {
  mouse.touches = [[event.clientX * main.ratio, event.clientY * main.ratio, -1]];
  mouse.x = mouse.touches[0][0];
  mouse.y = mouse.touches[0][1];
  mouse.id = mouse.touches[0][2];
  if (event.buttons) {
    const o = {
      x: mouse.x,
      y: mouse.y,
      id: -1,
      drag: true,
      active: true,
    };
    mouse.newdrags.push(o);
  }
};
function touchup(event) {
  // for (const touch of event.changedTouches) {
  //   delete mouse.hold_time[touch.identifier];
  // }
};
function mouseup(event) {
  // delete mouse.hold_time[-1];
};
function byebye(event) {
  event.preventDefault();
  return false;
};

window.addEventListener("load", init);
window.addEventListener("resize", resize);
window.addEventListener("keydown", keydown);
window.addEventListener("keyup", keyup);
window.addEventListener("blur", keyclear);
window.addEventListener("touchstart", touchdown);
window.addEventListener("touchstart", touchmove);
window.addEventListener("touchmove", touchmove);
window.addEventListener("touchend", touchup);
window.addEventListener("touchend", touchmove);
window.addEventListener("touchcancel", touchup);
window.addEventListener("touchcancel", touchmove);
canvas.addEventListener("dblclick", mousedouble);
window.addEventListener("mousedown", mousedown);
window.addEventListener("mousedown", mousemove);
window.addEventListener("mousemove", mousemove);
window.addEventListener("mouseup", mouseup);
window.addEventListener("mouseup", mousemove);
window.addEventListener("contextmenu", byebye);
window.addEventListener("wheel", byebye);
window.addEventListener("mousewheel", byebye);
window.addEventListener("scroll", byebye);
document.addEventListener("visibilitychange", function() { if (document.hidden) keyclear(); });