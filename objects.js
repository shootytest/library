import { ctx } from "./index.js";
import { papers, allNPC, housers } from "./data.js";
import { draw } from "./draw.js";
import { camera } from "./camera.js";


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
      if (t.invisible) continue;
      t.draw();
    }
  }
  static tick_all() {
    for (const t of Thing.things) {
      t.tick();
    }
  }

  xcd;
  ycd;
  target;
  name;
  sprite;
  #worldly;
  invisible;
  interactable;

  constructor() {
    super();
    Thing.things.push(this);
    this.xcd = -1;
    this.ycd = -1;
    this.name = "";
    this.width = 32; // ??
    this.height = 32;
    this.colour = "red"; // temporary
    this.#worldly = true;
    this.invisible = false;
    this.interactable = false;
    this.sprite = new Image();
  }

  nc(x, y) { // setting coordinate
    this.xcd = x;
    this.ycd = y;
  }

  move(x, y) {
    this.xcd += x;
    this.ycd += y;
  }

  touching(other) {
    // add back ycd requirement when jumping is introduced (not if but when :) )
    return Math.abs(this.xcd - other.xcd) <= (this.width + other.width) / 2;// && Math.abs(this.ycd - other.ycd) <= (this.height + other.height) / 2;
  }

  get screenv() {
    return (this.worldly) ? camera.convert(this.xcd, this.ycd) : { x: this.xcd, y: this.ycd };
  }

  get worldly() {
    return this.#worldly;
  }

  set worldly(w) {
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
    }
  }

  draw() {
    const { x, y } = this.screenv;
    ctx.fillStyle = this.colour;
    ctx.beginPath();
    draw.rectangle(x, y, this.width / camera.size, this.height / camera.size);
    ctx.fill();
    ctx.fillStyle = "#111";
    draw.set_font(10);
    ctx.fillText(this.name, x, y);
    return { x, y };
  }

  interact() {
    // do nothing
  }

  remove() {
    Thing.things.remove(this);
  }

}



export class NPC extends Thing {

  static NPCs = [];
  dialogue;
  appear;
  npcID;

  constructor() {
    super();
    this.appear = false;
    this.npcID = NPC.NPCs.length;
    this.dialogue = allNPC[this.npcID].dialogue;
    this.name = allNPC[this.npcID].name;
    this.xcd = 300;
    this.ycd = 90;
    this.interactable = true;
    NPC.NPCs.push(this);
  }

  interact() {
    console.log(this.dialogue);
  }

}



export class Player extends Thing {

  inVENTory;

  constructor() {
    super();
    this.inVENTory = [];
  }

  interact() {
    let m = Number.POSITIVE_INFINITY, thing;
    for (const t of Thing.things) {
      if (!t.invisible && t.interactable && t.touching(this)) {
        const a = Math.abs(t.xcd - this.xcd);
        if (a < m) {
          m = a;
          thing = t;
        }
      }
    }
    thing?.interact();
  }

  // deliver(targetnews, targethouse) {
  //   n = this.inVENTory.filter(e => e !== targetnews);
  //   House.houses[targethouse].newsID = targetnews;
  // }

  // getback(targethouse) {
  //   this.inVENTory[this.inVENTory.length] = House.houses[targethouse].newsID;
  // }

}

export const player = new Player();



export class House extends Thing {

  static houses = [];
  houseID;
  newsID;

  constructor() {
    super();
    this.colour = "green";
    this.houseID = House.houses.length;
    this.xcd = housers[this.houseID].x;
    this.ycd = housers[this.houseID].y;
    this.newsID = -1;
    this.interactable = true;
    House.houses.push(this);
  }

  remove() {
    console.error("don't delete houses this might break stuff");
  }

  draw() {
    const { x, y } = super.draw();
    ctx.fillStyle = "#eee";
    if (this.newsID !== -1) draw.rectangle(x, y, this.width / camera.size / 2, this.height / camera.size / 2);
    if (this.newsID !== -1) ctx.fill();
    ctx.fillStyle = "#111";
    draw.set_font(10);
    if (this.newsID != -1) ctx.fillText(this.newsID, x, y);
    return { x, y };
  }

  interact() {
    console.log("house " + String(this.houseID) + " interacted");
    if (this.newsID == -1) {
      if (player.inVENTory.length > 0) {
        // REPLACE THIS WITH PLAYER SELECTED NEWSPAPER
        let x = 0;
        // let x = *INDEX* of playerselected newspaper
        // INSERT CONFIRMATION FOR NEWSPAPER
        // (probably no need confirm, because if the player selected it, it's already a quite confirmed action)
        this.newsID = player.inVENTory[x];
        const newspaper = Newspaper.newspapers[this.newsID];
        newspaper.drop();
        newspaper.target = { x: this.xcd, y: this.ycd };
      } else {
        console.log("no newspaper shrug");
      }
    }
    else {
      // ADD CONFIRMATION POPUP FOR RETAKING NEWSPAPER HERE
      // (also probably no need)
      Newspaper.newspapers[this.newsID].pick();
      this.newsID = -1;
      console.log("newspaper retaken");
    }
  }

}

export class Newspaper extends Thing {

  static newspapers = [];
  newsID;
  pickedUp;
  content;

  constructor() {
    super();
    this.newsID = Newspaper.newspapers.length;
    this.content = papers[this.newsID];
    this.xcd = papers[this.newsID].x;
    this.ycd = 100;
    this.width = 32;
    this.height = 32;
    this.interactable = true;
    this.colour = "white";
    Newspaper.newspapers.push(this);
  }

  draw() {
    const { x, y } = super.draw();
    ctx.fillStyle = "#111";
    draw.set_font(10);
    if (this.newsID != -1) ctx.fillText(this.newsID, x, y);
    return { x, y };
  }

  interact() {
    this.pick();
  }

  pick() {
    this.pickedUp = true;
    this.worldly = false;
    player.inVENTory.push(this.newsID);
  }

  drop() {
    this.pickedUp = false;
    this.worldly = true;
    player.inVENTory.remove(this.newsID);
  }

}



for (const _ of papers) new Newspaper();
for (const _ of housers) new House();
for (const _ of allNPC) new NPC();