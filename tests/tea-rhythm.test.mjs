import test from 'node:test';
import assert from 'node:assert/strict';
import {createRhythm,tapRhythm} from '../tea-shop/rhythm.js';
import {initialState,makeOrder,act} from '../tea-shop/engine.js';

test('shake accepts alternating timed taps, reports wrong timing/side and cannot score twice in a beat',()=>{
 const s=createRhythm();assert.equal(tapRhythm(s,'left',0).reason,'timing');assert.equal(s.hits,0);
 assert.equal(tapRhythm(s,'right',.5).reason,'side');assert.equal(s.nextSide,'left');
 assert(tapRhythm(s,'left',.5).accepted);assert.equal(s.hits,1);assert(s.score>0);assert.equal(s.nextSide,'right');
 const score=s.score;assert.equal(tapRhythm(s,'right',.55).reason,'duplicate');assert.equal(s.score,score);
 assert(tapRhythm(s,'right',1.5).accepted);assert.equal(s.hits,2);
 const perfect=createRhythm();for(let i=0;i<8;i++)assert(tapRhythm(perfect,i%2?'right':'left',i+.5).accepted);assert.equal(perfect.score,100);
 assert.equal(tapRhythm(createRhythm(),'left',.7).accepted,false);assert(tapRhythm(createRhythm(),'left',.7,true).accepted);
});

test('finishing a shake during mixing advances only that drink to lid once and cancellation does not mix',()=>{
 for(const cancel of [false,true]){
  const s=initialState(),o=makeOrder(s,()=>0);s.orders=[o];act(s,{action:'start',id:o.id},0,0);
  for(const [kind,value]of [['cup',true],['tea','black'],['milk',true],['sugar',0],['ice',0],['topping','none']])act(s,{action:'step',kind,value},0,0);
  const stock={...s.stock};act(s,{action:'miniStart',kind:'shake'},0,0);assert.equal(s.mini.orderId,o.id);
  act(s,{action:'miniEnd',score:100,cancel},0,11000);assert.equal(s.drink.step,cancel?6:7);assert.deepEqual(s.stock,stock);
  if(!cancel){assert.equal(s.drink.quality,80);assert.throws(()=>act(s,{action:'step',kind:'mix'},0,11000),/thứ tự/);}
 }
 const s=initialState();act(s,{action:'miniStart',kind:'shake'},0,0);act(s,{action:'miniEnd',score:100},0,11000);assert.equal(s.drink,null);
});
