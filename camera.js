import { ctx, main, mouse } from "./index.js";
import { draw } from "./draw.js";
import { Newspaper, player, Thing } from "./objects.js";
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
    return 400;
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
    camera.tx = player?.xcd ?? 0;
    camera.ty = player ? ((player.ycd ?? 0) + (main.level < 4 ? -100 : 0)) : 0;
    camera.cx = camera.lerp(camera.cx, camera.tx, camera.smoothness);
    camera.cy = camera.lerp(camera.cy, camera.ty, camera.smoothness);
    // camera.z = player.z;
  },

  jump: function() {
    camera.cx = player?.xcd ?? 0;
    camera.cy = (player?.ycd ?? 0) - 100;
  },

  convert: function(x, y, scale = camera.scale) {
    return {
      x: main.cx + (x - camera.cx) * main.size / scale,
      y: main.cy + (y - camera.cy) * main.size / scale,
    };
  },
  convertback: function(x, y, scale = camera.scale) {
    return {
      x: (x - main.cx) * scale / main.size + camera.cx,
      y: (y - main.cy) * scale / main.size + camera.cy,
    };
  },

  menumode: true,
  blurmode: false,
  newsmode: false,
  talkmode: false,
  talktext: "",
  talkindex: 0,

  draw: function() {
    let x = main.cx, y = main.cy, w = main.size, h = main.size, size = main.size * 0.05;
    y += h / 2 - size;
    ctx.fillStyle = "#90aa87";
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
        n.target = { x, y, s: 1 };
        if (n.hovering && !camera.newsmode) {
          const ww = main.size * 1587 / 2245 * 0.5;
          draw.image(images[n.content], Math.max((main.width - main.size + ww) / 2, x), y - main.size * 0.3, ww, main.size * 0.5, false, true);
        }
      }
      x += size * 2;
    }
    if (camera.newsmode) {
      const n = Newspaper.newspapers[player.inVENTory[player.inVENTdex]];
      if (n) {
        draw.image(images[n.content], main.cx, main.cy - size, main.size * 1587 / 2245 * 0.8, main.size * 0.8, false, true);
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
      draw.split_text(camera.talktext[camera.talkindex], x, y, main.size * 0.8, size * 4, size * 0.5);
    }
    if (main.level >= 4) camera.draw_end();
  },

  draw_menu: function() {
    let x = main.cx, y = main.cy, w = main.size, h = main.size, size = main.size * 0.05;
    ctx.fillStyle = "coral";
    ctx.beginPath();
    draw.rectangle(x, y + size * 8.75, w, size * 2.5);
    ctx.fill();
    draw.image("mansion1", x, y, size * 16, size * 16);
    draw.image("arvind1", x - size, y + size * 6, size * 1.5, size * 3);
    ctx.fillStyle = "#111";
    draw.set_font(size * 3.5, "bold", "press");
    ctx.fillText("NEWSPAPER CAPER", x, y - main.size * 0.36);
    if (camera.blurmode) {
      camera.draw_blur();
    } else {
      draw.set_font(size * 2, "bold", "press");
      ctx.fillText("Levels", x, y - main.size * 0.1);
      for (let i = 1; i <= 3; i++) {
        ctx.beginPath();
        draw.rectangle(x + (i - 2) * size * 5, y + size * 2, size * 3, size * 3);
        const hover = mouse.hovering();
        ctx.fillStyle = hover ? "green" : "darkgreen";
        ctx.fill();
        ctx.fillStyle = "#eee";
        draw.set_font(size * 2, "bold", "oldenburg");
        ctx.fillText(i, x + (i - 2) * size * 5, y + size * 2.2);
        if (hover && mouse.check() || main.keys["Digit" + i] === 2 || main.keys["Numpad" + i] === 2) {
          camera.blurmode = true;
          main.level = i;
        }
      }
    }
  },

  draw_end: function() {
    let x = main.cx, y = main.cy, w = main.size, h = main.size, size = main.size * 0.05;
    ctx.fillStyle = "#111";
    draw.set_font(size * 2, "bold", "press");
    ctx.fillText("THANKS FOR PLAYING!", x, y - main.size * 0.2);
  },

  draw_blur: function() {
    let x = main.cx, y = main.cy, w = main.size, h = main.size, size = main.size * 0.05;
    ctx.fillStyle = "#eeed";
    ctx.beginPath();
    draw.rectangle(x, y, w, h);
    ctx.fill();
    ctx.fillStyle = "#111";
    ctx.beginPath();
    const a = draw.split_text("In the year 189X, one boy was charged with a sacred duty: delivering newspapers. Nothing brought him more joy than providing his beloved customers with the newspapers of their choice to peruse at their pleasure.\n\nBy analysing their contents, asking around and investigating environmental clues, will you help him deliver them to the correct addresses?\n\nPress Enter, E, or double click to continue",
      x, y, w * 0.8, h * 0.8, size * 0.7
    );
    if (main.keys["Enter"] === 2 || main.keys["KeyE"] === 2 || mouse.newdbls.length > 0) {
      main.keys["Enter"] = 1;
      main.keys["KeyE"] = 1;
      camera.blurmode = false;
      camera.menumode = false;
      Thing.load_level();
    }
  },

  talknext: function() {
    camera.talkindex++;
    if (camera.talkindex >= camera.talktext.length) camera.talkmode = false;
  },

  sky: function() {
    const skytiles = 3, skysize = main.size / skytiles;
    const offset = { x: (camera.cx + skysize * 100) % skysize, y: (camera.cy + skysize * 100) % skysize, };
    for (let yy = -1; yy <= skytiles; yy++) {
      for (let xx = -1; xx <= skytiles; xx++) {
        const x = main.cx - main.size / 2 + main.size * xx / skytiles - offset.x;
        const y = main.cy - main.size / 2 + main.size * yy / skytiles - offset.y;
        draw.image("sky2", x + skysize / 2, y + skysize / 2, skysize, skysize);
      }
    }
  },

};