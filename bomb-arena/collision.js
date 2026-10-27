export function canStand(s,p,x,y) {
  const radius=.24;
  for(const xx of [x-radius,x+radius])for(const yy of [y-radius,y+radius]) {
    if(s.map[Math.round(yy)]?.[Math.round(xx)]!==0)return false;
  }
  return true;
}
export function move(s,p,dx,dy,dt) {
  if(!p.alive||(!dx&&!dy)||dt<=0)return;
  // One axis per input, with small swept steps even at maximum speed.
  dx=Math.sign(dx);dy=dx?0:Math.sign(dy);
  const distance=p.speed*dt,steps=Math.ceil(distance/.06),stride=distance/steps;
  let travelled=0;
  const advance=(x,y)=>{
    if(!canStand(s,p,x,y))return false;
    travelled+=Math.hypot(x-p.x,y-p.y);p.x=x;p.y=y;return true;
  };
  for(let i=0;i<steps;i++) {
    let remaining=stride;
    const cross=dx?p.y:p.x;
    // Look for a nearby open lane, including an early turn just before its center.
    const lanes=[Math.floor(cross),Math.ceil(cross)].filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>Math.abs(a-cross)-Math.abs(b-cross));
    const lane=lanes.find(v=>Math.abs(v-cross)<=.55&&canStand(s,p,dx?p.x+dx*.35:v,dx?v:p.y+dy*.35));
    if(lane!==undefined&&Math.abs(lane-cross)>1e-8) {
      const correction=Math.sign(lane-cross)*Math.min(remaining,Math.abs(lane-cross));
      if(!advance(dx?p.x:p.x+correction,dx?p.y+correction:p.y))break;
      remaining-=Math.abs(correction);
    }
    if(remaining>1e-8&&!advance(p.x+dx*remaining,p.y+dy*remaining))break;
  }
  if(travelled>0)p.walk+=travelled*4;
}
