import test from 'node:test';
import assert from 'node:assert/strict';
import { TienLenRoomEngine } from '../src/tienlen-room-engine.js';

test('TienLen room: join, max 4 players, host assignment and lobby', () => {
  const engine = new TienLenRoomEngine();
  const messagesP1 = [];
  const messagesP2 = [];

  const id1 = engine.join('Player 1', msg => messagesP1.push(msg));
  assert.equal(id1, 0);
  assert.equal(engine.host, 0);

  const id2 = engine.join('Player 2', msg => messagesP2.push(msg));
  assert.equal(id2, 1);
  assert.equal(engine.peers.size, 2);

  // 3rd and 4th
  engine.join('Player 3', () => {});
  engine.join('Player 4', () => {});
  assert.equal(engine.peers.size, 4);

  // 5th rejected
  assert.throws(() => {
    engine.join('Player 5', () => {});
  }, /Phòng đã đủ 4 người/);
});

test('TienLen room: start game deals cards and enforces anti-cheat', () => {
  const engine = new TienLenRoomEngine();
  const p1Msgs = [];
  const p2Msgs = [];

  const id1 = engine.join('Alice', msg => p1Msgs.push(msg));
  const id2 = engine.join('Bob', msg => p2Msgs.push(msg));

  // Host starts match
  engine.handle(id1, { t: 'start' });
  assert.equal(!!engine.game, true);
  assert.equal(engine.game.players.length, 4);

  // Find latest state msg for each player
  const p1State = p1Msgs.filter(m => m.t === 'state').pop();
  const p2State = p2Msgs.filter(m => m.t === 'state').pop();

  assert.equal(!!p1State, true);
  assert.equal(!!p2State, true);

  // P1 should see their own hand (13 cards), but Bob's hand must be NULL
  const p1Alice = p1State.state.players.find(p => p.id === id1);
  const p1Bob = p1State.state.players.find(p => p.id === id2);
  assert.equal(p1Alice.hand.length, 13);
  assert.equal(p1Bob.hand, null);
  assert.equal(p1Bob.cardCount, 13);

  // Vice versa for Bob
  const p2Bob = p2State.state.players.find(p => p.id === id2);
  const p2Alice = p2State.state.players.find(p => p.id === id1);
  assert.equal(p2Bob.hand.length, 13);
  assert.equal(p2Alice.hand, null);
});

test('TienLen room: playing cards, passing and round advancement', () => {
  const engine = new TienLenRoomEngine();
  const p1Msgs = [];
  const p2Msgs = [];

  const id1 = engine.join('P1', msg => p1Msgs.push(msg));
  const id2 = engine.join('P2', msg => p2Msgs.push(msg));
  const id3 = engine.join('P3', () => {});
  const id4 = engine.join('P4', () => {});

  engine.handle(id1, { t: 'start' });
  if (engine.game.ended) {
    engine.game.ended = false;
  }

  const activeTurn = engine.game.currentTurn;
  const activePlayer = engine.game.players[activeTurn];

  // Try to play with wrong turn (not activeTurn)
  const wrongId = (activeTurn + 1) % 4;
  engine.handle(wrongId, { t: 'play', cardIds: ['some_card'] });
  assert.equal(engine.game.currentCombo, null); // Nothing played

  // Active player plays smallest single card
  const cardToPlay = activePlayer.hand[0];
  engine.handle(activeTurn, { t: 'play', cardIds: [cardToPlay.id] });

  // Combo should now be on the board
  assert.equal(!!engine.game.currentCombo, true);
  assert.equal(engine.game.currentCombo.cards.length, 1);
  assert.equal(activePlayer.cardCount, 12);
});

test('TienLen room: human starter with 3 of Spades and opening trick validation', () => {
  const engine = new TienLenRoomEngine();
  const p1Msgs = [];
  const p2Msgs = [];

  const id1 = engine.join('Player 1', msg => p1Msgs.push(msg));
  const id2 = engine.join('Player 2', msg => p2Msgs.push(msg));

  engine.handle(id1, { t: 'start' });
  if (engine.game.ended) {
    engine.game.ended = false;
  }

  // 1. One of the humans MUST have the first turn and hold 3 of Spades
  const starterId = engine.game.currentTurn;
  assert.ok(starterId === id1 || starterId === id2, 'Starter must be a human player');

  const starter = engine.game.players[starterId];
  const has3S = starter.hand.some(c => c.value === 3 && c.suit === 0);
  assert.equal(has3S, true, 'Starter must hold 3 of Spades');
  assert.equal(engine.game.isFirstTrick, true);
  assert.ok(engine.game.mustIncludeCard);

  // 2. Starter attempts to play a card without 3 of Spades -> rejected with error
  const cardWithout3S = starter.hand.find(c => !(c.value === 3 && c.suit === 0));
  const msgs = starterId === id1 ? p1Msgs : p2Msgs;
  const initialMsgCount = msgs.length;

  engine.handle(starterId, { t: 'play', cardIds: [cardWithout3S.id] });
  assert.equal(engine.game.currentCombo, null, 'Play without 3 of Spades must be rejected');
  const lastErr = msgs[msgs.length - 1];
  assert.equal(lastErr.t, 'error');
  assert.ok(lastErr.message.includes('Lượt đầu tiên bắt buộc'));

  // 3. Starter plays 3 of Spades -> accepted!
  const card3S = starter.hand.find(c => c.value === 3 && c.suit === 0);
  engine.handle(starterId, { t: 'play', cardIds: [card3S.id] });
  assert.ok(engine.game.currentCombo, 'Valid play with 3 of Spades must be accepted');
  assert.equal(engine.game.isFirstTrick, false);
  assert.equal(engine.game.mustIncludeCard, null);
  assert.equal(starter.cardCount, 12);
});

test('TienLen room: host migration on leave', () => {
  const engine = new TienLenRoomEngine();
  const id1 = engine.join('H1', () => {});
  const id2 = engine.join('H2', () => {});
  assert.equal(engine.host, id1);

  engine.leave(id1);
  assert.equal(engine.host, id2);
});

