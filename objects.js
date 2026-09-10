const { World, Shape, Fixture, Body, Contact, Vec2, Box, Circle } = planck;
import { ctx, main, mouse } from "./index.js";
import { images, everything } from "./data.js";
import { draw } from "./draw.js";
import { camera } from "./camera.js";




const SCALE = 100;
const world = new World({
  gravity: new Vec2(0.0, 9.81),
  allowSleep: true,
});

function presolve(f1, f2, contact) {
  const requirement = f1.thing.player && f2.thing.oneway;
  if (!requirement) return;
  if (f2.thing.height >= 10000) return;
  const { x, y } = player.body.getPosition();
  const f2y = f2.thing.ycd / SCALE + f2.thing.height / SCALE / 2 * (f2.thing.height <= 10 ? -1 : 1);
  const v = player.body.getLinearVelocity();
  if (y + player.height / SCALE * 0.49 > f2y || v.y <= 0) contact.setEnabled(false);
}
world.on("pre-solve", function(contact) {
  const f1 = contact.getFixtureA();
  const f2 = contact.getFixtureB();
  presolve(f1, f2, contact);
  presolve(f2, f1, contact);
});



export class Object {
  // this is not java!
  Object() {
    // this is not java!
  }
  // @Override
  // public String toString() {
    // this is not java!
  // }
}



export class Thing extends Object { // why

  static things = [];
  static draw_all() {
    for (const t of Thing.things) {
      if (t.invisible || !t.worldly) continue;
      if (t instanceof Player) continue;
      t.draw();
    }
    player.draw();
  }
  static draw_after() {
    for (const t of Thing.things) {
      if (t.worldly) continue;
      if (t instanceof Player) continue;
      t.draw();
    }
  }
  static tick_physics(dt) {
    world.step(0.016, 8, 3);
    world.clearForces();
  }
  static tick_all(dt) {
    for (const t of Thing.things) {
      t.tick(dt);
    }
  }
  static remove_all() {
    for (const t of Thing.things) {
      if (t instanceof Player) continue;
      t.remove();
    }
  }
  static load_level() {
    Thing.remove_all();
    const L = everything;
    for (const _ of L.decoration ?? []) new Decoration(_);
    for (const _ of L.houses ?? []) new House(_);
    for (const _ of L.boxes ?? []) new Rectangle(_);
    for (const _ of L.npcs ?? []) new NPC(_);
    for (const _ of L.papers ?? []) new Newspaper(_);
    if (!player) player = new Player();
    if (main.level > 1) {
      player.teleport(0, -1000 * (main.level - 1));
      setTimeout(camera.jump, 30);
    }
    Thing.collect_news();
    // hack
    for (const n of NPC.NPCs) {
      if (n.level === main.level && n.sprite === "npc0") {
        n.interact();
        n.dialogue = ["A / D to move left and right. Enter to interact/talk. Double click or F to view newspapers. [Click], Q, or use number keys to switch newspapers. To deliver a newspaper, select one and interact with a house.", "Once you're done, talk to me to check your answer!"];
      }
    }
  }
  static collect_news() {
    for (const n of Newspaper.newspapers) {
      n.drop();
    }
    for (const n of Newspaper.newspapers) {
      if (main.level !== n.level) continue;
      n.interact();
    }
  }

  xcd;
  ycd;
  name;
  body;
  level;
  width;
  height;
  colour;
  sprite;
  target;
  facing;
  #worldly;
  hovering;
  invisible;
  interactable;

  constructor() {
    super();
    Thing.things.push(this);
    this.xcd = 0;
    this.ycd = 0;
    this.name = "";
    this.level = 0;
    this.width = 0; // ??
    this.height = 0;
    this.colour = "red"; // temporary
    this.facing = false;
    this.sprite = false;
    this.#worldly = true;
    this.invisible = false;
    this.interactable = false;
  }

  load(o) {
    if (o.name != null) this.name = o.name;
    if (o.level != null) {
      this.level = o.level;
      if (o.y != null) o.y -= (this.level - 1) * 1e3;
    }
    if (o.sprite != null) this.sprite = o.sprite;
    if (o.flip != null) this.facing = o.flip;
    if (o.x != null) this.xcd = o.x;
    if (o.y != null) this.ycd = o.y;
    if (o.w != null) this.width = o.w;
    if (o.h != null) this.height = o.h;
    if (o.c != null) this.colour = o.c;
  }

  nc(x, y) { // setting coordinate
    this.xcd = x;
    this.ycd = y;
  }

  move(dx, dy) {
    if (this.body) {
      const x = dx;
      const y = dy;
      this.body.applyForce(new Vec2(x, y), this.body.getPosition());
    } else {
      this.xcd += dx;
      this.ycd += dy;
    }
  }

  touching(other) {
    // add back ycd requirement when jumping is introduced (not if but when :) )
    return Math.abs(this.xcd - other.xcd) <= (this.width + other.width) / 2 && Math.abs(this.ycd - other.ycd) <= (this.height + other.height) / 2;
  }

  get screenv() {
    return (this.worldly) ? camera.convert(this.xcd, this.ycd) : { x: this.xcd, y: this.ycd };
  }

  get worldly() {
    return this.#worldly;
  }

  set worldly(w) {
    if (this.#worldly === w) return;
    if (!w) this.nc(this.screenv.x, this.screenv.y);
    else {
      const { x, y } = camera.convertback(this.xcd, this.ycd);
      this.nc(x, y);
    }
    this.#worldly = w;
  }

  tick() {
    // todo if it does any animations or anything
    if (this.target) {
      if (this.target.x) this.xcd = camera.lerp(this.xcd, this.target.x, this.target.s ?? 0.1);
      if (this.target.y) this.ycd = camera.lerp(this.ycd, this.target.y, this.target.s ?? 0.1);
    } else if (this.body) {
      const { x, y } = this.body.getPosition();
      this.nc(x * SCALE, y * SCALE);
    }
  }

  draw() {
    const { x, y } = this.screenv;
    if (this.sprite) {
      draw.image(images[this.sprite], x, y, this.width / camera.size, this.height / camera.size, this.facing);
      ctx.beginPath();
      draw.rectangle(x, y, this.width / camera.size, this.height / camera.size);
    } else {
      ctx.fillStyle = this.colour;
      ctx.beginPath();
      draw.rectangle(x, y, this.width / camera.size, this.height / camera.size);
      ctx.fill();
    }
    this.hovering = mouse.hovering();
    if (this.hovering) {
      if (mouse.check()) {
        this.click();
      }
      if (mouse.check(true)) {
        this.doubleclick();
      }
      if (!this.#worldly) {
        ctx.strokeStyle = "#111";
        ctx.lineWidth = Math.max(2, main.size * 0.005);
        ctx.stroke();
      }
    }
    ctx.fillStyle = "#111";
    draw.set_font(this.width / camera.size / 5);
    ctx.fillText(this.name, x, y);
    return { x, y };
  }

  create() {
    // do nothing
  }

  interact() {
    // do nothing
  }

  click() {
    // do nothing
  }

  doubleclick() {
    // do nothing
  }

  remove() {
    Thing.things.remove(this);
    if (this.body) {
      world.destroyBody(this.body);
    }
  }

}



export class NPC extends Thing {

  static NPCs = [];
  dialogue;
  appear;
  npcID;

  constructor(o) {
    super();
    this.appear = false;
    this.npcID = NPC.NPCs.length;
    this.load(o);
    this.dialogue = o.dialogue;
    this.interactable = true;
    NPC.NPCs.push(this);
  }

  interact() {
    if ((camera.talktext === this.dialogue || this.sprite === "npc0") && camera.talkmode) {
      camera.talknext();
    } else {
      if (this.sprite === "npc0") {
        if (House.all_in()) {
          if (House.check()) {
            this.dialogue = ["all correct, yay!"];
            player.launch();
          } else {
            this.dialogue = ["it seems like something's awry"];
          }
        }
      }
      camera.talkmode = true;
      camera.talktext = this.dialogue;
      camera.talkindex = 0;
    }
  }

  draw() {
    if (!this.sprite.startsWith("sparkle")) return super.draw();
    const { x, y } = this.screenv;
    this.sprite = "sparkle" + (1 + Math.floor((main.time / 40) % 7));
    draw.image(images[this.sprite], x, y, this.width / camera.size, this.height / camera.size, this.facing);
  }

  remove() {
    NPC.NPCs.remove(this);
  }

}


export class Player extends Thing {

  player;
  jumping;
  jumpable;
  inVENTory;
  inVENTdex;

  constructor() {
    super();
    this.player = true;
    this.jumping = 0;
    this.jumpable = 0;
    this.inVENTory = [];
    this.inVENTdex = -1;
    this.name = "";
    this.sprite = "arvind1";
    this.width = 25;
    this.height = 50;
    this.nc(0, 100);
    this.create();
  }

  draw() {
    const { x, y } = this.screenv;
    const dx = this.body?.getLinearVelocity().x;
    if (dx && Math.abs(dx) > 0.1) this.facing = dx < 0;
    if (this.jumpable && Math.abs(dx) > 1) this.sprite = "arvind" + (1 + Math.floor((main.time / (this.sprinting ? 50 : 90)) % 4));
    else this.sprite = "arvind1";
    draw.image(images[this.sprite], x, y, this.width / camera.size, this.height / camera.size, this.facing);
  }

  interact() {
    let m = Number.POSITIVE_INFINITY, thing;
    for (const t of Thing.things) {
      if (!t.invisible && t.interactable && t !== this && t.touching(this)) {
        const a = Math.abs(t.xcd - this.xcd);
        if (a < m) {
          m = a;
          thing = t;
        }
      }
    }
    if (camera.talkmode) {
      camera.talknext();
      return;
    }
    thing?.interact();
  }

  create() {
    this.body = world.createBody({
      type: "dynamic",
      position: new Vec2(this.xcd / SCALE, this.ycd / SCALE),
      angle: 0,
      allowSleep: false,
      awake: true,
      fixedRotation: true,
      linearDamping: 0.5,
      angularDamping: 0,
    });
    const f = this.body.createFixture({
      shape: new Box(0.49 * this.width / SCALE, 0.49 * this.height / SCALE),
      // shape: new Circle(0.49 * this.width / SCALE),
      density: 1,
      friction: 0.3,
    });
    this.fixture = f;
    f.thing = this;
  }

  tick() {
    super.tick();
    const v = this.body.getLinearVelocity();
    this.body.setLinearVelocity(Vec2(v.x * 0.7, v.y));
    const x = this.xcd / SCALE, y = (this.ycd + 0.49 * this.height) / SCALE, w = 0.4 * this.width / SCALE;
    let closest = null;
    for (const xx of [x, x - w, x + w]) {
      world.rayCast(Vec2(xx, y), Vec2(xx, y + 0.03), function(fixture, point, normal, fraction) {
        closest = true;
        return fraction;
      });
    }
    if (closest) this.jumpable = true;
    this.sprinting = main.keys.Shift && this.jumpable;
    const dx = (this.sprinting ? 2 : 1) * ((main.keys["KeyA"] || main.keys["ArrowLeft"]) ? -1 : (main.keys["KeyD"] || main.keys["ArrowRight"]) ? 1: 0);
    const dy = (main.keys["KeyW"] || main.keys["ArrowUp"]) ? 0 : (main.keys["KeyS"] || main.keys["ArrowDown"]) ? 1: 0;
    player.move(dx * 6, dy * 5);
    if (main.keys["KeyW"] || main.keys["Space"]) {
      player.jump();
    }
  }

  jump() {
    if (!this.jumpable || main.time - this.jumptime < 100) return;
    this.jumpable = false;
    this.jumptime = main.time;
    const vx = player.body.getLinearVelocity().x;
    player.body.setLinearVelocity({ x: vx, y: 0 });
    player.move(0, -30);
  }

  launch() {
    main.level++;
    const vx = player.body.getLinearVelocity().x;
    player.body.setLinearVelocity({ x: vx, y: 0 });
    player.move(0, -133);
    Thing.collect_news();
  }

  teleport(dx, dy) {
    const { x, y } = player.body.getPosition();
    player.body.setPosition( { x: x + dx / SCALE, y: y + dy / SCALE });
  }

}



export class House extends Thing {

  static houses = [];
  static check() {
    for (const h of House.houses) {
      if (h.level !== main.level) continue;
      if (h.expected !== h.newsID) return false;
    }
    return true;
  };
  static all_in() {
    for (const n of Newspaper.newspapers) {
      if (n.level !== main.level) continue;
      if (n.house == undefined || n.house.houseID === -1) return false;
    }
    return true;
  };

  newsID;
  houseID;
  expected;

  constructor(o) {
    super();
    this.colour = "green";
    this.houseID = House.houses.length;
    this.load(o);
    this.expected = o.ans;
    this.newsID = -1;
    this.interactable = true;
    House.houses.push(this);
  }

  remove()  {
    House.houses.remove(this);
  }

  // draw() {
  //   const { x, y } = super.draw();
  //   ctx.fillStyle = "#eee";
  //   if (this.newsID !== -1) draw.rectangle(x, y, this.width / camera.size / 2, this.height / camera.size / 2);
  //   if (this.newsID !== -1) ctx.fill();
  //   ctx.fillStyle = "#111";
  //   draw.set_font(10);
  //   if (this.newsID != -1) ctx.fillText(this.newsID, x, y);
  //   return { x, y };
  // }

  interact() {
    if (this.width < 100) {
      camera.menumode = true;
      Thing.remove_all();
      player.remove();
      player = undefined;
      return;
    }
    if (this.newsID === -1) {
      const index = player.inVENTory.length === 1 ? 0 : player.inVENTdex;
      if (player.inVENTory.length > 0 && index >= 0) {
        // REPLACE THIS WITH PLAYER SELECTED NEWSPAPER
        // let x = *INDEX* of playerselected newspaper
        // INSERT CONFIRMATION FOR NEWSPAPER
        // (probably no need confirm, because if the player selected it, it's already a quite confirmed action)
        this.newsID = player.inVENTory[index];
        const newspaper = Newspaper.newspapers[this.newsID];
        newspaper.drop();
        newspaper.house = this;
        newspaper.target = { x: this.xcd, y: this.ycd + this.height / 2 + 10 };
        this.interactable = false;
        if (player.inVENTory.length > 0) Newspaper.newspapers[player.inVENTory[Math.max(0, player.inVENTdex - 1)]].click();
        House.check();
      }
    }
  }

}

export class Newspaper extends Thing {

  static newspapers = [];
  house;
  newsID;
  content;
  pickedUp;

  constructor(o) {
    super();
    this.newsID = Newspaper.newspapers.length;
    o.y ??= 100;
    o.w ??= 32;
    o.h ??= 32;
    this.load(o);
    this.content = o.image;
    this.interactable = true;
    this.colour = "white";
    Newspaper.newspapers.push(this);
  }

  draw() {
    const { x, y } = super.draw();
    if (this.selected) {
      ctx.strokeStyle = "lime";
      ctx.lineWidth = Math.max(2, main.size * 0.005);
      ctx.stroke();
    }
    ctx.fillStyle = "#111";
    draw.set_font(this.width / camera.size / 2);
    if (this.newsID !== -1) ctx.fillText("ABCABCABCD"[this.newsID], x, y);
    return { x, y };
  }

  interact() {
    this.pick();
    if (this.house) {
      this.house.newsID = -1;
      this.house.interactable = true;
      delete this.house;
    }
  }

  click() {
    if (this.worldly) return;
    for (const newspaper of Newspaper.newspapers) {
      newspaper.selected = false;
    }
    this.selected = true;
    player.inVENTdex = player.inVENTory.indexOf(this.newsID);
  }

  doubleclick() {
    if (this.worldly) return;
    camera.newsmode = true;
  }

  pick() {
    this.pickedUp = true;
    this.worldly = false;
    this.selected = false;
    this.interactable = false;
    player.inVENTory.push(this.newsID);
    if (player.inVENTory.length <= 1) this.click();
  }

  drop() {
    player.inVENTdex = -1;
    this.pickedUp = false;
    this.worldly = true;
    this.selected = false;
    this.interactable = true;
    player.inVENTory.remove(this.newsID);
    if (camera.newsmode) camera.newsmode = false;
  }

  remove() {
    Newspaper.newspapers.remove(this);
  }

}



export class Rectangle extends Thing {

  oneway;

  constructor(o) {
    super();
    this.load(o);
    this.oneway = true;
    if (!o.nobody) this.create();
  }

  create() {
    this.body = world.createBody({
      type: "static",
      position: new Vec2(this.xcd / SCALE, this.ycd / SCALE),
      angle: 0,
    });
    const f = this.body.createFixture({
      shape: new Box(this.width / SCALE / 2, this.height / SCALE / 2),
    });
    this.fixture = f;
    f.thing = this;
  }

}



export class Decoration extends Thing {

  constructor(o) {
    super();
    this.load(o);
  }

}


export let player;