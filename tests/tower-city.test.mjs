import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

test('Tower City HTML files exist and are synchronized with difficulty & wobble updates', async () => {
  const rootHtml = await readFile(new URL('../tower-city.html', import.meta.url), 'utf8');
  const spaceHtml = await readFile(new URL('../Tower City.html', import.meta.url), 'utf8');
  const srcHtml = await readFile(new URL('../src/page/games/tower-city.html', import.meta.url), 'utf8');

  assert.equal(rootHtml, spaceHtml, 'tower-city.html and Tower City.html must match');
  assert.equal(rootHtml, srcHtml, 'tower-city.html and src/page/games/tower-city.html must match');

  // Verify new physics and difficulty additions
  assert.ok(rootHtml.includes('shudder'), 'must include shudder physics');
  assert.ok(rootHtml.includes('flutterAmp') || rootHtml.includes('flutter'), 'must include flutter jitter');
  assert.ok(rootHtml.includes('minOverlap'), 'must include stricter dynamic overlap tolerance');
  assert.ok(rootHtml.includes('misAvg') || rootHtml.includes('misSum'), 'must track cumulative misalignment');
  assert.ok(rootHtml.includes('LỆCH TẦNG'), 'must include misaligned floor warning/indicator');
});

test('Tower City physics: misalignment induces structural wobble and impact shudder', () => {
  const VW = 360, BW = 100, BH = 28;
  let S = {
    floors: [{ x: VW / 2 }],
    t: 0,
    wob: 0,
    amp: 3,
    shake: 0,
    shakeT: 0,
    swayPhase: 0,
    flutterAmp: 0,
    combo: 0,
    lives: 3,
    perfects: 0,
    pop: 0
  };

  function sway(i) {
    if (!S || i <= 0) return 0;
    const s = S;
    const k = Math.min(2.5, Math.pow(i / 9, 1.35));
    const ph = s.swayPhase || (s.t * 2);
    const w1 = Math.sin(ph);
    const w2 = Math.sin(ph * 2.18 + 0.9) * 0.28;
    const primary = s.amp * k * (w1 + w2) * 0.82;
    const shudder = (s.shake && s.shake > 0.1) ? s.shake * Math.min(1.6, i / 8) * Math.sin((s.shakeT || 0) * 40) : 0;
    const flutter = (s.flutterAmp && s.flutterAmp > 0.1) ? Math.sin(s.t * 16 + i * 0.5) * s.flutterAmp * Math.min(1.4, i / 9) : 0;
    return primary + shudder + flutter;
  }

  function updateGame(dt) {
    const s = S;
    s.t += dt;
    if (s.shake > 0.05) {
      s.shakeT += dt;
      s.shake = Math.max(0, s.shake - dt * 28);
    } else {
      s.shake = 0;
    }

    let misSum = 0;
    for (let j = 1; j < s.floors.length; j++) {
      misSum += Math.abs(s.floors[j].x - s.floors[j-1].x);
    }
    const misAvg = s.floors.length > 1 ? misSum / (s.floors.length - 1) : 0;

    const minWob = Math.min(5, (misAvg / BW) * 7.5);
    if (s.wob > minWob) {
      s.wob = Math.max(minWob, s.wob - dt * 0.2);
    }

    const targetAmp = 3.0 + s.wob * 7.5 + (misAvg / BW) * 45;
    s.amp += (targetAmp - s.amp) * Math.min(1, dt * 3.5);

    const targetFlutter = (s.wob > 0.7 || misAvg > 6) ? Math.min(6, s.wob * 0.9 + (misAvg / BW) * 12) : 0;
    s.flutterAmp += (targetFlutter - s.flutterAmp) * Math.min(1, dt * 4);

    const swaySpeed = 1.95 + Math.min(s.floors.length, 35) * 0.025 + Math.min(s.wob, 8) * 0.06;
    s.swayPhase = (s.swayPhase || 0) + dt * swaySpeed;
  }

  function dropFloor(targetDx) {
    const s = S, n = s.floors.length, top = s.floors[n - 1];
    const topX = top.x + sway(n - 1);
    let dx = targetDx;
    const off = Math.abs(dx) / BW;

    const minOverlap = Math.min(0.42, 0.34 + Math.min(s.wob, 8) * 0.01);
    if (BW - Math.abs(dx) < BW * minOverlap) {
      // Miss
      s.lives--;
      s.combo = 0;
      s.wob = Math.min(10, s.wob + 1.8);
      s.shake = Math.min(24, s.shake + 18);
      s.shakeT = 0;
      return { status: 'miss', off };
    }

    const perfect = off < 0.038;
    if (perfect) dx = 0;
    const bx = topX + dx;
    s.floors.push({ x: bx - sway(n) });

    if (perfect) {
      s.combo++;
      s.perfects++;
      s.wob = Math.max(0, s.wob * 0.4 - 0.25);
      s.shake = 0;
    } else {
      s.combo = 0;
      const penalty = off - 0.038;
      s.wob = Math.min(10, s.wob + penalty * 5.5 + 0.35);
      s.shake = Math.min(22, s.shake + penalty * 28 + 5);
      s.shakeT = 0;
    }
    return { status: perfect ? 'perfect' : 'land', off };
  }

  // Foundation sway is always 0
  assert.equal(sway(0), 0, 'ground foundation must never sway');

  // Initial state has low amplitude
  assert.equal(S.wob, 0);
  assert.equal(S.shake, 0);

  // Drop 1: Perfect drop
  const d1 = dropFloor(0);
  assert.equal(d1.status, 'perfect');
  assert.equal(S.wob, 0);
  assert.equal(S.shake, 0);

  // Drop 2: Misaligned drop (dx = 30px, 30% of BW)
  const prevWob = S.wob;
  const d2 = dropFloor(30);
  assert.equal(d2.status, 'land');
  assert.ok(S.wob > prevWob, 'wobble must increase after misaligned placement');
  assert.ok(S.shake > 0, 'impact shudder must be triggered after misaligned placement');

  // Advance time: check that target amplitude rises with wobble
  const initAmp = S.amp;
  for (let step = 0; step < 20; step++) updateGame(0.05);
  assert.ok(S.amp > initAmp, 'sway amplitude must increase when tower is misaligned');

  // Higher floors sway significantly more than lower floors
  const swayFloor1 = Math.abs(sway(1));
  const swayFloor2 = Math.abs(sway(2));
  assert.ok(swayFloor2 >= swayFloor1, 'upper floors must sway at least as much as lower floors');

  // Drop 3: Another severe misalignment (dx = -35px)
  const wobBefore = S.wob;
  const d3 = dropFloor(-35);
  assert.equal(d3.status, 'land');
  assert.ok(S.wob > wobBefore, 'consecutive misaligned drops increase wobble further');

  // Drop 4: Perfect recovery
  const wobBeforeRecovery = S.wob;
  const d4 = dropFloor(0);
  assert.equal(d4.status, 'perfect');
  assert.ok(S.wob < wobBeforeRecovery, 'perfect placement calms wobble');
  assert.equal(S.shake, 0, 'perfect placement clears impact shudder');

  // Stricter overlap tolerance test: 70px offset on 100px block leaves only 30px overlap (< minOverlap)
  const livesBefore = S.lives;
  const d5 = dropFloor(70);
  assert.equal(d5.status, 'miss');
  assert.equal(S.lives, livesBefore - 1, 'extreme misalignment counts as a miss');
  assert.ok(S.shake > 15, 'miss produces heavy impact shock');
});

