const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared']){
 const {Game}=require(root+'/core');
 function run(idle,dt=1/60,rate=5){const g=new Game({seed:48});g.start();g.pending=[{time:1e9}];g.nextWave=Infinity;g.enemies=[];g.chests=[];g.towers=[];g.player.fireRate=rate;let active=false,shots=0;g.nearest=()=>active?{x:g.player.x+100,y:g.player.y,hp:1e9}:null;g.fire=()=>shots++;for(let i=0;i<Math.round(idle/dt);i++)g.update(dt);active=true;for(let i=0;i<Math.round(2/dt);i++)g.update(dt);return shots;}
 test(root+' idle time cannot bank shots or cause a sustained burst',()=>{for(const dt of [1/60,1/30,.05])for(const rate of [2,5,10]){const normal=run(0,dt,rate),idle=run(30,dt,rate);assert.equal(idle,normal,`dt=${dt}, rate=${rate}, idle=${idle}, fresh=${normal}`);assert(idle<=Math.ceil(2*rate)+1);}});
 test(root+' critical is rolled separately per shot and doubles only that shot',()=>{const g=new Game({seed:48});g.start();g.player.critChance=.25;g.player.equipmentSkills={};g.random=()=>.1;g.fire();const a=g.bullets.at(-1);g.random=()=>.9;g.fire();const b=g.bullets.at(-1);assert.equal(a.critical,true);assert.equal(b.critical,false);assert.equal(a.damage,b.damage*2);assert.equal(g.player.critChance,.25);});
}
