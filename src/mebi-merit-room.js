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
    `);
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/reward') {
      if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'POST' } });
      let body;
      try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
      const rewards = { bow: { amount: 1, cooldownMs: 5000 }, incense: { amount: 2, cooldownMs: 60000 }, mallet: { amount: 1, cooldownMs: 5000 } };
      const reward = rewards[body?.action];
      if (!reward) return Response.json({ error: 'Unknown reward action' }, { status: 400 });
      return this.ctx.storage.transactionSync(() => {
        const now = Date.now();
        const previous = this.ctx.storage.sql.exec('SELECT awarded_at FROM merit_reward_cooldowns WHERE action = ?', body.action).toArray()[0];
        const retryAfterMs = previous ? reward.cooldownMs - (now - previous.awarded_at) : 0;
        const balance = this.ctx.storage.sql.exec('SELECT balance FROM merit_balance WHERE id = 1').toArray()[0]?.balance || 0;
        if (retryAfterMs > 0) return Response.json({ balance, rewarded: false, amount: 0, retryAfterMs }, { headers: { 'Cache-Control': 'no-store' } });
        this.ctx.storage.sql.exec('INSERT INTO merit_reward_cooldowns (action, awarded_at) VALUES (?, ?) ON CONFLICT(action) DO UPDATE SET awarded_at = excluded.awarded_at', body.action, now);
        this.ctx.storage.sql.exec('UPDATE merit_balance SET balance = balance + ?, legacy_imported = 1 WHERE id = 1', reward.amount);
        const nextBalance = this.ctx.storage.sql.exec('SELECT balance FROM merit_balance WHERE id = 1').toArray()[0]?.balance || 0;
        return Response.json({ balance: nextBalance, rewarded: true, amount: reward.amount, retryAfterMs: 0 }, { headers: { 'Cache-Control': 'no-store' } });
      });
    }
    if (url.pathname !== '/balance') return new Response('Not Found', { status: 404 });
    if (request.method === 'GET') return this.readBalance();
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, POST' } });

    let body;
    try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
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
      this.ctx.storage.sql.exec('UPDATE merit_balance SET balance = MAX(0, balance + ?), legacy_imported = 1 WHERE id = 1', delta);
    }
    return this.readBalance();
  }

  readBalance() {
    const row = this.ctx.storage.sql.exec('SELECT balance, legacy_imported FROM merit_balance WHERE id = 1').toArray()[0];
    return Response.json({ balance: row?.balance || 0, canImportLegacy: !row?.legacy_imported }, { headers: { 'Cache-Control': 'no-store' } });
  }
}
