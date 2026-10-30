import {spawn} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {WebSocket as NodeWebSocket} from 'ws';
import {localServer} from './local-server.mjs';

const pause=ms=>new Promise(r=>setTimeout(r,ms));
async function until(fn,label,timeout=15000){const start=Date.now();while(Date.now()-start<timeout){const value=await fn();if(value)return value;await pause(80);}throw new Error('Timeout: '+label);}
const browser=process.env.CHROME_PATH||['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe'].find(existsSync);
if(!browser)throw new Error('Cần Chrome hoặc Edge để chạy kiểm thử trình duyệt.');
const profile=await mkdtemp(path.join(tmpdir(),'xidach-browser-')),app=localServer(()=>'<p>Local test</p>');
await new Promise(resolve=>app.server.listen(0,'127.0.0.1',resolve));
const base=`http://127.0.0.1:${app.server.address().port}`;
const chrome=spawn(browser,['--headless','--no-sandbox','--disable-gpu','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
let socket;const extra=[];
try{
  const endpoint=await new Promise((resolve,reject)=>{let out='';const timeout=setTimeout(()=>reject(new Error('Chrome startup timeout')),15000);chrome.once('error',reject);chrome.stderr.on('data',data=>{out+=data;const m=out.match(/DevTools listening on (ws:\/\/\S+)/);if(m){clearTimeout(timeout);resolve(m[1]);}});});
  socket=new WebSocket(endpoint);await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
  let seq=0;const pending=new Map(),errors=[];
  socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.id&&pending.has(m.id)){const p=pending.get(m.id);pending.delete(m.id);clearTimeout(p.timer);m.error?p.reject(new Error(m.error.message)):p.resolve(m.result);}});
  const send=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq;const timer=setTimeout(()=>{pending.delete(id);reject(new Error('CDP timeout '+method));},15000);pending.set(id,{resolve,reject,timer});socket.send(JSON.stringify({id,method,params,sessionId}));});
  async function page(mobile=false){
    const {browserContextId}=await send('Target.createBrowserContext');const {targetId}=await send('Target.createTarget',{url:'about:blank',browserContextId});const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
    await send('Page.enable',{},sessionId);await send('Runtime.enable',{},sessionId);
    if(mobile)await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},sessionId);
    // Test instrumentation observes network messages without changing game code.
    await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__snap=null;window.__welcome=null;window.__errors=[];const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);this.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.type==='snapshot')window.__snap=m.state;if(m.type==='welcome')window.__welcome=m;if(m.type==='error')window.__errors.push(m.message);});}};`},sessionId);
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},sessionId);if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);return r.result.value;};
    const click=selector=>evaluate(`(()=>{const b=document.querySelector(${JSON.stringify(selector)});if(!b||b.disabled)return false;b.click();return true;})()`);
    await send('Page.navigate',{url:base+'/xi-dach'},sessionId);await until(()=>evaluate(`document.querySelectorAll('#avatars button').length===8`),'client ready');
    return {sessionId,evaluate,click,send:(method,params)=>send(method,params,sessionId)};
  }
  const a=await page(),b=await page(true);
  await a.evaluate(`document.getElementById('name').value='Chủ bàn';document.getElementById('createButton').click()`);
  const room=await until(()=>a.evaluate('window.__snap?.roomId'),'create');
  await b.evaluate(`document.getElementById('name').value='Bạn mobile';document.getElementById('roomCode').value='${room}';document.getElementById('joinButton').click()`);
  await until(()=>a.evaluate('window.__snap?.players.length===2'),'two joined');
  assert.equal(await a.click('[data-action="open"]'),true);
  await until(()=>b.evaluate(`window.__snap?.phase==='BETTING'`),'betting');
  await a.click('#confirmBet');await b.click('[data-bet="2000"]');await b.click('#confirmBet');
  await until(()=>a.evaluate('window.__snap?.players.every(p=>p.bet>0)'),'two bets');
  await a.click('[data-action="start"]');
  await until(()=>a.evaluate(`window.__snap?.phase==='DEALING'`),'dealing');
  const before=await b.evaluate('({id:window.__welcome.id,balance:window.__snap.players.find(p=>p.id===window.__welcome.id).balance})');
  await b.send('Page.reload');await until(()=>b.evaluate('window.__welcome?.id&&window.__snap?.players.length===2'),'reconnect');
  assert.equal(await b.evaluate('window.__welcome.id'),before.id);
  assert.equal(await b.evaluate('window.__snap.players.find(p=>p.id===window.__welcome.id).balance'),before.balance);
  const hidden=await a.evaluate('window.__snap.players.filter(p=>p.id!==window.__welcome.id).every(p=>!p.cards&&!p.hand)');assert.equal(hidden,true);
  async function playBrowsers(count){
    await until(async()=>{
      for(const p of [a,b]){const turn=await p.evaluate(`window.__snap?.phase==='PLAYER_TURNS'&&window.__snap.turnId===window.__welcome?.id`);if(turn){const total=await p.evaluate('window.__snap.players.find(p=>p.id===window.__welcome.id).hand.total');await p.click(total>=16?'[data-action="stand"]':'[data-action="hit"]');}}
      return a.evaluate(`window.__snap?.phase==='ROUND_END'&&window.__snap.results.length===${count}`);
    },'complete round with '+count,30000);
  }
  await playBrowsers(2);assert.equal(await a.evaluate('window.__snap.results.length'),2);
  console.log('PASS two isolated browser sessions: create/join, bets, turns, payouts and reload/reconnect');
  // Fill the same room to eight using six real WebSocket clients.
  for(let i=0;i<6;i++){
    const ws=new NodeWebSocket(base.replace('http','ws')+'/__game/xi-dach/ws?room='+room);const peer={ws,id:null,state:null};extra.push(peer);
    ws.on('message',raw=>{const m=JSON.parse(raw);if(m.type==='welcome')peer.id=m.id;if(m.type==='snapshot'){peer.state=m.state;const p=m.state.players.find(p=>p.id===peer.id);if(m.state.phase==='PLAYER_TURNS'&&m.state.turnId===peer.id){ws.send(JSON.stringify({type:p.hand.total>=16?'stand':'hit',roomId:room,roundId:m.state.roundId,actionId:crypto.randomUUID()}));}}});
    await new Promise(resolve=>ws.once('open',resolve));ws.send(JSON.stringify({type:'hello',name:'Bạn '+(i+3),avatar:i}));await until(()=>peer.id,'extra peer');
  }
  await until(()=>a.evaluate('window.__snap.players.length===8'),'eight seats');
  const ninth=new NodeWebSocket(base.replace('http','ws')+'/__game/xi-dach/ws?room='+room);await new Promise(resolve=>ninth.once('open',resolve));let refusal='';ninth.on('message',raw=>{const m=JSON.parse(raw);if(m.type==='error')refusal=m.message;});ninth.send(JSON.stringify({type:'hello',name:'Người thứ 9'}));await until(()=>refusal,'ninth refused');assert.match(refusal,/8 người/);ninth.close();
  if(await a.evaluate(`window.__snap.phase==='ROUND_END'`))await a.click('[data-action="next"]');
  await until(()=>a.evaluate(`window.__snap.phase==='BETTING'`),'next betting');await a.click('#confirmBet');await b.click('#confirmBet');
  for(const p of extra){await until(()=>p.state?.phase==='BETTING','extra betting');p.ws.send(JSON.stringify({type:'bet',amount:3000,roomId:room,roundId:p.state.roundId,actionId:crypto.randomUUID()}));}
  await until(()=>a.evaluate('window.__snap.players.every(p=>p.bet>0)'),'eight bets');await a.click('[data-action="start"]');await playBrowsers(8);
  const snap=await a.evaluate('window.__snap');assert.equal(snap.fund+snap.players.reduce((sum,p)=>sum+p.balance+2*p.bet,0),10800000);assert.equal(snap.results.length,8);
  assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'mobile must not overflow horizontally');
  assert.ok(await b.evaluate(`document.querySelector('#self .card').getBoundingClientRect().height>=74`));
  assert.equal(await b.evaluate(`getComputedStyle(document.getElementById('results')).overflowY`),'auto');
  await pause(650);
  const shot=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(new URL('../dist/xi-dach/mobile-check.png',import.meta.url),Buffer.from(shot.data,'base64'));
  await a.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false});
  const desktop=await a.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(new URL('../dist/xi-dach/desktop-check.png',import.meta.url),Buffer.from(desktop.data,'base64'));
  for(const p of [a,b]){assert.deepEqual(await p.evaluate('window.__errors'),[]);assert.equal(await p.evaluate(`document.body.innerText.includes('chip')`),false);}
  assert.deepEqual(errors,[]);console.log('PASS eight real players + dealer: full round, ninth refused, conserved eggs, desktop/mobile, no runtime errors');
  console.log('Screenshots: dist/xi-dach/mobile-check.png, dist/xi-dach/desktop-check.png');
}finally{for(const p of extra)p.ws.terminate();socket?.close();chrome.kill();await app.close();console.log('Temporary browser profile: '+profile);}
