import test from 'node:test';
import assert from 'node:assert/strict';
import { UnoRoomEngine } from '../src/uno-room-engine.js';
import { UnoAI, AI_DIFFICULTY } from '../uno/ai.js';
import { isValidPlay, getCardColor, getCardType } from '../uno/engine.js';

test('UnoAI chooses valid card matching top card or dominant color', () => {
  // Top card: Red 5 (id 5), activeColor: 'red'
  const hand = [
    14 * 1 + 2, // Yellow 2
    14 * 2 + 3, // Green 3
    14 * 0 + 8, // Red 8 (valid matching color)
    14 * 3 + 5  // Blue 5 (valid matching number)
  ];

  const moveEasy = UnoAI.decideMove(hand, 5, 'red', {}, AI_DIFFICULTY.EASY);
  assert.equal(moveEasy.action, 'play');
  assert.ok(isValidPlay(moveEasy.cardId, 5, 'red'));

  const dominant = UnoAI.getDominantColor(hand);
  assert.ok(['yellow', 'green', 'red', 'blue'].includes(dominant));

  const chosenColor = UnoAI.chooseColor(hand, AI_DIFFICULTY.MEDIUM);
  assert.ok(['red', 'yellow', 'green', 'blue'].includes(chosenColor));
});

test('UnoAI draws when no valid card in hand', () => {
  // Top card: Red 0, activeColor: 'red'
  const hand = [
    14 * 1 + 2, // Yellow 2
    14 * 2 + 3, // Green 3
    14 * 3 + 7  // Blue 7
  ];

  const move = UnoAI.decideMove(hand, 0, 'red', {}, AI_DIFFICULTY.MEDIUM);
  assert.equal(move.action, 'draw');
});

test('UnoRoomEngine: joins, host assignment, and max 4 player enforcement', () => {
  const engine = new UnoRoomEngine();
  const msgs0 = [];
  const msgs1 = [];
  const msgs2 = [];
  const msgs3 = [];

  const id0 = engine.join('Player 1', m => msgs0.push(m));
  const id1 = engine.join('Player 2', m => msgs1.push(m));
  const id2 = engine.join('Player 3', m => msgs2.push(m));
  const id3 = engine.join('Player 4', m => msgs3.push(m));

  assert.equal(id0, 0);
  assert.equal(id1, 1);
  assert.equal(id2, 2);
  assert.equal(id3, 3);
  assert.equal(engine.host, 0);

  // 5th player should be rejected
  assert.throws(() => {
    engine.join('Player 5', () => {});
  }, /Phòng đã đủ 4 người/);
});

test('UnoRoomEngine: add and remove bots', () => {
  const engine = new UnoRoomEngine();
  const msgs = [];
  engine.join('Host', m => msgs.push(m));

  engine.addBot('medium');
  engine.addBot('hard');
  assert.equal(engine.bots.size, 2);

  // Remove first bot (slot 1)
  engine.removeBot(1);
  assert.equal(engine.bots.size, 1);
});

test('UnoRoomEngine: host migration on leave', () => {
  const engine = new UnoRoomEngine();
  const msgs0 = [];
  const msgs1 = [];

  engine.join('P1', m => msgs0.push(m));
  engine.join('P2', m => msgs1.push(m));
  assert.equal(engine.host, 0);

  engine.leave(0);
  assert.equal(engine.host, 1);
});

test('UnoRoomEngine: starts game and broadcasts masked state (Anti-Cheat)', () => {
  const engine = new UnoRoomEngine();
  let stateForP1 = null;
  let stateForP2 = null;

  engine.join('Alice', m => {
    if (m.t === 'state') stateForP1 = m;
  });
  engine.join('Bob', m => {
    if (m.t === 'state') stateForP2 = m;
  });

  // Non-host cannot start
  assert.throws(() => {
    engine.start(1);
  }, /Chỉ có chủ phòng/);

  // Host starts game
  engine.start(0);

  assert.ok(stateForP1);
  assert.ok(stateForP2);

  // Alice sees Alice's cards, but NOT Bob's cards (masked to null)
  assert.ok(Array.isArray(stateForP1.players[0].hand));
  assert.equal(stateForP1.players[1].hand, null);
  assert.equal(stateForP1.players[1].cardCount, 7);

  // Bob sees Bob's cards, but NOT Alice's cards (masked to null)
  assert.ok(Array.isArray(stateForP2.players[1].hand));
  assert.equal(stateForP2.players[0].hand, null);
  assert.equal(stateForP2.players[0].cardCount, 7);

  // Discard pile & activeColor are populated
  assert.ok(stateForP1.topCard != null);
  assert.ok(['red', 'yellow', 'green', 'blue'].includes(stateForP1.activeColor));

  engine.clearTimers();
});
