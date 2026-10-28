/** Three bounded conceptual portfolio figures. Geometry helpers: Anatomy, MIT (Ryan).
 * Run from workspace root: node tools/illustrations/data/learning.mjs
 * Illustrations are explanatory objects, not experiment captures or generated samples.
 */
import {writeFileSync,mkdirSync} from 'node:fs';
import {resolve} from 'node:path';
import * as k from './reference/iso-kit.mjs';
const OUT=resolve('assets');
mkdirSync(OUT,{recursive:true});
const reports=[];

function factory(slug,cls,extent,camera={azimuth:52,elevation:30}){
  const W=960,H=600,P=k.fitProjection(extent,W,H,{pad:45,...camera});
  const recorded=[];
  const S=(x,y,w,d,z,h,r=2,c='')=>{const plan={x,y,w,d,r};recorded.push({plan,z,h});return k.solidSvg(k.slabOf(plan,z,h,P,8,Math.min(.7,h/4)),{tone:'mid',className:c});};
  const C=(x,y,r,z,h,c='')=>{recorded.push({plan:{x:x-r,y:y-r,w:2*r,d:2*r,r},z,h});return k.solidSvg(k.cylinder(x,y,r,z,h,P,48,.4),{tone:'mid',className:c});};
  const L=(d,tone='lo',c='')=>k.lineSvg(d,{tone,className:c});
  const D=(points,size=.65)=>k.dotsSvg(points.map(p=>k.iso(p,P)),{size,tone:'mid'});
  const poly=(points,c)=>`<path class="${c}" d="${k.pathOf(points.map(p=>k.iso(p,P)),true)}"/>`;
  const screw=(x,y,z)=>L(k.ring(x,y,1.3,z,P,20))+D([[x,y,z]],.5);
  const screws=(plan,z,inset=4)=>k.corners(plan,inset).map(([x,y])=>screw(x,y,z)).join('');
  const group=(id,body)=>`<g class="apparatus-part" data-part="${id}" role="button" tabindex="0" aria-label="${id}">${body}</g>`;
  const rule=(x,y,w,z)=>L(k.lineOnTop([x,y],[x+w,y],z,P),'lo','printed-rule');
  const route=(id,points,z,start=0,end=1)=>`<path class="flow-track" data-flow-route="${id}" data-flow-start="${start}" data-flow-end="${end}" pathLength="100" d="${k.onTop(points,z,P)}"/>`;
  const front=(x,y,z,w,h,c)=>poly([[x,y,z],[x+w,y,z],[x+w,y,z+h],[x,y,z+h]],c);
  const css=`
.${cls}{--top:#f6f9ff;--s0:#bbcbe3;--s1:#cbd8eb;--s2:#dbe5f3;--s3:#e9eff8;--edge:#8d9fbd;color:#4055b5}
.${cls} path,.${cls} circle{vector-effect:non-scaling-stroke}
.${cls} .iso-fill{fill:#e6edf8;stroke:none}.${cls} .iso-top{fill:var(--top);stroke:none}
.${cls} .iso-shade{stroke:none}.${cls} .iso-shade[data-shade="0"]{fill:var(--s0)}.${cls} .iso-shade[data-shade="1"]{fill:var(--s1)}.${cls} .iso-shade[data-shade="2"]{fill:var(--s2)}.${cls} .iso-shade[data-shade="3"]{fill:var(--s3)}
.${cls} .iso-line{fill:none;stroke:var(--edge);stroke-width:.75;stroke-linejoin:round;stroke-linecap:round}.${cls} .iso-line[data-tone="faint"]{stroke:#d2ddec}.${cls} .iso-line[data-tone="hi"]{stroke:#51678f}
.${cls} .iso-dots{fill:#7b8dab}.${cls} .accent .iso-top{fill:#667cc5}.${cls} .accent .iso-shade{fill:#4055a4}.${cls} .dark .iso-top,.${cls} .dark .iso-shade{fill:#31486d}.${cls} .tint .iso-top{fill:#dce5f7}
.${cls} .paper{fill:#f8fbff;stroke:#91a3c1;stroke-width:.7}.${cls} .screen{fill:#2c4269;stroke:#8a9ec5;stroke-width:1}.${cls} .noise{fill:#9db0db;stroke:none}.${cls} .ink{fill:#4055b5;stroke:none}.${cls} .quiet-ink{fill:#c4d2ec;stroke:none}.${cls} .rule{fill:none;stroke:#a5b6d1;stroke-width:1.1;stroke-linecap:round}.${cls} .mask{fill:#3f55aa;stroke:none}
.${cls} .flow-track{fill:none;stroke:#adbde0;stroke-width:1.5;stroke-linecap:round;stroke-linejoin:round}
.${cls} .apparatus-part{cursor:pointer;outline:none}.${cls} .apparatus-part.is-active{--top:#edf2ff;--s0:#9aacd7;--s1:#afc0e5;--s2:#c5d3ef;--s3:#dce6fa}
.${cls} .apparatus-part.is-active .iso-edge,.${cls} .apparatus-part.is-hovered .iso-edge,.${cls} .apparatus-part:hover .iso-edge{stroke:#4055b5;stroke-width:1.3}.${cls} .apparatus-part:focus-visible .iso-edge{stroke:#233b9d;stroke-width:1.9}
`;
  function save(body,title,ids){
    const points=recorded.flatMap(({plan,z,h})=>k.boxCorners(plan,z,z+h)).map(p=>k.iso(p,P));
    const b={x:Math.min(...points.map(p=>p[0])),y:Math.min(...points.map(p=>p[1])),right:Math.max(...points.map(p=>p[0])),bottom:Math.max(...points.map(p=>p[1]))};
    const vb=[b.x-35,b.y-35,b.right-b.x+70,b.bottom-b.y+70].map(x=>+x.toFixed(2));
    const svg=`<svg xmlns="http://www.w3.org/2000/svg" class="project-apparatus ${cls}" viewBox="${vb.join(' ')}" role="group" aria-labelledby="${slug}-title"><title id="${slug}-title">${title}</title><desc>Conceptual illustration. Shapes and motion explain the project; they are not measured results.</desc><style>${css}</style>${body}</svg>`;
    if(/NaN|undefined|Infinity/.test(svg))throw Error(`Invalid geometry: ${slug}`);
    writeFileSync(`${OUT}/project-${slug}.svg`,svg);
    reports.push({slug,solids:recorded.length,viewBox:vb,parts:ids,conceptual:true});
  }
  return {P,S,C,L,D,poly,screw,screws,group,rule,route,front,save};
}

// SAMBA: a round indexing carousel with separate sorting, reserve, allocation and audit stations.
{
  const a=factory('samba','samba-apparatus',[[-128,-116,-18],[128,119,45]],{azimuth:50,elevation:37});
  const {P,S,C,L,D,poly,screws,group,rule,route,save}=a;
  let base='';
  for(const [x,y]of [[-73,-65],[73,-65],[-73,65],[73,65]])base+=C(x,y,8,-18,6,'dark');
  base+=C(0,0,114,-12,9);base+=C(0,0,110,-3,3,'tint');
  base+=L(k.ring(0,0,107,.1,P,100),'faint');
  base+=C(0,0,21,0,7)+C(0,0,15,7,5,'accent');
  base+=L(k.knurl(0,0,15,7,12,38,P),'lo');
  const ticks=k.radialTicks(0,0,17,24,6,7,[1.1,2],P);
  base+=L(ticks.minor)+L(ticks.major,'hi');
  const dialCenter=k.iso([0,0,12.1],P).map(x=>x.toFixed(2)).join(' ');
  base+=`<g data-motion="rotate" data-motion-range="13" data-motion-center="${dialCenter}">${L(k.lineOnTop([0,0],[8,-5],12.1,P),'hi')}</g>`;
  function tray(x,y,w=51,d=42){let b=S(x,y,w,d,0,5,4);b+=S(x+3,y+3,w-6,d-6,5,.6,2,'tint');b+=S(x,y,3,d,5,5,1)+S(x+w-3,y,3,d,5,5,1)+S(x+3,y+d-3,w-6,3,5,5,1);return b;}
  let features=tray(-86,-58);for(let row=0;row<3;row++)for(let col=0;col<3;col++)features+=S(-78+col*12,-50+row*10,8,7,5.6,2+row,1,row===2?'accent':'');
  features+=D([[-81,-55,5.8],[-72,-55,5.8],[-63,-55,5.8]],.7);
  let minimum=tray(-78,29);for(let row=0;row<2;row++)for(let col=0;col<3;col++){minimum+=S(-70+col*12,36+row*12,8,8,5.6,1.8,1,'tint');if(col===0||row===0)minimum+=S(-69+col*12,37+row*12,6,6,7.4,3,1,col===0?'accent':'');}
  let budget=tray(29,-66,50,44);for(let stack=0;stack<3;stack++)for(let n=0;n<stack+2;n++)budget+=S(37+stack*12,-57,8,18,5.6+n*2,1.8,1,stack===0?'accent':'');
  budget+=S(36,-33,36,5,5.6,.6,1);budget+=L(k.topTicks(38,70,4,4,-33,6.2,[2,3],P).minor,'lo');
  let evaluation=S(27,27,62,52,0,5,4);evaluation+=S(32,31,52,43,5,1,1);evaluation+=S(49,27,20,6,6,1.5,1,'accent');
  for(let row=0;row<4;row++){evaluation+=rule(37,41+row*7,23,6.2);evaluation+=S(67,38+row*7,10,4,6.2,.3,.5,row===2?'accent':'tint');}
  evaluation+=screws({x:27,y:27,w:62,d:52},5,4);
  base+=route('reserve',[[0,18],[-18,18],[-18,49],[-27,49]],.5,.1,.8);
  base+=route('allocate',[[0,-18],[0,-43],[29,-43]],.5,.1,.8);
  save(base+group('features',features)+group('budget',budget)+group('minimum',minimum)+group('evaluation',evaluation),'SAMBA sample-allocation carousel',['features','minimum','budget','evaluation']);
}

// Generative-model study: a photographic optical rail, with lenses and image/latent displays.
// Display art is deterministic schematic art, not an output from any generative model.
{
  const a=factory('generative-models','generation-apparatus',[[-175,-49,-16],[182,80,121]],{azimuth:61,elevation:25});
  const {P,S,C,L,D,poly,front,screws,group,route,save}=a;
  let base='';
  for(const x of [-144,9,159])for(const y of [-22,28])base+=S(x-8,y-7,16,14,-16,6,3,'dark');
  for(const y of [-22,28]){base+=S(-164,y-4,336,8,-10,10,2);base+=S(-159,y-2,326,4,0,2,1,'tint');}
  for(const x of [-170,166])base+=S(x,-31,8,71,-10,14,2);
  function slide(x,w){let b=S(x,-31,w,71,2,5,3);for(const [xx,yy]of [[x+6,-25],[x+w-6,-25],[x+6,34],[x+w-6,34]])b+=S(xx-3,yy-3,6,6,7,6,1);return b;}
  function screen(x,width,height){let b=slide(x,width);b+=S(x+6,-6,6,18,7,24,1)+S(x+width-12,-6,6,18,7,24,1);b+=S(x+2,-8,width-4,10,31,height,3);b+=front(x+6,2.1,36,width-12,height-10,'screen');return b;}
  let diffusion=screen(-159,66,67);
  let noiseTiles='';
  for(let row=0;row<7;row++)for(let col=0;col<7;col++){const z=42+row*6.5;const c=(row*29+col*17+row*col)%5;noiseTiles+=front(-149+col*6.5,2.25,z,4.7,4.7,c<2?'noise':c===2?'quiet-ink':'ink');}
  diffusion+=`<g data-motion="pulse">${noiseTiles}</g>`;
  diffusion+=S(-145,20,32,5,13,3,1,'accent');
  let vae=slide(-78,45);vae+=S(-66,-3,8,19,7,53,2);vae+=S(-78,-4,45,13,60,27,4);vae+=front(-73,9.15,64,35,18,'paper');
  // A pinhole and nested apertures make the bottleneck a physical, recognisable part.
  vae+=poly([[-68,9.3,66],[-41,9.3,66],[-49,9.3,80],[-60,9.3,80]],'quiet-ink');
  vae+=front(-57,9.4,69,5,8,'ink');vae+=S(-75,19,12,12,13,4,2,'accent');vae+=C(-69,25,4,17,4);vae+=L(k.knurl(-69,25,4,17,21,20,P));
  let latent=screen(-20,64,53);
  // Latent tiles are illustrative coordinates, deliberately not a scale or measured value.
  for(let row=0;row<4;row++)for(let col=0;col<5;col++)latent+=front(-9+col*8,2.25,41+row*8,5,5,(row+col)%3===0?'ink':'noise');
  latent+=S(-10,18,42,6,13,3,1,'tint');
  let conditioning=screen(82,83,76);
  conditioning+=front(93,2.25,43,60,52,'paper');
  conditioning+=poly([[93,2.4,43],[153,2.4,43],[153,2.4,59],[132,2.4,78],[115,2.4,58],[108,2.4,65]],'quiet-ink');
  conditioning+=poly([[93,2.5,43],[148,2.5,43],[126,2.5,70],[111,2.5,52],[103,2.5,60]],'ink');
  const sun=[];for(let i=0;i<30;i++){const t=i/30*Math.PI*2;sun.push([139+5*Math.cos(t),2.55,84+5*Math.sin(t)]);}conditioning+=poly(sun,'noise');
  // Conditioning card is a separate input at the side of the display, not benchmark data.
  conditioning+=S(105,23,45,23,13,3,2);conditioning+=S(109,26,37,16,16,.5,1,'tint');
  for(let i=0;i<3;i++)conditioning+=L(k.lineOnTop([113,30+i*4],[139-i*4,30+i*4],16.6,P),'lo');
  conditioning+=S(150,24,8,18,13,4,1,'accent');
  base+=route('diffusion',[[-95,18],[-79,18]],2.4,0,.3);
  base+=route('latent',[[44,18],[81,18]],2.4,.4,.9);
  save(base+group('diffusion',diffusion)+group('vae',vae)+group('latent',latent)+group('conditioning',conditioning),'Generative-model optical study rail',['vae','diffusion','latent','conditioning']);
}

// KHUDA: two standalone desktop objects. No link connects recommendation to text filtering.
{
  const a=factory('khuda','khuda-apparatus',[[-153,-60,-17],[161,90,113]],{azimuth:68,elevation:26});
  const {P,S,C,L,D,poly,front,screws,group,rule,save}=a;
  let shelf='';
  for(const [x,y]of [[-148,-47],[-56,-47],[-148,15],[-56,15]])shelf+=S(x,y,10,10,-15,15,2,'dark');
  shelf+=S(-152,-52,111,86,0,7,3);shelf+=S(-151,-51,109,6,7,96,2);shelf+=S(-152,-45,6,73,7,98,2)+S(-47,-45,6,73,7,98,2);
  for(const z of [7,49,94])shelf+=S(-146,-45,99,74,z,5,1);
  // Books have separate covers, a recessed page block, and spine seams.
  for(const z of [12,54])for(let i=0;i<5;i++){const x=-139+i*16;const h=27+(i%3)*4;shelf+=S(x,-34,9,45,z,h,1,i===2?'accent':'tint');shelf+=S(x+1,-32,7,40,z+.8,h-1.6,.5);shelf+=L(k.segment([x,11,z+6],[x+9,11,z+6],P),'lo');shelf+=L(k.segment([x,11,z+h-5],[x+9,11,z+h-5],P),'lo');}
  let recommendation='';
  recommendation+=S(-127,45,81,39,-3,4,4);recommendation+=S(-120,51,66,27,1,3,2,'tint');
  recommendation+=S(-119,51,30,27,4,2,1)+S(-86,51,30,27,4,2,1);
  recommendation+=S(-89,51,3,27,4,2,0,'accent');
  for(let r=0;r<4;r++){recommendation+=rule(-114,57+r*5,20,6.1);recommendation+=rule(-81,57+r*5,20,6.1);}
  recommendation+=S(-61,47,5,22,6.2,.5,.2,'accent');
  // Separate typewriter body and paper roller form the NLP task.
  let detection='';
  for(const [x,y]of [[35,-1],[135,-1],[35,75],[135,75]])detection+=S(x,y,10,10,-13,13,2,'dark');
  detection+=S(27,-7,126,98,0,8,9);detection+=S(35,1,110,39,8,21,5,'tint');
  detection+=S(41,-3,8,12,29,19,2)+S(130,-3,8,12,29,19,2);
  detection+=S(47,-1,85,8,42,6,3,'dark');
  detection+=S(33,39,114,43,8,9,5);
  for(let r=0;r<3;r++)for(let c=0;c<9;c++)detection+=S(39+c*11+(r%2)*3,43+r*11,7,7,17,2.8,2,r===1&&c===4?'accent':'');
  detection+=S(61,76,59,5,17,2.8,2,'accent');
  detection+=C(39,5,7,29,5)+C(141,5,7,29,5);detection+=L(k.knurl(39,5,7,29,34,24,P));detection+=L(k.knurl(141,5,7,29,34,24,P));
  let masking='';masking+=S(52,1.5,75,1.5,44,53,.6);masking+=front(54,3.05,46,71,49,'paper');
  for(let r=0;r<6;r++)masking+=poly([[59,3.2,86-r*6],[119-(r%3)*8,3.2,86-r*6],[119-(r%3)*8,3.2,87.4-r*6],[59,3.2,87.4-r*6]],'quiet-ink');
  masking+=`<g data-motion="pulse">${front(78,3.35,73,27,5.8,'mask')}${front(63,3.35,55,19,5.8,'mask')}</g>`;
  masking+=S(105,23,23,8,29,1.3,1,'accent');
  save(group('books',shelf)+group('recommendation',recommendation)+group('detection',detection)+group('masking',masking),'KHUDA recommendation bookshelf and separate text-masking typewriter',['books','recommendation','detection','masking']);
}
writeFileSync(resolve('tools/illustrations/data/learning-geometry.json'),JSON.stringify(reports,null,2));
console.log(JSON.stringify(reports));
