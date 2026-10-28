import {BangBangEngine} from './bang-bang-engine.js';

export class BangBangQueue{
  constructor(){this.engine=new BangBangEngine();this.timer=null;this.created=false;}
  async fetch(request){
    if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('Expected WebSocket',{status:426});
    if(this.engine.peers.size>=30)return new Response('Queue is full',{status:409});
    const pair=new WebSocketPair(),client=pair[0],server=pair[1];server.accept();this.created=true;
    const send=message=>{try{server.send(JSON.stringify(message));}catch{}};
    let id=null,closed=false,count=0,start=Date.now();
    const leave=()=>{if(closed)return;closed=true;if(id!==null)this.engine.leave(id);if(!this.engine.peers.size){clearInterval(this.timer);this.timer=null;this.created=false;}try{server.close(1000,'bye');}catch{}};
    id=this.engine.join(new URL(request.url).searchParams.get('name'),send);
    server.addEventListener('message',event=>{
      if(typeof event.data!=='string'||event.data.length>2048)return;
      const now=Date.now();if(now-start>1000){count=0;start=now;}if(++count>45){server.close(1008,'Too many messages');leave();return;}
      let message;try{message=JSON.parse(event.data);}catch{return;}
      this.engine.handle(id,message);this.ensureLoop();
    });
    server.addEventListener('close',leave);server.addEventListener('error',leave);
    return new Response(null,{status:101,webSocket:client});
  }
  ensureLoop(){
    if(this.timer||!this.engine.match)return;let last=Date.now(),acc=0,frames=0;
    this.timer=setInterval(()=>{const now=Date.now();acc+=Math.min(.1,(now-last)/1000);last=now;while(acc>=1/30){this.engine.tick(1/30);acc-=1/30;}if(++frames%3!==0)this.engine.snapshot();if(!this.engine.match){clearInterval(this.timer);this.timer=null;}},1000/30);
  }
}
