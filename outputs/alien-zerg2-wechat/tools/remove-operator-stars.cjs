// Apply only imagegen's icon-removal regions, preserving all other atlas pixels.
const {createCanvas,loadImage}=require('@napi-rs/canvas'),fs=require('fs'),path=require('path');
const root=path.resolve(__dirname,'..');
(async()=>{const file=path.join(root,'assets/operator-stars.jpg'),original=await loadImage(file),edit=await loadImage(path.join(root,'source-art/operator-stars/star-removal-generated.png')),c=createCanvas(original.width,original.height),ctx=c.getContext('2d'),normalized=createCanvas(2112,576),n=normalized.getContext('2d');
n.drawImage(edit,0,69,2079,581,0,0,2112,576);ctx.drawImage(original,0,0);
for(let row=0;row<2;row++)for(let col=0;col<11;col++){const x=col*192+3,y=row*288+4,w=row===0?43:61,h=24;ctx.drawImage(normalized,x,y,w,h,x,y,w,h);}
fs.writeFileSync(file,c.toBuffer('image/jpeg',92));})();
