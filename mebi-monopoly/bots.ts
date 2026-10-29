import {BOARD,TRIPLETS} from './tour-data';
export type Difficulty='random'|'heuristic'|'rollout';
// Only accepts the public snapshot. The bot cannot access the seed or future deck.
export function chooseBotAction(s:any,id:string,difficulty:Difficulty='heuristic',random= Math.random):{type:string;payload?:any}{
 const p=s.players.find((p:any)=>p.id===id),d=s.decisions||{};
 if(!p||p.out)return {type:'skip'};
 if(s.phase==='roll')return p.onIsland&&p.escape?{type:'escape'}:{type:'roll'};
 if(s.phase==='complete')return {type:'end'};
 if(s.phase==='debt'){
  if(p.cash>=s.debt.amount)return {type:'settle'};
  const owned=BOARD.filter(t=>s.properties[t.id].owner===id).sort((a,b)=>s.properties[a.id].investment-s.properties[b.id].investment);
  return owned.length?{type:'liquidate',payload:{tile:owned[0].id}}:{type:'bankrupt'};
 }
 const reserve=difficulty==='random'?0:Math.max(100,p.cash*.12);
 if(s.phase==='buy'){
  const choices=(d.purchaseLevels||[]).filter((level:number)=>d.purchaseCosts[level]<=p.cash-reserve);
  if(!choices.length)return {type:'skip'};
  const level=difficulty==='random'?choices[Math.floor(random()*choices.length)]:choices.at(-1);
  return {type:'buy',payload:{initialLevel:level}};
 }
 if(s.phase==='construct')return d.maxLevel>s.properties[p.pos].level&&d.upgradeCost<=p.cash-reserve?{type:'construct',payload:{level:d.maxLevel}}:{type:'skip'};
 if(s.phase==='takeover'){
  return d.takeoverAllowed&&d.takeoverCost<=p.cash-reserve?{type:'takeover'}:{type:'skip'};
 }
 if(s.phase==='destination'||s.phase==='festival'||s.phase==='event'){
  const targets=d.eligibleTargets||[];
  if(!targets.length)return {type:'skip'};
  let target=targets[0];
  if(difficulty==='random')target=targets[Math.floor(random()*targets.length)];
  else{
   const score=(i:number)=>{
    const t=BOARD[i],a=s.properties[i];let score=t.purchasePrice+(TRIPLETS.some(group=>group.includes(i)&&group.filter(j=>s.properties[j].owner===id).length===2)?2000:0);
    if(s.phase==='destination'){score+=!a.owner?1500:a.level<4&&p.laps>a.lastUpgradeLap?1000:-2000;score+=BOARD.filter(j=>j.side===t.side&&s.properties[j.id].owner===id).length*100;}
    if(s.phase==='festival')score=t.rentByLevel[a.level]||0;
    if(difficulty==='rollout')for(let trial=0;trial<12;trial++)for(const q of s.players.filter((q:any)=>q.id!==id&&!q.out)){const next=(q.pos+1+Math.floor(random()*6)+1+Math.floor(random()*6))%BOARD.length;if(next===i)score+=t.rentByLevel[Math.max(1,a.level)]||100;}
    return score;
   };
   target=targets.map((i:number)=>({i,score:score(i)})).sort((a:any,b:any)=>b.score-a.score||a.i-b.i)[0].i;
  }
  return {type:s.phase,payload:{tile:target}};
 }
 return {type:'skip'};
}
