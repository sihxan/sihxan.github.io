/** SPOT conceptual inspection bench. Geometry uses Anatomy (MIT, Ryan, 2026).
 * Illustration only: the bench is a metaphor, not a model architecture or live run.
 * Rebuild: node work/build_spot_figure_20261028.mjs
 */
import { writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import * as k from './reference/iso-kit.mjs';
const OUT=resolve('assets');
const W=960,H=620;
const BASE={x:-160,y:-100,w:326,d:205,r:12};
const P=k.fitProjection([...k.boxCorners(BASE,-17,0),[-120,-75,45],[147,-68,71],[-15,35,79]],W,H,{pad:45,azimuth:58,elevation:32});
const parts=[];let count=0;
const S=(plan,z,h,options={})=>{count++;parts.push({plan,z,h});return k.solidSvg(k.slabOf(plan,z,h,P,8,Math.min(1,h/4)),{tone:'mid',...options});};
const C=(x,y,r,z,h,options={})=>{count++;parts.push({circle:[x,y,r],z,h});return k.solidSvg(k.cylinder(x,y,r,z,h,P,40,.5),{tone:'mid',...options});};
const L=(path,tone='lo',className)=>k.lineSvg(path,{tone,className});
const D=(pts,size=.65)=>k.dotsSvg(pts.map(p=>k.iso(p,P)),{size,tone:'hi'});
const slab=(x,y,w,d,z,h,r=2,options)=>S({x,y,w,d,r},z,h,options);
const screws=(plan,z,inset=5)=>{const pts=k.corners(plan,inset);return L(pts.map(([x,y])=>k.ring(x,y,1.25,z,P,20)).join(''),'lo')+D(pts.map(([x,y])=>[x,y,z]),.45)};
const inset=(plan,z,by=3)=>L(k.planOutline(k.insetPlan(plan,by),z,P),'faint');
const group=(id,body)=>`<g data-part="${id}" class="apparatus-part" role="button" tabindex="0" aria-label="${id}">${body}</g>`;
const path=(points,z)=>k.onTop(points,z,P);
let base='';
for(const [x,y]of k.corners(BASE,18).sort((a,b)=>k.depthOf([...a,0],P)-k.depthOf([...b,0],P))){base+=slab(x-7,y-7,14,14,-17,5,4,{className:'rubber'});base+=slab(x-5,y-5,10,10,-12,4,2);}
base+=S(BASE,-8,8,{className:'base'});base+=inset(BASE,0,5)+screws(BASE,0,11);
const label={x:100,y:82,w:45,d:12,r:2};base+=S(label,0,.8,{className:'label-plate'});base+=k.faceTextSvg(k.topMatrix([122,90],.9,P),'SPOT',{size:4,tone:'mid',anchor:'middle'});
// Recessed PCB traces connect actual module edges; they do not claim physical wiring.
const traces=[['input',[[-66,9],[-39,9],[-39,29],[-23,29]]],['native',[[28,18],[49,18],[49,-57],[64,-57]]],['readout',[[28,34],[98,34],[98,-57],[119,-57]]],['control',[[16,57],[16,72],[-41,72]]]];
for(const [id,pts]of traces){base+=`<path class="flow-track" data-flow-route="${id}" pathLength="100" d="${path(pts,.55)}"/>`;base+=`<path class="flow-pulse" data-flow-route="${id}" pathLength="100" d="${path(pts,.65)}"/>`;base+=D([pts[0].concat(.7),pts.at(-1).concat(.7)],1.3);}
// Parallel output modules. Each is an independent compact bench meter, not a serial refinement.
function meter(x,id,numerator){let a='';const b={x,y:-88,w:44,d:62,r:5};a+=S(b,0,6);a+=screws(b,6,5);const casePlan={x:x+3,y:-84,w:38,d:49,r:5};a+=S(casePlan,6,37,{className:'meter-case'});a+=L(k.sideSeam(casePlan,11,P),'faint');const bezel={x:x+7,y:-80,w:30,d:32,r:2};a+=S(bezel,43,2,{className:'screen-rim'});a+=slab(x+9,-78,26,28,45,.5,1,{className:'screen'});
// Bars represent correct / total in the public experiment, with common denominator.
const z=45.7;for(let j=0;j<10;j++){const p={x:x+11+j*2.1,y:-74,w:1.35,d:19,r:0};a+=`<path class="meter-segment" d="${k.planOutline(p,z,P)}"/>`;const fraction=Math.min(1,Math.max(0,numerator/1104*10-j));if(fraction>0)a+=`<path class="meter-segment meter-lit" data-filled="${fraction}" d="${k.planOutline({...p,w:p.w*fraction},z+.01,P)}"/>`;}
a+=slab(x+7,-44,30,5,43,.6,1,{className:'readout-strip'});a+=D([[x+12,-41.5,43.7],[x+16,-41.5,43.7],[x+20,-41.5,43.7]],1);
const knob=[x+24,-20];a+=C(...knob,5.5,6,4);a+=L(k.knurl(...knob,5.5,6,10,24,P),'lo');a+=L(k.lineOnTop([knob[0],knob[1]],[knob[0]+4,knob[1]],10,P),'hi');a+=D([[x+10,-20,6.2]],1.7);return group(id,a);}
const native=meter(64,'native',577),readout=meter(119,'readout',874);
// Video input lightbox with three framed, perforated samples; images are schematic.
let scene='';const tray={x:-141,y:-36,w:75,d:93,r:6};scene+=S(tray,0,7);scene+=screws(tray,7,5);scene+=slab(-136,-31,65,83,7,1.4,3,{className:'tray-bed'});
for(let i=0;i<3;i++){const fy=-24+i*24;const frame={x:-131,y:fy,w:55,d:21,r:1.5};scene+=S(frame,8.4,.7,{className:'film-frame'});scene+=slab(-125,fy+3,43,15,9.1,.35,1,{className:'film-image'});scene+=D([[-128,fy+4,9.2],[-128,fy+10,9.2],[-128,fy+16,9.2],[-79,fy+4,9.2],[-79,fy+10,9.2],[-79,fy+16,9.2]],.7);scene+=slab(-113+i*4,fy+8,5.5,5.5,9.5,.8,1,{className:'sample-object'});}
// Edge clamping bars hold the film; thumb release and little contact terminals.
scene+=slab(-138,-28,3,77,8.4,2,1);scene+=slab(-72,-28,3,77,8.4,2,1);scene+=slab(-123,53,37,4,7,3,1);scene+=slab(-129,-44,51,8,0,7,2);scene+=D([[-117,-40,7.1],[-109,-40,7.1],[-101,-40,7.1],[-93,-40,7.1],[-85,-40,7.1]],.8);scene=group('scene',scene);
// The exposed sampling head rests on four standoffs and a rail-mounted signal board.
let state='';const sub={x:-28,y:-3,w:65,d:64,r:5};state+=S(sub,0,5);state+=screws(sub,5,5);
for(const [x,y]of k.corners(sub,8)){state+=slab(x-2.5,y-2.5,5,5,5,9,1);}
const board={x:-24,y:1,w:57,d:56,r:3};state+=S(board,14,2,{className:'pcb'});state+=screws(board,16,4);
for(const y of [7,44])for(const x of [-18,-7,4,15])state+=slab(x,y,7,7,16,3,1,{className:'memory-chip'});
// Contact pins around central socket are metallic contacts anchored in the board.
for(let i=0;i<6;i++){state+=`<path class="pin" d="${k.planOutline({x:-16+i*7,y:22,w:3,d:14,r:.5},16.2,P)}"/>`;}
state+=slab(-15,16,39,27,16,6,3,{className:'socket'});state+=slab(-11,20,31,19,22,3,2,{className:'processor'});state+=inset({x:-11,y:20,w:31,d:19,r:2},25,3);
// Open protective bridge, with a small blue sensor across the central sampling area.
state+=slab(-28,3,6,7,5,45,1.5);state+=slab(31,3,6,7,5,45,1.5);state+=slab(-28,3,65,7,50,6,2);state+=slab(-6,3,21,16,56,9,3,{className:'sensor'});state+=slab(-2,18,13,6,57,3,1,{className:'lens'});state+=D([[-22,6.5,56.1],[31,6.5,56.1]],.8);state=group('state',state);
// Separate diagnostic console with a precision dial; no result is attributed to this dial.
let control='';const consolePlan={x:-65,y:61,w:65,d:30,r:5};control+=S(consolePlan,0,9);control+=screws(consolePlan,9,5);control+=C(-48,76,8.5,9,3);control+=L(k.knurl(-48,76,8.5,9,12,40,P),'lo');control+=L(k.ring(-48,76,7,12,P,40),'lo');const ticks=k.radialTicks(-48,76,6,20,5,12,[1,1.7],P);control+=L(ticks.minor,'lo')+L(ticks.major,'mid');control+=L(k.lineOnTop([-48,76],[-44,73],12.2,P),'hi');control+=D([[-48,76,12.3]],1);
for(let i=0;i<3;i++)control+=slab(-28+i*7,71,4.7,10,9,2,1,{className:i===1?'control-key selected-key':'control-key'});control=group('control',control);
const css=`
.spot-apparatus{--edge:#8291b1;--lo:#b2bfd5;--faint:#d5deeb;--top:#f7faff;--shade0:#bdcbe1;--shade1:#cbd7e8;--shade2:#dae3f0;--shade3:#e8eef7;color:#4055b5;isolation:isolate}
.spot-apparatus path,.spot-apparatus circle{vector-effect:non-scaling-stroke}
.spot-apparatus .iso-fill{fill:#e7edf7;stroke:none}.spot-apparatus .iso-top{fill:var(--top);stroke:none}
.spot-apparatus .iso-shade{stroke:none}.spot-apparatus .iso-shade[data-shade="0"]{fill:var(--shade0)}.spot-apparatus .iso-shade[data-shade="1"]{fill:var(--shade1)}.spot-apparatus .iso-shade[data-shade="2"]{fill:var(--shade2)}.spot-apparatus .iso-shade[data-shade="3"]{fill:var(--shade3)}
.spot-apparatus .iso-line{fill:none;stroke:var(--lo);stroke-width:.75;stroke-linejoin:round;stroke-linecap:round}
.spot-apparatus .iso-line[data-tone="hi"]{stroke:#4b5f89}.spot-apparatus .iso-line[data-tone="mid"]{stroke:var(--edge)}.spot-apparatus .iso-line[data-tone="faint"]{stroke:var(--faint)}
.spot-apparatus .iso-dots{fill:#7385a8}.spot-apparatus .iso-face-text{fill:#8c9cba;font-family:Arial,sans-serif;font-weight:600;letter-spacing:.14em}
.spot-apparatus .base .iso-top{fill:#edf2fa}.spot-apparatus .rubber .iso-top,.spot-apparatus .rubber .iso-shade{fill:#9aacca}
.spot-apparatus .label-plate .iso-top{fill:#e1e8f4}.spot-apparatus .tray-bed .iso-top{fill:#d3deef}.spot-apparatus .film-image .iso-top{fill:#e3eaf4}
.spot-apparatus .sample-object .iso-top{fill:#566bc0}.spot-apparatus .sample-object .iso-shade{fill:#4055a5}
.spot-apparatus .pcb .iso-top{fill:#c9d5ee}.spot-apparatus .memory-chip .iso-top{fill:#6b7d9f}.spot-apparatus .memory-chip .iso-shade{fill:#4b6088}
.spot-apparatus .pin{fill:#a7b7d2;stroke:#8c9cba;stroke-width:.4}.spot-apparatus .socket .iso-top{fill:#b7c5dd}
.spot-apparatus .processor .iso-top,.spot-apparatus .sensor .iso-top{fill:#5267bc}.spot-apparatus .processor .iso-shade,.spot-apparatus .sensor .iso-shade{fill:#3e53a3}.spot-apparatus .processor .iso-line,.spot-apparatus .sensor .iso-line{stroke:#4055a5}.spot-apparatus .lens .iso-top{fill:#b4c6ff}
.spot-apparatus .screen-rim .iso-top{fill:#93a5c2}.spot-apparatus .screen .iso-top{fill:#253a60}.spot-apparatus .meter-segment{fill:#354b70;stroke:none}.spot-apparatus .meter-lit{fill:#aac3ff}.spot-apparatus .readout-strip .iso-top{fill:#d6e0f0}
.spot-apparatus .selected-key .iso-top{fill:#657cc5}.spot-apparatus .flow-track{fill:none;stroke:#c3cee2;stroke-width:2;stroke-linejoin:round;stroke-linecap:round}.spot-apparatus .flow-pulse{fill:none;stroke:#7e98e0;stroke-width:2;stroke-linejoin:round;stroke-linecap:round;stroke-dasharray:6 94;opacity:0}
.spot-apparatus .apparatus-part{cursor:pointer;outline:none}.spot-apparatus .apparatus-part:focus-visible .iso-edge{stroke:#4055b5;stroke-width:1.8}.spot-apparatus .apparatus-part.is-active .iso-edge,.spot-apparatus .apparatus-part.is-hovered .iso-edge,.spot-apparatus .apparatus-part:hover .iso-edge{stroke:#4055b5;stroke-width:1.35}.spot-apparatus .apparatus-part.is-active{--top:#edf2ff;--shade0:#9aaedc;--shade1:#adbee6;--shade2:#c2d0ef;--shade3:#dce5fa}
`;
const body=base+native+readout+scene+state+control;
const svg=`<svg xmlns="http://www.w3.org/2000/svg" class="spot-apparatus" viewBox="0 0 ${W} ${H}" role="group" aria-labelledby="apparatus-title apparatus-description"><title id="apparatus-title">SPOT research inspection bench</title><desc id="apparatus-description">A conceptual model of controlled video inputs, internal states, parallel native answers and external readout, and diagnostic controls. Not an actual experiment capture.</desc><style>${css}</style><g class="apparatus-scene">${body}</g></svg>`;
if(svg.includes('NaN')||svg.includes('undefined'))throw new Error('Invalid SVG geometry');
mkdirSync(OUT,{recursive:true});writeFileSync(`${OUT}/spot-apparatus.svg`,svg);
writeFileSync(`${OUT}/spot-apparatus-license.txt`,`Anatomy geometry helpers: Copyright (c) 2026 Ryan, MIT. https://github.com/wheresryan22/anatomy\n\n${await (await import('node:fs/promises')).readFile(resolve('tools/illustrations/reference/LICENSE'),'utf8')}`);
const allCorners=parts.flatMap(p=>p.plan?k.boxCorners(p.plan,p.z,p.z+p.h):k.boxCorners({x:p.circle[0]-p.circle[2],y:p.circle[1]-p.circle[2],w:2*p.circle[2],d:2*p.circle[2]},p.z,p.z+p.h));
const screen=allCorners.map(p=>k.iso(p,P));const bounds={minX:Math.min(...screen.map(x=>x[0])),maxX:Math.max(...screen.map(x=>x[0])),minY:Math.min(...screen.map(x=>x[1])),maxY:Math.max(...screen.map(x=>x[1]))};
writeFileSync(resolve('tools/illustrations/data/spot-geometry.json'),JSON.stringify({projection:P,solids:count,bounds,conceptual:true,parts:['scene','state','native','readout','control'],recordedResults:{native:577,readout:874,total:1104}},null,2));
console.log(JSON.stringify({svg:`${OUT}/spot-apparatus.svg`,solids:count,bounds}));
