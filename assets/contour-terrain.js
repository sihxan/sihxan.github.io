/* A continuous illustrative terrain: coherent 2D relief + a gentle regional slope.
   The gradient path is extracted from the same field; no authored centerline. */
(function(global){
  'use strict';
  const PERIOD=3072;
  const OCTAVES=Object.freeze([[620,768,470,1,.32,.23],[350,512,125,2,1.17,.37],[190,256,30,3,.63,.18]]);
  const modulo=(v,p)=>((v%p)+p)%p;
  function create(width){
    width=Number(width);
    if(!Number.isFinite(width)||width<=0)throw new RangeError('Terrain width must be positive.');
    const desktop=width>=1180,mobile=width<=760;
    const offset=Math.max(1540,width)-width;
    const center=width-(desktop?160:mobile?31:82),sigma=1100;
    const features=[];
    const SEED=18;
    const directions=[[1,0],[-1,0],[0,1],[0,-1],[.7071067811865476,.7071067811865476],[-.7071067811865476,.7071067811865476],[.7071067811865476,-.7071067811865476],[-.7071067811865476,-.7071067811865476]];
    const cache=new Map();
    function corner(x,y,period,salt){
      y=modulo(y,period);
      const key=x+','+y+','+salt;
      if(cache.has(key))return cache.get(key);
      let h=Math.imul(x,374761393)^Math.imul(y,668265263)^Math.imul(salt+SEED,1442695041);
      h=Math.imul(h^(h>>>13),1274126177);h^=h>>>16;
      const result=directions[(h>>>0)%8];cache.set(key,result);return result;
    }
    function noise(x,y,period,salt){
      const ix=Math.floor(x),iy=Math.floor(y),fx=x-ix,fy=y-iy;
      const u=fx*fx*fx*(fx*(fx*6-15)+10),v=fy*fy*fy*(fy*(fy*6-15)+10);
      const du=30*fx*fx*(fx-1)*(fx-1),dv=30*fy*fy*(fy-1)*(fy-1);
      const g00=corner(ix,iy,period,salt),g10=corner(ix+1,iy,period,salt),g01=corner(ix,iy+1,period,salt),g11=corner(ix+1,iy+1,period,salt);
      const a=g00[0]*fx+g00[1]*fy,b=g10[0]*(fx-1)+g10[1]*fy,c=g01[0]*fx+g01[1]*(fy-1),d=g11[0]*(fx-1)+g11[1]*(fy-1);
      const w00=(1-u)*(1-v),w10=u*(1-v),w01=(1-u)*v,w11=u*v;
      return {value:a*w00+b*w10+c*w01+d*w11,
        x:g00[0]*w00+g10[0]*w10+g01[0]*w01+g11[0]*w11+du*((b-a)*(1-v)+(d-c)*v),
        y:g00[1]*w00+g10[1]*w10+g01[1]*w01+g11[1]*w11+dv*((c-a)*(1-u)+(d-b)*u)};
    }
    function evaluate(x,y,wantGradient){
      const xx=x+offset;
      // This very gentle watershed bias contributes less than the relief.
      const r=x-center;
      let value=-.75*y+.00035*r*r/2,gx=.00035*r,gy=-.75;
      for(const [sx,sy,amplitude,salt,phaseX,phaseY] of OCTAVES){
        const n=noise(xx/sx+phaseX,y/sy+phaseY,PERIOD/sy,salt);
        value+=amplitude*n.value;gx+=amplitude*n.x/sx;gy+=amplitude*n.y/sy;
      }
      return wantGradient?{x:gx,y:gy}:value;
    }
    const height=(x,y)=>evaluate(x,y,false),gradient=(x,y)=>evaluate(x,y,true);
    const slope=(x,y)=>{const g=gradient(x,y);if(g.y>=-.05)throw new Error('The active valley lost its downhill direction.');return g.x/g.y;};
    function rk4(x,y,dy){
      const a=slope(x,y),b=slope(x+a*dy*.5,y+dy*.5),c=slope(x+b*dy*.5,y+dy*.5),d=slope(x+c*dy,y+dy);
      return x+dy*(a+2*b+2*c+d)/6;
    }
    const step=2,segments=PERIOD/step;
    let x=center;
    for(let i=0;i<14*segments;i++)x=rk4(x,-14*PERIOD+i*step,step);
    const xs=new Float64Array(segments+1),slopes=new Float64Array(segments+1),arcs=new Float64Array(segments+1);
    xs[0]=x;
    for(let i=0;i<segments;i++)xs[i+1]=rk4(xs[i],i*step,step);
    const endpointError=xs[segments]-xs[0];
    if(Math.abs(endpointError)>1e-6)throw new Error('The downhill path has not reached its periodic attractor.');
    xs[segments]=xs[0];
    for(let i=0;i<=segments;i++)slopes[i]=slope(xs[i],i*step);
    slopes[segments]=slopes[0];
    function interpolated(index,t){
      const a=xs[index],b=xs[index+1],ma=slopes[index]*step,mb=slopes[index+1]*step,t2=t*t,t3=t2*t;
      const xx=(2*t3-3*t2+1)*a+(t3-2*t2+t)*ma+(-2*t3+3*t2)*b+(t3-t2)*mb;
      const derivative=((6*t2-6*t)*a+(3*t2-4*t+1)*ma+(-6*t2+6*t)*b+(3*t2-2*t)*mb)/step;
      return {x:xx,slope:derivative};
    }
    function partialArc(index,t){
      if(t<=0)return 0;
      const a=interpolated(index,0).slope,m=interpolated(index,t*.5).slope,b=interpolated(index,t).slope;
      return step*t*(Math.hypot(1,a)+4*Math.hypot(1,m)+Math.hypot(1,b))/6;
    }
    for(let i=0;i<segments;i++)arcs[i+1]=arcs[i]+partialArc(i,1);
    const length=arcs[segments];
    function sample(distance){
      distance=Number(distance)||0;
      const cycles=Math.floor(distance/length),local=modulo(distance,length);
      let lo=0,hi=segments;
      while(lo+1<hi){const mid=(lo+hi)>>1;if(arcs[mid]<=local)lo=mid;else hi=mid;}
      const target=local-arcs[lo],segmentLength=arcs[lo+1]-arcs[lo];
      let t=target/segmentLength;
      for(let i=0;i<3;i++){const s=interpolated(lo,t).slope;t=Math.max(0,Math.min(1,t-(partialArc(lo,t)-target)/(step*Math.hypot(1,s))));}
      const p=interpolated(lo,t),norm=Math.hypot(1,p.slope);
      return {x:p.x,y:cycles*PERIOD+(lo+t)*step,tx:p.slope/norm,ty:1/norm};
    }
    function atY(worldY){
      worldY=Number(worldY)||0;
      const cycles=Math.floor(worldY/PERIOD),local=modulo(worldY,PERIOD),index=Math.min(segments-1,Math.floor(local/step)),t=(local-index*step)/step;
      return cycles*length+arcs[index]+partialArc(index,t);
    }
    return Object.freeze({period:PERIOD,heightShift:-.75*PERIOD,height,gradient,
      corridor:Object.freeze({center,amplitude:140,sigma}),
      features:Object.freeze(features.map(f=>Object.freeze({...f}))),
      path:Object.freeze({length,sample,atY,endpointError}),
    });
  }
  global.ContourTerrain=Object.freeze({create});
})(typeof window==='undefined'?globalThis:window);
