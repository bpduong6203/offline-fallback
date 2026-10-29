# Luật Tỷ Phú Mebi

Luật hiện hành: **mebi-tour-v2**, schema **2**. Xem [bảng đối chiếu có nguồn và mức độ xác minh](../docs/business-tour-rules.md), cấu hình trong `tour-data.ts`.

- 32 ô Việt Nam, 20 thành phố theo 8 nhóm, 4 điểm du lịch, Xuất phát, Hoang đảo, Lễ hội Việt, Du lịch Việt, 3 May mắn, Quỹ thành phố.
- 1 đơn vị = 1.000 trứng. Khởi đầu 1.500.000 trứng, qua Xuất phát +300.000 trứng. Đi lùi/đi thẳng đến Hoang đảo không nhận thưởng vòng.
- Mebisoft 400.000 > Mebifarm 360.000 > Mebieco 320.000 trứng, giá/thuê cấp cuối cũng thuộc nhóm cao nhất.
- Đôi thêm lượt; ba đôi liên tiếp đến Hoang đảo trước lần di chuyển thứ ba. Rời đảo bằng đôi không thêm lượt. Tối đa ba lần thử; lần ba được rời, hoặc trả 200.000 trứng/dùng thẻ trước tung.
- Mua/xây khi dừng trên ô. Từ chối mua thì bỏ qua, không đấu giá. Vòng đầu tối đa cấp 2; sau một vòng tối đa cấp 3. Khi quay lại ô đã có cấp 3 được xây Khách sạn (cấp 4), không cần trọn nhóm hoặc xây đều, không giới hạn kho công trình.
- Trọn nhóm tăng phí ×2. Điểm du lịch có phí 25.000/50.000/100.000/200.000 trứng theo số điểm đang sở hữu.
- Trả phí ghé thăm đối thủ trước; sau thanh toán có thể mua lại giá ×2 vốn đất+công trình. Hai khoản được hiển thị riêng. Khách sạn và điểm du lịch không được mua lại.
- Lễ hội chọn thành phố sở hữu, phí ×2; tổ chức lại khi đang hiệu lực tăng thêm một tới tối đa ×5. Hiệu lực 8 lần hoàn tất lượt, reset multiplier khi hết hạn.
- Du lịch: ở lượt sau trả 50.000 trứng một lần, chọn ô mua được chưa có chủ hoặc của mình. Thiếu phí thì tung thường. Đến nơi tiếp tục xử lý ô, đi tiến qua Xuất phát vẫn nhận thưởng.
- Quỹ thành phố thu 10% vốn tài sản đang sở hữu, làm tròn lên. Thẻ riêng 12 lá, xáo server; thẻ rời đảo giữ ngoài bộ tới khi dùng/phá sản.
- Thiếu trứng: phase nợ 120s, chỉ thanh lý cả địa điểm nhận 50% vốn hoặc thanh toán. Không vay âm/thế chấp/đổi đất. Hết giờ bán theo ID tăng dần rồi trả đủ/phá sản. Tiền còn lại trả chủ nợ nếu có; tài sản về ngân hàng.
- Thắng ngay khi đủ 3 nhóm màu (Triple Monopoly), mọi ô mua được trên 1 cạnh gồm điểm du lịch (Side Monopoly), 4 điểm du lịch (Tourist Monopoly), hoặc đối thủ phá sản. Ba ô cạnh nhau không phải Triple Monopoly. Kiểm tra ngay sau mua/mua lại, dừng mọi bước còn lại khi thắng.
- Giới hạn trận 30 phút, hết giờ xếp cash+vốn tài sản, bằng nhau ưu tiên ghế nhỏ. Đây là biến thể của Tỷ Phú Mebi, không khẳng định là luật chính thức Business Tour.

Timer server: tung 60s, lựa chọn 30s, complete 30s, nợ 120s. Hết giờ lựa chọn thì bỏ qua, du lịch tự chọn ID hợp lệ nhỏ nhất, hoàn tất lượt tự chuyển. Reconnect không reset thời gian hoặc phát lại tiền/animation cũ. Chi tiết xử lý snapshot v1 và ưu tiên timer có trong tài liệu đối chiếu.