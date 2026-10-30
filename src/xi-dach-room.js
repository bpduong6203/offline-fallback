import {XiDachService} from '../xi-dach/service.js';

export class XiDachRoom {
  constructor(ctx){
    this.ctx=ctx;
    this.ready=ctx.blockConcurrencyWhile(async()=>{
      const state=await ctx.storage.get('room');
      this.service=new XiDachService(state?.roomId||'',{state,save:async state=>{
        await ctx.storage.put('room',state);
        if(state.deadline)await ctx.storage.setAlarm(state.deadline);else await ctx.storage.deleteAlarm();
      }});
    });
  }
  async fetch(request){
    await this.ready;
    if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('Cần WebSocket',{status:426});
    const room=new URL(request.url).searchParams.get('room');
    if(!/^[A-HJ-NP-Z2-9]{6}$/.test(room||''))return new Response('Mã phòng không hợp lệ',{status:400});
    if(!this.service.engine.state.roomId)this.service.engine.state.roomId=room;
    if(this.service.peers.size>=24)return new Response('Quá nhiều kết nối',{status:429});
    const pair=new WebSocketPair(),server=pair[1];server.accept();
    const peer=this.service.connect(message=>{try{server.send(JSON.stringify(message));}catch{}},()=>{try{server.close(1008,'Phiên đã kết thúc');}catch{}});
    const handshake=setTimeout(()=>{if(!peer.id){peer.close();this.service.disconnect(peer);}},10000);
    server.addEventListener('message',event=>{
      if(typeof event.data!=='string'||event.data.length>2048){peer.close();return;}
      let message;try{message=JSON.parse(event.data);}catch{return;}
      this.ctx.waitUntil(this.service.receive(peer,message));
    });
    const leave=()=>{clearTimeout(handshake);this.ctx.waitUntil(this.service.disconnect(peer));};
    server.addEventListener('close',leave);server.addEventListener('error',leave);
    return new Response(null,{status:101,webSocket:pair[0]});
  }
  async alarm(){await this.ready;await this.service.tick();const deadline=this.service.engine.state.deadline;if(deadline)await this.ctx.storage.setAlarm(Math.max(Date.now()+20,deadline));}
}
