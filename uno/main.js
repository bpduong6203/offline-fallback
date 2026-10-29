// Main Entry Point & Controller for UNO Game (PvE & PvP)
import {
  UnoGame,
  getCardColor,
  getCardType,
  getCardDetails,
  isValidPlay
} from './engine.js';
import { UnoAI, AI_DIFFICULTY } from './ai.js';
import { unoAudio } from './audio.js';
import { UnoEffects } from './effects.js';
import { UnoNetworkClient } from './network.js';
import { UnoUI } from './ui.js';

class UnoController {
  constructor() {
    this.ui = new UnoUI();
    this.network = new UnoNetworkClient();
    this.mode = 'pve'; // 'pve' | 'pvp'
    this.pveGame = null;
    this.pvpState = null;
    this.myId = 0;
    this.calledUno = false;
    this.botTimer = null;
    this.botCatchTimer = null;
    this.turnTimer = null;
    this.pendingDrawCard = null;

    this.eggBalance = this.loadEggBalance();
    this.ui.setEggBalance(this.eggBalance);

    this.initEvents();
  }

  loadEggBalance() {
    try {
      const b = localStorage.getItem('egg_currency_balance');
      return b ? parseInt(b, 10) : 100;
    } catch (e) {
      return 100;
    }
  }

  saveEggBalance(amount) {
    this.eggBalance += amount;
    try {
      localStorage.setItem('egg_currency_balance', String(this.eggBalance));
    } catch (e) {}
    this.ui.setEggBalance(this.eggBalance);
    UnoEffects.showEggReward(amount, document.getElementById('userEggBalance'));
  }

  initEvents() {
    // Menu & Rules
    document.getElementById('btnMenu')?.addEventListener('click', () => {
      document.getElementById('lobbyModal')?.classList.add('open');
    });

    document.getElementById('btnRules')?.addEventListener('click', () => {
      document.getElementById('rulesModal')?.classList.add('open');
    });

    document.getElementById('btnCloseRules')?.addEventListener('click', () => {
      document.getElementById('rulesModal')?.classList.remove('open');
    });

    // Audio Mute Toggle
    const btnMute = document.getElementById('btnMute');
    if (btnMute) {
      btnMute.textContent = unoAudio.isMuted() ? '🔇' : '🔊';
      btnMute.addEventListener('click', () => {
        const isMuted = unoAudio.toggleMute();
        btnMute.textContent = isMuted ? '🔇' : '🔊';
      });
    }

    // Draw Pile Click
    this.ui.dom.drawPile?.addEventListener('click', () => {
      if (this.isMyTurn()) {
        this.handleDraw();
      }
    });

    // UNO Call Button
    this.ui.dom.btnUnoCall?.addEventListener('click', () => {
      this.calledUno = true;
      unoAudio.playUnoHorn();
      UnoEffects.showToast('🔥 BẠN ĐÃ HÔ NÓI UNO!', 'danger');
      if (this.mode === 'pvp') {
        this.network.callUno();
      } else if (this.pveGame) {
        this.pveGame.callUno(this.myId);
      }
      this.updateUI();
    });

    // UNO Catch Button
    this.ui.dom.btnUnoCatch?.addEventListener('click', () => {
      this.handleCatchUno();
    });

    // Pass Turn Button
    this.ui.dom.btnPassTurn?.addEventListener('click', () => {
      this.handlePassTurn();
    });

    // Lobby Actions
    this.initLobbyEvents();

    // Start default PvE match
    this.startPvE(3, AI_DIFFICULTY.MEDIUM);
  }

  initLobbyEvents() {
    // Tab switching in lobby
    const tabPvE = document.getElementById('tabPvE');
    const tabPvP = document.getElementById('tabPvP');
    const panelPvE = document.getElementById('panelPvE');
    const panelPvP = document.getElementById('panelPvP');

    tabPvE?.addEventListener('click', () => {
      tabPvE.classList.add('active');
      tabPvP.classList.remove('active');
      panelPvE.style.display = 'block';
      panelPvP.style.display = 'none';
    });

    tabPvP?.addEventListener('click', () => {
      tabPvP.classList.add('active');
      tabPvE.classList.remove('active');
      panelPvP.style.display = 'block';
      panelPvE.style.display = 'none';
    });

    // PvE Start
    document.getElementById('btnStartPvE')?.addEventListener('click', () => {
      const bots = parseInt(document.getElementById('pveBotCount')?.value || '3', 10);
      const diff = document.getElementById('pveBotDifficulty')?.value || 'medium';
      document.getElementById('lobbyModal')?.classList.remove('open');
      this.startPvE(bots, diff);
    });

    // PvP Create
    document.getElementById('btnCreateRoom')?.addEventListener('click', () => {
      const name = document.getElementById('playerNameInput')?.value?.trim() || 'Người chơi';
      const code = Math.random().toString(36).substring(2, 6).toUpperCase();
      this.joinPvP(code, 'create', name);
    });

    // PvP Join
    document.getElementById('btnJoinRoom')?.addEventListener('click', () => {
      const code = document.getElementById('roomCodeInput')?.value?.trim().toUpperCase();
      const name = document.getElementById('playerNameInput')?.value?.trim() || 'Người chơi';
      if (!code || code.length !== 4) {
        UnoEffects.showToast('Mã phòng phải có đúng 4 ký tự!', 'warning');
        return;
      }
      this.joinPvP(code, 'join', name);
    });

    // PvP Room Lobby Buttons
    document.getElementById('btnStartMatch')?.addEventListener('click', () => {
      if (this.mode === 'pvp') {
        this.network.startGame();
      }
    });

    document.getElementById('btnAddBot')?.addEventListener('click', () => {
      if (this.mode === 'pvp') {
        this.network.addBot('medium');
      }
    });
  }

  // ==========================================
  // PVE (CHƠI VỚI BOT) IMPLEMENTATION
  // ==========================================

  startPvE(botCount = 3, difficulty = AI_DIFFICULTY.MEDIUM) {
    this.mode = 'pve';
    this.myId = 0;
    this.calledUno = false;
    this.pendingDrawCard = null;
    this.clearTimers();

    this.ui.setRoomBadge(`PVE • ${botCount + 1} NGƯỜI`);

    const botNames = ['Minh Anh', 'Tuấn Hải', 'Hương Ly'];
    const players = [
      { id: 0, name: 'Bạn', isBot: false },
      ...Array.from({ length: botCount }, (_, i) => ({
        id: i + 1,
        name: `Bot ${botNames[i] || i + 1}`,
        isBot: true,
        difficulty
      }))
    ];

    this.pveGame = new UnoGame({ players });
    unoAudio.playCardSlide();
    UnoEffects.showToast('Ván mới bắt đầu! Hãy đánh lá bài hợp lệ.', 'info');

    this.updateUI();
    this.checkTurn();
  }

  isMyTurn() {
    if (this.mode === 'pve') {
      return this.pveGame && this.pveGame.currentTurn === this.myId && !this.pveGame.ended;
    }
    return this.pvpState && this.pvpState.currentTurn === this.myId && !this.pvpState.ended;
  }

  checkTurn() {
    if (this.mode !== 'pve' || !this.pveGame || this.pveGame.ended) return;

    if (this.pveGame.currentTurn === this.myId) {
      unoAudio.playTurnDing();
    } else {
      // Bot turn
      this.scheduleBotTurn();
    }

    // Check if an opponent forgot to call UNO
    this.checkOpponentUnoPenalty();
  }

  scheduleBotTurn() {
    this.clearTimers();
    const currId = this.pveGame.currentTurn;
    const bot = this.pveGame.players[currId];
    if (!bot || !bot.isBot) return;

    const delay = Math.floor(900 + Math.random() * 800);
    this.botTimer = setTimeout(() => {
      if (!this.pveGame || this.pveGame.ended || this.pveGame.currentTurn !== currId) return;

      const topCard = this.pveGame.discardPile[this.pveGame.discardPile.length - 1];
      const activeColor = this.pveGame.activeColor;
      const move = UnoAI.decideMove(bot.hand, topCard, activeColor, this.pveGame, bot.difficulty || AI_DIFFICULTY.MEDIUM);

      if (move.action === 'play') {
        // Check if bot calls UNO
        if (bot.hand.length === 2 && UnoAI.shouldCallUno(bot.difficulty)) {
          this.pveGame.callUno(currId);
          unoAudio.playUnoHorn();
          UnoEffects.showToast(`🔥 ${bot.name} HÔ NÓI UNO!`, 'warning');
        }

        const res = this.pveGame.playCard(currId, move.cardId, move.chosenColor);
        if (res.success) {
          unoAudio.playCardSnap();
          if (res.actionEffect) {
            UnoEffects.showToast(`${bot.name} dùng lá ${res.actionEffect.toUpperCase()}!`, 'info');
          }
        }
      } else {
        // Bot draws
        const drawRes = this.pveGame.drawCard(currId);
        unoAudio.playCardSlide();

        if (drawRes.success && drawRes.cardDrawn != null) {
          const drawnPlay = UnoAI.decideDrawnPlay(
            drawRes.cardDrawn,
            topCard,
            activeColor,
            bot.hand,
            bot.difficulty
          );
          if (drawnPlay.play) {
            this.pveGame.playCard(currId, drawRes.cardDrawn, drawnPlay.chosenColor);
            unoAudio.playCardSnap();
          } else {
            this.pveGame.passTurn(currId);
          }
        }
      }

      this.updateUI();
      if (this.pveGame.ended) {
        this.handleGameOver(this.pveGame.winner, this.pveGame.roundScore);
      } else {
        this.checkTurn();
      }
    }, delay);
  }

  checkOpponentUnoPenalty() {
    if (!this.pveGame || !this.pveGame.unoPenaltyWindow) return;
    const targetId = this.pveGame.unoPenaltyWindow.playerId;
    if (targetId === this.myId) return; // Player is the one in trouble

    // Bot reaction to catch opponent
    for (const p of this.pveGame.players) {
      if (p.isBot && p.id !== targetId) {
        const reaction = UnoAI.getCatchUnoReaction(p.difficulty);
        if (reaction.willCatch) {
          this.botCatchTimer = setTimeout(() => {
            if (this.pveGame && this.pveGame.unoPenaltyWindow && this.pveGame.unoPenaltyWindow.playerId === targetId) {
              const catchRes = this.pveGame.catchUnoPenalty(p.id);
              if (catchRes.success) {
                unoAudio.playCatchUno();
                UnoEffects.showToast(`⚡ ${p.name} ĐÃ BẮT PHẠT ${this.pveGame.players[targetId].name}! (+2 lá)`, 'danger');
                this.updateUI();
              }
            }
          }, reaction.delay);
          break;
        }
      }
    }
  }

  handleCardClick(cardId) {
    if (!this.isMyTurn()) return;

    const details = getCardDetails(cardId);
    if (details.type === 'wild' || details.type === 'draw4') {
      this.ui.openColorPicker(chosenColor => {
        unoAudio.playColorPop();
        this.executePlayCard(cardId, chosenColor);
      });
    } else {
      this.executePlayCard(cardId, null);
    }
  }

  executePlayCard(cardId, chosenColor) {
    if (this.mode === 'pve') {
      const myHand = this.pveGame.players[this.myId].hand;
      if (myHand.length === 2 && this.calledUno) {
        this.pveGame.callUno(this.myId);
      }

      const res = this.pveGame.playCard(this.myId, cardId, chosenColor);
      if (res.success) {
        unoAudio.playCardSnap();
        this.calledUno = false;
        this.pendingDrawCard = null;

        if (res.actionEffect) {
          UnoEffects.showToast(`Bạn kích hoạt ${res.actionEffect.toUpperCase()}!`, 'success');
        }

        this.updateUI();

        if (res.gameOver) {
          this.handleGameOver(this.pveGame.winner, res.roundScore);
        } else {
          this.checkTurn();
        }
      }
    } else if (this.mode === 'pvp') {
      this.network.playCard(cardId, chosenColor, this.calledUno);
      this.calledUno = false;
      this.pendingDrawCard = null;
    }
  }

  handleDraw() {
    if (!this.isMyTurn()) return;

    if (this.mode === 'pve') {
      const res = this.pveGame.drawCard(this.myId);
      if (res.success) {
        unoAudio.playCardSlide();
        this.pendingDrawCard = res.cardDrawn;

        const topCard = this.pveGame.discardPile[this.pveGame.discardPile.length - 1];
        if (res.canPlayDrawn) {
          UnoEffects.showToast('Lá bài vừa rút hợp lệ! Bạn có thể đánh hoặc Bỏ lượt.', 'info');
        } else {
          // If not playable, Mattel rules allows passing turn
          this.pveGame.passTurn(this.myId);
          this.pendingDrawCard = null;
          this.checkTurn();
        }
        this.updateUI();
      }
    } else if (this.mode === 'pvp') {
      this.network.drawCard();
    }
  }

  handlePassTurn() {
    if (this.mode === 'pve' && this.pveGame) {
      this.pveGame.passTurn(this.myId);
      this.pendingDrawCard = null;
      this.updateUI();
      this.checkTurn();
    } else if (this.mode === 'pvp') {
      this.network.decideDrawnPlay(false);
      this.pendingDrawCard = null;
    }
  }

  handleCatchUno() {
    if (this.mode === 'pve' && this.pveGame) {
      const res = this.pveGame.catchUnoPenalty(this.myId);
      if (res.success) {
        unoAudio.playCatchUno();
        UnoEffects.showToast(`⚡ BẠN ĐÃ BẮT PHẠT ĐỐI THỦ THÀNH CÔNG! (+2 lá)`, 'success');
        this.updateUI();
      }
    } else if (this.mode === 'pvp') {
      const target = this.pvpState?.unoPenaltyWindow?.playerId;
      if (target != null) {
        this.network.catchUno(target);
      }
    }
  }

  handleGameOver(winner, score) {
    this.clearTimers();
    const isWinner = winner.id === this.myId;

    if (isWinner) {
      unoAudio.playVictory();
      UnoEffects.triggerConfetti(this.ui.dom.confetti);
      const eggBonus = 5 + Math.floor(score / 100);
      this.saveEggBalance(eggBonus);
      this.ui.showGameOver({
        winner,
        roundScore: score,
        eggReward: eggBonus,
        isWinner: true,
        onNewGame: () => this.startPvE(3, AI_DIFFICULTY.MEDIUM)
      });
    } else {
      unoAudio.playDefeat();
      this.ui.showGameOver({
        winner,
        roundScore: score,
        eggReward: 0,
        isWinner: false,
        onNewGame: () => this.startPvE(3, AI_DIFFICULTY.MEDIUM)
      });
    }
  }

  // ==========================================
  // PVP (MULTIPLAYER) IMPLEMENTATION
  // ==========================================

  joinPvP(roomCode, action, playerName) {
    this.mode = 'pvp';
    this.clearTimers();
    document.getElementById('lobbyModal')?.classList.remove('open');
    this.ui.setRoomBadge(`PHÒNG: ${roomCode}`);

    this.network.connect({ room: roomCode, action, name: playerName });

    this.network.on('hello', packet => {
      this.myId = packet.id;
    });

    this.network.on('lobby', packet => {
      this.renderPvPLobby(packet);
    });

    this.network.on('state', packet => {
      document.getElementById('roomLobbyModal')?.classList.remove('open');
      this.pvpState = packet;
      this.updateUI();
    });

    this.network.on('unoPenalty', packet => {
      if (packet.targetId !== this.myId) {
        UnoEffects.showToast(`⚡ Cơ hội bắt phạt ${packet.targetName}!`, 'warning', 2500);
      }
      this.updateUI();
    });

    this.network.on('unoCatchResult', packet => {
      if (packet.success) {
        unoAudio.playCatchUno();
        UnoEffects.showToast(`⚡ ${packet.catcherName} đã bắt phạt ${packet.targetName}! (+2 lá)`, 'danger');
      }
    });

    this.network.on('roundOver', packet => {
      this.handleGameOver(packet.winner, packet.roundScore);
    });

    this.network.on('serverError', msg => {
      UnoEffects.showToast(msg, 'danger');
    });
  }

  renderPvPLobby(packet) {
    const modal = document.getElementById('roomLobbyModal');
    if (!modal) return;
    modal.classList.add('open');

    const codeEl = document.getElementById('lobbyRoomCode');
    if (codeEl) codeEl.textContent = this.network.roomCode;

    const listEl = document.getElementById('lobbyPlayerList');
    if (listEl) {
      listEl.innerHTML = packet.players
        .map(
          p => `
          <div class="lobby-player-row">
            <span>${p.isBot ? '🤖' : '👤'} <b>${p.name}</b> ${p.id === packet.host ? '👑 (Chủ phòng)' : ''}</span>
            <span>${p.ready ? '✅ Đã sẵn sàng' : '⏳ Đang chờ'}</span>
          </div>
        `
        )
        .join('');
    }

    const isHost = this.myId === packet.host;
    const btnStart = document.getElementById('btnStartMatch');
    const btnAddBot = document.getElementById('btnAddBot');
    if (btnStart) btnStart.style.display = isHost ? 'inline-block' : 'none';
    if (btnAddBot) btnAddBot.style.display = isHost && packet.players.length < 4 ? 'inline-block' : 'none';
  }

  // ==========================================
  // UI SYNCHRONIZATION
  // ==========================================

  updateUI() {
    let state;
    if (this.mode === 'pve') {
      if (!this.pveGame) return;
      state = this.pveGame.getStateForPlayer(this.myId);
    } else {
      if (!this.pvpState) return;
      state = this.pvpState;
    }

    const myPlayer = state.players.find(p => p.id === this.myId);
    const myHand = myPlayer?.hand || [];
    const topCard = state.topCard;
    const isMyTurn = state.currentTurn === this.myId;

    // Discard & Active Color
    this.ui.renderDiscardPile(topCard);
    this.ui.renderActiveColor(state.activeColor);
    this.ui.setDirection(state.direction);

    // Opponent Pods
    this.ui.renderOpponents(state.players, this.myId, state.currentTurn, state.unoPenaltyWindow);

    // Player Hand Fan
    this.ui.renderHand(myHand, topCard, state.activeColor, isMyTurn, cardId => {
      this.handleCardClick(cardId);
    });

    // Action Controls
    const canCallUno = myHand.length === 2 && !this.calledUno && isMyTurn;
    const penaltyTarget = state.unoPenaltyWindow?.playerId;
    const canCatchUno = penaltyTarget != null && penaltyTarget !== this.myId;
    const canPass = isMyTurn && this.pendingDrawCard != null;
    const canDraw = isMyTurn && this.pendingDrawCard == null;

    this.ui.updateActionButtons({
      canCallUno,
      canCatchUno,
      penaltyWindow: state.unoPenaltyWindow,
      canPass,
      canDraw,
      isMyTurn
    });
  }

  clearTimers() {
    if (this.botTimer) clearTimeout(this.botTimer);
    if (this.botCatchTimer) clearTimeout(this.botCatchTimer);
    if (this.turnTimer) clearTimeout(this.turnTimer);
  }
}

// Instantiate on DOM load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.unoController = new UnoController();
  });
}
