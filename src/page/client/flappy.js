// Một đoạn của script phía trình duyệt, được nối lại theo thứ tự trong render.js (cùng một phạm vi).
// Lưu ý: nội dung nằm trong template literal nên KHÔNG dùng backtick, dấu đô-la + ngoặc nhọn
// hay dấu gạch chéo ngược trong phần chuỗi này.
export const clientFlappy = `    // ===================== FLAPPY BUG =====================
    var flappy = (function () {
      var GROUND = H - 26;
      var BX = 110, R = 10, PW = 54, GAP = 112, SPACING = 210, SPEED = 150;
      var best = 0;
      try { best = +localStorage.getItem('offline_best') || 0; } catch (e) {}
      var bug, pipes, score, state, dist, overAt;

      function reset() {
        bug = { y: H / 2 - 20, vy: 0 };
        pipes = []; score = 0; dist = 0;
        state = 'ready';
      }

      function flap() {
        var now = performance.now();
        if (state === 'ready') state = 'run';
        if (state === 'run') { bug.vy = -380; return; }
        if (state === 'over' && now - overAt > 400) reset();
      }

      function die() {
        state = 'over'; overAt = performance.now();
        if (score > best) {
          best = score;
          try { localStorage.setItem('offline_best', String(best)); } catch (e) {}
        }
      }

      function step(dt) {
        dist += SPEED * dt;
        bug.vy += 1300 * dt;
        bug.y += bug.vy * dt;
        if (bug.y - R < 0) { bug.y = R; bug.vy = 0; }
        if (bug.y + R > GROUND) { bug.y = GROUND - R; die(); return; }

        if (!pipes.length || pipes[pipes.length - 1].x < W - SPACING) {
          pipes.push({ x: W + 10, gapY: 70 + Math.random() * (GROUND - 140), passed: false });
        }
        for (var i = pipes.length - 1; i >= 0; i--) {
          var p = pipes[i];
          p.x -= SPEED * dt;
          if (p.x + PW < -10) { pipes.splice(i, 1); continue; }
          if (!p.passed && p.x + PW < BX) { p.passed = true; score++; }
          if (BX + R > p.x && BX - R < p.x + PW) {
            if (bug.y - R < p.gapY - GAP / 2 || bug.y + R > p.gapY + GAP / 2) { die(); return; }
          }
        }
      }

      function drawRack(px, y1, y2, capOnBottom) {
        if (y2 - y1 <= 0) return;
        x.fillStyle = '#cbd5e1'; x.strokeStyle = '#64748b'; x.lineWidth = 2;
        x.fillRect(px, y1, PW, y2 - y1); x.strokeRect(px, y1, PW, y2 - y1);
        x.strokeStyle = '#94a3b8'; x.lineWidth = 1;
        for (var yy = y1 + 12; yy < y2 - 18; yy += 14) {
          x.beginPath(); x.moveTo(px + 8, yy); x.lineTo(px + PW - 8, yy); x.stroke();
        }
        var cy = capOnBottom ? y2 - 14 : y1;
        x.fillStyle = '#94a3b8'; x.strokeStyle = '#475569'; x.lineWidth = 2;
        x.fillRect(px - 4, cy, PW + 8, 14); x.strokeRect(px - 4, cy, PW + 8, 14);
        x.fillStyle = (Math.floor(tm * 3) % 2) ? '#22c55e' : '#16a34a';
        x.beginPath(); x.arc(px + PW / 2, cy + 7, 3, 0, Math.PI * 2); x.fill();
      }

      function drawBug(cx, cy, tilt) {
        x.save(); x.translate(cx, cy); x.rotate(tilt);
        var f = state === 'over' ? 0.2 : Math.abs(Math.sin(tm * 24));
        x.strokeStyle = '#431407'; x.lineWidth = 1.5; x.lineCap = 'round';
        for (var i = -1; i <= 1; i++) {
          x.beginPath(); x.moveTo(i * 5, 8); x.lineTo(i * 5 - 2, 14); x.stroke();
        }
        x.fillStyle = 'rgba(186,230,253,0.85)'; x.strokeStyle = '#7dd3fc'; x.lineWidth = 1;
        x.beginPath(); x.ellipse(-4, -9, 10, 2 + 7 * f, -0.3, 0, Math.PI * 2); x.fill(); x.stroke();
        x.fillStyle = '#ea580c'; x.strokeStyle = '#7c2d12'; x.lineWidth = 2;
        x.beginPath(); x.ellipse(0, 0, 14, 11, 0, 0, Math.PI * 2); x.fill(); x.stroke();
        x.lineWidth = 1.2;
        x.beginPath(); x.moveTo(-3, -10); x.lineTo(-3, 10); x.stroke();
        x.fillStyle = '#431407';
        var sp = [[-8, -4], [-8, 4], [2, -5], [2, 5]];
        for (var j = 0; j < sp.length; j++) {
          x.beginPath(); x.arc(sp[j][0], sp[j][1], 2.3, 0, Math.PI * 2); x.fill();
        }
        x.beginPath(); x.arc(13, -1, 7, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#fff';
        x.beginPath(); x.arc(15, -4, 3, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#111';
        x.beginPath(); x.arc(16, -4, 1.4, 0, Math.PI * 2); x.fill();
        x.strokeStyle = '#431407'; x.lineWidth = 1.5; x.fillStyle = '#431407';
        x.beginPath(); x.moveTo(15, -7); x.quadraticCurveTo(19, -14, 24, -13); x.stroke();
        x.beginPath(); x.arc(24, -13, 1.8, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.moveTo(11, -7); x.quadraticCurveTo(12, -15, 17, -17); x.stroke();
        x.beginPath(); x.arc(17, -17, 1.8, 0, Math.PI * 2); x.fill();
        x.restore();
      }

      function draw() {
        x.clearRect(0, 0, W, H);
        var sky = x.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#fff7ed'); sky.addColorStop(1, '#fed7aa');
        x.fillStyle = sky; x.fillRect(0, 0, W, H);

        for (var i = 0; i < pipes.length; i++) {
          var p = pipes[i];
          drawRack(p.x, 0, p.gapY - GAP / 2, true);
          drawRack(p.x, p.gapY + GAP / 2, GROUND, false);
        }

        x.fillStyle = '#fdba74'; x.fillRect(0, GROUND, W, H - GROUND);
        x.strokeStyle = '#ea580c'; x.lineWidth = 2;
        x.beginPath(); x.moveTo(0, GROUND); x.lineTo(W, GROUND); x.stroke();
        x.strokeStyle = '#fb923c'; x.lineWidth = 2;
        for (var g = -(dist % 24); g < W; g += 24) {
          x.beginPath(); x.moveTo(g, GROUND + 6); x.lineTo(g - 8, GROUND + 18); x.stroke();
        }

        var by = bug.y;
        if (state === 'ready') by = H / 2 - 20 + Math.sin(tm * 4) * 6;
        var tilt = Math.max(-0.45, Math.min(1.0, bug.vy / 520));
        if (state === 'ready') tilt = 0;
        drawBug(BX, by, tilt);

        x.textAlign = 'center';
        x.fillStyle = '#ea580c';
        x.font = '700 34px Nunito Sans, sans-serif';
        x.fillText(String(score), W / 2, 44);
        x.textAlign = 'right';
        x.font = '600 12px Nunito Sans, sans-serif';
        x.fillStyle = '#9a3412';
        x.fillText('Cao nhất ' + best, W - 12, 20);
        x.textAlign = 'center';

        if (state === 'ready') {
          x.fillStyle = '#7c2d12'; x.font = '600 16px Nunito Sans, sans-serif';
          x.fillText('Chạm để bắt đầu', W / 2, H / 2 + 50);
        }
        if (state === 'over') {
          x.fillStyle = 'rgba(255,255,255,0.8)';
          x.fillRect(0, 0, W, H);
          x.fillStyle = '#1e293b'; x.font = '700 22px Nunito Sans, sans-serif';
          x.fillText('Bug đâm vào máy chủ rồi!', W / 2, H / 2 - 14);
          x.fillStyle = '#64748b'; x.font = '500 14px Nunito Sans, sans-serif';
          x.fillText('Điểm ' + score + '  •  Chạm để chơi lại', W / 2, H / 2 + 14);
        }
        x.textAlign = 'left';
      }

      reset();
      return {
        w: 480, h: 270,
        hint: 'Chạm vào game hoặc bấm Space / ↑ để vỗ cánh',
        update: function (dt) { if (state === 'run') step(dt); },
        draw: draw,
        down: function () { flap(); },
        key: function () { flap(); }
      };
    })();

`;
