import { images } from "./data.js";
import { ctx } from "./index.js";

const round = Math.round;

export const draw = {

  line: function(x1, y1, x2, y2) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2 ?? x1, y2 ?? y1);
    ctx.stroke();
  },
  arc: function(x, y, r, start_angle, end_angle, counter = false) {
    ctx.beginPath();
    ctx.arc(x, y, r, start_angle, end_angle, counter);
  },
  circle: function(x, y, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arc(x, y, r, 0, Math.PI * 2);
  },
  rect: function(x, y, w, h) {
    ctx.beginPath();
    ctx.rect(x, y, w, h);
  },
  rectangle: function(x, y, w, h) {
    return draw.rect(x - w / 2, y - h / 2, w, h);
  },
  roundrect: function(x, y, w, h, r) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
  },
  roundrectangle: function(x, y, w, h, r) {
    return draw.roundrect(x - w / 2, y - h / 2, w, h, r);
  },
  polygon: function(sides, x, y, r, a = 0) {
    ctx.beginPath();
    ctx.moveTo(x + r * Math.cos(a), y + r * Math.sin(a));
    const step = Math.PI * 2 / sides;
    for (let i = 0; i < sides; i++) {
      a += step;
      ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    }
  },
  star: function(sides, x, y, r1, r2, a = 0) {
    ctx.beginPath();
    ctx.moveTo(x + r1 * Math.cos(a), y + r1 * Math.sin(a));
    const step = Math.PI / sides;
    for (let i = 0; i < sides * 2; i++) {
      a += step;
      const r = (i % 2 ? r1 : r2);
      ctx.lineTo(x + r * Math.cos(a), y + r * Math.sin(a));
    }
  },
  rect_angle: function(x, y, w, h, a, stroke = false) {
    const stored = ctx.getTransform();
    ctx.translate(x, y);
    ctx.rotate(a);
    draw.rectangle(0, 0, w, h);
    if (stroke) ctx.stroke();
    else ctx.fill();
    ctx.setTransform(stored);
  },
  set_font: function(size, modifier, font = "roboto mono") {
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = ((modifier) ? (modifier + " ") : "") + `${round(size)}px ${font}`;
  },
  split_text_: function(text, x, y, w, h, fontsize) {
    const words = text.split(/[ ]+/g);
    const lines = [];
    let line = "";
    let space = "";
    ctx.font = fontsize + "px roboto mono";
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    for (let n = 0; n < words.length; n++) {
      const temp = line + space + words[n];
      space = " ";
      if (ctx.measureText(temp).width > w) {
        lines.push(line);
        line = words[n] + " ";
        space = "";
      } else {
        line = temp;
      }
    }
    lines.push(line);
    return lines;
  },
  split_text: function(text, x, y, w, h, fontsize) {
    fontsize = Math.round(fontsize);
    let lines = [];
    for (const t of text.split("\n")) {
      lines = lines.concat(draw.split_text_(t, x, y, w, h, fontsize));
    }
    const gap = fontsize * 1.286;
    const totaly = gap * (lines.length - 1) + fontsize;
    let yy = y - totaly / 2;
    for (const line of lines) {
      ctx.fillText(line, x, yy);
      yy += gap;
    }
    return lines.length;
  },
  image: function(image, x, y, w, h, flip = false, smooth = false) {
    if (flip) {
      ctx.save();
      ctx.scale(-1, 1);
      x *= -1;
      if ((typeof flip === "number") && flip >= 2) {
        ctx.scale(1, -1);
        y *= -1;
      }
    }
    ctx.imageSmoothingEnabled = smooth;
    ctx.drawImage(typeof image === "string" ? images[image] : image, x - w / 2, y - h / 2, w, h);
    if (flip) ctx.restore();
  },
  reset_transform: function() {
    ctx.resetTransform();
    const r = Math.min(2, window.devicePixelRatio);
    ctx.scale(r, r);
  },

};