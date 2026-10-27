export const itemIcons = {bomb:'●',range:'✦',speed:'»',shield:'◆'};
export function collect(s,p) {
  const i=s.items.findIndex(i=>Math.abs(i.x-p.x)<.4 && Math.abs(i.y-p.y)<.4);
  if (i<0) return;
  const [item]=s.items.splice(i,1);
  if(item.type==='bomb') p.capacity=Math.min(6,p.capacity+1);
  if(item.type==='range') p.range=Math.min(8,p.range+1);
  if(item.type==='speed') p.speed=Math.min(5,p.speed+.4);
  if(item.type==='shield') p.shield=true;
  s.events.push('pickup');
  s.particles.push({x:p.x,y:p.y,t:.7,color:'#b8ff79'});
}
