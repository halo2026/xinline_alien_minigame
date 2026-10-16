const test=require('node:test'),assert=require('node:assert/strict');
const {BattleProfiler}=require('../shared/battle-profiler');
const g={wave:5,time:100,enemies:Array(100),bullets:Array(40),towers:Array(10),fx:Array(20),corpses:Array(5)};
test('profiler records real frame intervals and separate CPU phases, caps report history',()=>{const p=new BattleProfiler();let r;p.sample(0,2,8,g);for(let i=1;i<=150;i++)r=p.sample(i*1000/30,2,8,g)||r;assert.equal(r.fps,30);assert.equal(r.updateMs,2);assert.equal(r.drawMs,8);assert.equal(r.enemies,100);assert.equal(r.p95FrameMs,33.33);for(let i=151;i<5000;i++)p.sample(i*1000/30,2,8,g);assert.equal(p.history.length,24);});
test('background gaps and reset do not contaminate battle samples',()=>{const p=new BattleProfiler();p.sample(0,1,1,g);p.sample(16,1,1,g);p.sample(5000,1,1,g);assert.equal(p.frames.length,0);p.reset();assert.equal(p.last,null);assert.equal(p.elapsed,0);});
