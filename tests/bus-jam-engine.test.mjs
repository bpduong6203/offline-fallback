import test from 'node:test';
import assert from 'node:assert/strict';
import {
  COLORS,
  MAX_BAYS,
  DEFAULT_BUS_CAPACITY,
  canBusExit,
  processQueue,
  checkGameStatus,
  createGameState,
  moveBusToBay
} from '../src/bus-jam/engine.js';
import { LEVELS } from '../src/bus-jam/levels.js';

test('1. Kiểm tra va chạm lối ra (canBusExit)', () => {
  const busU = { id: 'test_u', x: 2, y: 2, width: 1, height: 2, direction: 'U', color: 'RED' };
  const blocker = { id: 'blocker', x: 2, y: 0, width: 1, height: 1, direction: 'L', color: 'BLUE' };

  // Đặt 1 xe hướng U tại (2, 2) và 1 xe khác nằm tại (2, 0). Xác nhận canBusExit trả về false.
  assert.equal(canBusExit(busU, [busU, blocker]), false, 'Xe phải bị chặn khi có vật cản phía trước');

  // Xóa xe tại (2, 0). Xác nhận canBusExit trả về true.
  assert.equal(canBusExit(busU, [busU]), true, 'Xe phải thoát được khi đường đi thông thoáng');

  // Kiểm tra các hướng khác: D, L, R
  const busD = { id: 'test_d', x: 3, y: 2, width: 1, height: 2, direction: 'D', color: 'GREEN' };
  const blockerD = { id: 'blocker_d', x: 3, y: 5, width: 1, height: 1, direction: 'U', color: 'YELLOW' };
  assert.equal(canBusExit(busD, [busD, blockerD], 6, 6), false);
  assert.equal(canBusExit(busD, [busD], 6, 6), true);

  const busL = { id: 'test_l', x: 2, y: 3, width: 2, height: 1, direction: 'L', color: 'YELLOW' };
  const blockerL = { id: 'blocker_l', x: 0, y: 3, width: 1, height: 1, direction: 'U', color: 'PURPLE' };
  assert.equal(canBusExit(busL, [busL, blockerL], 6, 6), false);
  assert.equal(canBusExit(busL, [busL], 6, 6), true);

  const busR = { id: 'test_r', x: 1, y: 4, width: 2, height: 1, direction: 'R', color: 'PURPLE' };
  const blockerR = { id: 'blocker_r', x: 4, y: 4, width: 1, height: 1, direction: 'U', color: 'RED' };
  assert.equal(canBusExit(busR, [busR, blockerR], 6, 6), false);
  assert.equal(canBusExit(busR, [busR], 6, 6), true);
});

test('2. Kiểm tra điều kiện khách lên xe (processQueue)', () => {
  const redBus = { id: 'b_red', color: 'RED', capacity: 3, seated: 0 };
  const state = {
    bays: [redBus],
    queue: ['RED', 'RED', 'BLUE'],
    completedBuses: []
  };

  const changed = processQueue(state);

  assert.equal(changed, true);
  assert.equal(redBus.seated, 2, 'Xe RED phải có seated === 2');
  assert.deepEqual(state.queue, ['BLUE'], "Queue còn lại ['BLUE']");
  assert.equal(state.bays.length, 1, 'Xe RED vẫn ở trong bays vì chưa đầy 3/3');
});

test('3. Kiểm tra giải phóng xe khi đủ chỗ (processQueue complete)', () => {
  const redBus = { id: 'b_red', color: 'RED', capacity: 3, seated: 0 };
  const state = {
    bays: [redBus],
    queue: ['RED', 'RED', 'RED', 'GREEN'],
    completedBuses: []
  };

  const changed = processQueue(state);

  assert.equal(changed, true);
  assert.equal(state.bays.length, 0, 'Xe đầy 3/3 phải được đưa ra khỏi bays');
  assert.equal(state.completedBuses.length, 1, 'Xe đầy được chuyển vào completedBuses');
  assert.equal(state.completedBuses[0].id, 'b_red');
  assert.equal(state.completedBuses[0].seated, 3);
  assert.deepEqual(state.queue, ['GREEN'], "Queue còn lại ['GREEN']");
});

test('4. Kiểm tra Game Over (checkGameStatus)', () => {
  const state = {
    maxBays: 4,
    buses: [],
    bays: [
      { id: 'b1', color: 'BLUE', capacity: 3, seated: 1 },
      { id: 'b2', color: 'GREEN', capacity: 3, seated: 2 },
      { id: 'b3', color: 'BLUE', capacity: 3, seated: 0 },
      { id: 'b4', color: 'GREEN', capacity: 3, seated: 1 }
    ],
    queue: ['RED', 'BLUE'],
    completedBuses: []
  };

  const status = checkGameStatus(state);

  assert.equal(status.isGameOver, true, 'isGameOver phải là true khi hết slot và khách đầu không khớp');
  assert.equal(state.isGameOver, true, 'state.isGameOver được cập nhật');
  assert.equal(status.isWon, false);
});

test('5. Kiểm tra điều kiện Thắng (checkGameStatus win)', () => {
  const state = {
    maxBays: 4,
    buses: [],
    bays: [],
    queue: [],
    completedBuses: [{ id: 'b1', seated: 3, capacity: 3 }]
  };

  const status = checkGameStatus(state);
  assert.equal(status.isWon, true, 'isWon phải là true khi hết khách, hết xe trong bays và parking lot');
  assert.equal(status.isGameOver, false);
});

test('6. Kiểm tra moveBusToBay và tạo game từ level', () => {
  const level1 = LEVELS[0];
  const state = createGameState(level1);

  assert.equal(state.buses.length, 3);
  assert.equal(state.queue.length, 9);
  assert.equal(state.bays.length, 0);

  // b1 (RED) có thể thoát được
  const res1 = moveBusToBay(state, 'b1');
  assert.equal(res1.success, true);
  // Vì b1 là RED và 3 khách đầu là RED, b1 sẽ đón 3 khách và rời bay ngay!
  assert.equal(state.completedBuses.length, 1);
  assert.equal(state.bays.length, 0);
  assert.equal(state.queue.length, 6);

  // Đưa b2 (BLUE) ra
  const res2 = moveBusToBay(state, 'b2');
  assert.equal(res2.success, true);
  assert.equal(state.completedBuses.length, 2);
  assert.equal(state.queue.length, 3);

  // Đưa b3 (YELLOW) ra
  const res3 = moveBusToBay(state, 'b3');
  assert.equal(res3.success, true);
  assert.equal(state.completedBuses.length, 3);
  assert.equal(state.queue.length, 0);
  assert.equal(state.isWon, true, 'Hoàn thành Level 1 phải thắng');
});

test('7. Kiểm tra tính toàn vẹn của danh sách Levels', () => {
  assert.ok(LEVELS.length >= 3, 'Tối thiểu 3 màn chơi');
  for (const lvl of LEVELS) {
    assert.ok(lvl.id, 'Level phải có id');
    assert.ok(lvl.name, 'Level phải có name');
    assert.ok(lvl.buses.length > 0, 'Level phải có buses');
    assert.ok(lvl.passengers.length > 0, 'Level phải có passengers');

    const totalCapacity = lvl.buses.reduce((sum, b) => sum + (b.capacity || DEFAULT_BUS_CAPACITY), 0);
    assert.equal(
      totalCapacity,
      lvl.passengers.length,
      `Tổng sức chứa của xe (${totalCapacity}) phải bằng số hành khách (${lvl.passengers.length}) trong màn ${lvl.id}`
    );

    // Kiểm tra màu sắc hành khách phải có xe tương ứng
    const busColors = new Set(lvl.buses.map(b => b.color));
    for (const pColor of lvl.passengers) {
      assert.ok(busColors.has(pColor), `Màu ${pColor} phải có xe tương ứng trong màn ${lvl.id}`);
      assert.ok(COLORS[pColor], `Màu ${pColor} phải có trong COLORS`);
    }
  }
});
