# Stickman Showdown

Game đối kháng Canvas 2D online cho hai người trên hai máy riêng. Nhập tên, tạo phòng, gửi mã 4 ký tự cho bạn bè. Người thứ hai nhập mã để vào; chủ phòng chọn đấu trường/thời gian và bắt đầu khi đủ 2 người. Mỗi máy chỉ điều khiển nhân vật được máy chủ gán. Không còn chế độ hai người cùng bàn phím.

JavaScript ESM dùng lại stack build của Worker hiện có. WebSocket `/__game/ws?g=stickman` dùng Durable Object `StickmanRoom` riêng, binding `STICKMAN`, migration `v4`. Các binding/migration và phòng game cũ được giữ nguyên.

## Chạy local

Tại thư mục `offline-fallback`:

```powershell
npm.cmd install
npm.cmd run dev
```

Mở **http://localhost:5173/stickman-fight**. Máy thứ hai trong cùng LAN mở `http://<IP-máy-chạy-server>:5173/stickman-fight` và nhập mã phòng. Cả hai phải kết nối cùng server/domain. Trang `/` tiếp tục phục vụ Bomb Arena trong dev server. File HTML tĩnh mở riêng không cung cấp máy chủ phòng online.

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run test:stickman:browser
npm.cmd run test:browser
```

Build tạo `dist/stickman-fight/index.html` độc lập và `src/page/games/stickman-fight.generated.js` để Worker import trực tiếp. Chạy build sau khi sửa source. Không chỉnh file generated. Worker phục vụ `/stickman-fight`, `/stickman-fight/` và `/__game/stickman-fight`, hỗ trợ GET/HEAD; các request khác trả 405. Chưa deploy.

Browser test dùng Chrome headless và CDP; mặc định tìm Chrome ở `C:\Program Files\Google\Chrome\Application\chrome.exe`. Có thể đặt biến `CHROME_PATH` nếu khác. Ảnh kiểm tra online được lưu trong `dist/stickman-online.png`.

## Điều khiển

Mỗi người dùng một trong hai bộ phím sau trên máy của mình; cả hai bộ chỉ điều khiển nhân vật của chính người đó:

| Thao tác | Bộ phím chính | Bộ phím thay thế |
| --- | --- | --- |
| Di chuyển | A / D | ← / → |
| Nhảy | W | ↑ |
| Đấm | F | J |
| Đá | G | K |
| Giữ đỡ | H | L |
| Đặc biệt | R | U |

Esc: tạm dừng / tiếp tục cho cả hai người. M: bật / tắt âm thanh trên máy của bạn. F2: vùng đánh, vùng nhận đòn, thân, state và FPS. Khi mất focus, ẩn tab hoặc mở hướng dẫn/cài đặt, game xóa phím và yêu cầu máy chủ tạm dừng trận chung; một trong hai người bấm Tiếp tục khi cả hai sẵn sàng. Thiết bị cảm ứng cần bàn phím vật lý.

Chỉ chủ phòng đổi thiết lập, bắt đầu hoặc chơi lại. Rời phòng/mất kết nối giữa trận sẽ xử thua; người còn lại thắng và nhận quyền chủ phòng. Người mới có thể vào thế chỗ rồi chủ phòng bắt đầu trận mới. Phòng trống được dọn. Khi kết nối thất bại, giao diện cho phép tạo/vào phòng lại; không tự khôi phục trận cũ.

## Luật và tính năng

- Mỗi hiệp 100 máu / 100 năng lượng, chọn 60 hoặc 90 giây. Thắng hai hiệp trước sẽ thắng trận. Hết giờ so máu; bằng máu hoặc knockout đồng thời thì đấu lại hiệp, không cộng điểm.
- Đấm 7 sát thương (90/80/180 ms), đá 12 (170/100/300 ms), đặc biệt 22 (320/140/500 ms), lần lượt là startup/active/recovery. Đặc biệt tốn 50 năng lượng và hồi 3 giây.
- Chỉ đánh hoặc đỡ khi chạm đất, hướng đánh khóa suốt đòn, một hit mỗi đòn. Có một ô buffer trong 100 ms cuối recovery. Hai đòn hợp lệ được thu thập trước khi áp dụng để trao đổi sát thương công bằng.
- Đỡ phía trước giảm 80% sát thương (Math.round), tốn 10/15/30 năng lượng; thiếu năng lượng chịu toàn bộ sát thương và choáng 600 ms. Hồi 8 năng lượng/giây sau 1 giây không dùng, còn 3/giây khi đỡ.
- Nhảy qua đầu để đổi bên; thân tách ổn định sát tường; không có sát thương va chạm hoặc rơi. Các đấu trường dùng cùng sàn và giới hạn.
- Ba nền Canvas: sân thượng đêm, võ đài, rừng tre hoàng hôn. Người que dùng chuỗi khớp với nội suy góc; có vệt đòn, sparks, guard, chớp sáng, hitstop 50 ms và rung nhẹ. Tùy chọn giảm hiệu ứng tắt rung, giảm chớp và số hạt.
- Web Audio tổng hợp âm thanh sau tương tác; âm lượng, giảm hiệu ứng, tên, đấu trường và thời gian được lưu localStorage. Lỗi audio/storage không chặn game.

## Module

`src/stickman-room-engine.js`: quản lý phòng, quyền host, kiểm tra input, mô phỏng trận và sự kiện. `src/stickman-room.js`: WebSocket Durable Object và vòng lặp server 60 Hz, tối đa 100 ms cập nhật bù, snapshot 20 Hz. Dev server dùng cùng engine qua WebSocket thật. Client gửi ý định điều khiển 30 Hz, không gửi máu/vị trí/thời gian; input cũ hơn 600 ms bị xóa. Client nội suy vị trí giữa snapshot để vẽ, không tự tính sát thương hoặc kết quả.

`network.js`: kết nối/vào/rời phòng. `loop.js`: vòng lặp client. `match.js`: vòng đời hiệp/trận, pause và hitstop, dùng trên server. `fighter.js`: state machine. `input.js`: code-based input, edge-trigger, focus. `physics.js`: trọng lực, thân, biên. `combat.js`: hitbox/hurtbox, guard, trao đổi sát thương. `config.js`: thông số đòn và phím. `renderer.js` / `animation.js`: Canvas DPR, nền và animation. `effects.js`: particle giới hạn 160. `audio.js`: Web Audio. `ui.js` / `main.js`: menu phòng, HUD, cài đặt. `storage.js`: lưu an toàn.

## Kiểm tra và giới hạn

Logic test bao phủ phase đòn, một hit mỗi đòn, recovery/buffer, hitstun, guard đúng hướng, phá đỡ, năng lượng/cooldown, đòn đồng thời, knockout hòa, hết giờ, hai hiệp thắng, pause/hitstop, mép sân và khóa hướng.

Room test bao phủ giới hạn 2 người, quyền host, đầu vào thuộc đúng kết nối, chống sửa state từ client, input hết hạn, pause/resume chung, snapshot và sự kiện đồng bộ, chuyển hiệp, xử thua khi ngắt kết nối, chuyển host, người thay thế và dọn phòng. Có test WebSocket thật với dev server.

Browser test dùng ba trang Chrome riêng: tạo/vào phòng, từ chối người thứ ba, chọn thiết lập từ host, đếm ngược, mỗi client điều khiển đúng nhân vật, sát thương đồng bộ, pause/resume chung, handler blur, xử thua/chuyển host, thay người/chơi lại, phòng hết hạn, resize và lưu cài đặt. Headless dùng focus emulation để mô phỏng hai máy cùng hoạt động; blur được phát bằng event. Chưa kiểm tra hai máy vật lý qua Internet hoặc Worker/Durable Object trên Cloudflare. Chưa deploy. Phiên bản này không có bot, điều khiển cảm ứng, rollback hoặc khôi phục trận sau mất kết nối; độ trễ thực tế phụ thuộc mạng.
