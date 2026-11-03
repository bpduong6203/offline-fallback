import test from 'node:test';
import assert from 'node:assert/strict';
import {initialState,makeOrder,act} from '../tea-shop/engine.js';
import {localMerit} from '../scripts/local-merit.mjs';

function fixture(){const s=initialState();s.open=true;s.orders=[makeOrder(s,()=>0)];return s;}
function rejectedWithoutChange(s,body){const before=structuredClone(s);assert.throws(()=>act(s,body,100,20000),/tạm dừng|đóng minigame/);assert.deepEqual(s,before);}

test('pause blocks receiving, every preparation step, quick preparation, discarding and serving without side effects',()=>{
 const s=fixture();s.paused=true;rejectedWithoutChange(s,{action:'start',id:s.orders[0].id});
 act(s,{action:'pause'},0);act(s,{action:'start',id:s.orders[0].id},0,0);act(s,{action:'pause'},0);
 for(const [kind,value]of [['cup',true],['tea','black'],['milk',true],['sugar',0],['ice',0],['topping','none'],['mix',true],['lid',true]]){
  rejectedWithoutChange(s,{action:'step',kind,value});
  act(s,{action:'pause'},0);act(s,{action:'step',kind,value},0,0);act(s,{action:'pause'},0);
 }
 s.practice={brew:3,shake:3};rejectedWithoutChange(s,{action:'quick'});rejectedWithoutChange(s,{action:'discard'});rejectedWithoutChange(s,{action:'serve'});
 act(s,{action:'pause'},0);assert(act(s,{action:'serve'},0,20000)>0);assert.equal(s.report.served,1);
});

test('brewing minigames cannot bypass pause, cancellation still works, and active minigames lock service',()=>{
 const s=fixture();s.paused=true;
 for(const kind of ['brew','shake','syrup'])rejectedWithoutChange(s,{action:'miniStart',kind});
 act(s,{action:'pause'},0);act(s,{action:'miniStart',kind:'shake'},0,0);
 rejectedWithoutChange(s,{action:'start',id:s.orders[0].id});
 act(s,{action:'pause'},0);rejectedWithoutChange(s,{action:'miniEnd',score:100});
 act(s,{action:'miniEnd',cancel:true},0,20000);assert.equal(s.mini,null);assert(s.paused);assert.deepEqual(s.tasks,{});
});

test('direct API requests while paused do not deduct stock, advance the save or credit the shared wallet',async()=>{
 const env=localMerit();try{
  const profile=env.MERIT.get('pause'),sql=profile.ctx.storage.sql,s=fixture();
  act(s,{action:'start',id:s.orders[0].id},0,0);s.drink.step=8;s.paused=true;
  sql.exec('CREATE TABLE IF NOT EXISTS tea_save (id INTEGER PRIMARY KEY,data TEXT NOT NULL,backup TEXT NOT NULL)');const raw=JSON.stringify(s);sql.exec('INSERT INTO tea_save VALUES (?,?,?)',1,raw,raw);
  for(const body of [{action:'start',id:s.orders[0].id},{action:'step',kind:'lid'},{action:'quick'},{action:'discard'},{action:'serve'},{action:'miniStart',kind:'shake'}]){
   const response=await profile.fetch(new Request('https://internal/tea',{method:'POST',body:JSON.stringify({...body,revision:0,requestId:crypto.randomUUID()})}));assert.equal(response.status,400);assert.match((await response.json()).error,/tạm dừng/);
   const data=await(await profile.fetch(new Request('https://internal/tea'))).json();assert.deepEqual(data.state,s);assert.equal(data.balance,0);
  }
 }finally{env.close();}
});
