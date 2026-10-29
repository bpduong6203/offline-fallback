import {RoomService,createState} from '../mebi-monopoly/service';
// Every storage mutation and alarm goes through this queue, including WebSocket events.
export class MonopolyRoom{
 service!:RoomService; chain:Promise<any>=Promise.resolve(); ready:Promise<void>; sockets=new Set<any>();
 constructor(public ctx:any){this.ready=ctx.blockConcurrencyWhile(async()=>{const state=await ctx.storage.get('room');this.service=new RoomService(state||createState(''),async s=>{await ctx.storage.put('room',s);},async time=>{await ctx.storage.setAlarm(time);});
   // A restarted isolate has no live accepted sockets; persist disconnect deadlines.
   if(state){const restored=this.service.state,now=Date.now();for(const p of restored.players)if(p.connected){p.connected=false;p.offline=now;p.ready=false;}if(!restored.allOffline)restored.allOffline=now;await ctx.storage.put('room',restored);await ctx.storage.setAlarm(now+1000);}
  });}
 serial<T>(fn:()=>Promise<T>):Promise<T>{const task=this.chain.then(()=>this.ready).then(fn);this.chain=task.catch(()=>{});return task;}
 async fetch(request:Request){return this.serial(async()=>{const url=new URL(request.url);
   if(url.pathname==='/internal/monopoly-limit'){
    const {ip,op}=await request.json() as any;const now=Date.now();let entries=await this.ctx.storage.get('limits')||{};
    entries=Object.fromEntries(Object.entries(entries).filter(([,v]:any)=>now-v.time<60000));
    const key=ip+':'+op,r=entries[key]||{time:now,count:0};r.count++;entries[key]=r;await this.ctx.storage.put('limits',entries);
    return new Response(null,{status:r.count>(op==='create'?10:30)?429:204});
   }
   if(!this.service.state.code)this.service.state.code=url.pathname.split('/')[3];
   if(request.headers.get('Upgrade')?.toLowerCase()==='websocket'){
    if(this.sockets.size>=8)return new Response('Phòng đã đầy',{status:429});
    const Pair=(globalThis as any).WebSocketPair,pair=new Pair(),server=pair[1];server.accept();this.sockets.add(server);
    let authenticated=false;const timer=setTimeout(()=>{if(!authenticated)server.close(1008,'Cần xác thực');},5000);
    server.addEventListener('message',(event:any)=>this.serial(async()=>{try{if(typeof event.data!=='string')throw Error('Dữ liệu không hợp lệ');await this.service.message(server,event.data);authenticated=this.service.peers.has(server);if(authenticated)clearTimeout(timer);}catch(e:any){server.send(JSON.stringify({type:'error',error:e.message,state:undefined}));if(this.service.peers.has(server))server.send(JSON.stringify({type:'state',state:(await import('../mebi-monopoly/tour-engine')).snapshot(this.service.state)}));else server.close(1008,'Phiên không hợp lệ');}}));
    const leave=()=>{clearTimeout(timer);this.sockets.delete(server);this.serial(()=>this.service.disconnect(server));};server.addEventListener('close',leave);server.addEventListener('error',leave);
    return new Response(null,{status:101,webSocket:pair[0]} as any);
   }
   return this.service.request(request);
  });}
 async alarm(){return this.serial(()=>this.service.tick());}
}
