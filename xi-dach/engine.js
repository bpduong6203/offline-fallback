import {RULES, classify, score, locked, compare, decideBot, validateBet, shuffledDeck} from './rules.js';

const fail=message=>{throw new Error(message);};
export class XiDachEngine {
  constructor(roomId, state=null, rules=RULES) {
    this.rules=rules;
    this.state=state || {roomId,created:false,hostId:null,phase:'LOBBY',roundId:0,players:[],fund:rules.initialFund,deck:[],dealer:[],participants:[],turnId:null,deadline:null,history:[],seen:[],results:[]};
  }
  join({name,avatar=0,token,create=false},now=Date.now()) {
    const s=this.state;
    if(token){const p=s.players.find(p=>p.token===token);if(!p)fail('Phiên chơi không hợp lệ.');return p.id;}
    if(create && s.created)fail('Mã phòng đã tồn tại. Hãy tạo phòng khác.');
    if(!create && !s.created)fail('Không tìm thấy phòng.');
    if(s.players.length>=this.rules.maxPlayers)fail('Phòng đã đủ 8 người chơi.');
    if(typeof name!=='string'||!name.trim()||name.trim().length>24)fail('Tên cần có từ 1 đến 24 ký tự.');
    const p={id:crypto.randomUUID(),token:crypto.randomUUID()+crypto.randomUUID(),name:name.trim(),avatar:Number.isInteger(avatar)&&avatar>=0&&avatar<8?avatar:0,balance:this.rules.initialBalance,bet:0,cards:[],done:false};
    s.players.push(p);s.created=true;s.hostId ||=p.id;
    this.assertFunds();return p.id;
  }
  player(id){return this.state.players.find(p=>p.id===id)||fail('Không tìm thấy người chơi.');}
  total(){const s=this.state;return s.fund+s.players.reduce((sum,p)=>sum+p.balance+2*p.bet,0);}
  assertFunds(){const s=this.state;if(s.fund<0||s.players.some(p=>p.balance<0)||this.total()!==this.rules.initialFund+s.players.length*this.rules.initialBalance)fail('Sai lệch quỹ trứng.');}
  action(id,m,now=Date.now()) {
    const s=this.state,p=this.player(id);
    if(!m||m.roomId!==s.roomId||m.roundId!==s.roundId)fail('Phòng hoặc ván đã thay đổi.');
    if(typeof m.actionId!=='string'||m.actionId.length<1||m.actionId.length>80)fail('Mã thao tác không hợp lệ.');
    const key=id+':'+m.actionId;
    if(s.seen.includes(key))return false;
    if(s.deadline && now>=s.deadline){this.tick(now);fail('Đã hết thời gian thao tác.');}
    switch(m.type){
      case 'open':
        if(id!==s.hostId||s.phase!=='LOBBY')fail('Chỉ chủ phòng được mở đặt cược.');
        this.betting(now);break;
      case 'bet':
        if(s.phase!=='BETTING')fail('Chưa đến thời gian đặt cược.');
        validateBet(m.amount,p.balance+p.bet,s.fund+p.bet,this.rules);
        p.balance+=p.bet;s.fund+=p.bet;p.bet=m.amount;p.balance-=p.bet;s.fund-=p.bet;break;
      case 'cancel':
        if(s.phase!=='BETTING')fail('Không thể hủy cược lúc này.');
        p.balance+=p.bet;s.fund+=p.bet;p.bet=0;break;
      case 'start':
        if(id!==s.hostId||s.phase!=='BETTING')fail('Chỉ chủ phòng được bắt đầu ván khi đang đặt cược.');
        if(!s.players.some(p=>p.bet))fail('Cần ít nhất 1 người chơi đã đặt cược.');
        this.start(now);break;
      case 'hit': case 'stand':
        if(s.phase!=='PLAYER_TURNS'||s.turnId!==id)fail('Chưa đến lượt bạn.');
        this.play(p,m.type,now);break;
      case 'next':
        if(id!==s.hostId||s.phase!=='ROUND_END')fail('Chờ chủ phòng mở ván tiếp theo.');
        this.betting(now);break;
      case 'host':
        if(id!==s.hostId||!['LOBBY','BETTING','ROUND_END'].includes(s.phase))fail('Không thể chuyển chủ phòng lúc này.');
        s.hostId=this.player(m.targetId).id;break;
      default:fail('Thao tác không hợp lệ.');
    }
    s.seen.push(key);if(s.seen.length>2048)s.seen.shift();this.assertFunds();return true;
  }
  betting(now){const s=this.state;s.roundId++;s.phase='BETTING';s.deadline=now+this.rules.bettingMs;s.turnId=null;s.dealer=[];s.results=[];s.participants=[];for(const p of s.players){p.cards=[];p.done=false;}s.seen=[];}
  start(now){
    const s=this.state;s.participants=s.players.filter(p=>p.bet>0).map(p=>p.id);
    if(!s.participants.length){s.phase='LOBBY';s.deadline=null;return;}
    s.deck=shuffledDeck();s.dealer=[];
    for(let i=0;i<2;i++){for(const id of s.participants)this.player(id).cards.push(this.draw());s.dealer.push(this.draw());}
    for(const id of s.participants){const p=this.player(id);p.done=locked(p.cards,this.rules);}
    s.phase='DEALING';s.deadline=now+this.rules.dealMs;
  }
  draw(){return this.state.deck.pop()||fail('Bộ bài không còn lá.');}
  play(p,type,now){
    if(type==='stand'){if(score(p.cards).total<this.rules.playerStand)fail('Cần ít nhất 16 điểm bài để dằn.');p.done=true;}
    else {if(p.done||p.cards.length>=this.rules.maxCards)fail('Bài đã khóa.');p.cards.push(this.draw());p.done=locked(p.cards,this.rules);}
    if(p.done)this.advance(now);else this.state.deadline=now+this.rules.turnMs;
  }
  advance(now){
    const s=this.state,next=s.participants.map(id=>this.player(id)).find(p=>!p.done);
    if(next){s.phase='PLAYER_TURNS';s.turnId=next.id;s.deadline=now+this.rules.turnMs;}
    else{s.phase='DEALER_TURN';s.turnId=null;s.deadline=now+this.rules.botDelayMs;}
  }
  showdown(now){const s=this.state;s.phase='SHOWDOWN';s.turnId=null;s.deadline=now+this.rules.showdownMs;}
  settle(){
    const s=this.state;if(s.phase!=='SETTLEMENT')return;
    s.results=[];
    for(const id of s.participants){const p=this.player(id),bet=p.bet;if(!bet)continue;const result=compare(p.cards,s.dealer);p.balance+=result===1?2*bet:result===0?bet:0;s.fund+=result===-1?2*bet:result===0?bet:0;p.bet=0;s.results.push({id,name:p.name,bet,result,delta:result*bet,hand:classify(p.cards)});}
    this.assertFunds();s.history.unshift({roundId:s.roundId,dealer:classify(s.dealer),results:structuredClone(s.results)});s.history=s.history.slice(0,10);
  }
  tick(now=Date.now()){
    const s=this.state;if(!s.deadline||now<s.deadline)return false;
    switch(s.phase){
      case 'BETTING':this.start(now);break;
      case 'DEALING':if(classify(s.dealer).kind>=3)this.showdown(now);else this.advance(now);break;
      case 'PLAYER_TURNS':{const p=this.player(s.turnId);while(!p.done&&score(p.cards).total<this.rules.playerStand)this.play(p,'hit',now);if(!p.done)this.play(p,'stand',now);break;}
      case 'DEALER_TURN':if(decideBot(s.dealer,this.rules)==='hit'){s.dealer.push(this.draw());s.deadline=now+this.rules.botDelayMs;}else this.showdown(now);break;
      case 'SHOWDOWN':s.phase='SETTLEMENT';s.deadline=now+200;break;
      case 'SETTLEMENT':this.settle();s.phase='ROUND_END';s.deadline=now+this.rules.resultMs;break;
      case 'ROUND_END':this.betting(now);break;
      default:s.deadline=null;
    }
    this.assertFunds();return true;
  }
  snapshot(id,online=[]){
    const s=this.state,reveal=['SHOWDOWN','SETTLEMENT','ROUND_END'].includes(s.phase);
    return {roomId:s.roomId,roundId:s.roundId,hostId:s.hostId,phase:s.phase,deadline:s.deadline,serverTime:Date.now(),turnId:s.turnId,fund:s.fund,reserved:s.players.reduce((n,p)=>n+p.bet,0),dealer:{count:s.dealer.length,...(reveal?{cards:s.dealer,hand:classify(s.dealer)}:{})},players:s.players.map(p=>({id:p.id,name:p.name,avatar:p.avatar,balance:p.balance,bet:p.bet,count:p.cards.length,participating:s.participants.includes(p.id),online:online.includes(p.id),...(p.id===id||reveal?{cards:p.cards,hand:p.cards.length?classify(p.cards):null}:{})})),results:s.results,history:s.history};
  }
}
