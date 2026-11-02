import {localMerit} from './local-merit.mjs';
import {MERIT_CLIENT_SCRIPT,handleMeritRequest,getMeritIdentity} from '../src/mebi-merit-api.js';
import {meritWallet} from '../xi-dach/merit-wallet.js';
import {WebSocketServer} from 'ws';
import {autoJoin,roomCode} from '../src/xi-dach-room.js';
import {XiDachService} from '../xi-dach/service.js';
import {buildXiDach} from './build-xidach.mjs';
export function localXiDach(){
  const merit=localMerit(),wallet=meritWallet(merit);
  const rooms=new Map(),wss=new WebSocketServer({noServer:true,maxPayload:2048});
  let matchIndex=0,matchQueue=Promise.resolve();
  const timer=setInterval(()=>{for(const service of rooms.values())service.tick().catch(console.error);},100);
  return {
    async http(req,res){const path=req.url?.split('?')[0];
      if(path==='/merit.js'){res.writeHead(200,{'Content-Type':'application/javascript'});res.end(MERIT_CLIENT_SCRIPT);return true;}
      if(path==='/api/merit'||path==='/api/merit/reward'){let body='';for await(const chunk of req)body+=chunk;const result=await handleMeritRequest(new Request('http://'+req.headers.host+req.url,{method:req.method,headers:req.headers,...(req.method==='POST'?{body}:{})}),merit);res.writeHead(result.status,Object.fromEntries(result.headers));res.end(await result.text());return true;}
if(path==='/__game/xi-dach/match'){
      if(req.method!=='POST'){res.writeHead(405);res.end();return true;}
      let body='';for await(const chunk of req)body+=chunk;
      const identity=await getMeritIdentity(new Request('http://'+req.headers.host+req.url,{headers:req.headers}),merit);
      const profile={...JSON.parse(body),meritId:identity.id};if(identity.cookie)res.setHeader('Set-Cookie',identity.cookie);
      const job=matchQueue.then(async()=>{for(;;){const code=roomCode(matchIndex);let service=rooms.get(code);if(!service){service=new XiDachService(code,{wallet});rooms.set(code,service);}const result=await service.serial(()=>autoJoin(service,profile));if(result.status===409){matchIndex++;continue;}res.writeHead(result.status,{'Content-Type':'application/json'});res.end(await result.text());break;}});matchQueue=job.catch(()=>{});await job;return true;}
if(!['/xi-dach','/xi-dach/','/__game/xi-dach'].includes(path))return false;if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return true;}try{const html=await buildXiDach();res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?null:html);}catch(e){console.error(e);res.writeHead(500);res.end('Build failed');}return true;},
    upgrade(req,socket,head){const url=new URL(req.url,'http://'+req.headers.host);if(url.pathname!=='/__game/xi-dach/ws')return false;const reject=()=>socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host){reject();return true;}}catch{reject();return true;}}
      const room=url.searchParams.get('room');if(!/^[A-HJ-NP-Z2-9]{6}$/.test(room||'')){reject();return true;}
      let service=rooms.get(room);if(!service){service=new XiDachService(room,{wallet});rooms.set(room,service);}if(service.peers.size>=24){reject();return true;}
      getMeritIdentity(new Request(url,{headers:req.headers}),merit).then(identity=>wss.handleUpgrade(req,socket,head,ws=>{const peer=service.connect(message=>{if(ws.readyState===1)ws.send(JSON.stringify(message));},()=>ws.close(1008),identity.id);const handshake=setTimeout(()=>{if(!peer.id)ws.close(1008);},10000);ws.on('message',(data,binary)=>{if(binary)return;let message;try{message=JSON.parse(data.toString());}catch{return;}service.receive(peer,message).catch(console.error);});ws.on('close',()=>{clearTimeout(handshake);service.disconnect(peer);});ws.on('error',()=>service.disconnect(peer));})).catch(()=>reject());return true;},
    close(){clearInterval(timer);for(const ws of wss.clients)ws.terminate();wss.close();merit.close();}
  };
}
