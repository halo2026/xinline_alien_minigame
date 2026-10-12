(function(){
const node=typeof require==='function',D0=node?require('./level-data'):globalThis.ZergLevel,A0=node?require('./art-data'):globalThis.ZergArt,raw=node?require('./greenstar-data'):globalThis.GreenstarData,art=node?require('./greenstar-art'):globalThis.GreenstarArt,core=node?require('./core'):globalThis.ZergCore,view=node?require('./view'):globalThis.ZergView;
const {art:scenery,...data}=raw,D={...D0,...data,ambush:null,strategicRoads:null,unitTypes:{...D0.unitTypes,...data.unitTypes},buildTerrain:{...data.buildTerrain,cells:Array.from(data.buildTerrain.cells,Number)}},A={...A0,pages:[...A0.pages,...art.pages],frames:{...A0.frames,...art.baseFrames},groups:{...A0.groups,...art.groups},props:scenery.props,blocks:scenery.blocks};
for(const [name,f]of Object.entries(art.frames))A.frames[name]={...f,page:f.page+A0.pages.length};
// Match native combat roles to Alien's insect roster; authored waves and skill timers remain intact.
const insectArt=node?require('./defense-art'):globalThis.DefenseArt;
const roster={14001:[12500,.45,'幼体分裂虫'],14002:[12501,.55,'疾行星河虫'],14003:[12503,.85,'重甲星河虫'],14004:[12503,.95,'狂暴星河虫'],14006:[12502,.8,'毒刺蛇'],14009:[12504,.8,'重甲钳虫'],14010:[190001,.65,'突袭地行虫'],14011:[13214,.55,'孵化脑虫'],14012:[12000,.65,'能量蜘蛛'],14013:[17013,.7,'突击生化蛛'],14014:[12501,.6,'虫群卫兵'],14016:[17013,.5,'迅击生化蛛'],15007:[12500,.4,'孵化幼虫'],15013:[12504,1.1,'裂地钳虫统领'],15009:[12000,1,'护盾光球蛛母'],15008:[17013,1.1,'狂暴生化蛛王'],15004:[13214,1.15,'绿星虫群主脑']};
const importedPages=new Map();
for(const [id,[source,scale,name]]of Object.entries(roster)){
 const base=A0.groups[source],g=base||insectArt.groups[insectArt.aliases[source]||source];if(!g)throw new Error('Missing insect model '+source);
 A.groups[id]={...g,anim:{...g.anim,skill:g.anim.skill||g.anim.attack},intervals:{...g.intervals}};
 if(!base)for(const rows of Object.values(g.anim))for(const list of Object.values(rows))for(const key of list){const f=insectArt.frames[key];if(!importedPages.has(f.page)){importedPages.set(f.page,A.pages.length);A.pages.push(insectArt.pages[f.page]);}A.frames[key]={...f,page:importedPages.get(f.page)};}
 D.unitTypes[id]={...D.unitTypes[id],sourceName:D.unitTypes[id].name,name,scale,insectSource:source,model:'GREENSTAR:INSECT_'+source,box:[-28,-70,56,80]};
}
// The vehicle is larger than the reference hero. Expand layout spacing, not combat sprites.
const layoutScale=1.5,point=q=>({...q,x:q.x*layoutScale,y:q.y*layoutScale});
D.sourceSize=[...D.size];D.layoutScale=layoutScale;D.flankRoutes=D.flankRoutes.map(r=>({...r,points:r.points.map(([x,y])=>point({x,y}))}));D.size=D.size.map(n=>n*layoutScale);D.units=D.units.map(u=>{const q=[...u];q[3]*=layoutScale;q[4]*=layoutScale;return q;});
D.campaignConfig={...D.campaignConfig,playerStart:point(D.campaignConfig.playerStart),objective:{...point(D.campaignConfig.objective),scale:D.campaignConfig.objective.scale*1.15},objectives:D.campaignConfig.objectives.map(q=>({...point(q),scale:q.scale*1.15}))};
D.campaignConfig.jointLanding=true;D.campaignConfig.playerStart={x:D.campaignConfig.objective.x+165,y:D.campaignConfig.objective.y-115};
D.navigationBounds=Object.fromEntries(Object.entries(D.navigationBounds).map(([key,value])=>[key,value*layoutScale]));
D.buildTerrain={cellSize:16,cols:Math.ceil(D.size[0]/16),rows:Math.ceil(D.size[1]/16)};D.buildTerrain.cells=Array.from({length:D.buildTerrain.cols*D.buildTerrain.rows},(_,i)=>Number(data.buildTerrain.cells[Math.min(data.buildTerrain.rows-1,Math.floor(Math.floor(i/D.buildTerrain.cols)*16/D.layoutScale/16))*data.buildTerrain.cols+Math.min(data.buildTerrain.cols-1,Math.floor((i%D.buildTerrain.cols)*16/D.layoutScale/16))]));
const originalBlocks=new Set(A.blocks.map(q=>q.join(','))),blocks=new Set();
A.props=A.props.map(prop=>{const q=point(prop),water=prop.river||prop.model?.includes('bridge');q.blocks=[];for(const [cx,cy]of prop.blocks||[]){if(!originalBlocks.has(cx+','+cy))continue;const x=water?(cx*24+12)*layoutScale:q.x+cx*24+12-prop.x,y=water?(cy*24+12)*layoutScale:q.y+cy*24+12-prop.y,r=water?12*layoutScale:12;for(let ix=Math.floor((x-r)/24);ix<=Math.ceil((x+r)/24)-1;ix++)for(let iy=Math.floor((y-r)/24);iy<=Math.ceil((y+r)/24)-1;iy++){blocks.add(ix+','+iy);q.blocks.push([ix,iy]);}}return q;});A.blocks=[...blocks].map(k=>k.split(',').map(Number));
for(const prop of A.props)if(prop.river||prop.model?.includes('bridge')){for(const name of [prop.frame,prop.frame+'/shore']){const f=A.frames[name];if(f&&!f.layoutScaled){A.frames[name]={...f,ow:(f.ow||f.w)*layoutScale,oh:(f.oh||f.h)*layoutScale,ox:f.ox*layoutScale,oy:f.oy*layoutScale,layoutScaled:true};}}}
// Mineral clusters retain normal sprite scale; collisions follow each mineral's ground footprint.
for(const prop of A.props)if(prop.groundRadius){const r=prop.groundRadius;for(let x=Math.floor((prop.x-r)/24);x<=Math.floor((prop.x+r)/24);x++)for(let y=Math.floor((prop.y-r)/24);y<=Math.floor((prop.y+r)/24);y++)if(Math.hypot(x*24+12-prop.x,y*24+12-prop.y)<=r)blocks.add(x+','+y);}
A.blocks=[...blocks].map(k=>k.split(',').map(Number));
// Keep a vehicle-width lane across both authored bridges after obstacle-cell conversion.
D.vehicleCrossings=[[19,20],[24,25]];const routePoints=Object.fromEntries(D.units.filter(u=>u[0]===11).map(u=>[u[6],{x:u[3],y:u[4]}]));
const inCrossing=(x,y)=>D.vehicleCrossings.some(([start,end])=>{const a=routePoints[start],b=routePoints[end],dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-a.x-dx*t,y-a.y-dy*t)<66;});A.blocks=A.blocks.filter(([x,y])=>!inCrossing(x*24+12,y*24+12));
// Road cells use the same 96-source-unit width as the baked mineral-gravel lanes.
D.roadWidth=96*layoutScale;
const roadSegments=[...D.settings.pathList.map(path=>[routePoints[D.campaignConfig.spawnIds[0]],...path.map(id=>routePoints[id])]),...D.flankRoutes.map(r=>r.points)].flatMap(path=>path.slice(1).map((p,i)=>[path[i],p]));
for(let cy=0;cy<D.buildTerrain.rows;cy++)for(let cx=0;cx<D.buildTerrain.cols;cx++){const x=cx*16+8,y=cy*16+8;if(roadSegments.some(([a,b])=>{const dx=b.x-a.x,dy=b.y-a.y,t=Math.max(0,Math.min(1,((x-a.x)*dx+(y-a.y)*dy)/(dx*dx+dy*dy||1)));return Math.hypot(x-a.x-dx*t,y-a.y-dy*t)<=D.roadWidth/2+Math.SQRT2*8;}))D.buildTerrain.cells[cy*D.buildTerrain.cols+cx]=2;}
// Breakthrough bodies survive the upgraded campaign firepower; native skill timings are unchanged.
for(const id of Object.keys(roster)){const d=D.unitTypes[id],boss=D.campaignConfig.bossIds.includes(Number(id)),heavy=[14003,14004,14009,14012,14013].includes(Number(id)),a=d.attr;D.unitTypes[id]={...d,attr:{...a,hp:Math.round(boss?a.hp*1.3:Math.max(2400,a.hp*(heavy?2:1.8))),move_speed:Math.max(boss?60:heavy?88:96,a.move_speed*1.25),attack:a.attack.map((n,i)=>i===3||i===4?Math.round(n*1.2):n)}};}
D.waves=D.waves.map(w=>w.map(e=>({...e,unit:e.unit===14014?14003:e.unit})));
const C=core.create(D,A),api=view.create(D,A,C);
(node?require('./greenstar-runtime'):globalThis.GreenstarRuntime).install(C,api,D,A);
const stage={api,core:C,art:A,data:D};if(node)module.exports=stage;else globalThis.Greenstar=stage;
})();
