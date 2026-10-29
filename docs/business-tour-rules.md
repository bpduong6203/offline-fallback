# Tỷ Phú Mebi — đối chiếu Business Tour

Ruleset **`mebi-tour-v2`**, schema **2**, ngày đối chiếu 2026-10-29. Tham khảo chế độ bàn cờ cá nhân cổ điển trên Steam, không áp dụng gadgets, vật phẩm trả tiền hoặc các map/sự kiện mới. Không tuyên bố tương đương 100% Business Tour hiện hành.

## Nguồn và mức độ tin cậy

1. [Trang Steam do 8Floor phát hành](https://store.steampowered.com/app/397900/): xác nhận nhận diện sản phẩm, multiplayer và nhà phát hành; **không có bảng luật/thông số đầy đủ**.
2. [Thông báo Championship của nhà phát hành](https://steamcommunity.com/games/397900/announcements/detail/4188985962640086625?l=spanish): kết quả tìm kiếm xác nhận tên các kiểu thắng; chưa dùng làm bằng chứng cho công thức hoặc con số.
3. [The absolute beginners guide, Bash](https://steamcommunity.com/sharedfiles/filedetails/?id=1091085897): đã đọc nội dung hướng dẫn cộng đồng. Bằng chứng cộng đồng, không phải tài liệu chính thức, có thể khác phiên bản.
4. [In depth strategy guide (no gadgets), cakemix](https://steamcommunity.com/sharedfiles/filedetails/?id=2909896451): đã đọc để đối chiếu nhóm sở hữu, mua lại, tiến triển công trình. Bằng chứng cộng đồng.
5. [Strategy Guide, ilares](https://steamcommunity.com/sharedfiles/filedetails/?id=3071915108): đã đọc để đối chiếu góc nhìn chế độ giới hạn thời gian; không lấy bảng giá kinh tế từ hướng dẫn này.

Các trang Steam community có thể hiển thị banner chung về tương thích/nội dung bị gỡ dù thân bài vẫn đọc được. Vì vậy không xem chúng là bảo đảm luật hiện hành. Không tải hay sử dụng hình ảnh/âm thanh từ các nguồn này.

## Bảng đối chiếu

“Cộng đồng” nghĩa là đã tìm thấy mô tả nhất quán trong tài liệu cộng đồng, **chưa xác minh bằng hướng dẫn trong game/nhà phát hành**. “Biến thể” là quyết định minh bạch của Tỷ Phú Mebi, cấu hình trong `tour-data.ts`.

| Cơ chế | Engine v1 | Tỷ Phú Mebi v2 | Trạng thái |
| --- | --- | --- | --- |
| Bản đồ | 40 ô Monopoly | 32 ô Việt Nam, 8 bước/cạnh, 20 thành phố, 4 du lịch | **Biến thể**; chưa xác minh đầy đủ số ô/bố trí gốc từ nguồn chính thức, không giữ 40 ô chỉ để tái sử dụng |
| Tiền | 1.500 đơn vị, qua vòng +200 | 1.500 đơn vị, qua vòng +300; mỗi đơn vị =1.000 trứng | Khởi đầu: **biến thể**. Thưởng vòng: có mô tả cộng đồng, dùng quy đổi riêng |
| Đôi | Thêm lượt; ba đôi vào tù | Thêm lượt; ba đôi tới Hoang đảo trước di chuyển | **Biến thể** về giới hạn; chưa có xác nhận chính thức |
| Mua/xây | Mua rồi quản lý bất cứ đất nào trong lượt | Chỉ mua/xây tại điểm dừng; lượt đầu tối đa cấp 2, sau một vòng cấp 3 | Cấu trúc cấp được cộng đồng mô tả; giá là **biến thể** |
| Khách sạn | Trọn nhóm, xây đều, 4 nhà rồi hotel | Cấp 4, phải quay lại ô đã có cấp 3 | Điều kiện quay lại và bảo vệ mua lại: **cộng đồng** |
| Mua lại | Không có, dùng giao dịch | Trả phí ghé thăm trước; tùy chọn mua lại ×2 vốn đất+công trình; chủ cũ nhận tiền | **Cộng đồng** cho trình tự/×2; cách tính vốn là **biến thể** |
| Chặn mua lại | Không áp dụng | Hotel và cả bốn điểm du lịch được bảo vệ | **Cộng đồng** |
| Phí ghé thăm | Rent cổ điển | Bảng phí 5 cấp, trọn nhóm ×2; lễ hội nhân thêm | ×2 nhóm: **cộng đồng**; bảng phí và nhân hệ số: **biến thể** |
| Điểm du lịch | Ga/tiện ích | Theo số điểm sở hữu: 25/50/100/200 đơn vị | Bốn điểm tạo kiểu thắng: **cộng đồng**; bảng phí là **biến thể** |
| Hoang đảo | Jail, phí 50 | Chờ tối đa 3 lần thử, đôi để rời, trả 200 hoặc dùng thẻ; lần ba tự rời không phạt thêm | Chờ/chi phí/thẻ: **cộng đồng**; cách giải quyết lần cuối là **biến thể** |
| Du lịch | Không có | Chọn ở lượt sau, trả 50 một lần; tới ô mua được chưa có chủ/của mình; tới nơi xử lý như bình thường | **Cộng đồng**; thiếu phí thì trở về tung thường là **biến thể** |
| Lễ hội | Không có | Chọn thành phố sở hữu, phí ×2, tổ chức lại tăng tới ×5, hiệu lực 8 lượt hoàn tất | Cơ chế chọn/tăng phí: **cộng đồng**; giới hạn/thời hạn và stacking là **biến thể** |
| Thuế | Hai ô mức cố định | 10% tổng vốn đất+công trình đang sở hữu, làm tròn lên | Ý tưởng % giá trị đất: **cộng đồng**; tính cả vốn xây và rounding là **biến thể** |
| Thẻ | Hai bộ 16 | Một bộ 12 thẻ riêng; Fisher–Yates server, escape giữ ngoài bộ | **Biến thể**, không sao chép bộ thẻ gốc |
| Thanh lý | Bán đều + thế chấp | Khi nợ, bán toàn địa điểm về ngân hàng nhận 50% vốn | **Biến thể**; chưa xác minh công thức hoàn vốn gốc |
| Đấu giá/thế chấp/đổi tự do | Có | Tắt cả command lẫn UI | Loại xung đột ruleset; không khẳng định mọi mode Business Tour đều giống nhau |
| Triple Monopoly | Không có | 3 nhóm màu hoàn chỉnh, mỗi nhóm có 2 hoặc 3 thành phố theo config | **Cộng đồng**. Không phải 3 ô liền kề hay 3 công trình |
| Side Monopoly | Không có | Sở hữu tất cả ô mua được trên một cạnh, gồm điểm du lịch | Khái niệm trọn cạnh: **cộng đồng**; danh sách chính xác theo map Việt Nam là **biến thể** |
| Tourist Monopoly | Không có | Sở hữu cả 4 điểm du lịch | **Cộng đồng** |
| Phá sản | Chuyển đất/chủ nợ, đấu giá ngân hàng | Tiền còn lại trả chủ nợ nếu có; mọi đất/công trình trả ngân hàng, bỏ lượt người bị loại | **Biến thể**, không tạo tiền âm |
| Giới hạn trận | Không có | 30 phút tuyệt đối, xếp tổng cash+vốn tài sản; bằng nhau ưu tiên ghế nhỏ | **Biến thể** để bảo đảm trận hữu hạn; không phải thông số official |

Các nhóm 2/3 thành phố dùng chung quy tắc cho cả địa danh Việt và ba thương hiệu. Mebieco/Mebifarm/Mebisoft nằm trên cùng cạnh cuối, nhóm 8 là nhóm 3 ô như các nhóm khác; không có điều kiện thắng đặc biệt dành riêng thương hiệu. Giá gốc và cấp cao nhất: Mebisoft > Mebifarm > Mebieco > các ô còn lại.

## State machine và deadline

`lobby → roll → buy/construct/takeover/destination/festival/debt → complete → roll → ended`.

Rolling, di chuyển và rút thẻ là chuyển tiếp nguyên tử trong một command server; presentation dùng event sequence để dựng animation, không cần client xác nhận. Snapshot có context điểm dừng, khoản phí đã trả và các lựa chọn đang chờ. Phí ghé thăm được trả xong trước khi bật mua lại; không ghi nợ hoặc trả trùng.

Timer: tung 60s, chọn 30s, complete 30s, nợ 120s. Hết mua/xây/mua lại/lễ hội thì bỏ qua; hết du lịch chọn ô hợp lệ có ID nhỏ nhất; hết nợ thanh lý theo ID tăng dần rồi thanh toán/phá sản. Match deadline 30 phút độc lập với phase deadline. Kiểm tra thắng sau mua/mua lại trước mọi bước tiếp theo. Kết quả xác định một lần, command kinh tế sau game over bị từ chối.

Server tick ưu tiên: phòng hết 30 phút toàn bộ offline → disconnect hết hạn → match deadline → phase deadline. Lobby giữ ghế 60s, trong trận 120s; toàn bộ offline giữ danh tính tối đa 30 phút, timer vẫn chạy. Reconnect không reset deadline hoặc RNG/deck. Màu/nhân vật/ghế cố định đến hết trận.

## Snapshot cũ và mã nguồn v1

`upgradeState` chỉ nhận trực tiếp schema 2 + ruleset đúng. Snapshot cũ được giữ nguyên trong `legacySnapshot` private của storage; không gửi archive, deck, token hay dedup lên client. Lobby/đã kết thúc chuyển về lobby mới và hủy ready. Trận cũ đang chạy chuyển phase `legacy`: không tiếp tục mô phỏng bằng luật mới. Chủ phòng bấm **Mở sảnh luật mới** để chủ động bắt đầu lại; giữ token, ghế, màu, nhân vật cho người còn kết nối. Không chuyển tài sản/tiền cũ sang map mới. Archive vẫn được lưu để đối chiếu, không có endpoint tải công khai.

Code v1 chỉ giữ để chạy regression lịch sử, không được bundle vào trang game hoặc Worker đang phục vụ. Các test mới xác nhận command đấu giá/thế chấp/giao dịch bị từ chối trong v2.

## Bố cục và asset

Map cung cấp `boardPosition`; cả render và engine dùng một nguồn. CSS grid 9×9 khai báo start/end của từng ô, minmax(0,1fr), center có span riêng. Không dựa vào intrinsic text để chia hàng/cột, không áp giới hạn chiều cao viewport làm ép bàn. Desktop bàn rộng tối đa 1.120px, khoảng 70–80% vùng nội dung. HUD 4 người phía trên, không có sidebar kinh tế. Mobile giữ bàn vuông, zoom/pan độc lập, Toàn cảnh reset camera, detail/mua/xây dùng action sheet.

`landmarks.ts` tạo SVG 2.5D nguyên bản cho núi, vịnh, cầu, phố cổ và ba khu thương hiệu; không dùng logo chính thức. Các SVG này là code, không thêm bucket/asset R2. Giữ bốn nhân vật và âm thanh synth hiện có. Không có pay-to-win, không sao chép asset hoặc giao diện từng pixel của Business Tour.
