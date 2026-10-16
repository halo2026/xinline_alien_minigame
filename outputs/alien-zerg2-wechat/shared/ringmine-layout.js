(function(){
const size=[2304,2112],center={x:800,y:650},roadWidth=136;
const point=(x,y)=>({x,y}),ring=Array.from({length:51},(_,i)=>{const a=Math.PI+i/50*(Math.PI+.8);return point(800+250*Math.cos(a),650+195*Math.sin(a));});
const tail=[point(1090,1040),point(1190,1300),point(1260,1440),point(1410,1440),point(1510,1250),point(1640,950),point(1740,730),point(1870,730)];
const lowerRing=Array.from({length:33},(_,i)=>{const a=Math.PI-i/32*(Math.PI-.8);return point(800+250*Math.cos(a),650+195*Math.sin(a));});
const routes=[[point(410,1320),point(490,1110),point(540,870),...ring,...tail],[point(790,1040),point(950,1000),...tail],[point(410,1320),point(490,1110),point(540,870),...lowerRing,...tail],[point(1152,350),point(1290,420),point(1440,500),point(1560,610),point(1660,730),point(1870,730)]],route=routes[0],roadShapes=[...routes,Array.from({length:65},(_,i)=>point(800+250*Math.cos(i/64*Math.PI*2),650+195*Math.sin(i/64*Math.PI*2)))];
const groundPerimeter=[point(250,210),point(660,160),point(1100,200),point(1510,170),point(1930,240),point(2090,450),point(2180,900),point(2110,1400),point(1930,1740),point(1570,1850),point(1190,1810),point(810,1860),point(440,1760),point(220,1470),point(130,1030),point(190,600)];
function inside(x,y){let b=false;for(let i=0,j=groundPerimeter.length-1;i<groundPerimeter.length;j=i++){const a=groundPerimeter[i],q=groundPerimeter[j];if((a.y>y)!==(q.y>y)&&x<(q.x-a.x)*(y-a.y)/(q.y-a.y)+a.x)b=!b;}return b;}
function distance(p,points){let best=Infinity;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((p.x-a.x)*dx+(p.y-a.y)*dy)/(dx*dx+dy*dy||1)));best=Math.min(best,Math.hypot(p.x-a.x-t*dx,p.y-a.y-t*dy));}return best;}
const craters=[{x:600,y:1530,w:190,h:125},{x:1230,y:620,w:210,h:145},{x:1810,y:1430,w:180,h:120}];
const cols=size[0]/24,rows=size[1]/24,cells=Array.from({length:cols*rows},(_,i)=>{const p=point((i%cols+.5)*24,(Math.floor(i/cols)+.5)*24);if(!inside(p.x,p.y)||p.y<340||p.x<310||p.x>2010||p.y>1700||((p.x-center.x)/170)**2+((p.y-center.y)/115)**2<1)return 0;if(craters.some(h=>((p.x-h.x)/(h.w/2+12))**2+((p.y-h.y)/(h.h/2+12))**2<1))return 0;if(roadShapes.some(r=>distance(p,r)<roadWidth/2+8))return 2;return 1;});
const data={size,center,roadWidth,route,routes,roadShapes,craters,groundPerimeter,inside,distance,terrainBounds:{x:-180,y:-180,w:2664,h:2500},buildTerrain:{cellSize:24,cols,rows,cells},objective:{x:1890,y:700,id:17200,hp:40000,scale:.6},playerStart:{x:1770,y:580,angle:Math.PI/2},cameraStart:{x:1750,y:990}};
if(typeof module!=='undefined')module.exports=data;else globalThis.RingMineLayout=data;
})();
