import {spawn} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {localServer} from './local-server.mjs';
import {build} from './build.mjs';
const html=await build(),profile=await mkdtemp(path.join(tmpdir(),'stickman-online-'));
const app=localServer(()=>html);await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
const chrome=spawn(process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless','--no-sandbox','--disable-gpu','--no-first-run','--disable-background-timer-throttling','--disable-renderer-backgrounding','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
const sessions=[],errors=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 const endpoint=await new Promise((resolve,reject)=>{let data='';const timer=setTimeout(()=>reject(Error('Chrome startup timeout')),15000);chrome.on('error',reject);chrome.stderr.on('data',c=>{data+=c;const m=data.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(timer);resolve(m[1]);}});});
 const base=`http://127.0.0.1:${new URL(endpoint).port}`;
 async function session(target){const socket=new WebSocket(target.webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let seq=0;const pending=new Map();
  socket.addEventListener('message',e=>{const m=JSON.parse(e.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p?.reject(m.error);else p?.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
  const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,t=setTimeout(()=>reject(Error('CDP timeout '+method)),8000);pending.set(id,{resolve:r=>{clearTimeout(t);resolve(r);},reject:e=>{clearTimeout(t);reject(e);}});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const result={socket,cdp,evaluate,snapshot:()=>evaluate('window.stickmanSnapshot'),click:id=>evaluate(`document.getElementById(${JSON.stringify(id)}).click()`),down:code=>cdp('Input.dispatchKeyEvent',{type:'keyDown',code,key:code}),up:code=>cdp('Input.dispatchKeyEvent',{type:'keyUp',code,key:code})};sessions.push(result);await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Emulation.setFocusEmulationEnabled',{enabled:true});return result;
 }
 async function until(predicate,label){for(let i=0;i<120;i++){if(await predicate())return;await wait(50);}throw Error('Timeout '+label+'; runtime='+JSON.stringify(errors));}
 const first=(await fetch(base+'/json').then(r=>r.json())).find(p=>p.type==='page'),a=await session(first);
 async function page(){const target=await a.cdp('Target.createTarget',{url:'about:blank'});const list=await fetch(base+'/json').then(r=>r.json());return session(list.find(p=>p.id===target.targetId));}
 const b=await page(),c=await page(),url=`http://127.0.0.1:${app.server.address().port}/stickman-fight`;
 for(const p of [a,b,c]){await p.cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1050,deviceScaleFactor:1,mobile:false});await p.cdp('Page.navigate',{url});await until(()=>p.evaluate('!!window.stickmanSnapshot'),'page readiness');}
 for(const [width,height] of [[1920,1080],[1366,768],[1024,768],[390,844],[360,800],[1440,1050]]){await a.cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await wait(60);const layout=await a.evaluate(`(()=>{const r=document.getElementById('board').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,ratio:r.width/r.height}})()`);assert(!layout.overflow,'overflow '+width);assert(Math.abs(layout.ratio-1200/620)<.01);}
 await a.evaluate(`document.getElementById('player-name').value='Host';document.querySelector('[data-arena="bamboo"]').click();document.querySelector('[data-seconds="90"]').click()`);await a.click('create-room');await until(async()=>!!(await a.snapshot())?.lobby,'create');const code=(await a.snapshot()).room;assert.equal((await a.snapshot()).id,0);assert(await a.evaluate(`document.getElementById('primary').disabled`));
 await b.evaluate(`document.getElementById('player-name').value='Guest';document.getElementById('room-code').value=${JSON.stringify(code)}`);await b.click('join-room');await until(async()=>(await a.snapshot())?.lobby?.players.length===2&&(await b.snapshot())?.lobby?.players.length===2,'join');assert.equal((await b.snapshot()).id,1);assert(await b.evaluate(`document.getElementById('setup').disabled`));assert(await b.evaluate(`document.getElementById('primary').disabled`));assert.equal((await b.snapshot()).arena,'bamboo');
 await c.evaluate(`document.getElementById('room-code').value=${JSON.stringify(code)}`);await c.click('join-room');await until(async()=>(await c.snapshot())?.mode==='menu','full room rejected');assert.equal((await c.snapshot()).id,null);
 await a.click('primary');await until(async()=>(await a.snapshot()).phase==='fight'&&(await b.snapshot()).phase==='fight','countdown');assert.equal((await a.snapshot()).time<=90,true);
 // Each client controls its assigned fighter with the same keys.
 const original=(await a.snapshot()).players;await b.down('KeyA');await wait(200);await b.up('KeyA');await wait(130);let s=await a.snapshot();assert(s.players[1].x<original[1].x,JSON.stringify(s));assert.equal(s.players[0].x,original[0].x);
 await Promise.all([a.down('KeyD'),b.down('KeyA')]);await until(async()=>{const s=await a.snapshot();return Math.abs(s.players[0].x-s.players[1].x)<70;},'fighters in range');await Promise.all([a.up('KeyD'),b.up('KeyA')]);await wait(100);s=await a.snapshot();assert(s.players[0].x>450&&s.players[1].x<700,JSON.stringify(s.players));
 await Promise.all([a.down('KeyF'),b.down('KeyF')]);await wait(120);await Promise.all([a.up('KeyF'),b.up('KeyF')]);await wait(420);s=await a.snapshot();assert(s.players.some(p=>p.hp<100),JSON.stringify(s.players));
 await b.click('pause');await until(async()=>(await a.snapshot()).paused&&(await b.snapshot()).paused,'shared pause');const frozen=await a.snapshot();await wait(250);const frozen2=await b.snapshot();assert.deepEqual(frozen.players,frozen2.players);assert.equal(frozen.time,frozen2.time);
 await b.click('primary');await until(async()=>!(await a.snapshot()).paused&&!(await b.snapshot()).paused,'guest resume');
 await a.evaluate(`window.dispatchEvent(new Event('blur'))`);await until(async()=>(await b.snapshot()).paused,'blur pauses remote');await a.click('primary');await until(async()=>!(await b.snapshot()).paused,'explicit resume');
 await a.click('settings');await until(async()=>(await b.snapshot()).paused,'settings shared pause');await a.evaluate(`document.getElementById('volume').value='0.25';document.getElementById('volume').dispatchEvent(new Event('input'));document.getElementById('reduced').click();document.getElementById('preferences').close()`);await a.click('primary');await until(async()=>!(await b.snapshot()).paused,'settings resume');
 await a.down('F2');await a.up('F2');await a.down('F2');await a.up('F2');
 const screenshot=await a.cdp('Page.captureScreenshot',{format:'png'});await writeFile(new URL('../dist/stickman-online.png',import.meta.url),Buffer.from(screenshot.data,'base64'));
 // A host departure gives the other player the win and transfers ownership.
 await a.click('leave-room');await until(async()=>(await b.snapshot()).phase==='result','forfeit');assert.deepEqual((await b.snapshot()).wins,[0,2]);assert.equal((await b.snapshot()).lobby.host,1);
 await wait(10500);assert.equal((await b.snapshot()).mode,'match');assert.equal((await b.snapshot()).phase,'result');
 // The same room accepts a replacement and can start another complete match.
 await c.click('join-room');await until(async()=>(await c.snapshot()).mode==='lobby'&&(await b.snapshot()).mode==='lobby','replacement');await b.click('primary');await until(async()=>(await c.snapshot()).phase==='fight','new match');assert.deepEqual((await c.snapshot()).wins,[0,0]);
 await c.click('leave-room');await until(async()=>(await b.snapshot()).phase==='result','second forfeit');await b.click('leave-room');await until(async()=>(await b.snapshot()).mode==='menu','leave');
 await c.click('join-room');await until(async()=>(await c.snapshot()).mode==='menu','empty room expired');
 // All test pages share an origin/storage; save this client's settings last before verifying reload.
 await a.evaluate(`document.getElementById('player-name').dispatchEvent(new Event('input'))`);
 await a.cdp('Page.reload');await until(()=>a.evaluate('!!window.stickmanSnapshot'),'reload');assert.equal(await a.evaluate(`document.getElementById('player-name').value`),'Host');assert.equal(await a.evaluate(`document.getElementById('volume').value`),'0.25');
 assert.equal(errors.length,0,JSON.stringify(errors));console.log('Stickman Chrome online passed: three isolated pages, create/join/full-room rejection, host settings, countdown, per-client controls, damage synchronization, shared pause/resume/blur, forfeit and host migration, replacement/restart, empty-room rejection, settings persistence, responsive layout; no runtime exceptions.');
}finally{for(const s of sessions)s.socket.close();chrome.kill();await app.close();await wait(500);await rm(profile,{recursive:true,force:true,maxRetries:4,retryDelay:300}).catch(()=>{});}
