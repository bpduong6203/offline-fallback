// Main Entry Point & Controller for UNO Game (PvE & PvP)
import {
  UnoGame,
  getCardColor,
  getCardType,
  getCardValue,
  getCardDetails,
  isValidPlay,
  sortCards,
  canPlayCardsAsPair,
  areCardsPairCompatible
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
    this.turnDuration = 15; // 15s giới hạn mỗi lượt đánh
    this.turnSecondsLeft = 15;
    this.turnTimerInterval = null;
    this.pendingDrawCard = null;
    this.selectedCards = new Set();
    this.sortMode = 'color'; // 'color' | 'value'

    this.eggBalance = this.loadEggBalance();
    this.ui.setEggBalance(this.eggBalance);
    this.ui.setSortButton(this.sortMode);

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

    // Sort Hand Button
    this.ui.dom.btnSortCards?.addEventListener('click', () => {
      this.toggleSortCards();
    });

    // Play Selected Button (for single card or pair/set play)
    this.ui.dom.btnPlaySelected?.addEventListener('click', () => {
      this.handlePlaySelectedCards();
    });

    // Draw Pile Click
    this.ui.dom.drawPile?.addEventListener('click', () => {
      if (this.isMyTurn()) {
        this.handleDraw();
      }
    });

    // UNO Call Button (Hô Nói UNO khi còn 1 lá hoặc chuẩn bị đánh còn 1 lá)
    this.ui.dom.btnUnoCall?.addEventListener('click', () => {
      this.calledUno = true;
      unoAudio.playUnoHorn();
      UnoEffects.showToast('🔥 BẠN ĐÃ HÔ NÓI UNO!', 'danger');
      if (this.botCatchTimer) {
        clearTimeout(this.botCatchTimer);
        this.botCatchTimer = null;
      }
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
    this.startPvE(1, AI_DIFFICULTY.MEDIUM);
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

  toggleSortCards() {
    this.sortMode = this.sortMode === 'color' ? 'value' : 'color';
    this.ui.setSortButton(this.sortMode);
    unoAudio.playCardSlide();

    if (this.mode === 'pve' && this.pveGame) {
      const myPlayer = this.pveGame.players[this.myId];
      if (myPlayer) {
        myPlayer.hand = sortCards(myPlayer.hand, this.sortMode);
      }
    }

    UnoEffects.showToast(
      this.sortMode === 'color' ? '🎨 Đã xếp bài theo Màu sắc' : '🔢 Đã xếp bài theo Số (Dễ ghép đôi)',
      'info'
    );
    this.updateUI();
  }

  // ==========================================
  // PVE (CHƠI VỚI BOT) IMPLEMENTATION
  // ==========================================

  startPvE(botCount = 1, difficulty = AI_DIFFICULTY.MEDIUM) {
    this.mode = 'pve';
    this.myId = 0;
    this.calledUno = false;
    this.pendingDrawCard = null;
    this.selectedCards.clear();
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
    if (this.pveGame.players[this.myId]) {
      this.pveGame.players[this.myId].hand = sortCards(this.pveGame.players[this.myId].hand, this.sortMode);
    }

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
    if (this.mode !== 'pve' || !this.pveGame || this.pveGame.ended) {
      this.stopTurnTimer();
      return;
    }

    this.startTurnTimer();

    if (this.pveGame.currentTurn === this.myId) {
      unoAudio.playTurnDing();
    } else {
      // Bot turn
      this.scheduleBotTurn();
    }

    // Check if an opponent forgot to call UNO
    this.checkOpponentUnoPenalty();
  }

  startTurnTimer() {
    this.stopTurnTimer();
    this.turnSecondsLeft = this.turnDuration;
    this.updateTimerDisplay();

    this.turnTimerInterval = setInterval(() => {
      if ((this.mode === 'pve' && (!this.pveGame || this.pveGame.ended)) ||
          (this.mode === 'pvp' && (!this.pvpState || this.pvpState.ended))) {
        this.stopTurnTimer();
        return;
      }

      this.turnSecondsLeft--;
      this.updateTimerDisplay();

      if (this.turnSecondsLeft <= 0) {
        this.stopTurnTimer();
        this.handleTurnTimeout();
      }
    }, 1000);
  }

  stopTurnTimer() {
    if (this.turnTimerInterval) {
      clearInterval(this.turnTimerInterval);
      this.turnTimerInterval = null;
    }
  }

  updateTimerDisplay() {
    const isMine = this.isMyTurn();
    this.ui.updateTurnTimer(this.turnSecondsLeft, isMine);

    // Cập nhật số giây & thanh tiến trình đếm ngược trên pod đối thủ nếu là lượt của họ
    const currentTurn = this.mode === 'pve' ? this.pveGame?.currentTurn : this.pvpState?.currentTurn;
    if (currentTurn != null && currentTurn !== this.myId) {
      const activePod = document.getElementById(`pod-${currentTurn}`);
      if (activePod) {
        const statusEl = activePod.querySelector('.pod-status');
        if (statusEl) {
          const isUno = activePod.classList.contains('is-uno');
          statusEl.textContent = isUno ? '⚠️ NÓI UNO!' : `Đang đi (${this.turnSecondsLeft}s)...`;
        }
        const barEl = activePod.querySelector('.pod-timer-bar');
        if (barEl) {
          barEl.style.width = `${Math.max(0, (this.turnSecondsLeft / 15) * 100)}%`;
        }
      }
    }
  }

  handleTurnTimeout() {
    if (!this.isMyTurn()) return;

    UnoEffects.showToast('⏱️ Hết thời gian lượt đi (15s)! Đang tự động rút bài / bỏ lượt...', 'warning');

    if (this.mode === 'pve' && this.pveGame) {
      if (this.pendingDrawCard != null) {
        this.handlePassTurn();
      } else {
        const res = this.pveGame.drawCard(this.myId);
        if (res.success) {
          unoAudio.playCardSlide();
          this.pveGame.passTurn(this.myId);
          this.pendingDrawCard = null;
          this.updateUI();
          this.checkTurn();
        }
      }
    } else if (this.mode === 'pvp') {
      if (this.pendingDrawCard != null) {
        this.handlePassTurn();
      } else {
        this.network.drawCard();
      }
    }
  }

  scheduleBotTurn() {
    if (this.botTimer) clearTimeout(this.botTimer);
    const currId = this.pveGame.currentTurn;
    const bot = this.pveGame.players[currId];
    if (!bot || !bot.isBot) return;

    const delay = Math.floor(900 + Math.random() * 800);
    this.botTimer = setTimeout(() => {
      try {
        if (!this.pveGame || this.pveGame.ended || this.pveGame.currentTurn !== currId) return;

        const topCard = this.pveGame.discardPile[this.pveGame.discardPile.length - 1];
        const activeColor = this.pveGame.activeColor;
        const move = UnoAI.decideMove(bot.hand, topCard, activeColor, this.pveGame, bot.difficulty || AI_DIFFICULTY.MEDIUM);

        if (move.action === 'play') {
          const cardsToPlay = Array.isArray(move.cards) && move.cards.length > 0 ? move.cards : [move.cardId];
          const cardsLeftAfter = bot.hand.length - cardsToPlay.length;

          // Check if bot calls UNO
          if (cardsLeftAfter === 1 && UnoAI.shouldCallUno(bot.difficulty)) {
            this.pveGame.callUno(currId);
            unoAudio.playUnoHorn();
            UnoEffects.showToast(`🔥 ${bot.name} HÔ NÓI UNO!`, 'warning');
          }

          let res;
          if (cardsToPlay.length > 1) {
            res = this.pveGame.playCards(currId, cardsToPlay, move.chosenColor);
          } else {
            res = this.pveGame.playCard(currId, move.cardId, move.chosenColor);
          }

          if (res.success) {
            unoAudio.playCardSnap();
            if (cardsToPlay.length > 1) {
              UnoEffects.showToast(`${bot.name} đánh đôi ${cardsToPlay.length} lá!`, 'info');
            } else if (res.actionEffect) {
              UnoEffects.showToast(`${bot.name} dùng lá ${res.actionEffect.toUpperCase()}!`, 'info');
            }
          } else {
            this.pveGame.drawCard(currId);
            this.pveGame.passTurn(currId);
          }
        } else {
          // Bot draws
          const drawRes = this.pveGame.drawCard(currId);
          unoAudio.playCardSlide();
          const drawnCard = drawRes.cardId ?? drawRes.cardDrawn;

          if (drawRes.success && drawnCard != null) {
            const drawnPlay = UnoAI.decideDrawnPlay(
              drawnCard,
              topCard,
              activeColor,
              bot.hand,
              bot.difficulty
            );
            if (drawnPlay.play) {
              this.pveGame.playCard(currId, drawnCard, drawnPlay.chosenColor);
              unoAudio.playCardSnap();
            } else {
              this.pveGame.passTurn(currId);
            }
          } else {
            this.pveGame.passTurn(currId);
          }
        }
      } catch (err) {
        console.error('Bot turn error:', err);
        try {
          if (this.pveGame && this.pveGame.currentTurn === currId) {
            this.pveGame.passTurn(currId);
          }
        } catch (e) {}
      }

      this.updateUI();
      if (this.pveGame?.ended) {
        this.handleGameOver(this.pveGame.winner, this.pveGame.roundScore);
      } else {
        this.checkTurn();
      }
    }, delay);
  }

  checkOpponentUnoPenalty() {
    if (!this.pveGame || !this.pveGame.unoPenaltyWindow) return;
    const targetId = this.pveGame.unoPenaltyWindow.playerId;
    if (targetId === this.myId) return;

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

    if (this.selectedCards.has(cardId)) {
      if (this.selectedCards.size === 1) {
        // Bấm lại chính lá bài duy nhất đã chọn -> Đánh ngay lập tức
        this.handlePlaySelectedCards();
        return;
      }
      // Đã chọn nhiều lá -> Bỏ chọn lá này
      this.selectedCards.delete(cardId);
      unoAudio.playCardSlide();
      this.updateUI();
      return;
    }

    // Lá này chưa được chọn
    if (this.selectedCards.size > 0) {
      // Kiểm tra có ghép đôi được với lá đã chọn trước đó không
      const firstSelected = [...this.selectedCards][0];
      const firstVal = getCardValue(firstSelected);
      const firstType = getCardType(firstSelected);
      const cardVal = getCardValue(cardId);
      const cardType = getCardType(cardId);

      const canPair = (firstType === 'number' && cardType === 'number' && cardVal === firstVal)
        || (firstType !== 'number' && cardType === firstType);

      if (canPair) {
        this.selectedCards.add(cardId);
        unoAudio.playCardSlide();
        this.updateUI();
        return;
      }
    }

    // Chọn mới 1 lá hợp lệ
    const topCard = this.mode === 'pve' ? this.pveGame.getTopCard() : this.pvpState?.topCard;
    const activeColor = this.mode === 'pve' ? this.pveGame.activeColor : this.pvpState?.activeColor;

    if (isValidPlay(cardId, topCard, activeColor)) {
      this.selectedCards.clear();
      this.selectedCards.add(cardId);
      unoAudio.playCardSlide();
      this.updateUI();
    } else {
      UnoEffects.showToast('Lá bài không hợp lệ hoặc không cùng giá trị để ghép đôi!', 'warning');
    }
  }

  handlePlaySelectedCards() {
    if (!this.isMyTurn() || this.selectedCards.size === 0) return;

    const cardIds = [...this.selectedCards];
    const requiresColor = cardIds.some(id => {
      const type = getCardType(id);
      return type === 'wild' || type === 'draw4';
    });

    if (requiresColor) {
      this.ui.openColorPicker(chosenColor => {
        unoAudio.playColorPop();
        this.executePlayCards(cardIds, chosenColor);
      });
    } else {
      this.executePlayCards(cardIds, null);
    }
  }

  executePlayCards(cardIds, chosenColor) {
    if (!cardIds || cardIds.length === 0) return;

    if (this.mode === 'pve') {
      const myHand = this.pveGame.players[this.myId].hand;
      const willBeOne = myHand.length - cardIds.length === 1;
      if (willBeOne && this.calledUno) {
        this.pveGame.callUno(this.myId);
      }

      let res;
      if (cardIds.length === 1) {
        res = this.pveGame.playCard(this.myId, cardIds[0], chosenColor, this.calledUno);
      } else {
        res = this.pveGame.playCards(this.myId, cardIds, chosenColor, this.calledUno);
      }

      if (res.success) {
        unoAudio.playCardSnap();
        if (!willBeOne) {
          this.calledUno = false;
        }
        this.pendingDrawCard = null;
        this.selectedCards.clear();

        if (cardIds.length > 1) {
          UnoEffects.showToast(`Bạn đã đánh đôi ${cardIds.length} lá thành công! 🔥`, 'success');
        } else if (res.actionEffect) {
          UnoEffects.showToast(`Bạn kích hoạt ${res.actionEffect.toUpperCase()}!`, 'success');
        }

        this.updateUI();

        if (res.gameOver) {
          this.handleGameOver(this.pveGame.winner, res.roundScore);
        } else {
          this.checkTurn();
        }
      } else {
        UnoEffects.showToast(res.reason || 'Nước đi không hợp lệ!', 'warning');
      }
    } else if (this.mode === 'pvp') {
      if (cardIds.length === 1) {
        this.network.playCard(cardIds[0], chosenColor, this.calledUno);
      } else {
        this.network.playCards(cardIds, chosenColor, this.calledUno);
      }
      this.calledUno = false;
      this.pendingDrawCard = null;
      this.selectedCards.clear();
      this.updateUI();
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
      const prevTurn = this.pvpState?.currentTurn;
      this.pvpState = packet;
      if (packet.ended) {
        this.stopTurnTimer();
      } else if (prevTurn !== packet.currentTurn) {
        this.startTurnTimer();
      }
      this.updateUI();
    });

    this.network.on('unoCalled', packet => {
      unoAudio.playUnoHorn();
      const pName = this.pvpState?.players?.find(p => p.id === packet.playerId)?.name || 'Người chơi';
      UnoEffects.showToast(`🔥 ${pName} HÔ NÓI UNO!`, 'warning');
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

    let displayHand = myHand;
    if (this.sortMode && this.mode === 'pvp') {
      displayHand = sortCards(myHand, this.sortMode);
    }

    // Lọc các lá bài đã chọn không còn tồn tại trên tay
    for (const id of [...this.selectedCards]) {
      if (!displayHand.includes(id)) {
        this.selectedCards.delete(id);
      }
    }

    // Discard & Active Color
    this.ui.renderDiscardPile(topCard);
    this.ui.renderActiveColor(state.activeColor);
    this.ui.setDirection(state.direction);

    // Opponent Pods
    this.ui.renderOpponents(state.players, this.myId, state.currentTurn, state.unoPenaltyWindow, this.turnSecondsLeft);

    // Player Hand Fan
    this.ui.renderHand(displayHand, topCard, state.activeColor, isMyTurn, cardId => {
      this.handleCardClick(cardId);
    }, this.selectedCards);

    // Nút đánh bài / đánh đôi được chọn
    if (isMyTurn && this.selectedCards.size > 0) {
      const count = this.selectedCards.size;
      const isPair = count >= 2;
      const label = count === 1
        ? '▶ ĐÁNH 1 LÁ'
        : count === 2
        ? '⚡ ĐÁNH ĐÔI (2 LÁ) 🔥'
        : `⚡ ĐÁNH BỘ (${count} LÁ) 🔥`;
      this.ui.updatePlaySelectedButton({ visible: true, label, isPair });
    } else {
      this.ui.updatePlaySelectedButton({ visible: false });
    }

    // Action Controls
    const hasCalledUno = myPlayer?.hasCalledUno || this.calledUno;
    // Bổ sung điều kiện canCallUno: Cho phép bấm Nói UNO khi còn 1 lá bài trên tay chưa hô UNO,
    // hoặc khi đang cầm 2 lá trong lượt của mình để chuẩn bị đánh xuống 1 lá!
    const canCallUno = !hasCalledUno && (myHand.length === 1 || (myHand.length === 2 && isMyTurn));
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

    this.ui.updateTurnTimer(this.turnSecondsLeft, isMyTurn);
  }

  clearTimers() {
    if (this.botTimer) clearTimeout(this.botTimer);
    if (this.botCatchTimer) clearTimeout(this.botCatchTimer);
    this.stopTurnTimer();
  }
}

// Instantiate on DOM load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.unoController = new UnoController();
  });
}
