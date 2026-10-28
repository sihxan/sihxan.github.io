/** Distinct conceptual research instruments. Geometry helpers: Anatomy, MIT (Ryan). */
import * as k from './reference/iso-kit.mjs';
import {mkdirSync,writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
const out=resolve('assets');mkdirSync(out,{recursive:true});
const qa={};
function studio(slug,klass,world,angles={}) {
  const W=960,H=600,P=k.fitProjection(world,W,H,{pad:42,azimuth:49,elevation:29,...angles});
  const objects=[];
  const s=(x,y,w,d,z,h,r=2,cls='')=>{objects.push({x,y,w,d,z,h});return k.solidSvg(k.slabOf({x,y,w,d,r},z,h,P,6,Math.min(.7,h/3)),{tone:'mid',className:cls});};
  const c=(x,y,r,z,h,cls='')=>{objects.push({x:x-r,y:y-r,w:r*2,d:r*2,z,h});return k.solidSvg(k.cylinder(x,y,r,z,h,P,32,.4),{tone:'mid',className:cls});};
  const l=(d,tone='lo')=>k.lineSvg(d,{tone});
  const dots=(points,size=.6)=>k.dotsSvg(points.map(p=>k.iso(p,P)),{size,tone:'mid'});
  const bolts=(p,z)=>l(k.corners(p,5).map(([x,y])=>k.ring(x,y,1,z,P,12)).join(''),'lo')+dots(k.corners(p,5).map(([x,y])=>[x,y,z]),.45);
  const panel=(x,y,w,d,z,h,cls='')=>s(x,y,w,d,z,h,3,cls)+bolts({x,y,w,d},z+h);
  const group=(id,body)=>`<g class="apparatus-part" data-part="${id}" role="button" tabindex="0" aria-label="${id}">${body}</g>`;
  const route=(id,points,z,start=0,end=1)=>`<path class="flow-track" data-flow-route="${id}" data-flow-start="${start}" data-flow-end="${end}" d="${k.onTop(points,z,P)}"/>`+dots([points[0].concat(z),points.at(-1).concat(z)],1.3);
  const foot=(x,y,z=-10)=>s(x-5,y-5,10,10,z,5,3,'foot');
  const css=`
.${klass}{--top:#f7faff;--shade0:#b9c9e1;--shade1:#cad6e8;--shade2:#dce5f2;--shade3:#eaf0f9;--edge:#8192b3;isolation:isolate}
.${klass} path,.${klass} circle{vector-effect:non-scaling-stroke}
.${klass} .iso-fill{fill:#e3ebf7;stroke:none}.${klass} .iso-top{fill:var(--top);stroke:none}
.${klass} .iso-shade{stroke:none}.${klass} .iso-shade[data-shade="0"]{fill:var(--shade0)}.${klass} .iso-shade[data-shade="1"]{fill:var(--shade1)}.${klass} .iso-shade[data-shade="2"]{fill:var(--shade2)}.${klass} .iso-shade[data-shade="3"]{fill:var(--shade3)}
.${klass} .iso-line{stroke:#a9b8d1;stroke-width:.75;stroke-linecap:round;stroke-linejoin:round;fill:none}.${klass} .iso-line[data-tone="mid"]{stroke:var(--edge)}.${klass} .iso-line[data-tone="hi"]{stroke:#4055b5}.${klass} .iso-line[data-tone="faint"]{stroke:#d5dfed}.${klass} .iso-dots{fill:#8295b8}
.${klass} .foot .iso-top,.${klass} .foot .iso-shade{fill:#9aacc9}.${klass} .base .iso-top{fill:#e9f0fa}.${klass} .inset .iso-top{fill:#d8e4f4}.${klass} .sheet .iso-top{fill:#fcfdff}.${klass} .accent .iso-top{fill:#5269be}.${klass} .accent .iso-shade{fill:#4055a5}.${klass} .dark .iso-top{fill:#2b4169}.${klass} .dark .iso-shade{fill:#243a61}.${klass} .mask .iso-top{fill:#afbdd6}.${klass} .mask .iso-shade{fill:#8a9dbf}.${klass} .glass .iso-top{fill:#cbdcff}.${klass} .glass .iso-shade{fill:#9eb9e4}
.${klass} .flow-track{fill:none;stroke:#b5c6e0;stroke-width:1.6;stroke-linejoin:round;stroke-linecap:round}.${klass} .apparatus-part{cursor:pointer;outline:none}.${klass} .apparatus-part.is-active{--top:#edf2ff;--shade0:#9badd9;--shade1:#b0c1e7;--shade2:#c8d5f0;--shade3:#e0e8fb}.${klass} .apparatus-part.is-active .iso-edge,.${klass} .apparatus-part.is-hovered .iso-edge,.${klass} .apparatus-part:hover .iso-edge{stroke:#4055b5;stroke-width:1.25}.${klass} .apparatus-part:focus-visible .iso-edge{stroke:#4055b5;stroke-width:1.8}
`;
  const finish=(body,title,ids)=>{
    const points=objects.flatMap(({x,y,w,d,z,h})=>k.boxCorners({x,y,w,d},z,z+h)).map(p=>k.iso(p,P));
    const box={minX:Math.min(...points.map(p=>p[0])),maxX:Math.max(...points.map(p=>p[0])),minY:Math.min(...points.map(p=>p[1])),maxY:Math.max(...points.map(p=>p[1]))};
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" class="project-apparatus ${klass}" viewBox="0 0 ${W} ${H}" role="group" aria-label="${title}"><title>${title}</title><desc>Conceptual research apparatus; not a physical system, evaluation image, or live model run.</desc><style>${css}</style>${body}</svg>`;
    if(/NaN|undefined/.test(svg))throw Error('Invalid geometry');
    if(box.minX<0||box.maxX>W||box.minY<0||box.maxY>H)throw Error('Out of bounds '+JSON.stringify(box));
    writeFileSync(`${out}/project-${slug}.svg`,svg);qa[slug]={solids:objects.length,bounds:box,parts:ids,conceptual:true};
  };
  return {P,s,c,l,dots,bolts,panel,group,route,foot,finish};
}

function clip() {
  const b={x:-153,y:-71,w:311,d:154};
  const {P,s,c,l,dots,panel,group,route,foot,finish}=studio('clip-context','clip-apparatus',[...k.boxCorners(b,-13,0),[-130,-30,25],[123,-31,106]],{azimuth:52,elevation:33});
  // A narrow light table with three separate slide mounts; no generic large mother-board.
  let base='';for(const [x,y]of k.corners(b,16).sort((a,b)=>k.depthOf([...a,0],P)-k.depthOf([...b,0],P)))base+=foot(x,y,-13);
  base+=panel(b.x,b.y,b.w,b.d,-8,8,'base');
  base+=route('slides-to-lens',[[-62,-3],[-62,-45],[79,-45],[79,-22]],.3,0,.5);
  base+=route('lens-to-checks',[[121,9],[142,9],[142,56],[108,56]],.3,.52,1);
  let images='';
  for(let i=0;i<3;i++){
    const x=-140+i*66,y=-32;
    images+=panel(x,y,58,65,0,5);
    images+=s(x+5,y+5,48,55,5,1.1,2,'inset');
    images+=s(x+9,y+10,40,44,6.1,.5,1,'sheet');
    // Miniature scene imagery is invented and explicitly called conceptual in the caption.
    images+=s(x+13,y+36,31,13,6.6,.3,1,'glass');
    images+=s(x+23,y+23,7,7,6.9,1.7,1,'accent');
    images+=s(x+4,y+3,4,59,6.1,2,1);images+=s(x+50,y+3,4,59,6.1,2,1);
    images+=s(x+18,y+59,22,4,5,3,1,'dark');
  }
  let masks='';
  // Second panel masks the object; third masks another region. They stay distinct.
  // A light mask carriage rides two short guides on the second slide only.
  masks+=s(-57,-22,2,44,6.6,2,1,'inset')+s(-32,-22,2,44,6.6,2,1,'inset');
  const maskTravel=k.axisVector(P,[0,8,0]);
  masks+=`<g data-motion="scan" data-motion-range="${maskTravel.join(' ')}">`+
    s(-51,-11,15,15,8.6,1.6,1,'mask')+
    s(-57,-7,6,6,8.6,1.6,1)+s(-36,-7,6,6,8.6,1.6,1)+'</g>';
  masks+=s(23,7,15,15,8.6,1.6,1,'mask');
  masks+=panel(-123,45,139,20,0,4);
  masks+=s(-115,52,122,3,4,1,1,'inset');
  for(let i=0;i<3;i++){masks+=s(-111+i*48,49,8,9,5,4,1,'accent');masks+=dots([[-107+i*48,53,9.2]],.6);}
  masks+=s(-123,45,4,20,4,2,1);masks+=s(12,45,4,20,4,2,1);
  let scoring='';
  scoring+=panel(73,-35,63,62,0,7);
  scoring+=s(103,-30,11,13,7,82,2);scoring+=s(78,-29,36,13,89,8,2);
  // Objective lens and stacked housing are a symbolic score-reading instrument.
  scoring+=c(86,-15,14,66,8);scoring+=c(86,-15,11,58,8,'accent');scoring+=c(86,-15,8,54,4,'glass');
  scoring+=c(108,-23,9,97,5);scoring+=l(k.knurl(108,-23,9,97,102,30,P),'lo');
  scoring+=panel(68,33,71,34,0,5);
  for(let i=0;i<5;i++){scoring+=c(78+i*12,48,4.2,5,3,i===2?'accent':'');scoring+=l(k.ring(78+i*12,48,3.1,8,P,20),'lo');}
  let checks='';
  checks+=panel(31,42,31,33,0,4);
  for(let i=0;i<3;i++)checks+=s(34+i*.7,46-i*.7,24,25,4+i*1.2,1.1,1,'sheet');
  const row=pts=>l(k.onTop(pts,7.4,P),'faint');
  for(let j=0;j<3;j++)checks+=row([[39,50+j*5],[55,50+j*5]]);
  checks+=s(40,43,13,3,7.4,1.5,1,'dark');
  finish(base+group('scoring',scoring)+group('images',images)+group('masking',masks)+group('checks',checks),'CLIP masking and scoring optical comparator',['images','masking','scoring','checks']);
}

function cache() {
  const world=[...k.boxCorners({x:-191,y:-67,w:340,d:157},-12,0),...k.boxCorners({x:-181,y:-60,w:113,d:22},27,111),...k.boxCorners({x:-29,y:-31,w:76,d:78},0,85)];
  const {P,s,c,l,dots,panel,group,route,foot,finish}=studio('kv-cache','cache-apparatus',world,{azimuth:52,elevation:25});
  // Video on a recognizable TV; the separate cards below it represent KV memory.
  let base='';
  for(const [x,y]of [[-177,-51],[-79,52],[-21,-23],[38,42],[80,-10],[135,67]])base+=foot(x,y,-12);
  base+=panel(-191,-67,136,130,-7,7,'base');
  base+=panel(-34,-36,86,92,-7,7,'base');
  base+=panel(69,-22,80,104,-7,7,'base');
  base+=route('archive-codec',[[-61,30],[-44,30],[-44,6],[-25,6]],.3,.08,.4);
  base+=route('codec-reader',[[45,6],[61,6],[61,20],[74,20]],.3,.5,.9);
  let memory='';
  memory+=panel(-152,-50,55,33,0,4);
  memory+=s(-131,-48,14,13,4,25,2);
  memory+=s(-181,-60,113,22,27,84,5);
  // All screen artwork is mapped into the TV's front plane, not overlaid in screen space.
  const front=k.sideMatrix([-175,-37.8],105,P,'left');
  memory+=`<g transform="${front}">
    <rect x="0" y="0" width="101" height="66" rx="5" fill="#223654"/>
    <rect x="4" y="4" width="93" height="52" rx="3" fill="#dbe6f5"/>
    <path d="M4 37 Q24 20 44 36T97 31V56H4Z" fill="#b5c9e3"/>
    <path d="M4 48Q26 37 50 46T97 43V56H4Z" fill="#8ca7cb"/>
    <circle cx="77" cy="17" r="5.5" fill="#f3f6fb"/>
    <g data-motion="scan" data-motion-range="20 0"><rect x="27" y="29" width="11" height="10" rx="2" fill="#4055b5"/><circle cx="29" cy="40" r="2" fill="#263951"/><circle cx="36" cy="40" r="2" fill="#263951"/></g>
    <path d="M7 60H94" stroke="#758caa" stroke-width="1"/>
    <g data-motion="scan" data-motion-range="38 0"><circle cx="19" cy="60" r="1.8" fill="#e8effb"/></g>
    <path d="m8 9 5 3-5 3Z" fill="#4055b5"/>
    <circle cx="98" cy="71" r="1.2" fill="#4055b5"/>
    <path d="M43 71H58" stroke="#9dacbf" stroke-width="1.6" stroke-linecap="round"/>
  </g>`;
  // Layered memory cards are outside the TV. No film strip enters the compressor.
  memory+=panel(-170,2,104,50,0,5);
  for(let j=0;j<5;j++){
    const x=-162+j*17;
    memory+=s(x,8,13,36,5,4+j*4,1,j===2?'accent':'sheet');
    memory+=s(x+3,12,7,13,9+j*4,.7,1,j===2?'glass':'inset');
    memory+=dots([[x+4,33,10+j*4],[x+9,33,10+j*4]],.7);
  }
  memory+=s(-164,46,92,3,5,3,1,'inset');
  let codec='';
  codec+=panel(-29,-31,76,78,0,8);
  codec+=s(-22,-23,8,12,8,62,1.5)+s(32,-23,8,12,8,62,1.5);
  codec+=s(-22,-23,62,40,70,8,2);
  codec+=s(-12,-12,42,44,8,3,2,'inset');
  // Gaps close while every card retains thickness; no fabricated compression ratio.
  for(let j=0;j<4;j++){
    const travel=k.axisVector(P,[0,0,-j*5]);
    codec+=`<g data-motion="scan" data-motion-range="${travel.join(' ')}">`+
      s(-5,-4,29,28,11+j*8,3,1,j===3?'glass':'sheet')+'</g>';
  }
  // Head remains 2 units above the upper card at both ends of its stroke.
  const pressTravel=k.axisVector(P,[0,0,-15]);
  codec+=`<g data-motion="scan" data-motion-range="${pressTravel.join(' ')}">`+
    c(9,10,4,47,25)+panel(-9,-8,36,36,40,7,'accent')+'</g>';
  codec+=c(9,10,8,55,15)+c(9,10,11,78,5,'accent');
  codec+=l(k.knurl(9,10,11,78,83,32,P),'lo');
  codec+=s(-19,32,56,6,8,.7,1,'inset');
  // A compact cartridge at the exit contrasts with the loose input memory cards.
  codec+=s(26,18,18,23,8,7,2,'dark');
  codec+=s(29,21,12,17,15,1,1,'accent');
  for(let j=0;j<3;j++)codec+=s(29+j*4,35,2,4,16,.4,.2,'sheet');
  let decode='';
  decode+=panel(74,-17,68,44,0,7);
  decode+=s(79,-13,58,34,7,2,2,'dark');
  for(let j=0;j<5;j++)decode+=s(83+j*10,-8,6,24,9,5,1,j===2?'accent':'sheet');
  decode+=s(77,19,62,4,7,5,1);
  decode+=panel(74,34,68,43,0,5);
  for(let j=0;j<4;j++)decode+=s(80+j*14,42,9,26,5,3,1,'sheet');
  let measure='';
  measure+=panel(-29,65,89,24,0,5);
  for(let j=0;j<3;j++){
    const x=-14+j*29;
    measure+=c(x,77,9,5,3)+c(x,77,6.5,8,.7,'glass');
    measure+=l(k.ring(x,77,5.2,8.8,P,32),'lo');
    const ticks=k.radialTicks(x,77,5.2,12,3,8.8,[1,1.5],P);
    measure+=l(ticks.minor,'lo')+l(ticks.major,'mid');
    measure+=dots([[x,77,9]],1);
  }
  finish(base+group('memory',memory)+group('codec',codec)+group('decode',decode)+group('measure',measure),'Video TV, KV memory cards, compression press and independent validation instruments',['memory','codec','decode','measure']);
}

clip();cache();
writeFileSync(resolve('tools/illustrations/data/research-geometry.json'),JSON.stringify(qa,null,2));
console.log(JSON.stringify(qa));
