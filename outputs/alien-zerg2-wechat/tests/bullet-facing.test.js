const test=require('node:test'),assert=require('node:assert/strict');
const {View}=require('../shared/view');
test('machine-gun sprite longitudinal direction follows bullet travel in all quadrants',()=>{
 const ctx=new Proxy({}, {get:()=>()=>{}}),view=new View(ctx,{terrain:{},pages:[]},390,844,80);
 const angles=[0,Math.PI/2,Math.PI,-Math.PI/2,Math.PI/4,-3*Math.PI/4];
 view.game.bullets=angles.map((angle,i)=>({kind:'bullet',x:700+i,y:1000,angle,age:0,life:.2}));
 const calls=[];view.sprite=(...args)=>{if(args[0]==='bullet')calls.push(args);};view.draw();
 assert.equal(calls.length,angles.length);
 for(let i=0;i<angles.length;i++){
  // Original zidan3 points down (+Y), so rotate -90 degrees before world heading.
  const rotation=calls[i][5];assert.ok(Math.abs(-Math.sin(rotation)-Math.cos(angles[i]))<1e-9);
  assert.ok(Math.abs(Math.cos(rotation)-Math.sin(angles[i]))<1e-9);
 }
});
test('front grenade heading remains independent of automatic gun targeting',()=>{
 const {Game}=require('../shared/core');const g=new Game();g.start();g.player.angle=0;g.player.gunAngle=-Math.PI/2;g.throwGrenade();let b=g.bullets[0];assert.equal(b.ty,g.player.y);assert.equal(b.tx-g.player.x,180);g.player.grenadeCd=0;g.player.angle=Math.PI/2;g.move={x:0,y:1};g.throwGrenade();b=g.bullets[1];assert.ok(Math.abs(b.tx-g.player.x)<1e-9);assert.equal(b.ty-g.player.y,250);
});
test('machine-gun muzzle and flash share original 32-direction offsets',()=>{
 const {Game}=require('../shared/core');const D=require('../shared/level-data');const g=new Game();
 for(let step=0;step<32;step++){g.bullets=[];g.fx=[];const angle=-step*11.25*Math.PI/180,t={id:12200,x:900,y:1000,angle,techRank:1,techBranch:0,techSpec:0};g.fire(t,'bullet');const q=D.unitTypes[6013].bullet[String(step*11.25)],b=g.bullets[0],f=g.fx[0];assert.equal(b.x,900+q.offsetX);assert.equal(b.y,1000-q.offsetY);assert.equal(f.x,b.x);assert.equal(f.y,b.y);}
});
test('monster remains use their own atlas fragments and live through landing before fading',()=>{
 const D=require('../shared/level-data'),A=require('../shared/art-data');let draws=0;const ctx=new Proxy({}, {get:(_,k)=>k==='drawImage'?()=>draws++:()=>{}});const view=new View(ctx,{terrain:{},pages:A.pages.map(()=>({}))},390,844,80);
 for(const id of [12500,12501,12502,12503,12509]){const corpse={id,x:900,y:1000,angle:Math.PI/2,age:0,animAge:.1,kind:'shot',serial:1,born:10,scale:D.unitTypes[id].scale||1,dx:1,dy:0};view.drawRemains(corpse,true);assert.equal(corpse.pieces.length,7);assert.ok(corpse.pieces.every(p=>p.flight>0&&p.hold>0));assert.ok(corpse.pieces.some(p=>Math.hypot(p.dx,p.dy)>50));corpse.age=1;view.drawRemains(corpse,false);corpse.age=5;const n=draws;view.drawRemains(corpse,true);assert.equal(draws,n);}
});
