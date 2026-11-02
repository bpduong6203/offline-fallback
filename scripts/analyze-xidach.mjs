// Audit only: uses the real engine and crypto shuffle, advancing its clock locally.
// No network, production wallets or gameplay rules are changed.
import {XiDachEngine} from '../xi-dach/engine.js';
import {RULES} from '../xi-dach/rules.js';
const rounds=Number(process.argv[2]||100000);
if(!Number.isSafeInteger(rounds)||rounds<1)throw new Error('Provide a positive round count');
for(const [seats,standAt] of [[1,16],[1,17],[1,18],[1,19],[8,17]]){
  const engine=new XiDachEngine('AUDIT0'),ids=Array.from({length:seats},(_,i)=>engine.join({name:'Audit '+i,create:i===0}));
  const stats={rounds,seats,standAt,win:0,tie:0,loss:0,tieTotals:{},tieKinds:{},longestTieRun:0,tieWindows:{2:0,3:0,4:0},examples:[]};
  const streaks=ids.map(()=>0);let observed=0,roundWinSquares=0;
  for(let round=0;round<rounds;round++){
    engine.state.fund=RULES.initialFund;engine.state.history=[];
    for(const p of engine.state.players){p.balance=RULES.initialBalance;p.bet=0;}
    engine.betting(1);
    for(const id of ids)engine.action(id,{roomId:'AUDIT0',roundId:engine.state.roundId,actionId:'bet-'+round,type:'bet',amount:RULES.minBet},2);
    engine.start(3);
    let guard=100;
    while(engine.state.phase!=='ROUND_END'&&--guard){
      if(engine.state.phase==='PLAYER_TURNS'){
        const p=engine.player(engine.state.turnId);
        const total=engine.snapshot(p.id).players.find(player=>player.id===p.id).hand.total;
        engine.play(p,total>=standAt?'stand':'hit',engine.state.deadline-1);
      }else engine.tick(engine.state.deadline);
    }
    if(!guard)throw new Error('Round failed to end');
    const winsBefore=stats.win;
    for(let i=0;i<ids.length;i++){
      const result=engine.state.results.find(r=>r.id===ids[i]);observed++;
      stats[result.result===1?'win':result.result===0?'tie':'loss']++;
      streaks[i]=result.result===0?streaks[i]+1:0;
      stats.longestTieRun=Math.max(stats.longestTieRun,streaks[i]);
      if(result.result===0){
        const total=result.hand.total,kind=result.hand.name;
        stats.tieTotals[total]=(stats.tieTotals[total]||0)+1;stats.tieKinds[kind]=(stats.tieKinds[kind]||0)+1;
        for(const n of [2,3,4])if(streaks[i]>=n)stats.tieWindows[n]++;
        if(stats.examples.length<4)stats.examples.push({player:engine.player(ids[i]).cards,dealer:engine.state.dealer,total,kind});
      }
    }
    roundWinSquares+=((stats.win-winsBefore)/seats)**2;
  }
  stats.observations=observed;stats.winPct=100*stats.win/observed;stats.tiePct=100*stats.tie/observed;stats.lossPct=100*stats.loss/observed;
  stats.winAmongDecidedPct=100*stats.win/(stats.win+stats.loss);
  stats.meanNetPerBet=(stats.win-stats.loss)/observed;
  // Cluster by round: seats sharing the same dealer are not independent samples.
  const mean=stats.win/observed,variance=rounds>1?Math.max(0,(roundWinSquares-rounds*mean**2)/(rounds-1)):0;
  stats.win95MarginPct=1.96*Math.sqrt(variance/rounds)*100;
  stats.independentRounds=rounds;
  console.log(JSON.stringify(stats));
}
