/** Conceptual portfolio apparatus. Uses Anatomy geometry helpers (MIT, Ryan 2026).
 * No real outputs, private imagery, benchmark values, or product architecture are depicted.
 * Run from workspace root: node tools/illustrations/data/products.mjs
 */
import {mkdirSync, writeFileSync} from 'node:fs';
import {resolve} from 'node:path';
import * as k from './reference/iso-kit.mjs';

const OUT=resolve('assets');
mkdirSync(OUT,{recursive:true});
const escape=s=>String(s).replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');

function apparatus(slug,cls,world,azimuth=49){
  const W=960,H=600;
  const P=k.fitProjection(world,W,H,{pad:46,azimuth,elevation:30});
  const corners=[];let count=0;
  function slab(x,y,w,d,z,h,r=2,kind=''){
    count++;const plan={x,y,w,d,r};corners.push(...k.boxCorners(plan,z,z+h));
    return k.solidSvg(k.slabOf(plan,z,h,P,6,Math.min(.7,h*.2)),{tone:'mid',className:kind});
  }
  function cylinder(x,y,r,z,h,kind=''){
    count++;corners.push(...k.boxCorners({x:x-r,y:y-r,w:r*2,d:r*2},z,z+h));
    return k.solidSvg(k.cylinder(x,y,r,z,h,P,36,.5),{tone:'mid',className:kind});
  }
  function line(points,tone='lo'){return k.lineSvg(k.pathOf(points.map(p=>k.iso(p,P))),{tone});}
  function outline(points,kind='surface',closed=true){
    corners.push(...points);return `<path class="${kind}" d="${k.pathOf(points.map(p=>k.iso(p,P)),closed)}"/>`;
  }
  function dots(points,r=.6){return k.dotsSvg(points.map(p=>k.iso(p,P)),{size:r,tone:'mid'});}
  function screws(x,y,w,d,z){const pts=k.corners({x,y,w,d},4);return k.lineSvg(pts.map(([x,y])=>k.ring(x,y,1.15,z,P,16)).join(''),{tone:'lo'})+dots(pts.map(([x,y])=>[x,y,z]),.4);}
  function front(x,y,z,body){return `<g transform="${k.sideMatrix([x,y],z,P,'left')}">${body}</g>`;}
  function group(id,body){return `<g class="apparatus-part" data-part="${id}" role="button" tabindex="0" aria-label="${id}">${body}</g>`;}
  function trace(id,points,start,end){return `<path class="flow-track" data-flow-route="${id}" data-flow-start="${start}" data-flow-end="${end}" pathLength="100" d="${k.pathOf(points.map(p=>k.iso(p,P)))}"/>`+dots([points[0],points.at(-1)],1.3);}
  function shirt(x,y,z,scale=1,kind='cloth'){
    count++;const shape=[[-10,0],[-26,7],[-38,23],[-27,33],[-19,25],[-19,65],[19,65],[19,25],[27,33],[38,23],[26,7],[10,0],[7,7],[-7,7]];
    const pts=shape.map(([a,b])=>[x+a*scale,y,z-b*scale]);
    const back=shape.map(([a,b])=>[x+a*scale,y-2.5*scale,z-b*scale]);
    let out=outline(back,'cloth-edge');
    for(let i=0;i<pts.length;i++){const j=(i+1)%pts.length;if(pts[i][0]+pts[j][0]>2*x)out+=outline([back[i],back[j],pts[j],pts[i]],'cloth-side');}
    out+=outline(pts,kind);
    out+=line([[x-17*scale,y+.1,z-60*scale],[x+17*scale,y+.1,z-60*scale]],'faint');
    out+=line([[x-9*scale,y+.1,z-2*scale],[x-6*scale,y+.1,z-9*scale],[x+6*scale,y+.1,z-9*scale],[x+9*scale,y+.1,z-2*scale]],'faint');
    return out;
  }
  function finish(body,title,ids){
    const css=`
.${cls}{--top:#f7faff;--s0:#b9c9e0;--s1:#cad7e9;--s2:#dbe4f1;--s3:#e9eff7;--edge:#8b9cbb;color:#4055b5}
.${cls} path,.${cls} circle,.${cls} rect,.${cls} ellipse{vector-effect:non-scaling-stroke}
.${cls} .iso-fill{fill:#e7edf7;stroke:none}.${cls} .iso-top{fill:var(--top);stroke:none}.${cls} .iso-shade{stroke:none}
.${cls} .iso-shade[data-shade="0"]{fill:var(--s0)}.${cls} .iso-shade[data-shade="1"]{fill:var(--s1)}.${cls} .iso-shade[data-shade="2"]{fill:var(--s2)}.${cls} .iso-shade[data-shade="3"]{fill:var(--s3)}
.${cls} .iso-line{fill:none;stroke:#b4c1d7;stroke-width:.7;stroke-linecap:round;stroke-linejoin:round}.${cls} .iso-line[data-tone="faint"]{stroke:#d6dfec}.${cls} .iso-line[data-tone="mid"]{stroke:var(--edge)}.${cls} .iso-line[data-tone="hi"]{stroke:#536d9c}.${cls} .iso-dots{fill:#7b90b2}
.${cls} .ink .iso-top{fill:#344968}.${cls} .ink .iso-shade{fill:#263b59}.${cls} .blue .iso-top{fill:#657ac4}.${cls} .blue .iso-shade{fill:#425aa3}
.${cls} .soft .iso-top{fill:#dce5f4}.${cls} .paper .iso-top{fill:#fff}.${cls} .base .iso-top{fill:#e9eff8}.${cls} .rubber .iso-top,.${cls} .rubber .iso-shade{fill:#8b9dbb}
.${cls} .surface{fill:#f7faff;stroke:#9badc9;stroke-width:.7;stroke-linejoin:round}.${cls} .glass{fill:#e8eff9;stroke:#899fbe;stroke-width:.8}.${cls} .screen{fill:#293e61;stroke:#8299b9;stroke-width:.7}
.${cls} .cloth{fill:#8396ce;stroke:#526bb0;stroke-width:.8;stroke-linejoin:round}.${cls} .cloth-edge,.${cls} .cloth-side{fill:#5269a7;stroke:#5269a7;stroke-width:.5}.${cls} .cloth-light{fill:#dbe4f4;stroke:#879dbd;stroke-width:.7}
.${cls} .rule{fill:none;stroke:#a3b6d4;stroke-width:.65;stroke-linecap:round}.${cls} .bright-rule{fill:none;stroke:#abc2ec;stroke-width:1.6;stroke-linecap:round}.${cls} .glyph{fill:#b6c8e8;stroke:none}
.${cls} .flow-track{fill:none;stroke:#c4d0e4;stroke-width:1.8;stroke-linejoin:round;stroke-linecap:round}
.${cls} .apparatus-part{cursor:pointer;outline:none}.${cls} .apparatus-part.is-active{--top:#edf2ff;--s0:#9aaedc;--s1:#adbee6;--s2:#c2d0ef;--s3:#dce5fa}
.${cls} .apparatus-part.is-active .iso-edge,.${cls} .apparatus-part.is-hovered .iso-edge,.${cls} .apparatus-part:hover .iso-edge{stroke:#4055b5;stroke-width:1.3}.${cls} .apparatus-part:focus-visible .iso-edge{stroke:#4055b5;stroke-width:1.8}
`;
    const viewBox=slug==='sunicon-vton'?'245 55 530 490':'180 35 555 530';
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" class="project-apparatus ${cls}" viewBox="${viewBox}" role="group" aria-label="${escape(title)}"><title>${escape(title)}</title><desc>Conceptual illustration of the project workflow. Not a real product screenshot or experimental output.</desc><style>${css}</style>${body}</svg>`;
    if(/NaN|undefined/.test(svg))throw Error(`${slug}: invalid coordinates`);
    const screen=corners.map(p=>k.iso(p,P));
    const bounds={minX:Math.min(...screen.map(p=>p[0])),maxX:Math.max(...screen.map(p=>p[0])),minY:Math.min(...screen.map(p=>p[1])),maxY:Math.max(...screen.map(p=>p[1]))};
    if(bounds.minX<0||bounds.maxX>W||bounds.minY<0||bounds.maxY>H)throw Error(`${slug}: out of bounds ${JSON.stringify(bounds)}`);
    writeFileSync(`${OUT}/project-${slug}.svg`,svg);
    return {slug,solids:count,bounds,ids,projection:P};
  }
  return {P,slab,cylinder,line,outline,dots,screws,front,group,trace,shirt,finish};
}

function vton(){
  // A real atelier silhouette: tall garment rail, measuring worktop, GPU controller,
  // and fitting display. Samples and garments are deliberately schematic.
  const a=apparatus('sunicon-vton','vton-apparatus',k.boxCorners({x:-160,y:-76,w:320,d:172},-13,154),54);
  const {slab:S,cylinder:C,line:L,outline:O,dots:D,screws:B,front:F,group:G,trace:T,shirt}=a;
  let ground='';
  ground+=T('prepare',[[-103,13,1],[-103,25,1],[-47,25,1],[-47,42,1]],0,.24);
  ground+=T('instructions',[[18,58,1],[37,58,1],[37,67,1],[54,67,1]],.25,.5);
  ground+=T('generate',[[83,41,1],[83,20,1],[115,20,1],[115,-1,1]],.51,.8);
  // Garment rail and hanger, including weighted feet and a removable display rail.
  let inputs='';
  for(const x of [-150,-55]){
    inputs+=S(x,-47,15,48,-8,8,5,'base');inputs+=S(x+4,-39,7,31,0,3,2);
    inputs+=S(x+5,-28,5,5,3,139,2);inputs+=C(x+7.5,-25.5,4,137,6);
  }
  inputs+=S(-145,-28,100,5,142,5,2);inputs+=D([[-141,-25.5,147],[-50,-25.5,147]],.8);
  inputs+=L([[-98,-25,142],[-98,-23,137],[-100,-19,132]],'hi');
  inputs+=L([[-100,-19,132],[-125,-19,120],[-75,-19,120],[-100,-19,132]],'hi');
  inputs+=shirt(-100,-16,121,.89);
  // The measuring desk sits in front of the rail, lower than the garment.
  let fit='';
  const table={x:-76,y:24,w:91,d:66};
  for(const [x,y]of k.corners(table,7))fit+=S(x-3,y-3,6,6,-6,43,2);
  fit+=S(-79,21,97,72,37,6,5,'base');fit+=B(-79,21,97,72,43);
  fit+=S(-70,30,69,49,43,.7,2,'paper');
  // Flat shirt cutting pattern, on the actual measuring surface.
  const pattern=[[-48,35],[-60,42],[-55,51],[-48,47],[-48,69],[-23,69],[-23,47],[-16,51],[-11,42],[-23,35],[-30,35],[-32,40],[-39,40],[-41,35]];
  fit+=O(pattern.map(([x,y])=>[x,y,44]),'cloth-light');
  fit+=S(-72,82,81,5,43,1,1,'soft');
  const ticks=k.topTicks(-69,6,3,5,83,44,[2,3.5],a.P);
  fit+=k.lineSvg(ticks.minor,{tone:'lo'})+k.lineSvg(ticks.major,{tone:'mid'});
  fit+=S(4,32,5,40,43,1,1,'soft');
  fit+=S(-67,27,16,3,44,2,1);fit+=S(-21,73,16,3,44,2,1);
  // Local instruction engine with a raised control screen, validation controls.
  let prompt='';
  prompt+=S(49,40,47,43,-5,6,4,'base');prompt+=S(52,43,41,37,1,22,4);
  prompt+=S(56,47,33,20,23,2,2,'ink');
  for(let i=0;i<4;i++)prompt+=L([[60,51+i*4,25.2],[82-i*2,51+i*4,25.2]],'mid');
  for(let i=0;i<3;i++)prompt+=S(58+i*10,71,7,5,23,1.5,1,i===1?'blue':'soft');
  prompt+=B(52,43,41,37,23);
  // One GPU enclosure: thick lid, fitted card, ports, cooling ribs and status lamp.
  let run='';
  run+=S(-36,-73,67,43,-6,8,4,'base');run+=S(-32,-69,59,35,2,20,4);
  run+=S(-29,-66,53,29,22,2,3,'soft');
  for(let i=0;i<6;i++)run+=S(-25+i*7,-61,4,19,24,2,.8,'ink');
  run+=S(-24,-71,35,2,8,7,.5,'ink');run+=S(15,-71,5,2,10,5,.5,'blue');
  run+=B(-29,-66,53,29,24);
  ground+=T('schedule',[[1,-30,1],[1,-13,1],[58,-13,1],[58,40,1]],.8,.98);
  // Fitting result is a physical portrait stand with a schematic mannequin image.
  let render='';
  render+=S(88,-43,60,46,-8,8,6,'base');render+=S(112,-31,9,13,0,28,3);
  render+=S(82,-32,71,9,28,111,4);render+=S(87,-22.5,61,1,33,101,1,'ink');
  render+=F(89,-21,132,'<rect class="glass" x="0" y="0" width="57" height="97" rx="2"/><ellipse class="glyph" cx="28.5" cy="17" rx="7" ry="9"/><path class="rule" d="M20 28h17m-21 55h25"/>');
  render+=shirt(117.5,-19,102,.54,'cloth');
  render+=L([[108,-18.8,67],[108,-18.8,48]],'mid')+L([[127,-18.8,67],[127,-18.8,48]],'mid');
  render+=D([[87,-21,137],[148,-21,137],[87,-21,30],[148,-21,30]],.6);
  const body=ground+G('run',run)+G('inputs',inputs)+G('render',render)+G('fit',fit)+G('prompt',prompt);
  return a.finish(body,'A virtual try-on atelier with garment inputs, a measurement table, local instructions, one GPU and a fitting display',['inputs','fit','prompt','render','run']);
}

function rag(){
  // A library retrieval machine: vertical archive, query terminal, document shuttle,
  // and reading lectern. The architecture is conceptual, not the product UI.
  const a=apparatus('allmize','rag-apparatus',k.boxCorners({x:-160,y:-86,w:324,d:178},-12,158),48);
  const {slab:S,cylinder:C,line:L,outline:O,dots:D,screws:B,front:F,group:G,trace:T}=a;
  let base='';
  base+=T('query',[[-103,62,1],[-45,62,1],[-45,13,1],[-9,13,1]],0,.3);
  base+=T('documents',[[-53,-44,1],[-22,-44,1],[-22,1,1],[-9,1,1]],0,.3);
  base+=T('context',[[35,15,1],[69,15,1],[69,22,1],[91,22,1]],.35,.7);
  // Open backed archive with three well-supported shelves and individual books.
  let documents='';
  documents+=S(-151,-76,94,43,-8,8,5,'base');
  documents+=S(-149,-75,5,38,0,145,2);documents+=S(-64,-75,5,38,0,145,2);
  documents+=S(-144,-75,80,3,0,145,1,'soft');
  for(const z of [3,47,91,135])documents+=S(-145,-75,82,39,z,4,1.5);
  let book=0;
  for(let row=0;row<3;row++){
    let x=-140;
    for(let col=0;col<5;col++){
      const width=[11,13,10,14,9][col],height=[31,34,29,32,33][(col+row)%5],z=7+row*44;
      documents+=S(x,-67,width,24,z,height,1.2,book++%4===0?'blue':book%3===0?'soft':'paper');
      documents+=L([[x+2,-42.7,z+height-5],[x+width-2,-42.7,z+height-5]],'faint');
      documents+=F(x+2,-42.6,z+height-9,'<path class="rule" d="M0 0h5M0 3h4"/>');x+=width+3;
    }
  }
  documents+=B(-151,-76,94,43,0);documents+=S(-128,-34,46,5,3,2,1,'soft');
  // A reader's query terminal, with keyboard and a readable paper-like field.
  let service='';
  service+=S(-143,18,66,65,-6,7,5,'base');service+=S(-133,27,46,33,1,24,3);
  service+=S(-129,31,38,25,25,2,2,'ink');
  for(let i=0;i<3;i++)service+=L([[-125,35+i*6,27.2],[-96+i*3,35+i*6,27.2]],'mid');
  service+=S(-134,66,47,11,1,3,2,'soft');
  for(let row=0;row<2;row++)for(let col=0;col<7;col++)service+=`<path class="surface" d="${k.planOutline({x:-131+col*6,y:68+row*4,w:4.2,d:2.6,r:.6},4.2,a.P)}"/>`;
  service+=S(-126,79,33,3,1,2,.6);service+=D([[-82,72,1.2]],1.3);
  // Retrieval is a shuttle on rails, with an open document magazine. It selects
  // a paper card, rather than implying an unsupported ranking algorithm.
  let retrieve='';
  retrieve+=S(-25,-29,74,64,-7,7,5,'base');
  retrieve+=S(-20,-24,5,54,0,5,1);retrieve+=S(37,-24,5,54,0,5,1);
  retrieve+=S(-16,-3,52,24,5,5,2);retrieve+=B(-16,-3,52,24,10);
  retrieve+=S(-7,-16,36,10,10,36,2,'soft');
  for(let i=0;i<4;i++)retrieve+=S(-4+i*2,-10+i*3,29,1.7,16+i*1.2,31,1,i===3?'blue':'paper');
  retrieve+=S(-12,9,44,21,10,2,2,'paper');
  retrieve+=L([[-7,14,12.2],[26,14,12.2]],'mid')+L([[-7,18,12.2],[20,18,12.2]],'lo')+L([[-7,22,12.2],[23,22,12.2]],'lo');
  retrieve+=S(-23,-27,70,5,3,5,1.5);retrieve+=S(-23,29,70,5,3,5,1.5);
  // Answer lectern: open pages and integrated application controls, on a distinct
  // pedestal rather than a second retrieval cabinet.
  let answer='';
  answer+=S(78,-17,77,68,-7,7,7,'base');answer+=S(109,1,13,22,0,42,3);
  answer+=S(76,-20,82,70,42,5,5);answer+=B(76,-20,82,70,47);
  answer+=S(83,-12,66,54,47,1,2,'ink');
  answer+=S(86,-9,29,47,48,.7,1,'paper');answer+=S(117,-9,29,47,48,.7,1,'paper');
  answer+=L([[116,-9,49],[116,38,49]],'mid');
  for(let i=0;i<5;i++){answer+=L([[91,-1+i*6,49],[110-(i%2)*3,-1+i*6,49]],'lo');answer+=L([[122,-1+i*6,49],[141-(i%2)*4,-1+i*6,49]],'lo');}
  answer+=S(85,43,17,4,47,2,1,'blue');answer+=S(108,43,17,4,47,2,1,'soft');answer+=S(131,43,17,4,47,2,1,'soft');
  const body=base+G('documents',documents)+G('retrieve',retrieve)+G('answer',answer)+G('service',service);
  return a.finish(body,'A document library with a query terminal, retrieval shuttle and answer reading desk',['documents','retrieve','answer','service']);
}

const report=[vton(),rag()];
writeFileSync(resolve('tools/illustrations/data/products-geometry.json'),JSON.stringify(report,null,2));
console.log(JSON.stringify(report.map(({slug,solids,bounds,ids})=>({slug,solids,bounds,ids})),null,2));
