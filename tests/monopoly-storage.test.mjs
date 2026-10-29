import test from 'node:test';
import assert from 'node:assert/strict';
import {readRoom,writeRoom,createState} from '../src/monopoly-service.generated.js';
test('long replay persists atomically in small chunks, resumes and clears on rematch',async()=>{
 let data=new Map(),transactions=0;
 const storage={get:async k=>structuredClone(data.get(k)),async transaction(fn){const draft=new Map(data);await fn({get:async k=>structuredClone(draft.get(k)),put:async(k,v)=>{assert.ok(Buffer.byteLength(JSON.stringify(v))<128000);draft.set(k,structuredClone(v));},delete:async k=>draft.delete(k)});data=draft;transactions++;}};
 const state=createState('ABCDEF',1);state.history=Array.from({length:2015},(_,i)=>({kind:'command',at:i,id:'p',command:{commandId:String(i),roomId:'ABCDEF',expectedVersion:i,type:'roll'}}));
 await writeRoom(storage,state);assert.equal(data.get('room').history.length,0);assert.deepEqual(await readRoom(storage),state);
 state.history.push({kind:'tick',at:9999});await writeRoom(storage,state);assert.deepEqual(await readRoom(storage),state);
 const next=createState('ABCDEF',2);await writeRoom(storage,next);assert.deepEqual(await readRoom(storage),next);assert.equal([...data.keys()].filter(k=>k.startsWith('replay:')).length,0);assert.equal(transactions,3);
});
