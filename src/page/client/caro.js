// Một đoạn của script phía trình duyệt, được nối lại theo thứ tự trong render.js (cùng một phạm vi).
// Lưu ý: nội dung nằm trong template literal nên KHÔNG dùng backtick, dấu đô-la + ngoặc nhọn
// hay dấu gạch chéo ngược trong phần chuỗi này.
export const clientCaro = `    // ===================== CARO =====================
    // Bàn 15x15, 5 quân liên tiếp thắng. Theo luật caro Việt Nam: bị chặn cả hai đầu thì không tính (đổi STRICT = false để bỏ luật này).
    var caro = (function () {
      var N = 15, CS = 29, X0 = 22, Y0 = 40, CW = 480, CH = 480;
      var STRICT = true;
      var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      var DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
      var board = [], cstate = 'menu', mode = '', me = 0, turn = 0, last = null, win = null, winner = -2;
      var pend = null, hover = null, ws = null, roomCode = '', connId = 0, overAt = 0, botWait = 0;

      function el(id) { return document.getElementById(id); }
      function setMsg(t) { el('cMsg').textContent = t; }
      function showMenu(on) { el('cMenu').hidden = !on; el('cBack').hidden = on; }
      function clean(s) { return s.toUpperCase().replace(/[^A-Z0-9]/g, ''); }
      function myIdx() { return mode === 'bot' ? 0 : me; }

      function reset() {
        board = [];
        for (var i = 0; i < N * N; i++) board.push(0);
        turn = 0; last = null; win = null; winner = -2; pend = null; hover = null; botWait = 0;
      }

      function run(r, c, dr, dc, p) {
        var n = 0;
        r += dr; c += dc;
        while (r >= 0 && r < N && c >= 0 && c < N && board[r * N + c] === p) { n++; r += dr; c += dc; }
        return [n, r, c];
      }
      function isOpen(e) { return e[1] >= 0 && e[1] < N && e[2] >= 0 && e[2] < N && board[e[1] * N + e[2]] === 0; }
      function lineOf(r, c, dr, dc, p) {
        var a = run(r, c, dr, dc, p), b = run(r, c, -dr, -dc, p);
        return { len: 1 + a[0] + b[0], open: (isOpen(a) ? 1 : 0) + (isOpen(b) ? 1 : 0), a: a, b: b };
      }
      function checkWin(r, c, p) {
        for (var d = 0; d < 4; d++) {
          var dr = DIRS[d][0], dc = DIRS[d][1], L = lineOf(r, c, dr, dc, p);
          if (L.len >= 5 && (!STRICT || L.open > 0)) {
            var cells = [];
            for (var k = -L.b[0]; k <= L.a[0]; k++) cells.push([r + dr * k, c + dc * k]);
            return cells;
          }
        }
        return null;
      }

      function place(r, c, mover) {
        board[r * N + c] = mover + 1; last = [r, c]; pend = null;
        var w = checkWin(r, c, mover + 1);
        if (w) { win = w; winner = mover; cstate = 'over'; overAt = performance.now(); return; }
        var full = true;
        for (var i = 0; i < N * N; i++) if (board[i] === 0) { full = false; break; }
        if (full) { winner = -1; cstate = 'over'; overAt = performance.now(); return; }
        turn = 1 - turn;
        if (mode === 'bot' && turn === 1) botWait = 0.45;
      }

      // ---- Máy đánh: chấm điểm tấn công + phòng thủ cho từng ô gần quân đã đánh
      function score(n, open) {
        if (n >= 5) return (open > 0 || !STRICT) ? 100000 : 0;
        if (n === 4) return open === 2 ? 10000 : (open === 1 ? 1000 : 0);
        if (n === 3) return open === 2 ? 1000 : (open === 1 ? 100 : 0);
        if (n === 2) return open === 2 ? 100 : (open === 1 ? 10 : 0);
        return open === 2 ? 10 : 1;
      }
      function evalCell(r, c, p) {
        board[r * N + c] = p;
        var s = 0;
        for (var d = 0; d < 4; d++) {
          var L = lineOf(r, c, DIRS[d][0], DIRS[d][1], p);
          s += score(L.len, L.open);
        }
        board[r * N + c] = 0;
        return s;
      }
      function near(r, c) {
        for (var dr = -2; dr <= 2; dr++) {
          for (var dc = -2; dc <= 2; dc++) {
            var rr = r + dr, cc = c + dc;
            if (rr >= 0 && rr < N && cc >= 0 && cc < N && board[rr * N + cc] !== 0) return true;
          }
        }
        return false;
      }
      function botMove() {
        var any = false;
        for (var i = 0; i < N * N; i++) if (board[i] !== 0) { any = true; break; }
        if (!any) { place(7, 7, 1); return; }
        var best = -1, br = -1, bc = -1;
        for (var r = 0; r < N; r++) {
          for (var c = 0; c < N; c++) {
            if (board[r * N + c] !== 0 || !near(r, c)) continue;
            var sc = evalCell(r, c, 2) + evalCell(r, c, 1) * 0.95 + Math.random();
            if (sc > best) { best = sc; br = r; bc = c; }
          }
        }
        if (br >= 0) place(br, bc, 1);
      }

      function canMove() {
        return cstate === 'play' && (mode === 'bot' ? turn === 0 : (mode === 'online' && turn === me));
      }
      function cellAt(px, py) {
        var c = Math.floor((px - X0) / CS), r = Math.floor((py - Y0) / CS);
        if (r < 0 || r >= N || c < 0 || c >= N) return null;
        return [r, c];
      }
      function commit(r, c) {
        if (mode === 'online') send({ t: 'move', r: r, c: c });
        place(r, c, myIdx());
      }
      function down(px, py, pt) {
        if (cstate === 'over') { if (performance.now() - overAt > 400) rematch(); return; }
        if (!canMove()) return;
        var ce = cellAt(px, py);
        if (!ce || board[ce[0] * N + ce[1]] !== 0) return;
        // Màn hình cảm ứng: chạm lần 1 để chọn ô, chạm lần 2 vào đúng ô đó để đánh
        if (pt === 'touch' && !(pend && pend[0] === ce[0] && pend[1] === ce[1])) { pend = ce; return; }
        commit(ce[0], ce[1]);
      }
      function move(px, py, pt) { hover = (pt === 'mouse') ? cellAt(px, py) : null; }
      function out() { hover = null; }

      function update(dt) {
        if (mode === 'bot' && cstate === 'play' && turn === 1) {
          botWait -= dt;
          if (botWait <= 0) botMove();
        }
      }

      // ---- Mạng
      function send(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
      function closeWs() {
        var w = ws; ws = null;
        if (w) { try { w.close(); } catch (e) {} }
      }
      function toMenu() {
        connId++;
        closeWs(); mode = ''; cstate = 'menu'; reset();
        showMenu(true); setMsg('');
      }
      function rematch() {
        if (mode === 'online') send({ t: 'again' });
        reset(); cstate = 'play';
      }
      function onMsg(m) {
        if (m.t === 'hello') {
          me = m.idx;
          setMsg('Mã phòng: ' + roomCode + '. Gửi mã này cho bạn bè nhé!');
        } else if (m.t === 'start') {
          reset(); cstate = 'play';
          setMsg('Phòng ' + roomCode + ' • Bạn là ' + (me === 0 ? 'X (đi trước)' : 'O'));
        } else if (m.t === 'move') {
          if (cstate !== 'play' || turn === me) return;
          var r = m.r, c = m.c;
          if (typeof r !== 'number' || typeof c !== 'number' || r < 0 || r >= N || c < 0 || c >= N) return;
          if (board[r * N + c] !== 0) return;
          place(r, c, 1 - me);
        } else if (m.t === 'again') {
          if (cstate === 'over') { reset(); cstate = 'play'; }
        } else if (m.t === 'left') {
          reset(); cstate = 'wait';
          setMsg('Đối thủ đã thoát. Mã phòng ' + roomCode + ' vẫn đang chờ người vào.');
        }
      }
      function connect(code) {
        closeWs();
        var token = ++connId;
        mode = 'online'; roomCode = code; cstate = 'wait'; me = 0; reset();
        setMsg('Đang kiểm tra kết nối...');
        fetch('/__game/ws?room=' + code + '&g=caro', { cache: 'no-store' }).then(function (r) {
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
        var url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/__game/ws?room=' + code + '&g=caro';
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

      // ---- Vẽ
      function mark(cx, cy, v, alpha) {
        var px = X0 + cx * CS + CS / 2, py = Y0 + cy * CS + CS / 2;
        x.globalAlpha = alpha; x.lineWidth = 3; x.lineCap = 'round';
        if (v === 1) {
          x.strokeStyle = '#ea580c';
          x.beginPath();
          x.moveTo(px - 8, py - 8); x.lineTo(px + 8, py + 8);
          x.moveTo(px + 8, py - 8); x.lineTo(px - 8, py + 8);
          x.stroke();
        } else {
          x.strokeStyle = '#2563eb';
          x.beginPath(); x.arc(px, py, 9, 0, Math.PI * 2); x.stroke();
        }
        x.globalAlpha = 1;
      }

      function draw() {
        var i, r, c;
        x.clearRect(0, 0, CW, CH);
        x.fillStyle = '#fff7ed'; x.fillRect(0, 0, CW, CH);
        x.fillStyle = '#fffbeb'; x.fillRect(X0, Y0, N * CS, N * CS);
        if (last) { x.fillStyle = 'rgba(253,186,116,0.5)'; x.fillRect(X0 + last[1] * CS, Y0 + last[0] * CS, CS, CS); }
        if (win) {
          x.fillStyle = 'rgba(250,204,21,0.55)';
          for (i = 0; i < win.length; i++) x.fillRect(X0 + win[i][1] * CS, Y0 + win[i][0] * CS, CS, CS);
        }
        x.strokeStyle = '#fdba74'; x.lineWidth = 1;
        x.beginPath();
        for (i = 0; i <= N; i++) {
          x.moveTo(X0 + i * CS + 0.5, Y0); x.lineTo(X0 + i * CS + 0.5, Y0 + N * CS);
          x.moveTo(X0, Y0 + i * CS + 0.5); x.lineTo(X0 + N * CS, Y0 + i * CS + 0.5);
        }
        x.stroke();
        x.strokeStyle = '#ea580c'; x.lineWidth = 2; x.strokeRect(X0, Y0, N * CS, N * CS);
        for (r = 0; r < N; r++) {
          for (c = 0; c < N; c++) {
            if (board[r * N + c]) mark(c, r, board[r * N + c], 1);
          }
        }
        var ghost = pend || hover;
        if (ghost && canMove() && board[ghost[0] * N + ghost[1]] === 0) {
          mark(ghost[1], ghost[0], myIdx() + 1, 0.4);
          if (pend) {
            x.strokeStyle = '#ea580c'; x.lineWidth = 1.5;
            x.strokeRect(X0 + ghost[1] * CS + 1.5, Y0 + ghost[0] * CS + 1.5, CS - 3, CS - 3);
          }
        }

        // HUD
        var live = (cstate === 'play');
        var mine = (turn === myIdx());
        var myMark = myIdx() === 0 ? 'X' : 'O', opMark = myIdx() === 0 ? 'O' : 'X';
        x.font = '700 15px Nunito Sans, sans-serif'; x.textBaseline = 'alphabetic';
        x.textAlign = 'left';
        x.fillStyle = (live && mine) ? '#ea580c' : '#94a3b8';
        x.fillText((live && mine ? '● ' : '') + 'Bạn (' + myMark + ')', 22, 26);
        x.textAlign = 'right';
        x.fillStyle = (live && !mine) ? '#ea580c' : '#94a3b8';
        x.fillText((mode === 'bot' ? 'Máy' : 'Đối thủ') + ' (' + opMark + ')' + (live && !mine ? ' ●' : ''), W2() - 22, 26);
        x.textAlign = 'center';

        if (cstate === 'menu' || cstate === 'wait') {
          x.fillStyle = 'rgba(255,255,255,0.82)';
          x.fillRect(X0, Y0, N * CS, N * CS);
          x.fillStyle = '#7c2d12'; x.font = '700 22px Nunito Sans, sans-serif';
          x.fillText(cstate === 'menu' ? 'Caro ⭕❌' : 'Đang chờ bạn bè vào phòng...', CW / 2, 250);
          x.fillStyle = '#64748b'; x.font = '500 14px Nunito Sans, sans-serif';
          x.fillText(cstate === 'menu' ? 'Chọn chế độ ở bên dưới' : 'Mã phòng: ' + roomCode, CW / 2, 280);
        }
        if (cstate === 'over') {
          var res;
          if (winner === -1) res = 'Hòa!';
          else if (winner === myIdx()) res = 'Bạn thắng! 🎉';
          else res = mode === 'bot' ? 'Máy thắng' : 'Đối thủ thắng';
          x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillRect(70, 200, 340, 90);
          x.strokeStyle = '#fdba74'; x.lineWidth = 2; x.strokeRect(70, 200, 340, 90);
          x.fillStyle = '#1e293b'; x.font = '700 24px Nunito Sans, sans-serif';
          x.fillText(res, CW / 2, 238);
          x.fillStyle = '#64748b'; x.font = '500 14px Nunito Sans, sans-serif';
          x.fillText('Chạm để chơi lại', CW / 2, 268);
        }
        x.textAlign = 'left';
      }
      function W2() { return CW; }

      el('cBot').onclick = function () {
        closeWs(); connId++; mode = 'bot'; reset(); cstate = 'play';
        showMenu(false); setMsg('Bạn là X và đi trước.');
      };
      el('cCreate').onclick = function () {
        var code = '';
        for (var i = 0; i < 4; i++) code += A.charAt(Math.floor(Math.random() * A.length));
        showMenu(false); connect(code);
      };
      el('cJoin').onclick = function () {
        var v = clean(el('cCode').value);
        if (v.length !== 4) { setMsg('Nhập đủ 4 ký tự mã phòng.'); return; }
        showMenu(false); connect(v);
      };
      el('cBack').onclick = toMenu;

      reset();
      globalThis.__c = function () { return { board: board, cstate: cstate, turn: turn, winner: winner, mode: mode, me: me, win: win }; };
      return {
        w: CW, h: CH,
        hint: 'Chạm vào ô để đánh (trên điện thoại: chạm lần 1 để chọn ô, chạm lần 2 để xác nhận)',
        update: update, draw: draw, down: down, move: move, out: out,
        key: function () {},
        leave: toMenu,
        busy: function () { return mode === 'online' && ws !== null; }
      };
    })();

`;
