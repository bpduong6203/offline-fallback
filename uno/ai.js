// Bot AI Engine for UNO (Easy, Medium, Hard)
import {
  isValidPlay,
  getCardColor,
  getCardType,
  getCardValue,
  getCardScore
} from './engine.js';

export const AI_DIFFICULTY = {
  EASY: 'easy',
  MEDIUM: 'medium',
  HARD: 'hard'
};

const COLORS = ['red', 'yellow', 'green', 'blue'];

export class UnoAI {
  /**
   * Đếm phân bố màu sắc trên tay (bỏ qua thẻ đen)
   */
  static getColorCounts(hand) {
    const counts = { red: 0, yellow: 0, green: 0, blue: 0 };
    for (const card of hand) {
      const color = getCardColor(card);
      if (counts[color] !== undefined) {
        counts[color]++;
      }
    }
    return counts;
  }

  /**
   * Tìm màu chủ lực (xuất hiện nhiều nhất trên tay)
   */
  static getDominantColor(hand) {
    const counts = this.getColorCounts(hand);
    let best = COLORS[0];
    let max = -1;
    for (const c of COLORS) {
      if (counts[c] > max) {
        max = counts[c];
        best = c;
      }
    }
    return best;
  }

  /**
   * Chọn màu khi đánh lá Wild hoặc Wild Draw 4
   */
  static chooseColor(hand, difficulty = AI_DIFFICULTY.MEDIUM) {
    if (difficulty === AI_DIFFICULTY.EASY) {
      return COLORS[Math.floor(Math.random() * COLORS.length)];
    }
    return this.getDominantColor(hand);
  }

  /**
   * Lựa chọn nước đi: Đánh lá nào hoặc Rút bài
   * @param {number[]} hand - Mảng ID bài trên tay bot
   * @param {number} topCard - ID lá trên cùng cọc đánh
   * @param {string} activeColor - Màu hiện tại ('red', 'yellow', 'green', 'blue')
   * @param {object} gameState - Trạng thái bàn cờ { players, currentTurn, direction }
   * @param {string} difficulty - 'easy' | 'medium' | 'hard'
   */
  static decideMove(hand, topCard, activeColor, gameState = {}, difficulty = AI_DIFFICULTY.MEDIUM) {
    const validCards = hand.filter(id => isValidPlay(id, topCard, activeColor));

    if (validCards.length === 0) {
      return { action: 'draw' };
    }

    let chosenCard;

    if (difficulty === AI_DIFFICULTY.EASY) {
      // Mức Dễ: Đánh ngẫu nhiên một lá hợp lệ
      chosenCard = validCards[Math.floor(Math.random() * validCards.length)];
    } else if (difficulty === AI_DIFFICULTY.MEDIUM) {
      // Mức Vừa: Ưu tiên giữ màu chủ lực, tiết kiệm lá chức năng
      const dominant = this.getDominantColor(hand);
      const sameColorCards = validCards.filter(c => getCardColor(c) === dominant);
      const numberCards = (sameColorCards.length ? sameColorCards : validCards).filter(
        c => getCardType(c) === 'number'
      );

      if (numberCards.length > 0) {
        chosenCard = numberCards[0];
      } else if (sameColorCards.length > 0) {
        chosenCard = sameColorCards[0];
      } else {
        // Nếu không có cùng màu, giữ lá Wild lại cuối cùng nếu có thể
        const nonWild = validCards.filter(c => getCardColor(c) !== 'black');
        chosenCard = nonWild.length > 0 ? nonWild[0] : validCards[0];
      }
    } else {
      // Mức Khó (Hard): Bậc thầy chiến thuật & Đánh chặn đối thủ nguy hiểm
      const numPlayers = gameState.players ? gameState.players.length : 4;
      const dir = gameState.direction || 1;
      const myIdx = gameState.currentTurn != null ? gameState.currentTurn : 0;
      const nextIdx = (myIdx + dir + numPlayers) % numPlayers;
      const nextPlayer = gameState.players ? gameState.players[nextIdx] : null;

      const nextCardsCount = nextPlayer ? (nextPlayer.cardCount ?? nextPlayer.hand?.length ?? 7) : 7;
      const isNextDangerous = nextCardsCount <= 2;

      if (isNextDangerous) {
        // Đối thủ kế tiếp sắp hết bài -> Ưu tiên tuyệt đối các lá cản trở: +4, +2, Skip, Reverse
        const attackCards = validCards.filter(c => {
          const type = getCardType(c);
          return type === 'draw4' || type === 'draw2' || type === 'skip' || type === 'reverse';
        });

        if (attackCards.length > 0) {
          attackCards.sort((a, b) => getCardScore(b) - getCardScore(a));
          chosenCard = attackCards[0];
        }
      }

      if (!chosenCard) {
        const minCardsAnyOpponent = gameState.players
          ? Math.min(...gameState.players.map((p, i) => (i === myIdx ? 99 : (p.cardCount ?? p.hand?.length ?? 7))))
          : 7;

        if (minCardsAnyOpponent <= 3) {
          const sortedByScore = [...validCards].sort((a, b) => getCardScore(b) - getCardScore(a));
          chosenCard = sortedByScore[0];
        } else {
          const dominant = this.getDominantColor(hand);
          const dominantCards = validCards.filter(c => getCardColor(c) === dominant);
          const nonWild = (dominantCards.length > 0 ? dominantCards : validCards).filter(
            c => getCardColor(c) !== 'black'
          );
          chosenCard = nonWild.length > 0 ? nonWild[0] : validCards[0];
        }
      }
    }

    // Kiểm tra khả năng đánh đôi / đánh bộ: nếu bot có lá cùng số hoặc cùng loại chức năng
    let cardsToPlay = [chosenCard];
    if (difficulty !== AI_DIFFICULTY.EASY || Math.random() < 0.6) {
      const chosenVal = getCardValue(chosenCard);
      const chosenType = getCardType(chosenCard);
      const matchingPartners = hand.filter(id => {
        if (id === chosenCard) return false;
        if (chosenType === 'number') {
          return getCardType(id) === 'number' && getCardValue(id) === chosenVal;
        }
        return getCardType(id) === chosenType;
      });

      if (matchingPartners.length > 0) {
        cardsToPlay = [chosenCard, matchingPartners[0]];
      }
    }

    const lastCard = cardsToPlay[cardsToPlay.length - 1];
    const cardType = getCardType(lastCard);
    let chosenColor = null;
    if (cardType === 'wild' || cardType === 'draw4') {
      const remainingHand = hand.filter(c => !cardsToPlay.includes(c));
      chosenColor = this.chooseColor(remainingHand, difficulty);
    }

    return {
      action: 'play',
      cardId: chosenCard,
      cards: cardsToPlay,
      chosenColor
    };
  }

  /**
   * Quyết định xem có đánh lá vừa rút lên bàn hay không
   */
  static decideDrawnPlay(drawnCard, topCard, activeColor, hand, difficulty = AI_DIFFICULTY.MEDIUM) {
    if (!isValidPlay(drawnCard, topCard, activeColor)) {
      return { play: false };
    }

    // Nếu là lá hợp lệ, Bot thông minh luôn đánh ngay để giảm bài trên tay
    if (difficulty === AI_DIFFICULTY.EASY && Math.random() < 0.2) {
      return { play: false }; // Dễ thỉnh thoảng giữ bài
    }

    const cardType = getCardType(drawnCard);
    let chosenColor = null;
    if (cardType === 'wild' || cardType === 'draw4') {
      chosenColor = this.chooseColor(hand, difficulty);
    }

    return { play: true, chosenColor };
  }

  /**
   * Kiểm tra Bot có nhớ bấm "Nói UNO!" khi còn 2 lá chuẩn bị đánh 1 lá không
   */
  static shouldCallUno(difficulty = AI_DIFFICULTY.MEDIUM) {
    const rate = difficulty === AI_DIFFICULTY.EASY ? 0.5 : difficulty === AI_DIFFICULTY.MEDIUM ? 0.85 : 1.0;
    return Math.random() < rate;
  }

  /**
   * Kiểm tra Bot có phản xạ bắt phạt UNO đối thủ khi có cơ hội không
   */
  static getCatchUnoReaction(difficulty = AI_DIFFICULTY.MEDIUM) {
    let rate = 0.2;
    let minDelay = 1800;
    let maxDelay = 2400;

    if (difficulty === AI_DIFFICULTY.MEDIUM) {
      rate = 0.7;
      minDelay = 1000;
      maxDelay = 1500;
    } else if (difficulty === AI_DIFFICULTY.HARD) {
      rate = 0.95;
      minDelay = 400;
      maxDelay = 800;
    }

    const willCatch = Math.random() < rate;
    const delay = Math.floor(minDelay + Math.random() * (maxDelay - minDelay));
    return { willCatch, delay };
  }
}
