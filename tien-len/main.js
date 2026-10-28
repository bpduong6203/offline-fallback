// Main Entry Point for Tiến Lên Miền Nam
import {
  Card, VALUES, SUITS, COMBO_TYPE,
  createDeck, shuffleDeck, dealCards, sortCards,
  identifyCombination, canBeat, isFreeJumpBeater,
  checkInstantWin, findValidPlays, calculatePenalties
} from './engine.js';
import { BotAI, AI_DIFFICULTY } from './ai.js';
import { sounds } from './audio.js';
import { EffectsManager } from './effects.js';
import { NetworkClient } from './network.js';
import { UIManager } from './ui.js';

class TienLenGameApp {
  constructor() {
    this.mode = 'solo'; // 'solo' or 'online'
    this.effects = new EffectsManager(document.getElementById('pokerTable'));
    this.network = new NetworkClient();

    // Solo game state
    this.players = [
      { id: 0, name: 'Bạn', isBot: false, hand: [], cardCount: 13, won: false, rank: 0 },
      { id: 1, name: 'Hải Phòng', isBot: true, hand: [], cardCount: 13, won: false, rank: 0 },
      { id: 2, name: 'Sài Gòn', isBot: true, hand: [], cardCount: 13, won: false, rank: 0 },
      { id: 3, name: 'Đà Nẵng', isBot: true, hand: [], cardCount: 13, won: false, rank: 0 }
    ];

    this.bots = [
      null,
      new BotAI(AI_DIFFICULTY.HARD),
      new BotAI(AI_DIFFICULTY.MEDIUM),
      new BotAI(AI_DIFFICULTY.HARD)
    ];

    this.currentTurn = 0;
    this.currentCombo = null;
    this.lastPlayerId = null;
    this.passedPlayerIds = new Set();
    this.rankCounter = 1;
    this.isFirstGame = true;
    this.turnTimer = null;
    this.turnTimeRemaining = 15;

    this.ui = new UIManager({
      onPlay: (cards) => this.handleUserPlay(cards),
      onPass: () => this.handleUserPass(),
      onHint: () => this.handleUserHint(),
      onSort: (byCombo) => this.handleUserSort(byCombo)
    });

    this.setupModals();
    this.setupHeaderActions();

    // Start initial solo match
    this.startSoloMatch();
  }

  setupHeaderActions() {
    const btnMute = document.getElementById('btnMute');
    if (btnMute) {
      btnMute.textContent = sounds.isMuted() ? '🔇' : '🔊';
      btnMute.addEventListener('click', () => {
        const muted = sounds.toggleMute();
        btnMute.textContent = muted ? '🔇' : '🔊';
      });
    }

    const btnRules = document.getElementById('btnRules');
    if (btnRules) {
      btnRules.addEventListener('click', () => {
        document.getElementById('rulesModal').style.display = 'flex';
      });
    }

    const roomBadge = document.getElementById('roomBadge');
    if (roomBadge) {
      roomBadge.addEventListener('click', () => {
        document.getElementById('multiplayerModal').style.display = 'flex';
      });
    }
  }

  setupModals() {
    // Close buttons
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) modal.style.display = 'none';
      });
    });

    // Multiplayer room creation & join
    const btnCreateRoom = document.getElementById('btnCreateRoom');
    const btnJoinRoom = document.getElementById('btnJoinRoom');
    const inputRoomCode = document.getElementById('inputRoomCode');
    const inputPlayerName = document.getElementById('inputPlayerName');

    if (btnCreateRoom) {
      btnCreateRoom.addEventListener('click', () => {
        const name = inputPlayerName.value.trim() || 'Bạn';
        const code = Math.random().toString(36).substring(2, 6).toUpperCase();
        this.joinOnlineRoom(code, 'create', name);
      });
    }

    if (btnJoinRoom) {
      btnJoinRoom.addEventListener('click', () => {
        const name = inputPlayerName.value.trim() || 'Bạn';
        const code = (inputRoomCode.value.trim() || '').toUpperCase();
        if (code.length === 4) {
          this.joinOnlineRoom(code, 'join', name);
        } else {
          alert('Vui lòng nhập mã phòng 4 ký tự!');
        }
      });
    }

    // Play Again button
    const btnPlayAgain = document.getElementById('btnPlayAgain');
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => {
        document.getElementById('gameOverModal').style.display = 'none';
        this.startSoloMatch();
      });
    }
  }

  joinOnlineRoom(roomCode, action, playerName) {
    this.network.connect({ room: roomCode, action, name: playerName })
      .then(() => {
        this.mode = 'online';
        document.getElementById('multiplayerModal').style.display = 'none';
        document.getElementById('roomBadge').innerHTML = `🌐 Phòng: <b>#${roomCode}</b>`;
        this.setupOnlineListeners();
      })
      .catch(err => {
        alert('Không thể kết nối phòng: ' + err);
      });
  }

  setupOnlineListeners() {
    this.network.on('state', (msg) => {
      // Sync multiplayer server authoritative state
      const state = msg.state;
      this.currentCombo = state.currentCombo ? Combination.fromJSON(state.currentCombo) : null;
      this.currentTurn = state.currentTurn;
      this.passedPlayerIds = new Set(state.passedPlayerIds || []);
      
      const myInfo = state.players.find(p => p.id === this.network.playerId);
      if (myInfo && myInfo.hand) {
        this.players[0].hand = myInfo.hand.map(c => Card.fromJSON(c));
        this.players[0].cardCount = this.players[0].hand.length;
        this.ui.renderHand(this.players[0].hand);
      }

      state.players.forEach((sp, idx) => {
        const localIdx = (sp.id - this.network.playerId + 4) % 4;
        if (this.players[localIdx]) {
          this.players[localIdx].name = sp.name;
          this.players[localIdx].cardCount = sp.cardCount;
        }
      });

      this.ui.renderArena(this.currentCombo, state.lastPlayerName);
      this.ui.renderPlayers(this.players, this.currentTurn, this.passedPlayerIds);
      this.updateControls();
    });

    this.network.on('beat', (msg) => {
      sounds.playChop();
      this.effects.shakeScreen(15, 300);
      this.effects.showBanner(msg.title || 'CHẶT HEO!', msg.sub || '', 'chop');
    });
  }

  startSoloMatch() {
    this.mode = 'solo';
    const deck = shuffleDeck(createDeck());
    const hands = dealCards(deck, 4);

    this.players.forEach((p, idx) => {
      p.hand = hands[idx];
      p.cardCount = p.hand.length;
      p.won = false;
      p.rank = 0;
      if (this.bots[idx]) this.bots[idx].reset();
    });

    this.currentCombo = null;
    this.lastPlayerId = null;
    this.passedPlayerIds.clear();
    this.rankCounter = 1;

    sounds.playDeal();

    // Check Instant Win (Tới Trắng)
    for (const p of this.players) {
      const instantWin = checkInstantWin(p.hand);
      if (instantWin) {
        this.effects.showBanner(`TỚI TRẮNG: ${instantWin.name}!`, `${p.name} thắng ngay lập tức!`, 'chop');
        sounds.playWin();
        p.won = true;
        p.rank = 1;
        this.endMatch();
        return;
      }
    }

    // Determine who goes first
    if (this.isFirstGame) {
      // Person with 3 of Spades
      let starterId = 0;
      for (const p of this.players) {
        if (p.hand.some(c => c.value === VALUES.THREE && c.suit === SUITS.SPADE)) {
          starterId = p.id;
          break;
        }
      }
      this.currentTurn = starterId;
    } else {
      // Winner of previous game starts
      this.currentTurn = this.lastWinnerId || 0;
    }

    this.ui.renderHand(this.players[0].hand);
    this.ui.renderArena(null);
    this.ui.renderPlayers(this.players, this.currentTurn, this.passedPlayerIds);

    this.startTurn();
  }

  startTurn() {
    clearInterval(this.turnTimer);
    const activePlayer = this.players[this.currentTurn];

    // If current player has already won, skip
    if (activePlayer.won) {
      this.advanceTurn();
      return;
    }

    this.turnTimeRemaining = 15;
    this.ui.updateTimer(100, false);

    this.ui.renderPlayers(this.players, this.currentTurn, this.passedPlayerIds);
    this.updateControls();

    // Countdown loop
    this.turnTimer = setInterval(() => {
      this.turnTimeRemaining -= 0.1;
      const pct = (this.turnTimeRemaining / 15) * 100;
      const isUrgent = this.turnTimeRemaining <= 5;
      this.ui.updateTimer(pct, isUrgent);

      if (isUrgent && Math.abs(Math.round(this.turnTimeRemaining) - this.turnTimeRemaining) < 0.05) {
        sounds.playTick(true);
      }

      if (this.turnTimeRemaining <= 0) {
        clearInterval(this.turnTimer);
        this.handleTimeout();
      }
    }, 100);

    // If it's a Bot's turn, execute bot logic after brief delay
    if (activePlayer.isBot) {
      const delay = Math.random() * 800 + 700;
      setTimeout(() => {
        if (this.currentTurn === activePlayer.id) {
          this.executeBotTurn(activePlayer);
        }
      }, delay);
    }
  }

  handleTimeout() {
    const isNewRound = this.currentCombo === null;
    if (isNewRound) {
      // Must play something: play smallest single
      const hand = this.players[this.currentTurn].hand;
      const plays = findValidPlays(hand, null, true);
      if (plays.length > 0) {
        this.executePlay(this.currentTurn, plays[0]);
      }
    } else {
      this.executePass(this.currentTurn);
    }
  }

  updateControls() {
    const isMyTurn = this.currentTurn === 0 && !this.players[0].won;
    const isNewRound = this.currentCombo === null;

    this.ui.setControlsState({
      isMyTurn,
      isNewRound,
      currentCombo: this.currentCombo,
      myHand: this.players[0].hand
    });
  }

  handleUserPlay(selectedCardIds) {
    if (this.currentTurn !== 0) return;
    const cards = this.players[0].hand.filter(c => selectedCardIds.includes(c.id));
    const combo = identifyCombination(cards);

    const isNewRound = this.currentCombo === null;
    const mustInclude = (this.isFirstGame && isNewRound) ? new Card(VALUES.THREE, SUITS.SPADE) : null;

    if (mustInclude && !cards.some(c => c.value === VALUES.THREE && c.suit === SUITS.SPADE)) {
      sounds.playError();
      alert('Ván đầu tiên bắt buộc phải đánh lá Ba Bích (3♠)!');
      return;
    }

    if (combo.type === COMBO_TYPE.INVALID || !canBeat(this.currentCombo, combo, isNewRound)) {
      sounds.playError();
      return;
    }

    this.executePlay(0, combo);
  }

  handleUserPass() {
    if (this.currentTurn !== 0) return;
    if (this.currentCombo === null) {
      sounds.playError();
      return; // Cannot pass when leading new round
    }
    this.executePass(0);
  }

  handleUserHint() {
    if (this.currentTurn !== 0) return;
    const isNewRound = this.currentCombo === null;
    const hand = this.players[0].hand;
    const mustInclude = (this.isFirstGame && isNewRound) ? new Card(VALUES.THREE, SUITS.SPADE) : null;

    const validPlays = findValidPlays(hand, this.currentCombo, isNewRound, mustInclude);
    if (validPlays.length > 0) {
      // Pick smallest valid play
      validPlays.sort((a, b) => a.highestCard.compareTo(b.highestCard));
      const target = validPlays[0];
      this.ui.selectCards(target.cards.map(c => c.id));
    } else {
      sounds.playPass();
      this.effects.showBanner('Không có bài chặn!', 'Bạn nên bỏ lượt', 'chop');
    }
  }

  handleUserSort(byCombo) {
    if (byCombo) {
      // Group pairs, straights, triples
      // Simple combo sort: group by card value counts
      const counts = {};
      this.players[0].hand.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);
      this.players[0].hand.sort((a, b) => {
        if (counts[b.value] !== counts[a.value]) {
          return counts[b.value] - counts[a.value]; // groups of 4, 3, 2 first
        }
        return a.compareTo(b);
      });
    } else {
      sortCards(this.players[0].hand);
    }
    this.ui.renderHand(this.players[0].hand);
  }

  executeBotTurn(botPlayer) {
    const ai = this.bots[botPlayer.id];
    const isNewRound = this.currentCombo === null;
    const mustInclude = (this.isFirstGame && isNewRound) ? new Card(VALUES.THREE, SUITS.SPADE) : null;
    const enemySizes = this.players.filter(p => p.id !== botPlayer.id && !p.won).map(p => p.cardCount);

    const move = ai.chooseMove(botPlayer.hand, this.currentCombo, isNewRound, mustInclude, enemySizes);

    if (move) {
      this.executePlay(botPlayer.id, move);
    } else {
      this.executePass(botPlayer.id);
    }
  }

  executePlay(playerId, combo) {
    clearInterval(this.turnTimer);
    const player = this.players[playerId];

    // Check if this was a CHOP (Chặt Heo / Hàng)
    const wasChop = this.currentCombo && (
      (this.currentCombo.highestCard.isTwo() && combo.highestCard.isTwo() && combo.cards.length === this.currentCombo.cards.length) ||
      (this.currentCombo.highestCard.isTwo() && [COMBO_TYPE.THREE_CONSECUTIVE_PAIRS, COMBO_TYPE.FOUR_OF_A_KIND, COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS].includes(combo.type)) ||
      (this.currentCombo.type === COMBO_TYPE.THREE_CONSECUTIVE_PAIRS && [COMBO_TYPE.FOUR_OF_A_KIND, COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS].includes(combo.type)) ||
      (this.currentCombo.type === COMBO_TYPE.FOUR_OF_A_KIND && combo.type === COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS)
    );

    if (wasChop) {
      sounds.playChop();
      this.effects.shakeScreen(16, 320);
      let title = 'CHẶT HEO!';
      if (combo.type === COMBO_TYPE.FOUR_OF_A_KIND) title = 'TỨ QUÝ ĐẬP BÀN!';
      if (combo.type === COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS) title = '4 ĐÔI THÔNG ĐÈ HÀNG!';
      this.effects.showBanner(title, `${player.name} chặt ${this.players[this.lastPlayerId]?.name || ''}!`, 'chop');

      // Floating score transfer
      const lastPod = this.ui.playerPods[this.lastPlayerId];
      const winPod = this.ui.playerPods[playerId];
      this.effects.showFloatingScore(lastPod, 10000, false);
      this.effects.showFloatingScore(winPod, 10000, true);
    } else {
      sounds.playCard();
    }

    // Remove cards from player's hand
    const playedIds = new Set(combo.cards.map(c => c.id));
    player.hand = player.hand.filter(c => !playedIds.has(c.id));
    player.cardCount = player.hand.length;

    // Record for AI card counting
    this.bots.forEach(b => b?.recordPlayed(combo.cards));

    this.currentCombo = combo;
    this.lastPlayerId = playerId;
    this.isFirstGame = false;

    // Render UI updates
    if (playerId === 0) {
      this.ui.clearSelection();
      this.ui.renderHand(player.hand);
    }
    this.ui.renderArena(this.currentCombo, player.name);

    // Check if player won
    if (player.cardCount === 0) {
      player.won = true;
      player.rank = this.rankCounter++;
      this.effects.showBanner(`🏆 ${player.name} VỀ HẠNG ${player.rank}!`, '', 'chop');
      if (playerId === 0) sounds.playWin();

      const remainingActive = this.players.filter(p => !p.won);
      if (remainingActive.length <= 1) {
        // Match ended
        if (remainingActive.length === 1) {
          remainingActive[0].rank = 4;
        }
        this.endMatch();
        return;
      }
    }

    this.advanceTurn();
  }

  executePass(playerId) {
    sounds.playPass();
    this.passedPlayerIds.add(playerId);

    // Count how many active players have passed
    const activeNonWon = this.players.filter(p => !p.won);
    const passedCount = activeNonWon.filter(p => this.passedPlayerIds.has(p.id)).length;

    // If everyone except the last player who played has passed -> New Trick!
    if (passedCount >= activeNonWon.length - 1) {
      // Clear arena
      setTimeout(() => {
        this.currentCombo = null;
        this.passedPlayerIds.clear();
        this.ui.renderArena(null);

        // Turn goes to the last person who played (or next if they won)
        let nextLeader = this.lastPlayerId;
        if (this.players[nextLeader].won) {
          nextLeader = (nextLeader + 1) % 4;
          while (this.players[nextLeader].won) {
            nextLeader = (nextLeader + 1) % 4;
          }
        }
        this.currentTurn = nextLeader;
        this.startTurn();
      }, 700);
      return;
    }

    this.advanceTurn();
  }

  advanceTurn() {
    let next = (this.currentTurn + 1) % 4;
    while (this.players[next].won || this.passedPlayerIds.has(next)) {
      next = (next + 1) % 4;
    }
    this.currentTurn = next;
    this.startTurn();
  }

  endMatch() {
    clearInterval(this.turnTimer);
    this.lastWinnerId = this.players.find(p => p.rank === 1)?.id || 0;

    // Calculate penalties (Thối heo, cóng)
    let scoreSummaryHtml = '';
    this.players.forEach(p => {
      const { penalty, details } = calculatePenalties(p.hand);
      const isCong = p.hand.length === 13;
      let badge = `Hạng ${p.rank}`;
      if (isCong) badge += ' (CÓNG!)';

      scoreSummaryHtml += `
        <div style="display:flex;justify-content:space-between;margin-bottom:8px;padding:6px;background:rgba(255,255,255,0.05);border-radius:8px">
          <div><b>${p.name}</b> (${badge})</div>
          <div style="color:${p.rank === 1 ? '#2ecc71' : '#e74c3c'}">
            ${details.length > 0 ? details.join(', ') : (p.rank === 1 ? '+15,000 Xu' : `-${p.hand.length * 1000} Xu`)}
          </div>
        </div>
      `;
    });

    document.getElementById('scoreboardList').innerHTML = scoreSummaryHtml;
    document.getElementById('gameOverModal').style.display = 'flex';

    if (this.players[0].rank === 1) {
      this.effects.launchConfetti();
      sounds.playWin();
    }
  }
}

// Bootstrap on DOM ready
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    new TienLenGameApp();
  });
}
