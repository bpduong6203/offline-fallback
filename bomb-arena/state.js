import {makeMap} from './map.js';
import {updateBombs,damage} from './bombs.js';
import {collect} from './items.js';
export function createGame(options={},random=Math.random) {
  const humans=options.humans||1,count=Math.min(4,humans+(options.bots??3));
  const starts=[[1,1],[13,11],[13,1],[1,11]],colors=['#8a74ff','#ff72a9','#ffca5c','#58ded0'];
  return {options,random,map:makeMap(random),players:starts.slice(0,count).map(([x,y],id)=>({id,x,y,color:colors[id],name:id<humans?`Người chơi ${id+1}`:`Bot ${id-humans+1}`,bot:id>=humans,alive:true,capacity:1,range:2,speed:3,shield:false,invincible:0,walk:0,think:0,target:null})),bombs:[],fire:[],items:[],particles:[],events:[],time:180,result:null};
}
export function step(s,dt) {
  if(s.result)return;
  s.time=Math.max(0,s.time-dt);updateBombs(s,dt);damage(s,dt);
  for(const p of s.players)if(p.alive)collect(s,p);
  s.particles=s.particles.filter(p=>(p.t-=dt)>0);
  const living=s.players.filter(p=>p.alive);
  if(living.length<=1) s.result=living.length?`${living[0].name} chiến thắng!`:'Hòa! Cùng nhau bùng nổ.';
  else if(s.time<=0)s.result='Hết giờ — hòa!';
}
