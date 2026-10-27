import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,step} from '../bomb-arena/state.js';
import {blast,makeMap} from '../bomb-arena/map.js';
import {place,updateBombs,damage} from '../bomb-arena/bombs.js';
import {move,canStand} from '../bomb-arena/collision.js';
import {danger,route,updateBots} from '../bomb-arena/ai.js';
import {collect} from '../bomb-arena/items.js';
const game=()=>{const s=createGame({humans:2,bots:0},()=>.99);s.map=makeMap(()=>.99);return s;};
test('blast stops at walls and includes only the first crate',()=>{
  const s=game();s.map[1][4]=2;s.map[3][3]=1;
  const cells=blast(s.map,{x:3,y:1,range:8}).map(p=>p.join(','));
  assert(cells.includes('4,1'));assert(!cells.includes('5,1'));assert(!cells.includes('3,3'));assert(!cells.includes('3,4'));
});
test('bomb capacity is released after explosion and chain reactions are immediate',()=>{
  const s=game(),p=s.players[0],q=s.players[1];q.x=3;q.y=1;
  assert(place(s,p));assert(!place(s,p));assert(place(s,q));s.bombs[0].t=.01;
  updateBombs(s,.02);assert.equal(s.bombs.length,0);assert(s.fire.some(f=>f.x===5&&f.y===1));
  assert(place(s,p));
});
test('owner can leave a bomb but cannot re-enter; other players are blocked',()=>{
  const s=game(),p=s.players[0],q=s.players[1];place(s,p);
  assert(canStand(s,p,1.2,1));assert(!canStand(s,q,1,1));
  for(let i=0;i<25;i++)move(s,p,1,0,1/60);
  assert(p.x>1.79);assert(!s.bombs[0].pass.has(p.id));assert(!canStand(s,p,1.5,1));
});
test('shield consumes one hit, grants immunity through the same fire, then expires',()=>{
  const s=game(),p=s.players[0];p.shield=true;s.fire=[{x:1,y:1,t:2}];
  damage(s,.016);assert(p.alive);assert(!p.shield);assert(p.invincible>1);
  damage(s,.6);assert(p.alive);damage(s,.7);assert(!p.alive);
});
test('simultaneous deaths produce a draw after all damage is resolved',()=>{
  const s=game();s.fire=s.players.map(p=>({x:p.x,y:p.y,t:.5}));step(s,1/60);
  assert(s.players.every(p=>!p.alive));assert.match(s.result,/Hòa/);
});
test('last survivor wins; timeout with multiple survivors draws',()=>{
  const s=game();s.fire=[{x:1,y:1,t:.5}];step(s,1/60);assert.match(s.result,/Người chơi 2/);
  const t=game();t.time=.01;step(t,.02);assert.match(t.result,/hòa/);
});
test('active fire kills on subsequent ticks, destroyed crate blocks simultaneous fire',()=>{
  const s=game();s.map[1][3]=2;s.players[0].x=5;
  s.bombs=[{x:1,y:1,range:8,t:0,pass:new Set(),owner:0},{x:2,y:1,range:8,t:0,pass:new Set(),owner:1}];
  updateBombs(s,.01);assert.equal(s.map[1][3],0);assert(!s.fire.some(f=>f.x===4&&f.y===1));
  s.players[0].x=3;damage(s,.01);assert(!s.players[0].alive);
});
test('powerups have caps and shields can be collected',()=>{
  const s=game(),p=s.players[0];
  for(const type of ['bomb','range','speed','shield'])for(let i=0;i<30;i++){s.items.push({x:1,y:1,type});collect(s,p);}
  assert.equal(p.capacity,6);assert.equal(p.range,8);assert.equal(p.speed,5);assert(p.shield);
});
test('danger prediction propagates chain reaction timing',()=>{
  const s=game();s.bombs=[{x:1,y:1,range:2,t:.3},{x:3,y:1,range:2,t:2.5}];
  assert.equal(danger(s).get('5,1')[0][0],.3);
});
test('BFS finds a safe escape from a newly placed bomb',()=>{
  const s=game(),p=s.players[0];place(s,p);const zones=danger(s);
  const path=route(s,p,zones,n=>!zones.has(`${n.x},${n.y}`),s.bombs,2.1);
  assert(path?.length);assert(path.length/p.speed<2.5);
});
test('all spawn exits are free and traversable map is connected after crates break',()=>{
  const map=makeMap(()=>0);for(const [x,y]of [[1,1],[13,1],[1,11],[13,11]])assert.equal(map[y][x],0);
  const queue=[[1,1]],seen=new Set(['1,1']);
  for(const [x,y]of queue)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,k=`${a},${b}`;if(map[b]?.[a]!==undefined&&map[b][a]!==1&&!seen.has(k)){seen.add(k);queue.push([a,b]);}}
  assert.equal(seen.size,map.flat().filter(v=>v!==1).length);
});
test('bots complete simulated rounds without invalid positions or stalled logic',()=>{
  let seed=42;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
  const s=createGame({humans:1,bots:3,difficulty:'hard'},random);
  let placed=0;
  for(let i=0;i<10801&&!s.result;i++){updateBots(s,1/60);step(s,1/60);placed+=s.events.filter(e=>e==='place').length;s.events=[];for(const p of s.players)assert(Number.isFinite(p.x)&&Number.isFinite(p.y));}
  assert(s.result);assert(placed>3);
});
