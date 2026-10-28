import {DT} from './config.js';
export function loop(update,draw){let last=0,acc=0;function frame(now){const elapsed=last?Math.min(.1,(now-last)/1000):0;last=now;acc+=elapsed;let steps=0;while(acc>=DT&&steps++<6){update(DT);acc-=DT;}if(steps>=6)acc=0;draw(elapsed?1/elapsed:60);requestAnimationFrame(frame);}requestAnimationFrame(frame);}
