import {FLOOR,W} from './config.js';
export function hurtbox(p){return {x:p.x-25,y:p.y-134,w:50,h:134};}
export function overlap(a,b){return a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;}
export function physics(players,dt){
 for(const p of players){p.x+=p.vx*dt;p.vy+=1750*dt;p.y=Math.min(FLOOR,p.y+p.vy*dt);if(p.y===FLOOR)p.vy=0;p.x=Math.max(35,Math.min(W-35,p.x));if(p.stun>0)p.vx*=Math.exp(-7*dt);}
 const [a,b]=players;if(Math.abs(a.y-b.y)>=135)return;
 const d=b.x-a.x,penetration=54-Math.abs(d);if(penetration<=0)return;
 const sign=d>=0?1:-1;let left=sign===1?a:b,right=sign===1?b:a;
 left.x-=penetration/2;right.x+=penetration/2;
 if(left.x<35){right.x+=35-left.x;left.x=35;}if(right.x>W-35){left.x-=right.x-(W-35);right.x=W-35;}
}
