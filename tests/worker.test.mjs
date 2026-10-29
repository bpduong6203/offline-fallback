import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
// Node does not import Wrangler's HTML text modules. Adapt only that import in memory.
const entry=new URL('../worker.js',import.meta.url);
const html=await readFile(new URL('../src/page/games/Mini_Motorways.html',import.meta.url),'utf8');
const bangBangHtml=await readFile(new URL('../src/page/games/Bang_Bang.html',import.meta.url),'utf8');
const source=(await readFile(entry,'utf8'))
  .replace("import miniMotorways from './src/page/games/Mini_Motorways.html';",`const miniMotorways=${JSON.stringify(html)};`)
  .replace("import bangBang from './src/page/games/Bang_Bang.html';",`const bangBang=${JSON.stringify(bangBangHtml)};`)
  .replace(/from '(\.\/[^']+)'/g,(_,relative)=>`from '${new URL(relative,entry).href}'`);
const worker=(await import(`data:text/javascript;base64,${Buffer.from(source).toString('base64')}`)).default;
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
test('existing Mini Motorways route and fallback page remain available',async()=>{
  const response=await worker.fetch(new Request('https://example.test/__game/mini-motorways'));assert.equal(response.status,200);assert.equal(await response.text(),html);
  const {renderOffline}=await import('../src/page/render.js');
  const fallback=renderOffline(new Request('https://example.test/',{headers:{Accept:'text/html'}}));
  assert.equal(fallback.status,503);assert.match(await fallback.text(),/href="\/__game\/bomb-arena"/);
  assert.equal(renderOffline(new Request('https://example.test/api')).status,503);
});

test('Worker serves /__assets/ from R2 binding IMAGES and rejects invalid methods/paths', async () => {
  const env = {
    IMAGES: {
      async get(key) {
        if (key === 'egg_icon.webp') {
          return {
            body: new TextEncoder().encode('fake-webp-image'),
            httpEtag: '"mock-etag-webp"',
            httpMetadata: { contentType: 'image/webp' },
            writeHttpMetadata(headers) { headers.set('Content-Type', 'image/webp'); }
          };
        }
        return null;
      }
    }
  };

  // GET valid asset
  const res = await worker.fetch(new Request('https://example.test/__assets/egg_icon.webp'), env, {});
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Content-Type'), 'image/webp');
  assert.equal(res.headers.get('Cache-Control'), 'public, max-age=31536000, immutable');
  assert.equal(await res.text(), 'fake-webp-image');

  // HEAD valid asset
  const head = await worker.fetch(new Request('https://example.test/__assets/egg_icon.webp', { method: 'HEAD' }), env, {});
  assert.equal(head.status, 200);
  assert.equal(head.headers.get('Content-Type'), 'image/webp');
  assert.equal(await head.text(), '');

  // 404 for missing asset
  const missing = await worker.fetch(new Request('https://example.test/__assets/non-existent.png'), env, {});
  assert.equal(missing.status, 404);

  // 403 for path traversal
  const traversal = await worker.fetch(new Request('https://example.test/__assets/..%2fsecret'), env, {});
  assert.equal(traversal.status, 403);

  // 405 for POST
  const post = await worker.fetch(new Request('https://example.test/__assets/egg_icon.webp', { method: 'POST' }), env, {});
  assert.equal(post.status, 405);
  assert.equal(post.headers.get('Allow'), 'GET, HEAD');
});

