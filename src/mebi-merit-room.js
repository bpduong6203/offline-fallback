// ===== Gieo quẻ cầu may: toàn bộ bảng tỉ lệ nằm ở đây, server là nơi duy nhất quyết định kết quả =====
const FORTUNE_STAKE = 5;
const FORTUNE_COOLDOWN_MS = 2000;
// chance = số ô trên thang 1..100; payout = tổng điểm nhận về (đã gồm lại vốn)
const FORTUNE_TIERS = [
  { prize: 'Giải 1', name: 'Đại Cát', hex: 'Quẻ Càn', meaning: 'Số 108 viên mãn', chance: 1, payout: 108 },
  { prize: 'Giải 2', name: 'Thượng Cát', hex: 'Quẻ Đoài', meaning: '64 quẻ Kinh Dịch', chance: 2, payout: 64 },
  { prize: 'Giải 3', name: 'Trung Cát', hex: 'Quẻ Ly', meaning: '36 thiên cang', chance: 3, payout: 36 },
  { prize: 'Giải 4', name: 'Tiểu Cát', hex: 'Quẻ Chấn', meaning: '', chance: 5, payout: 23 },
  { prize: 'Giải 5', name: 'Bình Cát', hex: 'Quẻ Tốn', meaning: '', chance: 8, payout: 18 },
  { prize: 'Giải 6', name: 'Cát', hex: 'Quẻ Khảm', meaning: '', chance: 15, payout: 13 },
  { prize: 'Giải 7', name: 'Cát', hex: 'Quẻ Cấn', meaning: '', chance: 22, payout: 9 },
  { prize: 'Giải 8', name: 'Phổ thông', hex: 'Quẻ Khôn', meaning: '', chance: 29, payout: 8 },
  { prize: 'Quẻ HUNG', name: 'Hung', hex: 'Quẻ Bĩ', meaning: 'Mất toàn bộ vốn', chance: 15, payout: 0 },
];
(() => { // kiểm tra lúc nạp module: bảng phải đủ đúng 100 ô
  const total = FORTUNE_TIERS.reduce((sum, tier) => sum + tier.chance, 0);
  if (total !== 100) throw new Error('FORTUNE_TIERS phải có tổng 100 ô, hiện là ' + total);
})();
function fortuneTierForRoll(roll) {
  let upper = 0;
  for (const tier of FORTUNE_TIERS) {
    upper += tier.chance;
    if (roll <= upper) return tier;
  }
  return FORTUNE_TIERS[FORTUNE_TIERS.length - 1];
}
function rollPercent() { // đồng đều 1..100, loại bỏ lệch modulo
  const buffer = new Uint32Array(1);
  const limit = Math.floor(0x100000000 / 100) * 100;
  do crypto.getRandomValues(buffer); while (buffer[0] >= limit);
  return buffer[0] % 100 + 1;
}

export class MebiMeritProfile {
  constructor(ctx) {
    this.ctx = ctx;
    ctx.storage.sql.exec(`
      CREATE TABLE IF NOT EXISTS merit_balance (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        balance INTEGER NOT NULL DEFAULT 0,
        legacy_imported INTEGER NOT NULL DEFAULT 0
      );
      INSERT OR IGNORE INTO merit_balance (id, balance, legacy_imported) VALUES (1, 0, 0);
      CREATE TABLE IF NOT EXISTS merit_transactions (
        transaction_id TEXT PRIMARY KEY,
        delta INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS merit_reward_cooldowns (
        action TEXT PRIMARY KEY,
        awarded_at INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS merit_debt (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        debt INTEGER NOT NULL DEFAULT 0 CHECK (debt >= 0 AND debt <= 10000)
      );
      INSERT OR IGNORE INTO merit_debt (id, debt) VALUES (1, 0);
      CREATE TABLE IF NOT EXISTS merit_fortune (
        request_id TEXT PRIMARY KEY,
        roll INTEGER NOT NULL,
        created_at INTEGER NOT NULL
      );
    `);
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/reward') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
      let body;
      try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
      const rewards = { bow: { amount: 1, cooldownMs: 5000 }, incense: { amount: 2, cooldownMs: 60000 }, mallet: { amount: 1, cooldownMs: 2000 } };
      const reward = rewards[body?.action];
      if (!reward) return Response.json({ error: 'Unknown reward action' }, { status: 400 });
      return this.ctx.storage.transactionSync(() => {
        const now = Date.now();
        const previous = this.ctx.storage.sql.exec('SELECT awarded_at FROM merit_reward_cooldowns WHERE action = ?', body.action).toArray()[0];
        const retryAfterMs = previous ? reward.cooldownMs - (now - previous.awarded_at) : 0;
        if (retryAfterMs > 0) return Response.json({ ...this.balanceData(), rewarded: false, amount: 0, retryAfterMs }, { headers: { 'Cache-Control': 'no-store' } });
        this.ctx.storage.sql.exec('INSERT INTO merit_reward_cooldowns (action, awarded_at) VALUES (?, ?) ON CONFLICT(action) DO UPDATE SET awarded_at = excluded.awarded_at', body.action, now);
        const debt = this.ctx.storage.sql.exec('SELECT debt FROM merit_debt WHERE id = 1').toArray()[0].debt;
        const repaid = Math.min(reward.amount, debt);
        this.ctx.storage.sql.exec('UPDATE merit_debt SET debt = debt - ? WHERE id = 1', repaid);
        this.ctx.storage.sql.exec('UPDATE merit_balance SET balance = balance + ?, legacy_imported = 1 WHERE id = 1', reward.amount - repaid);
        return Response.json({ ...this.balanceData(), rewarded: true, amount: reward.amount, retryAfterMs: 0 }, { headers: { 'Cache-Control': 'no-store' } });
      });
    }
    if (url.pathname === '/fortune') {
      if (request.method === 'GET') {
        return Response.json({
          stake: FORTUNE_STAKE,
          tiers: FORTUNE_TIERS.map(tier => ({ ...tier, net: tier.payout - FORTUNE_STAKE }))
        }, { headers: { 'Cache-Control': 'no-store' } });
      }
      if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, POST' } });
      let body;
      try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
      return this.castFortune(body?.requestId);
    }
    if (url.pathname !== '/balance') return new Response('Not Found', { status: 404 });
    if (request.method === 'GET') return this.readBalance();
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, POST' } });

    let body;
    try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
    if(body?.action==='borrow')return this.borrow(body.requestId);
    if(body?.action==='repay')return this.repay(body.requestId,body.principal);
    const delta = Number(body?.delta);
    if (!Number.isSafeInteger(delta) || Math.abs(delta) > 100000) {
      return Response.json({ error: 'Invalid point change' }, { status: 400 });
    }
    if (delta > 0 && body.legacyImport !== true && !body.transactionId) {
      return Response.json({ error: 'Positive balance changes must use a server-verified reward' }, { status: 403 });
    }

    // Only internal game calls use this branch. Persist the balance and receipt
    // atomically so a room can safely retry after a crash or a lost response.
    if(body.transactionId){
      if(typeof body.transactionId!=='string'||body.transactionId.length>180)return Response.json({error:'Invalid transaction'},{status:400});
      return this.ctx.storage.transactionSync(()=>{
        const receipt=this.ctx.storage.sql.exec('SELECT delta FROM merit_transactions WHERE transaction_id = ?',body.transactionId).toArray()[0];
        if(receipt)return receipt.delta===delta?this.readBalance():Response.json({error:'Transaction conflict'},{status:400});
        const row=this.ctx.storage.sql.exec('SELECT balance FROM merit_balance WHERE id = 1').toArray()[0];
        if(delta<0&&row.balance < -delta)return Response.json({error:'Insufficient merit'},{status:409});
        this.ctx.storage.sql.exec('UPDATE merit_balance SET balance = balance + ?, legacy_imported = 1 WHERE id = 1',delta);
        this.ctx.storage.sql.exec('INSERT INTO merit_transactions (transaction_id, delta) VALUES (?, ?)',body.transactionId,delta);
        return this.readBalance();
      });
    }

    if (body.legacyImport === true) {
      if (delta < 0) return Response.json({ error: 'Invalid legacy balance' }, { status: 400 });
      this.ctx.storage.sql.exec('UPDATE merit_balance SET balance = balance + ?, legacy_imported = 1 WHERE id = 1 AND legacy_imported = 0', delta);
    } else {
      this.ctx.storage.sql.exec('UPDATE merit_balance SET balance = MAX(0, balance + ?), legacy_imported = 1 WHERE id = 1',delta);
    }
    return this.readBalance();
  }

  fortuneResult(roll) {
    const tier = fortuneTierForRoll(roll);
    return { roll, prize: tier.prize, name: tier.name, hex: tier.hex, meaning: tier.meaning, stake: FORTUNE_STAKE, payout: tier.payout, net: tier.payout - FORTUNE_STAKE };
  }

  castFortune(requestId) {
    if (typeof requestId !== 'string' || !/^[a-zA-Z0-9-]{16,80}$/.test(requestId)) return Response.json({ error: 'Mã gieo quẻ không hợp lệ.' }, { status: 400 });
    return this.ctx.storage.transactionSync(() => {
      const sql = this.ctx.storage.sql, now = Date.now();
      // Gửi lại cùng requestId (mất mạng giữa chừng) thì trả đúng kết quả cũ, không trừ tiền lần nữa.
      const done = sql.exec('SELECT roll FROM merit_fortune WHERE request_id = ?', requestId).toArray()[0];
      if (done) return Response.json({ ...this.balanceData(), fortune: this.fortuneResult(done.roll), replayed: true }, { headers: { 'Cache-Control': 'no-store' } });
      const previous = sql.exec("SELECT awarded_at FROM merit_reward_cooldowns WHERE action = 'fortune'").toArray()[0];
      const retryAfterMs = previous ? FORTUNE_COOLDOWN_MS - (now - previous.awarded_at) : 0;
      if (retryAfterMs > 0) return Response.json({ error: 'Gieo chậm lại một chút.', retryAfterMs }, { status: 429, headers: { 'Cache-Control': 'no-store' } });
      const row = sql.exec('SELECT balance FROM merit_balance WHERE id = 1').toArray()[0];
      if ((row?.balance || 0) < FORTUNE_STAKE) return Response.json({ error: 'Cần ít nhất ' + FORTUNE_STAKE + ' công đức để gieo quẻ.' }, { status: 409 });
      const roll = rollPercent(), result = this.fortuneResult(roll);
      sql.exec('UPDATE merit_balance SET balance = balance + ?, legacy_imported = 1 WHERE id = 1', result.net);
      sql.exec('INSERT INTO merit_fortune (request_id, roll, created_at) VALUES (?, ?, ?)', requestId, roll, now);
      sql.exec('DELETE FROM merit_fortune WHERE created_at < ?', now - 86400000);
      sql.exec("INSERT INTO merit_reward_cooldowns (action, awarded_at) VALUES ('fortune', ?) ON CONFLICT(action) DO UPDATE SET awarded_at = excluded.awarded_at", now);
      return Response.json({ ...this.balanceData(), fortune: result, replayed: false }, { headers: { 'Cache-Control': 'no-store' } });
    });
  }

  borrow(requestId){
    if(typeof requestId!=='string'||!/^[a-zA-Z0-9-]{16,80}$/.test(requestId))return Response.json({error:'Mã giao dịch vay không hợp lệ'},{status:400});
    return this.ctx.storage.transactionSync(()=>{
      const key='loan:'+requestId;
      if(this.ctx.storage.sql.exec('SELECT delta FROM merit_transactions WHERE transaction_id = ?',key).toArray().length)return this.readBalance();
      const debt=this.ctx.storage.sql.exec('SELECT debt FROM merit_debt WHERE id = 1').toArray()[0].debt;
      if(debt+100>10000)return Response.json({error:'Dư nợ tối đa 10.000 công đức. Hãy sang Chùa làm công đức để trả nợ.'},{status:409});
      this.ctx.storage.sql.exec('UPDATE merit_balance SET balance = balance + 100, legacy_imported = 1 WHERE id = 1');
      this.ctx.storage.sql.exec('UPDATE merit_debt SET debt = debt + 100 WHERE id = 1');
      this.ctx.storage.sql.exec('INSERT INTO merit_transactions (transaction_id, delta) VALUES (?, ?)',key,100);
      return this.readBalance();
    });
  }

  repay(requestId,principal){
    if(typeof requestId!=='string'||!/^[a-zA-Z0-9-]{16,80}$/.test(requestId)||!Number.isSafeInteger(principal)||principal<1||principal>10000)return Response.json({error:'Thông tin trả nợ không hợp lệ.'},{status:400});
    // Integer arithmetic: ceil(principal * 1.4), including debts reduced by temple rewards.
    const cost=Math.ceil(principal*14/10),key='repay:'+requestId;
    return this.ctx.storage.transactionSync(()=>{
      const receipt=this.ctx.storage.sql.exec('SELECT delta FROM merit_transactions WHERE transaction_id = ?',key).toArray()[0];
      if(receipt)return receipt.delta===-cost?this.readBalance():Response.json({error:'Mã trả nợ đã được dùng cho khoản khác.'},{status:409});
      const data=this.balanceData();
      if(data.debt<principal)return Response.json({error:'Số công đức gốc muốn trả vượt quá dư nợ hiện tại.'},{status:409});
      if(data.balance<cost)return Response.json({error:'Không đủ công đức để trả cả gốc và lãi.'},{status:409});
      this.ctx.storage.sql.exec('UPDATE merit_balance SET balance = balance - ?, legacy_imported = 1 WHERE id = 1',cost);
      this.ctx.storage.sql.exec('UPDATE merit_debt SET debt = debt - ? WHERE id = 1',principal);
      this.ctx.storage.sql.exec('INSERT INTO merit_transactions (transaction_id, delta) VALUES (?, ?)',key,-cost);
      return this.readBalance();
    });
  }

  balanceData() {
    const row = this.ctx.storage.sql.exec('SELECT balance, legacy_imported FROM merit_balance WHERE id = 1').toArray()[0];
    const debt=this.ctx.storage.sql.exec('SELECT debt FROM merit_debt WHERE id = 1').toArray()[0]?.debt||0;
    return { balance: row?.balance || 0, debt, netBalance:(row?.balance||0)-debt, canImportLegacy: !row?.legacy_imported };
  }

  readBalance() {
    return Response.json(this.balanceData(), {headers:{'Cache-Control':'no-store'}});
  }
}
