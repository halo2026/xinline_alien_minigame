const test=require('node:test'),assert=require('node:assert/strict'),P=require('../shared/progression'),{Game}=require('../shared/core'),{View}=require('../shared/view');
test('legacy five-slot saves migrate into matching eight slots without losing XP or items',()=>{
 const legacy={...P.fresh(),version:1,level:18,xp:177,equipped:[1,2,3,4,5]};delete legacy.warehouse;const s=P.restore(legacy);assert.equal(s.version,5);assert.equal(s.equipped.length,8);assert.equal(s.warehouse.length,24);assert.equal(s.level,18);assert.equal(s.xp,177);assert.equal(s.inventory.length,5);
 for(let i=0;i<8;i++)if(s.equipped[i])assert.equal(P.catalog[s.inventory.find(x=>x.uid===s.equipped[i]).id].type,P.slotType(i));assert.equal(s.equipped.filter(Boolean).length,5);assert.deepEqual(P.restore(s),s);
});
test('wrong category is rejected atomically; each category supports their matching slot counts',()=>{
 const g=new Game();g.collectGear({id:20302});const uid=g.progress.inventory.at(-1).uid,before=g.saveProgress();assert.equal(g.equip(uid,3),false);assert.deepEqual(g.saveProgress(),before);assert.match(g.gearError,/类型/);
 for(const [id,start] of [[20302,0],[20204,2],[20203,4],[20217,6]])for(let i=0;i<2;i++){g.collectGear({id});assert.ok(g.equip(g.progress.inventory.at(-1).uid,start+i));}
 assert.equal(g.progress.equipped.filter(Boolean).length,8);
});
test('24 warehouse cells exclude worn gear; full warehouse prevents pickup and unequip but permits replacement',()=>{
 const g=new Game();for(let i=0;i<24;i++)assert.ok(g.collectGear({id:20204}));assert.equal(g.collectGear({id:20204}),false);assert.equal(g.progress.inventory.length,29);assert.equal(g.unequip(3),false);const uid=g.progress.warehouse[0],old=g.progress.equipped[3];assert.ok(g.equip(uid,3));assert.equal(g.progress.warehouse[0],old);assert.equal(g.progress.warehouse.filter(Boolean).length,24);
});
test('discard frees one warehouse cell, leaves one world item and can be picked up exactly once',()=>{
 const g=new Game();g.start();g.pending=[];g.nextWave=Infinity;g.yoda.hp=0;g.player.fireCd=100;g.collectGear({id:20302});const uid=g.progress.inventory.at(-1).uid,total=g.progress.inventory.length;assert.ok(g.dropGear(uid));assert.equal(g.progress.inventory.length,total-1);assert.equal(g.dropGear(uid),false);assert.equal(g.pickups.filter(i=>i.gear).length,1);g.update(.05);assert.equal(g.pickups.length,1);
 const drop=g.pickups[0];g.time=3;drop.requiresLeave=false;g.player.x=drop.x;g.player.y=drop.y;g.update(.01);assert.equal(g.pickups.length,0);assert.equal(g.progress.inventory.length,total);g.update(.01);assert.equal(g.progress.inventory.length,total);assert.deepEqual(P.restore(g.saveProgress()),g.saveProgress());
});
test('legacy overflow is retained, not truncated, and fills a newly freed warehouse cell',()=>{let s=P.fresh();s.version=1;s.equipped=[];s.inventory=Array.from({length:70},(_,i)=>({uid:i+1,id:20204}));s=P.restore(s);assert.equal(s.inventory.length,70);assert.equal(s.warehouse.filter(Boolean).length,24);assert.equal(s.overflow.length,46);const g=new Game({progress:s});g.dropGear(g.progress.warehouse[0]);assert.equal(g.progress.overflow.length,45);assert.equal(g.progress.warehouse.filter(Boolean).length,24);});
test('sketch layout opens contextual detail, equips and unequips',()=>{
 const ctx=new Proxy({},{get:()=>()=>{}}),v=new View(ctx,{terrain:{},pages:[]},390,844,80);v.inventoryOpen=true;v.game.collectGear({id:20302});const L=v.gearLayout();assert.equal(L.slots.length,8);assert.ok(L.cell>=40);assert.ok(L.gridY+4*L.cell<844-45);v.draw();v.down(1,L.gridX+L.cell/2,L.gridY+L.cell/2);v.up(1);const uid=v.selectedGear;assert.equal(uid,v.game.progress.warehouse[0]);v.draw();const R=v.gearDetailLayout();v.down(1,R.x+45,R.y+356);assert.equal(v.game.progress.equipped[0],uid);assert.equal(v.selectedGear,null);v.down(1,L.slots[0].x+10,L.slots[0].y+10);v.up(1);assert.equal(v.selectedGear,uid);v.down(1,R.x+R.w-45,R.y+356);assert.equal(v.game.progress.equipped[0],null);assert.ok(v.game.progress.warehouse.includes(uid));
});
test('version two reduction preserves every item and remaps category slots',()=>{const old={...P.fresh(),version:2,inventory:Array.from({length:76},(_,i)=>({uid:i+1,id:[20302,20204,20203,20217][Math.min(3,Math.floor(i/3))]})),equipped:Array.from({length:12},(_,i)=>i+1),warehouse:Array.from({length:64},(_,i)=>i+13)};const s=P.restore(old);assert.equal(s.inventory.length,76);assert.equal(s.equipped.filter(Boolean).length,8);assert.equal(s.warehouse.filter(Boolean).length,24);assert.equal(s.overflow.length,44);assert.equal(new Set([...s.equipped,...s.warehouse,...s.overflow]).size,76);assert.deepEqual(P.restore(s),s);});

test('warehouse drag equips empty slots, swaps occupied slots, rejects mismatches and cancels safely',()=>{
 const v=new View(new Proxy({},{get:()=>()=>{}}),{pages:[]},390,844,40);v.inventoryOpen=true;const g=v.game,L=v.gearLayout();
 function drag(index,slot,cancel=false){const x=L.gridX+(index%6+.5)*L.cell,y=L.gridY+(Math.floor(index/6)+.5)*L.cell,r=L.slots[slot];v.down(7,x,y);v.motion(7,r.x+10,r.y+10);assert.equal(v.selectedGear,null);v.up(7,r.x+10,r.y+10,cancel);}
 g.collectGear({id:20302});const first=g.progress.warehouse[0];drag(0,0);assert.equal(g.progress.equipped[0],first);g.collectGear({id:20102});const second=g.progress.warehouse[0];drag(0,0);assert.equal(g.progress.equipped[0],second);assert.equal(g.progress.warehouse[0],first);
 const before=g.saveProgress();drag(0,3);assert.deepEqual(g.saveProgress(),before);drag(0,1,true);assert.deepEqual(g.saveProgress(),before);assert.equal(v.gearDrag,null);
});

test('worn drag returns to target warehouse cell; occupied target finds free space and full bag retains gear',()=>{
 const v=new View(new Proxy({},{get:()=>()=>{}}),{pages:[]},390,844,40);v.inventoryOpen=true;const g=v.game,L=v.gearLayout(),uid=g.progress.equipped[3];
 function back(cell,cancel=false){const r=L.slots[3],x=L.gridX+(cell%6+.5)*L.cell,y=L.gridY+(Math.floor(cell/6)+.5)*L.cell;v.down(9,r.x+10,r.y+10);v.motion(9,x,y);v.up(9,x,y,cancel);}
 back(17,true);assert.equal(g.progress.equipped[3],uid);back(17);assert.equal(g.progress.warehouse[17],uid);assert.equal(g.progress.equipped[3],null);g.equip(uid,3);g.collectGear({id:20102});const other=g.progress.warehouse[0];back(0);assert.equal(g.progress.warehouse[0],other);assert.equal(g.progress.warehouse[1],uid);g.equip(uid,3);while(g.progress.warehouse.includes(null))g.collectGear({id:20102});const before=g.saveProgress();back(5);assert.deepEqual(g.saveProgress(),before);assert.match(g.gearError,/仓库已满/);
});

test('nine-slot save migrates third turret into warehouse while preserving allocation',()=>{let s=P.fresh();s.version=4;s.allocated.firepower=2;s.inventory=[{uid:1,id:20302},{uid:2,id:20102},{uid:3,id:20302},{uid:4,id:20204}];s.equipped=[1,2,3,4,null,null,null,null,null];s.warehouse=Array(24).fill(null);s=P.restore(s);assert.deepEqual(s.equipped.slice(0,3),[1,2,4]);assert.ok(s.warehouse.includes(3));assert.equal(s.allocated.firepower,2);assert.deepEqual(P.restore(s),s);});
