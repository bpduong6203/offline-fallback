import {formatEggs} from './rules.js';
const $=id=>document.getElementById(id), avatars=['🐯','🐼','🦊','🐸','🐱','🐻','🐰','🐧'];
const esc=text=>String(text??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const actionId=()=>[...crypto.getRandomValues(new Uint8Array(16))].map(n=>n.toString(16).padStart(2,'0')).join('');
const storage={get(key){try{return localStorage.getItem(key);}catch{return null;}},set(key,value){try{localStorage.setItem(key,value);}catch{}}};
let avatar=Number(storage.get('xidach.avatar')||0),ws,state,selfId,room='',amount=1000,reconnectTimer,toastTimer,retry=0,connected=false,offset=0,sound=storage.get('xidach.sound')==='on',audio,lastPhase='';
let reduce=storage.get('xidach.reduce')==='on'||matchMedia('(prefers-reduced-motion: reduce)').matches;
const seenCards=new Map();let shownRound=-1,shownResult='';
function toast(message){$('toast').textContent=message;$('toast').hidden=false;clearTimeout(toastTimer);toastTimer=setTimeout(()=>$('toast').hidden=true,5000);}
function beep(){if(!sound)return;try{audio ||=new AudioContext();const o=audio.createOscillator(),g=audio.createGain();o.connect(g);g.connect(audio.destination);o.frequency.value=520;g.gain.setValueAtTime(.035,audio.currentTime);g.gain.exponentialRampToValueAtTime(.001,audio.currentTime+.12);o.start();o.stop(audio.currentTime+.12);}catch{}}
function preferences(){$('sound').textContent=`Âm thanh: ${sound?'Bật':'Tắt'}`;$('sound').setAttribute('aria-pressed',String(sound));$('motion').textContent=`Giảm chuyển động: ${reduce?'Bật':'Tắt'}`;$('motion').setAttribute('aria-pressed',String(reduce));document.body.classList.toggle('reduce',reduce);}
$('sound').onclick=()=>{sound=!sound;storage.set('xidach.sound',sound?'on':'off');preferences();beep();};$('motion').onclick=()=>{reduce=!reduce;storage.set('xidach.reduce',reduce?'on':'off');preferences();};preferences();
$('rulesButton').onclick=()=>$('rules').showModal();$('closeRules').onclick=()=>$('rules').close();
function renderAvatars(){$('avatars').innerHTML=avatars.map((a,i)=>`<button type="button" data-avatar="${i}" class="${i===avatar?'selected':''}" aria-label="Avatar ${a}" aria-pressed="${i===avatar}">${a}</button>`).join('');}
$('avatars').onclick=e=>{const b=e.target.closest('[data-avatar]');if(b){avatar=Number(b.dataset.avatar);storage.set('xidach.avatar',avatar);renderAvatars();}};renderAvatars();
$('name').value=storage.get('xidach.name')||'';
const linkedRoom=new URL(location.href).searchParams.get('room');if(linkedRoom)$('roomCode').value=linkedRoom.toUpperCase();
function tokenFor(code){return storage.get('xidach.token.'+code);}
function connect(code,create=false){
  clearTimeout(reconnectTimer);room=code;connected=false;$('connection').textContent='Đang kết nối…';$('entryError').textContent='';
  $('createButton').disabled=$('joinButton').disabled=true;
  ws=new WebSocket(`${location.protocol==='https:'?'wss:':'ws:'}//${location.host}/__game/xi-dach/ws?room=${code}`);
  const socket=ws;
  socket.onopen=()=>{if(socket!==ws)return;socket.send(JSON.stringify({type:'hello',name:$('name').value.trim(),avatar,create,token:tokenFor(code)||undefined}));};
  socket.onmessage=event=>{if(socket!==ws)return;let m;try{m=JSON.parse(event.data);}catch{return;}
    if(m.type==='welcome'){selfId=m.id;storage.set('xidach.token.'+code,m.token);storage.set('xidach.name',$('name').value.trim());connected=true;retry=0;$('connection').textContent='● Đã kết nối';$('entry').hidden=true;$('game').hidden=false;history.replaceState(null,'','/xi-dach?room='+code);}
    if(m.type==='error'){toast(m.message);if(!selfId){$('entryError').textContent=m.message;$('createButton').disabled=$('joinButton').disabled=false;socket.close();}return;}
    if(m.type==='snapshot'&&selfId){state=m.state;offset=state.serverTime-Date.now();render();if(state.phase!==lastPhase){beep();lastPhase=state.phase;}}
  };
  socket.onclose=()=>{if(socket!==ws)return;connected=false;$('connection').textContent=selfId?'Mất kết nối · Đang thử lại…':'Chưa kết nối';$('createButton').disabled=$('joinButton').disabled=false;if(state)render();if(selfId){reconnectTimer=setTimeout(()=>connect(code),Math.min(5000,700*++retry));}else if(!$('entryError').textContent)$('entryError').textContent='Không thể kết nối phòng. Vui lòng thử lại.';};
  socket.onerror=()=>{};
}
function validName(){if(!$('name').reportValidity())return false;return !!$('name').value.trim();}
$('entryForm').onsubmit=e=>{e.preventDefault();if(!validName())return;const code=$('roomCode').value.trim().toUpperCase();if(!/^[A-HJ-NP-Z2-9]{6}$/.test(code)){toast('Mã phòng gồm 6 ký tự, không có I, O, 0, 1.');return;}connect(code);};
$('createButton').onclick=()=>{if(!validName())return;const chars='ABCDEFGHJKLMNPQRSTUVWXYZ23456789',bytes=crypto.getRandomValues(new Uint8Array(6));connect([...bytes].map(n=>chars[n%chars.length]).join(''),true);};
if(linkedRoom&&tokenFor(linkedRoom.toUpperCase()))connect(linkedRoom.toUpperCase());
function act(type,extra={}){if(!connected||!state||ws?.readyState!==1){toast('Đang kết nối lại, vui lòng chờ.');return;}ws.send(JSON.stringify({roomId:room,roundId:state.roundId,actionId:actionId(),type,...extra}));}
$('invite').onclick=async()=>{const link=location.origin+'/xi-dach?room='+room;try{await navigator.clipboard.writeText(link);toast('Đã sao chép link mời.');}catch{toast('Link mời: '+link);}};
function cards(player){
  const key=player.id||'dealer',previous=seenCards.get(key)||[],list=player.cards||Array.from({length:player.count},()=>null);
  const seat=key==='dealer'?state.players.length:state.players.findIndex(p=>p.id===key);
  const html=list.map((c,i)=>{
    const value=c?c.rank+c.suit:'back',effect=previous[i]===undefined?'incoming':previous[i]!==value?'flipped':'';
    const animation=`style="animation:none" data-effect="${effect}" data-delay="${state.phase==='DEALING'?(i*9+seat)*40:0}"`;
    return c?`<div class="card ${['♥','♦'].includes(c.suit)?'red':''}" ${animation} aria-label="${({1:'A',11:'J',12:'Q',13:'K'}[c.rank]||c.rank)+' '+c.suit}"><span>${{1:'A',11:'J',12:'Q',13:'K'}[c.rank]||c.rank}</span><small>${c.suit}</small></div>`:`<div class="card back" ${animation} aria-label="Bài úp">♠</div>`;
  }).join('');
  seenCards.set(key,list.map(c=>c?c.rank+c.suit:'back'));return `<div class="cards">${html}</div>`;
}
function animateCards(){
  if(reduce||matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const table=document.querySelector('.felt').getBoundingClientRect();
  for(const card of document.querySelectorAll('[data-effect="incoming"]')){
    const rect=card.getBoundingClientRect();
    card.animate([{transform:`translate(${table.left+table.width/2-rect.left-rect.width/2}px,${table.top+table.height/2-rect.top-rect.height/2}px) rotate(-12deg)`,opacity:0},{transform:'none',opacity:1}],{duration:320,delay:Number(card.dataset.delay),fill:'backwards',easing:'ease-out'});
  }
  for(const card of document.querySelectorAll('[data-effect="flipped"]'))card.animate([{transform:'rotateY(90deg)'},{transform:'rotateY(0)'}],{duration:300,easing:'ease-out'});
  const resultKey=state.roundId+':'+state.results.length;
  if(state.results.length&&shownResult!==resultKey){shownResult=resultKey;for(const delta of document.querySelectorAll('#results .delta'))delta.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:400});}
}
function hand(h){return h?`<div class="hand-label ${h.kind>=2?'special':''}">${h.name} · ${h.total} điểm bài</div>`:'';}
function resultText(r){return r.result===1?`Thắng +${formatEggs(r.delta)}`:r.result===-1?`Thua −${formatEggs(-r.delta)}`:'Hòa · Hoàn cược';}
function results(rows,dealer){return rows.length?rows.map(r=>`<div class="result-row"><span class="result-name">${esc(r.name)}</span><small>${r.hand.name} · ${r.hand.total} điểm bài<br>Nhà cái: ${dealer?.name||''} · ${dealer?.total??''} điểm bài<br>Cược ${formatEggs(r.bet)}</small><span class="delta ${r.result===1?'win':r.result===-1?'loss':'tie'}">${resultText(r)}</span></div>`).join(''):'<p class="fine">Kết quả sẽ xuất hiện sau khi so bài.</p>';}
const phases={LOBBY:'Chờ mở bàn',BETTING:'Mời bạn đặt cược',DEALING:'Đang chia bài',PLAYER_TURNS:'Lượt người chơi',DEALER_TURN:'Nhà cái đang rút bài',SHOWDOWN:'Cùng so bài',SETTLEMENT:'Đang quyết toán',ROUND_END:'Ván đã kết thúc'};
function render(){
  const s=state,me=s.players.find(p=>p.id===selfId);if(!me)return;const host=s.hostId===selfId,myTurn=s.turnId===selfId&&s.phase==='PLAYER_TURNS';
  if(shownRound!==s.roundId){seenCards.clear();shownRound=s.roundId;}
  $('roomLabel').textContent=room;$('playerCount').textContent=`Người chơi: ${s.players.length}/8`;$('roundLabel').textContent=`Ván ${s.roundId||'—'} · ${host?'Bạn là chủ phòng':esc(s.players.find(p=>p.id===s.hostId)?.name||'')+' là chủ phòng'}`;
  $('fund').textContent=formatEggs(s.fund);$('reserved').textContent=`Đang giữ: ${formatEggs(s.reserved)} từ quỹ bot`;
  $('phaseLabel').textContent=myTurn?'Đến lượt bạn':phases[s.phase];$('phaseHelp').textContent=s.phase==='PLAYER_TURNS'&&!myTurn?`Đang chờ ${s.players.find(p=>p.id===s.turnId)?.name||'người chơi'}`:s.phase==='BETTING'?'Chọn cược để tham gia. Chưa cược sẽ ngồi ngoài.':s.phase==='LOBBY'?'Chủ phòng mở đặt cược khi mọi người sẵn sàng.':s.phase==='ROUND_END'?'Ván tiếp theo sẽ mở sau ít giây.':myTurn?'Rút thêm hay dằn? Bạn quyết định.':s.phase==='DEALER_TURN'?'Bot rút dưới 17 · Dằn từ 17.':'';
  $('dealer').innerHTML=`<span class="bot-icon" aria-hidden="true">🤖</span><div class="name">Nhà cái · Bot</div>${cards(s.dealer)}${hand(s.dealer.hand)}`;
  const index=s.players.findIndex(p=>p.id===selfId),rotated=[...s.players.slice(index+1),...s.players.slice(0,index)];
  $('opponents').innerHTML=Array.from({length:7},(_,i)=>{const p=rotated[i];return p?`<div class="seat ${p.id===s.turnId?'active':''}"><div class="avatar">${avatars[p.avatar]}</div><div class="name" title="${esc(p.name)}">${esc(p.name)}${p.id===s.hostId?' ♛':''}</div><div class="muted">${p.online?'Đang ở bàn':'Mất kết nối'} · ${p.count} lá</div>${p.count?cards(p):''}${hand(p.hand)}<div class="money">${p.bet?'Cược '+formatEggs(p.bet):p.participating?'Đã quyết toán':'Chờ ván tiếp'}</div></div>`:`<div class="seat empty"><span>＋ Ghế trống</span></div>`;}).join('');
  $('self').classList.toggle('active',myTurn);$('self').innerHTML=`<div class="name">${avatars[me.avatar]} ${esc(me.name)} · Bạn${host?' ♛':''}</div>${cards(me)}${hand(me.hand)}${me.hand?.totals.length>1?`<div class="fine">Các tổng A: ${me.hand.totals.join(' / ')}</div>`:''}${!me.participating&&!['LOBBY','BETTING'].includes(s.phase)?'<div class="fine">Bạn sẽ tham gia từ ván tiếp theo.</div>':''}`;
  $('hostControls').innerHTML=host?(s.phase==='LOBBY'?'<button data-action="open" class="primary">Mở đặt cược</button>':s.phase==='BETTING'?`<button data-action="start" class="primary" ${s.players.some(p=>p.bet)?'':'disabled'}>Bắt đầu ván</button>`:s.phase==='ROUND_END'?'<button data-action="next" class="primary">Sẵn sàng ván tiếp theo</button>':''):'';
  let content=`<div class="wallet"><div><span>Số dư</span><b>🥚 ${formatEggs(me.balance)}</b></div><div><span>Đang cược</span><b>${formatEggs(me.bet)}</b></div></div>`;
  if(s.phase==='BETTING')content+=`<div class="quick">${[1000,2000,5000,10000].map(n=>`<button data-bet="${n}" class="${amount===n?'selected':''}" ${!connected||n>me.balance+me.bet?'disabled':''}>${formatEggs(n)}</button>`).join('')}</div><label for="betAmount">Mức cược · bước 1.000 trứng</label><div class="bet-layout"><input id="betAmount" type="number" inputmode="numeric" min="1000" max="10000" step="1000" value="${amount}"><button id="confirmBet" class="primary" ${!connected?'disabled':''}>Đặt cược ${formatEggs(amount)}</button><button data-action="cancel" class="subtle" ${!connected||!me.bet?'disabled':''}>Hủy cược</button></div>`;
  else if(myTurn)content+=`<div class="play-actions"><button data-action="hit" class="primary" ${!connected?'disabled':''}>Rút bài</button><button data-action="stand" class="secondary" ${!connected||me.hand.total<16?'disabled':''}>Dằn</button></div>${me.hand.total<16?'<p class="fine">Cần ít nhất 16 điểm bài mới được dằn.</p>':''}`;
  else content+=`<div class="muted">${s.phase==='LOBBY'?'Chờ chủ phòng mở đặt cược.':s.phase==='ROUND_END'?'Kiểm tra kết quả và chuẩn bị ván tiếp theo.':s.phase==='PLAYER_TURNS'?'Chờ đến lượt của bạn.':'Mọi thao tác được xử lý trên server.'}</div>`;
  if(host&&s.players.length>1&&['LOBBY','BETTING','ROUND_END'].includes(s.phase))content+=`<div id="hostTransfer"><select id="hostTarget" aria-label="Chọn chủ phòng mới">${s.players.filter(p=>p.id!==selfId).map(p=>`<option value="${p.id}">${esc(p.name)}</option>`).join('')}</select><button id="transfer">Chuyển chủ phòng</button></div>`;
  $('controls').innerHTML=content;$('results').innerHTML=results(s.results,s.dealer.hand);$('history').innerHTML=s.history.length?s.history.map(h=>`<details><summary>Ván ${h.roundId} · ${h.results.length} người chơi</summary>${results(h.results,h.dealer)}</details>`).join(''):'<p>Những ván đầu tiên đang chờ bạn.</p>';
  for(const b of document.querySelectorAll('[data-action]')){if(!connected)b.disabled=true;b.onclick=()=>act(b.dataset.action);}
  for(const b of document.querySelectorAll('[data-bet]'))b.onclick=()=>{amount=Number(b.dataset.bet);render();};
  if($('betAmount'))$('betAmount').oninput=e=>{amount=Number(e.target.value);$('confirmBet').textContent=`Đặt cược ${Number.isSafeInteger(amount)&&amount>0?formatEggs(amount):'— trứng'}`;};
  if($('confirmBet'))$('confirmBet').onclick=()=>{if(!$('betAmount').reportValidity())return;if(amount>me.balance+me.bet){toast('Không đủ trứng');return;}act('bet',{amount});};
  if($('transfer'))$('transfer').onclick=()=>act('host',{targetId:$('hostTarget').value});countdown();animateCards();
}
function countdown(){if(!state)return;const sec=Math.max(0,Math.ceil((state.deadline-Date.now()-offset)/1000));$('countdown').textContent=state.deadline?`${sec}s`:'';}
setInterval(countdown,250);
