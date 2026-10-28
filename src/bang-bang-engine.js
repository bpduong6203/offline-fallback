const W=1600,H=1000,MAX_PLAYERS=30,MAX_SCORE=10;
const TANKS={
  pegasus:{name:'PEGASUS',role:'Đột kích',hp:1050,speed:245,damage:125,rate:.72,armor:12,color:'#64d9ff'},
  tiger:{name:'TIGER TANK',role:'Tiên phong',hp:1550,speed:175,damage:155,rate:1.05,armor:34,color:'#ffb454'},
  aegis:{name:'AEGIS',role:'Hỗ trợ',hp:1250,speed:195,damage:115,rate:.9,armor:24,color:'#b8a4ff'}
};
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),dist=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
function arena(){
  const blocks=[];const add=(x,y,w,h,type,hp=0)=>blocks.push({x,y,w,h,type,hp,maxHp:hp});
  // Symmetric lanes, open spawn circles, destructible cover, brush and ice.
  for(const x of [384,736,864,1216])for(const y of [160,192,224,736,768,800])add(x,y,32,32,'wall');
  for(const x of [256,288,1312,1344])for(const y of [448,480,512])add(x,y,32,32,'water');
  for(const x of [544,576,992,1024])for(const y of [320,352,608,640])add(x,y,32,32,'bush');
  for(const x of [480,512,1088,1120])for(const y of [448,480,512])add(x,y,32,32,'crate',500);
  for(const x of [640,672,928,960])for(const y of [448,480,512])add(x,y,32,32,'ice');
  for(const x of [768,800])for(const y of [288,320,640,672])add(x,y,32,32,'wall');
  const decor=[];for(const x of [112,320,544,1056,1280,1488])for(const y of [80,112,848,880])decor.push({x,y,height:28+((x+y)%3)*7,tone:(x+y)%4});
  return {width:W,height:H,blocks,decor};
}
function rectHit(x,y,r,b){return x+r>b.x&&x-r<b.x+b.w&&y+r>b.y&&y-r<b.y+b.h;}
function playerFor(id,name,tank,team){const s=TANKS[tank]||TANKS.pegasus;return {id,name,tank,team,x:team===0?120:W-120,y:team===0?320+id%3*180:320+(id%3)*180,bodyAngle:team?Math.PI:0,turretAngle:team?Math.PI:0,hp:s.hp,maxHp:s.hp,energy:100,maxEnergy:100,shield:0,kills:0,deaths:0,alive:true,respawn:0,fireCd:0,skillCd:{Q:0,W:0,R:0},buffs:[],input:{dx:0,dy:0,angle:0,fire:false,skill:''},name:name||('Người chơi '+(id+1)),tankDef:s};}

export class BangBangEngine{
  constructor(){this.peers=new Map();this.players=new Map();this.map=arena();this.match=null;this.nextId=1;this.sequence=0;this.mapDirty=false;}
  join(name,send){
    if(this.peers.size>=MAX_PLAYERS)throw new Error('Hàng chờ đã đầy.');
    const id=this.nextId++,peer={id,name:typeof name==='string'?name.trim().slice(0,18):'',send,ready:false,tank:'pegasus',mode:3,matchId:null,lastSeq:0};peer.name||='Người chơi '+id;this.peers.set(id,peer);
    send({t:'hello',id});this.lobby();return id;
  }
  broadcast(message,ids=null){for(const p of this.peers.values())if(!ids||ids.includes(p.id))try{p.send(message);}catch{}}
  lobby(){const queued=[...this.peers.values()].filter(p=>!p.matchId);for(const peer of queued){const players=queued.filter(p=>p.mode===peer.mode);peer.send({t:'lobby',mode:peer.mode,players:players.map(({id,name,tank,ready,mode})=>({id,name,tank,ready,mode})),readyCount:players.filter(p=>p.ready).length,needed:peer.mode*2});}}
  handle(id,m){const p=this.peers.get(id);if(!p||!m||typeof m!=='object')return;
    if(m.t==='select'&&!p.matchId&&Object.hasOwn(TANKS,m.tank)){p.tank=m.tank;if(typeof m.name==='string')p.name=m.name.trim().slice(0,18)||'Người chơi '+id;this.lobby();}
    if(m.t==='mode'&&!p.matchId&&!p.ready&&[1,2,3].includes(m.mode)){p.mode=m.mode;this.lobby();}
    if(m.t==='ready'&&!p.matchId){if(!p.ready&&[1,2,3].includes(m.mode))p.mode=m.mode;p.ready=m.ready===true;this.lobby();if(p.ready)this.tryMatch();}
    if(m.t==='input'&&p.matchId&&this.match?.id===p.matchId){if(!Number.isInteger(m.seq)||m.seq<=p.lastSeq)return;p.lastSeq=m.seq;const q=this.players.get(id);if(!q)return;const i=m.input||{};q.input={dx:clamp(Number(i.dx)||0,-1,1),dy:clamp(Number(i.dy)||0,-1,1),angle:Number.isFinite(i.angle)?i.angle:q.turretAngle,fire:i.fire===true,skill:['Q','W','R'].includes(i.skill)?i.skill:''};}
  }
  tryMatch(){
    if(this.match)return;const mode=[1,2,3].find(size=>[...this.peers.values()].filter(p=>p.ready&&!p.matchId&&p.mode===size).length>=size*2);if(!mode)return;const selected=[...this.peers.values()].filter(p=>p.ready&&!p.matchId&&p.mode===mode).slice(0,mode*2);
    selected.sort(()=>Math.random()-.5);this.map=arena();this.mapDirty=true;this.sequence=0;const matchId='m'+Date.now().toString(36);this.match={id:matchId,mode,time:0,score:[0,0],result:null,events:[],map:this.map,bullets:[]};this.players.clear();
    selected.forEach((p,index)=>{p.matchId=matchId;p.ready=false;const team=index<mode?0:1,slot=index%mode;const player=playerFor(p.id,p.name,p.tank,team);player.x=team===0?130:W-130;player.y=500+(slot-(mode-1)/2)*180;this.players.set(p.id,player);});
    this.broadcast({t:'matched',matchId,mode,players:[...this.players.values()].map(this.publicPlayer)},selected.map(p=>p.id));this.lobby();this.snapshot();
  }
  publicPlayer(p){return {id:p.id,name:p.name,tank:p.tank,team:p.team,x:p.x,y:p.y,bodyAngle:p.bodyAngle,turretAngle:p.turretAngle,hp:p.hp,maxHp:p.maxHp,energy:p.energy,maxEnergy:p.maxEnergy,shield:p.shield,kills:p.kills,deaths:p.deaths,alive:p.alive,respawn:p.respawn,buffs:p.buffs,skillCd:p.skillCd};}
  damage(target,amount,source,magic=false,reflect=true){if(!target.alive)return;target.revealed=2.5;let armor=target.tankDef.armor;if(target.tank==='tiger'&&target.hp/target.maxHp<.3)armor+=50;let taken=amount*(magic?1:100/(100+armor));if(target.shield>0){const before=target.shield,soak=Math.min(target.shield,taken);target.shield-=soak;taken-=soak;if(before>0&&target.shield===0){for(const q of this.players.values())if(q.team!==target.team&&dist(q,target)<100){q.stun=1;this.damage(q,85,target,true);}}}target.hp-=taken;if(reflect&&target.tank==='aegis'&&source&&source.team!==target.team)this.damage(source,amount*.15,target,true,false);if(target.hp<=0){target.hp=0;target.alive=false;target.respawn=3;target.deaths++;this.match.score[source?.team===0?0:1]++;if(source&&source.team!==target.team)source.kills++;this.match.events.push({type:'TANK_DIED',victim:target.id,killer:source?.id||null,x:target.x,y:target.y});}}
  cast(p,key){const cd=p.skillCd[key]||0,cost={Q:20,W:35,R:80}[key];if(cd>0||p.energy<cost)return;p.energy-=cost;
    if(p.tank==='pegasus'){
      if(key==='Q'){this.bullet(p,150+p.tankDef.damage,p.turretAngle,850,true);p.skillCd.Q=4;}
      if(key==='W'){const dx=Math.cos(p.bodyAngle),dy=Math.sin(p.bodyAngle);p.x=clamp(p.x+dx*260,30,W-30);p.y=clamp(p.y+dy*260,30,H-30);p.skillCd.W=8;}
      if(key==='R'){const targets=[...this.players.values()].filter(q=>q.team!==p.team&&q.alive).sort((a,b)=>dist(a,p)-dist(b,p)).slice(0,3);for(const t of targets)this.bullet(p,100,Math.atan2(t.y-p.y,t.x-p.x),520,false,100);p.skillCd.R=35;}
    }else if(p.tank==='tiger'){
      if(key==='Q'){for(const a of [-Math.PI/6,0,Math.PI/6])this.bullet(p,p.tankDef.damage,p.turretAngle+a,650,false);p.skillCd.Q=5;}
      if(key==='W'){p.shield+=455;p.buffs.push({type:'shield',time:4});p.skillCd.W=12;}
      if(key==='R'){p.buffs.push({type:'charge',time:1.4});p.skillCd.R=40;}
    }else{
      if(key==='Q'){this.bullet(p,120,p.turretAngle,700,false,0,3);p.skillCd.Q=6;}
      if(key==='W'){for(const q of this.players.values())if(q.team===p.team&&dist(p,q)<250)q.shield+=180;p.skillCd.W=14;}
      if(key==='R'){for(const q of this.players.values()){if(q.team===p.team&&dist(p,q)<800)q.hp=Math.min(q.maxHp,q.hp+q.maxHp*.2);else if(q.team!==p.team&&dist(p,q)<200){const a=Math.atan2(q.y-p.y,q.x-p.x);q.x=clamp(q.x+Math.cos(a)*180,30,W-30);q.y=clamp(q.y+Math.sin(a)*180,30,H-30);this.damage(q,190,p,true);}}p.skillCd.R=45;}
    }
  }
  bullet(p,damage,angle,speed,pierce=false,aoe=0,bounces=0){const range=p.tank==='pegasus'&&p.inBush?720:600;this.match.bullets.push({id:Math.random().toString(36).slice(2),owner:p.id,team:p.team,x:p.x+Math.cos(angle)*25,y:p.y+Math.sin(angle)*25,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,damage,life:Math.min(1.5,range/speed),pierce,aoe,bounces,hit:[]});}
  tick(dt){const m=this.match;if(!m||m.result)return;m.time+=dt;for(const p of this.players.values()){
      p.energy=Math.min(100,p.energy+10*dt);p.revealed=Math.max(0,(p.revealed||0)-dt);for(const k of Object.keys(p.skillCd))p.skillCd[k]=Math.max(0,p.skillCd[k]-dt);p.buffs=p.buffs.filter(b=>(b.time-=dt)>0);
      if(!p.alive){p.respawn-=dt;if(p.respawn<=0){p.alive=true;p.hp=p.maxHp;p.shield=0;p.x=p.team?W-130:130;p.y=260+Math.floor(Math.random()*3)*240;}continue;}
      const stunned=p.stun>0;if(stunned)p.stun=Math.max(0,p.stun-dt);const i=stunned?{dx:0,dy:0,angle:p.input.angle,fire:false,skill:''}:p.input,speed=p.tankDef.speed*(p.buffs.some(b=>b.type==='charge')?1.8:1),mag=Math.hypot(i.dx,i.dy)||1,dx=i.dx/mag*speed*dt,dy=i.dy/mag*speed*dt;
      if(dx||dy)p.bodyAngle=Math.atan2(dy,dx);p.turretAngle=i.angle;
      const wasInBush=!!p.inBush;p.inBush=this.map.blocks.some(b=>b.type==='bush'&&rectHit(p.x,p.y,16,b));if(p.tank==='pegasus'&&wasInBush&&!p.inBush)p.bushCrit=true;
      const ice=this.map.blocks.some(b=>b.type==='ice'&&rectHit(p.x,p.y,16,b));const mult=ice ? .75 : 1;const nx=clamp(p.x+dx*mult,20,W-20),ny=clamp(p.y+dy*mult,20,H-20);
      if(!this.map.blocks.some(b=>['wall','water','crate'].includes(b.type)&&rectHit(nx,p.y,16,b)))p.x=nx;if(!this.map.blocks.some(b=>['wall','water','crate'].includes(b.type)&&rectHit(p.x,ny,16,b)))p.y=ny;
      if(i.skill)this.cast(p,i.skill);
      if(p.tank==='tiger'&&p.buffs.some(b=>b.type==='charge'))for(const q of this.players.values())if(q.team!==p.team&&q.alive&&dist(p,q)<36){this.damage(q,350,p);q.x=clamp(q.x+Math.cos(p.bodyAngle)*100,24,W-24);q.y=clamp(q.y+Math.sin(p.bodyAngle)*100,24,H-24);p.buffs=p.buffs.filter(b=>b.type!=='charge');}
      if(i.fire&&p.fireCd<=0){this.bullet(p,p.tankDef.damage*(p.bushCrit?1.5:1),p.turretAngle,620);p.bushCrit=false;p.revealed=2.5;p.fireCd=p.tankDef.rate;}else p.fireCd=Math.max(0,p.fireCd-dt);
      if(p.tank==='aegis'&&p.hp<p.maxHp)p.hp=Math.min(p.maxHp,p.hp+2*dt);
    }
    for(const bullet of m.bullets||[]){bullet.x+=bullet.vx*dt;bullet.y+=bullet.vy*dt;bullet.life-=dt;let hitBlock=null;for(const b of this.map.blocks){if(rectHit(bullet.x,bullet.y,bullet.aoe?bullet.aoe/8:6,b)){if(b.type==='crate'){b.hp-=bullet.damage;this.mapDirty=true;if(b.hp<=0)b.type='ground';else hitBlock=b;}else if(b.type==='wall'&&!bullet.pierce)hitBlock=b;}}
      if(hitBlock){if(bullet.bounces>0){bullet.vx*=-1;bullet.vy*=-1;bullet.bounces--;}else bullet.life=0;}
      for(const p of this.players.values()){if(!p.alive||p.team===bullet.team||bullet.hit.includes(p.id))continue;if(Math.hypot(p.x-bullet.x,p.y-bullet.y)<22){this.damage(p,bullet.damage,this.players.get(bullet.owner));bullet.hit.push(p.id);if(bullet.aoe){for(const other of this.players.values())if(other.team!==bullet.team&&other.id!==p.id&&dist(other,bullet)<bullet.aoe)this.damage(other,bullet.damage*.65,this.players.get(bullet.owner),true);bullet.life=0;}else if(!bullet.pierce)bullet.life=0;}}
    }
    m.bullets=(m.bullets||[]).filter(b=>b.life>0&&b.x>0&&b.y>0&&b.x<W&&b.y<H);this.map.blocks=this.map.blocks.filter(b=>b.type!=='ground'||b.maxHp===0);
    if(m.score[0]>=MAX_SCORE||m.score[1]>=MAX_SCORE){m.result=m.score[0]>=MAX_SCORE?0:1;const matchIds=[...this.players.keys()];this.broadcast({t:'result',winner:m.result,score:m.score},matchIds);for(const peer of this.peers.values())if(peer.matchId===m.id){peer.matchId=null;peer.ready=false;}this.match=null;this.players.clear();this.lobby();this.tryMatch();}
  }
  snapshot(){if(!this.match)return;const m=this.match,events=m.events.splice(0),sequence=++this.sequence,sendMap=sequence===1||this.mapDirty;for(const peer of this.peers.values())if(peer.matchId===m.id){const own=this.players.get(peer.id);const visible=[...this.players.values()].filter(p=>p.team===own?.team||!p.inBush||p.revealed>0).map(this.publicPlayer);const state={id:m.id,time:m.time,score:m.score,players:visible,bullets:m.bullets||[],events};if(sendMap)state.map=this.map;peer.send({t:'state',sequence,state});}this.mapDirty=false;}
  leave(id){const p=this.peers.get(id);if(!p)return;this.peers.delete(id);if(p.matchId){this.players.delete(id);if(this.players.size<(this.match?.mode||3)*2){for(const peer of this.peers.values())if(peer.matchId===p.matchId){peer.matchId=null;peer.ready=false;this.players.delete(peer.id);peer.send({t:'match-ended',reason:'Người chơi đã thoát. Hãy sẵn sàng để ghép trận mới.'});}this.match=null;this.players.clear();}}this.lobby();this.tryMatch();}
}
