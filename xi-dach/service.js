import {XiDachEngine} from './engine.js';
import {RULES} from './rules.js';

// One queue for joins, actions and timers. Persist before publishing snapshots.
export class XiDachService {
  constructor(roomId,{state=null,save=async()=>{},wallet=null}={}){this.wallet=wallet;this.engine=new XiDachEngine(roomId,state,wallet?{...RULES,initialBalance:0}:RULES);this.save=save;this.peers=new Map();this.queue=Promise.resolve();for(const p of this.engine.state.players)p.disconnectedAt ??= Date.now();}
  // Keep seats for one minute; active wagers finish before a seat can be removed.
  canRemove(p){const s=this.engine.state;return !p.bet&&(!s.participants.includes(p.id)||['LOBBY','BETTING','ROUND_END'].includes(s.phase));}
  nextAlarm(){const s=this.engine.state;const alarm=Math.min(...[s.deadline,...s.players.filter(p=>p.disconnectedAt!=null&&this.canRemove(p)).map(p=>p.disconnectedAt+60000)].filter(n=>n!=null));return Number.isFinite(alarm)?alarm:null;}
  async cleanup(now=Date.now()){
    const s=this.engine.state,removed=s.players.filter(p=>p.disconnectedAt!=null&&now>=p.disconnectedAt+60000&&this.canRemove(p));
    if(!removed.length)return false;
    const before=structuredClone(s),ids=new Set(removed.map(p=>p.id));
    for(const p of removed)s.walletAdjustment=(s.walletAdjustment||0)+this.engine.rules.initialBalance-p.balance;
    s.players=s.players.filter(p=>!ids.has(p.id));s.participants=s.participants.filter(id=>!ids.has(id));
    if(ids.has(s.hostId))s.hostId=s.players.find(p=>p.disconnectedAt==null)?.id||s.players[0]?.id||null;
    this.engine.updateReady(now);this.engine.assertFunds();
    try{await this.save(s);}catch(error){this.engine.state=before;throw error;}
    return true;
  }
  async syncPlayer(p){if(!this.wallet)return;const balance=await this.wallet.get(p.meritId);this.engine.state.walletAdjustment=(this.engine.state.walletAdjustment||0)+balance-p.balance;p.balance=balance;this.engine.assertFunds();}
  async recover(){
    const s=this.engine.state,pending=s.pendingMerit;if(!pending)return;
    try{for(const op of pending.operations)await this.wallet.change(op.id,op.delta,op.key);}
    catch(error){if(error.insufficient){this.engine.state=pending.before;await this.save(this.engine.state);}throw error;}
    delete s.pendingMerit;
    try{await this.save(s);}catch(error){s.pendingMerit=pending;throw error;}
  }
  async commit(before){
    if(!this.wallet){await this.save(this.engine.state);return;}
    const s=this.engine.state,operations=[];
    for(const p of s.players){const previous=before.players.find(old=>old.id===p.id);if(previous&&p.balance!==previous.balance)operations.push({id:p.meritId,delta:p.balance-previous.balance,key:'xidach:'+crypto.randomUUID()});}
    if(operations.length)s.pendingMerit={before,operations};
    try{await this.save(s);}catch(error){this.engine.state=before;throw error;}
    await this.recover();
  }
  serial(fn){const job=this.queue.then(fn);this.queue=job.catch(()=>{});return job;}
  broadcast(){if(this.engine.state.pendingMerit)return;const online=[...this.peers.values()].map(p=>p.id);for(const peer of this.peers.values())if(peer.id)peer.send({type:'snapshot',state:this.engine.snapshot(peer.id,online)});}
  connect(send,close=()=>{},meritId=null){const peer={send,close,meritId,id:null,count:0,window:Date.now()};this.peers.set(peer,peer);return peer;}
  receive(peer,message){return this.serial(async()=>{
    if(!this.peers.has(peer))return;
    if(Date.now()-peer.window>1000){peer.window=Date.now();peer.count=0;}
    if(++peer.count>30){peer.close();this.peers.delete(peer);return;}
    if(!message||typeof message!=='object'||Array.isArray(message))return;
    // Expirations and actions use the same queue, even across awaited storage writes.
    try{await this.recover();const beforeTick=structuredClone(this.engine.state);if(this.engine.tick())await this.commit(beforeTick);await this.cleanup();
      if(peer.id&&['bet','cancel'].includes(message.type))await this.syncPlayer(this.engine.player(peer.id));
    }catch(error){peer.send({type:'error',message:error.message});return;}
    const before=structuredClone(this.engine.state);
    try{
      if(!peer.id){
        if(message.type==='hello'&&message.token&&!this.engine.state.players.some(p=>p.token===message.token)){peer.send({type:'error',code:'SEAT_EXPIRED',message:'Ghế đã hết thời gian giữ. Vui lòng vào bàn lại.'});return;}
        if(message.type!=='hello')throw new Error('Cần kết nối lại phiên chơi.');
        if(this.wallet&&!peer.meritId)throw new Error('Không xác định được ví Công đức.');
        const id=this.engine.join({...message,meritId:peer.meritId});
        if(this.wallet&&this.engine.player(id).meritId!==peer.meritId)throw new Error('Phiên chơi không thuộc ví Công đức hiện tại.');
        await this.syncPlayer(this.engine.player(id));
        for(const old of this.peers.values())if(old!==peer&&old.id===id){old.close();this.peers.delete(old);}
        delete this.engine.player(id).disconnectedAt;peer.id=id;
      }else this.engine.action(peer.id,message);
    }catch(error){this.engine.state=before;peer.send({type:'error',message:error.message});}
    try{if(message.type==='hello')await this.save(this.engine.state);else await this.commit(before);}catch(error){peer.send({type:'error',message:error.message});return;}
    if(peer.id&&message.type==='hello'){const p=this.engine.player(peer.id);peer.send({type:'welcome',id:p.id,token:p.token});}
    this.broadcast();
  });}
  disconnect(peer){return this.serial(async()=>{this.peers.delete(peer);const p=this.engine.state.players.find(p=>p.id===peer.id);if(p&&![...this.peers.values()].some(other=>other.id===p.id)){p.disconnectedAt ??= Date.now();await this.save(this.engine.state);}this.broadcast();});}
  tick(now=Date.now()){return this.serial(async()=>{try{const recovering=!!this.engine.state.pendingMerit;await this.recover();const before=structuredClone(this.engine.state),changed=this.engine.tick(now);if(changed)await this.commit(before);const cleaned=await this.cleanup(now);if(changed||recovering||cleaned)this.broadcast();}catch(error){for(const peer of this.peers.values())peer.send({type:'error',message:error.message});throw error;}});}
}
