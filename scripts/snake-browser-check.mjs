import {CONFIG as C} from '../mebi-snake/config.js';
import {spawn} from 'node:child_process';
import {mkdtemp,writeFile} from 'node:fs/promises';
import {existsSync} from 'node:fs';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {pathToFileURL} from 'node:url';
import assert from 'node:assert/strict';
import {localServer} from './local-server.mjs';
import {buildSnake} from './build-snake.mjs';
const directory=await mkdtemp(path.join(tmpdir(),'snake-qa-'));
const html=await buildSnake();let app=localServer(()=>html,{directory:pathToFileURL(directory+path.sep),onRoom:()=>{}});
await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base=`http://127.0.0.1:${app.server.address().port}`;
const browser=process.env.CHROME_PATH||['C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe','C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe','C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe'].find(existsSync);
assert.ok(browser,'Chrome/Edge required');const child=spawn(browser,['--headless','--no-sandbox','--disable-gpu','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${directory}/browser`,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
let socket;const errors=[];const wait=ms=>new Promise(r=>setTimeout(r,ms));
try{
 const endpoint=await new Promise((resolve,reject)=>{let data='';const timer=setTimeout(()=>reject(Error('Browser startup timeout')),15000);child.on('error',reject);child.stderr.on('data',c=>{data+=c;const match=data.match(/DevTools listening on (ws:\/\/\S+)/);if(match){clearTimeout(timer);resolve(match[1]);}});});
 socket=new WebSocket(endpoint);await new Promise(r=>socket.addEventListener('open',r,{once:true}));let seq=0;const pending=new Map();socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p?.reject(m.error);else p?.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
 const cdp=(method,params={},sessionId)=>new Promise((resolve,reject)=>{const id=++seq,timer=setTimeout(()=>reject(Error('CDP timeout '+method)),10000);pending.set(id,{resolve:r=>{clearTimeout(timer);resolve(r);},reject:e=>{clearTimeout(timer);reject(e);}});socket.send(JSON.stringify({id,method,params,sessionId}));});
 const evalIn=async(session,expression)=>{const r=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true},session);if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
 const until=async(fn,label)=>{for(let i=0;i<80;i++){if(await fn())return;await wait(100);}throw Error('Timeout: '+label);};
 async function context(name,latency=0){const {browserContextId}=await cdp('Target.createBrowserContext');const {targetId}=await cdp('Target.createTarget',{url:'about:blank',browserContextId});const {sessionId}=await cdp('Target.attachToTarget',{targetId,flatten:true});await cdp('Runtime.enable',{},sessionId);await cdp('Page.enable',{},sessionId);await cdp('Emulation.setDeviceMetricsOverride',{width:1280,height:800,deviceScaleFactor:1,mobile:false},sessionId);
  if(latency)await cdp('Page.addScriptToEvaluateOnNewDocument',{source:`{const Native=WebSocket;window.WebSocket=class extends Native{constructor(...args){super(...args);this.handler=null;super.addEventListener('message',e=>{let m;try{m=JSON.parse(e.data)}catch{}if(m?.type==='snapshot'&&Math.random()<.12)return;setTimeout(()=>this.handler?.(e),${latency}/2+Math.random()*20)});}set onmessage(fn){this.handler=fn}get onmessage(){return this.handler}send(m){setTimeout(()=>{if(this.readyState===1)super.send(m)},${latency}/2+Math.random()*20)}};}`},sessionId);
  await cdp('Page.navigate',{url:base+'/snake'},sessionId);await until(()=>evalIn(sessionId,'!!document.getElementById("name")'),'entry '+name);await evalIn(sessionId,`document.getElementById('name').value=${JSON.stringify(name)}`);return sessionId;}
 const shot=async(s,name)=>{const r=await cdp('Page.captureScreenshot',{format:'png'},s);await writeFile(new URL('../dist/mebi-snake/'+name+'.png',import.meta.url),Buffer.from(r.data,'base64'));};
 const click=async(s,id)=>evalIn(s,`document.getElementById('${id}').click()`);
 const one=await context('Bạn Một'),two=await context('Bạn Hai');await shot(one,'menu-qa');await click(one,'play');await click(two,'play');await until(()=>evalIn(one,'document.body.dataset.phase==="playing"'),'first spawn');await until(()=>evalIn(two,'document.body.dataset.phase==="playing"'),'second spawn');
 const service=app.snake.arenas.get(1),players=()=>[...service.arena.sessions.values()];assert.equal(players().length,2);assert.equal(players()[0].phase,'alive');
 const first=players().find(p=>p.name==='Bạn Một'),second=players().find(p=>p.name==='Bạn Hai'),firstId=first.id;
 // These are process-local fixtures only; production has no seed/admin endpoint.
 function reset(s,x,y){Object.assign(s.snake,{x,y,angle:0,path:[{x,y},{x:x-290,y}],protectedUntil:0});s.input.angle=0;s.input.boost=false;}
 reset(first,-300,-300);reset(second,300,300);await wait(180);await cdp('Page.bringToFront',{},one);const before=first.snake.angle;
 await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:640,y:100},one);await wait(700);assert.ok(Math.abs(first.snake.angle-before)>.2,'mouse must turn real server snake');
 await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:' ',code:'Space',windowsVirtualKeyCode:32},one);await until(()=>first.snake.boost,'Space boost');await cdp('Input.dispatchKeyEvent',{type:'keyUp',key:' ',code:'Space',windowsVirtualKeyCode:32},one);await until(()=>!first.snake.boost,'boost released');
 for(let i=0;i<24;i++){const a=i/24*Math.PI*2;await cdp('Input.dispatchMouseEvent',{type:'mouseMoved',x:640+Math.cos(a)*200,y:400+Math.sin(a)*200},one);await wait(40);}await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'F2'},one);await wait(300);const debug=await evalIn(one,'document.getElementById("debug").textContent');assert.match(debug,/FPS/);await shot(one,'playing-qa');
 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:844,deviceScaleFactor:2,mobile:true},one);await cdp('Emulation.setTouchEmulationEnabled',{enabled:true,maxTouchPoints:2},one);await wait(250);assert.equal(await evalIn(one,'document.documentElement.scrollWidth>innerWidth'),false);
 const rects=await evalIn(one,'["joystick","boost"].map(id=>{const r=document.getElementById(id).getBoundingClientRect();return {x:r.x+r.width/2,y:r.y+r.height/2}})');
 await cdp('Input.dispatchTouchEvent',{type:'touchStart',touchPoints:[{id:1,x:rects[0].x+25,y:rects[0].y},{id:2,x:rects[1].x,y:rects[1].y}]},one);await until(()=>first.snake.boost,'mobile multi-touch boost');await cdp('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:[]},one);await until(()=>!first.snake.boost,'mobile release');await shot(one,'mobile-qa');
 await cdp('Page.reload',{},one);await until(()=>players().some(p=>p.id===firstId&&p.connected),'resume same snake');assert.equal(players().length,2);
 reset(first,C.radius-10,0);first.input.angle=0;await until(()=>first.phase==='dead','server wall death');await until(()=>evalIn(one,'document.body.dataset.phase==="dead"'),'death UI');await shot(one,'result-qa');await click(one,'again');await until(()=>first.phase==='alive','same arena respawn');assert.equal(first.id,firstId);
 const network=[];for(const rtt of [50,100,200]){const s=await context('RTT '+rtt,rtt);await click(s,'play');await until(()=>evalIn(s,'document.body.dataset.phase==="playing"'),'latency '+rtt);await cdp('Page.bringToFront',{},s);await cdp('Input.dispatchKeyEvent',{type:'keyDown',key:'F2'},s);await wait(1250);await until(()=>evalIn(s,'document.getElementById("debug").textContent.includes("FPS")'),'network debug');if(rtt===200){await cdp('Emulation.setCPUThrottlingRate',{rate:4},s);await wait(500);await cdp('Emulation.setCPUThrottlingRate',{rate:1},s);}network.push({simulatedRtt:rtt,debug:await evalIn(s,'document.getElementById("debug").textContent')});await click(s,'leave');}
 await writeFile(new URL('../dist/mebi-snake/browser-metrics.json',import.meta.url),JSON.stringify({debug,network},null,2));assert.deepEqual(errors,[]);console.log('MebiRắn.io browser PASS: two real contexts, mouse turn/circles, Space boost, mobile multi-touch/resize, same-snake reload, server death/respawn, 50/100/200 ms RTT+jitter+12% snapshot loss, no runtime exceptions.');
}finally{socket?.close();child.kill();await app.close();}
