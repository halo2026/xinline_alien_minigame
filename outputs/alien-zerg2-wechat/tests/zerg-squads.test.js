const test=require('node:test'),assert=require('node:assert/strict'),C=require('../shared/core');
const rank=id=>({12500:0,12501:1,12503:1,12502:2,190001:2,12509:3})[id];
test('both acts progress by family, preserve totals, and keep whole squads on one route',()=>{
 for(let act=0;act<2;act++){let total=0;for(let i=0;i<8;i++){const wave=C.scheduleWave(act*8+i,0);total+=wave.length;const rows=wave.filter(e=>e.zergSquad);for(let j=1;j<rows.length;j++){assert(rank(rows[j].unit)>=rank(rows[j-1].unit));assert(rows[j].time>rows[j-1].time);}for(const squad of new Set(rows.map(e=>e.squad))){const group=rows.filter(e=>e.squad===squad);assert(group.length<=5);assert(group.every(e=>e.spawn===group[0].spawn&&e.path===group[0].path&&e.ambush===group[0].ambush));assert.equal(group.filter(e=>e.squadLeader).length,group.length>1?1:0);assert(group.slice(1).every(e=>!e.squadLeader));}assert.equal(rows.some(e=>e.ambush),[4,5,7].includes(i));}assert.equal(total,193);}
});
test('actual elite arrivals lead their squad and preserve live cap and six-second spacing',()=>{
 const g=new C.Game({seed:31});g.start();g.enemies=[];g.pending=[];let elites=0,last=-Infinity;
 for(let wave=0;wave<16;wave++){for(const event of C.scheduleWave(wave,wave*100)){g.time=event.time;const e=g.spawn(event);if(e.elite){elites++;assert(event.squadLeader);assert(g.time-last>=6);last=g.time;assert(g.enemies.filter(e=>e.elite&&e.hp>0).length<=2);}e.hp=0;}}
 assert(elites>=4,'regular squads should produce elite leaders');
});
