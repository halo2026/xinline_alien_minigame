const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../shared/progression'),{Game}=require('../shared/core');
test('ram tiers retain collision damage and no longer grant armor',()=>{
 for(let tier=1;tier<=4;tier++){
  const g=new Game();g.progress.level=20;g.progress.inventory=[{id:41040+tier,uid:1}];g.progress.equipped=[1];g.applyEquipment();
  assert.equal(g.player.armor,0);assert.ok(P.equipmentStats(g.progress.inventory[0]).ram_damage>0);
  assert.equal(P.equipmentInfo(g.progress.inventory[0]).rows.some(r=>r.key==='def_physic'),false);
  const hp=g.player.hp;g.hurt(g.player,180);assert.equal(g.player.hp,hp-180*g.challengeMultiplier);
  g.progress.equipped=[];g.applyEquipment();assert.equal(g.player.armor,0);
 }
});
test('legacy fused ram saves preserve collision stats but ignore old armor',()=>{
 const g=new Game();g.progress.level=20;g.progress.inventory=[{id:41044,uid:1,fusionStats:{ram_damage:1000,def_physic:100}}];g.progress.equipped=[1];g.applyEquipment();
 const restored=new Game({progress:P.restore(g.progress)});assert.equal(restored.player.armor,0);
 assert.equal(P.equipmentStats(restored.progress.inventory.find(i=>i.uid===1)).ram_damage,1000);
 assert.equal(P.equipmentStats(restored.progress.inventory.find(i=>i.uid===1)).def_physic,undefined);
});
