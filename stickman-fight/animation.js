import {MOVES} from './config.js';
const idle=[-1.8,1.2,-.7,1.6,1.95,1.9,1.15,1.1];
export function pose(p,time){let target=[...idle],bob=Math.sin(time*2.6)*2,lean=0;
 if(p.state==='Run'){const a=Math.sin(time*15);target=[-1.5+a*.7,1.2,-1.5-a*.7,1.4,1.57+a*.65,1.5+a*.3,1.57-a*.65,1.5-a*.3];bob=Math.abs(a)*3;lean=.13;}
 if(p.state==='Jump'||p.state==='Fall')target=[-2.1,.2,-.8,-.4,2.3,.7,.7,2.3];
 if(p.state==='Block')target=[-1.05,-1.8,-.8,-1.7,1.9,1.15,1.3,1.7];
 if(p.state==='Hitstun'){target=[-2.6,-1.7,-.4,.6,1.8,1.2,1.1,1.9];lean=-.22;}
 const m=MOVES[p.state];if(m){const active=p.t>=m.start&&p.t<m.start+m.active,prep=p.t<m.start,amount=prep?Math.min(1,p.t/m.start):active?1:Math.max(0,1-(p.t-m.start-m.active)/m.recovery);
 if(p.state==='Kick'){target=prep?[-1.8,1,-.8,1.5,.1,1.8,2,1.4]:[-1.8,1,-.5,1.3,-.24,.06,1.7,1.5];lean=-.12*amount;}
 else{target=prep?[-2.6,1,-1.1,-1.9,1.9,1.1,1.3,1.7]:[-.12,-.02,-1.4,1.1,1.9,1.1,1.3,1.7];lean=.17*amount;}}
 if(p.state==='Knockout'){target=[.6,.3,2.5,2.8,1.1,.3,2,.5];lean=-1.35;}
 return {angles:target,bob,lean};
}
