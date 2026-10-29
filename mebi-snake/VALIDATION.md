# Kết quả kiểm tra — 29/10/2026

- Build toàn project: qua. Bundle Worker bằng esbuild, HTML text loader: qua; có cảnh báo duplicate `name` đã có ở `bang-bang-engine.js`, không chỉnh game đó.
- Kiểm tra TOML bằng Python tomllib: tag migration không trùng, hai binding Snake đúng class; bucket R2 hiện có giữ nguyên.
- Toàn bộ Node tests: **182/182 qua** với `node --test --test-timeout=15000 tests/*.test.mjs`. Bộ riêng Snake **15/15 qua**, gồm matchmaking đồng thời/retry, reservation, boost, food, collision, spawn, disconnect, snapshot ACK và restart.
- Browser: qua. Hai context độc lập điều khiển rắn thật bằng mouse events/Space; vòng tròn nhỏ, resize, Pointer Events hai ngón, reload cùng snake ID, chết do server xác nhận và respawn cùng arena. Ba context mạng giả lập RTT 50/100/200 ms + jitter + bỏ 12% snapshot ở tầng ứng dụng; có thử CPU throttling ×4. Không runtime exception sau khi sửa trường hợp reconnect chưa có snapshot.

## Load test thật

11 WebSocket clients, giữ 10 slot ở arena 1, client 11 vào arena 2. Không bot trong sản phẩm; script chỉ phát input từ client kiểm thử.

| Case | Thời gian | Snapshot nhận | p95 tick | Tick lớn nhất | Khoảng snapshot trung bình |
| --- | --- | --- | --- | --- | --- |
| Spawn thông thường | ~7 giây | 868 | 3,88 ms | 31,73 ms | 89,58 ms |
| Mass tối đa, có ACK window | ~7 giây | 880 | 6,86 ms | 9,41 ms | 88,50 ms |

Case dài dùng fixture mass/path trong process test, không có API admin/seed production. Tất cả 11 rắn còn sống ở cuối lần chạy này; slot không vượt 10/arena, path không tăng vô hạn. Đây là phép đo trên máy local, không phải SLA Cloudflare.

## Render và giới hạn

Chrome headless tắt GPU, nhiều context: bản ghi bình thường khoảng **39,9 FPS**, các context mạng giả lập khoảng **30–48 FPS**; RTT đo thực tế gồm overhead chạy test nên lớn hơn mức delay đặt vào. Snapshot trung bình thực đo ~79–185 ms theo case. **Chưa xác nhận mục tiêu 60 FPS hoặc đủ 15 snapshots/giây ổn định** trên máy phổ thông; cấu hình 30/15 Hz là mục tiêu scheduler. Nút giảm hiệu ứng hạ DPR và glow; cần profiling GPU/device thực trước khi tuyên bố đạt 60 FPS.

Chưa deploy, chưa thử Cloudflare production, Internet công khai hoặc điện thoại vật lý. Live arena không persist qua restart, người chơi nhận thông báo vào lại; matcher directory/affinity có persistence. Không thay đổi tài khoản Cloudflare, không upload asset hoặc tạo bucket.

Artifacts local trong `dist/mebi-snake/`: `menu-qa.png`, `playing-qa.png`, `mobile-qa.png`, `result-qa.png`, `load-test.json`, `load-test-long.json`, `browser-metrics.json`, `tests.txt`, `snake-tests.txt`.
