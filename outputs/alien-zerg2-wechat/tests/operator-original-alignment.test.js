const test=require('node:test'),assert=require('node:assert/strict');
for(const root of ['../shared','../../alien-wolf-wechat/shared'])test(root+' all star portraits retain original crop size and destination with calibrated face focus',()=>{
 const P=require(root+'/progression'),{View}=require(root+'/view'),calls=[],v={game:{progress:P.fresh()},images:{portraits:{width:3300},operatorStars:{width:3300}},ctx:{drawImage(...a){calls.push(a);},fillRect(){}},techPlate(){},sprite(){}};
 for(const [id,rows]of Object.entries(P.operatorPortraits))for(let branch=0;branch<rows.length;branch++)for(const share of [false,true])for(const [w,h]of [[60,60],[180,180],[240,388]]){
  const key=id+':'+branch;calls.length=0;
  for(const stars of [1,2,3])View.prototype.operatorPortrait.call(v,key,12,23,w,h,share,stars);
  const base=calls[0];assert.equal(calls.length,3);
  for(let i=1;i<3;i++){const a=calls[i];assert.equal(a[1],base[1]);const index=rows[branch],focus=[[0,30,10,20,0,60,35,20,30,10,15],[0,40,10,10,20,0,45,30,30,10,10]][i-1][index];assert(Math.abs(a[2]-base[2]-(i-1)*485-(share?0:focus))<1e-8);assert(a[2]+a[4]<=i*485+1e-8);assert.deepEqual(a.slice(3),base.slice(3));}
 }
});
