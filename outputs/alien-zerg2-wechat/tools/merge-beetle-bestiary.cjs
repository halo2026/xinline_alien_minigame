// The native Ultralisk is a lower-resolution duplicate of BIGBEETLE.
const fs=require('fs'),path=require('path'),R=path.resolve(__dirname,'..');
for(const root of [R,path.resolve(R,'../alien-wolf-wechat')]){
 const file=root+'/shared/bestiary-data.js',d=require(file),old='species:UNIT_Ultralisk:normal',key='species:UNIT_BIGBEETLE:normal',src=d.entries.find(e=>e.key===old),dst=d.entries.find(e=>e.key===key);
 if(src){dst.locations=[...new Set([...dst.locations,...src.locations])];dst.frequency+=src.frequency;d.entries=d.entries.filter(e=>e.key!==old);}
 for(const map of [d.aliases,d.legacy])for(const k of Object.keys(map||{}))if(map[k]===old)map[k]=key;
 d.legacy[old]=key;
 for(const r of Object.values(d.roster))if(r.key===old){r.key=key;r.scale=75.2/158;}
 fs.writeFileSync(file,'(function(){const data='+JSON.stringify(d)+';if(typeof module!=="undefined")module.exports=data;else globalThis.BestiaryData=data;})();\n');
}
