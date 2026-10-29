# Luật Tỷ Phú Mebi

Ruleset **mebi-tour-spec-v1**, schema **3**, map **vietnam-32-v1**. Theo [đặc tả người dùng cung cấp](../docs/business-tour-game-algorithms.md); map/bảng giá là preset Mebi, không tuyên bố giống 100% Business Tour.

- 2–4 người, thêm máy trong sảnh; thứ tự lượt xáo trộn, ghế/màu/nhân vật giữ nguyên. Một đơn vị = **1.000 trứng**.
- Khởi đầu **2.000.000 trứng**; qua START bằng xúc xắc +**300.000 trứng**. Teleport/thẻ di chuyển/về START mặc định không thưởng.
- Mua đất + **1 hoặc 2 nhà** trong một giao dịch. Ghé lại đất của mình sau vòng mới nâng **một cấp**; cấp 3 ba nhà, cấp 4 khách sạn. Không xây từ xa.
- Trả thuê trước, rồi tùy chọn mua lại **2× vốn đất và xây**, giữ cấp. Khách sạn, du lịch, lá chắn chặn mua lại. Thuế **floor(10% tiền mặt)**.
- Đổ đôi **không thêm lượt**; không có ba đôi vào đảo. Ba lần thử đảo không đôi: tự thoát ở **đầu lượt sau**. Trả 200.000 trứng/dùng thẻ trước khi tung cũng thoát.
- Du lịch chọn đích **ngay lượt hiện tại**: đất chưa có chủ hoặc của mình. Trừ vé 50.000 trứng sau khi xác nhận hợp lệ; bỏ qua/hết giờ không mất vé.
- Ô Lễ hội Việt dùng kênh giải vô địch, thẻ lễ hội dùng kênh lễ hội. Mỗi kênh ×2 trong tám lượt kết thúc, MAX trong một kênh; hai kênh nhân riêng và làm tròn xuống. Mất điện: không thuê/nâng cấp tới khi chủ qua START kế tiếp (preset Mebi).
- Thẻ hạ cấp, động đất, bảo vệ, mất điện, sinh nhật, du lịch, rời đảo. Hotel chống hạ cấp; lá chắn tiêu hao khi chặn phá. Hạ đất cấp 0 trả ngân hàng.
- Thiếu tiền xử lý nợ, thanh lý 50% vốn từng tài sản rồi thanh toán/phá sản. Sinh nhật thu lần lượt theo ghế; người nợ có thể khác người có lượt.
- Thắng: **trọn cạnh → ba nhóm đúng ba ô → đủ bốn du lịch → đối thủ phá sản → đối thủ rời trận**. Nhóm hai ô không tính bộ ba. Không giới hạn thời gian trận mặc định.
- Tung/chọn 30 giây, nợ 120 giây. Hết giờ bỏ qua lựa chọn hoặc tự tung. Server quyết định tiền/xúc xắc/thẻ; retry không thu hai lần.

## Bản lưu, UI và kiểm tra

Trận cũ được giữ riêng; chủ phòng mở sảnh luật mới, không tự đổi kinh tế giữa trận. Replay JSON chỉ tải sau khi kết thúc; không lộ token, seed hoặc bộ bài tương lai trong snapshot đang chơi. Lịch sử chia phần và lưu atomically trong Durable Object.

Xúc xắc khối 3D sáu mặt, tung/nảy/đổ bóng, dừng đúng kết quả server. Giảm chuyển động/bỏ qua/tải lại chỉ đổi trình bày. Nhà có 1/2/3 biểu tượng + số; khách sạn có biểu tượng + KS. Bàn desktop rộng tối đa 1.120 px theo không gian ngang, không ép vừa chiều cao; cho phép cuộn dọc và zoom/pan để đọc chi tiết.

```powershell
npm.cmd run build
npm.cmd run check:monopoly
npm.cmd test
npm.cmd run test:monopoly:browser
npm.cmd run simulate:monopoly -- --matches 10000 --seed 1
```

Simulator dùng cùng engine/validator, báo ghế/kiểu thắng, lượt, cashflow, thẻ, đảo, ROI vào `dist/mebi-monopoly/simulation.json`. Giới hạn 2.000 lệnh/trận; **budgetReached** là chưa kết thúc trong ngân sách, không coi là thắng hay deadlock. Không thêm luật hết giờ để ép kết quả. Có thể chạy đến 100.000 seed với `--matches 100000`.
