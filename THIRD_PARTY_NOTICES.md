# MebiMonopoly — nguồn tham khảo

Repository: https://github.com/intrepidcoder/monopoly

Commit được đọc: `3537fc393930f1712e8b4d6fbe2e80b25419ceed` (master, lấy ngày 2026-10-29).

- `classicedition.js`: vị trí 40 ô, giá mua, bảng thuê sáu cấp, giá xây theo nhóm, danh mục hai bộ 16 thẻ. Dữ liệu số và loại hiệu ứng được chuyển thành dữ liệu TypeScript trong `mebi-monopoly/data.ts`; tên và lời thẻ được Việt hóa riêng.
- `monopoly.js`: tham khảo `advance`, `gotojail`, `advanceToNearestUtility`, `advanceToNearestRailroad`, `streetrepairs`, `buyHouse`, `sellHouse`, `mortgage`, `roll`, cùng luồng đấu giá. `mebi-monopoly/engine.ts` viết mới, không sao chép DOM/jQuery, AI hoặc global state. Đọc các hàm trên để đối chiếu tiền qua Xuất phát, thuê đặc biệt, công trình và jail; kiểm thử hành vi độc lập.
- `LICENSE`: MIT, giữ toàn văn trong [mebi-monopoly/REFERENCE_LICENSE.txt](mebi-monopoly/REFERENCE_LICENSE.txt).

Copyright 2013-2020 Daniel Moyer

Đồ họa nhân vật SVG, layout CSS, địa danh hư cấu và giai điệu synth được tạo riêng cho MebiMonopoly. Không sử dụng hình ảnh, âm thanh hoặc nhãn hiệu đồ họa từ repo tham khảo.

Dependency mới để build: TypeScript (Apache-2.0), esbuild (MIT). Runtime local tiếp tục dùng `ws` (MIT). Giấy phép dependency nằm trong package tương ứng của `node_modules`; package-lock khóa phiên bản. Font Be Vietnam Pro được tải tùy chọn từ Google Fonts, có font hệ thống dự phòng; font không được đóng gói vào source.
