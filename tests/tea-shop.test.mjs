import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,validateState,makeOrder,advance,act,capacity} from '../tea-shop/engine.js';
import {RECIPES,MINI} from '../tea-shop/data.js';
import {newBoard,matches,canMove,swap,adjacent} from '../tea-shop/match.js';
import {localMerit} from '../scripts/local-merit.mjs';
import {handleTeaRequest} from '../src/tea-api.js';
import {handleMeritRequest} from '../src/mebi-merit-api.js';
const ingredients=['cup','tea','milk','sugar','ice','topping','mix','lid'];
function prepare(s,o,now=10000,wrong=false){s.orders=[o];act(s,{action:'start',id:o.id},0,now);const r=RECIPES.find(r=>r.id===o.recipe);const values=[true,r.tea,r.milk,wrong?(o.sugar===0?30:0):o.sugar,o.ice,r.topping,true,true];for(let i=0;i<8;i++)act(s,{action:'step',kind:ingredients[i],value:values[i]},0,now);}
test('new shops start with 40 of every ingredient; legacy starter increase is granted once without resetting consumption',async()=>{
 const fresh=initialState();assert(Object.values(fresh.stock).every(n=>n===40));assert.equal(fresh.starterStockVersion,2);
 const env=localMerit();try{
  const profile=env.MERIT.get('starter-upgrade'),sql=profile.ctx.storage.sql,s=initialState();delete s.starterStockVersion;
  for(const k of Object.keys(s.stock))s.stock[k]=12;s.stock.milk=5;s.stock.cup=0;s.stock.black=39;
  sql.exec('CREATE TABLE IF NOT EXISTS tea_save (id INTEGER PRIMARY KEY,data TEXT NOT NULL,backup TEXT NOT NULL)');const raw=JSON.stringify(s);sql.exec('INSERT INTO tea_save VALUES (?,?,?)',1,raw,raw);sql.exec('UPDATE merit_balance SET balance = ? WHERE id = ?',17,1);
  const get=async()=>await(await profile.fetch(new Request('https://internal/tea'))).json();
  const first=await get();assert.equal(first.state.stock.milk,33);assert.equal(first.state.stock.cup,28);assert.equal(first.state.stock.black,40);assert.equal(first.state.stock.jasmine,40);assert.equal(first.balance,17);assert.equal(first.state.revision,1);assert.equal(first.state.economy,1);assert.equal(first.state.starterStockVersion,2);
  assert.deepEqual(await get(),first);
  const reset=await profile.fetch(new Request('https://internal/tea',{method:'POST',body:JSON.stringify({action:'reset',revision:1,requestId:crypto.randomUUID()})}));assert.equal(reset.status,200);assert.deepEqual((await reset.json()).state.stock,first.state.stock);
  assert.deepEqual((await get()).state.stock,first.state.stock);sql.exec('UPDATE tea_save SET data = ? WHERE id = ?','broken',1);assert.deepEqual((await get()).state.stock,first.state.stock);
 }finally{env.close();}
});
test('recipes deduct inventory once, reject out-of-order steps and discarded drinks do not refund',()=>{
 const s=initialState(),o=makeOrder(s,()=>0),before={...s.stock};act(s,{action:'start',id:(s.orders=[o])[0].id},0,10000);
 assert.equal(s.stock.cup,before.cup-1);assert.throws(()=>act(s,{action:'start',id:o.id},0),/Đang có/);
 assert.throws(()=>act(s,{action:'step',kind:'tea',value:'black'},0),/thứ tự/);
 act(s,{action:'discard'},0);assert.equal(s.stock.cup,before.cup-1);assert.equal(s.report.cost,.8);assert(validateState(s));
});
test('correct recipe earns server price and tips; wrong sugar reduces payment, no tip',()=>{
 for(const wrong of [false,true]){const s=initialState(),o=makeOrder(s,()=>0);prepare(s,o,10000,wrong);assert.throws(()=>act(s,{action:'serve'},0,11000),/ít nhất/);const delta=act(s,{action:'serve',delta:99999,amount:99999},0,19000);assert.equal(s.report.sales,wrong?3:8);assert.equal(s.report.tips,wrong?0:3);assert.equal(delta,wrong?3:11);assert.equal(s.drink,null);assert.throws(()=>act(s,{action:'serve'},0,20000),/đóng nắp/);}
});
test('no negative stock, insufficient money does not mutate inventory, capacity and upgrades apply',()=>{
 const s=initialState(),o=makeOrder(s,()=>0);s.stock.milk=0;s.orders=[o];assert.throws(()=>act(s,{action:'start',id:o.id},0),/Thiếu/);assert.equal(s.stock.black,40);
 assert.throws(()=>act(s,{action:'buy',item:'milk',amount:5},0),/Không đủ/);assert.equal(s.stock.milk,0);
 assert.equal(act(s,{action:'buy',item:'milk',amount:5},1),-1);assert.equal(s.stock.milk,5);assert.equal(s.report.purchases,1);
 assert.equal(act(s,{action:'buy',item:'milk',amount:10},2),-2);assert.equal(s.stock.milk,15);assert.equal(s.report.purchases,3);
 for(const amount of [1,4,6,1.5])assert.throws(()=>act(s,{action:'buy',item:'milk',amount},100),/không hợp lệ/);
 s.stock.cup=40;assert.throws(()=>act(s,{action:'buy',item:'cup',amount:5},10),/đầy/);
 act(s,{action:'upgrade',id:'fridge'},100);assert.equal(capacity(s),60);assert.throws(()=>act(s,{action:'buy',item:'__proto__',amount:1},100),/không hợp lệ/);
});
test('pause, minigames and closing the browser stop game time; patience expires without penalties to wallet',()=>{
 const s=initialState();act(s,{action:'open'},0);advance(s,5,()=>0);assert.equal(s.orders.length,1);const o=s.orders[0];s.paused=true;advance(s,5);assert.equal(o.wait,0);s.paused=false;act(s,{action:'miniStart',kind:'clean'},0,100);advance(s,5);assert.equal(o.wait,0);act(s,{action:'miniEnd',cancel:true},0,200);o.wait=o.patience-1;advance(s,2,()=>0);assert(!s.orders.some(x=>x.id===o.id));assert.equal(s.report.lost,1);
 const t=s.time;advance(s,100000);assert.equal(s.time-t,5);
});
test('garden starts with six pots and old saves gain missing pots once without losing crops or refilling stock',async()=>{
 const fresh=initialState();assert.equal(fresh.garden.length,6);act(fresh,{action:'plant',slot:5,seed:'green'},0);act(fresh,{action:'water',slot:5},0);assert(validateState(fresh));
 act(fresh,{action:'upgrade',id:'pots'},100);assert.equal(fresh.garden.length,7);assert(validateState(fresh));
 const env=localMerit();try{
  const profile=env.MERIT.get('six-pots'),sql=profile.ctx.storage.sql,s=initialState();s.garden=[{seed:'black',watered:true,growth:44},null];s.stock.milk=7;
  sql.exec('CREATE TABLE IF NOT EXISTS tea_save (id INTEGER PRIMARY KEY,data TEXT NOT NULL,backup TEXT NOT NULL)');const raw=JSON.stringify(s);sql.exec('INSERT INTO tea_save VALUES (?,?,?)',1,raw,raw);
  const get=async()=>await(await profile.fetch(new Request('https://internal/tea'))).json();const first=await get();assert.equal(first.state.garden.length,6);assert.deepEqual(first.state.garden[0],s.garden[0]);assert(first.state.garden.slice(1).every(p=>p===null));assert.equal(first.state.stock.milk,7);assert.equal(first.balance,0);assert.equal(first.state.revision,1);assert.deepEqual(await get(),first);
 }finally{env.close();}
});
test('garden matures in game time only, harvests once, does not overflow',()=>{
 const s=initialState();act(s,{action:'plant',slot:0,seed:'black'},0);advance(s,5);assert.equal(s.garden[0].growth,0);act(s,{action:'water',slot:0},0);act(s,{action:'open'},0);for(let i=0;i<18;i++)advance(s,5);assert.equal(s.garden[0].growth,90);s.stock.black=39;assert.throws(()=>act(s,{action:'harvest',slot:0},0),/đầy/);s.stock.black=12;act(s,{action:'harvest',slot:0},0);assert.equal(s.stock.black,16);assert.throws(()=>act(s,{action:'harvest',slot:0},0),/chưa/);
});
test('six minigames have bounded, once-per-day rewards, cancellation and reset cannot farm materials',()=>{
 const s=initialState();assert.throws(()=>act(s,{action:'end'},0),/6–8 phút/);for(const kind of Object.keys(MINI)){act(s,{action:'miniStart',kind},0,0);assert.throws(()=>act(s,{action:'miniEnd',score:100},0,5000),/10 giây/);act(s,{action:'miniEnd',score:100},0,15000);}
 const pearl=s.stock.pearl;act(s,{action:'miniStart',kind:'pearls'},0,20000);act(s,{action:'miniEnd',score:1000000},0,35000);assert.equal(s.stock.pearl,pearl);act(s,{action:'reset'},0);act(s,{action:'miniStart',kind:'pearls'},0,40000);act(s,{action:'miniEnd',score:100},0,55000);assert.equal(s.stock.pearl,pearl);
 const stock={...s.stock};act(s,{action:'miniStart',kind:'match'},0,60000);act(s,{action:'miniEnd',cancel:true},0,60001);assert.deepEqual(s.stock,stock);
});
test('a broke shop gets bounded rescue ingredients; two starter recipes and ten-day unlocks stay playable',()=>{
 const s=initialState();s.stock.cup=0;act(s,{action:'rescue'},0);assert.equal(s.stock.cup,2);assert.throws(()=>act(s,{action:'rescue'},0),/một lần/);
 const seen=new Set();let wallet=0,now=10000;for(let day=1;day<=10;day++){
  const unlocked=RECIPES.filter(r=>r.day<=s.day);act(s,{action:'menu',menu:unlocked.map(r=>r.id)},wallet);act(s,{action:'open'},wallet);
  for(let n=0;n<84;n++){now+=5000;advance(s,5,()=>.2);if(s.orders[0]&&!s.drink){const o=s.orders[0],r=RECIPES.find(r=>r.id===o.recipe);for(const k of Object.keys(r.ingredients))if(s.stock[k]<1){wallet+=act(s,{action:'buy',item:k,amount:5},wallet,now);}prepare(s,o,now);wallet+=act(s,{action:'serve'},wallet,now+10000);seen.add(r.id);}}
  act(s,{action:'end'},wallet,now);
 }
 assert.equal(s.day,11);assert.equal(s.history.length,10);assert(wallet>0);assert.equal(RECIPES.filter(r=>r.day<=s.day).length,6);assert(validateState(s));
});
test('match-3 starts without matches, always has a valid move and only adjacent swaps are allowed',()=>{
 for(let n=0;n<100;n++){const b=newBoard();assert.equal(matches(b).length,0);assert(canMove(b));assert(!adjacent(4,5));let move;for(let i=0;i<25&&!move;i++)for(let j=i+1;j<25;j++)if(adjacent(i,j)&&swap(b,i,j).score){move=[i,j];break;}assert(move);const out=swap(b,...move);assert(out.score>=3);assert(canMove(out.board));assert.equal(out.board.length,25);assert(out.board.every(n=>n>=0&&n<4));}
});
test('SQLite commits order, balance and save together; replay, stale tab, restart and shared wallet are safe',async()=>{
 const env=localMerit();try{
  const profile=env.MERIT.get('test'),sql=profile.ctx.storage.sql,s=initialState(),o=makeOrder(s,()=>0);s.stock.cup=35;prepare(s,o,Date.now()-20000);const raw=JSON.stringify(s);sql.exec('CREATE TABLE IF NOT EXISTS tea_save (id INTEGER PRIMARY KEY,data TEXT NOT NULL,backup TEXT NOT NULL)');sql.exec('INSERT INTO tea_save VALUES (?,?,?)',1,raw,raw);
  const id=crypto.randomUUID(),post=(body)=>profile.fetch(new Request('https://internal/tea',{method:'POST',body:JSON.stringify(body)}));
  const body={action:'serve',revision:0,requestId:id,amount:999999};let r=await post(body);assert.equal(r.status,200);let data=await r.json();const earned=data.balance;assert(earned>=8&&earned<=15);assert.equal(data.state.report.served,1);
  r=await post(body);assert.equal((await r.json()).balance,earned);r=await post({...body,requestId:crypto.randomUUID()});assert.equal(r.status,409);
  const refreshed=await (await profile.fetch(new Request('https://internal/tea'))).json();assert.equal(refreshed.state.drink,null);assert.equal(refreshed.balance,earned);
  r=await post({action:'buy',item:'cup',amount:5,revision:1,requestId:crypto.randomUUID()});data=await r.json();assert.equal(data.balance,earned-1);assert.equal(data.state.stock.cup,39);assert.equal(data.state.report.purchases,1);const wallet=await(await profile.fetch(new Request('https://internal/balance'))).json();assert.equal(wallet.balance,data.balance);
  sql.exec('UPDATE tea_save SET data = ? WHERE id = ?','broken JSON',1);data=await(await profile.fetch(new Request('https://internal/tea'))).json();assert.equal(data.state.revision,2);assert.equal(data.balance,earned-1);
 }finally{env.close();}
});
test('failed save rolls back the wallet and concurrent retries only credit one completed order',async()=>{
 const env=localMerit();try{
  const p=env.MERIT.get('rollback'),sql=p.ctx.storage.sql,s=initialState(),o=makeOrder(s,()=>0);prepare(s,o,Date.now()-20000);
  sql.exec('CREATE TABLE IF NOT EXISTS tea_save (id INTEGER PRIMARY KEY,data TEXT NOT NULL,backup TEXT NOT NULL)');const raw=JSON.stringify(s);sql.exec('INSERT INTO tea_save VALUES (?,?,?)',1,raw,raw);
  const id=crypto.randomUUID(),post=requestId=>p.fetch(new Request('https://internal/tea',{method:'POST',body:JSON.stringify({action:'serve',revision:0,requestId})}));
  const exec=sql.exec;sql.exec=(query,...params)=>{if(query.startsWith('INSERT INTO tea_save'))throw Error('Simulated disk failure');return exec(query,...params);};
  assert.equal((await post(id)).status,400);sql.exec=exec;assert.equal(p.balanceData().balance,0);
  let saved=await(await p.fetch(new Request('https://internal/tea'))).json();assert.equal(saved.state.drink.step,8);assert.equal(saved.state.revision,0);
  const results=await Promise.all([post(id),post(crypto.randomUUID())]);assert.deepEqual(results.map(r=>r.status).sort(),[200,409]);
  saved=await(await p.fetch(new Request('https://internal/tea'))).json();assert.equal(saved.state.report.served,1);const balance=saved.balance;
  assert.equal((await(await post(id)).json()).balance,balance);
  sql.exec('UPDATE tea_save SET data = ?,backup = ? WHERE id = ?','{}','broken',1);const corrupt=await p.fetch(new Request('https://internal/tea'));assert.equal(corrupt.status,409);assert.equal(p.balanceData().balance,balance);
 }finally{env.close();}
});
test('owner selection persists with legacy saves, preserves the wallet and survives story reset',async()=>{
 const env=localMerit();try{
  const p=env.MERIT.get('owner'),sql=p.ctx.storage.sql,s=initialState();delete s.ownerGender;assert(validateState(s));
  sql.exec('CREATE TABLE IF NOT EXISTS tea_save (id INTEGER PRIMARY KEY,data TEXT NOT NULL,backup TEXT NOT NULL)');const raw=JSON.stringify(s);sql.exec('INSERT INTO tea_save VALUES (?,?,?)',1,raw,raw);
  const get=async()=>await(await p.fetch(new Request('https://internal/tea'))).json();
  assert.equal((await get()).state.ownerGender,'male');
  const post=(action,props,revision)=>p.fetch(new Request('https://internal/tea',{method:'POST',body:JSON.stringify({action,...props,revision,requestId:crypto.randomUUID()})}));
  assert.equal((await post('owner',{gender:'invalid'},0)).status,400);assert.equal((await get()).state.revision,0);
  let response=await post('owner',{gender:'female'},0);assert.equal(response.status,200);let data=await response.json();assert.equal(data.state.ownerGender,'female');assert.equal(data.balance,0);assert.equal(data.state.economy,0);assert.deepEqual(data.state.stock,s.stock);
  assert.equal((await get()).state.ownerGender,'female');
  response=await post('reset',{},1);data=await response.json();assert.equal(data.state.ownerGender,'female');assert.equal(data.balance,0);assert.deepEqual(data.state.stock,s.stock);
 }finally{env.close();}
});
test('JSON archives are profile-bound, reject economic rollback, and recover safe nonfinancial progress',async()=>{
 const env=localMerit();try{const p=env.MERIT.get('one');let revision=0;async function post(action,props={}){const r=await p.fetch(new Request('https://internal/tea',{method:'POST',body:JSON.stringify({action,...props,revision,requestId:crypto.randomUUID()})}));const d=await r.json();if(r.ok)revision=d.state.revision;return {r,d};}
  const {d:exported}=await post('export');assert(exported.archive.token);await post('settings',{speed:2,relaxed:false});let out=await post('import',{token:exported.archive.token});assert.equal(out.r.status,200);assert.equal(out.d.state.speed,1);
  await post('plant',{slot:0,seed:'black'});out=await post('import',{token:exported.archive.token});assert.equal(out.r.status,409);
  const other=await env.MERIT.get('two').fetch(new Request('https://internal/tea',{method:'POST',body:JSON.stringify({action:'import',token:exported.archive.token,revision:0,requestId:crypto.randomUUID()})}));assert.equal(other.status,409);
 }finally{env.close();}
});
test('HTTP API uses shared merit identity, rejects cross-origin/oversized writes, and fails closed without storage',async()=>{
 const env=localMerit();try{const url='http://example.test/api/tea-shop';const r=await handleTeaRequest(new Request(url),env);assert.equal(r.status,200);const cookie=r.headers.get('Set-Cookie').split(';')[0];
  const denied=await handleTeaRequest(new Request(url,{method:'POST',headers:{Origin:'https://evil.test','Content-Type':'application/json'},body:'{}'}),env);assert.equal(denied.status,403);
  assert.equal((await handleTeaRequest(new Request(url,{method:'POST',headers:{'Content-Type':'application/json'},body:' '.repeat(4097)}),env)).status,413);
  const reward=await handleMeritRequest(new Request('http://example.test/api/merit/reward',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:'{"action":"bow"}'}),env);assert.equal(reward.status,200);
  const shared=await(await handleTeaRequest(new Request(url,{headers:{Cookie:cookie}}),env)).json();assert.equal(shared.balance,1);
  assert.equal((await handleTeaRequest(new Request(url),{})).status,503);
 }finally{env.close();}
});
