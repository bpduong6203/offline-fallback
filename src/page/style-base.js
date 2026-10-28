// Lưu ý: nội dung nằm trong template literal nên KHÔNG dùng backtick, dấu đô-la + ngoặc nhọn
// hay dấu gạch chéo ngược trong phần chuỗi này.
export const styleBase = `  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    [hidden] { display: none !important; }
    body {
      font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%);
      color: #334155;
      min-height: 100vh;
      display: flex; align-items: center; justify-content: center;
      padding: 20px;
      -webkit-user-select: none; user-select: none;
    }
    input, button { font-family: inherit; }
    input { -webkit-user-select: text; user-select: text; }
    .card {
      background: #fff;
      border-radius: 28px;
      padding: 28px 24px;
      max-width: 520px; width: 100%;
      text-align: center;
      box-shadow: 20px 20px 60px #e6d3be, -20px -20px 60px #ffffff;
      border: 1px solid rgba(255, 237, 213, 0.8);
    }
    .card[data-w="motorways"] { max-width: 1800px; width: calc(100vw - 32px); }
    .card[data-w="motorways"] .sub { display: none; }
    .domain-badge {
      display: inline-block;
      background: #fff7ed; color: #ea580c;
      padding: 6px 16px; border-radius: 9999px;
      font-size: 0.8rem; font-weight: 600;
      margin-bottom: 12px; word-break: break-all;
      box-shadow: inset 3px 3px 6px #e6d3be, inset -3px -3px 6px #ffffff;
    }
    h1 { font-size: 1.35rem; color: #1e293b; margin-bottom: 8px; }
    p.sub { color: #64748b; font-size: 0.9rem; line-height: 1.5; margin-bottom: 14px; }
    .tabs { display: flex; gap: 8px; justify-content: center; margin-bottom: 12px; }
    .tab {
      text-decoration: none;
      padding: 8px 16px; border-radius: 9999px; border: none;
      font-weight: 600; font-size: 0.85rem; cursor: pointer;
      background: #fff7ed; color: #9a3412;
      box-shadow: inset 2px 2px 5px #e6d3be, inset -2px -2px 5px #ffffff;
    }
    .tab.on {
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: #fff; box-shadow: 0 6px 14px -4px rgba(249, 115, 22, 0.5);
    }
    .game {
      background: #fff7ed; border-radius: 18px; padding: 8px;
      box-shadow: inset 6px 6px 12px #e6d3be, inset -6px -6px 12px #ffffff;
      margin-bottom: 12px;
    }
    canvas { width: 100%; height: auto; display: block; touch-action: none; cursor: pointer; border-radius: 12px; }
    #motorwaysFrame { width: 100%; height: min(82vh, 1000px); min-height: 420px; display: block; border: 0; border-radius: 12px; background: #292e37; }
    #motorwaysFrame[hidden] { display: none; }
    @media (max-width: 600px) { .card[data-w="motorways"] { width: calc(100vw - 16px); padding: 14px 10px; } #motorwaysFrame { height: 72vh; min-height: 360px; } }
    .poolui { margin-bottom: 12px; }
    .row { display: flex; gap: 8px; margin-bottom: 8px; }
    .mini {
      flex: 1; padding: 10px 12px; border-radius: 12px; border: none;
      font-weight: 600; font-size: 0.85rem; cursor: pointer;
      background: #ffedd5; color: #9a3412;
    }
    .mini:hover { background: #fed7aa; }
    #pCode, #cCode, #sCode, #wCode {
      flex: 1; min-width: 0; padding: 10px 12px; border-radius: 12px;
      border: 2px solid #fed7aa; text-align: center; font-weight: 700;
      letter-spacing: 0.2em; text-transform: uppercase; font-size: 0.9rem;
      color: #9a3412; background: #fff;
    }
    .tabs { flex-wrap: wrap; }
    .pmsg { font-size: 0.82rem; color: #9a3412; font-weight: 600; min-height: 1.2em; }
    .hint { font-size: 0.78rem; color: #94a3b8; margin-bottom: 14px; }
    .status { font-size: 0.8rem; color: #ea580c; font-weight: 600; margin-bottom: 14px; }
    .btn {
      display: inline-flex; align-items: center; justify-content: center;
      width: 100%; padding: 13px 24px; border-radius: 14px;
      font-weight: 600; font-size: 0.95rem; cursor: pointer; border: none;
      background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
      color: #fff; box-shadow: 0 10px 20px -5px rgba(249, 115, 22, 0.4);
      transition: all 0.2s ease;
    }
    .btn:hover { transform: translateY(-2px); box-shadow: 0 14px 24px -5px rgba(249, 115, 22, 0.6); }
    .btn:active { transform: translateY(0); }

`;
