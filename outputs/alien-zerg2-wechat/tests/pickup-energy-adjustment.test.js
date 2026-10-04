const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared']){
 const {Game}=require(root+'/core'),{View}=require(root+'/view'),A=require(root+'/art-data');
 test(root+' base energy sound is independent of gunfire',()=>{const g=new Game();g.fire({id:12202,x:900,y:900,angle:0,techRank:0},'energy');assert(g.events.includes('energy'));assert(!g.events.includes('gun'));});
 test(root+' chip drop cutoff is 4.8 percent',()=>{for(const [roll,expected]of [[.04799,true],[.048,false]]){const g=new Game();g.dropRunLoot=()=>{};g.random=()=>roll;g.kill({id:12501,x:900,y:1200,scale:.6,angle:0,age:0},'energy');assert.equal(g.pickups.some(p=>p.chips),expected);}});
 test(root+' tactical card pickup enlarged ten percent',()=>{const id=Object.keys(A.tactical.cards).find(id=>A.frames['pickup/'+id]);assert(id);let scale;const ctx={save(){},restore(){},translate(){},scale(){},beginPath(){},ellipse(){},fill(){}};const v=new View(ctx,{pages:[]},390,844);v.sprite=(f,x,y,s)=>{scale=s;};v.drawGroundPickup({id:+id,x:0,y:0});assert(Math.abs(scale*A.frames['pickup/'+id].w-74.8)<1e-9);});
}
