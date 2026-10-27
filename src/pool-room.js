// Durable Object: mỗi phòng bi-a tối đa 2 người, chỉ chuyển tiếp tin nhắn giữa hai bên.
export class PoolRoom {
  constructor(state, env) {
    this.state = state;
  }

  async fetch(request) {
    const socks = this.state.getWebSockets();
    if (socks.length >= 2) return new Response('Room full', { status: 409 });
    if (request.headers.get('Upgrade') !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const used = socks.map((s) => (s.deserializeAttachment() || {}).idx);
    const idx = used.includes(0) ? 1 : 0;

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.state.acceptWebSocket(server);
    server.serializeAttachment({ idx });
    server.send(JSON.stringify({ t: 'hello', idx }));

    const all = this.state.getWebSockets();
    if (all.length === 2) {
      for (const s of all) s.send(JSON.stringify({ t: 'start' }));
    }
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(ws, message) {
    if (typeof message !== 'string' || message.length > 2000) return;
    for (const s of this.state.getWebSockets()) {
      if (s !== ws) {
        try { s.send(message); } catch (e) {}
      }
    }
  }

  notifyLeft(ws) {
    for (const s of this.state.getWebSockets()) {
      if (s !== ws) {
        try { s.send(JSON.stringify({ t: 'left' })); } catch (e) {}
      }
    }
  }

  webSocketClose(ws) {
    this.notifyLeft(ws);
    try { ws.close(1000, 'bye'); } catch (e) {}
  }

  webSocketError(ws) {
    this.notifyLeft(ws);
  }
}
