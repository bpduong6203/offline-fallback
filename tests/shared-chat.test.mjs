import test from 'node:test';
import assert from 'node:assert/strict';
import {SharedChatRoom} from '../src/shared-chat-room.js';
import {handleChat,injectChatHtml} from '../src/shared-chat.js';
function setup(){const data=new Map();const ctx={blockConcurrencyWhile:fn=>fn(),storage:{get:async key=>structuredClone(data.get(key)),put:async(key,value)=>{data.set(key,structuredClone(value));}}};const room=new SharedChatRoom(ctx);return {room,ctx,env:{CHAT:{idFromName:name=>{assert.equal(name,'global');return name;},get:()=>room}}};}
function post(room,sender,text='Hello',id=crypto.randomUUID()){return room.fetch(new Request('https://internal/messages',{method:'POST',headers:{'X-Mebi-Chat-Identity':sender},body:JSON.stringify({name:'Guest',text,requestId:id})}));}
test('shared chat persists bounded history and deduplicates retries before applying rate limit',async()=>{
 const {room,ctx}=setup(),id=crypto.randomUUID();
 assert.equal((await post(room,'one','First',id)).status,200);
 assert.equal((await post(room,'one','First',id)).status,200);
 assert.equal((await post(room,'one','Second')).status,429);
 for(let i=0;i<102;i++)assert.equal((await post(room,'user'+i,'Message '+i)).status,200);
 const restored=new SharedChatRoom(ctx),response=await restored.fetch(new Request('https://internal/messages'));
 const {messages}=await response.json();assert.equal(messages.length,100);assert.equal(messages.at(-1).text,'Message 101');assert.equal(messages[0].text,'Message 2');assert.equal(messages[0].sender,undefined);
});
test('shared chat refuses invalid messages and keeps literal text rather than executable markup',async()=>{
 const {room}=setup();assert.equal((await post(room,'one',' ')).status,400);assert.equal((await post(room,'one','x'.repeat(301))).status,400);
 const result=await (await post(room,'one','<img src=x onerror=alert(1)>')).json();assert.equal(result.messages[0].text,'<img src=x onerror=alert(1)>');
});
test('different subdomains reach the same chat, enforce origin/auth and ignore forged identity',async()=>{
 const {env}=setup();const initial=await handleChat(new Request('https://a.mebidev.site/api/chat'),env),cookie=initial.headers.get('Set-Cookie').split(';')[0];
 const message={name:'A',text:'Across games',requestId:crypto.randomUUID(),identity:'forged'};
 const response=await handleChat(new Request('https://a.mebidev.site/api/chat',{method:'POST',headers:{Cookie:cookie,'Content-Type':'application/json'},body:JSON.stringify(message)}),env);assert.equal(response.status,200);
 const other=await handleChat(new Request('https://b.mebidev.site/api/chat',{headers:{Cookie:cookie}}),env);assert.equal((await other.json()).messages[0].text,'Across games');
 const forbidden=await handleChat(new Request('https://a.mebidev.site/api/chat',{headers:{Origin:'https://evil.test'}}),env);assert.equal(forbidden.status,403);
 assert.equal((await handleChat(new Request('https://a.mebidev.site/api/chat'),{...env,HOME_SESSION_SECRET:'test'})).status,401);
 assert.equal((await handleChat(new Request('https://a.mebidev.site/api/chat'),{})).status,503);
});
test('chat injection is idempotent and preserves existing page markup',()=>{
 const html='<html><body><main>Game</main></body></html>',injected=injectChatHtml(html);assert.ok(injected.includes('<main>Game</main>'));assert.equal(injectChatHtml(injected),injected);assert.ok(injected.includes('src="/shared-chat.js"'));
});
