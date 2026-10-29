# MebiMonopoly

Game Cờ Tỷ Phú online 2–4 người, tiếng Việt, tại `/ty-phu` (alias `/__game/mebi-monopoly`). Nút trên trang fallback dùng cùng `tab tab-link` với các game sẵn có. Không triển khai tự động.

## Chạy local

Node 20+, `npm.cmd install`, `npm.cmd run build`, rồi `npm.cmd run dev`. Mở `http://localhost:5173/ty-phu`. Thiết bị cùng LAN mở `http://<IP-máy-chạy-server>:5173/ty-phu`; cho phép TCP 5173 qua firewall khi cần. Một người tạo phòng, gửi mã sáu ký tự hoặc link mời; mỗi người chọn nhân vật và sẵn sàng, chủ phòng bắt đầu. Không có bot hoặc hot-seat.

Frontend TypeScript được esbuild đóng thành HTML độc lập. `data.ts` chứa bàn cờ, thẻ, cấu hình luật. `engine.ts` độc lập UI/network, dùng RNG server có thể inject khi test. `service.ts` dùng chung giữa Node và Durable Object. Hai module `src/monopoly-*.generated.js` và HTML được sinh khi build; không sửa trực tiếp.

Node local ghi snapshot bằng temp-file + rename vào `.monopoly-local/` (gitignored). Startup đọc các phòng và khởi động timer kể cả chưa có client. Chỉ chạy một process local với cùng thư mục lưu trữ. Không dùng Node server này thay cho hệ thống nhiều instance production.

## Cloudflare Worker

`worker.js` phục vụ HTML và chuyển `/api/monopoly/:code/*` tới namespace `MONOPOLY`. `MonopolyRoom` là một Durable Object cho mỗi mã phòng. Binding và migration SQLite `v7` đã khai báo trong `wrangler.toml`; giữ nguyên mọi migration cũ. Build trước khi dùng Wrangler. Để chạy đúng môi trường Worker với storage/alarm: `npx.cmd wrangler dev --ip 0.0.0.0 --port 8787` (cần Wrangler được cài hoặc cho phép tải qua npx). Sau khi dừng rồi chạy lại, dùng cùng storage local của Wrangler để giữ phòng.

Mọi fetch, message, disconnect và alarm đi qua hàng đợi serial. Snapshot bao gồm state, deck bí mật, command dedup và deadline tuyệt đối được lưu trước broadcast. Alarm kiểm tra deadline mỗi giây. WebSocket thường giữ isolate sống; restart isolate đánh dấu kết nối cũ offline, người chơi xác thực lại bằng token để khôi phục. Không reset deadline lượt. Token chỉ trả trong response tạo/join và truyền qua message xác thực, không đưa vào URL, log hoặc snapshot công khai. Production cần HTTPS/WSS.

Session trong `sessionStorage` theo tab, cài đặt cá nhân và tên trong localStorage. Tải lại cùng tab khôi phục danh tính. Không chuyển phiên giữa trình duyệt/thiết bị; link mời chỉ để join, không mang token. Không xóa dữ liệu trình duyệt nếu cần reconnect.

Worker giới hạn create 10/phút/IP, join/resume 30/phút/IP qua một DO limiter; service giới hạn 20 command/10 giây/người, 30 auth/10 giây/phòng. Node local dùng giới hạn service; không có limiter theo IP ở local. Command có roomId, commandId, expectedVersion. Lệnh trùng được bỏ qua; state cũ bị từ chối và gửi snapshot mới, người dùng có thể thử lại. Server không nhận kết quả xúc xắc từ client.

## Kiểm tra

```sh
npm.cmd run build
npm.cmd run check:monopoly
npm.cmd test
npm.cmd run test:monopoly:browser
```

Browser test dùng Chrome/Edge headless và bốn browser context độc lập. Test tạo/join/ready/start, mua, thuê, đấu giá, trade, reload reconnect và mobile. Các tình huống kinh tế được chuẩn bị trực tiếp trong process test qua tham chiếu service, không có endpoint seed/fixture trong production. Test lưu ảnh tại `dist/mebi-monopoly/{desktop,mobile}-qa.png`. Unit/integration test bao gồm giả lập storage và restart DO; không thay cho việc xác nhận hạ tầng Cloudflare thật.

## Giới hạn cần biết

- Chưa xác nhận trên Cloudflare thật, thiết bị di động vật lý hoặc mạng Internet công khai. Không tự deploy.
- Đồ họa SVG/CSS nguyên bản, không WebGL. Có xúc xắc lắc, token đi ô, lật thẻ, chuyển tiền, nhấn sáng khi xây/mua và token nhảy mừng. Hiệu ứng 2D tối giản; không có bộ động tác riêng cho từng nhân vật. Nhạc nền là giai điệu synth tối giản.
- Âm nhạc và font ngoài cần tương tác/mạng tương ứng; font hệ thống vẫn dùng được nếu Google Fonts không tải.
- Room code đã đóng không được tái sử dụng; storage snapshot không tự xóa để phục vụ điều tra/khôi phục. Cần chính sách lưu trữ khi vận hành lâu dài. Limiter tập trung phù hợp quy mô nhỏ.

Luật chi tiết, timer và khác biệt tham khảo: [RULES.md](RULES.md). Nguồn và giấy phép: [THIRD_PARTY_NOTICES.md](../THIRD_PARTY_NOTICES.md).
