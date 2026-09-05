import { ctx, main } from "./index.js";
import { draw, svg } from "./draw.js";
import { player } from "./objects.js";

export const camera = {
  cx: 0,
  cy: 0,
  z: 0,
  tx: 0,
  ty: 0,
  scale: 10,
  smoothness: 0.09,
  get tscale() {
    return 1;
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
      x: main.width / 2 + (x - camera.cx) * main.size / scale,
      y: main.height / 2 + (y - camera.cy) * main.size / scale
    };
  },
  convertback: function(x, y, scale = camera.scale) {
    return {
      x: (x - view.cx) * scale / main.size + camera.cx,
      y: (y - view.cy) * scale / main.size + camera.cy
    };
  },
  draw: function() {
    // todo ui
    
  },

};