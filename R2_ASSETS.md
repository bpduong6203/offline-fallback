# Ảnh Cloudflare R2

Binding `IMAGES` trong `wrangler.toml` dùng bucket `offline-fallback-images`. Người dùng xác nhận bucket **đã tạo**; không tạo bucket khác hoặc tạo lại. Chưa truy cập tài khoản để xác minh trực tiếp, chưa upload/deploy.

## Kiểm kê và phạm vi đã thống nhất

| Ảnh / nguồn | Cách sử dụng | Xử lý |
| --- | --- | --- |
| `tien-len/egg_icon.webp` (8.276 byte) | Icon tiền trứng trong số dư, phần thưởng và hiệu ứng Tiến Lên; trước đây nhúng base64 | Chuyển sang URL Worker/R2, giữ nguyên byte ảnh, class và style |
| `egg_currency.png` (2.488.900 byte) | Ảnh nguồn cho script tạo icon | Giữ source, không upload/xóa |
| `tien-len/egg_icon.png` (24.880 byte) | Chưa thấy tham chiếu runtime | Giữ nguyên, không tự chọn upload/xóa |
| Favicon SVG data URL trong `src/page/head.js` | Tab trình duyệt | Giữ nhúng theo phạm vi đã chọn |
| SVG nhân vật Ma sói/MebiMonopoly, hình Canvas/CSS | Render từ code, có tương tác/animation | Giữ trong source |
| Google Fonts | CSS/font ngoài | Không phải ảnh, giữ nguyên |

Rà source runtime, HTML và CSS chưa thấy ảnh tải từ URL HTTP(S) bên ngoài. Ảnh repo tham khảo được ignore, dependencies và screenshot QA trong `dist` không thuộc tài nguyên sản phẩm cần chuyển.

## Ánh xạ icon hiện tại

```text
File:       tien-len/egg_icon.webp
SHA-256:    e56a156104e0587da2cd13e1afed685ba5ed1136275a78b088d5dc9ed9a90f6f
R2 key:     images/tien-len/egg-icon.e56a156104e0.webp
Worker URL: /__assets/images/tien-len/egg-icon.e56a156104e0.webp
```

URL đầy đủ: `https://<subdomain>.mebidev.site/__assets/images/tien-len/egg-icon.e56a156104e0.webp`. Mọi chỗ render icon dùng chung `EGG_ICON_URL` trong `tien-len/egg-asset.js`; không đổi layout, kích thước, CSS hoặc logic tiền trứng.

## Lệnh Cloudflare thủ công

Các lệnh dưới đây **chưa được chạy**. Dùng đăng nhập Wrangler hoặc secret môi trường của tài khoản có quyền trên bucket, không đưa token vào source hay URL ảnh.

Kiểm tra danh sách bucket (read-only):

```powershell
npx.cmd wrangler r2 bucket list
```

Lệnh tạo chỉ dùng nếu sau này xác nhận bucket thật sự chưa tồn tại. **Hiện đã có bucket nên bỏ qua**:

```powershell
npx.cmd wrangler r2 bucket create offline-fallback-images
```

Upload đúng object trước khi deploy bản source mới:

```powershell
npx.cmd wrangler r2 object put "offline-fallback-images/images/tien-len/egg-icon.e56a156104e0.webp" --file "tien-len/egg_icon.webp" --content-type "image/webp" --cache-control "public, max-age=31536000, immutable" --remote
```

`object put` có thể ghi đè cùng key. Giữ key có hash bất biến: đổi byte ảnh thì dùng tên hash mới, không ghi ảnh khác vào key cũ. `scripts/gen-egg-asset.py` hiện sinh URL có SHA-256 từ WebP thay vì base64; chỉ chạy khi chủ động cập nhật/tạo lại icon, cần Pillow. Không cần chạy generator để upload ảnh hiện có.

Các bước cần làm thủ công:

1. Kiểm tra đúng tài khoản Wrangler và bucket hiện có; không tạo bucket mới.
2. Upload bằng lệnh trên, đối chiếu key và Content-Type trong dashboard R2.
3. Khi được phép triển khai, build và deploy Worker theo quy trình hiện tại. Không deploy code mới trước upload, nếu chưa có object icon sẽ trả 404.
4. Mở URL ảnh trên host Worker, xác nhận 200 / `image/webp`, mở Tiến Lên kiểm tra số dư và hiệu ứng thưởng.

Không cần bật Public Access/r2.dev, tạo custom domain cho bucket hoặc bật CORS để dùng ảnh cùng origin qua Worker. Bucket được đọc bằng binding; frontend không có khóa truy cập. Namespace `images/` là công khai qua route này, không đặt dữ liệu riêng tư có đuôi ảnh vào đó.

## Route, bảo vệ đường dẫn và cache

- Chỉ GET/HEAD; method khác trả 405. Không có route upload/list/delete công khai.
- Chỉ đọc namespace `images/`, segment ASCII và đuôi PNG/JPEG/WebP/GIF/AVIF/SVG/ICO. Chặn `..`, backslash, NUL, encoding lỗi/double encoding, segment rỗng, key quá 512 ký tự và extension khác.
- URL parser có thể chuẩn hóa dot-segment trước khi Worker nhận request. Sau chuẩn hóa, handler vẫn chỉ đọc key hợp lệ trong namespace công khai; không ánh xạ input sang filesystem.
- Thiếu ảnh trả 404 `no-store`; thiếu binding/lỗi R2 trả 503 `no-store`, không proxy origin hoặc trả trang game fallback.
- MIME theo extension để metadata sai không biến ảnh thành HTML; có `nosniff`, CSP sandbox cho SVG, ETag/Last-Modified, 304 theo If-None-Match/If-Modified-Since.
- Tên có hash hex 12–64 ký tự: `public, max-age=31536000, immutable`. Tên thường: browser 1 giờ, shared cache 1 ngày. Cache API lưu GET 200 theo origin + key; query không chọn object khác. Không cache 404/503.
- Key thường khi thay nội dung có thể giữ bản cũ hết TTL; ưu tiên tên hash mới. Edge cache và bucket thật chưa được xác nhận trên Cloudflare trong lần sửa này.

## Chạy local và kiểm tra

```powershell
node scripts/build-tienlen.mjs
npm.cmd run dev
npm.cmd test
npm.cmd run test:tienlen:browser
```

Server Node phục vụ URL icon từ manifest file cố định trong `scripts/local-assets.mjs` qua cùng handler HTTP; không truy cập Cloudflare và không đọc đường dẫn filesystem tùy ý.

Nếu cần tự kiểm tra R2 giả lập của Wrangler, nạp object **local**, không đổi tài khoản Cloudflare:

```powershell
npx.cmd wrangler r2 object put "offline-fallback-images/images/tien-len/egg-icon.e56a156104e0.webp" --file "tien-len/egg_icon.webp" --content-type "image/webp" --local
npx.cmd wrangler dev
```

Dùng cùng thư mục project/persistence giữa upload local và dev. Đây là hướng dẫn; chưa chạy Wrangler trong lần tích hợp này.

Tài liệu đã đối chiếu: [R2 Workers API](https://developers.cloudflare.com/r2/api/workers/workers-api-reference/), [Wrangler R2 commands](https://developers.cloudflare.com/r2/reference/wrangler-commands/).
