import {ArenaService,Matchmaker} from '../mebi-snake/service.js';
export class SnakeArena{
 constructor(ctx){this.ctx=ctx;this.service=null;}
 async fetch(request){const url=new URL(request.url),number=Number(url.searchParams.get('arena'));if(!Number.isInteger(number)||number<1||number>1000)return new Response('Invalid arena',{status:400});const body=url.pathname.startsWith('/internal/')?await request.json():null;this.service ||= new ArenaService(number);this.service.onIdle=()=>{this.service=null;};
  if(url.pathname==='/internal/reserve'){try{return Response.json(this.service.reserve(body));}catch(e){return Response.json({error:e.message},{status:400});}}
  if(url.pathname==='/internal/leave'){this.service.arena.leave(body.token);return new Response(null,{status:204});}
  if(url.pathname==='/internal/cancel'){this.service.arena.cancel(body.token);return new Response(null,{status:204});}
  if(request.headers.get('Upgrade')?.toLowerCase()!=='websocket')return new Response('Expected WebSocket',{status:426});
  if(this.service.peers.size>=22)return new Response('Too many sockets',{status:429});const pair=new WebSocketPair(),server=pair[1];server.accept();this.service.attach(server);
  server.addEventListener('message',e=>{try{this.service.message(server,e.data);}catch(error){this.service.send(server,{type:'error',message:error.message});if(!this.service.peers.get(server)?.token||/Quá nhiều|Payload/.test(error.message)){this.service.disconnect(server);server.close(1008,'Rejected');}}});const leave=()=>this.service.disconnect(server);server.addEventListener('close',leave);server.addEventListener('error',leave);return new Response(null,{status:101,webSocket:pair[0]});
 }
}
export class SnakeMatchmaker{
 constructor(ctx,env){this.ctx=ctx;this.env=env;this.ready=ctx.blockConcurrencyWhile(async()=>{const highest=await ctx.storage.get('highest')||1;this.matcher=new Matchmaker(async(n,body)=>{const r=await env.SNAKE.get(env.SNAKE.idFromName('arena:'+n)).fetch(new Request('https://snake/internal/reserve?arena='+n,{method:'POST',body:JSON.stringify(body)}));const data=await r.json();if(!r.ok)throw Error(data.error||'Arena unavailable');return data;},highest,async(n,assigned)=>{await ctx.storage.put({highest:n,assigned});},await ctx.storage.get('assigned')||[]);});}
 async fetch(request){await this.ready;try{const text=await request.text();if(text.length>512)throw Error('Payload quá lớn');return Response.json(await this.matcher.join(JSON.parse(text),request.headers.get('CF-Connecting-IP')||'unknown'));}catch(e){return Response.json({error:e.message},{status:400});}}
}
