# ADR 0007 — Nguồn phiên âm IPA và gợi ý nghĩa

- **Trạng thái:** Proposed. **Chủ dự án chọn phương án B (API từ điển miễn phí).** Chưa được chuyển sang Accepted: phải kiểm tra điều khoản sử dụng và giới hạn gọi của nhà cung cấp, xem mục "Cổng kiểm tra trước khi Accepted".
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

## Quyết định

- **Đã chọn (chủ dự án, 2026-11-08):** phương án B, API từ điển miễn phí, gọi lúc người dùng nhập từ. Lý do: triển khai nhanh.
- **Nhà cung cấp:** dictionaryapi.dev (endpoint `https://api.dictionaryapi.dev/api/v2/entries/en/{từ}`, theo tài liệu thứ cấp; chưa xác nhận trực tiếp).
- **Giọng:** chưa quyết định (Anh-Anh hoặc Anh-Mỹ). API trả nhiều phiên âm; ưu tiên giọng đầu tiên có giá trị, và ghi rõ giọng khi hiển thị nếu xác định được.
- **Chỉ gửi từ cần tra** tới nhà cung cấp. Không gửi `UserId`, email, IP người dùng do server gọi, hay ngữ cảnh khác.

## Cổng kiểm tra trước khi Accepted

Chưa được xác minh (môi trường cloud của phiên này không truy cập được `dictionaryapi.dev`; kết quả tìm kiếm chỉ là thông tin thứ cấp). Trước khi Accepted, chủ dự án hoặc nhóm phải ghi kết quả kiểm tra trực tiếp:

| Mục | Cần xác nhận | Kết quả |
| --- | --- | --- |
| Điều khoản sử dụng | Có cho phép dùng trong sản phẩm thương mại và đăng ký tài khoản không | Chưa kiểm tra |
| Giấy phép dữ liệu | Có được hiển thị phiên âm và nghĩa cho người dùng; có ghi nguồn bắt buộc không | Chưa kiểm tra |
| Lưu đệm | Có được lưu kết quả trong database của Lingozi, và trong bao lâu | Chưa kiểm tra — **mặc định của thiết kế: không lưu đệm lâu dài**, chỉ dùng kết quả đã được người dùng chấp nhận (nằm trong `KnowledgeItems.Ipa`) |
| Giới hạn gọi | Số request tối đa mỗi phút/ngày, có cần API key không | Chưa kiểm tra |
| Độ sẵn sàng | Tài liệu thứ cấp và một dự án GitHub ghi nhận dịch vụ đôi khi không khả dụng hoặc bị giới hạn tốc độ | Cần đo trong staging; thiết kế đã xử lý bằng timeout 3 giây và trạng thái `sourceAvailable = false` |
| Nội dung | Có phiên âm và nghĩa cho cụm từ/ngữ pháp không (chỉ cần cho Từ vựng ở Vòng 1) | Chưa kiểm tra |

Nếu điều khoản không cho phép một trong các điểm trên, quay lại chọn phương án A hoặc C.

## Ràng buộc kỹ thuật (áp dụng mọi phương án)

- Sau interface `IWordReferenceProvider` (một hàm tra từ, trả phiên âm và nghĩa gợi ý), với implementation theo cấu hình environment.
- Timeout 3 giây. Lỗi nhà cung cấp không làm hỏng form: UI chỉ hiện gợi ý "Không lấy được phiên âm tự động" (`BR-LIB-015`).
- Lưu đệm kết quả theo từ đã chuẩn hóa để không gọi lặp lại (chỉ khi giấy phép cho phép).
- Log không ghi nội dung tra cứu gắn với người dùng.
- Test tự động dùng provider giả, chỉ có trong project test. Không dùng dữ liệu giả trong môi trường production.

## Trạng thái hiện tại

Theo `AGENTS.md` §6: US-LIB-08 và US-LIB-09 có trạng thái **integration ready** khi đã code abstraction và test với provider giả; **không** được ghi là hoạt động cho tới khi cổng kiểm tra ở trên đạt và provider thật được cấu hình. Form vẫn dùng được đầy đủ với phiên âm nhập tay.
