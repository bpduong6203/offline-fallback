import { BOARD, COLORS, DECKS, RULES } from './data';
import {formatMoney} from './currency';
export type Player={id:string;token:string;name:string;seat:number;color:string;character:number;ready:boolean;connected:boolean;offline:number;cash:number;pos:number;jail:number;cards:number[];out:boolean;income:number;expense:number;rank:number};
export type Property={owner:string|null;level:number;mortgaged:boolean};
export type Payment={from:string;to:string|null;amount:number};
export type TradeSide={cash:number;lands:number[];cards:number[]};
export type State={code:string;version:number;players:Player[];host:string;capacity:number;phase:string;turn:string;deadline:number;doubles:number;extra:boolean;dice:number[];properties:Property[];decks:number[][];log:{seq:number;text:string;type:string;data:any}[];seq:number;started:number;ended:number;auction:any;trade:any;payments:Payment[];afterDebt:any;queue:number[];seen:Record<string,string[]>;closed:boolean;allOffline:number};
export type Command={commandId:string;roomId:string;expectedVersion:number;type:string;payload?:any};
const requireThat=(ok:any,message='Thao tác không hợp lệ')=>{if(!ok)throw Error(message);};
const integer=(v:any,min=0,max=1000000)=>Number.isSafeInteger(v)&&v>=min&&v<=max;
export const random=()=>{const a=new Uint32Array(1);crypto.getRandomValues(a);return a[0]/4294967296;};
export function shuffle<T>(items:T[],rng= random){const a=[...items];for(let i=a.length-1;i>0;i--){const j=Math.floor(rng()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function createState(code:string):State{return {code,version:0,players:[],host:'',capacity:4,phase:'lobby',turn:'',deadline:0,doubles:0,extra:false,dice:[],properties:BOARD.map(()=>({owner:null,level:0,mortgaged:false})),decks:[],log:[],seq:0,started:0,ended:0,auction:null,trade:null,payments:[],afterDebt:null,queue:[],seen:{},closed:false,allOffline:0};}
export function snapshot(s:State){const {decks,seen,...rest}=s;return {...rest,players:s.players.map(({token,...p})=>p)};}
export class Engine{
 s:State; now:number; rng:()=>number;
 constructor(state:State,rng=random,now=Date.now()){this.s=state;this.rng=rng;this.now=now;}
 get active(){return this.s.players.filter(p=>!p.out).sort((a,b)=>a.seat-b.seat);}
 player(id:string){const p=this.s.players.find(p=>p.id===id);requireThat(p,'Người chơi không tồn tại');return p!;}
 log(text:string,type='info',data:any={}){this.s.log.push({seq:++this.s.seq,text,type,data});this.s.log=this.s.log.slice(-100);}
 phase(phase:string,ms=RULES.manageMs){this.s.phase=phase;this.s.deadline=this.now+ms;}
 join(name:string,token?:string){
  requireThat(!this.s.closed,'Phòng đã đóng');
  if(token){const p=this.s.players.find(p=>p.token===token);requireThat(p,'Phiên không hợp lệ');p!.connected=true;p!.offline=0;this.s.allOffline=0;if(this.s.phase==='ended'&&!this.s.players.find(x=>x.id===this.s.host)?.connected)this.s.host=p!.id;this.s.version++;return p!;}
  requireThat(this.s.phase==='lobby','Trận đã bắt đầu');requireThat(this.s.players.length<this.s.capacity,'Phòng đã đầy');
  requireThat(typeof name==='string'&&name.trim().length>0&&name.trim().length<=24,'Tên cần từ 1–24 ký tự');
  const seat=[0,1,2,3].find(n=>!this.s.players.some(p=>p.seat===n))!;
  const p:Player={id:crypto.randomUUID(),token:crypto.randomUUID()+crypto.randomUUID(),name:name.trim(),seat,color:COLORS[seat],character:[0,1,2,3].find(n=>!this.s.players.some(p=>p.character===n))!,ready:false,connected:true,offline:0,cash:RULES.cash,pos:0,jail:0,cards:[],out:false,income:0,expense:0,rank:0};
  this.s.players.push(p);if(!this.s.host)this.s.host=p.id;this.s.allOffline=0;this.s.version++;this.log(`${p.name} vào phòng`);return p;
 }
 disconnect(id:string){const p=this.player(id);p.connected=false;p.offline=this.now;p.ready=false;if(!this.s.players.some(p=>p.connected))this.s.allOffline=this.now;if(this.s.phase==='ended'&&this.s.host===id)this.s.host=this.s.players.filter(p=>p.connected).sort((a,b)=>a.seat-b.seat)[0]?.id||id;this.s.version++;}
 remove(id:string){this.s.players=this.s.players.filter(p=>p.id!==id);delete this.s.seen[id];if(this.s.host===id)this.s.host=this.s.players.sort((a,b)=>a.seat-b.seat)[0]?.id||'';if(!this.s.players.length)this.s.closed=true;}
 credit(p:Player,n:number){p.cash+=n;p.income+=n;}
 debit(p:Player,n:number){requireThat(p.cash>=n,'Không đủ tiền');p.cash-=n;p.expense+=n;}
 group(i:number){return BOARD.filter(t=>t.group&&t.group===BOARD[i].group).map(t=>t.id);}
 complete(i:number,id:string){return this.group(i).every(j=>this.s.properties[j].owner===id);}
 rent(i:number,dice:number,modifier=0){const t=BOARD[i],a=this.s.properties[i];if(!a.owner||a.mortgaged)return 0;
  if(t.kind==='station'){const n=BOARD.filter(t=>t.kind==='station'&&this.s.properties[t.id].owner===a.owner).length;return 25*2**(n-1)*(modifier===2?2:1);}
  if(t.kind==='utility'){const n=BOARD.filter(t=>t.kind==='utility'&&this.s.properties[t.id].owner===a.owner).length;return dice*(modifier===10||n===2?10:4);}
  return t.rents[a.level]*(a.level===0&&this.complete(i,a.owner)?2:1);
 }
 move(p:Player,steps:number,salary=true){const from=p.pos;if(salary&&steps>0&&from+steps>=40){const amount=RULES.salary*Math.floor((from+steps)/40);this.credit(p,amount);this.log(`${p.name} qua Xuất phát, nhận ${formatMoney(amount)}`,'salary',{id:p.id,amount});}p.pos=((from+steps)%40+40)%40;this.log(`${p.name} đến ${BOARD[p.pos].name}`,'move',{id:p.id,from,to:p.pos,steps});}
 jail(p:Player){p.pos=10;p.jail=1;this.s.extra=false;this.s.doubles=0;this.log(`${p.name} vào tù`,'jail',{id:p.id});this.phase('manage');}
 pay(payments:Payment[],after:any=null){this.s.payments.push(...payments);this.s.afterDebt=after;this.settle();}
 settle(){while(this.s.payments.length){const pay=this.s.payments[0],p=this.player(pay.from);if(p.out){this.s.payments.shift();continue;}
   if(p.cash<pay.amount){this.s.trade=null;this.phase('debt',RULES.debtMs);return;}
   this.debit(p,pay.amount);if(pay.to&&!this.player(pay.to).out)this.credit(this.player(pay.to),pay.amount);
   this.log(`${p.name} trả ${formatMoney(pay.amount)} cho ${pay.to?this.player(pay.to).name:'ngân hàng'}`,'payment',pay);this.s.payments.shift();
  }
  const after=this.s.afterDebt;this.s.afterDebt=null;if(after?.move&&!this.player(after.id).out){const p=this.player(after.id);this.move(p,after.move);this.land(p);}else if(this.player(this.s.turn).out){if(this.s.queue.length)this.auction(this.s.queue.shift()!);else this.next();}else this.phase('manage');
 }
 land(p:Player,modifier=0,depth=0){requireThat(depth<8,'Chuỗi thẻ không hợp lệ');const t=BOARD[p.pos],a=this.s.properties[p.pos];
  this.phase('manage');
  if(t.price){if(!a.owner){if(p.cash>=t.price)this.phase('buy',RULES.buyMs);else this.auction(t.id);}else if(a.owner!==p.id){const amount=this.rent(t.id,this.s.dice.reduce((a,b)=>a+b,0),modifier);if(amount)this.pay([{from:p.id,to:a.owner,amount}]);}return;}
  if(t.kind==='jail')return this.jail(p);
  if(t.kind==='tax')return this.pay([{from:p.id,to:null,amount:p.pos===4?200:100}]);
  if(t.kind==='chance'||t.kind==='community')this.card(p,t.kind==='chance'?0:1,depth);
 }
 card(p:Player,deck:number,depth=0){const id=this.s.decks[deck].shift()!,c=DECKS[deck][id];if(c.type!=='free')this.s.decks[deck].push(id);this.log(c.text,'card',{id:p.id,deck});
  if(c.type==='free'){p.cards.push(deck);return;}
  if(c.type==='jail')return this.jail(p);
  if(c.type==='cash'){if(c.value!>=0)this.credit(p,c.value!);else this.pay([{from:p.id,to:null,amount:-c.value!}]);return;}
  if(c.type==='repair'){const amount=this.s.properties.reduce((n,a)=>n+(a.owner===p.id?(a.level===5?(c.value===25?100:115):a.level*c.value!):0),0);if(amount)this.pay([{from:p.id,to:null,amount}]);return;}
  if(c.type==='each'){const others=this.active.filter(x=>x.id!==p.id);this.pay(others.map(x=>({from:c.value!>0?x.id:p.id,to:c.value!>0?p.id:x.id,amount:Math.abs(c.value!)})));return;}
  let steps=0,modifier=0;
  if(c.type==='back')steps=-c.value!;
  else if(c.type==='move')steps=(c.value!-p.pos+40)%40;
  else {let dest=(p.pos+1)%40;while(BOARD[dest].kind!==c.type)dest=(dest+1)%40;steps=(dest-p.pos+40)%40;modifier=c.type==='station'?2:10;if(modifier===10)this.s.dice=[this.die(),this.die()];}
  this.move(p,steps);this.land(p,modifier,depth+1);
 }
 die(){return 1+Math.floor(this.rng()*6);}
 roll(p:Player){requireThat(this.s.phase==='roll');this.s.dice=[this.die(),this.die()];const [a,b]=this.s.dice,sum=a+b;this.log(`${p.name} tung ${a} + ${b}`,'roll',{id:p.id,dice:[a,b]});
  if(p.jail){this.s.extra=false;if(a===b){p.jail=0;this.move(p,sum);this.land(p);}else if(p.jail>=3){p.jail=0;this.pay([{from:p.id,to:null,amount:RULES.bail}],{id:p.id,move:sum});}else{p.jail++;this.phase('manage');}return;}
  this.s.extra=a===b;this.s.doubles=a===b?this.s.doubles+1:0;if(this.s.doubles===3)return this.jail(p);this.move(p,sum);this.land(p);
 }
 auction(tile:number){this.s.trade=null;this.s.auction={tile,bid:0,bidder:null,end:this.now+RULES.bidMs,max:this.now+RULES.auctionMs};this.phase('auction',RULES.bidMs);this.log(`Đấu giá ${BOARD[tile].name}`);}
 closeAuction(){const a=this.s.auction;if(a.bidder){const p=this.player(a.bidder);this.debit(p,a.bid);this.s.properties[a.tile].owner=p.id;this.log(`${p.name} thắng đấu giá ${BOARD[a.tile].name}: ${formatMoney(a.bid)}`,'purchase');}this.s.auction=null;if(this.s.queue.length)this.auction(this.s.queue.shift()!);else if(this.player(this.s.turn).out)this.next();else this.phase('manage');}
 next(){this.s.trade=null;if(this.active.length<=1)return this.finish();if(!this.s.extra||this.player(this.s.turn).out){const old=this.player(this.s.turn);this.s.turn=(this.active.find(p=>p.seat>old.seat)||this.active[0]).id;this.s.doubles=0;}this.s.extra=false;this.phase('roll',RULES.rollMs);this.log(`Đến lượt ${this.player(this.s.turn).name}`,'turn');}
 finish(){this.s.phase='ended';this.s.ended=this.now;this.s.deadline=0;this.s.auction=null;this.s.trade=null;if(!this.s.players.find(p=>p.id===this.s.host)?.connected)this.s.host=this.s.players.filter(p=>p.connected).sort((a,b)=>a.seat-b.seat)[0]?.id||this.s.host;if(this.active[0]){this.active[0].rank=1;this.log(`${this.active[0].name} chiến thắng!`,'win');}}
 stock(){return {houses:RULES.houses-this.s.properties.reduce((n,a)=>n+(a.level<5?a.level:0),0),hotels:RULES.hotels-this.s.properties.filter(a=>a.level===5).length};}
 manage(p:Player){requireThat((this.s.turn===p.id&&['roll','manage'].includes(this.s.phase))||(this.s.phase==='debt'&&this.s.payments[0]?.from===p.id),'Chưa đến lượt quản lý của bạn');requireThat(!this.s.trade,'Hãy xử lý giao dịch trước');}
 property(p:Player,i:number){requireThat(integer(i,0,39));const a=this.s.properties[i];requireThat(a.owner===p.id,'Bạn không sở hữu ô này');return a;}
 build(p:Player,i:number,sell=false){this.manage(p);const a=this.property(p,i),t=BOARD[i],g=this.group(i),stock=this.stock();requireThat(t.kind==='land');
  if(sell){requireThat(a.level>0&&g.every(j=>this.s.properties[j].level<=a.level),'Phải bán đều');if(a.level===5)requireThat(stock.houses>=4,'Ngân hàng thiếu nhà để hạ cấp');a.level--;this.credit(p,t.build/2);}
  else {requireThat(this.s.phase!=='debt'&&this.complete(i,p.id)&&g.every(j=>!this.s.properties[j].mortgaged),'Cần trọn nhóm không thế chấp');requireThat(a.level<5&&g.every(j=>this.s.properties[j].level>=a.level),'Phải xây đều');requireThat(a.level===4?stock.hotels>0:stock.houses>0,'Ngân hàng hết công trình');this.debit(p,t.build);a.level++;}
  this.log(`${p.name} ${sell?'bán':'xây'} công trình tại ${t.name}`,'build',{tile:i});
 }
 mortgage(p:Player,i:number,redeem=false){this.manage(p);const a=this.property(p,i),t=BOARD[i];requireThat(!this.group(i).some(j=>this.s.properties[j].level>0),'Bán hết công trình trong nhóm trước');requireThat(redeem?a.mortgaged:!a.mortgaged);
  if(redeem){requireThat(this.s.phase!=='debt');this.debit(p,Math.ceil(t.price/2*1.1));}else this.credit(p,t.price/2);a.mortgaged=!redeem;this.log(`${p.name} ${redeem?'chuộc':'thế chấp'} ${t.name}`);
 }
 returnCards(p:Player){for(const deck of p.cards)this.s.decks[deck].push(0);p.cards=[];}
 bankrupt(p:Player){if(p.out)return;const creditor=this.s.payments.find(x=>x.from===p.id)?.to;const to=creditor&&!this.player(creditor).out?this.player(creditor):null;this.s.trade=null;
  for(let i=0;i<40;i++){const a=this.s.properties[i];if(a.owner!==p.id)continue;if(to){if(a.level)this.credit(p,BOARD[i].build*(a.level===5?5:a.level)/2);a.level=0;a.owner=to.id;if(a.mortgaged)this.s.payments.push({from:to.id,to:null,amount:Math.ceil(BOARD[i].price*.05)});}else{this.s.properties[i]={owner:null,level:0,mortgaged:false};this.s.queue.push(i);}}
  if(to){this.credit(to,p.cash);to.cards.push(...p.cards);p.cards=[];}else this.returnCards(p);p.cash=0;p.out=true;p.rank=this.active.length+1;
  this.s.payments=this.s.payments.filter(x=>x.from!==p.id);this.s.payments=this.s.payments.map(x=>x.to===p.id?{...x,to:to?.id||null}:x);this.log(`${p.name} phá sản`,'bankrupt');
  if(this.active.length<=1)return this.finish();if(this.s.auction){if(this.s.auction.bidder===p.id){this.s.auction.bidder=null;this.s.auction.bid=0;}return;}
  if(this.s.payments.length)return this.settle();this.s.afterDebt=null;if(this.s.queue.length)this.auction(this.s.queue.shift()!);else if(p.id===this.s.turn)this.next();else this.phase('manage');
 }
 validateSide(p:Player,side:TradeSide){requireThat(side&&integer(side.cash)&&Array.isArray(side.lands)&&Array.isArray(side.cards)&&side.lands.length<=28&&side.cards.length<=2);requireThat(new Set(side.lands).size===side.lands.length&&new Set(side.cards).size===side.cards.length);requireThat(p.cash>=side.cash,'Không đủ tiền giao dịch');for(const i of side.lands){this.property(p,i);requireThat(!this.group(i).some(j=>this.s.properties[j].level),'Nhóm đất còn công trình');}for(const c of side.cards)requireThat(p.cards.includes(c),'Không có thẻ ra tù');}
 trade(p:Player,payload:any){requireThat(this.s.phase==='manage'&&this.s.turn===p.id&&!this.s.trade);const to=this.player(payload.to);requireThat(to.id!==p.id&&!to.out);this.validateSide(p,payload.give);this.validateSide(to,payload.take);this.s.trade={id:crypto.randomUUID(),from:p.id,to:to.id,give:payload.give,take:payload.take,end:Math.min(this.now+30000,this.s.deadline)};}
 accept(p:Player,id:string){const t=this.s.trade;requireThat(t&&t.to===p.id&&t.id===id&&t.end>this.now&&this.s.phase==='manage');const from=this.player(t.from);this.validateSide(from,t.give);this.validateSide(p,t.take);
  const fee=(side:TradeSide)=>side.lands.reduce((n,i)=>n+(this.s.properties[i].mortgaged?Math.ceil(BOARD[i].price*.05):0),0);
  requireThat(from.cash-t.give.cash+t.take.cash>=fee(t.take)&&p.cash-t.take.cash+t.give.cash>=fee(t.give),'Không đủ tiền trả phí chuyển quyền');
  from.cash+=t.take.cash-t.give.cash-fee(t.take);p.cash+=t.give.cash-t.take.cash-fee(t.give);from.income+=t.take.cash;from.expense+=t.give.cash+fee(t.take);p.income+=t.give.cash;p.expense+=t.take.cash+fee(t.give);
  for(const [a,b,side] of [[from,p,t.give],[p,from,t.take]] as [Player,Player,TradeSide][]){for(const i of side.lands)this.s.properties[i].owner=b.id;for(const c of side.cards){a.cards.splice(a.cards.indexOf(c),1);b.cards.push(c);}}
  this.s.trade=null;this.log(`${from.name} và ${p.name} hoàn tất giao dịch`,'trade');
 }
 command(id:string,c:Command){requireThat(c&&typeof c.commandId==='string'&&c.commandId.length<=80&&c.commandId.length>0&&c.roomId===this.s.code,'Lệnh không hợp lệ');if(this.s.seen[id]?.includes(c.commandId))return;
  requireThat(c.expectedVersion===this.s.version,'Trạng thái đã đổi, vui lòng thử lại');const p=this.player(id);requireThat(!p.out||this.s.phase==='ended'||c.type==='leave');const v=c.payload||{},type=c.type;
  if(type==='leave'){if(this.s.phase==='lobby')this.remove(id);else{p.connected=false;p.offline=this.now;if(this.s.phase!=='ended')this.bankrupt(p);if(this.s.host===id)this.s.host=this.s.players.filter(x=>x.connected).sort((a,b)=>a.seat-b.seat)[0]?.id||id;}}
  else if(this.s.phase==='lobby'){
   if(type==='ready')p.ready=!p.ready;
   else if(type==='character'){requireThat(integer(v.character,0,3)&&!this.s.players.some(x=>x.id!==id&&x.character===v.character),'Nhân vật đã có người chọn');p.character=v.character;p.ready=false;}
   else if(type==='capacity'){requireThat(id===this.s.host&&integer(v.capacity,2,4)&&v.capacity>=this.s.players.length);this.s.capacity=v.capacity;this.s.players.forEach(p=>p.ready=false);}
   else if(type==='start'){requireThat(id===this.s.host&&this.s.players.length>=2&&this.s.players.every(p=>p.ready&&p.connected),'Cần ít nhất 2 người và tất cả sẵn sàng');this.s.started=this.now;this.s.decks=DECKS.map(d=>shuffle(d.map((_,i)=>i),this.rng));this.s.turn=this.active[0].id;this.phase('roll',RULES.rollMs);}
   else throw Error('Lệnh lobby không hợp lệ');
  }else if(type==='rematch'){requireThat(this.s.phase==='ended'&&id===this.s.host);const players=this.s.players.filter(p=>p.connected);this.s=createState(this.s.code);this.s.players=players.map(p=>({...p,ready:false,cash:RULES.cash,pos:0,jail:0,cards:[],out:false,income:0,expense:0,rank:0}));this.s.host=players.find(p=>p.id===id)?.id||players[0]?.id||'';this.s.version=c.expectedVersion;}
  else if(type==='bid'){requireThat(this.s.phase==='auction');const a=this.s.auction;requireThat(integer(v.amount,10)&&v.amount>=a.bid+10&&v.amount<=p.cash,'Giá phải tăng ít nhất 10.000 trứng và trong tiền mặt');a.bid=v.amount;a.bidder=id;a.end=Math.min(this.now+RULES.bidMs,a.max);this.s.deadline=a.end;}
  else if(type==='accept')this.accept(p,v.id);
  else if(type==='reject'){requireThat(this.s.trade&&[this.s.trade.to,this.s.trade.from].includes(id));this.s.trade=null;}
  else if(type==='build'||type==='sell')this.build(p,v.tile,type==='sell');
  else if(type==='mortgage'||type==='redeem')this.mortgage(p,v.tile,type==='redeem');
  else if(type==='settle'){requireThat(this.s.phase==='debt'&&this.s.payments[0].from===id&&p.cash>=this.s.payments[0].amount,'Chưa đủ tiền thanh toán');this.settle();}
  else if(type==='bankrupt'){requireThat(this.s.phase==='debt'&&this.s.payments[0].from===id);this.bankrupt(p);}
  else {requireThat(this.s.turn===id,'Chưa đến lượt bạn');
   if(type==='roll')this.roll(p);
   else if(type==='bail'||type==='jailCard'){requireThat(this.s.phase==='roll'&&p.jail);if(type==='bail')this.debit(p,RULES.bail);else{requireThat(p.cards.length>0);this.s.decks[p.cards.shift()!].push(0);}p.jail=0;}
   else if(type==='buy'){requireThat(this.s.phase==='buy');const t=BOARD[p.pos];requireThat(!this.s.properties[p.pos].owner);this.debit(p,t.price);this.s.properties[p.pos].owner=id;this.log(`${p.name} mua ${t.name}`,'purchase',{tile:p.pos});this.phase('manage');}
   else if(type==='decline'){requireThat(this.s.phase==='buy');this.auction(p.pos);}
   else if(type==='end'){requireThat(this.s.phase==='manage');this.next();}
   else if(type==='trade')this.trade(p,v);
   else throw Error('Lệnh không hợp lệ');
  }
  this.s.version++;(this.s.seen[id] ||= []).push(c.commandId);this.s.seen[id]=this.s.seen[id].slice(-100);
 }
 tick(now=Date.now()){this.now=now;let changed=false;
  if(this.s.allOffline&&now-this.s.allOffline>=1800000){this.s.closed=true;this.s.version++;return true;}
  for(const p of [...this.s.players])if(!p.connected&&p.offline&&now-p.offline>=(this.s.phase==='lobby'?60000:120000)&&!p.out&&(!this.s.allOffline||this.s.phase==='lobby')){if(this.s.phase==='lobby')this.remove(p.id);else if(this.s.phase!=='ended')this.bankrupt(p);changed=true;}
  if(this.s.trade&&this.s.trade.end<=now){this.s.trade=null;changed=true;}
  if(this.s.deadline&&this.s.deadline<=now&&!['ended','lobby'].includes(this.s.phase)){
   changed=true;const p=this.player(this.s.turn);
   if(this.s.phase==='auction')this.closeAuction();else if(this.s.phase==='buy')this.auction(p.pos);else if(this.s.phase==='roll')this.roll(p);else if(this.s.phase==='manage')this.next();else if(this.s.phase==='debt'){
    const debtor=this.player(this.s.payments[0].from);let attempts=0;
    while(this.s.phase==='debt'&&attempts++<180){const need=this.s.payments[0];if(this.player(need.from).id!==debtor.id)break;if(debtor.cash>=need.amount){this.settle();break;}
     const built=this.s.properties.map((a,i)=>({a,i})).filter(({a})=>a.owner===debtor.id&&a.level>0).sort((a,b)=>b.a.level-a.a.level||a.i-b.i).find(({a})=>a.level!==5||this.stock().houses>=4);
     if(built){this.build(debtor,built.i,true);continue;}const mortgage=this.s.properties.findIndex((a,i)=>a.owner===debtor.id&&!a.mortgaged&&!this.group(i).some(j=>this.s.properties[j].level));if(mortgage>=0){this.mortgage(debtor,mortgage);continue;}this.bankrupt(debtor);break;
    }
   }
  }
  if(changed)this.s.version++;return changed;
 }
}
// Clone before applying any intent: rejected commands can never partially change the room.
export function execute(state:State,id:string,command:Command,now=Date.now(),rng=random){const engine=new Engine(structuredClone(state),rng,now);engine.command(id,command);return engine.s;}
