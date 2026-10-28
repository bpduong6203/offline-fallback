import {MOVES} from './config.js';
import {hurtbox,overlap} from './physics.js';
export function hitbox(p){const m=MOVES[p.state];if(!m||p.hit||p.t<m.start||p.t>=m.start+m.active)return null;return {x:p.face>0?p.x+15:p.x-15-m.range,y:p.y-114,w:m.range,h:70};}
export function combat(players){
 const hits=[];
 for(const p of players){const q=players[1-p.id],box=hitbox(p);if(box&&overlap(box,hurtbox(q))){const m=MOVES[p.state],front=q.face*(p.x-q.x)>0,guard=q.state==='Block'&&front,blocked=guard&&q.energy>=m.cost;hits.push({p,q,m,kind:p.state,blocked,broken:guard&&!blocked,dir:p.face});}}
 for(const h of hits){const {p,q,m,blocked,broken,dir}=h;p.hit=true;q.hp=Math.max(0,q.hp-(blocked?Math.round(m.damage*.2):m.damage));if(blocked||broken){q.energy=blocked?q.energy-m.cost:0;q.spent=1;}
 q.flash=.12;q.vx=dir*m.push*(blocked?.3:1);q.buffer=null;
 if(!blocked){q.stun=broken?.6:.22+(h.kind==='Special'?.15:0);q.state=q.hp?'Hitstun':'Knockout';q.t=0;}
 }
 return hits;
}
