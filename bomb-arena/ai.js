import {blast,cell,dirs,key} from './map.js';
import {move} from './collision.js';
import {place} from './bombs.js';
export function danger(s,bombs=s.bombs) {
  const times=bombs.map(b=>b.t),areas=bombs.map(b=>blast(s.map,b));
  let changed=true;
  while(changed) {
    changed=false;
    areas.forEach((area,i)=>bombs.forEach((b,j)=>{
      if(times[j]>times[i]&&area.some(([x,y])=>x===b.x&&y===b.y)){times[j]=times[i];changed=true;}
    }));
  }
  const zones=new Map();
  const add=(x,y,a,b)=>{const k=key(x,y);if(!zones.has(k))zones.set(k,[]);zones.get(k).push([a,b]);};
  areas.forEach((area,i)=>area.forEach(([x,y])=>add(x,y,times[i],times[i]+.75)));
  s.fire.forEach(f=>add(f.x,f.y,0,f.t));
  return zones;
}
const unsafe=(zones,x,y,a,b)=> (zones.get(key(x,y))||[]).some(([start,end])=>a<end&&b>start-.18);
// Breadth-first search over both tiles and arrival times; waiting is an allowed action.
export function route(s,p,zones,goal,bombs=s.bombs,maxTime=4) {
  const [sx,sy]=cell(p),duration=1/p.speed;
  const queue=[{x:sx,y:sy,t:0,path:[]}],seen=new Set();
  for(let i=0;i<queue.length&&i<4000;i++) {
    const n=queue[i];
    if(n.path.length&&goal(n)&&!unsafe(zones,n.x,n.y,n.t,n.t+.85))return n.path;
    for(const [dx,dy] of [...dirs,[0,0]]) {
      const x=n.x+dx,y=n.y+dy,t=n.t+duration;
      if(t>maxTime||s.map[y]?.[x]!==0)continue;
      if(unsafe(zones,x,y,n.t,t+.12)||unsafe(zones,n.x,n.y,n.t,t-.05))continue;
      const k=`${x},${y},${Math.round(t/duration)}`;if(seen.has(k))continue;seen.add(k);
      queue.push({x,y,t,path:[...n.path,[x,y]]});
    }
  }
  return null;
}
export function updateBots(s,dt) {
  const difficulty=s.options.difficulty||'normal';
  const reaction={easy:.42,normal:.18,hard:.08}[difficulty];
  for(const p of s.players)if(p.bot&&p.alive) {
    p.think-=dt;
    if(p.target) {
      const [x,y]=p.target,dx=x-p.x,dy=y-p.y;
      if(Math.abs(dx)<.045&&Math.abs(dy)<.045){p.x=x;p.y=y;p.target=null;}
      else move(s,p,Math.abs(dx)>.045?Math.sign(dx):0,Math.abs(dx)>.045?0:Math.sign(dy),Math.min(dt,Math.max(Math.abs(dx),Math.abs(dy))/p.speed));
    }
    if(p.think>0||p.target)continue;p.think=reaction;
    const zones=danger(s),[x,y]=cell(p);
    const threat=unsafe(zones,x,y,0,2.9);
    let path;
    if(threat) path=route(s,p,zones,n=>!unsafe(zones,n.x,n.y,n.t,4));
    else {
      const adjacent=dirs.some(([dx,dy])=>s.map[y+dy]?.[x+dx]===2)||s.players.some(q=>q.alive&&q!==p&&Math.abs(q.x-x)+Math.abs(q.y-y)<3);
      if(adjacent&&s.random()<({easy:.25,normal:.6,hard:.95}[difficulty])) {
        const extra={x,y,range:p.range,t:2.5};const bombs=[...s.bombs,extra],future=danger(s,bombs);
        const escape=route(s,p,future,n=>!unsafe(future,n.x,n.y,n.t,3.3),bombs,2.15);
        if(escape&&place(s,p)){path=escape;}
      }
      if(!path) {
        path=route(s,p,zones,n=>s.items.some(i=>i.x===n.x&&i.y===n.y));
        if(!path)path=route(s,p,zones,n=>dirs.some(([dx,dy])=>s.map[n.y+dy]?.[n.x+dx]===2)||s.players.some(q=>q.alive&&q!==p&&Math.abs(q.x-n.x)+Math.abs(q.y-n.y)<2));
      }
    }
    if(path?.length)p.target=path[0];
  }
}
