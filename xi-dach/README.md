# Xì Dách · Bàn Công đức

Game xì dách Việt Nam multiplayer thực, tích hợp vào Cloudflare Worker hiện có. Bàn 1–8 người thật và 1 bot nhà cái riêng. Tất cả công đức là tiền tệ ảo, không nạp/rút/đổi thưởng.

## Ví Công đức Mebi

Nhập **Số công đức gốc muốn trả**, rồi bấm **Trả nợ** để trả từng phần hoặc toàn bộ. Tổng trừ = số gốc nhập × **1,4** (gốc + lãi 40%), làm tròn lên; nhập 50 thì trừ 70 và dư nợ giảm 50. Số gốc là số nguyên từ 1 đến dư nợ hiện tại. UI hiện riêng gốc, lãi và tổng trước khi bấm, khóa nút khi chưa đủ điểm. API tự tính phí và ghi giao dịch nguyên tử; thử lại cùng mã không trừ lần nữa. Cơ chế làm việc thiện trả nợ bên Chùa giữ nguyên.

Nút **Vay 100 công đức** cấp đúng 100 điểm có thể cược và ghi thêm 100 dư nợ, tối đa 10.000 dư nợ trên cùng ví cookie. Khoản vay và mã giao dịch được lưu nguyên tử ở profile MERIT hiện có; gửi lại cùng mã không vay thêm lần nữa. Không thêm binding hoặc migration. Trình duyệt chỉ lưu mã yêu cầu đang chờ để thử lại, không lưu số dư hay khoản nợ riêng.

Ví trả về `balance` (điểm có thể dùng, không âm), `debt` và `netBalance = balance - debt` (có thể âm). `MebiMerit.get()` giữ ý nghĩa số dư có thể dùng; `getDebt()` đọc nợ và `getNet()` đọc số ròng. Chùa hiển thị số ròng. Vay rồi tiêu hết 100: Chùa hiện −100; lạy kiếm +1: nợ còn 99 và Chùa hiện −99. Điểm thưởng qua API công khai ưu tiên trả nợ, phần vượt dư nợ mới vào số dư có thể dùng. Hoàn cược và trả thưởng game qua giao dịch nội bộ vẫn vào số dư có thể dùng để không trừ mất tiền hoàn cược. Hạn mức được mở lại khi đã trả đủ phần nợ cần thiết.

Thưởng Chùa dùng `MebiMerit.reward(action)` và mức thưởng/cooldown do server xác nhận: lạy +1 mỗi 5 giây, thắp hương +2 mỗi 60 giây, gõ mõ +1 mỗi 5 giây. Thưởng ưu tiên trả nợ. Chùa chờ ví tải xong và cập nhật số ròng theo sự kiện. Nếu API không tải được, báo lỗi thay vì tạo ví localStorage thay thế.

Xì Dách dùng số dư Công đức chung để cược, không cấp 100.000 điểm mới và không chuyển trứng cũ sang Công đức. Game dùng Worker chính, `/merit.js`, `/api/merit` và binding `MERIT` hiện có; không thêm Durable Object, binding hoặc migration. Các phòng Công đức dùng tên nội bộ `merit:` để tách khỏi các ván trứng cũ.

Trình duyệt chờ `MebiMerit.ready`, đọc `get()`, nghe `mebi-merit-change` và làm mới bằng `change(0)` sau thay đổi cược/quyết toán hoặc khi trở lại tab. Số dư không được lưu trong localStorage; chỉ tùy chọn giao diện và token ghế được lưu. ID ví lấy từ cookie ẩn danh, không lấy từ tên hoặc dữ liệu người chơi gửi lên.

Server kiểm tra và trừ phần cược tăng thêm, hoàn phần cược giảm/hủy, trả 2 lần mức cược khi thắng và hoàn 1 lần khi hòa. Giao dịch được lưu kèm khóa chống lặp trong profile MERIT hiện có; phòng lưu ý định trước khi giao dịch và thử lại bằng cùng khóa khi lỗi. Không đủ Công đức sẽ từ chối cược; lỗi lưu sẽ hiện thông báo. Số dư trong trạng thái bàn chỉ là bản đồng bộ phục vụ luật cược; ví MERIT là nguồn số dư chính.

Cookie `Domain=mebidev.site` dùng chung giữa các subdomain. Điều này cần các hostname được trỏ tới cùng Worker và dùng cùng cấu hình `MERIT`/khóa cookie. Kiểm thử local giả lập hai hostname xác nhận dùng chung số dư; chưa xác minh DNS hoặc deployment thật. Node local chạy cùng API/profile SQL trong SQLite RAM, không ghi số dư production.

API công khai từ chối cộng điểm tùy ý qua `change(delta > 0)`; Chùa nhận thưởng qua `/api/merit/reward` với cooldown phía server. Giao dịch cược/quyết toán Xì Dách được server xác nhận và khoản vay giữ khóa chống lặp.

## Chạy local

Tại thư mục gốc repository, dùng Node.js 24+:

```powershell
npm.cmd ci
npm.cmd run dev
```

Mở **http://localhost:5173/xi-dach**, nhập tên và bấm **Vào chơi ngay**. Server tự xếp tối đa 8 người mỗi phòng, không kể bot nhà cái; người thứ 9 sang phòng mới. Tải lại trang giữ nguyên ghế bằng token đã lưu. Không còn giao diện tạo phòng hoặc nhập mã phòng.

Bàn tự mở cược trong 60 giây; khi tất cả đã cược, thời gian còn lại rút xuống tối đa 10 giây. Hủy cược hoặc có người mới vào sẽ khôi phục hạn cược ban đầu. Mỗi lượt thao tác có 60 giây. Khi tất cả người chơi hoàn thành lượt, đếm ngược 10 giây rồi nhà cái xử lý và quyết toán. Nếu không ai cược, bàn tự mở đợt cược tiếp theo. Bài của bạn, đồng hồ và nút cược/rút/dằn luôn được ghim ở cạnh dưới màn hình trên desktop/mobile.

Trên LAN mở `http://<IP-máy-chạy-server>:5173/xi-dach`; cần máy chủ cho phép kết nối cổng 5173. Các tab cùng hồ sơ trình duyệt dùng chung cookie ví và token ghế; dùng cửa sổ riêng tư/hồ sơ khác cho người chơi thứ hai. Local server giữ dữ liệu trong RAM, chỉ giữ qua refresh/reconnect, không giữ khi khởi động lại tiến trình.

## Build và kiểm tra

```powershell
npm.cmd run build
npm.cmd test
npm.cmd run test:xidach:browser
```

Build sinh `dist/xi-dach/index.html` và `src/page/games/xi-dach.generated.js`. Không sửa trực tiếp các file sinh. Kiểm thử browser cần Chrome/Edge, hoặc đặt `CHROME_PATH`; chạy headless hai browser context độc lập và thêm sáu kết nối WebSocket để kiểm tra bàn đủ tám người. Ảnh kiểm tra được lưu tại `dist/xi-dach/mobile-check.png` và `desktop-check.png`.

## Kiến trúc

- `rules.js`: cấu hình `RULES`, liệt kê mọi tổng A (1/10/11), phân loại bài, so bài, kiểm tra cược, xáo Fisher–Yates bằng Web Crypto với rejection sampling. Không dùng `Math.random` cho bài.
- `engine.js`: trạng thái phòng, ghế, cược, bộ bài, lượt, thời hạn tuyệt đối, khoản giữ công đức, quyết toán và snapshot theo quyền xem bài. Đơn vị lưu là số công đức thực tế nguyên: `1000` là 1.000 công đức.
- `service.js`: hàng đợi tuần tự chung cho socket và timer, danh tính gắn với kết nối, token reconnect do server cấp. Lưu trạng thái trước khi gửi snapshot. Client không được chọn playerId; action gồm roomId, roundId, actionId, type và payload.
- `src/xi-dach-room.js`: Durable Object `XiDachRoom`, lưu toàn bộ trạng thái trong storage riêng của phòng, dùng alarm để tiếp tục timer kể cả không có người kết nối. Token, bài úp và deck không đi vào snapshot công khai. Token reconnect gửi trong hello qua WebSocket, không đặt trong URL.
- `client.js`, `style.css`, `index.html`: bàn xanh đậm, tám ghế người chơi, bot phía trên, bản thân phía dưới, bộ cược công đức, bảng kết quả cuộn, lịch sử 10 ván, luật chơi, bật/tắt âm báo, giảm chuyển động.
- `scripts/local-xidach.mjs`: adapter Node WebSocket dùng chung engine/service với Worker. Các game và route cũ được giữ nguyên.

Các route: `/xi-dach`, `/xi-dach/`, `/__game/xi-dach`; socket `/__game/xi-dach/ws?room=ABC234`. Worker giữ cơ chế đăng nhập thư viện hiện có nếu cấu hình `HOME_SESSION_SECRET`, đồng thời kiểm tra Origin của WebSocket. Không cần Node/Socket.IO riêng trên production vì repository đang dùng Workers.

## Luật và quỹ

Thứ hạng: xì bàn > xì dách > ngũ linh > bài thường > quắc. Cùng ngũ linh: tổng thấp hơn thắng. Bài thường: tổng cao hơn thắng. Cùng xì bàn/xì dách, ngũ linh cùng tổng, bài thường cùng tổng: hòa. Cả người chơi và bot cùng quắc thì hòa, hoàn cược; chỉ người chơi quắc thì thua. Người chơi được dằn từ 16; bot rút dưới 17, dằn từ 17. Đạt 21 hoặc đủ 5 lá tự khóa. Bot có bài đặc biệt thì so ngay; người chơi có bài đặc biệt tự khóa nhưng giữ kín tới showdown.

`decideBot(cards, rules)` chỉ nhận bài bot và cấu hình công khai; không nhận deck, bài người chơi, cược hoặc số dư. Khoảng nghỉ rút mặc định 800 ms.

Số dư người chơi lấy từ ví Mebi dùng chung, quỹ bot 10.000.000 công đức/phòng. Cược 10–10.000 công đức, bội số 10. Đặt cược trừ ngay số dư khả dụng của cả hai bên và giữ `2 × bet`. Đổi cược hoàn khoản giữ cũ rồi giữ khoản mới sau khi kiểm tra khả năng chi trả. Hủy cược hoàn cả hai bên. Thắng chuyển cả khoản giữ cho người chơi, thua chuyển cho bot, hòa mỗi bên nhận lại cược. Mọi thắng trả 1:1.

Bất biến engine kiểm tra sau thay đổi:

```text
quỹ bot khả dụng + tổng số dư người chơi + 2 × tổng cược đang giữ
= 10.000.000 + tổng điều chỉnh khi đồng bộ số dư ví vào bàn
```

Quyết toán xóa khoản giữ và chỉ chạy trong giai đoạn SETTLEMENT. actionId chống xử lý lặp; action sai phòng/ván/giai đoạn/lượt bị từ chối. Người vào giữa ván không được thêm vào danh sách đang chơi. Một bộ 52 lá mới mỗi ván đủ dung lượng 45 lá cho 9 bên × 5 lá.

## Trạng thái bàn giao và giới hạn

- Đã chạy thành công: build, Worker bundle, `npm.cmd test` (224/224), `npm.cmd run test:xidach:browser` và `git diff --check`. Bài `npm.cmd run test:browser` hồi quy chung bị timeout CDP `Runtime.evaluate` trong lần kiểm tra tích hợp Công đức; chưa xác nhận hồi quy chung qua trình duyệt.
- Bộ test engine/service kiểm tra solo, tám ghế, từ chối ghế thứ chín, A, bài đặc biệt, bot, cược sai, escrow, timeout, trùng action, giấu bài, reconnect và restore Durable Object.
- Browser đã kiểm tra hai phiên độc lập qua đầy đủ vòng chơi, refresh giữa ván, ván tiếp theo, tám người thật kết nối, bảo toàn công đức và UI desktop/mobile. Sáu trong tám kết nối của bài browser test được tự động điều khiển qua WebSocket; hai kết nối thao tác qua UI Chrome.
- Chưa deploy, chưa kiểm tra qua Internet hoặc trên điện thoại thật. Migration `v13` và binding `XIDACH` đã thêm vào `wrangler.toml`; cần chạy quy trình triển khai Worker của dự án khi muốn đưa lên mạng.
- Ghế được giữ cho reconnect trong suốt đời phòng; phiên bản này chưa có đuổi người/thu hồi ghế hoặc xóa phòng. Bộ xếp phòng giữ chỉ số phòng trong Durable Object và cấp ghế tuần tự để không vượt 8 người. Không có cơ chế bổ sung công đức khi người chơi hết số dư.
- Danh tính là token lưu theo trình duyệt và phòng, không phải ví công đức toàn tài khoản. Xóa dữ liệu trình duyệt sẽ mất token cũ. Production lưu quỹ/phòng trong Durable Object; local RAM không mô phỏng độ bền sau khi tắt Node.
