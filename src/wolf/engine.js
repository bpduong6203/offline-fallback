// ===================== MA SÓI (server) =====================
// Server giữ toàn bộ trạng thái và vai trò; mỗi người chỉ nhận phần thông tin mình được phép biết.
export const WOLF_MIN = 5, WOLF_MAX = 12;
const WOLF_T = { guard: 20, wolf: 30, seer: 20, witch: 25, day: 90, vote: 30, hunter: 20 };
const WOLF_SUBS = ['guard', 'wolf', 'seer', 'witch'];
const ROLE_VI = { wolf: 'Sói', villager: 'Dân làng', seer: 'Tiên tri', guard: 'Bảo vệ', witch: 'Phù thủy', hunter: 'Thợ săn' };

export class WolfEngine {
  constructor(opts) {
    opts = opts || {};
    this.T = Object.assign({}, WOLF_T, opts.T || {});
    this.idleMs = opts.idleMs || 120000;
    this.onError = opts.onError || null;
    this.timer = null;
    this.idle = null;
    this.reset();
  }

  reset() {
    if (this.timer) clearTimeout(this.timer);
    if (this.idle) clearTimeout(this.idle);
    this.timer = null; this.idle = null;
    this.players = new Map();
    this.nextId = 1; this.hostId = null; this.cfgManual = null;
    this.resetGame();
  }

  resetGame() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.phase = 'lobby'; this.sub = null; this.day = 0; this.deadline = 0; this.winner = null;
    this.night = null; this.pendingHunter = null; this.afterHunter = null; this.lastProtect = null;
    this.ready = new Set(); this.votes = new Map(); this.voteResolved = false; this.log = []; this.chatLog = [];
    for (const p of this.players.values()) {
      p.role = null; p.alive = true; p.seen = []; p.heal = true; p.poison = true;
    }
  }

  // ---------- tiện ích ----------
  addLog(t) { this.log.push(t); if (this.log.length > 60) this.log.shift(); }
  err(p, m, fatal) { try { p.send({ t: 'err', m: m, fatal: !!fatal }); } catch (e) {} }
  alive() { return [...this.players.values()].filter((p) => p.alive); }
  aliveWith(role) { return this.alive().filter((p) => p.role === role); }
  anyOnline() { for (const p of this.players.values()) if (p.online) return true; return false; }
  clearIdle() { if (this.idle) { clearTimeout(this.idle); this.idle = null; } }
  checkIdle() {
    if (this.anyOnline() || this.idle) return;
    this.idle = setTimeout(() => { this.idle = null; this.reset(); }, this.idleMs);
  }
  setTimer(sec, fn) {
    if (this.timer) clearTimeout(this.timer);
    this.deadline = Date.now() + sec * 1000;
    this.timer = setTimeout(() => { this.timer = null; fn(); }, sec * 1000);
  }
  stopTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null; this.deadline = 0;
  }
  cleanName(x) {
    let n = String(x || '').replace(/[\u0000-\u001f<>]/g, '').trim().slice(0, 12);
    if (!n) n = 'Người chơi';
    const base = n;
    let k = 2;
    const taken = () => [...this.players.values()].some((q) => q.name.toLowerCase() === n.toLowerCase());
    while (taken()) { n = base.slice(0, 10) + k; k++; }
    return n;
  }
  defaultCfg(n) {
    return { wolves: n >= 10 ? 3 : (n >= 7 ? 2 : 1), seer: true, guard: n >= 6, witch: n >= 7, hunter: n >= 8 };
  }
  currentCfg() { return this.cfgManual || this.defaultCfg(this.players.size); }
  buildRoles(n, cfg) {
    const w = cfg.wolves;
    if (!(w >= 1) || w * 2 >= n) return null;
    const list = [];
    for (let i = 0; i < w; i++) list.push('wolf');
    if (cfg.seer) list.push('seer');
    if (cfg.guard) list.push('guard');
    if (cfg.witch) list.push('witch');
    if (cfg.hunter) list.push('hunter');
    if (list.length > n) return null;
    while (list.length < n) list.push('villager');
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = list[i]; list[i] = list[j]; list[j] = t;
    }
    return list;
  }
  canSee(p, scope) {
    if (scope === 'all') return true;
    if (scope === 'wolf') return p.role === 'wolf';
    if (scope === 'dead') return !p.alive;
    return false;
  }

  // ---------- kết nối ----------
  join(m, send) {
    const tok = String(m.tok || '');
    if (tok.length < 8 || tok.length > 64) {
      send({ t: 'err', m: 'Mã phiên không hợp lệ.', fatal: true });
      return null;
    }
    let p = null;
    for (const q of this.players.values()) if (q.tok === tok) p = q;
    if (p) {
      p.send = send; p.online = true; p.quit = false;
      if (p.dropTimer) { clearTimeout(p.dropTimer); p.dropTimer = null; }
      this.clearIdle();
      for (const c of this.chatLog) {
        if (this.canSee(p, c.scope)) send({ t: 'chat', who: c.who, text: c.text, scope: c.scope });
      }
      this.broadcast();
      return p.id;
    }
    if (this.phase !== 'lobby') {
      send({ t: 'err', m: 'Ván đang diễn ra, chưa vào được. Đợi ván sau nhé.', fatal: true });
      return null;
    }
    if (this.players.size >= WOLF_MAX) {
      send({ t: 'err', m: 'Phòng đã đủ ' + WOLF_MAX + ' người.', fatal: true });
      return null;
    }
    p = {
      id: this.nextId++, name: this.cleanName(m.name), tok: tok, send: send, online: true, quit: false,
      alive: true, role: null, seen: [], heal: true, poison: true, lastChat: 0, dropTimer: null
    };
    this.players.set(p.id, p);
    if (!this.hostId) this.hostId = p.id;
    this.clearIdle();
    this.addLog(p.name + ' đã vào phòng.');
    this.broadcast();
    return p.id;
  }

  leave(pid, send) {
    const p = this.players.get(pid);
    if (!p || p.send !== send) return;
    p.online = false;
    if (this.phase === 'lobby') {
      p.dropTimer = setTimeout(() => { if (!p.online) this.removePlayer(p.id); }, 15000);
    }
    this.broadcast();
    this.checkIdle();
  }

  removePlayer(id) {
    const p = this.players.get(id);
    if (!p) return;
    if (p.dropTimer) clearTimeout(p.dropTimer);
    this.players.delete(id);
    if (this.hostId === id) {
      const first = this.players.values().next().value;
      this.hostId = first ? first.id : null;
    }
    if (this.players.size === 0) { this.reset(); return; }
    this.addLog(p.name + ' đã rời phòng.');
    this.broadcast();
    this.checkIdle();
  }

  quit(p) {
    if (this.phase === 'lobby') { this.removePlayer(p.id); return; }
    p.online = false; p.quit = true; p.send = function () {};
    this.broadcast();
    this.checkIdle();
  }

  handle(pid, m) {
    const p = this.players.get(pid);
    if (!p || !m || typeof m.t !== 'string') return;
    try {
      switch (m.t) {
        case 'cfg': return this.setCfg(p, m);
        case 'start': return this.start(p);
        case 'act': return this.act(p, m);
        case 'vote': return this.vote(p, m);
        case 'ready': return this.markReady(p);
        case 'shoot': return this.shoot(p, m);
        case 'chat': return this.chat(p, m);
        case 'again': return this.again(p);
        case 'quit': return this.quit(p);
      }
    } catch (e) {
      if (this.onError) this.onError(e);
    }
  }

  // ---------- sảnh ----------
  setCfg(p, m) {
    if (p.id !== this.hostId || this.phase !== 'lobby') return;
    const w = Math.max(1, Math.min(4, Math.floor(Number(m.wolves) || 1)));
    this.cfgManual = { wolves: w, seer: !!m.seer, guard: !!m.guard, witch: !!m.witch, hunter: !!m.hunter };
    this.broadcast();
  }

  start(p) {
    if (p.id !== this.hostId || this.phase !== 'lobby') return;
    const n = this.players.size;
    if (n < WOLF_MIN) return this.err(p, 'Cần ít nhất ' + WOLF_MIN + ' người để bắt đầu.');
    const roles = this.buildRoles(n, this.currentCfg());
    if (!roles) return this.err(p, 'Cấu hình vai không hợp lệ: số Sói phải ít hơn nửa số người và tổng số vai không vượt số người.');
    let i = 0;
    for (const q of this.players.values()) {
      q.role = roles[i++]; q.alive = true; q.seen = []; q.heal = true; q.poison = true;
    }
    this.log = []; this.chatLog = []; this.day = 0; this.winner = null; this.lastProtect = null;
    const cnt = {};
    roles.forEach((r) => { cnt[r] = (cnt[r] || 0) + 1; });
    const parts = Object.keys(cnt).map((r) => cnt[r] + ' ' + ROLE_VI[r]);
    this.addLog('Ván bắt đầu với ' + n + ' người: ' + parts.join(', ') + '.');
    this.startNight();
  }

  again(p) {
    if (p.id !== this.hostId || this.phase !== 'over') return;
    for (const q of [...this.players.values()]) if (q.quit || !q.online) this.players.delete(q.id);
    if (!this.players.has(this.hostId)) {
      const first = this.players.values().next().value;
      this.hostId = first ? first.id : null;
    }
    this.resetGame();
    this.broadcast();
  }

  // ---------- đêm ----------
  startNight() {
    this.day++;
    this.phase = 'night';
    this.night = { protect: null, wolfVotes: new Map(), victim: null, healed: false, poison: null, acted: new Set() };
    this.addLog('🌙 Đêm ' + this.day + ' buông xuống, cả làng đi ngủ...');
    this.nextSub(-1);
  }

  subActive(s) {
    if (s === 'guard') return this.aliveWith('guard').length > 0;
    if (s === 'wolf') return this.aliveWith('wolf').length > 0;
    if (s === 'seer') return this.aliveWith('seer').length > 0;
    if (s === 'witch') return this.aliveWith('witch').some((w) => w.heal || w.poison);
    return false;
  }

  nextSub(i) {
    for (let k = i + 1; k < WOLF_SUBS.length; k++) {
      if (this.subActive(WOLF_SUBS[k])) { this.enterSub(WOLF_SUBS[k]); return; }
    }
    this.resolveNight();
  }

  enterSub(s) {
    this.sub = s;
    this.setTimer(this.T[s], () => this.endSub());
    this.broadcast();
  }

  endSub() {
    if (this.timer) { clearTimeout(this.timer); this.timer = null; }
    const s = this.sub;
    if (s === 'wolf') this.decideVictim();
    this.nextSub(WOLF_SUBS.indexOf(s));
  }

  decideVictim() {
    const tally = new Map();
    for (const t of this.night.wolfVotes.values()) tally.set(t, (tally.get(t) || 0) + 1);
    let max = 0;
    for (const c of tally.values()) if (c > max) max = c;
    if (!max) { this.night.victim = null; return; }
    const top = [...tally.entries()].filter((e) => e[1] === max).map((e) => e[0]);
    this.night.victim = top[Math.floor(Math.random() * top.length)];
  }

  subDone() {
    const n = this.night, s = this.sub;
    if (s === 'wolf') return this.aliveWith('wolf').every((q) => n.wolfVotes.has(q.id));
    if (s === 'guard' || s === 'seer' || s === 'witch') {
      return this.aliveWith(s).every((q) => n.acted.has(q.id));
    }
    return false;
  }

  afterAct() {
    if (this.subDone()) this.endSub(); else this.broadcast();
  }

  act(p, m) {
    if (this.phase !== 'night' || !p.alive) return;
    const n = this.night, s = this.sub, a = m.a;
    const tgt = this.players.get(Number(m.target));
    if (s === 'guard' && p.role === 'guard' && a === 'protect') {
      if (!tgt || !tgt.alive) return;
      if (tgt.id === this.lastProtect) return this.err(p, 'Không được bảo vệ cùng một người hai đêm liên tiếp.');
      n.protect = tgt.id; n.acted.add(p.id);
      return this.afterAct();
    }
    if (s === 'wolf' && p.role === 'wolf' && a === 'bite') {
      if (!tgt || !tgt.alive || tgt.role === 'wolf') return;
      n.wolfVotes.set(p.id, tgt.id);
      return this.afterAct();
    }
    if (s === 'seer' && p.role === 'seer' && a === 'see') {
      if (!tgt || !tgt.alive || tgt.id === p.id) return;
      if (n.acted.has(p.id)) return;
      p.seen.push({ name: tgt.name, wolf: tgt.role === 'wolf', day: this.day });
      n.acted.add(p.id);
      return this.afterAct();
    }
    if (s === 'witch' && p.role === 'witch') {
      if (n.acted.has(p.id)) return;
      if (a === 'heal') {
        if (!p.heal || n.victim == null) return;
        n.healed = true; p.heal = false;
      } else if (a === 'poison') {
        if (!p.poison || !tgt || !tgt.alive || tgt.id === p.id) return;
        n.poison = tgt.id; p.poison = false;
      } else if (a !== 'skip') {
        return;
      }
      n.acted.add(p.id);
      return this.afterAct();
    }
  }

  resolveNight() {
    const n = this.night;
    this.sub = null;
    const deaths = [];
    if (n.victim != null && n.protect !== n.victim && !n.healed) deaths.push([n.victim, 'wolf']);
    if (n.poison != null && !deaths.some((d) => d[0] === n.poison)) deaths.push([n.poison, 'poison']);
    this.lastProtect = n.protect;
    this.addLog('☀️ Trời sáng (ngày ' + this.day + ').');
    let any = false;
    for (const d of deaths) { if (this.kill(d[0], d[1])) any = true; }
    if (!any) this.addLog('Đêm qua không có ai chết.');
    this.afterDeaths('day');
  }

  kill(id, cause) {
    const p = this.players.get(id);
    if (!p || !p.alive) return false;
    p.alive = false;
    this.addLog('💀 ' + p.name + ' đã chết. Vai trò: ' + ROLE_VI[p.role] + '.');
    if (p.role === 'hunter' && cause !== 'poison') this.pendingHunter = p.id;
    return true;
  }

  afterDeaths(next) {
    if (this.pendingHunter) { this.enterHunter(next); return; }
    if (this.checkWin()) return;
    this.go(next);
  }

  go(next) { if (next === 'day') this.startDay(); else this.startNight(); }

  checkWin() {
    const w = this.aliveWith('wolf').length;
    const o = this.alive().length - w;
    if (w === 0) { this.finish('village'); return true; }
    if (w >= o) { this.finish('wolf'); return true; }
    return false;
  }

  finish(who) {
    this.phase = 'over'; this.sub = null; this.winner = who;
    this.stopTimer();
    this.addLog(who === 'wolf' ? '🐺 Bầy Sói thắng!' : '🏘️ Dân làng thắng!');
    this.broadcast();
  }

  // ---------- thợ săn ----------
  enterHunter(next) {
    this.phase = 'hunter'; this.sub = null; this.afterHunter = next;
    const h = this.players.get(this.pendingHunter);
    this.addLog('🏹 ' + h.name + ' là Thợ săn, được bắn một phát trước khi gục xuống!');
    this.setTimer(this.T.hunter, () => this.hunterDone(null));
    this.broadcast();
  }

  shoot(p, m) {
    if (this.phase !== 'hunter' || p.id !== this.pendingHunter) return;
    const tgt = this.players.get(Number(m.target));
    if (!tgt || !tgt.alive || tgt.id === p.id) return;
    this.hunterDone(tgt.id);
  }

  hunterDone(tid) {
    this.stopTimer();
    this.pendingHunter = null;
    if (tid != null) {
      const t = this.players.get(tid);
      this.addLog('🏹 Thợ săn bắn ' + t.name + '.');
      this.kill(tid, 'shot');
    } else {
      this.addLog('Thợ săn không kịp bắn.');
    }
    if (this.checkWin()) return;
    this.go(this.afterHunter);
  }

  // ---------- ngày ----------
  startDay() {
    this.phase = 'day'; this.sub = null;
    this.ready = new Set();
    this.addLog('Cả làng thảo luận xem ai là Sói.');
    this.setTimer(this.T.day, () => this.startVote());
    this.broadcast();
  }

  markReady(p) {
    if (this.phase !== 'day' || !p.alive) return;
    this.ready.add(p.id);
    if (this.alive().every((q) => this.ready.has(q.id))) this.startVote(); else this.broadcast();
  }

  startVote() {
    this.phase = 'vote'; this.votes = new Map(); this.voteResolved = false;
    this.addLog('🗳️ Bỏ phiếu treo cổ!');
    this.setTimer(this.T.vote, () => this.endVote());
    this.broadcast();
  }

  vote(p, m) {
    if (this.phase !== 'vote' || !p.alive) return;
    let t = 0;
    if (m.target) {
      const tgt = this.players.get(Number(m.target));
      if (!tgt || !tgt.alive || tgt.id === p.id) return;
      t = tgt.id;
    }
    this.votes.set(p.id, t);
    if (this.alive().every((q) => this.votes.has(q.id))) this.endVote(); else this.broadcast();
  }

  endVote() {
    this.stopTimer();
    this.voteResolved = true;
    const tally = new Map();
    for (const t of this.votes.values()) if (t) tally.set(t, (tally.get(t) || 0) + 1);
    let max = 0;
    for (const c of tally.values()) if (c > max) max = c;
    const top = [...tally.entries()].filter((e) => e[1] === max).map((e) => e[0]);
    const aliveN = this.alive().length;
    if (max > 0 && top.length === 1 && max * 2 >= aliveN) {
      const t = this.players.get(top[0]);
      this.addLog('⚖️ ' + t.name + ' bị treo cổ với ' + max + '/' + aliveN + ' phiếu.');
      this.kill(top[0], 'lynch');
    } else if (max > 0 && top.length === 1) {
      this.addLog('⚖️ Chỉ có ' + max + '/' + aliveN + ' phiếu, chưa đủ một nửa số người còn sống nên không ai bị treo cổ.');
    } else {
      this.addLog('⚖️ Không ai bị treo cổ (hòa phiếu hoặc không ai bỏ phiếu).');
    }
    this.afterDeaths('night');
  }

  // ---------- chat ----------
  chat(p, m) {
    const text = String(m.text || '').replace(/[\u0000-\u001f]/g, ' ').trim().slice(0, 200);
    if (!text) return;
    const nowt = Date.now();
    if (nowt - p.lastChat < 400) return;
    let scope;
    if (this.phase === 'lobby' || this.phase === 'over') scope = 'all';
    else if (!p.alive) scope = 'dead';
    else if (this.phase === 'night') {
      if (p.role === 'wolf') scope = 'wolf';
      else return this.err(p, 'Ban đêm không nói chuyện được.');
    } else scope = 'all';
    p.lastChat = nowt;
    const entry = { who: p.name, text: text, scope: scope };
    this.chatLog.push(entry);
    if (this.chatLog.length > 80) this.chatLog.shift();
    for (const q of this.players.values()) {
      if (q.online && this.canSee(q, scope)) {
        try { q.send({ t: 'chat', who: entry.who, text: entry.text, scope: scope }); } catch (e) {}
      }
    }
  }

  // ---------- trạng thái gửi cho từng người ----------
  broadcast() {
    for (const p of this.players.values()) {
      if (!p.online) continue;
      try { p.send({ t: 'state', s: this.buildState(p) }); } catch (e) {}
    }
  }

  actFor(p) {
    const ph = this.phase;
    if (ph === 'hunter') {
      if (p.id !== this.pendingHunter) return null;
      return { a: 'shoot', hint: 'Bạn là Thợ săn, bắn một người trước khi chết!', targets: this.alive().filter((q) => q.id !== p.id).map((q) => q.id), chosen: null };
    }
    if (!p.alive) return null;
    const others = this.alive().filter((q) => q.id !== p.id).map((q) => q.id);
    if (ph === 'night') {
      const n = this.night, s = this.sub;
      if (s === 'guard' && p.role === 'guard') {
        return { a: 'protect', hint: 'Chọn người để bảo vệ đêm nay.', targets: this.alive().filter((q) => q.id !== this.lastProtect).map((q) => q.id), chosen: n.protect, done: n.acted.has(p.id) };
      }
      if (s === 'wolf' && p.role === 'wolf') {
        const votes = {};
        for (const [w, t] of n.wolfVotes) votes[w] = t;
        return { a: 'bite', hint: 'Cả bầy chọn một nạn nhân (nhiều phiếu nhất bị cắn).', targets: this.alive().filter((q) => q.role !== 'wolf').map((q) => q.id), chosen: n.wolfVotes.get(p.id) || null, votes: votes };
      }
      if (s === 'seer' && p.role === 'seer') {
        return { a: 'see', hint: 'Chọn người để soi xem có phải Sói không.', targets: others, chosen: null, done: n.acted.has(p.id) };
      }
      if (s === 'witch' && p.role === 'witch') {
        const v = n.victim != null ? this.players.get(n.victim) : null;
        return { a: 'witch', hint: v ? 'Đêm nay ' + v.name + ' bị Sói cắn.' : 'Đêm nay không ai bị cắn.', victim: v ? { id: v.id, name: v.name } : null, heal: p.heal && !!v, poison: p.poison, targets: p.poison ? others : [], done: n.acted.has(p.id) };
      }
      return null;
    }
    if (ph === 'day') return { a: 'ready', hint: 'Thảo luận rồi bấm sẵn sàng để bỏ phiếu sớm.', ready: this.ready.has(p.id) };
    if (ph === 'vote') return { a: 'vote', hint: 'Chọn người để treo cổ, cần ít nhất một nửa số người còn sống đồng ý, hoặc bỏ qua phiếu.', targets: others, chosen: this.votes.has(p.id) ? this.votes.get(p.id) : undefined };
    return null;
  }

  buildState(p) {
    const over = this.phase === 'over';
    const players = [];
    for (const q of this.players.values()) {
      const o = { id: q.id, name: q.name, alive: q.alive, online: q.online };
      if (over || !q.alive || q.id === p.id || (p.role === 'wolf' && q.role === 'wolf')) o.role = q.role;
      if (this.phase === 'vote') o.voted = this.votes.has(q.id);
      else if (this.voteResolved && this.votes.has(q.id)) o.vote = this.votes.get(q.id);
      players.push(o);
    }
    const alive = this.alive();
    return {
      now: Date.now(), phase: this.phase, sub: this.phase === 'night' ? this.sub : null,
      day: this.day, deadline: this.deadline, you: p.id, host: this.hostId, players: players,
      cfg: this.currentCfg(), log: this.log.slice(-10), winner: this.winner,
      min: WOLF_MIN, readyCount: this.ready.size, aliveCount: alive.length, voteResolved: this.voteResolved,
      me: { role: p.role, alive: p.alive, seen: p.role === 'seer' ? p.seen : [], heal: p.role === 'witch' ? p.heal : false, poison: p.role === 'witch' ? p.poison : false, act: this.actFor(p) }
    };
  }
}
