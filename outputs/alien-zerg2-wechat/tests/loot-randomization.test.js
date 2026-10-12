const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared']){
 const P=require(root+'/progression'),{Game}=require(root+'/core');
 test(root+' generated equipment varies ±20%, levels vary, restores exactly',()=>{
  for(const id of Object.keys(P.catalog).map(Number)){
   const low=P.createEquipment(id,4,()=>0),high=P.createEquipment(id,5,()=>.999999);
   for(const [key,value] of Object.entries(P.catalog[id].stats)){assert.equal(P.equipmentStats(low)[key],Math.round(value*.8));assert.equal(P.equipmentStats(high)[key],Math.round(value*1.2));}
   assert(P.requiredLevel(high)>P.requiredLevel(low));
   const s=P.fresh();s.inventory.push(low,high);s.warehouse[1]=4;s.warehouse[2]=5;s.nextUid=6;
   const restored=P.restore(JSON.parse(JSON.stringify(s)));
   for(const i of [low,high]){const r=restored.inventory.find(x=>x.uid===i.uid);assert.equal(P.requiredLevel(r),P.requiredLevel(i));assert.deepEqual(P.equipmentStats(r),P.equipmentStats(i));}
  }
  assert.deepEqual(P.equipmentStats({id:41003}),P.catalog[41003].stats);
 });
 test(root+' gold chest probability reduced exactly 15% with red preserved',()=>{
  let gold=0,red=0;
  for(let branch=0;branch<21;branch++)for(let entry=0;entry<27;entry++)for(let reroll=0;reroll<20;reroll++){
   const values=[(branch+.5)/21,(entry+.5)/27,(reroll+.5)/20,.5];let i=0;
   const id=P.chestEquipmentId(()=>values[i++]);gold+=P.equipmentQualities[id]===3;red+=P.equipmentQualities[id]===5;
  }
  assert.equal(gold,20*9*17);assert.equal(red,27*20);
 });
 test(root+' early kills never drop quotas, eligible kills random, victory preserves quota',()=>{
  const g=new Game({seed:98765});g.hasGround=()=>true;g.nav.blocked=()=>false;g.wave=1;
  g.runLoot={gear:1,chests:2,pending:[{kind:'chest',wave:1},{kind:'chest',wave:1},{kind:'gear',wave:1}]};
  g.random=()=>0;
  for(g.kills=1;g.kills<12;g.kills++)g.dropRunLoot({x:500,y:500});
  assert.equal(g.pickups.length,0);g.random=()=>.5;g.dropRunLoot({x:500,y:500});assert.equal(g.pickups.length,0);
  g.random=()=>0;g.dropRunLoot({x:500,y:500});assert.equal(g.runLoot.pending.length,2);
  g.dropRunLoot({x:500,y:500},true);assert.equal(g.runLoot.pending.length,0);assert.equal(g.pickups.filter(x=>x.lootChest).reduce((n,x)=>n+x.count,0),2);assert.equal(g.pickups.filter(x=>x.gear).length,1);
 });
 test(root+' ground pickup and discard preserve full item without reroll',()=>{
  const g=new Game();g.hasGround=()=>true;g.nav.blocked=()=>false;g.nav.clear=()=>true;g.random=()=>0;
  g.addGroundPickup({gear:true,id:41003,x:500,y:500});const drop=g.pickups.at(-1),stats=P.equipmentStats(drop.equipment);g.random=()=>.999999;
  assert(g.collectGear(drop));let item=g.progress.inventory.filter(i=>P.catalog[i.id]).at(-1);assert.deepEqual(P.equipmentStats(item),stats);const level=P.requiredLevel(item);assert(g.dropGear(item.uid));const again=g.pickups.at(-1);assert(g.collectGear(again));item=g.progress.inventory.filter(i=>P.catalog[i.id]).at(-1);assert.deepEqual(P.equipmentStats(item),stats);assert.equal(P.requiredLevel(item),level);
 });
 test(root+' chest reward details retain actual random equipment after save',()=>{
  const g=new Game();g.progress.inventory.push({id:P.CHEST_ID,uid:g.progress.nextUid++,count:1});let n=0;g.random=()=>[0,.99,.5,.1,0,0,0][n++]??0;
  const result=g.openChests(1),r=result.rewards.find(r=>r.kind==='gear');assert(r);const item=g.progress.inventory.filter(i=>P.catalog[i.id]).at(-1);assert.deepEqual(P.equipmentStats(r),P.equipmentStats(item));const saved=P.restore(g.progress);assert.deepEqual(P.equipmentStats(saved.pendingChestRewards.rewards.find(r=>r.kind==='gear')),P.equipmentStats(item));
 });
}
