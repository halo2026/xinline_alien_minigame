const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),os=require('node:os');
test('async subpackage resource reconstruction preserves every original asset byte',async()=>{const root=path.resolve(__dirname,'..'),cache=fs.mkdtempSync(path.join(os.tmpdir(),'zerg-resource-test-'));try{if(JSON.parse(fs.readFileSync(path.join(root,'project.config.json'))).compileType==='game'){const data=require('../minigame/shared/game-assets'),sha=b=>crypto.createHash('sha256').update(b).digest('hex');assert(Object.keys(data.files).length>=26);for(const [file,p]of Object.entries(data.files))assert.equal(sha(fs.readFileSync(path.join(root,'minigame',p))),sha(fs.readFileSync(path.join(root,'assets',file))),file);for(const f of ['core.js','view.js'])assert.equal(sha(fs.readFileSync(path.join(root,'shared',f))),sha(fs.readFileSync(path.join(root,'minigame',['level-data.js','art-data.js'].includes(f)?'level-code':'shared',f))),f);return;}const wx={env:{USER_DATA_PATH:cache},getFileSystemManager:()=>({mkdirSync:(p)=>fs.mkdirSync(p,{recursive:true}),accessSync:p=>fs.accessSync(p),writeFileSync:(p,b)=>fs.writeFileSync(p,Buffer.from(new Uint8Array(b)))}),base64ToArrayBuffer:s=>{let b=Buffer.from(s,'base64');return b.buffer.slice(b.byteOffset,b.byteOffset+b.length)}};const req=()=>{};req.async=async p=>require(path.resolve(root,'miniprogram/shared',p));let module={exports:{}};vm.runInNewContext(fs.readFileSync(path.join(root,'miniprogram/shared/resource-loader.js'),'utf8'),{module,require:req,wx,Uint8Array});let count=0,map=await module.exports(()=>count++);const sha=b=>crypto.createHash('sha256').update(b).digest('hex');for(let [file,p]of Object.entries(map))assert.equal(sha(fs.readFileSync(p)),sha(fs.readFileSync(path.join(root,'assets',file))),file);assert.ok(count>=26);let calls=0;req.async=()=>{calls++;throw Error('cache should avoid imports')};await module.exports(()=>{});assert.equal(calls,0);}finally{fs.rmSync(cache,{recursive:true,force:true});}});


test('level subpackage preserves campaign exports and leaves room for main-package development',()=>{
 const root=path.resolve(__dirname,'..'),report=JSON.parse(fs.readFileSync(path.join(root,'game-package-report.json')));
 const config=JSON.parse(fs.readFileSync(path.join(root,'minigame/game.json')));
 assert(config.subpackages.some(p=>p.name==='level-code'&&p.root==='level-code'));
 assert(report.main<2*1024*1024-256*1024,'main package needs at least 256 KiB of headroom');
 for(const campaign of ['', 'campaigns/wolf/'])for(const name of ['level-data.js','art-data.js']){
  const original=path.join(root,'shared',campaign,name),packaged=path.join(root,'minigame/shared',campaign,name);
  assert.deepEqual(require(packaged),require(original),campaign+name);

 }
});

test('compressed campaign data restores exact exports without host decoding APIs',()=>{
 const root=path.resolve(__dirname,'../minigame/defense-code'),decoderContext={module:{exports:{}},TextDecoder:undefined,TextEncoder:undefined};
 vm.runInNewContext(fs.readFileSync(path.join(root,'packed-level-data.js'),'utf8'),decoderContext);
 for(const name of ['snake3','fish3','airship3','fortress2','scorpion2','greenstar','zerg1']){
  const context={module:{exports:{}},require:id=>{assert.equal(id,'./packed-level-data.js');return decoderContext.module.exports;}};
  vm.runInNewContext(fs.readFileSync(path.join(root,name+'-data.js'),'utf8'),context);
  assert.deepEqual(JSON.parse(JSON.stringify(context.module.exports)),require('../shared/'+name+'-data'),name);
 }
});

test('new static art compression restores exports without Buffer or atob',()=>{const root=path.resolve(__dirname,'../minigame'),decoder={module:{exports:{}},TextDecoder:undefined,TextEncoder:undefined};vm.runInNewContext(fs.readFileSync(path.join(root,'defense-code/packed-level-data.js'),'utf8'),decoder);for(const [file,source] of [['defense-code/defense-art.js','defense-art'],['defense-code/mechanical-snake-art.js','mechanical-snake-art'],['defense-code/bestiary-data.js','bestiary-data'],['level-code/art-data.js','art-data'],['level-code/level-data.js','level-data']]){const context={module:{exports:{}},require:id=>{assert.equal(path.resolve(path.dirname(path.join(root,file)),id),path.join(root,'defense-code/packed-level-data.js'));return decoder.module.exports;}};vm.runInNewContext(fs.readFileSync(path.join(root,file),'utf8'),context);assert.deepEqual(JSON.parse(JSON.stringify(context.module.exports)),require('../shared/'+source));}});
