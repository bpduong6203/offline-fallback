# Kiểm tra Tỷ Phú Mebi — 29/10/2026

- `npm.cmd run build`: qua.
- `npm.cmd run check:monopoly`: qua.
- `npm.cmd test`: **160/160** qua, gồm game khác, R2, Worker routes, luật mới, storage chia phần và replay.
- `npm.cmd run test:monopoly:browser`: qua, bốn browser context độc lập; 1440×1000, 1366×768, 1024×1000, 760×844, 390×844, 320×844. Bàn vuông, 32 vị trí/nhãn riêng, không tràn ngang, desktop 1366×768 không cuộn. Có kiểm tra mua nguyên tử, thuê/mua lại, hai kênh sự kiện, du lịch, reload, restart Node backend, thắng/resume/rematch, zoom reset. Xác nhận hai cube/sáu mặt, animation đang chạy và giá trị cuối khớp server; đúng hình 1/2/3 nhà và khách sạn.
- Screenshot: `dist/mebi-monopoly/{desktop,mobile,lobby,dice-roll}-qa.png`.

## Mô phỏng

`node scripts/monopoly-simulate.mjs --matches 10000`, seed 1–10000, ngân sách 2.000 lệnh/trận, 222,147 giây. **17.374.460 lệnh** được kiểm tra: tiền integer không âm, cash = tiền ban đầu + thu − chi, cấp 0–4, không có tài sản do người đã bị loại sở hữu. Cùng engine/validator; không truy cập deck/seed khi bot quyết định.

**3.236 trận kết thúc tự nhiên**, **6.764 trận còn tiếp diễn sau ngân sách**. Không tự ép kết thúc, không gọi các trận này là deadlock hay pass tiêu chí mọi trận kết thúc. Đây là giới hạn độ dài/cân bằng của preset map hiện tại, nhất là khi các đối thủ chia nhau khách sạn không thể mua lại và vẫn có thu nhập START. Không thay đổi luật MD để thêm giới hạn thời gian. Chưa chạy acceptance T25 đủ 100.000 trận kết thúc.

Ghế thắng: 852 / 799 / 771 / 814. Kiểu thắng: trọn cạnh 1.940, ba bộ ba 210, du lịch 1.009, phá sản 77. Dữ liệu chi tiết tại `dist/mebi-monopoly/simulation.json`: thắng/lượt/cashflow tính trên các trận kết thúc; thẻ/đảo/ROI tính trên toàn bộ lượt đã chạy. Có thể chạy đến 100.000 seed bằng `--matches 100000`.

Các kiểm tra trên chạy local, storage DO giả lập và Node WebSocket thật. Chưa deploy, chưa kiểm tra Cloudflare production hoặc điện thoại vật lý.
