import {blast,cell,key} from './map.js';
import {dropItem} from './items.js';
export function place(s,p) {
  const [x,y]=cell(p);
  if (!p.alive || s.bombs.filter(b=>b.owner===p.id).length>=p.capacity || s.bombs.some(b=>b.x===x&&b.y===y) || s.map[y][x]!==0) return false;
  s.bombs.push({x,y,owner:p.id,range:p.range,t:2.5,pass:new Set(s.players.filter(q=>q.alive&&Math.abs(q.x-x)<.74&&Math.abs(q.y-y)<.74).map(q=>q.id))});
  s.events.push('place');return true;
}
export function updateBombs(s,dt) {
  s.fire=s.fire.filter(f=>(f.t-=dt)>0);
  for(const b of s.bombs) b.t-=dt;
  const queue=s.bombs.filter(b=>b.t<=0), exploded=new Set(), destroyed=new Set();
  // Snapshot obstacles for this tick so simultaneous blasts cannot cross a just destroyed crate.
  while(queue.length) {
    const b=queue.shift();if(exploded.has(b))continue;exploded.add(b);
    for(const [x,y] of blast(s.map,b)) {
      s.fire.push({x,y,t:.65,fresh:true});
      if(s.map[y][x]===2) destroyed.add(key(x,y));
      else s.items=s.items.filter(i=>i.x!==x||i.y!==y);
      for(const other of s.bombs) if(other.x===x&&other.y===y&&!exploded.has(other)) queue.push(other);
    }
    s.events.push('explode');
  }
  s.bombs=s.bombs.filter(b=>!exploded.has(b));
  for(const k of destroyed) {
    const [x,y]=k.split(',').map(Number);s.map[y][x]=0;
    s.particles.push({x,y,t:.5,color:'#ffbc72'});
    const type=dropItem(s.random);if(type)s.items.push({x,y,type});
  }
}
export function damage(s,dt) {
  for(const p of s.players) {
    p.invincible=Math.max(0,p.invincible-dt);
    if(!p.alive||p.invincible>0)continue;
    if(s.fire.some(f=>f.fresh&&Math.abs(p.x-f.x)<.72&&Math.abs(p.y-f.y)<.72)) {
      if(p.shield) {p.shield=false;p.invincible=1.2;s.events.push('shield');}
      else {p.alive=false;s.events.push('death');s.particles.push({x:p.x,y:p.y,t:1,color:p.color});}
    }
  }
  // The remaining fire is visual only; every player is evaluated before consuming the hit.
  for(const f of s.fire)f.fresh=false;
}
