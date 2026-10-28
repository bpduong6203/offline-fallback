// UI Rendering and DOM Interactions for Tiến Lên Miền Nam
import { SUIT_SYMBOLS, VALUE_LABELS, identifyCombination, canBeat, COMBO_TYPE } from './engine.js';

export class UIManager {
  constructor({ onPlay, onPass, onHint, onSort, onModeChange }) {
    this.onPlay = onPlay;
    this.onPass = onPass;
    this.onHint = onHint;
    this.onSort = onSort;
    this.onModeChange = onModeChange;

    this.selectedCards = new Set();
    this.sortByCombo = false;

    // Cache elements
    this.elArenaCards = document.getElementById('arenaCards');
    this.elArenaMsg = document.getElementById('arenaMsg');
    this.elUserCards = document.getElementById('userCards');
    this.btnPlay = document.getElementById('btnPlay');
    this.btnPass = document.getElementById('btnPass');
    this.btnHint = document.getElementById('btnHint');
    this.btnSort = document.getElementById('btnSort');

    this.playerPods = [
      document.getElementById('pod0'), // Bottom (User)
      document.getElementById('pod1'), // Left
      document.getElementById('pod2'), // Top
      document.getElementById('pod3')  // Right
    ];

    this.bindEvents();
  }

  bindEvents() {
    this.btnPlay.addEventListener('click', () => {
      if (this.onPlay) this.onPlay([...this.selectedCards]);
    });

    this.btnPass.addEventListener('click', () => {
      if (this.onPass) this.onPass();
    });

    this.btnHint.addEventListener('click', () => {
      if (this.onHint) this.onHint();
    });

    this.btnSort.addEventListener('click', () => {
      this.sortByCombo = !this.sortByCombo;
      this.btnSort.textContent = this.sortByCombo ? 'Xếp: Bộ' : 'Xếp: Số';
      if (this.onSort) this.onSort(this.sortByCombo);
    });
  }

  createCardElement(card, isSelected = false) {
    const el = document.createElement('div');
    el.className = `playing-card ${card.isRed() ? 'red' : 'black'} ${isSelected ? 'selected' : ''}`;
    el.dataset.id = card.id;

    const valStr = VALUE_LABELS[card.value];
    const suitStr = SUIT_SYMBOLS[card.suit];

    el.innerHTML = `
      <div class="corner">
        <span class="card-val">${valStr}</span>
        <span class="card-suit">${suitStr}</span>
      </div>
      <div class="center-suit">${suitStr}</div>
      <div class="corner" style="transform: rotate(180deg);">
        <span class="card-val">${valStr}</span>
        <span class="card-suit">${suitStr}</span>
      </div>
    `;

    el.addEventListener('click', () => {
      if (this.selectedCards.has(card.id)) {
        this.selectedCards.delete(card.id);
        el.classList.remove('selected');
      } else {
        this.selectedCards.add(card.id);
        el.classList.add('selected');
      }
      this.updatePlayButton();
    });

    return el;
  }

  renderHand(hand) {
    this.elUserCards.innerHTML = '';
    for (const card of hand) {
      const isSelected = this.selectedCards.has(card.id);
      const cardEl = this.createCardElement(card, isSelected);
      this.elUserCards.appendChild(cardEl);
    }
    this.updatePlayButton();
  }

  selectCards(cardIds) {
    this.selectedCards.clear();
    for (const id of cardIds) {
      this.selectedCards.add(id);
    }
    // Update DOM
    const cards = this.elUserCards.querySelectorAll('.playing-card');
    cards.forEach(c => {
      if (this.selectedCards.has(c.dataset.id)) {
        c.classList.add('selected');
      } else {
        c.classList.remove('selected');
      }
    });
    this.updatePlayButton();
  }

  clearSelection() {
    this.selectedCards.clear();
    const cards = this.elUserCards.querySelectorAll('.playing-card');
    cards.forEach(c => c.classList.remove('selected'));
    this.updatePlayButton();
  }

  renderArena(boardCombo, lastPlayerName = '') {
    this.elArenaCards.innerHTML = '';
    if (!boardCombo || !boardCombo.cards || boardCombo.cards.length === 0) {
      this.elArenaMsg.textContent = 'Vòng mới - Hãy ra bài mở đầu';
      return;
    }

    this.elArenaMsg.textContent = lastPlayerName ? `${lastPlayerName} vừa đánh` : '';
    for (const card of boardCombo.cards) {
      const el = document.createElement('div');
      el.className = `playing-card ${card.isRed() ? 'red' : 'black'}`;
      const valStr = VALUE_LABELS[card.value];
      const suitStr = SUIT_SYMBOLS[card.suit];
      el.innerHTML = `
        <div class="corner">
          <span class="card-val">${valStr}</span>
          <span class="card-suit">${suitStr}</span>
        </div>
        <div class="center-suit">${suitStr}</div>
      `;
      this.elArenaCards.appendChild(el);
    }
  }

  renderPlayers(players, currentTurn, passedPlayerIds = new Set()) {
    players.forEach((p, idx) => {
      const pod = this.playerPods[idx];
      if (!pod) return;

      const isCurrent = p.id === currentTurn;
      const isPassed = passedPlayerIds.has(p.id);

      pod.classList.toggle('active', isCurrent);
      pod.classList.toggle('passed', isPassed);

      const nameEl = pod.querySelector('.player-name');
      if (nameEl) nameEl.textContent = p.name;

      const countBadge = pod.querySelector('.card-count-badge');
      if (countBadge) countBadge.textContent = `${p.cardCount}`;

      const statusTag = pod.querySelector('.status-tag');
      if (statusTag) {
        if (p.won) {
          statusTag.textContent = `Về hạng ${p.rank || 1}`;
          statusTag.style.display = 'block';
        } else if (isPassed) {
          statusTag.textContent = 'Bỏ lượt';
          statusTag.style.display = 'block';
        } else if (isCurrent) {
          statusTag.textContent = 'Đang nghĩ...';
          statusTag.style.display = 'block';
        } else {
          statusTag.style.display = 'none';
        }
      }
    });
  }

  setControlsState({ isMyTurn, isNewRound, currentCombo, myHand }) {
    this.currentContext = { isMyTurn, isNewRound, currentCombo, myHand };
    this.btnPass.disabled = !isMyTurn || isNewRound;
    this.btnHint.disabled = !isMyTurn;
    this.updatePlayButton();
  }

  updatePlayButton() {
    if (!this.currentContext || !this.currentContext.isMyTurn) {
      this.btnPlay.disabled = true;
      return;
    }

    const { isNewRound, currentCombo, myHand } = this.currentContext;
    const selected = myHand.filter(c => this.selectedCards.has(c.id));

    if (selected.length === 0) {
      this.btnPlay.disabled = true;
      return;
    }

    const combo = identifyCombination(selected);
    const valid = combo.type !== COMBO_TYPE.INVALID && canBeat(currentCombo, combo, isNewRound);
    this.btnPlay.disabled = !valid;
  }

  updateTimer(percent, urgent = false) {
    const bars = document.querySelectorAll('.timer-bar');
    bars.forEach(bar => {
      bar.style.width = `${Math.max(0, Math.min(100, percent))}%`;
      bar.classList.toggle('urgent', urgent);
    });
  }
}
