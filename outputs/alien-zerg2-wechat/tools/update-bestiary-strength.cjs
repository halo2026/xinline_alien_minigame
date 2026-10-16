// Rebuild browsing-only combat references from committed campaign attributes.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'..');
require(root+'/shared/core');
const data=require(root+'/shared/bestiary-data'),factory=require(root+'/shared/defense-campaign'),art=require(root+'/shared/defense-art');
const nestArt=require(root+'/shared/insect-nest-art');
const stages={zerg:require(root+'/shared/level-data'),zerg1:require(root+'/shared/zerg1').data,greenstar:require(root+'/shared/greenstar').data};
for(const id of ['snake3','fish3','airship3','fortress2','scorpion2'])stages[id]=factory.create(require(root+'/shared/'+id+'-data'),art).data;
for(const e of data.entries){
 if(e.stage==='wolf')continue; // Preserve archived reference stats without loading retired runtime.
 const a=stages[e.stage]?.unitTypes[e.id]?.attr;
 if(!a)throw Error('Missing bestiary combat source: '+e.key);
 const normal=data.entries.find(n=>n.family===e.family&&n.tier==='normal'),base=normal&&stages[normal.stage]?.unitTypes[normal.id]?.attr;
 const hp=e.tier==='elite'&&base?Math.max(a.hp,base.hp*4):a.hp;
 const damage=e.tier==='elite'&&base?Math.max(a.attack[3],base.attack[3]*1.6):a.attack[3];
 e.combat={hp,damage,interval:Math.max(100,a.atk_interval||1000),range:a.atk_radius||0,speed:a.move_speed||0};
 if(['NEST_egg','NEST_egg2','NEST_nest2','NEST_nest3','NEST_nest'].includes(e.family)){
  // These are stationary containers; their placeholder attack attributes are not attacks.
  Object.assign(e.combat,{damage:0,range:0,speed:0,spawner:e.family!=='NEST_nest'});
  const stand=nestArt.groups[e.id].anim.stand;
  e.frames.stand=stand[Object.keys(stand)[0]].map(name=>{const f=nestArt.frames[name],page=data.pages.indexOf(nestArt.pages[f.page]);if(page<0)throw Error('Missing nest atlas');return [page,f.x,f.y,f.w,f.h];});
 }
}
const text='(function(){const data='+JSON.stringify(data)+';if(typeof module!=="undefined")module.exports=data;else globalThis.BestiaryData=data;})();\n';
for(const p of [root+'/shared/bestiary-data.js'])fs.writeFileSync(p,text);
console.log('Bestiary combat references:',data.entries.length);
