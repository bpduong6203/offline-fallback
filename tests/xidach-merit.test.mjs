import test from 'node:test';
import assert from 'node:assert/strict';
import {localMerit} from '../scripts/local-merit.mjs';
import {meritWallet} from '../xi-dach/merit-wallet.js';
import {XiDachService} from '../xi-dach/service.js';
import {autoJoin} from '../src/xi-dach-room.js';
import {handleMeritRequest} from '../src/mebi-merit-api.js';

const cards=(...ranks)=>ranks.map((rank,i)=>({rank,suit:i%2?'♥':'♠'}));
test('partial repayment reduces only the chosen principal and charges 1.4 with rounding',async t=>{
  const env=localMerit();t.after(()=>env.close());const id=crypto.randomUUID(),profile=env.MERIT.get(id);
  const post=body=>profile.fetch(new Request('https://internal/balance',{method:'POST',body:JSON.stringify(body)}));
  await post({action:'borrow',requestId:crypto.randomUUID()});
  const requestId=crypto.randomUUID(),body={action:'repay',requestId,principal:13};
  let data=await (await post(body)).json();assert.equal(data.debt,87);assert.equal(data.balance,81);
  data=await (await post(body)).json();assert.equal(data.debt,87);assert.equal(data.balance,81);
  assert.equal((await post({...body,principal:14})).status,409);
  assert.equal((await post({action:'repay',requestId:crypto.randomUUID(),principal:88})).status,409);
  data=await (await post({action:'repay',requestId:crypto.randomUUID(),principal:50})).json();assert.equal(data.debt,37);assert.equal(data.balance,11);
  assert.equal((await post({action:'repay',requestId:crypto.randomUUID(),principal:10})).status,409);
});
test('repay charges principal times 1.4, ignores forged cost and never repeats a completed repayment',async t=>{
  const env=localMerit();t.after(()=>env.close());
  const first=await handleMeritRequest(new Request('https://game.mebidev.site/api/merit'),env),cookie=first.headers.get('Set-Cookie').split(';')[0],id=cookie.split('=')[1];
  const post=body=>handleMeritRequest(new Request('https://game.mebidev.site/api/merit',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify(body)}),env);
  await post({action:'borrow',requestId:crypto.randomUUID()});
  const requestId=crypto.randomUUID();
  assert.equal((await post({action:'repay',requestId,principal:100,cost:1})).status,409);
  assert.equal((await (await post({delta:0})).json()).debt,100);
  await meritWallet(env).change(id,40,'repay-funds');
  const paid=await (await post({action:'repay',requestId,principal:100,cost:1})).json();
  assert.equal(paid.balance,0);assert.equal(paid.debt,0);
  assert.equal((await (await post({action:'repay',requestId,principal:100})).json()).balance,0);
  await post({action:'borrow',requestId:crypto.randomUUID()});
  const replay=await (await post({action:'repay',requestId,principal:100})).json();assert.equal(replay.balance,100);assert.equal(replay.debt,100,'old repayment cannot clear a new loan');
});
test('repayment rounds interest up, rejects stale debt and serializes competing repayments',async t=>{
  const env=localMerit();t.after(()=>env.close());const id=crypto.randomUUID(),profile=env.MERIT.get(id),wallet=meritWallet(env);
  const post=(body,path='balance')=>profile.fetch(new Request('https://internal/'+path,{method:'POST',body:JSON.stringify(body)}));
  await post({action:'borrow',requestId:crypto.randomUUID()});await post({action:'bow'},'reward');
  assert.equal((await post({action:'repay',requestId:crypto.randomUUID(),principal:100})).status,409);
  for(const principal of [0,-1,1.5,'99',10001])assert.equal((await post({action:'repay',requestId:crypto.randomUUID(),principal})).status,400);
  await wallet.change(id,39,'interest-funds');
  const attempts=await Promise.all(Array.from({length:2},()=>post({action:'repay',requestId:crypto.randomUUID(),principal:99})));
  assert.equal(attempts.filter(r=>r.status===200).length,1);assert.equal(attempts.filter(r=>r.status===409).length,1);
  const data=await (await profile.fetch(new Request('https://internal/balance'))).json();assert.equal(data.balance,0);assert.equal(data.debt,0);
});
test('borrow 100 per request, cap outstanding debt at 10000, retry does not double borrow',async t=>{
  const env=localMerit();t.after(()=>env.close());
  const first=await handleMeritRequest(new Request('https://game.mebidev.site/api/merit'),env);
  const cookie=first.headers.get('Set-Cookie').split(';')[0];
  const post=(body,path='/api/merit')=>handleMeritRequest(new Request('https://game.mebidev.site'+path,{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify(body)}),env);
  const firstId=crypto.randomUUID();
  assert.equal((await (await post({action:'borrow',requestId:firstId})).json()).balance,100);
  assert.equal((await (await post({action:'borrow',requestId:firstId})).json()).debt,100);
  const attempts=await Promise.all(Array.from({length:100},()=>post({action:'borrow',requestId:crypto.randomUUID()})));
  assert.equal(attempts.filter(r=>r.ok).length,99);assert.equal(attempts.filter(r=>r.status===409).length,1);
  const replay=await post({action:'borrow',requestId:firstId});assert.equal(replay.status,200);
  assert.deepEqual(await replay.json(),{balance:10000,debt:10000,netBalance:0,canImportLegacy:false});
  const id=cookie.split('=')[1],wallet=meritWallet(env);
  await wallet.change(id,-10000,'spent-loan');
  const temple=await handleMeritRequest(new Request('https://chua.mebidev.site/api/merit',{headers:{Cookie:cookie}}),env);
  assert.equal((await temple.json()).netBalance,-10000);
  const earned=await (await post({action:'bow'},'/api/merit/reward')).json();
  assert.equal(earned.balance,0);assert.equal(earned.debt,9999);assert.equal(earned.netBalance,-9999);
  const cooldown=await (await post({action:'bow'},'/api/merit/reward')).json();
  assert.equal(cooldown.rewarded,false);assert.equal(cooldown.debt,9999);assert.equal(cooldown.netBalance,-9999);
  assert.equal((await post({delta:1000})).status,403,'keep upstream protection against arbitrary rewards');
  env.MERIT.get(id).ctx.storage.sql.exec('UPDATE merit_debt SET debt = ? WHERE id = 1',1);
  const settled=await (await post({action:'incense'},'/api/merit/reward')).json();assert.equal(settled.debt,0);assert.equal(settled.balance,1);
  assert.equal((await post({action:'borrow',requestId:crypto.randomUUID()})).status,200);
});
test('game refunds preserve borrowed spending power; temple rewards repay debt before adding spendable merit',async t=>{
  const env=localMerit();t.after(()=>env.close());const id=crypto.randomUUID();
  const profile=env.MERIT.get(id),wallet=meritWallet(env);
  const response=await profile.fetch(new Request('https://internal/balance',{method:'POST',body:JSON.stringify({action:'borrow',requestId:crypto.randomUUID()})}));
  assert.equal(response.status,200);
  await wallet.change(id,-100,'bet');await wallet.change(id,100,'cancel');
  let result=await (await profile.fetch(new Request('https://internal/balance'))).json();
  assert.equal(result.balance,100);assert.equal(result.debt,100);
  await profile.fetch(new Request('https://internal/reward',{method:'POST',body:JSON.stringify({action:'bow'})}));
  result=await (await profile.fetch(new Request('https://internal/balance'))).json();assert.equal(result.balance,100);assert.equal(result.debt,99);assert.equal(result.netBalance,1);
});
async function setup(t){
  const env=localMerit();t.after(()=>env.close());const wallet=meritWallet(env),id=crypto.randomUUID();
  await wallet.change(id,5000,'seed');let saved;
  const save=async state=>{saved=structuredClone(state);};
  const service=new XiDachService('ABC234',{wallet,save});
  const joined=await (await autoJoin(service,{name:'Player',meritId:id})).json();
  const messages=[],peer=service.connect(m=>messages.push(m),()=>{},id);
  await service.receive(peer,{type:'hello',token:joined.token});
  const message=(type,extra={})=>({roomId:'ABC234',roundId:service.engine.state.roundId,actionId:crypto.randomUUID(),type,...extra});
  return {env,wallet,id,service,peer,messages,message,save,saved:()=>saved};
}
test('shared merit API preserves signed anonymous cookie across subdomains and isolates another browser',async t=>{
  const env={...localMerit(),HOME_SESSION_SECRET:'test-secret'};t.after(()=>env.close());
  const first=await handleMeritRequest(new Request('https://game.mebidev.site/api/merit'),env);
  assert.equal((await first.json()).balance,0);
  const setCookie=first.headers.get('Set-Cookie');assert.match(setCookie,/Domain=mebidev.site/);
  const cookie=setCookie.split(';')[0];
  const changed=await handleMeritRequest(new Request('https://game.mebidev.site/api/merit',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({delta:5000,legacyImport:true})}),env);
  assert.equal((await changed.json()).balance,5000);
  const other=await handleMeritRequest(new Request('https://chua.mebidev.site/api/merit',{headers:{Cookie:cookie}}),env);
  assert.equal((await other.json()).balance,5000);assert.equal(other.headers.get('Set-Cookie'),null);
  const independent=await handleMeritRequest(new Request('https://chua.mebidev.site/api/merit'),env);
  assert.equal((await independent.json()).balance,0);
});
test('shared merit receipts are atomic, idempotent and reject insufficient funds',async t=>{
  const {wallet,id}=await setup(t);
  assert.equal(await wallet.change(id,-2000,'same-bet'),3000);
  assert.equal(await wallet.change(id,-2000,'same-bet'),3000);
  await assert.rejects(()=>wallet.change(id,-4000,'too-large'),/Không đủ/);
  assert.equal(await wallet.get(id),3000);
  const attempts=await Promise.allSettled([wallet.change(id,-2000,'competing-one'),wallet.change(id,-2000,'competing-two')]);
  assert.equal(attempts.filter(r=>r.status==='fulfilled').length,1);assert.equal(await wallet.get(id),1000);
});
test('bets, replacements, cancellation and external spending use the shared wallet',async t=>{
  const {service,peer,message,wallet,id,messages}=await setup(t);
  assert.equal(service.engine.player(peer.id).balance,5000,'no 100000 signup credit');
  const bet=message('bet',{amount:1000});await service.receive(peer,bet);await service.receive(peer,bet);
  assert.equal(await wallet.get(id),4000);
  await service.receive(peer,message('bet',{amount:2000}));assert.equal(await wallet.get(id),3000);
  await service.receive(peer,message('cancel'));assert.equal(await wallet.get(id),5000);
  await wallet.change(id,-5000,'other-game');
  await service.receive(peer,message('bet',{amount:1000}));
  assert.equal(service.engine.player(peer.id).bet,0);assert.equal(await wallet.get(id),0);
  assert.match(messages.findLast(m=>m.type==='error').message,/Không đủ/);
});
test('a wallet with 16 merit can bet 10 and cancel for a full refund',async t=>{
  const {service,peer,message,wallet,id}=await setup(t);
  await wallet.change(id,-4984,'prepare-low-balance');
  await service.receive(peer,message('bet',{amount:10}));
  assert.equal(await wallet.get(id),6);assert.equal(service.engine.player(peer.id).bet,10);
  await service.receive(peer,message('cancel'));assert.equal(await wallet.get(id),16);
});
test('a lost debit response recovers from persisted intent without spending twice',async t=>{
  const {service,peer,message,wallet,id,save,saved}=await setup(t);
  let fail=true;service.wallet={...wallet,async change(...args){const value=await wallet.change(...args);if(fail){fail=false;throw new Error('Lost response');}return value;}};
  const bet=message('bet',{amount:1000});await service.receive(peer,bet);
  assert.equal(await wallet.get(id),4000);assert.ok(saved().pendingMerit);
  const restored=new XiDachService('ABC234',{state:saved(),wallet,save});await restored.tick();
  assert.equal(await wallet.get(id),4000);assert.equal(restored.engine.state.pendingMerit,undefined);
  assert.equal(restored.engine.player(peer.id).bet,1000);
});
test('win/tie/loss settlement credits correct amount and recovers a lost payout exactly once',async t=>{
  for(const [player,dealer,expected] of [[cards(10,9),cards(10,7),6000],[cards(10,7),cards(10,7),5000],[cards(10,10,2),cards(10,10,3),5000],[cards(10,6),cards(10,7),4000]]){
    const {service,peer,message,wallet,id,save,saved}=await setup(t);
    await service.receive(peer,message('bet',{amount:1000}));
    const p=service.engine.player(peer.id);p.cards=player;
    Object.assign(service.engine.state,{participants:[p.id],dealer,phase:'SETTLEMENT',deadline:Date.now()-1});
    let fail=true;service.wallet={...wallet,async change(...args){const value=await wallet.change(...args);if(fail){fail=false;throw new Error('Lost payout');}return value;}};
    try{await service.tick();}catch{}
    const restored=new XiDachService('ABC234',{state:saved(),wallet,save});await restored.tick();
    assert.equal(await wallet.get(id),expected);await restored.tick();assert.equal(await wallet.get(id),expected);
    assert.equal(restored.engine.player(peer.id).bet,0);restored.engine.assertFunds();
  }
});
