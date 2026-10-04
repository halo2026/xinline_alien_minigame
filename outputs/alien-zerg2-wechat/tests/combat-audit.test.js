const test=require('node:test'),assert=require('node:assert/strict');
const {Game}=require('../shared/core'),{View}=require('../shared/view'),A=require('../shared/art-data'),D=require('../shared/level-data');
function setup(){const g=new Game();g.start();g.pending=[];g.nextWave=Infinity;g.player.fireCd=100;return g;}
function enemy(g,x,y,air=false){const e=g.spawn({unit:air?12509:12501,spawn:1,path:1});Object.assign(e,{x,y,hp:10000,frozen:100});return e;}
test('Yoda winds up, damages a ground area once, plays full attack, then returns to stand',()=>{
 const g=setup(),y=g.yoda,e=enemy(g,y.x+40,y.y),e2=enemy(g,y.x+45,y.y+15),fly=enemy(g,y.x+35,y.y,true);
 g.updateYoda(.01);assert.equal(y.action,'attack');assert.equal(e.hp,10000);
 for(let i=0;i<5;i++)g.updateYoda(.05);assert.equal(e.hp,10000);
 g.updateYoda(.05);assert.equal(e.hp,9000);assert.equal(e2.hp,9000);assert.equal(fly.hp,10000);assert.equal(g.events.filter(x=>x==='sword').length,1);
 for(let i=0;i<12;i++)g.updateYoda(.05);assert.equal(e.hp,9000);assert.equal(y.action,'attack');g.updateYoda(.07);assert.equal(y.action,'stand');assert.equal(y.attackAge,null);
});
test('Yoda ignores air and chest targets, acquires ground enemies within source 600 radius',()=>{
 const g=setup(),y=g.yoda;enemy(g,y.x+20,y.y,true);g.chests.push({hp:100,x:y.x+10,y:y.y});g.updateYoda(.01);assert.equal(y.action,'stand');
 const e=enemy(g,y.x+350,y.y);g.updateYoda(.01);assert.equal(y.target,e);assert.equal(y.action,'walk');y.hp=0;const hp=e.hp;g.updateYoda(.5);assert.equal(e.hp,hp);
});
test('Yoda attack frames use 120ms and stop at final frame; idle and walk stay separate',()=>{
 const v=new View({}, {},390,844);const got=[];v.sprite=(...args)=>got.push(args[0]);const list=A.groups['12511'].anim.attack[2];
 for(const t of [0,.119,.121,.95,1.5])v.anim('12511','attack',0,0,1,0,t,true);
 assert.deepEqual(got,[list[0],list[0],list[1],list[7],list[7]]);
});
test('laser hit is full scale at source box center and follows a living target',()=>{
 const g=setup(),e=enemy(g,900,1000);g.yoda.hp=0;g.damage(e,1,'laser');const f=g.fx[0],b=D.unitTypes[e.id].box;
 assert.equal(f.kind,'laserhit');assert.equal(f.scale,1);assert.equal(f.life,.4);assert.equal(f.x,e.x+Math.floor(b[0]+b[2]/2));assert.equal(f.y,e.y+Math.floor(b[1]+b[3]/2));
 e.x+=10;g.update(.01);assert.equal(f.x,g.center(e).x);
});
test('bullet collision uses source burst instead of unrelated cannon explosion; grenade has no bullet flash',()=>{
 const g=setup(),e=enemy(g,900,1000);g.damage(e,1,'bullet',{x:875,y:991});assert.equal(g.fx[0].kind,'burst');assert.equal(g.fx[0].life,.18);assert.equal(g.fx[0].scale,.8);assert.equal(g.fx[0].angle,Math.PI/2);assert.equal(g.fx[0].x,875);
 g.fx=[];g.damage(e,1,'explosion');assert.equal(g.fx.length,0);
});
test('laser uses its own splash light, bullet trail fades after projectile expires',()=>{
 const g=setup();g.yoda.hp=0;g.fire();assert.equal(g.fx[0].kind,'laserlight');assert.equal(g.fx[0].life,.2);assert.equal(g.fx.some(f=>f.kind==='burst'),false);
 g.bullets=[];g.fx=[];g.fire({id:12200,x:900,y:1000,angle:0},'bullet');for(let i=0;i<3;i++)g.update(.02);assert.ok(g.trails[0].points.length>1);
 for(let i=0;i<30;i++)g.update(.05);assert.equal(g.trails.length,0);assert.equal(g.fx.length,0);
});
