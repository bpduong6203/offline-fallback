import test from 'node:test';
import assert from 'node:assert/strict';
import {BombRoomEngine} from '../src/bomb-room-engine.js';
import {handleGameSocket} from '../src/game-socket.js';
import {localServer} from '../scripts/local-server.mjs';
import {WebSocket} from 'ws';

function setup(n=4){const engine=new BombRoomEngine(),messages=Array.from({length:n},()=>[]);for(let i=0;i<n;i++)engine.join('Robot '+i,m=>messages[i].push(m));return {engine,messages};}
test('four room slots, host-only start and server assigns distinct spawn corners',()=>{
  const {engine,messages}=setup();assert.throws(()=>engine.join('Fifth',()=>{}),/4 người/);
  engine.handle(1,{t:'theme',theme:'factory'});assert.equal(engine.theme,'garden');
  engine.handle(0,{t:'theme',theme:'factory'});assert.equal(engine.theme,'factory');
  engine.handle(1,{t:'start'});assert.equal(engine.game,null);
  engine.handle(0,{t:'start',theme:'ice'});assert.equal(engine.game.players.length,4);assert.equal(engine.game.options.theme,'ice');
  assert(engine.game.players.every(p=>!p.bot));assert.equal(new Set(engine.game.players.map(p=>`${p.x},${p.y}`)).size,4);
  assert(messages.every(list=>list.some(m=>m.t==='started')));
  assert.throws(()=>engine.join('Late',()=>{}),/đang diễn ra/);
});
test('room validates input, ignores client state and resets stale movement',()=>{
  const {engine}=setup(2);engine.handle(0,{t:'start'});const p=engine.game.players[0];
  engine.handle(0,{t:'input',dx:100,dy:0,x:99,capacity:99},1000);engine.tick(1/60,1001);assert.equal(p.x,1);assert.equal(p.capacity,1);
  engine.handle(0,{t:'input',dx:1,dy:0,bomb:true},1000);engine.tick(1/60,1001);assert(p.x>1);assert.equal(engine.game.bombs.length,1);
  engine.tick(1/60,1002);assert.equal(engine.game.bombs.length,1);
  const x=p.x;engine.tick(1/60,1700);assert.equal(p.x,x);
});
test('host migration, departure elimination, replay and empty room cleanup',()=>{
  const {engine}=setup(3);engine.handle(0,{t:'start'});engine.leave(0);assert.equal(engine.host,1);assert(!engine.game.players[0].alive);
  engine.leave(2);engine.tick();assert.match(engine.game.result,/Robot 1/);
  engine.handle(1,{t:'start'});assert(engine.game.result); // needs two peers
  engine.join('New',()=>{});engine.handle(1,{t:'start'});assert.equal(engine.game.result,null);assert.equal(engine.game.players.length,2);
  engine.leave(1);engine.leave(0);assert.equal(engine.game,null);assert.equal(engine.host,null);
});
test('room router keeps namespaces separate and checks same origin',async()=>{
  let roomName;const env={BOMB:{idFromName:name=>(roomName=name),get:()=>({fetch:()=>new Response('ok')})}};
  const url=new URL('https://example.test/__game/ws?g=bomb&room=ABCD');
  assert.equal((await handleGameSocket(new Request(url,{headers:{Origin:'https://example.test'}}),env,url)).status,200);assert.equal(roomName,'bomb:ABCD');
  assert.equal(handleGameSocket(new Request(url,{headers:{Origin:'https://evil.test'}}),env,url).status,403);
  assert.equal(handleGameSocket(new Request(url),{},url).status,501);
});
test('real WebSockets: four join, fifth rejected, shared simulation, host leaves, room expires',async()=>{
  const app=localServer(()=>'<html>test</html>');await new Promise(r=>app.server.listen(0,'127.0.0.1',r));
  const base=`ws://127.0.0.1:${app.server.address().port}/__game/ws?g=bomb&room=TEST`;
  const clients=[];
  const connect=async(suffix='')=>{
    const ws=new WebSocket(base+suffix),messages=[];ws.on('message',data=>messages.push(JSON.parse(data.toString())));
    await new Promise((resolve,reject)=>{ws.once('open',resolve);ws.once('error',reject);});clients.push(ws);return {ws,messages};
  };
  const until=async predicate=>{for(let i=0;i<100;i++){if(predicate())return;await new Promise(r=>setTimeout(r,20));}throw Error('WebSocket test timeout');};
  try{
    const peers=[await connect('&action=create&name=Host')];for(let i=0;i<3;i++)peers.push(await connect('&name=Guest'+i));
    await until(()=>peers.every(p=>p.messages.some(m=>m.t==='lobby'&&m.players.length===4)));
    await assert.rejects(connect(),/409/);
    peers[0].ws.send(JSON.stringify({t:'start',theme:'factory'}));await until(()=>peers.every(p=>p.messages.some(m=>m.t==='state')));
    const states=peers.map(p=>p.messages.find(m=>m.t==='state'));assert(states.every(m=>JSON.stringify(m)===JSON.stringify(states[0])));
    peers[3].ws.send(JSON.stringify({t:'input',dx:1,dy:0,bomb:true}));await until(()=>peers[0].messages.some(m=>m.t==='state'&&m.state.bombs.some(b=>b.owner===3)));
    await assert.rejects(connect(),/409/);
    peers[0].ws.close();await until(()=>peers[1].messages.some(m=>m.t==='lobby'&&m.host===1&&m.players.length===3));
    for(const p of peers)p.ws.close();await until(()=>clients.every(ws=>ws.readyState===3));
    await new Promise(r=>setTimeout(r,50));await assert.rejects(connect(),/404/);
  }finally{for(const ws of clients)ws.terminate();await app.close();}
});
