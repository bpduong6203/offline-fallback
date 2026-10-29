import { DurableObject } from "cloudflare:workers";

const RELAY = new Set(["hit", "grab", "thr", "brk"]); // tin nhắn gửi thẳng tới 1 người chơi

export class PartyCatsRoom extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.P = new Map();
    this.phase = "lobby";
    this.startAt = 0;
    this.alive = [];
    this.order = [];
    this.winner = 0;
    this.n = 0;
  }

  fetch() {
    const pair = new WebSocketPair();
    const client = pair[0], s = pair[1];
    s.accept();
    const id = ++this.n;
    const me = { id, ws: s, name: "Mèo", ty: 0, col: 0, wins: 0, x: 0, y: 0, z: 0, r: 0, f: 0 };

    s.addEventListener("message", (e) => {
      let m;
      try { m = JSON.parse(e.data); } catch { return; }
      if (m.t === "join") {
        me.name = String(m.name || "Mèo").slice(0, 12);
        me.ty = (m.ty | 0) & 3;
        me.col = (m.col | 0) % 6;
        this.P.set(id, me);
        this.send(s, { t: "hi", id, now: Date.now(), roster: this.roster(), ...this.info() });
        this.bc({ t: "ro", roster: this.roster() });
        this.tick();
      } else if (!this.P.has(id)) return;
      else if (m.t === "s") { me.x = +m.x; me.y = +m.y; me.z = +m.z; me.r = +m.r; me.f = m.f | 0; }
      else if (RELAY.has(m.t)) {
        const to = this.P.get(m.to | 0);
        if (to) this.send(to.ws, { ...m, from: id });
      } else if (m.t === "start" && this.phase === "lobby") {
        this.alive = [...this.P.keys()];
        this.order = [];
        this.winner = 0;
        this.startAt = Date.now() + 4000;
        this.setPhase("countdown", 4000, () => this.setPhase("play", 150000, () => this.end()));
      } else if (m.t === "out" && this.phase === "play") this.out(id);
    });

    const leave = () => {
      if (!this.P.delete(id)) return;
      this.bc({ t: "ro", roster: this.roster() });
      if (!this.P.size) { clearTimeout(this.pt); this.phase = "lobby"; this.alive = []; }
      else if (this.phase === "play" || this.phase === "countdown") this.out(id);
    };
    s.addEventListener("close", leave);
    s.addEventListener("error", leave);
    return new Response(null, { status: 101, webSocket: client });
  }

  out(id) {
    if (!this.alive.includes(id)) return;
    this.alive = this.alive.filter((i) => i !== id);
    this.order.push(id);
    if (this.phase !== "play") return this.bcInfo();
    const total = this.order.length + this.alive.length;
    if (this.alive.length <= (total > 1 ? 1 : 0)) this.end();
    else this.bcInfo();
  }
  end() {
    const total = this.order.length + this.alive.length;
    this.winner = total > 1 && this.alive.length === 1 ? this.alive[0] : 0;
    const w = this.P.get(this.winner);
    if (w) { w.wins++; this.bc({ t: "ro", roster: this.roster() }); }
    this.setPhase("done", 6000, () => { this.alive = []; this.winner = 0; this.setPhase("lobby"); });
  }
  setPhase(p, ms, next) {
    this.phase = p;
    clearTimeout(this.pt);
    this.bcInfo();
    if (ms) this.pt = setTimeout(next, ms);
  }
  info() { return { phase: this.phase, startAt: this.startAt, alive: this.alive, winner: this.winner }; }
  bcInfo() { this.bc({ t: "ph", ...this.info() }); }
  roster() { return Object.fromEntries([...this.P].map(([i, p]) => [i, [p.name, p.ty, p.col, p.wins]])); }
  send(ws, m) { try { ws.send(JSON.stringify(m)); } catch {} }
  bc(m) { const d = JSON.stringify(m); for (const p of this.P.values()) try { p.ws.send(d); } catch {} }
  tick() {
    if (this.iv) return;
    this.iv = setInterval(() => {
      if (!this.P.size) { clearInterval(this.iv); this.iv = 0; return; }
      this.bc({ t: "p", p: [...this.P.values()].map((p) => [p.id, p.x, p.y, p.z, p.r, p.f]) });
    }, 50);
  }
}
