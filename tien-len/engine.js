// Core Game Engine for Tiến Lên Miền Nam (TLMN)
// Pure deterministic logic, no DOM dependencies.

export const SUITS = {
  SPADE: 0,   // Bích ♠
  CLUB: 1,    // Chuồn / Tép ♣
  DIAMOND: 2, // Rô ♦
  HEART: 3    // Cơ ♥
};

export const SUIT_SYMBOLS = ['♠', '♣', '♦', '♥'];
export const SUIT_NAMES = ['Bích', 'Chuồn', 'Rô', 'Cơ'];

// Values: 3 to 15 (11=J, 12=Q, 13=K, 14=A, 15=2/Heo)
export const VALUES = {
  THREE: 3, FOUR: 4, FIVE: 5, SIX: 6, SEVEN: 7, EIGHT: 8,
  NINE: 9, TEN: 10, JACK: 11, QUEEN: 12, KING: 13, ACE: 14, TWO: 15
};

export const VALUE_LABELS = {
  3: '3', 4: '4', 5: '5', 6: '6', 7: '7', 8: '8', 9: '9', 10: '10',
  11: 'J', 12: 'Q', 13: 'K', 14: 'A', 15: '2'
};

export const COMBO_TYPE = {
  INVALID: 'INVALID',
  SINGLE: 'SINGLE',                   // Rác
  PAIR: 'PAIR',                       // Đôi
  TRIPLE: 'TRIPLE',                   // Sám cô
  STRAIGHT: 'STRAIGHT',               // Sảnh (3 lá trở lên, không chứa 2)
  THREE_CONSECUTIVE_PAIRS: '3_PAIRS', // 3 đôi thông
  FOUR_OF_A_KIND: 'FOUR_KIND',        // Tứ quý
  FOUR_CONSECUTIVE_PAIRS: '4_PAIRS'   // 4 đôi thông
};

export class Card {
  constructor(value, suit) {
    this.value = Number(value);
    this.suit = Number(suit);
    this.id = `${this.value}_${this.suit}`;
  }

  isRed() {
    return this.suit === SUITS.DIAMOND || this.suit === SUITS.HEART;
  }

  isTwo() {
    return this.value === VALUES.TWO;
  }

  compareTo(other) {
    if (this.value !== other.value) {
      return this.value - other.value;
    }
    return this.suit - other.suit;
  }

  toString() {
    return `${VALUE_LABELS[this.value]}${SUIT_SYMBOLS[this.suit]}`;
  }

  toJSON() {
    return { value: this.value, suit: this.suit, id: this.id };
  }

  static fromJSON(data) {
    return new Card(data.value, data.suit);
  }
}

// Generate standard 52-card deck
export function createDeck() {
  const deck = [];
  for (let v = 3; v <= 15; v++) {
    for (let s = 0; s < 4; s++) {
      deck.push(new Card(v, s));
    }
  }
  return deck;
}

// Fisher-Yates Shuffle
export function shuffleDeck(deck, rng = Math.random) {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Deal cards to n players (standard 13 cards each for 4 players)
export function dealCards(deck, numPlayers = 4) {
  const hands = Array.from({ length: numPlayers }, () => []);
  const count = Math.min(13, Math.floor(deck.length / numPlayers));
  for (let i = 0; i < count; i++) {
    for (let p = 0; p < numPlayers; p++) {
      hands[p].push(deck[i * numPlayers + p]);
    }
  }
  // Sort each hand by value, then suit
  hands.forEach(h => sortCards(h));
  return hands;
}

export function sortCards(cards) {
  return cards.sort((a, b) => a.compareTo(b));
}

// Identify Combination
export class Combination {
  constructor(type, cards, highestCard) {
    this.type = type;
    this.cards = cards;
    this.highestCard = highestCard || (cards.length > 0 ? sortCards([...cards])[cards.length - 1] : null);
  }

  toJSON() {
    return {
      type: this.type,
      cards: this.cards.map(c => c.toJSON()),
      highestCard: this.highestCard ? this.highestCard.toJSON() : null
    };
  }

  static fromJSON(data) {
    if (!data) return null;
    const cards = (data.cards || []).map(c => Card.fromJSON(c));
    const highest = data.highestCard ? Card.fromJSON(data.highestCard) : null;
    return new Combination(data.type, cards, highest);
  }
}

export function identifyCombination(cards) {
  if (!cards || cards.length === 0) {
    return new Combination(COMBO_TYPE.INVALID, []);
  }

  const sorted = sortCards([...cards]);
  const len = sorted.length;

  // 1. Single card
  if (len === 1) {
    return new Combination(COMBO_TYPE.SINGLE, sorted, sorted[0]);
  }

  // 2. Pair
  if (len === 2 && sorted[0].value === sorted[1].value) {
    return new Combination(COMBO_TYPE.PAIR, sorted, sorted[1]);
  }

  // 3. Triple (Sám cô)
  if (len === 3 && sorted[0].value === sorted[1].value && sorted[1].value === sorted[2].value) {
    return new Combination(COMBO_TYPE.TRIPLE, sorted, sorted[2]);
  }

  // 4. Four of a kind (Tứ quý)
  if (len === 4 &&
      sorted[0].value === sorted[1].value &&
      sorted[1].value === sorted[2].value &&
      sorted[2].value === sorted[3].value) {
    return new Combination(COMBO_TYPE.FOUR_OF_A_KIND, sorted, sorted[3]);
  }

  // 5. Straight (Sảnh: 3 to 12 cards, no 2 allowed)
  if (len >= 3 && len <= 12) {
    let isStraight = true;
    for (let i = 0; i < len - 1; i++) {
      if (sorted[i + 1].value - sorted[i].value !== 1) {
        isStraight = false;
        break;
      }
    }
    // 2 (value 15) is NEVER part of a straight in TLMN!
    if (isStraight && sorted[len - 1].value < VALUES.TWO) {
      return new Combination(COMBO_TYPE.STRAIGHT, sorted, sorted[len - 1]);
    }
  }

  // 6. Three Consecutive Pairs (3 Đôi Thông: 6 cards)
  if (len === 6) {
    if (sorted[0].value === sorted[1].value &&
        sorted[2].value === sorted[3].value &&
        sorted[4].value === sorted[5].value &&
        sorted[2].value - sorted[0].value === 1 &&
        sorted[4].value - sorted[2].value === 1 &&
        sorted[4].value < VALUES.TWO) {
      return new Combination(COMBO_TYPE.THREE_CONSECUTIVE_PAIRS, sorted, sorted[5]);
    }
  }

  // 7. Four Consecutive Pairs (4 Đôi Thông: 8 cards)
  if (len === 8) {
    if (sorted[0].value === sorted[1].value &&
        sorted[2].value === sorted[3].value &&
        sorted[4].value === sorted[5].value &&
        sorted[6].value === sorted[7].value &&
        sorted[2].value - sorted[0].value === 1 &&
        sorted[4].value - sorted[2].value === 1 &&
        sorted[6].value - sorted[4].value === 1 &&
        sorted[6].value < VALUES.TWO) {
      return new Combination(COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS, sorted, sorted[7]);
    }
  }

  return new Combination(COMBO_TYPE.INVALID, cards);
}

// Beating Rules: Can combo B beat combo A?
export function canBeat(prevCombo, nextCombo, isNewRound = false) {
  if (!nextCombo || nextCombo.type === COMBO_TYPE.INVALID) return false;
  if (isNewRound || !prevCombo) return true;

  // 1. Same combo types
  if (prevCombo.type === nextCombo.type) {
    if (prevCombo.type === COMBO_TYPE.STRAIGHT) {
      if (prevCombo.cards.length !== nextCombo.cards.length) return false;
    }
    return nextCombo.highestCard.compareTo(prevCombo.highestCard) > 0;
  }

  // 2. Chặt Single Two (1 Heo)
  if (prevCombo.type === COMBO_TYPE.SINGLE && prevCombo.cards[0].isTwo()) {
    return (
      nextCombo.type === COMBO_TYPE.THREE_CONSECUTIVE_PAIRS ||
      nextCombo.type === COMBO_TYPE.FOUR_OF_A_KIND ||
      nextCombo.type === COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS
    );
  }

  // 3. Chặt Pair of Twos (Đôi Heo)
  if (prevCombo.type === COMBO_TYPE.PAIR && prevCombo.cards[0].isTwo()) {
    return (
      nextCombo.type === COMBO_TYPE.FOUR_OF_A_KIND ||
      nextCombo.type === COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS
    );
  }

  // 4. Chặt 3 Đôi Thông
  if (prevCombo.type === COMBO_TYPE.THREE_CONSECUTIVE_PAIRS) {
    return (
      nextCombo.type === COMBO_TYPE.FOUR_OF_A_KIND ||
      nextCombo.type === COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS
    );
  }

  // 5. Chặt Tứ Quý
  if (prevCombo.type === COMBO_TYPE.FOUR_OF_A_KIND) {
    return nextCombo.type === COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS;
  }

  return false;
}

// 4 Đôi Thông can jump into the trick without having the current turn
export function isFreeJumpBeater(nextCombo, prevCombo) {
  if (!nextCombo || nextCombo.type !== COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS) return false;
  if (!prevCombo) return false;
  return canBeat(prevCombo, nextCombo, false);
}

// Instant Win (Tới Trắng)
export function checkInstantWin(hand) {
  if (!hand || hand.length !== 13) return null;
  const sorted = sortCards([...hand]);

  // 1. Dragon Straight (3 to A, or 3 to 2)
  let straightLen = 1;
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i + 1].value - sorted[i].value === 1) straightLen++;
  }
  if (straightLen >= 12 && sorted[0].value === VALUES.THREE) {
    return { type: 'DRAGON_STRAIGHT', name: 'Sảnh Rồng', priority: 1 };
  }

  // 2. Four Twos (Tứ quý 2)
  const twos = sorted.filter(c => c.isTwo());
  if (twos.length === 4) {
    return { type: 'FOUR_TWOS', name: 'Tứ Quý 2', priority: 2 };
  }

  // 3. 5 Consecutive Pairs (5 Đôi Thông)
  const pairValues = [];
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].value === sorted[i + 1].value) {
      if (!pairValues.includes(sorted[i].value)) {
        pairValues.push(sorted[i].value);
      }
      i++;
    }
  }
  if (pairValues.length >= 5) {
    // Check if 5 are consecutive
    for (let i = 0; i <= pairValues.length - 5; i++) {
      let consecutive = true;
      for (let j = 0; j < 4; j++) {
        if (pairValues[i + j + 1] - pairValues[i + j] !== 1) {
          consecutive = false;
          break;
        }
      }
      if (consecutive && pairValues[i + 4] < VALUES.TWO) {
        return { type: 'FIVE_PAIRS_CONSECUTIVE', name: '5 Đôi Thông', priority: 3 };
      }
    }
  }

  // 4. 6 Pairs of any kind (6 Đôi Bất Kỳ)
  if (pairValues.length >= 6) {
    return { type: 'SIX_PAIRS', name: '6 Đôi Bất Kỳ', priority: 4 };
  }

  // 5. Monochrome (Đồng màu: 12 hoặc 13 lá cùng đỏ hoặc cùng đen)
  const redCount = sorted.filter(c => c.isRed()).length;
  if (redCount >= 12 || redCount <= 1) {
    return { type: 'MONOCHROME', name: 'Đồng Màu (Đồng Chất)', priority: 5 };
  }

  return null;
}

// Find all valid candidate plays for a player given their hand and current board combo
export function findValidPlays(hand, prevCombo = null, isNewRound = true, mustIncludeCard = null) {
  const sorted = sortCards([...hand]);
  const results = [];

  const addIfValid = (cards) => {
    if (mustIncludeCard && !cards.some(c => c.id === mustIncludeCard.id)) return;
    const combo = identifyCombination(cards);
    if (combo.type !== COMBO_TYPE.INVALID && canBeat(prevCombo, combo, isNewRound)) {
      results.push(combo);
    }
  };

  // 1. Singles
  for (const c of sorted) {
    addIfValid([c]);
  }

  // 2. Pairs
  for (let i = 0; i < sorted.length - 1; i++) {
    for (let j = i + 1; j < sorted.length; j++) {
      if (sorted[i].value === sorted[j].value) {
        addIfValid([sorted[i], sorted[j]]);
      }
    }
  }

  // 3. Triples
  for (let i = 0; i < sorted.length - 2; i++) {
    if (sorted[i].value === sorted[i + 1].value && sorted[i].value === sorted[i + 2].value) {
      addIfValid([sorted[i], sorted[i + 1], sorted[i + 2]]);
    }
  }

  // 4. Four of a kind
  for (let i = 0; i < sorted.length - 3; i++) {
    if (sorted[i].value === sorted[i + 1].value &&
        sorted[i].value === sorted[i + 2].value &&
        sorted[i].value === sorted[i + 3].value) {
      addIfValid([sorted[i], sorted[i + 1], sorted[i + 2], sorted[i + 3]]);
    }
  }

  // 5. Straights (length 3 to 12)
  // Build value groups
  const valueMap = new Map();
  for (const c of sorted) {
    if (c.value < VALUES.TWO) {
      if (!valueMap.has(c.value)) valueMap.set(c.value, []);
      valueMap.get(c.value).push(c);
    }
  }

  const distinctValues = [...valueMap.keys()].sort((a, b) => a - b);
  for (let startIdx = 0; startIdx < distinctValues.length; startIdx++) {
    let currentStraightValues = [distinctValues[startIdx]];
    for (let nextIdx = startIdx + 1; nextIdx < distinctValues.length; nextIdx++) {
      if (distinctValues[nextIdx] === currentStraightValues[currentStraightValues.length - 1] + 1) {
        currentStraightValues.push(distinctValues[nextIdx]);
        if (currentStraightValues.length >= 3) {
          // Generate combinations for this length
          const candidates = getStraightCandidates(currentStraightValues, valueMap);
          for (const cand of candidates) {
            addIfValid(cand);
          }
        }
      } else {
        break;
      }
    }
  }

  // 6. 3 Pairs Consecutive
  const pairMap = new Map();
  for (let i = 0; i < sorted.length - 1; i++) {
    if (sorted[i].value === sorted[i + 1].value && sorted[i].value < VALUES.TWO) {
      if (!pairMap.has(sorted[i].value)) pairMap.set(sorted[i].value, []);
      pairMap.get(sorted[i].value).push([sorted[i], sorted[i + 1]]);
    }
  }

  const distinctPairValues = [...pairMap.keys()].sort((a, b) => a - b);
  for (let i = 0; i <= distinctPairValues.length - 3; i++) {
    if (distinctPairValues[i + 1] === distinctPairValues[i] + 1 &&
        distinctPairValues[i + 2] === distinctPairValues[i + 1] + 1) {
      const p1 = pairMap.get(distinctPairValues[i])[0];
      const p2 = pairMap.get(distinctPairValues[i + 1])[0];
      const p3 = pairMap.get(distinctPairValues[i + 2])[0];
      addIfValid([...p1, ...p2, ...p3]);
    }
  }

  // 7. 4 Pairs Consecutive
  for (let i = 0; i <= distinctPairValues.length - 4; i++) {
    if (distinctPairValues[i + 1] === distinctPairValues[i] + 1 &&
        distinctPairValues[i + 2] === distinctPairValues[i + 1] + 1 &&
        distinctPairValues[i + 3] === distinctPairValues[i + 2] + 1) {
      const p1 = pairMap.get(distinctPairValues[i])[0];
      const p2 = pairMap.get(distinctPairValues[i + 1])[0];
      const p3 = pairMap.get(distinctPairValues[i + 2])[0];
      const p4 = pairMap.get(distinctPairValues[i + 3])[0];
      addIfValid([...p1, ...p2, ...p3, ...p4]);
    }
  }

  return results;
}

function getStraightCandidates(values, valueMap) {
  // Return at least one or two representative combinations to keep candidate set efficient
  const res = [];
  // Highest cards version
  const highestVersion = values.map(v => {
    const arr = valueMap.get(v);
    return arr[arr.length - 1];
  });
  res.push(highestVersion);
  // Lowest cards version if different
  const lowestVersion = values.map(v => valueMap.get(v)[0]);
  if (lowestVersion.some((c, i) => c.id !== highestVersion[i].id)) {
    res.push(lowestVersion);
  }
  return res;
}

// Calculate Penalties (Thối heo, hàng, cóng)
export function calculatePenalties(remainingHand, betAmount = 1000) {
  let penalty = 0;
  const details = [];

  for (const c of remainingHand) {
    if (c.isTwo()) {
      if (c.isRed()) {
        penalty += betAmount * 1.0;
        details.push(`Thối Heo Đỏ (${c.toString()})`);
      } else {
        penalty += betAmount * 0.5;
        details.push(`Thối Heo Đen (${c.toString()})`);
      }
    }
  }

  // Check Tứ quý
  const counts = {};
  for (const c of remainingHand) {
    counts[c.value] = (counts[c.value] || 0) + 1;
    if (counts[c.value] === 4) {
      penalty += betAmount * 1.5;
      details.push(`Thối Tứ Quý (${VALUE_LABELS[c.value]})`);
    }
  }

  return { penalty, details };
}
