# Tỷ Phú Mebi

Game online 2–4 người tại `/ty-phu`, map Việt Nam 32 ô, lấy cảm hứng từ Business Tour. Tên hiển thị mới áp dụng ở title, header, bàn cờ, luật và nút thư viện. Đường dẫn/module `mebi-monopoly` và namespace `MONOPOLY` được giữ để tương thích URL và storage; đây là tên kỹ thuật, không phải tên trên UI.

## Chạy

Node 20+, `npm.cmd install`, `npm.cmd run build`, `npm.cmd run dev`. Mở `http://localhost:5173/ty-phu`. Thiết bị khác cùng LAN mở `http://<IP-máy-server>:5173/ty-phu`; cho phép cổng 5173 nếu firewall chặn. Tạo phòng, gửi mã sáu ký tự hoặc link, chọn nhân vật và sẵn sàng. Chủ phòng bắt đầu khi có ít nhất hai người và tất cả sẵn sàng.

## Bộ luật hiện hành

`mebi-tour-mebi-v2`, schema 4, theo các tùy chỉnh Mebi mới. Khởi đầu 2 triệu trứng; mua đất + 1/2 nhà atomically; nâng một cấp mỗi lần ghé sau vòng mới; thuế theo tiền mặt; đôi/1+6 được tung tiếp, ba lần liên tiếp vào tù; du lịch ngay lượt hiện tại. Năm kiểu thắng, không giới hạn thời gian trận mặc định. Chi tiết tại [RULES.md](RULES.md).

Ba bất động sản đắt nhất: **Mebisoft 800.000 trứng → Mebifarm 720.000 trứng → Mebieco 640.000 trứng**. Một đơn vị engine tương đương 1.000 trứng; trên bàn viết gọn `K`. Không dùng VND hoặc tiền thật.

Đặc tả nguồn và preset: [docs/business-tour-rules.md](../docs/business-tour-rules.md). Đây là bản lấy cảm hứng, không phải mô phỏng chính xác mọi mode/phiên bản Business Tour.

## Cấu trúc

- `tour-data.ts`: map, `boardPosition`, giá, cấp xây, phí, mua lại, sự kiện và timer.
- `spec-engine.ts` qua `tour-engine.ts`: luật server độc lập UI/network, RNG có thể inject khi test. `engine.ts`/`data.ts` là entry của luật hiện hành.
- `tour-ui.ts`, `tour.css`, `dice.css`, `dice.ts`, `landmarks.ts`: HUD, camera zoom/pan và mô hình SVG nguyên bản; `main.ts` là client entry.
- `service.ts`: phiên/token, rate limit, command version/dedup, persist trước broadcast.
- `src/monopoly-room.ts`: hàng đợi serial của Durable Object, storage và alarm.
- `legacy-engine.ts`, `legacy-data.ts`: regression lịch sử v1; `monopoly-legacy.generated.js` chỉ phục vụ test, không import vào Worker hoặc game.

Build tạo HTML độc lập và các module `*.generated.js`; sửa source rồi build, không sửa generated trực tiếp.

## Multiplayer và lưu trữ

Giữ cùng API `/api/monopoly/:code/*`. Token ngẫu nhiên cấp từ server, xác thực trong WebSocket message, không đưa vào URL/log/snapshot công khai. Lệnh có roomId, commandId, expectedVersion; lệnh stale bị từ chối và gửi snapshot mới để thử lại. Không cho client gửi kết quả dice, giá đất hoặc quyền sở hữu.

Cloudflare dùng binding `MONOPOLY`, migration SQLite `v7` hiện có trong `wrangler.toml`. Không tạo namespace hoặc migration mới. Snapshot gồm schema/ruleset, phase context, deck bí mật, dedup và deadline tuyệt đối; alarm chạy cả khi offline. Khi isolate restart, socket cũ đánh dấu offline và client reconnect bằng token. Không reset deadline.

Node local dùng cùng service, lưu `.monopoly-local/` bằng temp-file + rename; startup khôi phục phòng và timer. Chỉ chạy một process local cho thư mục storage này. SessionStorage giữ token theo tab, localStorage chỉ giữ tên/cài đặt. Reload giữ ghế/màu/nhân vật; link mời không chuyển token sang thiết bị khác.

Lobby giữ chỗ 60s, trong trận 120s; nếu tất cả offline giữ danh tính tối đa 30 phút và timer vẫn chạy. Chủ phòng rời sảnh chuyển quyền ghế nhỏ nhất. Trận cũ đang chạy chuyển sang màn giải thích `legacy`, giữ snapshot gốc private; chủ phòng bấm **Mở sảnh luật mới** để chủ động bắt đầu lại. Sảnh/đã kết thúc cũ chuyển về sảnh và hủy ready. Không âm thầm đổi tài sản giữa các ruleset.

Limiter Worker giữ cấu hình hiện có: create 10/phút/IP, join/resume 30/phút/IP; command 20/10 giây/người. Local chỉ có giới hạn service. Chạy Worker giả lập với Wrangler khi cần kiểm tra binding/alarm thật: `npx.cmd wrangler dev --ip 0.0.0.0 --port 8787`. Không có deploy tự động.

## Kiểm tra

```powershell
npm.cmd run build
npm.cmd run check:monopoly
npm.cmd test
npm.cmd run test:monopoly:browser
npm.cmd run simulate:monopoly -- --matches 10000
```

Browser test dùng bốn context độc lập, create/join/ready/start, mua/xây/thu phí/mua lại, lễ hội, du lịch, reload và restart backend ở phase chọn điểm đến, hoàn tất Tourist Monopoly, reconnect kết quả và rematch. Các fixture được inject trực tiếp từ process test; không có endpoint seed production. Có kiểm tra 32 vị trí riêng, bàn vuông, nhãn và viewport ở 1440/1024/760/390/320px, zoom reset, xúc xắc 3D đang chạy và dừng đúng kết quả server, hình 1/2/3 nhà + khách sạn. Screenshot nằm tại `dist/mebi-monopoly/{desktop,mobile,lobby}-qa.png`.

Engine test kiểm tra mọi kiểu thắng, số dư không âm, luật sai phase, nợ sinh nhật và replay khớp state cuối (trận dài dùng lệnh rời trận hợp lệ để kiểm tra replay, không đổi luật kết thúc). Test DO dùng storage giả lập cho cạnh tranh ghế/nhân vật và restart. Chỉ báo pass sau khi thật sự chạy.

## Asset và giới hạn

SVG địa điểm, ba khu thương hiệu, nhân vật, CSS và nhạc synth là nguyên bản, không dùng asset từ Business Tour. Wordmark Mebisoft/Mebifarm/Mebieco không phải logo chính thức. Giấy phép thuật toán v1: [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md). Không thay đổi R2 trong lần cập nhật này.

Bản này có 2.5D SVG/CSS, không dùng WebGL. Animation nhân vật dùng chuyển động đơn giản theo sự kiện, chưa phải hệ skeletal 3D riêng cho từng nhân vật. Mobile overview ưu tiên tên và giá; zoom/pan hoặc bottom sheet để đọc chi tiết. Chưa xác minh trên Cloudflare thật, mạng công khai hoặc thiết bị di động vật lý. Storage archive không tự xóa; vận hành lâu dài cần chính sách retention. Không tự deploy.
Simulator báo rõ `completed` và `budgetReached` sau ngân sách 2.000 lệnh, không gộp trận chưa kết thúc vào thắng. Báo cáo tại `dist/mebi-monopoly/simulation.json`. Replay server được chia phần qua `storage.ts` trong transaction Durable Object; seed và token không có trong snapshot công khai.

Kết quả kiểm tra và giới hạn mô phỏng: [docs/mebi-monopoly-validation.md](../docs/mebi-monopoly-validation.md).

Lượt tự chuyển sau khi xử lý xong (hiệu ứng khoảng 3,5 giây); động đất chọn một nhà đối thủ; máy bay luôn qua START; mua lại được nâng ngay một cấp; phí cơ bản 1/4 giá đất; thanh lý 2/3 số tiền đã mua.
