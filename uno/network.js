// WebSocket Network Client for UNO Multiplayer

export class UnoNetworkClient {
  constructor() {
    this.ws = null;
    this.myId = null;
    this.roomCode = null;
    this.callbacks = {};
    this.pingTimer = null;
    this.connected = false;
  }

  on(event, handler) {
    if (!this.callbacks[event]) this.callbacks[event] = [];
    this.callbacks[event].push(handler);
  }

  emit(event, data) {
    const list = this.callbacks[event];
    if (list) {
      for (const fn of list) {
        try { fn(data); } catch (e) { console.error('Network handler error:', e); }
      }
    }
  }

  connect({ room, action = 'create', name = 'Player' }) {
    this.disconnect();
    this.roomCode = room.toUpperCase();

    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const host = window.location.host;
    const url = `${protocol}//${host}/__game/ws?g=uno&room=${this.roomCode}&action=${action}&name=${encodeURIComponent(name)}`;

    this.ws = new WebSocket(url);

    this.ws.onopen = () => {
      this.connected = true;
      this.emit('connected');
      this.startPing();
    };

    this.ws.onclose = (event) => {
      this.connected = false;
      this.stopPing();
      this.emit('disconnected', { code: event.code, reason: event.reason });
    };

    this.ws.onerror = (err) => {
      this.emit('error', err);
    };

    this.ws.onmessage = (event) => {
      let packet;
      try {
        packet = JSON.parse(event.data);
      } catch (e) {
        return;
      }

      switch (packet.t) {
        case 'hello':
          this.myId = packet.id;
          this.emit('hello', packet);
          break;
        case 'lobby':
          this.emit('lobby', packet);
          break;
        case 'state':
          this.emit('state', packet);
          break;
        case 'unoPenalty':
          this.emit('unoPenalty', packet);
          break;
        case 'unoCatchResult':
          this.emit('unoCatchResult', packet);
          break;
        case 'roundOver':
          this.emit('roundOver', packet);
          break;
        case 'error':
          this.emit('serverError', packet.message);
          break;
        case 'pong':
          break;
        default:
          this.emit('packet', packet);
      }
    };
  }

  startPing() {
    this.stopPing();
    this.pingTimer = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        this.send({ t: 'ping' });
      }
    }, 15000);
  }

  stopPing() {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  send(packet) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(packet));
    }
  }

  // --- Client Actions ---

  playCard(cardId, chosenColor = null, calledUno = false) {
    this.send({
      t: 'play',
      cardId,
      chosenColor,
      calledUno
    });
  }

  drawCard() {
    this.send({ t: 'draw' });
  }

  decideDrawnPlay(play = true, chosenColor = null, calledUno = false) {
    this.send({
      t: 'drawPlay',
      play,
      chosenColor,
      calledUno
    });
  }

  callUno() {
    this.send({ t: 'unoCall' });
  }

  catchUno(targetId) {
    this.send({ t: 'catchUno', targetId });
  }

  startGame() {
    this.send({ t: 'start' });
  }

  addBot(difficulty = 'medium') {
    this.send({ t: 'addBot', difficulty });
  }

  removeBot(id) {
    this.send({ t: 'remBot', id });
  }

  disconnect() {
    this.stopPing();
    if (this.ws) {
      try { this.ws.close(); } catch (e) {}
      this.ws = null;
    }
    this.connected = false;
  }
}
