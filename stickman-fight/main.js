import {createMatch,step} from './match.js';
import {Input} from './input.js';
import {Renderer} from './renderer.js';
import {Effects} from './effects.js';
import {Audio} from './audio.js';
import {load,save} from './storage.js';
import {$,hud,overlay} from './ui.js';
import {loop} from './loop.js';
const saved=load(),settings={sound:typeof saved.sound==='boolean'?saved.sound:true,volume:Number.isFinite(saved.volume)?Math.max(0,Math.min(1,saved.volume)):.5,reduced:!!saved.reduced};
let arena=['city','dojo','bamboo'].includes(saved.arena)?saved.arena:'city',seconds=saved.seconds===90?90:60,mode='menu',debug=false;
if(Array.isArray(saved.names))saved.names.slice(0,2).forEach((name,i)=>{if(typeof name==='string')$('p'+(i+1)).value=name.slice(0,20);});
function options(){return {arena,seconds,names:[$('p1').value.trim()||'Người chơi 1',$('p2').value.trim()||'Người chơi 2']};}
let state=createMatch(options()),fx=new Effects();const renderer=new Renderer($('board')),audio=new Audio(settings);
function persist(){save({...settings,...options()});}
function soundUi(){$('sound').checked=settings.sound;$('settings').textContent=settings.sound?'♫':'♪';$('settings').setAttribute('aria-label','Cài đặt âm thanh'+(settings.sound?' (đang bật)':' (đang tắt)'));}
function selections(){document.querySelectorAll('[data-arena]').forEach(b=>{b.classList.toggle('selected',b.dataset.arena===arena);b.setAttribute('aria-pressed',String(b.dataset.arena===arena));});document.querySelectorAll('[data-seconds]').forEach(b=>{b.classList.toggle('selected',Number(b.dataset.seconds)===seconds);b.setAttribute('aria-pressed',String(Number(b.dataset.seconds)===seconds));});}
function preview(){if(mode==='menu'){state=createMatch(options());hud(state);}persist();selections();}
function start(){audio.unlock();persist();state=createMatch(options());fx=new Effects();input.clear();mode='match';$('overlay').hidden=true;$('setup').disabled=true;$('pause').disabled=false;$('announcement').hidden=false;hud(state);$('pause').focus();}
function pause(force=false){if(mode!=='match'||state.phase==='result')return;if(force&&state.paused)return;state.paused=force||!state.paused;input.clear();if(state.paused){$('announcement').hidden=true;overlay('NGHỈ MỘT NHỊP','Đã tạm dừng','Đồng hồ và đấu trường sẽ chờ bạn.','Tiếp tục',true);$('primary').focus();}else{$('overlay').hidden=true;$('pause').focus();}}
const input=new Input(()=>mode==='match',()=>pause(true),code=>{if(code==='Escape'&&!document.querySelector('dialog[open]'))pause();if(code==='KeyM'){audio.unlock();settings.sound=!settings.sound;soundUi();persist();}if(code==='F2')debug=!debug;});
$('primary').onclick=()=>state.paused&&mode==='match'?pause():start();$('pause').onclick=()=>pause();
$('menu').onclick=()=>{mode='menu';input.clear();$('setup').disabled=false;$('announcement').hidden=true;$('pause').disabled=true;overlay('SẴN SÀNG ĐỐI ĐẦU?','Kỹ năng quyết định. Tình bạn thử thách.','Thắng 2 hiệp để làm chủ đấu trường.','Chơi 2 người');preview();};
function dialog(id){pause(true);audio.unlock();$(id).showModal();}
$('help').onclick=$('help-bottom').onclick=()=>dialog('instructions');$('settings').onclick=()=>dialog('preferences');
for(const b of document.querySelectorAll('[data-arena]'))b.onclick=()=>{arena=b.dataset.arena;preview();};
for(const b of document.querySelectorAll('[data-seconds]'))b.onclick=()=>{seconds=Number(b.dataset.seconds);preview();};
for(const id of ['p1','p2'])$(id).oninput=preview;
$('sound').onchange=()=>{audio.unlock();settings.sound=$('sound').checked;soundUi();persist();};$('volume').value=settings.volume;$('volume').oninput=()=>{audio.unlock();settings.volume=Number($('volume').value);persist();audio.play('block');};$('reduced').checked=settings.reduced;$('reduced').onchange=()=>{settings.reduced=$('reduced').checked;persist();};
function update(dt){if(mode==='menu'){state.clock+=dt;return;}if(state.paused)return;const oldPhase=state.phase;step(state,input.read(),dt);if(state.phase!=='result')fx.step(dt);for(const event of state.events){fx.hit(event,settings.reduced);audio.play(event.kind==='end'?'end':event.broken?'break':event.blocked?'block':event.kind);}state.events=[];if(oldPhase!==state.phase)input.clear();if(state.phase==='result'&&oldPhase!=='result'){const winner=state.wins[0]>=2?0:1;overlay('NHÀ VÔ ĐỊCH ĐẤU TRƯỜNG',state.options.names[winner]+' chiến thắng!',`Tỉ số ${state.wins[0]} — ${state.wins[1]}. Thêm một trận phục thù?`,'Chơi lại',true);$('primary').focus();}}
function draw(fps){hud(state);renderer.draw(state,fx,debug,fps,settings.reduced);const announce=mode==='match'&&!state.paused&&(state.phase==='countdown'||state.phase==='roundEnd');$('announcement').hidden=!announce;if(announce)$('announcement').textContent=state.phase==='countdown'?String(Math.max(1,Math.ceil(state.phaseTime))):state.result;$('game-status').textContent=mode==='menu'?'ĐANG CHỜ NGƯỜI CHƠI':state.paused?'ĐÃ TẠM DỪNG':state.phase==='fight'?'ĐANG GIAO ĐẤU':state.phase==='result'?'TRẬN ĐẤU KẾT THÚC':'CHUẨN BỊ HIỆP ĐẤU';}
// Read-only snapshot for diagnostics; no mutable game internals are exposed.
Object.defineProperty(window,'stickmanSnapshot',{get:()=>JSON.parse(JSON.stringify({mode,phase:state.phase,paused:state.paused,time:state.time,players:state.players,wins:state.wins,arena:state.options.arena,round:state.round}))});
$('pause').disabled=true;soundUi();selections();hud(state);loop(update,draw);
