export class Network {
 constructor(receive,closed){this.receive=receive;this.closed=closed;this.socket=null;this.id=null;this.room='';this.lobby=null;this.timer=null;}
 connect(room,name,create){
  this.leave();this.room=room;this.creating=create;
  const url=new URL('/__game/ws',location.href);url.protocol=location.protocol==='https:'?'wss:':'ws:';url.search=new URLSearchParams({g:'stickman',room,name,action:create?'create':'join'});
  const socket=new WebSocket(url);this.socket=socket;let welcomed=false;
  const fail=message=>{if(this.socket!==socket)return;this.leave();this.closed(message);};
  this.timer=setTimeout(()=>fail('Không kết nối được. Hãy kiểm tra mạng và thử lại.'),8000);
  socket.onmessage=e=>{
   if(this.socket!==socket)return;let m;try{m=JSON.parse(e.data);}catch{return;}
   if(m.t==='hello'){welcomed=true;clearTimeout(this.timer);this.id=m.id;}
   if(m.t==='lobby')this.lobby=m;
   this.receive(m);
  };
  socket.onclose=()=>fail(welcomed?'Đã mất kết nối với phòng. Hãy tạo hoặc vào phòng lại.':'Không vào được phòng: mã không tồn tại, phòng đã đầy hoặc đang thi đấu.');
  socket.onerror=()=>{};
 }
 send(message){if(this.socket?.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify(message));}
 leave(){clearTimeout(this.timer);const s=this.socket;this.socket=null;this.id=null;this.lobby=null;if(s)s.close();}
}
