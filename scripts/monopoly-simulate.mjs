import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {Engine,createState,snapshot,chooseBotAction,RULES,BOARD} from '../src/monopoly-service.generated.js';
const arg=(name,fallback)=>Number(process.argv[process.argv.indexOf(name)+1])||fallback;
const matches=arg('--matches',10000),seed=arg('--seed',1);
assert.ok(Number.isInteger(matches)&&matches>0&&matches<=100000);
const metrics={matches,seed,completed:0,budgetReached:0,winsBySeat:[0,0,0,0],winReasons:{},commands:0,turns:0,maxCommands:0,income:0,expense:0,islandVisits:0,cardFrequency:{},assets:BOARD.filter(t=>t.purchasePrice).map(t=>({id:t.id,name:t.name,invested:0,rent:0}))};
const began=Date.now();
for(let match=0;match<matches;match++){
 const e=new Engine(createState('SIMBOT',seed+match),undefined,1000);e.recordReplay=false;e.silent=true;
 for(let n=0;n<4;n++)e.join('Bot '+n);e.s.players.forEach(p=>{p.bot=true;p.ready=true;});
 const log=e.log.bind(e);e.log=(text,type,data)=>{log(text,type,data);if(type==='island')metrics.islandVisits++;if(type==='card')metrics.cardFrequency[data.card]=(metrics.cardFrequency[data.card]||0)+1;if(type==='purchase')metrics.assets.find(a=>a.id===data.tile).invested+=e.s.properties[data.tile].investment;if(type==='build'&&!data.initial)metrics.assets.find(a=>a.id===data.tile).invested+=BOARD[data.tile].constructionCosts[data.level];if(type==='payment'&&data.to){const a=metrics.assets.find(a=>a.id===e.player(data.from).pos);if(a&&e.s.properties[a.id].owner===data.to)a.rent+=data.amount;}};
 e.command(e.s.host,{type:'start',commandId:'start',roomId:e.s.code,expectedVersion:e.s.version});
 let n=0;for(;n<2000&&e.s.phase!=='ended';n++){
  const id=e.s.debt?.from||e.s.turn,action=chooseBotAction(snapshot(e.s),id,'heuristic',()=>.5);e.now+=1000;
  e.command(id,{...action,commandId:'sim:'+n,roomId:e.s.code,expectedVersion:e.s.version});e.tick(e.now);
  for(const p of e.s.players){assert.ok(Number.isSafeInteger(p.cash)&&p.cash>=0);assert.equal(p.cash,RULES.cash+p.income-p.expense);}
  for(const a of e.s.properties){assert.ok(Number.isInteger(a.level)&&a.level>=0&&a.level<=4);assert.ok(!a.owner||!e.player(a.owner).out);}
 }
 if(e.s.phase!=='ended'){metrics.budgetReached++;continue;}metrics.completed++;metrics.commands+=n;metrics.maxCommands=Math.max(metrics.maxCommands,n);metrics.turns+=e.s.turnCount;metrics.winsBySeat[e.player(e.s.winner).seat]++;metrics.winReasons[e.s.winReasonCode]=(metrics.winReasons[e.s.winReasonCode]||0)+1;
 for(const p of e.s.players){metrics.income+=p.income;metrics.expense+=p.expense;}
 if((match+1)%10000===0)console.log('Completed '+(match+1)+'/'+matches);
}
metrics.elapsedSeconds=(Date.now()-began)/1000;metrics.checkedCommands=metrics.commands+metrics.budgetReached*2000;metrics.metricScopes={commands_turns_income_expense:'completed matches only',assets_cards_island:'all checked matches'};metrics.assets.forEach(a=>a.rentROI=a.invested?a.rent/a.invested:0);
await mkdir(new URL('../dist/mebi-monopoly/',import.meta.url),{recursive:true});await writeFile(new URL('../dist/mebi-monopoly/simulation.json',import.meta.url),JSON.stringify(metrics,null,2));console.log(JSON.stringify({...metrics,assets:undefined,cardFrequency:undefined}));
