export const itemIcons = {bomb:'●',range:'✦',speed:'»',shield:'◆'};
export function dropItem(random=Math.random) {
  if(random()>=.38)return null;
  // Speed is half of all drops (19% per crate), twice its previous rate.
  const roll=random();
  return roll<.5?'speed':roll<.7?'bomb':roll<.9?'range':'shield';
}
export function collect(s,p) {
  const i=s.items.findIndex(i=>Math.abs(i.x-p.x)<.4 && Math.abs(i.y-p.y)<.4);
  if (i<0) return;
  const [item]=s.items.splice(i,1);
  if(item.type==='bomb') p.capacity=Math.min(6,p.capacity+1);
  if(item.type==='range') p.range=Math.min(8,p.range+1);
  if(item.type==='speed') p.speed=Math.min(6.6,p.speed+.4);
  if(item.type==='shield') p.shield=true;
  s.events.push('pickup');
  s.particles.push({x:p.x,y:p.y,t:.7,color:'#ffb36b'});
}
