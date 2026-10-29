import test from 'node:test';
import assert from 'node:assert/strict';
import {
  createDeck,
  shuffleDeck,
  getCardColor,
  getCardType,
  getCardValue,
  getCardScore,
  getCardDetails,
  isValidPlay,
  areCardsPairCompatible,
  canPlayCardsAsPair,
  sortCards,
  UnoGame
} from '../uno/engine.js';

test('createDeck creates exactly 108 standard UNO cards', () => {
  const deck = createDeck();
  assert.equal(deck.length, 108);

  // Check counts per color
  const colors = { red: 0, yellow: 0, green: 0, blue: 0, black: 0 };
  const types = { number: 0, skip: 0, reverse: 0, draw2: 0, wild: 0, draw4: 0 };

  for (const id of deck) {
    colors[getCardColor(id)]++;
    types[getCardType(id)]++;
  }

  // 25 cards of each color (19 numbers: 1 zero + 2 of each 1-9, plus 2 skips + 2 revs + 2 draw2)
  assert.equal(colors.red, 25);
  assert.equal(colors.yellow, 25);
  assert.equal(colors.green, 25);
  assert.equal(colors.blue, 25);
  // 8 black wild cards (4 Wild + 4 Wild Draw 4)
  assert.equal(colors.black, 8);

  assert.equal(types.wild, 4);
  assert.equal(types.draw4, 4);
  assert.equal(types.skip, 8); // 2 per color
  assert.equal(types.reverse, 8);
  assert.equal(types.draw2, 8);
  assert.equal(types.number, 76); // 108 - 8 - 24 = 76
});

test('card properties mapping and scoring', () => {
  // Red 0
  assert.equal(getCardColor(0), 'red');
  assert.equal(getCardType(0), 'number');
  assert.equal(getCardValue(0), 0);
  assert.equal(getCardScore(0), 0);

  // Red Skip (col 10, row 0)
  assert.equal(getCardColor(10), 'red');
  assert.equal(getCardType(10), 'skip');
  assert.equal(getCardValue(10), null);
  assert.equal(getCardScore(10), 20);

  // Yellow Reverse (col 11, row 1 -> ID 25)
  assert.equal(getCardColor(25), 'yellow');
  assert.equal(getCardType(25), 'reverse');
  assert.equal(getCardScore(25), 20);

  // Green Draw 2 (col 12, row 2 -> ID 40)
  assert.equal(getCardColor(40), 'green');
  assert.equal(getCardType(40), 'draw2');
  assert.equal(getCardScore(40), 20);

  // Wild (col 13, row 0 -> ID 13)
  assert.equal(getCardColor(13), 'black');
  assert.equal(getCardType(13), 'wild');
  assert.equal(getCardScore(13), 50);

  // Wild Draw 4 (col 13, row 4 -> ID 69 in 112-grid, row >= 4)
  const draw4Id = 13 + 14 * 4; // 69 in 112 grid
  assert.equal(getCardColor(draw4Id), 'black');
  assert.equal(getCardType(draw4Id), 'draw4');
  assert.equal(getCardScore(draw4Id), 50);

  const details = getCardDetails(0);
  assert.equal(details.spriteX, 1);
  assert.equal(details.spriteY, 1);
});

test('isValidPlay correctly checks play conditions', () => {
  // Red 5
  const red5 = 5;
  // Red 7
  const red7 = 7;
  // Blue 5
  const blue5 = 14 * 3 + 5; // 47
  // Green 9
  const green9 = 14 * 2 + 9; // 37
  // Wild
  const wild = 13;
  // Wild Draw 4
  const draw4 = 13 + 14 * 4;

  // Matching color (Red 7 on Red 5, activeColor 'red')
  assert.equal(isValidPlay(red7, red5, 'red'), true);

  // Matching number (Blue 5 on Red 5, activeColor 'red')
  assert.equal(isValidPlay(blue5, red5, 'red'), true);

  // Non-matching card (Green 9 on Red 5, activeColor 'red')
  assert.equal(isValidPlay(green9, red5, 'red'), false);

  // Wild and Draw 4 can always be played
  assert.equal(isValidPlay(wild, red5, 'red'), true);
  assert.equal(isValidPlay(draw4, red5, 'red'), true);

  // Matching action type (Blue Skip on Red Skip)
  const redSkip = 10;
  const blueSkip = 14 * 3 + 10;
  assert.equal(isValidPlay(blueSkip, redSkip, 'yellow'), true);
});

test('UnoGame deals 7 cards to each player and initializes state', () => {
  // Use a custom deck with standard number cards to verify 7-card deal without action card triggers
  const customDeck = [];
  for (let i = 0; i < 50; i++) customDeck.push(i % 10); // numbers 0-9
  const game = new UnoGame({
    players: [
      { id: 0, name: 'Alice' },
      { id: 1, name: 'Bob' },
      { id: 2, name: 'Charlie' }
    ],
    customDeck
  });

  assert.equal(game.players.length, 3);
  assert.equal(game.players[0].hand.length, 7);
  assert.equal(game.players[1].hand.length, 7);
  assert.equal(game.players[2].hand.length, 7);
  assert.equal(game.discardPile.length >= 1, true);
  assert.ok(['red', 'yellow', 'green', 'blue'].includes(game.activeColor));
  assert.equal(game.ended, false);
});

test('UnoGame handles 2-player Reverse rule (acts as Skip)', () => {
  // Controlled deck: Player 0 has a Red Reverse
  const redRev = 11;
  const game = new UnoGame({
    players: [{ id: 0, name: 'P1' }, { id: 1, name: 'P2' }]
  });

  // Setup state
  game.currentTurn = 0;
  game.direction = 1;
  game.activeColor = 'red';
  game.discardPile = [0]; // Red 0 on top
  game.players[0].hand = [redRev, 1]; // Reverse and Red 1

  const res = game.playCard(0, redRev);
  assert.equal(res.success, true);
  // In 2 players, Reverse skips P2, so P1 gets another turn!
  assert.equal(game.currentTurn, 0);
  assert.equal(game.players[0].hand.length, 1);
});

test('UnoGame handles Draw 2 effect and turn skipping', () => {
  const redDraw2 = 12;
  const game = new UnoGame({
    players: [{ id: 0, name: 'P1' }, { id: 1, name: 'P2' }, { id: 2, name: 'P3' }]
  });

  game.currentTurn = 0;
  game.direction = 1;
  game.activeColor = 'red';
  game.discardPile = [0];
  game.players[0].hand = [redDraw2, 1];
  const p2InitCount = game.players[1].hand.length;

  const res = game.playCard(0, redDraw2);
  assert.equal(res.success, true);
  // P2 drew 2 cards and was skipped
  assert.equal(game.players[1].hand.length, p2InitCount + 2);
  // Turn advances to P3 (index 2)
  assert.equal(game.currentTurn, 2);
});

test('UnoGame handles UNO calling and penalty catching', () => {
  const game = new UnoGame({
    players: [{ id: 0, name: 'Alice' }, { id: 1, name: 'Bob' }]
  });

  game.currentTurn = 0;
  game.activeColor = 'red';
  game.discardPile = [0];
  // Alice has 2 cards and plays 1 without calling UNO
  game.players[0].hand = [1, 2];

  const res1 = game.playCard(0, 1, null, false);
  assert.equal(res1.success, true);
  assert.equal(game.players[0].hand.length, 1);
  assert.equal(res1.unoPenaltyWindow, true);
  assert.equal(game.unoPenaltyWindow.playerId, 0);

  // Bob catches Alice's forgotten UNO!
  const catchRes = game.catchUno(1, 0);
  assert.equal(catchRes.caught, true);
  // Alice receives 2 penalty cards
  assert.equal(game.players[0].hand.length, 3);
  assert.equal(game.unoPenaltyWindow, null);
});

test('UnoGame detects victory and calculates winner score', () => {
  const game = new UnoGame({
    players: [{ id: 0, name: 'Winner' }, { id: 1, name: 'Loser' }]
  });

  game.currentTurn = 0;
  game.activeColor = 'red';
  game.discardPile = [0];
  game.players[0].hand = [1]; // Red 1
  // Loser has Wild (50) and Draw 2 (20) and Number 5 (5) = 75 points
  game.players[1].hand = [13, 12, 5];

  const res = game.playCard(0, 1, null, true);
  assert.equal(res.success, true);
  assert.equal(res.gameOver, true);
  assert.equal(game.ended, true);
  assert.equal(game.winner.id, 0);
  assert.equal(res.roundScore, 75);
});

test('UnoGame getStateForPlayer implements anti-cheat hand masking', () => {
  const game = new UnoGame({
    players: [{ id: 0, name: 'P1' }, { id: 1, name: 'P2' }]
  });

  const stateForP1 = game.getStateForPlayer(0);
  // P1 sees their own hand
  assert.ok(Array.isArray(stateForP1.players[0].hand));
  assert.equal(stateForP1.players[0].hand.length, game.players[0].hand.length);
  // P1 DOES NOT see P2's hand (anti-cheat: null)
  assert.equal(stateForP1.players[1].hand, null);
  assert.equal(stateForP1.players[1].cardCount, game.players[1].hand.length);
});

test('UnoGame recycles discard pile when draw pile is exhausted', () => {
  const game = new UnoGame({
    players: [{ id: 0, name: 'P1' }, { id: 1, name: 'P2' }]
  });

  // Empty draw pile and put 10 cards in discard pile
  game.drawPile = [];
  game.discardPile = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  assert.equal(game.drawPile.length, 0);

  // Trigger draw
  game.currentTurn = 0;
  const drawRes = game.drawCard(0);
  assert.equal(drawRes.success, true);

  // Top card remains on discard pile, rest recycled into draw pile
  assert.equal(game.discardPile.length, 1);
  assert.equal(game.discardPile[0], 10);
  assert.equal(game.drawPile.length > 0, true);
});

test('sortCards sorts cards by color or by value correctly', () => {
  // Red 4 (id 4), Blue 1 (id 14*3 + 1 = 43), Red 1 (id 1), Yellow 9 (id 14*1 + 9 = 23)
  const hand = [43, 4, 1, 23];

  // Sort by color: Red (1, 4) -> Yellow (23) -> Blue (43)
  const sortedColor = sortCards(hand, 'color');
  assert.deepEqual(sortedColor, [1, 4, 23, 43]);

  // Sort by value: 1s together (Red 1, Blue 1) -> 4 (Red 4) -> 9 (Yellow 9)
  const sortedValue = sortCards(hand, 'value');
  assert.equal(getCardValue(sortedValue[0]), 1);
  assert.equal(getCardValue(sortedValue[1]), 1);
  assert.equal(getCardValue(sortedValue[2]), 4);
  assert.equal(getCardValue(sortedValue[3]), 9);
});

test('areCardsPairCompatible and canPlayCardsAsPair detect valid pairs', () => {
  const red1 = 1;
  const blue1 = 14 * 3 + 1; // 43
  const green1 = 14 * 2 + 1; // 29
  const red4 = 4;
  const redSkip = 10;
  const blueSkip = 14 * 3 + 10;

  // Matching number pairs
  assert.equal(areCardsPairCompatible([red1, blue1]), true);
  assert.equal(areCardsPairCompatible([red1, blue1, green1]), true);
  assert.equal(areCardsPairCompatible([red1, red4]), false);

  // Matching action pairs
  assert.equal(areCardsPairCompatible([redSkip, blueSkip]), true);

  // Top card Red 7, activeColor 'red'
  const red7 = 7;
  // Red 1 + Blue 1: Red 1 is playable on Red 7, so the pair is valid!
  const pairCheck = canPlayCardsAsPair([blue1, red1], red7, 'red');
  assert.equal(pairCheck.valid, true);
  assert.equal(pairCheck.starterId, red1);

  // Non-matching card pair (e.g. Blue 9 + Green 9) onto Red 7: neither is Red or 7
  const blue9 = 14 * 3 + 9;
  const green9 = 14 * 2 + 9;
  const invalidPairCheck = canPlayCardsAsPair([blue9, green9], red7, 'red');
  assert.equal(invalidPairCheck.valid, false);
});

test('UnoGame.playCards allows playing pairs of numbers and action cards', () => {
  const game = new UnoGame({
    players: [{ id: 0, name: 'P1' }, { id: 1, name: 'P2' }, { id: 2, name: 'P3' }]
  });

  game.currentTurn = 0;
  game.activeColor = 'red';
  game.direction = 1;
  game.discardPile = [7]; // Red 7 on table

  const red1 = 1;
  const blue1 = 43; // 14*3 + 1
  game.players[0].hand = [red1, blue1, 4, 23];

  // Play pair of 1s
  const res = game.playCards(0, [red1, blue1]);
  assert.equal(res.success, true);
  // Hand reduced by 2 cards
  assert.equal(game.players[0].hand.length, 2);
  // Discard pile has top card blue1
  assert.equal(game.getTopCard(), blue1);
  assert.equal(game.activeColor, 'blue');
  // Next turn is P2 (index 1)
  assert.equal(game.currentTurn, 1);
});

test('UnoGame.playCards handles pair of Draw 2s (cumulative penalty)', () => {
  const game = new UnoGame({
    players: [{ id: 0, name: 'P1' }, { id: 1, name: 'P2' }, { id: 2, name: 'P3' }]
  });

  game.currentTurn = 0;
  game.activeColor = 'red';
  game.direction = 1;
  game.discardPile = [0]; // Red 0

  const redDraw2 = 12;
  const blueDraw2 = 14 * 3 + 12;
  game.players[0].hand = [redDraw2, blueDraw2, 5];
  const p2InitCount = game.players[1].hand.length;

  // Play pair of Draw 2s
  const res = game.playCards(0, [redDraw2, blueDraw2]);
  assert.equal(res.success, true);
  // P2 should receive 4 penalty cards (2 * 2) and be skipped
  assert.equal(game.players[1].hand.length, p2InitCount + 4);
  assert.equal(game.currentTurn, 2);
});

test('isValidPlay restricts other action cards when top card is (+ bài)', () => {
  const redDraw2 = 12; // Red Draw 2
  const blueDraw2 = 14 * 3 + 12; // Blue Draw 2
  const redSkip = 10; // Red Skip
  const redReverse = 11; // Red Reverse
  const wild = 13; // Wild
  const draw4 = 13 + 14 * 4; // Wild Draw 4
  const red3 = 3; // Red 3 (number)
  const blue3 = 14 * 3 + 3; // Blue 3 (number)

  // Top card is redDraw2, activeColor is 'red'
  // Same function is allowed:
  assert.equal(isValidPlay(blueDraw2, redDraw2, 'red'), true);
  assert.equal(isValidPlay(redDraw2, redDraw2, 'red'), true);

  // Same color number card is allowed:
  assert.equal(isValidPlay(red3, redDraw2, 'red'), true);
  // Different color number card is disallowed:
  assert.equal(isValidPlay(blue3, redDraw2, 'red'), false);

  // Other action cards are FORBIDDEN on (+ bài):
  assert.equal(isValidPlay(redSkip, redDraw2, 'red'), false);
  assert.equal(isValidPlay(redReverse, redDraw2, 'red'), false);
  assert.equal(isValidPlay(wild, redDraw2, 'red'), false);
  assert.equal(isValidPlay(draw4, redDraw2, 'red'), false);

  // Top card is Wild Draw 4, activeColor is 'yellow'
  const yellowSkip = 14 + 10;
  const yellowDraw2 = 14 + 12;
  const yellow5 = 14 + 5;
  const anotherDraw4 = 13 + 14 * 5;

  assert.equal(isValidPlay(anotherDraw4, draw4, 'yellow'), true);
  assert.equal(isValidPlay(yellow5, draw4, 'yellow'), true);
  assert.equal(isValidPlay(yellowSkip, draw4, 'yellow'), false);
  assert.equal(isValidPlay(yellowDraw2, draw4, 'yellow'), false);
  assert.equal(isValidPlay(wild, draw4, 'yellow'), false);
});

test('UnoGame.callUno clears penalty window for player holding 1 card', () => {
  const game = new UnoGame({
    players: [{ id: 0, name: 'P1' }, { id: 1, name: 'P2' }]
  });

  game.currentTurn = 0;
  game.activeColor = 'red';
  game.discardPile = [0]; // Red 0
  const red1 = 1;
  const red2 = 2;
  game.players[0].hand = [red1, red2];

  // P1 plays red1 without calling UNO beforehand (calledUno = false)
  const res = game.playCard(0, red1, null, false);
  assert.equal(res.success, true);
  assert.equal(game.players[0].hand.length, 1);
  // Penalty window should be open targeting P1
  assert.ok(game.unoPenaltyWindow);
  assert.equal(game.unoPenaltyWindow.playerId, 0);

  // P1 calls UNO before being caught
  const callRes = game.callUno(0);
  assert.equal(callRes.success, true);
  // Penalty window is cleared!
  assert.equal(game.unoPenaltyWindow, null);
  assert.equal(game.calledUnoPlayers.has(0), true);
});

