// Reuse the original brain insect boss's complete native direction/animation set.
const fs=require('fs'),path=require('path'),R=path.resolve(__dirname,'..'),art=require(R+'/shared/art-data'),def=require(R+'/shared/defense-art'),d=require(R+'/shared/level-data'),source=require(R+'/shared/scorpion2-data').unitTypes[13214];
const role='13214',group=def.groups[role];for(const rows of Object.values(group.anim))for(const names of Object.values(rows))for(const name of names){const f=def.frames[name],page=def.pages[f.page];if(!art.pages.includes(page))art.pages.push(page);art.frames[name]={...f,page:art.pages.indexOf(page)};}art.groups[role]=group;
d.zergSecondActBossId=13214;d.unitTypes[13214]={...source,name:'大脑怪',attr:{...source.attr,hp:d.unitTypes[12504].attr.hp,kill_gold:80}};
for(const [name,value,global]of [['art-data',art,'ZergArt'],['level-data',d,'ZergLevel']])fs.writeFileSync(R+'/shared/'+name+'.js','(function(){const d='+JSON.stringify(value)+';if(typeof module!=="undefined")module.exports=d;else globalThis.'+global+'=d;})();');
console.log('Imported original brain boss, same base HP as act I boss,',Object.keys(group.anim).join('/'));
