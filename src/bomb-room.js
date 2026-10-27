import {BombRoomEngine} from './bomb-room-engine.js';

export class BombRoom {
  constructor(){this.engine=new BombRoomEngine();this.timer=null;this.created=false;}
  async fetch(request){
    if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('Expected WebSocket',{status:426});
    const url=new URL(request.url),create=url.searchParams.get('action')==='create';
    if(create&&this.engine.peers.size)return new Response('Room exists',{status:409});
    if(!create&&(!this.created||!this.engine.peers.size))return new Response('Room not found',{status:404});
    if(this.engine.peers.size>=4)return new Response('Room full',{status:409});
    if(this.engine.game&&!this.engine.game.result)return new Response('Match in progress',{status:409});
    const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();this.created=true;
    const send=message=>server.send(JSON.stringify(message));
    const id=this.engine.join(url.searchParams.get('name'),send);
    let departed=false,count=0,windowStart=Date.now();
    const leave=()=>{if(departed)return;departed=true;this.engine.leave(id);if(!this.engine.peers.size){clearInterval(this.timer);this.timer=null;this.created=false;}try{server.close(1000,'bye');}catch{}};
    server.addEventListener('message',event=>{
      if(typeof event.data!=='string'||event.data.length>512)return;
      const now=Date.now();if(now-windowStart>1000){count=0;windowStart=now;}if(++count>90){server.close(1008,'Too many messages');leave();return;}
      let message;try{message=JSON.parse(event.data);}catch{return;}
      this.engine.handle(id,message,now);this.ensureLoop();
    });
    server.addEventListener('close',leave);server.addEventListener('error',leave);
    return new Response(null,{status:101,webSocket:client});
  }
  ensureLoop(){
    if(this.timer||!this.engine.game||this.engine.game.result)return;
    let last=Date.now(),accumulator=0,broadcast=0;
    this.timer=setInterval(()=>{
      const now=Date.now();accumulator+=Math.min(.1,(now-last)/1000);last=now;
      while(accumulator>=1/60){this.engine.tick(1/60,now);accumulator-=1/60;}
      if(++broadcast%3===0||this.engine.game?.result)this.engine.snapshot();
      if(!this.engine.game||this.engine.game.result){clearInterval(this.timer);this.timer=null;}
    },1000/60);
  }
}
