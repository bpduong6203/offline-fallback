# Luật MebiMonopoly

Đơn vị quy đổi: 1 đơn vị engine = 1.000 trứng. Các ô nhập đấu giá/giao dịch dùng số trứng thực tế; server tiếp tục lưu đơn vị nguyên để giữ tương thích phòng hiện có. Ba ô đắt nhất: MebiFarm (400.000 trứng), Mebisoft (350.000 trứng), MebiEco (320.000 trứng).

40 ô, 1.500.000 trứng/người, Xuất phát 200.000 trứng/vòng đi tiến. Đi lùi và đi thẳng vào tù không nhận lương. Hai xúc xắc server; đôi được tiếp tục sau giải quyết ô, ba đôi liên tiếp vào tù trước lần di chuyển thứ ba. Ra tù bằng đôi không có lượt thêm. Trả 50.000 trứng hoặc thẻ trước tung; lần thử thứ ba thất bại phải trả 50.000 trứng rồi đi theo tổng vừa tung, chờ giải quyết nợ trước nếu thiếu tiền.

Giá và bảng thuê theo `data.ts`. Nhóm màu đầy đủ gấp đôi thuê đất trống. Ga 25 × 2^(số ga−1). Tiện ích ×4 xúc xắc, có cả hai ×10. Thẻ ga gần nhất gấp đôi tiền thuê, thẻ tiện ích tung mới và ×10. Thế chấp không thu thuê. Người trong tù vẫn nhận thuê. Bãi đỗ xe không thưởng.

Mua trực tiếp khi đủ tiền, từ chối/thiếu tiền đưa ra đấu giá. Tất cả người chưa phá sản đều được bid, kể cả người từ chối. Giá đầu 10.000 trứng, tăng ít nhất 10.000 trứng, không vượt tiền mặt. 15 giây sau bid hợp lệ, giới hạn cứng 90 giây kể từ mở phiên. Không quản lý tài sản/giao dịch trong phiên. Mất kết nối không hủy bid. Không có bid thì ngân hàng giữ đất.

Xây cần trọn nhóm không thế chấp; xây đều, bán đều; 4 nhà rồi khách sạn. Ngân hàng 32 nhà/12 khách sạn, nâng khách sạn trả 4 nhà; hạ khách sạn cần 4 nhà khả dụng. Giá bán bằng nửa xây. Khi thiếu nhà để hạ khách sạn và không thể huy động tiền khác, thanh lý tự động sẽ phá sản; không tạo nhà vô hạn. Quản lý được trước tung hoặc sau giải quyết ô trong lượt mình, hoặc bán/thế chấp khi chính mình đang nợ. Không xây/chuộc khi nợ.

Thế chấp nhận nửa giá đất, phải bán hết công trình trong nhóm. Chuộc `ceil(giá đất/2 × 1,1)`. Giao dịch đất thế chấp: bên nhận trả ngay `ceil(giá đất × 0,05)` (10% tiền gốc thế chấp), giữ thế chấp; khi chuộc sau đó vẫn trả gốc +10%. Không chuyển đất có công trình trong nhóm. Giao dịch tiền/đất/thẻ là atomic, hai phía được kiểm tra lại lúc nhận; một đề nghị/phòng, tối đa 30 giây và không quá lượt. Sửa bằng hủy rồi tạo đề nghị ID mới, cần chấp nhận lại. Đề nghị hủy khi kết thúc lượt, có nợ hoặc một bên bỏ cuộc.

Hai bộ 16 thẻ, Fisher–Yates phía server. Thẻ thường trả cuối bộ; thẻ ra tù giữ bên ngoài, quay lại cuối bộ khi dùng/phá sản cho ngân hàng. Thẻ trả/nhận từng người giải quyết theo ghế, từng nghĩa vụ một; không ghi tiền âm. Thiếu tiền chuyển phase nợ, không tung/kết thúc lượt. Sau huy động tiền bấm Thanh toán; một nghĩa vụ chỉ ghi nhận một lần.

Phá sản cho người chơi: bán công trình về ngân hàng nửa giá xây, chuyển tiền/tài sản/thẻ cho chủ nợ. Đất thế chấp giữ nguyên; chủ nợ phải trả phí chuyển quyền 10% tiền thế chấp, cũng có thể vào phase nợ. Phá sản ngân hàng: trả công trình, trả thẻ, đưa đất vào hàng đợi đấu giá theo số ô tăng dần. Khi chỉ còn một người sống, kết thúc ngay, không tiếp tục đấu giá. Xếp hạng theo thứ tự phá sản; thời lượng và tổng thu/chi trong kết quả.

## Timer và reconnect

Deadline tuyệt đối lưu trong snapshot: mua 30s, chờ tung 60s, quản lý 60s, nợ 120s. Hết chờ tung server tự tung, hết mua chuyển đấu giá, hết quản lý kết thúc lượt hợp lệ. Nợ hết giờ: bán công trình theo level giảm dần rồi số ô tăng dần (chỉ hạ khách sạn nếu có nhà), thế chấp theo số ô tăng dần, trả đủ ngay khi có thể, nếu vẫn thiếu thì phá sản. Mỗi khoản nợ tiếp theo có deadline mới, không cộng dồn vô hạn cho cùng một nghĩa vụ. Alarm chạy cả khi không có client online.

Ưu tiên mỗi tick: đóng phòng sau 30 phút tất cả offline → xử lý người hết thời gian reconnect → hết đề nghị trade → deadline phase hiện tại. Lobby giữ ghế 60s, trong trận 120s; không đổi ghế/màu khi có người rời. Chủ lobby rời hẳn chuyển quyền cho ghế nhỏ nhất. Nếu toàn bộ người chơi offline, giữ danh tính tối đa 30 phút thay vì loại toàn bộ ở 120s; timer lượt vẫn chạy. Người đã phá sản có thể xem, không thao tác kinh tế. Host mở trận mới với người còn kết nối; giữ danh tính/ghế/màu, reset tài sản và ready.

## So với repo tham khảo

Tham khảo dữ liệu giá/thuê, loại thẻ và cách tính rent/build của intrepidcoder/monopoly, không mang DOM/jQuery/global state sang. Tên địa điểm, SVG/CSS, nhạc và code kiến trúc mới. Giữ một bộ luật rõ ràng: đấu giá đồng thời theo server deadline thay vì vòng bid UI; không cho số dư âm; hàng đợi nghĩa vụ, version/dedup, token reconnect và persistence/alarm. Bổ sung kiểm tra xây/bán đều và kho nhà khi hạ khách sạn.
