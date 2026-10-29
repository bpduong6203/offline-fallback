import {RoomService,createState} from '../src/monopoly-service.generated.js';
import {readFile,writeFile,mkdir,rename} from 'node:fs/promises';
import {WebSocketServer} from 'ws';
// Same service as the Worker; local snapshots survive process restarts.
export function localMonopoly(server,{directory=new URL('../.monopoly-local/',import.meta.url),onRoom=()=>{}}={}){
 const rooms=new Map(),wss=new WebSocketServer({noServer:true,maxPayload:8192});let chain=Promise.resolve();
 const serial=fn=>{const task=chain.then(fn);chain=task.catch(()=>{});return task;};
 async function room(code){if(rooms.has(code))return rooms.get(code);await mkdir(directory,{recursive:true});const file=new URL(code+'.json',directory);let state;try{state=JSON.parse(await readFile(file,'utf8'));for(const p of state.players)if(p.connected){p.connected=false;p.offline=Date.now();p.ready=false;}state.allOffline ||= Date.now();}catch(e){if(e.code!=='ENOENT')throw e;state=createState(code);}
  const service=new RoomService(state,async s=>{const tmp=new URL(code+'.tmp',directory);await writeFile(tmp,JSON.stringify(s));await rename(tmp,file);},async()=>{});rooms.set(code,service);onRoom(service,serial);return service;
 }
 const timer=setInterval(()=>serial(async()=>{for(const service of rooms.values())await service.tick();}).catch(console.error),1000);timer.unref();
 // Load persisted rooms so timers run even before any client reconnects.
 import('node:fs/promises').then(async({readdir})=>{await mkdir(directory,{recursive:true});for(const f of await readdir(directory))if(/^[A-HJ-NP-Z2-9]{6}\.json$/.test(f))await serial(()=>room(f.slice(0,6)));}).catch(console.error);
 const match=url=>url.pathname.match(/^\/api\/monopoly\/([A-HJ-NP-Z2-9]{6})\/(create|join|resume|socket)$/);
 async function http(req,res){const url=new URL(req.url,'http://'+req.headers.host);if(!url.pathname.startsWith('/api/monopoly/'))return false;
  const m=match(url);if(!m){res.writeHead(400);res.end(JSON.stringify({error:'Mã phòng không hợp lệ'}));return true;}
  if(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host){res.writeHead(403);res.end();return true;}
  let body='',large=false;for await(const chunk of req){body+=chunk;if(body.length>1024){large=true;break;}}
  if(large){res.writeHead(413);res.end();return true;}
  await serial(async()=>{const service=await room(m[1]);const response=await service.request(new Request(url,{method:req.method,headers:{'Content-Type':'application/json'},body:req.method==='POST'?body:undefined}));res.writeHead(response.status,{'Content-Type':'application/json'});res.end(await response.text());});return true;
 }
 function upgrade(req,socket,head){const url=new URL(req.url,'http://'+req.headers.host);if(!url.pathname.startsWith('/api/monopoly/'))return false;const m=match(url);if(!m||m[2]!=='socket'||(req.headers.origin&&new URL(req.headers.origin).host!==req.headers.host)){socket.end('HTTP/1.1 403 Forbidden\r\n\r\n');return true;}
  serial(async()=>{const service=await room(m[1]);if(service.peers.size>=8){socket.end('HTTP/1.1 429 Too Many Requests\r\n\r\n');return;}wss.handleUpgrade(req,socket,head,ws=>{
   const timeout=setTimeout(()=>{if(!service.peers.has(ws))ws.close(1008,'Cần xác thực');},5000);
   ws.on('message',(data,binary)=>serial(async()=>{try{if(binary)throw Error('Dữ liệu không hợp lệ');await service.message(ws,data.toString());clearTimeout(timeout);}catch(e){ws.send(JSON.stringify({type:'error',error:e.message}));if(!service.peers.has(ws))ws.close(1008,'Phiên không hợp lệ');else ws.send(JSON.stringify({type:'state',state:(await import('../src/monopoly-service.generated.js')).snapshot?.(service.state)}));}}));
   ws.on('close',()=>{clearTimeout(timeout);serial(()=>service.disconnect(ws));});ws.on('error',()=>{});
  });});return true;
 }
 return {http,upgrade,async close(){clearInterval(timer);for(const ws of wss.clients)ws.terminate();wss.close();await chain;}};
}
