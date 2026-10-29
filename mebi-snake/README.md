# MebiRắn.io

Game rắn online thật tại **`/snake`**, Canvas 2D + WebSocket, thêm vào Worker hiện có. Không bot, không tài khoản, không lobby/ready. Không dùng server hoặc asset của slither.io. JavaScript ES modules theo stack Worker/Canvas đang có; không thêm thư viện runtime frontend.

## Chạy và chơi nhiều thiết bị

Node 22+ (đã kiểm tra Node 24), Chrome/Edge hiện đại:

```powershell
npm.cmd install
npm.cmd run build
npm.cmd run dev
```

Mở `http://localhost:5173/snake`. Thiết bị cùng Wi-Fi mở `http://<IP-LAN-của-máy>:5173/snake`, cho phép cổng 5173 qua firewall. Server local mặc định lắng nghe `0.0.0.0`; `HOST` và `PORT` có ví dụ trong `.env.example`. Nếu cần đổi trong PowerShell, đặt `$env:PORT="5174"` trước khi chạy; project không tự load dotenv. Mỗi tab/thiết bị bấm Chơi ngay sẽ được matchmaking, tên trống có tên khách.

Di chuột để lái; giữ chuột trái/Space để boost. Mobile dùng joystick trái và boost phải, hỗ trợ hai ngón. Rắn luôn chạy, xuyên thân mình, đầu đụng thân đối thủ hoặc biên tròn sẽ chết. **Hai hoặc nhiều đầu cùng đụng trong tick: tất cả chết**, trừ người đã nhận va chạm thân trước; không ưu tiên theo thứ tự mảng. Mở cài đặt không pause; blur tắt boost. F2 bật telemetry.

## Cấu trúc và config

- `config.js`: 30 Hz simulation, 15 Hz snapshots, 10 slot, radius 5.400, speed 175, boost ×1,6; mass 25–650, spawn 60, length cap 2.240, food 850/cap 1.800.
- `math.js`: góc ngắn nhất, quay giới hạn, arc-length body, swept segment collision, spatial grid.
- `engine.js`: authority tiền năng lượng/ăn/boost/collision/spawn/death; không phụ thuộc transport/render.
- `service.js`: session, socket replacement, timeout, scheduler, ACK/backpressure, matcher serial.
- `prediction.js`, `main.js`: prediction/reconciliation, remote interpolation, camera/input/render/HUD/mobile/audio.
- `src/snake-room.js`, `src/snake-router.js`: Cloudflare DO và HTTP/WebSocket routes. `scripts/local-snake.mjs` dùng cùng engine/service cho Node.
- `scripts/build-snake.mjs` bundle client vào `src/page/games/mebi-snake.generated.js` và `dist/mebi-snake/index.html`.

Skin chỉ đổi màu/hoạ tiết, không đổi hitbox hoặc tốc độ. Đồ họa vẽ bằng Canvas/CSS; âm thanh Web Audio synth riêng, chỉ tạo sau tương tác. localStorage chỉ lưu tên/skin/âm lượng/hiệu ứng; session token nằm trong sessionStorage, không dùng để giả lập multiplayer. Storage/audio bị chặn vẫn chơi được.

## Matchmaking và phiên

`POST /api/snake/join` với UUID requestId, tên và skin. Matchmaker duy nhất gọi trực tiếp `reserve` trên từng authority, từ arena số nhỏ nhất, không quyết định từ cache occupancy. Reservation TTL 8 giây, chiếm một slot; claim chỉ dùng một lần. Retry cùng requestId có affinity, vẫn gọi authority để xác nhận. Affinity 30 giây được lưu cùng high-water mark trong DO storage. Cấp số giới hạn 1.000 arena; đầy thì trả lỗi rõ.

`/api/snake/arena/:number` xác thực token trong message đầu, token không nằm trong URL hoặc snapshot. Resume cùng token thay socket cũ; tab cũ nhận thông báo session đã chuyển. Reconnect 10 giây: rắn vẫn chạy, tắt boost, vẫn chết bình thường. Chết giữ slot tối đa 20 giây, Chơi lại trong hạn dùng cùng arena/session; hết hạn thực hiện matchmaking mới khi người chơi bấm. Không tự respawn. `cancel` chỉ hủy reservation; `leave` có token sẽ loại rắn và giải phóng slot. Arena trống/reservation hết được dọn sau idle 60 giây. Rate limit matchmaking và input, payload cap 512 ký tự cho socket, origin guard cho API.

## Network model

Client gửi seq/góc/boost; ACK snapshot và ping chỉ là control messages. Server không tin vị trí, tốc độ, timestamp, điểm hoặc lệnh tạo thức ăn. Pending input được coalesce về mới nhất, chặn seq cũ. Prediction chỉ di chuyển presentation, không cộng năng lượng hoặc rơi boost-food. Reconciliation bỏ input đã ACK, replay phần chưa ACK theo timestep giới hạn và làm mềm sai lệch nhỏ; sai lệch >100 world units đồng bộ ngay.

Remote interpolation buffer thích ứng 80–180 ms, khởi đầu khoảng 100 ms; nội suy đầu trên snapshot history rồi dựng thân theo arc-length, không easing từng segment. Extrapolation ngắn tối đa 100 ms, thiếu snapshot hiển thị kết nối yếu. Detail body/food cull theo interest radius 1.500; metadata tối thiểu của 10 rắn còn lại vẫn gửi. Food spawn/despawn/value delta, full baseline trong interest mỗi 2 giây để sửa mất delta ở tầng ứng dụng. Minimap chỉ vẽ bản thân.

Snapshot có cửa sổ ACK khoảng 400 ms; client chậm thì ngừng thêm snapshot tới khi nhận ACK, không xếp vô hạn frame cũ. Node còn kiểm tra bufferedAmount; Cloudflare không phụ thuộc vào việc runtime có thuộc tính đó. Scheduler fixed timestep 30 Hz, catch-up tối đa 4 bước, đếm overruns. **Thông số mục tiêu không đồng nghĩa đã đạt Hz/FPS thực tế**; xem report load và browser.

## Spawn và bảo toàn năng lượng

Spawn kiểm tra cả thân dự kiến và khoảng phía trước, xa đầu khác. Bảo vệ 2 giây, không nhận/gây va chạm rắn và không boost; vẫn chết ở biên. Nếu hết bảo vệ đang overlap, gia hạn ngắn tới tối đa 4 giây rồi tìm điểm an toàn mới; không tìm được thì kết thúc với lý do rõ.

Boost mất 5 mass/giây theo sim time; phần lẻ giữ trong accumulator và flush khi chết; các hạt thả tương ứng đúng năng lượng mất. Score là mass hiện tại để không farm điểm bằng ăn lại boost-food. Chết thả 80% mass, tối đa 60 hạt; không rơi nhiều hơn năng lượng sở hữu. Hạt cap 24, tổng food cap 1.800: phần chưa có chỗ giữ trong bank tối đa 10.000 rồi xả dần; vượt bank là sink có bộ đếm `dissipated`, không tạo thêm mass. Spawn mass và natural refill là nguồn năng lượng có chủ đích trong config. Cấp max mass chỉ ăn phần còn thiếu; dư vẫn ở hạt.

## Cloudflare: chỉ cấu hình, chưa deploy

Wrangler thêm `SNAKE → SnakeArena`, `SNAKE_MATCH → SnakeMatchmaker`, migration **v11** cho hai class SQLite. Không sửa binding R2 `IMAGES`, bucket hoặc migration cũ. Không cần secret mới. `/snake` và API rắn không yêu cầu HOME_SESSION_SECRET/login, theo yêu cầu game; auth game khác giữ nguyên.

Arena dùng WebSocket Standard API và timer trong lúc active, không hibernate simulation 30 Hz. Đối chiếu [Cloudflare: WebSockets in Durable Objects](https://developers.cloudflare.com/durable-objects/best-practices/websockets/). Điều này có chi phí active duration; idle thì dọn timer/arena. Chỉ matcher directory/affinity có persistence; **live snakes không persist qua restart**. Isolate/server restart làm token arena cũ bị từ chối với thông báo vào lại; không phục hồi stale snake.

Khi được yêu cầu vận hành, người quản trị cần kiểm tra account hỗ trợ SQLite DO, xem diff binding/migration rồi tự chạy Wrangler dev/deploy phù hợp. Lần triển khai source này không gọi deploy, tạo bucket hoặc thay đổi tài khoản Cloudflare.

## Kiểm tra

```powershell
node --test tests/snake.test.mjs
npm.cmd test
npm.cmd run test:snake:load
npm.cmd run test:snake:load -- --long
npm.cmd run test:snake:browser
```

Browser cần Chrome/Edge, hoặc `CHROME_PATH`. Load test mở 11 WebSocket thật với cùng service, xác nhận 10+1, đo tick/snapshot. `--long` là fixture trong process test cho mass tối đa, không phải endpoint production. Browser dùng các context độc lập, Input.dispatchMouseEvent/KeyEvent/TouchEvent, kiểm tra chuột/vòng tròn/Space/multi-touch/resize, reload, chết/chơi lại, RTT 50/100/200 ms + jitter + bỏ 12% snapshot ở tầng app và CPU throttling. Không mô phỏng bot để thay người thật.

Artifacts: `dist/mebi-snake/{menu,playing,mobile,result}-qa.png`, `load-test.json`, `load-test-long.json`, `browser-metrics.json`. FPS được đọc từ F2, tick ms từ server. Chrome headless software rendering nhiều context chưa chứng minh 60 FPS ổn định; bật giảm hiệu ứng giảm DPR và glow. Chưa kiểm tra Cloudflare thật, Internet công khai hoặc điện thoại vật lý.

Kết quả đo cụ thể: [VALIDATION.md](VALIDATION.md).

Điều chỉnh kích thước: bán kính 5.400 (đường kính 10.800, gấp 3 bản đầu); mỗi mass tăng 2,2 chiều dài thay vì 3,3 (tăng trưởng còn 2/3). Base length 156 giữ chiều dài xuất phát 288 ở mass 60.
