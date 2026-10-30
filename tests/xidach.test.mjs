import test from 'node:test';
import assert from 'node:assert/strict';
import {RULES,score,classify,compare,decideBot,validateBet,deck52,shuffledDeck,formatEggs} from '../xi-dach/rules.js';
import {XiDachEngine} from '../xi-dach/engine.js';
import {XiDachService} from '../xi-dach/service.js';
import {XiDachRoom} from '../src/xi-dach-room.js';
const cards=(...ranks)=>ranks.map((rank,i)=>({rank,suit:['♠','♥','♦','♣'][i%4]}));
function room(count=1){const e=new XiDachEngine('ABC234');const ids=Array.from({length:count},(_,i)=>e.join({name:'Bạn '+i,create:i===0}));return {e,ids};}
function action(e,id,type,extra={},now=1){return e.action(id,{roomId:e.state.roomId,roundId:e.state.roundId,actionId:crypto.randomUUID(),type,...extra},now);}
function begin(e,ids){action(e,ids[0],'open');for(const id of ids)action(e,id,'bet',{amount:1000});action(e,ids[0],'start');}
function finish(e){let guard=100;while(e.state.phase!=='ROUND_END'&&--guard)e.tick(e.state.deadline);assert.ok(guard>0);}

test('Xì Dách: A scoring enumerates 1/10/11 and selects best valid sum',()=>{
  assert.equal(score(cards(1,9)).total,20);assert.equal(score(cards(1,7,3)).total,21);
  assert.deepEqual(score(cards(1,1)).totals,[2,11,12,20,21,22]);
  assert.equal(score(cards(1,1,9)).total,21);assert.equal(score(cards(1,1,1,8)).total,21);
  assert.equal(score(cards(1,1,1,9,9)).total,21);assert.equal(score(cards(1,10,10,2)).total,23);
});
test('Xì Dách: special ranking and tie rules including double bust',()=>{
  assert.equal(classify(cards(1,1)).kind,4);assert.equal(classify(cards(1,13)).kind,3);
  assert.equal(classify(cards(2,3,4,5,6)).kind,2);
  assert.equal(compare(cards(1,1),cards(1,13)),1);assert.equal(compare(cards(1,13),cards(2,3,4,5,6)),1);
  assert.equal(compare(cards(2,2,3,3,4),cards(2,3,4,5,6)),1);
  for(const hand of [cards(1,1),cards(1,10),cards(2,2,3,3,4),cards(10,8)])assert.equal(compare(hand,hand),0);
  assert.equal(compare(cards(10,10,2),cards(10,10,3)),-1);assert.equal(compare(cards(10,8),cards(10,10,3)),1);
});
test('Xì Dách: bot fixed public strategy uses only own cards and handles A',()=>{
  assert.equal(decideBot.length,1);
  for(const h of [cards(10,6),cards(1,4),cards(2,4,6)])assert.equal(decideBot(h),'hit');
  for(const h of [cards(10,7),cards(1,6),cards(1,1),cards(1,13),cards(2,2,2,2,2),cards(10,10,2)])assert.equal(decideBot(h),'stand');
  const hand=Object.freeze(cards(1,6).map(Object.freeze));assert.equal(decideBot(hand),'stand');
});
test('Xì Dách: bet validation rejects fractions, negatives, strings and wrong units',()=>{
  for(const n of [500,1500,-1000,1000.1,NaN,Infinity,0,11000,'1000'])assert.throws(()=>validateBet(n,100000,10000000));
  for(const n of [1000,3000,10000])assert.doesNotThrow(()=>validateBet(n,100000,10000000));
  assert.throws(()=>validateBet(1000,999,100000),/Không đủ trứng/);
  assert.throws(()=>validateBet(1000,10000,999),/^Error: Nhà cái không đủ quỹ cho mức cược này. Vui lòng chọn mức thấp hơn\.$/);
  assert.equal(formatEggs(100000),'100.000 trứng');
});
test('Xì Dách: eight real seats, independent dealer, ninth refused, token resumes full room',()=>{
  const {e,ids}=room(8);assert.equal(e.state.players.length,8);assert.equal(e.state.dealer.length,0);
  assert.throws(()=>e.join({name:'Thứ 9'}),/đủ 8/);
  assert.equal(e.join({token:e.player(ids[0]).token}),ids[0]);assert.throws(()=>e.join({token:'fake'}),/không hợp lệ/);
  assert.equal(e.total(),10800000);
});
test('Xì Dách: reserve, replace, cancel and insufficient fund keep exact total',()=>{
  const {e,ids}=room(8);action(e,ids[0],'open');const total=e.total();
  action(e,ids[0],'bet',{amount:1000});assert.equal(e.state.fund,9999000);assert.equal(e.player(ids[0]).balance,99000);assert.equal(e.total(),total);
  action(e,ids[0],'bet',{amount:3000});assert.equal(e.player(ids[0]).balance,97000);assert.equal(e.total(),total);
  action(e,ids[0],'cancel');assert.equal(e.player(ids[0]).balance,100000);assert.equal(e.total(),total);
  // Existing assets may move into player balances, never mint eggs to test a low fund.
  e.player(ids[1]).balance+=e.state.fund-500;e.state.fund=500;
  assert.throws(()=>action(e,ids[0],'bet',{amount:1000}),/Nhà cái không đủ quỹ/);e.assertFunds();
});
test('Xì Dách: solo + bot completes, eight simultaneous settlements conserve eggs, never pay twice',()=>{
  for(const count of [1,8])for(let trial=0;trial<40;trial++){
    const {e,ids}=room(count);begin(e,ids);finish(e);assert.equal(e.state.results.length,count);assert.equal(e.total(),10000000+count*100000);assert.ok(e.state.fund>=0);
    const before=e.total(),balances=e.state.players.map(p=>p.balance);e.settle();e.tick(e.state.deadline-1);assert.equal(e.total(),before);assert.deepEqual(e.state.players.map(p=>p.balance),balances);
  }
});
test('Xì Dách: all nine parties may consume five unique cards, deck has seven left',()=>{
  const {e,ids}=room(8);begin(e,ids);
  for(const id of ids)while(e.player(id).cards.length<5)e.player(id).cards.push(e.draw());
  while(e.state.dealer.length<5)e.state.dealer.push(e.draw());
  const dealt=[...e.state.players.flatMap(p=>p.cards),...e.state.dealer];
  assert.equal(dealt.length,45);assert.equal(new Set(dealt.map(c=>c.rank+c.suit)).size,45);assert.equal(e.state.deck.length,7);
  for(let i=0;i<10;i++)assert.equal(new Set(shuffledDeck().map(c=>c.rank+c.suit)).size,52);
});
test('Xì Dách: wrong room, round, turn, phase, host and replay are validated',()=>{
  const {e,ids}=room(2);assert.throws(()=>action(e,ids[1],'open'),/chủ phòng/);action(e,ids[0],'open');
  const msg={roomId:'ABC234',roundId:e.state.roundId,actionId:'once',type:'bet',amount:1000};
  e.action(ids[0],msg,1);const balance=e.player(ids[0]).balance;assert.equal(e.action(ids[0],msg,1),false);assert.equal(e.player(ids[0]).balance,balance);
  assert.throws(()=>e.action(ids[0],{...msg,roundId:999},1),/ván đã thay đổi/);assert.throws(()=>e.action(ids[0],{...msg,roomId:'ZZZ234'},1),/Phòng/);
  assert.throws(()=>action(e,ids[1],'start'),/chủ phòng/);action(e,ids[0],'start');assert.throws(()=>action(e,ids[0],'bet',{amount:1000}),/thời gian/);
  e.player(ids[0]).cards=cards(10,5);e.player(ids[0]).done=false;e.state.dealer=cards(10,7);e.tick(e.state.deadline);
  assert.throws(()=>action(e,ids[1],'hit'),/lượt/);assert.throws(()=>action(e,ids[0],'stand'),/16/);
  e.player(ids[0]).cards=cards(10,6);action(e,ids[0],'stand');assert.equal(e.state.phase,'DEALER_TURN');
});
test('Xì Dách: late join waits, snapshots hide all other hands/special status and tokens',()=>{
  const {e,ids}=room(2);begin(e,ids);const late=e.join({name:'Đến trễ'});
  assert.equal(e.state.participants.includes(late),false);const view=e.snapshot(ids[0]);
  const other=view.players.find(p=>p.id===ids[1]);assert.equal(other.cards,undefined);assert.equal(other.hand,undefined);assert.equal(other.done,undefined);assert.equal(view.dealer.cards,undefined);
  assert.equal(JSON.stringify(view).includes(e.player(ids[0]).token),false);assert.equal(view.deck,undefined);
  assert.deepEqual(view.players.find(p=>p.id===ids[0]).cards,e.player(ids[0]).cards);
  finish(e);assert.ok(e.snapshot(late).dealer.cards);assert.ok(e.snapshot(late).players.find(p=>p.id===ids[1]).cards);
});
test('Xì Dách: timeout uses same rules, cannot interleave expired hit and timer',async()=>{
  const {e,ids}=room();begin(e,ids);e.player(ids[0]).cards=cards(2,2);e.player(ids[0]).done=false;e.state.dealer=cards(10,7);e.state.deck=deck52();e.tick(e.state.deadline);
  e.tick(e.state.deadline);assert.equal(e.player(ids[0]).done,true);assert.ok(e.player(ids[0]).cards.length<=5);
  const count=e.player(ids[0]).cards.length;assert.throws(()=>action(e,ids[0],'hit'),/lượt/);assert.equal(e.player(ids[0]).cards.length,count);
});
test('Xì Dách: every payout is 1:1, including specials, ties and double bust',()=>{
  for(const [p,d,result] of [[cards(1,1),cards(1,13),1],[cards(2,2,2,2,2),cards(10,10),1],[cards(10,8),cards(10,8),0],[cards(10,10,3),cards(10,10,2),-1]]){
    const {e,ids}=room();begin(e,ids);e.player(ids[0]).cards=p;e.state.dealer=d;e.state.phase='SETTLEMENT';e.settle();
    assert.equal(e.player(ids[0]).balance,100000+1000*result);assert.equal(e.state.fund,10000000-1000*result);assert.equal(e.player(ids[0]).bet,0);assert.equal(e.state.results[0].result,result);
  }
});
test('Xì Dách: serialized service persists before snapshot, reconnect preserves balance and private hand',async()=>{
  let persisted;const service=new XiDachService('ABC234',{save:async s=>{await Promise.resolve();persisted=structuredClone(s);}}),messages=[];
  const peer=service.connect(m=>messages.push(m));await service.receive(peer,{type:'hello',name:'Một',create:true});
  const welcome=messages.find(m=>m.type==='welcome');assert.ok(welcome.token);const p=service.engine.player(welcome.id);
  const send=(type,extra={})=>service.receive(peer,{roomId:'ABC234',roundId:service.engine.state.roundId,actionId:crypto.randomUUID(),type,...extra});
  await send('open');await send('bet',{amount:1000});await send('start');assert.equal(p.balance,99000);
  const restored=new XiDachService('ABC234',{state:persisted});const received=[];const re=restored.connect(m=>received.push(m));await restored.receive(re,{type:'hello',token:welcome.token});
  assert.equal(re.id,welcome.id);assert.equal(restored.engine.player(re.id).balance,99000);assert.deepEqual(received.at(-1).state.players[0].cards,p.cards);
  const oldToken=p.token;assert.equal(received.at(-1).state.players[0].token,undefined);assert.equal(restored.engine.player(re.id).token,oldToken);
  await restored.disconnect(re);assert.equal(restored.engine.state.players.length,1);
});
test('Xì Dách: concurrent duplicate bets reserve once, failed actions roll back atomically',async()=>{
  const s=new XiDachService('ABC234');const peer=s.connect(()=>{});await s.receive(peer,{type:'hello',create:true,name:'Bạn'});
  const msg=type=>({roomId:'ABC234',roundId:s.engine.state.roundId,actionId:crypto.randomUUID(),type});await s.receive(peer,msg('open'));
  const bet={...msg('bet'),amount:1000};await Promise.all([s.receive(peer,bet),s.receive(peer,bet),s.tick(Date.now())]);assert.equal(s.engine.player(peer.id).balance,99000);assert.equal(s.engine.state.fund,9999000);
  const before=structuredClone(s.engine.state);await s.receive(peer,{...msg('bet'),amount:1500});assert.deepEqual(s.engine.state,before);
});
test('Xì Dách: Durable Object reload restores escrow and alarm advances a disconnected room',async()=>{
  const {e,ids}=room();begin(e,ids);const data=structuredClone(e.state);data.deadline=Date.now()-10;let saved,alarm;
  const ctx={blockConcurrencyWhile:fn=>fn(),storage:{get:async()=>data,put:async(k,v)=>{saved=structuredClone(v);},setAlarm:async n=>{alarm=n;},deleteAlarm:async()=>{}},waitUntil:()=>{}};
  const object=new XiDachRoom(ctx);await object.ready;await object.alarm();assert.ok(saved);assert.ok(alarm);assert.equal(object.service.engine.player(ids[0]).balance,99000);assert.notEqual(saved.phase,'DEALING');object.service.engine.assertFunds();
});
