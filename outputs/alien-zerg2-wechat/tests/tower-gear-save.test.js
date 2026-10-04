const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared']){const P=require(root+'/progression'),{View}=require(root+'/view');
 test(root+' tower equipment survives save restoration and cold-start View construction',()=>{
 for(const id of Object.keys(P.catalog).map(Number).filter(id=>['antiair','satellite'].includes(P.catalog[id].kind)))for(const key of P.operatorKeys){
 const s=P.fresh(),item=P.createEquipment(id,500,()=>.5);s.level=40;s.xp=123;s.chips=456;s.kryptonite=78;s.operators[key]=true;item.fusionRank=3;item.fusionStats=Object.fromEntries(Object.entries(P.catalog[id].stats).map(([k,v])=>[k,v*1.2]));s.inventory.push(item);s.towerEquipment[key]=item.uid;s.campaignActs={airship3:{act:2,gold:3200,cards:{}}};let raw=JSON.stringify(s);
 for(let i=0;i<3;i++){const restored=P.restore(raw);assert.equal(restored.towerEquipment[key],500);assert.deepEqual(restored.inventory.find(x=>x.uid===500).fusionStats,item.fusionStats);assert.equal(restored.chips,456);assert.equal(restored.kryptonite,78);assert.equal(restored.xp,123);assert.equal(restored.campaignActs.airship3.act,2);assert(!restored.warehouse.includes(500));assert(!restored.overflow.includes(500));const v=new View({}, {pages:[]},390,844,98,{load:()=>restored});raw=JSON.stringify(v.game.saveProgress());}
 }
 });
 test(root+' incompatible tower gear is returned to warehouse without losing it',()=>{const s=P.fresh();s.towerEquipment={'12200:0':1};s.equipped[0]=null;const r=P.restore(s);assert(!r.towerEquipment['12200:0']);assert(r.inventory.some(i=>i.uid===1));assert(r.warehouse.includes(1));});
}
