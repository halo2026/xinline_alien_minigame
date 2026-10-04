const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),path=require('node:path');
const root=path.resolve(__dirname,'..');
test('WeChat stage loader supplies both cave images to the renderer and resolves packaged assets',async()=>{
 const code=fs.readFileSync(path.join(root,'minigame/game.js'),'utf8');const fn=code.slice(code.indexOf('async function stageImages'),code.indexOf('function sound('));const requested=[];const context={stages:{zerg:{art:{pages:['atlas-0.png']}},wolf:{art:{pages:[]}},greenstar:{art:{pages:[]}}},imageFile:async f=>{requested.push(f);return {file:f}}};vm.createContext(context);vm.runInContext(fn,context);
 const images=await context.stageImages('zerg');assert.equal(images.portraits.file,'operator-portraits.jpg');assert.equal(images.caves.length,2);assert.deepEqual(Array.from(images.caves,x=>x.file),['hive-cave-a.png','hive-cave-b.png']);const manifest=require('../minigame/shared/game-assets');for(const im of [...images.caves,images.portraits])assert(fs.existsSync(path.join(root,'minigame',manifest.files[im.file])));
 assert.equal((await context.stageImages('wolf')).caves.length,0);assert.equal((await context.stageImages('greenstar')).sideCave.file,'hive-cave-side.png');
});
