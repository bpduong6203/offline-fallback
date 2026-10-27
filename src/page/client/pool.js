// Một đoạn của script phía trình duyệt, được nối lại theo thứ tự trong render.js (cùng một phạm vi).
// Lưu ý: nội dung nằm trong template literal nên KHÔNG dùng backtick, dấu đô-la + ngoặc nhọn
// hay dấu gạch chéo ngược trong phần chuỗi này.
export const clientPool = `    // ===================== BI-A MINI =====================
    // Luật: 7 bi màu, bỏ bi vào lỗ được 1 điểm và đánh tiếp. Không bỏ được hoặc bi trắng rơi lỗ thì mất lượt.
    // Ai nhiều điểm hơn khi hết bi thì thắng. Hai máy chạy cùng một mô phỏng (bước cố định),
    // người bắn gửi lại trạng thái cuối cú đánh để đồng bộ.
    var pool = (function () {
      var R = 8, DT = 1 / 120;
      var FL = 22, FR = 458, FT = 46, FB = 252, PR = 14;
      var POCK = [[22, 46], [240, 46], [458, 46], [22, 252], [240, 252], [458, 252]];
      var COLORS = ['#facc15', '#3b82f6', '#ef4444', '#8b5cf6', '#22c55e', '#f97316', '#14b8a6'];
      var HEADX = 131, HEADY = 149;
      var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

      var balls = [], pstate = 'menu', mode = '', me = 0, turn = 0, score = [0, 0], shots = 0;
      var ws = null, pend = null, iShot = true, acc = 0, potCount = 0, cueIn = false;
      var aim = null, roomCode = '', overAt = 0;
      var connId = 0;

      function el(id) { return document.getElementById(id); }
      function setMsg(t) { el('pMsg').textContent = t; }
      function showMenu(on) {
        el('pMenu').hidden = !on;
        el('pBack').hidden = on;
      }
      function clean(s) { return s.toUpperCase().replace(/[^A-Z0-9]/g, ''); }

      function rack() {
        balls = [{ x: HEADX, y: HEADY, vx: 0, vy: 0, a: true, c: '#ffffff' }];
        var d = 2 * R + 0.6, h = d * 0.8660254037844386;
        var off = [[0, 0], [d, 0], [-d, 0], [d / 2, h], [d / 2, -h], [-d / 2, h], [-d / 2, -h]];
        for (var i = 0; i < 7; i++) {
          balls.push({ x: 330 + off[i][0], y: 149 + off[i][1], vx: 0, vy: 0, a: true, c: COLORS[i] });
        }
        score = [0, 0]; shots = 0; turn = 0; potCount = 0; cueIn = false; pend = null; aim = null;
      }

      function step() {
        var i, j, b, o;
        for (i = 0; i < 8; i++) {
          b = balls[i];
          if (!b.a) continue;
          b.x += b.vx * DT; b.y += b.vy * DT;
          b.vx *= 0.9915; b.vy *= 0.9915;
          if (b.vx * b.vx + b.vy * b.vy < 25) { b.vx = 0; b.vy = 0; }
          for (j = 0; j < 6; j++) {
            var px = b.x - POCK[j][0], py = b.y - POCK[j][1];
            if (px * px + py * py < PR * PR) {
              b.a = false; b.vx = 0; b.vy = 0;
              if (i === 0) cueIn = true; else potCount++;
              break;
            }
          }
          if (!b.a) continue;
          if (b.x < FL + R) { b.x = FL + R; b.vx = -b.vx * 0.8; }
          else if (b.x > FR - R) { b.x = FR - R; b.vx = -b.vx * 0.8; }
          if (b.y < FT + R) { b.y = FT + R; b.vy = -b.vy * 0.8; }
          else if (b.y > FB - R) { b.y = FB - R; b.vy = -b.vy * 0.8; }
        }
        for (i = 0; i < 8; i++) {
          if (!balls[i].a) continue;
          for (j = i + 1; j < 8; j++) {
            if (!balls[j].a) continue;
            b = balls[i]; o = balls[j];
            var dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy;
            if (d2 < 4 * R * R && d2 > 0) {
              var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = (2 * R - d) / 2;
              b.x -= nx * ov; b.y -= ny * ov; o.x += nx * ov; o.y += ny * ov;
              var dv = (b.vx - o.vx) * nx + (b.vy - o.vy) * ny;
              if (dv > 0) {
                var k = dv * 0.98;
                b.vx -= k * nx; b.vy -= k * ny; o.vx += k * nx; o.vy += k * ny;
              }
            }
          }
        }
      }

      function moving() {
        for (var i = 0; i < 8; i++) {
          var b = balls[i];
          if (b.a && (b.vx !== 0 || b.vy !== 0)) return true;
        }
        return false;
      }

      function clash(px, py) {
        for (var i = 1; i < 8; i++) {
          var b = balls[i];
          if (!b.a) continue;
          var dx = b.x - px, dy = b.y - py;
          if (dx * dx + dy * dy < 4 * R * R) return true;
        }
        return false;
      }

      function snapshot() {
        var arr = [];
        for (var i = 0; i < 8; i++) {
          // làm tròn luôn cho chính người bắn để hai máy bắt đầu cú sau từ cùng một trạng thái
          balls[i].x = Math.round(balls[i].x * 100) / 100;
          balls[i].y = Math.round(balls[i].y * 100) / 100;
          arr.push([balls[i].x, balls[i].y, balls[i].a ? 1 : 0]);
        }
        return arr;
      }

      function applySync(m) {
        for (var i = 0; i < 8; i++) {
          balls[i].x = m.b[i][0]; balls[i].y = m.b[i][1]; balls[i].a = !!m.b[i][2];
          balls[i].vx = 0; balls[i].vy = 0;
        }
        turn = m.turn; score = m.sc;
        pstate = m.over ? 'over' : 'aim';
        if (m.over) overAt = performance.now();
      }

      function finish() {
        acc = 0;
        pstate = 'aim';
        if (!iShot) {
          if (pend) { applySync(pend); pend = null; } else pstate = 'syncwait';
          return;
        }
        if (cueIn) {
          var px = HEADX, py = HEADY, k = 0;
          while (k < 60 && clash(px, py)) { px += 2; k++; }
          var cb = balls[0];
          cb.x = px; cb.y = py; cb.vx = 0; cb.vy = 0; cb.a = true;
        }
        score[turn] += potCount;
        shots++;
        if (mode === 'online' && !(potCount > 0 && !cueIn)) turn = 1 - turn;
        var left = 0;
        for (var i = 1; i < 8; i++) if (balls[i].a) left++;
        if (left === 0) { pstate = 'over'; overAt = performance.now(); }
        if (mode === 'online') {
          send({ t: 'sync', b: snapshot(), turn: turn, sc: score, over: pstate === 'over' ? 1 : 0 });
        }
      }

      function shoot(vx, vy, mine) {
        var cb = balls[0];
        cb.vx = vx; cb.vy = vy;
        potCount = 0; cueIn = false; iShot = mine; acc = 0;
        pstate = 'sim'; aim = null;
      }

      function canAim() {
        return pstate === 'aim' && (mode === 'solo' || (mode === 'online' && turn === me));
      }

      function send(o) {
        if (ws && ws.readyState === 1) ws.send(JSON.stringify(o));
      }

      function closeWs() {
        var w = ws; ws = null;
        if (w) { try { w.close(); } catch (e) {} }
      }

      function toMenu() {
        connId++;
        closeWs(); mode = ''; pstate = 'menu'; rack();
        showMenu(true); setMsg('');
      }

      function onMsg(m) {
        if (m.t === 'hello') {
          me = m.idx;
          setMsg('Mã phòng: ' + roomCode + '. Gửi mã này cho bạn bè nhé!');
        } else if (m.t === 'start') {
          rack(); pstate = 'aim';
          setMsg('Phòng ' + roomCode);
        } else if (m.t === 'shot') {
          if (pstate === 'aim' && turn !== me) shoot(m.vx, m.vy, false);
        } else if (m.t === 'sync') {
          if (pstate === 'sim') pend = m;
          else if (pstate === 'syncwait') applySync(m);
        } else if (m.t === 'again') {
          if (pstate === 'over') { rack(); pstate = 'aim'; }
        } else if (m.t === 'left') {
          rack(); pstate = 'wait';
          setMsg('Đối thủ đã thoát. Mã phòng ' + roomCode + ' vẫn đang chờ người vào.');
        }
      }

      function connect(code) {
        closeWs();
        var token = ++connId;
        mode = 'online'; roomCode = code; pstate = 'wait'; me = 0; rack();
        setMsg('Đang kiểm tra kết nối...');
        // Gọi thử GET thường: DO trả 426 nghĩa là Worker + Durable Object đều ổn
        fetch('/__game/ws?room=' + code + '&g=pool', { cache: 'no-store' }).then(function (r) {
          if (token !== connId) return;
          if (r.status === 426) { openSocket(code); return; }
          toMenu();
          if (r.status === 501) setMsg('Worker chưa gắn Durable Object POOL: kiểm tra binding và migration trong wrangler.');
          else if (r.status === 409) setMsg('Phòng ' + code + ' đã đủ 2 người.');
          else if (r.status === 403) setMsg('Bị chặn vì Origin không khớp domain (403).');
          else if (r.status >= 500) setMsg('Durable Object lỗi (' + r.status + '): kiểm tra export class PoolRoom và migration.');
          else setMsg('Worker chưa có bản mới (mã ' + r.status + '): hãy deploy lại worker.js.');
        }).catch(function () {
          if (token !== connId) return;
          toMenu(); setMsg('Không gọi được Worker (lỗi mạng).');
        });
      }

      function openSocket(code) {
        var opened = false, mine;
        setMsg('Đang kết nối...');
        var url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/__game/ws?room=' + code + '&g=pool';
        try { mine = new WebSocket(url); } catch (e) { toMenu(); setMsg('Trình duyệt không mở được WebSocket.'); return; }
        ws = mine;
        mine.onopen = function () { opened = true; };
        mine.onmessage = function (ev) {
          if (mine !== ws) return;
          var m;
          try { m = JSON.parse(ev.data); } catch (e) { return; }
          onMsg(m);
        };
        mine.onclose = function () {
          if (mine !== ws) return;
          ws = null;
          toMenu();
          setMsg(opened ? 'Mất kết nối tới phòng.' : 'Không mở được WebSocket (mạng/proxy chặn hoặc WebSockets bị tắt trên Cloudflare).');
        };
      }

      function rematch() {
        if (mode === 'online') send({ t: 'again' });
        rack(); pstate = 'aim';
      }

      function down(px, py) {
        if (pstate === 'over') {
          if (performance.now() - overAt > 400) rematch();
          return;
        }
        if (canAim()) aim = { sx: px, sy: py, cx: px, cy: py };
      }
      function move(px, py) { if (aim) { aim.cx = px; aim.cy = py; } }
      function cancel() { aim = null; }
      function up() {
        if (!aim) return;
        var dx = aim.cx - aim.sx, dy = aim.cy - aim.sy, len = Math.sqrt(dx * dx + dy * dy);
        aim = null;
        if (len < 12 || !canAim()) return;
        var p = Math.min(len, 110) / 110, sp = 140 + p * 760;
        var vx = -dx / len * sp, vy = -dy / len * sp;
        if (mode === 'online') send({ t: 'shot', vx: vx, vy: vy });
        shoot(vx, vy, true);
      }

      function update(dt) {
        if (pstate !== 'sim') return;
        acc += Math.min(dt, 0.05);
        var n = 0;
        while (acc >= DT && n < 12) {
          step(); acc -= DT; n++;
          if (!moving()) { finish(); break; }
        }
      }

      function rr(x0, y0, w, h, r) {
        x.beginPath();
        x.moveTo(x0 + r, y0);
        x.arcTo(x0 + w, y0, x0 + w, y0 + h, r);
        x.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
        x.arcTo(x0, y0 + h, x0, y0, r);
        x.arcTo(x0, y0, x0 + w, y0, r);
        x.closePath();
      }

      function draw() {
        var i;
        x.clearRect(0, 0, W, H);
        x.fillStyle = '#fff7ed'; x.fillRect(0, 0, W, H);
        rr(8, 32, 464, 234, 16); x.fillStyle = '#9a3412'; x.fill();
        x.fillStyle = '#15803d'; x.fillRect(FL, FT, FR - FL, FB - FT);
        x.strokeStyle = '#14532d'; x.lineWidth = 2; x.strokeRect(FL, FT, FR - FL, FB - FT);
        x.strokeStyle = 'rgba(255,255,255,0.18)'; x.lineWidth = 1;
        x.beginPath(); x.moveTo(HEADX, FT); x.lineTo(HEADX, FB); x.stroke();
        x.fillStyle = '#111827';
        for (i = 0; i < 6; i++) {
          x.beginPath(); x.arc(POCK[i][0], POCK[i][1], PR - 1, 0, Math.PI * 2); x.fill();
        }
        for (i = 7; i >= 0; i--) {
          var b = balls[i];
          if (!b.a) continue;
          x.fillStyle = b.c; x.strokeStyle = 'rgba(0,0,0,0.35)'; x.lineWidth = 1;
          x.beginPath(); x.arc(b.x, b.y, R, 0, Math.PI * 2); x.fill(); x.stroke();
          x.fillStyle = 'rgba(255,255,255,0.55)';
          x.beginPath(); x.arc(b.x - 2.5, b.y - 2.5, 2, 0, Math.PI * 2); x.fill();
        }

        var pw = -1;
        if (aim && canAim()) {
          var cb = balls[0], dx = aim.cx - aim.sx, dy = aim.cy - aim.sy, len = Math.sqrt(dx * dx + dy * dy);
          if (len > 4) {
            var ux = -dx / len, uy = -dy / len;
            pw = Math.min(len, 110) / 110;
            var pull = 6 + pw * 34;
            x.setLineDash([4, 5]); x.strokeStyle = 'rgba(255,255,255,0.75)'; x.lineWidth = 1.5;
            x.beginPath(); x.moveTo(cb.x + ux * R, cb.y + uy * R); x.lineTo(cb.x + ux * 170, cb.y + uy * 170); x.stroke();
            x.setLineDash([]);
            x.strokeStyle = '#fcd34d'; x.lineWidth = 4; x.lineCap = 'round';
            x.beginPath();
            x.moveTo(cb.x - ux * (R + pull), cb.y - uy * (R + pull));
            x.lineTo(cb.x - ux * (R + pull + 110), cb.y - uy * (R + pull + 110));
            x.stroke();
          }
        }

        // HUD
        x.textBaseline = 'alphabetic';
        x.font = '700 14px Nunito Sans, sans-serif';
        if (mode === 'online') {
          var mine = (turn === me), live = (pstate === 'aim' || pstate === 'sim' || pstate === 'syncwait');
          x.textAlign = 'left';
          x.fillStyle = (live && mine) ? '#ea580c' : '#94a3b8';
          x.fillText((live && mine ? '● ' : '') + 'Bạn ' + score[me], 14, 22);
          x.textAlign = 'right';
          x.fillStyle = (live && !mine) ? '#ea580c' : '#94a3b8';
          x.fillText('Đối thủ ' + score[1 - me] + (live && !mine ? ' ●' : ''), W - 14, 22);
        } else if (mode === 'solo') {
          x.textAlign = 'left'; x.fillStyle = '#ea580c';
          x.fillText('Đã bỏ ' + score[0] + '/7', 14, 22);
          x.textAlign = 'right'; x.fillStyle = '#9a3412';
          x.fillText('Số cú ' + shots, W - 14, 22);
        }
        x.textAlign = 'center';
        if (pw >= 0) {
          x.fillStyle = '#fed7aa'; x.fillRect(190, 12, 100, 8);
          x.fillStyle = pw < 0.5 ? '#f59e0b' : '#dc2626'; x.fillRect(190, 12, 100 * pw, 8);
        } else {
          x.font = '600 12px Nunito Sans, sans-serif'; x.fillStyle = '#9a3412';
          var t = '';
          if (pstate === 'wait') t = 'Chờ đối thủ...';
          else if (pstate === 'syncwait') t = 'Đang đồng bộ...';
          else if (pstate === 'aim' && mode === 'online') t = turn === me ? 'Lượt của bạn' : 'Lượt đối thủ';
          x.fillText(t, W / 2, 22);
        }

        if (pstate === 'menu' || pstate === 'wait') {
          x.fillStyle = 'rgba(255,255,255,0.78)';
          x.fillRect(FL, FT, FR - FL, FB - FT);
          x.fillStyle = '#7c2d12'; x.font = '700 18px Nunito Sans, sans-serif';
          x.fillText(pstate === 'menu' ? 'Bi-a mini 🎱' : 'Đang chờ bạn bè vào phòng...', W / 2, 140);
          x.fillStyle = '#64748b'; x.font = '500 13px Nunito Sans, sans-serif';
          x.fillText(pstate === 'menu' ? 'Chọn chế độ ở bên dưới' : 'Mã phòng: ' + roomCode, W / 2, 164);
        }
        if (pstate === 'over') {
          x.fillStyle = 'rgba(255,255,255,0.82)';
          x.fillRect(FL, FT, FR - FL, FB - FT);
          x.fillStyle = '#1e293b'; x.font = '700 22px Nunito Sans, sans-serif';
          var res;
          if (mode === 'solo') res = 'Xong rồi! ' + shots + ' cú';
          else res = score[me] > score[1 - me] ? 'Bạn thắng! 🎉' : 'Đối thủ thắng';
          x.fillText(res, W / 2, 140);
          x.fillStyle = '#64748b'; x.font = '500 14px Nunito Sans, sans-serif';
          x.fillText('Chạm để chơi lại', W / 2, 166);
        }
        x.textAlign = 'left';
      }

      // Nút điều khiển
      el('pSolo').onclick = function () {
        closeWs(); mode = 'solo'; rack(); pstate = 'aim';
        showMenu(false); setMsg('');
      };
      el('pCreate').onclick = function () {
        var code = '';
        for (var i = 0; i < 4; i++) code += A.charAt(Math.floor(Math.random() * A.length));
        showMenu(false); connect(code);
      };
      el('pJoin').onclick = function () {
        var v = clean(el('pCode').value);
        if (v.length !== 4) { setMsg('Nhập đủ 4 ký tự mã phòng.'); return; }
        showMenu(false); connect(v);
      };
      el('pBack').onclick = toMenu;

      rack();
      return {
        w: 480, h: 270,
        hint: 'Kéo ngược từ bất kỳ đâu để ngắm và chỉnh lực, thả tay để bắn',
        update: update,
        draw: draw,
        down: down, move: move, up: up, cancel: cancel,
        key: function () {},
        leave: toMenu,
        busy: function () { return mode === 'online' && ws !== null; }
      };
    })();

`;
