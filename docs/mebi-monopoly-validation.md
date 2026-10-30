# Kiểm tra Tỷ Phú Mebi — 29/10/2026

- `npm.cmd run build`: qua.
- `npm.cmd run check:monopoly`: qua.
- `npm.cmd test`: **160/160** qua, gồm game khác, R2, Worker routes, luật mới, storage chia phần và replay.
- `npm.cmd run test:monopoly:browser`: qua, bốn browser context độc lập; 1440×1000, 1366×768, 1024×1000, 760×844, 390×844, 320×844. Bàn vuông, 32 vị trí/nhãn riêng, không tràn ngang, desktop giữ bàn lớn cả khi cửa sổ thấp, cho phép cuộn dọc. Có kiểm tra mua nguyên tử, thuê/mua lại, hai kênh sự kiện, du lịch, reload, restart Node backend, thắng/resume/rematch, zoom reset. Xác nhận hai cube/sáu mặt, animation đang chạy và giá trị cuối khớp server; đúng hình 1/2/3 nhà và khách sạn.
- Screenshot: `dist/mebi-monopoly/{desktop,mobile,lobby,dice-roll}-qa.png`.

## Mô phỏng

`node scripts/monopoly-simulate.mjs --matches 10000`, seed 1–10000, ngân sách 2.000 lệnh/trận, 222,147 giây. **17.374.460 lệnh** được kiểm tra: tiền integer không âm, cash = tiền ban đầu + thu − chi, cấp 0–4, không có tài sản do người đã bị loại sở hữu. Cùng engine/validator; không truy cập deck/seed khi bot quyết định.

**3.236 trận kết thúc tự nhiên**, **6.764 trận còn tiếp diễn sau ngân sách**. Không tự ép kết thúc, không gọi các trận này là deadlock hay pass tiêu chí mọi trận kết thúc. Đây là giới hạn độ dài/cân bằng của preset map hiện tại, nhất là khi các đối thủ chia nhau khách sạn không thể mua lại và vẫn có thu nhập START. Không thay đổi luật MD để thêm giới hạn thời gian. Chưa chạy acceptance T25 đủ 100.000 trận kết thúc.

Ghế thắng: 852 / 799 / 771 / 814. Kiểu thắng: trọn cạnh 1.940, ba bộ ba 210, du lịch 1.009, phá sản 77. Dữ liệu chi tiết tại `dist/mebi-monopoly/simulation.json`: thắng/lượt/cashflow tính trên các trận kết thúc; thẻ/đảo/ROI tính trên toàn bộ lượt đã chạy. Có thể chạy đến 100.000 seed bằng `--matches 100000`.

Các kiểm tra trên chạy local, storage DO giả lập và Node WebSocket thật. Chưa deploy, chưa kiểm tra Cloudflare production hoặc điện thoại vật lý.

## Sửa bố cục theo phản hồi ảnh chụp

Bỏ thu nhỏ bàn theo chiều cao; bàn desktop tối đa 1.120 px. Font và tranh trung tâm tính theo kích thước chính bàn cờ. Sảnh không còn cuộn riêng/cắt nhân vật, nhật ký nằm dưới bàn và ẩn thanh hành động trống của sảnh.

Browser đã kiểm tra thêm sảnh một người ở 1920×980, 1440×900, 1366×768, 1024×768, 760×844, 390×844 và 320×844: nội dung trung tâm nằm đủ trong ô, không tràn ngang, không cắt nhân vật. Luồng bốn người và hiệu ứng xúc xắc tiếp tục qua. Ảnh đối chiếu sảnh: `dist/mebi-monopoly/lobby-{1920,390}-qa.png`.


## Luật Mebi tùy chỉnh — 30/10/2026

Ruleset mebi-tour-mebi-v2 / schema 4: giá đất x2, rent cơ bản 25% giá đất, thanh lý 2/3 giá thực mua, đôi/1+6 cho lượt thưởng (ba lần vào tù), động đất chọn một mục tiêu, máy bay luôn sang vòng kế qua START, mua lại nâng ngay, tự chuyển lượt sau 3,5 giây. Thay icon nhà nhiều mẫu/màu và khách sạn riêng, không đổi layout bàn lớn.

TypeScript qua. Node tests toàn project: **196/196 qua** (`--test-concurrency=1 --test-timeout=10000`); bộ rules/current DO/custom gồm **36 test qua**. Browser bốn context qua, kiểm tra mua/thuê/mua lại theo giá mới và nâng cấp ngay, máy bay/reload/restart backend, không còn nút end-turn, icon 1/2/3 nhà/KS, 32 ô riêng ở 1440/1366/1024/760/390/320 px. Không runtime exception.

Trận đang chạy luật cũ giữ archive và yêu cầu chủ phòng mở sảnh luật mới; không thay tiền/giá giữa trận. Replay cũ được chặn bằng ruleset. Chưa deploy hoặc kiểm tra Cloudflare production.


## Di chuyển thật qua từng ô khi dùng máy bay

Loại FLIGHT khỏi nhánh bỏ qua di chuyển; dùng cùng đường đi từng ô 125 ms như xúc xắc và bỏ hiệu ứng bay thẳng. Thêm movementUntil để auto-end/bot không cắt ngang đường đi. Browser bật hiệu ứng và theo dõi vị trí quân: xác nhận đủ dãy 25…31 → 0 → 1…31 (39 ô) sau restart/reconnect, rồi mới cho mua đất. Unit kiểm tra tới khách sạn của mình vẫn chờ hành trình kết thúc trước chuyển lượt. TypeScript và kiểm tra browser bốn context qua.
