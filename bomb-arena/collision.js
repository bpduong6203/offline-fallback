import {key} from './map.js';
export function canStand(s,p,x,y) {
  const r=.28;
  for (const xx of [x-r,x+r]) for (const yy of [y-r,y+r]) {
    const cx=Math.round(xx),cy=Math.round(yy);
    if (s.map[cy]?.[cx]!==0) return false;
    if (s.bombs.some(b=>b.x===cx && b.y===cy && !b.pass.has(p.id))) return false;
  }
  return true;
}
export function move(s,p,dx,dy,dt) {
  if (!p.alive || (!dx&&!dy)) return;
  // Align the perpendicular axis near a junction before entering the corridor.
  const n=p.speed*dt;
  if (dx && Math.abs(p.y-Math.round(p.y))<.24) p.y += Math.sign(Math.round(p.y)-p.y)*Math.min(n,Math.abs(Math.round(p.y)-p.y));
  if (dy && Math.abs(p.x-Math.round(p.x))<.24) p.x += Math.sign(Math.round(p.x)-p.x)*Math.min(n,Math.abs(Math.round(p.x)-p.x));
  const x=p.x+dx*n,y=p.y+dy*n;
  if (canStand(s,p,x,y)) { p.x=x;p.y=y;p.walk+=dt*12; }
  for (const b of s.bombs) if (Math.abs(p.x-b.x)>.79 || Math.abs(p.y-b.y)>.79) b.pass.delete(p.id);
}
