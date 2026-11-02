import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {localMerit} from '../scripts/local-merit.mjs';
// Node does not import Wrangler's HTML text modules. Adapt only that import in memory.
const entry=new URL('../worker.js',import.meta.url);
const html=await readFile(new URL('../src/page/games/Mini_Motorways.html',import.meta.url),'utf8');
const bangBangHtml=await readFile(new URL('../src/page/games/Bang_Bang.html',import.meta.url),'utf8');
const chibiRushHtml=await readFile(new URL('../src/page/games/chibi-rush.html',import.meta.url),'utf8');
const partyCatsHtml=await readFile(new URL('../src/page/games/party-cats.html',import.meta.url),'utf8');
const towerCityHtml=await readFile(new URL('../src/page/games/tower-city.html',import.meta.url),'utf8');
const coCaNguaHtml=await readFile(new URL('../src/page/games/co-ca-ngua.html',import.meta.url),'utf8');
const chuaMebiHtml=await readFile(new URL('../src/page/games/chua-mebi.html',import.meta.url),'utf8');
const source=(await readFile(entry,'utf8'))
  .replace("import chuaMebi from './src/page/games/chua-mebi.html';",`const chuaMebi=${JSON.stringify(chuaMebiHtml)};`)
  .replace("import coCaNgua from './src/page/games/co-ca-ngua.html';",`const coCaNgua=${JSON.stringify(coCaNguaHtml)};`)
  .replace("import miniMotorways from './src/page/games/Mini_Motorways.html';",`const miniMotorways=${JSON.stringify(html)};`)
  .replace("import bangBang from './src/page/games/Bang_Bang.html';",`const bangBang=${JSON.stringify(bangBangHtml)};`)
  .replace("import chibiRush from './src/page/games/chibi-rush.html';",`const chibiRush=${JSON.stringify(chibiRushHtml)};`)
  .replace("import partyCats from './src/page/games/party-cats.html';",`const partyCats=${JSON.stringify(partyCatsHtml)};`)
  .replace("import towerCity from './src/page/games/tower-city.html';",`const towerCity=${JSON.stringify(towerCityHtml)};`)
  .replace(/from '(\.\/[^']+)'/g,(_,relative)=>`from '${new URL(relative,entry).href}'`);
const worker=(await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;

test('same Worker serves Xi Dach, merit.js and shared merit API',async t=>{
 const env=localMerit();t.after(()=>env.close());
 const html=await (await worker.fetch(new Request('https://game.mebidev.site/xi-dach'),env)).text();
 assert.ok(html.indexOf('src="/merit.js"')<html.indexOf('window.MebiMerit.ready'));
 const script=await worker.fetch(new Request('https://game.mebidev.site/merit.js'),env);
 assert.equal(script.status,200);assert.match(script.headers.get('Content-Type'),/javascript/);assert.match(await script.text(),/fetch\('\/api\/merit'/);
 const first=await worker.fetch(new Request('https://game.mebidev.site/api/merit'),env);
 const cookie=first.headers.get('Set-Cookie').split(';')[0];assert.equal((await first.json()).balance,0);
 const changed=await worker.fetch(new Request('https://game.mebidev.site/api/merit',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({delta:2000,legacyImport:true})}),env);
 assert.equal((await changed.json()).balance,2000);
 const other=await worker.fetch(new Request('https://other.mebidev.site/api/merit',{headers:{Cookie:cookie}}),env);
 assert.equal((await other.json()).balance,2000);
 let joinedProfile;
 env.XIDACH={idFromName:name=>name,get:name=>({fetch:async request=>{assert.equal(name,'merit:matchmaker');joinedProfile=await request.json();return Response.json({room:'ABC234'});}})};
 const match=await worker.fetch(new Request('https://game.mebidev.site/__game/xi-dach/match',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify({name:'Display name',meritId:'forged-id'})}),env);
 assert.equal(match.status,200);assert.equal(joinedProfile.meritId,cookie.split('=')[1]);
 assert.notEqual(joinedProfile.meritId,joinedProfile.name);
});

test('Worker serves Xì Dách and validates login, room and socket origin',async()=>{
 for(const route of ['/xi-dach','/xi-dach/','/__game/xi-dach']){
  const response=await worker.fetch(new Request('https://example.test'+route));assert.equal(response.status,200);assert.match(await response.text(),/Xì Dách · Bàn Công đức/);
  assert.equal((await worker.fetch(new Request('https://example.test'+route,{method:'HEAD'}))).status,200);
  assert.equal((await worker.fetch(new Request('https://example.test'+route,{method:'POST'}))).status,405);
  assert.equal((await worker.fetch(new Request('https://example.test'+route),{HOME_SESSION_SECRET:'test'})).status,302);
 }
 const ws='https://example.test/__game/xi-dach/ws?room=ABC234';
 assert.equal((await worker.fetch(new Request(ws))).status,426);
 assert.equal((await worker.fetch(new Request(ws,{headers:{Upgrade:'websocket',Origin:'https://evil.test'}}))).status,403);
 assert.equal((await worker.fetch(new Request(ws,{headers:{Upgrade:'websocket'}}),{HOME_SESSION_SECRET:'test'})).status,401);
 assert.equal((await worker.fetch(new Request(ws.replace('ABC234','invalid'),{headers:{Upgrade:'websocket'}}))).status,400);
 const env={MERIT:{},XIDACH:{idFromName:room=>{assert.equal(room,'merit:ABC234');return room;},get:()=>({fetch:async()=>new Response('socket target')})}};
 assert.equal(await (await worker.fetch(new Request(ws,{headers:{Upgrade:'websocket',Cookie:'mebi_merit_id=11111111-1111-1111-1111-111111111111'}}),env)).text(),'socket target');
});

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


