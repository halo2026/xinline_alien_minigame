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

test('packaged raid starts without Buffer, atob or wx base64 helpers',()=>{
 const vm=require('node:vm'),fs=require('node:fs'),file=path.resolve(__dirname,'../minigame/shared/thunder-raid.js');
 const context={module:{exports:{}},require:require('node:module').createRequire(file),wx:{}};
 vm.runInNewContext(fs.readFileSync(file,'utf8'),context);
 const stage=context.module.exports,v=new stage.api.View({}, {},390,844);
 v.game.start();v.step(.016);
 assert.equal(v.game.state,'playing');
 v.game.geometryBuildSiteError=()=>{throw Error('baked lookup not loaded');};
 assert.equal(v.game.buildSiteError(518,792),'');
});
