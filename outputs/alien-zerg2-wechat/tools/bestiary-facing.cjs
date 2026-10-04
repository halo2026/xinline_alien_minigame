// Prefer the native down-right 45-degree row, never rotate a flat sprite.
const fs=require('fs'),path=require('path'),R=path.resolve(__dirname,'..'),B=R+'/shared/',def=require(B+'defense-campaign'),art=require(B+'defense-art');
const stages={zerg:{art:require(B+'art-data')},zerg1:require(B+'zerg1'),greenstar:require(B+'greenstar')};for(const id of ['snake3','airship3','fish3','fortress2','scorpion2'])stages[id]=def.create(require(B+id+'-data'),art);
const data=require(B+'bestiary-data');let changed=0;
for(const e of data.entries){const A=stages[e.stage]?.art,g=A?.groups[e.id];if(!g||![8,16,32].includes(g.dirs))continue;const dir=1+g.dirs/8,frames={};let valid=true;for(const action of ['walk','attack']){const rows=g.anim[action]||g.anim.stand,list=rows?.[dir];if(!list?.length){valid=false;break;}frames[action]=list.map(k=>{const f=A.frames[k],file=A.pages[f.page];if(!data.pages.includes(file))data.pages.push(file);return [data.pages.indexOf(file),f.x,f.y,f.w,f.h];});}
 if(!valid)continue;
 // Keep previously restored high-resolution native atlases; don't regress their source.
 const before=data.pages[e.frames.walk[0][0]],after=data.pages[frames.walk[0][0]];if(/native/.test(before)&&!/native/.test(after)){console.log('Preserve native atlas:',e.name);continue;}
 if(JSON.stringify(e.frames)!==JSON.stringify(frames))changed++;e.frames=frames;e.previewSize=[Math.max(...Object.values(frames).flat().map(f=>f[3])),Math.max(...Object.values(frames).flat().map(f=>f[4]))];e.previewFacing=45;
}
for(const root of [R,path.resolve(R,'../alien-wolf-wechat')])fs.writeFileSync(root+'/shared/bestiary-data.js','(function(){const data='+JSON.stringify(data)+';if(typeof module!=="undefined")module.exports=data;else globalThis.BestiaryData=data;})();\n');console.log('Updated entries:',changed);
