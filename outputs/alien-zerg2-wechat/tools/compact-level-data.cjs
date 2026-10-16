// Package-only lossless compression of static JSON; no changes to battle code or art.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict'),{zlibSync,strToU8}=require('fflate'),{buildSync}=require('esbuild');
const root=path.resolve(process.argv[2]);
const decoder=`import {unzlibSync,strFromU8} from 'fflate';
module.exports=function(encoded){
 const alphabet='ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',padding=encoded.endsWith('==')?2:encoded.endsWith('=')?1:0,bytes=new Uint8Array(encoded.length/4*3-padding);
 let bits=0,value=0,offset=0;
 for(let i=0;i<encoded.length-padding;i++){value=(value<<6)|alphabet.indexOf(encoded[i]);bits+=6;if(bits>=8){bits-=8;bytes[offset++]=(value>>bits)&255;value&=(1<<bits)-1;}}
 return JSON.parse(strFromU8(unzlibSync(bytes)));
};`;
buildSync({stdin:{contents:decoder,resolveDir:process.cwd(),sourcefile:'packed-level-data.js'},outfile:path.join(root,'packed-level-data.js'),bundle:true,minify:true,platform:'browser',format:'cjs',target:'es2020',legalComments:'inline'});
const decoderFile=path.join(root,'packed-level-data.js'),license=fs.readFileSync(path.resolve(path.dirname(require.resolve('fflate')),'../LICENSE'),'utf8');
fs.writeFileSync(decoderFile,'/* fflate — '+license+' */\n'+fs.readFileSync(decoderFile,'utf8'));
let saved=-fs.statSync(decoderFile).size;
for(const name of ['snake3-data','fish3-data','airship3-data','fortress2-data','scorpion2-data','greenstar-data','zerg1-data','defense-art','mechanical-snake-art','bestiary-data','../level-code/art-data','../level-code/level-data']){
 const file=path.join(root,name+'.js'),original=require(file),before=fs.statSync(file).size,encoded=Buffer.from(zlibSync(strToU8(JSON.stringify(original)),{level:9})).toString('base64');
 const output="module.exports=require("+JSON.stringify("./"+path.relative(path.dirname(file),decoderFile))+")("+JSON.stringify(encoded)+");\n";fs.writeFileSync(file,output);delete require.cache[file];assert.deepEqual(require(file),original,name);saved+=before-Buffer.byteLength(output);
}
console.log('Static level data losslessly saved',saved,'bytes; every export deepEqual verified');
