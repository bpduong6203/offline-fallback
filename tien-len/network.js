// WebSocket Network Client for Tiến Lên Miền Nam Multiplayer

export class NetworkClient {
  constructor() {
    this.ws = null;
    this.handlers = new Map();
    this.roomCode = '';
    this.playerId = null;
    this.connected = false;
  }

  on(event, handler) {
    if (!this.handlers.has(event)) {
      this.handlers.set(event, []);
    }
    this.handlers.get(event).push(handler);
  }

  emit(event, data) {
    const list = this.handlers.get(event);
    if (list) {
      list.forEach(cb => {
        try { cb(data); } catch (e) { console.error('Handler error:', e); }
      });
    }
  }

  connect({ room, action = 'create', name = 'Người chơi' }) {
    this.roomCode = room.toUpperCase();
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}/__game/ws?g=tienlen&room=${this.roomCode}&action=${action}&name=${encodeURIComponent(name)}`;

    return new Promise((resolve, reject) => {
      try {
        this.ws = new WebSocket(url);
      } catch (err) {
        return reject(err);
      }

      this.ws.onopen = () => {
        this.connected = true;
        this.emit('connected', { room: this.roomCode });
        resolve();
      };

      this.ws.onclose = (event) => {
        this.connected = false;
        this.emit('disconnected', { code: event.code, reason: event.reason });
      };

      this.ws.onerror = (err) => {
        this.emit('error', err);
        reject(err);
      };

      this.ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          this.handleMessage(msg);
        } catch (e) {
          console.error('Invalid message format:', e);
        }
      };
    });
  }

  handleMessage(msg) {
    switch (msg.t) {
      case 'hello':
        this.playerId = msg.id;
        this.emit('hello', msg);
        break;
      case 'lobby':
        this.emit('lobby', msg);
        break;
      case 'started':
        this.emit('started', msg);
        break;
      case 'state':
        this.emit('state', msg);
        break;
      case 'beat':
        this.emit('beat', msg);
        break;
      case 'chat':
        this.emit('chat', msg);
        break;
      case 'game_over':
        this.emit('game_over', msg);
        break;
      case 'error':
        this.emit('server_error', msg);
        break;
      default:
        this.emit('custom', msg);
    }
  }

  send(payload) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(payload));
    }
  }

  playCards(cardIds) {
    this.send({ t: 'play', cardIds });
  }

  passTurn() {
    this.send({ t: 'pass' });
  }

  startGame(options = {}) {
    this.send({ t: 'start', options });
  }

  sendChat(text) {
    this.send({ t: 'chat', text });
  }

  sendEmoji(targetId, emoji) {
    this.send({ t: 'emoji', targetId, emoji });
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
    this.connected = false;
  }
}
