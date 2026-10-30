import {XiDachEngine} from './engine.js';

// One queue for joins, actions and timers. Persist before publishing snapshots.
export class XiDachService {
  constructor(roomId,{state=null,save=async()=>{}}={}){this.engine=new XiDachEngine(roomId,state);this.save=save;this.peers=new Map();this.queue=Promise.resolve();}
  serial(fn){const job=this.queue.then(fn);this.queue=job.catch(()=>{});return job;}
  broadcast(){const online=[...this.peers.values()].map(p=>p.id);for(const peer of this.peers.values())if(peer.id)peer.send({type:'snapshot',state:this.engine.snapshot(peer.id,online)});}
  connect(send,close=()=>{}){const peer={send,close,id:null,count:0,window:Date.now()};this.peers.set(peer,peer);return peer;}
  receive(peer,message){return this.serial(async()=>{
    if(!this.peers.has(peer))return;
    if(Date.now()-peer.window>1000){peer.window=Date.now();peer.count=0;}
    if(++peer.count>30){peer.close();this.peers.delete(peer);return;}
    if(!message||typeof message!=='object'||Array.isArray(message))return;
    // Expirations and actions use the same queue, even across awaited storage writes.
    this.engine.tick();
    const before=structuredClone(this.engine.state);
    try{
      if(!peer.id){
        if(message.type!=='hello')throw new Error('Cần kết nối lại phiên chơi.');
        const id=this.engine.join(message);
        for(const old of this.peers.values())if(old!==peer&&old.id===id){old.close();this.peers.delete(old);}
        peer.id=id;
      }else this.engine.action(peer.id,message);
    }catch(error){this.engine.state=before;peer.send({type:'error',message:error.message});}
    await this.save(this.engine.state);
    if(peer.id&&message.type==='hello'){const p=this.engine.player(peer.id);peer.send({type:'welcome',id:p.id,token:p.token});}
    this.broadcast();
  });}
  disconnect(peer){return this.serial(async()=>{this.peers.delete(peer);this.broadcast();});}
  tick(now=Date.now()){return this.serial(async()=>{if(this.engine.tick(now)){await this.save(this.engine.state);this.broadcast();}});}
}
