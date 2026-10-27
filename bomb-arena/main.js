import {createGame,step} from './state.js';
import {move} from './collision.js';
import {place} from './bombs.js';
import {updateBots} from './ai.js';
import {render} from './renderer.js';
import {Audio} from './audio.js';
import {Input} from './input.js';
import {Network} from './network.js';
const $=id=>document.getElementById(id),audio=new Audio();
let theme='garden',state=createGame(),mode='menu',last=0,accumulator=0,visualTime=0;
let onlineTimer=null,previous=null,receivedAt=0;
const net=new Network(receiveOnline,message=>{stopOnline();showMenu();$('room-message').textContent=message;});
function isOnline(){return !!net.socket;}
function roomUi(){
  document.body.dataset.online=String(isOnline());
  document.querySelector('.tag').textContent=isOnline()?'ONLINE · 4 PLAYERS':'LOCAL MULTIPLAYER';
  $('humans').closest('label').hidden=isOnline();document.querySelector('.two-cols').hidden=isOnline();
  $('room-entry').hidden=isOnline();$('room-lobby').hidden=!isOnline();
  $('room-id').textContent=net.room;
  const lobby=net.lobby;if(!lobby)return;
  theme=lobby.theme;document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('selected',b.dataset.theme===theme));
  $('room-players').replaceChildren(...lobby.players.map(p=>{const li=document.createElement('li');li.textContent=p.name;const tag=document.createElement('small');tag.textContent=`${p.id===net.id?'Bạn ':''}${p.id===lobby.host?'★ Chủ phòng':''}`;li.append(tag);return li;}));
  const host=lobby.host===net.id;
  $('restart').disabled=!host;$('primary').disabled=!host||lobby.players.length<2;
  if(!lobby.playing&&mode!=='online-result'){
    mode='lobby';overlay('PHÒNG ONLINE · '+net.room,'Cùng nhau bùng nổ!',`${lobby.players.length}/4 người đã vào. ${host?'Gửi mã cho bạn bè, chọn bản đồ và bắt đầu.':'Đang chờ chủ phòng bắt đầu.'}`,host?'Bắt đầu trận →':'Chờ chủ phòng…');
    $('secondary-actions').hidden=true;
  }
  $('settings').disabled=!host||lobby.playing||mode==='online-result';
  for(const id of ['humans','bots','difficulty'])$(id).disabled=true;
}
function stopOnline(){clearInterval(onlineTimer);onlineTimer=null;previous=null;input.clear();net.leave();delete document.body.dataset.roomPhase;$('primary').disabled=false;$('restart').disabled=false;for(const id of ['humans','bots','difficulty'])$(id).disabled=false;roomUi();}
function receiveOnline(message){
  if(message.t==='error'){$('room-message').textContent=message.message;return;}
  if(message.t==='hello'){
    $('room-message').textContent='Đã vào phòng. Gửi mã phòng cho bạn bè.';
    onlineTimer=setInterval(()=>{if(mode==='online'){const [dx,dy]=input.direction(0);net.send({t:'input',dx,dy});}},50);
  }
  if(message.t==='lobby')roomUi();
  if(message.t==='started'){audio.unlock();input.clear();mode='online';previous=null;document.body.dataset.roomPhase='playing';$('primary').disabled=false;$('overlay').hidden=true;$('settings').disabled=true;$('room-message').textContent=`Bạn là ${net.lobby?.players.find(p=>p.id===net.id)?.name||'robot'}. WASD + Space hoặc nút cảm ứng. Đổi tab sẽ dừng di chuyển của bạn, trận đấu vẫn tiếp tục.`;}
  if(message.t==='state'){
    previous=state;receivedAt=performance.now();state=message.state;
    for(const event of state.events)audio.play(event);state.events=[];
    if(state.result){mode='online-result';input.clear();overlay('KẾT THÚC TRẬN ONLINE',state.result,'Chủ phòng có thể bắt đầu ván tiếp theo.','Chơi lại →');$('secondary-actions').hidden=false;$('primary').disabled=net.id!==net.lobby?.host;$('restart').disabled=net.id!==net.lobby?.host;}
    hud();
  }
}
function connectRoom(create){
  const code=create?Array.from(crypto.getRandomValues(new Uint8Array(4)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join(''):$('room-code').value.trim().toUpperCase();
  if(!/^[A-Z0-9]{4}$/.test(code)){$('room-message').textContent='Mã phòng gồm 4 chữ cái hoặc chữ số.';return;}
  audio.unlock();input.clear();clearInterval(onlineTimer);onlineTimer=null;mode='connecting';$('settings').disabled=true;
  overlay('KẾT NỐI ONLINE','Đang kết nối…','Đang mở phòng chơi cho bạn.','Đang kết nối…');$('primary').disabled=true;$('secondary-actions').hidden=true;
  $('room-message').textContent='Đang kết nối…';net.connect(code,$('player-name').value,create);
}
const coarse=matchMedia('(pointer:coarse)');
function options(){return {humans:coarse.matches?1:Number($('humans').value),bots:Number($('bots').value),difficulty:$('difficulty').value,theme};}
function constrain(){
  $('two-player').hidden=coarse.matches;
  if(coarse.matches)$('humans').value='1';
  const humans=Number($('humans').value);
  for(const opt of $('bots').options) opt.disabled=Number(opt.value)+humans>4||Number(opt.value)+humans<2;
  if($('bots').selectedOptions[0].disabled)$('bots').value=humans===1?'3':'2';
}
function preview(){constrain();if(mode==='menu'){state=createGame(options());hud();}}
function soundLabel(){$('sound').textContent=audio.enabled?'♫':'♪';$('sound').setAttribute('aria-pressed',String(audio.enabled));$('sound').title=audio.enabled?'Tắt âm thanh':'Bật âm thanh';}
function hud(){
  const seconds=Math.ceil(state.time);$('timer').textContent=`${String(Math.floor(seconds/60)).padStart(2,'0')}:${String(seconds%60).padStart(2,'0')}`;
  $('alive').textContent=`${state.players.filter(p=>p.alive).length}/${state.players.length} robot còn sống`;
  $('arena-name').textContent={garden:'KHU VƯỜN',factory:'NHÀ MÁY',ice:'VÙNG BĂNG'}[state.options.theme||theme];
  $('roster').replaceChildren(...state.players.map(p=>{
    const row=document.createElement('div');row.className='robot-row';
    const avatar=document.createElement('span');avatar.className='robot-avatar';avatar.style.background=p.color;avatar.textContent='▣';
    const description=document.createElement('div'),name=document.createElement('b'),stats=document.createElement('small');name.textContent=p.name;
    stats.textContent=`● ${state.bombs.filter(b=>b.owner===p.id).length}/${p.capacity}   ✦ ${p.range}   » ${p.speed.toFixed(1)}${p.shield?'  ◆':''}`;description.append(name,stats);
    const status=document.createElement('span');status.className='status';status.textContent=p.alive?'● Sẵn sàng':'Đã bị loại';if(mode!=='menu'&&p.alive)status.textContent='● Đang đấu';if(!p.alive)row.style.opacity='.4';
    row.append(avatar,description,status);return row;
  }));
}
function overlay(label,title,text,primary){$('overlay').hidden=false;$('modal-label').textContent=label;$('modal-title').textContent=title;$('modal-text').textContent=text;$('primary').textContent=primary;}
function start(){audio.unlock();constrain();state=createGame(options());mode='playing';input.clear();accumulator=0;last=performance.now();$('overlay').hidden=true;$('settings').disabled=true;$('secondary-actions').hidden=true;hud();$('pause').focus();}
function pause(force=false){
  if(isOnline()){input.clear();net.send({t:'input',dx:0,dy:0});if(!force)$('room-message').textContent='Trận online diễn ra liên tục. Dùng Rời phòng nếu muốn thoát.';return;}
  if(mode==='playing'){mode='paused';input.clear();accumulator=0;overlay('NGHỈ MỘT CHÚT','Đã tạm dừng','Bom và đồng hồ sẽ chờ bạn.','Tiếp tục →');$('secondary-actions').hidden=false;}
  else if(mode==='paused'&&!force){mode='playing';input.clear();last=performance.now();accumulator=0;$('overlay').hidden=true;}
}
const input=new Input(()=>mode==='playing'||mode==='paused'||mode==='online',pause,id=>{if(mode==='online'&&id===0){const [dx,dy]=input.direction(0);net.send({t:'input',dx,dy,bomb:true});}else if(mode==='playing'){const p=state.players[id];if(p&&!p.bot)place(state,p);}});
function startOnline(){net.send({t:'start',theme});}
$('primary').onclick=()=>isOnline()?startOnline():(mode==='paused'?pause():start());$('pause').onclick=()=>pause();$('restart').onclick=()=>isOnline()?startOnline():start();
function showMenu(){mode='menu';input.clear();$('settings').disabled=false;$('secondary-actions').hidden=true;overlay('SẴN SÀNG BÙNG NỔ?','Đấu trường đang chờ!','Phá khối, nhặt sức mạnh và trở thành robot cuối cùng.','Chơi ngay →');preview();}
$('menu').onclick=()=>{if(isOnline())stopOnline();showMenu();};
$('create-room').onclick=()=>connectRoom(true);$('join-room').onclick=()=>connectRoom(false);$('leave-room').onclick=()=>{stopOnline();showMenu();$('room-message').textContent='Đã rời phòng.';};
$('copy-room').onclick=async()=>{try{await navigator.clipboard.writeText(net.room);$('room-message').textContent='Đã sao chép mã phòng.';}catch{$('room-message').textContent='Mã phòng: '+net.room;}};
$('help').onclick=()=>{if(mode==='playing')pause(true);$('instructions').showModal();};
$('sound').onclick=()=>{audio.toggle();soundLabel();};
for(const id of ['humans','bots','difficulty'])$(id).onchange=preview;
for(const button of document.querySelectorAll('[data-theme]'))button.onclick=()=>{if(mode!=='menu'&&!(mode==='lobby'&&net.id===net.lobby?.host))return;theme=button.dataset.theme;document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('selected',b===button));if(isOnline())net.send({t:'theme',theme});else preview();};
coarse.addEventListener('change',()=>{if(coarse.matches&&state.options.humans===2&&mode==='playing')pause(true);preview();});
window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data==='bomb-arena-pause')pause(true);});
let hudTime=0;
function loop(now){
  const elapsed=Math.min(.1,Math.max(0,(now-last)/1000));last=now;visualTime+=elapsed;
  if(mode==='playing'){
    accumulator+=elapsed;
    while(accumulator>=1/60&&mode==='playing'){
      for(const p of state.players)if(!p.bot){const [dx,dy]=input.direction(p.id);move(state,p,dx,dy,1/60);}
      updateBots(state,1/60);step(state,1/60);accumulator-=1/60;
      for(const event of state.events)audio.play(event);state.events=[];
      if(state.result){mode='result';input.clear();overlay('KẾT THÚC TRẬN ĐẤU',state.result,'Một trận đấu thật bùng nổ. Thử thêm một ván nhé?','Chơi lại →');$('secondary-actions').hidden=false;hud();}
    }
  }
  hudTime+=elapsed;if(hudTime>.15){hud();hudTime=0;}
  let drawing=state;
  if(mode==='online'&&previous){const alpha=Math.min(1,(now-receivedAt)/50);drawing={...state,players:state.players.map(p=>{const old=previous.players.find(q=>q.id===p.id);return old?{...p,x:old.x+(p.x-old.x)*alpha,y:old.y+(p.y-old.y)*alpha}:p;})};}
  render($('board'),drawing,visualTime);requestAnimationFrame(loop);
}
window.addEventListener('pagehide',()=>{input.clear();pause(true);if(isOnline())stopOnline();});
soundLabel();preview();requestAnimationFrame(loop);
