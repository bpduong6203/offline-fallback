// mebi-monopoly/legacy-data.ts
var RULES = { cash: 1500, salary: 200, bail: 50, houses: 32, hotels: 12, rollMs: 6e4, manageMs: 6e4, buyMs: 3e4, debtMs: 12e4, bidMs: 15e3, auctionMs: 9e4 };
var COLORS = ["#3B82F6", "#F97316", "#8B5CF6", "#22C55E"];
var names = ["Xu\u1EA5t ph\xE1t", "H\u1EBBm N\u1EAFng", "Qu\u1EF9 c\u1ED9ng \u0111\u1ED3ng", "H\u1EBBm M\xE2y", "Thu\u1EBF th\xE0nh ph\u1ED1", "Ga B\xECnh Minh", "Ph\u1ED1 Hoa", "C\u01A1 h\u1ED9i", "Ph\u1ED1 L\xE1", "Ph\u1ED1 Gi\xF3", "Th\u0103m t\xF9", "\u0110\u01B0\u1EDDng Ng\u1ECDc", "\u0110i\u1EC7n Mebi", "\u0110\u01B0\u1EDDng San H\xF4", "\u0110\u01B0\u1EDDng H\u1ED5 Ph\xE1ch", "Ga Ho\xE0ng H\xF4n", "V\u01B0\u1EDDn Cam", "Qu\u1EF9 c\u1ED9ng \u0111\u1ED3ng", "V\u01B0\u1EDDn \u0110\xE0o", "V\u01B0\u1EDDn M\u01A1", "B\xE3i \u0111\u1ED7 xe", "\u0110\u1EA1i l\u1ED9 Sen", "C\u01A1 h\u1ED9i", "\u0110\u1EA1i l\u1ED9 Tr\xFAc", "\u0110\u1EA1i l\u1ED9 Mai", "Ga Ng\xE2n H\xE0", "B\u1EBFn Sao", "B\u1EBFn Tr\u0103ng", "N\u01B0\u1EDBc Mebi", "B\u1EBFn M\u1ED9ng", "V\xE0o t\xF9", "\u0110\u1EA3o Ng\u1ECDc", "\u0110\u1EA3o Lam", "Qu\u1EF9 c\u1ED9ng \u0111\u1ED3ng", "MebiEco", "Ga Ch\xE2n Tr\u1EDDi", "C\u01A1 h\u1ED9i", "Mebisoft", "Thu\u1EBF xa x\u1EC9", "MebiFarm"];
var rows = [
  [1, 60, 1, 2, 10, 30, 90, 160, 250],
  [3, 60, 1, 4, 20, 60, 180, 320, 450],
  [6, 100, 2, 6, 30, 90, 270, 400, 550],
  [8, 100, 2, 6, 30, 90, 270, 400, 550],
  [9, 120, 2, 8, 40, 100, 300, 450, 600],
  [11, 140, 3, 10, 50, 150, 450, 625, 750],
  [13, 140, 3, 10, 50, 150, 450, 625, 750],
  [14, 160, 3, 12, 60, 180, 500, 700, 900],
  [16, 180, 4, 14, 70, 200, 550, 750, 950],
  [18, 180, 4, 14, 70, 200, 550, 750, 950],
  [19, 200, 4, 16, 80, 220, 600, 800, 1e3],
  [21, 220, 5, 18, 90, 250, 700, 875, 1050],
  [23, 220, 5, 18, 90, 250, 700, 875, 1050],
  [24, 240, 5, 20, 100, 300, 750, 925, 1100],
  [26, 260, 6, 22, 110, 330, 800, 975, 1150],
  [27, 260, 6, 22, 110, 330, 800, 975, 1150],
  [29, 280, 6, 24, 120, 360, 850, 1025, 1200],
  [31, 300, 7, 26, 130, 390, 900, 1100, 1275],
  [32, 300, 7, 26, 130, 390, 900, 1100, 1275],
  [34, 320, 7, 28, 150, 450, 1e3, 1200, 1400],
  [37, 350, 8, 35, 175, 500, 1100, 1300, 1500],
  [39, 400, 8, 50, 200, 600, 1400, 1700, 2e3]
];
var bands = ["", "#a97750", "#63c4d7", "#d86bac", "#eda351", "#e16c69", "#e4c94e", "#57aa83", "#577cc2"];
var BOARD = names.map((name, id) => {
  const row = rows.find((r) => r[0] === id);
  const kind = row ? "land" : [5, 15, 25, 35].includes(id) ? "station" : [12, 28].includes(id) ? "utility" : [2, 17, 33].includes(id) ? "community" : [7, 22, 36].includes(id) ? "chance" : id === 4 || id === 38 ? "tax" : id === 30 ? "jail" : id === 10 ? "visit" : id === 20 ? "parking" : "start";
  return { id, name, kind, price: row ? row[1] : kind === "station" ? 200 : kind === "utility" ? 150 : 0, group: row?.[2] || 0, color: bands[row?.[2] || 0] || "#e8dfce", rents: row ? row.slice(3) : [], build: row ? Math.ceil(row[2] / 2) * 50 : 0 };
});
var DECKS = [[
  { text: "Th\u1EBB ra t\xF9 mi\u1EC5n ph\xED", type: "free" },
  { text: "S\u1EEDa ch\u1EEFa: 25.000 tr\u1EE9ng/nh\xE0, 100.000 tr\u1EE9ng/kh\xE1ch s\u1EA1n", type: "repair", value: 25 },
  { text: "Ph\u1EA1t t\u1ED1c \u0111\u1ED9 15.000 tr\u1EE9ng", type: "cash", value: -15 },
  { text: "T\u1EB7ng m\u1ED7i ng\u01B0\u1EDDi 50.000 tr\u1EE9ng", type: "each", value: -50 },
  { text: "L\xF9i ba \xF4", type: "back", value: 3 },
  { text: "\u0110\u1EBFn ti\u1EC7n \xEDch g\u1EA7n nh\u1EA5t, thu\xEA g\u1EA5p 10 x\xFAc x\u1EAFc", type: "utility" },
  { text: "C\u1ED5 t\u1EE9c 50.000 tr\u1EE9ng", type: "cash", value: 50 },
  { text: "\u0110\u1EBFn ga g\u1EA7n nh\u1EA5t, thu\xEA g\u1EA5p \u0111\xF4i", type: "station" },
  { text: "\u0110\xF3ng g\xF3p 15.000 tr\u1EE9ng", type: "cash", value: -15 },
  { text: "\u0110\u1EBFn Ga B\xECnh Minh", type: "move", value: 5 },
  { text: "\u0110\u1EBFn MebiFarm", type: "move", value: 39 },
  { text: "\u0110\u1EBFn \u0110\u1EA1i l\u1ED9 Mai", type: "move", value: 24 },
  { text: "\u0110\u1EA7u t\u01B0 \u0111\xE1o h\u1EA1n 150.000 tr\u1EE9ng", type: "cash", value: 150 },
  { text: "\u0110\u1EBFn ga g\u1EA7n nh\u1EA5t, thu\xEA g\u1EA5p \u0111\xF4i", type: "station" },
  { text: "\u0110\u1EBFn \u0110\u01B0\u1EDDng Ng\u1ECDc", type: "move", value: 11 },
  { text: "\u0110i th\u1EB3ng v\xE0o t\xF9", type: "jail" }
], [
  { text: "Th\u1EBB ra t\xF9 mi\u1EC5n ph\xED", type: "free" },
  { text: "Gi\u1EA3i th\u01B0\u1EDFng 10.000 tr\u1EE9ng", type: "cash", value: 10 },
  { text: "B\xE1n c\u1ED5 phi\u1EBFu 50.000 tr\u1EE9ng", type: "cash", value: 50 },
  { text: "B\u1EA3o hi\u1EC3m \u0111\xE1o h\u1EA1n 100.000 tr\u1EE9ng", type: "cash", value: 100 },
  { text: "Ho\xE0n thu\u1EBF 20.000 tr\u1EE9ng", type: "cash", value: 20 },
  { text: "Qu\u1EF9 du l\u1ECBch 100.000 tr\u1EE9ng", type: "cash", value: 100 },
  { text: "Th\u1EEBa k\u1EBF 100.000 tr\u1EE9ng", type: "cash", value: 100 },
  { text: "T\u01B0 v\u1EA5n 25.000 tr\u1EE9ng", type: "cash", value: 25 },
  { text: "Vi\u1EC7n ph\xED 100.000 tr\u1EE9ng", type: "cash", value: -100 },
  { text: "Ng\xE2n h\xE0ng th\u01B0\u1EDFng 200.000 tr\u1EE9ng", type: "cash", value: 200 },
  { text: "H\u1ECDc ph\xED 50.000 tr\u1EE9ng", type: "cash", value: -50 },
  { text: "Kh\xE1m b\u1EC7nh 50.000 tr\u1EE9ng", type: "cash", value: -50 },
  { text: "Sinh nh\u1EADt: nh\u1EADn m\u1ED7i ng\u01B0\u1EDDi 10.000 tr\u1EE9ng", type: "each", value: 10 },
  { text: "Tr\u1EDF v\u1EC1 Xu\u1EA5t ph\xE1t", type: "move", value: 0 },
  { text: "S\u1EEDa \u0111\u01B0\u1EDDng: 40.000 tr\u1EE9ng/nh\xE0, 115.000 tr\u1EE9ng/kh\xE1ch s\u1EA1n", type: "repair", value: 40 },
  { text: "\u0110i th\u1EB3ng v\xE0o t\xF9", type: "jail" }
]];

// mebi-monopoly/currency.ts
var EGGS_PER_UNIT = 1e3;
var toEggs = (units) => units * EGGS_PER_UNIT;
var moneyFormat = new Intl.NumberFormat("vi-VN");
var formatMoney = (units) => moneyFormat.format(toEggs(units)) + " tr\u1EE9ng";

// mebi-monopoly/legacy-engine.ts
var requireThat = (ok, message = "Thao t\xE1c kh\xF4ng h\u1EE3p l\u1EC7") => {
  if (!ok) throw Error(message);
};
var integer = (v, min = 0, max = 1e6) => Number.isSafeInteger(v) && v >= min && v <= max;
var random = () => {
  const a = new Uint32Array(1);
  crypto.getRandomValues(a);
  return a[0] / 4294967296;
};
function shuffle(items, rng = random) {
  const a = [...items];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
function createState(code) {
  return { code, version: 0, players: [], host: "", capacity: 4, phase: "lobby", turn: "", deadline: 0, doubles: 0, extra: false, dice: [], properties: BOARD.map(() => ({ owner: null, level: 0, mortgaged: false })), decks: [], log: [], seq: 0, started: 0, ended: 0, auction: null, trade: null, payments: [], afterDebt: null, queue: [], seen: {}, closed: false, allOffline: 0 };
}
function snapshot(s) {
  const { decks, seen, ...rest } = s;
  return { ...rest, players: s.players.map(({ token, ...p }) => p) };
}
var Engine = class {
  s;
  now;
  rng;
  constructor(state, rng = random, now = Date.now()) {
    this.s = state;
    this.rng = rng;
    this.now = now;
  }
  get active() {
    return this.s.players.filter((p) => !p.out).sort((a, b) => a.seat - b.seat);
  }
  player(id) {
    const p = this.s.players.find((p2) => p2.id === id);
    requireThat(p, "Ng\u01B0\u1EDDi ch\u01A1i kh\xF4ng t\u1ED3n t\u1EA1i");
    return p;
  }
  log(text, type = "info", data = {}) {
    this.s.log.push({ seq: ++this.s.seq, text, type, data });
    this.s.log = this.s.log.slice(-100);
  }
  phase(phase, ms = RULES.manageMs) {
    this.s.phase = phase;
    this.s.deadline = this.now + ms;
  }
  join(name, token) {
    requireThat(!this.s.closed, "Ph\xF2ng \u0111\xE3 \u0111\xF3ng");
    if (token) {
      const p2 = this.s.players.find((p3) => p3.token === token);
      requireThat(p2, "Phi\xEAn kh\xF4ng h\u1EE3p l\u1EC7");
      p2.connected = true;
      p2.offline = 0;
      this.s.allOffline = 0;
      if (this.s.phase === "ended" && !this.s.players.find((x) => x.id === this.s.host)?.connected) this.s.host = p2.id;
      this.s.version++;
      return p2;
    }
    requireThat(this.s.phase === "lobby", "Tr\u1EADn \u0111\xE3 b\u1EAFt \u0111\u1EA7u");
    requireThat(this.s.players.length < this.s.capacity, "Ph\xF2ng \u0111\xE3 \u0111\u1EA7y");
    requireThat(typeof name === "string" && name.trim().length > 0 && name.trim().length <= 24, "T\xEAn c\u1EA7n t\u1EEB 1\u201324 k\xFD t\u1EF1");
    const seat = [0, 1, 2, 3].find((n) => !this.s.players.some((p2) => p2.seat === n));
    const p = { id: crypto.randomUUID(), token: crypto.randomUUID() + crypto.randomUUID(), name: name.trim(), seat, color: COLORS[seat], character: [0, 1, 2, 3].find((n) => !this.s.players.some((p2) => p2.character === n)), ready: false, connected: true, offline: 0, cash: RULES.cash, pos: 0, jail: 0, cards: [], out: false, income: 0, expense: 0, rank: 0 };
    this.s.players.push(p);
    if (!this.s.host) this.s.host = p.id;
    this.s.allOffline = 0;
    this.s.version++;
    this.log(`${p.name} v\xE0o ph\xF2ng`);
    return p;
  }
  disconnect(id) {
    const p = this.player(id);
    p.connected = false;
    p.offline = this.now;
    p.ready = false;
    if (!this.s.players.some((p2) => p2.connected)) this.s.allOffline = this.now;
    if (this.s.phase === "ended" && this.s.host === id) this.s.host = this.s.players.filter((p2) => p2.connected).sort((a, b) => a.seat - b.seat)[0]?.id || id;
    this.s.version++;
  }
  remove(id) {
    this.s.players = this.s.players.filter((p) => p.id !== id);
    delete this.s.seen[id];
    if (this.s.host === id) this.s.host = this.s.players.sort((a, b) => a.seat - b.seat)[0]?.id || "";
    if (!this.s.players.length) this.s.closed = true;
  }
  credit(p, n) {
    p.cash += n;
    p.income += n;
  }
  debit(p, n) {
    requireThat(p.cash >= n, "Kh\xF4ng \u0111\u1EE7 ti\u1EC1n");
    p.cash -= n;
    p.expense += n;
  }
  group(i) {
    return BOARD.filter((t) => t.group && t.group === BOARD[i].group).map((t) => t.id);
  }
  complete(i, id) {
    return this.group(i).every((j) => this.s.properties[j].owner === id);
  }
  rent(i, dice, modifier = 0) {
    const t = BOARD[i], a = this.s.properties[i];
    if (!a.owner || a.mortgaged) return 0;
    if (t.kind === "station") {
      const n = BOARD.filter((t2) => t2.kind === "station" && this.s.properties[t2.id].owner === a.owner).length;
      return 25 * 2 ** (n - 1) * (modifier === 2 ? 2 : 1);
    }
    if (t.kind === "utility") {
      const n = BOARD.filter((t2) => t2.kind === "utility" && this.s.properties[t2.id].owner === a.owner).length;
      return dice * (modifier === 10 || n === 2 ? 10 : 4);
    }
    return t.rents[a.level] * (a.level === 0 && this.complete(i, a.owner) ? 2 : 1);
  }
  move(p, steps, salary = true) {
    const from = p.pos;
    if (salary && steps > 0 && from + steps >= 40) {
      const amount = RULES.salary * Math.floor((from + steps) / 40);
      this.credit(p, amount);
      this.log(`${p.name} qua Xu\u1EA5t ph\xE1t, nh\u1EADn ${formatMoney(amount)}`, "salary", { id: p.id, amount });
    }
    p.pos = ((from + steps) % 40 + 40) % 40;
    this.log(`${p.name} \u0111\u1EBFn ${BOARD[p.pos].name}`, "move", { id: p.id, from, to: p.pos, steps });
  }
  jail(p) {
    p.pos = 10;
    p.jail = 1;
    this.s.extra = false;
    this.s.doubles = 0;
    this.log(`${p.name} v\xE0o t\xF9`, "jail", { id: p.id });
    this.phase("manage");
  }
  pay(payments, after = null) {
    this.s.payments.push(...payments);
    this.s.afterDebt = after;
    this.settle();
  }
  settle() {
    while (this.s.payments.length) {
      const pay = this.s.payments[0], p = this.player(pay.from);
      if (p.out) {
        this.s.payments.shift();
        continue;
      }
      if (p.cash < pay.amount) {
        this.s.trade = null;
        this.phase("debt", RULES.debtMs);
        return;
      }
      this.debit(p, pay.amount);
      if (pay.to && !this.player(pay.to).out) this.credit(this.player(pay.to), pay.amount);
      this.log(`${p.name} tr\u1EA3 ${formatMoney(pay.amount)} cho ${pay.to ? this.player(pay.to).name : "ng\xE2n h\xE0ng"}`, "payment", pay);
      this.s.payments.shift();
    }
    const after = this.s.afterDebt;
    this.s.afterDebt = null;
    if (after?.move && !this.player(after.id).out) {
      const p = this.player(after.id);
      this.move(p, after.move);
      this.land(p);
    } else if (this.player(this.s.turn).out) {
      if (this.s.queue.length) this.auction(this.s.queue.shift());
      else this.next();
    } else this.phase("manage");
  }
  land(p, modifier = 0, depth = 0) {
    requireThat(depth < 8, "Chu\u1ED7i th\u1EBB kh\xF4ng h\u1EE3p l\u1EC7");
    const t = BOARD[p.pos], a = this.s.properties[p.pos];
    this.phase("manage");
    if (t.price) {
      if (!a.owner) {
        if (p.cash >= t.price) this.phase("buy", RULES.buyMs);
        else this.auction(t.id);
      } else if (a.owner !== p.id) {
        const amount = this.rent(t.id, this.s.dice.reduce((a2, b) => a2 + b, 0), modifier);
        if (amount) this.pay([{ from: p.id, to: a.owner, amount }]);
      }
      return;
    }
    if (t.kind === "jail") return this.jail(p);
    if (t.kind === "tax") return this.pay([{ from: p.id, to: null, amount: p.pos === 4 ? 200 : 100 }]);
    if (t.kind === "chance" || t.kind === "community") this.card(p, t.kind === "chance" ? 0 : 1, depth);
  }
  card(p, deck, depth = 0) {
    const id = this.s.decks[deck].shift(), c = DECKS[deck][id];
    if (c.type !== "free") this.s.decks[deck].push(id);
    this.log(c.text, "card", { id: p.id, deck });
    if (c.type === "free") {
      p.cards.push(deck);
      return;
    }
    if (c.type === "jail") return this.jail(p);
    if (c.type === "cash") {
      if (c.value >= 0) this.credit(p, c.value);
      else this.pay([{ from: p.id, to: null, amount: -c.value }]);
      return;
    }
    if (c.type === "repair") {
      const amount = this.s.properties.reduce((n, a) => n + (a.owner === p.id ? a.level === 5 ? c.value === 25 ? 100 : 115 : a.level * c.value : 0), 0);
      if (amount) this.pay([{ from: p.id, to: null, amount }]);
      return;
    }
    if (c.type === "each") {
      const others = this.active.filter((x) => x.id !== p.id);
      this.pay(others.map((x) => ({ from: c.value > 0 ? x.id : p.id, to: c.value > 0 ? p.id : x.id, amount: Math.abs(c.value) })));
      return;
    }
    let steps = 0, modifier = 0;
    if (c.type === "back") steps = -c.value;
    else if (c.type === "move") steps = (c.value - p.pos + 40) % 40;
    else {
      let dest = (p.pos + 1) % 40;
      while (BOARD[dest].kind !== c.type) dest = (dest + 1) % 40;
      steps = (dest - p.pos + 40) % 40;
      modifier = c.type === "station" ? 2 : 10;
      if (modifier === 10) this.s.dice = [this.die(), this.die()];
    }
    this.move(p, steps);
    this.land(p, modifier, depth + 1);
  }
  die() {
    return 1 + Math.floor(this.rng() * 6);
  }
  roll(p) {
    requireThat(this.s.phase === "roll");
    this.s.dice = [this.die(), this.die()];
    const [a, b] = this.s.dice, sum = a + b;
    this.log(`${p.name} tung ${a} + ${b}`, "roll", { id: p.id, dice: [a, b] });
    if (p.jail) {
      this.s.extra = false;
      if (a === b) {
        p.jail = 0;
        this.move(p, sum);
        this.land(p);
      } else if (p.jail >= 3) {
        p.jail = 0;
        this.pay([{ from: p.id, to: null, amount: RULES.bail }], { id: p.id, move: sum });
      } else {
        p.jail++;
        this.phase("manage");
      }
      return;
    }
    this.s.extra = a === b;
    this.s.doubles = a === b ? this.s.doubles + 1 : 0;
    if (this.s.doubles === 3) return this.jail(p);
    this.move(p, sum);
    this.land(p);
  }
  auction(tile) {
    this.s.trade = null;
    this.s.auction = { tile, bid: 0, bidder: null, end: this.now + RULES.bidMs, max: this.now + RULES.auctionMs };
    this.phase("auction", RULES.bidMs);
    this.log(`\u0110\u1EA5u gi\xE1 ${BOARD[tile].name}`);
  }
  closeAuction() {
    const a = this.s.auction;
    if (a.bidder) {
      const p = this.player(a.bidder);
      this.debit(p, a.bid);
      this.s.properties[a.tile].owner = p.id;
      this.log(`${p.name} th\u1EAFng \u0111\u1EA5u gi\xE1 ${BOARD[a.tile].name}: ${formatMoney(a.bid)}`, "purchase");
    }
    this.s.auction = null;
    if (this.s.queue.length) this.auction(this.s.queue.shift());
    else if (this.player(this.s.turn).out) this.next();
    else this.phase("manage");
  }
  next() {
    this.s.trade = null;
    if (this.active.length <= 1) return this.finish();
    if (!this.s.extra || this.player(this.s.turn).out) {
      const old = this.player(this.s.turn);
      this.s.turn = (this.active.find((p) => p.seat > old.seat) || this.active[0]).id;
      this.s.doubles = 0;
    }
    this.s.extra = false;
    this.phase("roll", RULES.rollMs);
    this.log(`\u0110\u1EBFn l\u01B0\u1EE3t ${this.player(this.s.turn).name}`, "turn");
  }
  finish() {
    this.s.phase = "ended";
    this.s.ended = this.now;
    this.s.deadline = 0;
    this.s.auction = null;
    this.s.trade = null;
    if (!this.s.players.find((p) => p.id === this.s.host)?.connected) this.s.host = this.s.players.filter((p) => p.connected).sort((a, b) => a.seat - b.seat)[0]?.id || this.s.host;
    if (this.active[0]) {
      this.active[0].rank = 1;
      this.log(`${this.active[0].name} chi\u1EBFn th\u1EAFng!`, "win");
    }
  }
  stock() {
    return { houses: RULES.houses - this.s.properties.reduce((n, a) => n + (a.level < 5 ? a.level : 0), 0), hotels: RULES.hotels - this.s.properties.filter((a) => a.level === 5).length };
  }
  manage(p) {
    requireThat(this.s.turn === p.id && ["roll", "manage"].includes(this.s.phase) || this.s.phase === "debt" && this.s.payments[0]?.from === p.id, "Ch\u01B0a \u0111\u1EBFn l\u01B0\u1EE3t qu\u1EA3n l\xFD c\u1EE7a b\u1EA1n");
    requireThat(!this.s.trade, "H\xE3y x\u1EED l\xFD giao d\u1ECBch tr\u01B0\u1EDBc");
  }
  property(p, i) {
    requireThat(integer(i, 0, 39));
    const a = this.s.properties[i];
    requireThat(a.owner === p.id, "B\u1EA1n kh\xF4ng s\u1EDF h\u1EEFu \xF4 n\xE0y");
    return a;
  }
  build(p, i, sell = false) {
    this.manage(p);
    const a = this.property(p, i), t = BOARD[i], g = this.group(i), stock = this.stock();
    requireThat(t.kind === "land");
    if (sell) {
      requireThat(a.level > 0 && g.every((j) => this.s.properties[j].level <= a.level), "Ph\u1EA3i b\xE1n \u0111\u1EC1u");
      if (a.level === 5) requireThat(stock.houses >= 4, "Ng\xE2n h\xE0ng thi\u1EBFu nh\xE0 \u0111\u1EC3 h\u1EA1 c\u1EA5p");
      a.level--;
      this.credit(p, t.build / 2);
    } else {
      requireThat(this.s.phase !== "debt" && this.complete(i, p.id) && g.every((j) => !this.s.properties[j].mortgaged), "C\u1EA7n tr\u1ECDn nh\xF3m kh\xF4ng th\u1EBF ch\u1EA5p");
      requireThat(a.level < 5 && g.every((j) => this.s.properties[j].level >= a.level), "Ph\u1EA3i x\xE2y \u0111\u1EC1u");
      requireThat(a.level === 4 ? stock.hotels > 0 : stock.houses > 0, "Ng\xE2n h\xE0ng h\u1EBFt c\xF4ng tr\xECnh");
      this.debit(p, t.build);
      a.level++;
    }
    this.log(`${p.name} ${sell ? "b\xE1n" : "x\xE2y"} c\xF4ng tr\xECnh t\u1EA1i ${t.name}`, "build", { tile: i });
  }
  mortgage(p, i, redeem = false) {
    this.manage(p);
    const a = this.property(p, i), t = BOARD[i];
    requireThat(!this.group(i).some((j) => this.s.properties[j].level > 0), "B\xE1n h\u1EBFt c\xF4ng tr\xECnh trong nh\xF3m tr\u01B0\u1EDBc");
    requireThat(redeem ? a.mortgaged : !a.mortgaged);
    if (redeem) {
      requireThat(this.s.phase !== "debt");
      this.debit(p, Math.ceil(t.price / 2 * 1.1));
    } else this.credit(p, t.price / 2);
    a.mortgaged = !redeem;
    this.log(`${p.name} ${redeem ? "chu\u1ED9c" : "th\u1EBF ch\u1EA5p"} ${t.name}`);
  }
  returnCards(p) {
    for (const deck of p.cards) this.s.decks[deck].push(0);
    p.cards = [];
  }
  bankrupt(p) {
    if (p.out) return;
    const creditor = this.s.payments.find((x) => x.from === p.id)?.to;
    const to = creditor && !this.player(creditor).out ? this.player(creditor) : null;
    this.s.trade = null;
    for (let i = 0; i < 40; i++) {
      const a = this.s.properties[i];
      if (a.owner !== p.id) continue;
      if (to) {
        if (a.level) this.credit(p, BOARD[i].build * (a.level === 5 ? 5 : a.level) / 2);
        a.level = 0;
        a.owner = to.id;
        if (a.mortgaged) this.s.payments.push({ from: to.id, to: null, amount: Math.ceil(BOARD[i].price * 0.05) });
      } else {
        this.s.properties[i] = { owner: null, level: 0, mortgaged: false };
        this.s.queue.push(i);
      }
    }
    if (to) {
      this.credit(to, p.cash);
      to.cards.push(...p.cards);
      p.cards = [];
    } else this.returnCards(p);
    p.cash = 0;
    p.out = true;
    p.rank = this.active.length + 1;
    this.s.payments = this.s.payments.filter((x) => x.from !== p.id);
    this.s.payments = this.s.payments.map((x) => x.to === p.id ? { ...x, to: to?.id || null } : x);
    this.log(`${p.name} ph\xE1 s\u1EA3n`, "bankrupt");
    if (this.active.length <= 1) return this.finish();
    if (this.s.auction) {
      if (this.s.auction.bidder === p.id) {
        this.s.auction.bidder = null;
        this.s.auction.bid = 0;
      }
      return;
    }
    if (this.s.payments.length) return this.settle();
    this.s.afterDebt = null;
    if (this.s.queue.length) this.auction(this.s.queue.shift());
    else if (p.id === this.s.turn) this.next();
    else this.phase("manage");
  }
  validateSide(p, side) {
    requireThat(side && integer(side.cash) && Array.isArray(side.lands) && Array.isArray(side.cards) && side.lands.length <= 28 && side.cards.length <= 2);
    requireThat(new Set(side.lands).size === side.lands.length && new Set(side.cards).size === side.cards.length);
    requireThat(p.cash >= side.cash, "Kh\xF4ng \u0111\u1EE7 ti\u1EC1n giao d\u1ECBch");
    for (const i of side.lands) {
      this.property(p, i);
      requireThat(!this.group(i).some((j) => this.s.properties[j].level), "Nh\xF3m \u0111\u1EA5t c\xF2n c\xF4ng tr\xECnh");
    }
    for (const c of side.cards) requireThat(p.cards.includes(c), "Kh\xF4ng c\xF3 th\u1EBB ra t\xF9");
  }
  trade(p, payload) {
    requireThat(this.s.phase === "manage" && this.s.turn === p.id && !this.s.trade);
    const to = this.player(payload.to);
    requireThat(to.id !== p.id && !to.out);
    this.validateSide(p, payload.give);
    this.validateSide(to, payload.take);
    this.s.trade = { id: crypto.randomUUID(), from: p.id, to: to.id, give: payload.give, take: payload.take, end: Math.min(this.now + 3e4, this.s.deadline) };
  }
  accept(p, id) {
    const t = this.s.trade;
    requireThat(t && t.to === p.id && t.id === id && t.end > this.now && this.s.phase === "manage");
    const from = this.player(t.from);
    this.validateSide(from, t.give);
    this.validateSide(p, t.take);
    const fee = (side) => side.lands.reduce((n, i) => n + (this.s.properties[i].mortgaged ? Math.ceil(BOARD[i].price * 0.05) : 0), 0);
    requireThat(from.cash - t.give.cash + t.take.cash >= fee(t.take) && p.cash - t.take.cash + t.give.cash >= fee(t.give), "Kh\xF4ng \u0111\u1EE7 ti\u1EC1n tr\u1EA3 ph\xED chuy\u1EC3n quy\u1EC1n");
    from.cash += t.take.cash - t.give.cash - fee(t.take);
    p.cash += t.give.cash - t.take.cash - fee(t.give);
    from.income += t.take.cash;
    from.expense += t.give.cash + fee(t.take);
    p.income += t.give.cash;
    p.expense += t.take.cash + fee(t.give);
    for (const [a, b, side] of [[from, p, t.give], [p, from, t.take]]) {
      for (const i of side.lands) this.s.properties[i].owner = b.id;
      for (const c of side.cards) {
        a.cards.splice(a.cards.indexOf(c), 1);
        b.cards.push(c);
      }
    }
    this.s.trade = null;
    this.log(`${from.name} v\xE0 ${p.name} ho\xE0n t\u1EA5t giao d\u1ECBch`, "trade");
  }
  command(id, c) {
    requireThat(c && typeof c.commandId === "string" && c.commandId.length <= 80 && c.commandId.length > 0 && c.roomId === this.s.code, "L\u1EC7nh kh\xF4ng h\u1EE3p l\u1EC7");
    if (this.s.seen[id]?.includes(c.commandId)) return;
    requireThat(c.expectedVersion === this.s.version, "Tr\u1EA1ng th\xE1i \u0111\xE3 \u0111\u1ED5i, vui l\xF2ng th\u1EED l\u1EA1i");
    const p = this.player(id);
    requireThat(!p.out || this.s.phase === "ended" || c.type === "leave");
    const v = c.payload || {}, type = c.type;
    if (type === "leave") {
      if (this.s.phase === "lobby") this.remove(id);
      else {
        p.connected = false;
        p.offline = this.now;
        if (this.s.phase !== "ended") this.bankrupt(p);
        if (this.s.host === id) this.s.host = this.s.players.filter((x) => x.connected).sort((a, b) => a.seat - b.seat)[0]?.id || id;
      }
    } else if (this.s.phase === "lobby") {
      if (type === "ready") p.ready = !p.ready;
      else if (type === "character") {
        requireThat(integer(v.character, 0, 3) && !this.s.players.some((x) => x.id !== id && x.character === v.character), "Nh\xE2n v\u1EADt \u0111\xE3 c\xF3 ng\u01B0\u1EDDi ch\u1ECDn");
        p.character = v.character;
        p.ready = false;
      } else if (type === "capacity") {
        requireThat(id === this.s.host && integer(v.capacity, 2, 4) && v.capacity >= this.s.players.length);
        this.s.capacity = v.capacity;
        this.s.players.forEach((p2) => p2.ready = false);
      } else if (type === "start") {
        requireThat(id === this.s.host && this.s.players.length >= 2 && this.s.players.every((p2) => p2.ready && p2.connected), "C\u1EA7n \xEDt nh\u1EA5t 2 ng\u01B0\u1EDDi v\xE0 t\u1EA5t c\u1EA3 s\u1EB5n s\xE0ng");
        this.s.started = this.now;
        this.s.decks = DECKS.map((d) => shuffle(d.map((_, i) => i), this.rng));
        this.s.turn = this.active[0].id;
        this.phase("roll", RULES.rollMs);
      } else throw Error("L\u1EC7nh lobby kh\xF4ng h\u1EE3p l\u1EC7");
    } else if (type === "rematch") {
      requireThat(this.s.phase === "ended" && id === this.s.host);
      const players = this.s.players.filter((p2) => p2.connected);
      this.s = createState(this.s.code);
      this.s.players = players.map((p2) => ({ ...p2, ready: false, cash: RULES.cash, pos: 0, jail: 0, cards: [], out: false, income: 0, expense: 0, rank: 0 }));
      this.s.host = players.find((p2) => p2.id === id)?.id || players[0]?.id || "";
      this.s.version = c.expectedVersion;
    } else if (type === "bid") {
      requireThat(this.s.phase === "auction");
      const a = this.s.auction;
      requireThat(integer(v.amount, 10) && v.amount >= a.bid + 10 && v.amount <= p.cash, "Gi\xE1 ph\u1EA3i t\u0103ng \xEDt nh\u1EA5t 10.000 tr\u1EE9ng v\xE0 trong ti\u1EC1n m\u1EB7t");
      a.bid = v.amount;
      a.bidder = id;
      a.end = Math.min(this.now + RULES.bidMs, a.max);
      this.s.deadline = a.end;
    } else if (type === "accept") this.accept(p, v.id);
    else if (type === "reject") {
      requireThat(this.s.trade && [this.s.trade.to, this.s.trade.from].includes(id));
      this.s.trade = null;
    } else if (type === "build" || type === "sell") this.build(p, v.tile, type === "sell");
    else if (type === "mortgage" || type === "redeem") this.mortgage(p, v.tile, type === "redeem");
    else if (type === "settle") {
      requireThat(this.s.phase === "debt" && this.s.payments[0].from === id && p.cash >= this.s.payments[0].amount, "Ch\u01B0a \u0111\u1EE7 ti\u1EC1n thanh to\xE1n");
      this.settle();
    } else if (type === "bankrupt") {
      requireThat(this.s.phase === "debt" && this.s.payments[0].from === id);
      this.bankrupt(p);
    } else {
      requireThat(this.s.turn === id, "Ch\u01B0a \u0111\u1EBFn l\u01B0\u1EE3t b\u1EA1n");
      if (type === "roll") this.roll(p);
      else if (type === "bail" || type === "jailCard") {
        requireThat(this.s.phase === "roll" && p.jail);
        if (type === "bail") this.debit(p, RULES.bail);
        else {
          requireThat(p.cards.length > 0);
          this.s.decks[p.cards.shift()].push(0);
        }
        p.jail = 0;
      } else if (type === "buy") {
        requireThat(this.s.phase === "buy");
        const t = BOARD[p.pos];
        requireThat(!this.s.properties[p.pos].owner);
        this.debit(p, t.price);
        this.s.properties[p.pos].owner = id;
        this.log(`${p.name} mua ${t.name}`, "purchase", { tile: p.pos });
        this.phase("manage");
      } else if (type === "decline") {
        requireThat(this.s.phase === "buy");
        this.auction(p.pos);
      } else if (type === "end") {
        requireThat(this.s.phase === "manage");
        this.next();
      } else if (type === "trade") this.trade(p, v);
      else throw Error("L\u1EC7nh kh\xF4ng h\u1EE3p l\u1EC7");
    }
    this.s.version++;
    (this.s.seen[id] ||= []).push(c.commandId);
    this.s.seen[id] = this.s.seen[id].slice(-100);
  }
  tick(now = Date.now()) {
    this.now = now;
    let changed = false;
    if (this.s.allOffline && now - this.s.allOffline >= 18e5) {
      this.s.closed = true;
      this.s.version++;
      return true;
    }
    for (const p of [...this.s.players]) if (!p.connected && p.offline && now - p.offline >= (this.s.phase === "lobby" ? 6e4 : 12e4) && !p.out && (!this.s.allOffline || this.s.phase === "lobby")) {
      if (this.s.phase === "lobby") this.remove(p.id);
      else if (this.s.phase !== "ended") this.bankrupt(p);
      changed = true;
    }
    if (this.s.trade && this.s.trade.end <= now) {
      this.s.trade = null;
      changed = true;
    }
    if (this.s.deadline && this.s.deadline <= now && !["ended", "lobby"].includes(this.s.phase)) {
      changed = true;
      const p = this.player(this.s.turn);
      if (this.s.phase === "auction") this.closeAuction();
      else if (this.s.phase === "buy") this.auction(p.pos);
      else if (this.s.phase === "roll") this.roll(p);
      else if (this.s.phase === "manage") this.next();
      else if (this.s.phase === "debt") {
        const debtor = this.player(this.s.payments[0].from);
        let attempts = 0;
        while (this.s.phase === "debt" && attempts++ < 180) {
          const need = this.s.payments[0];
          if (this.player(need.from).id !== debtor.id) break;
          if (debtor.cash >= need.amount) {
            this.settle();
            break;
          }
          const built = this.s.properties.map((a, i) => ({ a, i })).filter(({ a }) => a.owner === debtor.id && a.level > 0).sort((a, b) => b.a.level - a.a.level || a.i - b.i).find(({ a }) => a.level !== 5 || this.stock().houses >= 4);
          if (built) {
            this.build(debtor, built.i, true);
            continue;
          }
          const mortgage = this.s.properties.findIndex((a, i) => a.owner === debtor.id && !a.mortgaged && !this.group(i).some((j) => this.s.properties[j].level));
          if (mortgage >= 0) {
            this.mortgage(debtor, mortgage);
            continue;
          }
          this.bankrupt(debtor);
          break;
        }
      }
    }
    if (changed) this.s.version++;
    return changed;
  }
};
function execute(state, id, command, now = Date.now(), rng = random) {
  const engine = new Engine(structuredClone(state), rng, now);
  engine.command(id, command);
  return engine.s;
}
export {
  Engine,
  createState,
  execute,
  random,
  shuffle,
  snapshot
};
