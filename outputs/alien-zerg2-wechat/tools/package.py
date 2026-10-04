from pathlib import Path
import json,shutil,base64,hashlib
R=Path(__file__).resolve().parents[1];P=R/'miniprogram';P.mkdir(exist_ok=True)
shutil.copytree(R/'shared',P/'shared',dirs_exist_ok=True)
# Mini Program cross-package loading uses require.async, not the Mini Game loadSubpackage API.
# Resource bytes are exported by async modules then cached to USER_DATA_PATH, so the main canvas
# never depends on cross-subpackage image-path access. No server or web-view is involved.
packages=[];entries=[];index=0
for f in sorted((R/'assets').iterdir()):
 if f.suffix not in ['.png','.wav','.mp3']:continue
 data=f.read_bytes();loads=[]
 for pos in range(0,len(data),1100000):
  chunk=data[pos:pos+1100000];root='pack'+hashlib.sha256(chunk).hexdigest()[:12];index+=1;dest=P/root;dest.mkdir(exist_ok=True)
  (dest/'resource.js').write_text('module.exports='+json.dumps(base64.b64encode(chunk).decode())+';')
  (dest/'empty.js').write_text('Page({});');(dest/'empty.json').write_text('{}');(dest/'empty.wxml').write_text('<view/>');packages.append({'root':root,'pages':['empty']});loads.append("()=>require.async('../"+root+"/resource.js')")
 # Chunks are decoded independently because each base64 chunk may have padding.
 entries.append('{file:'+json.dumps(f.name)+',hash:'+json.dumps(hashlib.sha256(data).hexdigest()[:12])+',parts:['+','.join(loads)+']}')
loader='''const files=[ENTRIES];
module.exports=async function(progress){const fs=wx.getFileSystemManager(),root=wx.env.USER_DATA_PATH+'/zerg2-assets-v2';try{fs.mkdirSync(root,true);}catch(e){}const map={};for(let i=0;i<files.length;i++){const f=files[i],path=root+'/'+f.hash+'-'+f.file;let cached=false;try{fs.accessSync(path);cached=true;}catch(e){}if(!cached){let chunks=[];for(let load of f.parts){const str=await load();chunks.push(new Uint8Array(wx.base64ToArrayBuffer(str)));}let size=chunks.reduce((s,a)=>s+a.length,0),bytes=new Uint8Array(size),off=0;for(let a of chunks){bytes.set(a,off);off+=a.length;}fs.writeFileSync(path,bytes.buffer);}map[f.file]=path;progress(i+1,files.length);}return map;};
'''.replace('ENTRIES',','.join(entries))
(P/'shared/resource-loader.js').write_text(loader)
for old in P.glob('pack*'):
 if old.is_dir() and old.name not in [p['root'] for p in packages]:shutil.rmtree(old)
(P/'app.js').write_text('App({});');(P/'app.wxss').write_text('page{height:100%;background:#111b1d;}')
(P/'app.json').write_text(json.dumps({'pages':['pages/index/index'],'subPackages':packages,'window':{'navigationStyle':'custom','backgroundColor':'#111b1d'},'lazyCodeLoading':'requiredComponents','style':'v2'},indent=2))
config=R/'project.config.json';old=json.loads(config.read_text()) if config.exists() else {}
old.update({'description':'异星要塞异虫Ⅱ原关卡移植','miniprogramRoot':'miniprogram/','compileType':'miniprogram','appid':old.get('appid','touristappid'),'projectname':'alien-zerg2','setting':{'es6':True,'minified':True,'urlCheck':False}});config.write_text(json.dumps(old,ensure_ascii=False,indent=2))
(P/'pages/index/index.wxml').write_text('<canvas id="battle" type="2d" style="width:100vw;height:100vh" bindtouchstart="startTouch" bindtouchmove="moveTouch" bindtouchend="endTouch" bindtouchcancel="endTouch" disable-scroll="true"/><view wx:if="{{loading}}" style="position:fixed;top:45%;width:100%;text-align:center;color:#eadbb8;pointer-events:none">{{loading}}</view>')
(P/'pages/index/index.json').write_text('{"disableScroll":true}')
report={'packages':{p['root']:sum(f.stat().st_size for f in (P/p['root']).rglob('*') if f.is_file()) for p in packages},'total':sum(f.stat().st_size for f in P.rglob('*') if f.is_file())};report['main']=report['total']-sum(report['packages'].values());assert max(report['packages'].values())<2*1024*1024,report;assert report['main']<2*1024*1024;assert report['total']<20*1024*1024
(R/'package-report.json').write_text(json.dumps(report,indent=2));print('Main',report['main'],'total',report['total'],'packages',len(packages),'largest',max(report['packages'].values()))
