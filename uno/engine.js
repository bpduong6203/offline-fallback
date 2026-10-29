// Pure Deterministic UNO Game Engine
// Ánh xạ chính xác ma trận 14 cột x 8 hàng của sprite sheet /__assets/uno_deck.svg
// Dùng chung cho cả Client (Browser) và Server (Cloudflare Workers / Node.js)

export const CARD_WIDTH = 240;
export const CARD_HEIGHT = 360;

/**
 * Tạo danh sách 108 lá bài UNO chuẩn từ 112 ô trên sprite sheet
 * (Loại bỏ 4 lá số 0 thừa ở hàng 4, 5, 6, 7: ID 56, 70, 84, 98)
 */
export function createDeck() {
  const deck = Array.from({ length: 112 }, (_, i) => i);
  deck.splice(56, 1); // Đỏ 0 thừa (56)
  deck.splice(69, 1); // Vàng 0 thừa (70 - 1)
  deck.splice(82, 1); // Xanh lá 0 thừa (84 - 2)
  deck.splice(95, 1); // Xanh dương 0 thừa (98 - 3)
  return deck;
}

/**
 * Thuật toán xáo bài Fisher-Yates
 */
export function shuffleDeck(deck, randomFn = Math.random) {
  const a = [...deck];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(randomFn() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/**
 * Trả về màu của lá bài: 'red' | 'yellow' | 'green' | 'blue' | 'black'
 */
export function getCardColor(id) {
  const col = id % 14;
  if (col === 13) return 'black';
  const row = Math.floor(id / 14);
  const colors = ['red', 'yellow', 'green', 'blue'];
  return colors[row % 4];
}

/**
 * Trả về loại của lá bài: 'number' | 'skip' | 'reverse' | 'draw2' | 'wild' | 'draw4'
 */
export function getCardType(id) {
  const col = id % 14;
  switch (col) {
    case 10: return 'skip';
    case 11: return 'reverse';
    case 12: return 'draw2';
    case 13: {
      const row = Math.floor(id / 14);
      return row >= 4 ? 'draw4' : 'wild';
    }
    default:
      return 'number';
  }
}

/**
 * Trả về giá trị số của lá bài (0 - 9), hoặc null nếu là lá chức năng
 */
export function getCardValue(id) {
  const col = id % 14;
  return col < 10 ? col : null;
}

/**
 * Trả về điểm số khi tổng kết ván
 * Số 0-9: điểm mặt lá (0-9)
 * Skip, Reverse, Draw 2: 20 điểm
 * Wild, Wild Draw 4: 50 điểm
 */
export function getCardScore(id) {
  const col = id % 14;
  if (col < 10) return col;
  if (col < 13) return 20;
  return 50;
}

/**
 * Trả về thông tin chi tiết đầy đủ của lá bài
 */
export function getCardDetails(id) {
  const col = id % 14;
  const row = Math.floor(id / 14);
  return {
    id,
    col,
    row,
    color: getCardColor(id),
    type: getCardType(id),
    value: getCardValue(id),
    score: getCardScore(id),
    spriteX: 1 + CARD_WIDTH * col,
    spriteY: 1 + CARD_HEIGHT * row
  };
}

/**
 * Kiểm tra xem lá bài cardId có được phép đánh lên bàn cờ hiện tại hay không
 * @param {number} cardId - Lá bài muốn đánh
 * @param {number} topCardId - Lá bài trên cùng cọc đánh
 * @param {string} activeColor - Màu sắc hiện tại ('red', 'yellow', 'green', 'blue')
 */
export function isValidPlay(cardId, topCardId, activeColor) {
  if (cardId == null || topCardId == null) return false;

  const cardColor = getCardColor(cardId);
  const cardType = getCardType(cardId);
  const cardVal = getCardValue(cardId);

  // Lá Wild hoặc Wild Draw 4 luôn được phép đánh
  if (cardColor === 'black' || cardType === 'wild' || cardType === 'draw4') {
    return true;
  }

  // Khớp với màu sắc đang hoạt động trên bàn
  if (activeColor && cardColor === activeColor) {
    return true;
  }

  const topColor = getCardColor(topCardId);
  const topType = getCardType(topCardId);
  const topVal = getCardValue(topCardId);

  // Nếu cọc đánh là màu đen nhưng chưa có activeColor
  if (topColor === 'black' && !activeColor) {
    return true;
  }

  // Khớp số (nếu đều là lá số)
  if (cardType === 'number' && topType === 'number' && cardVal === topVal) {
    return true;
  }

  // Khớp loại chức năng (ví dụ: Skip Vàng đè Skip Đỏ, +2 Xanh đè +2 Vàng)
  if (cardType !== 'number' && cardType === topType) {
    return true;
  }

  return false;
}

/**
 * Kiểm tra xem 2 hoặc nhiều lá bài có cùng số hoặc cùng loại chức năng để đánh đôi / đánh bộ hay không
 */
export function areCardsPairCompatible(cardIds) {
  if (!Array.isArray(cardIds) || cardIds.length < 2) return false;
  const first = cardIds[0];
  const firstType = getCardType(first);
  const firstVal = getCardValue(first);

  if (firstType === 'number') {
    return cardIds.every(id => getCardType(id) === 'number' && getCardValue(id) === firstVal);
  }
  return cardIds.every(id => getCardType(id) === firstType);
}

/**
 * Kiểm tra xem một bộ bài (đôi / nhiều lá) có hợp lệ để đánh lên bàn hay không
 * Điều kiện: Các lá bài phải tương thích với nhau (cùng số hoặc cùng loại chức năng)
 * VÀ ít nhất một lá trong bộ bài phải hợp lệ với cọc đánh hiện tại
 */
export function canPlayCardsAsPair(cardIds, topCardId, activeColor) {
  if (!areCardsPairCompatible(cardIds)) return { valid: false };
  const validStarter = cardIds.find(id => isValidPlay(id, topCardId, activeColor));
  if (validStarter == null) return { valid: false };
  return { valid: true, starterId: validStarter };
}

/**
 * Xếp bài trên tay người chơi theo màu hoặc theo số
 * @param {number[]} hand - Mảng ID các lá bài
 * @param {'color'|'value'} mode - Chế độ sắp xếp ('color' | 'value')
 */
export function sortCards(hand, mode = 'color') {
  if (!Array.isArray(hand)) return [];
  const colorOrder = { red: 0, yellow: 1, green: 2, blue: 3, black: 4 };
  const typeOrder = { number: 0, skip: 1, reverse: 2, draw2: 3, wild: 4, draw4: 5 };

  return [...hand].sort((a, b) => {
    const colorA = getCardColor(a);
    const colorB = getCardColor(b);
    const typeA = getCardType(a);
    const typeB = getCardType(b);
    const valA = getCardValue(a) ?? 99;
    const valB = getCardValue(b) ?? 99;

    if (mode === 'value') {
      if (typeA !== typeB) {
        return (typeOrder[typeA] ?? 99) - (typeOrder[typeB] ?? 99);
      }
      if (typeA === 'number' && valA !== valB) {
        return valA - valB;
      }
      return (colorOrder[colorA] ?? 99) - (colorOrder[colorB] ?? 99);
    } else {
      if (colorA !== colorB) {
        return (colorOrder[colorA] ?? 99) - (colorOrder[colorB] ?? 99);
      }
      if (typeA !== typeB) {
        return (typeOrder[typeA] ?? 99) - (typeOrder[typeB] ?? 99);
      }
      return valA - valB;
    }
  });
}

/**
 * Lớp điều khiển logic ván đấu UNO hoàn chỉnh
 */
export class UnoGame {
  constructor({ players = [], dealer = 0, customDeck = null } = {}) {
    if (players.length < 2 || players.length > 4) {
      throw new Error('Số người chơi phải từ 2 đến 4');
    }

    this.players = players.map((p, idx) => ({
      id: p.id ?? idx,
      name: p.name || `Người chơi ${idx + 1}`,
      isBot: !!p.isBot,
      hand: []
    }));

    this.dealer = dealer % this.players.length;
    this.drawPile = customDeck ? [...customDeck] : shuffleDeck(createDeck());
    this.discardPile = [];
    this.currentTurn = 0;
    this.direction = 1; // 1: thuận chiều kim đồng hồ, -1: ngược chiều kim đồng hồ
    this.activeColor = null; // 'red' | 'yellow' | 'green' | 'blue'
    this.pendingDraw = null; // Lưu trạng thái khi người chơi vừa rút 1 lá { playerId, cardId, canPlay }
    this.unoPenaltyWindow = null; // { playerId, expiresAt }
    this.calledUnoPlayers = new Set(); // Các người chơi đã bấm "Nói UNO!" hợp lệ
    this.winner = null;
    this.roundScore = 0;
    this.ended = false;
    this.logs = [];

    this.init();
  }

  log(msg) {
    this.logs.push({ t: Date.now(), msg });
  }

  init() {
    // Chia 7 lá bài cho mỗi người chơi
    for (let r = 0; r < 7; r++) {
      for (let i = 0; i < this.players.length; i++) {
        const playerIdx = (this.dealer + 1 + i) % this.players.length;
        this.players[playerIdx].hand.push(this.drawCardFromPile());
      }
    }

    // Lật lá bài mở màn đầu tiên
    let firstCard;
    do {
      firstCard = this.drawCardFromPile();
      // Nếu lá đầu tiên là Wild Draw 4 (+4), theo luật Mattel: nhét lại cọc bài và bốc lá khác
      if (getCardType(firstCard) === 'draw4') {
        this.drawPile.push(firstCard);
        this.drawPile = shuffleDeck(this.drawPile);
      } else {
        break;
      }
    } while (true);

    this.discardPile.push(firstCard);
    const firstType = getCardType(firstCard);
    const firstColor = getCardColor(firstCard);

    // Xác định người đi đầu tiên (bên trái người chia bài)
    this.currentTurn = (this.dealer + 1) % this.players.length;
    this.direction = 1;

    // Xử lý hiệu ứng lá mở màn
    if (firstType === 'wild') {
      // Nếu lá đầu là Wild: người chơi đầu tiên được quyền chọn màu (mặc định lấy màu random hoặc người chơi chọn)
      this.activeColor = ['red', 'yellow', 'green', 'blue'][Math.floor(Math.random() * 4)];
      this.log(`Lá mở màn là Wild! Màu khởi đầu: ${this.activeColor}`);
    } else {
      this.activeColor = firstColor;
    }

    if (firstType === 'draw2') {
      // Người chơi đầu tiên bị rút 2 lá và mất lượt
      this.players[this.currentTurn].hand.push(this.drawCardFromPile(), this.drawCardFromPile());
      this.log(`Lá mở màn là Draw 2! ${this.players[this.currentTurn].name} bị phạt 2 lá và mất lượt.`);
      this.currentTurn = (this.currentTurn + 1) % this.players.length;
    } else if (firstType === 'reverse') {
      // Ván 2 người: Reverse đóng vai trò Skip (người chia bài được đi)
      if (this.players.length === 2) {
        this.log(`Lá mở màn là Reverse trong ván 2 người! ${this.players[this.currentTurn].name} bị bỏ qua.`);
        this.currentTurn = this.dealer;
      } else {
        this.direction = -1;
        this.currentTurn = (this.dealer - 1 + this.players.length) % this.players.length;
        this.log(`Lá mở màn là Reverse! Đổi chiều đánh sang ngược chiều kim đồng hồ.`);
      }
    } else if (firstType === 'skip') {
      this.log(`Lá mở màn là Skip! ${this.players[this.currentTurn].name} bị cấm lượt.`);
      this.currentTurn = (this.currentTurn + 1) % this.players.length;
    }

    this.log(`Trận đấu bắt đầu! Lượt đầu tiên: ${this.players[this.currentTurn].name}`);
  }

  getTopCard() {
    return this.discardPile.length ? this.discardPile[this.discardPile.length - 1] : null;
  }

  drawCardFromPile() {
    if (this.drawPile.length === 0) {
      this.recycleDiscardPile();
    }
    if (this.drawPile.length === 0) {
      throw new Error('Hết bài trong cả cọc rút lẫn cọc đánh!');
    }
    return this.drawPile.shift();
  }

  recycleDiscardPile() {
    if (this.discardPile.length <= 1) return;
    const topCard = this.discardPile.pop();
    const recycled = shuffleDeck(this.discardPile);
    this.drawPile.push(...recycled);
    this.discardPile = [topCard];
    this.log(`Cọc bài rút cạn. Đã tái chế và xáo lại ${recycled.length} lá bài từ cọc đánh!`);
  }

  /**
   * Người chơi thực hiện hành động đánh bài
   */
  playCard(playerId, cardId, chosenColor = null, calledUno = false) {
    if (Array.isArray(cardId)) {
      if (cardId.length === 1) {
        cardId = cardId[0];
      } else {
        return this.playCards(playerId, cardId, chosenColor, calledUno);
      }
    }

    if (this.ended) return { success: false, reason: 'Ván đấu đã kết thúc' };

    const playerIdx = this.players.findIndex(p => p.id === playerId);
    if (playerIdx === -1) return { success: false, reason: 'Người chơi không tồn tại' };
    if (playerIdx !== this.currentTurn) return { success: false, reason: 'Chưa tới lượt của bạn' };

    const player = this.players[playerIdx];
    const cardPos = player.hand.indexOf(cardId);
    if (cardPos === -1) return { success: false, reason: 'Lá bài không có trên tay' };

    const topCard = this.getTopCard();
    if (!isValidPlay(cardId, topCard, this.activeColor)) {
      return { success: false, reason: 'Nước đi không hợp lệ' };
    }

    const cardType = getCardType(cardId);
    const cardColor = getCardColor(cardId);

    // Bắt buộc chọn màu nếu là lá Wild hoặc Wild Draw 4
    if ((cardType === 'wild' || cardType === 'draw4') && !['red', 'yellow', 'green', 'blue'].includes(chosenColor)) {
      return { success: false, reason: 'Phải chọn màu mới khi đánh lá đổi màu' };
    }

    // Đánh bài xuống bàn
    player.hand.splice(cardPos, 1);
    this.discardPile.push(cardId);
    this.pendingDraw = null;

    // Cập nhật màu sắc hoạt động
    if (cardType === 'wild' || cardType === 'draw4') {
      this.activeColor = chosenColor;
    } else {
      this.activeColor = cardColor;
    }

    this.log(`${player.name} đánh ${cardType} ${cardColor} (Màu mới: ${this.activeColor})`);

    // Xử lý cơ chế Nói UNO
    if (player.hand.length === 1) {
      if (calledUno) {
        this.calledUnoPlayers.add(player.id);
        this.unoPenaltyWindow = null;
        this.log(`🔥 ${player.name} đã hô "UNO!" thành công!`);
      } else {
        // Kích hoạt cửa sổ phạt 2.5 giây cho đối thủ bắt phạt
        this.calledUnoPlayers.delete(player.id);
        this.unoPenaltyWindow = {
          playerId: player.id,
          expiresAt: Date.now() + 2500
        };
        this.log(`⚠️ ${player.name} còn 1 lá nhưng CHƯA hô UNO! Cửa sổ bắt phạt mở ra.`);
      }
    } else {
      this.calledUnoPlayers.delete(player.id);
      this.unoPenaltyWindow = null;
    }

    // Kiểm tra chiến thắng (hết bài)
    if (player.hand.length === 0) {
      this.ended = true;
      this.winner = player;
      this.roundScore = this.calculateWinnerScore(player.id);
      this.log(`🏆 ${player.name} đã đánh hết bài và CHIẾN THẮNG! Tổng điểm thưởng: +${this.roundScore}`);
      return {
        success: true,
        gameOver: true,
        winner: player,
        roundScore: this.roundScore,
        cardId,
        activeColor: this.activeColor
      };
    }

    // Xử lý hiệu ứng lá chức năng và chuyển lượt
    let step = 1;
    let nextPlayerIdx = (this.currentTurn + this.direction + this.players.length) % this.players.length;

    if (cardType === 'skip') {
      step = 2;
      this.log(`Cấm lượt! ${this.players[nextPlayerIdx].name} bị mất lượt.`);
    } else if (cardType === 'reverse') {
      if (this.players.length === 2) {
        // Trong ván 2 người: Reverse có hiệu lực như Skip
        step = 2;
        this.log(`Reverse trong ván 2 người! Đối thủ bị bỏ qua, ${player.name} tiếp tục đi.`);
      } else {
        this.direction *= -1;
        step = 1;
        this.log(`Đổi chiều đánh sang ${this.direction === 1 ? 'Thuận' : 'Ngược'} chiều kim đồng hồ.`);
      }
    } else if (cardType === 'draw2') {
      // Người tiếp theo rút 2 lá và mất lượt
      const target = this.players[nextPlayerIdx];
      const c1 = this.drawCardFromPile();
      const c2 = this.drawCardFromPile();
      target.hand.push(c1, c2);
      this.calledUnoPlayers.delete(target.id);
      step = 2;
      this.log(`Draw 2! ${target.name} bị phạt rút 2 lá và mất lượt.`);
    } else if (cardType === 'draw4') {
      // Người tiếp theo rút 4 lá và mất lượt
      const target = this.players[nextPlayerIdx];
      const penalty = [];
      for (let k = 0; k < 4; k++) penalty.push(this.drawCardFromPile());
      target.hand.push(...penalty);
      this.calledUnoPlayers.delete(target.id);
      step = 2;
      this.log(`Wild Draw 4! ${target.name} bị phạt rút 4 lá và mất lượt.`);
    }

    // Chuyển lượt kế tiếp
    this.currentTurn = (this.currentTurn + step * this.direction + this.players.length) % this.players.length;

    return {
      success: true,
      gameOver: false,
      cardId,
      activeColor: this.activeColor,
      nextTurn: this.currentTurn,
      unoPenaltyWindow: !!this.unoPenaltyWindow
    };
  }

  /**
   * Đánh đồng thời 2 hoặc nhiều lá bài (đánh đôi / đánh bộ)
   */
  playCards(playerId, cardIds, chosenColor = null, calledUno = false) {
    if (this.ended) return { success: false, reason: 'Ván đấu đã kết thúc' };

    const playerIdx = this.players.findIndex(p => p.id === playerId);
    if (playerIdx === -1) return { success: false, reason: 'Người chơi không tồn tại' };
    if (playerIdx !== this.currentTurn) return { success: false, reason: 'Chưa tới lượt của bạn' };

    const player = this.players[playerIdx];
    const handCopy = [...player.hand];
    for (const id of cardIds) {
      const idx = handCopy.indexOf(id);
      if (idx === -1) return { success: false, reason: 'Lá bài không có trên tay' };
      handCopy.splice(idx, 1);
    }

    const topCard = this.getTopCard();
    const pairCheck = canPlayCardsAsPair(cardIds, topCard, this.activeColor);
    if (!pairCheck.valid) {
      return { success: false, reason: 'Bộ bài không hợp lệ hoặc không khớp cọc đánh' };
    }

    const starterId = pairCheck.starterId;
    const ordered = [starterId, ...cardIds.filter(id => id !== starterId)];
    const lastCard = ordered[ordered.length - 1];
    const lastType = getCardType(lastCard);
    const lastColor = getCardColor(lastCard);

    if ((lastType === 'wild' || lastType === 'draw4') && !['red', 'yellow', 'green', 'blue'].includes(chosenColor)) {
      return { success: false, reason: 'Phải chọn màu mới khi đánh lá đổi màu' };
    }

    // Xóa các lá bài khỏi tay người chơi
    for (const id of cardIds) {
      const idx = player.hand.indexOf(id);
      if (idx !== -1) player.hand.splice(idx, 1);
    }

    // Đặt vào cọc đánh
    for (const id of ordered) {
      this.discardPile.push(id);
    }
    this.pendingDraw = null;

    if (lastType === 'wild' || lastType === 'draw4') {
      this.activeColor = chosenColor;
    } else {
      this.activeColor = lastColor;
    }

    this.log(`${player.name} đánh đôi/bộ ${cardIds.length} lá: ${ordered.map(id => `${getCardType(id)} ${getCardColor(id)}`).join(', ')}`);

    // Xử lý cơ chế Nói UNO
    if (player.hand.length === 1) {
      if (calledUno) {
        this.calledUnoPlayers.add(player.id);
        this.unoPenaltyWindow = null;
        this.log(`🔥 ${player.name} đã hô "UNO!" thành công!`);
      } else {
        this.calledUnoPlayers.delete(player.id);
        this.unoPenaltyWindow = {
          playerId: player.id,
          expiresAt: Date.now() + 2500
        };
        this.log(`⚠️ ${player.name} còn 1 lá nhưng CHƯA hô UNO! Cửa sổ bắt phạt mở ra.`);
      }
    } else {
      this.calledUnoPlayers.delete(player.id);
      this.unoPenaltyWindow = null;
    }

    // Kiểm tra chiến thắng
    if (player.hand.length === 0) {
      this.ended = true;
      this.winner = player;
      this.roundScore = this.calculateWinnerScore(player.id);
      this.log(`🏆 ${player.name} đã đánh hết bài và CHIẾN THẮNG! Tổng điểm thưởng: +${this.roundScore}`);
      return {
        success: true,
        gameOver: true,
        winner: player,
        roundScore: this.roundScore,
        cardId: lastCard,
        cardIds,
        activeColor: this.activeColor
      };
    }

    let step = 1;
    let nextPlayerIdx = (this.currentTurn + this.direction + this.players.length) % this.players.length;

    if (lastType === 'skip') {
      if (this.players.length === 2) {
        step = 2;
      } else {
        step = 1 + cardIds.length;
      }
      this.log(`Cấm lượt nhân x${cardIds.length}!`);
    } else if (lastType === 'reverse') {
      if (this.players.length === 2) {
        step = 2;
      } else {
        if (cardIds.length % 2 === 1) {
          this.direction *= -1;
        }
        step = 1;
      }
      this.log(`Đổi chiều x${cardIds.length}!`);
    } else if (lastType === 'draw2') {
      const target = this.players[nextPlayerIdx];
      const count = 2 * cardIds.length;
      const penalty = [];
      for (let k = 0; k < count; k++) penalty.push(this.drawCardFromPile());
      target.hand.push(...penalty);
      this.calledUnoPlayers.delete(target.id);
      step = 2;
      this.log(`Draw 2 dồn x${cardIds.length}! ${target.name} bị phạt rút ${count} lá và mất lượt.`);
    } else if (lastType === 'draw4') {
      const target = this.players[nextPlayerIdx];
      const count = 4 * cardIds.length;
      const penalty = [];
      for (let k = 0; k < count; k++) penalty.push(this.drawCardFromPile());
      target.hand.push(...penalty);
      this.calledUnoPlayers.delete(target.id);
      step = 2;
      this.log(`Wild Draw 4 dồn x${cardIds.length}! ${target.name} bị phạt rút ${count} lá và mất lượt.`);
    }

    this.currentTurn = (this.currentTurn + step * this.direction + 100 * this.players.length) % this.players.length;

    return {
      success: true,
      gameOver: false,
      cardId: lastCard,
      cardIds,
      activeColor: this.activeColor,
      nextTurn: this.currentTurn,
      unoPenaltyWindow: !!this.unoPenaltyWindow
    };
  }

  /**
   * Đăng ký hô UNO
   */
  callUno(playerId) {
    if (this.ended) return { success: false, reason: 'Ván đấu đã kết thúc' };
    const player = this.players.find(p => p.id === playerId);
    if (!player) return { success: false, reason: 'Người chơi không tồn tại' };
    this.calledUnoPlayers.add(playerId);
    this.log(`🔥 ${player.name} đã hô "UNO!"`);
    return { success: true };
  }

  /**
   * Bắt phạt người quên hô UNO đang trong cửa sổ phạt
   */
  catchUnoPenalty(catcherId) {
    if (!this.unoPenaltyWindow) return { success: false, caught: false, reason: 'Không có cửa sổ bắt phạt' };
    const targetId = this.unoPenaltyWindow.playerId;
    const res = this.catchUno(catcherId, targetId);
    return { success: res.caught, ...res };
  }

  /**
   * Rút 1 lá bài từ cọc rút khi đến lượt
   */
  drawCard(playerId) {
    if (this.ended) return { success: false, reason: 'Ván đấu đã kết thúc' };

    const playerIdx = this.players.findIndex(p => p.id === playerId);
    if (playerIdx === -1) return { success: false, reason: 'Người chơi không tồn tại' };
    if (playerIdx !== this.currentTurn) return { success: false, reason: 'Chưa tới lượt của bạn' };

    const player = this.players[playerIdx];
    const cardId = this.drawCardFromPile();
    player.hand.push(cardId);
    this.calledUnoPlayers.delete(player.id);

    const topCard = this.getTopCard();
    const canPlay = isValidPlay(cardId, topCard, this.activeColor);

    this.pendingDraw = { playerId, cardId, canPlay };
    this.log(`${player.name} rút 1 lá (${canPlay ? 'Có thể đánh ngay' : 'Không thể đánh'})`);

    return {
      success: true,
      cardId,
      cardDrawn: cardId,
      canPlay,
      canPlayDrawn: canPlay
    };
  }

  /**
   * Người chơi chọn bỏ lượt sau khi rút bài (không đánh lá vừa rút)
   */
  passTurn(playerId) {
    if (this.ended) return { success: false, reason: 'Ván đấu đã kết thúc' };

    const playerIdx = this.players.findIndex(p => p.id === playerId);
    if (playerIdx === -1) return { success: false, reason: 'Người chơi không tồn tại' };
    if (playerIdx !== this.currentTurn) return { success: false, reason: 'Chưa tới lượt của bạn' };

    this.pendingDraw = null;
    this.currentTurn = (this.currentTurn + this.direction + this.players.length) % this.players.length;
    this.log(`${this.players[playerIdx].name} bỏ lượt. Chuyển sang ${this.players[this.currentTurn].name}.`);

    return {
      success: true,
      nextTurn: this.currentTurn
    };
  }

  /**
   * Bắt phạt một người chơi còn 1 lá mà quên hô UNO
   */
  catchUno(catcherId, targetId) {
    if (this.ended) return { caught: false, reason: 'Ván đấu đã kết thúc' };

    if (!this.unoPenaltyWindow || this.unoPenaltyWindow.playerId !== targetId) {
      return { caught: false, reason: 'Không có vi phạm UNO để bắt phạt' };
    }

    const target = this.players.find(p => p.id === targetId);
    const catcher = this.players.find(p => p.id === catcherId);
    if (!target || !catcher) return { caught: false, reason: 'Người chơi không hợp lệ' };

    // Phạt rút 2 lá
    const p1 = this.drawCardFromPile();
    const p2 = this.drawCardFromPile();
    target.hand.push(p1, p2);
    this.unoPenaltyWindow = null;
    this.calledUnoPlayers.delete(target.id);

    this.log(`⚡ ${catcher.name} đã BẮT PHẠT ${target.name} quên hô UNO! ${target.name} bị phạt rút 2 lá.`);

    return {
      caught: true,
      targetId,
      catcherId,
      penaltyCards: 2
    };
  }

  /**
   * Tính tổng điểm phạt từ bài còn lại trên tay các đối thủ cho người thắng
   */
  calculateWinnerScore(winnerId) {
    let totalScore = 0;
    for (const p of this.players) {
      if (p.id !== winnerId) {
        for (const card of p.hand) {
          totalScore += getCardScore(card);
        }
      }
    }
    return totalScore;
  }

  /**
   * Tạo bản snapshot trạng thái ván đấu cho client cụ thể (Anti-cheat hand masking)
   * Client chỉ nhận thấy mảng lá bài của chính mình, các đối thủ chỉ thấy số lượng cardCount
   */
  getStateForPlayer(playerId) {
    return {
      currentTurn: this.currentTurn,
      direction: this.direction,
      activeColor: this.activeColor,
      topCard: this.getTopCard(),
      topCardDetails: this.getTopCard() != null ? getCardDetails(this.getTopCard()) : null,
      drawPileCount: this.drawPile.length,
      discardPileCount: this.discardPile.length,
      unoWindowActive: !!this.unoPenaltyWindow,
      unoTargetId: this.unoPenaltyWindow ? this.unoPenaltyWindow.playerId : null,
      ended: this.ended,
      winner: this.winner ? { id: this.winner.id, name: this.winner.name } : null,
      roundScore: this.roundScore,
      players: this.players.map(p => ({
        id: p.id,
        name: p.name,
        isBot: p.isBot,
        cardCount: p.hand.length,
        hasCalledUno: this.calledUnoPlayers.has(p.id),
        // Anti-cheat: Chỉ chính chủ mới nhận được danh sách bài thật
        hand: p.id === playerId ? [...p.hand] : null,
        handDetails: p.id === playerId ? p.hand.map(getCardDetails) : null
      }))
    };
  }
}
