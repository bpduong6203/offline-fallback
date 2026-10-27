// Lưu ý: nội dung nằm trong template literal nên KHÔNG dùng backtick, dấu đô-la + ngoặc nhọn
// hay dấu gạch chéo ngược trong phần chuỗi này.
export const styleWolf = `    /* ===== Ma sói: sân khấu rộng, đổi màu theo pha ===== */
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
