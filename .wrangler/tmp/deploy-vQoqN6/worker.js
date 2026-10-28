var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// src/page/head.js
var head = /* @__PURE__ */ __name((hostname) => `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ch\u1EDD ch\xFAt nh\xE9 | ${hostname}</title>
  <link rel="icon" type="image/svg+xml" href="data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20viewBox='0%200%2032%2032'%3E%3Crect%20width='32'%20height='32'%20rx='8'%20fill='%23fff7ed'/%3E%3Cellipse%20cx='13'%20cy='9'%20rx='6'%20ry='3.5'%20fill='%23bae6fd'%20stroke='%237dd3fc'%20transform='rotate(-20%2013%209)'/%3E%3Cellipse%20cx='14'%20cy='18'%20rx='9'%20ry='7.5'%20fill='%23ea580c'%20stroke='%237c2d12'%20stroke-width='1.5'/%3E%3Cpath%20d='M12%2011v14'%20stroke='%237c2d12'%20stroke-width='1'/%3E%3Cg%20fill='%23431407'%3E%3Ccircle%20cx='9'%20cy='16'%20r='1.5'/%3E%3Ccircle%20cx='9'%20cy='21'%20r='1.5'/%3E%3Ccircle%20cx='16'%20cy='15'%20r='1.5'/%3E%3Ccircle%20cx='16'%20cy='21'%20r='1.5'/%3E%3Ccircle%20cx='24'%20cy='17'%20r='4.5'/%3E%3C/g%3E%3Ccircle%20cx='25.5'%20cy='15.5'%20r='1.8'%20fill='%23fff'/%3E%3Ccircle%20cx='26'%20cy='15.5'%20r='.8'%20fill='%23111'/%3E%3Cpath%20d='M25%2013Q27%208%2030%209'%20stroke='%23431407'%20stroke-width='1.2'%20fill='none'%20stroke-linecap='round'/%3E%3C/svg%3E">
  <meta name="theme-color" content="#fff7ed">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
`, "head");

// src/page/style-base.js
var styleBase = `  <style>
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

// src/page/style-wolf.js
var styleWolf = `    /* ===== Ma s\xF3i: s\xE2n kh\u1EA5u r\u1ED9ng, \u0111\u1ED5i m\xE0u theo pha ===== */
    .card { transition: max-width 0.35s ease; }
    .card[data-w="menu"] { max-width: 780px; }
    .card[data-w="game"] { max-width: 1200px; padding: 22px 26px 24px; }
    .card[data-w="game"] .sub { display: none; }
    .card[data-w="game"] h1 { font-size: 1.05rem; margin-bottom: 10px; }
    .card[data-w="game"] .domain-badge { margin-bottom: 8px; }
    .wstage {
      --bg: #e9eef2; --panel: #f7fafc; --ink: #22303c; --mute: #5f7385; --line: #cdd9e2;
      --acc: #3f6f8f; --accink: #ffffff; --danger: #b5382f;
      text-align: left; margin-bottom: 14px; padding: 20px; border-radius: 22px;
      background: var(--bg); color: var(--ink);
      transition: background 0.6s ease, color 0.6s ease;
    }
    .wstage[data-ph="day"] { --bg: #f6ecd6; --panel: #fffaf0; --ink: #3a2e1a; --mute: #7d6c4d; --line: #e6d6b0; --acc: #c9772b; }
    .wstage[data-ph="night"] { --bg: #11152b; --panel: #1a2040; --ink: #e7eaff; --mute: #9aa3d1; --line: #2c3566; --acc: #9fb0ff; --accink: #10143a; --danger: #ff6f86; }
    .wstage[data-ph="dusk"] { --bg: #2b1b33; --panel: #39253f; --ink: #f7e9ef; --mute: #cfa9bd; --line: #533458; --acc: #ff8f5e; --accink: #2b1220; --danger: #ff7088; }
    .wstage[data-ph="over"] { --bg: #1d1a12; --panel: #2a2519; --ink: #f6ecce; --mute: #c2b27f; --line: #4a4128; --acc: #e8b84a; --accink: #241c08; --danger: #ff7a68; }
    .wstage input {
      width: 100%; padding: 11px 13px; border-radius: 12px; border: 1.5px solid var(--line);
      background: var(--panel); color: var(--ink); font-size: 0.95rem; margin: 0;
    }
    .wstage input::placeholder { color: var(--mute); }
    .wstage input:focus-visible, .wstage button:focus-visible { outline: 2px solid var(--acc); outline-offset: 2px; }
    .wstage #wCode { text-align: center; letter-spacing: 0.25em; font-weight: 700; text-transform: uppercase; }
    .wstage .mini {
      flex: none; padding: 10px 16px; border-radius: 12px; border: none; font-weight: 600;
      background: var(--panel); color: var(--ink); box-shadow: inset 0 0 0 1.5px var(--line); cursor: pointer;
    }
    .wstage .mini:hover { background: var(--panel); box-shadow: inset 0 0 0 1.5px var(--acc); }
    .wstage .mini.on { background: var(--acc); color: var(--accink); box-shadow: none; }
    .wstage .mini.small { padding: 7px 12px; font-size: 0.8rem; margin: 2px 4px 2px 0; }
    .wstage .mini:disabled { opacity: 0.5; cursor: not-allowed; }
    .wstage .btn { width: 100%; margin-top: 10px; background: var(--acc); color: var(--accink); box-shadow: none; }
    .wstage .btn:hover { box-shadow: 0 8px 18px -6px var(--acc); }
    .wstage .btn:disabled { opacity: 0.45; cursor: not-allowed; transform: none; box-shadow: none; }
    .wstage .pmsg { color: var(--acc); margin-top: 10px; }
    .wstage .row input { flex: 1; min-width: 0; }
    .wmenu { display: grid; grid-template-columns: 1fr 1.1fr; gap: 24px; align-items: start; }
    .wtitle { font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 1.9rem; line-height: 1.15; margin-bottom: 6px; }
    .wlead { color: var(--mute); font-size: 0.9rem; line-height: 1.55; margin-bottom: 16px; }
    .wmenu .row { margin: 10px 0 0; }
    .wroles { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .wroles div { background: var(--panel); border-radius: 12px; padding: 9px 11px; font-size: 0.78rem; line-height: 1.45; color: var(--mute); box-shadow: inset 0 0 0 1px var(--line); }
    .wroles b { display: block; color: var(--ink); font-size: 0.86rem; margin-bottom: 2px; }
    .whead { display: flex; align-items: stretch; gap: 14px; margin-bottom: 16px; }
    .wroomtag { display: flex; flex-direction: column; justify-content: center; gap: 8px; min-width: 150px; }
    .wroomtag b { font-size: 0.95rem; overflow-wrap: anywhere; }
    .wbanner {
      position: relative; flex: 1; overflow: hidden; border-radius: 18px; padding: 18px 22px 18px 100px;
      background: var(--panel); box-shadow: inset 0 0 0 1px var(--line); min-height: 92px;
      display: flex; flex-direction: column; justify-content: center;
    }
    .wstage[data-ph="night"] .wbanner {
      background:
        radial-gradient(1.5px 1.5px at 20% 30%, #fff 50%, transparent 51%),
        radial-gradient(1px 1px at 62% 22%, #cfd6ff 50%, transparent 51%),
        radial-gradient(1.5px 1.5px at 84% 64%, #fff 50%, transparent 51%),
        radial-gradient(1px 1px at 46% 76%, #cfd6ff 50%, transparent 51%),
        radial-gradient(1px 1px at 33% 14%, #fff 50%, transparent 51%),
        var(--panel);
    }
    .wphase { font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 1.7rem; line-height: 1.1; margin: 0; color: var(--ink); font-weight: 700; }
    .wsub { color: var(--mute); font-size: 0.92rem; margin-top: 5px; }
    .wsky {
      position: absolute; left: 26px; top: 50%; width: 48px; height: 48px; margin-top: -24px; border-radius: 50%;
      background: radial-gradient(circle at 35% 35%, #ffe9a8, #f3a73c);
      box-shadow: 0 0 0 8px rgba(243, 167, 60, 0.18), 0 0 34px 6px rgba(243, 167, 60, 0.4);
      transition: background 0.6s ease, box-shadow 0.6s ease;
    }
    .wstage[data-ph="lobby"] .wsky { background: radial-gradient(circle at 35% 35%, #e3f1fb, #8fb8d6); box-shadow: 0 0 0 8px rgba(63, 111, 143, 0.15), 0 0 30px 4px rgba(63, 111, 143, 0.3); }
    .wstage[data-ph="night"] .wsky { background: #eef1ff; box-shadow: inset -14px -4px 0 0 #aab6ee, 0 0 30px 4px rgba(159, 176, 255, 0.45); }
    .wstage[data-ph="dusk"] .wsky { background: radial-gradient(circle at 40% 40%, #ffb27a, #e8546a); box-shadow: 0 0 0 8px rgba(255, 112, 136, 0.18), 0 0 34px 6px rgba(255, 112, 136, 0.4); }
    .wstage[data-ph="over"] .wsky { background: radial-gradient(circle at 35% 35%, #fff0b8, #e8b84a); box-shadow: 0 0 0 8px rgba(232, 184, 74, 0.18), 0 0 34px 6px rgba(232, 184, 74, 0.4); }
    .wtimer {
      --p: 100%; position: relative; width: 92px; aspect-ratio: 1; flex: none; align-self: center; border-radius: 50%;
      display: grid; place-items: center; background: conic-gradient(var(--acc) var(--p), var(--line) 0);
    }
    .wtimer::before { content: ""; position: absolute; inset: 7px; border-radius: 50%; background: var(--panel); }
    .wtimer span { position: relative; font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 1.6rem; font-weight: 700; }
    .wgrid { display: grid; grid-template-columns: minmax(0, 1.25fr) minmax(0, 1fr) minmax(0, 1fr); gap: 16px; align-items: stretch; }
    .wmobile-tabs { display: none; }
    .wcol { background: var(--panel); border-radius: 18px; padding: 14px; box-shadow: inset 0 0 0 1px var(--line); min-width: 0; }
    .wcol h3 { font-size: 0.95rem; display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 10px; font-weight: 700; color: var(--ink); }
    .wcol h3 span { font-weight: 500; color: var(--mute); font-size: 0.8rem; }
    .wplayers { display: grid; grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); gap: 8px; }
    .pcard { display: flex; flex-wrap: wrap; align-items: center; gap: 6px 10px; padding: 10px; border-radius: 14px; background: var(--bg); box-shadow: inset 0 0 0 1px var(--line); }
    .pcard.me { box-shadow: inset 0 0 0 2px var(--acc); }
    .pcard.dead { opacity: 0.5; filter: grayscale(0.7); }
    .pav { width: 36px; height: 36px; border-radius: 50%; background: var(--acc); color: var(--accink); display: grid; place-items: center; font-weight: 700; flex: none; }
    .pinfo { flex: 1; min-width: 0; }
    .pn { font-weight: 600; font-size: 0.88rem; overflow-wrap: anywhere; }
    .pm { display: flex; flex-wrap: wrap; gap: 4px; margin-top: 3px; font-size: 0.7rem; color: var(--mute); }
    .pm .rl { background: var(--line); color: var(--ink); padding: 1px 8px; border-radius: 9999px; }
    .pm .rl.w { background: var(--danger); color: #fff; }
    .pact { width: 100%; }
    .wrole { border-radius: 14px; padding: 14px; background: var(--bg); box-shadow: inset 0 0 0 1px var(--line); font-size: 0.86rem; line-height: 1.55; margin-bottom: 12px; }
    .wrole.r-wolf { box-shadow: inset 0 0 0 2px var(--danger); }
    .wrole .rt, .wact .rt { font-family: 'Nunito Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; font-size: 1.25rem; margin-bottom: 6px; color: var(--ink); font-weight: 700; }
    .wrole .dd { color: var(--mute); margin-top: 6px; }
    .wact { font-size: 0.88rem; }
    .wact .ahint { color: var(--mute); margin: 6px 0; line-height: 1.5; }
    .wact .crow { margin: 8px 0; }
    .wright { display: flex; flex-direction: column; gap: 10px; }
    .wlog { max-height: 150px; overflow: auto; font-size: 0.8rem; color: var(--mute); line-height: 1.5; padding-left: 10px; border-left: 3px solid var(--acc); margin: 0; }
    .wchatbox {
      flex: 1; min-height: 200px; max-height: 340px; overflow: auto; background: var(--bg); border-radius: 12px;
      padding: 8px 10px; font-size: 0.84rem; line-height: 1.5; overflow-wrap: anywhere; box-shadow: inset 0 0 0 1px var(--line); margin: 0;
    }
    .wchatbox .cl.wolf { color: var(--danger); }
    .wchatbox .cl.dead { color: var(--mute); font-style: italic; }
    .wright .row { margin: 0; }
    .wscene { position: absolute; right: 0; bottom: 0; height: 100%; width: 62%; color: var(--line); pointer-events: none; }
    .wscene .win { fill: var(--panel); }
    .wstage[data-ph="night"] .wscene .win, .wstage[data-ph="dusk"] .wscene .win { fill: #ffd34d; }
    .wscene .tr { opacity: 0.8; }
    .wbanner > .wphase, .wbanner > .wsub { position: relative; z-index: 1; }
    .rhead { display: flex; align-items: center; gap: 14px; margin-bottom: 8px; }
    .rhead .rt { margin: 0; }
    .rico svg, .pav svg, .wroles .ric svg { width: 100%; height: 100%; display: block; }
    .rico { width: 76px; height: 76px; flex: none; filter: drop-shadow(0 6px 10px rgba(0, 0, 0, 0.25)); }
    .pav.ico { background: none; overflow: hidden; width: 40px; height: 40px; }
    .wroles div { display: grid; grid-template-columns: 44px 1fr; gap: 10px; align-items: center; }
    .wroles .ric { width: 44px; height: 44px; display: block; }
    @media (max-width: 980px) {
      .wgrid { grid-template-columns: 1fr; }
      .wmid { order: -1; }
      .whead { flex-wrap: wrap; }
      .wroomtag { flex-direction: row; align-items: center; justify-content: space-between; width: 100%; }
      .wbanner { padding-left: 88px; }
      .wtimer { width: 72px; }
    }
    @media (max-width: 720px) {
      .wmenu { grid-template-columns: 1fr; }
      .card[data-w="game"] { padding: 16px 14px; }
      .wphase { font-size: 1.35rem; }
      .wstage { padding: 14px; }
      .wmobile-tabs {
        display: flex; position: sticky; top: 6px; z-index: 20; order: -1; gap: 6px;
        padding: 6px; margin: 0 0 8px; border-radius: 14px; background: var(--panel);
        box-shadow: 0 4px 14px rgba(0, 0, 0, 0.18), inset 0 0 0 1px var(--line);
      }
      .wmobile-tabs .mini { flex: 1; min-width: 0; padding: 9px 6px; }
      .wmobile-tabs .mini[aria-pressed="true"] { background: var(--acc); color: var(--accink); box-shadow: none; }
      .wgrid > .wcol { display: none; }
      .wgrid > .wcol.mobile-active { display: flex; flex-direction: column; }
      .wgrid > .wmid { order: 0; }
    }
    @media (prefers-reduced-motion: reduce) {
      .wstage, .wsky, .card { transition: none; }
    }
`;

// src/page/style-sword.js
var styleSword = `    /* ===== \u0110\u1EA5u ki\u1EBFm ===== */
    .card[data-w="arena"] { max-width: 860px; }
    .card[data-w="arena"] .sub { display: none; }
    .swkeys { display: flex; flex-wrap: wrap; gap: 6px 14px; justify-content: center; font-size: 0.78rem; color: #78716c; margin: 8px 0 8px; }
    .swkeys span { display: inline-flex; align-items: center; gap: 4px; }
    .swkeys kbd { font-family: inherit; font-size: 0.72rem; font-weight: 700; color: #7c2d12; background: #fff7ed; border: 1px solid #fdba74; border-bottom-width: 2px; border-radius: 6px; padding: 1px 6px; }
`;

// src/page/style-played.js
var stylePlayed = `    .card[data-w="played"] { max-width: 1040px; }
    .card[data-w="played"] .game { position: relative; padding: 10px; background: #101a36; box-shadow: inset 0 0 0 1px #34465d; }
    .card[data-w="played"] canvas { image-rendering: pixelated; }
    .pg-touch { display: none; }
    @media (max-width: 700px) {
      .card[data-w="played"] { padding: 18px 12px; }
      .card[data-w="played"] .game { padding: 5px; border-radius: 14px; }
      .pg-touch { display: flex; position: absolute; z-index: 3; left: 12px; right: 12px; bottom: 12px; justify-content: space-between; align-items: end; pointer-events: none; }
      .pg-touch-group { display: flex; gap: 8px; }
      .pg-touch button { width: 56px; height: 52px; border: 1px solid rgba(255,255,255,.22); border-radius: 14px; background: rgba(15,26,48,.72); color: #fff3d1; font-size: 1.25rem; font-weight: 800; touch-action: none; pointer-events: auto; }
      .pg-touch button.jump { width: 72px; color: #1a2238; background: #f6d98a; }
    }
`;

// src/page/body.js
var body = /* @__PURE__ */ __name((hostname) => `  </style>
</head>
<body>
  <div class="card">
    <div class="domain-badge">${hostname}</div>
    <h1>M\xE1y ch\u1EE7 local ch\u01B0a b\u1EADt \u{1F41E}</h1>
    <p class="sub">Gi\xFAp con bug bay qua c\xE1c t\u1EE7 m\xE1y ch\u1EE7, th\u1EED Ma s\xF3i ho\u1EB7c YOU GOT PLAYED, ho\u1EB7c r\u1EE7 b\u1EA1n b\xE8 ch\u01A1i c\xE1c mini game trong l\xFAc ch\u1EDD nh\xE9. Khi c\xF3 k\u1EBFt n\u1ED1i trang s\u1EBD t\u1EF1 t\u1EA3i l\u1EA1i.</p>
    <div class="tabs">
      <a href="/__game/bomb-arena" style="display:inline-flex;align-items:center;padding:9px 15px;border-radius:12px;background:#ff9c45;color:#302015;font-weight:800;text-decoration:none">\u2739 Bomb Arena</a>
      <button class="tab on" data-g="flappy">Flappy</button>
      <!-- <button class="tab" data-g="pool">\u{1F3B1} Bi-a</button> -->
      <button class="tab" data-g="caro">Caro</button>
      <button class="tab" data-g="motorways">Mini Motorways</button>
      <!-- <button class="tab" data-g="sword">\u2694\uFE0F \u0110\u1EA5u ki\u1EBFm</button>  -->
      <button class="tab" data-g="wolf">Ma s\xF3i</button>
      <button class="tab" data-g="played">YOU GOT PLAYED</button>
    </div>
    <div class="game" id="gameBox"><canvas id="g"></canvas><div class="pg-touch" id="playedControls" hidden><div class="pg-touch-group"><button type="button" aria-label="\u0110i sang tr\xE1i" data-played-control="left">\u2190</button><button type="button" aria-label="\u0110i sang ph\u1EA3i" data-played-control="right">\u2192</button><button type="button" aria-label="T\u1EA1m d\u1EEBng ho\u1EB7c ti\u1EBFp t\u1EE5c" data-played-control="pause">\u2161</button></div><button type="button" class="jump" aria-label="Nh\u1EA3y" data-played-control="jump">NH\u1EA2Y</button></div><iframe id="motorwaysFrame" title="Mini Motorways" src="/__game/mini-motorways" hidden></iframe></div>
    <div class="poolui" id="poolui" hidden>
      <div id="pMenu">
        <div class="row">
          <button class="mini" id="pSolo">Ch\u01A1i m\u1ED9t m\xECnh</button>
          <button class="mini" id="pCreate">T\u1EA1o ph\xF2ng</button>
        </div>
        <div class="row">
          <input id="pCode" maxlength="4" placeholder="M\xC3 PH\xD2NG" autocomplete="off">
          <button class="mini" id="pJoin">V\xE0o ph\xF2ng</button>
        </div>
      </div>
      <button class="mini" id="pBack" hidden style="width:100%;margin-bottom:8px">Tho\xE1t v\u1EC1 menu</button>
      <div class="pmsg" id="pMsg"></div>
    </div>
    <div class="poolui" id="caroui" hidden>
      <div id="cMenu">
        <div class="row">
          <button class="mini" id="cBot">\u0110\u1EA5u v\u1EDBi m\xE1y</button>
          <button class="mini" id="cCreate">T\u1EA1o ph\xF2ng</button>
        </div>
        <div class="row">
          <input id="cCode" maxlength="4" placeholder="M\xC3 PH\xD2NG" autocomplete="off">
          <button class="mini" id="cJoin">V\xE0o ph\xF2ng</button>
        </div>
      </div>
      <button class="mini" id="cBack" hidden style="width:100%;margin-bottom:8px">Tho\xE1t v\u1EC1 menu</button>
      <div class="pmsg" id="cMsg"></div>
    </div>
    <div class="poolui" id="swordui" hidden>
      <div id="sMenu">
        <div class="row">
          <button class="mini" id="sBot">\u0110\u1EA5u v\u1EDBi m\xE1y</button>
          <button class="mini" id="sCreate">T\u1EA1o ph\xF2ng</button>
        </div>
        <div class="row">
          <input id="sCode" maxlength="4" placeholder="M\xC3 PH\xD2NG" autocomplete="off">
          <button class="mini" id="sJoin">V\xE0o ph\xF2ng</button>
        </div>
      </div>
      <button class="mini" id="sBack" hidden style="width:100%;margin-bottom:8px">Tho\xE1t v\u1EC1 menu</button>
      <div class="pmsg" id="sMsg"></div>
      <div class="swkeys">
        <span><kbd>A</kbd><kbd>D</kbd> \u0111i</span>
        <span><kbd>W</kbd> nh\u1EA3y</span>
        <span><kbd>S</kbd> c\xFAi</span>
        <span><kbd>\u2190</kbd><kbd>\u2192</kbd> h\u1EA1 / n\xE2ng vai</span>
        <span><kbd>\u2191</kbd><kbd>\u2193</kbd> du\u1ED7i / co khu\u1EF7u</span>
        <span><kbd>Space</kbd> ch\xE9m</span>
      </div>
    </div>
    <div class="wstage" id="wolfui" data-ph="lobby" hidden>
      <div id="wMenu" class="wmenu">
        <div>
          <h2 class="wtitle">Ma s\xF3i</h2>
          <p class="wlead">T\u1EEB 5 \u0111\u1EBFn 12 ng\u01B0\u1EDDi, m\u1ED7i ng\u01B0\u1EDDi m\u1ED9t thi\u1EBFt b\u1ECB. Server gi\u1EEF vai tr\xF2 v\xE0 lu\u1EADt ch\u01A1i, n\xEAn kh\xF4ng ai nh\xECn th\u1EA5y b\xE0i c\u1EE7a ng\u01B0\u1EDDi kh\xE1c.</p>
          <input id="wName" maxlength="12" placeholder="T\xEAn c\u1EE7a b\u1EA1n" autocomplete="off">
          <div class="row">
            <button class="mini" id="wCreate">T\u1EA1o ph\xF2ng</button>
            <input id="wCode" maxlength="4" placeholder="M\xC3 PH\xD2NG" autocomplete="off">
            <button class="mini" id="wJoin">V\xE0o ph\xF2ng</button>
          </div>
        </div>
        <div class="wroles">
          <div data-r="wolf"><i class="ric"></i><span><b>\u{1F43A} S\xF3i</b>M\u1ED7i \u0111\xEAm c\u1EA3 b\u1EA7y ch\u1ECDn m\u1ED9t ng\u01B0\u1EDDi \u0111\u1EC3 c\u1EAFn.</span></div>
          <div data-r="villager"><i class="ric"></i><span><b>\u{1F3D8}\uFE0F D\xE2n l\xE0ng</b>Th\u1EA3o lu\u1EADn, quan s\xE1t v\xE0 b\u1ECF phi\u1EBFu treo c\u1ED5 S\xF3i.</span></div>
          <div data-r="seer"><i class="ric"></i><span><b>\u{1F52E} Ti\xEAn tri</b>M\u1ED7i \u0111\xEAm soi m\u1ED9t ng\u01B0\u1EDDi xem c\xF3 ph\u1EA3i S\xF3i kh\xF4ng.</span></div>
          <div data-r="guard"><i class="ric"></i><span><b>\u{1F6E1}\uFE0F B\u1EA3o v\u1EC7</b>Che ch\u1EDF m\u1ED9t ng\u01B0\u1EDDi kh\u1ECFi b\u1ECB c\u1EAFn m\u1ED7i \u0111\xEAm.</span></div>
          <div data-r="witch"><i class="ric"></i><span><b>\u{1F9EA} Ph\xF9 th\u1EE7y</b>M\u1ED9t b\xECnh c\u1EE9u, m\u1ED9t b\xECnh \u0111\u1ED9c d\xF9ng m\u1ED9t l\u1EA7n.</span></div>
          <div data-r="hunter"><i class="ric"></i><span><b>\u{1F3F9} Th\u1EE3 s\u0103n</b>Khi ch\u1EBFt \u0111\u01B0\u1EE3c b\u1EAFn h\u1EA1 m\u1ED9t ng\u01B0\u1EDDi.</span></div>
        </div>
      </div>
      <div id="wGame" hidden>
        <div class="whead">
          <div class="wroomtag"><b id="wRoom"></b><button class="mini small" id="wBack">Tho\xE1t ph\xF2ng</button></div>
          <div class="wbanner">
            <div class="wsky" id="wSky"></div>
            <svg class="wscene" viewBox="0 0 400 100" preserveAspectRatio="xMaxYMax slice" aria-hidden="true"><path d="M0 100 V74 Q70 52 140 70 T280 64 T400 60 V100Z" fill="currentColor" opacity="0.45"/><g fill="currentColor"><path d="M210 78 L232 56 L254 78Z"/><rect x="214" y="78" width="36" height="22"/><path d="M290 74 L308 56 L326 74Z"/><rect x="293" y="74" width="30" height="26"/><rect x="262" y="60" width="5" height="12" opacity="0.7"/></g><g class="tr" fill="currentColor"><path d="M350 100 L362 62 L374 100Z"/><path d="M372 100 L382 70 L392 100Z"/><path d="M180 100 L190 72 L200 100Z"/></g><rect class="win" x="226" y="84" width="8" height="8" rx="1"/><rect class="win" x="302" y="82" width="7" height="8" rx="1"/></svg>
            
            <h2 class="wphase" id="wPhase"></h2>
            <div class="wsub" id="wSub"></div>
          </div>
          <div class="wtimer" id="wTimer" hidden><span id="wTimeNum"></span></div>
        </div>
        <div class="wgrid">
          <div class="wmobile-tabs" role="group" aria-label="\u0110i\u1EC1u h\u01B0\u1EDBng v\xE1n ch\u01A1i tr\xEAn \u0111i\u1EC7n tho\u1EA1i">
            <button class="mini small" type="button" data-mobile-tab="act" aria-controls="wMid" aria-pressed="true">H\xE0nh \u0111\u1ED9ng</button>
            <button class="mini small" type="button" data-mobile-tab="players" aria-controls="wPlayersPanel" aria-pressed="false">Ng\u01B0\u1EDDi ch\u01A1i</button>
            <button class="mini small" type="button" data-mobile-tab="chat" aria-controls="wChatPanel" aria-pressed="false">Chat</button>
          </div>
          <section class="wcol wleft" id="wPlayersPanel">
            <h3>Ng\u01B0\u1EDDi ch\u01A1i <span id="wPCount"></span></h3>
            <div class="wplayers" id="wPlayers"></div>
          </section>
          <section class="wcol wmid mobile-active" id="wMid">
            <div class="wrole" id="wRole"></div>
            <div class="wact" id="wAct"></div>
          </section>
          <section class="wcol wright" id="wChatPanel">
            <h3>Di\u1EC5n bi\u1EBFn</h3>
            <div class="wlog" id="wLog"></div>
            <div class="wchatbox" id="wChat"></div>
            <div class="row"><input id="wText" maxlength="200" placeholder="Nh\u1EAFn tin..." autocomplete="off"><button class="mini" id="wSend">G\u1EEDi</button></div>
          </section>
        </div>
      </div>
      <div class="pmsg" id="wMsg"></div>
    </div>
    <div class="hint" id="hint"></div>
    <div class="status" id="st">\u0110ang t\u1EF1 \u0111\u1ED9ng th\u1EED k\u1EBFt n\u1ED1i l\u1EA1i...</div>
    <button class="btn" id="reload">T\u1EA3i l\u1EA1i trang</button>
  </div>

`, "body");

// src/page/client/core.js
var clientCore = `  <script>
  (function () {
    var W = 480, H = 270;
    var c = document.getElementById('g');
    var dpr = Math.min(window.devicePixelRatio || 1, 3);
    var x = c.getContext('2d');
    function setSize(w, h) { c.width = w * dpr; c.height = h * dpr; x.setTransform(dpr, 0, 0, dpr, 0, 0); }
    setSize(W, H);
    var tm = 0;

`;

// src/page/client/flappy.js
var clientFlappy = `    // ===================== FLAPPY BUG =====================
    var flappy = (function () {
      var GROUND = H - 26;
      var BX = 110, R = 10, PW = 54, GAP = 112, SPACING = 210, SPEED = 150;
      var best = 0;
      try { best = +localStorage.getItem('offline_best') || 0; } catch (e) {}
      var bug, pipes, score, state, dist, overAt;

      function reset() {
        bug = { y: H / 2 - 20, vy: 0 };
        pipes = []; score = 0; dist = 0;
        state = 'ready';
      }

      function flap() {
        var now = performance.now();
        if (state === 'ready') state = 'run';
        if (state === 'run') { bug.vy = -380; return; }
        if (state === 'over' && now - overAt > 400) reset();
      }

      function die() {
        state = 'over'; overAt = performance.now();
        if (score > best) {
          best = score;
          try { localStorage.setItem('offline_best', String(best)); } catch (e) {}
        }
      }

      function step(dt) {
        dist += SPEED * dt;
        bug.vy += 1300 * dt;
        bug.y += bug.vy * dt;
        if (bug.y - R < 0) { bug.y = R; bug.vy = 0; }
        if (bug.y + R > GROUND) { bug.y = GROUND - R; die(); return; }

        if (!pipes.length || pipes[pipes.length - 1].x < W - SPACING) {
          pipes.push({ x: W + 10, gapY: 70 + Math.random() * (GROUND - 140), passed: false });
        }
        for (var i = pipes.length - 1; i >= 0; i--) {
          var p = pipes[i];
          p.x -= SPEED * dt;
          if (p.x + PW < -10) { pipes.splice(i, 1); continue; }
          if (!p.passed && p.x + PW < BX) { p.passed = true; score++; }
          if (BX + R > p.x && BX - R < p.x + PW) {
            if (bug.y - R < p.gapY - GAP / 2 || bug.y + R > p.gapY + GAP / 2) { die(); return; }
          }
        }
      }

      function drawRack(px, y1, y2, capOnBottom) {
        if (y2 - y1 <= 0) return;
        x.fillStyle = '#cbd5e1'; x.strokeStyle = '#64748b'; x.lineWidth = 2;
        x.fillRect(px, y1, PW, y2 - y1); x.strokeRect(px, y1, PW, y2 - y1);
        x.strokeStyle = '#94a3b8'; x.lineWidth = 1;
        for (var yy = y1 + 12; yy < y2 - 18; yy += 14) {
          x.beginPath(); x.moveTo(px + 8, yy); x.lineTo(px + PW - 8, yy); x.stroke();
        }
        var cy = capOnBottom ? y2 - 14 : y1;
        x.fillStyle = '#94a3b8'; x.strokeStyle = '#475569'; x.lineWidth = 2;
        x.fillRect(px - 4, cy, PW + 8, 14); x.strokeRect(px - 4, cy, PW + 8, 14);
        x.fillStyle = (Math.floor(tm * 3) % 2) ? '#22c55e' : '#16a34a';
        x.beginPath(); x.arc(px + PW / 2, cy + 7, 3, 0, Math.PI * 2); x.fill();
      }

      function drawBug(cx, cy, tilt) {
        x.save(); x.translate(cx, cy); x.rotate(tilt);
        var f = state === 'over' ? 0.2 : Math.abs(Math.sin(tm * 24));
        x.strokeStyle = '#431407'; x.lineWidth = 1.5; x.lineCap = 'round';
        for (var i = -1; i <= 1; i++) {
          x.beginPath(); x.moveTo(i * 5, 8); x.lineTo(i * 5 - 2, 14); x.stroke();
        }
        x.fillStyle = 'rgba(186,230,253,0.85)'; x.strokeStyle = '#7dd3fc'; x.lineWidth = 1;
        x.beginPath(); x.ellipse(-4, -9, 10, 2 + 7 * f, -0.3, 0, Math.PI * 2); x.fill(); x.stroke();
        x.fillStyle = '#ea580c'; x.strokeStyle = '#7c2d12'; x.lineWidth = 2;
        x.beginPath(); x.ellipse(0, 0, 14, 11, 0, 0, Math.PI * 2); x.fill(); x.stroke();
        x.lineWidth = 1.2;
        x.beginPath(); x.moveTo(-3, -10); x.lineTo(-3, 10); x.stroke();
        x.fillStyle = '#431407';
        var sp = [[-8, -4], [-8, 4], [2, -5], [2, 5]];
        for (var j = 0; j < sp.length; j++) {
          x.beginPath(); x.arc(sp[j][0], sp[j][1], 2.3, 0, Math.PI * 2); x.fill();
        }
        x.beginPath(); x.arc(13, -1, 7, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#fff';
        x.beginPath(); x.arc(15, -4, 3, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#111';
        x.beginPath(); x.arc(16, -4, 1.4, 0, Math.PI * 2); x.fill();
        x.strokeStyle = '#431407'; x.lineWidth = 1.5; x.fillStyle = '#431407';
        x.beginPath(); x.moveTo(15, -7); x.quadraticCurveTo(19, -14, 24, -13); x.stroke();
        x.beginPath(); x.arc(24, -13, 1.8, 0, Math.PI * 2); x.fill();
        x.beginPath(); x.moveTo(11, -7); x.quadraticCurveTo(12, -15, 17, -17); x.stroke();
        x.beginPath(); x.arc(17, -17, 1.8, 0, Math.PI * 2); x.fill();
        x.restore();
      }

      function draw() {
        x.clearRect(0, 0, W, H);
        var sky = x.createLinearGradient(0, 0, 0, H);
        sky.addColorStop(0, '#fff7ed'); sky.addColorStop(1, '#fed7aa');
        x.fillStyle = sky; x.fillRect(0, 0, W, H);

        for (var i = 0; i < pipes.length; i++) {
          var p = pipes[i];
          drawRack(p.x, 0, p.gapY - GAP / 2, true);
          drawRack(p.x, p.gapY + GAP / 2, GROUND, false);
        }

        x.fillStyle = '#fdba74'; x.fillRect(0, GROUND, W, H - GROUND);
        x.strokeStyle = '#ea580c'; x.lineWidth = 2;
        x.beginPath(); x.moveTo(0, GROUND); x.lineTo(W, GROUND); x.stroke();
        x.strokeStyle = '#fb923c'; x.lineWidth = 2;
        for (var g = -(dist % 24); g < W; g += 24) {
          x.beginPath(); x.moveTo(g, GROUND + 6); x.lineTo(g - 8, GROUND + 18); x.stroke();
        }

        var by = bug.y;
        if (state === 'ready') by = H / 2 - 20 + Math.sin(tm * 4) * 6;
        var tilt = Math.max(-0.45, Math.min(1.0, bug.vy / 520));
        if (state === 'ready') tilt = 0;
        drawBug(BX, by, tilt);

        x.textAlign = 'center';
        x.fillStyle = '#ea580c';
        x.font = '700 34px Nunito Sans, sans-serif';
        x.fillText(String(score), W / 2, 44);
        x.textAlign = 'right';
        x.font = '600 12px Nunito Sans, sans-serif';
        x.fillStyle = '#9a3412';
        x.fillText('Cao nh\u1EA5t ' + best, W - 12, 20);
        x.textAlign = 'center';

        if (state === 'ready') {
          x.fillStyle = '#7c2d12'; x.font = '600 16px Nunito Sans, sans-serif';
          x.fillText('Ch\u1EA1m \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u', W / 2, H / 2 + 50);
        }
        if (state === 'over') {
          x.fillStyle = 'rgba(255,255,255,0.8)';
          x.fillRect(0, 0, W, H);
          x.fillStyle = '#1e293b'; x.font = '700 22px Nunito Sans, sans-serif';
          x.fillText('Bug \u0111\xE2m v\xE0o m\xE1y ch\u1EE7 r\u1ED3i!', W / 2, H / 2 - 14);
          x.fillStyle = '#64748b'; x.font = '500 14px Nunito Sans, sans-serif';
          x.fillText('\u0110i\u1EC3m ' + score + '  \u2022  Ch\u1EA1m \u0111\u1EC3 ch\u01A1i l\u1EA1i', W / 2, H / 2 + 14);
        }
        x.textAlign = 'left';
      }

      reset();
      return {
        w: 480, h: 270,
        hint: 'Ch\u1EA1m v\xE0o game ho\u1EB7c b\u1EA5m Space / \u2191 \u0111\u1EC3 v\u1ED7 c\xE1nh',
        update: function (dt) { if (state === 'run') step(dt); },
        draw: draw,
        down: function () { flap(); },
        key: function () { flap(); }
      };
    })();

`;

// src/page/client/pool.js
var clientPool = `    // ===================== BI-A MINI =====================
    // Lu\u1EADt: 7 bi m\xE0u, b\u1ECF bi v\xE0o l\u1ED7 \u0111\u01B0\u1EE3c 1 \u0111i\u1EC3m v\xE0 \u0111\xE1nh ti\u1EBFp. Kh\xF4ng b\u1ECF \u0111\u01B0\u1EE3c ho\u1EB7c bi tr\u1EAFng r\u01A1i l\u1ED7 th\xEC m\u1EA5t l\u01B0\u1EE3t.
    // Ai nhi\u1EC1u \u0111i\u1EC3m h\u01A1n khi h\u1EBFt bi th\xEC th\u1EAFng. Hai m\xE1y ch\u1EA1y c\xF9ng m\u1ED9t m\xF4 ph\u1ECFng (b\u01B0\u1EDBc c\u1ED1 \u0111\u1ECBnh),
    // ng\u01B0\u1EDDi b\u1EAFn g\u1EEDi l\u1EA1i tr\u1EA1ng th\xE1i cu\u1ED1i c\xFA \u0111\xE1nh \u0111\u1EC3 \u0111\u1ED3ng b\u1ED9.
    var pool = (function () {
      var R = 8, DT = 1 / 120;
      var FL = 22, FR = 458, FT = 46, FB = 252, PR = 14;
      var POCK = [[22, 46], [240, 46], [458, 46], [22, 252], [240, 252], [458, 252]];
      var COLORS = ['#facc15', '#3b82f6', '#ef4444', '#8b5cf6', '#22c55e', '#f97316', '#14b8a6'];
      var HEADX = 131, HEADY = 149;
      var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

      var balls = [], pstate = 'menu', mode = '', me = 0, turn = 0, score = [0, 0], shots = 0;
      var ws = null, pend = null, iShot = true, acc = 0, potCount = 0, cueIn = false;
      var aim = null, roomCode = '', overAt = 0;
      var connId = 0;

      function el(id) { return document.getElementById(id); }
      function setMsg(t) { el('pMsg').textContent = t; }
      function showMenu(on) {
        el('pMenu').hidden = !on;
        el('pBack').hidden = on;
      }
      function clean(s) { return s.toUpperCase().replace(/[^A-Z0-9]/g, ''); }

      function rack() {
        balls = [{ x: HEADX, y: HEADY, vx: 0, vy: 0, a: true, c: '#ffffff' }];
        var d = 2 * R + 0.6, h = d * 0.8660254037844386;
        var off = [[0, 0], [d, 0], [-d, 0], [d / 2, h], [d / 2, -h], [-d / 2, h], [-d / 2, -h]];
        for (var i = 0; i < 7; i++) {
          balls.push({ x: 330 + off[i][0], y: 149 + off[i][1], vx: 0, vy: 0, a: true, c: COLORS[i] });
        }
        score = [0, 0]; shots = 0; turn = 0; potCount = 0; cueIn = false; pend = null; aim = null;
      }

      function step() {
        var i, j, b, o;
        for (i = 0; i < 8; i++) {
          b = balls[i];
          if (!b.a) continue;
          b.x += b.vx * DT; b.y += b.vy * DT;
          b.vx *= 0.9915; b.vy *= 0.9915;
          if (b.vx * b.vx + b.vy * b.vy < 25) { b.vx = 0; b.vy = 0; }
          for (j = 0; j < 6; j++) {
            var px = b.x - POCK[j][0], py = b.y - POCK[j][1];
            if (px * px + py * py < PR * PR) {
              b.a = false; b.vx = 0; b.vy = 0;
              if (i === 0) cueIn = true; else potCount++;
              break;
            }
          }
          if (!b.a) continue;
          if (b.x < FL + R) { b.x = FL + R; b.vx = -b.vx * 0.8; }
          else if (b.x > FR - R) { b.x = FR - R; b.vx = -b.vx * 0.8; }
          if (b.y < FT + R) { b.y = FT + R; b.vy = -b.vy * 0.8; }
          else if (b.y > FB - R) { b.y = FB - R; b.vy = -b.vy * 0.8; }
        }
        for (i = 0; i < 8; i++) {
          if (!balls[i].a) continue;
          for (j = i + 1; j < 8; j++) {
            if (!balls[j].a) continue;
            b = balls[i]; o = balls[j];
            var dx = o.x - b.x, dy = o.y - b.y, d2 = dx * dx + dy * dy;
            if (d2 < 4 * R * R && d2 > 0) {
              var d = Math.sqrt(d2), nx = dx / d, ny = dy / d, ov = (2 * R - d) / 2;
              b.x -= nx * ov; b.y -= ny * ov; o.x += nx * ov; o.y += ny * ov;
              var dv = (b.vx - o.vx) * nx + (b.vy - o.vy) * ny;
              if (dv > 0) {
                var k = dv * 0.98;
                b.vx -= k * nx; b.vy -= k * ny; o.vx += k * nx; o.vy += k * ny;
              }
            }
          }
        }
      }

      function moving() {
        for (var i = 0; i < 8; i++) {
          var b = balls[i];
          if (b.a && (b.vx !== 0 || b.vy !== 0)) return true;
        }
        return false;
      }

      function clash(px, py) {
        for (var i = 1; i < 8; i++) {
          var b = balls[i];
          if (!b.a) continue;
          var dx = b.x - px, dy = b.y - py;
          if (dx * dx + dy * dy < 4 * R * R) return true;
        }
        return false;
      }

      function snapshot() {
        var arr = [];
        for (var i = 0; i < 8; i++) {
          // l\xE0m tr\xF2n lu\xF4n cho ch\xEDnh ng\u01B0\u1EDDi b\u1EAFn \u0111\u1EC3 hai m\xE1y b\u1EAFt \u0111\u1EA7u c\xFA sau t\u1EEB c\xF9ng m\u1ED9t tr\u1EA1ng th\xE1i
          balls[i].x = Math.round(balls[i].x * 100) / 100;
          balls[i].y = Math.round(balls[i].y * 100) / 100;
          arr.push([balls[i].x, balls[i].y, balls[i].a ? 1 : 0]);
        }
        return arr;
      }

      function applySync(m) {
        for (var i = 0; i < 8; i++) {
          balls[i].x = m.b[i][0]; balls[i].y = m.b[i][1]; balls[i].a = !!m.b[i][2];
          balls[i].vx = 0; balls[i].vy = 0;
        }
        turn = m.turn; score = m.sc;
        pstate = m.over ? 'over' : 'aim';
        if (m.over) overAt = performance.now();
      }

      function finish() {
        acc = 0;
        pstate = 'aim';
        if (!iShot) {
          if (pend) { applySync(pend); pend = null; } else pstate = 'syncwait';
          return;
        }
        if (cueIn) {
          var px = HEADX, py = HEADY, k = 0;
          while (k < 60 && clash(px, py)) { px += 2; k++; }
          var cb = balls[0];
          cb.x = px; cb.y = py; cb.vx = 0; cb.vy = 0; cb.a = true;
        }
        score[turn] += potCount;
        shots++;
        if (mode === 'online' && !(potCount > 0 && !cueIn)) turn = 1 - turn;
        var left = 0;
        for (var i = 1; i < 8; i++) if (balls[i].a) left++;
        if (left === 0) { pstate = 'over'; overAt = performance.now(); }
        if (mode === 'online') {
          send({ t: 'sync', b: snapshot(), turn: turn, sc: score, over: pstate === 'over' ? 1 : 0 });
        }
      }

      function shoot(vx, vy, mine) {
        var cb = balls[0];
        cb.vx = vx; cb.vy = vy;
        potCount = 0; cueIn = false; iShot = mine; acc = 0;
        pstate = 'sim'; aim = null;
      }

      function canAim() {
        return pstate === 'aim' && (mode === 'solo' || (mode === 'online' && turn === me));
      }

      function send(o) {
        if (ws && ws.readyState === 1) ws.send(JSON.stringify(o));
      }

      function closeWs() {
        var w = ws; ws = null;
        if (w) { try { w.close(); } catch (e) {} }
      }

      function toMenu() {
        connId++;
        closeWs(); mode = ''; pstate = 'menu'; rack();
        showMenu(true); setMsg('');
      }

      function onMsg(m) {
        if (m.t === 'hello') {
          me = m.idx;
          setMsg('M\xE3 ph\xF2ng: ' + roomCode + '. G\u1EEDi m\xE3 n\xE0y cho b\u1EA1n b\xE8 nh\xE9!');
        } else if (m.t === 'start') {
          rack(); pstate = 'aim';
          setMsg('Ph\xF2ng ' + roomCode);
        } else if (m.t === 'shot') {
          if (pstate === 'aim' && turn !== me) shoot(m.vx, m.vy, false);
        } else if (m.t === 'sync') {
          if (pstate === 'sim') pend = m;
          else if (pstate === 'syncwait') applySync(m);
        } else if (m.t === 'again') {
          if (pstate === 'over') { rack(); pstate = 'aim'; }
        } else if (m.t === 'left') {
          rack(); pstate = 'wait';
          setMsg('\u0110\u1ED1i th\u1EE7 \u0111\xE3 tho\xE1t. M\xE3 ph\xF2ng ' + roomCode + ' v\u1EABn \u0111ang ch\u1EDD ng\u01B0\u1EDDi v\xE0o.');
        }
      }

      function connect(code) {
        closeWs();
        var token = ++connId;
        mode = 'online'; roomCode = code; pstate = 'wait'; me = 0; rack();
        setMsg('\u0110ang ki\u1EC3m tra k\u1EBFt n\u1ED1i...');
        // G\u1ECDi th\u1EED GET th\u01B0\u1EDDng: DO tr\u1EA3 426 ngh\u0129a l\xE0 Worker + Durable Object \u0111\u1EC1u \u1ED5n
        fetch('/__game/ws?room=' + code + '&g=pool', { cache: 'no-store' }).then(function (r) {
          if (token !== connId) return;
          if (r.status === 426) { openSocket(code); return; }
          toMenu();
          if (r.status === 501) setMsg('Worker ch\u01B0a g\u1EAFn Durable Object POOL: ki\u1EC3m tra binding v\xE0 migration trong wrangler.');
          else if (r.status === 409) setMsg('Ph\xF2ng ' + code + ' \u0111\xE3 \u0111\u1EE7 2 ng\u01B0\u1EDDi.');
          else if (r.status === 403) setMsg('B\u1ECB ch\u1EB7n v\xEC Origin kh\xF4ng kh\u1EDBp domain (403).');
          else if (r.status >= 500) setMsg('Durable Object l\u1ED7i (' + r.status + '): ki\u1EC3m tra export class PoolRoom v\xE0 migration.');
          else setMsg('Worker ch\u01B0a c\xF3 b\u1EA3n m\u1EDBi (m\xE3 ' + r.status + '): h\xE3y deploy l\u1EA1i worker.js.');
        }).catch(function () {
          if (token !== connId) return;
          toMenu(); setMsg('Kh\xF4ng g\u1ECDi \u0111\u01B0\u1EE3c Worker (l\u1ED7i m\u1EA1ng).');
        });
      }

      function openSocket(code) {
        var opened = false, mine;
        setMsg('\u0110ang k\u1EBFt n\u1ED1i...');
        var url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/__game/ws?room=' + code + '&g=pool';
        try { mine = new WebSocket(url); } catch (e) { toMenu(); setMsg('Tr\xECnh duy\u1EC7t kh\xF4ng m\u1EDF \u0111\u01B0\u1EE3c WebSocket.'); return; }
        ws = mine;
        mine.onopen = function () { opened = true; };
        mine.onmessage = function (ev) {
          if (mine !== ws) return;
          var m;
          try { m = JSON.parse(ev.data); } catch (e) { return; }
          onMsg(m);
        };
        mine.onclose = function () {
          if (mine !== ws) return;
          ws = null;
          toMenu();
          setMsg(opened ? 'M\u1EA5t k\u1EBFt n\u1ED1i t\u1EDBi ph\xF2ng.' : 'Kh\xF4ng m\u1EDF \u0111\u01B0\u1EE3c WebSocket (m\u1EA1ng/proxy ch\u1EB7n ho\u1EB7c WebSockets b\u1ECB t\u1EAFt tr\xEAn Cloudflare).');
        };
      }

      function rematch() {
        if (mode === 'online') send({ t: 'again' });
        rack(); pstate = 'aim';
      }

      function down(px, py) {
        if (pstate === 'over') {
          if (performance.now() - overAt > 400) rematch();
          return;
        }
        if (canAim()) aim = { sx: px, sy: py, cx: px, cy: py };
      }
      function move(px, py) { if (aim) { aim.cx = px; aim.cy = py; } }
      function cancel() { aim = null; }
      function up() {
        if (!aim) return;
        var dx = aim.cx - aim.sx, dy = aim.cy - aim.sy, len = Math.sqrt(dx * dx + dy * dy);
        aim = null;
        if (len < 12 || !canAim()) return;
        var p = Math.min(len, 110) / 110, sp = 140 + p * 760;
        var vx = -dx / len * sp, vy = -dy / len * sp;
        if (mode === 'online') send({ t: 'shot', vx: vx, vy: vy });
        shoot(vx, vy, true);
      }

      function update(dt) {
        if (pstate !== 'sim') return;
        acc += Math.min(dt, 0.05);
        var n = 0;
        while (acc >= DT && n < 12) {
          step(); acc -= DT; n++;
          if (!moving()) { finish(); break; }
        }
      }

      function rr(x0, y0, w, h, r) {
        x.beginPath();
        x.moveTo(x0 + r, y0);
        x.arcTo(x0 + w, y0, x0 + w, y0 + h, r);
        x.arcTo(x0 + w, y0 + h, x0, y0 + h, r);
        x.arcTo(x0, y0 + h, x0, y0, r);
        x.arcTo(x0, y0, x0 + w, y0, r);
        x.closePath();
      }

      function draw() {
        var i;
        x.clearRect(0, 0, W, H);
        x.fillStyle = '#fff7ed'; x.fillRect(0, 0, W, H);
        rr(8, 32, 464, 234, 16); x.fillStyle = '#9a3412'; x.fill();
        x.fillStyle = '#15803d'; x.fillRect(FL, FT, FR - FL, FB - FT);
        x.strokeStyle = '#14532d'; x.lineWidth = 2; x.strokeRect(FL, FT, FR - FL, FB - FT);
        x.strokeStyle = 'rgba(255,255,255,0.18)'; x.lineWidth = 1;
        x.beginPath(); x.moveTo(HEADX, FT); x.lineTo(HEADX, FB); x.stroke();
        x.fillStyle = '#111827';
        for (i = 0; i < 6; i++) {
          x.beginPath(); x.arc(POCK[i][0], POCK[i][1], PR - 1, 0, Math.PI * 2); x.fill();
        }
        for (i = 7; i >= 0; i--) {
          var b = balls[i];
          if (!b.a) continue;
          x.fillStyle = b.c; x.strokeStyle = 'rgba(0,0,0,0.35)'; x.lineWidth = 1;
          x.beginPath(); x.arc(b.x, b.y, R, 0, Math.PI * 2); x.fill(); x.stroke();
          x.fillStyle = 'rgba(255,255,255,0.55)';
          x.beginPath(); x.arc(b.x - 2.5, b.y - 2.5, 2, 0, Math.PI * 2); x.fill();
        }

        var pw = -1;
        if (aim && canAim()) {
          var cb = balls[0], dx = aim.cx - aim.sx, dy = aim.cy - aim.sy, len = Math.sqrt(dx * dx + dy * dy);
          if (len > 4) {
            var ux = -dx / len, uy = -dy / len;
            pw = Math.min(len, 110) / 110;
            var pull = 6 + pw * 34;
            x.setLineDash([4, 5]); x.strokeStyle = 'rgba(255,255,255,0.75)'; x.lineWidth = 1.5;
            x.beginPath(); x.moveTo(cb.x + ux * R, cb.y + uy * R); x.lineTo(cb.x + ux * 170, cb.y + uy * 170); x.stroke();
            x.setLineDash([]);
            x.strokeStyle = '#fcd34d'; x.lineWidth = 4; x.lineCap = 'round';
            x.beginPath();
            x.moveTo(cb.x - ux * (R + pull), cb.y - uy * (R + pull));
            x.lineTo(cb.x - ux * (R + pull + 110), cb.y - uy * (R + pull + 110));
            x.stroke();
          }
        }

        // HUD
        x.textBaseline = 'alphabetic';
        x.font = '700 14px Nunito Sans, sans-serif';
        if (mode === 'online') {
          var mine = (turn === me), live = (pstate === 'aim' || pstate === 'sim' || pstate === 'syncwait');
          x.textAlign = 'left';
          x.fillStyle = (live && mine) ? '#ea580c' : '#94a3b8';
          x.fillText((live && mine ? '\u25CF ' : '') + 'B\u1EA1n ' + score[me], 14, 22);
          x.textAlign = 'right';
          x.fillStyle = (live && !mine) ? '#ea580c' : '#94a3b8';
          x.fillText('\u0110\u1ED1i th\u1EE7 ' + score[1 - me] + (live && !mine ? ' \u25CF' : ''), W - 14, 22);
        } else if (mode === 'solo') {
          x.textAlign = 'left'; x.fillStyle = '#ea580c';
          x.fillText('\u0110\xE3 b\u1ECF ' + score[0] + '/7', 14, 22);
          x.textAlign = 'right'; x.fillStyle = '#9a3412';
          x.fillText('S\u1ED1 c\xFA ' + shots, W - 14, 22);
        }
        x.textAlign = 'center';
        if (pw >= 0) {
          x.fillStyle = '#fed7aa'; x.fillRect(190, 12, 100, 8);
          x.fillStyle = pw < 0.5 ? '#f59e0b' : '#dc2626'; x.fillRect(190, 12, 100 * pw, 8);
        } else {
          x.font = '600 12px Nunito Sans, sans-serif'; x.fillStyle = '#9a3412';
          var t = '';
          if (pstate === 'wait') t = 'Ch\u1EDD \u0111\u1ED1i th\u1EE7...';
          else if (pstate === 'syncwait') t = '\u0110ang \u0111\u1ED3ng b\u1ED9...';
          else if (pstate === 'aim' && mode === 'online') t = turn === me ? 'L\u01B0\u1EE3t c\u1EE7a b\u1EA1n' : 'L\u01B0\u1EE3t \u0111\u1ED1i th\u1EE7';
          x.fillText(t, W / 2, 22);
        }

        if (pstate === 'menu' || pstate === 'wait') {
          x.fillStyle = 'rgba(255,255,255,0.78)';
          x.fillRect(FL, FT, FR - FL, FB - FT);
          x.fillStyle = '#7c2d12'; x.font = '700 18px Nunito Sans, sans-serif';
          x.fillText(pstate === 'menu' ? 'Bi-a mini \u{1F3B1}' : '\u0110ang ch\u1EDD b\u1EA1n b\xE8 v\xE0o ph\xF2ng...', W / 2, 140);
          x.fillStyle = '#64748b'; x.font = '500 13px Nunito Sans, sans-serif';
          x.fillText(pstate === 'menu' ? 'Ch\u1ECDn ch\u1EBF \u0111\u1ED9 \u1EDF b\xEAn d\u01B0\u1EDBi' : 'M\xE3 ph\xF2ng: ' + roomCode, W / 2, 164);
        }
        if (pstate === 'over') {
          x.fillStyle = 'rgba(255,255,255,0.82)';
          x.fillRect(FL, FT, FR - FL, FB - FT);
          x.fillStyle = '#1e293b'; x.font = '700 22px Nunito Sans, sans-serif';
          var res;
          if (mode === 'solo') res = 'Xong r\u1ED3i! ' + shots + ' c\xFA';
          else res = score[me] > score[1 - me] ? 'B\u1EA1n th\u1EAFng! \u{1F389}' : '\u0110\u1ED1i th\u1EE7 th\u1EAFng';
          x.fillText(res, W / 2, 140);
          x.fillStyle = '#64748b'; x.font = '500 14px Nunito Sans, sans-serif';
          x.fillText('Ch\u1EA1m \u0111\u1EC3 ch\u01A1i l\u1EA1i', W / 2, 166);
        }
        x.textAlign = 'left';
      }

      // N\xFAt \u0111i\u1EC1u khi\u1EC3n
      el('pSolo').onclick = function () {
        closeWs(); mode = 'solo'; rack(); pstate = 'aim';
        showMenu(false); setMsg('');
      };
      el('pCreate').onclick = function () {
        var code = '';
        for (var i = 0; i < 4; i++) code += A.charAt(Math.floor(Math.random() * A.length));
        showMenu(false); connect(code);
      };
      el('pJoin').onclick = function () {
        var v = clean(el('pCode').value);
        if (v.length !== 4) { setMsg('Nh\u1EADp \u0111\u1EE7 4 k\xFD t\u1EF1 m\xE3 ph\xF2ng.'); return; }
        showMenu(false); connect(v);
      };
      el('pBack').onclick = toMenu;

      rack();
      return {
        w: 480, h: 270,
        hint: 'K\xE9o ng\u01B0\u1EE3c t\u1EEB b\u1EA5t k\u1EF3 \u0111\xE2u \u0111\u1EC3 ng\u1EAFm v\xE0 ch\u1EC9nh l\u1EF1c, th\u1EA3 tay \u0111\u1EC3 b\u1EAFn',
        update: update,
        draw: draw,
        down: down, move: move, up: up, cancel: cancel,
        key: function () {},
        leave: toMenu,
        busy: function () { return mode === 'online' && ws !== null; }
      };
    })();

`;

// src/page/client/caro.js
var clientCaro = `    // ===================== CARO =====================
    // B\xE0n 15x15, 5 qu\xE2n li\xEAn ti\u1EBFp th\u1EAFng. Theo lu\u1EADt caro Vi\u1EC7t Nam: b\u1ECB ch\u1EB7n c\u1EA3 hai \u0111\u1EA7u th\xEC kh\xF4ng t\xEDnh (\u0111\u1ED5i STRICT = false \u0111\u1EC3 b\u1ECF lu\u1EADt n\xE0y).
    var caro = (function () {
      var N = 15, CS = 29, X0 = 22, Y0 = 40, CW = 480, CH = 480;
      var STRICT = true;
      var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      var DIRS = [[0, 1], [1, 0], [1, 1], [1, -1]];
      var board = [], cstate = 'menu', mode = '', me = 0, turn = 0, last = null, win = null, winner = -2;
      var pend = null, hover = null, ws = null, roomCode = '', connId = 0, overAt = 0, botWait = 0;

      function el(id) { return document.getElementById(id); }
      function setMsg(t) { el('cMsg').textContent = t; }
      function showMenu(on) { el('cMenu').hidden = !on; el('cBack').hidden = on; }
      function clean(s) { return s.toUpperCase().replace(/[^A-Z0-9]/g, ''); }
      function myIdx() { return mode === 'bot' ? 0 : me; }

      function reset() {
        board = [];
        for (var i = 0; i < N * N; i++) board.push(0);
        turn = 0; last = null; win = null; winner = -2; pend = null; hover = null; botWait = 0;
      }

      function run(r, c, dr, dc, p) {
        var n = 0;
        r += dr; c += dc;
        while (r >= 0 && r < N && c >= 0 && c < N && board[r * N + c] === p) { n++; r += dr; c += dc; }
        return [n, r, c];
      }
      function isOpen(e) { return e[1] >= 0 && e[1] < N && e[2] >= 0 && e[2] < N && board[e[1] * N + e[2]] === 0; }
      function lineOf(r, c, dr, dc, p) {
        var a = run(r, c, dr, dc, p), b = run(r, c, -dr, -dc, p);
        return { len: 1 + a[0] + b[0], open: (isOpen(a) ? 1 : 0) + (isOpen(b) ? 1 : 0), a: a, b: b };
      }
      function checkWin(r, c, p) {
        for (var d = 0; d < 4; d++) {
          var dr = DIRS[d][0], dc = DIRS[d][1], L = lineOf(r, c, dr, dc, p);
          if (L.len >= 5 && (!STRICT || L.open > 0)) {
            var cells = [];
            for (var k = -L.b[0]; k <= L.a[0]; k++) cells.push([r + dr * k, c + dc * k]);
            return cells;
          }
        }
        return null;
      }

      function place(r, c, mover) {
        board[r * N + c] = mover + 1; last = [r, c]; pend = null;
        var w = checkWin(r, c, mover + 1);
        if (w) { win = w; winner = mover; cstate = 'over'; overAt = performance.now(); return; }
        var full = true;
        for (var i = 0; i < N * N; i++) if (board[i] === 0) { full = false; break; }
        if (full) { winner = -1; cstate = 'over'; overAt = performance.now(); return; }
        turn = 1 - turn;
        if (mode === 'bot' && turn === 1) botWait = 0.45;
      }

      // ---- M\xE1y \u0111\xE1nh: ch\u1EA5m \u0111i\u1EC3m t\u1EA5n c\xF4ng + ph\xF2ng th\u1EE7 cho t\u1EEBng \xF4 g\u1EA7n qu\xE2n \u0111\xE3 \u0111\xE1nh
      function score(n, open) {
        if (n >= 5) return (open > 0 || !STRICT) ? 100000 : 0;
        if (n === 4) return open === 2 ? 10000 : (open === 1 ? 1000 : 0);
        if (n === 3) return open === 2 ? 1000 : (open === 1 ? 100 : 0);
        if (n === 2) return open === 2 ? 100 : (open === 1 ? 10 : 0);
        return open === 2 ? 10 : 1;
      }
      function evalCell(r, c, p) {
        board[r * N + c] = p;
        var s = 0;
        for (var d = 0; d < 4; d++) {
          var L = lineOf(r, c, DIRS[d][0], DIRS[d][1], p);
          s += score(L.len, L.open);
        }
        board[r * N + c] = 0;
        return s;
      }
      function near(r, c) {
        for (var dr = -2; dr <= 2; dr++) {
          for (var dc = -2; dc <= 2; dc++) {
            var rr = r + dr, cc = c + dc;
            if (rr >= 0 && rr < N && cc >= 0 && cc < N && board[rr * N + cc] !== 0) return true;
          }
        }
        return false;
      }
      function botMove() {
        var any = false;
        for (var i = 0; i < N * N; i++) if (board[i] !== 0) { any = true; break; }
        if (!any) { place(7, 7, 1); return; }
        var best = -1, br = -1, bc = -1;
        for (var r = 0; r < N; r++) {
          for (var c = 0; c < N; c++) {
            if (board[r * N + c] !== 0 || !near(r, c)) continue;
            var sc = evalCell(r, c, 2) + evalCell(r, c, 1) * 0.95 + Math.random();
            if (sc > best) { best = sc; br = r; bc = c; }
          }
        }
        if (br >= 0) place(br, bc, 1);
      }

      function canMove() {
        return cstate === 'play' && (mode === 'bot' ? turn === 0 : (mode === 'online' && turn === me));
      }
      function cellAt(px, py) {
        var c = Math.floor((px - X0) / CS), r = Math.floor((py - Y0) / CS);
        if (r < 0 || r >= N || c < 0 || c >= N) return null;
        return [r, c];
      }
      function commit(r, c) {
        if (mode === 'online') send({ t: 'move', r: r, c: c });
        place(r, c, myIdx());
      }
      function down(px, py, pt) {
        if (cstate === 'over') { if (performance.now() - overAt > 400) rematch(); return; }
        if (!canMove()) return;
        var ce = cellAt(px, py);
        if (!ce || board[ce[0] * N + ce[1]] !== 0) return;
        // M\xE0n h\xECnh c\u1EA3m \u1EE9ng: ch\u1EA1m l\u1EA7n 1 \u0111\u1EC3 ch\u1ECDn \xF4, ch\u1EA1m l\u1EA7n 2 v\xE0o \u0111\xFAng \xF4 \u0111\xF3 \u0111\u1EC3 \u0111\xE1nh
        if (pt === 'touch' && !(pend && pend[0] === ce[0] && pend[1] === ce[1])) { pend = ce; return; }
        commit(ce[0], ce[1]);
      }
      function move(px, py, pt) { hover = (pt === 'mouse') ? cellAt(px, py) : null; }
      function out() { hover = null; }

      function update(dt) {
        if (mode === 'bot' && cstate === 'play' && turn === 1) {
          botWait -= dt;
          if (botWait <= 0) botMove();
        }
      }

      // ---- M\u1EA1ng
      function send(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
      function closeWs() {
        var w = ws; ws = null;
        if (w) { try { w.close(); } catch (e) {} }
      }
      function toMenu() {
        connId++;
        closeWs(); mode = ''; cstate = 'menu'; reset();
        showMenu(true); setMsg('');
      }
      function rematch() {
        if (mode === 'online') send({ t: 'again' });
        reset(); cstate = 'play';
      }
      function onMsg(m) {
        if (m.t === 'hello') {
          me = m.idx;
          setMsg('M\xE3 ph\xF2ng: ' + roomCode + '. G\u1EEDi m\xE3 n\xE0y cho b\u1EA1n b\xE8 nh\xE9!');
        } else if (m.t === 'start') {
          reset(); cstate = 'play';
          setMsg('Ph\xF2ng ' + roomCode + ' \u2022 B\u1EA1n l\xE0 ' + (me === 0 ? 'X (\u0111i tr\u01B0\u1EDBc)' : 'O'));
        } else if (m.t === 'move') {
          if (cstate !== 'play' || turn === me) return;
          var r = m.r, c = m.c;
          if (typeof r !== 'number' || typeof c !== 'number' || r < 0 || r >= N || c < 0 || c >= N) return;
          if (board[r * N + c] !== 0) return;
          place(r, c, 1 - me);
        } else if (m.t === 'again') {
          if (cstate === 'over') { reset(); cstate = 'play'; }
        } else if (m.t === 'left') {
          reset(); cstate = 'wait';
          setMsg('\u0110\u1ED1i th\u1EE7 \u0111\xE3 tho\xE1t. M\xE3 ph\xF2ng ' + roomCode + ' v\u1EABn \u0111ang ch\u1EDD ng\u01B0\u1EDDi v\xE0o.');
        }
      }
      function connect(code) {
        closeWs();
        var token = ++connId;
        mode = 'online'; roomCode = code; cstate = 'wait'; me = 0; reset();
        setMsg('\u0110ang ki\u1EC3m tra k\u1EBFt n\u1ED1i...');
        fetch('/__game/ws?room=' + code + '&g=caro', { cache: 'no-store' }).then(function (r) {
          if (token !== connId) return;
          if (r.status === 426) { openSocket(code); return; }
          toMenu();
          if (r.status === 501) setMsg('Worker ch\u01B0a g\u1EAFn Durable Object POOL: ki\u1EC3m tra binding v\xE0 migration trong wrangler.');
          else if (r.status === 409) setMsg('Ph\xF2ng ' + code + ' \u0111\xE3 \u0111\u1EE7 2 ng\u01B0\u1EDDi.');
          else if (r.status === 403) setMsg('B\u1ECB ch\u1EB7n v\xEC Origin kh\xF4ng kh\u1EDBp domain (403).');
          else if (r.status >= 500) setMsg('Durable Object l\u1ED7i (' + r.status + '): ki\u1EC3m tra export class PoolRoom v\xE0 migration.');
          else setMsg('Worker ch\u01B0a c\xF3 b\u1EA3n m\u1EDBi (m\xE3 ' + r.status + '): h\xE3y deploy l\u1EA1i worker.js.');
        }).catch(function () {
          if (token !== connId) return;
          toMenu(); setMsg('Kh\xF4ng g\u1ECDi \u0111\u01B0\u1EE3c Worker (l\u1ED7i m\u1EA1ng).');
        });
      }
      function openSocket(code) {
        var opened = false, mine;
        setMsg('\u0110ang k\u1EBFt n\u1ED1i...');
        var url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/__game/ws?room=' + code + '&g=caro';
        try { mine = new WebSocket(url); } catch (e) { toMenu(); setMsg('Tr\xECnh duy\u1EC7t kh\xF4ng m\u1EDF \u0111\u01B0\u1EE3c WebSocket.'); return; }
        ws = mine;
        mine.onopen = function () { opened = true; };
        mine.onmessage = function (ev) {
          if (mine !== ws) return;
          var m;
          try { m = JSON.parse(ev.data); } catch (e) { return; }
          onMsg(m);
        };
        mine.onclose = function () {
          if (mine !== ws) return;
          ws = null;
          toMenu();
          setMsg(opened ? 'M\u1EA5t k\u1EBFt n\u1ED1i t\u1EDBi ph\xF2ng.' : 'Kh\xF4ng m\u1EDF \u0111\u01B0\u1EE3c WebSocket (m\u1EA1ng/proxy ch\u1EB7n ho\u1EB7c WebSockets b\u1ECB t\u1EAFt tr\xEAn Cloudflare).');
        };
      }

      // ---- V\u1EBD
      function mark(cx, cy, v, alpha) {
        var px = X0 + cx * CS + CS / 2, py = Y0 + cy * CS + CS / 2;
        x.globalAlpha = alpha; x.lineWidth = 3; x.lineCap = 'round';
        if (v === 1) {
          x.strokeStyle = '#ea580c';
          x.beginPath();
          x.moveTo(px - 8, py - 8); x.lineTo(px + 8, py + 8);
          x.moveTo(px + 8, py - 8); x.lineTo(px - 8, py + 8);
          x.stroke();
        } else {
          x.strokeStyle = '#2563eb';
          x.beginPath(); x.arc(px, py, 9, 0, Math.PI * 2); x.stroke();
        }
        x.globalAlpha = 1;
      }

      function draw() {
        var i, r, c;
        x.clearRect(0, 0, CW, CH);
        x.fillStyle = '#fff7ed'; x.fillRect(0, 0, CW, CH);
        x.fillStyle = '#fffbeb'; x.fillRect(X0, Y0, N * CS, N * CS);
        if (last) { x.fillStyle = 'rgba(253,186,116,0.5)'; x.fillRect(X0 + last[1] * CS, Y0 + last[0] * CS, CS, CS); }
        if (win) {
          x.fillStyle = 'rgba(250,204,21,0.55)';
          for (i = 0; i < win.length; i++) x.fillRect(X0 + win[i][1] * CS, Y0 + win[i][0] * CS, CS, CS);
        }
        x.strokeStyle = '#fdba74'; x.lineWidth = 1;
        x.beginPath();
        for (i = 0; i <= N; i++) {
          x.moveTo(X0 + i * CS + 0.5, Y0); x.lineTo(X0 + i * CS + 0.5, Y0 + N * CS);
          x.moveTo(X0, Y0 + i * CS + 0.5); x.lineTo(X0 + N * CS, Y0 + i * CS + 0.5);
        }
        x.stroke();
        x.strokeStyle = '#ea580c'; x.lineWidth = 2; x.strokeRect(X0, Y0, N * CS, N * CS);
        for (r = 0; r < N; r++) {
          for (c = 0; c < N; c++) {
            if (board[r * N + c]) mark(c, r, board[r * N + c], 1);
          }
        }
        var ghost = pend || hover;
        if (ghost && canMove() && board[ghost[0] * N + ghost[1]] === 0) {
          mark(ghost[1], ghost[0], myIdx() + 1, 0.4);
          if (pend) {
            x.strokeStyle = '#ea580c'; x.lineWidth = 1.5;
            x.strokeRect(X0 + ghost[1] * CS + 1.5, Y0 + ghost[0] * CS + 1.5, CS - 3, CS - 3);
          }
        }

        // HUD
        var live = (cstate === 'play');
        var mine = (turn === myIdx());
        var myMark = myIdx() === 0 ? 'X' : 'O', opMark = myIdx() === 0 ? 'O' : 'X';
        x.font = '700 15px Nunito Sans, sans-serif'; x.textBaseline = 'alphabetic';
        x.textAlign = 'left';
        x.fillStyle = (live && mine) ? '#ea580c' : '#94a3b8';
        x.fillText((live && mine ? '\u25CF ' : '') + 'B\u1EA1n (' + myMark + ')', 22, 26);
        x.textAlign = 'right';
        x.fillStyle = (live && !mine) ? '#ea580c' : '#94a3b8';
        x.fillText((mode === 'bot' ? 'M\xE1y' : '\u0110\u1ED1i th\u1EE7') + ' (' + opMark + ')' + (live && !mine ? ' \u25CF' : ''), W2() - 22, 26);
        x.textAlign = 'center';

        if (cstate === 'menu' || cstate === 'wait') {
          x.fillStyle = 'rgba(255,255,255,0.82)';
          x.fillRect(X0, Y0, N * CS, N * CS);
          x.fillStyle = '#7c2d12'; x.font = '700 22px Nunito Sans, sans-serif';
          x.fillText(cstate === 'menu' ? 'Caro \u2B55\u274C' : '\u0110ang ch\u1EDD b\u1EA1n b\xE8 v\xE0o ph\xF2ng...', CW / 2, 250);
          x.fillStyle = '#64748b'; x.font = '500 14px Nunito Sans, sans-serif';
          x.fillText(cstate === 'menu' ? 'Ch\u1ECDn ch\u1EBF \u0111\u1ED9 \u1EDF b\xEAn d\u01B0\u1EDBi' : 'M\xE3 ph\xF2ng: ' + roomCode, CW / 2, 280);
        }
        if (cstate === 'over') {
          var res;
          if (winner === -1) res = 'H\xF2a!';
          else if (winner === myIdx()) res = 'B\u1EA1n th\u1EAFng! \u{1F389}';
          else res = mode === 'bot' ? 'M\xE1y th\u1EAFng' : '\u0110\u1ED1i th\u1EE7 th\u1EAFng';
          x.fillStyle = 'rgba(255,255,255,0.9)'; x.fillRect(70, 200, 340, 90);
          x.strokeStyle = '#fdba74'; x.lineWidth = 2; x.strokeRect(70, 200, 340, 90);
          x.fillStyle = '#1e293b'; x.font = '700 24px Nunito Sans, sans-serif';
          x.fillText(res, CW / 2, 238);
          x.fillStyle = '#64748b'; x.font = '500 14px Nunito Sans, sans-serif';
          x.fillText('Ch\u1EA1m \u0111\u1EC3 ch\u01A1i l\u1EA1i', CW / 2, 268);
        }
        x.textAlign = 'left';
      }
      function W2() { return CW; }

      el('cBot').onclick = function () {
        closeWs(); connId++; mode = 'bot'; reset(); cstate = 'play';
        showMenu(false); setMsg('B\u1EA1n l\xE0 X v\xE0 \u0111i tr\u01B0\u1EDBc.');
      };
      el('cCreate').onclick = function () {
        var code = '';
        for (var i = 0; i < 4; i++) code += A.charAt(Math.floor(Math.random() * A.length));
        showMenu(false); connect(code);
      };
      el('cJoin').onclick = function () {
        var v = clean(el('cCode').value);
        if (v.length !== 4) { setMsg('Nh\u1EADp \u0111\u1EE7 4 k\xFD t\u1EF1 m\xE3 ph\xF2ng.'); return; }
        showMenu(false); connect(v);
      };
      el('cBack').onclick = toMenu;

      reset();
      globalThis.__c = function () { return { board: board, cstate: cstate, turn: turn, winner: winner, mode: mode, me: me, win: win }; };
      return {
        w: CW, h: CH,
        hint: 'Ch\u1EA1m v\xE0o \xF4 \u0111\u1EC3 \u0111\xE1nh (tr\xEAn \u0111i\u1EC7n tho\u1EA1i: ch\u1EA1m l\u1EA7n 1 \u0111\u1EC3 ch\u1ECDn \xF4, ch\u1EA1m l\u1EA7n 2 \u0111\u1EC3 x\xE1c nh\u1EADn)',
        update: update, draw: draw, down: down, move: move, out: out,
        key: function () {},
        leave: toMenu,
        busy: function () { return mode === 'online' && ws !== null; }
      };
    })();

`;

// src/page/client/sword.js
var clientSword = `    // ===================== \u0110\u1EA4U KI\u1EBEM =====================
    // Hai ki\u1EBFm s\u0129 que giao ki\u1EBFm tr\xEAn b\u1EE5c \u0111\xE1. M\u1ED7i m\xE1y t\u1EF1 ch\u1EA1y nh\xE2n v\u1EADt c\u1EE7a m\xECnh v\xE0 g\u1EEDi t\u01B0 th\u1EBF cho \u0111\u1ED1i th\u1EE7
    // (qua c\xF9ng Durable Object v\u1EDBi Bi-a / Caro). M\xE1y b\u1ECB tr\xFAng \u0111\xF2n t\u1EF1 t\xEDnh s\xE1t th\u01B0\u01A1ng cho m\xECnh.
    var sword = (function () {
      var SW = 680, SH = 400, GY = 300, PL = 160, PR = 520;
      var A = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      var TEAM = ['#2ec4b6', '#ff6b4a'];
      var NAMES = ['dusk', 'night', 'snow'];
      var WIN_ROUNDS = 2, ROUND_TIME = 60;
      var PAL = {
        dusk: { sky1: '#5b4a8a', sky2: '#c9627a', sky3: '#f4a261', sun: '#ffe3b3', craterop: 0, starop: 0, cloud: '#ffd0a8', r1: '#8e5a8f', r2: '#5e3b6e', r3: '#3b2552', water: '#2a1c3d', wline: '#f4a261', stone: '#5a4a5c', stoneTop: '#8a7690', stoneDark: '#2f2438', post: '#3a2a20', lantern: '#ffb347', ink: '#1c1530', hudbg: '#1c1530', hudtext: '#fff3e0', petal: '#ffd1dc', edge: '#44506a' },
        night: { sky1: '#0b1030', sky2: '#16204d', sky3: '#243268', sun: '#e9eeff', craterop: 0.5, starop: 1, cloud: '#3a4a8a', r1: '#1a2350', r2: '#121a3d', r3: '#0b1230', water: '#0a0f26', wline: '#8fa0d8', stone: '#3b4163', stoneTop: '#5a628c', stoneDark: '#161a33', post: '#241a2e', lantern: '#ffd166', ink: '#cfd8ff', hudbg: '#05081c', hudtext: '#e9eeff', petal: '#ffe08a', edge: '#8fa0d8' },
        snow: { sky1: '#b9d3e8', sky2: '#d4e4f0', sky3: '#eaf2f8', sun: '#ffffff', craterop: 0, starop: 0, cloud: '#ffffff', r1: '#9db8d1', r2: '#8aa7c2', r3: '#6f8fae', water: '#cfe0ee', wline: '#ffffff', stone: '#9aa7b5', stoneTop: '#dde6ee', stoneDark: '#5f6d7d', post: '#4a3a35', lantern: '#e4572e', ink: '#1f2f44', hudbg: '#1f2f44', hudtext: '#ffffff', petal: '#ffffff', edge: '#44506a' }
      };
      var STARS = [[60, 30, 1.5], [150, 60, 1.5], [230, 20, 2], [300, 78, 1.5], [420, 34, 1.5], [520, 70, 2], [600, 26, 1.5], [640, 90, 1.5], [90, 92, 1.5], [480, 100, 1.5]];
      var bgCv = null, bgName = '';
      var scene = 'dusk';

      var sstate = 'menu', mode = '', me = 0, ws = null, roomCode = '', connId = 0;
      var F = [], wins = [0, 0], round = 1, timeLeft = ROUND_TIME, readyT = 0, rendT = 0, roundWin = -2;
      var keys = {}, shake = 0, clashT = 0, sendT = 0, fxs = [], floats = [], petals = [], rt = null;
      var bot = { t: 0, m: 'approach', dir: 1, mv: 0 };

      function el(id) { return document.getElementById(id); }
      function setMsg(t) { el('sMsg').textContent = t; }
      function showMenu(on) { el('sMenu').hidden = !on; el('sBack').hidden = on; }
      function clean(s) { return s.toUpperCase().replace(/[^A-Z0-9]/g, ''); }
      function rnd(a, b) { return a + Math.random() * (b - a); }
      function clamp(v, a, b) { return v < a ? a : (v > b ? b : v); }
      function localIdx() { return mode === 'bot' ? 0 : me; }
      function pickScene() { return NAMES[Math.floor(Math.random() * NAMES.length)]; }

      // ---------- v\u1EBD c\u1EA3nh n\u1EC1n (v\u1EBD m\u1ED9t l\u1EA7n v\xE0o canvas ph\u1EE5 r\u1ED3i d\xF9ng l\u1EA1i) ----------
      function rr(g, px, py, w, h, r) {
        g.beginPath(); g.moveTo(px + r, py); g.arcTo(px + w, py, px + w, py + h, r); g.arcTo(px + w, py + h, px, py + h, r);
        g.arcTo(px, py + h, px, py, r); g.arcTo(px, py, px + w, py, r); g.closePath(); g.fill();
      }
      function disc(g, cx, cy, r) { g.beginPath(); g.arc(cx, cy, r, 0, 6.2832); g.fill(); }
      function paintScene(g, p) {
        var i;
        g.fillStyle = p.sky1; g.fillRect(0, 0, SW, 110);
        g.fillStyle = p.sky2; g.fillRect(0, 110, SW, 90);
        g.fillStyle = p.sky3; g.fillRect(0, 200, SW, 110);
        if (p.starop) { g.fillStyle = '#ffffff'; for (i = 0; i < STARS.length; i++) disc(g, STARS[i][0], STARS[i][1], STARS[i][2]); }
        g.fillStyle = p.sun; disc(g, 340, 178, 64);
        if (p.craterop) { g.globalAlpha = p.craterop; g.fillStyle = p.sky2; disc(g, 322, 160, 9); disc(g, 356, 190, 6); disc(g, 330, 200, 4); g.globalAlpha = 1; }
        g.globalAlpha = 0.6; g.fillStyle = p.cloud; rr(g, 420, 96, 120, 8, 4); rr(g, 450, 110, 90, 6, 3); rr(g, 90, 140, 110, 7, 3.5); g.globalAlpha = 1;
        g.fillStyle = p.r1; g.fill(new Path2D('M0 262 Q90 232 180 258 T360 250 T520 256 T680 240 V310 H0Z'));
        g.fillStyle = p.r2;
        g.fill(new Path2D('M84 258 L136 258 L124 246 L96 246Z M90 246 L130 246 L121 236 L99 236Z M95 236 L125 236 L118 227 L102 227Z M108 211 L112 211 L112 227 L108 227Z'));
        g.fill(new Path2D('M0 282 Q120 252 240 278 T480 270 T680 282 V310 H0Z'));
        g.fillStyle = p.water; g.fillRect(0, 304, SW, 96);
        g.fillStyle = p.r3;
        g.fill(new Path2D('M0 286 Q70 282 140 302 L140 318 L0 318Z M680 286 Q610 282 540 302 L540 318 L680 318Z M40 292 L54 250 L68 292Z M58 296 L70 264 L82 296Z M590 292 L604 246 L618 292Z M608 296 L620 262 L632 296Z'));
        g.strokeStyle = p.wline; g.lineWidth = 1.5; g.lineCap = 'round'; g.globalAlpha = 0.5;
        var wl = [[50, 340, 120], [80, 356, 130], [560, 346, 640], [590, 366, 640], [190, 372, 250], [430, 376, 510]];
        for (i = 0; i < wl.length; i++) { g.beginPath(); g.moveTo(wl[i][0], wl[i][1]); g.lineTo(wl[i][2], wl[i][1]); g.stroke(); }
        g.globalAlpha = 0.28; g.fillStyle = p.stoneDark; g.fillRect(PL, 338, PR - PL, 30); g.globalAlpha = 1;
        g.fillStyle = p.stone; g.fillRect(PL, GY, PR - PL, 38);
        g.fillStyle = p.stoneTop; g.fillRect(PL, GY, PR - PL, 7);
        g.strokeStyle = p.stoneDark; g.lineWidth = 1.5;
        for (i = 220; i <= 460; i += 60) { g.beginPath(); g.moveTo(i, 307); g.lineTo(i, 338); g.stroke(); }
        g.fillStyle = p.post; g.fillRect(168, 254, 8, 46); g.fillRect(504, 254, 8, 46);
        g.strokeStyle = p.post; g.lineWidth = 2;
        g.beginPath(); g.moveTo(172, 236); g.lineTo(172, 254); g.moveTo(508, 236); g.lineTo(508, 254); g.stroke();
        g.fillStyle = p.lantern; rr(g, 164, 226, 16, 20, 4); rr(g, 500, 226, 16, 20, 4);
        g.fillStyle = TEAM[0]; g.fill(new Path2D('M176 258 l28 6 l-28 6Z'));
        g.fillStyle = TEAM[1]; g.fill(new Path2D('M504 258 l-28 6 l28 6Z'));
      }
      function ensureBg() {
        if (bgCv && bgName === scene) return;
        if (!bgCv) { bgCv = document.createElement('canvas'); bgCv.width = SW * dpr; bgCv.height = SH * dpr; }
        var g = bgCv.getContext('2d');
        g.setTransform(dpr, 0, 0, dpr, 0, 0);
        paintScene(g, PAL[scene]);
        bgName = scene;
      }
      function initPetals() {
        petals = [];
        for (var i = 0; i < 18; i++) petals.push({ x: rnd(0, SW), y: rnd(0, 300), vx: rnd(-14, -4), vy: rnd(8, 22), r: rnd(1.6, 3), ph: rnd(0, 6) });
      }

      // ---------- nh\xE2n v\u1EADt ----------
      function newFighter(i) {
        return { i: i, x: i ? 430 : 250, y: GY, vx: 0, vy: 0, g: true, face: i ? -1 : 1, sa: 0.2, e: 0.85, cr: 0, hp: 100,
          inv: 0, stun: 0, sl: 0, slCd: 0, sa0: 0, e0: 0, ph: 0, speed: 0, px: 0, py: 0, has: false, dead: false };
      }
      function resetFighters() {
        F = [newFighter(0), newFighter(1)];
        rt = null; clashT = 0; fxs = []; floats = [];
      }
      function ik(h, f, l1, l2, dir) {
        var dx = f[0] - h[0], dy = f[1] - h[1], dd = Math.sqrt(dx * dx + dy * dy), maxd = l1 + l2 - 0.5;
        if (dd > maxd) { dx *= maxd / dd; dy *= maxd / dd; dd = maxd; }
        if (dd < 1) dd = 1;
        var a = (l1 * l1 - l2 * l2 + dd * dd) / (2 * dd);
        var hh = Math.sqrt(Math.max(0, l1 * l1 - a * a));
        var ux = dx / dd, uy = dy / dd, px = -uy, py = ux;
        var sg = (px * dir >= 0) ? 1 : -1;
        return [h[0] + ux * a + px * hh * sg, h[1] + uy * a + py * hh * sg, h[0] + dx, h[1] + dy];
      }
      function pose(f) {
        var d = f.face;
        var legH = 44 - f.cr * 15;
        var bob = f.g ? Math.sin(tm * 2.6 + f.i * 1.7) * 1.2 * (1 - f.cr) : 0;
        var hipY = f.y - legH + bob;
        var hip = [f.x, hipY];
        var sh = [f.x, hipY - 34 + f.cr * 4];
        var neck = [f.x, hipY - 40 + f.cr * 4];
        var head = [f.x, neck[1] - 13];
        var a1 = f.sa, a2 = a1 + (1 - f.e) * 1.5;
        var elbow = [sh[0] + d * Math.cos(a1) * 24, sh[1] - Math.sin(a1) * 24];
        var hand = [elbow[0] + d * Math.cos(a2) * 22, elbow[1] - Math.sin(a2) * 22];
        var tip = [hand[0] + d * Math.cos(a2) * 60, hand[1] - Math.sin(a2) * 60];
        var bel = [sh[0] - d * 10, sh[1] + 12], bh = [sh[0] - d * 6, sh[1] + 26];
        var stride = f.g ? 14 * Math.min(1, Math.abs(f.vx) / 100) : 0;
        var s = Math.sin(f.ph) * stride, lift = f.g ? Math.max(0, Math.cos(f.ph)) * 5 * Math.min(1, Math.abs(f.vx) / 100) : 0;
        var ff, bf;
        if (f.g) { ff = [f.x + d * (10 + s), f.y - lift]; bf = [f.x - d * (10 + s), f.y]; }
        else { ff = [f.x + d * 12, f.y - 18]; bf = [f.x - d * 8, f.y - 10]; }
        var k1 = ik(hip, ff, 24, 24, d), k2 = ik(hip, bf, 24, 24, d);
        return { hip: hip, sh: sh, neck: neck, head: head, elbow: elbow, hand: hand, tip: tip, bel: bel, bh: bh,
          kf: [k1[0], k1[1]], ff: [k1[2], k1[3]], kb: [k2[0], k2[1]], bf: [k2[2], k2[3]] };
      }

      // ---------- h\xECnh h\u1ECDc va ch\u1EA1m ----------
      function closest(a, b, c, d) {
        var d1x = b[0] - a[0], d1y = b[1] - a[1], d2x = d[0] - c[0], d2y = d[1] - c[1], rx = a[0] - c[0], ry = a[1] - c[1];
        var aa = d1x * d1x + d1y * d1y, ee = d2x * d2x + d2y * d2y, ff = d2x * rx + d2y * ry, s, t;
        if (aa < 1e-6 && ee < 1e-6) { s = 0; t = 0; }
        else if (aa < 1e-6) { s = 0; t = clamp(ff / ee, 0, 1); }
        else {
          var cc = d1x * rx + d1y * ry;
          if (ee < 1e-6) { t = 0; s = clamp(-cc / aa, 0, 1); }
          else {
            var bb = d1x * d2x + d1y * d2y, den = aa * ee - bb * bb;
            s = den > 1e-6 ? clamp((bb * ff - cc * ee) / den, 0, 1) : 0;
            t = (bb * s + ff) / ee;
            if (t < 0) { t = 0; s = clamp(-cc / aa, 0, 1); }
            else if (t > 1) { t = 1; s = clamp((bb - cc) / aa, 0, 1); }
          }
        }
        var p1x = a[0] + d1x * s, p1y = a[1] + d1y * s, p2x = c[0] + d2x * t, p2y = c[1] + d2y * t;
        var dx = p1x - p2x, dy = p1y - p2y;
        return { d: Math.sqrt(dx * dx + dy * dy), x: (p1x + p2x) / 2, y: (p1y + p2y) / 2 };
      }

      // ---------- hi\u1EC7u \u1EE9ng ----------
      function sparks(px, py, col, n, sp) {
        for (var i = 0; i < n; i++) {
          var an = rnd(0, 6.283), v = rnd(sp * 0.4, sp);
          fxs.push({ x: px, y: py, vx: Math.cos(an) * v, vy: Math.sin(an) * v - 30, life: rnd(0.25, 0.5), t: 0, col: col });
        }
      }
      function floatText(px, py, txt, col) { floats.push({ x: px, y: py, t: 0, s: txt, col: col }); }

      // ---------- v\u1EADt l\xFD v\xE0 \u0111i\u1EC1u khi\u1EC3n ----------
      function stepFighter(f, inp, dt, active) {
        var can = active && !f.dead && f.stun <= 0;
        if (f.inv > 0) f.inv -= dt;
        if (f.stun > 0) f.stun -= dt;
        if (f.slCd > 0) f.slCd -= dt;
        var mv = 0;
        if (can) mv = inp.mv || 0;
        var crouch = can && inp.crouch && f.g;
        f.cr += ((crouch || f.dead ? 1 : 0) - f.cr) * Math.min(1, dt * 14);
        var spd = f.cr > 0.5 ? 70 : 150;
        var tvx = mv * spd;
        var rate = f.g ? 10 : 2.5;
        f.vx += (tvx - f.vx) * Math.min(1, dt * rate);
        if (can && inp.jump && f.g) { f.vy = -390; f.g = false; }
        f.vy += 1100 * dt;
        f.x += f.vx * dt;
        var prevY = f.y;
        f.y += f.vy * dt;
        if (f.y > 700) { f.y = 700; f.vy = 0; }
        var sup = f.x > PL - 4 && f.x < PR + 4;
        if (sup && f.vy >= 0 && prevY <= GY + 1 && f.y >= GY) { f.y = GY; f.vy = 0; f.g = true; }
        else if (f.g && !sup) f.g = false;
        if (f.g) f.ph += dt * Math.abs(f.vx) * 0.07;
        // c\xE1nh tay
        if (f.dead) {
          f.sa += (-1.3 - f.sa) * Math.min(1, dt * 4); f.e += (1 - f.e) * Math.min(1, dt * 4);
        } else if (f.stun > 0) {
          f.sa += (-0.5 - f.sa) * Math.min(1, dt * 8); f.sl = 0;
        } else if (f.sl > 0) {
          f.sl -= dt;
          var t = 0.30 - f.sl, k, k2;
          if (t < 0.10) { k = t / 0.10; f.sa = f.sa0 + (1.25 - f.sa0) * k; f.e = f.e0 + (0.45 - f.e0) * k; }
          else { k = clamp((t - 0.10) / 0.20, 0, 1); k2 = k * k; f.sa = 1.25 - 2.0 * k2; f.e = 0.45 + 0.55 * k; f.vx += f.face * 260 * dt; }
        } else if (can) {
          f.sa = clamp(f.sa + ((inp.sUp ? 1 : 0) - (inp.sDn ? 1 : 0)) * 3.2 * dt, -1.3, 1.45);
          f.e = clamp(f.e + ((inp.eUp ? 1 : 0) - (inp.eDn ? 1 : 0)) * 3.0 * dt, 0, 1);
          if (inp.slash && f.slCd <= 0) { f.sl = 0.30; f.slCd = 0.9; f.sa0 = f.sa; f.e0 = f.e; }
        }
      }
      function kin(f, dt) {
        var p = pose(f);
        if (f.has && dt > 0) {
          var dx = p.tip[0] - f.px, dy = p.tip[1] - f.py;
          f.speed += (Math.min(1800, Math.sqrt(dx * dx + dy * dy) / dt) - f.speed) * 0.6;
        }
        f.px = p.tip[0]; f.py = p.tip[1]; f.has = true;
      }
      function tryHit(att, vic) {
        if (vic.inv > 0 || clashT > 0 || vic.dead || att.speed < 170) return false;
        var pa = pose(att), pv = pose(vic), part = '';
        var hd = closest(pv.head, pv.head, pa.hand, pa.tip);
        if (hd.d < 13) part = 'head';
        else if (closest(pv.neck, pv.hip, pa.hand, pa.tip).d < 10) part = 'body';
        if (!part) return false;
        var dmg = Math.min(18, 3 + (att.speed - 170) * 0.02);
        if (part === 'head') dmg = Math.min(26, dmg * 1.5);
        dmg = Math.round(dmg);
        vic.hp = Math.max(0, vic.hp - dmg);
        vic.inv = 0.45; vic.stun = 0.22; vic.sl = 0;
        vic.vx += att.face * 230;
        shake = 7;
        sparks(pv.head[0], part === 'head' ? pv.head[1] : (pv.neck[1] + pv.hip[1]) / 2, '#ff4d4d', 10, 160);
        floatText(vic.x, pv.head[1] - 20, '-' + dmg, '#ff4d4d');
        if (mode === 'online') {
          send({ t: 'hit', d: dmg, x: Math.round(vic.x), y: Math.round(pv.head[1]) });
          sendT = 0;
        }
        return true;
      }
      function tryClash(a, b) {
        if (clashT > 0) return;
        if (Math.max(a.speed, b.speed) < 150) return;
        var pa = pose(a), pb = pose(b);
        var c = closest(pa.hand, pa.tip, pb.hand, pb.tip);
        if (c.d > 5) return;
        clashT = 0.3; shake = 5;
        sparks(c.x, c.y, '#ffd166', 14, 220);
        fxs.push({ x: c.x, y: c.y, vx: 0, vy: 0, life: 0.22, t: 0, col: '#ffffff', star: true });
        var L = localIdx(), i;
        for (i = 0; i < 2; i++) {
          if (mode === 'bot' || i === L) {
            F[i].vx += -F[i].face * 170; F[i].stun = 0.16; F[i].sl = 0; F[i].sa = clamp(F[i].sa - 0.3, -1.3, 1.45);
          }
        }
      }

      // ---------- m\xE1y \u0111\xE1nh ----------
      function botInput(dt) {
        var b = F[1], p = F[0], inp = {};
        var dx = p.x - b.x, dist = Math.abs(dx), dir = dx > 0 ? 1 : -1, r;
        bot.t -= dt;
        if (p.sl > 0 && dist < 135 && bot.m !== 'guard' && Math.random() < 0.05) { bot.m = Math.random() < 0.5 ? 'guard' : 'retreat'; bot.t = 0.4; }
        if (bot.t <= 0) {
          r = Math.random();
          if (dist > 135) { bot.m = 'approach'; bot.t = rnd(0.25, 0.5); }
          else if (dist < 66) { bot.m = r < 0.55 ? 'retreat' : 'slash'; bot.t = 0.3; }
          else {
            if (r < 0.40) bot.m = 'slash'; else if (r < 0.62) bot.m = 'guard'; else if (r < 0.80) bot.m = 'poke'; else bot.m = 'strafe';
            bot.t = rnd(0.35, 0.8); bot.dir = Math.random() < 0.5 ? 1 : -1;
          }
        }
        var tsa = 0.25, te = 0.8;
        if (bot.m === 'approach') inp.mv = dir;
        else if (bot.m === 'retreat') { inp.mv = -dir; tsa = 0.5; te = 0.55; }
        else if (bot.m === 'guard') { tsa = 0.55; te = 0.5; inp.mv = dist < 90 ? -dir * 0.5 : 0; }
        else if (bot.m === 'poke') { tsa = 0.05; te = 1; inp.mv = dist > 95 ? dir * 0.6 : 0; }
        else if (bot.m === 'strafe') inp.mv = bot.dir * 0.6;
        else if (bot.m === 'slash') { inp.mv = dist > 100 ? dir * 0.5 : 0; if (dist < 125) inp.slash = true; }
        if (Math.random() < dt * 0.15 && b.g) inp.jump = true;
        if ((b.x > PR - 34 && inp.mv > 0) || (b.x < PL + 34 && inp.mv < 0)) inp.mv = 0;
        inp.sUp = b.sa < tsa - 0.04; inp.sDn = b.sa > tsa + 0.04; inp.eUp = b.e < te - 0.05; inp.eDn = b.e > te + 0.05;
        return inp;
      }
      function keyInput() {
        return {
          mv: (keys.KeyD ? 1 : 0) - (keys.KeyA ? 1 : 0), jump: !!keys.KeyW, crouch: !!keys.KeyS,
          sUp: !!keys.ArrowRight, sDn: !!keys.ArrowLeft, eUp: !!keys.ArrowUp, eDn: !!keys.ArrowDown, slash: !!keys.Space
        };
      }

      // ---------- lu\u1EADt hi\u1EC7p \u0111\u1EA5u ----------
      function startMatch(sc) {
        scene = sc || scene; wins = [0, 0]; round = 1;
        resetFighters(); timeLeft = ROUND_TIME; readyT = 2.2; sstate = 'ready'; roundWin = -2;
        initPetals();
      }
      function nextRound() {
        round++; resetFighters(); timeLeft = ROUND_TIME; readyT = 2.2; sstate = 'ready'; roundWin = -2;
      }
      function roundEnd(w) {
        if (sstate !== 'fight') return;
        sstate = 'rend'; rendT = 2.4; roundWin = w;
        if (w >= 0) wins[w]++;
        if (w >= 0) F[1 - w].dead = true;
        else { F[0].stun = 0; F[1].stun = 0; }
        shake = 6;
      }
      function nameOf(i) {
        if (mode === 'bot') return i === 0 ? 'B\u1EA1n' : 'M\xE1y';
        return i === me ? 'B\u1EA1n' : '\u0110\u1ED1i th\u1EE7';
      }
      function rematch() {
        var sc = pickScene();
        if (mode === 'online') send({ t: 'again', n: sc });
        startMatch(sc);
      }

      function update(dt) {
        var i, p;
        for (i = 0; i < petals.length; i++) {
          p = petals[i]; p.ph += dt;
          p.x += (p.vx + Math.sin(p.ph) * 8) * dt; p.y += p.vy * dt;
          if (p.y > 310 || p.x < -10) { p.y = -6; p.x = rnd(0, SW + 40); }
        }
        for (i = fxs.length - 1; i >= 0; i--) {
          p = fxs[i]; p.t += dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 420 * dt;
          if (p.t > p.life) fxs.splice(i, 1);
        }
        for (i = floats.length - 1; i >= 0; i--) { floats[i].t += dt; floats[i].y -= 28 * dt; if (floats[i].t > 0.9) floats.splice(i, 1); }
        if (shake > 0) shake = Math.max(0, shake - dt * 30);
        if (clashT > 0) clashT -= dt;
        if (sstate === 'menu' || sstate === 'wait') return;

        var active = sstate === 'fight', L = localIdx(), R = 1 - L, empty = {};
        if (mode === 'bot') {
          stepFighter(F[0], keyInput(), dt, active);
          stepFighter(F[1], active ? botInput(dt) : empty, dt, active);
        } else {
          stepFighter(F[L], keyInput(), dt, active);
          if (rt) {
            var k = Math.min(1, dt * 14), q = F[R];
            if (rt.snap) { q.x = rt.x; q.y = rt.y; q.sa = rt.a; q.e = rt.e; q.cr = rt.c; rt.snap = false; q.has = false; }
            q.vx = (rt.x - q.x) * 14;
            q.x += (rt.x - q.x) * k; q.y += (rt.y - q.y) * k; q.sa += (rt.a - q.sa) * k; q.e += (rt.e - q.e) * k; q.cr += (rt.c - q.cr) * k;
            q.hp = rt.h; q.dead = rt.d; q.g = rt.y >= GY - 1;
            if (q.g) q.ph += dt * Math.abs(q.vx) * 0.07;
          } else stepFighter(F[R], empty, dt, false);
        }
        // \u0111\u1EA9y nhau ra, quay m\u1EB7t v\u1EC1 ph\xEDa \u0111\u1ED1i th\u1EE7
        var ov = 26 - Math.abs(F[1].x - F[0].x), sg;
        if (ov > 0 && Math.abs(F[0].y - F[1].y) < 40) {
          if (mode === 'bot') { sg = F[1].x >= F[0].x ? 1 : -1; F[0].x -= sg * ov / 2; F[1].x += sg * ov / 2; }
          else { sg = F[L].x >= F[R].x ? 1 : -1; F[L].x += sg * ov; }
        }
        for (i = 0; i < 2; i++) {
          var o = F[1 - i];
          if (Math.abs(o.x - F[i].x) > 10) F[i].face = o.x >= F[i].x ? 1 : -1;
          kin(F[i], dt);
        }
        if (active) {
          if (mode === 'bot') { tryHit(F[1], F[0]); tryHit(F[0], F[1]); }
          else tryHit(F[R], F[L]);
          tryClash(F[0], F[1]);
          // ch\u1EBFt ho\u1EB7c r\u01A1i kh\u1ECFi b\u1EE5c
          for (i = 0; i < 2; i++) {
            if (mode !== 'bot' && i !== L) continue;
            if (F[i].y > GY + 70) F[i].hp = 0;
            if (F[i].hp <= 0 && sstate === 'fight') {
              F[i].hp = 0;
              if (mode === 'online') send({ t: 'ko', w: 1 - i });
              roundEnd(1 - i);
            }
          }
          if (sstate === 'fight') {
            timeLeft -= dt;
            if (timeLeft <= 0 && (mode === 'bot' || me === 0)) {
              timeLeft = 0;
              var w = F[0].hp > F[1].hp ? 0 : (F[1].hp > F[0].hp ? 1 : -1);
              if (mode === 'online') send({ t: 'ko', w: w });
              roundEnd(w);
            } else if (timeLeft < 0) timeLeft = 0;
          }
        } else if (sstate === 'ready') {
          readyT -= dt;
          if (readyT <= 0) sstate = 'fight';
        } else if (sstate === 'rend') {
          rendT -= dt;
          if (rendT <= 0) {
            if (wins[0] >= WIN_ROUNDS || wins[1] >= WIN_ROUNDS) sstate = 'over';
            else nextRound();
          }
        }
        if (mode === 'online') {
          sendT -= dt;
          if (sendT <= 0) {
            var f = F[L];
            send({ t: 's', x: Math.round(f.x * 10) / 10, y: Math.round(f.y * 10) / 10, a: Math.round(f.sa * 100) / 100,
              e: Math.round(f.e * 100) / 100, c: Math.round(f.cr * 100) / 100, h: Math.round(f.hp), d: f.dead ? 1 : 0 });
            sendT = 0.05;
          }
        }
      }

      // ---------- v\u1EBD ----------
      function line(pts, w, col) {
        x.strokeStyle = col; x.lineWidth = w; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]);
        for (var i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]);
        x.stroke();
      }
      function drawFighter(f) {
        var P = PAL[scene], p = pose(f), col = TEAM[f.i], d = f.face, ink = P.ink, i;
        x.save();
        x.lineCap = 'round'; x.lineJoin = 'round';
        x.globalAlpha = f.dead ? 0.75 : (f.inv > 0 && Math.floor(f.inv * 22) % 2 === 0 ? 0.5 : 1);
        line([p.sh, p.bel, p.bh], 5, ink);
        line([p.hip, p.kb, p.bf], 6, ink);
        line([p.hip, p.kf, p.ff], 6, ink);
        line([p.neck, p.hip], 8, ink);
        x.fillStyle = ink; disc(x, p.head[0], p.head[1], 10.5);
        var wave = Math.sin(tm * 7 + f.i) * 3, tail = 14 + Math.abs(f.vx) * 0.06;
        x.fillStyle = col; x.beginPath(); x.moveTo(p.neck[0], p.neck[1] - 1);
        x.quadraticCurveTo(p.neck[0] - d * tail * 0.6, p.neck[1] + 2 + wave, p.neck[0] - d * tail, p.neck[1] + 9 + wave);
        x.quadraticCurveTo(p.neck[0] - d * tail * 0.4, p.neck[1] + 8, p.neck[0], p.neck[1] + 5);
        x.closePath(); x.fill();
        line([p.sh, p.elbow, p.hand], 5, ink);
        var ga = x.globalAlpha;
        if (f.speed > 450) { x.globalAlpha = ga * 0.3; line([p.hand, p.tip], 10, col); x.globalAlpha = ga; }
        x.lineCap = 'butt';
        line([p.hand, p.tip], 6, P.edge);
        line([p.hand, p.tip], 3, '#f4f7fb');
        x.lineCap = 'round';
        var ang = Math.atan2(p.tip[1] - p.hand[1], p.tip[0] - p.hand[0]) + 1.5708, gx = Math.cos(ang) * 6, gy = Math.sin(ang) * 6;
        line([[p.hand[0] - gx, p.hand[1] - gy], [p.hand[0] + gx, p.hand[1] + gy]], 3.5, '#d4a24c');
        x.fillStyle = col;
        var js = [p.sh, p.elbow, p.kf, p.kb];
        for (i = 0; i < js.length; i++) disc(x, js[i][0], js[i][1], 3.3);
        disc(x, p.hip[0], p.hip[1], 4);
        x.restore();
      }
      function bar(px, py, w, v, col, right) {
        x.fillStyle = PAL[scene].hudbg; x.globalAlpha = 0.7; rr(x, px, py, w, 10, 3); x.globalAlpha = 1;
        var fw = Math.max(0, w * v / 100);
        x.fillStyle = col; if (fw > 0) rr(x, right ? px + w - fw : px, py, fw, 10, 3);
      }
      function drawHud() {
        var P = PAL[scene], i;
        x.textAlign = 'left'; x.fillStyle = P.hudtext; x.font = '700 13px Nunito Sans, sans-serif';
        x.fillText(nameOf(0), 40, 24);
        x.textAlign = 'right'; x.fillText(nameOf(1), 640, 24);
        bar(40, 30, 210, F[0].hp, TEAM[0], false);
        bar(430, 30, 210, F[1].hp, TEAM[1], true);
        for (i = 0; i < WIN_ROUNDS; i++) {
          x.strokeStyle = TEAM[0]; x.fillStyle = TEAM[0]; x.lineWidth = 1.5;
          x.beginPath(); x.arc(46 + i * 16, 54, 4.5, 0, 6.2832); if (i < wins[0]) x.fill(); else x.stroke();
          x.strokeStyle = TEAM[1]; x.fillStyle = TEAM[1];
          x.beginPath(); x.arc(634 - i * 16, 54, 4.5, 0, 6.2832); if (i < wins[1]) x.fill(); else x.stroke();
        }
        x.textAlign = 'center'; x.fillStyle = P.hudtext; x.font = '600 12px Nunito Sans, sans-serif';
        x.fillText('Hi\u1EC7p ' + round, 340, 24);
        x.font = '700 22px Nunito Sans, sans-serif';
        x.fillText(String(Math.ceil(timeLeft)), 340, 50);
        x.textAlign = 'left';
      }
      function banner(t1, t2) {
        x.fillStyle = 'rgba(10,10,25,0.55)'; x.fillRect(0, 120, SW, 96);
        x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.font = '700 34px Nunito Sans, sans-serif';
        x.fillText(t1, SW / 2, 172);
        if (t2) { x.fillStyle = '#e2e8f0'; x.font = '600 15px Nunito Sans, sans-serif'; x.fillText(t2, SW / 2, 198); }
        x.textAlign = 'left';
      }
      function draw() {
        ensureBg();
        x.save();
        if (shake > 0) x.translate(rnd(-shake, shake) * 0.5, rnd(-shake, shake) * 0.5);
        x.drawImage(bgCv, 0, 0, SW, SH);
        var P = PAL[scene], i, p;
        x.fillStyle = P.petal; x.globalAlpha = 0.9;
        for (i = 0; i < petals.length; i++) disc(x, petals[i].x, petals[i].y, petals[i].r);
        x.globalAlpha = 1;
        if (F.length === 2 && sstate !== 'menu' && sstate !== 'wait') {
          drawFighter(F[0]); drawFighter(F[1]);
        }
        for (i = 0; i < fxs.length; i++) {
          p = fxs[i]; x.globalAlpha = Math.max(0, 1 - p.t / p.life);
          if (p.star) {
            x.strokeStyle = '#ffd166'; x.lineWidth = 2.5; x.lineCap = 'round';
            for (var a = 0; a < 7; a++) { var an = a * 0.898, rr1 = 6 + p.t * 60; x.beginPath(); x.moveTo(p.x, p.y); x.lineTo(p.x + Math.cos(an) * rr1, p.y + Math.sin(an) * rr1); x.stroke(); }
            x.fillStyle = '#ffffff'; disc(x, p.x, p.y, 4);
          } else { x.fillStyle = p.col; disc(x, p.x, p.y, 2.2); }
        }
        x.globalAlpha = 1;
        x.restore();
        x.font = '700 16px Nunito Sans, sans-serif'; x.textAlign = 'center';
        for (i = 0; i < floats.length; i++) { x.globalAlpha = Math.max(0, 1 - floats[i].t / 0.9); x.fillStyle = floats[i].col; x.fillText(floats[i].s, floats[i].x, floats[i].y); }
        x.globalAlpha = 1; x.textAlign = 'left';
        if (sstate === 'menu' || sstate === 'wait') {
          x.fillStyle = 'rgba(10,10,25,0.55)'; x.fillRect(0, 130, SW, 100);
          x.textAlign = 'center'; x.fillStyle = '#ffffff'; x.font = '700 32px Nunito Sans, sans-serif';
          x.fillText(sstate === 'menu' ? '\u0110\u1EA5u ki\u1EBFm \u2694\uFE0F' : '\u0110ang ch\u1EDD b\u1EA1n b\xE8 v\xE0o ph\xF2ng...', SW / 2, 182);
          x.fillStyle = '#e2e8f0'; x.font = '600 15px Nunito Sans, sans-serif';
          x.fillText(sstate === 'menu' ? 'Ch\u1ECDn ch\u1EBF \u0111\u1ED9 \u1EDF b\xEAn d\u01B0\u1EDBi' : 'M\xE3 ph\xF2ng: ' + roomCode, SW / 2, 208);
          x.textAlign = 'left';
          return;
        }
        drawHud();
        if (sstate === 'ready') banner(readyT > 0.7 ? 'Hi\u1EC7p ' + round : 'Chi\u1EBFn!', readyT > 0.7 ? 'Th\u1EAFng ' + WIN_ROUNDS + ' hi\u1EC7p \u0111\u1EC3 th\u1EAFng tr\u1EADn' : '');
        else if (sstate === 'rend') {
          banner(roundWin < 0 ? 'H\xF2a hi\u1EC7p!' : nameOf(roundWin) + ' th\u1EAFng hi\u1EC7p!', wins[0] + ' - ' + wins[1]);
        } else if (sstate === 'over') {
          var win = wins[0] > wins[1] ? 0 : 1, mine = localIdx();
          banner(win === mine ? 'B\u1EA1n th\u1EAFng tr\u1EADn! \u{1F389}' : (mode === 'bot' ? 'M\xE1y th\u1EAFng tr\u1EADn' : '\u0110\u1ED1i th\u1EE7 th\u1EAFng tr\u1EADn'), 'Ch\u1EA1m v\xE0o m\xE0n h\xECnh \u0111\u1EC3 ch\u01A1i l\u1EA1i');
        }
      }

      // ---------- m\u1EA1ng ----------
      function send(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
      function closeWs() { var w = ws; ws = null; if (w) { try { w.close(); } catch (e) {} } }
      function toMenu() {
        connId++; closeWs(); mode = ''; sstate = 'menu'; resetFighters(); showMenu(true); setMsg('');
      }
      function num(v, a, b, d) { return (typeof v === 'number' && isFinite(v)) ? clamp(v, a, b) : d; }
      function onMsg(m) {
        if (m.t === 'hello') {
          me = m.idx === 1 ? 1 : 0;
          setMsg('M\xE3 ph\xF2ng: ' + roomCode + '. G\u1EEDi m\xE3 n\xE0y cho b\u1EA1n b\xE8 nh\xE9!');
        } else if (m.t === 'start') {
          var sc = pickScene();
          if (me === 0) send({ t: 'scene', n: sc });
          startMatch(sc);
          setMsg('Ph\xF2ng ' + roomCode + ' \u2022 B\u1EA1n l\xE0 ' + (me === 0 ? 'ki\u1EBFm s\u0129 xanh (b\xEAn tr\xE1i)' : 'ki\u1EBFm s\u0129 cam (b\xEAn ph\u1EA3i)'));
        } else if (m.t === 'scene') {
          if (PAL[m.n]) { scene = m.n; }
        } else if (m.t === 's') {
          if (mode !== 'online') return;
          rt = rt || { x: 0, y: GY, a: 0.2, e: 0.85, c: 0, h: 100, d: 0, snap: true };
          rt.x = num(m.x, -100, 800, rt.x); rt.y = num(m.y, -200, 600, rt.y); rt.a = num(m.a, -1.4, 1.5, rt.a);
          rt.e = num(m.e, 0, 1, rt.e); rt.c = num(m.c, 0, 1, rt.c); rt.h = num(m.h, 0, 100, rt.h); rt.d = m.d ? 1 : 0;
        } else if (m.t === 'hit') {
          var hx = num(m.x, 0, SW, 340), hy = num(m.y, 0, SH, 180), dd = num(m.d, 0, 40, 0);
          shake = 5; sparks(hx, hy, '#ff4d4d', 10, 160); floatText(hx, hy - 12, '-' + dd, '#ff4d4d');
        } else if (m.t === 'ko') {
          if (sstate === 'fight') roundEnd(m.w === 0 ? 0 : (m.w === 1 ? 1 : -1));
        } else if (m.t === 'again') {
          if (sstate === 'over') startMatch(PAL[m.n] ? m.n : pickScene());
          else if (sstate === 'ready' && round === 1 && me === 1 && PAL[m.n]) scene = m.n;
        } else if (m.t === 'left') {
          resetFighters(); sstate = 'wait';
          setMsg('\u0110\u1ED1i th\u1EE7 \u0111\xE3 tho\xE1t. M\xE3 ph\xF2ng ' + roomCode + ' v\u1EABn \u0111ang ch\u1EDD ng\u01B0\u1EDDi v\xE0o.');
        }
      }
      function connect(code) {
        closeWs();
        var token = ++connId;
        mode = 'online'; roomCode = code; sstate = 'wait'; me = 0; resetFighters();
        setMsg('\u0110ang ki\u1EC3m tra k\u1EBFt n\u1ED1i...');
        fetch('/__game/ws?room=' + code + '&g=sword', { cache: 'no-store' }).then(function (r) {
          if (token !== connId) return;
          if (r.status === 426) { openSocket(code); return; }
          toMenu();
          if (r.status === 501) setMsg('Worker ch\u01B0a g\u1EAFn Durable Object POOL: ki\u1EC3m tra binding v\xE0 migration trong wrangler.');
          else if (r.status === 409) setMsg('Ph\xF2ng ' + code + ' \u0111\xE3 \u0111\u1EE7 2 ng\u01B0\u1EDDi.');
          else if (r.status === 403) setMsg('B\u1ECB ch\u1EB7n v\xEC Origin kh\xF4ng kh\u1EDBp domain (403).');
          else if (r.status >= 500) setMsg('Durable Object l\u1ED7i (' + r.status + '): ki\u1EC3m tra export class PoolRoom v\xE0 migration.');
          else setMsg('Worker ch\u01B0a c\xF3 b\u1EA3n m\u1EDBi (m\xE3 ' + r.status + '): h\xE3y deploy l\u1EA1i.');
        }).catch(function () {
          if (token !== connId) return;
          toMenu(); setMsg('Kh\xF4ng g\u1ECDi \u0111\u01B0\u1EE3c Worker (l\u1ED7i m\u1EA1ng).');
        });
      }
      function openSocket(code) {
        var opened = false, mine;
        setMsg('\u0110ang k\u1EBFt n\u1ED1i...');
        var url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/__game/ws?room=' + code + '&g=sword';
        try { mine = new WebSocket(url); } catch (e) { toMenu(); setMsg('Tr\xECnh duy\u1EC7t kh\xF4ng m\u1EDF \u0111\u01B0\u1EE3c WebSocket.'); return; }
        ws = mine;
        mine.onopen = function () { opened = true; };
        mine.onmessage = function (ev) {
          if (mine !== ws) return;
          var m;
          try { m = JSON.parse(ev.data); } catch (e) { return; }
          if (m && typeof m === 'object') onMsg(m);
        };
        mine.onclose = function () {
          if (mine !== ws) return;
          ws = null;
          toMenu();
          setMsg(opened ? 'M\u1EA5t k\u1EBFt n\u1ED1i t\u1EDBi ph\xF2ng.' : 'Kh\xF4ng m\u1EDF \u0111\u01B0\u1EE3c WebSocket (m\u1EA1ng/proxy ch\u1EB7n ho\u1EB7c WebSockets b\u1ECB t\u1EAFt tr\xEAn Cloudflare).');
        };
      }

      // ---------- b\xE0n ph\xEDm ----------
      var GAME_KEYS = { KeyA: 1, KeyD: 1, KeyW: 1, KeyS: 1, ArrowLeft: 1, ArrowRight: 1, ArrowUp: 1, ArrowDown: 1, Space: 1 };
      document.addEventListener('keydown', function (e) {
        if (cur !== api || !GAME_KEYS[e.code]) return;
        if (e.target && e.target.tagName === 'INPUT') return;
        e.preventDefault();
        keys[e.code] = true;
      });
      document.addEventListener('keyup', function (e) { if (GAME_KEYS[e.code]) keys[e.code] = false; });
      window.addEventListener('blur', function () { keys = {}; });

      el('sBot').onclick = function () {
        closeWs(); connId++; mode = 'bot'; showMenu(false); setMsg('B\u1EA1n l\xE0 ki\u1EBFm s\u0129 xanh (b\xEAn tr\xE1i). D\xF9ng b\xE0n ph\xEDm \u0111\u1EC3 \u0111i\u1EC1u khi\u1EC3n.');
        startMatch(pickScene());
      };
      el('sCreate').onclick = function () {
        var code = '';
        for (var i = 0; i < 4; i++) code += A.charAt(Math.floor(Math.random() * A.length));
        showMenu(false); connect(code);
      };
      el('sJoin').onclick = function () {
        var v = clean(el('sCode').value);
        if (v.length !== 4) { setMsg('Nh\u1EADp \u0111\u1EE7 4 k\xFD t\u1EF1 m\xE3 ph\xF2ng.'); return; }
        showMenu(false); connect(v);
      };
      el('sBack').onclick = toMenu;

      resetFighters(); initPetals(); scene = pickScene();
      globalThis.__s = function () { return { F: F, sstate: sstate, wins: wins, round: round, timeLeft: timeLeft, scene: scene, keys: keys, rt: rt }; };
      var api = {
        w: SW, h: SH,
        hint: 'A/D \u0111i \u2022 W nh\u1EA3y \u2022 S c\xFAi \u2022 \u2190/\u2192 n\xE2ng h\u1EA1 vai \u2022 \u2191/\u2193 du\u1ED7i co khu\u1EF7u \u2022 Space ch\xE9m',
        update: update, draw: draw,
        down: function () { if (sstate === 'over') rematch(); },
        key: function () {},
        leave: toMenu,
        busy: function () { return mode === 'online' && ws !== null; }
      };
      return api;
    })();

`;

// src/page/client/wolf-ui.js
var clientWolf = `    // ===================== MA S\xD3I (giao di\u1EC7n) =====================
    // To\xE0n b\u1ED9 lu\u1EADt n\u1EB1m tr\xEAn server; tr\xECnh duy\u1EC7t ch\u1EC9 hi\u1EC3n th\u1ECB ph\u1EA7n th\xF4ng tin \u0111\u01B0\u1EE3c ph\xE9p v\xE0 g\u1EEDi l\u1EF1a ch\u1ECDn.
    var wolf = (function () {
      var ws = null, code = '', S = null, connId = 0, joined = false, tries = 0, manual = true;
      var offset = 0, tick = null, tok = '', myName = '', total = 0, lastKey = '';
      var RN = { wolf: '\u{1F43A} S\xF3i', villager: '\u{1F3D8}\uFE0F D\xE2n l\xE0ng', seer: '\u{1F52E} Ti\xEAn tri', guard: '\u{1F6E1}\uFE0F B\u1EA3o v\u1EC7', witch: '\u{1F9EA} Ph\xF9 th\u1EE7y', hunter: '\u{1F3F9} Th\u1EE3 s\u0103n' };
      var RD = {
        wolf: 'M\u1ED7i \u0111\xEAm c\u1EA3 b\u1EA7y ch\u1ECDn m\u1ED9t ng\u01B0\u1EDDi \u0111\u1EC3 c\u1EAFn. Ban ng\xE0y h\xE3y gi\u1EA3 l\xE0m d\xE2n v\xE0 \u0111\u1EEBng \u0111\u1EC3 l\u1ED9.',
        villager: 'Kh\xF4ng c\xF3 k\u1EF9 n\u0103ng \u0111\u1EB7c bi\u1EC7t. H\xE3y th\u1EA3o lu\u1EADn, quan s\xE1t v\xE0 b\u1ECF phi\u1EBFu treo c\u1ED5 S\xF3i.',
        seer: 'M\u1ED7i \u0111\xEAm soi m\u1ED9t ng\u01B0\u1EDDi \u0111\u1EC3 bi\u1EBFt ng\u01B0\u1EDDi \u0111\xF3 c\xF3 ph\u1EA3i S\xF3i kh\xF4ng.',
        guard: 'M\u1ED7i \u0111\xEAm b\u1EA3o v\u1EC7 m\u1ED9t ng\u01B0\u1EDDi kh\u1ECFi b\u1ECB S\xF3i c\u1EAFn (kh\xF4ng b\u1EA3o v\u1EC7 c\xF9ng m\u1ED9t ng\u01B0\u1EDDi hai \u0111\xEAm li\xEAn ti\u1EBFp).',
        witch: 'C\xF3 1 b\xECnh c\u1EE9u v\xE0 1 b\xECnh \u0111\u1ED9c, m\u1ED7i \u0111\xEAm d\xF9ng t\u1ED1i \u0111a m\u1ED9t b\xECnh.',
        hunter: 'Khi ch\u1EBFt (tr\u1EEB khi b\u1ECB \u0111\u1EA7u \u0111\u1ED9c) \u0111\u01B0\u1EE3c b\u1EAFn ch\u1EBFt m\u1ED9t ng\u01B0\u1EDDi.'
      };
      var SUBT = { guard: 'B\u1EA3o v\u1EC7 th\u1EE9c d\u1EADy...', wolf: 'B\u1EA7y S\xF3i th\u1EE9c d\u1EADy...', seer: 'Ti\xEAn tri th\u1EE9c d\u1EADy...', witch: 'Ph\xF9 th\u1EE7y th\u1EE9c d\u1EADy...' };
      var PICK = { protect: 'B\u1EA3o v\u1EC7', bite: 'C\u1EAFn', see: 'Soi', witch: '\u0110\u1EA7u \u0111\u1ED9c', vote: 'B\u1ECF phi\u1EBFu', shoot: 'B\u1EAFn' };
      var TK = 'abcdefghijklmnopqrstuvwxyz0123456789';
      var CA = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      var ICON = {
        wolf: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#4a1520"/><path d="M24 20 L39 38 L61 38 L76 20 L81 52 Q81 79 50 87 Q19 79 19 52Z" fill="#2b2f3a"/><path d="M30 30 L38 40 L30 47Z M70 30 L62 40 L70 47Z" fill="#e8a3b0"/><path d="M26 56 Q38 50 46 58 Q38 62 26 56Z M74 56 Q62 50 54 58 Q62 62 74 56Z" fill="#ffd34d"/><circle cx="38" cy="56" r="2" fill="#12141a"/><circle cx="62" cy="56" r="2" fill="#12141a"/><path d="M42 68 Q50 62 58 68 L50 80Z" fill="#12141a"/><path d="M44 78 L47 84 M56 78 L53 84" stroke="#f5f5f5" stroke-width="2.5" stroke-linecap="round"/></svg>',
        villager: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#2f5d3a"/><rect x="62" y="26" width="7" height="16" fill="#8a5a2b"/><path d="M20 54 L50 26 L80 54Z" fill="#c9772b"/><rect x="28" y="54" width="44" height="26" fill="#f1dfb4"/><rect x="44" y="60" width="13" height="20" fill="#7a4a21"/><rect x="32" y="60" width="9" height="9" fill="#8fc7e8"/><rect x="60" y="60" width="9" height="9" fill="#8fc7e8"/><path d="M66 22 Q70 16 66 10 Q74 14 70 22Z" fill="#e9eef2" opacity="0.8"/></svg>',
        seer: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#3b2a6b"/><path d="M20 24 l2 5 5 2 -5 2 -2 5 -2 -5 -5 -2 5 -2z M78 30 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#ffe9a8"/><path d="M32 82 L68 82 L62 70 L38 70Z" fill="#7a5c2b"/><circle cx="50" cy="50" r="23" fill="#b9a6ff"/><circle cx="50" cy="50" r="23" fill="none" stroke="#e6dcff" stroke-width="2"/><ellipse cx="41" cy="41" rx="7" ry="4" fill="#fff" opacity="0.65" transform="rotate(-30 41 41)"/><circle cx="55" cy="55" r="6" fill="#7a5cff" opacity="0.7"/></svg>',
        guard: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#1f4468"/><path d="M50 16 L79 27 V50 Q79 73 50 85 Q21 73 21 50 V27Z" fill="#cfd8e6"/><path d="M50 16 L79 27 V50 Q79 73 50 85Z" fill="#a9b6cc"/><path d="M50 30 L60 44 L50 66 L40 44Z" fill="#1f4468"/><path d="M50 34 L56 44 L50 58 L44 44Z" fill="#6fa8dc"/></svg>',
        witch: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#35214f"/><rect x="40" y="14" width="20" height="7" rx="2" fill="#c9a36b"/><path d="M43 21 H57 V38 L75 68 Q80 80 68 80 H32 Q20 80 25 68 L43 38Z" fill="#7be0c1"/><path d="M29 64 H71 L75 70 Q79 80 68 80 H32 Q21 80 25 70Z" fill="#3fb98f"/><circle cx="46" cy="56" r="3.5" fill="#e8fff6" opacity="0.8"/><circle cx="56" cy="48" r="2.5" fill="#e8fff6" opacity="0.8"/><circle cx="52" cy="66" r="3" fill="#e8fff6" opacity="0.8"/><path d="M76 24 l1.5 4 4 1.5 -4 1.5 -1.5 4 -1.5 -4 -4 -1.5 4 -1.5z" fill="#ffe9a8"/></svg>',
        hunter: '<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><circle cx="50" cy="50" r="48" fill="#4a3a1f"/><path d="M36 18 Q74 50 36 82" stroke="#d9a35b" stroke-width="6" fill="none" stroke-linecap="round"/><line x1="36" y1="18" x2="36" y2="82" stroke="#f1e3c2" stroke-width="1.5"/><line x1="22" y1="50" x2="80" y2="50" stroke="#e8e0cc" stroke-width="3.5" stroke-linecap="round"/><path d="M84 50 L71 43 V57Z" fill="#e8e0cc"/><path d="M22 50 L14 44 M22 50 L14 56 M28 50 L20 44 M28 50 L20 56" stroke="#c0524a" stroke-width="2.5" stroke-linecap="round"/></svg>'
      };
      (function () {
        var tl = document.querySelectorAll('.wroles div[data-r]');
        for (var q = 0; q < tl.length; q++) {
          var ph = tl[q].querySelector('.ric');
          if (ph) ph.innerHTML = ICON[tl[q].getAttribute('data-r')] || '';
        }
      })();

      function el(id) { return document.getElementById(id); }
      function E(tag, cls, text) {
        var n = document.createElement(tag);
        if (cls) n.className = cls;
        if (text !== undefined) n.textContent = text;
        return n;
      }
      function clear(n) { while (n.firstChild) n.removeChild(n.firstChild); }
      function setMsg(t) { el('wMsg').textContent = t; }
      function send(o) { if (ws && ws.readyState === 1) ws.send(JSON.stringify(o)); }
      function setW(v) { var cd = document.querySelector('.card'); if (cd) cd.setAttribute('data-w', v); }
      function showMenu(on) {
        el('wMenu').hidden = !on; el('wGame').hidden = on;
        setW(on ? 'menu' : 'game');
        if (on) el('wolfui').setAttribute('data-ph', 'lobby');
      }
      function clean(s) { return s.toUpperCase().replace(/[^A-Z0-9]/g, ''); }
      function byId(id) {
        if (!S) return null;
        for (var i = 0; i < S.players.length; i++) if (S.players[i].id === id) return S.players[i];
        return null;
      }
      function tokFor(c) {
        var k = 'wolf_tok_' + c, v = '';
        try { v = localStorage.getItem(k) || ''; } catch (e) {}
        if (v.length < 8) {
          v = '';
          for (var i = 0; i < 24; i++) v += TK.charAt(Math.floor(Math.random() * TK.length));
          try { localStorage.setItem(k, v); } catch (e) {}
        }
        return v;
      }

      // ---------- k\u1EBFt n\u1ED1i ----------
      function toMenu() {
        connId++; manual = true;
        var w = ws; ws = null;
        if (w) {
          try { if (w.readyState === 1) w.send(JSON.stringify({ t: 'quit' })); } catch (e) {}
          try { w.close(); } catch (e) {}
        }
        try { localStorage.removeItem('wolf_tok_' + code); } catch (e) {}
        joined = false; S = null;
        clear(el('wChat'));
        if (tick) { clearInterval(tick); tick = null; }
        showMenu(true); setMsg('');
      }

      function connect(c) {
        var name = el('wName').value.replace(/[<>]/g, '').trim().slice(0, 12);
        if (!name) { setMsg('Nh\u1EADp t\xEAn c\u1EE7a b\u1EA1n tr\u01B0\u1EDBc nh\xE9.'); return; }
        try { localStorage.setItem('wolf_name', name); } catch (e) {}
        myName = name; code = c; tok = tokFor(c);
        manual = false; joined = false; tries = 0;
        var token = ++connId;
        setMsg('\u0110ang ki\u1EC3m tra k\u1EBFt n\u1ED1i...');
        fetch('/__game/ws?room=' + c + '&g=wolf', { cache: 'no-store' }).then(function (r) {
          if (token !== connId) return;
          if (r.status === 426) { openSocket(); return; }
          manual = true;
          if (r.status === 501) setMsg('Worker ch\u01B0a g\u1EAFn Durable Object WOLF: th\xEAm binding WOLF v\xE0 migration v2 trong wrangler.');
          else if (r.status === 409) setMsg('Ph\xF2ng ' + c + ' \u0111\xE3 \u0111\u1EE7 ng\u01B0\u1EDDi.');
          else if (r.status === 403) setMsg('B\u1ECB ch\u1EB7n v\xEC Origin kh\xF4ng kh\u1EDBp domain (403).');
          else if (r.status >= 500) setMsg('Durable Object l\u1ED7i (' + r.status + '): ki\u1EC3m tra export class WolfRoom v\xE0 migration.');
          else setMsg('Worker ch\u01B0a c\xF3 b\u1EA3n m\u1EDBi (m\xE3 ' + r.status + '): h\xE3y deploy l\u1EA1i worker.js.');
        }).catch(function () {
          if (token !== connId) return;
          manual = true; setMsg('Kh\xF4ng g\u1ECDi \u0111\u01B0\u1EE3c Worker (l\u1ED7i m\u1EA1ng).');
        });
      }

      function openSocket() {
        var mine;
        var url = (location.protocol === 'https:' ? 'wss://' : 'ws://') + location.host + '/__game/ws?room=' + code + '&g=wolf';
        try { mine = new WebSocket(url); } catch (e) { manual = true; setMsg('Tr\xECnh duy\u1EC7t kh\xF4ng m\u1EDF \u0111\u01B0\u1EE3c WebSocket.'); return; }
        ws = mine;
        mine.onopen = function () { send({ t: 'join', name: myName, tok: tok }); };
        mine.onmessage = function (ev) {
          if (mine !== ws) return;
          var m;
          try { m = JSON.parse(ev.data); } catch (e) { return; }
          onMsg(m);
        };
        mine.onclose = function () {
          if (mine !== ws) return;
          ws = null;
          if (joined && !manual && tries < 8) {
            tries++;
            setMsg('M\u1EA5t k\u1EBFt n\u1ED1i, \u0111ang th\u1EED l\u1EA1i (' + tries + ')...');
            setTimeout(function () { if (!manual && joined && !ws) openSocket(); }, 1500);
          } else {
            var was = joined;
            toMenu();
            setMsg(was ? 'M\u1EA5t k\u1EBFt n\u1ED1i t\u1EDBi ph\xF2ng.' : 'Kh\xF4ng m\u1EDF \u0111\u01B0\u1EE3c WebSocket (m\u1EA1ng/proxy ch\u1EB7n ho\u1EB7c WebSockets b\u1ECB t\u1EAFt tr\xEAn Cloudflare).');
          }
        };
      }

      function onMsg(m) {
        if (m.t === 'state') {
          S = m.s; offset = S.now - Date.now();
          var key = S.phase + ':' + S.sub + ':' + S.day;
          var lf = S.deadline ? Math.max(1, Math.round((S.deadline - S.now) / 1000)) : 0;
          if (key !== lastKey || lf > total) { total = lf; lastKey = key; }
          joined = true; tries = 0;
          showMenu(false); setMsg('');
          render();
        } else if (m.t === 'chat') {
          addChat(m);
        } else if (m.t === 'err') {
          if (m.fatal) { toMenu(); setMsg(m.m); } else setMsg(m.m);
        }
      }

      function addChat(m) {
        var box = el('wChat');
        var tag = m.scope === 'wolf' ? '\u{1F43A} ' : (m.scope === 'dead' ? '\u{1F480} ' : '');
        box.appendChild(E('div', 'cl ' + m.scope, tag + m.who + ': ' + m.text));
        while (box.childNodes.length > 60) box.removeChild(box.firstChild);
        box.scrollTop = box.scrollHeight;
      }

      // ---------- hi\u1EC3n th\u1ECB ----------
      function phaseParts() {
        switch (S.phase) {
          case 'lobby': return ['S\u1EA3nh ch\u1EDD', S.players.length + ' ng\u01B0\u1EDDi, c\u1EA7n t\u1EEB ' + S.min + ' \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u'];
          case 'night': return ['\u0110\xEAm ' + S.day, SUBT[S.sub] || ''];
          case 'day': return ['Ng\xE0y ' + S.day, 'Th\u1EA3o lu\u1EADn'];
          case 'vote': return ['Ng\xE0y ' + S.day, 'B\u1ECF phi\u1EBFu treo c\u1ED5'];
          case 'hunter': return ['Th\u1EE3 s\u0103n b\u1EAFn!', 'M\u1ED9t ph\xE1t \u0111\u1EA1n cu\u1ED1i c\xF9ng'];
          case 'over': return ['K\u1EBFt th\xFAc', S.winner === 'wolf' ? 'B\u1EA7y S\xF3i th\u1EAFng \u{1F43A}' : 'D\xE2n l\xE0ng th\u1EAFng \u{1F3D8}\uFE0F'];
        }
        return ['', ''];
      }
      function phaseTheme() {
        if (S.phase === 'night') return 'night';
        if (S.phase === 'vote' || S.phase === 'hunter') return 'dusk';
        if (S.phase === 'over') return 'over';
        if (S.phase === 'day') return 'day';
        return 'lobby';
      }
      function tickFn() {
        if (!S) return;
        var left = S.deadline ? Math.max(0, Math.round((S.deadline - (Date.now() + offset)) / 1000)) : 0;
        var pp = phaseParts();
        el('wPhase').textContent = pp[0];
        el('wSub').textContent = pp[1];
        var tmr = el('wTimer');
        if (S.deadline) {
          tmr.hidden = false;
          el('wTimeNum').textContent = left;
          var pct = total > 0 ? Math.max(0, Math.min(100, left / total * 100)) : 0;
          tmr.style.setProperty('--p', pct + '%');
        } else tmr.hidden = true;
      }

      function cfgText(c) {
        var p = [c.wolves + ' S\xF3i'];
        if (c.seer) p.push('Ti\xEAn tri');
        if (c.guard) p.push('B\u1EA3o v\u1EC7');
        if (c.witch) p.push('Ph\xF9 th\u1EE7y');
        if (c.hunter) p.push('Th\u1EE3 s\u0103n');
        return p.join(', ') + ' (c\xF2n l\u1EA1i l\xE0 D\xE2n l\xE0ng)';
      }

      function renderRole() {
        var box = el('wRole'); clear(box); box.className = 'wrole';
        if (S.phase === 'lobby') {
          box.appendChild(E('div', 'rt', 'Th\xE0nh ph\u1EA7n v\xE1n n\xE0y'));
          box.appendChild(E('div', '', cfgText(S.cfg)));
          return;
        }
        var r = S.me.role;
        if (!r) return;
        box.className = 'wrole r-' + r;
        var hd = E('div', 'rhead');
        var ri = E('div', 'rico'); ri.innerHTML = ICON[r] || '';
        hd.appendChild(ri);
        hd.appendChild(E('div', 'rt', 'B\u1EA1n l\xE0 ' + RN[r]));
        box.appendChild(hd);
        box.appendChild(E('div', '', RD[r]));
        if (r === 'wolf') {
          var mates = [];
          for (var i = 0; i < S.players.length; i++) {
            var q = S.players[i];
            if (q.role === 'wolf' && q.id !== S.you) mates.push(q.name + (q.alive ? '' : ' \u{1F480}'));
          }
          box.appendChild(E('div', '', mates.length ? '\u0110\u1ED3ng \u0111\u1ED9i: ' + mates.join(', ') : 'B\u1EA1n l\xE0 S\xF3i duy nh\u1EA5t.'));
        }
        if (r === 'seer') {
          for (var k = 0; k < S.me.seen.length; k++) {
            var s = S.me.seen[k];
            box.appendChild(E('div', '', '\u{1F52E} \u0110\xEAm ' + s.day + ': ' + s.name + (s.wolf ? ' L\xC0 S\xF3i \u{1F43A}' : ' kh\xF4ng ph\u1EA3i S\xF3i')));
          }
        }
        if (r === 'witch') {
          box.appendChild(E('div', '', 'B\xECnh c\u1EE9u: ' + (S.me.heal ? 'c\xF2n' : '\u0111\xE3 d\xF9ng') + ' \u2022 B\xECnh \u0111\u1ED9c: ' + (S.me.poison ? 'c\xF2n' : '\u0111\xE3 d\xF9ng')));
        }
        if (!S.me.alive) box.appendChild(E('div', 'dd', '\u{1F480} B\u1EA1n \u0111\xE3 ch\u1EBFt. B\u1EA1n ch\u1EC9 xem \u0111\u01B0\u1EE3c v\xE0 chat v\u1EDBi ng\u01B0\u1EDDi \u0111\xE3 ch\u1EBFt.'));
      }

      function pickTarget(kind, id) {
        if (kind === 'vote') send({ t: 'vote', target: id });
        else if (kind === 'shoot') send({ t: 'shoot', target: id });
        else if (kind === 'witch') send({ t: 'act', a: 'poison', target: id });
        else send({ t: 'act', a: kind, target: id });
      }
      function btn(label, fn, on) {
        var b = E('button', 'mini small' + (on ? ' on' : ''), label);
        b.onclick = fn;
        return b;
      }

      function setMobileTab(tab) {
        var panels = { act: 'wMid', players: 'wPlayersPanel', chat: 'wChatPanel' };
        var buttons = document.querySelectorAll('[data-mobile-tab]');
        for (var i = 0; i < buttons.length; i++) {
          var active = buttons[i].getAttribute('data-mobile-tab') === tab;
          buttons[i].setAttribute('aria-pressed', active ? 'true' : 'false');
          var panel = document.getElementById(panels[buttons[i].getAttribute('data-mobile-tab')]);
          if (panel) panel.classList.toggle('mobile-active', active);
        }
      }

      function renderAct() {
        var box = el('wAct'); clear(box);
        var i;
        if (S.phase === 'lobby') {
          var host = (S.host === S.you), c = S.cfg;
          if (host) {
            var send2 = function (n) { send({ t: 'cfg', wolves: n.wolves, seer: n.seer, guard: n.guard, witch: n.witch, hunter: n.hunter }); };
            var row = E('div', 'crow');
            row.appendChild(E('span', '', 'S\u1ED1 S\xF3i: '));
            row.appendChild(btn('\u2212', function () { send2({ wolves: Math.max(1, c.wolves - 1), seer: c.seer, guard: c.guard, witch: c.witch, hunter: c.hunter }); }));
            row.appendChild(E('b', '', ' ' + c.wolves + ' '));
            row.appendChild(btn('+', function () { send2({ wolves: Math.min(4, c.wolves + 1), seer: c.seer, guard: c.guard, witch: c.witch, hunter: c.hunter }); }));
            box.appendChild(row);
            var row2 = E('div', 'crow');
            var keys = [['seer', 'Ti\xEAn tri'], ['guard', 'B\u1EA3o v\u1EC7'], ['witch', 'Ph\xF9 th\u1EE7y'], ['hunter', 'Th\u1EE3 s\u0103n']];
            keys.forEach(function (kv) {
              row2.appendChild(btn(kv[1], function () {
                var n = { wolves: c.wolves, seer: c.seer, guard: c.guard, witch: c.witch, hunter: c.hunter };
                n[kv[0]] = !c[kv[0]];
                send2(n);
              }, c[kv[0]]));
            });
            box.appendChild(row2);
            var st = btn('B\u1EAFt \u0111\u1EA7u v\xE1n', function () { send({ t: 'start' }); });
            st.className = 'btn';
            st.disabled = S.players.length < S.min;
            box.appendChild(st);
            if (S.players.length < S.min) box.appendChild(E('div', 'ahint', 'C\u1EA7n th\xEAm ' + (S.min - S.players.length) + ' ng\u01B0\u1EDDi n\u1EEFa.'));
          } else {
            box.appendChild(E('div', 'ahint', 'Ch\u1EDD ch\u1EE7 ph\xF2ng (\u{1F451}) b\u1EAFt \u0111\u1EA7u v\xE1n...'));
          }
          return;
        }
        if (S.phase === 'over') {
          box.appendChild(E('div', 'rt', S.winner === 'wolf' ? '\u{1F43A} B\u1EA7y S\xF3i th\u1EAFng!' : '\u{1F3D8}\uFE0F D\xE2n l\xE0ng th\u1EAFng!'));
          if (S.host === S.you) {
            var ag = btn('Ch\u01A1i l\u1EA1i', function () { send({ t: 'again' }); });
            ag.className = 'btn';
            box.appendChild(ag);
          } else box.appendChild(E('div', 'ahint', 'Ch\u1EDD ch\u1EE7 ph\xF2ng b\u1EA5m ch\u01A1i l\u1EA1i...'));
          return;
        }
        var a = S.me.act;
        if (!a) {
          var w = '\u0110ang ch\u1EDD...';
          if (!S.me.alive) w = 'B\u1EA1n \u0111\xE3 ch\u1EBFt, h\xE3y theo d\xF5i v\xE1n \u0111\u1EA5u.';
          else if (S.phase === 'night') w = '\u0110ang l\xE0 l\u01B0\u1EE3t c\u1EE7a vai kh\xE1c. H\xE3y im l\u1EB7ng v\xE0 ch\u1EDD tr\u1EDDi s\xE1ng...';
          else if (S.phase === 'hunter') w = 'Th\u1EE3 s\u0103n \u0111ang ch\u1ECDn ng\u01B0\u1EDDi \u0111\u1EC3 b\u1EAFn...';
          box.appendChild(E('div', 'ahint', w));
          return;
        }
        box.appendChild(E('div', 'ahint', a.hint));
        if (a.a === 'ready') {
          var rb = btn((a.ready ? '\u0110\xE3 s\u1EB5n s\xE0ng' : 'S\u1EB5n s\xE0ng b\u1ECF phi\u1EBFu') + ' (' + S.readyCount + '/' + S.aliveCount + ')', function () { send({ t: 'ready' }); }, a.ready);
          rb.disabled = !!a.ready;
          box.appendChild(rb);
        } else if (a.a === 'vote') {
          box.appendChild(btn('B\u1ECF qua phi\u1EBFu', function () { send({ t: 'vote', target: 0 }); }, a.chosen === 0));
        } else if (a.a === 'witch') {
          if (a.heal) box.appendChild(btn('C\u1EE9u ' + a.victim.name, function () { send({ t: 'act', a: 'heal' }); }));
          if (a.poison) box.appendChild(E('div', 'ahint', 'Ho\u1EB7c ch\u1ECDn m\u1ED9t ng\u01B0\u1EDDi trong danh s\xE1ch b\xEAn d\u01B0\u1EDBi \u0111\u1EC3 \u0111\u1EA7u \u0111\u1ED9c.'));
          box.appendChild(btn('Kh\xF4ng d\xF9ng b\xECnh n\xE0o', function () { send({ t: 'act', a: 'skip' }); }));
        } else if (a.a === 'bite' && a.votes) {
          for (var wid in a.votes) {
            var wv = byId(Number(wid)), tv = byId(a.votes[wid]);
            if (wv && tv) box.appendChild(E('div', 'ahint', '\u{1F43A} ' + wv.name + ' \u2192 ' + tv.name));
          }
        }
        if (a.done) box.appendChild(E('div', 'ahint', '\u0110\xE3 ch\u1ECDn xong, ch\u1EDD tr\u1EDDi s\xE1ng...'));
      }

      function renderPlayers() {
        var box = el('wPlayers'); clear(box);
        var a = S.me.act, kind = a && a.targets ? a.a : null;
        var counts = {}, nAlive = 0, j;
        for (j = 0; j < S.players.length; j++) if (S.players[j].alive) nAlive++;
        el('wPCount').textContent = S.phase === 'lobby' ? S.players.length + '/' + 12 : nAlive + '/' + S.players.length + ' c\xF2n s\u1ED1ng';
        if (S.voteResolved) {
          for (j = 0; j < S.players.length; j++) {
            var v = S.players[j].vote;
            if (v) counts[v] = (counts[v] || 0) + 1;
          }
        }
        for (var i = 0; i < S.players.length; i++) {
          (function (p) {
            var card = E('div', 'pcard' + (p.alive ? '' : ' dead') + (p.id === S.you ? ' me' : ''));
            var av = E('div', 'pav' + (p.role && ICON[p.role] ? ' ico' : ''), p.role && ICON[p.role] ? undefined : (p.name.charAt(0) || '?').toUpperCase());
            if (p.role && ICON[p.role]) av.innerHTML = ICON[p.role];
            card.appendChild(av);
            var info = E('div', 'pinfo');
            info.appendChild(E('div', 'pn', (S.host === p.id ? '\u{1F451} ' : '') + p.name + (p.id === S.you ? ' (b\u1EA1n)' : '') + (p.online ? '' : ' \u{1F4F4}')));
            var meta = E('div', 'pm');
            if (!p.alive) meta.appendChild(E('span', '', '\u{1F480}'));
            if (p.role) meta.appendChild(E('span', 'rl' + (p.role === 'wolf' ? ' w' : ''), RN[p.role]));
            if (S.voteResolved) {
              if (counts[p.id]) meta.appendChild(E('span', 'rl', '\u{1F5F3}\uFE0F ' + counts[p.id]));
              if (p.vote !== undefined) {
                var tv = p.vote ? byId(p.vote) : null;
                meta.appendChild(E('span', '', '\u2192 ' + (tv ? tv.name : 'b\u1ECF qua')));
              }
            } else if (S.phase === 'vote' && p.voted) {
              meta.appendChild(E('span', 'rl', '\u2713 \u0110\xE3 b\u1ECF phi\u1EBFu'));
            }
            info.appendChild(meta);
            card.appendChild(info);
            if (kind && a.targets.indexOf(p.id) >= 0) {
              var pa = E('div', 'pact');
              pa.appendChild(btn(PICK[kind], function () { pickTarget(kind, p.id); }, a.chosen === p.id));
              card.appendChild(pa);
            }
            box.appendChild(card);
          })(S.players[i]);
        }
      }

      function renderLog() {
        var box = el('wLog'); clear(box);
        var from = Math.max(0, S.log.length - 8);
        for (var i = from; i < S.log.length; i++) box.appendChild(E('div', '', S.log[i]));
        box.scrollTop = box.scrollHeight;
      }

      function render() {
        if (!S) return;
        var me = byId(S.you);
        el('wRoom').textContent = 'Ph\xF2ng ' + code + ' \u2022 ' + (me ? me.name : myName);
        el('wolfui').setAttribute('data-ph', phaseTheme());
        tickFn();
        renderRole(); renderAct(); renderPlayers(); renderLog();
        if (!tick) tick = setInterval(tickFn, 500);
      }

      function sendChat() {
        var inp = el('wText'), t = inp.value.trim();
        if (!t) return;
        send({ t: 'chat', text: t });
        inp.value = '';
      }

      // ---------- n\xFAt ----------
      try { el('wName').value = localStorage.getItem('wolf_name') || ''; } catch (e) {}
      el('wCreate').onclick = function () {
        var c = '';
        for (var i = 0; i < 4; i++) c += CA.charAt(Math.floor(Math.random() * CA.length));
        connect(c);
      };
      el('wJoin').onclick = function () {
        var v = clean(el('wCode').value);
        if (v.length !== 4) { setMsg('Nh\u1EADp \u0111\u1EE7 4 k\xFD t\u1EF1 m\xE3 ph\xF2ng.'); return; }
        connect(v);
      };
      el('wBack').onclick = toMenu;
      el('wSend').onclick = sendChat;
      el('wText').addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); sendChat(); } });
      var mobileTabs = document.querySelectorAll('[data-mobile-tab]');
      for (var mt = 0; mt < mobileTabs.length; mt++) {
        mobileTabs[mt].addEventListener('click', function () { setMobileTab(this.getAttribute('data-mobile-tab')); });
      }

      return {
        w: 480, h: 270,
        hint: 'C\u1EA7n t\u1EEB 5 ng\u01B0\u1EDDi, m\u1ED7i ng\u01B0\u1EDDi m\u1ED9t thi\u1EBFt b\u1ECB. Chat b\u1EB1ng khung b\xEAn d\u01B0\u1EDBi ho\u1EB7c g\u1ECDi tho\u1EA1i ri\xEAng cho vui.',
        update: function () {}, draw: function () {}, down: function () {}, key: function () {},
        leave: toMenu,
        busy: function () { return joined && !manual; }
      };
    })();

`;

// src/page/client/played.js
var clientPlayed = `    // ===================== YOU GOT PLAYED =====================
    var played = (function () {
      var W = 800, H = 450, FLOOR = 350, PW = 22, PH = 30, WORLD = 2500;
      var grounds = [
        { a: 0, b: 250, y: 350 }, { a: 250, b: 395, y: 310 }, { a: 395, b: 520, y: 350 },
        { a: 575, b: 740, y: 375 }, { a: 740, b: 890, y: 325 }, { a: 960, b: 1140, y: 350 },
        { a: 1140, b: 1290, y: 300 }, { a: 1360, b: 1550, y: 370 }, { a: 1550, b: 1690, y: 315 },
        { a: 1770, b: 1960, y: 350 }, { a: 1960, b: 2130, y: 305 }, { a: 2210, b: 2500, y: 350 }
      ];
      var pits = [520, 890, 1290, 1690, 2130];
      var floorSpikes = [{ x: 162, w: 42 }, { x: 640, w: 42 }, { x: 1042, w: 40 }, { x: 1470, w: 42 }, { x: 1860, w: 42 }, { x: 2320, w: 46 }];
      var falling = [], rising = [], saws = [{ x: 815, y: 255, amp: 42, phase: 0.2, r: 16 }, { x: 1605, y: 245, amp: 48, phase: 2.1, r: 17 }, { x: 2050, y: 255, amp: 40, phase: 4.3, r: 16 }];
      var keys = {}, touch = { left: false, right: false }, state = 'title';
      var player, camera = 0, deaths = 0, jumps = 0, early = 0, checkpoint = 50, time = 0, deathTimer = 0;
      var pausedFrom = 'run', learned = false, note = '', noteTimer = 0, jumpBuffer = 0, coyote = 0, lastPit = -1;
      var controls = document.getElementById('playedControls');
      var best = 0;
      try { best = Number(localStorage.getItem('ygp_best') || 0); } catch (e) {}

      function resetPlayer(at) {
        var floor = groundAt(at, at + PW);
        player = { x: at, y: (floor ? floor.y : FLOOR) - PH, vx: 0, vy: 0, grounded: true, face: 1, anim: 0 };
        camera = Math.max(0, Math.min(WORLD - W, at - 150));
        state = 'run'; deathTimer = 0; jumpBuffer = 0; coyote = 0.1; lastPit = -1;
        resetTraps();
      }
      function resetTraps() {
        falling = [{ x: 430, y: 165, dest: 328, w: 46, state: 'idle', t: 0 }, { x: 1195, y: 150, dest: 278, w: 48, state: 'idle', t: 0 }, { x: 1985, y: 140, dest: 283, w: 46, state: 'idle', t: 0 }];
        rising = [{ x: 840, y: 325, h: 0, state: 'idle', t: 0, w: 44 }, { x: 1638, y: 315, h: 0, state: 'idle', t: 0, w: 44 }, { x: 2248, y: 350, h: 0, state: 'idle', t: 0, w: 48 }];
      }
      function start() {
        deaths = 0; jumps = 0; early = 0; time = 0; checkpoint = 50; learned = false; note = '';
        try { early = Number(localStorage.getItem('ygp_early_jumps') || 0); learned = early >= 3; } catch (e) {}
        resetPlayer(checkpoint);
      }
      function die() {
        if (state !== 'run') return;
        deaths++; state = 'dead'; deathTimer = 0.48;
        note = early >= 3 ? 'Game nh\u1EDB r\u1ED3i \u0111\u1EA5y.' : 'B\u1EABy \u0111\xE3 ghi nh\u1EDB c\xFA nh\u1EA3y c\u1EE7a b\u1EA1n.'; noteTimer = 1.8;
      }
      function jump() {
        if (state === 'title' || state === 'won') { start(); return; }
        if (state === 'paused') { state = pausedFrom; return; }
        if (state !== 'run') return;
        jumpBuffer = 0.13;
      }
      function togglePause() {
        if (state === 'run') { pausedFrom = 'run'; state = 'paused'; }
        else if (state === 'paused') state = pausedFrom;
      }
      function jumpNow() {
        player.vy = -510; player.grounded = false; coyote = 0; jumpBuffer = 0; jumps++;
        var nearest = -1, distance = Infinity;
        for (var i = 0; i < pits.length; i++) {
          var d = pits[i] - (player.x + PW);
          if (d >= 0 && d < distance) { nearest = i; distance = d; }
        }
        if (nearest >= 0 && distance >= 95 && distance <= 190 && lastPit !== nearest) {
          early++; lastPit = nearest;
          try { localStorage.setItem('ygp_early_jumps', String(early)); } catch (e) {}
          if (!learned && early >= 3) {
            learned = true; note = 'B\u1EAET B\xC0I: B\u1EA1n lu\xF4n nh\u1EA3y s\u1EDBm!'; noteTimer = 3.2;
          }
        }
      }
      function groundAt(left, right) {
        for (var i = 0; i < grounds.length; i++) if (left >= grounds[i].a && right <= grounds[i].b) return grounds[i];
        return null;
      }
      function update(dt) {
        if (noteTimer > 0) noteTimer -= dt;
        if (state === 'dead') {
          deathTimer -= dt;
          if (deathTimer <= 0) resetPlayer(checkpoint);
          return;
        }
        if (state !== 'run') return;
        time += dt;
        var dir = (keys.ArrowRight || keys.KeyD || touch.right ? 1 : 0) - (keys.ArrowLeft || keys.KeyA || touch.left ? 1 : 0);
        if (dir) { player.vx += dir * 1850 * dt; player.face = dir; }
        else player.vx *= Math.pow(0.0008, dt);
        player.vx = Math.max(-250, Math.min(250, player.vx));
        player.anim += Math.abs(player.vx) * dt * 0.05;
        if (player.grounded) coyote = 0.11; else coyote = Math.max(0, coyote - dt);
        jumpBuffer = Math.max(0, jumpBuffer - dt);
        if (jumpBuffer > 0 && coyote > 0) jumpNow();
        player.vy = Math.min(700, player.vy + 1450 * dt);
        var oldX = player.x, oldBottom = player.y + PH;
        var nextX = Math.max(0, Math.min(WORLD - PW, player.x + player.vx * dt));
        for (var h = 0; h < grounds.length; h++) {
          var platform = grounds[h];
          if (player.y + PH <= platform.y) continue;
          if (player.vx > 0 && oldX + PW <= platform.a && nextX + PW > platform.a) { nextX = platform.a - PW; player.vx = 0; }
          if (player.vx < 0 && oldX >= platform.b && nextX < platform.b) { nextX = platform.b; player.vx = 0; }
        }
        player.x = nextX;
        player.y += player.vy * dt;
        player.grounded = false;
        if (player.vy >= 0) {
          var landing = null;
          for (var p = 0; p < grounds.length; p++) {
            var platform = grounds[p];
            if (player.x < platform.b && player.x + PW > platform.a && oldBottom <= platform.y && player.y + PH >= platform.y && (!landing || platform.y < landing.y)) landing = platform;
          }
          if (landing) { player.y = landing.y - PH; player.vy = 0; player.grounded = true; }
        }
        updateTraps(dt);
        if (player.y > H + 100) { die(); return; }
        if (player.x >= 1050 && checkpoint < 1050) { checkpoint = 1080; note = 'Checkpoint \u0111\xE3 l\u01B0u.'; noteTimer = 2; }
        if (player.x > 2410) {
          state = 'won';
          var score = Math.max(0, Math.round(1000 - time * 8 - deaths * 90));
          if (score > best) { best = score; try { localStorage.setItem('ygp_best', String(best)); } catch (e) {} }
          return;
        }
        for (var s = 0; s < floorSpikes.length; s++) {
          var spike = floorSpikes[s], top = groundAt(spike.x, spike.x + spike.w);
          if (top && player.x + PW > spike.x && player.x < spike.x + spike.w && player.y + PH > top.y - 21 && player.y < top.y) { die(); return; }
        }
        for (var f = 0; f < falling.length; f++) {
          var fall = falling[f];
          if ((fall.state === 'dropping' || fall.state === 'down') && player.x + PW > fall.x && player.x < fall.x + fall.w && player.y + PH > fall.y - 8 && player.y < fall.y + 22) { die(); return; }
        }
        for (var r = 0; r < rising.length; r++) {
          var rise = rising[r];
          if (rise.h > 8 && player.x + PW > rise.x && player.x < rise.x + rise.w && player.y + PH > rise.y - rise.h && player.y < rise.y) { die(); return; }
        }
        for (var sw = 0; sw < saws.length; sw++) {
          var saw = saws[sw], sy = saw.y + Math.sin(time * 2.4 + saw.phase) * saw.amp;
          if (player.x + PW > saw.x - saw.r && player.x < saw.x + saw.r && player.y + PH > sy - saw.r && player.y < sy + saw.r) { die(); return; }
        }
        if (learned && player.x + PW > 1745 && player.x < 1792 && player.y < 260 && player.y + PH > 220) { die(); return; }
        var target = Math.max(0, Math.min(WORLD - W, player.x - 245));
        camera += (target - camera) * Math.min(1, dt * 7);
      }
      function updateTraps(dt) {
        for (var i = 0; i < falling.length; i++) {
          var f = falling[i];
          if (f.state === 'idle' && player.x > f.x - 165 && player.x < f.x + f.w + 20) { f.state = 'warning'; f.t = 0; }
          else if (f.state === 'warning') { f.t += dt; if (f.t > 0.5) f.state = 'dropping'; }
          else if (f.state === 'dropping') { f.y = Math.min(f.dest, f.y + 760 * dt); if (f.y >= f.dest) { f.state = 'down'; f.t = 0; } }
          else if (f.state === 'down' && player.x > f.x + f.w + 90) f.state = 'spent';
        }
        for (var j = 0; j < rising.length; j++) {
          var r = rising[j];
          if (r.state === 'idle' && player.x > r.x - 125 && player.x < r.x + r.w + 15) { r.state = 'warning'; r.t = 0; }
          else if (r.state === 'warning') { r.t += dt; if (r.t > 0.55) { r.state = 'up'; r.t = 0; } }
          else if (r.state === 'up') { r.h = Math.min(66, r.h + 520 * dt); if (r.h >= 66) { r.state = 'hold'; r.t = 0; } }
          else if (r.state === 'hold') { r.t += dt; if (r.t > 0.9) r.state = 'retract'; }
          else if (r.state === 'retract') { r.h = Math.max(0, r.h - 420 * dt); if (!r.h) r.state = 'spent'; }
        }
      }
      function rr(px, py, w, h, r, color) {
        x.fillStyle = color; x.fillRect(px, py, w, h);
      }
      function drawHero(px, py) {
        x.save(); x.translate(Math.round(px), Math.round(py)); x.scale(player.face, 1);
        var bob = player.grounded ? Math.sin(player.anim) * 2 : 0;
        x.fillStyle = 'rgba(7,12,28,.28)'; x.fillRect(-3, PH + 2, 27, 4);
        x.fillStyle = '#14243a'; x.fillRect(2, 21 + bob, 7, 9); x.fillRect(14, 21 - bob, 7, 9);
        x.fillStyle = '#ff6f61'; x.fillRect(0, 8 + bob, 22, 15);
        x.fillStyle = '#ffc857'; x.fillRect(3, 4 + bob, 16, 8);
        x.fillStyle = '#fff6dc'; x.fillRect(13, 6 + bob, 3, 3);
        x.fillStyle = '#263449'; x.fillRect(15, 7 + bob, 2, 2);
        x.fillStyle = '#8be9c1'; x.fillRect(-3, 12 + bob, 5, 5);
        x.restore();
      }
      function drawSpikes(px, count, surfaceY, color) {
        x.fillStyle = color;
        for (var i = 0; i < count; i++) {
          x.beginPath(); x.moveTo(px + i * 16, surfaceY); x.lineTo(px + 8 + i * 16, surfaceY - 22); x.lineTo(px + 16 + i * 16, surfaceY); x.fill();
        }
      }
      function draw() {
        x.save(); x.imageSmoothingEnabled = false;
        var g = x.createLinearGradient(0, 0, 0, H);
        g.addColorStop(0, '#101a36'); g.addColorStop(1, '#263956');
        x.fillStyle = g; x.fillRect(0, 0, W, H);
        x.fillStyle = '#f6d98a'; x.beginPath(); x.arc(674, 86, 33, 0, Math.PI * 2); x.fill();
        x.fillStyle = '#192746';
        for (var m = 0; m < 9; m++) { var mx = ((m * 139 - camera * 0.2) % 1200 + 1200) % 1200 - 100; x.beginPath(); x.moveTo(mx, 300); x.lineTo(mx + 90, 164 + (m % 3) * 23); x.lineTo(mx + 180, 300); x.fill(); }
        x.fillStyle = '#213653';
        for (var t = 0; t < 10; t++) { var tx = ((t * 113 - camera * 0.42) % 1100 + 1100) % 1100 - 80; x.fillRect(tx, 255 + (t % 3) * 15, 24, 95); x.fillRect(tx - 8, 247 + (t % 3) * 15, 40, 10); }
        for (var i = 0; i < grounds.length; i++) {
          var a = grounds[i].a - camera, b = grounds[i].b - camera;
          if (b < -30 || a > W + 30) continue;
          x.fillStyle = '#314b61'; x.fillRect(a, grounds[i].y, b - a, H - grounds[i].y);
          x.fillStyle = '#8be9c1'; x.fillRect(a, grounds[i].y, b - a, 7);
          x.fillStyle = '#46647a';
          for (var q = Math.ceil(grounds[i].a / 32) * 32; q < grounds[i].b; q += 32) x.fillRect(q - camera + 4, grounds[i].y + 20 + (q % 3) * 5, 5, 4);
        }
        for (var fs = 0; fs < floorSpikes.length; fs++) {
          var fp = floorSpikes[fs], base = groundAt(fp.x, fp.x + fp.w);
          if (base) drawSpikes(fp.x - camera, Math.ceil(fp.w / 16), base.y, '#ff6f61');
        }
        for (var ft = 0; ft < falling.length; ft++) {
          var trap = falling[ft], tx = trap.x - camera;
          if (trap.state === 'spent' || tx < -80 || tx > W + 80) continue;
          x.fillStyle = trap.state === 'warning' && Math.floor(tm * 12) % 2 ? '#ff6f61' : '#ffb45e';
          x.fillRect(tx - 5, 82, trap.w + 10, 5); x.fillStyle = '#ff6f61';
          for (var ti = 0; ti < 3; ti++) { x.beginPath(); x.moveTo(tx + ti * 16, trap.y - 8); x.lineTo(tx + 8 + ti * 16, trap.y + 20); x.lineTo(tx + 16 + ti * 16, trap.y - 8); x.fill(); }
        }
        for (var rt = 0; rt < rising.length; rt++) {
          var spike = rising[rt], rx = spike.x - camera;
          if (spike.state === 'spent' || rx < -70 || rx > W + 70) continue;
          if (spike.state === 'warning') { x.fillStyle = Math.floor(tm * 12) % 2 ? '#ff6f61' : '#f6d98a'; x.fillRect(rx - 4, spike.y - 8, spike.w + 8, 5); }
          if (spike.h > 0) {
            x.fillStyle = '#ff6f61';
            for (var ri = 0; ri < 3; ri++) { x.beginPath(); x.moveTo(rx + ri * 16, spike.y); x.lineTo(rx + 8 + ri * 16, spike.y - spike.h); x.lineTo(rx + 16 + ri * 16, spike.y); x.fill(); }
          }
        }
        for (var si = 0; si < saws.length; si++) {
          var saw = saws[si], sx = saw.x - camera, sy = saw.y + Math.sin(time * 2.4 + saw.phase) * saw.amp;
          if (sx < -40 || sx > W + 40) continue;
          x.save(); x.translate(sx, sy); x.rotate(tm * 3.2); x.fillStyle = '#d8e2ef';
          for (var tooth = 0; tooth < 8; tooth++) { x.rotate(Math.PI / 4); x.fillRect(-3, -saw.r - 5, 6, 10); }
          x.fillStyle = '#ff6f61'; x.beginPath(); x.arc(0, 0, saw.r - 3, 0, Math.PI * 2); x.fill();
          x.fillStyle = '#17233c'; x.beginPath(); x.arc(0, 0, 5, 0, Math.PI * 2); x.fill(); x.restore();
        }
        if (learned) {
          x.fillStyle = '#ff6f61';
          for (var sp = 0; sp < 3; sp++) { x.beginPath(); x.moveTo(1744 - camera + sp * 16, 220); x.lineTo(1752 - camera + sp * 16, 254); x.lineTo(1760 - camera + sp * 16, 220); x.fill(); }
          x.fillStyle = '#ffb45e'; x.fillRect(1739 - camera, 214, 54, 6);
        }
        var cp = 1080 - camera;
        x.fillStyle = '#f6d98a'; x.fillRect(cp, FLOOR - 58, 4, 58); x.fillStyle = '#8be9c1'; x.beginPath(); x.moveTo(cp + 4, FLOOR - 57); x.lineTo(cp + 38, FLOOR - 47); x.lineTo(cp + 4, FLOOR - 36); x.fill();
        var gx = 2435 - camera;
        x.fillStyle = '#f6d98a'; x.fillRect(gx, FLOOR - 64, 38, 64); x.fillStyle = '#8be9c1'; x.fillRect(gx + 8, FLOOR - 48, 22, 48); x.fillStyle = '#fff0b5'; x.fillRect(gx + 14, FLOOR - 40, 4, 4);
        if (player) drawHero(player.x - camera, player.y);
        x.fillStyle = 'rgba(8,15,31,.72)'; x.fillRect(14, 14, 258, 54);
        x.fillStyle = '#f7f2df'; x.font = '700 16px monospace'; x.textAlign = 'left'; x.fillText('YOU GOT PLAYED', 26, 36);
        x.font = '12px monospace'; x.fillStyle = '#ff9e81'; x.fillText('\u0110\u1ECAA NG\u1EE4C  \u2022  CH\u1EBET ' + deaths + '   NH\u1EA2Y ' + jumps + '   CHECKPOINT ' + (checkpoint > 100 ? '\u2713' : '\u2014'), 26, 56);
        if (noteTimer > 0 && state === 'run') {
          rr(250, 78, 300, 36, 8, 'rgba(13,21,42,.88)'); x.textAlign = 'center'; x.fillStyle = learned ? '#ff9e81' : '#f6d98a'; x.font = '700 14px monospace'; x.fillText(note, 400, 101);
        }
        if (state === 'title' || state === 'won' || state === 'paused') {
          x.fillStyle = 'rgba(8,13,29,.78)'; x.fillRect(0, 0, W, H);
          x.textAlign = 'center'; x.fillStyle = '#f6d98a'; x.font = '900 38px monospace';
          x.fillText(state === 'won' ? 'YOU GOT OUT.' : (state === 'paused' ? 'T\u1EA0M D\u1EEANG' : 'YOU GOT PLAYED'), 400, 166);
          x.fillStyle = '#c3d2df'; x.font = '16px monospace';
          x.fillText(state === 'won' ? 'B\u1EA1n \u0111\xE3 \u0111\xE1nh l\u1EEBa \u0111\u01B0\u1EE3c tr\xF2 ch\u01A1i.' : (state === 'paused' ? 'Nh\u1EA5n Esc ho\u1EB7c ch\u1EA1m \u0111\u1EC3 ti\u1EBFp t\u1EE5c' : '\u0110\u1ED8 KH\xD3 \u0110\u1ECAA NG\u1EE4C \u2022 Game s\u1EBD h\u1ECDc c\xE1ch b\u1EA1n ch\u01A1i.'), 400, 204);
          if (state === 'title') {
            rr(312, 242, 176, 54, 12, '#ff6f61'); x.fillStyle = '#1a2238'; x.font = '800 18px monospace'; x.fillText('B\u1EAET \u0110\u1EA6U', 400, 276);
            x.fillStyle = '#b8c8d9'; x.font = '12px monospace'; x.fillText('A/D ho\u1EB7c \u2190/\u2192 di chuy\u1EC3n \u2022 Space nh\u1EA3y \u2022 R h\u1ED3i sinh \u2022 Esc t\u1EA1m d\u1EEBng', 400, 329);
          }
          if (state === 'won') { x.font = '14px monospace'; x.fillText('Th\u1EDDi gian ' + Math.floor(time) + 's  \u2022  S\u1ED1 l\u1EA7n ch\u1EBFt ' + deaths + '  \u2022  K\u1EF7 l\u1EE5c ' + best, 400, 242); x.fillText('Nh\u1EA5n Space ho\u1EB7c ch\u1EA1m \u0111\u1EC3 ch\u01A1i l\u1EA1i', 400, 285); }
        }
        if (state === 'dead') {
          x.fillStyle = 'rgba(9,14,30,.48)'; x.fillRect(0, 0, W, H); x.textAlign = 'center'; x.fillStyle = '#ff9e81'; x.font = '800 24px monospace'; x.fillText('B\u1EA0N D\xCDNH B\u1EAAY!', 400, 210);
          x.fillStyle = '#f7f2df'; x.font = '14px monospace'; x.fillText('H\u1ED3i sinh t\u1EA1i checkpoint\u2026', 400, 238);
        }
        x.restore();
        if (controls) controls.hidden = state !== 'run';
      }
      function keyDown(e) {
        if (e.code === 'Escape') { togglePause(); return; }
        if (e.code === 'KeyR' && state !== 'title') { deaths++; resetPlayer(checkpoint); note = 'Quay l\u1EA1i checkpoint.'; noteTimer = 1.5; return; }
        keys[e.code] = true;
      }
      function keyUp(e) { keys[e.code] = false; }
      var touchButtons = document.querySelectorAll('[data-played-control]');
      for (var i = 0; i < touchButtons.length; i++) {
        (function (b) {
          var action = b.getAttribute('data-played-control');
          b.addEventListener('pointerdown', function (e) { e.preventDefault(); try { b.setPointerCapture(e.pointerId); } catch (err) {} if (action === 'jump') jump(); else if (action === 'pause') togglePause(); else touch[action] = true; });
          function release(e) { if (e) e.preventDefault(); if (action === 'left' || action === 'right') touch[action] = false; }
          b.addEventListener('pointerup', release); b.addEventListener('pointercancel', release); b.addEventListener('lostpointercapture', release);
        })(touchButtons[i]);
      }
      return {
        w: W, h: H, hint: '\u0110\u1ED9 kh\xF3 \u0111\u1ECBa ng\u1EE5c ngay t\u1EEB \u0111\u1EA7u: v\u01B0\u1EE3t \u0111\u1ECBa h\xECnh cao th\u1EA5p, n\xE9 gai b\u1EADt/r\u01A1i v\xE0 c\u01B0a bay. D\xF9ng A/D ho\u1EB7c c\xE1c n\xFAt tr\xEAn m\xE0n h\xECnh.',
        update: update, draw: draw,
        key: jump, keyDown: keyDown, keyUp: keyUp,
        down: function (px, py) { if (state === 'title' && px >= 312 && px <= 488 && py >= 242 && py <= 300) start(); else if (state === 'title' || state === 'won') jump(); else if (state === 'paused') togglePause(); },
        enter: function () { if (state === 'paused') state = pausedFrom; },
        leave: function () { if (state === 'run') { pausedFrom = 'run'; state = 'paused'; } keys = {}; touch.left = false; touch.right = false; },
        busy: function () { return state === 'run' || state === 'dead' || state === 'paused'; }
      };
    })();
`;

// src/page/client/main.js
var clientMain = `    // ===================== CHUNG =====================
    var motorways = { w: 480, h: 270, hint: 'K\xE9o chu\u1ED9t ho\u1EB7c ng\xF3n tay \u0111\u1EC3 v\u1EBD \u0111\u01B0\u1EDDng n\u1ED1i nh\xE0 v\u1EDBi \u0111i\u1EC3m \u0111\u1EBFn c\xF9ng m\xE0u.', update: function () {}, draw: function () {} };
    var games = { flappy: flappy, pool: pool, caro: caro, sword: sword, wolf: wolf, motorways: motorways, played: played };
    var cur = flappy;
    var hint = document.getElementById('hint');
    var tabs = document.querySelectorAll('.tab');
    hint.textContent = flappy.hint;

    function switchTo(g) {
      if (cur === games[g]) return;
      if (cur.leave) cur.leave();
      cur = games[g];
      if (cur.enter) cur.enter();
      setSize(cur.w, cur.h);
      for (var i = 0; i < tabs.length; i++) {
        tabs[i].className = 'tab' + (tabs[i].getAttribute('data-g') === g ? ' on' : '');
      }
      document.getElementById('poolui').hidden = (g !== 'pool');
      document.getElementById('caroui').hidden = (g !== 'caro');
      document.getElementById('swordui').hidden = (g !== 'sword');
      document.getElementById('wolfui').hidden = (g !== 'wolf');
      document.getElementById('gameBox').hidden = (g === 'wolf');
      document.getElementById('g').hidden = (g === 'motorways');
      document.getElementById('motorwaysFrame').hidden = (g !== 'motorways');
      var cardEl = document.querySelector('.card');
      if (cardEl) cardEl.setAttribute('data-w', g === 'wolf' ? 'menu' : (g === 'sword' ? 'arena' : (g === 'motorways' ? 'motorways' : (g === 'played' ? 'played' : ''))));
      hint.textContent = cur.hint;
    }
    for (var t = 0; t < tabs.length; t++) {
      tabs[t].addEventListener('click', function () { switchTo(this.getAttribute('data-g')); });
    }

    function pos(e) {
      var r = c.getBoundingClientRect();
      return [(e.clientX - r.left) * cur.w / r.width, (e.clientY - r.top) * cur.h / r.height];
    }
    c.addEventListener('pointerdown', function (e) {
      e.preventDefault();
      try { c.setPointerCapture(e.pointerId); } catch (err) {}
      var p = pos(e);
      cur.down(p[0], p[1], e.pointerType);
    });
    c.addEventListener('pointermove', function (e) {
      if (!cur.move) return;
      var p = pos(e);
      cur.move(p[0], p[1], e.pointerType);
    });
    c.addEventListener('pointerleave', function () { if (cur.out) cur.out(); });
    c.addEventListener('pointerup', function () { if (cur.up) cur.up(); });
    c.addEventListener('pointercancel', function () { if (cur.cancel) cur.cancel(); });
    document.addEventListener('keydown', function (e) {
      if (e.target && e.target.tagName === 'INPUT') return;
      if (cur.keyDown) cur.keyDown(e);
      if (e.code === 'Space' || e.code === 'ArrowUp') { e.preventDefault(); cur.key(); }
    });
    document.addEventListener('keyup', function (e) { if (cur.keyUp) cur.keyUp(e); });
    document.getElementById('reload').addEventListener('click', function () { location.reload(); });

    // T\u1EF1 k\u1EBFt n\u1ED1i l\u1EA1i: ping nh\u1EB9 m\u1ED7i 10s khi tab \u0111ang hi\u1EC7n. \u0110ang \u0111\u1EA5u online th\xEC KH\xD4NG t\u1EF1 t\u1EA3i l\u1EA1i.
    var st = document.getElementById('st');
    setInterval(function () {
      if (document.hidden) return;
      fetch(location.pathname + location.search, { method: 'HEAD', cache: 'no-store' })
        .then(function (r) {
          if (r.status < 500) {
            if (pool.busy() || caro.busy() || sword.busy() || wolf.busy() || played.busy()) {
              st.textContent = 'Server \u0111\xE3 s\u1ED1ng l\u1EA1i! Ch\u01A1i xong v\xE1n r\u1ED3i b\u1EA5m T\u1EA3i l\u1EA1i trang nh\xE9.';
            } else {
              st.textContent = '\u0110\xE3 k\u1EBFt n\u1ED1i l\u1EA1i! \u0110ang t\u1EA3i trang...';
              location.reload();
            }
          }
        })
        .catch(function () {});
    }, 10000);

    var last = performance.now();
    function loop(now) {
      var dt = Math.min(0.033, (now - last) / 1000);
      last = now; tm += dt;
      cur.update(dt);
      cur.draw();
      requestAnimationFrame(loop);
    }
    requestAnimationFrame(loop);
  })();
  <\/script>
</body>
</html>`;

// src/page/render.js
function renderOffline(request) {
  const accept = request.headers.get("Accept") || "";
  const isPageLoad = request.method === "GET" && accept.includes("text/html");
  if (!isPageLoad) {
    return new Response("Service Unavailable", {
      status: 503,
      headers: {
        "Content-Type": "text/plain; charset=UTF-8",
        "Retry-After": "10",
        "Cache-Control": "no-store"
      }
    });
  }
  const hostname = new URL(request.url).hostname.replace(/[^a-zA-Z0-9.\-:]/g, "");
  const html = head(hostname) + styleBase + styleWolf + styleSword + stylePlayed + body(hostname) + clientCore + clientFlappy + clientPool + clientCaro + clientSword + clientWolf + clientPlayed + clientMain;
  return new Response(html, {
    status: 503,
    headers: {
      "Content-Type": "text/html; charset=UTF-8",
      "Retry-After": "10",
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate"
    }
  });
}
__name(renderOffline, "renderOffline");

// src/game-socket.js
function handleGameSocket(request, env, url) {
  const origin = request.headers.get("Origin");
  if (origin) {
    let ok = false;
    try {
      ok = new URL(origin).host === url.host;
    } catch (e) {
    }
    if (!ok) return new Response("Forbidden", { status: 403 });
  }
  const room = (url.searchParams.get("room") || "").toUpperCase();
  if (!/^[A-Z0-9]{4}$/.test(room)) return new Response("Bad room", { status: 400 });
  const g = url.searchParams.get("g");
  const game = g === "caro" || g === "wolf" || g === "sword" || g === "bomb" ? g : "pool";
  const ns = game === "bomb" ? env.BOMB : game === "wolf" ? env.WOLF : env.POOL;
  if (!ns) return new Response("Online ch\u01B0a \u0111\u01B0\u1EE3c c\u1EA5u h\xECnh", { status: 501 });
  const stub = ns.get(ns.idFromName(game + ":" + room));
  return stub.fetch(request);
}
__name(handleGameSocket, "handleGameSocket");

// worker.js
import miniMotorways from "./24d824bcf4610863af2beb87f5e5e27dbf622eca-Mini_Motorways.html";

// src/page/games/bomb-arena.generated.js
var bomb_arena_generated_default = `<!doctype html>
<html lang="vi"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#15141d"><title>Bomb Arena \xB7 \u0110\u1EA5u tr\u01B0\u1EDDng b\xF9ng n\u1ED5</title><style>:root {
  color-scheme: dark;
  --accent: #ff9c45;
  --accent-light: #ffba76;
  --text: #f6f0eb;
  --muted: #b4acb4;
  --surface: #242330;
  --border: #45404b;
}
* { box-sizing: border-box; }
html, body {
  margin: 0;
  min-height: 100%;
  font-family: 'Segoe UI', Arial, sans-serif;
  font-size: 14px;
  line-height: 1.5;
  color: #f6f0eb;
  background-color: #15141d;
}
body { background-image: radial-gradient(ellipse at 75% 0, #a6522526, transparent 65%); }
button, input, select { font: inherit; color: inherit; }
button { cursor: pointer; border: 1px solid var(--border); background: #34303e; border-radius: 10px; padding: 10px 14px; line-height: 1.4; transition: background .15s; }
button:hover { background: #4a3b3b; }
button:focus-visible, input:focus-visible, select:focus-visible { outline: 3px solid var(--accent); outline-offset: 3px; }
button:disabled { opacity: .5; cursor: default; }
[hidden] { display: none !important; }
h1, h2, p { margin-top: 0; }
h1, h2 { color: var(--text); }
main { width: min(1480px, 100%); margin-inline: auto; padding: 0 28px; }
header { min-height: 72px; display: flex; align-items: center; justify-content: space-between; gap: 16px; border-bottom: 1px solid #ffffff14; }
.brand { font-size: 22px; letter-spacing: -.8px; font-weight: 900; color: var(--text); text-decoration: none; display: flex; align-items: center; gap: 5px; white-space: nowrap; }
.brand > span:last-child { color: var(--accent); }
.brand-icon { display: grid; place-items: center; background: var(--accent); color: #342014; border-radius: 12px; width: 38px; height: 38px; font-size: 32px; margin-right: 7px; }
.header-right { display: flex; align-items: center; gap: 18px; }
.tag { font-size: 10px; letter-spacing: 2px; color: var(--muted); }
.icon { width: 38px; height: 38px; padding: 6px; font-size: 20px; flex-shrink: 0; }
.intro { display: flex; justify-content: space-between; align-items: center; gap: 16px; padding: 22px 0; }
.eyebrow { font-size: 10px; letter-spacing: 1.7px; color: var(--accent-light); font-weight: 700; margin: 0 0 8px; }
h1 { font-size: clamp(28px, 3vw, 40px); letter-spacing: -1.2px; line-height: 1.15; margin: 0 0 8px; font-weight: 900; }
h1 span, .hero-star { color: var(--accent); }
.intro p:last-child { font-size: 13px; color: var(--muted); margin: 0; }
.hero-star { font-size: 76px; line-height: 1; transform: rotate(15deg); padding-right: 12px; }
.layout { display: grid; grid-template-columns: minmax(0, 1fr) 320px; gap: 20px; align-items: start; }
.arena { min-width: 0; border-radius: 16px; border: 1px solid var(--border); overflow: hidden; background: #242330; box-shadow: 0 15px 60px #0003; }
.arena-top { min-height: 54px; display: grid; grid-template-columns: minmax(0, 1fr) auto minmax(0, 1fr); align-items: center; gap: 12px; padding: 8px 16px; font-size: 11px; letter-spacing: .8px; }
.arena-top > .icon { justify-self: end; }
.arena-top i { display: inline-block; width: 7px; height: 7px; border-radius: 50%; background: var(--accent); margin-right: 6px; }
#timer { font-size: 24px; font-weight: 800; letter-spacing: 1px; color: var(--text); font-variant-numeric: tabular-nums; }
.stage { position: relative; background: #163d3b; padding: 8px; }
canvas { width: 100%; height: auto; display: block; aspect-ratio: 21 / 15; border-radius: 6px; }
.arena-bottom { display: flex; align-items: center; justify-content: space-between; gap: 12px; padding: 12px 16px; font-size: 11px; color: var(--muted); }
.arena-bottom > span:first-child { color: var(--accent-light); }
.overlay { position: absolute; inset: 0; display: grid; place-items: center; overflow-y: auto; background: #15141dba; backdrop-filter: blur(3px); padding: 12px; }
.modal { width: min(100%, 350px); text-align: center; padding: 18px; margin: auto; }
#modal-icon { font-size: 52px; color: var(--accent); line-height: 1; margin-bottom: 14px; }
h2 { font-size: 20px; line-height: 1.3; letter-spacing: -.4px; margin: 0 0 14px; }
.modal h2 { font-size: clamp(21px, 2.2vw, 28px); }
.modal > p:not(.eyebrow) { color: #d4cbd1; font-size: 13px; line-height: 1.7; margin-bottom: 16px; }
.primary { background: var(--accent); color: #302015; border: 1px solid transparent; font-weight: 800; display: flex; justify-content: center; align-items: center; gap: 16px; padding: 13px 20px; }
.primary:hover { background: var(--accent-light); }
.modal .primary { width: 100%; margin: 16px 0 8px; }
.modal #help { background: transparent; border: none; font-size: 12px; color: #e2d9dd; }
#secondary-actions { display: flex; flex-wrap: wrap; gap: 8px; justify-content: center; }
aside { display: grid; gap: 14px; min-width: 0; max-height: calc(100dvh - 210px); overflow-y: auto; scrollbar-width: thin; scrollbar-color: #6b5347 transparent; padding-right: 4px; }
.panel { min-width: 0; background: var(--surface); border: 1px solid var(--border); border-radius: 14px; padding: 18px; }
.panel h2 { font-size: 19px; }
fieldset { min-width: 0; padding: 0; border: 0; margin: 0; }
label { display: block; font-size: 12px; color: #d2c5cb; margin: 12px 0 8px; }
select, .online-panel input { display: block; width: 100%; min-width: 0; height: 42px; margin-top: 7px; background: #302c3b; border: 1px solid #514650; border-radius: 8px; padding: 9px 10px; font-size: 12px; color: var(--text); }
input::placeholder { color: #b9aeb6; opacity: 1; }
.two-cols { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr); gap: 12px; }
.themes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 8px; }
.themes button { padding: 9px 2px; font-size: 11px; background: #302c3b; }
.themes span { display: block; font-size: 26px; line-height: 1.4; color: #abdab9; }
.themes button:nth-child(2) span { color: #e3af81; }
.themes button:nth-child(3) span { color: #8bd9ec; }
.themes .selected { border-color: var(--accent); background: #ff9c451a; }
.note { font-size: 11px; color: var(--muted); margin: 12px 0 0; line-height: 1.7; }
.robot-row { display: grid; grid-template-columns: 32px minmax(0, 1fr) auto; align-items: center; gap: 10px; padding: 10px 0; border-bottom: 1px solid #ffffff12; }
.robot-row:last-child { border: 0; padding-bottom: 0; }
.robot-avatar { width: 32px; height: 32px; display: grid; place-items: center; border-radius: 9px; font-size: 22px; color: #1b2541; }
.robot-row b { font-size: 12px; display: block; overflow-wrap: anywhere; }
.robot-row small { font-size: 11px; color: var(--muted); }
.robot-row .status { font-size: 10px; color: var(--accent-light); white-space: nowrap; }
.controls > p:not(.eyebrow) { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 6px; font-size: 11px; margin: 12px 0; }
.controls b { color: #eee2e7; }
.controls span { color: var(--muted); }
.tip { font-size: 12px; line-height: 1.8; background: #ff9c450b; border: 1px solid #ff9c4538; padding: 12px; border-radius: 8px; color: var(--accent-light); margin-top: 16px; }
.tip span { font-size: 11px; }
.legend { font-size: 11px; color: #c4b4be; line-height: 2; margin-top: 10px; }
footer { display: flex; flex-wrap: wrap; justify-content: space-between; gap: 12px; padding: 20px 0; font-size: 10px; color: var(--muted); }
.touch { display: none; }
dialog { width: min(480px, calc(100% - 32px)); max-height: calc(100dvh - 40px); border: 1px solid #6c5349; border-radius: 18px; background: #242330; color: var(--text); padding: 26px; }
dialog p { font-size: 14px; line-height: 1.8; }
dialog::backdrop { background: #100d18c9; }
fieldset:disabled { opacity: .7; }
.room-actions { display: grid; grid-template-columns: minmax(0, 1fr) minmax(0, 1fr) auto; gap: 8px; margin-top: 12px; align-items: center; }
.room-actions button { height: 42px; padding: 8px; font-size: 12px; white-space: nowrap; }
.room-actions input { margin: 0; text-transform: uppercase; }
.room-badge { display: flex; flex-wrap: wrap; align-items: center; gap: 12px; font-size: 12px; }
.room-badge strong { font-size: 26px; letter-spacing: 3px; color: var(--accent); }
.room-badge button { padding: 6px 10px; font-size: 11px; }
.online-panel ul { padding: 0; list-style: none; font-size: 13px; line-height: 2.2; }
.online-panel li { border-bottom: 1px solid #ffffff12; overflow-wrap: anywhere; }
.online-panel li small { color: var(--accent-light); margin-left: 8px; }
.online-panel #leave-room { font-size: 12px; padding: 8px 12px; }
body[data-online="true"][data-room-phase="playing"] .panel:has(#settings) { display: none; }
body[data-online="true"] .arena-bottom > span:last-child { font-size: 0; }
body[data-online="true"] .arena-bottom > span:last-child:after { content: 'ONLINE \xB7 TR\u1EF0C TI\u1EBEP'; font-size: 10px; }
body[data-online="true"] .controls > p:nth-of-type(4) { display: none; }
@media (min-width: 1051px) {
  main { max-width: min(1480px, calc((100dvh - 260px) * 1.4 + 396px)); }
  aside { height: 0; min-height: 100%; max-height: none; }
}
@media (max-width: 1050px) {
  main { padding-inline: 20px; }
  .layout { grid-template-columns: minmax(0, 1fr); }
  aside { max-height: none; overflow: visible; padding: 0; grid-template-columns: repeat(2, minmax(0, 1fr)); align-items: start; }
}
@media (max-width: 600px) {
  main { padding-inline: 12px; }
  header { min-height: 62px; }
  .brand { font-size: 19px; }
  .tag { display: none; }
  .intro { padding: 18px 0; }
  .intro .eyebrow { font-size: 9px; letter-spacing: 1px; }
  .intro p:last-child { font-size: 12px; }
  .hero-star { font-size: 48px; padding: 0; }
  .layout { gap: 12px; }
  .arena-top { min-height: 48px; padding: 6px 10px; font-size: 10px; }
  #timer { font-size: 21px; }
  .stage { padding: 4px; }
  .arena-bottom { padding: 9px 10px; font-size: 10px; }
  .overlay { padding: 8px; }
  .modal { padding: 8px; }
  #modal-icon { font-size: 30px; margin-bottom: 8px; }
  .modal .eyebrow { font-size: 9px; margin-bottom: 6px; }
  .modal h2 { font-size: 21px; margin-bottom: 8px; }
  .modal > p:not(.eyebrow) { font-size: 12px; line-height: 1.4; margin-bottom: 8px; }
  .modal .primary { margin: 8px 0 4px; padding: 10px 16px; }
  .modal #help { padding: 6px; }
  aside { grid-template-columns: minmax(0, 1fr); gap: 12px; }
  .panel { padding: 16px; }
  footer { padding-bottom: 130px; }
}
@media (pointer: coarse) {
  .touch { display: flex; justify-content: space-between; align-items: center; position: sticky; bottom: 8px; margin: 12px 0; background: #211c2aed; border: 1px solid #6c5349; padding: 10px; border-radius: 16px; z-index: 3; touch-action: none; }
  .touch button { touch-action: none; user-select: none; -webkit-user-select: none; }
  .dpad { display: grid; grid-template-columns: repeat(3, 44px); grid-template-rows: repeat(2, 40px); gap: 4px; }
  .dpad button { padding: 0; font-size: 24px; }
  .dpad button:first-child { grid-column: 2; }
  .dpad button:nth-child(2) { grid-column: 1; grid-row: 2; }
  .dpad button:nth-child(3) { grid-column: 2; grid-row: 2; }
  .dpad button:nth-child(4) { grid-column: 3; grid-row: 2; }
  .bomb-touch { border-radius: 50%; width: 76px; height: 76px; background: var(--accent); color: #302015; font-size: 26px; }
  .bomb-touch small { display: block; font-size: 9px; font-weight: 800; }
}\r
</style></head>
<body><main>
  <header><a class="brand" href="./"><span class="brand-icon">\u2739</span> BOMB<span>ARENA</span></a><div class="header-right"><span class="tag">LOCAL MULTIPLAYER</span><button id="sound" class="icon" aria-label="B\u1EADt t\u1EAFt \xE2m thanh">\u266B</button></div></header>
  <section class="intro"><div><p class="eyebrow">CH\xC2M NG\xD2I CHO CU\u1ED8C VUI</p><h1>Nh\u1ECF m\xE0 <span>b\xF9ng n\u1ED5.</span></h1><p>Ch\u1ECDn robot. \u0110\u1EB7t bom. S\u1ED1ng s\xF3t cu\u1ED1i c\xF9ng.</p></div><span class="hero-star" aria-hidden="true">\u2739</span></section>
  <div class="layout"><section class="arena"><div class="arena-top"><span><i></i> <b id="arena-name">KHU V\u01AF\u1EDCN</b></span><span id="timer">03:00</span><button id="pause" class="icon" aria-label="T\u1EA1m d\u1EEBng">\u2161</button></div>
    <div class="stage"><canvas id="board" width="1008" height="720" aria-label="\u0110\u1EA5u tr\u01B0\u1EDDng Bomb Arena"></canvas>
    <div id="overlay" class="overlay"><div class="modal"><div id="modal-icon">\u2739</div><p class="eyebrow" id="modal-label">S\u1EB4N S\xC0NG B\xD9NG N\u1ED4?</p><h2 id="modal-title">\u0110\u1EA5u tr\u01B0\u1EDDng \u0111ang ch\u1EDD!</h2><p id="modal-text">Ph\xE1 kh\u1ED1i, nh\u1EB7t s\u1EE9c m\u1EA1nh v\xE0 tr\u1EDF th\xE0nh robot cu\u1ED1i c\xF9ng.</p><button id="primary" class="primary">Ch\u01A1i ngay <span>\u2192</span></button><div id="secondary-actions" hidden><button id="restart">Ch\u01A1i l\u1EA1i</button><button id="menu">V\u1EC1 menu</button></div><button id="help">C\xE1ch ch\u01A1i \u2197</button></div></div></div>
    <div class="arena-bottom"><span>\u2726 <span id="alive">4 robot s\u1EB5n s\xE0ng</span></span><span>ESC \xB7 T\u1EA1m d\u1EEBng</span></div>
  </section><aside>
    <section class="panel online-panel"><p class="eyebrow">CH\u01A0I C\xD9NG B\u1EA0N B\xC8 / ONLINE</p><h2>Ph\xF2ng 4 ng\u01B0\u1EDDi</h2><div id="room-entry"><label>T\xEAn c\u1EE7a b\u1EA1n<input id="player-name" maxlength="20" placeholder="Nh\u1EADp t\xEAn robot" autocomplete="nickname"></label><div class="room-actions"><button id="create-room" class="primary">T\u1EA1o ph\xF2ng</button><input id="room-code" aria-label="M\xE3 ph\xF2ng" placeholder="M\xC3 PH\xD2NG" maxlength="4" autocomplete="off"><button id="join-room">V\xE0o</button></div></div><div id="room-lobby" hidden><div class="room-badge">M\xE3 ph\xF2ng <strong id="room-id"></strong><button id="copy-room" aria-label="Sao ch\xE9p m\xE3 ph\xF2ng">Copy</button></div><ul id="room-players"></ul><button id="leave-room">R\u1EDDi ph\xF2ng</button></div><p id="room-message" class="note" role="status" aria-live="polite">T\u1EA1o ph\xF2ng r\u1ED3i g\u1EEDi m\xE3 cho b\u1EA1n b\xE8. 2\u20134 ng\u01B0\u1EDDi, m\u1ED7i ng\u01B0\u1EDDi m\u1ED9t thi\u1EBFt b\u1ECB.</p></section>
    <section class="panel"><p class="eyebrow">01 / THI\u1EBET L\u1EACP TR\u1EACN \u0110\u1EA4U</p><h2>S\xE2n ch\u01A1i c\u1EE7a b\u1EA1n</h2><fieldset id="settings"><label>Ng\u01B0\u1EDDi ch\u01A1i<select id="humans"><option value="1">1 ng\u01B0\u1EDDi \xB7 \u0110\u1EA5u v\u1EDBi bot</option><option value="2" id="two-player">2 ng\u01B0\u1EDDi \xB7 C\xF9ng b\xE0n ph\xEDm</option></select></label><div class="two-cols"><label>S\u1ED1 bot<select id="bots"><option value="1">1 bot</option><option value="2">2 bot</option><option value="3" selected>3 bot</option><option value="0">0 bot</option></select></label><label>\u0110\u1ED9 kh\xF3<select id="difficulty"><option value="easy">D\u1EC5</option><option value="normal" selected>V\u1EEBa</option><option value="hard">Kh\xF3</option></select></label></div><label>Ch\u1ECDn b\u1EA3n \u0111\u1ED3</label><div class="themes"><button data-theme="garden" class="selected"><span>\u2740</span>V\u01B0\u1EDDn xanh</button><button data-theme="factory"><span>\u2699</span>Nh\xE0 m\xE1y</button><button data-theme="ice"><span>\u2744</span>B\u0103ng gi\xE1</button></div></fieldset><p class="note">M\u1ED7i tr\u1EADn 3 ph\xFAt. M\u1ED9t ng\u01B0\u1EDDi s\u1ED1ng s\xF3t.</p></section>
    <section class="panel"><p class="eyebrow">02 / \u0110\u1ED8I H\xCCNH</p><div id="roster"></div></section>
    <section class="panel controls"><p class="eyebrow">03 / B\xCD K\xCDP SINH T\u1ED2N</p><p><b>W A S D</b><span>Di chuy\u1EC3n P1</span></p><p><b>SPACE</b><span>\u0110\u1EB7t bom P1</span></p><p><b>\u2191 \u2190 \u2193 \u2192 / ENTER</b><span>Di chuy\u1EC3n / bom P2</span></p><div class="tip">\u2726 \u0110\u1EEBng qu\xEAn \u0111\u01B0\u1EDDng lui!<br><span>Bom n\u1ED5 sau 2,5 gi\xE2y v\xE0 c\xF3 th\u1EC3 h\u1EA1 c\u1EA3 b\u1EA1n.</span></div><div class="legend">\u25CF +Bom &nbsp; \u2726 +T\u1EA7m n\u1ED5<br>\xBB +T\u1ED1c \u0111\u1ED9 &nbsp; \u25C6 Khi\xEAn</div></section>
  </aside></div><div class="touch"><div class="dpad"><button data-control="KeyW" aria-label="L\xEAn">\u2191</button><button data-control="KeyA" aria-label="Tr\xE1i">\u2190</button><button data-control="KeyS" aria-label="Xu\u1ED1ng">\u2193</button><button data-control="KeyD" aria-label="Ph\u1EA3i">\u2192</button></div><button class="bomb-touch" data-control="Space">\u25CF<small>\u0110\u1EB6T BOM</small></button></div>
  <footer><span>BOMB ARENA / \u0110\u1ED3 h\u1ECDa & \xE2m thanh nguy\xEAn b\u1EA3n</span><span>Ch\u01A1i h\u1EBFt m\xECnh. B\xF9ng n\u1ED5 th\u1EADt vui. \u2726</span></footer>
</main><dialog id="instructions"><h2>C\xE1ch ch\u01A1i</h2><p>P1: WASD + Space. P2: ph\xEDm m\u0169i t\xEAn + Enter. Esc \u0111\u1EC3 t\u1EA1m d\u1EEBng.</p><p>Ph\xE1 th\xF9ng \u0111\u1EC3 t\xECm v\u1EADt ph\u1EA9m. T\u01B0\u1EDDng \u0111\xE1 ch\u1EB7n l\u1EEDa. Bom n\u1ED5 h\xECnh d\u1EA5u c\u1ED9ng v\xE0 k\xEDch n\u1ED5 c\xE1c bom kh\xE1c. Bom ch\u1EB7n \u0111\u01B0\u1EDDng, nh\u01B0ng b\u1EA1n c\xF3 th\u1EC3 b\u01B0\u1EDBc ra kh\u1ECFi bom v\u1EEBa \u0111\u1EB7t. S\xE1t th\u01B0\u01A1ng ch\u1EC9 t\xEDnh l\xFAc n\u1ED5, k\u1EC3 c\u1EA3 v\u1EDBi ng\u01B0\u1EDDi \u0111\u1EB7t bom. L\u1EEDa c\xF2n l\u1EA1i 0,65 gi\xE2y ch\u1EC9 l\xE0 hi\u1EC7u \u1EE9ng, \u0111i v\xE0o sau s\u1EBD an to\xE0n.</p><p>\u25CF T\u0103ng s\u1ED1 bom \xB7 \u2726 T\u0103ng t\u1EA7m n\u1ED5 \xB7 \xBB T\u0103ng t\u1ED1c \xB7 \u25C6 Ch\u1EB7n m\u1ED9t l\u1EA7n s\xE1t th\u01B0\u01A1ng v\xE0 b\u1EA5t t\u1EED 1,2 gi\xE2y.</p><p>Ng\u01B0\u1EDDi s\u1ED1ng cu\u1ED1i th\u1EAFng. C\xF9ng b\u1ECB lo\u1EA1i ho\u1EB7c h\u1EBFt gi\u1EDD c\xF2n nhi\u1EC1u ng\u01B0\u1EDDi: h\xF2a. Mobile: D-pad v\xE0 n\xFAt bom, h\u1ED7 tr\u1EE3 nh\u1EA5n \u0111\u1ED3ng th\u1EDDi.</p><form method="dialog"><button class="primary">\u0110\xE3 hi\u1EC3u!</button></form></dialog><script type="module">const modules = {};
modules["map.js"] = (()=>{
const W = 21;
const H = 15;
const dirs = [[1,0],[-1,0],[0,1],[0,-1]];
const key = (x,y) => \`\${x},\${y}\`;
const cell = p => [Math.round(p.x), Math.round(p.y)];
function makeMap(random = Math.random) {
  return Array.from({length:H}, (_,y) => Array.from({length:W}, (_,x) => {
    if (!x || !y || x===W-1 || y===H-1 || (x%2===0 && y%2===0)) return 1;
    if ((x<=2 || x>=W-3) && (y<=2 || y>=H-3)) return 0;
    return random()<0.68 ? 2 : 0;
  }));
}
function blast(map, bomb) {
  const cells = [[bomb.x,bomb.y]];
  for (const [dx,dy] of dirs) for (let n=1;n<=bomb.range;n++) {
    const x=bomb.x+dx*n,y=bomb.y+dy*n;
    if (map[y]?.[x]===undefined || map[y][x]===1) break;
    cells.push([x,y]);
    if (map[y][x]===2) break;
  }
  return cells;
}

return {W,H,dirs,key,cell,makeMap,blast};
})();
modules["items.js"] = (()=>{
const itemIcons = {bomb:'\u25CF',range:'\u2726',speed:'\xBB',shield:'\u25C6'};
function dropItem(random=Math.random) {
  if(random()>=.38)return null;
  // Speed is half of all drops (19% per crate), twice its previous rate.
  const roll=random();
  return roll<.5?'speed':roll<.7?'bomb':roll<.9?'range':'shield';
}
function collect(s,p) {
  const i=s.items.findIndex(i=>Math.abs(i.x-p.x)<.4 && Math.abs(i.y-p.y)<.4);
  if (i<0) return;
  const [item]=s.items.splice(i,1);
  if(item.type==='bomb') p.capacity=Math.min(6,p.capacity+1);
  if(item.type==='range') p.range=Math.min(8,p.range+1);
  if(item.type==='speed') p.speed=Math.min(6.6,p.speed+.4);
  if(item.type==='shield') p.shield=true;
  s.events.push('pickup');
  s.particles.push({x:p.x,y:p.y,t:.7,color:'#ffb36b'});
}

return {itemIcons,dropItem,collect};
})();
modules["bombs.js"] = (()=>{
const {blast,cell,key} = modules["map.js"];
const {dropItem} = modules["items.js"];
function place(s,p) {
  const [x,y]=cell(p);
  if (!p.alive || s.bombs.filter(b=>b.owner===p.id).length>=p.capacity || s.bombs.some(b=>b.x===x&&b.y===y) || s.map[y][x]!==0) return false;
  s.bombs.push({x,y,owner:p.id,range:p.range,t:2.5,pass:new Set(s.players.filter(q=>q.alive&&Math.abs(q.x-x)<.74&&Math.abs(q.y-y)<.74).map(q=>q.id))});
  s.events.push('place');return true;
}
function updateBombs(s,dt) {
  s.fire=s.fire.filter(f=>(f.t-=dt)>0);
  for(const b of s.bombs) b.t-=dt;
  const queue=s.bombs.filter(b=>b.t<=0), exploded=new Set(), destroyed=new Set();
  // Snapshot obstacles for this tick so simultaneous blasts cannot cross a just destroyed crate.
  while(queue.length) {
    const b=queue.shift();if(exploded.has(b))continue;exploded.add(b);
    for(const [x,y] of blast(s.map,b)) {
      s.fire.push({x,y,t:.65,fresh:true});
      if(s.map[y][x]===2) destroyed.add(key(x,y));
      else s.items=s.items.filter(i=>i.x!==x||i.y!==y);
      for(const other of s.bombs) if(other.x===x&&other.y===y&&!exploded.has(other)) queue.push(other);
    }
    s.events.push('explode');
  }
  s.bombs=s.bombs.filter(b=>!exploded.has(b));
  for(const k of destroyed) {
    const [x,y]=k.split(',').map(Number);s.map[y][x]=0;
    s.particles.push({x,y,t:.5,color:'#ffbc72'});
    const type=dropItem(s.random);if(type)s.items.push({x,y,type});
  }
}
function damage(s,dt) {
  for(const p of s.players) {
    p.invincible=Math.max(0,p.invincible-dt);
    if(!p.alive||p.invincible>0)continue;
    if(s.fire.some(f=>f.fresh&&Math.abs(p.x-f.x)<.72&&Math.abs(p.y-f.y)<.72)) {
      if(p.shield) {p.shield=false;p.invincible=1.2;s.events.push('shield');}
      else {p.alive=false;s.events.push('death');s.particles.push({x:p.x,y:p.y,t:1,color:p.color});}
    }
  }
  // The remaining fire is visual only; every player is evaluated before consuming the hit.
  for(const f of s.fire)f.fresh=false;
}

return {place,updateBombs,damage};
})();
modules["state.js"] = (()=>{
const {makeMap,W,H} = modules["map.js"];
const {updateBombs,damage} = modules["bombs.js"];
const {collect} = modules["items.js"];
function createGame(options={},random=Math.random) {
  const humans=options.humans||1,count=Math.min(4,humans+(options.bots??3));
  const starts=[[1,1],[W-2,H-2],[W-2,1],[1,H-2]],colors=['#8a74ff','#ff72a9','#ffca5c','#58ded0'];
  return {options,random,map:makeMap(random),players:starts.slice(0,count).map(([x,y],id)=>({id,x,y,color:colors[id],name:id<humans?\`Ng\u01B0\u1EDDi ch\u01A1i \${id+1}\`:\`Bot \${id-humans+1}\`,bot:id>=humans,alive:true,capacity:1,range:2,speed:4.2,shield:false,invincible:0,walk:0,think:0,target:null})),bombs:[],fire:[],items:[],particles:[],events:[],time:180,result:null};
}
function step(s,dt) {
  if(s.result)return;
  s.time=Math.max(0,s.time-dt);updateBombs(s,dt);damage(s,dt);
  for(const p of s.players)if(p.alive)collect(s,p);
  s.particles=s.particles.filter(p=>(p.t-=dt)>0);
  const living=s.players.filter(p=>p.alive);
  if(living.length<=1) s.result=living.length?\`\${living[0].name} chi\u1EBFn th\u1EAFng!\`:'H\xF2a! C\xF9ng nhau b\xF9ng n\u1ED5.';
  else if(s.time<=0)s.result='H\u1EBFt gi\u1EDD \u2014 h\xF2a!';
}

return {createGame,step};
})();
modules["collision.js"] = (()=>{
function canStand(s,p,x,y) {
  const radius=.24;
  for(const xx of [x-radius,x+radius])for(const yy of [y-radius,y+radius]) {
    const cx=Math.round(xx),cy=Math.round(yy);
    if(s.map[cy]?.[cx]!==0)return false;
    if(s.bombs.some(b=>b.x===cx&&b.y===cy&&!b.pass?.has(p.id)))return false;
  }
  return true;
}
function move(s,p,dx,dy,dt) {
  if(!p.alive||(!dx&&!dy)||dt<=0)return;
  // One axis per input, with small swept steps even at maximum speed.
  dx=Math.sign(dx);dy=dx?0:Math.sign(dy);
  const distance=p.speed*dt,steps=Math.ceil(distance/.06),stride=distance/steps;
  let travelled=0;
  const advance=(x,y)=>{
    if(!canStand(s,p,x,y))return false;
    travelled+=Math.hypot(x-p.x,y-p.y);p.x=x;p.y=y;
    for(const b of s.bombs)if(Math.abs(x-b.x)>.74||Math.abs(y-b.y)>.74)b.pass?.delete(p.id);
    return true;
  };
  for(let i=0;i<steps;i++) {
    let remaining=stride;
    const cross=dx?p.y:p.x;
    // Look for a nearby open lane, including an early turn just before its center.
    const lanes=[Math.floor(cross),Math.ceil(cross)].filter((v,i,a)=>a.indexOf(v)===i).sort((a,b)=>Math.abs(a-cross)-Math.abs(b-cross));
    const lane=lanes.find(v=>Math.abs(v-cross)<=.55&&canStand(s,p,dx?p.x+dx*.35:v,dx?v:p.y+dy*.35));
    if(lane!==undefined&&Math.abs(lane-cross)>1e-8) {
      const correction=Math.sign(lane-cross)*Math.min(remaining,Math.abs(lane-cross));
      if(!advance(dx?p.x:p.x+correction,dx?p.y+correction:p.y))break;
      remaining-=Math.abs(correction);
    }
    if(remaining>1e-8&&!advance(p.x+dx*remaining,p.y+dy*remaining))break;
  }
  if(travelled>0)p.walk+=travelled*4;
}

return {canStand,move};
})();
modules["ai.js"] = (()=>{
const {blast,cell,dirs,key} = modules["map.js"];
const {move} = modules["collision.js"];
const {place} = modules["bombs.js"];
function danger(s,bombs=s.bombs) {
  const times=bombs.map(b=>b.t),areas=bombs.map(b=>blast(s.map,b));
  let changed=true;
  while(changed) {
    changed=false;
    areas.forEach((area,i)=>bombs.forEach((b,j)=>{
      if(times[j]>times[i]&&area.some(([x,y])=>x===b.x&&y===b.y)){times[j]=times[i];changed=true;}
    }));
  }
  const zones=new Map();
  const add=(x,y,a,b)=>{const k=key(x,y);if(!zones.has(k))zones.set(k,[]);zones.get(k).push([a,b]);};
  areas.forEach((area,i)=>area.forEach(([x,y])=>add(x,y,times[i],times[i]+1/60)));
  return zones;
}
const unsafe=(zones,x,y,a,b)=> (zones.get(key(x,y))||[]).some(([start,end])=>a<end&&b>start-.18);
// Breadth-first search over both tiles and arrival times; waiting is an allowed action.
function route(s,p,zones,goal,bombs=s.bombs,maxTime=4) {
  const [sx,sy]=cell(p),duration=1/p.speed;
  const queue=[{x:sx,y:sy,t:0,path:[]}],seen=new Set();
  for(let i=0;i<queue.length&&i<4000;i++) {
    const n=queue[i];
    if(n.path.length&&goal(n)&&!unsafe(zones,n.x,n.y,n.t,n.t+.85))return n.path;
    for(const [dx,dy] of [...dirs,[0,0]]) {
      const x=n.x+dx,y=n.y+dy,t=n.t+duration;
      if(t>maxTime||s.map[y]?.[x]!==0)continue;
      if(bombs.some(b=>b.x===x&&b.y===y&&b.t>t&&!(x===sx&&y===sy&&n.x===sx&&n.y===sy)))continue;
      if(unsafe(zones,x,y,n.t,t+.12)||unsafe(zones,n.x,n.y,n.t,t-.05))continue;
      const k=\`\${x},\${y},\${Math.round(t/duration)}\`;if(seen.has(k))continue;seen.add(k);
      queue.push({x,y,t,path:[...n.path,[x,y]]});
    }
  }
  return null;
}
function updateBots(s,dt) {
  const difficulty=s.options.difficulty||'normal';
  const reaction={easy:.42,normal:.18,hard:.08}[difficulty];
  for(const p of s.players)if(p.bot&&p.alive) {
    p.think-=dt;
    if(p.target) {
      const [x,y]=p.target,dx=x-p.x,dy=y-p.y;
      if(Math.abs(dx)<.045&&Math.abs(dy)<.045){p.x=x;p.y=y;p.target=null;}
      else move(s,p,Math.abs(dx)>.045?Math.sign(dx):0,Math.abs(dx)>.045?0:Math.sign(dy),Math.min(dt,Math.max(Math.abs(dx),Math.abs(dy))/p.speed));
    }
    if(p.think>0||p.target)continue;p.think=reaction;
    const zones=danger(s),[x,y]=cell(p);
    const threat=unsafe(zones,x,y,0,2.9);
    let path;
    if(threat) path=route(s,p,zones,n=>!unsafe(zones,n.x,n.y,n.t,4));
    else {
      const adjacent=dirs.some(([dx,dy])=>s.map[y+dy]?.[x+dx]===2)||s.players.some(q=>q.alive&&q!==p&&Math.abs(q.x-x)+Math.abs(q.y-y)<3);
      if(adjacent&&s.random()<({easy:.25,normal:.6,hard:.95}[difficulty])) {
        const extra={x,y,range:p.range,t:2.5};const bombs=[...s.bombs,extra],future=danger(s,bombs);
        const escape=route(s,p,future,n=>!unsafe(future,n.x,n.y,n.t,3.3),bombs,2.15);
        if(escape&&place(s,p)){path=escape;}
      }
      if(!path) {
        path=route(s,p,zones,n=>s.items.some(i=>i.x===n.x&&i.y===n.y));
        if(!path)path=route(s,p,zones,n=>dirs.some(([dx,dy])=>s.map[n.y+dy]?.[n.x+dx]===2)||s.players.some(q=>q.alive&&q!==p&&Math.abs(q.x-n.x)+Math.abs(q.y-n.y)<2));
      }
    }
    if(path?.length)p.target=path[0];
  }
}

return {danger,route,updateBots};
})();
modules["renderer.js"] = (()=>{
const {W,H} = modules["map.js"];
const {itemIcons} = modules["items.js"];
const themes={garden:['#163d3b','#24534a','#2b5d50','#6c9c81','#c99864'],factory:['#26263f','#34354f','#3a3d59','#797d9f','#d79865'],ice:['#14334d','#244d65','#295970','#8bbacb','#98cde0']};
function render(canvas,s,time=0) {
  const c=canvas.getContext('2d'),u=48;canvas.width=W*u;canvas.height=H*u;
  const [bg,floor,alt,wall,crate]=themes[s.options.theme||'garden'];
  const box=(x,y,w,h,r,color)=>{c.fillStyle=color;c.beginPath();c.roundRect(x,y,w,h,r);c.fill();};
  const circle=(x,y,r,color)=>{c.fillStyle=color;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();};
  c.fillStyle=bg;c.fillRect(0,0,canvas.width,canvas.height);
  s.map.forEach((row,y)=>row.forEach((v,x)=>{
    const px=x*u,py=y*u;box(px+1,py+1,u-2,u-2,5,(x+y)%2?floor:alt);
    if(v===1){box(px+3,py+6,42,40,8,'#102b3390');box(px+3,py+1,42,39,8,wall);box(px+9,py+6,30,4,2,'#ffffff25');circle(px+35,py+30,2,'#ffffff25');}
    if(v===2){box(px+5,py+8,38,37,5,'#152a3590');box(px+4,py+3,40,36,5,crate);c.strokeStyle='#664c5070';c.lineWidth=3;c.strokeRect(px+10,py+9,28,24);c.beginPath();c.moveTo(px+10,py+9);c.lineTo(px+38,py+33);c.moveTo(px+38,py+9);c.lineTo(px+10,py+33);c.stroke();}
  }));
  for(const i of s.items){const x=i.x*u+24,y=i.y*u+24+Math.sin(time*4)*2;box(x-15,y-15,30,30,8,'#fff5c4');c.fillStyle='#55418e';c.font='bold 23px system-ui';c.textAlign='center';c.fillText(itemIcons[i.type],x,y+8);}
  for(const b of s.bombs){const x=b.x*u+24,y=b.y*u+25,r=14+Math.sin(time*(b.t<1?28:8))*1.5;circle(x,y+10,16,'#091d3360');circle(x,y,r,b.t<.8&&Math.sin(time*28)>0?'#f77a79':'#172034');circle(x-5,y-5,4,'#ffffff40');c.strokeStyle='#ffca68';c.lineWidth=3;c.beginPath();c.moveTo(x+3,y-r);c.quadraticCurveTo(x+12,y-r-15,x+15,y-r-5);c.stroke();circle(x+15,y-r-5,3+Math.sin(time*20),'#fff2a4');}
  for(const f of s.fire){const x=f.x*u,y=f.y*u;c.globalAlpha=Math.min(1,f.t*3);box(x+2,y+2,44,44,13,'#ff784b');box(x+8,y+8,32,32,12,'#ffce59');box(x+17,y+10,14,28,7,'#fff4b1');box(x+10,y+17,28,14,7,'#fff4b1');c.globalAlpha=1;}
  for(const p of s.players)if(p.alive){
    const x=p.x*u+24,y=p.y*u+24,bob=Math.sin(p.walk)*2;
    if(p.invincible>0&&Math.floor(time*14)%2)c.globalAlpha=.45;
    c.fillStyle='#091c3955';c.beginPath();c.ellipse(x,y+16,18,7,0,0,7);c.fill();
    box(x-12,y+10+Math.sin(p.walk)*3,9,9,3,'#d7e4f6');box(x+3,y+10-Math.sin(p.walk)*3,9,9,3,'#d7e4f6');
    box(x-17,y-9+bob,7,18,4,p.color);box(x+10,y-9+bob,7,18,4,p.color);
    box(x-13,y-16+bob,26,30,9,p.color);box(x-11,y-13+bob,22,14,6,'#202a45');
    box(x-7,y-9+bob,4,6,2,'#ccffff');box(x+3,y-9+bob,4,6,2,'#ccffff');
    c.strokeStyle=p.color;c.lineWidth=3;c.beginPath();c.moveTo(x,y-15+bob);c.lineTo(x,y-22+bob);c.stroke();circle(x,y-24+bob,3,'#ffdf88');circle(x,y+7+bob,3,'#fff5be');
    if(p.shield){c.strokeStyle='#a6edff';c.lineWidth=2;c.beginPath();c.arc(x,y,24,0,Math.PI*2);c.stroke();}
    c.globalAlpha=1;
  }
  for(const p of s.particles){c.globalAlpha=Math.min(1,p.t*2);for(let i=0;i<8;i++){const a=i*Math.PI/4,r=(1-p.t)*35;circle(p.x*u+24+Math.cos(a)*r,p.y*u+24+Math.sin(a)*r,4,p.color);}c.globalAlpha=1;}
}

return {render};
})();
modules["audio.js"] = (()=>{
class Audio {
  constructor(){this.enabled=true;try{this.enabled=localStorage.getItem('bomb-arena-sound')!=='off';}catch{}}
  unlock(){try{this.ctx??=new (window.AudioContext||window.webkitAudioContext)();this.ctx.resume().catch(()=>{});}catch{}}
  toggle(){this.enabled=!this.enabled;try{localStorage.setItem('bomb-arena-sound',this.enabled?'on':'off');}catch{}this.unlock();}
  play(event){
    if(!this.enabled||!this.ctx)return;
    try{
      const ctx=this.ctx,o=ctx.createOscillator(),g=ctx.createGain();o.connect(g);g.connect(ctx.destination);
      const [a,b,d]=({place:[350,180,.08],explode:[110,25,.3],pickup:[600,1200,.14],death:[300,60,.35],shield:[800,300,.2]})[event]||[400,600,.1];
      o.type=event==='explode'?'sawtooth':'sine';o.frequency.setValueAtTime(a,ctx.currentTime);o.frequency.exponentialRampToValueAtTime(b,ctx.currentTime+d);
      g.gain.setValueAtTime(.07,ctx.currentTime);g.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+d);o.start();o.stop(ctx.currentTime+d);
    }catch{}
  }
}

return {Audio};
})();
modules["input.js"] = (()=>{
class Input {
  constructor(active,pause,bomb){
    this.keys=new Set();this.pointers=new Map();this.controller=new AbortController();const signal=this.controller.signal;
    const codes=['KeyW','KeyA','KeyS','KeyD','Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Enter','Escape'];
    window.addEventListener('keydown',e=>{if(!active()||!codes.includes(e.code))return;e.preventDefault();if(!e.repeat){if(e.code==='Escape')pause();if(e.code==='Space')bomb(0);if(e.code==='Enter')bomb(1);}this.keys.add(e.code);},{signal});
    window.addEventListener('keyup',e=>this.keys.delete(e.code),{signal});
    window.addEventListener('blur',()=>{this.clear();pause(true);},{signal});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){this.clear();pause(true);}},{signal});
    for(const b of document.querySelectorAll('[data-control]')) {
      b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);this.pointers.set(e.pointerId,b.dataset.control);if(b.dataset.control==='Space')bomb(0);},{signal});
      for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,e=>this.pointers.delete(e.pointerId),{signal});
    }
  }
  clear(){this.keys.clear();this.pointers.clear();}
  direction(id){
    const codes=id===0?['KeyA','KeyD','KeyW','KeyS']:['ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
    // The newest held direction wins, so a turn does not require releasing the old key first.
    const latest=[...this.keys,...this.pointers.values()].filter(code=>codes.includes(code)).at(-1);
    return latest===codes[0]?[-1,0]:latest===codes[1]?[1,0]:latest===codes[2]?[0,-1]:latest===codes[3]?[0,1]:[0,0];
  }
  destroy(){this.controller.abort();this.clear();}
}

return {Input};
})();
modules["network.js"] = (()=>{
class Network {
  constructor(receive,closed){this.receive=receive;this.closed=closed;this.socket=null;this.id=null;this.room='';this.lobby=null;}
  connect(room,name,create){
    this.leave();this.room=room;
    const url=new URL('/__game/ws',location.href);url.protocol=location.protocol==='https:'?'wss:':'ws:';url.search=new URLSearchParams({g:'bomb',room,name,action:create?'create':'join'});
    const socket=new WebSocket(url);this.socket=socket;
    let welcomed=false;
    const timeout=setTimeout(()=>{if(this.socket===socket&&!welcomed){this.leave();this.closed('Kh\xF4ng k\u1EBFt n\u1ED1i \u0111\u01B0\u1EE3c. H\xE3y ki\u1EC3m tra m\xE3 ph\xF2ng v\xE0 th\u1EED l\u1EA1i.');}},8000);
    socket.onmessage=event=>{
      if(this.socket!==socket)return;
      let m;try{m=JSON.parse(event.data);}catch{return;}
      if(m.t==='hello'){welcomed=true;clearTimeout(timeout);this.id=m.id;}
      if(m.t==='lobby')this.lobby=m;
      this.receive(m);
    };
    socket.onclose=()=>{clearTimeout(timeout);if(this.socket!==socket)return;this.socket=null;this.id=null;this.lobby=null;this.closed(welcomed?'\u0110\xE3 m\u1EA5t k\u1EBFt n\u1ED1i v\u1EDBi ph\xF2ng. B\u1EA1n c\xF3 th\u1EC3 t\u1EA1o ho\u1EB7c v\xE0o ph\xF2ng kh\xE1c.':'Kh\xF4ng v\xE0o \u0111\u01B0\u1EE3c ph\xF2ng: m\xE3 kh\xF4ng t\u1ED3n t\u1EA1i, ph\xF2ng \u0111\xE3 \u0111\u1EA7y ho\u1EB7c \u0111ang thi \u0111\u1EA5u.');};
    socket.onerror=()=>{};
  }
  send(message){if(this.socket?.readyState===WebSocket.OPEN)this.socket.send(JSON.stringify(message));}
  leave(){const socket=this.socket;this.socket=null;this.id=null;this.lobby=null;if(socket)socket.close();}
}

return {Network};
})();
modules["main.js"] = (()=>{
const {createGame,step} = modules["state.js"];
const {move} = modules["collision.js"];
const {place} = modules["bombs.js"];
const {updateBots} = modules["ai.js"];
const {render} = modules["renderer.js"];
const {Audio} = modules["audio.js"];
const {Input} = modules["input.js"];
const {Network} = modules["network.js"];
const $=id=>document.getElementById(id),audio=new Audio();
let theme='garden',state=createGame(),mode='menu',last=0,accumulator=0,visualTime=0;
let onlineTimer=null,previous=null,receivedAt=0;
const net=new Network(receiveOnline,message=>{stopOnline();showMenu();$('room-message').textContent=message;});
function isOnline(){return !!net.socket;}
function roomUi(){
  document.body.dataset.online=String(isOnline());
  document.querySelector('.tag').textContent=isOnline()?'ONLINE \xB7 4 PLAYERS':'LOCAL MULTIPLAYER';
  $('humans').closest('label').hidden=isOnline();document.querySelector('.two-cols').hidden=isOnline();
  $('room-entry').hidden=isOnline();$('room-lobby').hidden=!isOnline();
  $('room-id').textContent=net.room;
  const lobby=net.lobby;if(!lobby)return;
  theme=lobby.theme;document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('selected',b.dataset.theme===theme));
  $('room-players').replaceChildren(...lobby.players.map(p=>{const li=document.createElement('li');li.textContent=p.name;const tag=document.createElement('small');tag.textContent=\`\${p.id===net.id?'B\u1EA1n ':''}\${p.id===lobby.host?'\u2605 Ch\u1EE7 ph\xF2ng':''}\`;li.append(tag);return li;}));
  const host=lobby.host===net.id;
  $('restart').disabled=!host;$('primary').disabled=!host||lobby.players.length<2;
  if(!lobby.playing&&mode!=='online-result'){
    mode='lobby';overlay('PH\xD2NG ONLINE \xB7 '+net.room,'C\xF9ng nhau b\xF9ng n\u1ED5!',\`\${lobby.players.length}/4 ng\u01B0\u1EDDi \u0111\xE3 v\xE0o. \${host?'G\u1EEDi m\xE3 cho b\u1EA1n b\xE8, ch\u1ECDn b\u1EA3n \u0111\u1ED3 v\xE0 b\u1EAFt \u0111\u1EA7u.':'\u0110ang ch\u1EDD ch\u1EE7 ph\xF2ng b\u1EAFt \u0111\u1EA7u.'}\`,host?'B\u1EAFt \u0111\u1EA7u tr\u1EADn \u2192':'Ch\u1EDD ch\u1EE7 ph\xF2ng\u2026');
    $('secondary-actions').hidden=true;
  }
  $('settings').disabled=!host||lobby.playing||mode==='online-result';
  for(const id of ['humans','bots','difficulty'])$(id).disabled=true;
}
function stopOnline(){clearInterval(onlineTimer);onlineTimer=null;previous=null;input.clear();net.leave();delete document.body.dataset.roomPhase;$('primary').disabled=false;$('restart').disabled=false;for(const id of ['humans','bots','difficulty'])$(id).disabled=false;roomUi();}
function receiveOnline(message){
  if(message.t==='error'){$('room-message').textContent=message.message;return;}
  if(message.t==='hello'){
    $('room-message').textContent='\u0110\xE3 v\xE0o ph\xF2ng. G\u1EEDi m\xE3 ph\xF2ng cho b\u1EA1n b\xE8.';
    onlineTimer=setInterval(()=>{if(mode==='online'){const [dx,dy]=input.direction(0);net.send({t:'input',dx,dy});}},50);
  }
  if(message.t==='lobby')roomUi();
  if(message.t==='started'){audio.unlock();input.clear();mode='online';previous=null;document.body.dataset.roomPhase='playing';$('primary').disabled=false;$('overlay').hidden=true;$('settings').disabled=true;$('room-message').textContent=\`B\u1EA1n l\xE0 \${net.lobby?.players.find(p=>p.id===net.id)?.name||'robot'}. WASD + Space ho\u1EB7c n\xFAt c\u1EA3m \u1EE9ng. \u0110\u1ED5i tab s\u1EBD d\u1EEBng di chuy\u1EC3n c\u1EE7a b\u1EA1n, tr\u1EADn \u0111\u1EA5u v\u1EABn ti\u1EBFp t\u1EE5c.\`;}
  if(message.t==='state'){
    previous=state;receivedAt=performance.now();state=message.state;
    for(const event of state.events)audio.play(event);state.events=[];
    if(state.result){mode='online-result';input.clear();overlay('K\u1EBET TH\xDAC TR\u1EACN ONLINE',state.result,'Ch\u1EE7 ph\xF2ng c\xF3 th\u1EC3 b\u1EAFt \u0111\u1EA7u v\xE1n ti\u1EBFp theo.','Ch\u01A1i l\u1EA1i \u2192');$('secondary-actions').hidden=false;$('primary').disabled=net.id!==net.lobby?.host;$('restart').disabled=net.id!==net.lobby?.host;}
    hud();
  }
}
function connectRoom(create){
  const code=create?Array.from(crypto.getRandomValues(new Uint8Array(4)),n=>'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'[n%32]).join(''):$('room-code').value.trim().toUpperCase();
  if(!/^[A-Z0-9]{4}$/.test(code)){$('room-message').textContent='M\xE3 ph\xF2ng g\u1ED3m 4 ch\u1EEF c\xE1i ho\u1EB7c ch\u1EEF s\u1ED1.';return;}
  audio.unlock();input.clear();clearInterval(onlineTimer);onlineTimer=null;mode='connecting';$('settings').disabled=true;
  overlay('K\u1EBET N\u1ED0I ONLINE','\u0110ang k\u1EBFt n\u1ED1i\u2026','\u0110ang m\u1EDF ph\xF2ng ch\u01A1i cho b\u1EA1n.','\u0110ang k\u1EBFt n\u1ED1i\u2026');$('primary').disabled=true;$('secondary-actions').hidden=true;
  $('room-message').textContent='\u0110ang k\u1EBFt n\u1ED1i\u2026';net.connect(code,$('player-name').value,create);
}
const coarse=matchMedia('(pointer:coarse)');
function options(){return {humans:coarse.matches?1:Number($('humans').value),bots:Number($('bots').value),difficulty:$('difficulty').value,theme};}
function constrain(){
  $('two-player').hidden=coarse.matches;
  if(coarse.matches)$('humans').value='1';
  const humans=Number($('humans').value);
  for(const opt of $('bots').options) opt.disabled=Number(opt.value)+humans>4||Number(opt.value)+humans<2;
  if($('bots').selectedOptions[0].disabled)$('bots').value=humans===1?'3':'2';
}
function preview(){constrain();if(mode==='menu'){state=createGame(options());hud();}}
function soundLabel(){$('sound').textContent=audio.enabled?'\u266B':'\u266A';$('sound').setAttribute('aria-pressed',String(audio.enabled));$('sound').title=audio.enabled?'T\u1EAFt \xE2m thanh':'B\u1EADt \xE2m thanh';}
function hud(){
  const seconds=Math.ceil(state.time);$('timer').textContent=\`\${String(Math.floor(seconds/60)).padStart(2,'0')}:\${String(seconds%60).padStart(2,'0')}\`;
  $('alive').textContent=\`\${state.players.filter(p=>p.alive).length}/\${state.players.length} robot c\xF2n s\u1ED1ng\`;
  $('arena-name').textContent={garden:'KHU V\u01AF\u1EDCN',factory:'NH\xC0 M\xC1Y',ice:'V\xD9NG B\u0102NG'}[state.options.theme||theme];
  $('roster').replaceChildren(...state.players.map(p=>{
    const row=document.createElement('div');row.className='robot-row';
    const avatar=document.createElement('span');avatar.className='robot-avatar';avatar.style.background=p.color;avatar.textContent='\u25A3';
    const description=document.createElement('div'),name=document.createElement('b'),stats=document.createElement('small');name.textContent=p.name;
    stats.textContent=\`\u25CF \${state.bombs.filter(b=>b.owner===p.id).length}/\${p.capacity}   \u2726 \${p.range}   \xBB \${p.speed.toFixed(1)}\${p.shield?'  \u25C6':''}\`;description.append(name,stats);
    const status=document.createElement('span');status.className='status';status.textContent=p.alive?'\u25CF S\u1EB5n s\xE0ng':'\u0110\xE3 b\u1ECB lo\u1EA1i';if(mode!=='menu'&&p.alive)status.textContent='\u25CF \u0110ang \u0111\u1EA5u';if(!p.alive)row.style.opacity='.4';
    row.append(avatar,description,status);return row;
  }));
}
function overlay(label,title,text,primary){$('overlay').hidden=false;$('modal-label').textContent=label;$('modal-title').textContent=title;$('modal-text').textContent=text;$('primary').textContent=primary;}
function start(){audio.unlock();constrain();state=createGame(options());mode='playing';input.clear();accumulator=0;last=performance.now();$('overlay').hidden=true;$('settings').disabled=true;$('secondary-actions').hidden=true;hud();$('pause').focus();}
function pause(force=false){
  if(isOnline()){input.clear();net.send({t:'input',dx:0,dy:0});if(!force)$('room-message').textContent='Tr\u1EADn online di\u1EC5n ra li\xEAn t\u1EE5c. D\xF9ng R\u1EDDi ph\xF2ng n\u1EBFu mu\u1ED1n tho\xE1t.';return;}
  if(mode==='playing'){mode='paused';input.clear();accumulator=0;overlay('NGH\u1EC8 M\u1ED8T CH\xDAT','\u0110\xE3 t\u1EA1m d\u1EEBng','Bom v\xE0 \u0111\u1ED3ng h\u1ED3 s\u1EBD ch\u1EDD b\u1EA1n.','Ti\u1EBFp t\u1EE5c \u2192');$('secondary-actions').hidden=false;}
  else if(mode==='paused'&&!force){mode='playing';input.clear();last=performance.now();accumulator=0;$('overlay').hidden=true;}
}
const input=new Input(()=>mode==='playing'||mode==='paused'||mode==='online',pause,id=>{if(mode==='online'&&id===0){const [dx,dy]=input.direction(0);net.send({t:'input',dx,dy,bomb:true});}else if(mode==='playing'){const p=state.players[id];if(p&&!p.bot)place(state,p);}});
function startOnline(){net.send({t:'start',theme});}
$('primary').onclick=()=>isOnline()?startOnline():(mode==='paused'?pause():start());$('pause').onclick=()=>pause();$('restart').onclick=()=>isOnline()?startOnline():start();
function showMenu(){mode='menu';input.clear();$('settings').disabled=false;$('secondary-actions').hidden=true;overlay('S\u1EB4N S\xC0NG B\xD9NG N\u1ED4?','\u0110\u1EA5u tr\u01B0\u1EDDng \u0111ang ch\u1EDD!','Ph\xE1 kh\u1ED1i, nh\u1EB7t s\u1EE9c m\u1EA1nh v\xE0 tr\u1EDF th\xE0nh robot cu\u1ED1i c\xF9ng.','Ch\u01A1i ngay \u2192');preview();}
$('menu').onclick=()=>{if(isOnline())stopOnline();showMenu();};
$('create-room').onclick=()=>connectRoom(true);$('join-room').onclick=()=>connectRoom(false);$('leave-room').onclick=()=>{stopOnline();showMenu();$('room-message').textContent='\u0110\xE3 r\u1EDDi ph\xF2ng.';};
$('copy-room').onclick=async()=>{try{await navigator.clipboard.writeText(net.room);$('room-message').textContent='\u0110\xE3 sao ch\xE9p m\xE3 ph\xF2ng.';}catch{$('room-message').textContent='M\xE3 ph\xF2ng: '+net.room;}};
$('help').onclick=()=>{if(mode==='playing')pause(true);$('instructions').showModal();};
$('sound').onclick=()=>{audio.toggle();soundLabel();};
for(const id of ['humans','bots','difficulty'])$(id).onchange=preview;
for(const button of document.querySelectorAll('[data-theme]'))button.onclick=()=>{if(mode!=='menu'&&!(mode==='lobby'&&net.id===net.lobby?.host))return;theme=button.dataset.theme;document.querySelectorAll('[data-theme]').forEach(b=>b.classList.toggle('selected',b===button));if(isOnline())net.send({t:'theme',theme});else preview();};
coarse.addEventListener('change',()=>{if(coarse.matches&&state.options.humans===2&&mode==='playing')pause(true);preview();});
window.addEventListener('message',event=>{if(event.origin===location.origin&&event.source===parent&&event.data==='bomb-arena-pause')pause(true);});
let hudTime=0;
function loop(now){
  const elapsed=Math.min(.1,Math.max(0,(now-last)/1000));last=now;visualTime+=elapsed;
  if(mode==='playing'){
    accumulator+=elapsed;
    while(accumulator>=1/60&&mode==='playing'){
      for(const p of state.players)if(!p.bot){const [dx,dy]=input.direction(p.id);move(state,p,dx,dy,1/60);}
      updateBots(state,1/60);step(state,1/60);accumulator-=1/60;
      for(const event of state.events)audio.play(event);state.events=[];
      if(state.result){mode='result';input.clear();overlay('K\u1EBET TH\xDAC TR\u1EACN \u0110\u1EA4U',state.result,'M\u1ED9t tr\u1EADn \u0111\u1EA5u th\u1EADt b\xF9ng n\u1ED5. Th\u1EED th\xEAm m\u1ED9t v\xE1n nh\xE9?','Ch\u01A1i l\u1EA1i \u2192');$('secondary-actions').hidden=false;hud();}
    }
  }
  hudTime+=elapsed;if(hudTime>.15){hud();hudTime=0;}
  let drawing=state;
  if(mode==='online'&&previous){const alpha=Math.min(1,(now-receivedAt)/50);drawing={...state,players:state.players.map(p=>{const old=previous.players.find(q=>q.id===p.id);return old?{...p,x:old.x+(p.x-old.x)*alpha,y:old.y+(p.y-old.y)*alpha}:p;})};}
  render($('board'),drawing,visualTime);requestAnimationFrame(loop);
}
window.addEventListener('pagehide',()=>{input.clear();pause(true);if(isOnline())stopOnline();});
soundLabel();preview();requestAnimationFrame(loop);

return {};
})();<\/script></body></html>
`;

// src/pool-room.js
var PoolRoom = class {
  static {
    __name(this, "PoolRoom");
  }
  constructor(state, env) {
    this.state = state;
  }
  async fetch(request) {
    const socks = this.state.getWebSockets();
    if (socks.length >= 2) return new Response("Room full", { status: 409 });
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("Expected WebSocket", { status: 426 });
    }
    const used = socks.map((s) => (s.deserializeAttachment() || {}).idx);
    const idx = used.includes(0) ? 1 : 0;
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    this.state.acceptWebSocket(server);
    server.serializeAttachment({ idx });
    server.send(JSON.stringify({ t: "hello", idx }));
    const all = this.state.getWebSockets();
    if (all.length === 2) {
      for (const s of all) s.send(JSON.stringify({ t: "start" }));
    }
    return new Response(null, { status: 101, webSocket: client });
  }
  webSocketMessage(ws, message) {
    if (typeof message !== "string" || message.length > 2e3) return;
    for (const s of this.state.getWebSockets()) {
      if (s !== ws) {
        try {
          s.send(message);
        } catch (e) {
        }
      }
    }
  }
  notifyLeft(ws) {
    for (const s of this.state.getWebSockets()) {
      if (s !== ws) {
        try {
          s.send(JSON.stringify({ t: "left" }));
        } catch (e) {
        }
      }
    }
  }
  webSocketClose(ws) {
    this.notifyLeft(ws);
    try {
      ws.close(1e3, "bye");
    } catch (e) {
    }
  }
  webSocketError(ws) {
    this.notifyLeft(ws);
  }
};

// src/wolf/engine.js
var WOLF_MIN = 5;
var WOLF_MAX = 12;
var WOLF_T = { guard: 20, wolf: 30, seer: 20, witch: 25, day: 90, vote: 30, hunter: 20 };
var WOLF_SUBS = ["guard", "wolf", "seer", "witch"];
var ROLE_VI = { wolf: "S\xF3i", villager: "D\xE2n l\xE0ng", seer: "Ti\xEAn tri", guard: "B\u1EA3o v\u1EC7", witch: "Ph\xF9 th\u1EE7y", hunter: "Th\u1EE3 s\u0103n" };
var WolfEngine = class {
  static {
    __name(this, "WolfEngine");
  }
  constructor(opts) {
    opts = opts || {};
    this.T = Object.assign({}, WOLF_T, opts.T || {});
    this.idleMs = opts.idleMs || 12e4;
    this.onError = opts.onError || null;
    this.timer = null;
    this.idle = null;
    this.reset();
  }
  reset() {
    if (this.timer) clearTimeout(this.timer);
    if (this.idle) clearTimeout(this.idle);
    this.timer = null;
    this.idle = null;
    this.players = /* @__PURE__ */ new Map();
    this.nextId = 1;
    this.hostId = null;
    this.cfgManual = null;
    this.resetGame();
  }
  resetGame() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.phase = "lobby";
    this.sub = null;
    this.day = 0;
    this.deadline = 0;
    this.winner = null;
    this.night = null;
    this.pendingHunter = null;
    this.afterHunter = null;
    this.lastProtect = null;
    this.ready = /* @__PURE__ */ new Set();
    this.votes = /* @__PURE__ */ new Map();
    this.voteResolved = false;
    this.log = [];
    this.chatLog = [];
    for (const p of this.players.values()) {
      p.role = null;
      p.alive = true;
      p.seen = [];
      p.heal = true;
      p.poison = true;
    }
  }
  // ---------- tiện ích ----------
  addLog(t) {
    this.log.push(t);
    if (this.log.length > 60) this.log.shift();
  }
  err(p, m, fatal) {
    try {
      p.send({ t: "err", m, fatal: !!fatal });
    } catch (e) {
    }
  }
  alive() {
    return [...this.players.values()].filter((p) => p.alive);
  }
  aliveWith(role) {
    return this.alive().filter((p) => p.role === role);
  }
  anyOnline() {
    for (const p of this.players.values()) if (p.online) return true;
    return false;
  }
  clearIdle() {
    if (this.idle) {
      clearTimeout(this.idle);
      this.idle = null;
    }
  }
  checkIdle() {
    if (this.anyOnline() || this.idle) return;
    this.idle = setTimeout(() => {
      this.idle = null;
      this.reset();
    }, this.idleMs);
  }
  setTimer(sec, fn) {
    if (this.timer) clearTimeout(this.timer);
    this.deadline = Date.now() + sec * 1e3;
    this.timer = setTimeout(() => {
      this.timer = null;
      fn();
    }, sec * 1e3);
  }
  stopTimer() {
    if (this.timer) clearTimeout(this.timer);
    this.timer = null;
    this.deadline = 0;
  }
  cleanName(x) {
    let n = String(x || "").replace(/[\u0000-\u001f<>]/g, "").trim().slice(0, 12);
    if (!n) n = "Ng\u01B0\u1EDDi ch\u01A1i";
    const base = n;
    let k = 2;
    const taken = /* @__PURE__ */ __name(() => [...this.players.values()].some((q) => q.name.toLowerCase() === n.toLowerCase()), "taken");
    while (taken()) {
      n = base.slice(0, 10) + k;
      k++;
    }
    return n;
  }
  defaultCfg(n) {
    return { wolves: n >= 10 ? 3 : n >= 7 ? 2 : 1, seer: true, guard: n >= 6, witch: n >= 7, hunter: n >= 8 };
  }
  currentCfg() {
    return this.cfgManual || this.defaultCfg(this.players.size);
  }
  buildRoles(n, cfg) {
    const w = cfg.wolves;
    if (!(w >= 1) || w * 2 >= n) return null;
    const list = [];
    for (let i = 0; i < w; i++) list.push("wolf");
    if (cfg.seer) list.push("seer");
    if (cfg.guard) list.push("guard");
    if (cfg.witch) list.push("witch");
    if (cfg.hunter) list.push("hunter");
    if (list.length > n) return null;
    while (list.length < n) list.push("villager");
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const t = list[i];
      list[i] = list[j];
      list[j] = t;
    }
    return list;
  }
  canSee(p, scope) {
    if (scope === "all") return true;
    if (scope === "wolf") return p.role === "wolf";
    if (scope === "dead") return !p.alive;
    return false;
  }
  // ---------- kết nối ----------
  join(m, send) {
    const tok = String(m.tok || "");
    if (tok.length < 8 || tok.length > 64) {
      send({ t: "err", m: "M\xE3 phi\xEAn kh\xF4ng h\u1EE3p l\u1EC7.", fatal: true });
      return null;
    }
    let p = null;
    for (const q of this.players.values()) if (q.tok === tok) p = q;
    if (p) {
      p.send = send;
      p.online = true;
      p.quit = false;
      if (p.dropTimer) {
        clearTimeout(p.dropTimer);
        p.dropTimer = null;
      }
      this.clearIdle();
      for (const c of this.chatLog) {
        if (this.canSee(p, c.scope)) send({ t: "chat", who: c.who, text: c.text, scope: c.scope });
      }
      this.broadcast();
      return p.id;
    }
    if (this.phase !== "lobby") {
      send({ t: "err", m: "V\xE1n \u0111ang di\u1EC5n ra, ch\u01B0a v\xE0o \u0111\u01B0\u1EE3c. \u0110\u1EE3i v\xE1n sau nh\xE9.", fatal: true });
      return null;
    }
    if (this.players.size >= WOLF_MAX) {
      send({ t: "err", m: "Ph\xF2ng \u0111\xE3 \u0111\u1EE7 " + WOLF_MAX + " ng\u01B0\u1EDDi.", fatal: true });
      return null;
    }
    p = {
      id: this.nextId++,
      name: this.cleanName(m.name),
      tok,
      send,
      online: true,
      quit: false,
      alive: true,
      role: null,
      seen: [],
      heal: true,
      poison: true,
      lastChat: 0,
      dropTimer: null
    };
    this.players.set(p.id, p);
    if (!this.hostId) this.hostId = p.id;
    this.clearIdle();
    this.addLog(p.name + " \u0111\xE3 v\xE0o ph\xF2ng.");
    this.broadcast();
    return p.id;
  }
  leave(pid, send) {
    const p = this.players.get(pid);
    if (!p || p.send !== send) return;
    p.online = false;
    if (this.phase === "lobby") {
      p.dropTimer = setTimeout(() => {
        if (!p.online) this.removePlayer(p.id);
      }, 15e3);
    }
    this.broadcast();
    this.checkIdle();
  }
  removePlayer(id) {
    const p = this.players.get(id);
    if (!p) return;
    if (p.dropTimer) clearTimeout(p.dropTimer);
    this.players.delete(id);
    if (this.hostId === id) {
      const first = this.players.values().next().value;
      this.hostId = first ? first.id : null;
    }
    if (this.players.size === 0) {
      this.reset();
      return;
    }
    this.addLog(p.name + " \u0111\xE3 r\u1EDDi ph\xF2ng.");
    this.broadcast();
    this.checkIdle();
  }
  quit(p) {
    if (this.phase === "lobby") {
      this.removePlayer(p.id);
      return;
    }
    p.online = false;
    p.quit = true;
    p.send = function() {
    };
    this.broadcast();
    this.checkIdle();
  }
  handle(pid, m) {
    const p = this.players.get(pid);
    if (!p || !m || typeof m.t !== "string") return;
    try {
      switch (m.t) {
        case "cfg":
          return this.setCfg(p, m);
        case "start":
          return this.start(p);
        case "act":
          return this.act(p, m);
        case "vote":
          return this.vote(p, m);
        case "ready":
          return this.markReady(p);
        case "shoot":
          return this.shoot(p, m);
        case "chat":
          return this.chat(p, m);
        case "again":
          return this.again(p);
        case "quit":
          return this.quit(p);
      }
    } catch (e) {
      if (this.onError) this.onError(e);
    }
  }
  // ---------- sảnh ----------
  setCfg(p, m) {
    if (p.id !== this.hostId || this.phase !== "lobby") return;
    const w = Math.max(1, Math.min(4, Math.floor(Number(m.wolves) || 1)));
    this.cfgManual = { wolves: w, seer: !!m.seer, guard: !!m.guard, witch: !!m.witch, hunter: !!m.hunter };
    this.broadcast();
  }
  start(p) {
    if (p.id !== this.hostId || this.phase !== "lobby") return;
    const n = this.players.size;
    if (n < WOLF_MIN) return this.err(p, "C\u1EA7n \xEDt nh\u1EA5t " + WOLF_MIN + " ng\u01B0\u1EDDi \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u.");
    const roles = this.buildRoles(n, this.currentCfg());
    if (!roles) return this.err(p, "C\u1EA5u h\xECnh vai kh\xF4ng h\u1EE3p l\u1EC7: s\u1ED1 S\xF3i ph\u1EA3i \xEDt h\u01A1n n\u1EEDa s\u1ED1 ng\u01B0\u1EDDi v\xE0 t\u1ED5ng s\u1ED1 vai kh\xF4ng v\u01B0\u1EE3t s\u1ED1 ng\u01B0\u1EDDi.");
    let i = 0;
    for (const q of this.players.values()) {
      q.role = roles[i++];
      q.alive = true;
      q.seen = [];
      q.heal = true;
      q.poison = true;
    }
    this.log = [];
    this.chatLog = [];
    this.day = 0;
    this.winner = null;
    this.lastProtect = null;
    const cnt = {};
    roles.forEach((r) => {
      cnt[r] = (cnt[r] || 0) + 1;
    });
    const parts = Object.keys(cnt).map((r) => cnt[r] + " " + ROLE_VI[r]);
    this.addLog("V\xE1n b\u1EAFt \u0111\u1EA7u v\u1EDBi " + n + " ng\u01B0\u1EDDi: " + parts.join(", ") + ".");
    this.startNight();
  }
  again(p) {
    if (p.id !== this.hostId || this.phase !== "over") return;
    for (const q of [...this.players.values()]) if (q.quit || !q.online) this.players.delete(q.id);
    if (!this.players.has(this.hostId)) {
      const first = this.players.values().next().value;
      this.hostId = first ? first.id : null;
    }
    this.resetGame();
    this.broadcast();
  }
  // ---------- đêm ----------
  startNight() {
    this.day++;
    this.phase = "night";
    this.night = { protect: null, wolfVotes: /* @__PURE__ */ new Map(), victim: null, healed: false, poison: null, acted: /* @__PURE__ */ new Set() };
    this.addLog("\u{1F319} \u0110\xEAm " + this.day + " bu\xF4ng xu\u1ED1ng, c\u1EA3 l\xE0ng \u0111i ng\u1EE7...");
    this.nextSub(-1);
  }
  subActive(s) {
    if (s === "guard") return this.aliveWith("guard").length > 0;
    if (s === "wolf") return this.aliveWith("wolf").length > 0;
    if (s === "seer") return this.aliveWith("seer").length > 0;
    if (s === "witch") return this.aliveWith("witch").some((w) => w.heal || w.poison);
    return false;
  }
  nextSub(i) {
    for (let k = i + 1; k < WOLF_SUBS.length; k++) {
      if (this.subActive(WOLF_SUBS[k])) {
        this.enterSub(WOLF_SUBS[k]);
        return;
      }
    }
    this.resolveNight();
  }
  enterSub(s) {
    this.sub = s;
    this.setTimer(this.T[s], () => this.endSub());
    this.broadcast();
  }
  endSub() {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    const s = this.sub;
    if (s === "wolf") this.decideVictim();
    this.nextSub(WOLF_SUBS.indexOf(s));
  }
  decideVictim() {
    const tally = /* @__PURE__ */ new Map();
    for (const t of this.night.wolfVotes.values()) tally.set(t, (tally.get(t) || 0) + 1);
    let max = 0;
    for (const c of tally.values()) if (c > max) max = c;
    if (!max) {
      this.night.victim = null;
      return;
    }
    const top = [...tally.entries()].filter((e) => e[1] === max).map((e) => e[0]);
    this.night.victim = top[Math.floor(Math.random() * top.length)];
  }
  subDone() {
    const n = this.night, s = this.sub;
    if (s === "wolf") return this.aliveWith("wolf").every((q) => n.wolfVotes.has(q.id));
    if (s === "guard" || s === "seer" || s === "witch") {
      return this.aliveWith(s).every((q) => n.acted.has(q.id));
    }
    return false;
  }
  afterAct() {
    if (this.subDone()) this.endSub();
    else this.broadcast();
  }
  act(p, m) {
    if (this.phase !== "night" || !p.alive) return;
    const n = this.night, s = this.sub, a = m.a;
    const tgt = this.players.get(Number(m.target));
    if (s === "guard" && p.role === "guard" && a === "protect") {
      if (!tgt || !tgt.alive) return;
      if (tgt.id === this.lastProtect) return this.err(p, "Kh\xF4ng \u0111\u01B0\u1EE3c b\u1EA3o v\u1EC7 c\xF9ng m\u1ED9t ng\u01B0\u1EDDi hai \u0111\xEAm li\xEAn ti\u1EBFp.");
      n.protect = tgt.id;
      n.acted.add(p.id);
      return this.afterAct();
    }
    if (s === "wolf" && p.role === "wolf" && a === "bite") {
      if (!tgt || !tgt.alive || tgt.role === "wolf") return;
      n.wolfVotes.set(p.id, tgt.id);
      return this.afterAct();
    }
    if (s === "seer" && p.role === "seer" && a === "see") {
      if (!tgt || !tgt.alive || tgt.id === p.id) return;
      if (n.acted.has(p.id)) return;
      p.seen.push({ name: tgt.name, wolf: tgt.role === "wolf", day: this.day });
      n.acted.add(p.id);
      return this.afterAct();
    }
    if (s === "witch" && p.role === "witch") {
      if (n.acted.has(p.id)) return;
      if (a === "heal") {
        if (!p.heal || n.victim == null) return;
        n.healed = true;
        p.heal = false;
      } else if (a === "poison") {
        if (!p.poison || !tgt || !tgt.alive || tgt.id === p.id) return;
        n.poison = tgt.id;
        p.poison = false;
      } else if (a !== "skip") {
        return;
      }
      n.acted.add(p.id);
      return this.afterAct();
    }
  }
  resolveNight() {
    const n = this.night;
    this.sub = null;
    const deaths = [];
    if (n.victim != null && n.protect !== n.victim && !n.healed) deaths.push([n.victim, "wolf"]);
    if (n.poison != null && !deaths.some((d) => d[0] === n.poison)) deaths.push([n.poison, "poison"]);
    this.lastProtect = n.protect;
    this.addLog("\u2600\uFE0F Tr\u1EDDi s\xE1ng (ng\xE0y " + this.day + ").");
    let any = false;
    for (const d of deaths) {
      if (this.kill(d[0], d[1])) any = true;
    }
    if (!any) this.addLog("\u0110\xEAm qua kh\xF4ng c\xF3 ai ch\u1EBFt.");
    this.afterDeaths("day");
  }
  kill(id, cause) {
    const p = this.players.get(id);
    if (!p || !p.alive) return false;
    p.alive = false;
    this.addLog("\u{1F480} " + p.name + " \u0111\xE3 ch\u1EBFt. Vai tr\xF2: " + ROLE_VI[p.role] + ".");
    if (p.role === "hunter" && cause !== "poison") this.pendingHunter = p.id;
    return true;
  }
  afterDeaths(next) {
    if (this.pendingHunter) {
      this.enterHunter(next);
      return;
    }
    if (this.checkWin()) return;
    this.go(next);
  }
  go(next) {
    if (next === "day") this.startDay();
    else this.startNight();
  }
  checkWin() {
    const w = this.aliveWith("wolf").length;
    const o = this.alive().length - w;
    if (w === 0) {
      this.finish("village");
      return true;
    }
    if (w >= o) {
      this.finish("wolf");
      return true;
    }
    return false;
  }
  finish(who) {
    this.phase = "over";
    this.sub = null;
    this.winner = who;
    this.stopTimer();
    this.addLog(who === "wolf" ? "\u{1F43A} B\u1EA7y S\xF3i th\u1EAFng!" : "\u{1F3D8}\uFE0F D\xE2n l\xE0ng th\u1EAFng!");
    this.broadcast();
  }
  // ---------- thợ săn ----------
  enterHunter(next) {
    this.phase = "hunter";
    this.sub = null;
    this.afterHunter = next;
    const h = this.players.get(this.pendingHunter);
    this.addLog("\u{1F3F9} " + h.name + " l\xE0 Th\u1EE3 s\u0103n, \u0111\u01B0\u1EE3c b\u1EAFn m\u1ED9t ph\xE1t tr\u01B0\u1EDBc khi g\u1EE5c xu\u1ED1ng!");
    this.setTimer(this.T.hunter, () => this.hunterDone(null));
    this.broadcast();
  }
  shoot(p, m) {
    if (this.phase !== "hunter" || p.id !== this.pendingHunter) return;
    const tgt = this.players.get(Number(m.target));
    if (!tgt || !tgt.alive || tgt.id === p.id) return;
    this.hunterDone(tgt.id);
  }
  hunterDone(tid) {
    this.stopTimer();
    this.pendingHunter = null;
    if (tid != null) {
      const t = this.players.get(tid);
      this.addLog("\u{1F3F9} Th\u1EE3 s\u0103n b\u1EAFn " + t.name + ".");
      this.kill(tid, "shot");
    } else {
      this.addLog("Th\u1EE3 s\u0103n kh\xF4ng k\u1ECBp b\u1EAFn.");
    }
    if (this.checkWin()) return;
    this.go(this.afterHunter);
  }
  // ---------- ngày ----------
  startDay() {
    this.phase = "day";
    this.sub = null;
    this.ready = /* @__PURE__ */ new Set();
    this.addLog("C\u1EA3 l\xE0ng th\u1EA3o lu\u1EADn xem ai l\xE0 S\xF3i.");
    this.setTimer(this.T.day, () => this.startVote());
    this.broadcast();
  }
  markReady(p) {
    if (this.phase !== "day" || !p.alive) return;
    this.ready.add(p.id);
    if (this.alive().every((q) => this.ready.has(q.id))) this.startVote();
    else this.broadcast();
  }
  startVote() {
    this.phase = "vote";
    this.votes = /* @__PURE__ */ new Map();
    this.voteResolved = false;
    this.addLog("\u{1F5F3}\uFE0F B\u1ECF phi\u1EBFu treo c\u1ED5!");
    this.setTimer(this.T.vote, () => this.endVote());
    this.broadcast();
  }
  vote(p, m) {
    if (this.phase !== "vote" || !p.alive) return;
    let t = 0;
    if (m.target) {
      const tgt = this.players.get(Number(m.target));
      if (!tgt || !tgt.alive || tgt.id === p.id) return;
      t = tgt.id;
    }
    this.votes.set(p.id, t);
    if (this.alive().every((q) => this.votes.has(q.id))) this.endVote();
    else this.broadcast();
  }
  endVote() {
    this.stopTimer();
    this.voteResolved = true;
    const tally = /* @__PURE__ */ new Map();
    for (const t of this.votes.values()) if (t) tally.set(t, (tally.get(t) || 0) + 1);
    let max = 0;
    for (const c of tally.values()) if (c > max) max = c;
    const top = [...tally.entries()].filter((e) => e[1] === max).map((e) => e[0]);
    const aliveN = this.alive().length;
    if (max > 0 && top.length === 1 && max * 2 >= aliveN) {
      const t = this.players.get(top[0]);
      this.addLog("\u2696\uFE0F " + t.name + " b\u1ECB treo c\u1ED5 v\u1EDBi " + max + "/" + aliveN + " phi\u1EBFu.");
      this.kill(top[0], "lynch");
    } else if (max > 0 && top.length === 1) {
      this.addLog("\u2696\uFE0F Ch\u1EC9 c\xF3 " + max + "/" + aliveN + " phi\u1EBFu, ch\u01B0a \u0111\u1EE7 m\u1ED9t n\u1EEDa s\u1ED1 ng\u01B0\u1EDDi c\xF2n s\u1ED1ng n\xEAn kh\xF4ng ai b\u1ECB treo c\u1ED5.");
    } else {
      this.addLog("\u2696\uFE0F Kh\xF4ng ai b\u1ECB treo c\u1ED5 (h\xF2a phi\u1EBFu ho\u1EB7c kh\xF4ng ai b\u1ECF phi\u1EBFu).");
    }
    this.afterDeaths("night");
  }
  // ---------- chat ----------
  chat(p, m) {
    const text = String(m.text || "").replace(/[\u0000-\u001f]/g, " ").trim().slice(0, 200);
    if (!text) return;
    const nowt = Date.now();
    if (nowt - p.lastChat < 400) return;
    let scope;
    if (this.phase === "lobby" || this.phase === "over") scope = "all";
    else if (!p.alive) scope = "dead";
    else if (this.phase === "night") {
      if (p.role === "wolf") scope = "wolf";
      else return this.err(p, "Ban \u0111\xEAm kh\xF4ng n\xF3i chuy\u1EC7n \u0111\u01B0\u1EE3c.");
    } else scope = "all";
    p.lastChat = nowt;
    const entry = { who: p.name, text, scope };
    this.chatLog.push(entry);
    if (this.chatLog.length > 80) this.chatLog.shift();
    for (const q of this.players.values()) {
      if (q.online && this.canSee(q, scope)) {
        try {
          q.send({ t: "chat", who: entry.who, text: entry.text, scope });
        } catch (e) {
        }
      }
    }
  }
  // ---------- trạng thái gửi cho từng người ----------
  broadcast() {
    for (const p of this.players.values()) {
      if (!p.online) continue;
      try {
        p.send({ t: "state", s: this.buildState(p) });
      } catch (e) {
      }
    }
  }
  actFor(p) {
    const ph = this.phase;
    if (ph === "hunter") {
      if (p.id !== this.pendingHunter) return null;
      return { a: "shoot", hint: "B\u1EA1n l\xE0 Th\u1EE3 s\u0103n, b\u1EAFn m\u1ED9t ng\u01B0\u1EDDi tr\u01B0\u1EDBc khi ch\u1EBFt!", targets: this.alive().filter((q) => q.id !== p.id).map((q) => q.id), chosen: null };
    }
    if (!p.alive) return null;
    const others = this.alive().filter((q) => q.id !== p.id).map((q) => q.id);
    if (ph === "night") {
      const n = this.night, s = this.sub;
      if (s === "guard" && p.role === "guard") {
        return { a: "protect", hint: "Ch\u1ECDn ng\u01B0\u1EDDi \u0111\u1EC3 b\u1EA3o v\u1EC7 \u0111\xEAm nay.", targets: this.alive().filter((q) => q.id !== this.lastProtect).map((q) => q.id), chosen: n.protect, done: n.acted.has(p.id) };
      }
      if (s === "wolf" && p.role === "wolf") {
        const votes = {};
        for (const [w, t] of n.wolfVotes) votes[w] = t;
        return { a: "bite", hint: "C\u1EA3 b\u1EA7y ch\u1ECDn m\u1ED9t n\u1EA1n nh\xE2n (nhi\u1EC1u phi\u1EBFu nh\u1EA5t b\u1ECB c\u1EAFn).", targets: this.alive().filter((q) => q.role !== "wolf").map((q) => q.id), chosen: n.wolfVotes.get(p.id) || null, votes };
      }
      if (s === "seer" && p.role === "seer") {
        return { a: "see", hint: "Ch\u1ECDn ng\u01B0\u1EDDi \u0111\u1EC3 soi xem c\xF3 ph\u1EA3i S\xF3i kh\xF4ng.", targets: others, chosen: null, done: n.acted.has(p.id) };
      }
      if (s === "witch" && p.role === "witch") {
        const v = n.victim != null ? this.players.get(n.victim) : null;
        return { a: "witch", hint: v ? "\u0110\xEAm nay " + v.name + " b\u1ECB S\xF3i c\u1EAFn." : "\u0110\xEAm nay kh\xF4ng ai b\u1ECB c\u1EAFn.", victim: v ? { id: v.id, name: v.name } : null, heal: p.heal && !!v, poison: p.poison, targets: p.poison ? others : [], done: n.acted.has(p.id) };
      }
      return null;
    }
    if (ph === "day") return { a: "ready", hint: "Th\u1EA3o lu\u1EADn r\u1ED3i b\u1EA5m s\u1EB5n s\xE0ng \u0111\u1EC3 b\u1ECF phi\u1EBFu s\u1EDBm.", ready: this.ready.has(p.id) };
    if (ph === "vote") return { a: "vote", hint: "Ch\u1ECDn ng\u01B0\u1EDDi \u0111\u1EC3 treo c\u1ED5, c\u1EA7n \xEDt nh\u1EA5t m\u1ED9t n\u1EEDa s\u1ED1 ng\u01B0\u1EDDi c\xF2n s\u1ED1ng \u0111\u1ED3ng \xFD, ho\u1EB7c b\u1ECF qua phi\u1EBFu.", targets: others, chosen: this.votes.has(p.id) ? this.votes.get(p.id) : void 0 };
    return null;
  }
  buildState(p) {
    const over = this.phase === "over";
    const players = [];
    for (const q of this.players.values()) {
      const o = { id: q.id, name: q.name, alive: q.alive, online: q.online };
      if (over || !q.alive || q.id === p.id || p.role === "wolf" && q.role === "wolf") o.role = q.role;
      if (this.phase === "vote") o.voted = this.votes.has(q.id);
      else if (this.voteResolved && this.votes.has(q.id)) o.vote = this.votes.get(q.id);
      players.push(o);
    }
    const alive = this.alive();
    return {
      now: Date.now(),
      phase: this.phase,
      sub: this.phase === "night" ? this.sub : null,
      day: this.day,
      deadline: this.deadline,
      you: p.id,
      host: this.hostId,
      players,
      cfg: this.currentCfg(),
      log: this.log.slice(-10),
      winner: this.winner,
      min: WOLF_MIN,
      readyCount: this.ready.size,
      aliveCount: alive.length,
      voteResolved: this.voteResolved,
      me: { role: p.role, alive: p.alive, seen: p.role === "seer" ? p.seen : [], heal: p.role === "witch" ? p.heal : false, poison: p.role === "witch" ? p.poison : false, act: this.actFor(p) }
    };
  }
};

// src/wolf/room.js
var WolfRoom = class {
  static {
    __name(this, "WolfRoom");
  }
  constructor(state, env) {
    this.state = state;
    this.engine = new WolfEngine();
  }
  async fetch(request) {
    const full = this.engine.phase === "lobby" && this.engine.players.size >= WOLF_MAX;
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response(full ? "Room full" : "Expected WebSocket", { status: full ? 409 : 426 });
    }
    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    server.accept();
    let pid = null;
    const send = /* @__PURE__ */ __name((o) => {
      try {
        server.send(JSON.stringify(o));
      } catch (e) {
      }
    }, "send");
    server.addEventListener("message", (ev) => {
      if (typeof ev.data !== "string" || ev.data.length > 1e3) return;
      let m;
      try {
        m = JSON.parse(ev.data);
      } catch (e) {
        return;
      }
      if (!m || typeof m !== "object") return;
      if (pid === null) {
        if (m.t === "join") pid = this.engine.join(m, send);
        return;
      }
      this.engine.handle(pid, m);
    });
    const onGone = /* @__PURE__ */ __name(() => {
      if (pid !== null) this.engine.leave(pid, send);
    }, "onGone");
    server.addEventListener("close", onGone);
    server.addEventListener("error", onGone);
    return new Response(null, { status: 101, webSocket: client });
  }
};

// bomb-arena/map.js
var W = 21;
var H = 15;
var dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
var key = /* @__PURE__ */ __name((x, y) => `${x},${y}`, "key");
var cell = /* @__PURE__ */ __name((p) => [Math.round(p.x), Math.round(p.y)], "cell");
function makeMap(random = Math.random) {
  return Array.from({ length: H }, (_, y) => Array.from({ length: W }, (_2, x) => {
    if (!x || !y || x === W - 1 || y === H - 1 || x % 2 === 0 && y % 2 === 0) return 1;
    if ((x <= 2 || x >= W - 3) && (y <= 2 || y >= H - 3)) return 0;
    return random() < 0.68 ? 2 : 0;
  }));
}
__name(makeMap, "makeMap");
function blast(map, bomb) {
  const cells = [[bomb.x, bomb.y]];
  for (const [dx, dy] of dirs) for (let n = 1; n <= bomb.range; n++) {
    const x = bomb.x + dx * n, y = bomb.y + dy * n;
    if (map[y]?.[x] === void 0 || map[y][x] === 1) break;
    cells.push([x, y]);
    if (map[y][x] === 2) break;
  }
  return cells;
}
__name(blast, "blast");

// bomb-arena/items.js
function dropItem(random = Math.random) {
  if (random() >= 0.38) return null;
  const roll = random();
  return roll < 0.5 ? "speed" : roll < 0.7 ? "bomb" : roll < 0.9 ? "range" : "shield";
}
__name(dropItem, "dropItem");
function collect(s, p) {
  const i = s.items.findIndex((i2) => Math.abs(i2.x - p.x) < 0.4 && Math.abs(i2.y - p.y) < 0.4);
  if (i < 0) return;
  const [item] = s.items.splice(i, 1);
  if (item.type === "bomb") p.capacity = Math.min(6, p.capacity + 1);
  if (item.type === "range") p.range = Math.min(8, p.range + 1);
  if (item.type === "speed") p.speed = Math.min(6.6, p.speed + 0.4);
  if (item.type === "shield") p.shield = true;
  s.events.push("pickup");
  s.particles.push({ x: p.x, y: p.y, t: 0.7, color: "#ffb36b" });
}
__name(collect, "collect");

// bomb-arena/bombs.js
function place(s, p) {
  const [x, y] = cell(p);
  if (!p.alive || s.bombs.filter((b) => b.owner === p.id).length >= p.capacity || s.bombs.some((b) => b.x === x && b.y === y) || s.map[y][x] !== 0) return false;
  s.bombs.push({ x, y, owner: p.id, range: p.range, t: 2.5, pass: new Set(s.players.filter((q) => q.alive && Math.abs(q.x - x) < 0.74 && Math.abs(q.y - y) < 0.74).map((q) => q.id)) });
  s.events.push("place");
  return true;
}
__name(place, "place");
function updateBombs(s, dt) {
  s.fire = s.fire.filter((f) => (f.t -= dt) > 0);
  for (const b of s.bombs) b.t -= dt;
  const queue = s.bombs.filter((b) => b.t <= 0), exploded = /* @__PURE__ */ new Set(), destroyed = /* @__PURE__ */ new Set();
  while (queue.length) {
    const b = queue.shift();
    if (exploded.has(b)) continue;
    exploded.add(b);
    for (const [x, y] of blast(s.map, b)) {
      s.fire.push({ x, y, t: 0.65, fresh: true });
      if (s.map[y][x] === 2) destroyed.add(key(x, y));
      else s.items = s.items.filter((i) => i.x !== x || i.y !== y);
      for (const other of s.bombs) if (other.x === x && other.y === y && !exploded.has(other)) queue.push(other);
    }
    s.events.push("explode");
  }
  s.bombs = s.bombs.filter((b) => !exploded.has(b));
  for (const k of destroyed) {
    const [x, y] = k.split(",").map(Number);
    s.map[y][x] = 0;
    s.particles.push({ x, y, t: 0.5, color: "#ffbc72" });
    const type = dropItem(s.random);
    if (type) s.items.push({ x, y, type });
  }
}
__name(updateBombs, "updateBombs");
function damage(s, dt) {
  for (const p of s.players) {
    p.invincible = Math.max(0, p.invincible - dt);
    if (!p.alive || p.invincible > 0) continue;
    if (s.fire.some((f) => f.fresh && Math.abs(p.x - f.x) < 0.72 && Math.abs(p.y - f.y) < 0.72)) {
      if (p.shield) {
        p.shield = false;
        p.invincible = 1.2;
        s.events.push("shield");
      } else {
        p.alive = false;
        s.events.push("death");
        s.particles.push({ x: p.x, y: p.y, t: 1, color: p.color });
      }
    }
  }
  for (const f of s.fire) f.fresh = false;
}
__name(damage, "damage");

// bomb-arena/state.js
function createGame(options = {}, random = Math.random) {
  const humans = options.humans || 1, count = Math.min(4, humans + (options.bots ?? 3));
  const starts = [[1, 1], [W - 2, H - 2], [W - 2, 1], [1, H - 2]], colors = ["#8a74ff", "#ff72a9", "#ffca5c", "#58ded0"];
  return { options, random, map: makeMap(random), players: starts.slice(0, count).map(([x, y], id) => ({ id, x, y, color: colors[id], name: id < humans ? `Ng\u01B0\u1EDDi ch\u01A1i ${id + 1}` : `Bot ${id - humans + 1}`, bot: id >= humans, alive: true, capacity: 1, range: 2, speed: 4.2, shield: false, invincible: 0, walk: 0, think: 0, target: null })), bombs: [], fire: [], items: [], particles: [], events: [], time: 180, result: null };
}
__name(createGame, "createGame");
function step(s, dt) {
  if (s.result) return;
  s.time = Math.max(0, s.time - dt);
  updateBombs(s, dt);
  damage(s, dt);
  for (const p of s.players) if (p.alive) collect(s, p);
  s.particles = s.particles.filter((p) => (p.t -= dt) > 0);
  const living = s.players.filter((p) => p.alive);
  if (living.length <= 1) s.result = living.length ? `${living[0].name} chi\u1EBFn th\u1EAFng!` : "H\xF2a! C\xF9ng nhau b\xF9ng n\u1ED5.";
  else if (s.time <= 0) s.result = "H\u1EBFt gi\u1EDD \u2014 h\xF2a!";
}
__name(step, "step");

// bomb-arena/collision.js
function canStand(s, p, x, y) {
  const radius = 0.24;
  for (const xx of [x - radius, x + radius]) for (const yy of [y - radius, y + radius]) {
    const cx = Math.round(xx), cy = Math.round(yy);
    if (s.map[cy]?.[cx] !== 0) return false;
    if (s.bombs.some((b) => b.x === cx && b.y === cy && !b.pass?.has(p.id))) return false;
  }
  return true;
}
__name(canStand, "canStand");
function move(s, p, dx, dy, dt) {
  if (!p.alive || !dx && !dy || dt <= 0) return;
  dx = Math.sign(dx);
  dy = dx ? 0 : Math.sign(dy);
  const distance = p.speed * dt, steps = Math.ceil(distance / 0.06), stride = distance / steps;
  let travelled = 0;
  const advance = /* @__PURE__ */ __name((x, y) => {
    if (!canStand(s, p, x, y)) return false;
    travelled += Math.hypot(x - p.x, y - p.y);
    p.x = x;
    p.y = y;
    for (const b of s.bombs) if (Math.abs(x - b.x) > 0.74 || Math.abs(y - b.y) > 0.74) b.pass?.delete(p.id);
    return true;
  }, "advance");
  for (let i = 0; i < steps; i++) {
    let remaining = stride;
    const cross = dx ? p.y : p.x;
    const lanes = [Math.floor(cross), Math.ceil(cross)].filter((v, i2, a) => a.indexOf(v) === i2).sort((a, b) => Math.abs(a - cross) - Math.abs(b - cross));
    const lane = lanes.find((v) => Math.abs(v - cross) <= 0.55 && canStand(s, p, dx ? p.x + dx * 0.35 : v, dx ? v : p.y + dy * 0.35));
    if (lane !== void 0 && Math.abs(lane - cross) > 1e-8) {
      const correction = Math.sign(lane - cross) * Math.min(remaining, Math.abs(lane - cross));
      if (!advance(dx ? p.x : p.x + correction, dx ? p.y + correction : p.y)) break;
      remaining -= Math.abs(correction);
    }
    if (remaining > 1e-8 && !advance(p.x + dx * remaining, p.y + dy * remaining)) break;
  }
  if (travelled > 0) p.walk += travelled * 4;
}
__name(move, "move");

// src/bomb-room-engine.js
var BombRoomEngine = class {
  static {
    __name(this, "BombRoomEngine");
  }
  constructor() {
    this.peers = /* @__PURE__ */ new Map();
    this.game = null;
    this.host = null;
    this.theme = "garden";
    this.sequence = 0;
  }
  join(name, send) {
    if (this.game && !this.game.result) throw new Error("Tr\u1EADn \u0111ang di\u1EC5n ra. H\xE3y ch\u1EDD v\xE1n sau.");
    if (this.peers.size >= 4) throw new Error("Ph\xF2ng \u0111\xE3 \u0111\u1EE7 4 ng\u01B0\u1EDDi.");
    const id = [0, 1, 2, 3].find((id2) => !this.peers.has(id2));
    const peer = { id, name: typeof name === "string" ? name.trim().slice(0, 20) : "", send, dx: 0, dy: 0, bomb: false, lastInput: 0 };
    peer.name ||= `Ng\u01B0\u1EDDi ch\u01A1i ${id + 1}`;
    this.peers.set(id, peer);
    this.host ??= id;
    if (this.game?.result) this.game = null;
    send({ t: "hello", id });
    this.lobby();
    return id;
  }
  broadcast(message) {
    for (const p of this.peers.values()) try {
      p.send(message);
    } catch {
    }
  }
  lobby() {
    this.broadcast({ t: "lobby", host: this.host, theme: this.theme, playing: !!this.game && !this.game.result, players: [...this.peers.values()].map(({ id, name }) => ({ id, name })) });
  }
  handle(id, message, now = Date.now()) {
    const p = this.peers.get(id);
    if (!p || !message || typeof message !== "object") return;
    if (message.t === "theme" && id === this.host && (!this.game || this.game.result) && ["garden", "factory", "ice"].includes(message.theme)) {
      this.theme = message.theme;
      this.lobby();
    }
    if (message.t === "input") {
      if (!this.game || this.game.result) return;
      if (![-1, 0, 1].includes(message.dx) || ![-1, 0, 1].includes(message.dy)) return;
      p.dx = message.dx;
      p.dy = p.dx ? 0 : message.dy;
      p.lastInput = now;
      if (message.bomb === true) p.bomb = true;
    }
    if (message.t === "start" && id === this.host) {
      if (this.game && !this.game.result) return;
      if (this.peers.size < 2) {
        p.send({ t: "error", message: "C\u1EA7n \xEDt nh\u1EA5t 2 ng\u01B0\u1EDDi \u0111\u1EC3 b\u1EAFt \u0111\u1EA7u." });
        return;
      }
      if (["garden", "factory", "ice"].includes(message.theme)) this.theme = message.theme;
      const game = createGame({ humans: 4, bots: 0, theme: this.theme });
      game.players = game.players.filter((player) => this.peers.has(player.id));
      for (const player of game.players) player.name = this.peers.get(player.id).name;
      for (const peer of this.peers.values()) {
        peer.dx = 0;
        peer.dy = 0;
        peer.bomb = false;
        peer.lastInput = 0;
      }
      this.game = game;
      this.sequence = 0;
      this.broadcast({ t: "started" });
      this.snapshot();
    }
  }
  tick(dt = 1 / 60, now = Date.now()) {
    const s = this.game;
    if (!s || s.result) return;
    for (const p of this.peers.values()) {
      const player = s.players.find((q) => q.id === p.id);
      if (!player) continue;
      if (now - p.lastInput < 600) move(s, player, p.dx, p.dy, dt);
      if (p.bomb) {
        place(s, player);
        p.bomb = false;
      }
    }
    step(s, dt);
  }
  snapshot() {
    if (!this.game) return;
    const { random, ...state } = this.game;
    this.broadcast({ t: "state", sequence: ++this.sequence, state: { ...state, bombs: state.bombs.map(({ pass, ...bomb }) => bomb) } });
    this.game.events = [];
  }
  leave(id) {
    if (!this.peers.delete(id)) return;
    if (this.host === id) this.host = this.peers.keys().next().value ?? null;
    const player = this.game?.players.find((p) => p.id === id);
    if (player) player.alive = false;
    if (this.peers.size === 0) this.game = null;
    this.lobby();
  }
};

// src/bomb-room.js
var BombRoom = class {
  static {
    __name(this, "BombRoom");
  }
  constructor() {
    this.engine = new BombRoomEngine();
    this.timer = null;
    this.created = false;
  }
  async fetch(request) {
    if (request.headers.get("Upgrade")?.toLowerCase() !== "websocket") return new Response("Expected WebSocket", { status: 426 });
    const url = new URL(request.url), create = url.searchParams.get("action") === "create";
    if (create && this.engine.peers.size) return new Response("Room exists", { status: 409 });
    if (!create && (!this.created || !this.engine.peers.size)) return new Response("Room not found", { status: 404 });
    if (this.engine.peers.size >= 4) return new Response("Room full", { status: 409 });
    if (this.engine.game && !this.engine.game.result) return new Response("Match in progress", { status: 409 });
    const pair = new WebSocketPair(), client = pair[0], server = pair[1];
    server.accept();
    this.created = true;
    const send = /* @__PURE__ */ __name((message) => server.send(JSON.stringify(message)), "send");
    const id = this.engine.join(url.searchParams.get("name"), send);
    let departed = false, count = 0, windowStart = Date.now();
    const leave = /* @__PURE__ */ __name(() => {
      if (departed) return;
      departed = true;
      this.engine.leave(id);
      if (!this.engine.peers.size) {
        clearInterval(this.timer);
        this.timer = null;
        this.created = false;
      }
      try {
        server.close(1e3, "bye");
      } catch {
      }
    }, "leave");
    server.addEventListener("message", (event) => {
      if (typeof event.data !== "string" || event.data.length > 512) return;
      const now = Date.now();
      if (now - windowStart > 1e3) {
        count = 0;
        windowStart = now;
      }
      if (++count > 90) {
        server.close(1008, "Too many messages");
        leave();
        return;
      }
      let message;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }
      this.engine.handle(id, message, now);
      this.ensureLoop();
    });
    server.addEventListener("close", leave);
    server.addEventListener("error", leave);
    return new Response(null, { status: 101, webSocket: client });
  }
  ensureLoop() {
    if (this.timer || !this.engine.game || this.engine.game.result) return;
    let last = Date.now(), accumulator = 0, broadcast = 0;
    this.timer = setInterval(() => {
      const now = Date.now();
      accumulator += Math.min(0.1, (now - last) / 1e3);
      last = now;
      while (accumulator >= 1 / 60) {
        this.engine.tick(1 / 60, now);
        accumulator -= 1 / 60;
      }
      if (++broadcast % 3 === 0 || this.engine.game?.result) this.engine.snapshot();
      if (!this.engine.game || this.engine.game.result) {
        clearInterval(this.timer);
        this.timer = null;
      }
    }, 1e3 / 60);
  }
};

// worker.js
var OFFLINE_STATUS = /* @__PURE__ */ new Set([502, 503, 504, 521, 522, 523, 524, 530]);
var worker_default = {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    if (url.pathname === "/__game/bomb-arena") {
      if (request.method !== "GET" && request.method !== "HEAD") {
        return new Response("Method Not Allowed", { status: 405, headers: { Allow: "GET, HEAD" } });
      }
      return new Response(request.method === "HEAD" ? null : bomb_arena_generated_default, {
        headers: { "Content-Type": "text/html; charset=UTF-8", "Cache-Control": "no-store" }
      });
    }
    if (url.pathname === "/__game/mini-motorways") {
      return new Response(miniMotorways, {
        headers: {
          "Content-Type": "text/html; charset=UTF-8",
          "Cache-Control": "no-store"
        }
      });
    }
    if (url.pathname === "/__game/ws") return handleGameSocket(request, env, url);
    try {
      const response = await fetch(request);
      if (OFFLINE_STATUS.has(response.status)) {
        return renderOffline(request);
      }
      return response;
    } catch (error) {
      return renderOffline(request);
    }
  }
};
export {
  BombRoom,
  PoolRoom,
  WolfRoom,
  worker_default as default
};
//# sourceMappingURL=worker.js.map
