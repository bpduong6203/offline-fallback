import test from 'node:test';
import assert from 'node:assert/strict';
import {WebSocket} from 'ws';
import {StickmanRoomEngine} from '../src/stickman-room-engine.js';
import {handleGameSocket} from '../src/game-socket.js';
import {localServer} from '../scripts/local-server.mjs';

function setup(n=2){const engine=new StickmanRoomEngine(),messages=Array.from({length:n},()=>[]);for(let i=0;i<n;i++)engine.join('Fighter '+i,m=>messages[i].push(structuredClone(m)));return {engine,messages};}
const input=(extra={})=>({t:'input',left:false,right:false,block:false,...extra});
test('stickman room: exactly two slots; host-only config/start/replay',()=>{
 const {engine,messages}=setup(1);engine.handle(0,{t:'start'});assert.equal(engine.game,null);assert(messages[0].some(m=>m.t==='error'));
 engine.join('Guest',()=>{});assert.throws(()=>engine.join('Third',()=>{}),/2 người/);
 engine.handle(1,{t:'config',arena:'dojo',seconds:90});engine.handle(1,{t:'start'});assert.equal(engine.arena,'city');assert.equal(engine.game,null);
 engine.handle(0,{t:'config',arena:'dojo',seconds:90});engine.handle(0,{t:'start'});assert.equal(engine.game.options.arena,'dojo');assert.equal(engine.game.time,90);assert.deepEqual(engine.game.options.names,['Fighter 0','Guest']);
 engine.handle(0,{t:'config',arena:'bamboo',seconds:60});engine.handle(0,{t:'start'});assert.equal(engine.game.options.arena,'dojo');
 engine.game.phase='result';engine.game.wins=[2,0];engine.handle(1,{t:'start'});assert.equal(engine.game.phase,'result');engine.handle(0,{t:'start'});assert.deepEqual(engine.game.wins,[0,0]);assert.equal(engine.game.phase,'countdown');
});
test('stickman room: connection owns fighter; validates controls; one edge and stale input expiry',()=>{
 const {engine}=setup();engine.handle(0,{t:'start'});engine.game.phase='fight';
 const [a,b]=engine.game.players;engine.handle(1,{...input({right:true}),id:0,x:999,hp:0,energy:999},1000);engine.tick(1/60,1001);assert.equal(a.x,330);assert(b.x>870);assert.equal(a.hp,100);assert.equal(b.energy,100);
 const x=b.x;engine.handle(1,input({right:'yes'}),1002);engine.tick(1/60,1700);assert.equal(b.x,x);
 engine.handle(0,input({jump:true}),2000);engine.tick(1/60,2001);assert(a.y<490);assert.equal(engine.peers.get(0).input.jump,false);
 for(let i=0;i<100;i++)engine.tick(1/60,2002+i*17);assert.equal(a.y,490);assert.equal(a.vy,0);
});
test('stickman room: either peer pauses both; resume clears held and queued inputs',()=>{
 const {engine}=setup();engine.handle(0,{t:'start'});engine.game.phase='fight';engine.handle(0,input({right:true,jump:true,action:'Kick'}),1000);
 engine.handle(1,{t:'pause'});const before=structuredClone(engine.game);for(let i=0;i<120;i++)engine.tick(1/60,1001+i*17);assert.deepEqual(engine.game,before);
 engine.handle(0,input({right:true}),2000);assert.deepEqual(engine.peers.get(0).input,{});engine.handle(1,{t:'resume'});engine.tick(1/60,2001);assert.equal(engine.game.players[0].x,330);assert.equal(engine.game.players[0].state,'Idle');assert(engine.game.time<60);
});
test('stickman room: server snapshots and combat events are identical; round result does not stop match',()=>{
 const {engine,messages}=setup();engine.handle(0,{t:'start'});engine.game.phase='fight';const [a,b]=engine.game.players;a.x=500;b.x=570;
 engine.handle(0,input({action:'Punch'}),1000);engine.handle(1,input({action:'Punch'}),1000);
 for(let i=0;i<12;i++)engine.tick(1/60,1001+i*17);engine.snapshot();assert.deepEqual(engine.game.players.map(p=>p.hp),[93,93]);
 const sa=messages[0].filter(m=>m.t==='state').at(-1),sb=messages[1].filter(m=>m.t==='state').at(-1);assert.deepEqual(sa,sb);assert.equal(sa.state.events.length,2);assert.doesNotThrow(()=>JSON.stringify(sa));
 engine.snapshot();assert.equal(messages[0].at(-1).state.events.length,0);
 engine.game.hitstop=0;engine.game.time=0;engine.game.players[1].hp=70;engine.tick();assert.equal(engine.game.phase,'roundEnd');assert(engine.playing());
 for(let i=0;i<155;i++)engine.tick();assert.equal(engine.game.phase,'countdown');assert.deepEqual(engine.game.wins,[1,0]);
});
test('stickman room: disconnect forfeits, host migrates, replacement can play, empty room clears',()=>{
 const {engine}=setup();engine.handle(0,{t:'start'});engine.handle(0,{t:'pause'});engine.leave(0);assert.equal(engine.host,1);assert.equal(engine.game.phase,'result');assert.equal(engine.game.paused,false);assert.deepEqual(engine.game.wins,[0,2]);
 engine.handle(1,{t:'start'});assert.equal(engine.game.phase,'result');const id=engine.join('Replacement',()=>{});assert.equal(id,0);assert.equal(engine.game,null);engine.handle(1,{t:'start'});assert.equal(engine.game.options.names[0],'Replacement');
 engine.leave(1);engine.leave(0);assert.equal(engine.game,null);assert.equal(engine.host,null);assert.equal(engine.peers.size,0);
});
test('stickman room router uses isolated binding and rejects foreign origins',async()=>{
 let key;const env={STICKMAN:{idFromName:k=>(key=k),get:()=>({fetch:()=>new Response('ok')})}};const url=new URL('https://example.test/__game/ws?g=stickman&room=TEST');
 assert.equal((await handleGameSocket(new Request(url),env,url)).status,200);assert.equal(key,'stickman:TEST');assert.equal(handleGameSocket(new Request(url),{},url).status,501);assert.equal(handleGameSocket(new Request(url,{headers:{Origin:'https://evil.test'}}),env,url).status,403);
});
test('stickman real WebSockets: create/join, third rejected, shared pause/resume, forfeit, replacement, missing room',async()=>{
 const app=localServer(()=>'<html>test</html>');await new Promise(r=>app.server.listen(0,'127.0.0.1',r));const base=`ws://127.0.0.1:${app.server.address().port}/__game/ws?g=stickman&room=STIK`,clients=[];
 const connect=async suffix=>{const ws=new WebSocket(base+(suffix||'')),messages=[];clients.push(ws);ws.on('message',data=>messages.push(JSON.parse(data)));await new Promise((r,j)=>{ws.once('open',r);ws.once('error',j);});return {ws,messages,send:m=>ws.send(JSON.stringify(m))};};
 const until=async predicate=>{for(let i=0;i<150;i++){if(predicate())return;await new Promise(r=>setTimeout(r,20));}throw Error('Stickman socket timeout');};
 const latest=p=>p.messages.filter(m=>m.t==='state').at(-1)?.state;
 try{
  await assert.rejects(connect(),/404/);const a=await connect('&action=create&name=Host'),b=await connect('&name=Guest');await until(()=>b.messages.some(m=>m.t==='lobby'&&m.players.length===2));await assert.rejects(connect(),/409/);await assert.rejects(connect('&action=create'),/409/);
  b.send({t:'start'});await new Promise(r=>setTimeout(r,50));assert(!latest(a));a.send({t:'config',arena:'bamboo',seconds:90});a.send({t:'start'});await until(()=>latest(a)&&latest(b));assert.deepEqual(a.messages.find(m=>m.t==='state'),b.messages.find(m=>m.t==='state'));assert.equal(latest(a).options.seconds,90);
  b.send({t:'pause'});await until(()=>latest(a)?.paused&&latest(b)?.paused);const time=latest(a).time;await new Promise(r=>setTimeout(r,120));assert.equal(latest(a).time,time);a.send({t:'resume'});await until(()=>!latest(a)?.paused&&!latest(b)?.paused);
  a.ws.close();await until(()=>latest(b)?.phase==='result');assert.deepEqual(latest(b).wins,[0,2]);const c=await connect('&name=New');await until(()=>c.messages.some(m=>m.t==='lobby'&&m.host===1));b.send({t:'start'});await until(()=>latest(c)?.phase==='countdown');
  for(const p of [b,c])p.ws.close();await until(()=>[b,c].every(p=>p.ws.readyState===3));await new Promise(r=>setTimeout(r,50));await assert.rejects(connect(),/404/);
 }finally{for(const ws of clients)ws.terminate();await app.close();}
});
