# Brainstorm và các quyết định nghiệp vụ — Kho tri thức tiếng Anh cá nhân

- Cập nhật: 2026-11-08.
- Trạng thái: **bản tái lập**. Theo yêu cầu của chủ dự án ngày 2026-11-08, tài liệu này được viết lại từ [tổng quan đã duyệt](../overview.md) vì repository không có bản brainstorm gốc. Các mục trong bảng 2 chỉ phản ánh những gì tổng quan ghi lại hoặc chủ dự án đã xác nhận trong phiên làm việc. Nếu sau này tìm được bản gốc, cần đối chiếu và ghi khác biệt.

## 1. Ý tưởng ban đầu

- **Người đề xuất:** chủ dự án Lingozi.
- **Mô tả:** một website lưu giữ tri thức tiếng Anh cá nhân. Người dùng ghi lại từ, cụm từ, cấu trúc và cách diễn đạt gặp được khi xem phim, đọc sách, nghe nhạc, làm việc hoặc trò chuyện. Họ tổ chức theo chủ đề, tìm lại khi cần, luyện gõ và đặt câu bằng chính nội dung mình đã lưu. Giao diện có thể thể hiện cá tính qua theme.

## 2. Các quyết định đã có

| STT | Vấn đề | Quyết định | Nguồn |
| --- | --- | --- | --- |
| 1 | Không gian trải nghiệm | Hai không gian: Library (lưu, tổ chức, tìm, sửa) và Practice (gõ từ, đặt câu có AI nhận xét) | Tổng quan §3 |
| 2 | Journal | Bỏ khỏi phạm vi hiện tại. Dòng thời gian là một cách xem thư viện, không phải khu nhật ký riêng | Tổng quan §3 |
| 3 | Dữ liệu tối thiểu khi lưu | Bắt buộc **từ và nghĩa**. Ví dụ và ghi chú không bắt buộc | Tổng quan §4.1 |
| 4 | Nội dung trùng | Gợi ý mục cũ để người dùng chọn bổ sung vào mục cũ hay tạo mục riêng; **không tự gộp** | Tổng quan §4.1 |
| 5 | Tổ chức | Bộ sưu tập (theo chủ đề/mục đích) và thẻ (phân loại chéo). Một mục thuộc nhiều bộ sưu tập, mang nhiều thẻ, mọi nơi cùng tham chiếu một bản ghi | Tổng quan §4.2 |
| 6 | Hình thức luyện gõ | Nhìn nghĩa tiếng Việt, gõ từ tiếng Anh đã lưu, có phản hồi đối chiếu đáp án | Tổng quan §4.4 |
| 7 | Vai trò AI | Chỉ hỗ trợ nhận xét và gợi ý sửa câu người dùng viết. Chưa quyết định dùng AI để tạo nghĩa, phân loại hay tự điền kiến thức | Tổng quan §4.5 |
| 8 | Cá nhân hóa | Chọn theme có sẵn rồi tùy chỉnh thêm. Trang trí không được che nội dung hay làm giảm khả năng đọc | Tổng quan §4.6 |
| 9 | Quyền riêng tư | Thư viện hoàn toàn riêng tư, không chia sẻ công khai | Tổng quan §4.7 |
| 10 | Cách phát triển | Agile theo vòng 2 tuần; mỗi vòng thiết kế → phát triển → demo một vài tính năng | Chủ dự án, 2026-11-08 |
| 11 | Thiết bị ưu tiên | **Desktop-first**, responsive xuống tablet và phone | Chủ dự án, 2026-11-08 |
| 12 | Đăng nhập MVP | **Email + mật khẩu**, **Google** và **Facebook** (Facebook bổ sung sau, cùng ngày) | Chủ dự án, 2026-11-08 |
| 13 | Theme MVP | Default + **Coquette** (`Q-09`) | Chủ dự án, 2026-11-08 |

## 3. Câu hỏi còn mở

Mỗi câu hỏi gắn với vòng cần câu trả lời. Phương án mặc định chỉ là đề xuất, chưa được duyệt.

| ID | Câu hỏi | Cần trước | Phương án mặc định đề xuất |
| --- | --- | --- | --- |
| `Q-01` | Nhóm tuổi và trình độ tiếng Anh của người dùng mục tiêu? | Vòng 0 (PRD) | Người lớn tự học, trình độ từ sơ cấp trở lên, có thói quen tiêu thụ nội dung tiếng Anh |
| `Q-02` | Nội dung không phải từ vựng (cấu trúc, mẫu câu, trích dẫn) thể hiện "từ và nghĩa" thế nào? | Vòng 1 | Một form chung: trường "nội dung tiếng Anh" và "nghĩa/giải thích", cộng trường "loại" để phân biệt |
| `Q-03` | Tiêu chí coi là "tương tự" khi gợi ý mục trùng? | Vòng 1 | Trùng nội dung tiếng Anh sau khi chuẩn hóa hoa/thường và khoảng trắng |
| `Q-04` | Email Google/Facebook trùng với tài khoản email/mật khẩu đã có thì xử lý ra sao? | — | **Đã chốt** trong ADR 0004: Google chỉ liên kết khi email ở cả hai phía đã xác minh; Facebook không tự liên kết, người dùng đăng nhập tài khoản cũ rồi liên kết |
| `Q-05` | Xóa bộ sưu tập thì các mục bên trong ra sao? Xóa mục có phục hồi được không? | Vòng 2 | Xóa bộ sưu tập chỉ gỡ liên kết, không xóa mục. Xóa mục cần xác nhận và không phục hồi ở MVP |
| `Q-06` | Dòng thời gian sắp theo mốc nào? | Vòng 2 | Thời điểm tạo mục (UTC, hiển thị theo múi giờ người dùng) |
| `Q-07` | Phạm vi tìm kiếm và tìm gần đúng? | Vòng 2 | Tìm theo nội dung tiếng Anh, nghĩa, ví dụ, ghi chú; không phân biệt hoa/thường, bỏ dấu tiếng Việt; chưa có tìm theo ngữ nghĩa |
| `Q-08` | Quy tắc chấp nhận đáp án khi luyện gõ (hoa/thường, dấu câu, biến thể)? | Vòng 3 | Bỏ qua hoa/thường và khoảng trắng thừa ở đầu và cuối; dấu câu phải đúng; chưa chấp nhận biến thể |
| `Q-09` | Hai theme đầu tiên là theme nào? | — | **Đã chốt:** Default + Coquette (quyết định 13) |
| `Q-10` | Nhà cung cấp AI, ngôn ngữ phản hồi, hạn mức, chi phí? | Vòng 4 | Quyết định bằng ADR trước Vòng 4 |
| `Q-11` | Giao diện hỗ trợ ngôn ngữ nào từ đầu? | Vòng 0 | Giao diện tiếng Việt ở MVP, chuẩn bị cấu trúc i18n để thêm tiếng Anh (AGENTS.md hướng tới cả hai) |
| `Q-12` | Người dùng yêu cầu xóa dữ liệu (Meta bắt buộc khi dùng Facebook Login) xử lý thế nào trong MVP? | — | **Đã chốt** (chủ dự án đồng ý 2026-11-08): trang hướng dẫn xóa dữ liệu; người dùng gửi yêu cầu qua email; xử lý bằng tay trong tối đa 30 ngày; xóa tự phục vụ để sau MVP (`ERD-05`) |

## 4. Phạm vi đã thống nhất

- **Cần làm:** xem [lộ trình](../roadmap.md) và [phạm vi MVP](../mvp-scope.md).
- **Không làm ở hiện tại:** Journal. Các mục chưa ưu tiên trong tổng quan §5 (flashcard, trắc nghiệm, nghe → gõ, ôn cách quãng, nhắc học, thống kê, xuất dữ liệu, phục hồi sau xóa) để sau, xem xét lại theo phản hồi người dùng.
