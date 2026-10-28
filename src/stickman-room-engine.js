import {createMatch,step} from '../stickman-fight/match.js';
import {PRESETS,WEAPONS} from '../stickman-fight/config.js';

export class StickmanRoomEngine {
  constructor(){this.peers=new Map();this.host=null;this.game=null;this.arena='city';this.seconds=60;this.sequence=0;this.events=[];}
  playing(){return !!this.game&&this.game.phase!=='result';}
  join(name,send){
    if(this.playing())throw new Error('Trận đang diễn ra.');
    if(this.peers.size>=2)throw new Error('Phòng đã đủ 2 người.');
    const id=this.peers.has(0)?1:0;
    this.peers.set(id,{id,name:typeof name==='string'&&name.trim()?name.trim().slice(0,20):`Người chơi ${id+1}`,preset:'boxer',weapon:'none',send,input:{},lastInput:0});
    this.host??=id;this.game=null;this.events=[];
    send({t:'hello',id});this.lobby();return id;
  }
  broadcast(message){for(const p of this.peers.values())try{p.send(message);}catch{}}
  lobby(){this.broadcast({t:'lobby',host:this.host,arena:this.arena,seconds:this.seconds,playing:this.playing(),hasMatch:!!this.game,players:[...this.peers.values()].map(({id,name,preset,weapon})=>({id,name,preset,weapon}))});}
  clearInputs(){for(const p of this.peers.values()){p.input={};p.lastInput=0;}}
  handle(id,message,now=Date.now()){
    const p=this.peers.get(id);if(!p||!message||typeof message!=='object'||Array.isArray(message))return;
    if(message.t==='loadout'&&!this.playing()){
      if(typeof message.preset==='string'&&Object.hasOwn(PRESETS,message.preset))p.preset=message.preset;
      if(typeof message.weapon==='string'&&Object.hasOwn(WEAPONS,message.weapon))p.weapon=message.weapon;
      this.lobby();
    }
    if(message.t==='config'&&id===this.host&&!this.playing()){
      if(['city','dojo','bamboo'].includes(message.arena))this.arena=message.arena;
      if([60,90].includes(message.seconds))this.seconds=message.seconds;
      this.lobby();
    }
    if(message.t==='start'&&id===this.host&&!this.playing()){
      if(this.peers.size!==2){p.send({t:'error',message:'Cần đủ 2 người để bắt đầu.'});return;}
      this.game=createMatch({arena:this.arena,seconds:this.seconds,names:[this.peers.get(0).name,this.peers.get(1).name],loadouts:[0,1].map(i=>({preset:this.peers.get(i).preset,weapon:this.peers.get(i).weapon}))});
      this.clearInputs();this.sequence=0;this.events=[];this.broadcast({t:'started'});this.lobby();this.snapshot();
    }
    if(message.t==='pause'&&this.playing()){
      this.game.paused=true;this.clearInputs();this.snapshot();
    }
    if(message.t==='resume'&&this.playing()&&this.peers.size===2){
      this.game.paused=false;this.clearInputs();this.snapshot();
    }
    if(message.t==='input'&&this.playing()&&!this.game.paused&&this.game.phase==='fight'){
      if(typeof message.left!=='boolean'||typeof message.right!=='boolean'||typeof message.block!=='boolean')return;
      p.input.left=message.left;p.input.right=message.right;p.input.block=message.block;
      p.input.down=message.down===true;if(message.slide===true)p.input.slide=true;if(message.pickup===true)p.input.pickup=true;
      if(message.jump===true)p.input.jump=true;
      if(['Punch','Kick','Special'].includes(message.action))p.input.action=message.action;
      p.lastInput=now;
    }
  }
  tick(dt=1/60,now=Date.now()){
    if(!this.playing()||this.game.paused)return;
    const before=this.game.phase,inputs=[{},{}];
    for(const p of this.peers.values()){
      if(now-p.lastInput>600)p.input={};
      inputs[p.id]={...p.input};p.input.jump=false;p.input.slide=false;p.input.pickup=false;delete p.input.action;
    }
    step(this.game,inputs,dt);
    // Combat events contain fighter references; send compact immutable event data instead.
    for(const h of this.game.events)this.events.push(h.kind==='end'?{kind:'end'}:{kind:h.kind,blocked:h.blocked,broken:h.broken,head:h.head,dropped:h.dropped,weapon:h.weapon,x:h.x,y:h.y,dir:h.dir,q:{x:h.q.x,y:h.q.y}});
    this.events=this.events.slice(-32);this.game.events=[];
    if(before!==this.game.phase){this.clearInputs();this.lobby();}
  }
  snapshot(){if(this.game){this.broadcast({t:'state',sequence:++this.sequence,state:{...this.game,events:this.events}});this.events=[];}}
  leave(id){
    if(!this.peers.delete(id))return;
    if(this.host===id)this.host=this.peers.keys().next().value??null;
    this.clearInputs();
    if(!this.peers.size){this.game=null;this.events=[];}
    else if(this.playing()){
      const winner=this.peers.keys().next().value;
      this.game.players[id].hp=0;this.game.players[id].state='Knockout';this.game.wins[winner]=2;
      this.game.phase='result';this.game.paused=false;this.game.result=this.game.options.names[winner]+' thắng vì đối thủ đã rời phòng.';
      this.events=[{kind:'end'}];this.snapshot();
    }
    this.lobby();
  }
}
