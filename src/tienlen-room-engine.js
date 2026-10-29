// Server-Authoritative Room Engine for Tiến Lên Miền Nam Multiplayer
import {
  Card, VALUES, SUITS, COMBO_TYPE,
  createDeck, shuffleDeck, dealCards, sortCards,
  identifyCombination, canBeat, checkInstantWin,
  findValidPlays, calculatePenalties
} from '../tien-len/engine.js';
import { BotAI, AI_DIFFICULTY } from '../tien-len/ai.js';

export class TienLenRoomEngine {
  constructor() {
    this.peers = new Map();
    this.host = null;
    this.game = null;
    this.sequence = 0;
    this.timer = null;
  }

  join(name, send) {
    if (this.game && !this.game.ended) {
      // Reconnect check
      const existing = [...this.peers.values()].find(p => p.name === name && p.disconnected);
      if (existing) {
        existing.send = send;
        existing.disconnected = false;
        send({ t: 'hello', id: existing.id });
        this.snapshot();
        return existing.id;
      }
      throw new Error('Trận đang diễn ra. Hãy chờ ván sau.');
    }

    if (this.peers.size >= 4) {
      throw new Error('Phòng đã đủ 4 người.');
    }

    const id = [0, 1, 2, 3].find(slot => !this.peers.has(slot));
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

  broadcast(message) {
    for (const p of this.peers.values()) {
      if (!p.disconnected) {
        try { p.send(message); } catch (e) {}
      }
    }
  }

  lobby() {
    this.broadcast({
      t: 'lobby',
      host: this.host,
      playing: !!this.game && !this.game.ended,
      players: [...this.peers.values()].map(p => ({
        id: p.id,
        name: p.name,
        disconnected: p.disconnected
      }))
    });
  }

  handle(id, message, now = Date.now()) {
    const peer = this.peers.get(id);
    if (!peer || !message || typeof message !== 'object') return;

    // Start game
    if (message.t === 'start' && id === this.host) {
      if (this.game && !this.game.ended) return;
      this.startGame();
    }

    // Play card
    if (message.t === 'play') {
      if (!this.game || this.game.ended || this.game.currentTurn !== id) return;
      this.handlePlayerPlay(id, message.cardIds);
    }

    // Pass turn
    if (message.t === 'pass') {
      if (!this.game || this.game.ended || this.game.currentTurn !== id) return;
      this.handlePlayerPass(id);
    }

    // Chat / Emoji
    if (message.t === 'chat') {
      const text = typeof message.text === 'string' ? message.text.slice(0, 80) : '';
      if (text) {
        this.broadcast({ t: 'chat', senderId: id, senderName: peer.name, text });
      }
    }

    if (message.t === 'emoji') {
      this.broadcast({ t: 'emoji', senderId: id, targetId: message.targetId, emoji: message.emoji });
    }
  }

  startGame() {
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck, 4);

    const players = [0, 1, 2, 3].map(slot => {
      const peer = this.peers.get(slot);
      return {
        id: slot,
        name: peer ? peer.name : `Bot ${slot}`,
        isBot: !peer,
        hand: hands[slot],
        cardCount: hands[slot].length,
        won: false,
        rank: 0
      };
    });

    // Ensure a human player receives 3 of Spades so human friends always open the game
    const humanPlayers = players.filter(pl => !pl.isBot);
    let currentTurn = -1;
    let mustIncludeCard = null;

    // Check if any human peer already has 3 of Spades
    for (const hp of humanPlayers) {
      const c3s = hp.hand.find(c => c.value === VALUES.THREE && c.suit === SUITS.SPADE);
      if (c3s) {
        currentTurn = hp.id;
        mustIncludeCard = c3s;
        break;
      }
    }

    // If no human has 3 of Spades, swap it from the bot that has it to a human player!
    if (currentTurn === -1 && humanPlayers.length > 0) {
      const botWith3S = players.find(p => p.isBot && p.hand.some(c => c.value === VALUES.THREE && c.suit === SUITS.SPADE));
      const luckyHuman = humanPlayers[Math.floor(Math.random() * humanPlayers.length)];

      if (botWith3S && luckyHuman) {
        const c3sIdx = botWith3S.hand.findIndex(c => c.value === VALUES.THREE && c.suit === SUITS.SPADE);
        const [c3s] = botWith3S.hand.splice(c3sIdx, 1);

        const humanCard = luckyHuman.hand.shift();
        botWith3S.hand.push(humanCard);
        luckyHuman.hand.unshift(c3s);

        sortCards(botWith3S.hand);
        sortCards(luckyHuman.hand);

        currentTurn = luckyHuman.id;
        mustIncludeCard = c3s;
      }
    }

    // Fallback if all players are bots
    if (currentTurn === -1) {
      for (const p of players) {
        const c3s = p.hand.find(c => c.value === VALUES.THREE && c.suit === SUITS.SPADE);
        if (c3s) {
          currentTurn = p.id;
          mustIncludeCard = c3s;
          break;
        }
      }
      if (currentTurn === -1) {
        currentTurn = 0;
        mustIncludeCard = players[0].hand[0];
      }
    }

    this.game = {
      players,
      currentTurn,
      currentCombo: null,
      lastPlayerId: null,
      lastPlayerName: '',
      passedPlayerIds: [],
      rankCounter: 1,
      ended: false,
      isFirstTrick: true,
      mustIncludeCard
    };

    this.broadcast({ t: 'started' });
    this.snapshot();

    // Check Instant Win
    for (const p of this.game.players) {
      const instant = checkInstantWin(p.hand);
      if (instant) {
        p.won = true;
        p.rank = 1;
        this.game.ended = true;
        this.broadcast({
          t: 'beat',
          title: `TỚI TRẮNG: ${instant.name}!`,
          sub: `${p.name} thắng ngay khi chia bài!`
        });
        this.snapshot();
        return;
      }
    }
    this.checkBotTurn();
  }

  handlePlayerPlay(playerId, cardIds) {
    const peer = this.peers.get(playerId);
    const player = this.game.players[playerId];
    const playedCards = player.hand.filter(c => cardIds.includes(c.id));
    const combo = identifyCombination(playedCards);

    const isNewRound = this.game.currentCombo === null;
    if (combo.type === COMBO_TYPE.INVALID) {
      if (peer) peer.send({ t: 'error', message: 'Bộ bài không hợp lệ theo luật Tiến Lên!' });
      return;
    }
    if (!canBeat(this.game.currentCombo, combo, isNewRound)) {
      if (peer) peer.send({ t: 'error', message: 'Bài này không thể đè bài trên bàn!' });
      return;
    }

    // Opening trick validation
    if (this.game.isFirstTrick && this.game.mustIncludeCard) {
      const match = playedCards.some(c => c.value === this.game.mustIncludeCard.value && c.suit === this.game.mustIncludeCard.suit);
      if (!match) {
        if (peer) peer.send({ t: 'error', message: `Lượt đầu tiên bắt buộc phải chứa lá ${this.game.mustIncludeCard.toString()}!` });
        return;
      }
    }

    this.game.isFirstTrick = false;
    this.game.mustIncludeCard = null;

    // Check chop
    const wasChop = this.game.currentCombo && (
      this.game.currentCombo.highestCard.isTwo() ||
      this.game.currentCombo.type === COMBO_TYPE.THREE_CONSECUTIVE_PAIRS ||
      this.game.currentCombo.type === COMBO_TYPE.FOUR_OF_A_KIND
    );

    if (wasChop) {
      let title = 'CHẶT HEO!';
      if (combo.type === COMBO_TYPE.FOUR_OF_A_KIND) title = 'TỨ QUÝ ĐẬP BÀN!';
      if (combo.type === COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS) title = '4 ĐÔI THÔNG ĐÈ HÀNG!';
      this.broadcast({
        t: 'beat',
        title,
        sub: `${player.name} chặt ${this.game.lastPlayerName}!`
      });
    }

    // Remove cards
    const idSet = new Set(playedCards.map(c => c.id));
    player.hand = player.hand.filter(c => !idSet.has(c.id));
    player.cardCount = player.hand.length;

    this.game.currentCombo = combo;
    this.game.lastPlayerId = playerId;
    this.game.lastPlayerName = player.name;

    if (player.cardCount === 0) {
      player.won = true;
      player.rank = this.game.rankCounter++;
      const active = this.game.players.filter(p => !p.won);
      if (active.length <= 1) {
        if (active.length === 1) active[0].rank = 4;
        this.game.ended = true;
      }
    }

    this.advanceTurn();
    this.snapshot();
    this.checkBotTurn();
  }

  handlePlayerPass(playerId) {
    if (!this.game.passedPlayerIds.includes(playerId)) {
      this.game.passedPlayerIds.push(playerId);
    }

    const active = this.game.players.filter(p => !p.won);
    const passedCount = active.filter(p => this.game.passedPlayerIds.includes(p.id)).length;

    if (passedCount >= active.length - 1) {
      // New round
      this.game.currentCombo = null;
      this.game.passedPlayerIds = [];

      let nextLeader = this.game.lastPlayerId;
      if (this.game.players[nextLeader].won) {
        nextLeader = (nextLeader + 1) % 4;
        while (this.game.players[nextLeader].won) {
          nextLeader = (nextLeader + 1) % 4;
        }
      }
      this.game.currentTurn = nextLeader;
    } else {
      this.advanceTurn();
    }
    this.snapshot();
    this.checkBotTurn();
  }

  advanceTurn() {
    let next = (this.game.currentTurn + 1) % 4;
    while (this.game.players[next].won || this.game.passedPlayerIds.includes(next)) {
      next = (next + 1) % 4;
    }
    this.game.currentTurn = next;
  }

  checkBotTurn() {
    if (!this.game || this.game.ended) return;
    const curPlayer = this.game.players[this.game.currentTurn];
    if (curPlayer && curPlayer.isBot && !curPlayer.won) {
      setTimeout(() => {
        if (!this.game || this.game.ended || this.game.currentTurn !== curPlayer.id) return;
        const ai = new BotAI(AI_DIFFICULTY.MEDIUM);
        const isNewRound = this.game.currentCombo === null;
        const mustInclude = (this.game.isFirstTrick && this.game.mustIncludeCard) ? this.game.mustIncludeCard : null;
        const enemySizes = this.game.players.filter(p => p.id !== curPlayer.id && !p.won).map(p => p.cardCount);
        const move = ai.chooseMove(curPlayer.hand, this.game.currentCombo, isNewRound, mustInclude, enemySizes);
        if (move) {
          this.handlePlayerPlay(curPlayer.id, move.cards.map(c => c.id));
        } else {
          this.handlePlayerPass(curPlayer.id);
        }
      }, 700);
    }
  }

  snapshot() {
    if (!this.game) return;

    for (const peer of this.peers.values()) {
      if (peer.disconnected) continue;

      const playerState = this.game.players.map(p => ({
        id: p.id,
        name: p.name,
        cardCount: p.cardCount,
        won: p.won,
        rank: p.rank,
        // Only send full hand to this specific player to prevent cheating
        hand: p.id === peer.id ? p.hand.map(c => c.toJSON()) : null
      }));

      try {
        peer.send({
          t: 'state',
          sequence: ++this.sequence,
          state: {
            currentTurn: this.game.currentTurn,
            currentCombo: this.game.currentCombo ? this.game.currentCombo.toJSON() : null,
            lastPlayerId: this.game.lastPlayerId,
            lastPlayerName: this.game.lastPlayerName,
            passedPlayerIds: this.game.passedPlayerIds,
            isFirstTrick: !!this.game.isFirstTrick,
            mustIncludeCard: this.game.isFirstTrick && this.game.mustIncludeCard ? this.game.mustIncludeCard.toJSON() : null,
            ended: this.game.ended,
            players: playerState
          }
        });
      } catch (e) {}
    }
  }

  leave(id) {
    const peer = this.peers.get(id);
    if (!peer) return;

    if (this.game && !this.game.ended) {
      peer.disconnected = true;
    } else {
      this.peers.delete(id);
    }

    if (this.host === id) {
      this.host = [...this.peers.keys()].find(k => k !== id && !this.peers.get(k).disconnected) ?? null;
    }

    if ([...this.peers.values()].every(p => p.disconnected)) {
      this.game = null;
      this.peers.clear();
    }

    this.lobby();
  }
}
