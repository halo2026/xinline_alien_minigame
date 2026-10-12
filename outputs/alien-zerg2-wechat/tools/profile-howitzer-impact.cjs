// Desktop synthetic CPU/Canvas benchmark; not phone FPS.
const root=require('node:path').resolve(__dirname,'..');
const {Game}=require(root+'/shared/core'),{performance}=require('node:perf_hooks');
const g=new Game();g.enemies=Array.from({length:600},(_,i)=>({x:(i*137)%1800,y:(i*191)%1800,hp:1e12,air:i%7===0}));let hits=0;g.damage=()=>hits++;
const samples=[];for(let n=0;n<120;n++){g.fx=[];g.events=[];const t=performance.now();for(let i=0;i<190;i++)g.cannonImpact({x:750+i%19*8,y:850+Math.floor(i/19)*8,radius:85,damage:100,cluster:true,mode:'howitzer'});if(n>=20)samples.push(performance.now()-t);}
console.log(JSON.stringify({scenario:'10 researched howitzers, 190 simultaneous impacts, 600 enemies',meanMs:samples.reduce((a,b)=>a+b)/samples.length,p95Ms:samples.sort((a,b)=>a-b)[95],hits,fx:g.fx.length}));
