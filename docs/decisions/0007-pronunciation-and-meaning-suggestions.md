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
- **Giọng: Anh-Anh (chủ dự án chọn, 2026-11-08).** API không gắn nhãn giọng trong trường text; chỉ file âm thanh có hậu tố `-uk.mp3` / `-us.mp3`. Quy tắc: chỉ tự điền phiên âm đi kèm file `-uk.mp3` (BR-LIB-013). Không có thì để trống.
- **Độ phủ đo được (2026-11-08, 13 từ mẫu):** có phiên âm Anh-Anh cho 6 từ (water, tomato, hello, book, apple, beautiful); không có cho 7 từ (learn, improve, vocabulary, pronunciation, run, schedule, give up). Khoảng một nửa từ vựng sẽ phải nhập tay. Thiết kế đã xử lý bằng ô nhập tay; cần đo trên bộ từ thật của người dùng.
- **Giấy phép đã xác minh từ phản hồi API:** `license = CC BY-SA 3.0`, `source = en.wiktionary.org`. Yêu cầu: ghi nguồn khi hiển thị (đã thiết kế). **Chưa được luật sư hoặc chủ dự án xem xét** về việc lưu phiên âm vào database của Lingozi có thuộc phạm vi "chia sẻ lại theo cùng điều kiện" (share-alike) của CC BY-SA 3.0 hay không. Đây là câu hỏi pháp lý cần quyết định trước khi Accepted.
- **Giới hạn gọi (từ header phản hồi):** `x-ratelimit-limit: 450`, kèm `x-ratelimit-reset`. Đơn vị thời gian của giới hạn chưa được ghi rõ; cần đo.
- **Điều khoản sử dụng:** trang chủ không có mục điều khoản hay giấy phép riêng ngoài thông tin trong phản hồi API; chưa tìm được trang ToS. Chưa xác minh được.
- **Chỉ gửi từ cần tra** tới nhà cung cấp. Không gửi `UserId`, email, IP người dùng do server gọi, hay ngữ cảnh khác.

## Cổng kiểm tra trước khi Accepted

Chưa được xác minh (môi trường cloud của phiên này không truy cập được `dictionaryapi.dev`; kết quả tìm kiếm chỉ là thông tin thứ cấp). Trước khi Accepted, chủ dự án hoặc nhóm phải ghi kết quả kiểm tra trực tiếp:

| Mục | Cần xác nhận | Kết quả |
| --- | --- | --- |
| Điều khoản sử dụng | Có cho phép dùng trong sản phẩm thương mại và đăng ký tài khoản không | Chưa tìm được trang điều khoản; cần hỏi nhà cung cấp hoặc chủ dự án đánh giá |
| Giấy phép dữ liệu | Có được hiển thị phiên âm và nghĩa cho người dùng; có ghi nguồn bắt buộc không | Phản hồi API ghi CC BY-SA 3.0 (Wiktionary): ghi nguồn bắt buộc; **share-alike cần pháp lý xem xét** |
| Lưu đệm | Có được lưu kết quả trong database của Lingozi, và trong bao lâu | Chưa kiểm tra — **mặc định của thiết kế: không lưu đệm lâu dài**, chỉ dùng kết quả đã được người dùng chấp nhận (nằm trong `KnowledgeItems.Ipa`) |
| Giới hạn gọi | Số request tối đa mỗi phút/ngày, có cần API key không | Header `x-ratelimit-limit: 450`, đơn vị thời gian chưa rõ; không cần key (quan sát) |
| Độ sẵn sàng | Tài liệu thứ cấp ghi nhận dịch vụ đôi khi không khả dụng | Các lần thử từ máy cloud đều trả 200; cần đo trong staging. Thiết kế có timeout 3 giây và `sourceAvailable = false` |
| Độ phủ Anh-Anh | Tỷ lệ từ vựng có phiên âm Anh-Anh | ~6/13 từ mẫu; cần đo trên bộ từ thật |

Nếu điều khoản không cho phép một trong các điểm trên, quay lại chọn phương án A hoặc C.

## Ràng buộc kỹ thuật (áp dụng mọi phương án)

- Sau interface `IWordReferenceProvider` (một hàm tra từ, trả phiên âm và nghĩa gợi ý), với implementation theo cấu hình environment.
- Timeout 3 giây. Lỗi nhà cung cấp không làm hỏng form: UI chỉ hiện gợi ý "Không lấy được phiên âm tự động" (`BR-LIB-015`).
- Lưu đệm kết quả theo từ đã chuẩn hóa để không gọi lặp lại (chỉ khi giấy phép cho phép).
- Log không ghi nội dung tra cứu gắn với người dùng.
- Test tự động dùng provider giả, chỉ có trong project test. Không dùng dữ liệu giả trong môi trường production.

## Trạng thái hiện tại

- **2026-11-11 (cập nhật):** đã code provider `dictionaryapi` sau cấu hình `Pronunciation:Provider`, **mặc định `none`** (không có yêu cầu nào ra ngoài). Đã kiểm tra từ môi trường làm việc: `api.dictionaryapi.dev` trả 200, `water` có `-uk.mp3`, `learn` không có bản Anh-Anh, `give up` không có kết quả; dữ liệu ghi giấy phép CC BY-SA 3.0. Đã chạy luồng tự điền với nguồn thật một lần trên máy phát triển. **ADR vẫn Proposed**: cổng điều khoản, pháp lý share-alike và đo độ phủ chưa đạt.

Theo `AGENTS.md` §6: US-LIB-08 và US-LIB-09 có trạng thái **integration ready** khi đã code abstraction và test với provider giả; **không** được ghi là hoạt động cho tới khi cổng kiểm tra ở trên đạt và provider thật được cấu hình. Form vẫn dùng được đầy đủ với phiên âm nhập tay.

## Bổ sung 2026-11-12 — nguồn Scandict theo yêu cầu chủ dự án

Chủ dự án yêu cầu dùng `scandict.com` lấy phiên âm, nghĩa và ví dụ với dropdown. Adapter `scandict` đã được triển khai sau `IWordReferenceProvider`, giữ provider cũ để tương thích. Development bật Scandict; production mặc định `none`, bật bằng `Pronunciation__Provider=scandict`. Đây là lựa chọn mới theo yêu cầu trực tiếp, không tự chuyển trạng thái các quyết định cũ về dictionaryapi.dev.

Quan sát thực tế: `GET /api/autocomplete?q=abandon` trả 500; `GET /search-redirect?q=abandon` chuyển tới `/dictionary/abandon-o2Qj3`, trả HTML có IPA Anh–Anh, nghĩa Việt và ví dụ song ngữ. Không tìm thấy API JSON công khai cho dữ liệu chi tiết trong các tài nguyên đã kiểm tra. Implementation đọc HTML công khai bằng AngleSharp, không thực thi script và không tải subresource. Giới hạn 1 MiB, timeout 3 giây, chỉ theo tối đa 3 redirect HTTPS cùng host tới trang tra từ/tìm kiếm. Chỉ gửi từ cần tra; lỗi nguồn không chặn nhập tay/lưu mục.

Bằng chứng: tra thật `abandon`, `water`, từ không có; parser/HTTP tests; E2E desktop/mobile nhận nguồn thật, chọn nghĩa/ví dụ, sửa, lưu và tải lại từ SQL Server. Đây là bằng chứng hành vi hiện tại; không mô tả adapter HTML là API JSON chính thức hoặc cam kết giao diện website ổn định. Không thêm cache, không thực hiện crawl hàng loạt. Cột IPA hiện chỉ lưu dictionary/user nên tên provider chỉ chính xác ở response gợi ý mới; màn chi tiết dùng nhãn nguồn chung.
