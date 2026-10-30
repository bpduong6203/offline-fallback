import {CONFIG as C} from './config.js';
import {angleDelta,integrate,distance} from './math.js';
// Keep distant snakes buffered, but show nearby heads close to the current
// authority time instead of 80–180 ms behind the locally predicted player.
export function remotePose(snapshots,s,now,rtt=0,local=null){
 if(!snapshots.length||!s.path.length)return null;
 const latest=snapshots.at(-1),interval=snapshots.length>1?(latest.arrival-snapshots[0].arrival)/(snapshots.length-1):67,target=now-Math.max(80,Math.min(180,interval*1.5));
 let a=snapshots[0],b=latest;
 for(let i=1;i<snapshots.length;i++)if(snapshots[i].arrival>=target){a=snapshots[i-1];b=snapshots[i];break;}
 const ap=a.snakes.find(p=>p.id===s.id),bp=b.snakes.find(p=>p.id===s.id)||s;let head={...bp};
 if(target>=latest.arrival){head={...s};integrate(head,head.angle,head.boost,Math.min(.1,Math.max(0,(target-latest.arrival)/1000)));}
 else if(ap&&a!==b){const t=Math.max(0,Math.min(1,(target-a.arrival)/(b.arrival-a.arrival)));head.x=ap.x+(bp.x-ap.x)*t;head.y=ap.y+(bp.y-ap.y)*t;head.angle=ap.angle+angleDelta(ap.angle,bp.angle)*t;}
 const blend=local?Math.max(0,Math.min(1,(500-distance(local,s))/300)):0;
 if(blend){const current={...s},age=Math.max(0,now-latest.arrival)+Math.max(0,rtt)/2;integrate(current,current.angle,current.boost,Math.min(C.nearHeadExtrapMs,age)/1000);head.x+=(current.x-head.x)*blend;head.y+=(current.y-head.y)*blend;head.angle+=angleDelta(head.angle,current.angle)*blend;}
 const source=blend?s:bp,path=source.path.map(([x,y])=>({x,y}));const ahead=(head.x-source.x)*Math.cos(source.angle)+(head.y-source.y)*Math.sin(source.angle)>=0;
 const skip=ahead?0:Math.floor(distance(source,head)/C.bodySpacing);
 return {head,path:[{x:head.x,y:head.y},...path.slice(Math.min(skip+1,path.length-1))]};
}
