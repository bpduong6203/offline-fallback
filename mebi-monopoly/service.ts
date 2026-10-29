import {createState,Engine,execute,snapshot,upgradeState,State} from './tour-engine';
export class RoomService {
 state:State; peers=new Map<any,string>(); limits=new Map<string,{time:number;count:number}>();
 constructor(state:State,public persist:(s:State)=>Promise<void>,public schedule:(time:number)=>Promise<void>){this.state=upgradeState(state);}
 async save(){await this.persist(this.state);await this.schedule(Date.now()+1000);}
 broadcast(){const message=JSON.stringify({type:'state',state:snapshot(this.state)});for(const [peer] of this.peers){try{peer.send(message);}catch{}}}
 rate(key:string,max=20){const now=Date.now();let r=this.limits.get(key);if(!r||now-r.time>10000){r={time:now,count:0};this.limits.set(key,r);}if(++r.count>max)throw Error('Thao tác quá nhanh, vui lòng chờ');if(this.limits.size>2000)this.limits.clear();}
 async enter(op:string,body:any){this.rate('enter',30);const engine=new Engine(structuredClone(this.state));
  if(op==='create'){if(engine.s.players.length||engine.s.closed)throw Error('Mã phòng đã tồn tại');}
  else if(engine.s.closed)throw Error('Phòng đã đóng');
  else if(!engine.s.players.length)throw Error('Phòng không tồn tại');
  if(op==='resume'&&(typeof body.token!=='string'||!body.token))throw Error('Phiên không hợp lệ');
  const p=engine.join(body.name,op==='resume'?body.token:undefined);p.connected=false;p.offline=Date.now();this.state=engine.s;await this.save();this.broadcast();return {token:p.token,id:p.id,state:snapshot(this.state)};
 }
 async message(peer:any,raw:string){if(raw.length>8192)throw Error('Payload quá lớn');const message=JSON.parse(raw);const id=this.peers.get(peer);
  if(!id){this.rate('auth',30);if(message.type!=='auth'||typeof message.token!=='string')throw Error('Cần xác thực');const engine=new Engine(structuredClone(this.state));const p=engine.join('',message.token);
   for(const [old,oldId] of this.peers)if(oldId===p.id&&old!==peer){this.peers.delete(old);try{old.close(1000,'Phiên được mở lại');}catch{}}
   this.peers.set(peer,p.id);this.state=engine.s;await this.save();this.broadcast();return;
  }
  this.rate(id);await this.tick();if(message.type==='sync'){peer.send(JSON.stringify({type:'state',state:snapshot(this.state)}));return;}
  this.state=execute(this.state,id,message);await this.save();this.broadcast();
 }
 async disconnect(peer:any){const id=this.peers.get(peer);this.peers.delete(peer);if(!id||[...this.peers.values()].includes(id)||!this.state.players.some(p=>p.id===id))return;const engine=new Engine(structuredClone(this.state));engine.disconnect(id);this.state=engine.s;await this.save();this.broadcast();}
 async tick(){const engine=new Engine(structuredClone(this.state));if(engine.tick()){this.state=engine.s;await this.persist(this.state);this.broadcast();}if(!this.state.closed&&this.state.players.length)await this.schedule(Date.now()+1000);}
 async request(request:Request){try{if(request.method!=='POST')return Response.json({error:'Chỉ hỗ trợ POST'},{status:405});const text=await request.text();if(text.length>1024)throw Error('Payload quá lớn');const body=JSON.parse(text);const op=new URL(request.url).pathname.split('/').pop()!;if(!['create','join','resume'].includes(op))throw Error('Đường dẫn không hợp lệ');return Response.json(await this.enter(op,body));}catch(e:any){return Response.json({error:e.message},{status:400});}}
}
export {createState};
export {snapshot,Engine,execute,upgradeState} from './tour-engine';
export {BOARD,RULES,GROUPS,SIDES,TOURISTS,CARDS,tileByKey,PREMIUM} from './tour-data';
