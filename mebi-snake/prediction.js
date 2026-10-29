import {integrate} from './math.js';
import {CONFIG as C} from './config.js';
export class Predictor{
 constructor(){this.state=null;this.pending=[];this.seq=0;this.correction=0;}
 reset(){this.state=null;this.pending=[];this.seq=0;}
 input(angle,boost){const m={type:'input',seq:++this.seq,angle,boost};this.pending.push(m);if(this.pending.length>120)this.pending.shift();return m;}
 advance(angle,boost,dt){if(this.state)integrate(this.state,angle,boost&&this.state.mass>C.minMass&&!this.state.protected,dt);}
 reconcile(p,rtt=0){const old=this.state;this.pending=this.pending.filter(m=>m.seq>p.ack);this.seq=Math.max(this.seq,p.ack);const next={...p};let budget=Math.min(.15,rtt/2000+1/C.hz);for(const m of this.pending){const dt=Math.min(1/C.hz,budget);integrate(next,m.angle,m.boost&&p.mass>C.minMass&&!p.protected,dt);budget-=dt;if(budget<=0)break;}this.correction=old?Math.hypot(old.x-next.x,old.y-next.y):0;this.state=next;return {dx:old?old.x-next.x:0,dy:old?old.y-next.y:0,snap:this.correction>100};}
}
