# Offline Fallback Games

Cloudflare Worker hiển thị trang chờ kèm mini game khi máy chủ gốc (origin), máy chủ local hoặc Cloudflare Tunnel không truy cập được. Người dùng có thể chơi trong lúc chờ kết nối khôi phục; các phòng online được Worker xử lý độc lập với origin.

## Cách hoạt động

Worker trong `worker.js` xử lý request theo thứ tự:

1. Phục vụ trực tiếp các trang game có đường dẫn riêng.
2. Chuyển kết nối `/__game/ws` đến Durable Object tương ứng với game và mã phòng.
3. Chuyển các request còn lại đến origin bằng `fetch(request)`.
4. Khi fetch thất bại hoặc origin trả một trong các mã `502`, `503`, `504`, `521`, `522`, `523`, `524`, `530`, trả trang fallback.

Trang fallback trả HTTP **503**, kèm `Retry-After: 10`. Chỉ request `GET` có `Accept: text/html` nhận giao diện HTML; request API, ảnh và tài nguyên khác nhận thông báo 503 dạng văn bản để tránh trả HTML sai định dạng.

Trang chờ kiểm tra lại kết nối bằng request `HEAD` mỗi 10 giây khi tab đang hiển thị. Khi nhận trạng thái dưới 500, trang tự tải lại, hoặc thông báo để người dùng tải lại sau nếu đang ở một ván được đánh dấu bận. Các trang game riêng hoạt động độc lập với cơ chế tải lại của trang chờ.

## Các game trong repo

| Game | Cách truy cập | Ghi chú |
| --- | --- | --- |
| Flappy Bug | Tab Flappy trên trang chờ | Mini game Canvas |
| Mini Motorways | Tab trên trang chờ hoặc `/__game/mini-motorways` | Trang HTML riêng, được nhúng bằng iframe |
| Ma sói | Tab trên trang chờ | Phòng online 5–12 người, server quản lý vai trò và luật chơi |
| YOU GOT PLAYED | Tab trên trang chờ | Game Canvas, có điều khiển cảm ứng |
| Bomb Arena | Liên kết trên trang chờ hoặc `/__game/bomb-arena` | Đấu bot, hai người cùng bàn phím hoặc phòng online 2–4 người |
| Bi-a, Caro, Đấu kiếm | Có source trong `src/page/client/` | Nút chọn game hiện được comment trong `src/page/body.js` |

## Yêu cầu và cài đặt

- Node.js 20 trở lên và npm để chạy script local, build và test.
- Wrangler để chạy Worker và Durable Objects trong môi trường phát triển Cloudflare.
- Tài khoản Cloudflare có quyền với Worker, Durable Objects và zone được cấu hình khi triển khai.
- Chrome nếu chạy kiểm tra trình duyệt tự động.

Tại thư mục gốc repo:

```sh
npm install
```

Trên PowerShell, có thể dùng `npm.cmd` và `npx.cmd` nếu execution policy chặn các script `.ps1`.

## Chạy dự án

### Worker và trang fallback

```sh
npm run build
npx wrangler dev
```

Mở địa chỉ do Wrangler in ra. Cách này chạy entry `worker.js`, các route game và binding Durable Objects trong môi trường phát triển. Wrangler hiện chưa được khai báo trong `package.json`; lệnh `npx` có thể yêu cầu tải công cụ khi máy chưa có.

Trang fallback chỉ xuất hiện khi request đến origin thất bại hoặc trả mã lỗi được liệt kê ở trên. Hai trang `/__game/mini-motorways` và `/__game/bomb-arena` được Worker phục vụ trực tiếp. Việc chạy local không thay thế kiểm tra tuyến Worker và kết nối origin trên Cloudflare thật.

### Server phát triển Bomb Arena

Repo có server Node riêng để phát triển nhanh Bomb Arena và phòng WebSocket của game:

```sh
npm run dev
```

Mở **http://localhost:5173**. Server build lại game mỗi lần tải trang; dùng cùng room engine với Worker để xử lý trận online. Server này chỉ phục vụ Bomb Arena và WebSocket của game, không chạy trang fallback, các game khác hoặc runtime Durable Objects.

Mặc định server lắng nghe `0.0.0.0`. Các thiết bị cùng mạng LAN truy cập `http://<IP-máy-chạy-server>:5173`; cần cho phép kết nối qua firewall của máy chạy server nếu bị chặn.

Ví dụ giới hạn truy cập trong máy và đổi cổng bằng PowerShell:

```powershell
$env:HOST = '127.0.0.1'
$env:PORT = '5174'
npm.cmd run dev
```

## Route và phòng online

| Route | Chức năng |
| --- | --- |
| `/__game/mini-motorways` | Phục vụ HTML Mini Motorways |
| `/__game/bomb-arena` | Phục vụ Bomb Arena; hỗ trợ GET và HEAD |
| `/__game/ws?g=<game>&room=<code>` | Kết nối phòng WebSocket |
| Các đường dẫn còn lại | Chuyển đến origin, trả fallback khi origin gặp lỗi phù hợp |

Mã phòng WebSocket gồm 4 chữ cái hoặc chữ số, được chuẩn hóa thành chữ hoa. Router kiểm tra Origin của kết nối khi header này có mặt.

| Giá trị `g` | Binding | Class | Vai trò |
| --- | --- | --- | --- |
| `pool`, `caro`, `sword` | `POOL` | `PoolRoom` | Chuyển tiếp tin nhắn giữa hai người |
| `wolf` | `WOLF` | `WolfRoom` | Quản lý phòng và luật Ma sói |
| `bomb` | `BOMB` | `BombRoom` | Quản lý phòng tối đa 4 người và mô phỏng trận Bomb Arena |

Các phòng hiện không có cơ chế lưu và khôi phục trận xuyên suốt khi instance bị khởi động lại hoặc mất kết nối. Với Bomb Arena, người rời giữa trận bị loại, quyền chủ phòng được chuyển cho người còn lại; phòng kết thúc khi tất cả rời.

### Chơi Bomb Arena

- Bản đồ 21×15 ô, giao diện tông cam và font hệ thống. Mỗi thùng có 38% khả năng rơi vật phẩm; trong số vật phẩm rơi ra, buff tốc độ chiếm 50% (tương đương 19% mỗi thùng).
- Tốc độ chạy cơ bản 4,2 ô/giây, tăng bằng buff tới tối đa 6,6 ô/giây. Tự căn vào lối đi khi rẽ gần góc. Người chơi và bot có thể đi xuyên ô bom; tường và thùng vẫn chặn đường, lửa bom vẫn gây sát thương.
- **Local:** P1 dùng WASD + Space; P2 dùng phím mũi tên + Enter. Esc tạm dừng/tiếp tục. Có bot, ba độ khó và ba theme bản đồ.
- **Mobile:** D-pad và nút đặt bom, hỗ trợ nhấn đồng thời; tùy chọn hai người cùng bàn phím được ẩn trên thiết bị con trỏ cảm ứng.
- **Online:** nhập tên, bấm **Tạo phòng**, gửi mã cho bạn bè. Người khác nhập mã và bấm **Vào**. Chủ phòng chọn bản đồ, bắt đầu khi có 2–4 người và có thể chơi lại sau khi kết thúc. Mỗi người dùng WASD + Space hoặc điều khiển cảm ứng trên thiết bị của mình.
- **Luật chính:** bom nổ sau 2,5 giây, gây sát thương theo dấu cộng và kích nổ dây chuyền. Phá thùng để nhặt thêm bom, tầm nổ, tốc độ hoặc khiên. Ván kéo dài 180 giây; người sống cuối thắng, hết giờ còn nhiều người hoặc cùng bị loại thì hòa.
- **Online chạy liên tục:** đổi tab chỉ xóa input của người đó, không tạm dừng cả phòng. Server xử lý luật chơi ở 60 Hz, gửi trạng thái khoảng 20 Hz; client nội suy hình ảnh.

## Build và kiểm tra

| Lệnh | Phạm vi |
| --- | --- |
| `npm run dev` | Server Node cho Bomb Arena và phòng online local |
| `npm run build` | Đóng gói Bomb Arena thành HTML độc lập và module để Worker import |
| `npm test` | Test logic game, phòng online và một số route Worker |
| `npm run test:browser` | Kiểm tra Bomb Arena trong Chrome headless, gồm local, mobile giả lập và phòng online |

Build tạo:

- `dist/index.html`: trang Bomb Arena độc lập.
- `src/page/games/bomb-arena.generated.js`: module được Worker import và được lưu trong repo.

Sau khi sửa `bomb-arena/`, chạy lại build. Chỉnh source thay vì sửa trực tiếp file generated. Các phần giao diện fallback được ghép trực tiếp từ module trong `src/page/`; lệnh build hiện không đóng gói lại toàn bộ repo.

Kiểm tra trình duyệt mặc định tìm Chrome trên Windows. Có thể đặt biến môi trường `CHROME_PATH` để chỉ định executable khác. Script dùng profile tạm, tắt sandbox nội bộ Chrome để tương thích môi trường chạy hạn chế và lưu ảnh kiểm tra trong `dist/`.

Phạm vi kiểm tra hiện có:

- Luật bom, collision, vật phẩm, khiên, kết quả thắng/hòa và mô phỏng bot.
- Phòng online: giới hạn người, quyền chủ phòng, input, chuyển chủ phòng và kết nối WebSocket thực.
- Route Worker được kiểm tra bằng Node, với HTML import được chuyển trong bộ nhớ để tương thích Node.
- Chrome: điều khiển local, tạm dừng, chơi lại, tỷ lệ Canvas và cảm ứng giả lập; bốn trang độc lập tạo/vào phòng, bắt đầu, đặt bom đồng bộ và chuyển chủ phòng.

Các kiểm tra này chưa bao phủ toàn bộ game cũ, runtime Cloudflare thật, kết nối WAN, âm thanh hoặc nhiều thiết bị vật lý.

## Cấu hình và triển khai Cloudflare

`wrangler.toml` khai báo:

- Worker `offline-fallback`, entry `worker.js`.
- Route `*.mebidev.site/*` thuộc zone `mebidev.site`.
- Binding `POOL`, `WOLF`, `BOMB`.
- Migration `v1` cho `PoolRoom`, `v2` cho `WolfRoom`, `v3` cho `BombRoom`.

Trước khi triển khai sang môi trường của bạn, kiểm tra tên Worker, zone và route phù hợp với origin/Tunnel. Giữ các migration đã áp dụng và bổ sung migration mới khi cần thay đổi Durable Objects.

Khi chủ động triển khai:

```sh
npm run build
npx wrangler deploy
```

Lệnh deploy đưa cả Worker và cấu hình Durable Objects lên Cloudflare. Repo không có bước tự deploy trong các npm script. Để phòng Bomb Arena hoạt động trên Cloudflare, bản triển khai phải bao gồm binding `BOMB` và migration `v3`.

## Cấu trúc thư mục

```text
offline-fallback/
├── worker.js                    # Entry Worker, route trực tiếp và fallback
├── wrangler.toml                # Route Cloudflare, binding và migration
├── src/
│   ├── game-socket.js           # Router WebSocket theo game/mã phòng
│   ├── pool-room.js             # Phòng chuyển tiếp cho game hai người
│   ├── wolf/                   # Engine và phòng Ma sói
│   ├── bomb-room-engine.js      # Phòng và mô phỏng server Bomb Arena
│   ├── bomb-room.js             # Adapter Durable Object Bomb Arena
│   └── page/
│       ├── render.js           # Ghép HTML và trả response fallback
│       ├── head.js, body.js    # Nội dung trang chờ
│       ├── style-*.js          # CSS giao diện và game
│       ├── client/             # Script trình duyệt của các mini game
│       └── games/              # Trang game riêng và module generated
├── bomb-arena/                 # Source game Canvas, UI, audio và network
├── scripts/                    # Build, server local và kiểm tra Chrome
├── tests/                      # Test logic và route
├── package.json
└── README.md
```

Nhiều module trong `src/page/` chứa HTML/CSS/JavaScript bên trong template literal để ghép response. Khi chỉnh các module này, chú ý escape backtick và nội suy `${...}` để tránh thay đổi hoặc làm hỏng script được gửi xuống trình duyệt.
