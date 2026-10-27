import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,step} from '../bomb-arena/state.js';
import {blast,makeMap,W,H} from '../bomb-arena/map.js';
import {place,updateBombs,damage} from '../bomb-arena/bombs.js';
import {move,canStand} from '../bomb-arena/collision.js';
import {danger,route,updateBots} from '../bomb-arena/ai.js';
import {collect,dropItem} from '../bomb-arena/items.js';
import {Input} from '../bomb-arena/input.js';
const game=()=>{const s=createGame({humans:2,bots:0},()=>.99);s.map=makeMap(()=>.99);return s;};
test('newest held direction turns immediately and releasing it restores the old direction',()=>{
  const input=Object.create(Input.prototype);input.keys=new Set(['KeyD','KeyW']);input.pointers=new Map();
  assert.deepEqual(input.direction(0),[0,-1]);input.keys.delete('KeyW');assert.deepEqual(input.direction(0),[1,0]);
  input.pointers.set(1,'KeyS');input.pointers.set(2,'Space');assert.deepEqual(input.direction(0),[0,1]);
  input.keys=new Set(['ArrowUp','ArrowLeft']);assert.deepEqual(input.direction(1),[-1,0]);
});
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
test('all players can cross bombs in both directions without changing walls',()=>{
  const s=game(),p=s.players[0],q=s.players[1];place(s,p);
  assert(canStand(s,p,1.2,1));assert(canStand(s,q,1,1));
  move(s,p,1,0,.3);assert(p.x>2);
  move(s,p,-1,0,.3);assert(Math.abs(p.x-1)<1e-8);
  q.x=3;q.y=1;move(s,q,-1,0,.4);assert(q.x<2);assert.equal(s.bombs.length,1);
  assert(!canStand(s,p,2,2));
});
test('shield consumes one hit, grants immunity through the same fire, then expires',()=>{
  const s=game(),p=s.players[0];p.shield=true;s.fire=[{x:1,y:1,t:2}];
  damage(s,.016);assert(p.alive);assert(!p.shield);assert(p.invincible>1);
  damage(s,.6);assert(p.alive);damage(s,.7);assert(!p.alive);
});
test('early and late corner turns align safely in all four directions',()=>{
  for(const [x,y,dx,dy] of [[2.55,1,0,1],[3.45,3,0,-1],[1,2.55,1,0],[3,3.45,-1,0]]) {
    for(const speed of [4.2,6.6]){
      const s=game(),p=s.players[0];Object.assign(p,{x,y,speed});
      for(let i=0;i<20;i++){move(s,p,dx,dy,1/60);assert(canStand(s,p,p.x,p.y));}
      if(dx){assert(Math.abs(p.y-3)<1e-8);assert((p.x-x)*dx>.6);}
      else {assert(Math.abs(p.x-3)<1e-8);assert((p.y-y)*dy>.6);}
    }
  }
});
test('running is faster, frame independent and cannot tunnel through a crate',()=>{
  const s=game(),p=s.players[0];assert.equal(p.speed,4.2);
  move(s,p,1,0,.1);assert(Math.abs(p.x-1.42)<1e-8);
  const other=game(),q=other.players[0];for(let i=0;i<6;i++)move(other,q,1,0,1/60);
  assert(Math.abs(p.x-q.x)<1e-8);
  s.map[1][3]=2;p.speed=6.6;move(s,p,1,0,1);assert(p.x<2.27);assert(canStand(s,p,p.x,p.y));
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
  assert.equal(p.capacity,6);assert.equal(p.range,8);assert.equal(p.speed,6.6);assert(p.shield);
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
  const map=makeMap(()=>0);assert.equal(map.length,15);assert.equal(map[0].length,21);
  for(const p of createGame({humans:4,bots:0}).players){
    const {x,y}=p;assert.equal(map[y][x],0);
    assert.equal(map[y][x===1?x+1:x-1],0);assert.equal(map[y===1?y+1:y-1][x],0);
    assert([1,W-2].includes(x)&&[1,H-2].includes(y));
  }
  const queue=[[1,1]],seen=new Set(['1,1']);
  for(const [x,y]of queue)for(const [dx,dy]of [[1,0],[-1,0],[0,1],[0,-1]]){const a=x+dx,b=y+dy,k=`${a},${b}`;if(map[b]?.[a]!==undefined&&map[b][a]!==1&&!seen.has(k)){seen.add(k);queue.push([a,b]);}}
  assert.equal(seen.size,map.flat().filter(v=>v!==1).length);
});
test('speed has 50% of item drops while overall crate drop chance remains 38%',()=>{
  const counts={speed:0,bomb:0,range:0,shield:0,none:0};
  for(let i=0;i<10000;i++){const rolls=[(i+.5)/10000,((i%100)+.5)/100];counts[dropItem(()=>rolls.shift())||'none']++;}
  assert.deepEqual(counts,{speed:1900,bomb:760,range:760,shield:380,none:6200});
});
test('bots complete simulated rounds without invalid positions or stalled logic',()=>{
  let seed=42;const random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/2**32;};
  const s=createGame({humans:1,bots:3,difficulty:'hard'},random);
  let placed=0;
  for(let i=0;i<10801&&!s.result;i++){updateBots(s,1/60);step(s,1/60);placed+=s.events.filter(e=>e==='place').length;s.events=[];for(const p of s.players)assert(Number.isFinite(p.x)&&Number.isFinite(p.y));}
  assert(s.result);assert(placed>3);
});
