# Tỷ Phú Mebi — luật hiện hành

**mebi-tour-mebi-v2**, schema **4**, theo tùy chỉnh Mebi ngày 30/10/2026; MD ngày 29/10 là tài liệu tham khảo gốc. Thay thế bảng đối chiếu luật v2 trước đó.

- [Đặc tả gốc](business-tour-game-algorithms.md)
- [Preset Mebi và lệnh kiểm tra](../mebi-monopoly/RULES.md)
- Cấu hình: `mebi-monopoly/tour-data.ts`; engine: `spec-engine.ts` qua facade `tour-engine.ts`.

Giữ map Việt Nam 32 ô, Mebisoft/Mebifarm/Mebieco là ba ô đắt nhất. Bộ ba phải đúng ba ô cùng nhóm; nhóm hai ô không tính. Các tham số MD chưa ấn định (bảng giá map, phí đảo/du lịch, hệ số/thời hạn sự kiện) dùng preset ghi trong RULES.

Không deploy/thay đổi tài khoản Cloudflare. Binding R2 IMAGES và route ảnh giữ nguyên; nhà và xúc xắc dùng SVG/CSS trong source, không cần upload ảnh.

Luật mới nhất theo tùy chỉnh Mebi ngày 30/10/2026: [RULES.md](../mebi-monopoly/RULES.md). Các khác biệt với MD gốc (lượt thưởng, máy bay, kinh tế và động đất) được ghi rõ ở đó.
