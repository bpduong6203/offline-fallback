import test from 'node:test';
import assert from 'node:assert/strict';
import {
  Card, SUITS, VALUES, COMBO_TYPE,
  createDeck, shuffleDeck, dealCards, sortCards,
  identifyCombination, canBeat, isFreeJumpBeater,
  checkInstantWin, findValidPlays, calculatePenalties
} from '../tien-len/engine.js';

test('card hierarchy and comparisons', () => {
  const threeSpade = new Card(VALUES.THREE, SUITS.SPADE);
  const threeHeart = new Card(VALUES.THREE, SUITS.HEART);
  const twoSpade = new Card(VALUES.TWO, SUITS.SPADE);
  const twoHeart = new Card(VALUES.TWO, SUITS.HEART);

  assert.equal(threeSpade.compareTo(threeHeart) < 0, true);
  assert.equal(threeHeart.compareTo(twoSpade) < 0, true);
  assert.equal(twoSpade.compareTo(twoHeart) < 0, true);
  assert.equal(twoHeart.isRed(), true);
  assert.equal(twoSpade.isRed(), false);
  assert.equal(twoHeart.isTwo(), true);
});

test('deck generation and dealing', () => {
  const deck = createDeck();
  assert.equal(deck.length, 52);

  const shuffled = shuffleDeck(deck);
  assert.equal(shuffled.length, 52);

  const hands = dealCards(shuffled, 4);
  assert.equal(hands.length, 4);
  hands.forEach(hand => assert.equal(hand.length, 13));
});

test('identify valid combinations', () => {
  // Single
  const single = identifyCombination([new Card(VALUES.SEVEN, SUITS.DIAMOND)]);
  assert.equal(single.type, COMBO_TYPE.SINGLE);

  // Pair
  const pair = identifyCombination([
    new Card(VALUES.NINE, SUITS.SPADE),
    new Card(VALUES.NINE, SUITS.HEART)
  ]);
  assert.equal(pair.type, COMBO_TYPE.PAIR);

  // Triple
  const triple = identifyCombination([
    new Card(VALUES.JACK, SUITS.SPADE),
    new Card(VALUES.JACK, SUITS.CLUB),
    new Card(VALUES.JACK, SUITS.HEART)
  ]);
  assert.equal(triple.type, COMBO_TYPE.TRIPLE);

  // Four of a kind
  const quad = identifyCombination([
    new Card(VALUES.ACE, SUITS.SPADE),
    new Card(VALUES.ACE, SUITS.CLUB),
    new Card(VALUES.ACE, SUITS.DIAMOND),
    new Card(VALUES.ACE, SUITS.HEART)
  ]);
  assert.equal(quad.type, COMBO_TYPE.FOUR_OF_A_KIND);

  // Straight (Sảnh 3-4-5-6-7)
  const straight = identifyCombination([
    new Card(VALUES.THREE, SUITS.SPADE),
    new Card(VALUES.FOUR, SUITS.CLUB),
    new Card(VALUES.FIVE, SUITS.DIAMOND),
    new Card(VALUES.SIX, SUITS.HEART),
    new Card(VALUES.SEVEN, SUITS.SPADE)
  ]);
  assert.equal(straight.type, COMBO_TYPE.STRAIGHT);

  // Invalid straight: Contains 2 (Heo)! (A-2-3 or K-A-2 is INVALID in TLMN)
  const invalidStraight = identifyCombination([
    new Card(VALUES.KING, SUITS.HEART),
    new Card(VALUES.ACE, SUITS.DIAMOND),
    new Card(VALUES.TWO, SUITS.CLUB)
  ]);
  assert.equal(invalidStraight.type, COMBO_TYPE.INVALID);

  // 3 Consecutive Pairs (3 Đôi Thông: 7-8-9)
  const threePairs = identifyCombination([
    new Card(VALUES.SEVEN, SUITS.SPADE),
    new Card(VALUES.SEVEN, SUITS.HEART),
    new Card(VALUES.EIGHT, SUITS.CLUB),
    new Card(VALUES.EIGHT, SUITS.DIAMOND),
    new Card(VALUES.NINE, SUITS.SPADE),
    new Card(VALUES.NINE, SUITS.CLUB)
  ]);
  assert.equal(threePairs.type, COMBO_TYPE.THREE_CONSECUTIVE_PAIRS);

  // 4 Consecutive Pairs (4 Đôi Thông: 10-J-Q-K)
  const fourPairs = identifyCombination([
    new Card(VALUES.TEN, SUITS.SPADE),
    new Card(VALUES.TEN, SUITS.HEART),
    new Card(VALUES.JACK, SUITS.CLUB),
    new Card(VALUES.JACK, SUITS.DIAMOND),
    new Card(VALUES.QUEEN, SUITS.SPADE),
    new Card(VALUES.QUEEN, SUITS.CLUB),
    new Card(VALUES.KING, SUITS.DIAMOND),
    new Card(VALUES.KING, SUITS.HEART)
  ]);
  assert.equal(fourPairs.type, COMBO_TYPE.FOUR_CONSECUTIVE_PAIRS);
});

test('beating rules (chặt bài thông thường và chặt heo)', () => {
  // Single beat
  const single7 = identifyCombination([new Card(VALUES.SEVEN, SUITS.SPADE)]);
  const single8 = identifyCombination([new Card(VALUES.EIGHT, SUITS.SPADE)]);
  assert.equal(canBeat(single7, single8), true);
  assert.equal(canBeat(single8, single7), false);

  // Heo cơ
  const twoHeart = identifyCombination([new Card(VALUES.TWO, SUITS.HEART)]);
  const twoSpade = identifyCombination([new Card(VALUES.TWO, SUITS.SPADE)]);
  assert.equal(canBeat(twoSpade, twoHeart), true);
  assert.equal(canBeat(twoHeart, twoSpade), false);

  // Chặt 1 Heo bằng 3 đôi thông
  const threePairs = identifyCombination([
    new Card(VALUES.FOUR, SUITS.SPADE), new Card(VALUES.FOUR, SUITS.HEART),
    new Card(VALUES.FIVE, SUITS.CLUB), new Card(VALUES.FIVE, SUITS.DIAMOND),
    new Card(VALUES.SIX, SUITS.SPADE), new Card(VALUES.SIX, SUITS.CLUB)
  ]);
  assert.equal(canBeat(twoHeart, threePairs), true);

  // Chặt 1 Heo bằng Tứ quý
  const quad9 = identifyCombination([
    new Card(VALUES.NINE, SUITS.SPADE), new Card(VALUES.NINE, SUITS.CLUB),
    new Card(VALUES.NINE, SUITS.DIAMOND), new Card(VALUES.NINE, SUITS.HEART)
  ]);
  assert.equal(canBeat(twoHeart, quad9), true);

  // Chặt đôi Heo bằng Tứ quý
  const pairTwos = identifyCombination([
    new Card(VALUES.TWO, SUITS.SPADE), new Card(VALUES.TWO, SUITS.CLUB)
  ]);
  assert.equal(canBeat(pairTwos, quad9), true);
  // 3 đôi thông KHÔNG chặt được đôi Heo!
  assert.equal(canBeat(pairTwos, threePairs), false);

  // Chặt 3 đôi thông bằng Tứ quý
  assert.equal(canBeat(threePairs, quad9), true);

  // 4 đôi thông chặt Tứ quý & có thể nhảy vòng
  const fourPairs = identifyCombination([
    new Card(VALUES.SEVEN, SUITS.SPADE), new Card(VALUES.SEVEN, SUITS.HEART),
    new Card(VALUES.EIGHT, SUITS.CLUB), new Card(VALUES.EIGHT, SUITS.DIAMOND),
    new Card(VALUES.NINE, SUITS.SPADE), new Card(VALUES.NINE, SUITS.CLUB),
    new Card(VALUES.TEN, SUITS.SPADE), new Card(VALUES.TEN, SUITS.HEART)
  ]);
  assert.equal(canBeat(quad9, fourPairs), true);
  assert.equal(isFreeJumpBeater(fourPairs, quad9), true);
  assert.equal(isFreeJumpBeater(fourPairs, pairTwos), true);
});

test('instant win (tới trắng)', () => {
  // 1. Dragon straight (3..A)
  const dragon = [];
  for (let v = VALUES.THREE; v <= VALUES.ACE; v++) {
    dragon.push(new Card(v, SUITS.SPADE));
  }
  dragon.push(new Card(VALUES.TWO, SUITS.HEART));
  const winDragon = checkInstantWin(dragon);
  assert.equal(winDragon !== null, true);
  assert.equal(winDragon.type, 'DRAGON_STRAIGHT');

  // 2. Four Twos
  const fourTwos = [
    new Card(VALUES.TWO, SUITS.SPADE), new Card(VALUES.TWO, SUITS.CLUB),
    new Card(VALUES.TWO, SUITS.DIAMOND), new Card(VALUES.TWO, SUITS.HEART),
    new Card(VALUES.THREE, SUITS.SPADE), new Card(VALUES.FOUR, SUITS.SPADE),
    new Card(VALUES.FIVE, SUITS.SPADE), new Card(VALUES.SIX, SUITS.SPADE),
    new Card(VALUES.SEVEN, SUITS.SPADE), new Card(VALUES.EIGHT, SUITS.SPADE),
    new Card(VALUES.NINE, SUITS.SPADE), new Card(VALUES.TEN, SUITS.SPADE),
    new Card(VALUES.JACK, SUITS.SPADE)
  ];
  const winTwos = checkInstantWin(fourTwos);
  assert.equal(winTwos !== null, true);
  assert.equal(winTwos.type, 'FOUR_TWOS');
});

test('finding valid plays and penalties', () => {
  const hand = [
    new Card(VALUES.THREE, SUITS.SPADE),
    new Card(VALUES.THREE, SUITS.HEART),
    new Card(VALUES.FOUR, SUITS.SPADE),
    new Card(VALUES.FOUR, SUITS.DIAMOND),
    new Card(VALUES.FIVE, SUITS.SPADE),
    new Card(VALUES.FIVE, SUITS.HEART),
    new Card(VALUES.TWO, SUITS.HEART)
  ];

  const plays = findValidPlays(hand, null, true);
  assert.equal(plays.length > 0, true);

  // Must include 3 Bích for first turn
  const mustPlayThreeSpade = findValidPlays(hand, null, true, new Card(VALUES.THREE, SUITS.SPADE));
  assert.equal(mustPlayThreeSpade.length > 0, true);
  mustPlayThreeSpade.forEach(p => {
    assert.equal(p.cards.some(c => c.value === VALUES.THREE && c.suit === SUITS.SPADE), true);
  });

  // Penalties
  const penalty = calculatePenalties([new Card(VALUES.TWO, SUITS.HEART), new Card(VALUES.TWO, SUITS.SPADE)], 1000);
  assert.equal(penalty.penalty, 1500); // 1000 for Red Two, 500 for Black Two
});
