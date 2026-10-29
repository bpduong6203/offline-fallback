// mebi-monopoly/tour-data.ts
var SCHEMA_VERSION = 2;
var RULESET = "mebi-tour-v2";
var RULES = { cash: 1500, salary: 300, bail: 200, travel: 50, tax: 0.1, rollMs: 6e4, choiceMs: 3e4, manageMs: 3e4, debtMs: 12e4, takeoverMultiplier: 2, resaleRatio: 0.5, monopolyMultiplier: 2, festivalMultiplier: 2, festivalMax: 5, festivalTurns: 8, maxDoubles: 3, islandAttempts: 3, hotelLevel: 4, firstLapMaxLevel: 2, laterLapMaxLevel: 3, tripleGroups: 3, touristCount: 4, matchMs: 30 * 6e4, touristRents: [0, 25, 50, 100, 200] };
var COLORS = ["#3B82F6", "#F97316", "#8B5CF6", "#22C55E"];
var PREMIUM = [{ key: "mebisoft", name: "Mebisoft", price: 400, asset: "tech" }, { key: "mebifarm", name: "Mebifarm", price: 360, asset: "farm" }, { key: "mebieco", name: "Mebieco", price: 320, asset: "eco" }];
var rows = [
  ["start", "Xu\u1EA5t ph\xE1t", "start", null, 0, "start"],
  ["ha-giang", "H\xE0 Giang", "city", 1, 60, "mountain"],
  ["sa-pa", "Sa Pa", "city", 1, 70, "mountain"],
  ["chance-north", "May m\u1EAFn", "chance", null, 0, "card"],
  ["cat-ba", "C\xE1t B\xE0", "tourist", null, 200, "beach"],
  ["cao-bang", "Cao B\u1EB1ng", "city", 2, 80, "mountain"],
  ["ninh-binh", "Ninh B\xECnh", "city", 2, 90, "pagoda"],
  ["ha-long", "H\u1EA1 Long", "city", 2, 100, "bay"],
  ["island", "Hoang \u0111\u1EA3o", "island", null, 0, "island"],
  ["ha-noi", "H\xE0 N\u1ED9i", "city", 3, 120, "pagoda"],
  ["phong-nha", "Phong Nha", "city", 3, 130, "mountain"],
  ["chance-central", "May m\u1EAFn", "chance", null, 0, "card"],
  ["cu-lao-cham", "C\xF9 Lao Ch\xE0m", "tourist", null, 200, "beach"],
  ["hue", "Hu\u1EBF", "city", 4, 140, "pagoda"],
  ["da-nang", "\u0110\xE0 N\u1EB5ng", "city", 4, 150, "bridge"],
  ["hoi-an", "H\u1ED9i An", "city", 4, 160, "town"],
  ["festival", "L\u1EC5 h\u1ED9i Vi\u1EC7t", "festival", null, 0, "festival"],
  ["quy-nhon", "Quy Nh\u01A1n", "city", 5, 180, "beach"],
  ["nha-trang", "Nha Trang", "city", 5, 190, "beach"],
  ["chance-south", "May m\u1EAFn", "chance", null, 0, "card"],
  ["con-dao", "C\xF4n \u0110\u1EA3o", "tourist", null, 200, "beach"],
  ["da-lat", "\u0110\xE0 L\u1EA1t", "city", 6, 210, "town"],
  ["phan-thiet", "Phan Thi\u1EBFt", "city", 6, 230, "beach"],
  ["vung-tau", "V\u0169ng T\xE0u", "city", 6, 250, "tower"],
  ["travel", "Du l\u1ECBch Vi\u1EC7t", "travel", null, 0, "travel"],
  ["can-tho", "C\u1EA7n Th\u01A1", "city", 7, 260, "bay"],
  ["ho-chi-minh", "TP. H\u1ED3 Ch\xED Minh", "city", 7, 280, "tower"],
  ["mebieco", "Mebieco", "city", 8, 320, "eco"],
  ["phu-quoc", "Ph\xFA Qu\u1ED1c", "tourist", null, 200, "beach"],
  ["mebifarm", "Mebifarm", "city", 8, 360, "farm"],
  ["tax", "Qu\u1EF9 th\xE0nh ph\u1ED1", "tax", null, 0, "tax"],
  ["mebisoft", "Mebisoft", "city", 8, 400, "tech"]
];
var SIDE_LENGTH = 8;
var GRID_SIZE = SIDE_LENGTH + 1;
var bands = ["#b8d1e5", "#a88adc", "#6cb7e2", "#ed91ba", "#eda94f", "#e47775", "#dac85b", "#62b39d", "#7189e3"];
var round = (n) => Math.ceil(n / 5) * 5;
var BOARD = rows.map(([key, name, tileType, groupId, price, landmarkAsset], id) => {
  const boardPosition = id <= SIDE_LENGTH ? { x: SIDE_LENGTH - id, y: SIDE_LENGTH } : id <= SIDE_LENGTH * 2 ? { x: 0, y: SIDE_LENGTH * 2 - id } : id <= SIDE_LENGTH * 3 ? { x: id - SIDE_LENGTH * 2, y: 0 } : { x: SIDE_LENGTH, y: id - SIDE_LENGTH * 3 };
  const premium = PREMIUM.find((p) => p.key === key), purchasePrice = premium?.price ?? price;
  return { id, key, name: premium?.name ?? name, tileType, groupId, purchasePrice, constructionCosts: tileType === "city" ? [0, round(purchasePrice * 0.3), round(purchasePrice * 0.45), round(purchasePrice * 0.6), round(purchasePrice * 1.2)] : [], rentByLevel: tileType === "city" ? [round(purchasePrice * 0.08), round(purchasePrice * 0.25), round(purchasePrice * 0.5), purchasePrice, round(purchasePrice * 1.8)] : [], takeoverRules: { allowed: tileType === "city", blockedAtLevel: RULES.hotelLevel, multiplier: RULES.takeoverMultiplier }, landmarkAsset: premium?.asset ?? landmarkAsset, boardPosition, side: Math.min(3, Math.floor(id / SIDE_LENGTH)), color: bands[groupId ?? 0] };
});
var tileByKey = (key) => BOARD.find((t) => t.key === key);
var GROUPS = [...new Set(BOARD.flatMap((t) => t.groupId === null ? [] : [t.groupId]))].map((id) => BOARD.filter((t) => t.groupId === id).map((t) => t.id));
var TOURISTS = BOARD.filter((t) => t.tileType === "tourist").map((t) => t.id);
var SIDES = [0, 1, 2, 3].map((side) => BOARD.filter((t) => t.side === side && t.purchasePrice > 0).map((t) => t.id));
var CARDS = [
  { text: "Kh\u1EDFi nghi\u1EC7p th\xE0nh c\xF4ng: nh\u1EADn 100.000 tr\u1EE9ng", type: "cash", value: 100 },
  { text: "Qu\u1EF9 du l\u1ECBch: nh\u1EADn 50.000 tr\u1EE9ng", type: "cash", value: 50 },
  { text: "Chi ph\xED b\u1EA3o tr\xEC: tr\u1EA3 50.000 tr\u1EE9ng", type: "cash", value: -50 },
  { text: "Chuy\u1EBFn \u0111i v\u1EC1 Xu\u1EA5t ph\xE1t", type: "move", key: "start" },
  { text: "Gh\xE9 th\u0103m H\xE0 N\u1ED9i", type: "move", key: "ha-noi" },
  { text: "C\u1EA5t c\xE1nh \u0111\u1EBFn Mebisoft", type: "move", key: "mebisoft" },
  { text: "L\xF9i ba \xF4", type: "back", value: 3 },
  { text: "Tr\xF4i d\u1EA1t t\u1EDBi Hoang \u0111\u1EA3o", type: "island" },
  { text: "Th\u1EBB r\u1EDDi \u0111\u1EA3o mi\u1EC5n ph\xED", type: "escape" },
  { text: "S\u1EEDa ch\u1EEFa: 20.000 tr\u1EE9ng m\u1ED7i c\u1EA5p c\xF4ng tr\xECnh", type: "repair", value: 20 },
  { text: "M\u1EDF l\u1EC5 h\u1ED9i t\u1EA1i m\u1ED9t th\xE0nh ph\u1ED1 s\u1EDF h\u1EEFu", type: "festival" },
  { text: "Th\u01B0\u1EDFng s\xE1ng ki\u1EBFn xanh: nh\u1EADn 150.000 tr\u1EE9ng", type: "cash", value: 150 }
];

// mebi-monopoly/currency.ts
var EGGS_PER_UNIT = 1e3;
var toEggs = (units) => units * EGGS_PER_UNIT;
var formatMoney = (units) => new Intl.NumberFormat("vi-VN").format(toEggs(units)) + " tr\u1EE9ng";

// mebi-monopoly/tour-engine.ts
var check = (ok, message = "Thao t\xE1c kh\xF4ng h\u1EE3p l\u1EC7") => {
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
var emptyProperty = () => ({ owner: null, level: 0, investment: 0, festival: 1, festivalUntil: 0 });
function createState(code) {
  return { schemaVersion: SCHEMA_VERSION, ruleset: RULESET, code, version: 0, players: [], host: "", capacity: 4, phase: "lobby", turn: "", deadline: 0, doubles: 0, extra: false, dice: [], properties: BOARD.map(emptyProperty), deck: [], log: [], seq: 0, started: 0, ended: 0, matchDeadline: 0, turnCount: 0, winner: null, winReason: "", debt: null, context: null, seen: {}, closed: false, allOffline: 0 };
}
function upgradeState(old) {
  if (old.schemaVersion === SCHEMA_VERSION && old.ruleset === RULESET) return old;
  const s = createState(old.code || "");
  s.version = (old.version || 0) + 1;
  s.capacity = old.capacity || 4;
  s.host = old.host || "";
  s.players = (old.players || []).map((p) => ({ ...p, cash: RULES.cash, pos: 0, island: 0, laps: 0, travelPending: false, escape: 0, out: false, income: 0, expense: 0, rank: 0, ready: false }));
  s.closed = !!old.closed;
  s.allOffline = old.allOffline || 0;
  s.legacySnapshot = structuredClone(old);
  s.phase = ["lobby", "ended"].includes(old.phase) ? "lobby" : "legacy";
  s.migrationNotice = s.phase === "legacy" ? "Snapshot lu\u1EADt 40 \xF4 \u0111\xE3 \u0111\u01B0\u1EE3c gi\u1EEF l\u1EA1i. Ch\u1EE7 ph\xF2ng c\u1EA7n m\u1EDF s\u1EA3nh lu\u1EADt Vi\u1EC7t Nam \u0111\u1EC3 ch\u01A1i v\xE1n m\u1EDBi." : "Ph\xF2ng \u0111\xE3 c\u1EADp nh\u1EADt lu\u1EADt Vi\u1EC7t Nam v2. Vui l\xF2ng s\u1EB5n s\xE0ng l\u1EA1i.";
  return s;
}
function snapshot(s) {
  const { deck, seen, legacySnapshot, ...publicState } = s;
  return { ...publicState, players: s.players.map(({ token, ...p }) => p) };
}
var Engine = class {
  constructor(s, rng = random, now = Date.now()) {
    this.s = s;
    this.rng = rng;
    this.now = now;
  }
  s;
  rng;
  now;
  get active() {
    return this.s.players.filter((p) => !p.out).sort((a, b) => a.seat - b.seat);
  }
  player(id) {
    const p = this.s.players.find((p2) => p2.id === id);
    check(p, "Ng\u01B0\u1EDDi ch\u01A1i kh\xF4ng t\u1ED3n t\u1EA1i");
    return p;
  }
  tile(i) {
    check(integer(i, 0, BOARD.length - 1), "\xD4 kh\xF4ng h\u1EE3p l\u1EC7");
    return BOARD[i];
  }
  phase(phase, ms = RULES.choiceMs) {
    this.s.phase = phase;
    this.s.deadline = this.now + ms;
  }
  log(text, type = "info", data = {}) {
    this.s.log.push({ seq: ++this.s.seq, text, type, data });
    this.s.log = this.s.log.slice(-100);
  }
  join(name, token) {
    check(!this.s.closed, "Ph\xF2ng \u0111\xE3 \u0111\xF3ng");
    if (token) {
      const p2 = this.s.players.find((p3) => p3.token === token);
      check(p2, "Phi\xEAn kh\xF4ng h\u1EE3p l\u1EC7");
      p2.connected = true;
      p2.offline = 0;
      this.s.allOffline = 0;
      if (!this.s.players.find((x) => x.id === this.s.host)?.connected && this.s.phase === "ended") this.s.host = p2.id;
      this.s.version++;
      return p2;
    }
    check(this.s.phase === "lobby", "Tr\u1EADn \u0111\xE3 b\u1EAFt \u0111\u1EA7u");
    check(this.s.players.length < this.s.capacity, "Ph\xF2ng \u0111\xE3 \u0111\u1EA7y");
    check(typeof name === "string" && name.trim().length > 0 && name.trim().length <= 24, "T\xEAn c\u1EA7n t\u1EEB 1\u201324 k\xFD t\u1EF1");
    const seat = [0, 1, 2, 3].find((i) => !this.s.players.some((p2) => p2.seat === i));
    const p = { id: crypto.randomUUID(), token: crypto.randomUUID() + crypto.randomUUID(), name: name.trim(), seat, color: COLORS[seat], character: [0, 1, 2, 3].find((i) => !this.s.players.some((p2) => p2.character === i)), ready: false, connected: true, offline: 0, cash: RULES.cash, pos: 0, island: 0, laps: 0, travelPending: false, escape: 0, out: false, income: 0, expense: 0, rank: 0 };
    this.s.players.push(p);
    this.s.host ||= p.id;
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
    if (this.s.phase === "ended" && this.s.host === id) this.transferHost(id);
    this.s.version++;
  }
  transferHost(id) {
    if (this.s.host === id) this.s.host = this.s.players.filter((p) => p.connected && p.id !== id).sort((a, b) => a.seat - b.seat)[0]?.id || id;
  }
  remove(id) {
    this.s.players = this.s.players.filter((p) => p.id !== id);
    delete this.s.seen[id];
    if (this.s.host === id) this.s.host = [...this.s.players].sort((a, b) => a.seat - b.seat)[0]?.id || "";
    if (!this.s.players.length) this.s.closed = true;
  }
  credit(p, n) {
    check(integer(n));
    p.cash += n;
    p.income += n;
  }
  debit(p, n) {
    check(integer(n) && p.cash >= n, "Kh\xF4ng \u0111\u1EE7 tr\u1EE9ng");
    p.cash -= n;
    p.expense += n;
  }
  ownsGroup(id, g) {
    return g.every((i) => this.s.properties[i].owner === id);
  }
  rent(i) {
    const t = this.tile(i), a = this.s.properties[i];
    if (!a.owner) return 0;
    let rent = 0;
    if (t.tileType === "tourist") rent = RULES.touristRents[TOURISTS.filter((j) => this.s.properties[j].owner === a.owner).length];
    else {
      rent = t.rentByLevel[a.level];
      if (GROUPS.some((g) => g.includes(i) && this.ownsGroup(a.owner, g))) rent *= RULES.monopolyMultiplier;
    }
    return rent * (a.festivalUntil > this.s.turnCount ? a.festival : 1);
  }
  takeoverPrice(i) {
    return this.s.properties[i].investment * this.tile(i).takeoverRules.multiplier;
  }
  constructionCost(i, level) {
    const a = this.s.properties[i];
    return this.tile(i).constructionCosts.slice(a.level + 1, level + 1).reduce((n, v) => n + v, 0);
  }
  maxLevel(p, i) {
    const a = this.s.properties[i];
    if (a.level === 3 && this.s.context?.sourceLevel === 3) return RULES.hotelLevel;
    return p.laps > 0 ? RULES.laterLapMaxLevel : RULES.firstLapMaxLevel;
  }
  legalDestinations(p) {
    return BOARD.filter((t) => t.purchasePrice > 0 && (!this.s.properties[t.id].owner || this.s.properties[t.id].owner === p.id)).map((t) => t.id);
  }
  festivalTiles(p) {
    return BOARD.filter((t) => t.tileType === "city" && this.s.properties[t.id].owner === p.id).map((t) => t.id);
  }
  netWorth(p) {
    return p.cash + this.s.properties.reduce((n, a) => n + (a.owner === p.id ? a.investment : 0), 0);
  }
  move(p, steps, salary = true) {
    const from = p.pos, count = BOARD.length;
    if (steps > 0 && salary && from + steps >= count) {
      const laps = Math.floor((from + steps) / count);
      p.laps += laps;
      this.credit(p, RULES.salary * laps);
      this.log(`${p.name} qua Xu\u1EA5t ph\xE1t, nh\u1EADn ${formatMoney(RULES.salary * laps)}`, "salary", { id: p.id, amount: RULES.salary * laps });
    }
    p.pos = ((from + steps) % count + count) % count;
    this.log(`${p.name} \u0111\u1EBFn ${BOARD[p.pos].name}`, "move", { id: p.id, from, to: p.pos, steps });
  }
  island(p) {
    p.pos = tileByKey("island").id;
    p.island = RULES.islandAttempts;
    p.travelPending = false;
    this.s.extra = false;
    this.s.doubles = 0;
    this.log(`${p.name} m\u1EAFc k\u1EB9t \u1EDF Hoang \u0111\u1EA3o`, "island", { id: p.id });
    this.complete();
  }
  die() {
    return 1 + Math.floor(this.rng() * 6);
  }
  roll(p) {
    check(this.s.phase === "roll");
    this.s.dice = [this.die(), this.die()];
    const [a, b] = this.s.dice, sum = a + b;
    this.log(`${p.name} tung ${a} + ${b}`, "roll", { id: p.id, dice: [a, b] });
    if (p.island) {
      this.s.extra = false;
      if (a === b || p.island === 1) {
        p.island = 0;
        this.move(p, sum);
        this.land(p);
      } else {
        p.island--;
        this.complete();
      }
      return;
    }
    this.s.extra = a === b;
    this.s.doubles = a === b ? this.s.doubles + 1 : 0;
    if (this.s.doubles >= RULES.maxDoubles) return this.island(p);
    this.move(p, sum);
    this.land(p);
  }
  pay(p, to, amount, after = "complete") {
    if (!amount) return this.afterPayment(p, after);
    if (p.cash < amount) {
      this.s.debt = { from: p.id, to, amount, after };
      this.phase("debt", RULES.debtMs);
      return;
    }
    this.debit(p, amount);
    if (to && !this.player(to).out) this.credit(this.player(to), amount);
    this.log(`${p.name} tr\u1EA3 ${formatMoney(amount)} cho ${to ? this.player(to).name : "qu\u1EF9 th\xE0nh ph\u1ED1"}`, "payment", { from: p.id, to, amount });
    this.afterPayment(p, after);
  }
  afterPayment(p, after) {
    if (after === "takeover") {
      const i = this.s.context.tile, t = BOARD[i], a = this.s.properties[i];
      if (t.takeoverRules.allowed && a.level < t.takeoverRules.blockedAtLevel) this.phase("takeover");
      else this.complete();
    } else if (after === "destination") {
      p.travelPending = false;
      this.phase("destination");
    } else this.complete();
  }
  settle() {
    const d = this.s.debt;
    check(d);
    const p = this.player(d.from);
    check(p.cash >= d.amount, "Ch\u01B0a \u0111\u1EE7 tr\u1EE9ng thanh to\xE1n");
    this.s.debt = null;
    this.pay(p, d.to, d.amount, d.after);
  }
  complete() {
    if (this.s.phase !== "ended") this.phase("complete", RULES.manageMs);
  }
  land(p, depth = 0) {
    check(depth < 8, "Chu\u1ED7i th\u1EBB qu\xE1 d\xE0i");
    const t = BOARD[p.pos], a = this.s.properties[p.pos];
    this.s.context = { tile: t.id, rent: 0, owner: a.owner, sourceLevel: a.level };
    if (t.purchasePrice) {
      if (!a.owner) {
        this.phase("buy");
        return;
      }
      if (a.owner === p.id) {
        if (t.tileType === "city" && a.level < this.maxLevel(p, t.id)) this.phase("construct");
        else this.complete();
        return;
      }
      const rent = this.rent(t.id);
      this.s.context.rent = rent;
      this.pay(p, a.owner, rent, "takeover");
      return;
    }
    if (t.tileType === "island") return this.island(p);
    if (t.tileType === "travel") {
      p.travelPending = true;
      this.s.extra = false;
      this.log(`${p.name} s\u1EBD ch\u1ECDn \u0111i\u1EC3m \u0111\u1EBFn v\xE0o l\u01B0\u1EE3t sau`, "travel", { id: p.id });
      return this.complete();
    }
    if (t.tileType === "festival") {
      if (this.festivalTiles(p).length) this.phase("festival");
      else this.complete();
      return;
    }
    if (t.tileType === "tax") return this.pay(p, null, Math.ceil((this.netWorth(p) - p.cash) * RULES.tax));
    if (t.tileType === "chance") return this.card(p, depth);
    this.complete();
  }
  card(p, depth = 0) {
    const id = this.s.deck.shift(), c = CARDS[id];
    check(c, "B\u1ED9 th\u1EBB kh\xF4ng h\u1EE3p l\u1EC7");
    if (c.type !== "escape") this.s.deck.push(id);
    this.log(c.text, "card", { id: p.id, card: id });
    if (c.type === "escape") {
      p.escape++;
      return this.complete();
    }
    if (c.type === "island") return this.island(p);
    if (c.type === "cash") {
      if (c.value < 0) return this.pay(p, null, -c.value);
      this.credit(p, c.value);
      return this.complete();
    }
    if (c.type === "repair") return this.pay(p, null, this.s.properties.reduce((n, a) => n + (a.owner === p.id ? a.level * c.value : 0), 0));
    if (c.type === "festival") {
      if (this.festivalTiles(p).length) this.phase("festival");
      else this.complete();
      return;
    }
    const steps = c.type === "back" ? -c.value : (tileByKey(c.key).id - p.pos + BOARD.length) % BOARD.length;
    this.move(p, steps);
    this.land(p, depth + 1);
  }
  buy(p) {
    check(this.s.phase === "buy");
    const t = BOARD[p.pos], a = this.s.properties[t.id];
    check(t.purchasePrice > 0 && !a.owner);
    this.debit(p, t.purchasePrice);
    a.owner = p.id;
    a.investment = t.purchasePrice;
    this.log(`${p.name} mua ${t.name}`, "purchase", { tile: t.id, id: p.id });
    if (this.checkWin(p)) return;
    this.s.context = { tile: t.id, rent: 0, owner: p.id, sourceLevel: 0 };
    if (t.tileType === "city") this.phase("construct");
    else this.complete();
  }
  build(p, level) {
    check(this.s.phase === "construct");
    const i = p.pos, t = BOARD[i], a = this.s.properties[i];
    check(a.owner === p.id && t.tileType === "city");
    check(integer(level, a.level + 1, this.maxLevel(p, i)), "Ch\u01B0a \u0111\u1EE7 \u0111i\u1EC1u ki\u1EC7n x\xE2y c\u1EA5p n\xE0y");
    const cost = this.constructionCost(i, level);
    this.debit(p, cost);
    a.level = level;
    a.investment += cost;
    this.log(`${p.name} n\xE2ng c\u1EA5p ${t.name}`, "build", { tile: i, id: p.id, level });
    this.complete();
  }
  takeover(p) {
    check(this.s.phase === "takeover");
    const i = p.pos, t = BOARD[i], a = this.s.properties[i], owner = a.owner;
    check(owner && owner !== p.id && !this.player(owner).out && t.takeoverRules.allowed && a.level < t.takeoverRules.blockedAtLevel, "Kh\xE1ch s\u1EA1n v\xE0 \u0111i\u1EC3m du l\u1ECBch ch\u1EB7n mua l\u1EA1i");
    const cost = this.takeoverPrice(i);
    this.debit(p, cost);
    this.credit(this.player(owner), cost);
    a.owner = p.id;
    this.log(`${p.name} mua l\u1EA1i ${t.name}: ${formatMoney(cost)}`, "takeover", { tile: i, id: p.id, previousOwner: owner, amount: cost });
    if (this.checkWin(p)) return;
    this.s.context = { tile: i, rent: this.s.context?.rent || 0, owner: p.id, sourceLevel: a.level };
    if (a.level < this.maxLevel(p, i)) this.phase("construct");
    else this.complete();
  }
  chooseDestination(p, i) {
    check(this.s.phase === "destination" && this.legalDestinations(p).includes(i), "\u0110i\u1EC3m \u0111\u1EBFn kh\xF4ng h\u1EE3p l\u1EC7");
    this.move(p, (i - p.pos + BOARD.length) % BOARD.length);
    this.log(`${p.name} ho\xE0n t\u1EA5t chuy\u1EBFn du l\u1ECBch`, "travel", { id: p.id, to: i });
    this.land(p);
  }
  festival(p, i) {
    check(this.s.phase === "festival" && this.festivalTiles(p).includes(i), "Ch\u1EC9 t\u1ED5 ch\u1EE9c t\u1EA1i th\xE0nh ph\u1ED1 b\u1EA1n s\u1EDF h\u1EEFu");
    const a = this.s.properties[i];
    a.festival = a.festivalUntil > this.s.turnCount ? Math.min(RULES.festivalMax, a.festival + 1) : RULES.festivalMultiplier;
    a.festivalUntil = this.s.turnCount + RULES.festivalTurns;
    this.log(`L\u1EC5 h\u1ED9i ${BOARD[i].name}: ph\xED \xD7${a.festival}`, "festival", { tile: i, id: p.id });
    this.complete();
  }
  liquidate(p, i) {
    check(this.s.phase === "debt" && this.s.debt?.from === p.id, "Ch\u1EC9 thanh l\xFD khi \u0111ang thi\u1EBFu tr\u1EE9ng");
    const a = this.s.properties[this.tile(i).id];
    check(a.owner === p.id, "B\u1EA1n kh\xF4ng s\u1EDF h\u1EEFu \xF4 n\xE0y");
    const amount = Math.floor(a.investment * RULES.resaleRatio);
    this.credit(p, amount);
    this.s.properties[i] = emptyProperty();
    this.log(`${p.name} thanh l\xFD ${BOARD[i].name}: ${formatMoney(amount)}`, "liquidate", { tile: i, id: p.id });
  }
  bankrupt(p) {
    if (p.out) return;
    this.log(`${p.name} ph\xE1 s\u1EA3n`, "bankrupt", { id: p.id });
    if (this.s.debt?.from === p.id) {
      const to = this.s.debt.to;
      if (to && !this.player(to).out) this.credit(this.player(to), p.cash);
      this.s.debt = null;
    }
    p.cash = 0;
    p.out = true;
    p.rank = this.active.length + 1;
    p.travelPending = false;
    this.s.properties = this.s.properties.map((a) => a.owner === p.id ? emptyProperty() : a);
    while (p.escape > 0) {
      p.escape--;
      this.s.deck.push(CARDS.findIndex((c) => c.type === "escape"));
    }
    if (this.active.length === 1) return this.finish(this.active[0], "\u0110\u1ED1i th\u1EE7 ph\xE1 s\u1EA3n");
    if (this.active.length === 0) {
      this.s.closed = true;
      return;
    }
    if (p.id === this.s.turn) {
      this.s.extra = false;
      this.next();
    }
  }
  checkWin(p) {
    if (this.s.phase === "ended") return true;
    let reason = "";
    if (TOURISTS.every((i) => this.s.properties[i].owner === p.id)) reason = "Tourist Monopoly \xB7 4 \u0111i\u1EC3m du l\u1ECBch";
    else if (GROUPS.filter((g) => this.ownsGroup(p.id, g)).length >= RULES.tripleGroups) reason = "Triple Monopoly \xB7 3 nh\xF3m tr\u1ECDn b\u1ED9";
    else if (SIDES.some((side) => side.length > 0 && this.ownsGroup(p.id, side))) reason = "Side Monopoly \xB7 tr\u1ECDn m\u1ED9t c\u1EA1nh";
    if (reason) {
      this.finish(p, reason);
      return true;
    }
    return false;
  }
  finish(p, reason) {
    this.s.phase = "ended";
    this.s.deadline = 0;
    this.s.ended = this.now;
    this.s.winner = p.id;
    this.s.winReason = reason;
    this.s.debt = null;
    const remaining = this.active.filter((q) => q.id !== p.id).sort((a, b) => this.netWorth(b) - this.netWorth(a) || a.seat - b.seat);
    p.rank = 1;
    remaining.forEach((q, i) => q.rank = i + 2);
    if (!this.player(this.s.host).connected) this.transferHost(this.s.host);
    this.log(`${p.name} chi\u1EBFn th\u1EAFng: ${reason}`, "win", { id: p.id, reason });
  }
  next() {
    if (this.active.length === 1) return this.finish(this.active[0], "\u0110\u1ED1i th\u1EE7 ph\xE1 s\u1EA3n");
    const old = this.player(this.s.turn);
    if (!this.s.extra || old.out) {
      this.s.turn = (this.active.find((p2) => p2.seat > old.seat) || this.active[0]).id;
      this.s.doubles = 0;
    }
    this.s.extra = false;
    this.s.context = null;
    this.s.turnCount++;
    for (const a of this.s.properties) if (a.festivalUntil && a.festivalUntil <= this.s.turnCount) {
      a.festival = 1;
      a.festivalUntil = 0;
    }
    const p = this.player(this.s.turn);
    this.log(`\u0110\u1EBFn l\u01B0\u1EE3t ${p.name}`, "turn", { id: p.id });
    if (p.travelPending) {
      if (p.cash >= RULES.travel) this.pay(p, null, RULES.travel, "destination");
      else {
        p.travelPending = false;
        this.phase("roll", RULES.rollMs);
      }
    } else this.phase("roll", RULES.rollMs);
  }
  reset() {
    const old = this.s, players = old.players.filter((p) => p.connected);
    this.s = createState(old.code);
    this.s.version = old.version;
    this.s.capacity = old.capacity;
    this.s.players = players.map((p) => ({ ...p, cash: RULES.cash, pos: 0, island: 0, laps: 0, travelPending: false, escape: 0, out: false, income: 0, expense: 0, rank: 0, ready: false }));
    this.s.host = players.find((p) => p.id === old.host)?.id || players[0]?.id || "";
    this.s.legacySnapshot = old.legacySnapshot;
    if (!players.length) this.s.closed = true;
  }
  command(id, c) {
    check(c && typeof c.commandId === "string" && c.commandId.length > 0 && c.commandId.length <= 80 && c.roomId === this.s.code, "L\u1EC7nh kh\xF4ng h\u1EE3p l\u1EC7");
    if (this.s.seen[id]?.includes(c.commandId)) return;
    check(c.expectedVersion === this.s.version, "Tr\u1EA1ng th\xE1i \u0111\xE3 \u0111\u1ED5i, vui l\xF2ng th\u1EED l\u1EA1i");
    check(!this.s.closed, "Ph\xF2ng \u0111\xE3 \u0111\xF3ng");
    const p = this.player(id), v = c.payload || {};
    if (c.type === "leave") {
      if (["lobby", "legacy"].includes(this.s.phase)) this.remove(id);
      else {
        p.connected = false;
        p.offline = this.now;
        if (this.s.phase !== "ended") this.bankrupt(p);
        this.transferHost(id);
      }
    } else if (["legacy", "ended"].includes(this.s.phase)) {
      check(id === this.s.host && c.type === (this.s.phase === "legacy" ? "newRules" : "rematch"), "Ch\u1EDD ch\u1EE7 ph\xF2ng m\u1EDF s\u1EA3nh m\u1EDBi");
      this.reset();
    } else if (this.s.phase === "lobby") {
      if (c.type === "ready") p.ready = !p.ready;
      else if (c.type === "character") {
        check(integer(v.character, 0, 3) && !this.s.players.some((q) => q.id !== id && q.character === v.character), "Nh\xE2n v\u1EADt \u0111\xE3 c\xF3 ng\u01B0\u1EDDi ch\u1ECDn");
        p.character = v.character;
        p.ready = false;
      } else if (c.type === "capacity") {
        check(id === this.s.host && integer(v.capacity, 2, 4) && v.capacity >= this.s.players.length);
        this.s.capacity = v.capacity;
        this.s.players.forEach((p2) => p2.ready = false);
      } else if (c.type === "start") {
        check(id === this.s.host && this.s.players.length >= 2 && this.s.players.every((p2) => p2.ready && p2.connected), "C\u1EA7n \xEDt nh\u1EA5t 2 ng\u01B0\u1EDDi v\xE0 t\u1EA5t c\u1EA3 s\u1EB5n s\xE0ng");
        this.s.started = this.now;
        this.s.matchDeadline = this.now + RULES.matchMs;
        this.s.deck = shuffle(CARDS.map((_, i) => i), this.rng);
        this.s.turn = this.active[0].id;
        this.phase("roll", RULES.rollMs);
        this.log("B\u1EAFt \u0111\u1EA7u chuy\u1EBFn \u0111i Vi\u1EC7t Nam");
      } else throw Error("L\u1EC7nh s\u1EA3nh kh\xF4ng h\u1EE3p l\u1EC7");
    } else {
      check(!p.out && id === this.s.turn, "Ch\u01B0a \u0111\u1EBFn l\u01B0\u1EE3t b\u1EA1n");
      if (c.type === "roll") this.roll(p);
      else if (c.type === "buy") this.buy(p);
      else if (c.type === "construct") this.build(p, v.level);
      else if (c.type === "takeover") this.takeover(p);
      else if (c.type === "destination") this.chooseDestination(p, v.tile);
      else if (c.type === "festival") this.festival(p, v.tile);
      else if (c.type === "skip") {
        check(["buy", "construct", "takeover", "festival"].includes(this.s.phase));
        this.complete();
      } else if (c.type === "end") {
        check(this.s.phase === "complete");
        this.next();
      } else if (c.type === "bail" || c.type === "escape") {
        check(this.s.phase === "roll" && p.island);
        if (c.type === "bail") this.debit(p, RULES.bail);
        else {
          check(p.escape > 0, "Ch\u01B0a c\xF3 th\u1EBB r\u1EDDi \u0111\u1EA3o");
          p.escape--;
          this.s.deck.push(CARDS.findIndex((c2) => c2.type === "escape"));
        }
        p.island = 0;
      } else if (c.type === "liquidate") this.liquidate(p, v.tile);
      else if (c.type === "settle") {
        check(this.s.phase === "debt");
        this.settle();
      } else if (c.type === "bankrupt") {
        check(this.s.phase === "debt");
        this.bankrupt(p);
      } else throw Error("H\xE0nh \u0111\u1ED9ng kh\xF4ng c\xF3 trong b\u1ED9 lu\u1EADt hi\u1EC7n t\u1EA1i");
    }
    this.s.version++;
    (this.s.seen[id] ||= []).push(c.commandId);
    this.s.seen[id] = this.s.seen[id].slice(-100);
  }
  tick(now = Date.now()) {
    this.now = now;
    let changed = false;
    if (this.s.closed) return false;
    if (this.s.allOffline && now - this.s.allOffline >= 18e5) {
      this.s.closed = true;
      this.s.version++;
      return true;
    }
    for (const p of [...this.s.players]) if (!p.connected && p.offline && !p.out && now - p.offline >= (["lobby", "legacy"].includes(this.s.phase) ? 6e4 : 12e4) && (!this.s.allOffline || ["lobby", "legacy"].includes(this.s.phase))) {
      if (["lobby", "legacy"].includes(this.s.phase)) this.remove(p.id);
      else if (this.s.phase !== "ended") this.bankrupt(p);
      changed = true;
    }
    if (this.s.matchDeadline && now >= this.s.matchDeadline && !["ended", "lobby", "legacy"].includes(this.s.phase) && this.active.length) {
      this.finish([...this.active].sort((a, b) => this.netWorth(b) - this.netWorth(a) || a.seat - b.seat)[0], "H\u1EBFt gi\u1EDD \xB7 t\u1ED5ng t\xE0i s\u1EA3n cao nh\u1EA5t");
      changed = true;
    }
    if (this.s.deadline && now >= this.s.deadline && !["ended", "lobby", "legacy"].includes(this.s.phase)) {
      changed = true;
      const p = this.player(this.s.turn);
      if (this.s.phase === "roll") this.roll(p);
      else if (this.s.phase === "complete") this.next();
      else if (this.s.phase === "destination") {
        const target = this.legalDestinations(p)[0];
        if (target !== void 0) this.chooseDestination(p, target);
        else this.complete();
      } else if (this.s.phase === "debt") {
        for (const t of BOARD) {
          if (p.cash >= this.s.debt.amount) break;
          if (this.s.properties[t.id].owner === p.id) this.liquidate(p, t.id);
        }
        if (p.cash >= this.s.debt.amount) this.settle();
        else this.bankrupt(p);
      } else this.complete();
    }
    if (changed) this.s.version++;
    return changed;
  }
};
function execute(state, id, command, now = Date.now(), rng = random) {
  const e = new Engine(structuredClone(state), rng, now);
  e.command(id, command);
  return e.s;
}

// mebi-monopoly/service.ts
var RoomService = class {
  constructor(state, persist, schedule) {
    this.persist = persist;
    this.schedule = schedule;
    this.state = upgradeState(state);
  }
  persist;
  schedule;
  state;
  peers = /* @__PURE__ */ new Map();
  limits = /* @__PURE__ */ new Map();
  async save() {
    await this.persist(this.state);
    await this.schedule(Date.now() + 1e3);
  }
  broadcast() {
    const message = JSON.stringify({ type: "state", state: snapshot(this.state) });
    for (const [peer] of this.peers) {
      try {
        peer.send(message);
      } catch {
      }
    }
  }
  rate(key, max = 20) {
    const now = Date.now();
    let r = this.limits.get(key);
    if (!r || now - r.time > 1e4) {
      r = { time: now, count: 0 };
      this.limits.set(key, r);
    }
    if (++r.count > max) throw Error("Thao t\xE1c qu\xE1 nhanh, vui l\xF2ng ch\u1EDD");
    if (this.limits.size > 2e3) this.limits.clear();
  }
  async enter(op, body) {
    this.rate("enter", 30);
    const engine = new Engine(structuredClone(this.state));
    if (op === "create") {
      if (engine.s.players.length || engine.s.closed) throw Error("M\xE3 ph\xF2ng \u0111\xE3 t\u1ED3n t\u1EA1i");
    } else if (engine.s.closed) throw Error("Ph\xF2ng \u0111\xE3 \u0111\xF3ng");
    else if (!engine.s.players.length) throw Error("Ph\xF2ng kh\xF4ng t\u1ED3n t\u1EA1i");
    if (op === "resume" && (typeof body.token !== "string" || !body.token)) throw Error("Phi\xEAn kh\xF4ng h\u1EE3p l\u1EC7");
    const p = engine.join(body.name, op === "resume" ? body.token : void 0);
    p.connected = false;
    p.offline = Date.now();
    this.state = engine.s;
    await this.save();
    this.broadcast();
    return { token: p.token, id: p.id, state: snapshot(this.state) };
  }
  async message(peer, raw) {
    if (raw.length > 8192) throw Error("Payload qu\xE1 l\u1EDBn");
    const message = JSON.parse(raw);
    const id = this.peers.get(peer);
    if (!id) {
      this.rate("auth", 30);
      if (message.type !== "auth" || typeof message.token !== "string") throw Error("C\u1EA7n x\xE1c th\u1EF1c");
      const engine = new Engine(structuredClone(this.state));
      const p = engine.join("", message.token);
      for (const [old, oldId] of this.peers) if (oldId === p.id && old !== peer) {
        this.peers.delete(old);
        try {
          old.close(1e3, "Phi\xEAn \u0111\u01B0\u1EE3c m\u1EDF l\u1EA1i");
        } catch {
        }
      }
      this.peers.set(peer, p.id);
      this.state = engine.s;
      await this.save();
      this.broadcast();
      return;
    }
    this.rate(id);
    await this.tick();
    if (message.type === "sync") {
      peer.send(JSON.stringify({ type: "state", state: snapshot(this.state) }));
      return;
    }
    this.state = execute(this.state, id, message);
    await this.save();
    this.broadcast();
  }
  async disconnect(peer) {
    const id = this.peers.get(peer);
    this.peers.delete(peer);
    if (!id || [...this.peers.values()].includes(id) || !this.state.players.some((p) => p.id === id)) return;
    const engine = new Engine(structuredClone(this.state));
    engine.disconnect(id);
    this.state = engine.s;
    await this.save();
    this.broadcast();
  }
  async tick() {
    const engine = new Engine(structuredClone(this.state));
    if (engine.tick()) {
      this.state = engine.s;
      await this.persist(this.state);
      this.broadcast();
    }
    if (!this.state.closed && this.state.players.length) await this.schedule(Date.now() + 1e3);
  }
  async request(request) {
    try {
      if (request.method !== "POST") return Response.json({ error: "Ch\u1EC9 h\u1ED7 tr\u1EE3 POST" }, { status: 405 });
      const text = await request.text();
      if (text.length > 1024) throw Error("Payload qu\xE1 l\u1EDBn");
      const body = JSON.parse(text);
      const op = new URL(request.url).pathname.split("/").pop();
      if (!["create", "join", "resume"].includes(op)) throw Error("\u0110\u01B0\u1EDDng d\u1EABn kh\xF4ng h\u1EE3p l\u1EC7");
      return Response.json(await this.enter(op, body));
    } catch (e) {
      return Response.json({ error: e.message }, { status: 400 });
    }
  }
};
export {
  BOARD,
  CARDS,
  Engine,
  GROUPS,
  PREMIUM,
  RULES,
  RoomService,
  SIDES,
  TOURISTS,
  createState,
  execute,
  snapshot,
  tileByKey,
  upgradeState
};
