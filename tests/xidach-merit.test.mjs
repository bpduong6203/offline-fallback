import test from 'node:test';
import assert from 'node:assert/strict';
import {localMerit} from '../scripts/local-merit.mjs';
import {meritWallet} from '../xi-dach/merit-wallet.js';
import {XiDachService} from '../xi-dach/service.js';
import {autoJoin} from '../src/xi-dach-room.js';
import {handleMeritRequest} from '../src/mebi-merit-api.js';

const cards=(a,b)=>[{rank:a,suit:'♠'},{rank:b,suit:'♥'}];
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
  const changed=await handleMeritRequest(new Request('https://game.mebidev.site/api/merit',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({delta:5000})}),env);
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
  for(const [player,dealer,expected] of [[cards(10,9),cards(10,7),6000],[cards(10,7),cards(10,7),5000],[cards(10,6),cards(10,7),4000]]){
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
