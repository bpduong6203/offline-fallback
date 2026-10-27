// Một đoạn của script phía trình duyệt, được nối lại theo thứ tự trong render.js (cùng một phạm vi).
// Lưu ý: nội dung nằm trong template literal nên KHÔNG dùng backtick, dấu đô-la + ngoặc nhọn
// hay dấu gạch chéo ngược trong phần chuỗi này.
export const clientWolf = `    // ===================== MA SÓI (giao diện) =====================
    // Toàn bộ luật nằm trên server; trình duyệt chỉ hiển thị phần thông tin được phép và gửi lựa chọn.
    var wolf = (function () {
      var ws = null, code = '', S = null, connId = 0, joined = false, tries = 0, manual = true;
      var offset = 0, tick = null, tok = '', myName = '', total = 0, lastKey = '';
      var RN = { wolf: '🐺 Sói', villager: '🏘️ Dân làng', seer: '🔮 Tiên tri', guard: '🛡️ Bảo vệ', witch: '🧪 Phù thủy', hunter: '🏹 Thợ săn' };
      var RD = {
        wolf: 'Mỗi đêm cả bầy chọn một người để cắn. Ban ngày hãy giả làm dân và đừng để lộ.',
        villager: 'Không có kỹ năng đặc biệt. Hãy thảo luận, quan sát và bỏ phiếu treo cổ Sói.',
        seer: 'Mỗi đêm soi một người để biết người đó có phải Sói không.',
        guard: 'Mỗi đêm bảo vệ một người khỏi bị Sói cắn (không bảo vệ cùng một người hai đêm liên tiếp).',
        witch: 'Có 1 bình cứu và 1 bình độc, mỗi đêm dùng tối đa một bình.',
        hunter: 'Khi chết (trừ khi bị đầu độc) được bắn chết một người.'
      };
      var SUBT = { guard: 'Bảo vệ thức dậy...', wolf: 'Bầy Sói thức dậy...', seer: 'Tiên tri thức dậy...', witch: 'Phù thủy thức dậy...' };
      var PICK = { protect: 'Bảo vệ', bite: 'Cắn', see: 'Soi', witch: 'Đầu độc', vote: 'Bỏ phiếu', shoot: 'Bắn' };
      var TK = 'abcdefghijklmnopqrstuvwxyz0123456789';
      var CA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      var ICON = {
        wolf: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#4a1520"/><path d="M24 20 L39 38 L61 38 L76 20 L81 52 Q81 79 50 87 Q19 79 19 52Z" fill="#2b2f3a"/><path d="M30 30 L38 40 L30 47Z M70 30 L62 40 L70 47Z" fill="#e8a3b0"/><path d="M26 56 Q38 50 46 58 Q38 62 26 56Z M74 56 Q62 50 54 58 Q62 62 74 56Z" fill="#ffd34d"/><circle cx="38" cy="56" r="2" fill="#12141a"/><circle cx="62" cy="56" r="2" fill="#12141a"/><path d="M42 68 Q50 62 58 68 L50 80Z" fill="#12141a"/><path d="M44 78 L47 84 M56 78 L53 84" stroke="#f5f5f5" stroke-width="2.5" stroke-linecap="round"/></svg>',
        villager: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#2f5d3a"/><rect x="62" y="26" width="7" height="16" fill="#8a5a2b"/><path d="M20 54 L50 26 L80 54Z" fill="#c9772b"/><rect x="28" y="54" width="44" height="26" fill="#f1dfb4"/><rect x="44" y="60" width="13" height="20" fill="#7a4a21"/><rect x="32" y="60" width="9" height="9" fill="#8fc7e8"/><rect x="60" y="60" width="9" height="9" fill="#8fc7e8"/><path d="M66 22 Q70 16 66 10 Q74 14 70 22Z" fill="#e9eef2" opacity="0.8"/></svg>',
        seer: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#3b2a6b"/><path d="M20 24 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z M78 30 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#ffe9a8"/><path d="M32 82 L68 82 L62 70 L38 70Z" fill="#7a5c2b"/><circle cx="50" cy="50" r="23" fill="#b9a6ff"/><circle cx="50" cy="50" r="23" fill="none" stroke="#e6dcff" stroke-width="2"/><ellipse cx="41" cy="41" rx="7" ry="4" fill="#fff" opacity="0.65" transform="rotate(-30 41 41)"/><circle cx="55" cy="55" r="6" fill="#7a5cff" opacity="0.7"/></svg>',
        guard: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#1f4468"/><path d="M50 16 L79 27 V50 Q79 73 50 85 Q21 73 21 50 V27Z" fill="#cfd8e6"/><path d="M50 16 L79 27 V50 Q79 73 50 85Z" fill="#a9b6cc"/><path d="M50 30 L60 44 L50 66 L40 44Z" fill="#1f4468"/><path d="M50 34 L56 44 L50 58 L44 44Z" fill="#6fa8dc"/></svg>',
        witch: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#35214f"/><rect x="40" y="14" width="20" height="7" rx="2" fill="#c9a36b"/><path d="M43 21 H57 V38 L75 68 Q80 80 68 80 H32 Q20 80 25 68 L43 38Z" fill="#7be0c1"/><path d="M29 64 H71 L75 70 Q79 80 68 80 H32 Q21 80 25 70Z" fill="#3fb98f"/><circle cx="46" cy="56" r="3.5" fill="#e8fff6" opacity="0.8"/><circle cx="56" cy="48" r="2.5" fill="#e8fff6" opacity="0.8"/><circle cx="52" cy="66" r="3" fill="#e8fff6" opacity="0.8"/><path d="M76 24 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#ffe9a8"/></svg>',
        hunter: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#4a3a1f"/><path d="M36 18 Q74 50 36 82" stroke="#d9a35b" stroke-width="6" fill="none" stroke-linecap="round"/><line x1="36" y1="18" x2="36" y2="82" stroke="#f1e3c2" stroke-width="1.5"/><line x1="22" y1="50" x2="80" y2="50" stroke="#e8e0cc" stroke-width="3.5" stroke-linecap="round"/><path d="M84 50 L71 43 V57Z" fill="#e8e0cc"/><path d="M22 50 L14 44 M22 50 L14 56 M28 50 L20 44 M28 50 L20 56" stroke="#c0524a" stroke-width="2.5" stroke-linecap="round"/></svg>'
      };
      (function () {
        var tl = document.querySelectorAll('.wroles div[data-r]');
        for (var q = 0; q < tl.length; q++) {
          var ph = tl[q].querySelector('.ric');
          if (ph) ph.innerHTML = ICON[tl[q].getAttribute('data-r')] || '';
        }
      })();

      function el(id) { return document.getElementById(id); }
      function E(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
      }
      function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
      function setMsg(t) { el('wMsg').textContent = t; }
      function send(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
      function setW(v) { var cd = document.querySelector('.card'); if (cd) cd.setAttribute('data-w', v); }
      function showMenu(on) {
        el('wMenu').hidden = !on; el('wGame').hidden = on;
        setW(on ? 'menu' : 'game');
        if (on) el('wolfui').setAttribute('data-ph', 'lobby');
      }
      function clean(s) { return s.toUpperCase().replace(/[^A-Z0-9]/g, ''); }
      function byId(id) {
        if (!S) return null;
        for (var i = 0; i < S.players.length; i++) if (S.players[i].id === id) return S.players[i];
        return null;
      }
      function tokFor(c) {
        var k = 'wolf_tok_' + c, v = '';
        try { v = localStorage.getItem(k) || ''; } catch (e) {}
        if (v.length < 8) {
          v = '';
          for (var i = 0; i < 24; i++) v += TK.charAt(Math.floor(Math.random() * TK.length));
          try { localStorage.setItem(k, v); } catch (e) {}
        }
        return v;
      }

      // ---------- kết nối ----------
      function toMenu() {
        connId++; manual = true;
        var w = ws; ws = null;
        if (w) {
          try { if (w.readyState === 1) w.send(JSON.stringify({ t: 'quit' })); } catch (e) {}
          try { w.close(); } catch (e) {}
        }
        try { localStorage.removeItem('wolf_tok_' + code); } catch (e) {}
        joined = false; S = null;
        clear(el('wChat'));
        if (tick) { clearInterval(tick); tick = null; }
        showMenu(true); setMsg('');
      }

      function connect(c) {
        var name = el('wName').value.replace(/[<>]/g, '').trim().slice(0, 12);
        if (!name) { setMsg('Nhập tên của bạn trước nhé.'); return; }
        try { localStorage.setItem('wolf_name', name); } catch (e) {}
        myName = name; code = c; tok = tokFor(c);
        manual = false; joined = false; tries = 0;
        var token = ++connId;
        setMsg('Đang kiểm tra kết nối...');
        fetch('/__game/ws?room=' + c + '&g=wolf', { cache: 'no-store' }).then(function (r) {
          if (token !== connId) return;
          if (r.status === 426) { openSocket(); return; }
          manual = true;
          if (r.status === 501) setMsg('Worker chưa gắn Durable Object WOLF: thêm binding WOLF và migration v2 trong wrangler.');
          else if (r.status === 409) setMsg('Phòng ' + c + ' đã đủ người.');
          else if (r.status === 403) setMsg('Bị chặn vì Origin không khớp domain (403).');
          else if (r.status >= 500) setMsg('Durable Object lỗi (' + r.status + '): kiểm tra export class WolfRoom và migration.');
          else setMsg('Worker chưa có bản mới (mã ' + r.status + '): hãy deploy lại worker.js.');
        }).catch(function () {
          if (token !== connId) return;
          manual = true; setMsg('Không gọi được Worker (lỗi mạng).');
        });
      }

      function openSocket() {
        var mine;
        var url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/__game/ws?room=' + code + '&g=wolf';
        try { mine = new WebSocket(url); } catch (e) { manual = true; setMsg('Trình duyệt không mở được WebSocket.'); return; }
        ws = mine;
        mine.onopen = function () { send({ t: 'join', name: myName, tok: tok }); };
        mine.onmessage = function (ev) {
          if (mine !== ws) return;
          var m;
          try { m = JSON.parse(ev.data); } catch (e) { return; }
          onMsg(m);
        };
        mine.onclose = function () {
          if (mine !== ws) return;
          ws = null;
          if (joined && !manual && tries < 8) {
            tries++;
            setMsg('Mất kết nối, đang thử lại (' + tries + ')...');
            setTimeout(function () { if (!manual && joined && !ws) openSocket(); }, 1500);
          } else {
            var was = joined;
            toMenu();
            setMsg(was ? 'Mất kết nối tới phòng.' : 'Không mở được WebSocket (mạng/proxy chặn hoặc WebSockets bị tắt trên Cloudflare).');
          }
        };
      }

      function onMsg(m) {
        if (m.t === 'state') {
          S = m.s; offset = S.now - Date.now();
          var key = S.phase + ':' + S.sub + ':' + S.day;
          var lf = S.deadline ? Math.max(1, Math.round((S.deadline - S.now) / 1000)) : 0;
          if (key !== lastKey || lf > total) { total = lf; lastKey = key; }
          joined = true; tries = 0;
          showMenu(false); setMsg('');
          render();
        } else if (m.t === 'chat') {
          addChat(m);
        } else if (m.t === 'err') {
          if (m.fatal) { toMenu(); setMsg(m.m); } else setMsg(m.m);
        }
      }

      function addChat(m) {
        var box = el('wChat');
        var tag = m.scope === 'wolf' ? '🐺 ' : (m.scope === 'dead' ? '💀 ' : '');
        box.appendChild(E('div', 'cl ' + m.scope, tag + m.who + ': ' + m.text));
        while (box.childNodes.length > 60) box.removeChild(box.firstChild);
        box.scrollTop = box.scrollHeight;
      }

      // ---------- hiển thị ----------
      function phaseParts() {
        switch (S.phase) {
          case 'lobby': return ['Sảnh chờ', S.players.length + ' người, cần từ ' + S.min + ' để bắt đầu'];
          case 'night': return ['Đêm ' + S.day, SUBT[S.sub] || ''];
          case 'day': return ['Ngày ' + S.day, 'Thảo luận'];
          case 'vote': return ['Ngày ' + S.day, 'Bỏ phiếu treo cổ'];
          case 'hunter': return ['Thợ săn bắn!', 'Một phát đạn cuối cùng'];
          case 'over': return ['Kết thúc', S.winner === 'wolf' ? 'Bầy Sói thắng 🐺' : 'Dân làng thắng 🏘️'];
        }
        return ['', ''];
      }
      function phaseTheme() {
        if (S.phase === 'night') return 'night';
        if (S.phase === 'vote' || S.phase === 'hunter') return 'dusk';
        if (S.phase === 'over') return 'over';
        if (S.phase === 'day') return 'day';
        return 'lobby';
      }
      function tickFn() {
        if (!S) return;
        var left = S.deadline ? Math.max(0, Math.round((S.deadline - (Date.now() + offset)) / 1000)) : 0;
        var pp = phaseParts();
        el('wPhase').textContent = pp[0];
        el('wSub').textContent = pp[1];
        var tmr = el('wTimer');
        if (S.deadline) {
          tmr.hidden = false;
          el('wTimeNum').textContent = left;
          var pct = total > 0 ? Math.max(0, Math.min(100, left / total * 100)) : 0;
          tmr.style.setProperty('--p', pct + '%');
        } else tmr.hidden = true;
      }

      function cfgText(c) {
        var p = [c.wolves + ' Sói'];
        if (c.seer) p.push('Tiên tri');
        if (c.guard) p.push('Bảo vệ');
        if (c.witch) p.push('Phù thủy');
        if (c.hunter) p.push('Thợ săn');
        return p.join(', ') + ' (còn lại là Dân làng)';
      }

      function renderRole() {
        var box = el('wRole'); clear(box); box.className = 'wrole';
        if (S.phase === 'lobby') {
          box.appendChild(E('div', 'rt', 'Thành phần ván này'));
          box.appendChild(E('div', '', cfgText(S.cfg)));
          return;
        }
        var r = S.me.role;
        if (!r) return;
        box.className = 'wrole r-' + r;
        var hd = E('div', 'rhead');
        var ri = E('div', 'rico'); ri.innerHTML = ICON[r] || '';
        hd.appendChild(ri);
        hd.appendChild(E('div', 'rt', 'Bạn là ' + RN[r]));
        box.appendChild(hd);
        box.appendChild(E('div', '', RD[r]));
        if (r === 'wolf') {
          var mates = [];
          for (var i = 0; i < S.players.length; i++) {
            var q = S.players[i];
            if (q.role === 'wolf' && q.id !== S.you) mates.push(q.name + (q.alive ? '' : ' 💀'));
          }
          box.appendChild(E('div', '', mates.length ? 'Đồng đội: ' + mates.join(', ') : 'Bạn là Sói duy nhất.'));
        }
        if (r === 'seer') {
          for (var k = 0; k < S.me.seen.length; k++) {
            var s = S.me.seen[k];
            box.appendChild(E('div', '', '🔮 Đêm ' + s.day + ': ' + s.name + (s.wolf ? ' LÀ Sói 🐺' : ' không phải Sói')));
          }
        }
        if (r === 'witch') {
          box.appendChild(E('div', '', 'Bình cứu: ' + (S.me.heal ? 'còn' : 'đã dùng') + ' • Bình độc: ' + (S.me.poison ? 'còn' : 'đã dùng')));
        }
        if (!S.me.alive) box.appendChild(E('div', 'dd', '💀 Bạn đã chết. Bạn chỉ xem được và chat với người đã chết.'));
      }

      function pickTarget(kind, id) {
        if (kind === 'vote') send({ t: 'vote', target: id });
        else if (kind === 'shoot') send({ t: 'shoot', target: id });
        else if (kind === 'witch') send({ t: 'act', a: 'poison', target: id });
        else send({ t: 'act', a: kind, target: id });
      }
      function btn(label, fn, on) {
        var b = E('button', 'mini small' + (on ? ' on' : ''), label);
        b.onclick = fn;
        return b;
      }

      function setMobileTab(tab) {
        var panels = { act: 'wMid', players: 'wPlayersPanel', chat: 'wChatPanel' };
        var buttons = document.querySelectorAll('[data-mobile-tab]');
        for (var i = 0; i < buttons.length; i++) {
          var active = buttons[i].getAttribute('data-mobile-tab') === tab;
          buttons[i].setAttribute('aria-pressed', active ? 'true' : 'false');
          var panel = document.getElementById(panels[buttons[i].getAttribute('data-mobile-tab')]);
          if (panel) panel.classList.toggle('mobile-active', active);
        }
      }

      function renderAct() {
        var box = el('wAct'); clear(box);
        var i;
        if (S.phase === 'lobby') {
          var host = (S.host === S.you), c = S.cfg;
          if (host) {
            var send2 = function (n) { send({ t: 'cfg', wolves: n.wolves, seer: n.seer, guard: n.guard, witch: n.witch, hunter: n.hunter }); };
            var row = E('div', 'crow');
            row.appendChild(E('span', '', 'Số Sói: '));
            row.appendChild(btn('−', function () { send2({ wolves: Math.max(1, c.wolves - 1), seer: c.seer, guard: c.guard, witch: c.witch, hunter: c.hunter }); }));
            row.appendChild(E('b', '', ' ' + c.wolves + ' '));
            row.appendChild(btn('+', function () { send2({ wolves: Math.min(4, c.wolves + 1), seer: c.seer, guard: c.guard, witch: c.witch, hunter: c.hunter }); }));
            box.appendChild(row);
            var row2 = E('div', 'crow');
            var keys = [['seer', 'Tiên tri'], ['guard', 'Bảo vệ'], ['witch', 'Phù thủy'], ['hunter', 'Thợ săn']];
            keys.forEach(function (kv) {
              row2.appendChild(btn(kv[1], function () {
                var n = { wolves: c.wolves, seer: c.seer, guard: c.guard, witch: c.witch, hunter: c.hunter };
                n[kv[0]] = !c[kv[0]];
                send2(n);
              }, c[kv[0]]));
            });
            box.appendChild(row2);
            var st = btn('Bắt đầu ván', function () { send({ t: 'start' }); });
            st.className = 'btn';
            st.disabled = S.players.length < S.min;
            box.appendChild(st);
            if (S.players.length < S.min) box.appendChild(E('div', 'ahint', 'Cần thêm ' + (S.min - S.players.length) + ' người nữa.'));
          } else {
            box.appendChild(E('div', 'ahint', 'Chờ chủ phòng (👑) bắt đầu ván...'));
          }
          return;
        }
        if (S.phase === 'over') {
          box.appendChild(E('div', 'rt', S.winner === 'wolf' ? '🐺 Bầy Sói thắng!' : '🏘️ Dân làng thắng!'));
          if (S.host === S.you) {
            var ag = btn('Chơi lại', function () { send({ t: 'again' }); });
            ag.className = 'btn';
            box.appendChild(ag);
          } else box.appendChild(E('div', 'ahint', 'Chờ chủ phòng bấm chơi lại...'));
          return;
        }
        var a = S.me.act;
        if (!a) {
          var w = 'Đang chờ...';
          if (!S.me.alive) w = 'Bạn đã chết, hãy theo dõi ván đấu.';
          else if (S.phase === 'night') w = 'Đang là lượt của vai khác. Hãy im lặng và chờ trời sáng...';
          else if (S.phase === 'hunter') w = 'Thợ săn đang chọn người để bắn...';
          box.appendChild(E('div', 'ahint', w));
          return;
        }
        box.appendChild(E('div', 'ahint', a.hint));
        if (a.a === 'ready') {
          var rb = btn((a.ready ? 'Đã sẵn sàng' : 'Sẵn sàng bỏ phiếu') + ' (' + S.readyCount + '/' + S.aliveCount + ')', function () { send({ t: 'ready' }); }, a.ready);
          rb.disabled = !!a.ready;
          box.appendChild(rb);
        } else if (a.a === 'vote') {
          box.appendChild(btn('Bỏ qua phiếu', function () { send({ t: 'vote', target: 0 }); }, a.chosen === 0));
        } else if (a.a === 'witch') {
          if (a.heal) box.appendChild(btn('Cứu ' + a.victim.name, function () { send({ t: 'act', a: 'heal' }); }));
          if (a.poison) box.appendChild(E('div', 'ahint', 'Hoặc chọn một người trong danh sách bên dưới để đầu độc.'));
          box.appendChild(btn('Không dùng bình nào', function () { send({ t: 'act', a: 'skip' }); }));
        } else if (a.a === 'bite' && a.votes) {
          for (var wid in a.votes) {
            var wv = byId(Number(wid)), tv = byId(a.votes[wid]);
            if (wv && tv) box.appendChild(E('div', 'ahint', '🐺 ' + wv.name + ' → ' + tv.name));
          }
        }
        if (a.done) box.appendChild(E('div', 'ahint', 'Đã chọn xong, chờ trời sáng...'));
      }

      function renderPlayers() {
        var box = el('wPlayers'); clear(box);
        var a = S.me.act, kind = a && a.targets ? a.a : null;
        var counts = {}, nAlive = 0, j;
        for (j = 0; j < S.players.length; j++) if (S.players[j].alive) nAlive++;
        el('wPCount').textContent = S.phase === 'lobby' ? S.players.length + '/' + 12 : nAlive + '/' + S.players.length + ' còn sống';
        if (S.voteResolved) {
          for (j = 0; j < S.players.length; j++) {
            var v = S.players[j].vote;
            if (v) counts[v] = (counts[v] || 0) + 1;
          }
        }
        for (var i = 0; i < S.players.length; i++) {
          (function (p) {
            var card = E('div', 'pcard' + (p.alive ? '' : ' dead') + (p.id === S.you ? ' me' : ''));
            var av = E('div', 'pav' + (p.role && ICON[p.role] ? ' ico' : ''), p.role && ICON[p.role] ? undefined : (p.name.charAt(0) || '?').toUpperCase());
            if (p.role && ICON[p.role]) av.innerHTML = ICON[p.role];
            card.appendChild(av);
            var info = E('div', 'pinfo');
            info.appendChild(E('div', 'pn', (S.host === p.id ? '👑 ' : '') + p.name + (p.id === S.you ? ' (bạn)' : '') + (p.online ? '' : ' 📴')));
            var meta = E('div', 'pm');
            if (!p.alive) meta.appendChild(E('span', '', '💀'));
            if (p.role) meta.appendChild(E('span', 'rl' + (p.role === 'wolf' ? ' w' : ''), RN[p.role]));
            if (S.voteResolved) {
              if (counts[p.id]) meta.appendChild(E('span', 'rl', '🗳️ ' + counts[p.id]));
              if (p.vote !== undefined) {
                var tv = p.vote ? byId(p.vote) : null;
                meta.appendChild(E('span', '', '→ ' + (tv ? tv.name : 'bỏ qua')));
              }
            } else if (S.phase === 'vote' && p.voted) {
              meta.appendChild(E('span', 'rl', '✓ Đã bỏ phiếu'));
            }
            info.appendChild(meta);
            card.appendChild(info);
            if (kind && a.targets.indexOf(p.id) >= 0) {
              var pa = E('div', 'pact');
              pa.appendChild(btn(PICK[kind], function () { pickTarget(kind, p.id); }, a.chosen === p.id));
              card.appendChild(pa);
            }
            box.appendChild(card);
          })(S.players[i]);
        }
      }

      function renderLog() {
        var box = el('wLog'); clear(box);
        var from = Math.max(0, S.log.length - 8);
        for (var i = from; i < S.log.length; i++) box.appendChild(E('div', '', S.log[i]));
        box.scrollTop = box.scrollHeight;
      }

      function render() {
        if (!S) return;
        var me = byId(S.you);
        el('wRoom').textContent = 'Phòng ' + code + ' • ' + (me ? me.name : myName);
        el('wolfui').setAttribute('data-ph', phaseTheme());
        tickFn();
        renderRole(); renderAct(); renderPlayers(); renderLog();
        if (!tick) tick = setInterval(tickFn, 500);
      }

      function sendChat() {
        var inp = el('wText'), t = inp.value.trim();
        if (!t) return;
        send({ t: 'chat', text: t });
        inp.value = '';
      }

      // ---------- nút ----------
      try { el('wName').value = localStorage.getItem('wolf_name') || ''; } catch (e) {}
      el('wCreate').onclick = function () {
        var c = '';
        for (var i = 0; i < 4; i++) c += CA.charAt(Math.floor(Math.random() * CA.length));
        connect(c);
      };
      el('wJoin').onclick = function () {
        var v = clean(el('wCode').value);
        if (v.length !== 4) { setMsg('Nhập đủ 4 ký tự mã phòng.'); return; }
        connect(v);
      };
      el('wBack').onclick = toMenu;
      el('wSend').onclick = sendChat;
      el('wText').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendChat(); } });
      var mobileTabs = document.querySelectorAll('[data-mobile-tab]');
      for (var mt = 0; mt < mobileTabs.length; mt++) {
        mobileTabs[mt].addEventListener('click', function () { setMobileTab(this.getAttribute('data-mobile-tab')); });
      }

      return {
        w: 480, h: 270,
        hint: 'Cần từ 5 người, mỗi người một thiết bị. Chat bằng khung bên dưới hoặc gọi thoại riêng cho vui.',
        update: function () {}, draw: function () {}, down: function () {}, key: function () {},
        leave: toMenu,
        busy: function () { return joined && !manual; }
      };
    })();

`;
