import {FLOOR,W,HEAD_DROP_CHANCE} from './config.js';
export function disarm(s,h,random=Math.random){
 if(!s||!h.head||h.blocked||h.q.weapon==='none'||!h.q.weapon||random()>=HEAD_DROP_CHANCE)return;
 const p=h.q;h.dropped=p.weapon;s.drops.push({id:++s.nextEntity,weapon:p.weapon,x:p.x,y:p.y-90,vx:h.dir*140,vy:-220,life:12,lock:.8});p.weapon='none';p.pickupLock=.8;
 s.drops=s.drops.slice(-8);
}
export function updateWeapons(s,inputs,dt){
 for(const d of s.drops){d.life-=dt;d.lock=Math.max(0,d.lock-dt);d.vy+=1100*dt;d.x=Math.max(35,Math.min(W-35,d.x+d.vx*dt));d.y=Math.min(FLOOR-5,d.y+d.vy*dt);if(d.y===FLOOR-5){d.vx*=Math.exp(-10*dt);d.vy=0;}}
 s.drops=s.drops.filter(d=>d.life>0);
 for(const p of s.players){if(!inputs[p.id]?.pickup||p.pickupLock>0||p.weapon!=='none'||p.y!==FLOOR||!['Idle','Run','Crouch'].includes(p.state))continue;
 const item=s.drops.filter(d=>d.lock===0&&Math.abs(d.x-p.x)<65&&d.y>FLOOR-45).sort((a,b)=>Math.abs(a.x-p.x)-Math.abs(b.x-p.x))[0];if(item){p.weapon=item.weapon;s.drops=s.drops.filter(d=>d!==item);s.events.push({kind:'pickup',q:{x:p.x,y:p.y},dir:p.face,weapon:item.weapon});}}
}
