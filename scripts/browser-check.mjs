import {spawn} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {localServer} from './local-server.mjs';
import assert from 'node:assert/strict';
import {build} from './build.mjs';
import {W,H} from '../bomb-arena/map.js';
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
 await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}`});
 for(let i=0;i<100;i++){if(await evaluate('document.querySelectorAll(".robot-row").length>0'))break;await wait(150);}
 assert.equal(await evaluate('document.getElementById("board").height'),H*48);
 assert.equal(await evaluate('getComputedStyle(document.getElementById("primary")).backgroundColor'),'rgb(255, 156, 69)');
 assert.equal(await evaluate('getComputedStyle(document.body).backgroundColor'),'rgb(21, 20, 29)');
 // Check layout at desktop, laptop, tablet and narrow mobile sizes, including without external fonts.
 for(const [width,height] of [[1920,1080],[1366,768],[1024,768],[390,844],[360,800],[1280,1100]]){
  await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:false});await wait(60);
  const layout=await evaluate(`(()=>{const board=document.getElementById('board').getBoundingClientRect(),arena=document.querySelector('.arena').getBoundingClientRect(),aside=document.querySelector('aside').getBoundingClientRect(),timer=document.getElementById('timer').getBoundingClientRect(),top=document.querySelector('.arena-top').getBoundingClientRect();return {overflow:document.documentElement.scrollWidth>innerWidth,ratio:board.width/board.height,arenaHeight:arena.height,asideHeight:aside.height,arenaTop:arena.top,asideTop:aside.top,timerOffset:Math.abs((timer.left+timer.right)/2-(top.left+top.right)/2)}})()`);
  assert(!layout.overflow,`horizontal overflow at ${width}`);assert(Math.abs(layout.ratio-W/H)<.01);assert(layout.timerOffset<1);
  if(width>1050){assert(Math.abs(layout.arenaHeight-layout.asideHeight)<2);assert(Math.abs(layout.arenaTop-layout.asideTop)<1);}
 }
 assert.equal(errors.length,0,JSON.stringify(errors));
 await click('primary');await key('Space');await wait(200);
 assert.match(await evaluate('document.querySelector(".robot-row small").textContent'),/1\/1/);
 await click('pause');const timer=await evaluate('document.getElementById("timer").textContent');await wait(1100);assert.equal(await evaluate('document.getElementById("timer").textContent'),timer);
 await click('primary');await wait(100);assert(await evaluate('document.getElementById("overlay").hidden'));
 await click('pause');await click('menu');await evaluate('document.getElementById("humans").value="2";document.getElementById("humans").dispatchEvent(new Event("change"))');await click('primary');await key('Enter');await wait(200);
 assert.match(await evaluate('document.querySelectorAll(".robot-row small")[1].textContent'),/1\/1/);
 for(let i=0;i<3;i++){await click('pause');await click('restart');}
 await click('pause');await click('menu');
 const shot=await cdp('Page.captureScreenshot',{format:'png'});await writeFile(new URL('../dist/desktop-check.png',import.meta.url),Buffer.from(shot.data,'base64'));
 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:1,mobile:true});await cdp('Emulation.setTouchEmulationEnabled',{enabled:true});await wait(250);
 assert(await evaluate('document.getElementById("two-player").hidden'));
 assert.equal(await evaluate('getComputedStyle(document.querySelector(".touch")).display'),'flex');
 await click('primary');
 const ratio=await evaluate('(()=>{const r=document.getElementById("board").getBoundingClientRect();return r.width/r.height})()');assert(Math.abs(ratio-W/H)<.01);
 await evaluate('document.querySelector(".touch").scrollIntoView({block:"center"})');
 const points=await evaluate(`['KeyD','Space'].map(code=>{const r=document.querySelector('[data-control="'+code+'"]').getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})`);
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:points.map((p,i)=>({...p,id:i+1}))});await wait(180);await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]});await wait(150);
 assert.match(await evaluate('document.querySelector(".robot-row small").textContent'),/1\/1/);
 await click('pause');await click('menu');await evaluate('window.scrollTo(0,0)');
 const mobile=await cdp('Page.captureScreenshot',{format:'png'});await writeFile(new URL('../dist/mobile-check.png',import.meta.url),Buffer.from(mobile.data,'base64'));
 // Four independent pages exercise the actual room UI and four real browser sockets.
 const hostSocket=socket,players=[socket];
 await cdp('Emulation.setTouchEmulationEnabled',{enabled:false});await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:1100,deviceScaleFactor:1,mobile:false});
 await evaluate('document.getElementById("player-name").value="Chrome Host"');await click('create-room');
 for(let i=0;i<50;i++){if(await evaluate('document.getElementById("room-id").textContent.length===4'))break;await wait(100);}
 const code=await evaluate('document.getElementById("room-id").textContent');assert.match(code,/^[A-Z0-9]{4}$/);
 for(let i=1;i<4;i++){
  socket=hostSocket;
  const target=await cdp('Target.createTarget',{url:'about:blank'});
  const listing=await fetch(`http://127.0.0.1:${new URL(endpoint).port}/json`).then(r=>r.json());
  socket=new WebSocket(listing.find(p=>p.id===target.targetId).webSocketDebuggerUrl);sockets.push(socket);players.push(socket);
  await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
  socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(m.error);else p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
  await cdp('Runtime.enable');await cdp('Page.enable');
  await cdp('Page.navigate',{url:`http://127.0.0.1:${server.address().port}`});
  for(let j=0;j<100;j++){if(await evaluate('document.querySelectorAll(".robot-row").length>0'))break;await wait(100);}
  await evaluate(`document.getElementById('player-name').value='Chrome Guest ${i}';document.getElementById('room-code').value='${code}'`);await click('join-room');
  for(let j=0;j<50;j++){if(await evaluate(`document.querySelectorAll('#room-players li').length===${i+1}`))break;await wait(100);}
  assert.equal(await evaluate('document.querySelectorAll("#room-players li").length'),i+1);
  assert(await evaluate('document.getElementById("primary").disabled'));
 }
 socket=hostSocket;
 for(let i=0;i<80;i++){if(await evaluate('document.querySelectorAll("#room-players li").length===4'))break;await wait(100);}
 assert.equal(await evaluate('document.querySelectorAll("#room-players li").length'),4);await click('primary');await wait(300);
 for(const playerSocket of players){socket=playerSocket;assert(await evaluate('document.getElementById("overlay").hidden'));}
 // Observe each player's own bomb while its fuse is active, instead of assuming four transient HUD updates arrive together.
 for(let i=0;i<players.length;i++){
  socket=players[i];await key('Space');let seen=false;
  for(let j=0;j<20;j++){seen=await evaluate(`document.querySelectorAll('.robot-row small')[${i}].textContent.includes('1/1')`);if(seen)break;await wait(50);}
  assert(seen,`online player ${i+1} bomb`);
 }
 socket=hostSocket;const online=await cdp('Page.captureScreenshot',{format:'png'});await writeFile(new URL('../dist/online-check.png',import.meta.url),Buffer.from(online.data,'base64'));await click('leave-room');await wait(200);
 socket=players[1];assert.match(await evaluate('document.querySelector("#room-players li").textContent'),/Chủ phòng/);
 for(const playerSocket of players.slice(1)){socket=playerSocket;await click('leave-room');}
 assert.equal(errors.length,0,JSON.stringify(errors));
 console.log('Chrome passed: local P1/P2, pause/resume, restart, mobile touch; four online pages create/join/start, all four bomb states, host migration; no runtime exceptions.');
}finally{for(const s of sockets)s.close();chrome.kill();await app.close();await new Promise(r=>setTimeout(r,500));await rm(profile,{recursive:true,force:true,maxRetries:4,retryDelay:300}).catch(()=>{});}
