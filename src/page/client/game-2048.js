// Một đoạn của script phía trình duyệt, được nối lại theo thứ tự trong render.js (cùng một phạm vi).
// Lưu ý: nội dung nằm trong template literal nên KHÔNG dùng backtick, dấu đô-la + ngoặc nhọn
// hay dấu gạch chéo ngược trong phần chuỗi này.
export const client2048 = `    // ===================== GAME 2048 =====================
    var game2048 = (function () {
      var CW = 480, CH = 480;
      var N = 4;
      var grid = [];
      var score = 0, best = 0, eggs = 0;
      var history = [];
      var state = 'play'; // 'play', 'won', 'over'
      var mode = 'solo';  // 'solo', 'rush', 'obstacle', 'online'
      var keepPlaying = false;
      var rushTime = 60;
      var touchStart = null, touchLast = null;
      var themeIdx = 0;
      var combo = 0, lastMergeTime = 0;
      var floatTexts = [];
      var confetti = [];
      var obstacles = [];
      var ws = null, roomCode = '', onlineRole = 0, opponentGrid = null, opponentScore = 0;
      var frozenTurns = 0;

      try { best = +localStorage.getItem('2048_best') || 0; } catch (e) {}
      try { eggs = +localStorage.getItem('egg_currency_balance') || 0; } catch (e) {}

      function el(id) { return document.getElementById(id); }
      function setMsg(t) { var m = el('g2048Msg'); if (m) m.textContent = t; }

      // ---- Âm thanh Web Audio API tổng hợp ----
      var actx = null;
      function getAudio() {
        if (!actx) {
          try {
            var AudioCtx = window.AudioContext || window.webkitAudioContext;
            if (AudioCtx) actx = new AudioCtx();
          } catch (e) {}
        }
        if (actx && actx.state === 'suspended') actx.resume();
        return actx;
      }

      function sndSlide() {
        var ac = getAudio();
        if (!ac) return;
        try {
          var osc = ac.createOscillator();
          var g = ac.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(160, ac.currentTime);
          osc.frequency.exponentialRampToValueAtTime(75, ac.currentTime + 0.05);
          g.gain.setValueAtTime(0.08, ac.currentTime);
          g.gain.linearRampToValueAtTime(0.001, ac.currentTime + 0.05);
          osc.connect(g);
          g.connect(ac.destination);
          osc.start();
          osc.stop(ac.currentTime + 0.05);
        } catch (e) {}
      }

      var PENTATONIC = {
        4: 261.63, 8: 293.66, 16: 329.63, 32: 392.00, 64: 440.00,
        128: 523.25, 256: 587.33, 512: 659.25, 1024: 783.99, 2048: 1046.50
      };

      function sndMerge(val) {
        var ac = getAudio();
        if (!ac) return;
        try {
          var f = PENTATONIC[val] || 523.25;
          var osc = ac.createOscillator();
          var g = ac.createGain();
          osc.type = val >= 1024 ? 'triangle' : 'sine';
          osc.frequency.setValueAtTime(f, ac.currentTime);
          if (val >= 2048) {
            osc.frequency.exponentialRampToValueAtTime(f * 1.5, ac.currentTime + 0.18);
          }
          g.gain.setValueAtTime(0.18, ac.currentTime);
          g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + (val >= 2048 ? 0.35 : 0.16));
          osc.connect(g);
          g.connect(ac.destination);
          osc.start();
          osc.stop(ac.currentTime + (val >= 2048 ? 0.35 : 0.16));
        } catch (e) {}
        if (navigator.vibrate) {
          try { navigator.vibrate(val >= 2048 ? [30, 40, 50] : 12); } catch (e) {}
        }
      }

      function sndWin() {
        var ac = getAudio();
        if (!ac) return;
        try {
          var notes = [523.25, 659.25, 783.99, 1046.50];
          for (var i = 0; i < notes.length; i++) {
            (function (idx) {
              var osc = ac.createOscillator();
              var g = ac.createGain();
              osc.type = 'triangle';
              osc.frequency.setValueAtTime(notes[idx], ac.currentTime + idx * 0.08);
              g.gain.setValueAtTime(0.15, ac.currentTime + idx * 0.08);
              g.gain.linearRampToValueAtTime(0.001, ac.currentTime + idx * 0.08 + 0.3);
              osc.connect(g);
              g.connect(ac.destination);
              osc.start(ac.currentTime + idx * 0.08);
              osc.stop(ac.currentTime + idx * 0.08 + 0.3);
            })(i);
          }
        } catch (e) {}
      }

      function sndOver() {
        var ac = getAudio();
        if (!ac) return;
        try {
          var osc = ac.createOscillator();
          var g = ac.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(140, ac.currentTime);
          osc.frequency.linearRampToValueAtTime(60, ac.currentTime + 0.3);
          g.gain.setValueAtTime(0.12, ac.currentTime);
          g.gain.linearRampToValueAtTime(0.001, ac.currentTime + 0.3);
          osc.connect(g);
          g.connect(ac.destination);
          osc.start();
          osc.stop(ac.currentTime + 0.3);
        } catch (e) {}
      }

      // ---- 4 Bộ Chủ Đề (Themes) ----
      var THEMES = [
        {
          id: 'mebi',
          name: 'Trứng Hồng',
          bg: '#fdf8f0',
          boardBg: '#e8dcce',
          emptyBg: '#dfd2c1',
          headText: '#7c2d12',
          subText: '#9a3412',
          colors: {
            2: { bg: '#fff7ed', fg: '#9a3412', name: 'Trứng gà so', icon: '🥚' },
            4: { bg: '#ffedd5', fg: '#9a3412', name: 'Trứng thảo mộc', icon: '🥚' },
            8: { bg: '#fed7aa', fg: '#7c2d12', name: 'Trứng hồng', icon: '🌸' },
            16: { bg: '#fdba74', fg: '#431407', name: 'Vỉ 4 quả', icon: '📦' },
            32: { bg: '#fb923c', fg: '#fff', name: 'Hộp 6 quả', icon: '📦' },
            64: { bg: '#f97316', fg: '#fff', name: 'Hộp 10 trứng', icon: '🍱' },
            128: { bg: '#ea580c', fg: '#fff', name: 'Gà con vàng', icon: '🐣' },
            256: { bg: '#c2410c', fg: '#fff', name: 'Gà tre dũng mãnh', icon: '🐓' },
            512: { bg: '#9a3412', fg: '#fff', name: 'Gà đẻ trứng vàng', icon: '👑' },
            1024: { bg: '#7c2d12', fg: '#fff', name: 'Chuồng trại IoT', icon: '🏡' },
            2048: { bg: '#eab308', fg: '#fff', name: 'Mebi Farm Đại Thắng', icon: '🏆' }
          }
        },
        {
          id: 'classic',
          name: 'Cổ Điển',
          bg: '#faf8ef',
          boardBg: '#bbada0',
          emptyBg: '#cdc1b4',
          headText: '#776e65',
          subText: '#8f7a66',
          colors: {
            2: { bg: '#eee4da', fg: '#776e65', name: '', icon: '' },
            4: { bg: '#ede0c8', fg: '#776e65', name: '', icon: '' },
            8: { bg: '#f2b179', fg: '#f9f6f2', name: '', icon: '' },
            16: { bg: '#f59563', fg: '#f9f6f2', name: '', icon: '' },
            32: { bg: '#f67c5f', fg: '#f9f6f2', name: '', icon: '' },
            64: { bg: '#f65e3b', fg: '#f9f6f2', name: '', icon: '' },
            128: { bg: '#edcf72', fg: '#f9f6f2', name: '', icon: '' },
            256: { bg: '#edcc61', fg: '#f9f6f2', name: '', icon: '' },
            512: { bg: '#edc850', fg: '#f9f6f2', name: '', icon: '' },
            1024: { bg: '#edc53f', fg: '#f9f6f2', name: '', icon: '' },
            2048: { bg: '#edc22e', fg: '#f9f6f2', name: '', icon: '' }
          }
        },
        {
          id: 'cyber',
          name: 'Cyber Neon',
          bg: '#0f172a',
          boardBg: '#1e293b',
          emptyBg: '#334155',
          headText: '#38bdf8',
          subText: '#94a3b8',
          colors: {
            2: { bg: '#1e3a5f', fg: '#38bdf8', name: 'Bit', icon: '⚡' },
            4: { bg: '#0369a1', fg: '#e0f2fe', name: 'Byte', icon: '💾' },
            8: { bg: '#0891b2', fg: '#fff', name: 'Kilo', icon: '🔹' },
            16: { bg: '#0d9488', fg: '#fff', name: 'Mega', icon: '💠' },
            32: { bg: '#059669', fg: '#fff', name: 'Giga', icon: '🔋' },
            64: { bg: '#d97706', fg: '#fff', name: 'Tera', icon: '💥' },
            128: { bg: '#dc2626', fg: '#fff', name: 'Peta', icon: '🔥' },
            256: { bg: '#c026d3', fg: '#fff', name: 'Exa', icon: '🔮' },
            512: { bg: '#7c3aed', fg: '#fff', name: 'Zetta', icon: '🌐' },
            1024: { bg: '#4f46e5', fg: '#fff', name: 'Yotta', icon: '🛸' },
            2048: { bg: '#06b6d4', fg: '#fff', name: 'CYBER CORE', icon: '💎' }
          }
        },
        {
          id: 'retro',
          name: 'Pixel 8-Bit',
          bg: '#22252a',
          boardBg: '#343a40',
          emptyBg: '#495057',
          headText: '#f8f9fa',
          subText: '#adb5bd',
          colors: {
            2: { bg: '#6c757d', fg: '#fff', name: 'Lvl 1', icon: '👾' },
            4: { bg: '#495057', fg: '#fff', name: 'Lvl 2', icon: '🎮' },
            8: { bg: '#0d6efd', fg: '#fff', name: 'Lvl 3', icon: '🕹️' },
            16: { bg: '#198754', fg: '#fff', name: 'Lvl 4', icon: '🪙' },
            32: { bg: '#ffc107', fg: '#212529', name: 'Lvl 5', icon: '⭐' },
            64: { bg: '#fd7e14', fg: '#fff', name: 'Lvl 6', icon: '🚀' },
            128: { bg: '#dc3545', fg: '#fff', name: 'Lvl 7', icon: '⚔️' },
            256: { bg: '#6f42c1', fg: '#fff', name: 'Lvl 8', icon: '🛡️' },
            512: { bg: '#d63384', fg: '#fff', name: 'Lvl 9', icon: '✨' },
            1024: { bg: '#20c997', fg: '#212529', name: 'Boss', icon: '👑' },
            2048: { bg: '#ffea00', fg: '#000', name: 'VICTORY', icon: '🏆' }
          }
        }
      ];

      // ---- Khởi tạo bàn cờ & ma trận ----
      function createEmpty() {
        var g = [];
        for (var r = 0; r < N; r++) {
          var row = [];
          for (var c = 0; c < N; c++) row.push(0);
          g.push(row);
        }
        return g;
      }

      function getEmptyCells() {
        var res = [];
        for (var r = 0; r < N; r++) {
          for (var c = 0; c < N; c++) {
            if (grid[r][c] === 0 && !isObstacle(r, c)) res.push({ r: r, c: c });
          }
        }
        return res;
      }

      function isObstacle(r, c) {
        for (var i = 0; i < obstacles.length; i++) {
          if (obstacles[i].r === r && obstacles[i].c === c) return true;
        }
        return false;
      }

      function spawnTile() {
        var empty = getEmptyCells();
        if (empty.length === 0) return false;
        var p = empty[Math.floor(Math.random() * empty.length)];
        var val = Math.random() < 0.9 ? 2 : 4;
        grid[p.r][p.c] = val;
        return true;
      }

      function saveEggs(gain) {
        if (!gain) return;
        eggs += gain;
        try { localStorage.setItem('egg_currency_balance', String(eggs)); } catch (e) {}
      }

      function saveBest() {
        if (score > best) {
          best = score;
          try { localStorage.setItem('2048_best', String(best)); } catch (e) {}
        }
      }

      function saveHistory() {
        var copy = [];
        for (var r = 0; r < N; r++) copy.push(grid[r].slice());
        history.push({ grid: copy, score: score, eggs: eggs, rushTime: rushTime });
        if (history.length > 5) history.shift();
      }

      function undo() {
        if (history.length === 0 || state === 'over') return;
        var lastState = history.pop();
        grid = lastState.grid;
        score = lastState.score;
        eggs = lastState.eggs;
        rushTime = lastState.rushTime;
        state = 'play';
        setMsg('Đã hoàn tác 1 bước.');
      }

      function reset() {
        grid = createEmpty();
        score = 0;
        history = [];
        state = 'play';
        keepPlaying = false;
        rushTime = 60;
        combo = 0;
        floatTexts = [];
        confetti = [];
        obstacles = [];
        frozenTurns = 0;

        if (mode === 'obstacle') {
          // Sinh 1-2 khối đá cố định ở giữa
          obstacles = [{ r: 1, c: 1 }, { r: 2, c: 2 }];
        }

        spawnTile();
        spawnTile();
        updateHUD();
        setMsg(mode === 'rush' ? 'Đua 60s: Gộp ô nhanh để cộng thêm thời gian!' : 'Dùng phím mũi tên, WASD hoặc vuốt để chơi.');
      }

      function updateHUD() {
        saveBest();
        var modeBtn = el('g2048Mode');
        if (modeBtn) {
          var modeLabel = 'Đơn';
          if (mode === 'rush') modeLabel = 'Đua 60s (' + Math.ceil(rushTime) + 's)';
          else if (mode === 'obstacle') modeLabel = 'Chướng ngại';
          else if (mode === 'online') modeLabel = 'Phòng ' + (roomCode || '...');
          modeBtn.textContent = 'Chế độ: ' + modeLabel;
        }
      }

      // ---- Logic Trượt & Gộp Ô ----
      function slideLine(line) {
        var filtered = [];
        for (var i = 0; i < line.length; i++) {
          if (line[i] !== 0 && line[i] !== -1) filtered.push(line[i]);
        }
        var merged = [];
        var gained = 0;
        var mergeCount = 0;

        for (var j = 0; j < filtered.length; j++) {
          if (j < filtered.length - 1 && filtered[j] === filtered[j + 1]) {
            var mVal = filtered[j] * 2;
            merged.push(mVal);
            gained += mVal;
            mergeCount++;
            j++; // Không gộp 2 lần trong 1 lượt!
          } else {
            merged.push(filtered[j]);
          }
        }
        while (merged.length < line.length) merged.push(0);
        return { line: merged, gained: gained, mergeCount: mergeCount };
      }

      function canMove() {
        for (var r = 0; r < N; r++) {
          for (var c = 0; c < N; c++) {
            if (grid[r][c] === 0 && !isObstacle(r, c)) return true;
          }
        }
        for (var r = 0; r < N; r++) {
          for (var c = 0; c < N; c++) {
            var v = grid[r][c];
            if (v === -1 || isObstacle(r, c)) continue;
            if (r < N - 1 && grid[r + 1][c] === v && !isObstacle(r + 1, c)) return true;
            if (c < N - 1 && grid[r][c + 1] === v && !isObstacle(r, c + 1)) return true;
          }
        }
        return false;
      }

      function slide(dir) {
        // dir: 0: Lên, 1: Phải, 2: Xuống, 3: Trái
        if (state === 'over') return;
        if (state === 'won' && !keepPlaying) return;
        if (frozenTurns > 0) {
          frozenTurns--;
          setMsg('Bàn cờ đang bị đóng băng! Còn ' + frozenTurns + ' lượt.');
          return;
        }

        saveHistory();
        var moved = false;
        var turnScore = 0;
        var totalMerges = 0;
        var maxMergedVal = 0;

        var prevGrid = [];
        for (var r = 0; r < N; r++) prevGrid.push(grid[r].slice());

        if (dir === 3) { // Trái
          for (var r = 0; r < N; r++) {
            var res = slideLine(grid[r]);
            grid[r] = res.line;
            turnScore += res.gained;
            totalMerges += res.mergeCount;
          }
        } else if (dir === 1) { // Phải
          for (var r = 0; r < N; r++) {
            var rev = grid[r].slice().reverse();
            var res = slideLine(rev);
            grid[r] = res.line.reverse();
            turnScore += res.gained;
            totalMerges += res.mergeCount;
          }
        } else if (dir === 0) { // Lên
          for (var c = 0; c < N; c++) {
            var col = [];
            for (var r = 0; r < N; r++) col.push(grid[r][c]);
            var res = slideLine(col);
            for (var r = 0; r < N; r++) grid[r][c] = res.line[r];
            turnScore += res.gained;
            totalMerges += res.mergeCount;
          }
        } else if (dir === 2) { // Xuống
          for (var c = 0; c < N; c++) {
            var col = [];
            for (var r = 0; r < N; r++) col.push(grid[r][c]);
            col.reverse();
            var res = slideLine(col);
            res.line.reverse();
            for (var r = 0; r < N; r++) grid[r][c] = res.line[r];
            turnScore += res.gained;
            totalMerges += res.mergeCount;
          }
        }

        // Khôi phục vị trí các ô chướng ngại vật
        for (var o = 0; o < obstacles.length; o++) {
          grid[obstacles[o].r][obstacles[o].c] = -1;
        }

        // Kiểm tra xem có ô nào thay đổi không
        for (var r = 0; r < N; r++) {
          for (var c = 0; c < N; c++) {
            if (grid[r][c] !== prevGrid[r][c]) { moved = true; break; }
          }
          if (moved) break;
        }

        if (!moved) {
          history.pop(); // Không tính lượt
          return;
        }

        // Xử lý điểm số & Combo
        sndSlide();
        if (turnScore > 0) {
          var now = performance.now();
          if (now - lastMergeTime < 1800) combo++;
          else combo = 1;
          lastMergeTime = now;

          var mult = combo >= 3 ? 1.5 : (combo === 2 ? 1.2 : 1.0);
          var finalGain = Math.round(turnScore * mult);
          score += finalGain;

          // Thưởng Hộp Trứng mỗi 500 điểm
          var prevEggs = Math.floor((score - finalGain) / 500);
          var curEggs = Math.floor(score / 500);
          if (curEggs > prevEggs) {
            var eggDiff = curEggs - prevEggs;
            saveEggs(eggDiff);
            floatTexts.push({ text: '+' + eggDiff + ' Hộp trứng 📦', x: CW / 2, y: 70, alpha: 1.0, color: '#f59e0b' });
          }

          floatTexts.push({ text: '+' + finalGain + (combo > 1 ? ' (x' + mult + ' Combo!)' : ''), x: CW / 2, y: 95, alpha: 1.0, color: '#ea580c' });
          sndMerge(maxMergedVal || turnScore);

          if (mode === 'rush') {
            rushTime = Math.min(120, rushTime + (turnScore >= 128 ? 3 : 1));
          }
        }

        spawnTile();
        updateHUD();

        // Kiểm tra điều kiện thắng
        if (!keepPlaying && state === 'play') {
          for (var r = 0; r < N; r++) {
            for (var c = 0; c < N; c++) {
              if (grid[r][c] >= 2048) {
                state = 'won';
                sndWin();
                spawnConfetti();
                saveEggs(10); // Thưởng lớn 10 Hộp trứng khi chạm mốc 2048!
                setMsg('XUẤT SẮC! Bạn đã đạt ô 2048 và nhận 10 Hộp trứng!');
                break;
              }
            }
            if (state === 'won') break;
          }
        }

        // Kiểm tra điều kiện thua
        if (!canMove()) {
          state = 'over';
          sndOver();
          setMsg('Hết nước đi! Bấm Ván mới hoặc phím R để thử lại.');
        }

        // Đồng bộ mạng trong chế độ online
        if (mode === 'online' && ws && ws.readyState === 1) {
          sendOnline({ t: 'sync', score: score, grid: grid, state: state });
          if (turnScore >= 128) {
            sendOnline({ t: 'attack', type: 'freeze' });
            setMsg('Bạn đã tạo đòn đóng băng gửi sang đối thủ!');
          }
        }
      }

      function spawnConfetti() {
        confetti = [];
        var colors = ['#f43f5e', '#f59e0b', '#10b981', '#3b82f6', '#8b5cf6', '#ec4899'];
        for (var i = 0; i < 70; i++) {
          confetti.push({
            x: Math.random() * CW,
            y: Math.random() * -100,
            vx: (Math.random() - 0.5) * 120,
            vy: 120 + Math.random() * 180,
            size: 6 + Math.random() * 6,
            color: colors[Math.floor(Math.random() * colors.length)],
            rot: Math.random() * Math.PI,
            vRot: (Math.random() - 0.5) * 5
          });
        }
      }

      // ---- Kết Nối Phòng Đối Kháng Online 1v1 ----
      function sendOnline(msg) {
        if (ws && ws.readyState === 1) ws.send(JSON.stringify(msg));
      }

      function connectOnline(code) {
        if (ws) { try { ws.close(); } catch (e) {} ws = null; }
        roomCode = code.toUpperCase();
        var proto = location.protocol === 'https:' ? 'wss:' : 'ws:';
        var url = proto + '//' + location.host + '/__game/ws?g=2048&room=' + roomCode;
        setMsg('Đang kết nối phòng ' + roomCode + '...');

        try {
          ws = new WebSocket(url);
          ws.onopen = function () {
            setMsg('Đã vào phòng ' + roomCode + '. Chờ đối thủ...');
            mode = 'online';
            updateHUD();
            el('g2048Back').hidden = false;
            el('g2048OnlineRow').hidden = true;
          };
          ws.onmessage = function (ev) {
            var m;
            try { m = JSON.parse(ev.data); } catch (e) { return; }
            if (m.t === 'hello') {
              onlineRole = m.idx;
            } else if (m.t === 'start') {
              setMsg('Trận đấu 1v1 bắt đầu! Gộp ô lớn để tấn công đối thủ.');
              reset();
            } else if (m.t === 'sync') {
              opponentGrid = m.grid;
              opponentScore = m.score;
              if (m.state === 'won') {
                state = 'over';
                setMsg('Đối thủ đã tạo ô 2048 trước! Bạn thua cuộc.');
              } else if (m.state === 'over') {
                state = 'won';
                saveEggs(5);
                setMsg('Đối thủ đã hết đường đi! BẠN CHIẾN THẮNG (+5 Hộp trứng).');
              }
            } else if (m.t === 'attack') {
              frozenTurns = 3;
              sndOver();
              setMsg('BỊ TẤN CÔNG! Bàn cờ bị đóng băng trong 3 lượt!');
            } else if (m.t === 'left') {
              setMsg('Đối thủ đã rời phòng.');
            }
          };
          ws.onclose = function () {
            setMsg('Đã ngắt kết nối phòng online.');
          };
        } catch (e) {
          setMsg('Lỗi kết nối phòng online.');
        }
      }

      function leaveOnline() {
        if (ws) { try { ws.close(); } catch (e) {} ws = null; }
        mode = 'solo';
        roomCode = '';
        opponentGrid = null;
        el('g2048Back').hidden = true;
        el('g2048OnlineRow').hidden = false;
        reset();
      }

      // ---- Vẽ Bàn Cờ Bằng Canvas 2D ----
      function roundRect(ctx, rx, ry, rw, rh, rad, fill, stroke) {
        ctx.beginPath();
        ctx.moveTo(rx + rad, ry);
        ctx.lineTo(rx + rw - rad, ry);
        ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + rad);
        ctx.lineTo(rx + rw, ry + rh - rad);
        ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - rad, ry + rh);
        ctx.lineTo(rx + rad, ry + rh);
        ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - rad);
        ctx.lineTo(rx, ry + rad);
        ctx.quadraticCurveTo(rx, ry, rx + rad, ry);
        ctx.closePath();
        if (fill) ctx.fill();
        if (stroke) ctx.stroke();
      }

      function draw() {
        var th = THEMES[themeIdx];
        x.fillStyle = th.bg;
        x.fillRect(0, 0, CW, CH);

        // Header thông tin: Tên theme, Điểm, Kỷ lục, Hộp trứng
        x.textAlign = 'left';
        x.fillStyle = th.headText;
        x.font = 'bold 20px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        x.fillText('2048 ' + (th.id === 'mebi' ? 'Mebi Egg' : th.name), 20, 32);

        x.textAlign = 'right';
        x.font = '600 13px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
        x.fillStyle = th.subText;
        x.fillText('Hộp trứng: ' + eggs + ' 📦', CW - 20, 26);
        x.fillText('Điểm: ' + score + '  |  Kỷ lục: ' + best, CW - 20, 44);

        if (mode === 'rush') {
          // Vẽ thanh thời gian
          var barW = CW - 40;
          x.fillStyle = '#e2e8f0';
          roundRect(x, 20, 52, barW, 6, 3, true, false);
          var progress = Math.max(0, Math.min(1, rushTime / 60));
          x.fillStyle = progress < 0.25 ? '#ef4444' : '#f59e0b';
          roundRect(x, 20, 52, barW * progress, 6, 3, true, false);
        }

        // Vẽ Khung Lưới Bàn Cờ
        var bx = 20, by = 64, bw = 440, bh = 400;
        x.fillStyle = th.boardBg;
        roundRect(x, bx, by, bw, bh, 12, true, false);

        var pad = 10;
        var cellW = (bw - pad * (N + 1)) / N;
        var cellH = (bh - pad * (N + 1)) / N;

        // Vẽ từng ô
        for (var r = 0; r < N; r++) {
          for (var c = 0; c < N; c++) {
            var cx = bx + pad + c * (cellW + pad);
            var cy = by + pad + r * (cellH + pad);
            var val = grid[r][c];

            if (isObstacle(r, c)) {
              // Khối đá chướng ngại
              x.fillStyle = '#64748b';
              roundRect(x, cx, cy, cellW, cellH, 8, true, false);
              x.fillStyle = '#94a3b8';
              x.textAlign = 'center';
              x.font = 'bold 20px sans-serif';
              x.fillText('🧱', cx + cellW / 2, cy + cellH / 2 + 7);
              continue;
            }

            if (val === 0) {
              x.fillStyle = th.emptyBg;
              roundRect(x, cx, cy, cellW, cellH, 8, true, false);
            } else {
              var conf = th.colors[val] || { bg: '#334155', fg: '#fff', name: '', icon: '' };
              x.fillStyle = conf.bg;
              roundRect(x, cx, cy, cellW, cellH, 8, true, false);

              // Hiệu ứng đóng băng trong PvP
              if (frozenTurns > 0) {
                x.fillStyle = 'rgba(186, 230, 253, 0.45)';
                roundRect(x, cx, cy, cellW, cellH, 8, true, false);
              }

              // Text số
              x.fillStyle = conf.fg;
              x.textAlign = 'center';
              var fontSize = val >= 1024 ? 22 : (val >= 128 ? 26 : 30);
              x.font = 'bold ' + fontSize + 'px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
              x.fillText(val, cx + cellW / 2, cy + cellH / 2 + (conf.name ? -2 : 9));

              // Tên / Icon linh vật
              if (conf.name) {
                x.font = '500 10px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
                var label = (conf.icon ? conf.icon + ' ' : '') + conf.name;
                x.fillText(label, cx + cellW / 2, cy + cellH / 2 + 20);
              }
            }
          }
        }

        // Vẽ Mini-Board của Đối Thủ Trong Trận Online
        if (mode === 'online' && opponentGrid) {
          var mx = CW - 130, my = 72, mw = 100, mh = 100;
          x.fillStyle = 'rgba(0, 0, 0, 0.75)';
          roundRect(x, mx, my, mw, mh, 8, true, false);
          x.fillStyle = '#fff';
          x.font = '600 10px sans-serif';
          x.textAlign = 'center';
          x.fillText('Đối thủ: ' + opponentScore, mx + mw / 2, my + 14);

          var mpad = 2;
          var mcW = (mw - mpad * 5) / 4;
          var mcH = (mh - 22 - mpad * 5) / 4;
          for (var or = 0; or < 4; or++) {
            for (var oc = 0; oc < 4; oc++) {
              var ocx = mx + mpad + oc * (mcW + mpad);
              var ocy = my + 18 + mpad + or * (mcH + mpad);
              var oval = opponentGrid[or] ? opponentGrid[or][oc] : 0;
              x.fillStyle = oval === 0 ? 'rgba(255,255,255,0.1)' : '#f97316';
              roundRect(x, ocx, ocy, mcW, mcH, 2, true, false);
            }
          }
        }

        // Vẽ Text Bay (Floating texts)
        for (var f = floatTexts.length - 1; f >= 0; f--) {
          var ft = floatTexts[f];
          x.fillStyle = ft.color;
          x.globalAlpha = Math.max(0, ft.alpha);
          x.font = 'bold 16px sans-serif';
          x.textAlign = 'center';
          x.fillText(ft.text, ft.x, ft.y);
          ft.y -= 30 * 0.016;
          ft.alpha -= 0.02;
          if (ft.alpha <= 0) floatTexts.splice(f, 1);
        }
        x.globalAlpha = 1.0;

        // Vẽ Pháo Giấy (Confetti) Khi Thắng
        for (var p = 0; p < confetti.length; p++) {
          var cp = confetti[p];
          x.fillStyle = cp.color;
          x.save();
          x.translate(cp.x, cp.y);
          x.rotate(cp.rot);
          x.fillRect(-cp.size / 2, -cp.size / 2, cp.size, cp.size);
          x.restore();
          cp.x += cp.vx * 0.016;
          cp.y += cp.vy * 0.016;
          cp.rot += cp.vRot * 0.016;
        }

        // Overlay Thắng Cuộc
        if (state === 'won' && !keepPlaying) {
          x.fillStyle = 'rgba(255, 255, 255, 0.88)';
          roundRect(x, bx + 20, by + 40, bw - 40, bh - 80, 16, true, false);
          x.textAlign = 'center';
          x.fillStyle = '#9a3412';
          x.font = 'bold 28px sans-serif';
          x.fillText('🏆 BẠN ĐÃ THẮNG!', CW / 2, by + 120);
          x.font = '600 15px sans-serif';
          x.fillStyle = '#7c2d12';
          x.fillText('Đã tạo thành công ô 2048 (+10 Hộp trứng 📦)', CW / 2, by + 155);
          x.font = '500 13px sans-serif';
          x.fillStyle = '#64748b';
          x.fillText('Bấm vào đây để Chơi Vô Tận (Endless Mode)', CW / 2, by + 210);
        }

        // Overlay Thua Cuộc (Game Over)
        if (state === 'over') {
          x.fillStyle = 'rgba(15, 23, 42, 0.82)';
          roundRect(x, bx + 20, by + 40, bw - 40, bh - 80, 16, true, false);
          x.textAlign = 'center';
          x.fillStyle = '#fff';
          x.font = 'bold 28px sans-serif';
          x.fillText('GAME OVER!', CW / 2, by + 130);
          x.font = '500 14px sans-serif';
          x.fillStyle = '#94a3b8';
          x.fillText('Hết nước đi  •  Tổng điểm: ' + score, CW / 2, by + 165);
          x.fillText('Chạm vào màn hình để chơi lại', CW / 2, by + 210);
        }

        x.textAlign = 'left';
      }

      function update(dt) {
        if (mode === 'rush' && state === 'play') {
          rushTime -= dt;
          if (rushTime <= 0) {
            rushTime = 0;
            state = 'over';
            sndOver();
            setMsg('Hết giờ! Điểm đua của bạn: ' + score);
          }
        }
      }

      // ---- Điều khiển Cảm Ứng & Chuột ----
      function down(px, py) {
        getAudio();
        if (state === 'won' && !keepPlaying) {
          keepPlaying = true;
          setMsg('Đang chơi chế độ Vô Tận (Endless)! Cố gắng lên 4096 nhé.');
          return;
        }
        if (state === 'over') {
          reset();
          return;
        }
        touchStart = { x: px, y: py };
        touchLast = { x: px, y: py };
      }

      function move(px, py) {
        if (touchStart) touchLast = { x: px, y: py };
      }

      function up() {
        if (!touchStart || !touchLast) { touchStart = null; touchLast = null; return; }
        var dx = touchLast.x - touchStart.x;
        var dy = touchLast.y - touchStart.y;
        var dist = Math.hypot(dx, dy);

        if (dist >= 22) {
          if (Math.abs(dx) > Math.abs(dy)) {
            slide(dx > 0 ? 1 : 3); // 1: Phải, 3: Trái
          } else {
            slide(dy > 0 ? 2 : 0); // 2: Xuống, 0: Lên
          }
        }
        touchStart = null;
        touchLast = null;
      }

      function keyDown(e) {
        getAudio();
        if (e.target && e.target.tagName === 'INPUT') return;
        var k = e.key;
        if (k === 'ArrowUp' || k === 'w' || k === 'W' || k === 'k' || k === 'K') { e.preventDefault(); slide(0); }
        else if (k === 'ArrowRight' || k === 'd' || k === 'D' || k === 'l' || k === 'L') { e.preventDefault(); slide(1); }
        else if (k === 'ArrowDown' || k === 's' || k === 'S' || k === 'j' || k === 'J') { e.preventDefault(); slide(2); }
        else if (k === 'ArrowLeft' || k === 'a' || k === 'A' || k === 'h' || k === 'H') { e.preventDefault(); slide(3); }
        else if (k === 'u' || k === 'U') { e.preventDefault(); undo(); }
        else if (k === 'r' || k === 'R') { e.preventDefault(); reset(); }
      }

      // Gắn sự kiện các nút DOM phụ trợ
      var btnNew = el('g2048New');
      if (btnNew) btnNew.onclick = reset;

      var btnUndo = el('g2048Undo');
      if (btnUndo) btnUndo.onclick = undo;

      var btnTheme = el('g2048Theme');
      if (btnTheme) {
        btnTheme.onclick = function () {
          themeIdx = (themeIdx + 1) % THEMES.length;
          btnTheme.textContent = '🎨 ' + THEMES[themeIdx].name;
          setMsg('Đã đổi chủ đề: ' + THEMES[themeIdx].name);
        };
      }

      var btnMode = el('g2048Mode');
      if (btnMode) {
        btnMode.onclick = function () {
          if (mode === 'solo') mode = 'rush';
          else if (mode === 'rush') mode = 'obstacle';
          else mode = 'solo';
          reset();
        };
      }

      var btnCreate = el('g2048Create');
      if (btnCreate) {
        btnCreate.onclick = function () {
          var code = '';
          var chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
          for (var i = 0; i < 4; i++) code += chars.charAt(Math.floor(Math.random() * chars.length));
          connectOnline(code);
        };
      }

      var btnJoin = el('g2048Join');
      if (btnJoin) {
        btnJoin.onclick = function () {
          var inp = el('g2048Code');
          var code = inp ? inp.value.trim() : '';
          if (code.length !== 4) { setMsg('Nhập đúng 4 ký tự mã phòng.'); return; }
          connectOnline(code);
        };
      }

      var btnBack = el('g2048Back');
      if (btnBack) btnBack.onclick = leaveOnline;

      reset();

      // Cung cấp hàm debug và interface
      return {
        w: CW, h: CH,
        hint: 'Dùng phím mũi tên, WASD hoặc vuốt ngón tay để trượt ô. Cứ 500 điểm tích lũy 1 Hộp trứng.',
        update: update,
        draw: draw,
        down: down,
        move: move,
        up: up,
        keyDown: keyDown,
        key: function () {},
        leave: function () {
          if (ws) { try { ws.close(); } catch (e) {} ws = null; }
        },
        busy: function () {
          return (state === 'play' && score > 0) || (mode === 'online' && ws !== null);
        }
      };
    })();

`;
