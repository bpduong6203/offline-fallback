import {spawn} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {localServer} from './local-server.mjs';
import assert from 'node:assert/strict';
import {build} from './build.mjs';

const html=await build(),profile=await mkdtemp(path.join(tmpdir(),'bomb-arena-'));
const app=localServer(()=>html),server=app.server;
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const chrome=spawn(process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless','--no-sandbox','--disable-gpu','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
let socket;const sockets=[];
try{
 const endpoint=await new Promise((resolve,reject)=>{let data='';const timer=setTimeout(()=>reject(Error('Chrome startup timeout')),15000);chrome.on('error',reject);chrome.stderr.on('data',chunk=>{data+=chunk;const match=data.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(match){clearTimeout(timer);resolve(match[1]);}});});
 const pages=await fetch(`http://127.0.0.1:${new URL(endpoint).port}/json`).then(r=>r.json());
 socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);
 sockets.push(socket);
 await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
 let seq=0;const pending=new Map(),errors=[];
 socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(m.error);else p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;const t=setTimeout(()=>reject(Error('CDP timeout '+method)),8000);pending.set(id,{resolve:r=>{clearTimeout(t);resolve(r);},reject:e=>{clearTimeout(t);reject(e);}});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
 const click=id=>evaluate(`document.getElementById('${id}').click()`);
 const key=async code=>{await cdp('Input.dispatchKeyEvent',{type:'keyDown',code,key:code==='Space'?' ':code});await cdp('Input.dispatchKeyEvent',{type:'keyUp',code,key:code==='Space'?' ':code});};
 await cdp('Runtime.enable');await cdp('Page.enable');
 await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:1100,deviceScaleFactor:1,mobile:false});
 await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}/stickman-fight`});
 for(let i=0;i<80;i++){if(await evaluate('!!window.stickmanSnapshot'))break;await wait(100);}
 const snapshot=()=>evaluate('window.stickmanSnapshot');
 assert.equal(errors.length,0,JSON.stringify(errors));
 assert.equal((await snapshot()).mode,'menu');
 for(const [width,height] of [[1920,1080],[1366,768],[1024,768],[390,844],[360,800],[1280,1000]]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await wait(80);
  const layout=await evaluate(`(()=>{const r=document.getElementById('board').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,ratio:r.width/r.height}})()`);
  assert(!layout.overflow,`overflow at ${width}`);assert(Math.abs(layout.ratio-1200/620)<.01);
 }
 await evaluate(`document.querySelector('[data-arena="bamboo"]').click();document.querySelector('[data-seconds="90"]').click();document.getElementById('p1').value='Lam';document.getElementById('p1').dispatchEvent(new Event('input'))`);
 assert.equal((await snapshot()).arena,'bamboo');
 await click('primary');assert.equal((await snapshot()).time,90);await wait(3250);
 assert.equal((await snapshot()).phase,'fight');
 const down=code=>cdp('Input.dispatchKeyEvent',{type:'keyDown',code,key:code});
 const up=code=>cdp('Input.dispatchKeyEvent',{type:'keyUp',code,key:code});
 await down('KeyD');await down('ArrowLeft');await wait(780);await up('KeyD');await up('ArrowLeft');await wait(60);
 let s=await snapshot();assert(s.players[0].x>450);assert(s.players[1].x<750);
 await down('KeyF');await down('KeyJ');await wait(140);await up('KeyF');await up('KeyJ');await wait(280);
 s=await snapshot();assert(s.players.every(p=>p.hp===93),JSON.stringify(s.players));
 // Holding a key does not repeat attacks.
 await down('KeyF');await wait(1000);await up('KeyF');s=await snapshot();assert(s.players[1].hp>=86);
 await click('pause');s=await snapshot();await wait(300);assert.deepEqual(await snapshot(),s);await click('primary');
 // Walk into contact, then jump over opponent and auto-face the new side.
 await down('KeyD');await wait(500);await up('KeyD');await key('KeyW');await down('KeyD');await wait(950);await up('KeyD');await wait(250);
 s=await snapshot();assert(s.players[0].x>s.players[1].x,JSON.stringify(s.players));assert.equal(s.players[0].face,-1);assert.equal(s.players[1].face,1);
 // Hold toward left edge: stable body separation, no out-of-arena positions.
 await down('KeyA');await down('ArrowLeft');await wait(2200);await up('KeyA');await up('ArrowLeft');await wait(100);
 s=await snapshot();assert(s.players.every(p=>p.x>=35&&p.x<=1165));assert(Math.abs(s.players[0].x-s.players[1].x)>=53.9);
 // Actual focus loss via another browser target; explicit resume required.
 const other=await cdp('Target.createTarget',{url:'about:blank'});await cdp('Target.activateTarget',{targetId:other.targetId});await wait(250);
 // Headless browsers do not always dispatch OS blur; additionally exercise the registered blur handler.
 await evaluate(`window.dispatchEvent(new Event('blur'))`);assert((await snapshot()).paused);s=await snapshot();await wait(250);assert.deepEqual(await snapshot(),s);await cdp('Target.closeTarget',{targetId:other.targetId});await click('primary');assert(!(await snapshot()).paused);
 await click('settings');assert((await snapshot()).paused);await evaluate(`document.getElementById('sound').click();document.getElementById('volume').value='0.25';document.getElementById('volume').dispatchEvent(new Event('input'));document.getElementById('reduced').click();document.getElementById('preferences').close()`);await click('primary');
 await key('F2');await wait(100);await key('F2');
 for(let i=0;i<3;i++){await click('pause');await click('menu');await click('primary');assert.equal((await snapshot()).phase,'countdown');assert.deepEqual((await snapshot()).wins,[0,0]);}
 await click('pause');await click('menu');
 await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1050,deviceScaleFactor:1,mobile:false});await wait(100);
 const shot=await cdp('Page.captureScreenshot',{format:'png'});await writeFile(new URL('../dist/stickman-desktop.png',import.meta.url),Buffer.from(shot.data,'base64'));
 await cdp('Page.reload');await wait(400);assert.equal((await snapshot()).arena,'bamboo');assert.equal(await evaluate(`document.getElementById('p1').value`),'Lam');assert.equal(await evaluate(`document.getElementById('volume').value`),'0.25');assert(await evaluate(`document.getElementById('reduced').checked`));
 await evaluate(`document.querySelector('[data-arena="city"]').click()`);await click('primary');await wait(3200);
 const arenaShot=await cdp('Page.captureScreenshot',{format:'png'});await writeFile(new URL('../dist/stickman-fight.png',import.meta.url),Buffer.from(arenaShot.data,'base64'));
 assert.equal(errors.length,0,JSON.stringify(errors));
 console.log('Stickman Chrome passed: responsive layout, setup persistence, simultaneous movement/trades, pause freeze, jump cross/facing, arena walls, blur handler/resume, settings, debug, repeated restart; no runtime exceptions.');
}finally{for(const s of sockets)s.close();chrome.kill();await app.close();await new Promise(r=>setTimeout(r,500));await rm(profile,{recursive:true,force:true,maxRetries:4,retryDelay:300}).catch(()=>{});}

