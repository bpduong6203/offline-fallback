import {createGame,step} from '../bomb-arena/state.js';
import {move} from '../bomb-arena/collision.js';
import {place} from '../bomb-arena/bombs.js';

export class BombRoomEngine {
  constructor(){this.peers=new Map();this.game=null;this.host=null;this.theme='garden';this.sequence=0;}
  join(name,send){
    if(this.game&&!this.game.result)throw new Error('Trận đang diễn ra. Hãy chờ ván sau.');
    if(this.peers.size>=4)throw new Error('Phòng đã đủ 4 người.');
    const id=[0,1,2,3].find(id=>!this.peers.has(id));
    const peer={id,name:typeof name==='string'?name.trim().slice(0,20):'',send,dx:0,dy:0,bomb:false,lastInput:0};
    peer.name||=`Người chơi ${id+1}`;this.peers.set(id,peer);this.host??=id;
    if(this.game?.result)this.game=null;
    send({t:'hello',id});this.lobby();return id;
  }
  broadcast(message){for(const p of this.peers.values())try{p.send(message);}catch{}}
  lobby(){this.broadcast({t:'lobby',host:this.host,theme:this.theme,playing:!!this.game&&!this.game.result,players:[...this.peers.values()].map(({id,name})=>({id,name}))});}
  handle(id,message,now=Date.now()){
    const p=this.peers.get(id);if(!p||!message||typeof message!=='object')return;
    if(message.t==='theme'&&id===this.host&&(!this.game||this.game.result)&&['garden','factory','ice'].includes(message.theme)){
      this.theme=message.theme;this.lobby();
    }
    if(message.t==='input'){
      if(!this.game||this.game.result)return;
      // Clients supply intentions only: positions, powers and elapsed time never come from the network.
      if(![-1,0,1].includes(message.dx)||![-1,0,1].includes(message.dy))return;
      p.dx=message.dx;p.dy=p.dx?0:message.dy;p.lastInput=now;
      if(message.bomb===true)p.bomb=true;
    }
    if(message.t==='start'&&id===this.host){
      if(this.game&&!this.game.result)return;
      if(this.peers.size<2){p.send({t:'error',message:'Cần ít nhất 2 người để bắt đầu.'});return;}
      if(['garden','factory','ice'].includes(message.theme))this.theme=message.theme;
      const game=createGame({humans:4,bots:0,theme:this.theme});
      game.players=game.players.filter(player=>this.peers.has(player.id));
      for(const player of game.players)player.name=this.peers.get(player.id).name;
      for(const peer of this.peers.values()){peer.dx=0;peer.dy=0;peer.bomb=false;peer.lastInput=0;}
      this.game=game;this.sequence=0;this.broadcast({t:'started'});this.snapshot();
    }
  }
  tick(dt=1/60,now=Date.now()){
    const s=this.game;if(!s||s.result)return;
    for(const p of this.peers.values()){
      const player=s.players.find(q=>q.id===p.id);if(!player)continue;
      if(now-p.lastInput<600)move(s,player,p.dx,p.dy,dt);
      if(p.bomb){place(s,player);p.bomb=false;}
    }
    step(s,dt);
  }
  snapshot(){
    if(!this.game)return;
    const {random,...state}=this.game;
    this.broadcast({t:'state',sequence:++this.sequence,state:{...state,bombs:state.bombs.map(({pass,...b})=>b)}});
    this.game.events=[];
  }
  leave(id){
    if(!this.peers.delete(id))return;
    if(this.host===id)this.host=this.peers.keys().next().value??null;
    const player=this.game?.players.find(p=>p.id===id);if(player)player.alive=false;
    if(this.peers.size===0)this.game=null;
    this.lobby();
  }
}
