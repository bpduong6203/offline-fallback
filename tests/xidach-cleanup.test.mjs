import test from 'node:test';
import assert from 'node:assert/strict';
import {XiDachService} from '../xi-dach/service.js';

test('offline seats expire, transfer host, and preserve fund accounting',async()=>{
  const s=new XiDachService('ABC234'),a=s.connect(()=>{}),b=s.connect(()=>{});
  await s.receive(a,{type:'hello',name:'A',create:true});await s.receive(b,{type:'hello',name:'B'});
  await s.disconnect(a);const expiry=s.nextAlarm();assert.ok(expiry);
  await s.tick(expiry-1);assert.equal(s.engine.state.players.length,2);
  await s.tick(expiry);assert.equal(s.engine.state.players.length,1);assert.equal(s.engine.state.hostId,b.id);s.engine.assertFunds();
});

test('reconnect cancels expiry; old close does not disconnect the replacement',async()=>{
  const s=new XiDachService('ABC234'),a=s.connect(()=>{});
  await s.receive(a,{type:'hello',name:'A',create:true});const token=s.engine.player(a.id).token;
  await s.disconnect(a);const expiry=s.nextAlarm(),b=s.connect(()=>{});
  await s.receive(b,{type:'hello',token});await s.disconnect(a);await s.tick(expiry);
  assert.equal(s.engine.state.players.length,1);assert.equal(s.nextAlarm(),null);
});

test('expired active wager is paid into wallet before seat removal',async()=>{
  let balance=100,credits=0;
  const wallet={get:async()=>balance,change:async(id,delta)=>{balance+=delta;if(delta>0)credits+=delta;}};
  const s=new XiDachService('ABC234',{wallet}),peer=s.connect(()=>{},()=>{},'wallet');
  await s.receive(peer,{type:'hello',name:'A',create:true});
  const send=(type,extra={})=>s.receive(peer,{type,roomId:'ABC234',roundId:s.engine.state.roundId,actionId:crypto.randomUUID(),...extra});
  await send('open');await send('bet',{amount:10});await send('start');await s.disconnect(peer);
  const p=s.engine.player(peer.id);p.disconnectedAt=Date.now()-60001;
  await s.cleanup();assert.equal(s.engine.state.players.length,1);
  p.cards=[{rank:1,suit:'S'},{rank:1,suit:'H'}];s.engine.state.dealer=[{rank:10,suit:'S'},{rank:8,suit:'H'}];
  s.engine.state.phase='SETTLEMENT';s.engine.state.deadline=Date.now()-1;
  await s.tick();assert.equal(balance,110);assert.equal(credits,20);assert.equal(s.engine.state.players.length,0);s.engine.assertFunds();
});

test('restored legacy lobby expires seats and reports stale tokens',async()=>{
  const s=new XiDachService('ABC234'),a=s.connect(()=>{});
  await s.receive(a,{type:'hello',name:'A',create:true});const token=s.engine.player(a.id).token;
  const restored=new XiDachService('ABC234',{state:structuredClone(s.engine.state)});
  await restored.tick(restored.nextAlarm());assert.equal(restored.engine.state.players.length,0);
  const messages=[],peer=restored.connect(m=>messages.push(m));await restored.receive(peer,{type:'hello',token});
  assert.equal(messages.at(-1).code,'SEAT_EXPIRED');
});
