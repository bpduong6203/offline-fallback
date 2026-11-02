# Kiểm tra hòa liên tục và tỷ lệ thắng Xì Dách

> Báo cáo dưới đây đo luật cũ: người chơi quắc luôn thua dù nhà cái cũng quắc. Luật hiện tại đã đổi sang **cả hai cùng quắc thì hòa, hoàn cược** theo yêu cầu mới. Các tỷ lệ trong báo cáo không còn đại diện cho luật hiện tại; cần chạy lại script để đo luật mới.

Kết quả dưới đây từ mã nguồn trong workspace, không phải thống kê các ván production. Không thay đổi luật, cách chia hoặc cách quyết toán của game.

## Cách đo

Chạy `node scripts/analyze-xidach.mjs 100000`. Script dùng `XiDachEngine`, `shuffledDeck()` và `crypto.getRandomValues()` hiện có; chỉ tua đồng hồ để không phải đợi từng lượt. Có 100.000 ván cho mỗi cấu hình, tổng 500.000 ván và 1.200.000 kết quả người chơi. Số dư/quỹ được đặt lại mỗi ván để tránh người chơi ngừng tham gia do hết điểm. Không tính lãi vay vào tỷ lệ thắng bài.

Chiến thuật là rút dưới mốc, dằn từ mốc trở lên, tuân theo tự khóa bài đặc biệt/21/quắc/5 lá. Nhà cái giữ nguyên dằn từ 17. Ván nhà cái có xì dách/xì bàn vẫn so ngay. Bàn 8 người dùng cùng chiến thuật cho cả 8 ghế. Mỗi lần chạy lại có dao động vì dùng ngẫu nhiên thật; sai số 95% của tỷ lệ thắng trong các mẫu một người khoảng ±0,31 điểm phần trăm. Script tính sai số theo từng ván để không coi 8 ghế chung nhà cái là 8 mẫu độc lập.

## Kết quả lần chạy kiểm tra

| Số người | Dằn từ | Thắng | Hòa | Thua |
|---|---:|---:|---:|---:|
| 1 | 16 | 42.148 | 8.413 | 49.439 |
| 1 | 17 | 41.555 | 9.136 | 49.309 |
| 1 | 18 | 41.018 | 7.681 | 51.301 |
| 1 | 19 | 38.000 | 6.278 | 55.722 |
| 8 | 17 | 41.679 | 9.088125 | 49.232875 |

Các giá trị trong bảng là phần trăm. Không có một tỷ lệ thắng cố định cho mọi cách chơi. Mốc 16 tương ứng cách tự xử lý khi hết lượt trong engine. Đây là so sánh các chiến thuật đơn giản, không chứng minh chiến thuật tối ưu.

Với mốc 17, nếu bỏ các ván hòa, tỷ lệ thắng trong các ván có phân thắng/thua là 45,733%. Tính trên mọi ván, tỷ lệ thắng vẫn là 41,555%. Cược cố định, thưởng 1:1: chênh lệch trung bình là −0,07754 lần mức cược mỗi ván ở cấu hình này; không bao gồm lãi vay.

## Hòa liên tục

- Một người, dằn từ 16: chuỗi hòa dài nhất 5; có 707 cửa sổ hai ván hòa, 65 cửa sổ ba ván hòa và 3 cửa sổ bốn ván hòa trong 100.000 ván.
- Một người, dằn từ 17: chuỗi dài nhất 4; tương ứng 851, 98 và 8 cửa sổ. Các cửa sổ có thể chồng lên nhau.
- Bàn 8 người, dằn từ 17: chuỗi hòa dài nhất của một ghế là 5 qua 100.000 ván bàn.
- Với tỷ lệ hòa 9,136% và các ván xáo mới độc lập, một chuỗi ba ván được chọn trước đều hòa có xác suất khoảng 0,0763%. Đây không phải xác suất gặp ít nhất một chuỗi như vậy trong cả một phiên dài.

Trong 9.136 kết quả hòa của cấu hình một người dằn từ 17, có 2.828 kết quả hòa ở tổng 20 (30,95% số ván hòa). Bộ bài có 16 lá trị giá 10; A được chọn 1/10/11 kể cả ở tay nhiều lá. Hai yếu tố này tập trung tổng bài ở các mức cao. Quy tắc cùng hạng/cùng điểm không xét chất hay thứ tự lá.

## Đường mã đã kiểm tra và giới hạn kết luận

- `xi-dach/rules.js`: xáo Fisher–Yates với rejection sampling; không có xác suất ép thắng/hòa theo ví, nợ hoặc quỹ. `compare()` chỉ hòa khi cùng hạng đặc biệt hoặc cùng tổng trong cùng hạng; người chơi quắc luôn thua, kể cả nhà cái cùng quắc.
- `xi-dach/engine.js`: mỗi `start()` tạo bộ xáo mới; `settle()` dùng kết quả so bài, hòa hoàn cược. Người chơi hành động trước nhà cái; quy tắc quắc trước dẫn đến lợi thế cho nhà cái.
- `xi-dach/client.js`: `resultText()` hiện dùng nhánh mặc định để hiển thị hòa nếu giá trị không phải `1` hoặc `-1`. Dữ liệu thiếu, sai kiểu hoặc `null` có thể bị hiển thị thành hòa. Engine hiện tại luôn tạo `-1/0/1` cho bộ bài hợp lệ; chưa tái hiện lỗi dữ liệu này.
- Người dùng xác nhận số ván tăng khi gặp hòa liên tiếp, nên giả thuyết một kết quả cũ chỉ đang được hiển thị lại không giải thích trường hợp đó.

Chưa phát hiện lỗi ép hòa trong engine. Nguyên nhân phù hợp với kết quả mô phỏng là chuỗi ngẫu nhiên, sự tập trung điểm và luật tính A hiện có. Để kết luận cho các ván đã gặp cần lịch sử đúng số ván, bài hai bên và `result` từ snapshot; chưa đọc dữ liệu phòng production.
