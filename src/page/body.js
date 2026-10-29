// Lưu ý: nội dung nằm trong template literal nên KHÔNG dùng backtick, dấu đô-la + ngoặc nhọn
// hay dấu gạch chéo ngược trong phần chuỗi này.
export const body = (hostname) => `  </style>
</head>
<body>
  <div class="card">
    <button class="domain-badge" id="loginTrigger" type="button" aria-label="Đăng nhập để mở thư viện game">${hostname}</button>
    <h1 id="homeTitle">Máy chủ local chưa bật 🐞</h1>
    <p class="sub" id="homeIntro">Đang chờ máy chủ kết nối lại. Trang sẽ tự tải khi máy chủ hoạt động.</p>
    <div class="status" id="homeStatus">Đang tự động thử kết nối lại...</div>
    <section class="game-library" id="homeLibrary" aria-label="Thư viện trò chơi" hidden>
      <div class="library-heading"><strong>CHỌN GAME</strong><span>Chọn một trò để bắt đầu</span></div>
      <nav class="tabs" aria-label="Danh sách game">
      <a class="tab on" href="/?game=flappy"><span class="game-icon">🐞</span><span><b>Flappy Bug</b><small>Vượt chướng ngại vật</small></span></a>
      <a class="tab" href="/?game=caro"><span class="game-icon">⭕</span><span><b>Caro</b><small>Đấu với máy hoặc bạn bè</small></span></a>
      <a class="tab" data-g="2048" href="/?game=2048"><span class="game-icon">🔢</span><span><b>2048</b><small>Ghép ô số</small></span></a>
      <a class="tab" href="/?game=wolf"><span class="game-icon">🐺</span><span><b>Ma sói</b><small>Trò chơi suy luận nhóm</small></span></a>
      <a class="tab" href="/?game=played"><span class="game-icon">🎮</span><span><b>YOU GOT PLAYED</b><small>Platformer đánh lừa</small></span></a>
      <a class="tab" href="/?game=motorways"><span class="game-icon">🚗</span><span><b>Mini Motorways</b><small>Nối đường và điều phối xe</small></span></a>
      <a class="tab" href="/?game=bangbang"><span class="game-icon">🚀</span><span><b>Bang Bang</b><small>Đấu trường xe tăng</small></span></a>
      <a class="tab tab-link" href="/tower-city"><span class="game-icon">🏗️</span><span><b>Tower City</b><small>Xây tháp và quy hoạch thành phố</small></span><span class="launch-icon" aria-hidden="true">↗</span></a>
      <a class="tab tab-link" href="/chibi-rush"><span class="game-icon">🏃</span><span><b>Chibi Rush</b><small>Đua vượt chướng ngại vật, tối đa 8 người</small></span><span class="launch-icon" aria-hidden="true">↗</span></a>
      <!-- <button class="tab" data-g="sword">⚔️ Đấu kiếm</button>  -->
      <a class="tab tab-link" href="/ty-phu"><span class="game-icon">▦</span><span><b>Tỷ Phú Mebi</b><small>Cờ tỷ phú online 2–4 người</small></span><span class="launch-icon" aria-hidden="true">↗</span></a>
      <a class="tab tab-link" href="/tien-len"><span class="game-icon">🃏</span><span><b>Tiến Lên</b><small>Chơi bài cùng bạn bè</small></span><span class="launch-icon" aria-hidden="true">↗</span></a>
      <a class="tab tab-link" href="/uno"><span class="game-icon">🌈</span><span><b>UNO</b><small>Đấu bài sắc màu 2-4 người</small></span><span class="launch-icon" aria-hidden="true">↗</span></a>
      <a class="tab tab-link" href="/stickman-fight"><span class="game-icon">🥊</span><span><b>Stickman Showdown</b><small>Đối kháng người que</small></span><span class="launch-icon" aria-hidden="true">↗</span></a>
      <a class="tab tab-link" href="/__game/bomb-arena"><span class="game-icon">✹</span><span><b>Bomb Arena</b><small>Đặt bom tranh đấu</small></span><span class="launch-icon" aria-hidden="true">↗</span></a>
      </nav>
    </section>
    <div class="login-overlay" id="loginOverlay" hidden>
      <section class="login-panel" role="dialog" aria-modal="true" aria-labelledby="loginTitle">
        <button class="login-close" id="loginClose" type="button" aria-label="Đóng">×</button>
        <h2 id="loginTitle">Đăng nhập</h2>
        <p id="loginIntro">Đăng nhập để mở thư viện trò chơi.</p>
        <form id="loginForm">
          <label for="loginUsername">Tên đăng nhập</label>
          <input id="loginUsername" name="username" type="text" maxlength="256" autocomplete="username" required>
          <label for="loginPassword">Mật khẩu</label>
          <input id="loginPassword" name="password" type="password" maxlength="256" autocomplete="current-password" required>
          <button class="mini login-submit" id="loginSubmit" type="submit">Đăng nhập</button>
        </form>
        <button class="mini login-submit" id="logoutButton" type="button" hidden>Đăng xuất</button>
        <div class="pmsg login-message" id="loginMessage" role="status" aria-live="polite"></div>
      </section>
    </div>
    <main id="playScreen" hidden>
    <h1 id="playingTitle"></h1>
    <a class="back-to-library" href="/">← Tất cả trò chơi</a>
    <div class="game" id="gameBox"><canvas id="g"></canvas><div class="pg-touch" id="playedControls" hidden><div class="pg-touch-group"><button type="button" aria-label="Đi sang trái" data-played-control="left">←</button><button type="button" aria-label="Đi sang phải" data-played-control="right">→</button><button type="button" aria-label="Tạm dừng hoặc tiếp tục" data-played-control="pause">Ⅱ</button></div><button type="button" class="jump" aria-label="Nhảy" data-played-control="jump">NHẢY</button></div><iframe id="motorwaysFrame" title="Mini Motorways" data-src="/__game/mini-motorways" hidden></iframe><iframe id="bangBangFrame" title="Bang Bang đấu trường xe tăng" data-src="/__game/bang-bang" hidden></iframe></div>
    <div class="poolui" id="poolui" hidden>
      <div id="pMenu">
        <div class="row">
          <button class="mini" id="pSolo">Chơi một mình</button>
          <button class="mini" id="pCreate">Tạo phòng</button>
        </div>
        <div class="row">
          <input id="pCode" maxlength="4" placeholder="MÃ PHÒNG" autocomplete="off">
          <button class="mini" id="pJoin">Vào phòng</button>
        </div>
      </div>
      <button class="mini" id="pBack" hidden style="width:100%;margin-bottom:8px">Thoát về menu</button>
      <div class="pmsg" id="pMsg"></div>
    </div>
    <div class="poolui" id="caroui" hidden>
      <div id="cMenu">
        <div class="row">
          <button class="mini" id="cBot">Đấu với máy</button>
          <button class="mini" id="cCreate">Tạo phòng</button>
        </div>
        <div class="row">
          <input id="cCode" maxlength="4" placeholder="MÃ PHÒNG" autocomplete="off">
          <button class="mini" id="cJoin">Vào phòng</button>
        </div>
      </div>
      <button class="mini" id="cBack" hidden style="width:100%;margin-bottom:8px">Thoát về menu</button>
      <div class="pmsg" id="cMsg"></div>
    </div>
    <div class="poolui" id="game2048ui" hidden>
      <div id="g2048Menu">
        <div class="row">
          <button class="mini" id="g2048New">🔄 Ván mới</button>
          <button class="mini" id="g2048Undo">↩ Hoàn tác</button>
          <button class="mini" id="g2048Theme">🥚 Đổi Theme</button>
          <button class="mini" id="g2048Mode">Chế độ: Đơn</button>
        </div>
        <div class="row" id="g2048OnlineRow">
          <button class="mini" id="g2048Create">Tạo phòng 1v1</button>
          <input id="g2048Code" maxlength="4" placeholder="MÃ PHÒNG" autocomplete="off">
          <button class="mini" id="g2048Join">Vào phòng</button>
        </div>
      </div>
      <button class="mini" id="g2048Back" hidden style="width:100%;margin-bottom:8px">Thoát về chơi đơn</button>
      <div class="pmsg" id="g2048Msg"></div>
    </div>
    <div class="poolui" id="swordui" hidden>
      <div id="sMenu">
        <div class="row">
          <button class="mini" id="sBot">Đấu với máy</button>
          <button class="mini" id="sCreate">Tạo phòng</button>
        </div>
        <div class="row">
          <input id="sCode" maxlength="4" placeholder="MÃ PHÒNG" autocomplete="off">
          <button class="mini" id="sJoin">Vào phòng</button>
        </div>
      </div>
      <button class="mini" id="sBack" hidden style="width:100%;margin-bottom:8px">Thoát về menu</button>
      <div class="pmsg" id="sMsg"></div>
      <div class="swkeys">
        <span><kbd>A</kbd><kbd>D</kbd> đi</span>
        <span><kbd>W</kbd> nhảy</span>
        <span><kbd>S</kbd> cúi</span>
        <span><kbd>←</kbd><kbd>→</kbd> hạ / nâng vai</span>
        <span><kbd>↑</kbd><kbd>↓</kbd> duỗi / co khuỷu</span>
        <span><kbd>Space</kbd> chém</span>
      </div>
    </div>
    <div class="wstage" id="wolfui" data-ph="lobby" hidden>
      <div id="wMenu" class="wmenu">
        <div>
          <h2 class="wtitle">Ma sói</h2>
          <p class="wlead">Từ 5 đến 12 người, mỗi người một thiết bị. Server giữ vai trò và luật chơi, nên không ai nhìn thấy bài của người khác.</p>
          <input id="wName" maxlength="12" placeholder="Tên của bạn" autocomplete="off">
          <div class="row">
            <button class="mini" id="wCreate">Tạo phòng</button>
            <input id="wCode" maxlength="4" placeholder="MÃ PHÒNG" autocomplete="off">
            <button class="mini" id="wJoin">Vào phòng</button>
          </div>
        </div>
        <div class="wroles">
          <div data-r="wolf"><i class="ric"></i><span><b>🐺 Sói</b>Mỗi đêm cả bầy chọn một người để cắn.</span></div>
          <div data-r="villager"><i class="ric"></i><span><b>🏘️ Dân làng</b>Thảo luận, quan sát và bỏ phiếu treo cổ Sói.</span></div>
          <div data-r="seer"><i class="ric"></i><span><b>🔮 Tiên tri</b>Mỗi đêm soi một người xem có phải Sói không.</span></div>
          <div data-r="guard"><i class="ric"></i><span><b>🛡️ Bảo vệ</b>Che chở một người khỏi bị cắn mỗi đêm.</span></div>
          <div data-r="witch"><i class="ric"></i><span><b>🧪 Phù thủy</b>Một bình cứu, một bình độc dùng một lần.</span></div>
          <div data-r="hunter"><i class="ric"></i><span><b>🏹 Thợ săn</b>Khi chết được bắn hạ một người.</span></div>
        </div>
      </div>
      <div id="wGame" hidden>
        <div class="whead">
          <div class="wroomtag"><b id="wRoom"></b><button class="mini small" id="wBack">Thoát phòng</button></div>
          <div class="wbanner">
            <div class="wsky" id="wSky"></div>
            <svg class="wscene" viewBox="0 0 400 100" preserveAspectRatio="xMaxYMax slice" aria-hidden="true"><path d="M0 100 V74 Q70 52 140 70 T280 64 T400 60 V100Z" fill="currentColor" opacity="0.45"/><g fill="currentColor"><path d="M210 78 L232 56 L254 78Z"/><rect x="214" y="78" width="36" height="22"/><path d="M290 74 L308 56 L326 74Z"/><rect x="293" y="74" width="30" height="26"/><rect x="262" y="60" width="5" height="12" opacity="0.7"/></g><g class="tr" fill="currentColor"><path d="M350 100 L362 62 L374 100Z"/><path d="M372 100 L382 70 L392 100Z"/><path d="M180 100 L190 72 L200 100Z"/></g><rect class="win" x="226" y="84" width="8" height="8" rx="1"/><rect class="win" x="302" y="82" width="7" height="8" rx="1"/></svg>
            
            <h2 class="wphase" id="wPhase"></h2>
            <div class="wsub" id="wSub"></div>
          </div>
          <div class="wtimer" id="wTimer" hidden><span id="wTimeNum"></span></div>
        </div>
        <div class="wgrid">
          <div class="wmobile-tabs" role="group" aria-label="Điều hướng ván chơi trên điện thoại">
            <button class="mini small" type="button" data-mobile-tab="act" aria-controls="wMid" aria-pressed="true">Hành động</button>
            <button class="mini small" type="button" data-mobile-tab="players" aria-controls="wPlayersPanel" aria-pressed="false">Người chơi</button>
            <button class="mini small" type="button" data-mobile-tab="chat" aria-controls="wChatPanel" aria-pressed="false">Chat</button>
          </div>
          <section class="wcol wleft" id="wPlayersPanel">
            <h3>Người chơi <span id="wPCount"></span></h3>
            <div class="wplayers" id="wPlayers"></div>
          </section>
          <section class="wcol wmid mobile-active" id="wMid">
            <div class="wrole" id="wRole"></div>
            <div class="wact" id="wAct"></div>
          </section>
          <section class="wcol wright" id="wChatPanel">
            <h3>Diễn biến</h3>
            <div class="wlog" id="wLog"></div>
            <div class="wchatbox" id="wChat"></div>
            <div class="row"><input id="wText" maxlength="200" placeholder="Nhắn tin..." autocomplete="off"><button class="mini" id="wSend">Gửi</button></div>
          </section>
        </div>
      </div>
      <div class="pmsg" id="wMsg"></div>
    </div>
    <div class="hint" id="hint"></div>
    <div class="status" id="st">Đang tự động thử kết nối lại...</div>
    <button class="btn" id="reload">Tải lại trang</button>
    </main>
  </div>

`;
