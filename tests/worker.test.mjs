import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// Node does not import Wrangler's HTML text modules. Adapt only that import in memory.
const entry=new URL('../worker.js',import.meta.url);
const html=await readFile(new URL('../src/page/games/Mini_Motorways.html',import.meta.url),'utf8');
const bangBangHtml=await readFile(new URL('../src/page/games/Bang_Bang.html',import.meta.url),'utf8');
const chibiRushHtml=await readFile(new URL('../src/page/games/chibi-rush.html',import.meta.url),'utf8');
const partyCatsHtml=await readFile(new URL('../src/page/games/party-cats.html',import.meta.url),'utf8');
const towerCityHtml=await readFile(new URL('../src/page/games/tower-city.html',import.meta.url),'utf8');
const source=(await readFile(entry,'utf8'))
  .replace("import miniMotorways from './src/page/games/Mini_Motorways.html';",`const miniMotorways=${JSON.stringify(html)};`)
  .replace("import bangBang from './src/page/games/Bang_Bang.html';",`const bangBang=${JSON.stringify(bangBangHtml)};`)
  .replace("import chibiRush from './src/page/games/chibi-rush.html';",`const chibiRush=${JSON.stringify(chibiRushHtml)};`)
  .replace("import partyCats from './src/page/games/party-cats.html';",`const partyCats=${JSON.stringify(partyCatsHtml)};`)
  .replace("import towerCity from './src/page/games/tower-city.html';",`const towerCity=${JSON.stringify(towerCityHtml)};`)
  .replace(/from '(\.\/[^']+)'/g,(_,relative)=>`from '${new URL(relative,entry).href}'`);
const worker=(await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;

test('Worker handles R2 image requests before origin fallback and denies uploads',async()=>{
 const env={IMAGES:{get:async()=>null}};
 assert.equal((await worker.fetch(new Request('https://example.test/__assets/images/missing.webp'),env)).status,404);
 assert.equal((await worker.fetch(new Request('https://example.test/__assets/images/egg.webp',{method:'PUT'}),env)).status,405);
 assert.equal((await worker.fetch(new Request('https://example.test/__assets/private/file.webp'),env)).status,400);
});

test('Worker serves Tỷ Phú Mebi, matches launcher style, guards room API origin',async()=>{
 for(const route of ['/ty-phu','/ty-phu/','/__game/mebi-monopoly']){
  const r=await worker.fetch(new Request('https://example.test'+route));assert.equal(r.status,200);assert.match(await r.text(),/<title>Tỷ Phú Mebi<\/title>/);
  assert.equal((await worker.fetch(new Request('https://example.test'+route,{method:'POST'}))).status,405);
 }
 assert.equal((await worker.fetch(new Request('https://example.test/api/monopoly/ABCDEF/join',{method:'POST',headers:{Origin:'https://other.test'}}))).status,403);
 assert.equal((await worker.fetch(new Request('https://example.test/api/monopoly/000000/join',{method:'POST'}))).status,400);
 const {renderOffline}=await import('../src/page/render.js');assert.match(await renderOffline(new Request('https://example.test/',{headers:{Accept:'text/html'}})).text(),/class="tab tab-link" href="\/ty-phu"/);
});
test('Worker serves isolated Stickman routes and rejects writes',async()=>{
  for(const route of ['/stickman-fight','/stickman-fight/','/__game/stickman-fight']){
    const response=await worker.fetch(new Request('https://example.test'+route));assert.equal(response.status,200);assert.match(await response.text(),/Stickman Showdown/);
    const head=await worker.fetch(new Request('https://example.test'+route,{method:'HEAD'}));assert.equal(head.status,200);assert.equal(await head.text(),'');
    const post=await worker.fetch(new Request('https://example.test'+route,{method:'POST'}));assert.equal(post.status,405);
  }
});
test('Worker serves Bomb Arena GET/HEAD and rejects writes independently of origin',async()=>{
  for(const method of ['GET','HEAD']){
    const response=await worker.fetch(new Request('https://example.test/__game/bomb-arena',{method}));
    assert.equal(response.status,200);assert.match(response.headers.get('Content-Type'),/text\/html/);
    const body=await response.text();if(method==='HEAD')assert.equal(body,'');else assert.match(body,/BOMB/);
  }
  const rejected=await worker.fetch(new Request('https://example.test/__game/bomb-arena',{method:'POST'}));assert.equal(rejected.status,405);
});
test('Worker serves Tiến Lên Miền Nam routes and rejects writes',async()=>{
  for(const route of ['/tien-len','/tien-len/','/__game/tien-len']){
    const response=await worker.fetch(new Request('https://example.test'+route));
    assert.equal(response.status,200);
    assert.match(await response.text(),/TIẾN LÊN MIỀN NAM/);
    const head=await worker.fetch(new Request('https://example.test'+route,{method:'HEAD'}));
    assert.equal(head.status,200);
    assert.equal(await head.text(),'');
    const post=await worker.fetch(new Request('https://example.test'+route,{method:'POST'}));
    assert.equal(post.status,405);
  }
});
test('Worker serves UNO Arena routes and rejects writes',async()=>{
  for(const route of ['/uno','/uno/','/__game/uno']){
    const response=await worker.fetch(new Request('https://example.test'+route));
    assert.equal(response.status,200);
    assert.match(await response.text(),/UNO ARENA/);
    const head=await worker.fetch(new Request('https://example.test'+route,{method:'HEAD'}));
    assert.equal(head.status,200);
    assert.equal(await head.text(),'');
    const post=await worker.fetch(new Request('https://example.test'+route,{method:'POST'}));
    assert.equal(post.status,405);
  }
});
test('Worker serves Tower City routes and rejects writes',async()=>{
  for(const route of ['/tower-city','/tower-city/','/__game/tower-city']){
    const response=await worker.fetch(new Request('https://example.test'+route));
    assert.equal(response.status,200);
    assert.match(await response.text(),/<title>Tower City<\/title>/);
    const head=await worker.fetch(new Request('https://example.test'+route,{method:'HEAD'}));
    assert.equal(head.status,200);
    assert.equal(await head.text(),'');
    const post=await worker.fetch(new Request('https://example.test'+route,{method:'POST'}));
    assert.equal(post.status,405);
  }
  const {renderOffline}=await import('../src/page/render.js');
  assert.match(await renderOffline(new Request('https://example.test/',{headers:{Accept:'text/html'}})).text(),/class="tab tab-link" href="\/tower-city"/);
});
test('existing Mini Motorways route and fallback page remain available',async()=>{
  const response=await worker.fetch(new Request('https://example.test/__game/mini-motorways'));assert.equal(response.status,200);assert.equal(await response.text(),html);
  const {renderOffline}=await import('../src/page/render.js');
  const fallback=renderOffline(new Request('https://example.test/',{headers:{Accept:'text/html'}}));
  assert.equal(fallback.status,503);assert.match(await fallback.text(),/href="\/__game\/bomb-arena"/);
  assert.equal(renderOffline(new Request('https://example.test/api')).status,503);
});


