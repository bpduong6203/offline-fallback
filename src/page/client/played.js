// Một đoạn script của trang offline, được nối cùng phạm vi với các game canvas khác.
export const clientPlayed = `    // ===================== YOU GOT PLAYED =====================
    var played = (function () {
      var W = 800, H = 450, FLOOR = 350, PW = 22, PH = 30, WORLD = 2500;
      var grounds = [
        { a: 0, b: 250, y: 350 }, { a: 250, b: 395, y: 310 }, { a: 395, b: 520, y: 350 },
        { a: 575, b: 740, y: 375 }, { a: 740, b: 890, y: 325 }, { a: 960, b: 1140, y: 350 },
        { a: 1140, b: 1290, y: 300 }, { a: 1360, b: 1550, y: 370 }, { a: 1550, b: 1690, y: 315 },
        { a: 1770, b: 1960, y: 350 }, { a: 1960, b: 2130, y: 305 }, { a: 2210, b: 2500, y: 350 }
      ];
      var pits = [520, 890, 1290, 1690, 2130];
      var floorSpikes = [{ x: 162, w: 42 }, { x: 640, w: 42 }, { x: 1042, w: 40 }, { x: 1470, w: 42 }, { x: 1860, w: 42 }, { x: 2320, w: 46 }];
      var falling = [], rising = [], saws = [{ x: 815, y: 255, amp: 42, phase: 0.2, r: 16 }, { x: 1605, y: 245, amp: 48, phase: 2.1, r: 17 }, { x: 2050, y: 255, amp: 40, phase: 4.3, r: 16 }];
      var keys = {}, touch = { left: false, right: false }, state = 'title';
      var player, camera = 0, deaths = 0, jumps = 0, early = 0, checkpoint = 50, time = 0, deathTimer = 0;
      var pausedFrom = 'run', learned = false, note = '', noteTimer = 0, jumpBuffer = 0, coyote = 0, lastPit = -1;
      var controls = document.getElementById('playedControls');
      var best = 0;
      try { best = Number(localStorage.getItem('ygp_best') || 0); } catch (e) {}

      function resetPlayer(at) {
        var floor = groundAt(at, at + PW);
        player = { x: at, y: (floor ? floor.y : FLOOR) - PH, vx: 0, vy: 0, grounded: true, face: 1, anim: 0 };
        camera = Math.max(0, Math.min(WORLD - W, at - 150));
        state = 'run'; deathTimer = 0; jumpBuffer = 0; coyote = 0.1; lastPit = -1;
        resetTraps();
      }
      function resetTraps() {
        falling = [{ x: 430, y: 165, dest: 328, w: 46, state: 'idle', t: 0 }, { x: 1195, y: 150, dest: 278, w: 48, state: 'idle', t: 0 }, { x: 1985, y: 140, dest: 283, w: 46, state: 'idle', t: 0 }];
        rising = [{ x: 840, y: 325, h: 0, state: 'idle', t: 0, w: 44 }, { x: 1638, y: 315, h: 0, state: 'idle', t: 0, w: 44 }, { x: 2248, y: 350, h: 0, state: 'idle', t: 0, w: 48 }];
      }
      function start() {
        deaths = 0; jumps = 0; early = 0; time = 0; checkpoint = 50; learned = false; note = '';
        try { early = Number(localStorage.getItem('ygp_early_jumps') || 0); learned = early >= 3; } catch (e) {}
        resetPlayer(checkpoint);
      }
      function die() {
        if (state !== 'run') return;
        deaths++; state = 'dead'; deathTimer = 0.48;
        note = early >= 3 ? 'Game nhớ rồi đấy.' : 'Bẫy đã ghi nhớ cú nhảy của bạn.'; noteTimer = 1.8;
      }
      function jump() {
        if (state === 'title' || state === 'won') { start(); return; }
        if (state === 'paused') { state = pausedFrom; return; }
        if (state !== 'run') return;
        jumpBuffer = 0.13;
      }
      function togglePause() {
        if (state === 'run') { pausedFrom = 'run'; state = 'paused'; }
        else if (state === 'paused') state = pausedFrom;
      }
      function jumpNow() {
        player.vy = -510; player.grounded = false; coyote = 0; jumpBuffer = 0; jumps++;
        var nearest = -1, distance = Infinity;
        for (var i = 0; i < pits.length; i++) {
          var d = pits[i] - (player.x + PW);
          if (d >= 0 && d < distance) { nearest = i; distance = d; }
        }
        if (nearest >= 0 && distance >= 95 && distance <= 190 && lastPit !== nearest) {
          early++; lastPit = nearest;
          try { localStorage.setItem('ygp_early_jumps', String(early)); } catch (e) {}
          if (!learned && early >= 3) {
            learned = true; note = 'BẮT BÀI: Bạn luôn nhảy sớm!'; noteTimer = 3.2;
          }
        }
      }
      function groundAt(left, right) {
        for (var i = 0; i < grounds.length; i++) if (left >= grounds[i].a && right <= grounds[i].b) return grounds[i];
        return null;
      }
      function update(dt) {
        if (noteTimer > 0) noteTimer -= dt;
        if (state === 'dead') {
          deathTimer -= dt;
          if (deathTimer <= 0) resetPlayer(checkpoint);
          return;
        }
        if (state !== 'run') return;
        time += dt;
        var dir = (keys.ArrowRight || keys.KeyD || touch.right ? 1 : 0) - (keys.ArrowLeft || keys.KeyA || touch.left ? 1 : 0);
        if (dir) { player.vx += dir * 1850 * dt; player.face = dir; }
        else player.vx *= Math.pow(0.0008, dt);
        player.vx = Math.max(-250, Math.min(250, player.vx));
        player.anim += Math.abs(player.vx) * dt * 0.05;
        if (player.grounded) coyote = 0.11; else coyote = Math.max(0, coyote - dt);
        jumpBuffer = Math.max(0, jumpBuffer - dt);
        if (jumpBuffer > 0 && coyote > 0) jumpNow();
        player.vy = Math.min(700, player.vy + 1450 * dt);
        var oldX = player.x, oldBottom = player.y + PH;
        var nextX = Math.max(0, Math.min(WORLD - PW, player.x + player.vx * dt));
        for (var h = 0; h < grounds.length; h++) {
          var platform = grounds[h];
          if (player.y + PH <= platform.y) continue;
          if (player.vx > 0 && oldX + PW <= platform.a && nextX + PW > platform.a) { nextX = platform.a - PW; player.vx = 0; }
          if (player.vx < 0 && oldX >= platform.b && nextX < platform.b) { nextX = platform.b; player.vx = 0; }
        }
        player.x = nextX;
        player.y += player.vy * dt;
        player.grounded = false;
        if (player.vy >= 0) {
          var landing = null;
          for (var p = 0; p < grounds.length; p++) {
            var platform = grounds[p];
            if (player.x < platform.b && player.x + PW > platform.a && oldBottom <= platform.y && player.y + PH >= platform.y && (!landing || platform.y < landing.y)) landing = platform;
          }
          if (landing) { player.y = landing.y - PH; player.vy = 0; player.grounded = true; }
        }
        updateTraps(dt);
        if (player.y > H + 100) { die(); return; }
        if (player.x >= 1050 && checkpoint < 1050) { checkpoint = 1080; note = 'Checkpoint đã lưu.'; noteTimer = 2; }
        if (player.x > 2410) {
          state = 'won';
          var score = Math.max(0, Math.round(1000 - time * 8 - deaths * 90));
          if (score > best) { best = score; try { localStorage.setItem('ygp_best', String(best)); } catch (e) {} }
          return;
        }
        for (var s = 0; s < floorSpikes.length; s++) {
          var spike = floorSpikes[s], top = groundAt(spike.x, spike.x + spike.w);
          if (top && player.x + PW > spike.x && player.x < spike.x + spike.w && player.y + PH > top.y - 21 && player.y < top.y) { die(); return; }
        }
        for (var f = 0; f < falling.length; f++) {
          var fall = falling[f];
          if ((fall.state === 'dropping' || fall.state === 'down') && player.x + PW > fall.x && player.x < fall.x + fall.w && player.y + PH > fall.y - 8 && player.y < fall.y + 22) { die(); return; }
        }
        for (var r = 0; r < rising.length; r++) {
          var rise = rising[r];
          if (rise.h > 8 && player.x + PW > rise.x && player.x < rise.x + rise.w && player.y + PH > rise.y - rise.h && player.y < rise.y) { die(); return; }
        }
        for (var sw = 0; sw < saws.length; sw++) {
          var saw = saws[sw], sy = saw.y + Math.sin(time * 2.4 + saw.phase) * saw.amp;
          if (player.x + PW > saw.x - saw.r && player.x < saw.x + saw.r && player.y + PH > sy - saw.r && player.y < sy + saw.r) { die(); return; }
        }
        if (learned && player.x + PW > 1745 && player.x < 1792 && player.y < 260 && player.y + PH > 220) { die(); return; }
        var target = Math.max(0, Math.min(WORLD - W, player.x - 245));
        camera += (target - camera) * Math.min(1, dt * 7);
      }
      function updateTraps(dt) {
        for (var i = 0; i < falling.length; i++) {
          var f = falling[i];
          if (f.state === 'idle' && player.x > f.x - 165 && player.x < f.x + f.w + 20) { f.state = 'warning'; f.t = 0; }
          else if (f.state === 'warning') { f.t += dt; if (f.t > 0.5) f.state = 'dropping'; }
          else if (f.state === 'dropping') { f.y = Math.min(f.dest, f.y + 760 * dt); if (f.y >= f.dest) { f.state = 'down'; f.t = 0; } }
          else if (f.state === 'down' && player.x > f.x + f.w + 90) f.state = 'spent';
        }
        for (var j = 0; j < rising.length; j++) {
          var r = rising[j];
          if (r.state === 'idle' && player.x > r.x - 125 && player.x < r.x + r.w + 15) { r.state = 'warning'; r.t = 0; }
          else if (r.state === 'warning') { r.t += dt; if (r.t > 0.55) { r.state = 'up'; r.t = 0; } }
          else if (r.state === 'up') { r.h = Math.min(66, r.h + 520 * dt); if (r.h >= 66) { r.state = 'hold'; r.t = 0; } }
          else if (r.state === 'hold') { r.t += dt; if (r.t > 0.9) r.state = 'retract'; }
          else if (r.state === 'retract') { r.h = Math.max(0, r.h - 420 * dt); if (!r.h) r.state = 'spent'; }
        }
      }
      function rr(px, py, w, h, r, color) {
        x.fillStyle = color; x.fillRect(px, py, w, h);
      }
      function drawHero(px, py) {
        x.save(); x.translate(Math.round(px), Math.round(py)); x.scale(player.face, 1);
        var bob = player.grounded ? Math.sin(player.anim) * 2 : 0;
        x.fillStyle = 'rgba(7,12,28,.28)'; x.fillRect(-3, PH + 2, 27, 4);
        x.fillStyle = '#14243a'; x.fillRect(2, 21 + bob, 7, 9); x.fillRect(14, 21 - bob, 7, 9);
        x.fillStyle = '#ff6f61'; x.fillRect(0, 8 + bob, 22, 15);
        x.fillStyle = '#ffc857'; x.fillRect(3, 4 + bob, 16, 8);
        x.fillStyle = '#fff6dc'; x.fillRect(13, 6 + bob, 3, 3);
        x.fillStyle = '#263449'; x.fillRect(15, 7 + bob, 2, 2);
        x.fillStyle = '#8be9c1'; x.fillRect(-3, 12 + bob, 5, 5);
        x.restore();
      }
      function drawSpikes(px, count, surfaceY, color) {
        x.fillStyle = color;
        for (var i = 0; i < count; i++) {
          x.beginPath(); x.moveTo(px + i * 16, surfaceY); x.lineTo(px + 8 + i * 16, surfaceY - 22); x.lineTo(px + 16 + i * 16, surfaceY); x.fill();
        }
      }
      function draw() {
        x.save(); x.imageSmoothingEnabled = false;
        var g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#101a36'); g.addColorStop(1, '#263956');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.fillStyle = '#f6d98a'; x.beginPath(); x.arc(674, 86, 33, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#192746';
        for (var m = 0; m < 9; m++) { var mx = ((m * 139 - camera * 0.2) % 1200 + 1200) % 1200 - 100; x.beginPath(); x.moveTo(mx, 300); x.lineTo(mx + 90, 164 + (m % 3) * 23); x.lineTo(mx + 180, 300); x.fill(); }
        x.fillStyle = '#213653';
        for (var t = 0; t < 10; t++) { var tx = ((t * 113 - camera * 0.42) % 1100 + 1100) % 1100 - 80; x.fillRect(tx, 255 + (t % 3) * 15, 24, 95); x.fillRect(tx - 8, 247 + (t % 3) * 15, 40, 10); }
        for (var i = 0; i < grounds.length; i++) {
          var a = grounds[i].a - camera, b = grounds[i].b - camera;
          if (b < -30 || a > W + 30) continue;
          x.fillStyle = '#314b61'; x.fillRect(a, grounds[i].y, b - a, H - grounds[i].y);
          x.fillStyle = '#8be9c1'; x.fillRect(a, grounds[i].y, b - a, 7);
          x.fillStyle = '#46647a';
          for (var q = Math.ceil(grounds[i].a / 32) * 32; q < grounds[i].b; q += 32) x.fillRect(q - camera + 4, grounds[i].y + 20 + (q % 3) * 5, 5, 4);
        }
        for (var fs = 0; fs < floorSpikes.length; fs++) {
          var fp = floorSpikes[fs], base = groundAt(fp.x, fp.x + fp.w);
          if (base) drawSpikes(fp.x - camera, Math.ceil(fp.w / 16), base.y, '#ff6f61');
        }
        for (var ft = 0; ft < falling.length; ft++) {
          var trap = falling[ft], tx = trap.x - camera;
          if (trap.state === 'spent' || tx < -80 || tx > W + 80) continue;
          x.fillStyle = trap.state === 'warning' && Math.floor(tm * 12) % 2 ? '#ff6f61' : '#ffb45e';
          x.fillRect(tx - 5, 82, trap.w + 10, 5); x.fillStyle = '#ff6f61';
          for (var ti = 0; ti < 3; ti++) { x.beginPath(); x.moveTo(tx + ti * 16, trap.y - 8); x.lineTo(tx + 8 + ti * 16, trap.y + 20); x.lineTo(tx + 16 + ti * 16, trap.y - 8); x.fill(); }
        }
        for (var rt = 0; rt < rising.length; rt++) {
          var spike = rising[rt], rx = spike.x - camera;
          if (spike.state === 'spent' || rx < -70 || rx > W + 70) continue;
          if (spike.state === 'warning') { x.fillStyle = Math.floor(tm * 12) % 2 ? '#ff6f61' : '#f6d98a'; x.fillRect(rx - 4, spike.y - 8, spike.w + 8, 5); }
          if (spike.h > 0) {
            x.fillStyle = '#ff6f61';
            for (var ri = 0; ri < 3; ri++) { x.beginPath(); x.moveTo(rx + ri * 16, spike.y); x.lineTo(rx + 8 + ri * 16, spike.y - spike.h); x.lineTo(rx + 16 + ri * 16, spike.y); x.fill(); }
          }
        }
        for (var si = 0; si < saws.length; si++) {
          var saw = saws[si], sx = saw.x - camera, sy = saw.y + Math.sin(time * 2.4 + saw.phase) * saw.amp;
          if (sx < -40 || sx > W + 40) continue;
          x.save(); x.translate(sx, sy); x.rotate(tm * 3.2); x.fillStyle = '#d8e2ef';
          for (var tooth = 0; tooth < 8; tooth++) { x.rotate(Math.PI / 4); x.fillRect(-3, -saw.r - 5, 6, 10); }
          x.fillStyle = '#ff6f61'; x.beginPath(); x.arc(0, 0, saw.r - 3, 0, Math.PI * 2); x.fill();
          x.fillStyle = '#17233c'; x.beginPath(); x.arc(0, 0, 5, 0, Math.PI * 2); x.fill(); x.restore();
        }
        if (learned) {
          x.fillStyle = '#ff6f61';
          for (var sp = 0; sp < 3; sp++) { x.beginPath(); x.moveTo(1744 - camera + sp * 16, 220); x.lineTo(1752 - camera + sp * 16, 254); x.lineTo(1760 - camera + sp * 16, 220); x.fill(); }
          x.fillStyle = '#ffb45e'; x.fillRect(1739 - camera, 214, 54, 6);
        }
        var cp = 1080 - camera;
        x.fillStyle = '#f6d98a'; x.fillRect(cp, FLOOR - 58, 4, 58); x.fillStyle = '#8be9c1'; x.beginPath(); x.moveTo(cp + 4, FLOOR - 57); x.lineTo(cp + 38, FLOOR - 47); x.lineTo(cp + 4, FLOOR - 36); x.fill();
        var gx = 2435 - camera;
        x.fillStyle = '#f6d98a'; x.fillRect(gx, FLOOR - 64, 38, 64); x.fillStyle = '#8be9c1'; x.fillRect(gx + 8, FLOOR - 48, 22, 48); x.fillStyle = '#fff0b5'; x.fillRect(gx + 14, FLOOR - 40, 4, 4);
        if (player) drawHero(player.x - camera, player.y);
        x.fillStyle = 'rgba(8,15,31,.72)'; x.fillRect(14, 14, 258, 54);
        x.fillStyle = '#f7f2df'; x.font = '700 16px monospace'; x.textAlign = 'left'; x.fillText('YOU GOT PLAYED', 26, 36);
        x.font = '12px monospace'; x.fillStyle = '#ff9e81'; x.fillText('ĐỊA NGỤC  •  CHẾT ' + deaths + '   NHẢY ' + jumps + '   CHECKPOINT ' + (checkpoint > 100 ? '✓' : '—'), 26, 56);
        if (noteTimer > 0 && state === 'run') {
          rr(250, 78, 300, 36, 8, 'rgba(13,21,42,.88)'); x.textAlign = 'center'; x.fillStyle = learned ? '#ff9e81' : '#f6d98a'; x.font = '700 14px monospace'; x.fillText(note, 400, 101);
        }
        if (state === 'title' || state === 'won' || state === 'paused') {
          x.fillStyle = 'rgba(8,13,29,.78)'; x.fillRect(0, 0, W, H);
          x.textAlign = 'center'; x.fillStyle = '#f6d98a'; x.font = '900 38px monospace';
          x.fillText(state === 'won' ? 'YOU GOT OUT.' : (state === 'paused' ? 'TẠM DỪNG' : 'YOU GOT PLAYED'), 400, 166);
          x.fillStyle = '#c3d2df'; x.font = '16px monospace';
          x.fillText(state === 'won' ? 'Bạn đã đánh lừa được trò chơi.' : (state === 'paused' ? 'Nhấn Esc hoặc chạm để tiếp tục' : 'ĐỘ KHÓ ĐỊA NGỤC • Game sẽ học cách bạn chơi.'), 400, 204);
          if (state === 'title') {
            rr(312, 242, 176, 54, 12, '#ff6f61'); x.fillStyle = '#1a2238'; x.font = '800 18px monospace'; x.fillText('BẮT ĐẦU', 400, 276);
            x.fillStyle = '#b8c8d9'; x.font = '12px monospace'; x.fillText('A/D hoặc ←/→ di chuyển • Space nhảy • R hồi sinh • Esc tạm dừng', 400, 329);
          }
          if (state === 'won') { x.font = '14px monospace'; x.fillText('Thời gian ' + Math.floor(time) + 's  •  Số lần chết ' + deaths + '  •  Kỷ lục ' + best, 400, 242); x.fillText('Nhấn Space hoặc chạm để chơi lại', 400, 285); }
        }
        if (state === 'dead') {
          x.fillStyle = 'rgba(9,14,30,.48)'; x.fillRect(0, 0, W, H); x.textAlign = 'center'; x.fillStyle = '#ff9e81'; x.font = '800 24px monospace'; x.fillText('BẠN DÍNH BẪY!', 400, 210);
          x.fillStyle = '#f7f2df'; x.font = '14px monospace'; x.fillText('Hồi sinh tại checkpoint…', 400, 238);
        }
        x.restore();
        if (controls) controls.hidden = state !== 'run';
      }
      function keyDown(e) {
        if (e.code === 'Escape') { togglePause(); return; }
        if (e.code === 'KeyR' && state !== 'title') { deaths++; resetPlayer(checkpoint); note = 'Quay lại checkpoint.'; noteTimer = 1.5; return; }
        keys[e.code] = true;
      }
      function keyUp(e) { keys[e.code] = false; }
      var touchButtons = document.querySelectorAll('[data-played-control]');
      for (var i = 0; i < touchButtons.length; i++) {
        (function (b) {
          var action = b.getAttribute('data-played-control');
          b.addEventListener('pointerdown', function (e) { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (err) {} if (action === 'jump') jump(); else if (action === 'pause') togglePause(); else touch[action] = true; });
          function release(e) { if (e) e.preventDefault(); if (action === 'left' || action === 'right') touch[action] = false; }
          b.addEventListener('pointerup', release); b.addEventListener('pointercancel', release); b.addEventListener('lostpointercapture', release);
        })(touchButtons[i]);
      }
      return {
        w: W, h: H, hint: 'Độ khó địa ngục ngay từ đầu: vượt địa hình cao thấp, né gai bật/rơi và cưa bay. Dùng A/D hoặc các nút trên màn hình.',
        update: update, draw: draw,
        key: jump, keyDown: keyDown, keyUp: keyUp,
        down: function (px, py) { if (state === 'title' && px >= 312 && px <= 488 && py >= 242 && py <= 300) start(); else if (state === 'title' || state === 'won') jump(); else if (state === 'paused') togglePause(); },
        enter: function () { if (state === 'paused') state = pausedFrom; },
        leave: function () { if (state === 'run') { pausedFrom = 'run'; state = 'paused'; } keys = {}; touch.left = false; touch.right = false; },
        busy: function () { return state === 'run' || state === 'dead' || state === 'paused'; }
      };
    })();
`;
