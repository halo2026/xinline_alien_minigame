const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared'])test(root+' universal slots, level gate and save migration',()=>{
 const P=require(root+'/progression'),{Game}=require(root+'/core'),g=new Game();g.start();g.progress.level=40;
 for(let slot=0;slot<8;slot++){assert(g.collectGear({id:20302}));const item=g.progress.inventory.at(-1);assert(g.equip(item.uid,slot));}
 assert.equal(g.progress.equipped.filter(Boolean).length,8);
 const restored=P.restore(g.saveProgress());assert.deepEqual(restored.equipped,g.progress.equipped);assert.deepEqual(restored.inventory,g.progress.inventory);
 g.collectGear({id:20309});const high=g.progress.inventory.at(-1),before=JSON.stringify(g.progress);g.progress.level=1;
 const slots=[...g.progress.equipped];assert.equal(g.equip(high.uid,0),false);assert.deepEqual(g.progress.equipped,slots);
 for(const id of P.dropIds)for(const random of [()=>0,()=>.5,()=>.99999]){const i=P.createEquipment(id,100,random);assert(P.levelBands[P.equipmentQualities[id]].includes(i.requiredLevel));}
 const legacy=P.fresh();for(const i of legacy.inventory)delete i.requiredLevel;assert(P.restore(legacy).inventory.every(i=>i.requiredLevel===1));
 g.progress.level=40;assert(g.dropGear(high.uid));assert.equal(g.pickups.at(-1).requiredLevel,high.requiredLevel);assert(g.collectGear(g.pickups.at(-1)));assert.equal(g.progress.inventory.at(-1).requiredLevel,high.requiredLevel);
 assert.equal(P.dropIds.filter(id=>P.equipmentQualities[id]===5).length,0);
});
