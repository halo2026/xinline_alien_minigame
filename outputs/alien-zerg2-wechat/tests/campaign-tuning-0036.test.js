const test=require('node:test'),assert=require('node:assert/strict');
const escort=require('../shared/zerg1'),raw=require('../shared/snake3-data'),snake=require('../shared/defense-campaign').create(raw,require('../shared/defense-art'));
test('escort finale keeps first-act route, movement and boss behavior with thunder appearance',()=>{
 const a=escort.core.scheduleWave(6,0).find(e=>e.unit===12517),b=escort.core.scheduleWave(13,0).find(e=>e.unit===915001),g=new escort.core.Game({seed:42});
 assert(a&&b);assert.equal(a.spawn,b.spawn);assert.equal(a.path,b.path);const first=g.spawn(a),last=g.spawn(b);
 assert.deepEqual(last.waypoints,first.waypoints);assert(last.waypoints.length);assert.equal(last.mailMonster,undefined);assert.equal(last.escortBoss,true);assert(Math.abs(last.speed-first.speed)<1e-9);assert.equal(last.range,first.range);assert.deepEqual(g.campaignBossPool(last),g.campaignBossPool(first));assert.equal(last.id,915001);assert(last.maxHp>0);
 for(const e of [first,last]){e.skillCd=0;e.zergLastSkill='flame';g.fx=[];g.updateCampaignBoss(e,{x:e.x+200,y:e.y});assert.equal(g.fx.filter(f=>f.nativeSpikes).length,12);}
});
test('snake waves retain bosses, 80 percent ordinary count and 130 percent authored strength',()=>{
 for(let i=0;i<raw.waves.length;i++){const old=raw.waves[i],now=snake.data.waves[i],boss=c=>raw.campaignConfig.bossIds.includes(c.unit),sum=cs=>cs.reduce((n,c)=>n+c.count,0);assert.equal(sum(now.filter(c=>!boss(c))),Math.round(sum(old.filter(c=>!boss(c)))*.8));assert.equal(sum(now.filter(boss)),sum(old.filter(boss)));for(const c of now){assert(Math.abs(c.hpScale/(c.rosterHpScale||1)-1.3)<1e-9);assert(Math.abs(c.attackScale/(c.rosterAttackScale||1)-1.3)<1e-9);}}
});
test('snake ambushes begin in act one and repeat at rounds three and seven, on open ground near refinery',()=>{
 const g=new snake.core.Game({seed:42});g.state='playing';const seen=[];
 for(let wave=1;wave<=14;wave++){g.pending=[];g.enemies=[];g.beginWave();const snakes=g.enemies.filter(e=>e.mechanicalSnake);if([3,7,10,14].includes(wave)){assert.equal(snakes.length,1);const e=snakes[0],d=Math.hypot(e.x-g.refinery.x,e.y-g.refinery.y);assert(d>=160&&d<=341);assert(!g.nav.blocked(e.x,e.y));assert.equal(e.phase,'warning');assert(e.snakeBurrow);assert.equal(e.maxHp,145000*1.6*1.3);assert(Math.abs(e.giantAttackScale-2.08)<1e-9);seen.push([e.x,e.y]);}else assert.equal(snakes.length,0);}
 assert(new Set(seen.map(p=>p.join(','))).size>1);
});
