# Phiên 2026-11-08 · 13 · FEAT-02: hai loại và nguồn từ điển B

- Ngày / múi giờ: 2026-11-08, UTC.
- Mục tiêu do người dùng yêu cầu: chọn phương án B (API từ điển miễn phí) cho phiên âm và gợi ý nghĩa; chỉ cần hai loại Từ vựng và Ngữ pháp.
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` tại `31ad441`.
- Status: PARTIAL. Thiết kế đã cập nhật; chưa code; cổng kiểm tra điều khoản **chưa đạt**.

## Kết quả và file liên quan

- Chỉ còn hai loại ở Vòng 1: Từ vựng (`word`) và Ngữ pháp (`grammar`).
  - Sửa: user stories (AC-01, 04, 05, 08), SRS (BR-LIB-002, 012, 013; FR-LIB-ITEM-007, 008), API (`item-kinds`, ví dụ), luồng, wireframe W-LIB-02a và W-LIB-02, test case (TC-LIB-002, 003, 033, 036, 044, 050), ERD (`Kind IN (1, 5)`), brainstorm quyết định 14, README của tính năng.
- `docs/decisions/0007`: chọn phương án B; thêm **cổng kiểm tra trước khi Accepted** gồm điều khoản, giấy phép, lưu đệm, giới hạn gọi, độ sẵn sàng, nội dung.
- Mục lục ADR và STATUS cập nhật.

## Quyết định và giả định

- **Chủ dự án quyết định (2026-11-08):** dùng API từ điển miễn phí (B); Vòng 1 chỉ có Từ vựng và Ngữ pháp.
- **Thiết kế mặc định (chờ xác nhận sau khi kiểm tra điều khoản):** không lưu đệm lâu dài kết quả của nhà cung cấp; chỉ lưu phiên âm người dùng chấp nhận vào mục của họ; chỉ gửi từ cần tra.
- **Nhà cung cấp:** dictionaryapi.dev, endpoint `https://api.dictionaryapi.dev/api/v2/entries/en/{từ}`, lấy từ tài liệu thứ cấp.

## Kiểm tra

- **Điều khoản và giới hạn gọi: CHƯA KIỂM TRA.** Máy cloud không truy cập được `dictionaryapi.dev` (lỗi DNS, cần cho phép host trong cài đặt mạng). Tìm kiếm web chỉ cho thông tin thứ cấp từ trang tổng hợp và một dự án GitHub, không đủ để kết luận; một nguồn ghi nhận dịch vụ đôi khi không khả dụng hoặc bị giới hạn tốc độ.
- Script truy vết AC → TC: 45/45 AC, 50 TC.
- Kiểm tra liên kết trong `docs/`.
- Không có code, không chạy build hay test.

## Database/API/UI

- **Database (thiết kế):** `KnowledgeItems.Kind` CHECK `IN (1, 5)`; thêm `Ipa`, `IpaSource`; `Meaning` null.
- **API (thiết kế):** `GET /api/library/item-kinds` trả hai loại; `GET /api/library/suggestions` gọi nguồn có timeout 3 giây.
- **UI (thiết kế):** hai thẻ chọn loại.

## Security checks

- Gửi tới nhà cung cấp chỉ có từ cần tra; không có `UserId` hay email (ADR 0007).
- Phiên âm do người dùng nhập bị kiểm tra ký tự (TC-LIB-041).
- Gợi ý chỉ lấy dữ liệu của chính người dùng và nguồn từ điển (TC-LIB-047).

## Việc còn lại và vướng mắc

- **Cổng ADR 0007 (bắt buộc trước khi tuyên bố US-LIB-08/09 hoạt động):** chủ dự án hoặc nhóm mở `dictionaryapi.dev` (hoặc kiểm tra trên trình duyệt) để đọc điều khoản và giấy phép; ghi kết quả vào bảng trong ADR 0007. Nếu cần cho phép host này trong cài đặt mạng của môi trường cloud, dùng công cụ cài đặt môi trường.
- Chủ dự án duyệt FEAT-01 và FEAT-02 để đạt DoR.
- Giọng phiên âm Anh-Anh hay Anh-Mỹ: chưa quyết định.

## Bàn giao

- Việc tiếp theo: chạy cổng kiểm tra điều khoản ADR 0007; duyệt thiết kế; sau đó code FEAT-01, rồi FEAT-02.
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`.
