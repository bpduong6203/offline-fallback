// mebi-monopoly/tour-data.ts
var SCHEMA_VERSION = 4;
var RULESET = "mebi-tour-mebi-v2";
var MAP_VERSION = "vietnam-32-v1";
var RULES = {
  cash: 2e3,
  salary: 300,
  bail: 200,
  travel: 50,
  tax: 0.1,
  taxRateBps: 1e3,
  rollMs: 3e4,
  choiceMs: 3e4,
  manageMs: 3e4,
  debtMs: 12e4,
  autoEndMs: 3500,
  moveStepMs: 125,
  doubleExtraTurn: true,
  oneSixExtraTurn: true,
  threeDoublesToIsland: true,
  maxDoubles: 3,
  initialBuildChoices: [1, 2],
  requireNewLapToUpgrade: true,
  maxHouseLevel: 3,
  hotelLevel: 4,
  islandAttempts: 3,
  buybackEnabled: true,
  buybackMultiplierBps: 2e4,
  buybackPreserveLevel: true,
  buybackRentPolicy: "RENT_FIRST",
  takeoverMultiplier: 2,
  resaleRatio: 2 / 3,
  monopolyMultiplier: 1,
  festivalMultiplier: 2,
  festivalMax: 2,
  festivalTurns: 8,
  eventStackPolicy: "MAX",
  moveBonus: { DICE: true, TELEPORT: false, FLIGHT: true, CARD_MOVE: false, GO_TO_START: false },
  tripleGroups: 3,
  touristCount: 4,
  matchMs: 0,
  touristRents: [0, 25, 50, 100, 200],
  victory: { side: true, tripleSetsRequired: 3, allResorts: true, bankruptcy: true, allOthersLeave: true },
  earthquakeSteps: 1,
  disableStartPasses: 1,
  maxEffectHops: 8,
  shuffleTurnOrder: true
};
var COLORS = ["#3B82F6", "#F97316", "#8B5CF6", "#22C55E"];
var PREMIUM = [{ key: "mebisoft", name: "Mebisoft", price: 800, asset: "tech" }, { key: "mebifarm", name: "Mebifarm", price: 720, asset: "farm" }, { key: "mebieco", name: "Mebieco", price: 640, asset: "eco" }];
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
  const premium = PREMIUM.find((p) => p.key === key), purchasePrice = premium?.price ?? price * 2, buildPrice = purchasePrice / 2;
  return { id, key, name: premium?.name ?? name, tileType, groupId, patternId: groupId, sideWinEligible: purchasePrice > 0, purchasePrice, constructionCosts: tileType === "city" ? [0, round(buildPrice * 0.3), round(buildPrice * 0.45), round(buildPrice * 0.6), round(buildPrice * 1.2)] : [], rentByLevel: tileType === "city" ? Array(5).fill(Math.floor(purchasePrice / 4)) : [Math.floor(purchasePrice / 4)], takeoverRules: { allowed: tileType === "city", blockedAtLevel: RULES.hotelLevel, multiplier: RULES.takeoverMultiplier }, landmarkAsset: premium?.asset ?? landmarkAsset, boardPosition, side: Math.min(3, Math.floor(id / SIDE_LENGTH)), color: bands[groupId ?? 0] };
});
var tileByKey = (key) => BOARD.find((t) => t.key === key);
var GROUPS = [...new Set(BOARD.flatMap((t) => t.groupId === null ? [] : [t.groupId]))].map((id) => BOARD.filter((t) => t.groupId === id).map((t) => t.id));
var TRIPLETS = GROUPS.filter((group) => group.length === 3);
var TOURISTS = BOARD.filter((t) => t.tileType === "tourist").map((t) => t.id);
var SIDES = [0, 1, 2, 3].map((side) => BOARD.filter((t) => t.side === side && t.sideWinEligible).map((t) => t.id));
var CARDS = [
  { text: "Kh\u1EDFi nghi\u1EC7p th\xE0nh c\xF4ng: nh\u1EADn 100.000 tr\u1EE9ng", type: "cash", value: 100 },
  { text: "Qu\u1EF9 du l\u1ECBch: nh\u1EADn 50.000 tr\u1EE9ng", type: "cash", value: 50 },
  { text: "Chi ph\xED b\u1EA3o tr\xEC: tr\u1EA3 50.000 tr\u1EE9ng", type: "cash", value: -50 },
  { text: "Chuy\u1EBFn \u0111i v\u1EC1 Xu\u1EA5t ph\xE1t, kh\xF4ng th\u01B0\u1EDFng qua v\xF2ng", type: "move", key: "start" },
  { text: "Gh\xE9 th\u0103m H\xE0 N\u1ED9i", type: "move", key: "ha-noi" },
  { text: "C\u1EA5t c\xE1nh \u0111\u1EBFn Mebisoft", type: "move", key: "mebisoft" },
  { text: "L\xF9i ba \xF4", type: "back", value: 3 },
  { text: "Tr\xF4i d\u1EA1t t\u1EDBi Hoang \u0111\u1EA3o", type: "island" },
  { text: "Th\u1EBB r\u1EDDi \u0111\u1EA3o mi\u1EC5n ph\xED", type: "escape" },
  { text: "S\u1EEDa ch\u1EEFa: 20.000 tr\u1EE9ng m\u1ED7i c\u1EA5p c\xF4ng tr\xECnh", type: "repair", value: 20 },
  { text: "M\u1EDF l\u1EC5 h\u1ED9i t\u1EA1i m\u1ED9t th\xE0nh ph\u1ED1 s\u1EDF h\u1EEFu", type: "festival" },
  { text: "Th\u01B0\u1EDFng s\xE1ng ki\u1EBFn xanh: nh\u1EADn 150.000 tr\u1EE9ng", type: "cash", value: 150 },
  { text: "H\u1EA1 m\u1ED9t c\u1EA5p th\xE0nh ph\u1ED1 \u0111\u1ED1i th\u1EE7", type: "downgrade", value: 1 },
  { text: "\u0110\u1ED9ng \u0111\u1EA5t: ch\u1ECDn m\u1ED9t th\xE0nh ph\u1ED1 \u0111\u1ED1i th\u1EE7 \u0111\u1EC3 ph\xE1 m\u1ED9t c\u1EA5p", type: "earthquake", value: 1 },
  { text: "L\xE1 ch\u1EAFn: b\u1EA3o v\u1EC7 m\u1ED9t th\xE0nh ph\u1ED1 kh\u1ECFi m\u1ED9t l\u1EA7n ph\xE1 ho\u1EB7c mua l\u1EA1i", type: "shield", value: 1 },
  { text: "M\u1EA5t \u0111i\u1EC7n: t\u1EAFt ph\xED m\u1ED9t th\xE0nh ph\u1ED1 t\u1EDBi khi ch\u1EE7 \u0111\u1EA5t qua Xu\u1EA5t ph\xE1t", type: "disable", value: 1 },
  { text: "Sinh nh\u1EADt: nh\u1EADn 20.000 tr\u1EE9ng t\u1EEB m\u1ED7i ng\u01B0\u1EDDi ch\u01A1i kh\xE1c", type: "birthday", value: 20 },
  { text: "V\xE9 du l\u1ECBch: ch\u1ECDn m\u1ED9t \u0111i\u1EC3m \u0111\u1EBFn h\u1EE3p l\u1EC7", type: "travel" }
];
function validateMap(tiles = BOARD) {
  if (tiles.length < 8 || new Set(tiles.map((t) => t.key)).size !== tiles.length) throw Error("Map thi\u1EBFu \xF4 ho\u1EB7c tr\xF9ng ID");
  for (const kind of ["start", "island", "travel", "festival"]) if (tiles.filter((t) => t.tileType === kind).length !== 1) throw Error("Map thi\u1EBFu ho\u1EB7c tr\xF9ng \xF4 " + kind);
  for (const [i, t] of tiles.entries()) {
    if (t.id !== i || !Number.isSafeInteger(t.purchasePrice) || t.purchasePrice < 0) throw Error("Gi\xE1/ID map kh\xF4ng h\u1EE3p l\u1EC7");
    if (t.tileType === "city" && (t.rentByLevel.length !== RULES.hotelLevel + 1 || t.constructionCosts.length !== RULES.hotelLevel + 1 || [...t.rentByLevel, ...t.constructionCosts].some((n) => !Number.isSafeInteger(n) || n < 0))) throw Error("B\u1EA3ng x\xE2y/ph\xED kh\xF4ng h\u1EE3p l\u1EC7");
  }
  const groups = [...new Set(tiles.filter((t) => t.groupId !== null).map((t) => t.groupId))].map((id) => tiles.filter((t) => t.groupId === id));
  if (groups.filter((g) => g.length === 3).length < RULES.victory.tripleSetsRequired || !tiles.some((t) => t.tileType === "tourist")) throw Error("\u0110i\u1EC1u ki\u1EC7n th\u1EAFng kh\xF4ng th\u1EC3 \u0111\u1EA1t");
  if (new Set(tiles.map((t) => `${t.boardPosition.x}:${t.boardPosition.y}`)).size !== tiles.length || tiles.some((t) => !Number.isInteger(t.side) || t.side < 0 || t.side > 3 || !Number.isInteger(t.boardPosition.x) || !Number.isInteger(t.boardPosition.y) || t.boardPosition.x < 0 || t.boardPosition.y < 0 || t.sideWinEligible && t.purchasePrice <= 0)) throw Error("V\u1ECB tr\xED/c\u1EA1nh map kh\xF4ng h\u1EE3p l\u1EC7");
  return true;
}

// mebi-monopoly/currency.ts
var EGGS_PER_UNIT = 1e3;
var toEggs = (units) => units * EGGS_PER_UNIT;
var moneyFormat = new Intl.NumberFormat("vi-VN");
var formatMoney = (units) => moneyFormat.format(toEggs(units)) + " tr\u1EE9ng";

// mebi-monopoly/bots.ts
function chooseBotAction(s, id, difficulty = "heuristic", random2 = Math.random) {
  const p = s.players.find((p2) => p2.id === id), d = s.decisions || {};
  if (!p || p.out) return { type: "skip" };
  if (s.phase === "roll") return p.onIsland && p.escape ? { type: "escape" } : { type: "roll" };
  if (s.phase === "complete") return { type: "end" };
  if (s.phase === "debt") {
    if (p.cash >= s.debt.amount) return { type: "settle" };
    const owned = BOARD.filter((t) => s.properties[t.id].owner === id).sort((a, b) => s.properties[a.id].investment - s.properties[b.id].investment);
    return owned.length ? { type: "liquidate", payload: { tile: owned[0].id } } : { type: "bankrupt" };
  }
  const reserve = difficulty === "random" ? 0 : Math.max(100, p.cash * 0.12);
  if (s.phase === "buy") {
    const choices = (d.purchaseLevels || []).filter((level2) => d.purchaseCosts[level2] <= p.cash - reserve);
    if (!choices.length) return { type: "skip" };
    const level = difficulty === "random" ? choices[Math.floor(random2() * choices.length)] : choices.at(-1);
    return { type: "buy", payload: { initialLevel: level } };
  }
  if (s.phase === "construct") return d.maxLevel > s.properties[p.pos].level && d.upgradeCost <= p.cash - reserve ? { type: "construct", payload: { level: d.maxLevel } } : { type: "skip" };
  if (s.phase === "takeover") {
    return d.takeoverAllowed && d.takeoverCost <= p.cash - reserve ? { type: "takeover" } : { type: "skip" };
  }
  if (s.phase === "destination" || s.phase === "festival" || s.phase === "event") {
    const targets = d.eligibleTargets || [];
    if (!targets.length) return { type: "skip" };
    let target = targets[0];
    if (difficulty === "random") target = targets[Math.floor(random2() * targets.length)];
    else {
      const score = (i) => {
        const t = BOARD[i], a = s.properties[i];
        let score2 = t.purchasePrice + (TRIPLETS.some((group) => group.includes(i) && group.filter((j) => s.properties[j].owner === id).length === 2) ? 2e3 : 0);
        if (s.phase === "destination") {
          score2 += !a.owner ? 1500 : a.level < 4 && p.laps > a.lastUpgradeLap ? 1e3 : -2e3;
          score2 += BOARD.filter((j) => j.side === t.side && s.properties[j.id].owner === id).length * 100;
        }
        if (s.phase === "festival") score2 = t.rentByLevel[a.level] || 0;
        if (difficulty === "rollout") for (let trial = 0; trial < 12; trial++) for (const q of s.players.filter((q2) => q2.id !== id && !q2.out)) {
          const next = (q.pos + 1 + Math.floor(random2() * 6) + 1 + Math.floor(random2() * 6)) % BOARD.length;
          if (next === i) score2 += t.rentByLevel[Math.max(1, a.level)] || 100;
        }
        return score2;
      };
      target = targets.map((i) => ({ i, score: score(i) })).sort((a, b) => b.score - a.score || a.i - b.i)[0].i;
    }
    return { type: s.phase, payload: { tile: target } };
  }
  return { type: "skip" };
}

// mebi-monopoly/spec-engine.ts
var check = (ok, message = "Thao t\xE1c kh\xF4ng h\u1EE3p l\u1EC7") => {
  if (!ok) throw Error(message);
};
var integer = (n, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(n) && n >= min && n <= max;
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
var emptyProperty = () => ({ owner: null, level: 0, investment: 0, lastUpgradeLap: -1, shieldCharges: 0, disabledUntilStartPasses: 0, festival: 1, festivalUntil: 0, championshipBps: 1e4, championshipUntil: 0 });
function createState(code, seed = Math.floor(random() * 4294967296)) {
  return { schemaVersion: SCHEMA_VERSION, ruleset: RULESET, mapVersion: MAP_VERSION, matchId: crypto.randomUUID(), code, version: 0, players: [], host: "", capacity: 4, phase: "lobby", turn: "", turnOrder: [], deadline: 0, doubles: 0, extra: false, dice: [], properties: BOARD.map(emptyProperty), deck: [], log: [], seq: 0, effectSeq: 0, started: 0, ended: 0, matchDeadline: 0, turnCount: 0, winner: null, winReason: "", winReasonCode: "", debt: null, payments: [], afterPayments: null, paidDebtIds: [], context: null, eventChoice: null, seen: {}, closed: false, allOffline: 0, rngState: seed >>> 0, randomTape: [], history: [] };
}
function upgradeState(old) {
  if (old.schemaVersion === SCHEMA_VERSION && old.ruleset === RULESET) return old;
  const s = createState(old.code || "");
  s.version = (old.version || 0) + 1;
  s.capacity = old.capacity || 4;
  s.host = old.host || "";
  s.players = (old.players || []).map((p) => ({ ...p, cash: RULES.cash, pos: 0, island: 0, onIsland: false, islandFailedTurns: 0, laps: 0, travelPending: false, escape: 0, out: false, forfeited: false, bot: !!p.bot, difficulty: p.difficulty || "heuristic", income: 0, expense: 0, rank: 0, ready: !!p.bot }));
  s.closed = !!old.closed;
  s.allOffline = old.allOffline || 0;
  s.legacySnapshot = structuredClone(old);
  s.phase = ["lobby", "ended"].includes(old.phase) ? "lobby" : "legacy";
  s.migrationNotice = s.phase === "legacy" ? "Lu\u1EADt Mebi \u0111\xE3 \u0111\u01B0\u1EE3c c\u1EADp nh\u1EADt. B\u1EA3n l\u01B0u c\u0169 \u0111\u01B0\u1EE3c gi\u1EEF ri\xEAng; ch\u1EE7 ph\xF2ng c\u1EA7n m\u1EDF s\u1EA3nh lu\u1EADt m\u1EDBi." : "\u0110\xE3 c\u1EADp nh\u1EADt lu\u1EADt Mebi m\u1EDBi. Vui l\xF2ng s\u1EB5n s\xE0ng l\u1EA1i.";
  return s;
}
function snapshot(s) {
  const { deck, seen, legacySnapshot, rngState, randomTape, history, replayBase, ...publicState } = s;
  const e = new Engine(s), p = s.players.find((p2) => p2.id === (s.debt?.from || s.turn));
  const decisions = p ? e.decisions(p) : {};
  return { ...publicState, players: s.players.map(({ token, ...p2 }) => p2), decisions, replayAvailable: s.phase === "ended" && !!replayBase };
}
var Engine = class {
  constructor(s, rng = void 0, now = Date.now()) {
    this.s = s;
    this.rng = rng;
    this.now = now;
  }
  s;
  rng;
  now;
  recordReplay = true;
  silent = false;
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
  draw() {
    let value;
    if (this.rng) value = this.rng();
    else {
      let t = this.s.rngState += 1831565813;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      value = ((t ^ t >>> 14) >>> 0) / 4294967296;
      this.s.rngState >>>= 0;
    }
    check(value >= 0 && value < 1, "RNG kh\xF4ng h\u1EE3p l\u1EC7");
    return value;
  }
  phase(phase, ms = RULES.choiceMs) {
    this.s.phase = phase;
    this.s.deadline = this.now + ms;
  }
  log(text, type = "info", data = {}) {
    this.s.seq++;
    if (!this.silent) {
      this.s.log.push({ seq: this.s.seq, text, type, data });
      if (this.s.log.length > 100) this.s.log.shift();
    }
  }
  remember(item) {
    if (this.recordReplay && this.s.replayBase) this.s.history.push(item);
  }
  join(name, token) {
    check(!this.s.closed, "Ph\xF2ng \u0111\xE3 \u0111\xF3ng");
    if (token) {
      const p2 = this.s.players.find((p3) => p3.token === token && !p3.bot);
      check(p2, "Phi\xEAn kh\xF4ng h\u1EE3p l\u1EC7");
      p2.connected = true;
      p2.offline = 0;
      this.s.allOffline = 0;
      if (!this.s.players.find((p3) => p3.id === this.s.host)?.connected && this.s.phase === "ended") this.s.host = p2.id;
      this.s.version++;
      this.remember({ kind: "resume", id: p2.id, at: this.now });
      return p2;
    }
    check(this.s.phase === "lobby", "Tr\u1EADn \u0111\xE3 b\u1EAFt \u0111\u1EA7u");
    check(this.s.players.length < this.s.capacity, "Ph\xF2ng \u0111\xE3 \u0111\u1EA7y");
    check(typeof name === "string" && name.trim().length > 0 && name.trim().length <= 24, "T\xEAn c\u1EA7n t\u1EEB 1\u201324 k\xFD t\u1EF1");
    const seat = [0, 1, 2, 3].find((i) => !this.s.players.some((p2) => p2.seat === i));
    const p = { id: crypto.randomUUID(), token: crypto.randomUUID() + crypto.randomUUID(), name: name.trim(), seat, color: COLORS[seat], character: [0, 1, 2, 3].find((i) => !this.s.players.some((p2) => p2.character === i)), ready: false, connected: true, offline: 0, cash: RULES.cash, pos: 0, island: 0, onIsland: false, islandFailedTurns: 0, laps: 0, travelPending: false, escape: 0, out: false, forfeited: false, bot: false, difficulty: "heuristic", income: 0, expense: 0, rank: 0 };
    this.s.players.push(p);
    this.s.host ||= p.id;
    this.s.allOffline = 0;
    this.s.version++;
    this.log(`${p.name} v\xE0o ph\xF2ng`);
    return p;
  }
  disconnect(id) {
    const p = this.player(id);
    if (p.bot) return;
    p.connected = false;
    p.offline = this.now;
    p.ready = false;
    if (!this.s.players.some((p2) => p2.connected && !p2.bot)) this.s.allOffline = this.now;
    if (this.s.phase === "ended") this.transferHost(id);
    this.s.version++;
    this.remember({ kind: "disconnect", id, at: this.now });
  }
  transferHost(id) {
    if (this.s.host === id) this.s.host = this.s.players.filter((p) => p.connected && !p.bot && p.id !== id).sort((a, b) => a.seat - b.seat)[0]?.id || id;
  }
  remove(id) {
    this.s.players = this.s.players.filter((p) => p.id !== id);
    delete this.s.seen[id];
    if (this.s.host === id) this.s.host = this.s.players.filter((p) => !p.bot).sort((a, b) => a.seat - b.seat)[0]?.id || "";
    if (!this.s.players.some((p) => !p.bot)) this.s.closed = true;
  }
  credit(p, n) {
    check(integer(n) && integer(p.cash + n));
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
    const owner = this.player(a.owner);
    if (a.disabledUntilStartPasses > owner.laps) return 0;
    const base = Math.floor(t.purchasePrice / 4);
    const festival = a.festivalUntil > this.s.turnCount ? a.festival * 1e4 : 1e4, championship = a.championshipUntil > this.s.turnCount ? a.championshipBps : 1e4;
    return Math.floor(base * festival / 1e4 * championship / 1e4);
  }
  takeoverPrice(i) {
    return Math.floor(this.s.properties[i].investment * RULES.buybackMultiplierBps / 1e4);
  }
  takeoverAllowed(i, p) {
    const t = this.tile(i), a = this.s.properties[i];
    return !!(RULES.buybackEnabled && a.owner && a.owner !== p.id && t.takeoverRules.allowed && a.level < RULES.hotelLevel && !a.shieldCharges);
  }
  constructionCost(i, level) {
    const a = this.s.properties[i];
    return this.tile(i).constructionCosts.slice(a.level + 1, level + 1).reduce((n, v) => n + v, 0);
  }
  purchaseCost(i, level) {
    return this.tile(i).purchasePrice + this.tile(i).constructionCosts.slice(1, level + 1).reduce((n, v) => n + v, 0);
  }
  maxLevel(p, i) {
    const a = this.s.properties[i];
    if (a.level >= RULES.hotelLevel || a.disabledUntilStartPasses > p.laps) return a.level;
    if (RULES.requireNewLapToUpgrade && p.laps <= a.lastUpgradeLap && !this.s.context?.takeoverUpgrade) return a.level;
    return a.level + 1;
  }
  legalDestinations(p) {
    return BOARD.filter((t) => t.purchasePrice > 0 && (!this.s.properties[t.id].owner || this.s.properties[t.id].owner === p.id)).map((t) => t.id);
  }
  festivalTiles(p) {
    return BOARD.filter((t) => t.tileType === "city" && this.s.properties[t.id].owner === p.id).map((t) => t.id);
  }
  eventTargets(p) {
    const kind = this.s.eventChoice?.kind;
    return BOARD.filter((t) => t.tileType === "city" && (kind !== "earthquake" || this.s.properties[t.id].level > 0 && this.s.properties[t.id].level < RULES.hotelLevel) && (kind === "shield" ? this.s.properties[t.id].owner === p.id : !!this.s.properties[t.id].owner && this.s.properties[t.id].owner !== p.id)).map((t) => t.id);
  }
  decisions(p) {
    const i = p.pos, t = BOARD[i], levels = t.tileType === "city" ? RULES.initialBuildChoices : [0];
    return { actorId: this.s.debt?.from || this.s.turn, purchaseLevels: levels, purchaseCosts: Object.fromEntries(levels.map((level) => [level, this.purchaseCost(i, level)])), maxLevel: this.maxLevel(p, i), upgradeCost: this.constructionCost(i, this.maxLevel(p, i)), takeoverCost: this.takeoverPrice(i), takeoverAllowed: this.takeoverAllowed(i, p), eligibleTargets: this.s.phase === "destination" ? this.legalDestinations(p) : this.s.phase === "festival" ? this.festivalTiles(p) : this.s.phase === "event" ? this.eventTargets(p) : [], eventKind: this.s.eventChoice?.kind };
  }
  netWorth(p) {
    return p.cash + this.s.properties.reduce((n, a) => n + (a.owner === p.id ? a.investment : 0), 0);
  }
  move(p, steps, mode = "DICE", awardStartBonus = RULES.moveBonus[mode]) {
    const from = p.pos, n = BOARD.length;
    check(Number.isSafeInteger(steps));
    const passes = steps > 0 ? Math.floor((from + steps) / n) : 0;
    if (passes && awardStartBonus) {
      p.laps += passes;
      this.credit(p, RULES.salary * passes);
      this.log(`${p.name} qua Xu\u1EA5t ph\xE1t, nh\u1EADn ${formatMoney(RULES.salary * passes)}`, "salary", { id: p.id, amount: RULES.salary * passes });
    }
    p.pos = ((from + steps) % n + n) % n;
    this.log(`${p.name} \u0111\u1EBFn ${BOARD[p.pos].name}`, "move", { id: p.id, from, to: p.pos, steps, mode });
  }
  island(p) {
    p.pos = tileByKey("island").id;
    p.onIsland = true;
    p.island = RULES.islandAttempts;
    p.islandFailedTurns = 0;
    this.s.extra = false;
    this.s.doubles = 0;
    this.log(`${p.name} t\u1EDBi Hoang \u0111\u1EA3o`, "island", { id: p.id });
    this.complete();
  }
  die() {
    return 1 + Math.floor(this.draw() * 6);
  }
  roll(p) {
    check(this.s.phase === "roll");
    this.s.dice = [this.die(), this.die()];
    const [a, b] = this.s.dice;
    this.log(`${p.name} tung ${a} + ${b}`, "roll", { id: p.id, dice: [a, b] });
    if (a === b) this.log(`${p.name} \u0111\u1ED5 \u0111\xF4i`, "doubles", { id: p.id });
    if (p.onIsland) {
      this.s.extra = false;
      if (a === b || (a === 1 && b === 6 || a === 6 && b === 1)) {
        this.s.extra = true;
        this.s.doubles = 1;
        p.onIsland = false;
        p.island = 0;
        p.islandFailedTurns = 0;
        this.move(p, a + b);
        this.land(p);
      } else {
        p.islandFailedTurns++;
        p.island = Math.max(0, RULES.islandAttempts - p.islandFailedTurns);
        this.complete();
      }
      return;
    }
    const bonus = a === b || RULES.oneSixExtraTurn && (a === 1 && b === 6 || a === 6 && b === 1);
    this.s.extra = RULES.doubleExtraTurn && bonus;
    this.s.doubles = bonus ? this.s.doubles + 1 : 0;
    if (RULES.threeDoublesToIsland && this.s.doubles >= RULES.maxDoubles) return this.island(p);
    this.move(p, a + b);
    this.land(p);
  }
  payment(from, to, amount) {
    check(integer(amount));
    const id = `${this.s.matchId}:${++this.s.effectSeq}`;
    return { id, from, to, amount, paid: false, sourceEventId: `event:${this.s.seq}` };
  }
  pay(p, to, amount, after = "complete") {
    check(!this.s.debt, "Kho\u1EA3n n\u1EE3 tr\u01B0\u1EDBc ch\u01B0a x\u1EED l\xFD");
    this.s.payments.push(this.payment(p.id, to, amount));
    this.s.afterPayments = { id: p.id, kind: after };
    this.drainPayments();
  }
  drainPayments() {
    while (this.s.payments.length) {
      const d = this.s.payments[0], p2 = this.player(d.from);
      if (p2.out) {
        this.s.payments.shift();
        continue;
      }
      if (p2.cash < d.amount) {
        const same = this.s.debt?.id === d.id;
        this.s.debt = d;
        if (!same) this.phase("debt", RULES.debtMs);
        return;
      }
      this.debit(p2, d.amount);
      if (d.to && !this.player(d.to).out) this.credit(this.player(d.to), d.amount);
      d.paid = true;
      this.s.paidDebtIds.push(d.id);
      this.s.paidDebtIds = this.s.paidDebtIds.slice(-100);
      this.log(`${p2.name} tr\u1EA3 ${formatMoney(d.amount)} cho ${d.to ? this.player(d.to).name : "ng\xE2n h\xE0ng"}`, "payment", { from: p2.id, to: d.to, amount: d.amount, debtId: d.id });
      this.s.payments.shift();
      this.s.debt = null;
    }
    const after = this.s.afterPayments;
    this.s.afterPayments = null;
    this.s.debt = null;
    if (!after) return this.complete();
    const p = this.player(after.id);
    if (p.out) {
      this.s.extra = false;
      this.next();
      return;
    }
    this.afterPayment(p, after.kind);
  }
  afterPayment(p, after) {
    if (after === "takeover" && this.takeoverAllowed(p.pos, p)) this.phase("takeover");
    else if (after === "destination") this.phase("destination");
    else this.complete();
  }
  settle() {
    check(this.s.debt);
    const p = this.player(this.s.debt.from);
    check(p.cash >= this.s.debt.amount, "Ch\u01B0a \u0111\u1EE7 tr\u1EE9ng thanh to\xE1n");
    this.drainPayments();
  }
  complete() {
    if (this.s.context) this.s.context.takeoverUpgrade = false;
    if (this.s.phase !== "ended") this.phase("complete", Math.max(RULES.autoEndMs, (this.s.movementUntil || 0) - this.now));
  }
  offerTravel(p) {
    if (!this.legalDestinations(p).length || p.cash < RULES.travel) return this.complete();
    this.phase("destination");
  }
  land(p, depth = 0) {
    check(depth < RULES.maxEffectHops, "Chu\u1ED7i hi\u1EC7u \u1EE9ng qu\xE1 d\xE0i");
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
    if (t.tileType === "travel") return this.offerTravel(p);
    if (t.tileType === "festival") {
      this.s.festivalChannel = "championship";
      if (this.festivalTiles(p).length) this.phase("festival");
      else this.complete();
      return;
    }
    if (t.tileType === "tax") return this.pay(p, null, Math.floor(p.cash * RULES.taxRateBps / 1e4));
    if (t.tileType === "chance") return this.card(p, depth);
    this.complete();
  }
  downgrade(i, steps) {
    const a = this.s.properties[i];
    if (!a.owner || a.level === RULES.hotelLevel) return;
    if (a.shieldCharges) {
      a.shieldCharges--;
      this.log(`L\xE1 ch\u1EAFn b\u1EA3o v\u1EC7 ${BOARD[i].name}`, "shield", { tile: i });
      return;
    }
    if (a.level === 0) {
      this.s.properties[i] = emptyProperty();
      this.log(`${BOARD[i].name} tr\u1EDF v\u1EC1 ng\xE2n h\xE0ng`, "liquidate", { tile: i });
      return;
    }
    const oldInvestment = a.investment;
    a.level = Math.max(0, a.level - steps);
    a.investment = BOARD[i].purchasePrice + BOARD[i].constructionCosts.slice(1, a.level + 1).reduce((a2, b) => a2 + b, 0);
    a.resaleBasis = Math.max(BOARD[i].purchasePrice, (a.resaleBasis || oldInvestment) - (oldInvestment - a.investment));
    this.log(`${BOARD[i].name} h\u1EA1 c\xF2n ${a.level} nh\xE0`, "downgrade", { tile: i, level: a.level });
  }
  card(p, depth = 0) {
    const id = this.s.deck.shift(), c = CARDS[id];
    check(c, "B\u1ED9 th\u1EBB kh\xF4ng h\u1EE3p l\u1EC7");
    if (c.type !== "escape") this.s.deck.push(id);
    this.log(c.text, "card", { id: p.id, card: id });
    switch (c.type) {
      case "escape":
        p.escape++;
        return this.complete();
      case "island":
        return this.island(p);
      case "cash":
        if (c.value < 0) return this.pay(p, null, -c.value);
        this.credit(p, c.value);
        return this.complete();
      case "repair":
        return this.pay(p, null, this.s.properties.reduce((n, a) => n + (a.owner === p.id ? a.level * c.value : 0), 0));
      case "festival":
        this.s.festivalChannel = "festival";
        if (this.festivalTiles(p).length) this.phase("festival");
        else this.complete();
        return;
      case "travel":
        return this.offerTravel(p);
      case "earthquake":
      case "shield":
      case "disable":
      case "downgrade":
        this.s.eventChoice = { kind: c.type, value: c.value || 1 };
        if (this.eventTargets(p).length) this.phase("event");
        else {
          this.s.eventChoice = null;
          this.complete();
        }
        return;
      case "birthday":
        this.s.payments = this.active.filter((q) => q.id !== p.id).map((q) => this.payment(q.id, p.id, c.value));
        this.s.afterPayments = { id: p.id, kind: "complete" };
        return this.drainPayments();
      case "back":
        this.move(p, -c.value, "CARD_MOVE");
        return this.land(p, depth + 1);
      case "move": {
        const mode = c.key === "start" ? "GO_TO_START" : "CARD_MOVE";
        this.move(p, (tileByKey(c.key).id - p.pos + BOARD.length) % BOARD.length, mode);
        return this.land(p, depth + 1);
      }
    }
  }
  buy(p, initialLevel = 0) {
    check(this.s.phase === "buy");
    const t = BOARD[p.pos], a = this.s.properties[p.pos];
    check(t.purchasePrice > 0 && !a.owner);
    check(t.tileType === "city" ? RULES.initialBuildChoices.includes(initialLevel) : initialLevel === 0, "C\u1EA5p mua ban \u0111\u1EA7u kh\xF4ng h\u1EE3p l\u1EC7");
    const cost = this.purchaseCost(t.id, initialLevel);
    this.debit(p, cost);
    Object.assign(a, { owner: p.id, level: initialLevel, investment: cost, resaleBasis: cost, lastUpgradeLap: p.laps });
    this.log(`${p.name} mua ${t.name} \xB7 ${initialLevel} nh\xE0`, "purchase", { tile: t.id, id: p.id, level: initialLevel });
    if (initialLevel) this.log(`${t.name} \u0111\xE3 x\xE2y ${initialLevel} nh\xE0`, "build", { tile: t.id, id: p.id, level: initialLevel, initial: true });
    if (!this.checkWin(p)) this.complete();
  }
  build(p, level) {
    check(this.s.phase === "construct");
    const i = p.pos, a = this.s.properties[i];
    check(a.owner === p.id && BOARD[i].tileType === "city");
    check(level === a.level + 1 && level <= this.maxLevel(p, i), "M\u1ED7i l\u1EA7n gh\xE9 ch\u1EC9 n\xE2ng m\u1ED9t c\u1EA5p v\xE0 ph\u1EA3i qua v\xF2ng m\u1EDBi");
    const cost = this.constructionCost(i, level);
    this.debit(p, cost);
    a.level = level;
    a.resaleBasis = (a.resaleBasis || a.investment) + cost;
    a.investment += cost;
    a.lastUpgradeLap = p.laps;
    this.log(`${p.name} x\xE2y ${level === 4 ? "Kh\xE1ch s\u1EA1n" : level + " nh\xE0"} t\u1EA1i ${BOARD[i].name}`, "build", { tile: i, id: p.id, level });
    this.complete();
  }
  takeover(p) {
    check(this.s.phase === "takeover" && this.takeoverAllowed(p.pos, p), "Kh\xE1ch s\u1EA1n, \u0111i\u1EC3m du l\u1ECBch ho\u1EB7c l\xE1 ch\u1EAFn ch\u1EB7n mua l\u1EA1i");
    const i = p.pos, a = this.s.properties[i], owner = a.owner, cost = this.takeoverPrice(i);
    check(!this.player(owner).out);
    this.debit(p, cost);
    this.credit(this.player(owner), cost);
    const disabledRemaining = Math.max(0, a.disabledUntilStartPasses - this.player(owner).laps);
    a.owner = p.id;
    a.resaleBasis = cost;
    a.lastUpgradeLap = p.laps;
    a.disabledUntilStartPasses = p.laps + disabledRemaining;
    if (!RULES.buybackPreserveLevel) {
      a.level = 0;
      a.investment = BOARD[i].purchasePrice;
    }
    this.log(`${p.name} mua l\u1EA1i ${BOARD[i].name}: ${formatMoney(cost)}`, "takeover", { tile: i, id: p.id, previousOwner: owner, amount: cost });
    if (!this.checkWin(p)) {
      this.s.context = { ...this.s.context, tile: i, takeoverUpgrade: true };
      if (a.level < this.maxLevel(p, i)) this.phase("construct");
      else this.complete();
    }
  }
  chooseDestination(p, i) {
    check(this.s.phase === "destination" && this.legalDestinations(p).includes(i), "\u0110i\u1EC3m \u0111\u1EBFn kh\xF4ng h\u1EE3p l\u1EC7");
    this.debit(p, RULES.travel);
    this.log(`${p.name} tr\u1EA3 v\xE9 ${formatMoney(RULES.travel)}`, "payment", { from: p.id, to: null, amount: RULES.travel });
    const steps = BOARD.length - p.pos + i;
    this.s.movementUntil = this.now + steps * RULES.moveStepMs + 1e3;
    this.move(p, steps, "FLIGHT", true);
    this.log(`${p.name} ho\xE0n t\u1EA5t chuy\u1EBFn du l\u1ECBch`, "travel", { id: p.id, to: i });
    this.land(p);
  }
  festival(p, i) {
    check(this.s.phase === "festival" && this.festivalTiles(p).includes(i), "Ch\u1EC9 t\u1ED5 ch\u1EE9c t\u1EA1i th\xE0nh ph\u1ED1 s\u1EDF h\u1EEFu");
    const a = this.s.properties[i];
    if (this.s.festivalChannel === "championship") {
      a.championshipBps = Math.max(a.championshipUntil > this.s.turnCount ? a.championshipBps : 1e4, RULES.festivalMultiplier * 1e4);
      a.championshipUntil = this.s.turnCount + RULES.festivalTurns;
      this.log(`Gi\u1EA3i v\xF4 \u0111\u1ECBch t\u1EA1i ${BOARD[i].name} \xD7${a.championshipBps / 1e4}`, "festival", { tile: i, id: p.id });
      this.complete();
      return;
    }
    a.festival = Math.max(a.festivalUntil > this.s.turnCount ? a.festival : 1, RULES.festivalMultiplier);
    a.festivalUntil = this.s.turnCount + RULES.festivalTurns;
    this.log(`L\u1EC5 h\u1ED9i ${BOARD[i].name} \xD7${a.festival}`, "festival", { tile: i, id: p.id });
    this.complete();
  }
  chooseEvent(p, i) {
    check(this.s.phase === "event" && this.eventTargets(p).includes(i), "M\u1EE5c ti\xEAu th\u1EBB kh\xF4ng h\u1EE3p l\u1EC7");
    const e = this.s.eventChoice, a = this.s.properties[i];
    if (e.kind === "shield") a.shieldCharges += e.value;
    else if (e.kind === "disable") a.disabledUntilStartPasses = this.player(a.owner).laps + e.value;
    else this.downgrade(i, e.value);
    this.log(`\u0110\xE3 \xE1p d\u1EE5ng th\u1EBB t\u1EA1i ${BOARD[i].name}`, "event", { tile: i, id: p.id, kind: e.kind });
    this.s.eventChoice = null;
    if (!this.checkAnyWin()) this.complete();
  }
  resaleValue(i) {
    const a = this.s.properties[i];
    return Math.floor((a.resaleBasis || a.investment) * RULES.resaleRatio);
  }
  liquidate(p, i) {
    check(this.s.phase === "debt" && this.s.debt?.from === p.id, "Ch\u1EC9 thanh l\xFD khi \u0111ang n\u1EE3");
    const a = this.s.properties[this.tile(i).id];
    check(a.owner === p.id, "B\u1EA1n kh\xF4ng s\u1EDF h\u1EEFu \xF4 n\xE0y");
    const amount = this.resaleValue(i);
    this.credit(p, amount);
    this.s.properties[i] = emptyProperty();
    this.log(`${p.name} thanh l\xFD ${BOARD[i].name}: ${formatMoney(amount)}`, "liquidate", { tile: i, id: p.id });
    this.checkAnyWin();
  }
  eliminate(p, forfeit = false) {
    if (p.out) return;
    p.forfeited = forfeit;
    p.out = true;
    p.rank = this.active.length + 1;
    this.log(`${p.name} ${forfeit ? "r\u1EDDi tr\u1EADn" : "ph\xE1 s\u1EA3n"}`, forfeit ? "forfeit" : "bankrupt", { id: p.id });
    if (!forfeit && this.s.debt?.from === p.id && this.s.debt.to && !this.player(this.s.debt.to).out) this.credit(this.player(this.s.debt.to), p.cash);
    this.debit(p, p.cash);
    this.s.properties = this.s.properties.map((a) => a.owner === p.id ? emptyProperty() : a);
    while (p.escape) {
      p.escape--;
      this.s.deck.push(CARDS.findIndex((c) => c.type === "escape"));
    }
    this.s.payments = this.s.payments.filter((d) => d.from !== p.id).map((d) => d.to === p.id ? { ...d, to: null } : d);
    if (this.s.debt?.from === p.id) this.s.debt = null;
    if (this.checkAnyWin()) return;
    if (this.s.payments.length || this.s.afterPayments) this.drainPayments();
    else if (p.id === this.s.turn) {
      this.s.extra = false;
      this.next();
    }
  }
  bankrupt(p) {
    this.eliminate(p, false);
  }
  checkWin(p) {
    if (this.s.phase === "ended") return true;
    if (RULES.victory.side && SIDES.some((side) => side.length && this.ownsGroup(p.id, side))) {
      this.finish(p, "SIDE_MONOPOLY");
      return true;
    }
    if (TRIPLETS.filter((g) => this.ownsGroup(p.id, g)).length >= RULES.victory.tripleSetsRequired) {
      this.finish(p, "TRIPLE_MONOPOLY");
      return true;
    }
    if (RULES.victory.allResorts && TOURISTS.length && this.ownsGroup(p.id, TOURISTS)) {
      this.finish(p, "RESORT_MONOPOLY");
      return true;
    }
    return false;
  }
  checkAnyWin() {
    if (this.s.phase === "ended") return true;
    for (const p of this.active) if (this.checkWin(p)) return true;
    if (this.active.length === 1) {
      const reason = this.s.players.some((p) => p.forfeited) ? "ACCEPT_WINNINGS" : "BANKRUPTCY";
      if (reason === "ACCEPT_WINNINGS" ? RULES.victory.allOthersLeave : RULES.victory.bankruptcy) {
        this.finish(this.active[0], reason);
        return true;
      }
    }
    return false;
  }
  finish(p, reason) {
    const labels = { SIDE_MONOPOLY: "\u0110\u1ED9c quy\u1EC1n m\u1ED9t c\u1EA1nh", TRIPLE_MONOPOLY: "\u0110\u1ED9c quy\u1EC1n 3 b\u1ED9 ba", RESORT_MONOPOLY: "\u0110\u1ED9c quy\u1EC1n du l\u1ECBch", BANKRUPTCY: "C\xE1c \u0111\u1ED1i th\u1EE7 ph\xE1 s\u1EA3n", ACCEPT_WINNINGS: "C\xE1c \u0111\u1ED1i th\u1EE7 r\u1EDDi tr\u1EADn", TIME_LIMIT: "H\u1EBFt gi\u1EDD \xB7 t\u1ED5ng t\xE0i s\u1EA3n cao nh\u1EA5t" };
    this.s.phase = "ended";
    this.s.deadline = 0;
    this.s.ended = this.now;
    this.s.winner = p.id;
    this.s.winReasonCode = reason;
    this.s.winReason = labels[reason] || reason;
    this.s.debt = null;
    this.s.payments = [];
    this.s.afterPayments = null;
    const remaining = this.active.filter((q) => q.id !== p.id).sort((a, b) => this.netWorth(b) - this.netWorth(a) || a.seat - b.seat);
    p.rank = 1;
    remaining.forEach((q, i) => q.rank = i + 2);
    if (!this.player(this.s.host).connected) this.transferHost(this.s.host);
    this.log(`${p.name} chi\u1EBFn th\u1EAFng: ${this.s.winReason}`, "win", { id: p.id, reason });
  }
  beginTurn(p) {
    if (p.onIsland && p.islandFailedTurns >= RULES.islandAttempts) {
      p.onIsland = false;
      p.island = 0;
      p.islandFailedTurns = 0;
      this.log(`${p.name} \u0111\xE3 h\u1EBFt th\u1EDDi gian Hoang \u0111\u1EA3o`, "island-exit", { id: p.id });
    }
    this.phase("roll", RULES.rollMs);
  }
  next() {
    if (this.checkAnyWin()) return;
    this.s.movementUntil = 0;
    const order = this.s.turnOrder.length ? this.s.turnOrder : this.active.map((p) => p.id);
    if (!this.s.extra || this.player(this.s.turn).out) {
      let i = order.indexOf(this.s.turn);
      do {
        i = (i + 1) % order.length;
      } while (this.player(order[i]).out);
      this.s.turn = order[i];
      this.s.doubles = 0;
    }
    this.s.extra = false;
    this.s.context = null;
    this.s.eventChoice = null;
    this.s.turnCount++;
    this.log(`\u0110\u1EBFn l\u01B0\u1EE3t ${this.player(this.s.turn).name}`, "turn", { id: this.s.turn });
    this.beginTurn(this.player(this.s.turn));
  }
  reset() {
    const old = this.s, players = old.players.filter((p) => p.connected || p.bot);
    this.s = createState(old.code);
    this.s.version = old.version;
    this.s.capacity = old.capacity;
    this.s.players = players.map((p) => ({ ...p, cash: RULES.cash, pos: 0, island: 0, onIsland: false, islandFailedTurns: 0, laps: 0, travelPending: false, escape: 0, out: false, forfeited: false, income: 0, expense: 0, rank: 0, ready: p.bot }));
    this.s.host = players.find((p) => p.id === old.host && !p.bot)?.id || players.find((p) => !p.bot)?.id || "";
    this.s.legacySnapshot = old.legacySnapshot;
    if (!this.s.host) this.s.closed = true;
  }
  command(id, c) {
    check(c && typeof c.commandId === "string" && c.commandId.length > 0 && c.commandId.length <= 80 && c.roomId === this.s.code, "L\u1EC7nh kh\xF4ng h\u1EE3p l\u1EC7");
    if (this.s.seen[id]?.includes(c.commandId)) return;
    check(c.expectedVersion === this.s.version, "Tr\u1EA1ng th\xE1i \u0111\xE3 \u0111\u1ED5i, vui l\xF2ng th\u1EED l\u1EA1i");
    check(!this.s.closed, "Ph\xF2ng \u0111\xE3 \u0111\xF3ng");
    const p = this.player(id), v = c.payload || {};
    if (c.type === "leave") {
      if (["lobby", "legacy"].includes(this.s.phase)) this.remove(id);
      else if (this.s.phase !== "ended") {
        p.connected = false;
        p.offline = this.now;
        this.eliminate(p, true);
        this.transferHost(id);
      } else throw Error("Tr\u1EADn \u0111\xE3 k\u1EBFt th\xFAc");
    } else if (["legacy", "ended"].includes(this.s.phase)) {
      check(id === this.s.host && c.type === (this.s.phase === "legacy" ? "newRules" : "rematch"), "Tr\u1EADn \u0111\xE3 k\u1EBFt th\xFAc ho\u1EB7c \u0111ang d\xF9ng lu\u1EADt c\u0169");
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
        this.s.players.forEach((p2) => p2.ready = p2.bot);
      } else if (c.type === "addBot") {
        check(id === this.s.host);
        const bot = this.join("M\xE1y " + (this.s.players.filter((p2) => p2.bot).length + 1));
        bot.bot = true;
        bot.ready = true;
        bot.difficulty = ["random", "heuristic", "rollout"].includes(v.difficulty) ? v.difficulty : "heuristic";
      } else if (c.type === "removeBot") {
        check(id === this.s.host && this.player(v.id).bot);
        this.remove(v.id);
      } else if (c.type === "start") {
        check(id === this.s.host && this.s.players.length >= 2 && this.s.players.every((p2) => p2.ready && p2.connected), "C\u1EA7n 2\u20134 ng\u01B0\u1EDDi v\xE0 t\u1EA5t c\u1EA3 s\u1EB5n s\xE0ng");
        check(new Set(this.s.players.map((p2) => p2.id)).size === this.s.players.length, "Tr\xF9ng ID ng\u01B0\u1EDDi ch\u01A1i");
        validateMap();
        this.s.started = this.now;
        this.s.matchDeadline = RULES.matchMs > 0 ? this.now + RULES.matchMs : 0;
        this.s.turnOrder = RULES.shuffleTurnOrder ? shuffle(this.active.map((p2) => p2.id), () => this.draw()) : this.active.map((p2) => p2.id);
        this.s.deck = shuffle(CARDS.flatMap((c2, i) => Array(c2.weight || 1).fill(i)), () => this.draw());
        this.s.turn = this.s.turnOrder[0];
        this.beginTurn(this.player(this.s.turn));
        this.log("B\u1EAFt \u0111\u1EA7u T\u1EF7 Ph\xFA Mebi \xB7 lu\u1EADt Mebi m\u1EDBi");
      } else throw Error("L\u1EC7nh s\u1EA3nh kh\xF4ng h\u1EE3p l\u1EC7");
    } else {
      check(!p.out && id === (this.s.debt?.from || this.s.turn), "Ch\u01B0a \u0111\u1EBFn l\u01B0\u1EE3t b\u1EA1n");
      if (c.type === "roll") this.roll(p);
      else if (c.type === "buy") this.buy(p, v.initialLevel ?? 0);
      else if (c.type === "construct") this.build(p, v.level);
      else if (c.type === "takeover") this.takeover(p);
      else if (c.type === "destination") this.chooseDestination(p, v.tile);
      else if (c.type === "festival") this.festival(p, v.tile);
      else if (c.type === "event") this.chooseEvent(p, v.tile);
      else if (c.type === "skip") {
        check(["buy", "construct", "takeover", "festival", "event", "destination"].includes(this.s.phase));
        this.s.eventChoice = null;
        this.complete();
      } else if (c.type === "end") {
        check(this.s.phase === "complete");
        this.next();
      } else if (c.type === "bail" || c.type === "escape") {
        check(this.s.phase === "roll" && p.onIsland);
        if (c.type === "bail") this.debit(p, RULES.bail);
        else {
          check(p.escape > 0, "Ch\u01B0a c\xF3 th\u1EBB r\u1EDDi \u0111\u1EA3o");
          p.escape--;
          this.s.deck.push(CARDS.findIndex((c2) => c2.type === "escape"));
        }
        p.onIsland = false;
        p.island = 0;
        p.islandFailedTurns = 0;
      } else if (c.type === "liquidate") this.liquidate(p, v.tile);
      else if (c.type === "settle") {
        check(this.s.phase === "debt");
        this.settle();
      } else if (c.type === "bankrupt") {
        check(this.s.phase === "debt");
        this.bankrupt(p);
      } else throw Error("H\xE0nh \u0111\u1ED9ng kh\xF4ng c\xF3 trong b\u1ED9 lu\u1EADt");
    }
    this.s.version++;
    (this.s.seen[id] ||= []).push(c.commandId);
    this.s.seen[id] = this.s.seen[id].slice(-100);
    if (c.type === "start" && this.recordReplay) {
      const { replayBase, history, legacySnapshot, ...base } = this.s;
      this.s.replayBase = structuredClone({ ...base, history: [] });
      this.s.history = [];
    } else this.remember({ kind: "command", id, command: structuredClone(c), at: this.now });
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
    for (const p of [...this.s.players]) if (!p.bot && !p.connected && p.offline && !p.out && now - p.offline >= (["lobby", "legacy"].includes(this.s.phase) ? 6e4 : 12e4) && (!this.s.allOffline || ["lobby", "legacy"].includes(this.s.phase))) {
      if (["lobby", "legacy"].includes(this.s.phase)) this.remove(p.id);
      else if (this.s.phase !== "ended") this.eliminate(p, true);
      changed = true;
    }
    if (this.s.matchDeadline && now >= this.s.matchDeadline && !["ended", "lobby", "legacy"].includes(this.s.phase) && this.active.length) {
      this.finish([...this.active].sort((a, b) => this.netWorth(b) - this.netWorth(a) || a.seat - b.seat)[0], "TIME_LIMIT");
      changed = true;
    }
    if (this.s.deadline && now >= this.s.deadline && !["ended", "lobby", "legacy"].includes(this.s.phase)) {
      changed = true;
      const p = this.player(this.s.debt?.from || this.s.turn);
      if (this.s.phase === "roll") this.roll(p);
      else if (this.s.phase === "complete") this.next();
      else if (this.s.phase === "debt") {
        for (const t of BOARD) {
          if (p.cash >= this.s.debt.amount) break;
          if (this.s.properties[t.id].owner === p.id) this.liquidate(p, t.id);
        }
        if (p.cash >= this.s.debt.amount) this.settle();
        else this.bankrupt(p);
      } else {
        this.s.eventChoice = null;
        this.complete();
      }
    }
    if (changed) {
      this.s.version++;
      this.remember({ kind: "tick", at: this.now });
    }
    return changed;
  }
  botStep() {
    const p = this.s.players.find((p2) => p2.id === (this.s.debt?.from || this.s.turn));
    if (this.s.closed || this.now < (this.s.movementUntil || 0) || !p?.bot || ["lobby", "legacy", "ended"].includes(this.s.phase)) return false;
    const action = chooseBotAction(snapshot(this.s), p.id, p.difficulty);
    this.command(p.id, { ...action, commandId: `bot:${this.s.version}`, roomId: this.s.code, expectedVersion: this.s.version });
    return true;
  }
};
function execute(state, id, command, now = Date.now(), rng) {
  const e = new Engine(structuredClone(state), rng, now);
  e.command(id, command);
  return e.s;
}
function exportReplay(s) {
  check(s.phase === "ended" && s.replayBase, "Ch\u1EC9 t\u1EA3i replay sau khi tr\u1EADn k\u1EBFt th\xFAc");
  const base = structuredClone(s.replayBase);
  base.players = base.players.map(({ token, ...p }) => ({ ...p, token: "" }));
  return { ruleset: RULESET, mapVersion: MAP_VERSION, base, history: structuredClone(s.history), final: snapshot(s) };
}
function replayGame(replay) {
  check(replay.ruleset === RULESET && replay.mapVersion === MAP_VERSION, "Replay kh\xF4ng \u0111\xFAng phi\xEAn b\u1EA3n");
  const e = new Engine(structuredClone(replay.base));
  e.s.replayBase = structuredClone(replay.base);
  for (const h of replay.history) {
    e.now = h.at;
    if (h.kind === "command") e.command(h.id, { ...h.command, expectedVersion: e.s.version });
    else if (h.kind === "tick") e.tick(h.at);
    else if (h.kind === "disconnect") e.disconnect(h.id);
    else {
      const p = e.player(h.id);
      p.connected = true;
      p.offline = 0;
      e.s.allOffline = 0;
      if (!e.s.players.find((q) => q.id === e.s.host)?.connected && e.s.phase === "ended") e.s.host = p.id;
      e.s.version++;
    }
  }
  return e.s;
}

// mebi-monopoly/storage.ts
var CHUNK = 10;
async function readRoom(storage) {
  const stored = await storage.get("room");
  if (!stored) return stored;
  const { replayChunks, ...state } = stored;
  if (replayChunks) {
    state.history = [];
    for (let i = 0; i < replayChunks.count; i++) {
      const chunk = await storage.get(`replay:${replayChunks.matchId}:${i}`);
      if (!chunk) throw Error("Missing replay chunk");
      state.history.push(...chunk);
    }
  }
  return state;
}
async function writeRoom(storage, state) {
  const save = async (tx) => {
    const previous = await tx.get("room"), old = previous?.replayChunks, history = state.history || [], count = Math.ceil(history.length / CHUNK);
    const same = old?.matchId === state.matchId && old.length <= history.length;
    for (let i = same ? Math.floor(old.length / CHUNK) : 0; i < count; i++) await tx.put(`replay:${state.matchId}:${i}`, history.slice(i * CHUNK, (i + 1) * CHUNK));
    if (old && (!same || old.count > count)) for (let i = same ? count : 0; i < old.count; i++) await tx.delete?.(`replay:${old.matchId}:${i}`);
    await tx.put("room", { ...state, history: [], replayChunks: { matchId: state.matchId, count, length: history.length } });
  };
  if (storage.transaction) await storage.transaction(save);
  else await save(storage);
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
    if (message.type === "replay") {
      peer.send(JSON.stringify({ type: "replay", replay: exportReplay(this.state) }));
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
    const timed = engine.tick(), bot = engine.botStep();
    if (timed || bot) {
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
  TRIPLETS,
  chooseBotAction,
  createState,
  execute,
  exportReplay,
  readRoom,
  replayGame,
  snapshot,
  tileByKey,
  upgradeState,
  validateMap,
  writeRoom
};
