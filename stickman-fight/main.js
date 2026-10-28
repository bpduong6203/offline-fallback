import {createMatch} from './match.js';
import {Input} from './input.js';
import {Renderer} from './renderer.js';
import {Effects} from './effects.js';
import {Audio} from './audio.js';
import {Network} from './network.js';
import {load,save} from './storage.js';
import {$,hud,overlay} from './ui.js';
import {loop} from './loop.js';
import {PRESETS,WEAPONS} from './config.js';
const saved=load(),settings={sound:typeof saved.sound==='boolean'?saved.sound:true,volume:Number.isFinite(saved.volume)?Math.max(0,Math.min(1,saved.volume)):.5,reduced:!!saved.reduced};
let arena=['city','dojo','bamboo'].includes(saved.arena)?saved.arena:'city',seconds=saved.seconds===90?90:60,mode='menu',debug=false,state,fx=new Effects(),previous=null,receivedAt=0,sequence=0,sendTime=0,lastStateAt=0;
let preset=Object.hasOwn(PRESETS,saved.preset)?saved.preset:'boxer',weapon=Object.hasOwn(WEAPONS,saved.weapon)?saved.weapon:'none';
$('player-name').value=typeof saved.name==='string'?saved.name.slice(0,20):'Người chơi';
function options(){const names=['Người chơi 1','Người chơi 2'],loadouts=[{preset,weapon},{preset:'boxer',weapon:'none'}];if(net.lobby)for(const p of net.lobby.players){names[p.id]=p.name;loadouts[p.id]={preset:p.preset,weapon:p.weapon};}return {arena,seconds,names,loadouts};}
const renderer=new Renderer($('board')),audio=new Audio(settings),net=new Network(receive,message=>{showMenu();$('room-message').textContent=message;});
state=createMatch(options());
function persist(){save({...settings,arena,seconds,preset,weapon,name:$('player-name').value.trim()||'Người chơi'});}
function soundUi(){$('sound').checked=settings.sound;$('settings').textContent=settings.sound?'♫':'♪';$('settings').setAttribute('aria-label','Cài đặt âm thanh'+(settings.sound?' (đang bật)':' (đang tắt)'));}
function selections(){document.querySelectorAll('[data-arena]').forEach(b=>{b.classList.toggle('selected',b.dataset.arena===arena);b.setAttribute('aria-pressed',String(b.dataset.arena===arena));});document.querySelectorAll('[data-seconds]').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.seconds)===seconds);b.setAttribute('aria-pressed',String(Number(b.dataset.seconds)===seconds));});}
function roomUi(){
 const lobby=net.lobby,connected=!!lobby,host=connected&&lobby.host===net.id;
 $('room-entry').hidden=connected;$('room-lobby').hidden=!connected;$('room-id').textContent=net.room;
 $('player-name').disabled=connected||mode==='connecting';$('create-room').disabled=$('join-room').disabled=mode==='connecting';
 $('setup').disabled=mode==='connecting'||connected&&(!host||lobby.playing);
 $('loadout').disabled=mode==='connecting'||connected&&lobby.playing;
 $('room-role').textContent=connected?`Bạn là P${net.id+1} · ${net.id===0?'Xanh':'Cam'}${host?' · Chủ phòng':''}`:'';
 $('room-players').replaceChildren(...(lobby?.players||[]).map(p=>{const row=document.createElement('li');const name=document.createElement('b');name.textContent=p.name+' · '+PRESETS[p.preset].name;const tag=document.createElement('small');tag.textContent=`P${p.id+1}${p.id===net.id?' · Bạn':''} · ${WEAPONS[p.weapon].name}${p.id===lobby.host?' · Chủ phòng':''}`;row.append(name,tag);row.className=p.id?'orange':'blue';return row;}));
 $('primary').disabled=mode==='connecting'||connected&&(!state.paused&&(!host||lobby.players.length!==2));
 $('pause').disabled=mode!=='match'||state.phase==='result';
 $('menu').textContent=connected?'Rời phòng':'Về menu';
 if(mode==='lobby')overlay('PHÒNG '+net.room,lobby.players.length===2?'Đối thủ đã sẵn sàng.':'Đang chờ đối thủ…',host?'Gửi mã phòng cho bạn bè. Bạn chọn đấu trường và bắt đầu khi đủ 2 người.':'Chủ phòng sẽ chọn đấu trường và bắt đầu trận.',host?'Bắt đầu trận':'Chờ chủ phòng',true);
}
function preview(){if(mode==='menu'||mode==='lobby'){state=createMatch(options());previous=null;hud(state);}persist();selections();}
function showMenu(){mode='menu';input.clear();previous=null;fx=new Effects();state=createMatch(options());$('announcement').hidden=true;overlay('ĐỐI ĐẦU QUA MẠNG','Kỹ năng quyết định. Tình bạn thử thách.','Tạo phòng hoặc nhập mã để kết nối với bạn bè.','Tạo phòng');roomUi();preview();}
function connect(create){
 const room=create?Array.from(crypto.getRandomValues(new Uint8Array(4)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join(''):$('room-code').value.trim().toUpperCase();
 if(!/^[A-Z0-9]{4}$/.test(room)){$('room-message').textContent='Mã phòng gồm 4 chữ cái hoặc chữ số.';return;}
 audio.unlock();input.clear();persist();mode='connecting';overlay('KẾT NỐI PHÒNG','Đang kết nối…','Đang mở phòng đấu cho bạn.','Đang kết nối');roomUi();
 try{net.connect(room,$('player-name').value.trim()||'Người chơi',create);}catch{net.leave();showMenu();$('room-message').textContent='Không mở được kết nối. Hãy thử lại.';}
}
function pause(force=false){if(mode!=='match'||state.phase==='result')return;input.clear();if(force&&state.paused)return;net.send({t:state.paused&&!force?'resume':'pause'});}
const input=new Input(()=>mode==='match'&&!state.paused&&!document.querySelector('dialog[open]'),()=>pause(true),code=>{if(code==='Escape'&&!document.querySelector('dialog[open]'))pause();if(code==='KeyM'){audio.unlock();settings.sound=!settings.sound;soundUi();persist();}if(code==='F2')debug=!debug;});
function receive(m){
 if(m.t==='error'){$('room-message').textContent=m.message;return;}
 if(m.t==='hello'){$('room-message').textContent='Đã kết nối. Chia sẻ mã phòng để mời bạn bè.';sequence=0;net.send({t:'loadout',preset,weapon});if(net.creating)net.send({t:'config',arena,seconds});}
 if(m.t==='lobby'){
  arena=m.arena;seconds=m.seconds;
  const own=m.players.find(p=>p.id===net.id);if(own){preset=own.preset;weapon=own.weapon;loadoutUi();}
  if(!m.hasMatch){mode='lobby';preview();}
  selections();roomUi();
 }
 if(m.t==='started'){input.clear();mode='match';previous=null;fx=new Effects();sequence=0;lastStateAt=performance.now();$('overlay').hidden=true;$('room-message').textContent='Mỗi người điều khiển nhân vật của mình. Esc tạm dừng cho cả hai.';}
 if(m.t==='state'){
  if(m.sequence<=sequence)return;sequence=m.sequence;
  const old=state;state=m.state;receivedAt=lastStateAt=performance.now();previous=old&&old.round===state.round&&old.phase===state.phase&&!state.paused&&!old.paused?old:null;
  for(const e of state.events){fx.hit(e,settings.reduced);audio.play(e.kind==='end'?'end':e.broken?'break':e.blocked?'block':e.kind);}state.events=[];
  if(old?.phase!==state.phase||old?.paused!==state.paused)input.clear();
  mode='match';
  if(state.phase==='result'){
   const winner=state.wins[0]>=2?0:1;
   overlay('KẾT THÚC TRẬN ĐẤU',state.options.names[winner]+' chiến thắng!',state.result||`Tỉ số ${state.wins[0]} — ${state.wins[1]}. Thêm một trận phục thù?`,'Chơi lại',true);
  }else if(state.paused){overlay('TẠM DỪNG CHO CẢ HAI','Đã tạm dừng','Một người đã tạm dừng hoặc chuyển tab. Bấm Tiếp tục khi cả hai sẵn sàng.','Tiếp tục',true);}
  else $('overlay').hidden=true;
  roomUi();hud(state);
 }
}
$('primary').onclick=()=>{audio.unlock();if(mode==='menu')connect(true);else if(mode==='match'&&state.paused)net.send({t:'resume'});else net.send({t:'start'});};
$('create-room').onclick=()=>connect(true);$('join-room').onclick=()=>connect(false);$('pause').onclick=()=>pause();
function leave(){net.leave();showMenu();$('room-message').textContent='Đã rời phòng. Bạn có thể tạo hoặc vào phòng khác.';}
$('menu').onclick=$('leave-room').onclick=leave;
$('copy-room').onclick=async()=>{try{await navigator.clipboard.writeText(net.room);$('room-message').textContent='Đã sao chép mã phòng.';}catch{$('room-message').textContent='Mã phòng: '+net.room;}};
$('room-code').oninput=()=>{$('room-code').value=$('room-code').value.toUpperCase();};$('room-code').onkeydown=e=>{if(e.code==='Enter'&&mode!=='connecting')connect(false);};
function dialog(id){pause(true);audio.unlock();$(id).showModal();}
$('help').onclick=$('help-bottom').onclick=()=>dialog('instructions');$('settings').onclick=()=>dialog('preferences');
function config(){persist();selections();if(net.lobby)net.send({t:'config',arena,seconds});else preview();}
for(const b of document.querySelectorAll('[data-arena]'))b.onclick=()=>{arena=b.dataset.arena;config();};for(const b of document.querySelectorAll('[data-seconds]'))b.onclick=()=>{seconds=Number(b.dataset.seconds);config();};
function loadoutUi(){for(const b of document.querySelectorAll('[data-preset]')){b.classList.toggle('selected',b.dataset.preset===preset);b.setAttribute('aria-pressed',String(b.dataset.preset===preset));}$('weapon-choice').value=weapon;}
function chooseLoadout(){persist();loadoutUi();if(net.lobby)net.send({t:'loadout',preset,weapon});else preview();}
for(const b of document.querySelectorAll('[data-preset]'))b.onclick=()=>{preset=b.dataset.preset;chooseLoadout();};$('weapon-choice').onchange=()=>{weapon=$('weapon-choice').value;chooseLoadout();};
$('player-name').oninput=persist;
$('sound').onchange=()=>{audio.unlock();settings.sound=$('sound').checked;soundUi();persist();};$('volume').value=settings.volume;$('volume').oninput=()=>{audio.unlock();settings.volume=Number($('volume').value);persist();audio.play('block');};$('reduced').checked=settings.reduced;$('reduced').onchange=()=>{settings.reduced=$('reduced').checked;persist();};
function update(dt){
 if(mode==='menu'||mode==='lobby'){state.clock+=dt;return;}
 if(mode!=='match'||state.phase==='result')return;
 if(lastStateAt&&performance.now()-lastStateAt>10000){net.leave();showMenu();$('room-message').textContent='Mất tín hiệu máy chủ. Hãy vào lại phòng.';return;}
 if(!state.paused){fx.step(dt);sendTime+=dt;if(sendTime>=1/30){sendTime=0;const [a,b]=input.read();net.send({t:'input',left:a.left||b.left,right:a.right||b.right,block:a.block||b.block,down:a.down||b.down,slide:a.slide||b.slide,pickup:a.pickup||b.pickup,jump:a.jump||b.jump,action:a.action||b.action});}}
}
function draw(fps){
 hud(state);let drawing=state;
 if(previous){const alpha=Math.min(1,(performance.now()-receivedAt)/50);drawing={...state,players:state.players.map((p,i)=>({...p,x:previous.players[i].x+(p.x-previous.players[i].x)*alpha,y:previous.players[i].y+(p.y-previous.players[i].y)*alpha}))};}
 renderer.draw(drawing,fx,debug,fps,settings.reduced);
 const announce=mode==='match'&&!state.paused&&(state.phase==='countdown'||state.phase==='roundEnd');$('announcement').hidden=!announce;if(announce)$('announcement').textContent=state.phase==='countdown'?String(Math.max(1,Math.ceil(state.phaseTime))):state.result;
 $('game-status').textContent=mode==='menu'?'CHƯA VÀO PHÒNG':mode==='connecting'?'ĐANG KẾT NỐI':mode==='lobby'?`PHÒNG ${net.room} · ${net.lobby?.players.length||0}/2 NGƯỜI`:state.paused?'ĐÃ TẠM DỪNG':state.phase==='fight'?`BẠN LÀ P${net.id+1} · ĐANG GIAO ĐẤU`:state.phase==='result'?'TRẬN ĐẤU KẾT THÚC':'CHUẨN BỊ HIỆP ĐẤU';
}
window.addEventListener('pagehide',()=>{input.clear();net.leave();});
window.addEventListener('pageshow',e=>{if(e.persisted){showMenu();$('room-message').textContent='Hãy tạo hoặc vào phòng lại để kết nối.';}});
Object.defineProperty(window,'stickmanSnapshot',{get:()=>JSON.parse(JSON.stringify({mode,room:net.room,id:net.id,lobby:net.lobby,sequence,phase:state.phase,paused:state.paused,time:state.time,players:state.players,bullets:state.bullets,drops:state.drops,wins:state.wins,arena:state.options.arena,round:state.round}))});
soundUi();loadoutUi();showMenu();loop(update,draw);
