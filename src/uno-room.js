// Cloudflare Durable Object for UNO Multiplayer Rooms
import { UnoRoomEngine } from './uno-room-engine.js';

export class UnoRoom {
  constructor() {
    this.engine = new UnoRoomEngine();
    this.created = false;
  }

  async fetch(request) {
    if (request.headers.get('Upgrade')?.toLowerCase() !== 'websocket') {
      return new Response('Expected WebSocket', { status: 426 });
    }

    const url = new URL(request.url);
    const create = url.searchParams.get('action') === 'create';

    if (create && (this.engine.peers.size + this.engine.bots.size)) {
      return new Response('Room exists', { status: 409 });
    }
    if (!create && (!this.created || (!this.engine.peers.size && !this.engine.bots.size))) {
      return new Response('Room not found', { status: 404 });
    }
    if (this.engine.peers.size + this.engine.bots.size >= 4) {
      return new Response('Room full', { status: 409 });
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();
    this.created = true;

    const send = message => server.send(JSON.stringify(message));
    let id;
    try {
      id = this.engine.join(url.searchParams.get('name'), send);
    } catch (e) {
      server.close(1008, e.message);
      return new Response(e.message, { status: 400 });
    }

    let departed = false;
    let count = 0;
    let windowStart = Date.now();

    const leave = () => {
      if (departed) return;
      departed = true;
      this.engine.leave(id);
      if (!this.engine.peers.size) {
        this.created = false;
      }
      try { server.close(1000, 'bye'); } catch {}
    };

    server.addEventListener('message', event => {
      if (typeof event.data !== 'string' || event.data.length > 512) return;
      const now = Date.now();
      if (now - windowStart > 1000) {
        count = 0;
        windowStart = now;
      }
      if (++count > 90) {
        server.close(1008, 'Too many messages');
        leave();
        return;
      }
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      this.engine.handle(id, message);
    });

    server.addEventListener('close', leave);
    server.addEventListener('error', leave);

    return new Response(null, { status: 101, webSocket: client });
  }
}
