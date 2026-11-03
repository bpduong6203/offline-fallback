import {spawn} from 'node:child_process';
import {mkdtemp,rm,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import {localServer} from './local-server.mjs';
const app=localServer(()=>'<p>Local games</p>');await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
const profile=await mkdtemp(path.join(tmpdir(),'tea-shop-check-'));
const chrome=spawn(process.env.CHROME_PATH||'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',['--headless','--no-sandbox','--disable-gpu','--no-first-run','--remote-debugging-port=0',`--user-data-dir=${profile}`,'about:blank'],{windowsHide:true,stdio:['ignore','ignore','pipe']});
let socket;const errors=[];
try{work:{
 const endpoint=await new Promise((resolve,reject)=>{let text='';const t=setTimeout(()=>reject(Error('Chrome startup timeout')),15000);chrome.on('error',reject);chrome.stderr.on('data',d=>{text+=d;const m=text.match(/DevTools listening on (ws:\/\/[^\s]+)/);if(m){clearTimeout(t);resolve(m[1]);}});});
 const pages=await fetch(`http://127.0.0.1:${new URL(endpoint).port}/json`).then(r=>r.json());socket=new WebSocket(pages.find(p=>p.type==='page').webSocketDebuggerUrl);await new Promise(r=>socket.addEventListener('open',r,{once:true}));
 let seq=0;const pending=new Map();socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.id){const p=pending.get(m.id);if(!p)return;pending.delete(m.id);if(m.error)p.reject(m.error);else p.resolve(m.result);}if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);});
 const cdp=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq,t=setTimeout(()=>reject(Error('CDP timeout: '+method)),10000);pending.set(id,{resolve:r=>{clearTimeout(t);resolve(r);},reject:e=>{clearTimeout(t);reject(e);}});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const out=await cdp('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(out.exceptionDetails)throw Error(JSON.stringify(out.exceptionDetails));return out.result.value;};
 const wait=ms=>new Promise(r=>setTimeout(r,ms));
 async function until(expression,label){for(let i=0;i<120;i++){if(await evaluate(expression))return;await wait(100);}throw Error('Not ready: '+label);}
 const click=async selector=>{assert(await evaluate(`!!document.querySelector(${JSON.stringify(selector)})`),selector);await evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);await wait(130);};
 const read=()=>evaluate("fetch('/api/tea-shop').then(r=>r.json())");
 await cdp('Runtime.enable');await cdp('Page.enable');await cdp('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
 await cdp('Page.navigate',{url:`http://127.0.0.1:${app.server.address().port}/goc-tra-nho`});
 await until("document.getElementById('saveStatus')?.textContent.includes('Đã lưu')",'shop ready');
 assert.equal((await read()).balance,0);
 await click('[data-owner="female"]');assert.equal((await read()).state.ownerGender,'female');
 await cdp('Page.reload');await until("document.querySelector('[data-owner=female]')?.getAttribute('aria-pressed')==='true'",'saved female owner');
 const layout=await evaluate("(()=>{const shop=document.querySelector('.shop').getBoundingClientRect(),work=document.querySelector('#workspace').getBoundingClientRect();return {beside:work.left>=shop.right,visible:work.top>=0&&work.bottom<innerHeight}})()");assert(layout.beside&&layout.visible,JSON.stringify(layout));
 await click('#open');await until('document.querySelectorAll(".order").length>0','first customer');
 const data=await read(),o=data.state.orders[0];await click(`.order [data-action="start"]`);
 const r={classic:{tea:'black',milk:true,topping:'none'},pearl:{tea:'black',milk:true,topping:'pearl'}}[o.recipe];
 const values=[true,r.tea,r.milk,o.sugar,o.ice,r.topping,true,true];
 for(let step=0;step<8;step++){
  for(const [width,height] of [[1440,900],[1366,768],[1024,768],[768,1024],[390,844],[360,740]]){
   await cdp('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<500});await wait(100);
   const bounds=await evaluate("(()=>{const w=document.querySelector('#workspace').getBoundingClientRect(),rects=[...document.querySelectorAll('.choices button')].map(b=>b.getBoundingClientRect());return {top:Math.min(...rects.map(r=>r.top)),bottom:Math.max(...rects.map(r=>r.bottom)),height:innerHeight,workBottom:w.bottom,overflow:document.documentElement.scrollWidth>innerWidth,scroll:scrollY}})()");
   assert(!bounds.overflow&&bounds.top>=0&&bounds.bottom<=Math.min(bounds.height,bounds.workBottom),`visible brewing choices ${width}x${height}: ${JSON.stringify(bounds)}`);
   if(step===0&&(width===1366||width===390))await writeFile(new URL(`../dist/tea-${width===1366?'desktop':'mobile'}.png`,import.meta.url),Buffer.from((await cdp('Page.captureScreenshot',{format:'png'})).data,'base64'));
  }await cdp('Emulation.setDeviceMetricsOverride',{width:1366,height:768,deviceScaleFactor:1,mobile:false});
  const selectors=await evaluate(`[...document.querySelectorAll('#workspace [data-action="step"]')].map(b=>({props:JSON.parse(b.dataset.props),text:b.textContent}))`);const choice=selectors.find(b=>b.props.value===values[step]);assert(choice,`step ${step}`);await evaluate(`[...document.querySelectorAll('#workspace [data-action="step"]')].find(b=>b.textContent===${JSON.stringify(choice.text)}).click()`);await wait(160);
 }
 await wait(8200);await click('#workspace [data-action="serve"]');await until("document.querySelector('#workspace h2')?.textContent==='Bàn pha chế'",'sale');
 const sold=await read();assert.equal(sold.state.report.served,1);assert(sold.balance>=8);await cdp('Page.reload');await until("document.getElementById('saveStatus')?.textContent.includes('Đã lưu')",'reload');assert.equal((await read()).balance,sold.balance);assert.equal((await read()).state.report.served,1);
 if(process.argv.includes('--layout-only')){assert.equal(errors.length,0,JSON.stringify(errors));console.log('Tea layout passed: visible controls at 6 desktop/mobile sizes, female owner saved across reload, completed sale.');break work;}
 await click('[data-tab="stock"]');await evaluate("[...document.querySelectorAll('#workspace [data-action=" + '"buy"' + "]')].find(b=>JSON.parse(b.dataset.props).item==='cup'&&JSON.parse(b.dataset.props).amount===1).click()");await wait(200);assert.equal((await read()).balance,sold.balance-1);
 await click('[data-tab="garden"]');await click('[data-plant="0"]');await click('[data-action="water"]');assert((await read()).state.garden[0].watered);
 await click('[data-tab="counter"]');
 for(const kind of ['brew','pearls','shake','syrup','clean']){
  await click(`[data-mini="${kind}"]`);await until('document.querySelector("#miniZone")!==null',kind);
  const before=(await read()).state.time;
  if(kind==='brew')await click('#miniActions button');
  if(kind==='pearls'||kind==='shake'){for(let i=0;i<7;i++){await wait(950);await click(`#miniActions button:nth-child(${kind==='shake'?(i%2)+1:1})`);}}
  if(kind==='clean'){
   for(const [i,label] of [[1,'Vết bẩn'],[2,'Ly đã dùng'],[3,'Giấy bỏ đi']]){await click(`#miniActions button:nth-child(${i})`);await evaluate(`[...document.querySelectorAll('#miniZone button')].filter(b=>b.getAttribute('aria-label')===${JSON.stringify(label)}).forEach(b=>b.click())`);}
  }
  if(kind==='syrup'){
   const rect=await evaluate("(()=>{const r=document.querySelector('#drawPad').getBoundingClientRect();return {x:r.x,y:r.y,w:r.width,h:r.height}})()");
   for(let i=0;i<=26;i++){const x=40+i*20,y=115+Math.sin((x-40)/520*Math.PI*2)*58;await cdp('Input.dispatchMouseEvent',{type:i===0?'mousePressed':'mouseMoved',x:rect.x+x/600*rect.w,y:rect.y+y/230*rect.h,button:'left',buttons:1,clickCount:1});}await cdp('Input.dispatchMouseEvent',{type:'mouseReleased',x:rect.x+rect.w*.94,y:rect.y+rect.h/2,button:'left',buttons:0,clickCount:1});
  }
  await until("[...document.querySelectorAll('#miniActions button')].some(b=>b.textContent==='Hoàn thành'&&!b.disabled)",'mini finish enabled');assert.equal((await read()).state.time,before,'service paused during '+kind);
  await evaluate("[...document.querySelectorAll('#miniActions button')].find(b=>b.textContent==='Hoàn thành').click()");await until('!!document.querySelector("#miniClose")','mini receipt');await click('#miniClose');assert(!(await read()).state.mini);
 }
 // Close the service day through a state fixture in a unit test; match-3 itself
 // is exercised here in the same actual browser after returning to closed mode
 // through the public reset flow (no money or starter materials are granted).
 await click('#settings');await evaluate('window.confirm=()=>true');await click('#reset');await until('!document.querySelector("#modal").open','reset');await click('[data-tab="counter"]');await click('[data-mini="match"]');
 const move=await evaluate(`(()=>{const b=[...document.querySelectorAll('[data-cell]')].map(e=>Number(e.className.split('tile-')[1][0]));const has=a=>{for(let y=0;y<5;y++)for(let x=0;x<5;x++){const i=y*5+x;if(x<3&&a[i]===a[i+1]&&a[i]===a[i+2]||y<3&&a[i]===a[i+5]&&a[i]===a[i+10])return true;}return false;};for(let i=0;i<25;i++)for(let j=i+1;j<25;j++)if(Math.abs(i%5-j%5)+Math.abs(Math.floor(i/5)-Math.floor(j/5))===1){const a=[...b];[a[i],a[j]]=[a[j],a[i]];if(has(a))return [i,j];}})()`);
 assert(move);await click(`[data-cell="${move[0]}"]`);await click(`[data-cell="${move[1]}"]`);assert.match(await evaluate('document.querySelector("#miniFeedback").textContent'),/Còn 7 lượt/);
 await until("[...document.querySelectorAll('#miniActions button')].some(b=>b.textContent==='Hoàn thành'&&!b.disabled)",'match duration');await evaluate("[...document.querySelectorAll('#miniActions button')].find(b=>b.textContent==='Hoàn thành').click()");await until('!!document.querySelector("#miniClose")','match completion');await click('#miniClose');
 for(const width of [1440,1024,768,390,360]){await cdp('Emulation.setDeviceMetricsOverride',{width,height:1000,deviceScaleFactor:1,mobile:width<500});await wait(120);assert(!(await evaluate('document.documentElement.scrollWidth>innerWidth')),`overflow ${width}`);for(const tab of ['brew','garden','stock','decorate']){await click(`[data-tab="${tab}"]`);assert(!(await evaluate('document.documentElement.scrollWidth>innerWidth')),`${tab} overflow ${width}`);}}
 await click('[data-tab="counter"]');await cdp('Emulation.setDeviceMetricsOverride',{width:1440,height:1100,deviceScaleFactor:1,mobile:false});await wait(100);await writeFile(new URL('../dist/tea-desktop.png',import.meta.url),Buffer.from((await cdp('Page.captureScreenshot',{format:'png'})).data,'base64'));
 await cdp('Emulation.setDeviceMetricsOverride',{width:390,height:1000,deviceScaleFactor:1,mobile:true});await wait(100);await writeFile(new URL('../dist/tea-mobile.png',import.meta.url),Buffer.from((await cdp('Page.captureScreenshot',{format:'png'})).data,'base64'));
 assert.equal(errors.length,0,JSON.stringify(errors));console.log('Tea browser passed: sale, shared wallet purchase, reload, garden, 6 minigames, desktop/mobile layouts, no runtime exceptions.');
}}finally{socket?.close();chrome.kill();await app.close();await new Promise(r=>setTimeout(r,300));const absolute=path.resolve(profile);if(absolute.startsWith(path.resolve(tmpdir())+path.sep)&&path.basename(absolute).startsWith('tea-shop-check-'))await rm(absolute,{recursive:true,force:true,maxRetries:5,retryDelay:200});}
