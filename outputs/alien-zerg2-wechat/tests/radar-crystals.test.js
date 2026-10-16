const test=require('node:test'),assert=require('node:assert/strict');
function radarSave(P){const s=P.fresh();s.level=5;s.inventory.push({id:20301,uid:4,requiredLevel:5});s.nextUid=5;s.equipped[2]=4;return s;}

for(const root of ['../shared'])test(root+' radar applies carry only at entry and yield at pickup',()=>{
 const {Game}=require(root+'/core'),P=require(root+'/progression'),g=new Game({progress:radarSave(P)}),base=g.gold;const uid=g.progress.inventory.find(i=>i.id===20301).uid,slot=g.progress.equipped.indexOf(uid);
 g.start();assert.equal(g.gold,base+110);g.start();assert.equal(g.gold,base+110);
 assert(g.unequip(slot));assert.equal(g.gold,base+110);assert(g.equip(uid,slot));assert.equal(g.gold,base+110);g.applyEquipment(true);assert.equal(g.gold,base+110);
 g.take({crystals:100});assert.equal(g.gold,base+221);g.unequip(slot);g.take({crystals:100});assert.equal(g.gold,base+321);
 g.equip(uid,slot);g.take({crystals:100,towerSalvage:true});assert.equal(g.gold,base+421);
 const no=radarSave(P);const r=no.inventory.find(i=>i.id===20301);no.equipped[no.equipped.indexOf(r.uid)]=null;no.warehouse[0]=r.uid;const fresh=new Game({progress:no}),b=fresh.gold;fresh.start();assert.equal(fresh.gold,b);fresh.equip(r.uid,0);assert.equal(fresh.gold,b);
 if(g.retry&&g.saveAct){g.gold=1234;g.saveAct(2);g.wave=12;g.state='lost';g.secondActStartGold=1234;const retry=g.retry();assert.equal(retry.gold,1234);assert.equal(retry.entryCrystalBonus,0);}
});
for(const root of ['../shared'])test(root+' kills use current radar rate once',()=>{
 const {Game}=require(root+'/core'),D=require(root+'/level-data'),P=require(root+'/progression'),g=new Game({progress:radarSave(P)});g.start();
 const uid=g.progress.inventory.find(i=>i.id===20301).uid,slot=g.progress.equipped.indexOf(uid),base=D.unitTypes[12500].attr.kill_gold;
 const enemy=()=>({id:12500,x:500,y:500,scale:1,angle:0,age:4,hp:0});
 let before=g.gold,e=enemy();g.kill(e);assert.equal(g.gold-before,Math.floor(base*1.11));before=g.gold;g.kill(e);assert.equal(g.gold,before);
 g.unequip(slot);before=g.gold;g.kill(enemy());assert.equal(g.gold-before,base);
 g.equip(uid,slot);g.progress.inventory.find(i=>i.uid===uid).fusionRank=1;before=g.gold;g.kill(enemy());assert.equal(g.gold-before,Math.floor(base*1.12));
});
