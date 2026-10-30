import {BOARD,COLORS,RULES,SCHEMA_VERSION,RULESET,MAP_VERSION,CARDS,TRIPLETS,SIDES,TOURISTS,tileByKey,validateMap} from './tour-data';
import {formatMoney} from './currency';
import {chooseBotAction,Difficulty} from './bots';
export type Phase='lobby'|'legacy'|'roll'|'buy'|'construct'|'takeover'|'destination'|'festival'|'event'|'debt'|'complete'|'ended';
export type MoveMode='DICE'|'TELEPORT'|'CARD_MOVE'|'GO_TO_START'|'FLIGHT';
export type Player={id:string;token:string;name:string;seat:number;color:string;character:number;ready:boolean;connected:boolean;offline:number;cash:number;pos:number;island:number;onIsland:boolean;islandFailedTurns:number;laps:number;travelPending:boolean;escape:number;out:boolean;forfeited:boolean;bot:boolean;difficulty:Difficulty;income:number;expense:number;rank:number};
export type Property={owner:string|null;level:number;investment:number;resaleBasis?:number;lastUpgradeLap:number;shieldCharges:number;disabledUntilStartPasses:number;festival:number;festivalUntil:number;championshipBps:number;championshipUntil:number};
export type Debt={id:string;from:string;to:string|null;amount:number;paid:boolean;sourceEventId:string};
export type Command={commandId:string;roomId:string;expectedVersion:number;type:string;payload?:any};
export type History={kind:'command'|'tick'|'disconnect'|'resume';at:number;id?:string;command?:Command};
export type State={schemaVersion:number;ruleset:string;mapVersion:string;matchId:string;code:string;version:number;players:Player[];host:string;capacity:number;phase:Phase;turn:string;turnOrder:string[];deadline:number;doubles:number;extra:boolean;dice:number[];properties:Property[];deck:number[];log:{seq:number;text:string;type:string;data:any}[];seq:number;effectSeq:number;started:number;ended:number;matchDeadline:number;turnCount:number;winner:string|null;winReason:string;winReasonCode:string;debt:Debt|null;payments:Debt[];afterPayments:{id:string;kind:string}|null;paidDebtIds:string[];context:{tile:number;rent:number;owner:string|null;sourceLevel?:number;takeoverUpgrade?:boolean}|null;festivalChannel?:'festival'|'championship';eventChoice:{kind:'downgrade'|'shield'|'disable'|'earthquake';value:number}|null;seen:Record<string,string[]>;closed:boolean;allOffline:number;rngState:number;randomTape:number[];history:History[];replayBase?:any;legacySnapshot?:any;migrationNotice?:string};
const check=(ok:any,message='Thao tác không hợp lệ')=>{if(!ok)throw Error(message);};
const integer=(n:any,min=0,max=Number.MAX_SAFE_INTEGER)=>Number.isSafeInteger(n)&&n>=min&&n<=max;
export const random=()=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296;};
export function shuffle<T>(items:T[],rng=random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const emptyProperty=():Property=>({owner:null,level:0,investment:0,lastUpgradeLap:-1,shieldCharges:0,disabledUntilStartPasses:0,festival:1,festivalUntil:0,championshipBps:10000,championshipUntil:0});
export function createState(code:string,seed=Math.floor(random()*4294967296)):State{
 return {schemaVersion:SCHEMA_VERSION,ruleset:RULESET,mapVersion:MAP_VERSION,matchId:crypto.randomUUID(),code,version:0,players:[],host:'',capacity:4,phase:'lobby',turn:'',turnOrder:[],deadline:0,doubles:0,extra:false,dice:[],properties:BOARD.map(emptyProperty),deck:[],log:[],seq:0,effectSeq:0,started:0,ended:0,matchDeadline:0,turnCount:0,winner:null,winReason:'',winReasonCode:'',debt:null,payments:[],afterPayments:null,paidDebtIds:[],context:null,eventChoice:null,seen:{},closed:false,allOffline:0,rngState:seed>>>0,randomTape:[],history:[]};
}
export function upgradeState(old:any):State{
 if(old.schemaVersion===SCHEMA_VERSION&&old.ruleset===RULESET)return old;
 const s=createState(old.code||'');s.version=(old.version||0)+1;s.capacity=old.capacity||4;s.host=old.host||'';
 s.players=(old.players||[]).map((p:any)=>({...p,cash:RULES.cash,pos:0,island:0,onIsland:false,islandFailedTurns:0,laps:0,travelPending:false,escape:0,out:false,forfeited:false,bot:!!p.bot,difficulty:p.difficulty||'heuristic',income:0,expense:0,rank:0,ready:!!p.bot}));
 s.closed=!!old.closed;s.allOffline=old.allOffline||0;s.legacySnapshot=structuredClone(old);s.phase=['lobby','ended'].includes(old.phase)?'lobby':'legacy';
 s.migrationNotice=s.phase==='legacy'?'Luật Mebi đã được cập nhật. Bản lưu cũ được giữ riêng; chủ phòng cần mở sảnh luật mới.':'Đã cập nhật luật Mebi mới. Vui lòng sẵn sàng lại.';return s;
}
export function snapshot(s:State){
 const {deck,seen,legacySnapshot,rngState,randomTape,history,replayBase,...publicState}=s;
 const e=new Engine(s),p=s.players.find(p=>p.id===(s.debt?.from||s.turn));
 const decisions=p?e.decisions(p):{};
 return {...publicState,players:s.players.map(({token,...p})=>p),decisions,replayAvailable:s.phase==='ended'&&!!replayBase};
}
export class Engine{
 recordReplay=true;silent=false;
 constructor(public s:State,public rng:(()=>number)|undefined=undefined,public now=Date.now()){}
 get active(){return this.s.players.filter(p=>!p.out).sort((a,b)=>a.seat-b.seat);}
 player(id:string){const p=this.s.players.find(p=>p.id===id);check(p,'Người chơi không tồn tại');return p!;}
 tile(i:number){check(integer(i,0,BOARD.length-1),'Ô không hợp lệ');return BOARD[i];}
 draw(){let value:number;if(this.rng)value=this.rng();else{let t=this.s.rngState+=0x6D2B79F5;t=Math.imul(t^t>>>15,t|1);t^=t+Math.imul(t^t>>>7,t|61);value=((t^t>>>14)>>>0)/4294967296;this.s.rngState>>>=0;}check(value>=0&&value<1,'RNG không hợp lệ');return value;}
 phase(phase:Phase,ms=RULES.choiceMs){this.s.phase=phase;this.s.deadline=this.now+ms;}
 log(text:string,type='info',data:any={}){this.s.seq++;if(!this.silent){this.s.log.push({seq:this.s.seq,text,type,data});if(this.s.log.length>100)this.s.log.shift();}}
 remember(item:History){if(this.recordReplay&&this.s.replayBase)this.s.history.push(item);}
 join(name:string,token?:string){
  check(!this.s.closed,'Phòng đã đóng');
  if(token){const p=this.s.players.find(p=>p.token===token&&!p.bot);check(p,'Phiên không hợp lệ');p!.connected=true;p!.offline=0;this.s.allOffline=0;if(!this.s.players.find(p=>p.id===this.s.host)?.connected&&this.s.phase==='ended')this.s.host=p!.id;this.s.version++;this.remember({kind:'resume',id:p!.id,at:this.now});return p!;}
  check(this.s.phase==='lobby','Trận đã bắt đầu');check(this.s.players.length<this.s.capacity,'Phòng đã đầy');check(typeof name==='string'&&name.trim().length>0&&name.trim().length<=24,'Tên cần từ 1–24 ký tự');
  const seat=[0,1,2,3].find(i=>!this.s.players.some(p=>p.seat===i))!;
  const p:Player={id:crypto.randomUUID(),token:crypto.randomUUID()+crypto.randomUUID(),name:name.trim(),seat,color:COLORS[seat],character:[0,1,2,3].find(i=>!this.s.players.some(p=>p.character===i))!,ready:false,connected:true,offline:0,cash:RULES.cash,pos:0,island:0,onIsland:false,islandFailedTurns:0,laps:0,travelPending:false,escape:0,out:false,forfeited:false,bot:false,difficulty:'heuristic',income:0,expense:0,rank:0};
  this.s.players.push(p);this.s.host ||= p.id;this.s.allOffline=0;this.s.version++;this.log(`${p.name} vào phòng`);return p;
 }
 disconnect(id:string){const p=this.player(id);if(p.bot)return;p.connected=false;p.offline=this.now;p.ready=false;if(!this.s.players.some(p=>p.connected&&!p.bot))this.s.allOffline=this.now;if(this.s.phase==='ended')this.transferHost(id);this.s.version++;this.remember({kind:'disconnect',id,at:this.now});}
 transferHost(id:string){if(this.s.host===id)this.s.host=this.s.players.filter(p=>p.connected&&!p.bot&&p.id!==id).sort((a,b)=>a.seat-b.seat)[0]?.id||id;}
 remove(id:string){this.s.players=this.s.players.filter(p=>p.id!==id);delete this.s.seen[id];if(this.s.host===id)this.s.host=this.s.players.filter(p=>!p.bot).sort((a,b)=>a.seat-b.seat)[0]?.id||'';if(!this.s.players.some(p=>!p.bot))this.s.closed=true;}
 credit(p:Player,n:number){check(integer(n)&&integer(p.cash+n));p.cash+=n;p.income+=n;}
 debit(p:Player,n:number){check(integer(n)&&p.cash>=n,'Không đủ trứng');p.cash-=n;p.expense+=n;}
 ownsGroup(id:string,g:number[]){return g.every(i=>this.s.properties[i].owner===id);}
 rent(i:number){const t=this.tile(i),a=this.s.properties[i];if(!a.owner)return 0;const owner=this.player(a.owner);if(a.disabledUntilStartPasses>owner.laps)return 0;
  const base=Math.floor(t.purchasePrice/4);
  const festival=a.festivalUntil>this.s.turnCount?a.festival*10000:10000,championship=a.championshipUntil>this.s.turnCount?a.championshipBps:10000;
  return Math.floor(base*festival/10000*championship/10000);
 }
 takeoverPrice(i:number){return Math.floor(this.s.properties[i].investment*RULES.buybackMultiplierBps/10000);}
 takeoverAllowed(i:number,p:Player){const t=this.tile(i),a=this.s.properties[i];return !!(RULES.buybackEnabled&&a.owner&&a.owner!==p.id&&t.takeoverRules.allowed&&a.level<RULES.hotelLevel&&!a.shieldCharges);}
 constructionCost(i:number,level:number){const a=this.s.properties[i];return this.tile(i).constructionCosts.slice(a.level+1,level+1).reduce((n,v)=>n+v,0);}
 purchaseCost(i:number,level:number){return this.tile(i).purchasePrice+this.tile(i).constructionCosts.slice(1,level+1).reduce((n,v)=>n+v,0);}
 maxLevel(p:Player,i:number){const a=this.s.properties[i];if(a.level>=RULES.hotelLevel||a.disabledUntilStartPasses>p.laps)return a.level;if(RULES.requireNewLapToUpgrade&&p.laps<=a.lastUpgradeLap&&!this.s.context?.takeoverUpgrade)return a.level;return a.level+1;}
 legalDestinations(p:Player){return BOARD.filter(t=>t.purchasePrice>0&&(!this.s.properties[t.id].owner||this.s.properties[t.id].owner===p.id)).map(t=>t.id);}
 festivalTiles(p:Player){return BOARD.filter(t=>t.tileType==='city'&&this.s.properties[t.id].owner===p.id).map(t=>t.id);}
 eventTargets(p:Player){const kind=this.s.eventChoice?.kind;return BOARD.filter(t=>t.tileType==='city'&&(kind!=='earthquake'||this.s.properties[t.id].level>0&&this.s.properties[t.id].level<RULES.hotelLevel)&&(kind==='shield'?this.s.properties[t.id].owner===p.id:!!this.s.properties[t.id].owner&&this.s.properties[t.id].owner!==p.id)).map(t=>t.id);}
 decisions(p:Player){const i=p.pos,t=BOARD[i],levels=t.tileType==='city'?RULES.initialBuildChoices:[0];return {actorId:this.s.debt?.from||this.s.turn,purchaseLevels:levels,purchaseCosts:Object.fromEntries(levels.map(level=>[level,this.purchaseCost(i,level)])),maxLevel:this.maxLevel(p,i),upgradeCost:this.constructionCost(i,this.maxLevel(p,i)),takeoverCost:this.takeoverPrice(i),takeoverAllowed:this.takeoverAllowed(i,p),eligibleTargets:this.s.phase==='destination'?this.legalDestinations(p):this.s.phase==='festival'?this.festivalTiles(p):this.s.phase==='event'?this.eventTargets(p):[],eventKind:this.s.eventChoice?.kind};}
 netWorth(p:Player){return p.cash+this.s.properties.reduce((n,a)=>n+(a.owner===p.id?a.investment:0),0);}
 move(p:Player,steps:number,mode:MoveMode='DICE',awardStartBonus=RULES.moveBonus[mode]){const from=p.pos,n=BOARD.length;check(Number.isSafeInteger(steps));const passes=steps>0?Math.floor((from+steps)/n):0;
  if(passes&&awardStartBonus){p.laps+=passes;this.credit(p,RULES.salary*passes);this.log(`${p.name} qua Xuất phát, nhận ${formatMoney(RULES.salary*passes)}`,'salary',{id:p.id,amount:RULES.salary*passes});}
  p.pos=((from+steps)%n+n)%n;this.log(`${p.name} đến ${BOARD[p.pos].name}`,'move',{id:p.id,from,to:p.pos,steps,mode});
 }
 island(p:Player){p.pos=tileByKey('island').id;p.onIsland=true;p.island=RULES.islandAttempts;p.islandFailedTurns=0;this.s.extra=false;this.s.doubles=0;this.log(`${p.name} tới Hoang đảo`,'island',{id:p.id});this.complete();}
 die(){return 1+Math.floor(this.draw()*6);}
 roll(p:Player){check(this.s.phase==='roll');this.s.dice=[this.die(),this.die()];const [a,b]=this.s.dice;this.log(`${p.name} tung ${a} + ${b}`,'roll',{id:p.id,dice:[a,b]});if(a===b)this.log(`${p.name} đổ đôi`,'doubles',{id:p.id});
  if(p.onIsland){this.s.extra=false;if(a===b||((a===1&&b===6)||(a===6&&b===1))){this.s.extra=true;this.s.doubles=1;p.onIsland=false;p.island=0;p.islandFailedTurns=0;this.move(p,a+b);this.land(p);}else{p.islandFailedTurns++;p.island=Math.max(0,RULES.islandAttempts-p.islandFailedTurns);this.complete();}return;}
  const bonus=a===b||RULES.oneSixExtraTurn&&((a===1&&b===6)||(a===6&&b===1));this.s.extra=RULES.doubleExtraTurn&&bonus;this.s.doubles=bonus?this.s.doubles+1:0;if(RULES.threeDoublesToIsland&&this.s.doubles>=RULES.maxDoubles)return this.island(p);this.move(p,a+b);this.land(p);
 }
 payment(from:string,to:string|null,amount:number):Debt{check(integer(amount));const id=`${this.s.matchId}:${++this.s.effectSeq}`;return {id,from,to,amount,paid:false,sourceEventId:`event:${this.s.seq}`};}
 pay(p:Player,to:string|null,amount:number,after='complete'){check(!this.s.debt,'Khoản nợ trước chưa xử lý');this.s.payments.push(this.payment(p.id,to,amount));this.s.afterPayments={id:p.id,kind:after};this.drainPayments();}
 drainPayments(){while(this.s.payments.length){const d=this.s.payments[0],p=this.player(d.from);if(p.out){this.s.payments.shift();continue;}if(p.cash<d.amount){const same=this.s.debt?.id===d.id;this.s.debt=d;if(!same)this.phase('debt',RULES.debtMs);return;}
   this.debit(p,d.amount);if(d.to&&!this.player(d.to).out)this.credit(this.player(d.to),d.amount);d.paid=true;this.s.paidDebtIds.push(d.id);this.s.paidDebtIds=this.s.paidDebtIds.slice(-100);this.log(`${p.name} trả ${formatMoney(d.amount)} cho ${d.to?this.player(d.to).name:'ngân hàng'}`,'payment',{from:p.id,to:d.to,amount:d.amount,debtId:d.id});this.s.payments.shift();this.s.debt=null;
  }
  const after=this.s.afterPayments;this.s.afterPayments=null;this.s.debt=null;if(!after)return this.complete();const p=this.player(after.id);if(p.out){this.s.extra=false;this.next();return;}this.afterPayment(p,after.kind);
 }
 afterPayment(p:Player,after:string){if(after==='takeover'&&this.takeoverAllowed(p.pos,p))this.phase('takeover');else if(after==='destination')this.phase('destination');else this.complete();}
 settle(){check(this.s.debt);const p=this.player(this.s.debt!.from);check(p.cash>=this.s.debt!.amount,'Chưa đủ trứng thanh toán');this.drainPayments();}
 complete(){if(this.s.context)this.s.context.takeoverUpgrade=false;if(this.s.phase!=='ended')this.phase('complete',RULES.autoEndMs);}
 offerTravel(p:Player){if(!this.legalDestinations(p).length||p.cash<RULES.travel)return this.complete();this.phase('destination');}
 land(p:Player,depth=0):void{check(depth<RULES.maxEffectHops,'Chuỗi hiệu ứng quá dài');const t=BOARD[p.pos],a=this.s.properties[p.pos];this.s.context={tile:t.id,rent:0,owner:a.owner,sourceLevel:a.level};
  if(t.purchasePrice){if(!a.owner){this.phase('buy');return;}if(a.owner===p.id){if(t.tileType==='city'&&a.level<this.maxLevel(p,t.id))this.phase('construct');else this.complete();return;}const rent=this.rent(t.id);this.s.context.rent=rent;this.pay(p,a.owner,rent,'takeover');return;}
  if(t.tileType==='island')return this.island(p);if(t.tileType==='travel')return this.offerTravel(p);
  if(t.tileType==='festival'){this.s.festivalChannel='championship';if(this.festivalTiles(p).length)this.phase('festival');else this.complete();return;}
  if(t.tileType==='tax')return this.pay(p,null,Math.floor(p.cash*RULES.taxRateBps/10000));if(t.tileType==='chance')return this.card(p,depth);this.complete();
 }
 downgrade(i:number,steps:number){const a=this.s.properties[i];if(!a.owner||a.level===RULES.hotelLevel)return;if(a.shieldCharges){a.shieldCharges--;this.log(`Lá chắn bảo vệ ${BOARD[i].name}`,'shield',{tile:i});return;}
  if(a.level===0){this.s.properties[i]=emptyProperty();this.log(`${BOARD[i].name} trở về ngân hàng`,'liquidate',{tile:i});return;}
  const oldInvestment=a.investment;a.level=Math.max(0,a.level-steps);a.investment=BOARD[i].purchasePrice+BOARD[i].constructionCosts.slice(1,a.level+1).reduce((a,b)=>a+b,0);a.resaleBasis=Math.max(BOARD[i].purchasePrice,(a.resaleBasis||oldInvestment)-(oldInvestment-a.investment));this.log(`${BOARD[i].name} hạ còn ${a.level} nhà`,'downgrade',{tile:i,level:a.level});
 }
 card(p:Player,depth=0):void{const id=this.s.deck.shift()!,c=CARDS[id];check(c,'Bộ thẻ không hợp lệ');if(c.type!=='escape')this.s.deck.push(id);this.log(c.text,'card',{id:p.id,card:id});
  switch(c.type){
   case 'escape':p.escape++;return this.complete();
   case 'island':return this.island(p);
   case 'cash':if(c.value!<0)return this.pay(p,null,-c.value!);this.credit(p,c.value!);return this.complete();
   case 'repair':return this.pay(p,null,this.s.properties.reduce((n,a)=>n+(a.owner===p.id?a.level*c.value!:0),0));
   case 'festival':this.s.festivalChannel='festival';if(this.festivalTiles(p).length)this.phase('festival');else this.complete();return;
   case 'travel':return this.offerTravel(p);
   case 'earthquake':case 'shield':case 'disable':case 'downgrade':this.s.eventChoice={kind:c.type,value:c.value||1};if(this.eventTargets(p).length)this.phase('event');else{this.s.eventChoice=null;this.complete();}return;
   case 'birthday':this.s.payments=this.active.filter(q=>q.id!==p.id).map(q=>this.payment(q.id,p.id,c.value!));this.s.afterPayments={id:p.id,kind:'complete'};return this.drainPayments();
   case 'back':this.move(p,-c.value!,'CARD_MOVE');return this.land(p,depth+1);
   case 'move':{const mode=c.key==='start'?'GO_TO_START':'CARD_MOVE';this.move(p,(tileByKey(c.key!).id-p.pos+BOARD.length)%BOARD.length,mode);return this.land(p,depth+1);}
  }
 }
 buy(p:Player,initialLevel=0){check(this.s.phase==='buy');const t=BOARD[p.pos],a=this.s.properties[p.pos];check(t.purchasePrice>0&&!a.owner);check(t.tileType==='city'?RULES.initialBuildChoices.includes(initialLevel):initialLevel===0,'Cấp mua ban đầu không hợp lệ');const cost=this.purchaseCost(t.id,initialLevel);this.debit(p,cost);Object.assign(a,{owner:p.id,level:initialLevel,investment:cost,resaleBasis:cost,lastUpgradeLap:p.laps});this.log(`${p.name} mua ${t.name} · ${initialLevel} nhà`,'purchase',{tile:t.id,id:p.id,level:initialLevel});if(initialLevel)this.log(`${t.name} đã xây ${initialLevel} nhà`,'build',{tile:t.id,id:p.id,level:initialLevel,initial:true});if(!this.checkWin(p))this.complete();}
 build(p:Player,level:number){check(this.s.phase==='construct');const i=p.pos,a=this.s.properties[i];check(a.owner===p.id&&BOARD[i].tileType==='city');check(level===a.level+1&&level<=this.maxLevel(p,i),'Mỗi lần ghé chỉ nâng một cấp và phải qua vòng mới');const cost=this.constructionCost(i,level);this.debit(p,cost);a.level=level;a.resaleBasis=(a.resaleBasis||a.investment)+cost;a.investment+=cost;a.lastUpgradeLap=p.laps;this.log(`${p.name} xây ${level===4?'Khách sạn':level+' nhà'} tại ${BOARD[i].name}`,'build',{tile:i,id:p.id,level});this.complete();}
 takeover(p:Player){check(this.s.phase==='takeover'&&this.takeoverAllowed(p.pos,p),'Khách sạn, điểm du lịch hoặc lá chắn chặn mua lại');const i=p.pos,a=this.s.properties[i],owner=a.owner!,cost=this.takeoverPrice(i);check(!this.player(owner).out);this.debit(p,cost);this.credit(this.player(owner),cost);const disabledRemaining=Math.max(0,a.disabledUntilStartPasses-this.player(owner).laps);a.owner=p.id;a.resaleBasis=cost;a.lastUpgradeLap=p.laps;a.disabledUntilStartPasses=p.laps+disabledRemaining;if(!RULES.buybackPreserveLevel){a.level=0;a.investment=BOARD[i].purchasePrice;}this.log(`${p.name} mua lại ${BOARD[i].name}: ${formatMoney(cost)}`,'takeover',{tile:i,id:p.id,previousOwner:owner,amount:cost});if(!this.checkWin(p)){this.s.context={...this.s.context!,tile:i,takeoverUpgrade:true};if(a.level<this.maxLevel(p,i))this.phase('construct');else this.complete();}}
 chooseDestination(p:Player,i:number){check(this.s.phase==='destination'&&this.legalDestinations(p).includes(i),'Điểm đến không hợp lệ');this.debit(p,RULES.travel);this.log(`${p.name} trả vé ${formatMoney(RULES.travel)}`,'payment',{from:p.id,to:null,amount:RULES.travel});this.move(p,BOARD.length-p.pos+i,'FLIGHT',true);this.log(`${p.name} hoàn tất chuyến du lịch`,'travel',{id:p.id,to:i});this.land(p);}
 festival(p:Player,i:number){check(this.s.phase==='festival'&&this.festivalTiles(p).includes(i),'Chỉ tổ chức tại thành phố sở hữu');const a=this.s.properties[i];if(this.s.festivalChannel==='championship'){a.championshipBps=Math.max(a.championshipUntil>this.s.turnCount?a.championshipBps:10000,RULES.festivalMultiplier*10000);a.championshipUntil=this.s.turnCount+RULES.festivalTurns;this.log(`Giải vô địch tại ${BOARD[i].name} ×${a.championshipBps/10000}`,'festival',{tile:i,id:p.id});this.complete();return;}a.festival=Math.max(a.festivalUntil>this.s.turnCount?a.festival:1,RULES.festivalMultiplier);a.festivalUntil=this.s.turnCount+RULES.festivalTurns;this.log(`Lễ hội ${BOARD[i].name} ×${a.festival}`,'festival',{tile:i,id:p.id});this.complete();}
 chooseEvent(p:Player,i:number){check(this.s.phase==='event'&&this.eventTargets(p).includes(i),'Mục tiêu thẻ không hợp lệ');const e=this.s.eventChoice!,a=this.s.properties[i];if(e.kind==='shield')a.shieldCharges+=e.value;else if(e.kind==='disable')a.disabledUntilStartPasses=this.player(a.owner!).laps+e.value;else this.downgrade(i,e.value);this.log(`Đã áp dụng thẻ tại ${BOARD[i].name}`,'event',{tile:i,id:p.id,kind:e.kind});this.s.eventChoice=null;if(!this.checkAnyWin())this.complete();}
 resaleValue(i:number){const a=this.s.properties[i];return Math.floor((a.resaleBasis||a.investment)*RULES.resaleRatio);}
 liquidate(p:Player,i:number){check(this.s.phase==='debt'&&this.s.debt?.from===p.id,'Chỉ thanh lý khi đang nợ');const a=this.s.properties[this.tile(i).id];check(a.owner===p.id,'Bạn không sở hữu ô này');const amount=this.resaleValue(i);this.credit(p,amount);this.s.properties[i]=emptyProperty();this.log(`${p.name} thanh lý ${BOARD[i].name}: ${formatMoney(amount)}`,'liquidate',{tile:i,id:p.id});this.checkAnyWin();}
 eliminate(p:Player,forfeit=false){if(p.out)return;p.forfeited=forfeit;p.out=true;p.rank=this.active.length+1;this.log(`${p.name} ${forfeit?'rời trận':'phá sản'}`,forfeit?'forfeit':'bankrupt',{id:p.id});if(!forfeit&&this.s.debt?.from===p.id&&this.s.debt.to&&!this.player(this.s.debt.to).out)this.credit(this.player(this.s.debt.to),p.cash);this.debit(p,p.cash);this.s.properties=this.s.properties.map(a=>a.owner===p.id?emptyProperty():a);while(p.escape){p.escape--;this.s.deck.push(CARDS.findIndex(c=>c.type==='escape'));}
  this.s.payments=this.s.payments.filter(d=>d.from!==p.id).map(d=>d.to===p.id?{...d,to:null}:d);if(this.s.debt?.from===p.id)this.s.debt=null;
  if(this.checkAnyWin())return;if(this.s.payments.length||this.s.afterPayments)this.drainPayments();else if(p.id===this.s.turn){this.s.extra=false;this.next();}
 }
 bankrupt(p:Player){this.eliminate(p,false);}
 checkWin(p:Player){if(this.s.phase==='ended')return true;if(RULES.victory.side&&SIDES.some(side=>side.length&&this.ownsGroup(p.id,side))){this.finish(p,'SIDE_MONOPOLY');return true;}if(TRIPLETS.filter(g=>this.ownsGroup(p.id,g)).length>=RULES.victory.tripleSetsRequired){this.finish(p,'TRIPLE_MONOPOLY');return true;}if(RULES.victory.allResorts&&TOURISTS.length&&this.ownsGroup(p.id,TOURISTS)){this.finish(p,'RESORT_MONOPOLY');return true;}return false;}
 checkAnyWin(){if(this.s.phase==='ended')return true;for(const p of this.active)if(this.checkWin(p))return true;if(this.active.length===1){const reason=this.s.players.some(p=>p.forfeited)?'ACCEPT_WINNINGS':'BANKRUPTCY';if(reason==='ACCEPT_WINNINGS'?RULES.victory.allOthersLeave:RULES.victory.bankruptcy){this.finish(this.active[0],reason);return true;}}return false;}
 finish(p:Player,reason:string){const labels:Record<string,string>={SIDE_MONOPOLY:'Độc quyền một cạnh',TRIPLE_MONOPOLY:'Độc quyền 3 bộ ba',RESORT_MONOPOLY:'Độc quyền du lịch',BANKRUPTCY:'Các đối thủ phá sản',ACCEPT_WINNINGS:'Các đối thủ rời trận',TIME_LIMIT:'Hết giờ · tổng tài sản cao nhất'};this.s.phase='ended';this.s.deadline=0;this.s.ended=this.now;this.s.winner=p.id;this.s.winReasonCode=reason;this.s.winReason=labels[reason]||reason;this.s.debt=null;this.s.payments=[];this.s.afterPayments=null;const remaining=this.active.filter(q=>q.id!==p.id).sort((a,b)=>this.netWorth(b)-this.netWorth(a)||a.seat-b.seat);p.rank=1;remaining.forEach((q,i)=>q.rank=i+2);if(!this.player(this.s.host).connected)this.transferHost(this.s.host);this.log(`${p.name} chiến thắng: ${this.s.winReason}`,'win',{id:p.id,reason});}
 beginTurn(p:Player){if(p.onIsland&&p.islandFailedTurns>=RULES.islandAttempts){p.onIsland=false;p.island=0;p.islandFailedTurns=0;this.log(`${p.name} đã hết thời gian Hoang đảo`,'island-exit',{id:p.id});}this.phase('roll',RULES.rollMs);}
 next(){if(this.checkAnyWin())return;const order=this.s.turnOrder.length?this.s.turnOrder:this.active.map(p=>p.id);if(!this.s.extra||this.player(this.s.turn).out){let i=order.indexOf(this.s.turn);do{i=(i+1)%order.length;}while(this.player(order[i]).out);this.s.turn=order[i];this.s.doubles=0;}this.s.extra=false;this.s.context=null;this.s.eventChoice=null;this.s.turnCount++;this.log(`Đến lượt ${this.player(this.s.turn).name}`,'turn',{id:this.s.turn});this.beginTurn(this.player(this.s.turn));}
 reset(){const old=this.s,players=old.players.filter(p=>p.connected||p.bot);this.s=createState(old.code);this.s.version=old.version;this.s.capacity=old.capacity;this.s.players=players.map(p=>({...p,cash:RULES.cash,pos:0,island:0,onIsland:false,islandFailedTurns:0,laps:0,travelPending:false,escape:0,out:false,forfeited:false,income:0,expense:0,rank:0,ready:p.bot}));this.s.host=players.find(p=>p.id===old.host&&!p.bot)?.id||players.find(p=>!p.bot)?.id||'';this.s.legacySnapshot=old.legacySnapshot;if(!this.s.host)this.s.closed=true;}
 command(id:string,c:Command){check(c&&typeof c.commandId==='string'&&c.commandId.length>0&&c.commandId.length<=80&&c.roomId===this.s.code,'Lệnh không hợp lệ');if(this.s.seen[id]?.includes(c.commandId))return;check(c.expectedVersion===this.s.version,'Trạng thái đã đổi, vui lòng thử lại');check(!this.s.closed,'Phòng đã đóng');const p=this.player(id),v=c.payload||{};
  if(c.type==='leave'){if(['lobby','legacy'].includes(this.s.phase))this.remove(id);else if(this.s.phase!=='ended'){p.connected=false;p.offline=this.now;this.eliminate(p,true);this.transferHost(id);}else throw Error('Trận đã kết thúc');}
  else if(['legacy','ended'].includes(this.s.phase)){check(id===this.s.host&&c.type===(this.s.phase==='legacy'?'newRules':'rematch'),'Trận đã kết thúc hoặc đang dùng luật cũ');this.reset();}
  else if(this.s.phase==='lobby'){
   if(c.type==='ready')p.ready=!p.ready;
   else if(c.type==='character'){check(integer(v.character,0,3)&&!this.s.players.some(q=>q.id!==id&&q.character===v.character),'Nhân vật đã có người chọn');p.character=v.character;p.ready=false;}
   else if(c.type==='capacity'){check(id===this.s.host&&integer(v.capacity,2,4)&&v.capacity>=this.s.players.length);this.s.capacity=v.capacity;this.s.players.forEach(p=>p.ready=p.bot);}
   else if(c.type==='addBot'){check(id===this.s.host);const bot=this.join('Máy '+(this.s.players.filter(p=>p.bot).length+1));bot.bot=true;bot.ready=true;bot.difficulty=['random','heuristic','rollout'].includes(v.difficulty)?v.difficulty:'heuristic';}
   else if(c.type==='removeBot'){check(id===this.s.host&&this.player(v.id).bot);this.remove(v.id);}
   else if(c.type==='start'){check(id===this.s.host&&this.s.players.length>=2&&this.s.players.every(p=>p.ready&&p.connected),'Cần 2–4 người và tất cả sẵn sàng');check(new Set(this.s.players.map(p=>p.id)).size===this.s.players.length,'Trùng ID người chơi');validateMap();this.s.started=this.now;this.s.matchDeadline=RULES.matchMs>0?this.now+RULES.matchMs:0;this.s.turnOrder=RULES.shuffleTurnOrder?shuffle(this.active.map(p=>p.id),()=>this.draw()):this.active.map(p=>p.id);this.s.deck=shuffle(CARDS.flatMap((c,i)=>Array(c.weight||1).fill(i)),()=>this.draw());this.s.turn=this.s.turnOrder[0];this.beginTurn(this.player(this.s.turn));this.log('Bắt đầu Tỷ Phú Mebi · luật Mebi mới');}
   else throw Error('Lệnh sảnh không hợp lệ');
  }else{
   check(!p.out&&id===(this.s.debt?.from||this.s.turn),'Chưa đến lượt bạn');
   if(c.type==='roll')this.roll(p);
   else if(c.type==='buy')this.buy(p,v.initialLevel??0);
   else if(c.type==='construct')this.build(p,v.level);
   else if(c.type==='takeover')this.takeover(p);
   else if(c.type==='destination')this.chooseDestination(p,v.tile);
   else if(c.type==='festival')this.festival(p,v.tile);
   else if(c.type==='event')this.chooseEvent(p,v.tile);
   else if(c.type==='skip'){check(['buy','construct','takeover','festival','event','destination'].includes(this.s.phase));this.s.eventChoice=null;this.complete();}
   else if(c.type==='end'){check(this.s.phase==='complete');this.next();}
   else if(c.type==='bail'||c.type==='escape'){check(this.s.phase==='roll'&&p.onIsland);if(c.type==='bail')this.debit(p,RULES.bail);else{check(p.escape>0,'Chưa có thẻ rời đảo');p.escape--;this.s.deck.push(CARDS.findIndex(c=>c.type==='escape'));}p.onIsland=false;p.island=0;p.islandFailedTurns=0;}
   else if(c.type==='liquidate')this.liquidate(p,v.tile);
   else if(c.type==='settle'){check(this.s.phase==='debt');this.settle();}
   else if(c.type==='bankrupt'){check(this.s.phase==='debt');this.bankrupt(p);}
   else throw Error('Hành động không có trong bộ luật');
  }
  this.s.version++;(this.s.seen[id] ||= []).push(c.commandId);this.s.seen[id]=this.s.seen[id].slice(-100);
  if(c.type==='start'&&this.recordReplay){const {replayBase,history,legacySnapshot,...base}=this.s;this.s.replayBase=structuredClone({...base,history:[]});this.s.history=[];}
  else this.remember({kind:'command',id,command:structuredClone(c),at:this.now});
 }
 tick(now=Date.now()){this.now=now;let changed=false;if(this.s.closed)return false;
  if(this.s.allOffline&&now-this.s.allOffline>=1800000){this.s.closed=true;this.s.version++;return true;}
  for(const p of [...this.s.players])if(!p.bot&&!p.connected&&p.offline&&!p.out&&now-p.offline>=(['lobby','legacy'].includes(this.s.phase)?60000:120000)&&(!this.s.allOffline||['lobby','legacy'].includes(this.s.phase))){if(['lobby','legacy'].includes(this.s.phase))this.remove(p.id);else if(this.s.phase!=='ended')this.eliminate(p,true);changed=true;}
  if(this.s.matchDeadline&&now>=this.s.matchDeadline&&!['ended','lobby','legacy'].includes(this.s.phase)&&this.active.length){this.finish([...this.active].sort((a,b)=>this.netWorth(b)-this.netWorth(a)||a.seat-b.seat)[0],'TIME_LIMIT');changed=true;}
  if(this.s.deadline&&now>=this.s.deadline&&!['ended','lobby','legacy'].includes(this.s.phase)){
   changed=true;const p=this.player(this.s.debt?.from||this.s.turn);
   if(this.s.phase==='roll')this.roll(p);else if(this.s.phase==='complete')this.next();else if(this.s.phase==='debt'){for(const t of BOARD){if(p.cash>=this.s.debt!.amount)break;if(this.s.properties[t.id].owner===p.id)this.liquidate(p,t.id);}if(p.cash>=this.s.debt!.amount)this.settle();else this.bankrupt(p);}else{this.s.eventChoice=null;this.complete();}
  }
  if(changed){this.s.version++;this.remember({kind:'tick',at:this.now});}
  return changed;
 }
 botStep(){const p=this.s.players.find(p=>p.id===(this.s.debt?.from||this.s.turn));if(this.s.closed||!p?.bot||['lobby','legacy','ended'].includes(this.s.phase))return false;const action=chooseBotAction(snapshot(this.s),p.id,p.difficulty);this.command(p.id,{...action,commandId:`bot:${this.s.version}`,roomId:this.s.code,expectedVersion:this.s.version});return true;}
}
export function execute(state:State,id:string,command:Command,now=Date.now(),rng?:()=>number){const e=new Engine(structuredClone(state),rng,now);e.command(id,command);return e.s;}
export function exportReplay(s:State){check(s.phase==='ended'&&s.replayBase,'Chỉ tải replay sau khi trận kết thúc');const base=structuredClone(s.replayBase);base.players=base.players.map(({token,...p}:Player)=>({...p,token:''}));return {ruleset:RULESET,mapVersion:MAP_VERSION,base,history:structuredClone(s.history),final:snapshot(s)};}
export function replayGame(replay:ReturnType<typeof exportReplay>){check(replay.ruleset===RULESET&&replay.mapVersion===MAP_VERSION,'Replay không đúng phiên bản');const e=new Engine(structuredClone(replay.base));e.s.replayBase=structuredClone(replay.base);for(const h of replay.history){e.now=h.at;if(h.kind==='command')e.command(h.id!,{...h.command!,expectedVersion:e.s.version});else if(h.kind==='tick')e.tick(h.at);else if(h.kind==='disconnect')e.disconnect(h.id!);else{const p=e.player(h.id!);p.connected=true;p.offline=0;e.s.allOffline=0;if(!e.s.players.find(q=>q.id===e.s.host)?.connected&&e.s.phase==='ended')e.s.host=p.id;e.s.version++;}}return e.s;}
