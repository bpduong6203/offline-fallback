# TÀI LIỆU ĐẶC TẢ THIẾT KẾ & KỸ THUẬT GAME 2048 TRÊN TRANG CHỦ FALLBACK
## (GAME 2048 HOMEPAGE & IN-TAB SPECIFICATION)

> **Mục tiêu**: Tích hợp mini-game **2048** trực tiếp vào màn hình trang chủ chờ (`/`) của `offline-fallback`, hoạt động dưới dạng một thẻ tab nguyên bản tương tự như **Caro** và **Flappy Bug**. Người dùng có thể bấm tab và chơi ngay tức thì trên cùng một thẻ Canvas `<canvas id="g">`, điều khiển mượt mà bằng vuốt cảm ứng hoặc phím bấm, hỗ trợ chơi đơn, đua thời gian, chướng ngại vật, đối kháng 1v1 online và tích lũy phần thưởng **Hộp trứng** Mebi Farm.

---

## 1. TỔNG QUAN KIẾN TRÚC TRANG HOME (HOMEPAGE ARCHITECTURE)

### 1.1. Cách Thức Hoạt Động Của Trang Fallback Hiện Tại
Trang fallback (`worker.js` trả về HTML từ `src/page/render.js` và `src/page/body.js`):
1. Thư viện game dạng thẻ tab: `<nav class="tabs">` gồm Flappy, Caro, Ma sói, YOU GOT PLAYED, Mini Motorways, Bang Bang,...
2. Khu vực hiển thị trò chơi trung tâm:
   - Khung thẻ `#gameBox` chứa phần tử Canvas duy nhất: `<canvas id="g"></canvas>`.
   - Các game Canvas (Flappy, Caro, Pool, Sword) dùng chung Canvas `#g` và vòng lặp `requestAnimationFrame` chung trong `src/page/client/core.js`.
   - Giao diện phụ trợ dạng DOM nổi bên dưới Canvas (ví dụ `#caroui`, `#poolui`) dùng để chọn chế độ: Đấu với máy / Chơi đơn, Tạo phòng, Nhập mã phòng, nút Thoát về menu và dòng thông báo trạng thái.
3. Cơ chế tự động khôi phục kết nối thông minh:
   - Trang fallback kiểm tra trạng thái máy chủ gốc (origin) mỗi 10 giây bằng request `HEAD`.
   - Nếu máy chủ đã phục hồi nhưng người chơi đang ở trong ván game bận (`cur.busy() === true`), trang **sẽ không tự reload** để tránh làm mất ván chơi của người dùng, mà hiển thị thông báo để người dùng chủ động tải lại sau khi kết thúc ván.

```
+---------------------------------------------------------------------------------+
|  [offline.example.com]                                                          |
|  Máy chủ local chưa bật 🐞                                                      |
|  Giúp con bug bay qua các tủ máy chủ... hoặc giải trí cùng 2048 trong lúc chờ...|
|                                                                                 |
|  CHỌN GAME: [Flappy] [Caro] [🐺 Ma sói] [🔢 2048 (MỚI!)] [YOU GOT PLAYED] ...   |
|                                                                                 |
|  +---------------------------------------------------------------------------+  |
|  |  CANVAS #g (480 x 480) - RENDER TRỰC TIẾP TRÊN TRANG HOME                |  |
|  |  +---------------------------------------------------------------------+  |  |
|  |  |  2048 MEBI FARM      ĐIỂM: 2048  •  KỶ LỤC: 15420  •  HỘP TRỨNG: 12 📦|  |  |
|  |  |  +---------------+  +---------------+  +---------------+            |  |  |
|  |  |  |   2  🥚       |  |   4  🥚       |  |   8  🌸       |   ...      |  |  |
|  |  |  +---------------+  +---------------+  +---------------+            |  |  |
|  |  |  |   16 📦       |  |   32 📦       |  |   64 🍱       |   ...      |  |  |
|  |  |  +---------------+  +---------------+  +---------------+            |  |  |
|  |  |  |   128 🐣      |  |   256 🐓      |  |   512 👑      |   ...      |  |  |
|  |  |  +---------------+  +---------------+  +---------------+            |  |  |
|  |  |  |   1024 🏡     |  |   2048 🏆     |  |   (Trống)     |   ...      |  |  |
|  |  |  +---------------+  +---------------+  +---------------+            |  |  |
|  |  +---------------------------------------------------------------------+  |  |
|  +---------------------------------------------------------------------------+  |
|                                                                                 |
|  GIAO DIỆN PHỤ TRỢ #game2048ui (TƯƠNG TỰ #caroui):                              |
|  [ 🔄 Ván Mới ]  [ ↩ Hoàn Tác ]  [ 🎨 Đổi Theme: Trứng Hồng 🥚 ]  [ ⚙️ 4x4 v ]  |
|  [ 🎮 Chơi Đơn ]  [ ⏱️ Đua 60s ]  [ 🧱 Chướng Ngại ]  [ ⚔️ Tạo Phòng Online ]   |
|  [ Mã Phòng: [____] ] [ Vào Phòng ]                                             |
|  Thông báo: Dùng phím mũi tên/WASD hoặc vuốt ngón tay để trượt các ô số.        |
+---------------------------------------------------------------------------------+
```

### 1.2. Định Vị 2048 Trong Hệ Thống Fallback
- **Chơi ngay tại chỗ (In-Tab Playability)**: Người dùng bấm vào nút tab `🔢 2048` là bàn cờ hiển thị ngay lập tức trên canvas `#g`, không chuyển trang, không mở popup, không tải lại trang.
- **Tiêu chuẩn tài nguyên 0-byte phụ thuộc**: Mã nguồn được gói thành module `src/page/client/game-2048.js` và nối trực tiếp vào script client trong `src/page/render.js`.
- **Bảo toàn trạng thái khi rớt mạng**: Tự động lưu bàn cờ hiện tại và điểm số vào `localStorage`. Khi tab trình duyệt active trở lại hoặc chuyển đổi qua lại giữa các tab game (Flappy $\leftrightarrow$ 2048 $\leftrightarrow$ Caro), ván chơi vẫn được giữ nguyên.
- **Bảo vệ ván đấu khi mạng hồi phục (`busy`)**: Phương thức `busy()` trả về `true` khi đang có ván chơi dở dang với điểm số $> 0$, giúp trang hoãn tự động reload và hiển thị thông báo thân thiện.

---

## 2. QUY TẮC & CƠ CHẾ CHƠI CHI TIẾT (CORE GAME MECHANICS)

### 2.1. Cấu Trúc Lưới Bàn Cờ
- Kích thước hiển thị: Canvas nội bộ $480 \times 480\text{px}$, tự động co giãn sắc nét theo CSS responsive của `#gameBox`.
- Kích thước lưới ma trận:
  - **4x4 (Mặc định)**: Cân bằng, chuẩn mực quốc tế.
  - **3x3**: Chế độ thử thách giải đố hẹp cực khó.
  - **5x5**: Chế độ thư giãn, bàn rộng, gộp điểm cực lớn.

### 2.2. Cơ Chế Trượt & Gộp Ô (Slide & Merge Rules)
Mỗi lượt vuốt hoặc bấm phím theo 4 hướng: **Lên (Up)**, **Xuống (Down)**, **Trái (Left)**, **Phải (Right)**.

1. **Dồn hàng triệt để**:
   - Tất cả các ô có số sẽ trượt dồn về phía mép theo hướng di chuyển cho đến khi chạm cạnh bàn cờ hoặc bị cản bởi ô khác.
2. **Quy tắc gộp đơn (Single-Merge Rule - Tuyệt đối không gộp 2 lần trong 1 lượt)**:
   - Hai ô kề nhau có cùng giá trị $X$ va chạm sẽ gộp thành một ô mới có giá trị $2X$.
   - **Quy tắc bất biến**: Ô vừa được tạo thành từ một vụ gộp trong lượt đó **KHÔNG ĐƯỢC PHÉP** tiếp tục gộp với một ô nào khác trong cùng một lượt di chuyển.
   - *Ví dụ*: Hàng ngang `[2, 2, 2, 2]` khi trượt sang **Trái** sẽ ra `[4, 4, 0, 0]`, tuyệt đối **không** được gộp thành `[8, 0, 0, 0]`.
   - *Ví dụ*: Hàng `[2, 2, 4, 8]` khi trượt sang **Trái** sẽ ra `[4, 4, 8, 0]`.
3. **Thứ tự ưu tiên gộp**:
   - Ưu tiên các ô nằm sát mép theo chiều hướng trượt (hướng Trái duyệt từ cột 0 sang cột $N-1$; hướng Phải duyệt từ cột $N-1$ về 0; hướng Lên duyệt từ hàng 0 xuống hàng $N-1$; hướng Xuống duyệt từ hàng $N-1$ lên 0).

### 2.3. Quy Tắc Sinh Ô Mới (Tile Spawning)
- Sau khi thực hiện lệnh trượt:
  - Nếu bàn cờ **có sự dịch chuyển hoặc có vụ gộp**: Hệ thống ngẫu nhiên chọn **1 ô trống** để sinh ô mới.
    - **90%** xác suất xuất hiện ô số **2**.
    - **10%** xác suất xuất hiện ô số **4**.
  - Nếu thao tác trượt **không làm thay đổi trạng thái bàn cờ**: Không sinh ô mới và không tính lượt đi.

### 2.4. Tính Điểm & Cơ Chế Combo Đa Gộp (Scoring & Combo)
- **Điểm cơ bản**: Mỗi lần gộp thành công ô $2X$, người chơi nhận thêm $+2X$ điểm:
  $$\Delta \text{Score} = 2X$$
  *(Gộp hai ô 2 thành 4: $+4$ điểm; gộp hai ô 1024 thành 2048: $+2048$ điểm)*.
- **Hệ số nhân Combo**: Nếu trong 1 cú trượt gộp được nhiều cặp cùng lúc:
  - 2 cặp gộp: **Double Merge** $\to$ Thưởng $+20\%$ điểm gộp (`x1.2`).
  - 3 cặp gộp: **Triple Merge** $\to$ Thưởng $+50\%$ điểm gộp (`x1.5`).
  - 4 cặp trở lên: **Mega Chain** $\to$ Thưởng gấp đôi điểm (`x2.0`) kèm hiệu ứng rung màn hình và âm thanh hợp âm.
- **Tích Lũy Hộp Trứng (Mebi Egg Currency)**:
  - Cứ mỗi **500 điểm** ghi được trong game, người chơi sẽ tự động được cộng **1 Hộp Trứng** vào quỹ điểm chung của trình duyệt (`localStorage.getItem('egg_currency_balance')`), đồng bộ với hệ thống kinh tế mini-game (Tiến Lên Miền Nam).

### 2.5. Điều Kiện Thắng & Thua
- **Chiến Thắng (Win)**:
  - Xuất hiện ngay khi ô **2048** được tạo thành lần đầu tiên.
  - Canvas kích hoạt hiệu ứng pháo giấy rực rỡ và chuỗi hợp âm khải hoàn, kèm bảng lựa chọn:
    - **Tiếp tục (Endless)**: Tiếp tục chơi để chinh phục mốc 4096, 8192, 16384,...
    - **Ván mới (Restart)**: Khởi tạo lại bàn cờ mới.
- **Thất Bại (Game Over)**:
  - Khi bàn cờ không còn ô trống VÀ không còn bất kỳ 2 ô liền kề nào (theo cả chiều ngang và dọc) có cùng giá trị để gộp.
  - Hiển thị màn phủ mờ Game Over trên Canvas cùng tổng điểm và nút "Chạm để thử lại".

### 2.6. Tính Năng Hoàn Tác (Undo System)
- Hỗ trợ lưu trữ ngăn xếp **5 bước đi gần nhất**.
- Nút "Hoàn tác ↩" trong `#game2048ui` cho phép quay lại trạng thái bàn cờ và điểm số trước đó khi lỡ tay vuốt nhầm.

---

## 3. CÁC CHẾ ĐỘ CHƠI TÍCH HỢP TRÊN TRANG HOME

```mermaid
graph TD
    A[Tab 2048 Trên Trang Home] --> B[Chơi Đơn Cổ Điển (Solo Classic)]
    A --> C[Đua Thời Gian (Time Rush 60s)]
    A --> D[Chướng Ngại Vật (Obstacle Mode)]
    A --> E[Đối Kháng 1v1 Online (PvP Room)]
    
    B --> B1[Lưu trạng thái localStorage tự động]
    C --> C1[Gộp ô lớn được cộng thêm giây]
    D --> D1[Khối đá cố định chặn đường trượt]
    E --> E1[Kết nối WebSocket qua Durable Object]
    E --> E2[Bắn ô đóng băng/ô rác sang đối thủ]
```

1. **Chế độ 1: Chơi Đơn Cổ Điển (Solo Classic)**:
   - Thư giãn, tự do tính toán, hỗ trợ hoàn tác, tự động lưu tiến trình khi tắt/bật tab.
2. **Chế độ 2: Đua Thời Gian (Time Rush 60 Giây)**:
   - Thanh thời gian rút dần trên đỉnh bàn cờ Canvas.
   - Gộp ô từ 32 trở lên được cộng thêm thời gian: ô 32 ($+1\text{s}$), ô 128 ($+2\text{s}$), ô 512 ($+4\text{s}$), ô 1024 ($+8\text{s}$).
3. **Chế độ 3: Chướng Ngại Vật (Obstacle Mode)**:
   - Bàn cờ xuất hiện 1 hoặc 2 khối đá Granite cố định không thể dịch chuyển hay gộp, thử thách khả năng luồn lách.
4. **Chế độ 4: Đối Kháng 1v1 Online (PvP Room Duel)**:
   - Cơ chế tương tự Caro (`#cCreate`, `#cJoin`, `#cCode`): Một người tạo phòng nhận mã 4 ký tự, người thứ hai nhập mã để tham gia.
   - Bàn cờ Canvas chia khung: Bàn cờ của bạn ở trung tâm; góc trên hiển thị bàn cờ thu nhỏ (mini ghost board) của đối thủ.
   - Khi gộp ô $\ge 128$: Bắn 1 ô rác hoặc đóng băng 1 ô ngẫu nhiên của đối thủ trong 3 lượt di chuyển!

---

## 4. HỆ THỐNG GIAO DIỆN & BỘ CHỦ ĐỀ VẼ BẰNG CANVAS

Tất cả các chi tiết đồ họa được vẽ trực tiếp bằng Canvas 2D (`CanvasRenderingContext2D`), đảm bảo tốc độ khung hình tối đa mà không tốn tài nguyên DOM:

### 4.1. Bộ 4 Chủ Đề (Themes) Có Thể Chuyển Đổi Nhanh
Người chơi có thể bấm nút **"Đổi Theme"** trong `#game2048ui` để chuyển đổi qua lại:

1. **Mebi Farm Pinky Egg (Chủ đề Trứng Hồng Mebi Farm - Mặc định)**:
   - Nền bàn cờ màu gỗ nông trại ấm áp bo góc tròn mềm mại.
   - Mỗi ô số đi kèm hình ảnh quả trứng ngộ nghĩnh và tên cấp độ:
     - **2**: 🥚 Trứng gà so
     - **4**: 🥚 Trứng gà thảo mộc
     - **8**: 🌸 Trứng hồng Mebi Farm
     - **16**: 📦 Vỉ 4 quả trứng tươi
     - **32**: 📦 Hộp 6 quả dinh dưỡng
     - **64**: 🍱 Hộp 10 trứng thượng hạng
     - **128**: 🐣 Gà con lông vàng
     - **256**: 🐓 Gà tre dũng mãnh
     - **512**: 👑 Gà mái đẻ trứng vàng
     - **1024**: 🏡 Chuồng trại IoT Mebi Smart
     - **2048**: 🏆 Trang trại Mebi Farm Đại Thắng!
2. **Classic Elegance (Cổ điển)**:
   - Tông màu kem ấm `#faf8ef`, khung lưới nâu sô cô la `#bbada0`, các ô số màu pastel thanh lịch nguyên bản.
3. **Cyberpunk Dark Neon (Dạ quang tương lai)**:
   - Nền đen sâu thẳm `#0d0f18`, viền lưới ma trận phát sáng neon (Cyan `#00f3ff`, Magenta `#ff007f`), chữ số dạng font điện tử.
4. **Retro Arcade 8-Bit (Game thùng cổ điển)**:
   - Nét vẽ pixel sắc cạnh, màu sắc tương phản mạnh phong cách thập niên 90.

### 4.2. Hoạt Họa Canvas (Canvas Motion & Animation)
- **Nội suy chuyển động trượt (Sliding Lerp)**:
  - Mỗi ô lưu tọa độ thực tế `(curX, curY)` và tọa độ đích `(targetX, targetY)`.
  - Trong mỗi khung hình `update(dt)`, tọa độ thực tế dịch chuyển dần về đích theo công thức nội suy mượt:
    $$\text{curX} = \text{curX} + (\text{targetX} - \text{curX}) \times (1 - e^{-25 \times dt})$$
- **Hiệu ứng bung nở khi xuất hiện (Spawn Pop)**: Ô mới xuất hiện bung từ scale $0.0 \to 1.0$ trong 120ms.
- **Hiệu ứng nảy phóng to khi gộp (Merge Pulse)**: Ô vừa gộp nở to $1.25$ lần rồi co về kích thước chuẩn trong 150ms.
- **Pháo hoa giấy khi đạt 2048 (Confetti Particle)**: Bắn các hạt pháo ngũ sắc rực rỡ từ đáy canvas lên không trung.

---

## 5. ÂM THANH THUẦN TỔNG HỢP (WEB AUDIO API TÍCH HỢP)

Dùng chung hệ thống âm thanh Web Audio API độc lập, không tải bất kỳ file âm thanh ngoài:
- **Âm thanh Trượt (Slide)**: Tần số quét ngắn $160\text{Hz} \to 80\text{Hz}$ trong $50\text{ms}$ tạo tiếng lướt êm dịu.
- **Âm thanh Gộp Ô (Pentatonic Chime)**: Chuỗi nốt ngũ cung C Major tăng dần cao độ theo giá trị ô (ô 4: C4, ô 8: D4, ô 16: E4, ô 32: G4, ô 64: A4, ô 128: C5,... ô 2048: Hợp âm C Major Arpeggio rải nốt rực rỡ).
- **Phản hồi rung di động (Haptic Feedback)**: Kích hoạt `navigator.vibrate(12)` khi gộp ô thông thường và `navigator.vibrate([30, 40, 50])` khi đạt mốc 2048.

---

## 6. ĐIỀU KHIỂN & TƯƠNG TÁC NGƯỜI DÙNG TRÊN TRANG HOME

### 6.1. Phương Thức Điều Khiển
1. **Thao tác chạm / Vuốt trên Canvas (Touch Gestures)**:
   - Lắng nghe trực tiếp trên Canvas `#g` qua các hàm `down(px, py, pointerType)`, `move()`, `up()`.
   - Tính toán vector vuốt $\Delta X, \Delta Y$ khi người dùng nhấc tay lên:
     - Ngưỡng vuốt tối thiểu: $25\text{px}$.
     - Nếu $|\Delta X| > |\Delta Y|$: Vuốt Ngang (Trái / Phải).
     - Nếu $|\Delta Y| \ge |\Delta X|$: Vuốt Dọc (Lên / Xuống).
2. **Bàn phím máy tính**:
   - Khi tab `2048` đang active, sự kiện `keydown` trên trang tự động chuyển tới `cur.keyDown(e)`:
     - Phím mũi tên: `ArrowUp`, `ArrowDown`, `ArrowLeft`, `ArrowRight`.
     - Phím WASD: `KeyW`, `KeyA`, `KeyS`, `KeyD`.
     - Phím Vim: `KeyK`, `KeyJ`, `KeyH`, `KeyL`.
     - Phím tắt: `KeyU` (Hoàn tác), `KeyR` (Chơi lại ván mới).
3. **Chuột máy tính**:
   - Nhấn giữ chuột trái và kéo lướt trên mặt bàn cờ Canvas để trượt các ô.

---

## 7. ĐẶC TẢ TÍCH HỢP VÀO MÃ NGUỒN REPO

### 7.1. Cấu Trúc File Triển Khai
Các thay đổi được tích hợp trực tiếp vào hệ thống hiện có của `offline-fallback`:

```
offline-fallback/
├── src/
│   ├── page/
│   │   ├── body.js                  # Thêm button tab 2048 và khối giao diện #game2048ui
│   │   ├── render.js                # Ghép chuỗi client2048 vào script bundle của trang fallback
│   │   ├── style-base.js            # Thêm CSS cho khối #game2048ui
│   │   └── client/
│   │       ├── main.js              # Đăng ký games['2048'] và xử lý chuyển tab switchTo('2048')
│   │       └── game-2048.js         # Toàn bộ logic, engine, renderer và sound của game 2048
│   ├── 2048-room-engine.js          # Xử lý phòng đối kháng 1v1 online (seed ngẫu nhiên, tấn công)
│   └── 2048-room.js                 # Cloudflare Durable Object TwoZeroFourEightRoom
└── tests/
    ├── 2048-engine.test.mjs         # Unit test kiểm tra logic trượt, gộp, điểm số, undo
    └── 2048-home-browser.test.mjs   # Test kiểm tra click tab 2048 trên trang home bằng CDP
```

### 7.2. Tích Hợp Giao Diện HTML Trong `src/page/body.js`
1. Thêm nút tab vào thanh điều hướng:
   ```html
   <button class="tab" data-g="2048" aria-pressed="false">🔢 2048</button>
   ```
2. Thêm khối giao diện điều khiển `#game2048ui` bên dưới Canvas:
   ```html
   <div class="poolui" id="game2048ui" hidden>
     <div id="g2048Menu">
       <div class="row">
         <button class="mini" id="g2048New">Ván mới</button>
         <button class="mini" id="g2048Undo">Hoàn tác ↩</button>
         <button class="mini" id="g2048Theme">Đổi Theme 🥚</button>
         <button class="mini" id="g2048Mode">Chế độ: Đơn</button>
       </div>
       <div class="row" id="g2048OnlineRow">
         <button class="mini" id="g2048Create">Tạo phòng</button>
         <input id="g2048Code" maxlength="4" placeholder="MÃ PHÒNG" autocomplete="off">
         <button class="mini" id="g2048Join">Vào phòng</button>
       </div>
     </div>
     <button class="mini" id="g2048Back" hidden style="width:100%;margin-bottom:8px">Thoát về chơi đơn</button>
     <div class="pmsg" id="g2048Msg"></div>
   </div>
   ```

### 7.3. Giao Diện Đối Tượng Game Trong `src/page/client/game-2048.js`
Đối tượng `game2048` tuân thủ chuẩn interface của hệ thống trang fallback:

```javascript
export const client2048 = `    // ===================== GAME 2048 =====================
    var game2048 = (function () {
      var CW = 480, CH = 480;
      var grid = [], score = 0, best = 0, history = [];
      var state = 'play', mode = 'solo', themeIdx = 0;
      var touchStart = null;

      // Khởi tạo bàn cờ, đọc kỷ lục từ localStorage
      function reset() { ... }

      // Trượt các ô số và gộp điểm
      function slide(dir) { ... }

      // Cập nhật hoạt họa mượt mà
      function update(dt) { ... }

      // Vẽ bàn cờ, các ô số, icon Mebi Farm lên Canvas context x
      function draw() { ... }

      // Xử lý vuốt cảm ứng
      function down(px, py) { touchStart = { x: px, y: py }; }
      function up(px, py) {
        if (!touchStart) return;
        var dx = px - touchStart.x, dy = py - touchStart.y;
        if (Math.abs(dx) > 25 || Math.abs(dy) > 25) {
          if (Math.abs(dx) > Math.abs(dy)) slide(dx > 0 ? 1 : 3); // Phải : Trái
          else slide(dy > 0 ? 2 : 0); // Xuống : Lên
        }
        touchStart = null;
      }

      // Xử lý phím mũi tên / WASD
      function keyDown(e) {
        if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') slide(0);
        else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') slide(1);
        else if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') slide(2);
        else if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') slide(3);
        else if (e.key === 'u' || e.key === 'U') undo();
        else if (e.key === 'r' || e.key === 'R') reset();
      }

      return {
        w: CW, h: CH,
        hint: 'Dùng phím mũi tên, WASD hoặc vuốt để trượt và gộp ô. Cứ 500 điểm nhận 1 Hộp trứng.',
        update: update,
        draw: draw,
        down: down,
        up: up,
        keyDown: keyDown,
        leave: function () { /* Dừng âm thanh/lưu game */ },
        busy: function () { return state === 'play' && score > 0; }
      };
    })();
`;
```

### 7.4. Đăng Ký Trong `src/page/client/main.js`
Trong hàm `switchTo(g)`:
- Thêm `game2048` vào đối tượng `games`: `var games = { flappy: flappy, pool: pool, caro: caro, ..., 2048: game2048 };`
- Ẩn/hiện khối giao diện phụ trợ:
  ```javascript
  document.getElementById('game2048ui').hidden = (g !== '2048');
  ```

---

## 8. CHI TIẾT CÁC BƯỚC TRIỂN KHAI (IMPLEMENTATION STEPS)

1. **Bước 1**: Xây dựng module client [src/page/client/game-2048.js](file:///d:/repos/offline-fallback/src/page/client/game-2048.js) chứa toàn bộ logic trượt, gộp ô, hệ thống âm thanh Web Audio và thuật toán vẽ Canvas 2D theo chủ đề Mebi Farm.
2. **Bước 2**: Cập nhật [src/page/body.js](file:///d:/repos/offline-fallback/src/page/body.js) để bổ sung tab `🔢 2048` và khối DOM điều khiển phụ `#game2048ui`.
3. **Bước 3**: Cập nhật [src/page/render.js](file:///d:/repos/offline-fallback/src/page/render.js) để import và nối chuỗi `client2048` vào script bundle của trang fallback.
4. **Bước 4**: Cập nhật [src/page/client/main.js](file:///d:/repos/offline-fallback/src/page/client/main.js) để kích hoạt chuyển tab mượt mà sang `2048`, xử lý phím bấm và quản lý trạng thái `busy()`.
5. **Bước 5**: Thêm các bài Unit Test trong [tests/2048-engine.test.mjs](file:///d:/repos/offline-fallback/tests/2048-engine.test.mjs) kiểm tra độ chính xác của logic trượt, gộp và tính điểm.
6. **Bước 6**: Chạy dev server bằng lệnh `node scripts/local-server.mjs` và kiểm thử tự động bằng script headless browser trên Microsoft Edge/Chrome để nghiệm thu hình ảnh hiển thị thực tế trên trang chủ.
