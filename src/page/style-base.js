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
      max-width: 1120px; width: 100%;
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
      border: 0; font-family: inherit; line-height: inherit; cursor: pointer;
      text-decoration: none;
    }
    .login-overlay { position: fixed; inset: 0; z-index: 1000; display: grid; place-items: center; padding: 18px; background: rgba(15, 23, 42, 0.48); }
    .login-panel { position: relative; width: min(100%, 380px); padding: 26px 22px 18px; border: 1px solid #ffedd5; border-radius: 22px; background: #fff; text-align: left; box-shadow: 0 24px 70px rgba(51, 29, 15, 0.25); }
    .login-panel h2 { margin: 0 28px 6px 0; color: #1e293b; font-size: 1.3rem; }
    .login-panel p { margin: 0 0 18px; color: #64748b; font-size: 0.88rem; line-height: 1.45; }
    .login-panel label { display: block; margin: 12px 0 5px; color: #475569; font-size: 0.8rem; font-weight: 700; }
    .login-panel input { width: 100%; padding: 11px 12px; border: 1px solid #fed7aa; border-radius: 11px; color: #334155; background: #fffaf5; outline: none; }
    .login-panel input:focus { border-color: #fb923c; box-shadow: 0 0 0 3px rgba(251, 146, 60, 0.16); }
    .login-close { position: absolute; top: 10px; right: 12px; width: 34px; height: 34px; border: 0; border-radius: 10px; color: #64748b; background: transparent; font-size: 1.5rem; cursor: pointer; }
    .login-submit { width: 100%; margin-top: 16px; }
    .login-message { min-height: 1.25em; margin-top: 10px; }
    h1 { font-size: 1.35rem; color: #1e293b; margin-bottom: 8px; }
    p.sub { color: #64748b; font-size: 0.9rem; line-height: 1.5; margin-bottom: 14px; }
    .game-library { margin: 18px auto 16px; padding: 12px 14px 5px; border: 1px solid #ffedd5; border-radius: 18px; background: #fffaf5; box-shadow: inset 3px 3px 8px #f1dfcd, inset -3px -3px 8px #ffffff; }
    .back-to-library { display: inline-flex; margin: 0 auto 14px; padding: 8px 14px; border-radius: 10px; background: #fff7ed; color: #9a3412; font-size: 0.85rem; font-weight: 700; text-decoration: none; }
    .back-to-library:hover { background: #ffedd5; }
    .library-heading { display: flex; justify-content: space-between; align-items: center; gap: 12px; margin: 0 2px 8px; color: #9a3412; font-size: 0.72rem; letter-spacing: 0.08em; }
    .library-heading span { color: #94a3b8; font-size: 0.72rem; font-weight: 500; letter-spacing: 0; }
    .tabs { display: grid; grid-template-columns: repeat(auto-fit, minmax(190px, 1fr)); gap: 10px; margin-bottom: 0; padding: 2px 2px 9px; }
    .tab {
      display: flex; align-items: center; text-align: left; gap: 10px; min-width: 0; min-height: 68px;
      text-decoration: none;
      padding: 10px 12px; border-radius: 14px; border: 1px solid #ffedd5;
      font-weight: 600; font-size: 0.85rem; cursor: pointer;
      background: #fff7ed; color: #9a3412;
      box-shadow: 0 2px 5px rgba(154, 52, 18, 0.06);
    }
    .tab:hover { background: #ffedd5; transform: translateY(-2px); box-shadow: 0 8px 16px rgba(154, 52, 18, 0.1); }
    .tab > span:nth-child(2) { display: flex; flex-direction: column; gap: 3px; min-width: 0; }
    .tab b { font-size: 0.84rem; line-height: 1.2; }
    .tab small { color: #94a3b8; font-size: 0.7rem; font-weight: 500; line-height: 1.25; }
    .game-icon { display: grid; place-items: center; flex: 0 0 40px; height: 40px; border-radius: 12px; background: #ffedd5; font-size: 1.35rem; }
    .launch-icon { margin-left: auto; color: #c2410c; font-size: 0.8rem; }
    .tab-link { background: #fff7ed; color: #9a3412; }
    .tab:focus-visible { outline: 3px solid #fb923c; outline-offset: 2px; }
    .tab.on { background: linear-gradient(135deg, #fff7ed 0%, #ffedd5 100%); color: #9a3412; border-color: #fb923c; box-shadow: 0 0 0 2px rgba(249, 115, 22, 0.18); }
    .tab.on .game-icon { background: #fed7aa; }
    .game {
      background: #fff7ed; border-radius: 18px; padding: 8px;
      box-shadow: inset 6px 6px 12px #e6d3be, inset -6px -6px 12px #ffffff;
      max-width: 900px; margin: 0 auto 12px;
    }
    .card[data-w="motorways"] .game, .card[data-w="bangbang"] .game { max-width: none; }
    canvas { width: 100%; height: auto; display: block; touch-action: none; cursor: pointer; border-radius: 12px; }
    #motorwaysFrame { width: 100%; height: min(82vh, 1000px); min-height: 420px; display: block; border: 0; border-radius: 12px; background: #292e37; }
    #motorwaysFrame[hidden] { display: none; }
    #busEscapeFrame { width: 100%; height: min(82vh, 700px); min-height: 420px; display: block; border: 0; border-radius: 12px; background: #0f1218; }
    #busEscapeFrame[hidden] { display: none; }
    #bangBangFrame { width: 100%; height: min(90vh, 960px); min-height: 620px; display: block; border: 0; border-radius: 12px; background: #101722; }
    #bangBangFrame[hidden] { display: none; }
    @media (max-width: 600px) { .card { padding: 18px 12px; } .card[data-w="motorways"] { width: calc(100vw - 16px); padding: 14px 10px; } .game-library { padding: 10px 9px 3px; } .library-heading { font-size: 0.68rem; } .library-heading span { font-size: 0.68rem; } .tabs { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 8px; } .tab { min-height: 66px; padding: 8px; gap: 7px; font-size: 0.78rem; } .game-icon { flex-basis: 34px; height: 34px; font-size: 1.15rem; } .tab b { font-size: 0.75rem; } .tab small { font-size: 0.62rem; } #motorwaysFrame { height: 72vh; min-height: 360px; } #busEscapeFrame { height: 72vh; min-height: 360px; } #bangBangFrame { height: 86vh; min-height: 660px; } }
    /* Spacious Liquid Glass game launcher, only on game.mebidev.site. */
    body.game-home {
      --glass-line: rgba(255,255,255,.68);
      min-height: 100svh; display: block; padding: clamp(22px, 5vw, 72px);
      color: #172033;
      background:
        radial-gradient(ellipse at 12% 5%, rgba(255,255,255,.96), transparent 36%),
        radial-gradient(ellipse at 92% 16%, rgba(190,220,255,.68), transparent 34%),
        linear-gradient(145deg,#eff5ff 0%,#f6f7fb 48%,#e9eef9 100%);
    }
    .game-home .card {
      width: min(100%, 1500px); max-width: none; margin: 0 auto; padding: 0;
      overflow: visible; text-align: left; background: transparent; border: 0;
      border-radius: 0; box-shadow: none;
    }
    .game-home .domain-badge, .game-home #homeStatus { display: none !important; }
    .game-home #homeTitle { margin: 0 0 8px; color: #172033; font-size: clamp(2rem, 4vw, 3.2rem); font-weight: 800; letter-spacing: -.045em; }
    .game-home #homeIntro { margin: 0; color: #667085; font-size: 1rem; }
    .game-home .game-library {
      margin: clamp(28px, 5vw, 64px) 0 0; padding: 0; border: 0;
      border-radius: 0; background: transparent; box-shadow: none;
    }
    .game-home .library-heading {
      margin: 0 0 24px; color: #344054; font-size: .8rem;
      letter-spacing: .14em; text-transform: uppercase;
    }
    .game-home .library-heading span { color: #8992a3; font-size: .9rem; }
    .game-home .tabs {
      grid-template-columns: repeat(auto-fill, minmax(132px, 1fr));
      gap: clamp(18px, 2.8vw, 38px) clamp(12px, 2vw, 24px);
      margin: 0; padding: 0;
    }
    .game-home .tab {
      min-width: 0; min-height: 0; padding: 14px 10px 16px; gap: 11px;
      flex-direction: column; justify-content: flex-start; text-align: center;
      border: 1px solid transparent; border-radius: 24px;
      color: #252d3c; background: transparent; box-shadow: none;
      transition: transform .22s ease, background .22s ease, border-color .22s ease, box-shadow .22s ease;
    }
    .game-home .tab:hover {
      transform: translateY(-4px); background: rgba(255,255,255,.42);
      border-color: rgba(255,255,255,.72);
      box-shadow: 0 16px 40px rgba(42,58,89,.09), inset 0 1px rgba(255,255,255,.8);
      backdrop-filter: blur(18px) saturate(1.35); -webkit-backdrop-filter: blur(18px) saturate(1.35);
    }
    .game-home .tab > span:nth-child(2) { align-items: center; gap: 4px; width: 100%; }
    .game-home .tab b { max-width: 100%; color: inherit; font-size: .92rem; line-height: 1.25; }
    .game-home .tab small { display: none; }
    .game-home .game-icon {
      flex: 0 0 88px; width: 88px; height: 88px; border-radius: 25px;
      color: #25334b; font-size: 2.55rem;
      background: linear-gradient(145deg,rgba(255,255,255,.9),rgba(216,226,245,.58));
      border: 1px solid rgba(255,255,255,.85);
      box-shadow: 0 12px 24px rgba(40,52,75,.12), inset 0 1px 1px #fff;
      backdrop-filter: blur(16px) saturate(1.35); -webkit-backdrop-filter: blur(16px) saturate(1.35);
    }
    .game-home .launch-icon { display: none; }
    .game-home .tab.on { border-color: rgba(255,255,255,.7); background: rgba(255,255,255,.42); box-shadow: 0 14px 36px rgba(42,58,89,.08); }
    .game-home .tab.on .game-icon { background: linear-gradient(145deg,#fff,rgba(205,220,249,.78)); }
    @media (min-width: 1100px) { .game-home .tabs { grid-template-columns: repeat(7, minmax(0, 1fr)); } }
    @media (max-width: 700px) {
      body.game-home { padding: 28px 16px; }
      .game-home .library-heading { align-items: flex-start; flex-direction: column; gap: 5px; margin-bottom: 18px; }
      .game-home .tabs { grid-template-columns: repeat(3, minmax(0,1fr)); gap: 12px 6px; }
      .game-home .tab { padding: 10px 3px 12px; gap: 9px; border-radius: 18px; }
      .game-home .game-icon { flex-basis: min(22vw, 76px); width: min(22vw, 76px); height: min(22vw, 76px); border-radius: 21px; font-size: 2.05rem; }
      .game-home .tab b { font-size: .78rem; }
    }
    @media (prefers-reduced-motion: reduce) { .game-home .tab { transition: none; } }
    .poolui { margin-bottom: 12px; }
    .row { display: flex; gap: 8px; margin-bottom: 8px; }
    .mini {
      flex: 1; padding: 10px 12px; border-radius: 12px; border: none;
      font-weight: 600; font-size: 0.85rem; cursor: pointer;
      background: #ffedd5; color: #9a3412;
    }
    .mini:hover { background: #fed7aa; }
    #pCode, #cCode, #sCode, #wCode, #g2048Code {
      flex: 1; min-width: 0; padding: 10px 12px; border-radius: 12px;
      border: 2px solid #fed7aa; text-align: center; font-weight: 700;
      letter-spacing: 0.2em; text-transform: uppercase; font-size: 0.9rem;
      color: #9a3412; background: #fff;
    }
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
