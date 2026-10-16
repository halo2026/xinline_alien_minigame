const test=require('node:test'),assert=require('node:assert/strict');
for(const modulePath of ['../shared/view','../shared/greenstar']){
 test(modulePath+' repair drag pans, tap builds, revival follows again',()=>{
 const stage=require(modulePath),{View}=stage.api||stage,v=new View({}, {},390,844,0);v.resize(390,844,0);v.game.start();v.game.player.hp=0;v.updateCamera();
 const start={...v.camera};v.down(7,210,220);v.motion(7,160,250);v.up(7,160,250);
 assert.notDeepEqual(v.camera,start);const panned={...v.camera};v.updateCamera();assert.deepEqual(v.camera,panned);assert.deepEqual(v.game.move,{x:0,y:0});
 const gold=v.game.gold;let builds=0;v.game.placeTower=()=>{builds++;return true;};
 v.down(8,200,240);v.motion(8,150,260);v.up(8,150,260);assert.equal(builds,0);assert.equal(v.game.gold,gold);
 v.game.buildSelected=1;v.down(9,200,240);v.up(9,200,240);assert.equal(builds,1);
 v.game.buildSelected=null;v.down(10,200,240);v.up(10,undefined,undefined,true);assert.equal(builds,1);
 v.game.player.hp=100;v.updateCamera();assert.equal(v.repairCamera,null);assert.equal(v.repairPan,null);
 });
}
test('greenstar repair camera supports landscape bounds and resumes player tracking',()=>{const z=require('../shared/greenstar'),v=new z.api.View({}, {},900,420,0);v.game.start();v.resize(900,420);v.game.player.hp=0;v.updateCamera();const old={...v.camera};v.down(1,420,130);v.motion(1,320,160);v.up(1,320,160);assert.notDeepEqual(v.camera,old);v.repairCamera={x:-1e6,y:1e6};v.updateCamera();assert.equal(v.camera.x,z.data.visualBounds.left+v.w/v.zoom/2);assert.equal(v.camera.y,z.data.visualBounds.bottom-v.h/v.zoom/2);v.game.player.hp=100;v.updateCamera();assert.equal(v.repairCamera,null);assert.equal(v.camera.x,v.game.player.x);});
test('every defense campaign and escort keeps repair drag in both orientations',()=>{const factory=require('../shared/defense-campaign'),art=require('../shared/defense-art'),stages=[require('../shared/zerg1'),...['snake3','fish3','airship3','fortress2','scorpion2'].map(id=>factory.create(require('../shared/'+id+'-data'),art))];for(const s of stages)for(const [w,h]of [[390,844],[900,420]]){const v=new s.api.View({}, {},w,h,0);v.resize(w,h);v.game.start();v.game.player.hp=0;v.updateCamera();const before={...v.camera},x=w*.55,y=h*.32;v.down(7,x,y);v.motion(7,x-45,y+25);v.up(7,x-45,y+25);assert.notDeepEqual(v.camera,before);const after={...v.camera};v.updateCamera();assert.deepEqual(v.camera,after);v.game.player.hp=100;v.updateCamera();assert.equal(v.repairCamera,null);}});
