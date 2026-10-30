# Luật Tỷ Phú Mebi

Ruleset **mebi-tour-mebi-v2**, schema **4**. Áp dụng tùy chỉnh người dùng ngày 30/10/2026, thay các điểm khác với đặc tả gốc trước đó. Map vẫn 32 ô Việt Nam, 2–4 người, một đơn vị = 1.000 trứng, khởi đầu 2.000.000 trứng.

- Giá đất **gấp đôi** bản trước; giá xây nhà giữ nguyên. Mebisoft 800.000, Mebifarm 720.000, Mebieco 640.000 trứng.
- Phí đạp đất cơ bản = **1/4 giá đất**, ở mọi cấp và cả du lịch; không còn phí du lịch theo số điểm sở hữu. Mất điện/lễ hội/giải vô địch vẫn điều chỉnh phí theo hiệu ứng hiện có.
- Thanh lý **floor(2/3 vốn đã mua và nâng cấp còn lại)**, làm tròn xuống theo đơn vị 1.000 trứng. Mua lại ghi riêng giá thực đã trả làm cơ sở thanh lý; công trình bị phá giảm phần vốn xây tương ứng.
- Tung **đôi hoặc 1+6 / 6+1 được tung tiếp**. Ba lần thưởng liên tiếp trong cùng lượt đưa vào tù trước di chuyển lần ba. Roll thường chấm dứt chuỗi. Ra đôi/1+6 để thoát đảo cũng được lượt thưởng; vẫn giữ trả phí/thẻ rời đảo và ba lần thử thất bại tự thoát đầu lượt sau.
- Mua đất kèm 1/2 nhà nguyên tử. Nâng bình thường một cấp mỗi lần ghé sau vòng mới. **Mua lại được nâng ngay một cấp**, không cần đợi vòng mới; đủ tiền và công trình không bị mất điện. Cấp 4 là khách sạn; khách sạn/du lịch/lá chắn vẫn chặn mua lại.
- **Động đất mở chọn một thành phố đối thủ có nhà** để phá một cấp, không phá toàn bàn. Không chọn đất trống hoặc khách sạn. Lá chắn chặn lần phá và tiêu hao một lượt bảo vệ. Không có mục tiêu thì hoàn tất an toàn.
- Máy bay chỉ đến ô mua được chưa có chủ hoặc của mình, không tới ô đặc biệt/đất đối thủ. Luôn sang vòng kế tiếp qua START, nhận 300.000 trứng, trừ vé 50.000 trứng khi xác nhận hợp lệ. Công thức số bước `board.length - currentPosition + targetId`; ví dụ sân bay 24 → Vũng Tàu 23 là 31 bước, qua START một lần; → Mebisoft 31 là 39 bước. Thẻ dịch chuyển khác giữ quy tắc riêng, không tự thưởng START.
- **Không cần nút kết thúc lượt**: xử lý mua/xây/chọn hiệu ứng xong sẽ tự chuyển sau khoảng 3,5 giây hiển thị. Tung tiếp nếu có thưởng. Các lựa chọn vẫn có hạn 30 giây, nợ 120 giây; không bỏ qua lựa chọn hoặc khoản nợ đang chờ.
- Thắng vẫn theo trọn cạnh / ba nhóm đúng ba thành phố / đủ du lịch / phá sản / đối thủ rời. Thuế vẫn floor(10% tiền mặt), sinh nhật xử lý nợ tuần tự, không nhận cash/ownership/dice từ client.

Trận đang chạy bằng luật cũ không đổi giá giữa trận; giữ bản lưu riêng và chủ phòng chọn **Mở sảnh luật mới**. Replay kiểm tra phiên bản ruleset, không chạy replay cũ bằng luật mới. Routes, bản đồ lớn và cấu hình Cloudflare/R2 giữ nguyên. Icon nhà có biệt thự/mái bằng/nhà phố nhiều màu, khách sạn riêng; vẫn hiển thị đúng số nhà và KS.

Kiểm tra: `npm.cmd run check:monopoly`, build Monopoly, `node --test tests/tour-rules.test.mjs tests/mebi-monopoly-custom.test.mjs tests/monopoly-room.test.mjs`, `npm.cmd run test:monopoly:browser`. Chưa deploy Cloudflare.

Máy bay nay di chuyển quân lần lượt theo đường bàn cờ, **125 ms mỗi ô**, không nhảy thẳng tới đích. Lượt tự kết thúc được giữ đủ thời gian cho hành trình dài; bot cũng chờ chuyển động hoàn tất. Giảm chuyển động/bỏ qua hiệu ứng vẫn có thể bỏ phần trình diễn.
