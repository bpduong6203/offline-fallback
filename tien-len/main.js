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
import { EGG_ICON_DATA_URL } from './egg-asset.js';

class TienLenGameApp {
  constructor() {
    this.mode = 'solo'; // 'solo' or 'online'
    this.effects = new EffectsManager(document.getElementById('pokerTable'));
    this.network = new NetworkClient();

    // Egg currency balance (Hộp trứng Mebi Farm Pinky Egg)
    this.userEggs = 100;
    try {
      const savedEggs = parseInt(localStorage.getItem('tlmn_user_eggs'), 10);
      if (!isNaN(savedEggs) && savedEggs >= 0) this.userEggs = savedEggs;
    } catch (e) {}

    // Solo game state
    this.players = [
      { id: 0, name: 'Bạn', isBot: false, hand: [], cardCount: 13, won: false, rank: 0 },
      { id: 1, name: 'Hải Phòng', isBot: true, hand: [], cardCount: 13, won: false, rank: 0 },
      { id: 2, name: 'Sài Gòn', isBot: true, hand: [], cardCount: 13, won: false, rank: 0 },
      { id: 3, name: 'Đà Nẵng', isBot: true, hand: [], cardCount: 13, won: false, rank: 0 }
    ];

    this.bots = [
      null,
      new BotAI(AI_DIFFICULTY.MEDIUM),
      new BotAI(AI_DIFFICULTY.MEDIUM),
      new BotAI(AI_DIFFICULTY.MEDIUM)
    ];

    this.currentTurn = 0;
    this.currentCombo = null;
    this.lastPlayerId = null;
    this.passedPlayerIds = new Set();
    this.rankCounter = 1;
    this.isFirstGame = true;
    this.turnTimer = null;
    this.turnTimeRemaining = 15;
    this.lobbyRoomCode = '';

    this.ui = new UIManager({
      onPlay: (cards) => this.handleUserPlay(cards),
      onPass: () => this.handleUserPass(),
      onHint: () => this.handleUserHint(),
      onSort: (byCombo) => this.handleUserSort(byCombo)
    });

    this.setupHeaderActions();
    this.setupMenu();
    this.setupLobby();
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

    const btnMenuRules = document.getElementById('btnMenuRules');
    if (btnMenuRules) {
      btnMenuRules.addEventListener('click', () => {
        document.getElementById('rulesModal').style.display = 'flex';
      });
    }

    const roomBadge = document.getElementById('roomBadge');
    if (roomBadge) {
      roomBadge.addEventListener('click', () => {
        if (this.mode === 'online' && this.lobbyRoomCode) {
          navigator.clipboard.writeText(this.lobbyRoomCode);
          this.effects.showBanner(`MÃ PHÒNG: #${this.lobbyRoomCode}`, 'Đã sao chép vào bộ nhớ đệm!', 'chop');
        } else {
          this.showMenu();
        }
      });
    }

    // Top bar "Về Menu" button
    const btnMenu = document.getElementById('btnMenu');
    if (btnMenu) {
      btnMenu.addEventListener('click', () => {
        this.showMenu();
      });
    }

    // Close buttons for modals
    document.querySelectorAll('.btn-close-modal').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const modal = e.target.closest('.modal-backdrop');
        if (modal) modal.style.display = 'none';
      });
    });

    const btnGameOverMenu = document.getElementById('btnGameOverMenu');
    if (btnGameOverMenu) {
      btnGameOverMenu.addEventListener('click', () => {
        document.getElementById('gameOverModal').style.display = 'none';
        this.showMenu();
      });
    }

    const btnPlayAgain = document.getElementById('btnPlayAgain');
    if (btnPlayAgain) {
      btnPlayAgain.addEventListener('click', () => {
        document.getElementById('gameOverModal').style.display = 'none';
        if (this.mode === 'solo') {
          this.startSoloMatch();
        } else {
          this.network.startGame();
        }
      });
    }

    // Render Egg Currency Icon & Balance
    const iconWrap = document.getElementById('headerEggIconWrap');
    if (iconWrap) {
      iconWrap.innerHTML = `<img src="${EGG_ICON_DATA_URL}" class="egg-currency-img" alt="Hộp trứng">`;
    }
    const eggBalEl = document.getElementById('userEggBalance');
    if (eggBalEl) {
      eggBalEl.textContent = this.userEggs.toLocaleString('vi-VN');
    }
  }

  updateEggBalance(delta) {
    this.userEggs = Math.max(0, this.userEggs + delta);
    try { localStorage.setItem('tlmn_user_eggs', String(this.userEggs)); } catch (e) {}
    const eggBalEl = document.getElementById('userEggBalance');
    if (eggBalEl) {
      eggBalEl.textContent = this.userEggs.toLocaleString('vi-VN');
    }
  }

  showMenu() {
    clearInterval(this.turnTimer);
    if (this.mode === 'online') {
      this.network.disconnect();
    }
    document.getElementById('gameOverModal').style.display = 'none';
    document.getElementById('lobbyOverlay').style.display = 'none';
    document.getElementById('menuOverlay').style.display = 'flex';
  }

  setupMenu() {
    const inputName = document.getElementById('menuPlayerName');
    const inputCode = document.getElementById('menuRoomCode');
    const btnStartSolo = document.getElementById('btnStartSolo');
    const btnCreateRoom = document.getElementById('btnMenuCreateRoom');
    const btnJoinRoom = document.getElementById('btnMenuJoinRoom');

    // Restore saved name
    try {
      const savedName = localStorage.getItem('tlmn_player_name');
      if (savedName && inputName) inputName.value = savedName;
    } catch (e) {}

    // Check URL search params for invite link (?room=8899)
    try {
      const urlParams = new URLSearchParams(window.location.search);
      const roomParam = urlParams.get('room');
      if (roomParam && inputCode) {
        inputCode.value = roomParam.trim().toUpperCase();
      }
    } catch (e) {}

    const saveName = () => {
      const name = (inputName?.value.trim()) || 'Bạn';
      try { localStorage.setItem('tlmn_player_name', name); } catch (e) {}
      this.players[0].name = name;
      const podName = document.getElementById('userPodName');
      if (podName) podName.textContent = name;
      return name;
    };

    // 1. Chơi với máy (Solo)
    btnStartSolo.addEventListener('click', () => {
      const name = saveName();
      const diffRadio = document.querySelector('input[name="aiDiff"]:checked');
      const diff = diffRadio ? diffRadio.value : AI_DIFFICULTY.MEDIUM;

      this.bots = [
        null,
        new BotAI(diff),
        new BotAI(diff),
        new BotAI(diff)
      ];

      document.getElementById('menuOverlay').style.display = 'none';
      document.getElementById('roomBadge').innerHTML = '<span>🤖</span> Chơi Với Máy';
      this.startSoloMatch();
    });

    // 2. Tạo phòng mới
    btnCreateRoom.addEventListener('click', () => {
      const name = saveName();
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      this.enterLobby(code, 'create', name);
    });

    // 3. Vào phòng bằng mã
    btnJoinRoom.addEventListener('click', () => {
      const name = saveName();
      const code = (inputCode.value.trim() || '').toUpperCase();
      if (code.length !== 4) {
        alert('Vui lòng nhập mã phòng gồm 4 ký tự!');
        return;
      }
      this.enterLobby(code, 'join', name);
    });
  }

  setupLobby() {
    const btnCopyCode = document.getElementById('btnCopyCode');
    const btnCopyLink = document.getElementById('btnCopyLink');
    const btnLobbyStart = document.getElementById('btnLobbyStart');
    const btnLobbyLeave = document.getElementById('btnLobbyLeave');

    btnCopyCode.addEventListener('click', () => {
      if (!this.lobbyRoomCode) return;
      navigator.clipboard.writeText(this.lobbyRoomCode);
      this.effects.showBanner(`MÃ: #${this.lobbyRoomCode}`, 'Đã sao chép mã phòng!', 'chop');
    });

    btnCopyLink.addEventListener('click', () => {
      if (!this.lobbyRoomCode) return;
      const link = `${window.location.origin}${window.location.pathname}?room=${this.lobbyRoomCode}`;
      navigator.clipboard.writeText(link);
      this.effects.showBanner('LINK MỜI BẠN BÈ', 'Đã sao chép link mời vào bộ nhớ đệm!', 'chop');
    });

    btnLobbyLeave.addEventListener('click', () => {
      this.showMenu();
    });

    btnLobbyStart.addEventListener('click', () => {
      this.network.startGame();
    });
  }

  enterLobby(roomCode, action, playerName) {
    this.lobbyRoomCode = roomCode;
    document.getElementById('menuOverlay').style.display = 'none';
    document.getElementById('lobbyOverlay').style.display = 'flex';
    document.getElementById('lobbyRoomId').textContent = `#${roomCode}`;
    document.getElementById('lobbyStatusMsg').textContent = 'Đang kết nối đến máy chủ phòng...';

    this.network.connect({ room: roomCode, action, name: playerName })
      .then(() => {
        this.mode = 'online';
        document.getElementById('lobbyStatusMsg').textContent = 'Gửi mã hoặc link cho bạn bè để cùng vào bàn (Tối đa 4 người).';
        this.setupOnlineListeners();
      })
      .catch(err => {
        alert('Không thể kết nối phòng: ' + err);
        this.showMenu();
      });
  }

  setupOnlineListeners() {
    // 1. LOBBY EVENT
    this.network.on('lobby', (msg) => {
      const isHost = this.network.playerId === msg.host;
      const btnStart = document.getElementById('btnLobbyStart');
      const waitHost = document.getElementById('lobbyWaitingHost');

      if (btnStart) btnStart.style.display = isHost ? 'block' : 'none';
      if (waitHost) waitHost.style.display = isHost ? 'none' : 'block';

      // Render 4 seats
      const seatsContainer = document.getElementById('lobbySeats');
      if (seatsContainer) {
        seatsContainer.innerHTML = '';
        for (let i = 0; i < 4; i++) {
          const player = msg.players.find(p => p.id === i);
          const row = document.createElement('div');
          if (player) {
            row.className = 'seat-row occupied';
            const isPlayerHost = player.id === msg.host;
            row.innerHTML = `
              <div class="seat-info">
                <span class="seat-avatar">${isPlayerHost ? '👑' : '🤠'}</span>
                <span class="seat-name">${player.name}</span>
              </div>
              <span class="seat-badge ${isPlayerHost ? 'host' : 'ready'}">
                ${isPlayerHost ? 'Chủ phòng' : 'Đã vào bàn'}
              </span>
            `;
          } else {
            row.className = 'seat-row';
            row.innerHTML = `
              <div class="seat-info">
                <span class="seat-avatar" style="opacity:0.5">🤖</span>
                <span class="seat-name" style="color:#747d8c">Ghế ${i + 1} (Bot sẽ chơi cùng nếu để trống)</span>
              </div>
              <span class="seat-badge">Đang chờ</span>
            `;
          }
          seatsContainer.appendChild(row);
        }
      }
    });

    // 2. GAME START EVENT
    this.network.on('started', () => {
      document.getElementById('lobbyOverlay').style.display = 'none';
      document.getElementById('roomBadge').innerHTML = `🌐 Phòng: <b>#${this.lobbyRoomCode}</b>`;
      sounds.playDeal();
    });

    // 3. GAME STATE SYNC
    this.network.on('state', (msg) => {
      document.getElementById('lobbyOverlay').style.display = 'none';
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

      state.players.forEach((sp) => {
        const localIdx = (sp.id - this.network.playerId + 4) % 4;
        if (this.players[localIdx]) {
          this.players[localIdx].name = sp.name;
          this.players[localIdx].cardCount = sp.cardCount;
          this.players[localIdx].won = sp.won;
          this.players[localIdx].rank = sp.rank;
        }
      });

      this.ui.renderArena(this.currentCombo, state.lastPlayerName);
      this.ui.renderPlayers(this.players, this.currentTurn, this.passedPlayerIds);
      this.updateControls();

      if (state.ended) {
        this.endMatch();
      }
    });

    // 4. BEAT EVENT
    this.network.on('beat', (msg) => {
      sounds.playChop();
      this.effects.shakeScreen(16, 320);
      this.effects.showBanner(msg.title || 'CHẶT HEO!', msg.sub || '', 'chop');
    });

    this.network.on('server_error', (msg) => {
      alert(msg.message || 'Lỗi từ máy chủ phòng!');
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
      let starterId = 0;
      for (const p of this.players) {
        if (p.hand.some(c => c.value === VALUES.THREE && c.suit === SUITS.SPADE)) {
          starterId = p.id;
          break;
        }
      }
      this.currentTurn = starterId;
    } else {
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

    if (activePlayer.won) {
      this.advanceTurn();
      return;
    }

    this.turnTimeRemaining = 15;
    this.ui.updateTimer(100, false);
    this.ui.renderPlayers(this.players, this.currentTurn, this.passedPlayerIds);
    this.updateControls();

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
    const isMyTurn = (this.mode === 'online') ?
      (this.currentTurn === this.network.playerId) :
      (this.currentTurn === 0 && !this.players[0].won);

    const isNewRound = this.currentCombo === null;

    this.ui.setControlsState({
      isMyTurn,
      isNewRound,
      currentCombo: this.currentCombo,
      myHand: this.players[0].hand
    });
  }

  handleUserPlay(selectedCardIds) {
    if (this.mode === 'online') {
      if (this.currentTurn !== this.network.playerId) return;
      this.network.playCards(selectedCardIds);
      return;
    }

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
    if (this.mode === 'online') {
      if (this.currentTurn !== this.network.playerId) return;
      this.network.passTurn();
      return;
    }

    if (this.currentTurn !== 0) return;
    if (this.currentCombo === null) {
      sounds.playError();
      return;
    }
    this.executePass(0);
  }

  handleUserHint() {
    const hand = this.players[0].hand;
    const isNewRound = this.currentCombo === null;
    const mustInclude = (this.isFirstGame && isNewRound) ? new Card(VALUES.THREE, SUITS.SPADE) : null;

    const validPlays = findValidPlays(hand, this.currentCombo, isNewRound, mustInclude);
    if (validPlays.length > 0) {
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
      const counts = {};
      this.players[0].hand.forEach(c => counts[c.value] = (counts[c.value] || 0) + 1);
      this.players[0].hand.sort((a, b) => {
        if (counts[b.value] !== counts[a.value]) {
          return counts[b.value] - counts[a.value];
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

      const lastPod = this.ui.playerPods[this.lastPlayerId];
      const winPod = this.ui.playerPods[playerId];
      this.effects.showFloatingScore(lastPod, 5, false);
      this.effects.showFloatingScore(winPod, 5, true);

      if (playerId === 0) this.updateEggBalance(5);
      if (this.lastPlayerId === 0) this.updateEggBalance(-5);
    } else {
      sounds.playCard();
    }

    const playedIds = new Set(combo.cards.map(c => c.id));
    player.hand = player.hand.filter(c => !playedIds.has(c.id));
    player.cardCount = player.hand.length;

    this.bots.forEach(b => b?.recordPlayed(combo.cards));

    this.currentCombo = combo;
    this.lastPlayerId = playerId;
    this.isFirstGame = false;

    if (playerId === 0) {
      this.ui.clearSelection();
      this.ui.renderHand(player.hand);
    }
    this.ui.renderArena(this.currentCombo, player.name);

    if (player.cardCount === 0) {
      player.won = true;
      player.rank = this.rankCounter++;
      this.effects.showBanner(`🏆 ${player.name} VỀ HẠNG ${player.rank}!`, '', 'chop');
      if (playerId === 0) sounds.playWin();

      const remainingActive = this.players.filter(p => !p.won);
      if (remainingActive.length <= 1) {
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

    const activeNonWon = this.players.filter(p => !p.won);
    const passedCount = activeNonWon.filter(p => this.passedPlayerIds.has(p.id)).length;

    if (passedCount >= activeNonWon.length - 1) {
      setTimeout(() => {
        this.currentCombo = null;
        this.passedPlayerIds.clear();
        this.ui.renderArena(null);

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

    let scoreSummaryHtml = '';
    this.players.forEach(p => {
      const { details } = calculatePenalties(p.hand, 1);
      const isCong = p.hand.length === 13;
      let badge = `Hạng ${p.rank}`;
      if (isCong) badge += ' (CÓNG!)';

      const changeAmount = p.rank === 1 ? 15 : -(p.hand.length);
      if (p.id === 0) {
        this.updateEggBalance(changeAmount);
      }

      const changeText = p.rank === 1
        ? `+15 <img src="${EGG_ICON_DATA_URL}" class="egg-currency-img" alt="Hộp trứng"> Hộp trứng`
        : `${changeAmount} <img src="${EGG_ICON_DATA_URL}" class="egg-currency-img" alt="Hộp trứng"> Hộp trứng`;

      scoreSummaryHtml += `
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:8px;padding:8px 12px;background:rgba(255,255,255,0.05);border-radius:10px">
          <div><b>${p.name}</b> (${badge})</div>
          <div style="display:flex;align-items:center;gap:4px;color:${p.rank === 1 ? '#2ecc71' : '#e74c3c'};font-weight:800">
            ${details.length > 0 ? details.join(', ') : changeText}
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
