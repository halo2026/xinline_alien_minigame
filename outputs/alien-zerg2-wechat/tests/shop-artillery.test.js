const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared']){
test(root+' all four shop rows and inline technology buttons are visible and clickable',()=>{
 const {View}=require(root+'/view');
 for(const [w,h] of [[844,390],[667,375],[390,844]]){
 const v=new View({}, {},w,h,6);v.resize(w,h,6);v.game.start();v.shop=true;
 assert.equal(v.managementProjection(),null);
 const rows=v.buildShopLayout();assert.equal(rows.length,4);
 for(const r of rows){assert(r.y>=6&&r.y+r.h<h);assert(r.tech.x>=r.x&&r.tech.x+r.tech.w<=r.x+r.w);assert(r.tech.y>=r.y&&r.tech.y+r.tech.h<=r.y+r.h);
 let bought;v.game.buyTower=id=>{bought=id;return true;};v.shop=true;v.techTower=null;v.down(1,r.x+r.w-40,r.y+r.h/2);assert.equal(bought,r.id);assert.equal(v.shop,false);
 v.shop=true;v.down(2,r.tech.x+16,r.tech.y+16);assert.equal(v.techTower,r.id);v.techTower=null;
 }
 v.shop=true;const close=v.buildShopPanel().close;v.down(3,close.x+12,close.y+12);assert.equal(v.shop,false);
 }
});
test(root+' artillery rejects air targets and ground explosions leave aircraft unharmed',()=>{
 const {Game}=require(root+'/core'),g=new Game();let hits=[];g.damage=e=>hits.push(e);g.effect=()=>{};
 const air={air:true,x:100,y:100,hp:100},ground={air:false,x:100,y:100,hp:100};
 for(const mode of ['cannon','howitzer','rocket'])assert.equal(g.fireArtillery({x:0,y:0},air,{mode}),false);
 assert.equal(g.bullets.length,0);g.enemies=[air,ground];g.cannonImpact({x:100,y:100,radius:65,damage:10});assert.deepEqual(hits,[ground]);
});
}
