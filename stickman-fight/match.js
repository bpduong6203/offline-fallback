import {fighter,updateFighter} from './fighter.js';
import {physics} from './physics.js';
import {combat} from './combat.js';
export function createMatch(options={}){return {options:{seconds:60,arena:'city',names:['Người chơi 1','Người chơi 2'],...options},players:[fighter(0),fighter(1)],wins:[0,0],round:1,time:options.seconds||60,phase:'countdown',phaseTime:3,paused:false,hitstop:0,clock:0,events:[],result:''};}
export function resetRound(s){s.players=[fighter(0),fighter(1)];s.time=s.options.seconds;s.phase='countdown';s.phaseTime=3;s.hitstop=0;s.round++;}
export function finishRound(s){const [a,b]=s.players;let win=a.hp===b.hp?-1:a.hp>b.hp?0:1;if(win>=0)s.wins[win]++;s.result=win<0?'HIỆP HÒA':s.options.names[win]+' thắng hiệp';s.phase=s.wins.some(n=>n>=2)?'result':'roundEnd';s.phaseTime=2.5;s.events.push({kind:'end'});}
export function step(s,inputs=[{},{}],dt=1/60){
 if(s.paused||s.phase==='result')return;s.events=[];
 if(s.hitstop>0){s.hitstop=Math.max(0,s.hitstop-dt);return;}
 s.clock+=dt;
 if(s.phase==='countdown'){s.phaseTime-=dt;if(s.phaseTime<=0)s.phase='fight';return;}
 if(s.phase==='roundEnd'){s.phaseTime-=dt;if(s.phaseTime<=0)resetRound(s);return;}
 for(let i=0;i<2;i++)updateFighter(s.players[i],s.players[1-i],inputs[i],dt);
 physics(s.players,dt);s.events=combat(s.players);if(s.events.length)s.hitstop=.05;
 s.time=Math.max(0,s.time-dt);if(s.players.some(p=>p.hp<=0)||s.time===0)finishRound(s);
}
