import {XiDachService} from '../xi-dach/service.js';
import {meritWallet} from '../xi-dach/merit-wallet.js';

export class XiDachRoom {
  constructor(ctx,env){
    this.env=env;
    this.ctx=ctx;
    this.ready=ctx.blockConcurrencyWhile(async()=>{
      const state=await ctx.storage.get('room');
      // Old egg rooms may still have alarms. Finish them without touching MERIT;
      // public routes now address only the separate merit: room namespace.
      const wallet=state?.players?.some(p=>!p.meritId)?null:meritWallet(env);
      this.service=new XiDachService(state?.roomId||'',{state,wallet,save:async state=>{
        await ctx.storage.put('room',state);
        if(state.pendingMerit)await ctx.storage.setAlarm(Date.now()+2000);else if(this.service.nextAlarm())await ctx.storage.setAlarm(this.service.nextAlarm());else await ctx.storage.deleteAlarm();
      }});
      await this.service.save(this.service.engine.state);
    });
  }
  async fetch(request){
    await this.ready;
    const path=new URL(request.url).pathname;
    if(path==='/__game/xi-dach/match')return this.ctx.blockConcurrencyWhile(async()=>{
      let index=await this.ctx.storage.get('matchIndex')||0;const body=await request.text();
      for(;;){const room=roomCode(index);const result=await this.env.XIDACH.get(this.env.XIDACH.idFromName(this.env.MERIT?'merit:'+room:room)).fetch(new Request('https://internal/auto-join?room='+room,{method:'POST',body}));
        if(result.status!==409){await this.ctx.storage.put('matchIndex',index);return result;}index++;}
    });
    if(path==='/auto-join')return this.service.serial(async()=>{
      if(!this.service.engine.state.roomId)this.service.engine.state.roomId=new URL(request.url).searchParams.get('room');
      return autoJoin(this.service,await request.json());
    });
    if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('Cần WebSocket',{status:426});
    const room=new URL(request.url).searchParams.get('room');
    if(!/^[A-HJ-NP-Z2-9]{6}$/.test(room||''))return new Response('Mã phòng không hợp lệ',{status:400});
    if(!this.service.engine.state.roomId)this.service.engine.state.roomId=room;
    if(this.service.peers.size>=24)return new Response('Quá nhiều kết nối',{status:429});
    const pair=new WebSocketPair(),server=pair[1];server.accept();
    const peer=this.service.connect(message=>{try{server.send(JSON.stringify(message));}catch{}},()=>{try{server.close(1008,'Phiên đã kết thúc');}catch{}},request.headers.get('X-Mebi-Merit-Id'));
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
  async alarm(){await this.ready;try{await this.service.tick();}finally{const s=this.service.engine.state;if(s.pendingMerit)await this.ctx.storage.setAlarm(Date.now()+2000);else if(this.service.nextAlarm())await this.ctx.storage.setAlarm(Math.max(Date.now()+20,this.service.nextAlarm()));else await this.ctx.storage.deleteAlarm();}}
}

export function roomCode(index){
  const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let code='';
  do{code=chars[index%32]+code;index=Math.floor(index/32);}while(index);
  return code.padStart(6,'A');
}
export async function autoJoin(service,profile){
  await service.recover();await service.cleanup();
  if(service.wallet&&profile.meritId){const existing=service.engine.state.players.find(p=>p.meritId===profile.meritId);if(existing)return Response.json({room:service.engine.state.roomId,token:existing.token});}
  if(service.engine.state.players.length>=8)return new Response('Full',{status:409});
  try{await service.recover();const before=structuredClone(service.engine.state);if(service.engine.tick())await service.commit(before);const id=service.engine.join({...profile,token:undefined,create:false,auto:true});
    service.engine.player(id).disconnectedAt=Date.now();
    await service.syncPlayer(service.engine.player(id));
    await service.save(service.engine.state);service.broadcast();
    return Response.json({room:service.engine.state.roomId,token:service.engine.player(id).token});
  }catch(error){return Response.json({error:error.message},{status:400});}
}
