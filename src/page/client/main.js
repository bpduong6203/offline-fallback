// Một đoạn của script phía trình duyệt, được nối lại theo thứ tự trong render.js (cùng một phạm vi).
// Lưu ý: nội dung nằm trong template literal nên KHÔNG dùng backtick, dấu đô-la + ngoặc nhọn
// hay dấu gạch chéo ngược trong phần chuỗi này.
export const clientMain = `    // ===================== CHUNG =====================
    var motorways = { w: 480, h: 270, hint: 'Kéo chuột hoặc ngón tay để vẽ đường nối nhà với điểm đến cùng màu.', update: function () {}, draw: function () {} };
    var bangbang = { w: 1280, h: 800, hint: 'Chọn chế độ 1v1, 2v2 hoặc 3v3, chọn xe tăng rồi sẵn sàng tìm trận.', busy: function () { var f = document.getElementById('bangBangFrame'); return !!(f && f.contentWindow && f.contentWindow.bangBangBusy); }, update: function () {}, draw: function () {} };
    var games = { flappy: flappy, pool: pool, caro: caro, sword: sword, wolf: wolf, motorways: motorways, bangbang: bangbang, played: played };
    var cur = flappy;
    var hint = document.getElementById('hint');
    var tabs = document.querySelectorAll('.tab[data-g]');
    hint.textContent = flappy.hint;

    function switchTo(g) {
      if (cur === games[g]) return;
      if (cur.leave) cur.leave();
      cur = games[g];
      if (cur.enter) cur.enter();
      setSize(cur.w, cur.h);
      for (var i = 0; i < tabs.length; i++) {
        var selected = tabs[i].getAttribute('data-g') === g;
        tabs[i].className = 'tab' + (selected ? ' on' : '');
        tabs[i].setAttribute('aria-pressed', String(selected));
      }
      document.getElementById('poolui').hidden = (g !== 'pool');
      document.getElementById('caroui').hidden = (g !== 'caro');
      document.getElementById('swordui').hidden = (g !== 'sword');
      document.getElementById('wolfui').hidden = (g !== 'wolf');
      document.getElementById('gameBox').hidden = (g === 'wolf');
      document.getElementById('g').hidden = (g === 'motorways' || g === 'bangbang');
      document.getElementById('motorwaysFrame').hidden = (g !== 'motorways');
      var bbf = document.getElementById('bangBangFrame');
      if (bbf) {
        bbf.hidden = (g !== 'bangbang');
        if (g === 'bangbang' && !bbf.getAttribute('src')) bbf.src = bbf.getAttribute('data-src');
        else if (g !== 'bangbang' && bbf.getAttribute('src')) { bbf.src = 'about:blank'; bbf.removeAttribute('src'); }
      }
      var cardEl = document.querySelector('.card');
      if (cardEl) cardEl.setAttribute('data-w', g === 'wolf' ? 'menu' : (g === 'sword' ? 'arena' : (g === 'motorways' ? 'motorways' : (g === 'bangbang' ? 'bangbang' : (g === 'played' ? 'played' : '')))));
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

    // Tự kết nối lại: ping nhẹ mỗi 10s khi tab đang hiện. Đang đấu online thì KHÔNG tự tải lại.
    var st = document.getElementById('st');
    setInterval(function () {
      if (document.hidden) return;
      fetch(location.pathname + location.search, { method: 'HEAD', cache: 'no-store' })
        .then(function (r) {
          if (r.status < 500) {
            if (pool.busy() || caro.busy() || sword.busy() || wolf.busy() || played.busy() || bangbang.busy()) {
              st.textContent = 'Server đã sống lại! Chơi xong ván rồi bấm Tải lại trang nhé.';
            } else {
              st.textContent = 'Đã kết nối lại! Đang tải trang...';
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
  </script>
</body>
</html>`;
