const test=require('node:test'),assert=require('node:assert/strict');
for(const campaign of ['alien-zerg2-wechat','alien-wolf-wechat']){
 const {Game}=require('../../'+campaign+'/shared/core');
 test(campaign+': sniper is not a knockback weapon',()=>{const g=new Game();for(let i=0;i<8;i++){const t={id:12200,techBranch:2,techSpec:0,techRank:1,x:900,y:1000,angle:i*Math.PI/4};assert.equal(g.towerStats(t).knockback,0);g.fire(t,'laser');assert.equal(g.bullets.at(-1).knockback,0);assert.equal(g.bullets.at(-1).sniper,true);}});
 test(campaign+': only lethal sniper hits slide small ground enemies, respecting walls',()=>{
  const g=new Game();g.nav.blocked=()=>false;g.kill=e=>{e.rewarded=true;};
  const make=(id=12500)=>({id,x:900,y:1000,hp:100,scale:.4,angle:0,lastHitAngle:0});
  let e=make();g.damage(e,10,'laser',{sniper:true});assert.equal(e.x,900);assert.equal(e.deathSlide,undefined);g.damage(e,100,'laser',{sniper:true});assert.equal(e.x,924);assert.equal(e.deathSlide.duration,.22);
  for(const id of [12502,12503,12504]){e=make(id);g.damage(e,100,'laser',{sniper:true});assert.equal(e.deathSlide,undefined);}
  e=make();g.damage(e,100,'laser');assert.equal(e.deathSlide,undefined);
  g.nav.blocked=x=>x>910;e=make();g.damage(e,100,'laser',{sniper:true});assert.equal(e.x,910);
 });
}
