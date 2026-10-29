// UNO UI Renderer and DOM Interaction Controller
import {
  isValidPlay,
  getCardDetails,
  getCardColor,
  getCardValue,
  getCardType
} from './engine.js';

export class UnoUI {
  constructor() {
    this.dom = {
      app: document.getElementById('unoApp'),
      confetti: document.getElementById('confettiCanvas'),
      userEggBalance: document.getElementById('userEggBalance'),
      roomBadge: document.getElementById('roomBadge'),
      directionRing: document.getElementById('directionRing'),
      opponentsContainer: document.getElementById('opponentsContainer'),
      drawPile: document.getElementById('drawPile'),
      discardPile: document.getElementById('discardPile'),
      activeColorBadge: document.getElementById('activeColorBadge'),
      actionControls: document.getElementById('actionControls'),
      btnPlaySelected: document.getElementById('btnPlaySelected'),
      btnUnoCall: document.getElementById('btnUnoCall'),
      btnUnoCatch: document.getElementById('btnUnoCatch'),
      btnPassTurn: document.getElementById('btnPassTurn'),
      handFanTrack: document.getElementById('handFanTrack'),
      handLabel: document.getElementById('handLabel'),
      btnSortCards: document.getElementById('btnSortCards'),
      sortIcon: document.getElementById('sortIcon'),
      sortText: document.getElementById('sortText'),
      // Modals
      colorPickerModal: document.getElementById('colorPickerModal'),
      lobbyModal: document.getElementById('lobbyModal'),
      gameOverModal: document.getElementById('gameOverModal'),
      rulesModal: document.getElementById('rulesModal')
    };
  }

  setEggBalance(balance) {
    if (this.dom.userEggBalance) {
      this.dom.userEggBalance.textContent = balance;
    }
  }

  setRoomBadge(text) {
    if (this.dom.roomBadge) {
      this.dom.roomBadge.textContent = text;
    }
  }

  setDirection(direction = 1) {
    if (!this.dom.directionRing) return;
    if (direction === 1) {
      this.dom.directionRing.classList.remove('ccw');
      this.dom.directionRing.classList.add('cw');
    } else {
      this.dom.directionRing.classList.remove('cw');
      this.dom.directionRing.classList.add('ccw');
    }
  }

  renderDiscardPile(cardId) {
    if (!this.dom.discardPile) return;
    if (cardId == null) {
      this.dom.discardPile.innerHTML = '';
      return;
    }
    const details = getCardDetails(cardId);
    this.dom.discardPile.style.setProperty('--col', details.col);
    this.dom.discardPile.style.setProperty('--row', details.row);
    this.dom.discardPile.className = 'discard-pile uno-card';
  }

  renderActiveColor(color) {
    if (!this.dom.activeColorBadge) return;
    const names = {
      red: '🔴 Đỏ',
      yellow: '🟡 Vàng',
      green: '🟢 Xanh Lá',
      blue: '🔵 Lam'
    };
    this.dom.activeColorBadge.className = `active-color-badge color-${color}`;
    this.dom.activeColorBadge.textContent = names[color] || color.toUpperCase();
  }

  renderOpponents(players, myId, currentTurn, unoPenaltyWindow) {
    if (!this.dom.opponentsContainer) return;
    this.dom.opponentsContainer.innerHTML = '';

    const opponents = players.filter(p => p.id !== myId);
    for (const p of opponents) {
      const isTurn = currentTurn === p.id;
      const count = p.cardCount ?? p.hand?.length ?? 0;
      const isUno = count === 1;

      const pod = document.createElement('div');
      pod.className = `player-pod ${isTurn ? 'active-turn' : ''} ${isUno ? 'is-uno' : ''}`;
      pod.id = `pod-${p.id}`;

      // Mini cards fan
      let miniCardsHtml = '';
      const displayCards = Math.min(count, 10);
      for (let i = 0; i < displayCards; i++) {
        miniCardsHtml += `<div class="mini-card-back"></div>`;
      }

      pod.innerHTML = `
        <div class="pod-avatar">
          ${p.isBot ? '🤖' : '👤'}
          <span class="card-count-badge">${count}</span>
        </div>
        <div class="pod-info">
          <div class="pod-name" title="${p.name}">${p.name}</div>
          <div class="pod-status">
            ${isUno ? '⚠️ NÓI UNO!' : isTurn ? 'Đang đi...' : p.isBot ? 'Bot' : 'Người chơi'}
          </div>
          <div class="opponent-cards-fan">${miniCardsHtml}</div>
        </div>
        ${isTurn ? `<div class="pod-timer-bar"></div>` : ''}
      `;

      this.dom.opponentsContainer.appendChild(pod);
    }
  }

  renderHand(cards = [], topCardId, activeColor, isMyTurn, onCardClick, selectedIds = new Set()) {
    if (!this.dom.handFanTrack) return;
    this.dom.handFanTrack.innerHTML = '';

    if (this.dom.handLabel) {
      this.dom.handLabel.textContent = `BÀI CỦA BẠN (${cards.length} LÁ)${isMyTurn ? ' - LƯỢT ĐI CỦA BẠN' : ''}`;
    }

    const n = cards.length;
    const mid = (n - 1) / 2;
    const degPerCard = Math.max(1.8, Math.min(5, 36 / (n || 1)));
    const overlap = Math.max(-46, Math.min(-18, -320 / (n || 1)));

    cards.forEach((cardId, index) => {
      const details = getCardDetails(cardId);
      const offset = index - mid;
      const deg = offset * degPerCard;
      const yOffset = Math.abs(offset) * 3;

      const cardEl = document.createElement('div');
      cardEl.className = 'uno-card fan-card';
      cardEl.style.setProperty('--col', details.col);
      cardEl.style.setProperty('--row', details.row);
      cardEl.style.setProperty('--fan-deg', `${deg}deg`);
      cardEl.style.setProperty('--fan-y', `${yOffset}px`);
      cardEl.style.setProperty('--fan-overlap', `${overlap}px`);
      cardEl.style.zIndex = index + 1;

      const isSelected = selectedIds.has(cardId);
      const playable = isMyTurn && isValidPlay(cardId, topCardId, activeColor);

      if (isSelected) {
        cardEl.classList.add('is-selected');
        cardEl.title = `Đã chọn (${details.type} ${details.color}) - Bấm để bỏ chọn`;
        cardEl.addEventListener('click', () => onCardClick(cardId));
      } else if (isMyTurn) {
        // Có thể chọn nếu lá đó hợp lệ với cọc đánh, HOẶC nếu có thể ghép đôi với lá đã chọn
        let canPairWithSelection = false;
        if (selectedIds.size > 0) {
          const firstSelected = [...selectedIds][0];
          const firstVal = getCardValue(firstSelected);
          const firstType = getCardType(firstSelected);
          if (firstType === 'number') {
            canPairWithSelection = details.type === 'number' && details.value === firstVal;
          } else {
            canPairWithSelection = details.type === firstType;
          }
        }

        if (playable || canPairWithSelection) {
          cardEl.classList.add('is-playable');
          cardEl.title = canPairWithSelection
            ? `Ghép đôi cùng giá trị (${details.type} ${details.color})`
            : `Đánh lá ${details.type} (${details.color})`;
          cardEl.addEventListener('click', () => onCardClick(cardId));
        } else {
          cardEl.classList.add('is-dimmed');
        }
      }

      this.dom.handFanTrack.appendChild(cardEl);
    });
  }

  updatePlaySelectedButton({ visible, label = '⚡ ĐÁNH BÀI', isPair = false }) {
    if (!this.dom.btnPlaySelected) return;
    if (visible) {
      this.dom.btnPlaySelected.style.display = 'inline-flex';
      this.dom.btnPlaySelected.textContent = label;
      if (isPair) {
        this.dom.btnPlaySelected.classList.add('is-pair');
      } else {
        this.dom.btnPlaySelected.classList.remove('is-pair');
      }
    } else {
      this.dom.btnPlaySelected.style.display = 'none';
    }
  }

  setSortButton(mode) {
    if (!this.dom.sortText) return;
    if (mode === 'value') {
      if (this.dom.sortIcon) this.dom.sortIcon.textContent = '🔢';
      this.dom.sortText.textContent = 'Xếp bài (Số)';
    } else {
      if (this.dom.sortIcon) this.dom.sortIcon.textContent = '🎨';
      this.dom.sortText.textContent = 'Xếp bài (Màu)';
    }
  }

  updateActionButtons({ canCallUno = false, canCatchUno = false, penaltyWindow = null, canPass = false, canDraw = false, isMyTurn = false }) {
    if (this.dom.btnUnoCall) {
      this.dom.btnUnoCall.style.display = canCallUno ? 'inline-flex' : 'none';
    }

    if (this.dom.btnUnoCatch) {
      if (canCatchUno && penaltyWindow) {
        this.dom.btnUnoCatch.style.display = 'inline-flex';
        this.dom.btnUnoCatch.textContent = `⚡ BẮT UNO!`;
      } else {
        this.dom.btnUnoCatch.style.display = 'none';
      }
    }

    if (this.dom.btnPassTurn) {
      this.dom.btnPassTurn.style.display = canPass ? 'inline-flex' : 'none';
    }

    if (this.dom.drawPile) {
      if (canDraw && isMyTurn) {
        this.dom.drawPile.classList.add('can-draw');
      } else {
        this.dom.drawPile.classList.remove('can-draw');
      }
    }
  }

  openColorPicker(callback) {
    if (!this.dom.colorPickerModal) return;
    this.dom.colorPickerModal.classList.add('open');

    const handleSelect = (color) => {
      this.dom.colorPickerModal.classList.remove('open');
      clean();
      if (callback) callback(color);
    };

    const clean = () => {
      ['red', 'yellow', 'green', 'blue'].forEach(c => {
        const btn = document.getElementById(`btnChoose-${c}`);
        if (btn) btn.replaceWith(btn.cloneNode(true));
      });
    };

    ['red', 'yellow', 'green', 'blue'].forEach(c => {
      const btn = document.getElementById(`btnChoose-${c}`);
      if (btn) {
        btn.addEventListener('click', () => handleSelect(c), { once: true });
      }
    });
  }

  showGameOver({ winner, roundScore, eggReward, isWinner, onNewGame }) {
    if (!this.dom.gameOverModal) return;

    const titleEl = document.getElementById('gameOverTitle');
    const msgEl = document.getElementById('gameOverMsg');
    const scoreEl = document.getElementById('gameOverScore');
    const btnAgain = document.getElementById('btnPlayAgain');

    if (titleEl) {
      titleEl.innerHTML = isWinner ? '🏆 CHIẾN THẮNG!' : '😢 KẾT THÚC VÁN!';
      titleEl.style.color = isWinner ? '#FBBF24' : '#94A3B8';
    }

    if (msgEl) {
      msgEl.textContent = isWinner
        ? `Chúc mừng bạn đã đánh hết bài xuất sắc!`
        : `${winner.name} đã giành chiến thắng ván đấu này.`;
    }

    if (scoreEl) {
      scoreEl.innerHTML = `
        <div style="font-size:1.1rem;margin:12px 0">Điểm ván đấu: <b>${roundScore}</b></div>
        ${isWinner ? `<div style="font-size:1.25rem;color:#FBBF24;font-weight:700">Thưởng Trứng: +${eggReward} 🥚</div>` : ''}
      `;
    }

    if (btnAgain) {
      btnAgain.onclick = () => {
        this.dom.gameOverModal.classList.remove('open');
        if (onNewGame) onNewGame();
      };
    }

    this.dom.gameOverModal.classList.add('open');
  }
}
