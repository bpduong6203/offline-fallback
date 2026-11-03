# Mebi Trà

Game quản lý quán trà tiếng Việt, tích hợp Cloudflare Worker hiện có tại `/goc-tra-nho` (và `/__game/goc-tra-nho`). Có liên kết từ sảnh game. Không thêm framework hoặc dịch vụ lưu trữ mới.

## Chạy và kiểm tra

```powershell
npm.cmd run build
npm.cmd run dev
# Mở http://127.0.0.1:5173/goc-tra-nho (dùng cổng dev in ra nếu khác)
npm.cmd test
npm.cmd run test:tea:browser
```

Build riêng: `node scripts/build-tea.mjs`. HTML tự chứa ở `dist/tea-shop/index.html`, module Worker ở `src/page/games/tea-shop.generated.js`. Browser test dùng Chrome tại vị trí Windows mặc định, có thể đổi bằng `CHROME_PATH`.

## Điều khiển và vòng chơi

Nút **Hướng dẫn** ở đầu màn hình mở sổ chơi gồm: ly đầu tiên, quản lý quán, sáu minigame và cách xử lý khi gặp khó. Sổ tự hiện lần đầu với người mới trên trình duyệt này; có thể mở lại bất cứ lúc nào. Khi mở trong giờ phục vụ, game tạm dừng và tiếp tục sau khi đóng; nếu đã tự tạm dừng thì vẫn giữ trạng thái đó.

Bảng thao tác nằm cạnh cảnh quán trên máy tính và ngay dưới cảnh trên điện thoại; kho, vườn và nâng cấp cuộn bên trong bảng. Chọn **Chủ tiệm → Nam / Nữ** ngay trên cảnh để đổi nhân vật. Lựa chọn lưu cùng tiến trình, giữ khi chơi lại; bản lưu cũ mặc định Nam.

Hai chủ tiệm dùng PNG trong suốt cắt trực tiếp từ ảnh người dùng cung cấp, giữ nguyên pixel gốc. Nhân vật được vẽ trước quầy để quầy che thân dưới; giữ tỷ lệ bằng scale đồng nhất, nhún thở và nghiêng nhẹ toàn sprite lúc phục vụ. Giảm chuyển động trong Cài đặt sẽ dừng các hoạt ảnh này. File và cách tái tạo: [assets/tea-shop/README.md](../assets/tea-shop/README.md).

- Chọn menu trong **Sổ công thức & menu**, mở cửa, chạm phiếu đơn hoặc khách trong cảnh quán.
- Pha theo 8 bước: ly → trà → sữa → đường → đá → topping/thành phần → lắc/khuấy → nắp. Đối chiếu công thức ghim và phiếu khách, rồi giao món. Trên desktop có thể kéo lựa chọn vào ly; trên điện thoại chỉ cần chạm nút.
- Khi **Tạm dừng**, không thể nhận đơn, pha nhanh, thực hiện bước pha, hủy ly hay giao món; minigame ủ trà, lắc và trang trí ly cũng bị khóa. Các thao tác phục vụ được kiểm tra cả trên server, kể cả khi chạm khách trong cảnh hoặc gọi API. Nhấn **Tiếp tục** để phục vụ lại; ly đang pha và nguyên liệu vẫn được giữ.
- Lắc theo nhịp: bấm luân phiên Trái/Phải (hoặc A/D, phím mũi tên) khi kim vào vùng xanh. Nút đến lượt được tô sáng; ly chuyển động, số lượt và điểm cập nhật ngay khi bấm. Hoàn thành minigame ở bước lắc sẽ chuyển thẳng sang đóng nắp, không cần lắc tiêu chuẩn thêm lần nữa. Hủy minigame giữ nguyên bước pha.
- Mỗi ngày dài 7 phút ở tốc độ 1×. Có thể kết ngày từ phút thứ 6, sau đó chuẩn bị menu ngày mới. Tạm dừng, tốc độ 0.5×/1×/2×, chế độ thư giãn nằm trong cài đặt. Modal và minigame dừng thời gian phục vụ.
- Trồng 5 loại cây, tưới một lần, thu 4 phần sau 90 giây thời gian game. Cây không chết khi rời trang.
- Kho bán nguyên liệu giá 1 công đức/phần. Không trừ tồn âm; nguyên liệu trừ đúng một lần lúc nhận pha. Hủy ly không hoàn nguyên liệu. Khi thiếu tiền và nguyên liệu trà sữa truyền thống, gói hỗ trợ hàng xóm có thể cấp 2 ly truyền thống một lần/ngày.
- Sáu minigame thật: canh vùng ủ trà (mỗi loại có vùng riêng), khuấy trân châu theo nhịp, lắc trái/phải (phím A/D), vẽ syrup bằng pointer, chọn dụng cụ dọn từng loại rác, match-3 5×5 có đổi chỗ, rơi ô và xáo khi hết nước đi. Có hướng dẫn, kết quả, chơi lại. Mỗi lượt 15–25 giây; có thể hoàn thành từ giây thứ 10. Thưởng một lần mỗi loại/ngày, lượt tiếp theo luyện tập; không thưởng tiền trực tiếp. Luyện ủ trà và lắc mỗi loại 3 lần mở pha nhanh tiêu chuẩn.
- Sáu nâng cấp, sáu đồ trang trí, năm nhóm khách, thân thiết và quà khách quen. Đèn, thảm, tranh, cây, mèo và biển hiệu được vẽ ngay trong cảnh; bàn ghế và chậu trồng tăng sức chứa thực tế.
- Nhạc và hiệu ứng tổng hợp Web Audio, mặc định tắt, chỉ bắt đầu sau tương tác. Hỗ trợ âm lượng và giảm chuyển động.

## Công đức và độ an toàn thanh toán

Toàn bộ giá bán, tip, mua nguyên liệu và nâng cấp dùng **ví công đức chung** với Chùa/Xì Dách. Không còn xu riêng. Không cấp 500 công đức khi khởi tạo; thay bằng 40 phần mỗi nguyên liệu, đủ để bắt đầu từ số dư 0 và tránh tạo ví mới/reset để nhận tiền miễn phí.

`MebiMeritProfile` lưu kho, đơn, tiến trình, receipt và balance trong **cùng SQLite transaction**. Server tự tính giá và thưởng từ công thức, kiểm tra đủ bước, thời gian pha tối thiểu (8 giây, máy dập nắp giảm tới 5 giây), tồn kho, số dư và giới hạn minigame. Client không gửi số tiền được nhận. `revision` chặn ghi đè nhiều tab, `requestId` xử lý retry/lost response mà không thanh toán hai lần. Đây không phải hệ thống chống mọi bot tự động pha món hợp lệ.

Doanh thu = giá bán + tip. Lợi nhuận bán hàng = doanh thu − giá vốn nguyên liệu đã dùng. Dòng tiền = doanh thu − tiền thực chi mua nguyên liệu/đầu tư; không trừ giá vốn lần nữa khỏi ví. Quà khởi đầu/thu hoạch vẫn được ghi nhận theo giá vốn chuẩn 1/phần khi dùng.

## Tiến trình 10 ngày

| Ngày | Nội dung |
| --- | --- |
| 1 | Hướng dẫn, trà sữa truyền thống và trân châu đường đen |
| 2 | Mở trà sữa lài |
| 3 | Mở trà chanh |
| 4 | Mở matcha latte |
| 5 | Ngày mưa: ít đá; mở mèo cửa sổ |
| 6 | Mở trà đào |
| 7 | Giờ sinh viên: khách sinh viên ghé quán |
| 8 | Đơn theo nhóm: hai đơn cùng món nếu đủ ghế |
| 9 | Lễ hội matcha: khách ưu tiên matcha trong menu |
| 10 | Ngày khách quen: câu chuyện được ghi theo mức thân thiết |

Sau ngày 10 vẫn tiếp tục kinh doanh. Sổ thu chi giữ 30 ngày gần nhất.

## Lưu và khôi phục

Server tự lưu mỗi thao tác; cookie `mebi_merit_id` xác định ví và tiến trình. Không phát triển cây hay farm tiền khi đóng trang. Cài đặt âm thanh lưu cục bộ. Production dùng Durable Object bền vững; **dev server hiện có dùng SQLite trong bộ nhớ**, nên khởi động lại dev server sẽ xóa dữ liệu local.

Save có version, kiểm tra cấu trúc và hai bản sao đồng bộ trong cùng transaction. Nếu bản chính hỏng, dùng bản dự phòng cùng revision; không tự lùi về bản có đơn cũ và phát lại tiền. Nếu cả hai hỏng, dừng ghi game, giữ ví và báo lỗi.

Cài đặt hỗ trợ xuất/nhập JSON. Mã archive do server cấp, ràng buộc cùng ví; giữ tối đa 10 archive. Nhập khôi phục snapshot trên server, không tin số tiền/stock từ file. Chỉ cho nhập nếu chưa có thao tác thay đổi kinh tế/nguyên liệu kể từ khi xuất; từ chối rollback cũ hoặc chuyển save sang ví khác để tránh nhân bản tài sản. Ví công đức luôn là giá trị hiện tại của server. Chơi lại có xác nhận, giữ tồn kho, ví và các lượt thưởng đã nhận trong ngày, không cấp lại nguyên liệu đầu tiên.

## Cấu trúc

- `data.js`: công thức, giá, khách, nâng cấp và nội dung ngày.
- `engine.js`: kinh tế, pha chế, khách, cây và phần thưởng.
- `profile.js`: save, archive và giao dịch ví nguyên tử.
- `art.js`: cảnh Canvas/vector nguyên bản, không dùng emoji làm hình ảnh chính.
- `match.js`, `minigames.js`: logic match-3 và tương tác sáu minigame.
- `main.js`, `style.css`, `index.html`: UI, âm thanh và tương tác.
- `../src/tea-api.js`: route API, danh tính ví, same-origin và đăng nhập theo repo.

Font Google có fallback hệ thống. Game cần kết nối server để lưu và nhận công đức. Không triển khai production trong bước phát triển này.

Bản lưu cũ khởi đầu với 12 phần được bổ sung chênh lệch 28 phần mỗi loại đúng một lần, không vượt sức chứa và không thay đổi ví công đức. Phần đã tiêu hao vẫn được giữ đúng; tải lại hoặc chơi lại không cấp lại gói ban đầu.
