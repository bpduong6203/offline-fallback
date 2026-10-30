import {WebSocketServer} from 'ws';
import {XiDachService} from '../xi-dach/service.js';
import {buildXiDach} from './build-xidach.mjs';
export function localXiDach(){
  const rooms=new Map(),wss=new WebSocketServer({noServer:true,maxPayload:2048});
  const timer=setInterval(()=>{for(const service of rooms.values())service.tick().catch(console.error);},100);
  return {
    async http(req,res){const path=req.url?.split('?')[0];if(!['/xi-dach','/xi-dach/','/__game/xi-dach'].includes(path))return false;if(!['GET','HEAD'].includes(req.method)){res.writeHead(405,{Allow:'GET, HEAD'});res.end();return true;}try{const html=await buildXiDach();res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?null:html);}catch(e){console.error(e);res.writeHead(500);res.end('Build failed');}return true;},
    upgrade(req,socket,head){const url=new URL(req.url,'http://'+req.headers.host);if(url.pathname!=='/__game/xi-dach/ws')return false;const reject=()=>socket.end('HTTP/1.1 400 Bad Request\r\nConnection: close\r\n\r\n');if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host){reject();return true;}}catch{reject();return true;}}
      const room=url.searchParams.get('room');if(!/^[A-HJ-NP-Z2-9]{6}$/.test(room||'')){reject();return true;}
      let service=rooms.get(room);if(!service){service=new XiDachService(room);rooms.set(room,service);}if(service.peers.size>=24){reject();return true;}
      wss.handleUpgrade(req,socket,head,ws=>{const peer=service.connect(message=>{if(ws.readyState===1)ws.send(JSON.stringify(message));},()=>ws.close(1008));const handshake=setTimeout(()=>{if(!peer.id)ws.close(1008);},10000);ws.on('message',(data,binary)=>{if(binary)return;let message;try{message=JSON.parse(data.toString());}catch{return;}service.receive(peer,message).catch(console.error);});ws.on('close',()=>{clearTimeout(handshake);service.disconnect(peer);});ws.on('error',()=>service.disconnect(peer));});return true;},
    close(){clearInterval(timer);for(const ws of wss.clients)ws.terminate();wss.close();}
  };
}
