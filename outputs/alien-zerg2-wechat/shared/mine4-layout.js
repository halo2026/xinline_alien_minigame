(function(){
const size=[2304,2784],center={x:1152,y:1120},turns=2,roadWidth=144,platformWidth=188;
const spiral=(t,offset=0)=>{const r=140+64*t+offset,a=Math.PI/2+t;return {x:center.x+Math.cos(a)*r,y:center.y+Math.sin(a)*r};};
// Tangent-aligned exit eases into the base instead of turning at a right angle.
const route=Array.from({length:237},(_,i)=>spiral(i*Math.PI*4/240)),approachStart=route.length-1,start=route.at(-1),c1={x:1110,y:2080},c2={x:1152,y:2150},end={x:1152,y:2350};
for(let i=1;i<=36;i++){const t=i/36,u=1-t;route.push({x:u*u*u*start.x+3*u*u*t*c1.x+3*u*t*t*c2.x+t*t*t*end.x,y:u*u*u*start.y+3*u*u*t*c1.y+3*u*t*t*c2.y+t*t*t*end.y});}
const platform=Array.from({length:121},(_,i)=>spiral(i*Math.PI*2/120,Math.PI*64));
const ramps=[.4*Math.PI,1.4*Math.PI].map(t=>[spiral(t),spiral(t,Math.PI*128)]);
const distance=(p,points)=>{let best=Infinity;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy)));best=Math.min(best,Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy));}return best;};
const cellSize=24,cols=size[0]/24,rows=size[1]/24;
const cells=Array.from({length:cols*rows},(_,i)=>{const p={x:(i%cols+.5)*24,y:(Math.floor(i/cols)+.5)*24};if(distance(p,route)<roadWidth/2||ramps.some(r=>distance(p,r)<36))return 2;if(distance(p,platform)<platformWidth/2)return 1;if(p.x>800&&p.x<1520&&p.y>2190&&p.y<2730)return 1;return 0;});
// Ground extends beneath border ridges; runtime traversal remains on authored terraces.
const groundPerimeter=[{x:300,y:100},{x:660,y:40},{x:1060,y:100},{x:1460,y:65},{x:1830,y:150},{x:2100,y:340},{x:2190,y:780},{x:2160,y:1220},{x:2240,y:1600},{x:2130,y:1990},{x:2020,y:2350},{x:1910,y:2720},{x:1660,y:2820},{x:1390,y:2790},{x:1130,y:2840},{x:840,y:2795},{x:560,y:2820},{x:320,y:2630},{x:230,y:2260},{x:110,y:1900},{x:150,y:1450},{x:110,y:1020},{x:180,y:580}];
const terrainBounds={x:-320,y:-320,w:size[0]+640,h:size[1]+800};
const data={groundPerimeter,terrainBounds,size,center,turns,roadWidth,platformWidth,route,platform,ramps,spiral,distance,approachStart,buildTerrain:{cellSize,cols,rows,cells},objective:{x:1170,y:2340,id:17200,hp:40000,scale:.6},playerStart:{x:1340,y:2310,angle:Math.atan2(-100,-188)}};
if(typeof module!=='undefined')module.exports=data;else globalThis.MineFourLayout=data;
})();
