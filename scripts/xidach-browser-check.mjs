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
  async function page(mobile=false,route='/xi-dach'){
    const {browserContextId}=await send('Target.createBrowserContext');const {targetId}=await send('Target.createTarget',{url:'about:blank',browserContextId});const {sessionId}=await send('Target.attachToTarget',{targetId,flatten:true});
    await send('Page.enable',{},sessionId);await send('Runtime.enable',{},sessionId);
    if(mobile)await send('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true},sessionId);
    // Test instrumentation observes network messages without changing game code.
    await send('Page.addScriptToEvaluateOnNewDocument',{source:`window.__snap=null;window.__welcome=null;window.__errors=[];const Native=window.WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);this.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.type==='snapshot')window.__snap=m.state;if(m.type==='welcome')window.__welcome=m;if(m.type==='error')window.__errors.push(m.message);});}};`},sessionId);
    const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},sessionId);if(r.exceptionDetails)throw new Error(r.exceptionDetails.text);return r.result.value;};
    const click=selector=>evaluate(`(()=>{const b=document.querySelector(${JSON.stringify(selector)});if(!b||b.disabled)return false;b.click();return true;})()`);
    await send('Page.navigate',{url:base+route},sessionId);await until(()=>evaluate(route==='/xi-dach'?`document.querySelectorAll('#avatars button').length===8`:`!!document.getElementById('mebi-shared-chat')?.shadowRoot`),'client ready');
    return {sessionId,evaluate,click,send:(method,params)=>send(method,params,sessionId)};
  }
  const a=await page(),b=await page(true);
  for(const p of [a,b]){await p.evaluate('window.MebiMerit.ready');assert.equal(await p.evaluate('window.MebiMerit.get()'),0);await p.evaluate("fetch('/api/merit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({delta:100000,legacyImport:true})}).then(()=>window.MebiMerit.change(0))");assert.equal(await p.evaluate("document.getElementById('meritBalance').textContent.includes('100.000')"),true);}
  await a.evaluate(`document.getElementById('name').value='Chủ bàn';document.getElementById('joinButton').click()`);
  const room=await until(()=>a.evaluate('window.__snap?.roomId'),'create');
  await b.evaluate(`document.getElementById('name').value='Bạn mobile';document.getElementById('joinButton').click()`);
  await until(()=>a.evaluate('window.__snap?.players.length===2'),'two joined');
  await until(()=>b.evaluate(`window.__snap?.phase==='BETTING'`),'betting');
  await a.click('#confirmBet');await b.click('[data-bet="20"]');await b.click('#confirmBet');
  await until(()=>a.evaluate('window.__snap?.players.every(p=>p.bet>0)'),'two bets');
  for(const p of [a,b])assert.equal(await p.evaluate(`(()=>{const r=document.getElementById('confirmBet').getBoundingClientRect();return r.top>=0&&r.bottom<=innerHeight;})()`),true,'bet visible without scrolling');
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
    },'complete round with '+count,35000);
  }
  await playBrowsers(2);
  for(const p of [a,b])await until(()=>p.evaluate("window.MebiMerit.get()===window.__snap.players.find(p=>p.id===window.__welcome.id).balance"),'shared balance after settlement');
  assert.equal(await a.evaluate('window.__snap.results.length'),2);
  console.log('PASS automatic matching, visible bets, turns, payouts and reload/reconnect');
  // Fill the same room to eight using six real WebSocket clients.
  for(let i=0;i<6;i++){
    const initial=await fetch(base+'/api/merit');const cookie=initial.headers.get('set-cookie').split(';')[0];
    await fetch(base+'/api/merit',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({delta:100000,legacyImport:true})});
    const match=await (await fetch(base+'/__game/xi-dach/match',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({name:'Player '+i})})).json();assert.equal(match.room,room);
    const ws=new NodeWebSocket(base.replace('http','ws')+'/__game/xi-dach/ws?room='+room,{headers:{Cookie:cookie}});const peer={ws,id:null,state:null};extra.push(peer);
    ws.on('message',raw=>{const m=JSON.parse(raw);if(m.type==='welcome')peer.id=m.id;if(m.type==='snapshot'){peer.state=m.state;const p=m.state.players.find(p=>p.id===peer.id);if(m.state.phase==='PLAYER_TURNS'&&m.state.turnId===peer.id){ws.send(JSON.stringify({type:p.hand.total>=16?'stand':'hit',roomId:room,roundId:m.state.roundId,actionId:crypto.randomUUID()}));}}});
    await new Promise(resolve=>ws.once('open',resolve));ws.send(JSON.stringify({type:'hello',token:match.token}));await until(()=>peer.id,'extra peer');
  }
  await until(()=>a.evaluate('window.__snap.players.length===8'),'eight seats');
  const ninth=new NodeWebSocket(base.replace('http','ws')+'/__game/xi-dach/ws?room='+room);await new Promise(resolve=>ninth.once('open',resolve));let refusal='';ninth.on('message',raw=>{const m=JSON.parse(raw);if(m.type==='error')refusal=m.message;});ninth.send(JSON.stringify({type:'hello',name:'Người thứ 9'}));await until(()=>refusal,'ninth refused');assert.match(refusal,/8 người/);ninth.close();
  const ninthMatch=await (await fetch(base+'/__game/xi-dach/match',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name:'Room two'})})).json();
  assert.notEqual(ninthMatch.room,room,'ninth player automatically enters another room');
  await until(()=>a.evaluate(`window.__snap.phase==='BETTING'`),'next betting');await a.click('#confirmBet');await b.click('#confirmBet');
  for(const p of extra){await until(()=>p.state?.phase==='BETTING','extra betting');p.ws.send(JSON.stringify({type:'bet',amount:3000,roomId:room,roundId:p.state.roundId,actionId:crypto.randomUUID()}));}
  await until(()=>a.evaluate('window.__snap.players.every(p=>p.bet>0)'),'eight bets');await playBrowsers(8);
  const snap=await a.evaluate('window.__snap');assert.equal(snap.fund+snap.players.reduce((sum,p)=>sum+p.balance+2*p.bet,0),10800000);assert.equal(snap.results.length,8);
  assert.equal(await b.evaluate('document.documentElement.scrollWidth<=innerWidth'),true,'mobile must not overflow horizontally');
  assert.ok(await b.evaluate(`document.querySelector('#self .card').getBoundingClientRect().height>=49`));
  assert.equal(await b.evaluate(`getComputedStyle(document.getElementById('results')).overflowY`),'auto');
  await pause(650);
  const shot=await b.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(new URL('../dist/xi-dach/mobile-check.png',import.meta.url),Buffer.from(shot.data,'base64'));
  await a.send('Emulation.setDeviceMetricsOverride',{width:1440,height:1080,deviceScaleFactor:1,mobile:false});
  const desktop=await a.send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});await writeFile(new URL('../dist/xi-dach/desktop-check.png',import.meta.url),Buffer.from(desktop.data,'base64'));
  for(const p of [a,b]){assert.deepEqual(await p.evaluate('window.__errors'),[]);assert.equal(await p.evaluate(`document.body.innerText.includes('chip')`),false);}
  const c=await page(false,'/uno');
  for(const p of [a,c]){
    await p.send('Page.bringToFront');
    await until(()=>p.evaluate("!!document.getElementById('mebi-shared-chat')?.shadowRoot"),'chat mounted');
    await p.evaluate("document.getElementById('mebi-shared-chat').shadowRoot.getElementById('launch').click()");
    await until(()=>p.evaluate("!document.getElementById('mebi-shared-chat').shadowRoot.getElementById('send').disabled"),'chat connected');
  }
  const sendChat=(p,name,text)=>p.evaluate(`(()=>{const r=document.getElementById('mebi-shared-chat').shadowRoot;r.getElementById('name').value=${JSON.stringify(name)};r.getElementById('text').value=${JSON.stringify(text)};r.querySelector('form').requestSubmit();})()`);
  await sendChat(a,'Xi Dach','<img src=x onerror=alert(1)> Across games');
  await until(()=>c.evaluate("document.getElementById('mebi-shared-chat').shadowRoot.getElementById('messages').textContent.includes('Across games')"),'UNO receives Xi Dach chat');
  assert.equal(await c.evaluate("document.getElementById('mebi-shared-chat').shadowRoot.getElementById('messages').querySelector('img')===null"),true,'message is plain text');
  await sendChat(c,'UNO','Reply from UNO');await a.send('Page.bringToFront');
  await until(()=>a.evaluate("document.getElementById('mebi-shared-chat').shadowRoot.getElementById('messages').textContent.includes('Reply from UNO')"),'Xi Dach receives UNO reply');
  await b.send('Page.bringToFront');await b.evaluate("document.getElementById('mebi-shared-chat').shadowRoot.getElementById('launch').click()");
  assert.equal(await b.evaluate("(()=>{const p=document.getElementById('mebi-shared-chat').shadowRoot.getElementById('panel').getBoundingClientRect();return p.left>=0&&p.right<=innerWidth&&p.bottom<=innerHeight;})()"),true,'mobile chat fits viewport');
  await b.evaluate("window.__chatKeys=0;window.addEventListener('keydown',()=>window.__chatKeys++);document.getElementById('mebi-shared-chat').shadowRoot.getElementById('text').dispatchEvent(new KeyboardEvent('keydown',{key:'w',code:'KeyW',bubbles:true,composed:true}));");
  assert.equal(await b.evaluate('window.__chatKeys'),0,'typing in chat must not trigger game controls');
  for(const p of [a,b,c])await p.evaluate("document.getElementById('mebi-shared-chat').shadowRoot.getElementById('close').click()");
  await a.send('Page.bringToFront');console.log('PASS shared chat across Xi Dach and UNO, mobile layout and isolated keyboard events');
  const beforeLoan=await a.evaluate('window.MebiMerit.get()');
  assert.equal(await a.click('#borrowMerit'),true);
  await until(()=>a.evaluate('window.MebiMerit.getDebt()===100'),'loan applied');
  assert.equal(await a.evaluate('window.MebiMerit.get()'),beforeLoan+100);
  await a.send('Page.reload');await until(()=>a.evaluate('window.__welcome?.id&&window.MebiMerit?.getDebt()===100'),'loan survives reload');
  for(let i=1;i<100;i++){
    assert.equal(await a.click('#borrowMerit'),true);
    await until(()=>a.evaluate(`window.MebiMerit.getDebt()===${(i+1)*100}&&!document.getElementById('borrowMerit').textContent.includes('Đang')`),'loan '+(i+1));
  }
  assert.equal(await a.evaluate("document.getElementById('borrowMerit').disabled"),true);
  const beforeReward=await a.evaluate('window.MebiMerit.get()');await a.evaluate("window.MebiMerit.reward('bow')");
  assert.equal(await a.evaluate('window.MebiMerit.getDebt()'),9999);
  assert.equal(await a.evaluate('window.MebiMerit.get()'),beforeReward);
  console.log('PASS borrow 100, persisted debt, 10000 cap and temple rewards repay debt');
  await a.send('Network.enable');await a.send('Network.setBlockedURLs',{urls:['*/api/merit']});
  await a.evaluate("window.dispatchEvent(new Event('focus'))");await until(()=>a.evaluate("document.getElementById('toast').textContent.includes('mới nhất')"),'visible merit API error');
  await a.send('Network.setBlockedURLs',{urls:[]});await a.evaluate("window.dispatchEvent(new Event('focus'))");
  assert.deepEqual(errors,[]);console.log('PASS eight real players + dealer: full round, ninth refused, conserved eggs, desktop/mobile, no runtime errors');
  console.log('Screenshots: dist/xi-dach/mobile-check.png, dist/xi-dach/desktop-check.png');
}finally{for(const p of extra)p.ws.terminate();socket?.close();chrome.kill();await app.close();console.log('Temporary browser profile: '+profile);}
