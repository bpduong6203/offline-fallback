import {MOVES,moveFor} from './config.js';
import {hurtbox,headbox,overlap} from './physics.js';
import {disarm} from './weapons.js';
export function hitbox(p){const m=moveFor(p);if(!m||p.state==='Special'||p.hit||p.t<m.start||p.t>=m.start+m.active)return null;return {x:p.face>0?p.x+15:p.x-15-m.range,y:p.y-(p.state==='Punch'?132:92),w:m.range,h:p.state==='Punch'?36:70};}
export function hit(p,q,m,kind,box,dir=p.face){const front=q.face*(p.x-q.x)>0,guard=q.state==='Block'&&front,blocked=guard&&q.energy>=m.cost;return {p,q,m,kind,blocked,broken:guard&&!blocked,dir,head:overlap(box,headbox(q)),x:q.x-dir*18,y:overlap(box,headbox(q))?headbox(q).y+18:q.y-70};}
export function applyHits(hits,s=null,random=Math.random){
 const guardEnergy=new Map();
 for(const h of hits){if(!h.blocked&&!h.broken)continue;const energy=guardEnergy.has(h.q.id)?guardEnergy.get(h.q.id):h.q.energy;h.blocked=energy>=h.m.cost;h.broken=!h.blocked;guardEnergy.set(h.q.id,h.blocked?energy-h.m.cost:0);}
 for(const h of hits){const {p,q,m,blocked,broken,dir}=h;if(h.kind!=='Bullet')p.hit=true;q.hp=Math.max(0,q.hp-(blocked?Math.round(m.damage*.2):m.damage));if(blocked||broken){q.energy=blocked?q.energy-m.cost:0;q.spent=1;}
 q.flash=.12;q.vx=dir*m.push*(blocked?.3:1);q.buffer=null;
 if(!blocked){q.stun=Math.max(q.stun,broken?.6:h.kind==='Bullet'?.12:.22);q.state=q.hp?'Hitstun':'Knockout';q.t=0;if(h.head)q.headFlash=.3;disarm(s,h,random);}
 }
 return hits;
}
export function meleeHits(players){const hits=[];for(const p of players){const q=players[1-p.id],box=hitbox(p);if(box&&overlap(box,hurtbox(q)))hits.push(hit(p,q,moveFor(p),p.state,box));}return hits;}
export function combat(players,s=null,random=Math.random){return applyHits(meleeHits(players),s,random);}
