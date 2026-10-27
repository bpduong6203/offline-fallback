// Một đoạn của script phía trình duyệt, được nối lại theo thứ tự trong render.js (cùng một phạm vi).
// Lưu ý: nội dung nằm trong template literal nên KHÔNG dùng backtick, dấu đô-la + ngoặc nhọn
// hay dấu gạch chéo ngược trong phần chuỗi này.
export const clientSword = `    // ===================== ĐẤU KIẾM =====================
    // Hai kiếm sĩ que giao kiếm trên bục đá. Mỗi máy tự chạy nhân vật của mình và gửi tư thế cho đối thủ
    // (qua cùng Durable Object với Bi-a / Caro). Máy bị trúng đòn tự tính sát thương cho mình.
    var sword = (function () {
      var SW = 680, SH = 400, GY = 300, PL = 160, PR = 520;
      var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      var TEAM = ['#2ec4b6', '#ff6b4a'];
      var NAMES = ['dusk', 'night', 'snow'];
      var WIN_ROUNDS = 2, ROUND_TIME = 60;
      var PAL = {
        dusk: { sky1: '#5b4a8a', sky2: '#c9627a', sky3: '#f4a261', sun: '#ffe3b3', craterop: 0, starop: 0, cloud: '#ffd0a8', r1: '#8e5a8f', r2: '#5e3b6e', r3: '#3b2552', water: '#2a1c3d', wline: '#f4a261', stone: '#5a4a5c', stoneTop: '#8a7690', stoneDark: '#2f2438', post: '#3a2a20', lantern: '#ffb347', ink: '#1c1530', hudbg: '#1c1530', hudtext: '#fff3e0', petal: '#ffd1dc', edge: '#44506a' },
        night: { sky1: '#0b1030', sky2: '#16204d', sky3: '#243268', sun: '#e9eeff', craterop: 0.5, starop: 1, cloud: '#3a4a8a', r1: '#1a2350', r2: '#121a3d', r3: '#0b1230', water: '#0a0f26', wline: '#8fa0d8', stone: '#3b4163', stoneTop: '#5a628c', stoneDark: '#161a33', post: '#241a2e', lantern: '#ffd166', ink: '#cfd8ff', hudbg: '#05081c', hudtext: '#e9eeff', petal: '#ffe08a', edge: '#8fa0d8' },
        snow: { sky1: '#b9d3e8', sky2: '#d4e4f0', sky3: '#eaf2f8', sun: '#ffffff', craterop: 0, starop: 0, cloud: '#ffffff', r1: '#9db8d1', r2: '#8aa7c2', r3: '#6f8fae', water: '#cfe0ee', wline: '#ffffff', stone: '#9aa7b5', stoneTop: '#dde6ee', stoneDark: '#5f6d7d', post: '#4a3a35', lantern: '#e4572e', ink: '#1f2f44', hudbg: '#1f2f44', hudtext: '#ffffff', petal: '#ffffff', edge: '#44506a' }
      };
      var STARS = [[60, 30, 1.5], [150, 60, 1.5], [230, 20, 2], [300, 78, 1.5], [420, 34, 1.5], [520, 70, 2], [600, 26, 1.5], [640, 90, 1.5], [90, 92, 1.5], [480, 100, 1.5]];
      var bgCv = null, bgName = '';
      var scene = 'dusk';

      var sstate = 'menu', mode = '', me = 0, ws = null, roomCode = '', connId = 0;
      var F = [], wins = [0, 0], round = 1, timeLeft = ROUND_TIME, readyT = 0, rendT = 0, roundWin = -2;
      var keys = {}, shake = 0, clashT = 0, sendT = 0, fxs = [], floats = [], petals = [], rt = null;
      var bot = { t: 0, m: 'approach', dir: 1, mv: 0 };

      function el(id) { return document.getElementById(id); }
      function setMsg(t) { el('sMsg').textContent = t; }
      function showMenu(on) { el('sMenu').hidden = !on; el('sBack').hidden = on; }
      function clean(s) { return s.toUpperCase().replace(/[^A-Z0-9]/g, ''); }
      function rnd(a, b) { return a + Math.random() * (b - a); }
      function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
      function localIdx() { return mode === 'bot' ? 0 : me; }
      function pickScene() { return NAMES[Math.floor(Math.random() * NAMES.length)]; }

      // ---------- vẽ cảnh nền (vẽ một lần vào canvas phụ rồi dùng lại) ----------
      function rr(g, px, py, w, h, r) {
        g.beginPath(); g.moveTo(px + r, py); g.arcTo(px + w, py, px + w, py + h, r); g.arcTo(px + w, py + h, px, py + h, r);
        g.arcTo(px, py + h, px, py, r); g.arcTo(px, py, px + w, py, r); g.closePath(); g.fill();
      }
      function disc(g, cx, cy, r) { g.beginPath(); g.arc(cx, cy, r, 0, 6.2832); g.fill(); }
      function paintScene(g, p) {
        var i;
        g.fillStyle = p.sky1; g.fillRect(0, 0, SW, 110);
        g.fillStyle = p.sky2; g.fillRect(0, 110, SW, 90);
        g.fillStyle = p.sky3; g.fillRect(0, 200, SW, 110);
        if (p.starop) { g.fillStyle = '#ffffff'; for (i = 0; i < STARS.length; i++) disc(g, STARS[i][0], STARS[i][1], STARS[i][2]); }
        g.fillStyle = p.sun; disc(g, 340, 178, 64);
        if (p.craterop) { g.globalAlpha = p.craterop; g.fillStyle = p.sky2; disc(g, 322, 160, 9); disc(g, 356, 190, 6); disc(g, 330, 200, 4); g.globalAlpha = 1; }
        g.globalAlpha = 0.6; g.fillStyle = p.cloud; rr(g, 420, 96, 120, 8, 4); rr(g, 450, 110, 90, 6, 3); rr(g, 90, 140, 110, 7, 3.5); g.globalAlpha = 1;
        g.fillStyle = p.r1; g.fill(new Path2D('M0 262 Q90 232 180 258 T360 250 T520 256 T680 240 V310 H0Z'));
        g.fillStyle = p.r2;
        g.fill(new Path2D('M84 258 L136 258 L124 246 L96 246Z M90 246 L130 246 L121 236 L99 236Z M95 236 L125 236 L118 227 L102 227Z M108 211 L112 211 L112 227 L108 227Z'));
        g.fill(new Path2D('M0 282 Q120 252 240 278 T480 270 T680 282 V310 H0Z'));
        g.fillStyle = p.water; g.fillRect(0, 304, SW, 96);
        g.fillStyle = p.r3;
        g.fill(new Path2D('M0 286 Q70 282 140 302 L140 318 L0 318Z M680 286 Q610 282 540 302 L540 318 L680 318Z M40 292 L54 250 L68 292Z M58 296 L70 264 L82 296Z M590 292 L604 246 L618 292Z M608 296 L620 262 L632 296Z'));
        g.strokeStyle = p.wline; g.lineWidth = 1.5; g.lineCap = 'round'; g.globalAlpha = 0.5;
        var wl = [[50, 340, 120], [80, 356, 130], [560, 346, 640], [590, 366, 640], [190, 372, 250], [430, 376, 510]];
        for (i = 0; i < wl.length; i++) { g.beginPath(); g.moveTo(wl[i][0], wl[i][1]); g.lineTo(wl[i][2], wl[i][1]); g.stroke(); }
        g.globalAlpha = 0.28; g.fillStyle = p.stoneDark; g.fillRect(PL, 338, PR - PL, 30); g.globalAlpha = 1;
        g.fillStyle = p.stone; g.fillRect(PL, GY, PR - PL, 38);
        g.fillStyle = p.stoneTop; g.fillRect(PL, GY, PR - PL, 7);
        g.strokeStyle = p.stoneDark; g.lineWidth = 1.5;
        for (i = 220; i <= 460; i += 60) { g.beginPath(); g.moveTo(i, 307); g.lineTo(i, 338); g.stroke(); }
        g.fillStyle = p.post; g.fillRect(168, 254, 8, 46); g.fillRect(504, 254, 8, 46);
        g.strokeStyle = p.post; g.lineWidth = 2;
        g.beginPath(); g.moveTo(172, 236); g.lineTo(172, 254); g.moveTo(508, 236); g.lineTo(508, 254); g.stroke();
        g.fillStyle = p.lantern; rr(g, 164, 226, 16, 20, 4); rr(g, 500, 226, 16, 20, 4);
        g.fillStyle = TEAM[0]; g.fill(new Path2D('M176 258 l28 6 l-28 6Z'));
        g.fillStyle = TEAM[1]; g.fill(new Path2D('M504 258 l-28 6 l28 6Z'));
      }
      function ensureBg() {
        if (bgCv && bgName === scene) return;
        if (!bgCv) { bgCv = document.createElement('canvas'); bgCv.width = SW * dpr; bgCv.height = SH * dpr; }
        var g = bgCv.getContext('2d');
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintScene(g, PAL[scene]);
        bgName = scene;
      }
      function initPetals() {
        petals = [];
        for (var i = 0; i < 18; i++) petals.push({ x: rnd(0, SW), y: rnd(0, 300), vx: rnd(-14, -4), vy: rnd(8, 22), r: rnd(1.6, 3), ph: rnd(0, 6) });
      }

      // ---------- nhân vật ----------
      function newFighter(i) {
        return { i: i, x: i ? 430 : 250, y: GY, vx: 0, vy: 0, g: true, face: i ? -1 : 1, sa: 0.2, e: 0.85, cr: 0, hp: 100,
          inv: 0, stun: 0, sl: 0, slCd: 0, sa0: 0, e0: 0, ph: 0, speed: 0, px: 0, py: 0, has: false, dead: false };
      }
      function resetFighters() {
        F = [newFighter(0), newFighter(1)];
        rt = null; clashT = 0; fxs = []; floats = [];
      }
      function ik(h, f, l1, l2, dir) {
        var dx = f[0] - h[0], dy = f[1] - h[1], dd = Math.sqrt(dx * dx + dy * dy), maxd = l1 + l2 - 0.5;
        if (dd > maxd) { dx *= maxd / dd; dy *= maxd / dd; dd = maxd; }
        if (dd < 1) dd = 1;
        var a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd);
        var hh = Math.sqrt(Math.max(0, l1 * l1 - a * a));
        var ux = dx / dd, uy = dy / dd, px = -uy, py = ux;
        var sg = (px * dir >= 0) ? 1 : -1;
        return [h[0] + ux * a + px * hh * sg, h[1] + uy * a + py * hh * sg, h[0] + dx, h[1] + dy];
      }
      function pose(f) {
        var d = f.face;
        var legH = 44 - f.cr * 15;
        var bob = f.g ? Math.sin(tm * 2.6 + f.i * 1.7) * 1.2 * (1 - f.cr) : 0;
        var hipY = f.y - legH + bob;
        var hip = [f.x, hipY];
        var sh = [f.x, hipY - 34 + f.cr * 4];
        var neck = [f.x, hipY - 40 + f.cr * 4];
        var head = [f.x, neck[1] - 13];
        var a1 = f.sa, a2 = a1 + (1 - f.e) * 1.5;
        var elbow = [sh[0] + d * Math.cos(a1) * 24, sh[1] - Math.sin(a1) * 24];
        var hand = [elbow[0] + d * Math.cos(a2) * 22, elbow[1] - Math.sin(a2) * 22];
        var tip = [hand[0] + d * Math.cos(a2) * 60, hand[1] - Math.sin(a2) * 60];
        var bel = [sh[0] - d * 10, sh[1] + 12], bh = [sh[0] - d * 6, sh[1] + 26];
        var stride = f.g ? 14 * Math.min(1, Math.abs(f.vx) / 100) : 0;
        var s = Math.sin(f.ph) * stride, lift = f.g ? Math.max(0, Math.cos(f.ph)) * 5 * Math.min(1, Math.abs(f.vx) / 100) : 0;
        var ff, bf;
        if (f.g) { ff = [f.x + d * (10 + s), f.y - lift]; bf = [f.x - d * (10 + s), f.y]; }
        else { ff = [f.x + d * 12, f.y - 18]; bf = [f.x - d * 8, f.y - 10]; }
        var k1 = ik(hip, ff, 24, 24, d), k2 = ik(hip, bf, 24, 24, d);
        return { hip: hip, sh: sh, neck: neck, head: head, elbow: elbow, hand: hand, tip: tip, bel: bel, bh: bh,
          kf: [k1[0], k1[1]], ff: [k1[2], k1[3]], kb: [k2[0], k2[1]], bf: [k2[2], k2[3]] };
      }

      // ---------- hình học va chạm ----------
      function closest(a, b, c, d) {
        var d1x = b[0] - a[0], d1y = b[1] - a[1], d2x = d[0] - c[0], d2y = d[1] - c[1], rx = a[0] - c[0], ry = a[1] - c[1];
        var aa = d1x * d1x + d1y * d1y, ee = d2x * d2x + d2y * d2y, ff = d2x * rx + d2y * ry, s, t;
        if (aa < 1e-6 && ee < 1e-6) { s = 0; t = 0; }
        else if (aa < 1e-6) { s = 0; t = clamp(ff / ee, 0, 1); }
        else {
          var cc = d1x * rx + d1y * ry;
          if (ee < 1e-6) { t = 0; s = clamp(-cc / aa, 0, 1); }
          else {
            var bb = d1x * d2x + d1y * d2y, den = aa * ee - bb * bb;
            s = den > 1e-6 ? clamp((bb * ff - cc * ee) / den, 0, 1) : 0;
            t = (bb * s + ff) / ee;
            if (t < 0) { t = 0; s = clamp(-cc / aa, 0, 1); }
            else if (t > 1) { t = 1; s = clamp((bb - cc) / aa, 0, 1); }
          }
        }
        var p1x = a[0] + d1x * s, p1y = a[1] + d1y * s, p2x = c[0] + d2x * t, p2y = c[1] + d2y * t;
        var dx = p1x - p2x, dy = p1y - p2y;
        return { d: Math.sqrt(dx * dx + dy * dy), x: (p1x + p2x) / 2, y: (p1y + p2y) / 2 };
      }

      // ---------- hiệu ứng ----------
      function sparks(px, py, col, n, sp) {
        for (var i = 0; i < n; i++) {
          var an = rnd(0, 6.283), v = rnd(sp * 0.4, sp);
          fxs.push({ x: px, y: py, vx: Math.cos(an) * v, vy: Math.sin(an) * v - 30, life: rnd(0.25, 0.5), t: 0, col: col });
        }
      }
      function floatText(px, py, txt, col) { floats.push({ x: px, y: py, t: 0, s: txt, col: col }); }

      // ---------- vật lý và điều khiển ----------
      function stepFighter(f, inp, dt, active) {
        var can = active && !f.dead && f.stun <= 0;
        if (f.inv > 0) f.inv -= dt;
        if (f.stun > 0) f.stun -= dt;
        if (f.slCd > 0) f.slCd -= dt;
        var mv = 0;
        if (can) mv = inp.mv || 0;
        var crouch = can && inp.crouch && f.g;
        f.cr += ((crouch || f.dead ? 1 : 0) - f.cr) * Math.min(1, dt * 14);
        var spd = f.cr > 0.5 ? 70 : 150;
        var tvx = mv * spd;
        var rate = f.g ? 10 : 2.5;
        f.vx += (tvx - f.vx) * Math.min(1, dt * rate);
        if (can && inp.jump && f.g) { f.vy = -390; f.g = false; }
        f.vy += 1100 * dt;
        f.x += f.vx * dt;
        var prevY = f.y;
        f.y += f.vy * dt;
        if (f.y > 700) { f.y = 700; f.vy = 0; }
        var sup = f.x > PL - 4 && f.x < PR + 4;
        if (sup && f.vy >= 0 && prevY <= GY + 1 && f.y >= GY) { f.y = GY; f.vy = 0; f.g = true; }
        else if (f.g && !sup) f.g = false;
        if (f.g) f.ph += dt * Math.abs(f.vx) * 0.07;
        // cánh tay
        if (f.dead) {
          f.sa += (-1.3 - f.sa) * Math.min(1, dt * 4); f.e += (1 - f.e) * Math.min(1, dt * 4);
        } else if (f.stun > 0) {
          f.sa += (-0.5 - f.sa) * Math.min(1, dt * 8); f.sl = 0;
        } else if (f.sl > 0) {
          f.sl -= dt;
          var t = 0.30 - f.sl, k, k2;
          if (t < 0.10) { k = t / 0.10; f.sa = f.sa0 + (1.25 - f.sa0) * k; f.e = f.e0 + (0.45 - f.e0) * k; }
          else { k = clamp((t - 0.10) / 0.20, 0, 1); k2 = k * k; f.sa = 1.25 - 2.0 * k2; f.e = 0.45 + 0.55 * k; f.vx += f.face * 260 * dt; }
        } else if (can) {
          f.sa = clamp(f.sa + ((inp.sUp ? 1 : 0) - (inp.sDn ? 1 : 0)) * 3.2 * dt, -1.3, 1.45);
          f.e = clamp(f.e + ((inp.eUp ? 1 : 0) - (inp.eDn ? 1 : 0)) * 3.0 * dt, 0, 1);
          if (inp.slash && f.slCd <= 0) { f.sl = 0.30; f.slCd = 0.9; f.sa0 = f.sa; f.e0 = f.e; }
        }
      }
      function kin(f, dt) {
        var p = pose(f);
        if (f.has && dt > 0) {
          var dx = p.tip[0] - f.px, dy = p.tip[1] - f.py;
          f.speed += (Math.min(1800, Math.sqrt(dx * dx + dy * dy) / dt) - f.speed) * 0.6;
        }
        f.px = p.tip[0]; f.py = p.tip[1]; f.has = true;
      }
      function tryHit(att, vic) {
        if (vic.inv > 0 || clashT > 0 || vic.dead || att.speed < 170) return false;
        var pa = pose(att), pv = pose(vic), part = '';
        var hd = closest(pv.head, pv.head, pa.hand, pa.tip);
        if (hd.d < 13) part = 'head';
        else if (closest(pv.neck, pv.hip, pa.hand, pa.tip).d < 10) part = 'body';
        if (!part) return false;
        var dmg = Math.min(18, 3 + (att.speed - 170) * 0.02);
        if (part === 'head') dmg = Math.min(26, dmg * 1.5);
        dmg = Math.round(dmg);
        vic.hp = Math.max(0, vic.hp - dmg);
        vic.inv = 0.45; vic.stun = 0.22; vic.sl = 0;
        vic.vx += att.face * 230;
        shake = 7;
        sparks(pv.head[0], part === 'head' ? pv.head[1] : (pv.neck[1] + pv.hip[1]) / 2, '#ff4d4d', 10, 160);
        floatText(vic.x, pv.head[1] - 20, '-' + dmg, '#ff4d4d');
        if (mode === 'online') {
          send({ t: 'hit', d: dmg, x: Math.round(vic.x), y: Math.round(pv.head[1]) });
          sendT = 0;
        }
        return true;
      }
      function tryClash(a, b) {
        if (clashT > 0) return;
        if (Math.max(a.speed, b.speed) < 150) return;
        var pa = pose(a), pb = pose(b);
        var c = closest(pa.hand, pa.tip, pb.hand, pb.tip);
        if (c.d > 5) return;
        clashT = 0.3; shake = 5;
        sparks(c.x, c.y, '#ffd166', 14, 220);
        fxs.push({ x: c.x, y: c.y, vx: 0, vy: 0, life: 0.22, t: 0, col: '#ffffff', star: true });
        var L = localIdx(), i;
        for (i = 0; i < 2; i++) {
          if (mode === 'bot' || i === L) {
            F[i].vx += -F[i].face * 170; F[i].stun = 0.16; F[i].sl = 0; F[i].sa = clamp(F[i].sa - 0.3, -1.3, 1.45);
          }
        }
      }

      // ---------- máy đánh ----------
      function botInput(dt) {
        var b = F[1], p = F[0], inp = {};
        var dx = p.x - b.x, dist = Math.abs(dx), dir = dx > 0 ? 1 : -1, r;
        bot.t -= dt;
        if (p.sl > 0 && dist < 135 && bot.m !== 'guard' && Math.random() < 0.05) { bot.m = Math.random() < 0.5 ? 'guard' : 'retreat'; bot.t = 0.4; }
        if (bot.t <= 0) {
          r = Math.random();
          if (dist > 135) { bot.m = 'approach'; bot.t = rnd(0.25, 0.5); }
          else if (dist < 66) { bot.m = r < 0.55 ? 'retreat' : 'slash'; bot.t = 0.3; }
          else {
            if (r < 0.40) bot.m = 'slash'; else if (r < 0.62) bot.m = 'guard'; else if (r < 0.80) bot.m = 'poke'; else bot.m = 'strafe';
            bot.t = rnd(0.35, 0.8); bot.dir = Math.random() < 0.5 ? 1 : -1;
          }
        }
        var tsa = 0.25, te = 0.8;
        if (bot.m === 'approach') inp.mv = dir;
        else if (bot.m === 'retreat') { inp.mv = -dir; tsa = 0.5; te = 0.55; }
        else if (bot.m === 'guard') { tsa = 0.55; te = 0.5; inp.mv = dist < 90 ? -dir * 0.5 : 0; }
        else if (bot.m === 'poke') { tsa = 0.05; te = 1; inp.mv = dist > 95 ? dir * 0.6 : 0; }
        else if (bot.m === 'strafe') inp.mv = bot.dir * 0.6;
        else if (bot.m === 'slash') { inp.mv = dist > 100 ? dir * 0.5 : 0; if (dist < 125) inp.slash = true; }
        if (Math.random() < dt * 0.15 && b.g) inp.jump = true;
        if ((b.x > PR - 34 && inp.mv > 0) || (b.x < PL + 34 && inp.mv < 0)) inp.mv = 0;
        inp.sUp = b.sa < tsa - 0.04; inp.sDn = b.sa > tsa + 0.04; inp.eUp = b.e < te - 0.05; inp.eDn = b.e > te + 0.05;
        return inp;
      }
      function keyInput() {
        return {
          mv: (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0), jump: !!keys.KeyW, crouch: !!keys.KeyS,
          sUp: !!keys.ArrowRight, sDn: !!keys.ArrowLeft, eUp: !!keys.ArrowUp, eDn: !!keys.ArrowDown, slash: !!keys.Space
        };
      }

      // ---------- luật hiệp đấu ----------
      function startMatch(sc) {
        scene = sc || scene; wins = [0, 0]; round = 1;
        resetFighters(); timeLeft = ROUND_TIME; readyT = 2.2; sstate = 'ready'; roundWin = -2;
        initPetals();
      }
      function nextRound() {
        round++; resetFighters(); timeLeft = ROUND_TIME; readyT = 2.2; sstate = 'ready'; roundWin = -2;
      }
      function roundEnd(w) {
        if (sstate !== 'fight') return;
        sstate = 'rend'; rendT = 2.4; roundWin = w;
        if (w >= 0) wins[w]++;
        if (w >= 0) F[1 - w].dead = true;
        else { F[0].stun = 0; F[1].stun = 0; }
        shake = 6;
      }
      function nameOf(i) {
        if (mode === 'bot') return i === 0 ? 'Bạn' : 'Máy';
        return i === me ? 'Bạn' : 'Đối thủ';
      }
      function rematch() {
        var sc = pickScene();
        if (mode === 'online') send({ t: 'again', n: sc });
        startMatch(sc);
      }

      function update(dt) {
        var i, p;
        for (i = 0; i < petals.length; i++) {
          p = petals[i]; p.ph += dt;
          p.x += (p.vx + Math.sin(p.ph) * 8) * dt; p.y += p.vy * dt;
          if (p.y > 310 || p.x < -10) { p.y = -6; p.x = rnd(0, SW + 40); }
        }
        for (i = fxs.length - 1; i >= 0; i--) {
          p = fxs[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt;
          if (p.t > p.life) fxs.splice(i, 1);
        }
        for (i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; floats[i].y -= 28 * dt; if (floats[i].t > 0.9) floats.splice(i, 1); }
        if (shake > 0) shake = Math.max(0, shake - dt * 30);
        if (clashT > 0) clashT -= dt;
        if (sstate === 'menu' || sstate === 'wait') return;

        var active = sstate === 'fight', L = localIdx(), R = 1 - L, empty = {};
        if (mode === 'bot') {
          stepFighter(F[0], keyInput(), dt, active);
          stepFighter(F[1], active ? botInput(dt) : empty, dt, active);
        } else {
          stepFighter(F[L], keyInput(), dt, active);
          if (rt) {
            var k = Math.min(1, dt * 14), q = F[R];
            if (rt.snap) { q.x = rt.x; q.y = rt.y; q.sa = rt.a; q.e = rt.e; q.cr = rt.c; rt.snap = false; q.has = false; }
            q.vx = (rt.x - q.x) * 14;
            q.x += (rt.x - q.x) * k; q.y += (rt.y - q.y) * k; q.sa += (rt.a - q.sa) * k; q.e += (rt.e - q.e) * k; q.cr += (rt.c - q.cr) * k;
            q.hp = rt.h; q.dead = rt.d; q.g = rt.y >= GY - 1;
            if (q.g) q.ph += dt * Math.abs(q.vx) * 0.07;
          } else stepFighter(F[R], empty, dt, false);
        }
        // đẩy nhau ra, quay mặt về phía đối thủ
        var ov = 26 - Math.abs(F[1].x - F[0].x), sg;
        if (ov > 0 && Math.abs(F[0].y - F[1].y) < 40) {
          if (mode === 'bot') { sg = F[1].x >= F[0].x ? 1 : -1; F[0].x -= sg * ov / 2; F[1].x += sg * ov / 2; }
          else { sg = F[L].x >= F[R].x ? 1 : -1; F[L].x += sg * ov; }
        }
        for (i = 0; i < 2; i++) {
          var o = F[1 - i];
          if (Math.abs(o.x - F[i].x) > 10) F[i].face = o.x >= F[i].x ? 1 : -1;
          kin(F[i], dt);
        }
        if (active) {
          if (mode === 'bot') { tryHit(F[1], F[0]); tryHit(F[0], F[1]); }
          else tryHit(F[R], F[L]);
          tryClash(F[0], F[1]);
          // chết hoặc rơi khỏi bục
          for (i = 0; i < 2; i++) {
            if (mode !== 'bot' && i !== L) continue;
            if (F[i].y > GY + 70) F[i].hp = 0;
            if (F[i].hp <= 0 && sstate === 'fight') {
              F[i].hp = 0;
              if (mode === 'online') send({ t: 'ko', w: 1 - i });
              roundEnd(1 - i);
            }
          }
          if (sstate === 'fight') {
            timeLeft -= dt;
            if (timeLeft <= 0 && (mode === 'bot' || me === 0)) {
              timeLeft = 0;
              var w = F[0].hp > F[1].hp ? 0 : (F[1].hp > F[0].hp ? 1 : -1);
              if (mode === 'online') send({ t: 'ko', w: w });
              roundEnd(w);
            } else if (timeLeft < 0) timeLeft = 0;
          }
        } else if (sstate === 'ready') {
          readyT -= dt;
          if (readyT <= 0) sstate = 'fight';
        } else if (sstate === 'rend') {
          rendT -= dt;
          if (rendT <= 0) {
            if (wins[0] >= WIN_ROUNDS || wins[1] >= WIN_ROUNDS) sstate = 'over';
            else nextRound();
          }
        }
        if (mode === 'online') {
          sendT -= dt;
          if (sendT <= 0) {
            var f = F[L];
            send({ t: 's', x: Math.round(f.x * 10) / 10, y: Math.round(f.y * 10) / 10, a: Math.round(f.sa * 100) / 100,
              e: Math.round(f.e * 100) / 100, c: Math.round(f.cr * 100) / 100, h: Math.round(f.hp), d: f.dead ? 1 : 0 });
            sendT = 0.05;
          }
        }
      }

      // ---------- vẽ ----------
      function line(pts, w, col) {
        x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
        x.stroke();
      }
      function drawFighter(f) {
        var P = PAL[scene], p = pose(f), col = TEAM[f.i], d = f.face, ink = P.ink, i;
        x.save();
        x.lineCap = 'round'; x.lineJoin = 'round';
        x.globalAlpha = f.dead ? 0.75 : (f.inv > 0 && Math.floor(f.inv * 22) % 2 === 0 ? 0.5 : 1);
        line([p.sh, p.bel, p.bh], 5, ink);
        line([p.hip, p.kb, p.bf], 6, ink);
        line([p.hip, p.kf, p.ff], 6, ink);
        line([p.neck, p.hip], 8, ink);
        x.fillStyle = ink; disc(x, p.head[0], p.head[1], 10.5);
        var wave = Math.sin(tm * 7 + f.i) * 3, tail = 14 + Math.abs(f.vx) * 0.06;
        x.fillStyle = col; x.beginPath(); x.moveTo(p.neck[0], p.neck[1] - 1);
        x.quadraticCurveTo(p.neck[0] - d * tail * 0.6, p.neck[1] + 2 + wave, p.neck[0] - d * tail, p.neck[1] + 9 + wave);
        x.quadraticCurveTo(p.neck[0] - d * tail * 0.4, p.neck[1] + 8, p.neck[0], p.neck[1] + 5);
        x.closePath(); x.fill();
        line([p.sh, p.elbow, p.hand], 5, ink);
        var ga = x.globalAlpha;
        if (f.speed > 450) { x.globalAlpha = ga * 0.3; line([p.hand, p.tip], 10, col); x.globalAlpha = ga; }
        x.lineCap = 'butt';
        line([p.hand, p.tip], 6, P.edge);
        line([p.hand, p.tip], 3, '#f4f7fb');
        x.lineCap = 'round';
        var ang = Math.atan2(p.tip[1] - p.hand[1], p.tip[0] - p.hand[0]) + 1.5708, gx = Math.cos(ang) * 6, gy = Math.sin(ang) * 6;
        line([[p.hand[0] - gx, p.hand[1] - gy], [p.hand[0] + gx, p.hand[1] + gy]], 3.5, '#d4a24c');
        x.fillStyle = col;
        var js = [p.sh, p.elbow, p.kf, p.kb];
        for (i = 0; i < js.length; i++) disc(x, js[i][0], js[i][1], 3.3);
        disc(x, p.hip[0], p.hip[1], 4);
        x.restore();
      }
      function bar(px, py, w, v, col, right) {
        x.fillStyle = PAL[scene].hudbg; x.globalAlpha = 0.7; rr(x, px, py, w, 10, 3); x.globalAlpha = 1;
        var fw = Math.max(0, w * v / 100);
        x.fillStyle = col; if (fw > 0) rr(x, right ? px + w - fw : px, py, fw, 10, 3);
      }
      function drawHud() {
        var P = PAL[scene], i;
        x.textAlign = 'left'; x.fillStyle = P.hudtext; x.font = '700 13px Nunito Sans, sans-serif';
        x.fillText(nameOf(0), 40, 24);
        x.textAlign = 'right'; x.fillText(nameOf(1), 640, 24);
        bar(40, 30, 210, F[0].hp, TEAM[0], false);
        bar(430, 30, 210, F[1].hp, TEAM[1], true);
        for (i = 0; i < WIN_ROUNDS; i++) {
          x.strokeStyle = TEAM[0]; x.fillStyle = TEAM[0]; x.lineWidth = 1.5;
          x.beginPath(); x.arc(46 + i * 16, 54, 4.5, 0, 6.2832); if (i < wins[0]) x.fill(); else x.stroke();
          x.strokeStyle = TEAM[1]; x.fillStyle = TEAM[1];
          x.beginPath(); x.arc(634 - i * 16, 54, 4.5, 0, 6.2832); if (i < wins[1]) x.fill(); else x.stroke();
        }
        x.textAlign = 'center'; x.fillStyle = P.hudtext; x.font = '600 12px Nunito Sans, sans-serif';
        x.fillText('Hiệp ' + round, 340, 24);
        x.font = '700 22px Nunito Sans, sans-serif';
        x.fillText(String(Math.ceil(timeLeft)), 340, 50);
        x.textAlign = 'left';
      }
      function banner(t1, t2) {
        x.fillStyle = 'rgba(10,10,25,0.55)'; x.fillRect(0, 120, SW, 96);
        x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.font = '700 34px Nunito Sans, sans-serif';
        x.fillText(t1, SW / 2, 172);
        if (t2) { x.fillStyle = '#e2e8f0'; x.font = '600 15px Nunito Sans, sans-serif'; x.fillText(t2, SW / 2, 198); }
        x.textAlign = 'left';
      }
      function draw() {
        ensureBg();
        x.save();
        if (shake > 0) x.translate(rnd(-shake, shake) * 0.5, rnd(-shake, shake) * 0.5);
        x.drawImage(bgCv, 0, 0, SW, SH);
        var P = PAL[scene], i, p;
        x.fillStyle = P.petal; x.globalAlpha = 0.9;
        for (i = 0; i < petals.length; i++) disc(x, petals[i].x, petals[i].y, petals[i].r);
        x.globalAlpha = 1;
        if (F.length === 2 && sstate !== 'menu' && sstate !== 'wait') {
          drawFighter(F[0]); drawFighter(F[1]);
        }
        for (i = 0; i < fxs.length; i++) {
          p = fxs[i]; x.globalAlpha = Math.max(0, 1 - p.t / p.life);
          if (p.star) {
            x.strokeStyle = '#ffd166'; x.lineWidth = 2.5; x.lineCap = 'round';
            for (var a = 0; a < 7; a++) { var an = a * 0.898, rr1 = 6 + p.t * 60; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x + Math.cos(an) * rr1, p.y + Math.sin(an) * rr1); x.stroke(); }
            x.fillStyle = '#ffffff'; disc(x, p.x, p.y, 4);
          } else { x.fillStyle = p.col; disc(x, p.x, p.y, 2.2); }
        }
        x.globalAlpha = 1;
        x.restore();
        x.font = '700 16px Nunito Sans, sans-serif'; x.textAlign = 'center';
        for (i = 0; i < floats.length; i++) { x.globalAlpha = Math.max(0, 1 - floats[i].t / 0.9); x.fillStyle = floats[i].col; x.fillText(floats[i].s, floats[i].x, floats[i].y); }
        x.globalAlpha = 1; x.textAlign = 'left';
        if (sstate === 'menu' || sstate === 'wait') {
          x.fillStyle = 'rgba(10,10,25,0.55)'; x.fillRect(0, 130, SW, 100);
          x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.font = '700 32px Nunito Sans, sans-serif';
          x.fillText(sstate === 'menu' ? 'Đấu kiếm ⚔️' : 'Đang chờ bạn bè vào phòng...', SW / 2, 182);
          x.fillStyle = '#e2e8f0'; x.font = '600 15px Nunito Sans, sans-serif';
          x.fillText(sstate === 'menu' ? 'Chọn chế độ ở bên dưới' : 'Mã phòng: ' + roomCode, SW / 2, 208);
          x.textAlign = 'left';
          return;
        }
        drawHud();
        if (sstate === 'ready') banner(readyT > 0.7 ? 'Hiệp ' + round : 'Chiến!', readyT > 0.7 ? 'Thắng ' + WIN_ROUNDS + ' hiệp để thắng trận' : '');
        else if (sstate === 'rend') {
          banner(roundWin < 0 ? 'Hòa hiệp!' : nameOf(roundWin) + ' thắng hiệp!', wins[0] + ' - ' + wins[1]);
        } else if (sstate === 'over') {
          var win = wins[0] > wins[1] ? 0 : 1, mine = localIdx();
          banner(win === mine ? 'Bạn thắng trận! 🎉' : (mode === 'bot' ? 'Máy thắng trận' : 'Đối thủ thắng trận'), 'Chạm vào màn hình để chơi lại');
        }
      }

      // ---------- mạng ----------
      function send(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
      function closeWs() { var w = ws; ws = null; if (w) { try { w.close(); } catch (e) {} } }
      function toMenu() {
        connId++; closeWs(); mode = ''; sstate = 'menu'; resetFighters(); showMenu(true); setMsg('');
      }
      function num(v, a, b, d) { return (typeof v === 'number' && isFinite(v)) ? clamp(v, a, b) : d; }
      function onMsg(m) {
        if (m.t === 'hello') {
          me = m.idx === 1 ? 1 : 0;
          setMsg('Mã phòng: ' + roomCode + '. Gửi mã này cho bạn bè nhé!');
        } else if (m.t === 'start') {
          var sc = pickScene();
          if (me === 0) send({ t: 'scene', n: sc });
          startMatch(sc);
          setMsg('Phòng ' + roomCode + ' • Bạn là ' + (me === 0 ? 'kiếm sĩ xanh (bên trái)' : 'kiếm sĩ cam (bên phải)'));
        } else if (m.t === 'scene') {
          if (PAL[m.n]) { scene = m.n; }
        } else if (m.t === 's') {
          if (mode !== 'online') return;
          rt = rt || { x: 0, y: GY, a: 0.2, e: 0.85, c: 0, h: 100, d: 0, snap: true };
          rt.x = num(m.x, -100, 800, rt.x); rt.y = num(m.y, -200, 600, rt.y); rt.a = num(m.a, -1.4, 1.5, rt.a);
          rt.e = num(m.e, 0, 1, rt.e); rt.c = num(m.c, 0, 1, rt.c); rt.h = num(m.h, 0, 100, rt.h); rt.d = m.d ? 1 : 0;
        } else if (m.t === 'hit') {
          var hx = num(m.x, 0, SW, 340), hy = num(m.y, 0, SH, 180), dd = num(m.d, 0, 40, 0);
          shake = 5; sparks(hx, hy, '#ff4d4d', 10, 160); floatText(hx, hy - 12, '-' + dd, '#ff4d4d');
        } else if (m.t === 'ko') {
          if (sstate === 'fight') roundEnd(m.w === 0 ? 0 : (m.w === 1 ? 1 : -1));
        } else if (m.t === 'again') {
          if (sstate === 'over') startMatch(PAL[m.n] ? m.n : pickScene());
          else if (sstate === 'ready' && round === 1 && me === 1 && PAL[m.n]) scene = m.n;
        } else if (m.t === 'left') {
          resetFighters(); sstate = 'wait';
          setMsg('Đối thủ đã thoát. Mã phòng ' + roomCode + ' vẫn đang chờ người vào.');
        }
      }
      function connect(code) {
        closeWs();
        var token = ++connId;
        mode = 'online'; roomCode = code; sstate = 'wait'; me = 0; resetFighters();
        setMsg('Đang kiểm tra kết nối...');
        fetch('/__game/ws?room=' + code + '&g=sword', { cache: 'no-store' }).then(function (r) {
          if (token !== connId) return;
          if (r.status === 426) { openSocket(code); return; }
          toMenu();
          if (r.status === 501) setMsg('Worker chưa gắn Durable Object POOL: kiểm tra binding và migration trong wrangler.');
          else if (r.status === 409) setMsg('Phòng ' + code + ' đã đủ 2 người.');
          else if (r.status === 403) setMsg('Bị chặn vì Origin không khớp domain (403).');
          else if (r.status >= 500) setMsg('Durable Object lỗi (' + r.status + '): kiểm tra export class PoolRoom và migration.');
          else setMsg('Worker chưa có bản mới (mã ' + r.status + '): hãy deploy lại.');
        }).catch(function () {
          if (token !== connId) return;
          toMenu(); setMsg('Không gọi được Worker (lỗi mạng).');
        });
      }
      function openSocket(code) {
        var opened = false, mine;
        setMsg('Đang kết nối...');
        var url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/__game/ws?room=' + code + '&g=sword';
        try { mine = new WebSocket(url); } catch (e) { toMenu(); setMsg('Trình duyệt không mở được WebSocket.'); return; }
        ws = mine;
        mine.onopen = function () { opened = true; };
        mine.onmessage = function (ev) {
          if (mine !== ws) return;
          var m;
          try { m = JSON.parse(ev.data); } catch (e) { return; }
          if (m && typeof m === 'object') onMsg(m);
        };
        mine.onclose = function () {
          if (mine !== ws) return;
          ws = null;
          toMenu();
          setMsg(opened ? 'Mất kết nối tới phòng.' : 'Không mở được WebSocket (mạng/proxy chặn hoặc WebSockets bị tắt trên Cloudflare).');
        };
      }

      // ---------- bàn phím ----------
      var GAME_KEYS = { KeyA: 1, KeyD: 1, KeyW: 1, KeyS: 1, ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, Space: 1 };
      document.addEventListener('keydown', function (e) {
        if (cur !== api || !GAME_KEYS[e.code]) return;
        if (e.target && e.target.tagName === 'INPUT') return;
        e.preventDefault();
        keys[e.code] = true;
      });
      document.addEventListener('keyup', function (e) { if (GAME_KEYS[e.code]) keys[e.code] = false; });
      window.addEventListener('blur', function () { keys = {}; });

      el('sBot').onclick = function () {
        closeWs(); connId++; mode = 'bot'; showMenu(false); setMsg('Bạn là kiếm sĩ xanh (bên trái). Dùng bàn phím để điều khiển.');
        startMatch(pickScene());
      };
      el('sCreate').onclick = function () {
        var code = '';
        for (var i = 0; i < 4; i++) code += A.charAt(Math.floor(Math.random() * A.length));
        showMenu(false); connect(code);
      };
      el('sJoin').onclick = function () {
        var v = clean(el('sCode').value);
        if (v.length !== 4) { setMsg('Nhập đủ 4 ký tự mã phòng.'); return; }
        showMenu(false); connect(v);
      };
      el('sBack').onclick = toMenu;

      resetFighters(); initPetals(); scene = pickScene();
      globalThis.__s = function () { return { F: F, sstate: sstate, wins: wins, round: round, timeLeft: timeLeft, scene: scene, keys: keys, rt: rt }; };
      var api = {
        w: SW, h: SH,
        hint: 'A/D đi • W nhảy • S cúi • ←/→ nâng hạ vai • ↑/↓ duỗi co khuỷu • Space chém',
        update: update, draw: draw,
        down: function () { if (sstate === 'over') rematch(); },
        key: function () {},
        leave: toMenu,
        busy: function () { return mode === 'online' && ws !== null; }
      };
      return api;
    })();

`;
