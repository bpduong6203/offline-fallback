import {MOVES,W} from './config.js';
import {hurtbox,overlap} from './physics.js';
import {hit,applyHits} from './combat.js';
export function fire(s){
 for(const p of s.players){if(p.state!=='Special')continue;while(p.shots<3&&p.t+1e-8>=MOVES.Special.start+p.shots*.14){
  s.bullets.push({id:++s.nextEntity,owner:p.id,x:p.x+p.face*40,y:p.y-122,dir:p.face,life:1.5});p.shots++;p.muzzle=.07;
  s.events.push({kind:'shot',x:p.x+p.face*58,y:p.y-122,q:{x:p.x,y:p.y},dir:p.face});}}
}
export function projectileHits(s,dt){
 const hits=[],remove=new Set();
 for(const b of s.bullets){const old=b.x;b.x+=b.dir*900*dt;b.life-=dt;const box={x:Math.min(old,b.x)-3,y:b.y-3,w:Math.abs(b.x-old)+6,h:6},q=s.players[1-b.owner];
  if(q.hp>0&&overlap(box,hurtbox(q))){const source={...s.players[b.owner],x:old,face:b.dir};hits.push(hit(source,q,MOVES.Special,'Bullet',box,b.dir));remove.add(b.id);}
  if(b.life<=0||b.x<-20||b.x>W+20)remove.add(b.id);
 }
 s.bullets=s.bullets.filter(b=>!remove.has(b.id));return hits;
}
export function projectiles(s,dt,random=Math.random){return applyHits(projectileHits(s,dt),s,random);}
