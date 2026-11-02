import test from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {readFile} from 'node:fs/promises';
import {MERIT_CLIENT_SCRIPT,handleMeritRequest} from '../src/mebi-merit-api.js';
import {localMerit} from '../scripts/local-merit.mjs';
import {meritWallet} from '../xi-dach/merit-wallet.js';

test('shared client and actual temple counter show negative net merit and update when an action earns merit',async t=>{
  const env=localMerit();t.after(()=>env.close());let cookie='';
  const window=new EventTarget(),counter={textContent:'',title:''};
  const context=vm.createContext({window,CustomEvent,localStorage:{getItem:()=>null},toast:()=>{},$:()=>counter,
    fetch:async(path,options={})=>{
      const headers=new Headers(options.headers);if(cookie)headers.set('Cookie',cookie);
      const result=await handleMeritRequest(new Request('https://chua.mebidev.site'+path,{...options,headers}),env);
      if(result.headers.has('Set-Cookie'))cookie=result.headers.get('Set-Cookie').split(';')[0];return result;
    }});
  vm.runInContext(MERIT_CLIENT_SCRIPT,context);const merit=window.MebiMerit;await merit.ready;
  await merit.borrow(crypto.randomUUID());assert.equal(merit.get(),100);assert.equal(merit.getDebt(),100);
  await meritWallet(env).change(cookie.split('=')[1],-100,'spent-loan');await merit.change(0);
  const temple=await readFile(new URL('../src/page/games/chua-mebi.html',import.meta.url),'utf8');
  const start=temple.indexOf('const renderTempleMerit = () =>');
  const end=temple.indexOf('const keys =',start);
  assert.ok(start>0&&end>start);
  vm.runInContext('let bows=0;'+temple.slice(start,end)+';renderTempleMerit();window.earnMerit=rewardMerit;',context);
  assert.equal(counter.textContent,-100);assert.match(counter.title,/100/);
  window.earnMerit('bow');await merit.change(0);
  assert.equal(counter.textContent,-99);assert.equal(merit.get(),0);assert.equal(merit.getDebt(),99);
  await meritWallet(env).change(cookie.split('=')[1],139,'repayment-funds');await merit.change(0);
  const original=context.fetch;let loseResponse=true;
  context.fetch=async(path,options)=>{const response=await original(path,options);if(options?.body&&JSON.parse(options.body).action==='repay'&&loseResponse){loseResponse=false;throw new Error('Lost repayment response');}return response;};
  const requestId=crypto.randomUUID();await assert.rejects(()=>merit.repay(requestId,99),/Lost repayment/);
  await merit.repay(requestId,99);assert.equal(merit.get(),0);assert.equal(merit.getDebt(),0);assert.equal(counter.textContent,0);
});
