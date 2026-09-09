import { ctx, main } from "./index.js";
import { draw } from "./draw.js";
import { Newspaper, player } from "./objects.js";
import { images } from "./data.js";

export const camera = {

  cx: 0,
  cy: 0,
  z: 0,
  tx: 0,
  ty: 0,
  scale: 1,
  smoothness: 0.09,

  get tscale() {
    return 500;
  },
  get size() {
    return this.scale / main.size;
  },
  get x() {
    return this.cx - this.scale / 2;
  },
  set x(x) {
    this.cx = x + this.scale / 2;
  },
  get y() {
    return this.cy - this.scale / 2;
  },
  set y(y) {
    this.cy = y + this.scale / 2;
  },
  // get size() {
  //   return main.size / camera.scale + 1;
  // },

  lerp: function(a, b, t) {
    return a * (1 - t) + b * t;
  },
  bounce: function(t, a) {
    return Math.abs((t % (a * 2)) - a) / a;
  },
  halfbounce: function(t, a) {
    return -Math.min((t % (a * 2)) - a, 0) / a;
  },
  clamp: function(n, a, b) {
    return Math.min(Math.max(n, a), b);
  },

  init: function() {
    camera.scale = 1;
  },

  tick: function() {
    camera.scale = camera.lerp(camera.scale, camera.tscale, camera.smoothness);
    camera.tx = player.xcd;
    camera.ty = player.ycd;
    camera.cx = camera.lerp(camera.cx, camera.tx, camera.smoothness);
    camera.cy = camera.lerp(camera.cy, camera.ty, camera.smoothness);
    camera.z = player.z;
  },

  jump: function() {
    camera.cx = player.xcd;
    camera.cy = player.ycd;
  },

  convert: function(x, y, scale = camera.scale) {
    return {
      x: main.cx + (x - camera.cx) * main.size / scale,
      y: main.cy + (y - camera.cy) * main.size / scale
    };
  },
  convertback: function(x, y, scale = camera.scale) {
    return {
      x: (x - main.cx) * scale / main.size + camera.cx,
      y: (y - main.cy) * scale / main.size + camera.cy
    };
  },

  newsmode: false,
  talkmode: false,

  draw: function() {
    let x = main.cx, y = main.cy, w = main.size, h = main.size, size = main.size * 0.05;
    y += h / 2 - size;
    ctx.fillStyle = "rebeccapurple";
    ctx.beginPath();
    draw.rectangle(x, y, w + 1, size * 2 + 1);
    ctx.fill();
    ctx.fillStyle = "gray";
    x -= w / 2 - size * 1.5;
    for (let i = 0; i < player.inVENTory.length; i++) {
      // ctx.beginPath();
      // draw.rectangle(x, y, size, size);
      // ctx.fill();
      const n = Newspaper.newspapers[player.inVENTory[i]];
      if (n) {
        n.target = { x, y };
        if (n.hovering && !camera.newsmode) {
          const ww = main.size * 1587 / 2245 * 0.5;
          draw.image(images[n.content], Math.max(ww, x), y - main.size * 0.3, ww, main.size * 0.5);
        }
      }
      x += size * 2;
    }
    if (camera.newsmode) {
      const n = Newspaper.newspapers[player.inVENTory[player.inVENTdex]];
      if (n) {
        draw.image(images[n.content], main.cx, main.cy - size, main.size * 1587 / 2245 * 0.8, main.size * 0.8);
      }
    }
    if (camera.talkmode) {
      x = main.cx;
      y = main.cy - h / 2 + size * 2;
      ctx.fillStyle = "#111a";
      ctx.beginPath();
      draw.rectangle(x, y, main.size + 1, size * 4 + 1);
      ctx.fill();
      ctx.fillStyle = "#eee";
      draw.split_text(camera.talktext, x, y, main.size * 0.8, size * 4, size * 0.5);
    }
  },

};