export class Network {
  constructor(receive,closed){this.receive=receive;this.closed=closed;this.socket=null;this.id=null;this.room='';this.lobby=null;}
  connect(room,name,create){
    this.leave();this.room=room;
    const url=new URL('/__game/ws',location.href);url.protocol=location.protocol==='https:'?'wss:':'ws:';url.search=new URLSearchParams({g:'bomb',room,name,action:create?'create':'join'});
    const socket=new WebSocket(url);this.socket=socket;
    let welcomed=false;
    const timeout=setTimeout(()=>{if(this.socket===socket&&!welcomed){this.leave();this.closed('Không kết nối được. Hãy kiểm tra mã phòng và thử lại.');}},8000);
    socket.onmessage=event=>{
      if(this.socket!==socket)return;
      let m;try{m=JSON.parse(event.data);}catch{return;}
      if(m.t==='hello'){welcomed=true;clearTimeout(timeout);this.id=m.id;}
      if(m.t==='lobby')this.lobby=m;
      this.receive(m);
    };
    socket.onclose=()=>{clearTimeout(timeout);if(this.socket!==socket)return;this.socket=null;this.id=null;this.lobby=null;this.closed(welcomed?'Đã mất kết nối với phòng. Bạn có thể tạo hoặc vào phòng khác.':'Không vào được phòng: mã không tồn tại, phòng đã đầy hoặc đang thi đấu.');};
    socket.onerror=()=>{};
  }
  send(message){if(this.socket?.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify(message));}
  leave(){const socket=this.socket;this.socket=null;this.id=null;this.lobby=null;if(socket)socket.close();}
}
