const test=require('node:test'),assert=require('node:assert/strict'),path=require('node:path');
for(const campaign of ['','campaigns/wolf/'])test('packaged startup loads and steps '+(campaign||'zerg'),()=>{
 const root=path.resolve(__dirname,'../minigame/shared',campaign);
 const {View}=require(path.join(root,'view.js'));
 const {fresh}=require(path.join(root,'progression.js'));
 const v=new View({}, {},390,844,0,{load:()=>fresh(),save:()=>{}});
 assert.equal(typeof v.bindCombatHints,'function');
 v.game.start();v.step(.016);
 assert.equal(v.game.state,'playing');
});
