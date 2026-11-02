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
    `);
  }

  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname !== '/balance') return new Response('Not Found', { status: 404 });
    if (request.method === 'GET') return this.readBalance();
    if (request.method !== 'POST') return new Response('Method Not Allowed', { status: 405, headers: { Allow: 'GET, POST' } });

    let body;
    try { body = await request.json(); } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }); }
    const delta = Number(body?.delta);
    if (!Number.isSafeInteger(delta) || Math.abs(delta) > 100000) {
      return Response.json({ error: 'Invalid point change' }, { status: 400 });
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
