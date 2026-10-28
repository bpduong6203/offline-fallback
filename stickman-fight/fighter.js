import {FLOOR,MOVES} from './config.js';
export function fighter(id){return {id,x:id?870:330,y:FLOOR,vx:0,vy:0,face:id?-1:1,hp:100,energy:100,cooldown:0,spent:0,state:'Idle',t:0,stun:0,hit:false,buffer:null,flash:0};}
export function attack(p,kind){
 const m=MOVES[kind];if(!m||p.y!==FLOOR||p.stun>0||p.hp<=0||p.state==='Block')return false;
 if(MOVES[p.state]){const a=MOVES[p.state];if(a.start+a.active+a.recovery-p.t<=.1)p.buffer=kind;return false;}
 if(kind==='Special'&&(p.energy<50||p.cooldown>0))return false;
 p.state=kind;p.t=0;p.hit=false;p.buffer=null;p.vx=0;
 if(kind==='Special'){p.energy-=50;p.cooldown=3;p.spent=1;}return true;
}
export function updateFighter(p,other,input,dt){
 p.cooldown=Math.max(0,p.cooldown-dt);p.spent=Math.max(0,p.spent-dt);p.flash=Math.max(0,p.flash-dt);
 if(!p.spent)p.energy=Math.min(100,p.energy+dt*(p.state==='Block'?3:8));
 p.t+=dt;
 if(p.hp<=0){p.state='Knockout';return;}
 if(p.stun>0){p.stun=Math.max(0,p.stun-dt);p.state='Hitstun';if(p.stun>0)return; p.state='Idle';}
 if(MOVES[p.state]){const m=MOVES[p.state];if(p.t<m.start+m.active+m.recovery){if(input.action)attack(p,input.action);return;}const next=p.buffer;p.state='Idle';p.buffer=null;if(next&&attack(p,next))return;}
 p.face=other.x>=p.x?1:-1;
 if(input.block&&p.y===FLOOR){p.state='Block';p.vx=0;return;}
 p.state='Idle';
 if(input.action&&attack(p,input.action))return;
 p.vx=((input.right?1:0)-(input.left?1:0))*270;
 if(input.jump&&p.y===FLOOR)p.vy=-880;
 p.state=p.y<FLOOR||p.vy<0?(p.vy<0?'Jump':'Fall'):p.vx?'Run':'Idle';
}
