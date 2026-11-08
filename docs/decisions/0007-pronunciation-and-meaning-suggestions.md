# ADR 0007 — Nguồn phiên âm IPA và gợi ý nghĩa

- **Trạng thái:** Proposed. **Chưa chọn nguồn.** Chủ dự án cần quyết định trước khi làm US-LIB-08 và US-LIB-09 (FEAT-02).
- **Ngày:** 2026-11-08.
- **Liên quan:** [FEAT-02](../features/knowledge-items/README.md), `BR-LIB-013`, `BR-LIB-014`, `BR-LIB-015`, [ERD](../architecture/erd.md) (cột `Ipa`, `IpaSource`).

## Bối cảnh

Yêu cầu của chủ dự án (2026-11-08):

- Với từ vựng, hệ thống tự điền phiên âm IPA. Người dùng sửa được hoặc tự thêm nếu không có.
- Nghĩa được gợi ý khi nhập và không bắt buộc.

Repository chưa có nguồn dữ liệu từ điển nào. Chưa kiểm tra điều khoản sử dụng, giấy phép và giới hạn gọi API của bất kỳ nguồn nào, nên **không khẳng định** tính năng này hoạt động được cho đến khi có quyết định.

## Yêu cầu đối với nguồn (đề xuất)

1. Có phiên âm IPA cho tiếng Anh (tối thiểu giọng Anh-Anh hoặc Anh-Mỹ; chọn một).
2. Có nghĩa tiếng Anh hoặc tiếng Việt để làm gợi ý.
3. Giấy phép cho phép lưu trữ kết quả trong database của Lingozi, và ghi nguồn khi hiển thị. **Bắt buộc kiểm tra trước khi chọn.**
4. Chi phí và hạn mức phù hợp với quy mô MVP.
5. Chỉ gửi **từ cần tra** tới nguồn. Không gửi `UserId`, email hay nội dung khác của người dùng.

## Phương án

| Phương án | Ưu điểm | Nhược điểm / việc cần kiểm tra |
| --- | --- | --- |
| **A. Bộ dữ liệu mở (ví dụ Wiktionary, nạp offline)** | Không phụ thuộc mạng khi dùng; có thể lưu trữ; không gửi dữ liệu người dùng ra ngoài | Giấy phép CC BY-SA có yêu cầu ghi nguồn và chia sẻ lại; phải viết bộ nạp dữ liệu; chất lượng phiên âm không đều giữa các từ |
| **B. API từ điển miễn phí bên thứ ba, gọi lúc người dùng nhập** | Triển khai nhanh; có phiên âm và nghĩa | Điều khoản và giới hạn gọi cần kiểm tra; phụ thuộc dịch vụ bên ngoài; mỗi lần gõ là một lần gọi nếu không có bộ nhớ đệm |
| **C. API thương mại (từ điển có bản quyền)** | Chất lượng cao, ổn định | Có phí; thường cấm lưu đệm lâu dài; cần hợp đồng |

**Đề xuất của tôi:** phương án A cho MVP, vì lưu được lâu dài và không gửi dữ liệu người dùng ra ngoài. Cần chủ dự án xác nhận. Trong thời gian chờ, mọi phần khác của FEAT-02 vẫn làm được, và phiên âm được nhập tay.

## Quyết định (chờ)

- Nguồn được chọn: **chưa quyết định**.
- Giọng: **chưa quyết định** (Anh-Anh hoặc Anh-Mỹ).

## Ràng buộc kỹ thuật (áp dụng mọi phương án)

- Sau interface `IWordReferenceProvider` (một hàm tra từ, trả phiên âm và nghĩa gợi ý), với implementation theo cấu hình environment.
- Timeout 3 giây. Lỗi nhà cung cấp không làm hỏng form: UI chỉ hiện gợi ý "Không lấy được phiên âm tự động" (`BR-LIB-015`).
- Lưu đệm kết quả theo từ đã chuẩn hóa để không gọi lặp lại (chỉ khi giấy phép cho phép).
- Log không ghi nội dung tra cứu gắn với người dùng.
- Test tự động dùng provider giả, chỉ có trong project test. Không dùng dữ liệu giả trong môi trường production.

## Trạng thái khi chưa có quyết định

Theo `AGENTS.md` §6: US-LIB-08 và US-LIB-09 có trạng thái **integration ready** (đã viết code abstraction và test với provider giả), **không** được ghi là hoạt động. Form vẫn hoạt động đầy đủ với phiên âm nhập tay.
