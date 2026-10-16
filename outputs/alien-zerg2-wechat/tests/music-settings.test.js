const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared']){
 const {View}=require(root+'/view'),P=require(root+'/progression');
 test(root+' music stays disabled and effects remain independent and persistent',()=>{
  let saved;const v=new View({}, {pages:[]},390,844,0,{load:()=>({...P.fresh(),audioSettings:{music:true,effects:true}}),save:s=>saved=s}),events=[];v.onSound=e=>events.push(e);v.paused=true;
  assert.equal(v.musicEnabled,false);assert.deepEqual(v.pauseMenuLayout().audio.map(r=>r.key),['effects']);assert.equal(v.pauseMenuLayout().nextMusic,undefined);
  for(const event of ['musicStart','musicNext','musicPause'])v.playSound(event);assert.equal(events.length,0);
  const b=v.pauseMenuLayout().audio[0];v.down(1,b.x+5,b.y+5);assert.equal(v.effectsEnabled,false);assert(events.includes('effectsStop'));v.playSound('grenade');assert(!events.includes('grenade'));assert.equal(P.restore(saved).audioSettings.effects,false);
  v.down(1,b.x+5,b.y+5);v.playSound('grenade');assert.equal(events.at(-1),'grenade');v.toggleAudio('music');assert.equal(v.musicEnabled,false);
 });
 test(root+' effects and other menu controls fit portrait and landscape',()=>{
  for(const [w,h]of [[320,568],[390,844],[844,390],[568,320]]){const v=new View({}, {pages:[]},w,h,30),l=v.pauseMenuLayout(),rs=[l.resume,l.exit,l.restart,...l.audio,...l.orientations];for(const r of rs){assert(r.x>=l.x&&r.x+r.w<=l.x+l.w);assert(r.y>=l.y&&r.y+r.h<=l.y+l.h);}for(let i=0;i<rs.length;i++)for(let j=i+1;j<rs.length;j++){const a=rs[i],b=rs[j];assert(a.x+a.w<=b.x||b.x+b.w<=a.x||a.y+a.h<=b.y||b.y+b.h<=a.y);}}
 });
}
test('WeChat package has no background music and sound effects still play and stop',()=>{
 const fs=require('node:fs'),vm=require('node:vm'),assets=require('../minigame/shared/game-assets');assert(!Object.keys(assets.files).some(f=>f.endsWith('.mp3')));assert(assets.files['boomb.wav']);
 const source=fs.readFileSync(require.resolve('../minigame/game.js'),'utf8'),code=source.slice(source.indexOf('function sound(e)'),source.indexOf('async function selectMission'));let plays=0,stops=0;
 const ctx={sounds:{gun:{stop(){stops++},play(){plays++}}}};vm.runInNewContext(code+'sound("musicStart");sound("musicNext");sound("gun");sound("effectsStop");',ctx);assert.equal(plays,1);assert.equal(stops,2);
});
