import {CONFIG as C} from './config.js';
import {angleDelta,distance,radiusFor,sweptDistance} from './math.js';
// Only present world geometry is used: no future inputs or collision exemptions.
export function steerBot(arena,bot){
 const p=bot.snake,r=radiusFor(p.mass),speed=C.speed,heads=arena.actors().filter(s=>s.id!==bot.id&&s.snake?.alive);
 let target=null,bestFood=Infinity;
 for(const f of arena.foodGrid.query(p,p,650)){const d=distance(p,f);if(d<bestFood){bestFood=d;target=f;}}
 if(!target){const humans=[...arena.sessions.values()].filter(s=>s.snake?.alive);const human=humans.sort((a,b)=>distance(p,a.snake)-distance(p,b.snake))[0];if(human){const a=arena.now/4500+bot.slot*1.7;target={x:human.snake.x+Math.cos(a)*420,y:human.snake.y+Math.sin(a)*420};}else target={x:0,y:0};}
 const desired=Math.atan2(target.y-p.y,target.x-p.x);let choice=p.angle,score=-Infinity,clearance=0;
 for(const offset of [-1.2,-.65,0,.65,1.2]){const angle=p.angle+offset,tip={x:p.x+Math.cos(angle)*speed*1.5,y:p.y+Math.sin(angle)*speed*1.5};let value=-Math.abs(angleDelta(angle,desired))*1.5-Math.abs(offset)*.12,clear=1;
  const edge=C.radius-Math.hypot(tip.x,tip.y);if(edge<160){value-=20+(160-edge)/10;clear=0;}
  for(const b of arena.bodyGrid.query(p,tip,65)){if(b.id===bot.id)continue;const d=sweptDistance(p,tip,b.a,b.b)-r-b.r;if(d<60){value-=10+(60-d)/6;clear=0;}}
  for(const s of heads){const q=s.snake;const d=sweptDistance(p,tip,q,{x:q.x+Math.cos(q.angle)*speed*.65,y:q.y+Math.sin(q.angle)*speed*.65});if(d<90){value-=12+(90-d)/8;clear=0;}}
  if(value>score){score=value;choice=angle;clearance=clear;}
 }
 return {angle:Math.atan2(Math.sin(choice),Math.cos(choice)),boost:!!(clearance&&bestFood>200&&bestFood<500&&p.mass>C.startMass+30&&Math.abs(angleDelta(p.angle,choice))<.3)};
}
