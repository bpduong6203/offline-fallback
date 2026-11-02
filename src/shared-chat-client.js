// Keep the browser program as text: Worker bundling must not inject closure helpers.
export const SHARED_CHAT_CLIENT=`(function sharedChat(){
  if(document.getElementById('mebi-shared-chat'))return;
  const host=document.createElement('div');host.id='mebi-shared-chat';document.body.append(host);
  const root=host.attachShadow({mode:'open'});
  root.innerHTML=\`<style>
    :host{position:fixed;right:12px;top:48%;z-index:10000;font:14px system-ui,sans-serif;color:#f6f0df;color-scheme:dark}
    *{box-sizing:border-box}button,input{font:inherit}button{cursor:pointer;background:#ecc779;color:#173328;border:0;border-radius:10px;padding:10px 12px;min-height:42px}button:disabled{opacity:.5;cursor:default}button:focus-visible,input:focus-visible{outline:3px solid #ecc779;outline-offset:2px}[hidden]{display:none!important}
    #panel{position:fixed;right:12px;bottom:max(12px,env(safe-area-inset-bottom));width:min(360px,calc(100vw - 24px));height:min(540px,80dvh);display:flex;flex-direction:column;background:#102b24;border:1px solid #ecc779;border-radius:16px;box-shadow:0 8px 40px #0008;overflow:hidden}
    header{padding:12px;display:flex;justify-content:space-between;align-items:center;border-bottom:1px solid #ffffff22}h2{font-size:16px;margin:0}header p{font-size:11px;color:#b4c8bd;margin:3px 0}#close{background:transparent;color:#f6f0df}#messages{overflow:auto;flex:1;min-height:70px;padding:12px;overscroll-behavior:contain}.message{margin:0 0 12px;overflow-wrap:anywhere}.message b{color:#ecc779;font-size:12px}.message time{font-size:10px;color:#b4c8bd;margin-left:8px}.message p{margin:3px 0;white-space:pre-wrap}
    form{padding:12px;border-top:1px solid #ffffff22;display:grid;grid-template-columns:1fr auto;gap:8px}label{grid-column:1/-1;font-size:12px}input{width:100%;min-width:0;padding:9px;border:1px solid #ffffff44;border-radius:8px;background:#081b17;color:#f6f0df}#name{margin-top:4px}#status{font-size:11px;color:#c4d6cb;margin:0;padding:5px 12px;min-height:26px}#launch{box-shadow:0 3px 16px #0006}
  </style><button id="launch" aria-expanded="false" aria-controls="panel">Chat chung</button>
  <section id="panel" hidden aria-label="Chat chung Mebi"><header><div><h2>Chat chung Mebi</h2><p>Cùng kênh trên mọi game · 100 tin gần nhất</p></div><button id="close" aria-label="Đóng chat">✕</button></header><div id="messages" role="log" aria-label="Tin nhắn" aria-live="polite"></div><p id="status" role="status"></p><form><label>Tên hiển thị<input id="name" maxlength="24" required autocomplete="nickname" placeholder="Tên của bạn"></label><input id="text" aria-label="Tin nhắn" maxlength="300" required placeholder="Nhắn cho mọi người…" autocomplete="off"><button id="send" disabled>Gửi</button></form></section>\`;
  const $=id=>root.getElementById(id),panel=$('panel'),list=$('messages');
  let timer,loading=false,sending=false,ready=false,lastIds='',retryId='';
  try{$('name').value=localStorage.getItem('mebi.chat.name')||localStorage.getItem('xidach.name')||'';}catch{}
  root.addEventListener('keydown',event=>event.stopPropagation());root.addEventListener('keyup',event=>event.stopPropagation());
  function render(messages){
    if(!Array.isArray(messages))throw new Error('Không tải được tin nhắn.');
    const ids=messages.map(m=>m.id).join(',');if(ids===lastIds)return;
    const bottom=list.scrollTop+list.clientHeight>=list.scrollHeight-45;
    list.replaceChildren();
    for(const message of messages){const row=document.createElement('div'),name=document.createElement('b'),time=document.createElement('time'),text=document.createElement('p');row.className='message';name.textContent=message.name;time.textContent=new Date(message.time).toLocaleTimeString('vi-VN',{hour:'2-digit',minute:'2-digit'});text.textContent=message.text;row.append(name,time,text);list.append(row);}
    if(bottom||!lastIds)list.scrollTop=list.scrollHeight;lastIds=ids;
  }
  async function request(options){const response=await fetch('/api/chat',{credentials:'same-origin',cache:'no-store',...options});let data;try{data=await response.json();}catch{throw new Error('Không kết nối được chat. Vui lòng thử lại.');}if(!response.ok)throw new Error(data.error||'Không gửi được tin nhắn.');return data;}
  async function poll(){
    clearTimeout(timer);if(panel.hidden||document.hidden||loading)return;
    loading=true;
    try{const data=await request();render(data.messages);ready=true;$('status').textContent='Kênh chung · cập nhật mỗi 3 giây';}
    catch(error){$('status').textContent=error.message;}
    finally{loading=false;$('send').disabled=sending||!ready;if(!panel.hidden)timer=setTimeout(poll,3000);}
  }
  $('launch').onclick=()=>{panel.hidden=false;$('launch').hidden=true;$('launch').setAttribute('aria-expanded','true');poll();$('name').focus();};
  $('close').onclick=()=>{panel.hidden=true;$('launch').hidden=false;$('launch').setAttribute('aria-expanded','false');clearTimeout(timer);$('launch').focus();};
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)poll();else clearTimeout(timer);});
  $('text').oninput=()=>{retryId='';};$('name').oninput=()=>{retryId='';};
  root.querySelector('form').onsubmit=async event=>{
    event.preventDefault();if(sending||!ready)return;
    const name=$('name').value.trim(),text=$('text').value.trim();if(!name||!text)return;
    retryId ||= crypto.randomUUID();sending=true;$('send').disabled=true;
    try{const data=await request({method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({name,text,requestId:retryId})});render(data.messages);$('text').value='';retryId='';$('status').textContent='Đã gửi';try{localStorage.setItem('mebi.chat.name',name);}catch{}list.scrollTop=list.scrollHeight;}
    catch(error){$('status').textContent=error.message;}
    finally{sending=false;$('send').disabled=!ready;}
  };
})();`;
