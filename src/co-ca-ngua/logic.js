// Luật cờ cá ngựa dùng chung cho server (Durable Object) và client (chơi với máy).
// Chỉnh luật ở 2 hằng số dưới: LAUNCH = các số tung được phép xuất quân, MAX_SIXES = số lần tung 6 liên tiếp bị mất lượt.
const LAUNCH = [6], MAX_SIXES = 3;

const SEG = [[1,6,1,0,5],[6,5,0,-1,6],[7,0,1,0,2],[8,1,0,1,5],[9,6,1,0,6],[14,7,0,1,2],
  [13,8,-1,0,5],[8,9,0,1,6],[7,14,-1,0,2],[6,13,0,-1,5],[5,8,-1,0,6],[0,7,0,-1,2]];
export const TRACK = [];
SEG.forEach(([x, y, dx, dy, n]) => { for (let k = 0; k < n; k++) TRACK.push([x + dx * k, y + dy * k]); });
export const HOME = [0, 1, 2, 3].map(s => Array.from({ length: 5 }, (_, k) => [[1 + k, 7], [7, 1 + k], [13 - k, 7], [7, 13 - k]][s]));
export const SAFE = new Set([0, 8, 13, 21, 26, 34, 39, 47]);

// vị trí ngựa: -1 = trong chuồng, 0..50 = đường chính (tính từ ô xuất phát), 51..55 = đường về đích, 56 = đã về đích
export function xy(s, i, p) {
  if (p < 0) { const o = [[0,0],[9,0],[9,9],[0,9]][s], a = [[2,2],[4,2],[2,4],[4,4]][i]; return [o[0] + a[0], o[1] + a[1]]; }
  if (p <= 50) { const c = TRACK[(s * 13 + p) % 52]; return [c[0] + .5, c[1] + .5]; }
  if (p <= 55) { const c = HOME[s][p - 51]; return [c[0] + .5, c[1] + .5]; }
  const d = [[-.8,0],[0,-.8],[.8,0],[0,.8]][s], t = (i - 1.5) * .22;
  return [7.5 + d[0] + (s % 2 ? t : 0), 7.5 + d[1] + (s % 2 ? 0 : t)];
}
export const newGame = () => ({ pos: [0,1,2,3].map(() => [-1,-1,-1,-1]), turn: 0, phase: 'roll', roll: 0, sixes: 0, legal: [], winner: -1 });
const gi = (s, p) => (s * 13 + p) % 52;
function legalMoves(g, s, r) {
  const o = [];
  for (let i = 0; i < 4; i++) { const p = g.pos[s][i]; if (p < 0 ? LAUNCH.includes(r) : p + r <= 56) o.push(i); }
  return o;
}
function occupied(g, s, c) {
  const o = [];
  for (let t = 0; t < 4; t++) if (t !== s) for (let j = 0; j < 4; j++) { const q = g.pos[t][j]; if (q >= 0 && q <= 50 && gi(t, q) === c) o.push([t, j]); }
  return o;
}
export function advance(g, extra) {
  if (g.winner >= 0) { g.phase = 'over'; return; }
  if (!extra) { g.sixes = 0; g.turn = (g.turn + 1) % 4; }
  g.phase = 'roll'; g.roll = 0; g.legal = [];
}
// trả về true nếu không có nước đi (mất lượt)
export function doRoll(g, r) {
  g.roll = r; g.sixes = r === 6 ? g.sixes + 1 : 0;
  g.legal = g.sixes >= MAX_SIXES ? [] : legalMoves(g, g.turn, r);
  if (!g.legal.length) { advance(g, false); return true; }
  g.phase = 'move'; return false;
}
export function act(g, i) {
  const s = g.turn, r = g.roll, p = g.pos[s][i], np = p < 0 ? 0 : p + r; let cap = [];
  g.pos[s][i] = np;
  if (np <= 50 && !SAFE.has(gi(s, np))) { cap = occupied(g, s, gi(s, np)); cap.forEach(([t, j]) => { g.pos[t][j] = -1; }); }
  const fin = np === 56;
  if (g.pos[s].every(x => x === 56)) g.winner = s;
  advance(g, fin || cap.length > 0 || r === 6);
  return { np, from: p, cap, fin };
}
export function botPick(g) {
  const s = g.turn, r = g.roll; let best = g.legal[0], bs = -1e9;
  for (const i of g.legal) {
    const p = g.pos[s][i], np = p < 0 ? 0 : p + r; let sc = np;
    if (np === 56) sc += 200;
    if (p < 0) sc += 60;
    if (np <= 50) { const c = gi(s, np); if (SAFE.has(c)) sc += 15; else if (occupied(g, s, c).length) sc += 120; }
    if (p >= 0 && p <= 50 && SAFE.has(gi(s, p))) sc -= 8;
    sc += Math.random();
    if (sc > bs) { bs = sc; best = i; }
  }
  return best;
}
// Một ván cờ: dùng chung cho server và chế độ chơi với máy. human[s] = ghế s do người chơi (false = máy).
export class Match {
  constructor(emit, human) { this.emit = emit; this.human = human; this.g = newGame(); this.tm = 0; }
  start() { this.push(null); this.sched(); }
  push(ev) {
    const g = this.g;
    this.emit({ t: 'g', g: { pos: g.pos, turn: g.turn, phase: g.phase, roll: g.roll, legal: g.legal, winner: g.winner }, ev });
    if (g.winner >= 0) this.emit({ t: 'over', winner: g.winner });
  }
  roll() {
    const g = this.g; if (g.phase !== 'roll') return;
    const s = g.turn, r = 1 + Math.floor(Math.random() * 6), skip = doRoll(g, r);
    this.push({ k: 'roll', s, r, skip }); this.sched();
  }
  mv(i) {
    const g = this.g; if (g.phase !== 'move' || !g.legal.includes(i)) return;
    const s = g.turn, r = g.roll, res = act(g, i);
    this.push({ k: 'move', s, i, from: res.from, to: res.np, cap: res.cap, r }); this.sched();
  }
  input(seat, m) {
    if (seat !== this.g.turn) return;
    if (m.t === 'roll') this.roll(); else if (m.t === 'move') this.mv(m.i);
  }
  auto() { if (this.g.phase === 'roll') this.roll(); else this.mv(botPick(this.g)); }
  sched() {
    clearTimeout(this.tm); const g = this.g; if (g.winner >= 0) return;
    this.tm = setTimeout(() => this.auto(), this.human[g.turn] ? 20000 : (g.phase === 'roll' ? 1100 : 900));
  }
  stop() { clearTimeout(this.tm); }
}
