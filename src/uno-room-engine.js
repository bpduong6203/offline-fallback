// Server-Authoritative Room Engine for UNO Multiplayer
import {
  UnoGame,
  getCardColor,
  getCardType,
  getCardScore,
  isValidPlay
} from '../uno/engine.js';
import { UnoAI, AI_DIFFICULTY } from '../uno/ai.js';

export class UnoRoomEngine {
  constructor() {
    this.peers = new Map();
    this.host = null;
    this.game = null;
    this.bots = new Map(); // slot -> { id, name, isBot: true, difficulty }
    this.turnTimer = null;
    this.penaltyTimer = null;
    this.botTurnTimer = null;
  }

  join(name, send) {
    if (this.game && !this.game.ended) {
      // Check reconnection
      const existing = [...this.peers.values()].find(p => p.name === name && p.disconnected);
      if (existing) {
        existing.send = send;
        existing.disconnected = false;
        send({ t: 'hello', id: existing.id });
        this.snapshot();
        return existing.id;
      }
      throw new Error('Ván đấu đang diễn ra. Vui lòng chờ ván sau.');
    }

    const totalOccupied = this.peers.size + this.bots.size;
    if (totalOccupied >= 4) {
      throw new Error('Phòng đã đủ 4 người.');
    }

    const availableSlots = [0, 1, 2, 3].filter(s => !this.peers.has(s) && !this.bots.has(s));
    const id = availableSlots[0];

    const peer = {
      id,
      name: typeof name === 'string' && name.trim() ? name.trim().slice(0, 15) : `Người chơi ${id + 1}`,
      send,
      disconnected: false
    };

    this.peers.set(id, peer);
    this.host ??= id;

    send({ t: 'hello', id });
    this.lobby();
    return id;
  }

  leave(id) {
    const peer = this.peers.get(id);
    if (!peer) return;

    if (this.game && !this.game.ended) {
      peer.disconnected = true;
      // If all human peers disconnected, end game
      const anyActive = [...this.peers.values()].some(p => !p.disconnected);
      if (!anyActive) {
        this.clearTimers();
        this.game = null;
      } else {
        // If it was the disconnected player's turn, auto pass/draw
        if (this.game.currentTurn === id) {
          this.autoPlayForPlayer(id);
        }
      }
    } else {
      this.peers.delete(id);
    }

    // Host migration
    if (this.host === id) {
      const remaining = [...this.peers.values()].find(p => !p.disconnected);
      this.host = remaining ? remaining.id : null;
    }

    if (!this.game || this.game.ended) {
      this.lobby();
    } else {
      this.snapshot();
    }
  }

  addBot(difficulty = AI_DIFFICULTY.MEDIUM) {
    if (this.game && !this.game.ended) return;
    const totalOccupied = this.peers.size + this.bots.size;
    if (totalOccupied >= 4) return;

    const availableSlots = [0, 1, 2, 3].filter(s => !this.peers.has(s) && !this.bots.has(s));
    const id = availableSlots[0];
    const botNames = ['Minh Anh', 'Tuấn Hải', 'Hương Ly'];

    this.bots.set(id, {
      id,
      name: `Bot ${botNames[id - 1] || id}`,
      isBot: true,
      difficulty
    });

    this.lobby();
  }

  removeBot(id) {
    if (this.game && !this.game.ended) return;
    if (this.bots.has(id)) {
      this.bots.delete(id);
      this.lobby();
    }
  }

  broadcast(message) {
    for (const p of this.peers.values()) {
      if (!p.disconnected) {
        try { p.send(message); } catch (e) {}
      }
    }
  }

  lobby() {
    const playersList = [];
    for (let slot = 0; slot < 4; slot++) {
      if (this.peers.has(slot)) {
        const p = this.peers.get(slot);
        playersList.push({ id: p.id, name: p.name, ready: true, isBot: false, disconnected: p.disconnected });
      } else if (this.bots.has(slot)) {
        const b = this.bots.get(slot);
        playersList.push({ id: b.id, name: b.name, ready: true, isBot: true });
      }
    }

    this.broadcast({
      t: 'lobby',
      host: this.host,
      playing: !!this.game && !this.game.ended,
      players: playersList,
      maxPlayers: 4
    });
  }

  start(requesterId) {
    if (this.host !== requesterId) {
      throw new Error('Chỉ có chủ phòng mới được bắt đầu trận đấu.');
    }

    const total = this.peers.size + this.bots.size;
    if (total < 2) {
      throw new Error('Cần tối thiểu 2 người chơi hoặc bot để bắt đầu.');
    }

    // Prepare participants
    const participants = [];
    for (let slot = 0; slot < 4; slot++) {
      if (this.peers.has(slot)) {
        const p = this.peers.get(slot);
        participants.push({ id: p.id, name: p.name, isBot: false });
      } else if (this.bots.has(slot)) {
        const b = this.bots.get(slot);
        participants.push({ id: b.id, name: b.name, isBot: true, difficulty: b.difficulty });
      }
    }

    this.game = new UnoGame({ players: participants });
    this.clearTimers();
    this.snapshot();
    this.scheduleNextAction();
  }

  snapshot() {
    if (!this.game) return;

    for (const p of this.peers.values()) {
      if (!p.disconnected) {
        // Enforce anti-cheat hand masking per peer
        const playerState = this.game.getStateForPlayer(p.id);
        p.send({
          t: 'state',
          ...playerState
        });
      }
    }
  }

  handle(playerId, packet) {
    if (!packet || typeof packet !== 'object') return;

    switch (packet.t) {
      case 'ping':
        const peer = this.peers.get(playerId);
        if (peer && !peer.disconnected) {
          try { peer.send({ t: 'pong' }); } catch (e) {}
        }
        break;

      case 'start':
        this.start(playerId);
        break;

      case 'addBot':
        if (this.host === playerId) {
          this.addBot(packet.difficulty || 'medium');
        }
        break;

      case 'remBot':
        if (this.host === playerId && packet.id != null) {
          this.removeBot(packet.id);
        }
        break;

      case 'unoCall':
        if (this.game && !this.game.ended) {
          const res = this.game.callUno(playerId);
          if (res.success) {
            this.broadcast({ t: 'unoCalled', playerId });
          }
        }
        break;

      case 'catchUno':
        if (this.game && !this.game.ended && packet.targetId != null) {
          const res = this.game.catchUnoPenalty(playerId);
          if (res.success) {
            this.broadcast({
              t: 'unoCatchResult',
              success: true,
              catcherId: playerId,
              catcherName: this.getPlayerName(playerId),
              targetId: packet.targetId,
              targetName: this.getPlayerName(packet.targetId)
            });
            this.snapshot();
            this.scheduleNextAction();
          }
        }
        break;

      case 'play':
        if (this.game && !this.game.ended && this.game.currentTurn === playerId) {
          if (packet.calledUno) {
            this.game.callUno(playerId);
          }
          const cardsToPlay = Array.isArray(packet.cardIds) && packet.cardIds.length > 1
            ? packet.cardIds
            : packet.cardId;
          const res = Array.isArray(cardsToPlay)
            ? this.game.playCards(playerId, cardsToPlay, packet.chosenColor)
            : this.game.playCard(playerId, cardsToPlay, packet.chosenColor);
          if (res.success) {
            if (res.gameOver) {
              this.onGameOver();
            } else {
              this.snapshot();
              this.scheduleNextAction();
            }
          } else {
            this.sendError(playerId, res.error);
          }
        }
        break;

      case 'draw':
        if (this.game && !this.game.ended && this.game.currentTurn === playerId) {
          const res = this.game.drawCard(playerId);
          if (res.success) {
            if (!res.canPlayDrawn) {
              // Automatically pass if card drawn is not playable
              this.game.passTurn(playerId);
              this.snapshot();
              this.scheduleNextAction();
            } else {
              this.snapshot();
            }
          }
        }
        break;

      case 'drawPlay':
        if (this.game && !this.game.ended && this.game.currentTurn === playerId) {
          if (packet.play && this.game.pendingDraw?.cardId != null) {
            if (packet.calledUno) {
              this.game.callUno(playerId);
            }
            const res = this.game.playCard(playerId, this.game.pendingDraw.cardId, packet.chosenColor);
            if (res.success) {
              if (res.gameOver) {
                this.onGameOver();
              } else {
                this.snapshot();
                this.scheduleNextAction();
              }
            }
          } else {
            this.game.passTurn(playerId);
            this.snapshot();
            this.scheduleNextAction();
          }
        }
        break;
    }
  }

  scheduleNextAction() {
    this.clearTimers();
    if (!this.game || this.game.ended) return;

    // Check penalty window broadcast
    if (this.game.unoPenaltyWindow) {
      const targetId = this.game.unoPenaltyWindow.playerId;
      this.broadcast({
        t: 'unoPenalty',
        targetId,
        targetName: this.getPlayerName(targetId),
        expiresAt: this.game.unoPenaltyWindow.expiresAt
      });

      // Clear penalty window after 2.5s
      this.penaltyTimer = setTimeout(() => {
        if (this.game && this.game.unoPenaltyWindow) {
          this.game.unoPenaltyWindow = null;
          this.snapshot();
        }
      }, 2600);
    }

    const currId = this.game.currentTurn;
    const player = this.game.players[currId];

    if (player && player.isBot) {
      // Schedule Bot turn
      const delay = Math.floor(800 + Math.random() * 800);
      this.botTurnTimer = setTimeout(() => {
        this.executeBotTurn(currId);
      }, delay);
    } else {
      // 20s timeout turn timer for human player
      this.turnTimer = setTimeout(() => {
        if (this.game && !this.game.ended && this.game.currentTurn === currId) {
          this.autoPlayForPlayer(currId);
        }
      }, 20000);
    }
  }

  executeBotTurn(botId) {
    if (!this.game || this.game.ended || this.game.currentTurn !== botId) return;

    const bot = this.game.players[botId];
    const topCard = this.game.discardPile[this.game.discardPile.length - 1];
    const activeColor = this.game.activeColor;
    const botDifficulty = this.bots.get(botId)?.difficulty || AI_DIFFICULTY.MEDIUM;

    const move = UnoAI.decideMove(bot.hand, topCard, activeColor, this.game, botDifficulty);

    if (move.action === 'play') {
      if (bot.hand.length === 2 && UnoAI.shouldCallUno(botDifficulty)) {
        this.game.callUno(botId);
        this.broadcast({ t: 'unoCalled', playerId: botId });
      }

      const res = this.game.playCard(botId, move.cardId, move.chosenColor);
      if (res.success) {
        if (res.gameOver) {
          this.onGameOver();
          return;
        }
      }
    } else {
      const drawRes = this.game.drawCard(botId);
      if (drawRes.success && drawRes.cardDrawn != null) {
        const drawnPlay = UnoAI.decideDrawnPlay(
          drawRes.cardDrawn,
          topCard,
          activeColor,
          bot.hand,
          botDifficulty
        );
        if (drawnPlay.play) {
          this.game.playCard(botId, drawRes.cardDrawn, drawnPlay.chosenColor);
        } else {
          this.game.passTurn(botId);
        }
      }
    }

    this.snapshot();
    this.scheduleNextAction();
  }

  autoPlayForPlayer(playerId) {
    if (!this.game || this.game.ended || this.game.currentTurn !== playerId) return;

    const player = this.game.players[playerId];
    const topCard = this.game.discardPile[this.game.discardPile.length - 1];
    const activeColor = this.game.activeColor;
    const valid = player.hand.filter(c => isValidPlay(c, topCard, activeColor));

    if (valid.length > 0) {
      const chosen = valid[0];
      const type = getCardType(chosen);
      const chosenColor = (type === 'wild' || type === 'draw4') ? 'red' : null;
      this.game.playCard(playerId, chosen, chosenColor);
    } else {
      const drawRes = this.game.drawCard(playerId);
      this.game.passTurn(playerId);
    }

    if (this.game.ended) {
      this.onGameOver();
    } else {
      this.snapshot();
      this.scheduleNextAction();
    }
  }

  onGameOver() {
    this.clearTimers();
    this.snapshot();
    this.broadcast({
      t: 'roundOver',
      winner: this.game.winner,
      roundScore: this.game.roundScore
    });
  }

  getPlayerName(id) {
    if (this.peers.has(id)) return this.peers.get(id).name;
    if (this.bots.has(id)) return this.bots.get(id).name;
    return `Người chơi ${id + 1}`;
  }

  sendError(playerId, message) {
    const peer = this.peers.get(playerId);
    if (peer && !peer.disconnected) {
      try { peer.send({ t: 'error', message }); } catch (e) {}
    }
  }

  clearTimers() {
    if (this.turnTimer) { clearTimeout(this.turnTimer); this.turnTimer = null; }
    if (this.penaltyTimer) { clearTimeout(this.penaltyTimer); this.penaltyTimer = null; }
    if (this.botTurnTimer) { clearTimeout(this.botTurnTimer); this.botTurnTimer = null; }
  }
}
