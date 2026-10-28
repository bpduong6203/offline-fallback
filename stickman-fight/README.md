# Stickman Showdown

Game đối kháng Canvas 2D cho hai người dùng chung bàn phím. JavaScript ESM dùng lại stack build của Worker hiện có, không cần thư viện frontend hoặc tài nguyên bên ngoài. Không thay đổi cấu hình Wrangler hoặc các phòng online.

## Chạy local

Tại thư mục `offline-fallback`:

```powershell
npm.cmd install
npm.cmd run dev
```

Mở **http://localhost:5173/stickman-fight**. Trang `/` tiếp tục phục vụ Bomb Arena trong dev server.

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run test:stickman:browser
npm.cmd run test:browser
```

Build tạo `dist/stickman-fight/index.html` độc lập và `src/page/games/stickman-fight.generated.js` để Worker import trực tiếp. Chạy build sau khi sửa source. Không chỉnh file generated. Worker phục vụ `/stickman-fight`, `/stickman-fight/` và `/__game/stickman-fight`, hỗ trợ GET/HEAD; các request khác trả 405. Chưa deploy.

Browser test dùng Chrome headless và CDP; mặc định tìm Chrome ở `C:\Program Files\Google\Chrome\Application\chrome.exe`. Có thể đặt biến `CHROME_PATH` nếu khác. Ảnh kiểm tra được lưu trong `dist/stickman-desktop.png` và `dist/stickman-fight.png`.

## Điều khiển

| Thao tác | Người chơi 1 | Người chơi 2 |
| --- | --- | --- |
| Di chuyển | A / D | ← / → |
| Nhảy | W | ↑ |
| Đấm | F | J |
| Đá | G | K |
| Giữ đỡ | H | L |
| Đặc biệt | R | U |

Esc: tạm dừng / tiếp tục. M: bật / tắt âm thanh. F2: vùng đánh, vùng nhận đòn, thân, state và FPS. Khi mất focus hoặc ẩn tab, game xóa phím và tạm dừng; cần chủ động tiếp tục. Một số bàn phím có giới hạn nhận nhiều phím cùng lúc. Thiết bị cảm ứng cần bàn phím vật lý.

## Luật và tính năng

- Mỗi hiệp 100 máu / 100 năng lượng, chọn 60 hoặc 90 giây. Thắng hai hiệp trước sẽ thắng trận. Hết giờ so máu; bằng máu hoặc knockout đồng thời thì đấu lại hiệp, không cộng điểm.
- Đấm 7 sát thương (90/80/180 ms), đá 12 (170/100/300 ms), đặc biệt 22 (320/140/500 ms), lần lượt là startup/active/recovery. Đặc biệt tốn 50 năng lượng và hồi 3 giây.
- Chỉ đánh hoặc đỡ khi chạm đất, hướng đánh khóa suốt đòn, một hit mỗi đòn. Có một ô buffer trong 100 ms cuối recovery. Hai đòn hợp lệ được thu thập trước khi áp dụng để trao đổi sát thương công bằng.
- Đỡ phía trước giảm 80% sát thương (Math.round), tốn 10/15/30 năng lượng; thiếu năng lượng chịu toàn bộ sát thương và choáng 600 ms. Hồi 8 năng lượng/giây sau 1 giây không dùng, còn 3/giây khi đỡ.
- Nhảy qua đầu để đổi bên; thân tách ổn định sát tường; không có sát thương va chạm hoặc rơi. Các đấu trường dùng cùng sàn và giới hạn.
- Ba nền Canvas: sân thượng đêm, võ đài, rừng tre hoàng hôn. Người que dùng chuỗi khớp với nội suy góc; có vệt đòn, sparks, guard, chớp sáng, hitstop 50 ms và rung nhẹ. Tùy chọn giảm hiệu ứng tắt rung, giảm chớp và số hạt.
- Web Audio tổng hợp âm thanh sau tương tác; âm lượng, giảm hiệu ứng, tên, đấu trường và thời gian được lưu localStorage. Lỗi audio/storage không chặn game.

## Module

`loop.js`: fixed timestep 60 Hz, tối đa 6 bước bù. `match.js`: vòng đời hiệp/trận, pause và hitstop. `fighter.js`: state machine. `input.js`: code-based input, edge-trigger, focus. `physics.js`: trọng lực, thân, biên. `combat.js`: hitbox/hurtbox, guard, trao đổi sát thương. `config.js`: thông số đòn và phím. `renderer.js` / `animation.js`: Canvas DPR, nền và animation. `effects.js`: particle giới hạn 160. `audio.js`: Web Audio. `ui.js` / `main.js`: menu, HUD, cài đặt. `storage.js`: lưu an toàn.

## Kiểm tra và giới hạn

Logic test bao phủ phase đòn, một hit mỗi đòn, recovery/buffer, hitstun, guard đúng hướng, phá đỡ, năng lượng/cooldown, đòn đồng thời, knockout hòa, hết giờ, hai hiệp thắng, pause/hitstop, mép sân và khóa hướng.

Browser test kiểm tra input hai người, trade, nhảy đổi bên/quay mặt, sát tường, pause/resume, handler blur, chơi lại, resize, lưu cài đặt và runtime exceptions. Headless Chrome có thể không phát blur của hệ điều hành khi đổi target nên test gọi thêm blur event; thao tác đổi tab thật và cảm giác điều khiển trên bàn phím vật lý vẫn cần thử trực tiếp. Không có online, bot hoặc điều khiển cảm ứng trong phiên bản này.
