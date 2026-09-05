import { ctx } from "./index.js";
import { draw } from "./draw.js";
import { papers, allNPC, housers} from "./data.js"
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
};

export class Thing extends Object {

  static things = [];
  static drawall() {
    for (const t of Thing.things) {
      t.draw();
    }
  }

  xcd;
  ycd;
  name;
  sprite;
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
    this.invisible = false;
    this.interactable = false;
    this.sprite = new Image();
  }

  nc(x, y) { //setting coordinate
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

  tick() {
    // todo if it does any animations or anything
  }


  draw() {
    if (this.invisible) return;
    const { x, y } = camera.convert(this.xcd, this.ycd);
    ctx.fillStyle = this.colour;
    ctx.beginPath();
    draw.rectangle(x, y, this.width / camera.scale, this.height / camera.scale);
    ctx.fill();
    ctx.strokeStyle = "#111";
    ctx.stroke();
    ctx.fillStyle = "#111";
    draw.set_font(10);
    ctx.fillText(this.name, x, y);
  }

  interact() {
    // do nothing
  }

  remove() {
    Thing.things.remove(this);
  }

};

export class NPC extends Thing{
    static NPCs = []
    dialogue;
    appear;
    npcID;
    constructor(){
        super();
        this.appear = false
        this.npcID = NPC.NPCs.length
        this.dialogue = allNPC[this.npcID].dialogue
        this.name = allNPC[this.npcID].name
        this.xcd = 300
        this.ycd = 90
        this.interactable = true;
        NPC.NPCs.push(this)
    }
    interact(){
        console.log(this.dialogue)
    }
};

export class Player extends Thing{
    inVENTory;
    constructor(){
        super();
        this.inVENTory = [];
    }
    interact() {
      let m = Number.POSITIVE_INFINITY, thing;
      for (const t of Thing.things) {
        if (!t.invisible && t.interactable && t.touching(this)) {
          const a = Math.abs(t.xcd - this.xcd);
          if (a < m){ m = a; thing = t; }
        }
      }
      thing?.interact();
    }
    deliver(targetnews,targethouse){
        n = this.inVENTory.filter(e => e !== targetnews);
        House.houses[targethouse].newsID = targetnews;
    }
    getback(targethouse){
        this.inVENTory[this.inVENTory.length] = House.houses[targethouse].newsID
    }
}
export const player = new Player();

export class House extends Thing{
    static houses = [];
    houseID;
    newsID;
    constructor(){
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
      if (this.invisible) return;
      const { x, y } = camera.convert(this.xcd, this.ycd);
      ctx.fillStyle = this.colour;
      ctx.beginPath();
      draw.rectangle(x, y, this.width / camera.scale, this.height / camera.scale);
      ctx.fill();
      ctx.strokeStyle = "#111";
      ctx.stroke();
      ctx.fillStyle = "white"
      if (this.newsID != -1) draw.rectangle(x, y, this.width / camera.scale / 2, this.height / camera.scale / 2)
      if (this.newsID != -1) ctx.fill();
      ctx.fillStyle = "#111";
      draw.set_font(10);
      if (this.newsID != -1) ctx.fillText(this.newsID, x, y);
    }
    interact(){
        console.log("house" + String(this.houseID) + "interacted")
        if (this.newsID == -1){
          if(player.inVENTory.length > 0){
            
            // REPLACE THIS WITH PLAYER SELECTED NEWSPAPER
            let x = 0;
            // let x = *INDEX* of playerselected newspaper 
            // INSERT CONFIRMATION FOR NEWSPAPER
            this.newsID = player.inVENTory[x];
            player.inVENTory.remove(player.inVENTory[x]);
          }
          else{
            console.log("no newspaper shrug");
          }
          

        }
        else{

          //ADD CONFIRMATION POPUP FOR RETAKING NEWSPAPER HERE

          //
          player.inVENTory.push(this.newsID);
          this.newsID = -1 ;
          console.log("newspaper retaken");
        }
        
        

    }

}

export class Newspaper extends Thing{
    static newspapers = [];
    newsID;
    pickedUp;
    content;
    constructor(){
        super();
        this.newsID = Newspaper.newspapers.length;
        this.content = papers[this.newsID];
        this.xcd = papers[this.newsID].x;
        this.ycd = 100;
        this.width = 32;
        this.height = 32;
        this.interactable = true;
        this.colour = 'white'
        Newspaper.newspapers.push(this);
    }
    interact(){
        this.pickedUp = true;
        player.inVENTory.push(this.newsID)
        this.invisible = true;
    }
};

for (const _ of papers) new Newspaper();
for (const _ of housers) new House();
for (const _ of allNPC) new NPC();