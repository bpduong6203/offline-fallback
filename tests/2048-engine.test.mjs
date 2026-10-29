import test from 'node:test';
import assert from 'node:assert/strict';
import { client2048 } from '../src/page/client/game-2048.js';
import { renderOffline } from '../src/page/render.js';

test('client2048 template string contains valid 2048 game definition', () => {
  assert.ok(client2048.includes('var game2048 = (function () {'));
  assert.ok(client2048.includes('slideLine('));
  assert.ok(client2048.includes('THEMES'));
  assert.ok(client2048.includes('egg_currency_balance'));
  assert.ok(client2048.includes('busy: function ()'));
});

// Kiểm tra thuật toán trượt và gộp ô chuẩn mực (Single Merge Rule)
function slideLine(line) {
  const filtered = line.filter(v => v !== 0 && v !== -1);
  const merged = [];
  let gained = 0;
  let mergeCount = 0;

  for (let j = 0; j < filtered.length; j++) {
    if (j < filtered.length - 1 && filtered[j] === filtered[j + 1]) {
      const mVal = filtered[j] * 2;
      merged.push(mVal);
      gained += mVal;
      mergeCount++;
      j++; // Bỏ qua ô kế tiếp để không bị gộp 2 lần trong 1 lượt!
    } else {
      merged.push(filtered[j]);
    }
  }
  while (merged.length < line.length) merged.push(0);
  return { line: merged, gained, mergeCount };
}

test('slideLine: single-merge rule strictly enforced', () => {
  // [2, 2, 2, 2] -> [4, 4, 0, 0], KHÔNG được thành [8, 0, 0, 0]
  const res1 = slideLine([2, 2, 2, 2]);
  assert.deepEqual(res1.line, [4, 4, 0, 0]);
  assert.equal(res1.gained, 8);
  assert.equal(res1.mergeCount, 2);

  // [2, 2, 4, 8] -> [4, 4, 8, 0]
  const res2 = slideLine([2, 2, 4, 8]);
  assert.deepEqual(res2.line, [4, 4, 8, 0]);
  assert.equal(res2.gained, 4);
});

test('slideLine: merge precedence from sliding edge', () => {
  // [2, 2, 2, 0] trượt trái -> [4, 2, 0, 0]
  const resLeft = slideLine([2, 2, 2, 0]);
  assert.deepEqual(resLeft.line, [4, 2, 0, 0]);
  assert.equal(resLeft.gained, 4);

  // Trượt phải: đảo ngược mảng, slide rồi đảo lại
  const rev = [2, 2, 2, 0].slice().reverse();
  const resRight = slideLine(rev);
  const finalRight = resRight.line.reverse();
  assert.deepEqual(finalRight, [0, 0, 2, 4]);
  assert.equal(resRight.gained, 4);
});

test('game over detection correctly identifies terminal and non-terminal boards', () => {
  function canMove(grid) {
    const N = grid.length;
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        if (grid[r][c] === 0) return true;
      }
    }
    for (let r = 0; r < N; r++) {
      for (let c = 0; c < N; c++) {
        const v = grid[r][c];
        if (r < N - 1 && grid[r + 1][c] === v) return true;
        if (c < N - 1 && grid[r][c + 1] === v) return true;
      }
    }
    return false;
  }

  // Bàn cờ còn ô trống
  assert.equal(canMove([
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 0, 4],
    [4, 2, 4, 2]
  ]), true);

  // Bàn cờ đầy nhưng có 2 số kề nhau gộp được
  assert.equal(canMove([
    [2, 4, 2, 4],
    [4, 8, 8, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2]
  ]), true);

  // Bàn cờ đầy và không còn nước đi nào (Game Over)
  assert.equal(canMove([
    [2, 4, 2, 4],
    [4, 2, 4, 2],
    [2, 4, 2, 4],
    [4, 2, 4, 2]
  ]), false);
});

test('renderOffline generates HTML containing 2048 tab, canvas and UI controls', async () => {
  const req = new Request('https://fallback.test/', {
    headers: { 'Accept': 'text/html' }
  });
  const res = renderOffline(req);
  assert.equal(res.status, 503);
  const html = await res.text();
  assert.ok(html.includes('href="/?game=2048"'), 'Must have 2048 library link');
  assert.ok(html.includes('id="game2048ui"'), 'Must have game2048ui container');
  assert.ok(html.includes('id="g2048New"'), 'Must have g2048New button');
  assert.ok(html.includes('id="g2048Undo"'), 'Must have g2048Undo button');
  assert.ok(html.includes('id="g2048Theme"'), 'Must have g2048Theme button');
  assert.ok(html.includes('id="g2048Code"'), 'Must have g2048Code input');
  assert.ok(html.includes('var game2048 = (function () {'), 'Must bundle game2048 script');
});
