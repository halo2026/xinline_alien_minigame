// Lossless package-only encoding: omit repeated frame-property names, restore on import.
const fs=require('fs'),path=require('path');
for(const filename of process.argv.slice(2)){
 const file=path.resolve(filename),original=require(file),{frames,...data}=original,schemas=[],rows=[];
 for(const [name,frame]of Object.entries(frames)){const keys=Object.keys(frame);let index=schemas.findIndex(s=>s.length===keys.length&&s.every((k,i)=>k===keys[i]));if(index<0){index=schemas.length;schemas.push(keys);}rows.push([name,index,...keys.map(k=>frame[k])]);}
 const output='const data='+JSON.stringify(data)+',schemas='+JSON.stringify(schemas)+',rows='+JSON.stringify(rows)+';data.frames={};for(const [name,index,...values]of rows){const frame={};schemas[index].forEach((key,i)=>frame[key]=values[i]);data.frames[name]=frame;}module.exports=data;\n';
 const before=fs.statSync(file).size;fs.writeFileSync(file,output);delete require.cache[file];require('node:assert/strict').deepEqual(require(file),original);console.log(path.basename(path.dirname(file)),'atlas saved',before-Buffer.byteLength(output),'bytes');
}
