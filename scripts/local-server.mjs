import {createServer} from 'node:http';
import {WebSocketServer} from 'ws';
import {BombRoomEngine} from '../src/bomb-room-engine.js';
import {buildStickman} from './build-stickman.mjs';
import {StickmanRoomEngine} from '../src/stickman-room-engine.js';
import {renderBusJamPage} from '../src/page/games/bus-jam.html.js';

export function localServer(getHtml){
  const rooms=new Map(),wss=new WebSocketServer({noServer:true,maxPayload:512});
  const server=createServer(async(req,res)=>{
    const path=req.url?.split('?')[0];
    if(['/__game/bus-escape','/bus-escape'].includes(path)){try{const html=renderBusJamPage();res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?null:html);}catch(e){console.error(e);res.writeHead(500);res.end('Bus Jam render failed');}return;}
    if(['/stickman-fight','/stickman-fight/','/__game/stickman-fight'].includes(path)){try{const html=await buildStickman();res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(req.method==='HEAD'?null:html);}catch(e){console.error(e);res.writeHead(500);res.end('Build failed');}return;}
    if(!['/','/__game/bomb-arena'].includes(path)){res.writeHead(404);res.end('Not found');return;}
    try{const html=await getHtml();res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'});res.end(html);}catch(e){console.error(e);res.writeHead(500);res.end('Build failed');}
  });
  server.on('upgrade',(req,socket,head)=>{
    const url=new URL(req.url,'http://'+req.headers.host),code=(url.searchParams.get('room')||'').toUpperCase(),create=url.searchParams.get('action')==='create';
    const reject=(status,text)=>{socket.end(`HTTP/1.1 ${status} ${text}\r\nConnection: close\r\n\r\n`);};
    if(req.headers.origin){try{if(new URL(req.headers.origin).host!==req.headers.host)return reject(403,'Forbidden');}catch{return reject(403,'Forbidden');}}
    const game=url.searchParams.get('g'),stickman=game==='stickman',key=game+':'+code;
    if(url.pathname!=='/__game/ws'||!['bomb','stickman'].includes(game)||!/^[A-Z0-9]{4}$/.test(code))return reject(400,'Bad Request');
    let room=rooms.get(key);
    if(create&&room)return reject(409,'Room exists');
    if(!create&&!room)return reject(404,'Room not found');
    const playing=()=>!!room.engine.game&&(stickman?room.engine.playing():!room.engine.game.result);
    if(room&&(room.engine.peers.size>=(stickman?2:4)||playing()))return reject(409,'Room unavailable');
    if(!room){room={engine:stickman?new StickmanRoomEngine():new BombRoomEngine(),timer:null};rooms.set(key,room);}
    wss.handleUpgrade(req,socket,head,ws=>{
      const send=message=>{if(ws.readyState===1)ws.send(JSON.stringify(message));};
      const id=room.engine.join(url.searchParams.get('name'),send);
      let left=false,count=0,windowStart=Date.now();
      const leave=()=>{if(left)return;left=true;room.engine.leave(id);if(!room.engine.peers.size){clearInterval(room.timer);rooms.delete(key);}};
      ws.on('close',leave);ws.on('error',leave);
      ws.on('message',(data,binary)=>{
        if(binary)return;const now=Date.now();if(now-windowStart>1000){windowStart=now;count=0;}if(++count>90){ws.close(1008,'Too many messages');leave();return;}
        let message;try{message=JSON.parse(data.toString());}catch{return;}
        room.engine.handle(id,message,now);
        if(playing()&&!room.timer){
          let last=now,accumulator=0,frames=0;
          room.timer=setInterval(()=>{
            const now=Date.now();accumulator+=Math.min(.1,(now-last)/1000);last=now;
            while(accumulator>=1/60){room.engine.tick(1/60,now);accumulator-=1/60;}
            if(++frames%3===0||!playing())room.engine.snapshot();
            if(!playing()){clearInterval(room.timer);room.timer=null;}
          },1000/60);
        }
      });
    });
  });
  return {server,close:async()=>{for(const room of rooms.values())clearInterval(room.timer);for(const ws of wss.clients)ws.terminate();wss.close();await new Promise(resolve=>server.close(resolve));}};
}
