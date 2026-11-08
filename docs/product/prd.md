# Product Requirements Document (PRD) — Lingozi

## Metadata

- **Product name:** Lingozi.
- **Phiên bản:** 0.1.0 (Lean PRD cho Vòng 0).
- **Trạng thái:** Draft, chờ chủ dự án duyệt.
- **Product Owner:** chủ dự án Lingozi.
- **Cập nhật:** 2026-11-08.
- **Nguồn:**
  - [Tổng quan](overview.md).
  - [Brainstorm và quyết định](brainstorms/personal-english-knowledge.md).
  - [Discovery](03-discovery-report.md).
  - [Lộ trình](roadmap.md).

## 1. Tầm nhìn và mục tiêu

### 1.1 Tuyên bố tầm nhìn

Lingozi là thư viện tiếng Anh riêng tư của mỗi người. Người dùng lưu từ, cụm từ và cách diễn đạt gặp trong cuộc sống, kèm nghĩa và bối cảnh; tìm lại được mà không cần nhớ đã xếp ở đâu; luyện nhớ và luyện dùng bằng chính nội dung mình đã lưu, trong một không gian mang cá tính riêng.

Điểm khác với ứng dụng học từ có sẵn: nội dung do người dùng tự thu thập từ trải nghiệm của mình, không phải bộ từ vựng chung.

### 1.2 Mục tiêu và chỉ số

Các ngưỡng dưới đây là **đề xuất**, sẽ hiệu chỉnh sau khi có người dùng thử (H-01 → H-05).

| ID | Mục tiêu | Kết quả then chốt (KR) | Đo khi |
| --- | --- | --- | --- |
| `O-01` | Lưu kiến thức nhanh, không cản trở | Người dùng mới lưu mục đầu tiên trong ≤ 60 giây kể từ khi đăng nhập; lưu một mục tối thiểu (từ + nghĩa) trong ≤ 3 thao tác | Demo Vòng 1, test với người dùng |
| `O-02` | Tìm lại được kiến thức | ≥ 90% lần tìm thử tìm thấy mục cần trong ≤ 10 giây (kho 200 mục) | Demo Vòng 2 |
| `O-03` | Quay lại luyện tập | ≥ 50% người dùng thử có ≥ 2 phiên luyện gõ mỗi tuần trong 4 tuần sau MVP | Sau Vòng 3 |
| `O-04` | Riêng tư tuyệt đối | 0 trường hợp truy cập dữ liệu của người khác; có test tự động bao phủ mọi endpoint dữ liệu | Mỗi vòng |

Số mục đã lưu không phải thước đo duy nhất của kết quả học tập (tổng quan §6).

## 2. Người dùng mục tiêu

Phân loại theo `rules/17-actor-role-definition.md`. Nhóm tuổi và trình độ còn là câu hỏi mở (`Q-01`); persona dưới đây là giả định.

| Persona ID | Loại actor | Nhóm | Mục tiêu chính | Vấn đề hiện tại | Thiết bị |
| --- | --- | --- | --- | --- | --- |
| `PER-01` | Primary | Người lớn tự học tiếng Anh qua phim, sách, nhạc, video | Giữ lại và dùng được các cách diễn đạt đã gặp | Ghi chú rải rác, không tìm lại được, quên sau vài ngày | Desktop là chính (quyết định 2026-11-08); phone để xem lại |
| `PER-02` | Primary | Người đi làm cần tiếng Anh công việc | Gom mẫu câu và từ chuyên ngành theo mục đích | Kiến thức nằm lẫn trong email và tài liệu | Desktop công sở |
| `ACT-SYS-01` | Secondary (hệ thống) | Nhà cung cấp AI | Nhận xét câu người dùng viết | — | — (Vòng 4) |
| `ACT-SYS-02` | Secondary (hệ thống) | Google Identity | Xác thực đăng nhập Google | — | — |

## 3. Phạm vi

### 3.1 Trong phạm vi MVP (Vòng 1–3)

Chi tiết từng tính năng ở [mvp-scope.md](mvp-scope.md).

- Tài khoản: email + mật khẩu và Google; thư viện riêng tư.
- Library: lưu, xem, sửa, xóa mục; gợi ý mục trùng; bộ sưu tập, thẻ, dòng thời gian; tìm kiếm có bộ lọc.
- Practice: luyện gõ (nghĩa → từ).
- Giao diện: desktop-first, responsive; 1–2 theme có sẵn; chế độ giảm trang trí; giao diện tiếng Việt.

### 3.2 Ngoài phạm vi MVP

- Đặt câu có AI nhận xét (Vòng 4) và tùy chỉnh theme nhiều lớp (Vòng 5).
- Journal (đã bỏ).
- Flashcard, trắc nghiệm, nghe → gõ, ôn cách quãng, nhắc học, thống kê tiến bộ, xuất dữ liệu, phục hồi sau xóa.
- Chia sẻ công khai, nhiều người dùng chung thư viện, ứng dụng mobile native, thanh toán.

## 4. Danh mục tính năng

| Feature ID | Module | Tính năng | Ưu tiên | Persona | Vòng |
| --- | --- | --- | --- | --- | --- |
| `FEAT-01` | `AUTH` | Đăng ký và đăng nhập bằng email + mật khẩu, đăng nhập Google, đăng xuất, quên mật khẩu, thư viện riêng tư theo chủ sở hữu | P0 | PER-01, PER-02 | 1 |
| `FEAT-02` | `LIB` | Tạo, xem, sửa, xóa mục kiến thức; gợi ý mục trùng | P0 | PER-01, PER-02 | 1 |
| `FEAT-03` | `ORG` | Bộ sưu tập, thẻ, xem theo dòng thời gian | P0 | PER-01, PER-02 | 2 |
| `FEAT-04` | `SRCH` | Tìm kiếm và lọc theo bộ sưu tập, thẻ, thời gian | P0 | PER-01, PER-02 | 2 |
| `FEAT-05` | `PRAC` | Luyện gõ: nhìn nghĩa, gõ từ, phản hồi đúng/sai | P0 | PER-01 | 3 |
| `FEAT-07` | `THEM` | 1–2 theme có sẵn, lưu lựa chọn theo tài khoản, chế độ giảm trang trí | P1 | PER-01 | 3 |
| `FEAT-06` | `PRAC` | Đặt câu có AI nhận xét và gợi ý sửa | P1 | PER-01, PER-02 | 4 |
| `FEAT-08` | `THEM` | Tùy chỉnh theme nhiều lớp, thêm theme | P2 | PER-01 | 5 |

## 5. Yêu cầu phi chức năng nền (NFR)

Các ngưỡng là **đề xuất**, được xác nhận khi duyệt PRD và kiểm chứng bằng test ở từng vòng.

| ID | Nhóm | Yêu cầu |
| --- | --- | --- |
| `NFR-PRIV-001` | Riêng tư | Mọi endpoint đọc/ghi dữ liệu thư viện kiểm tra chủ sở hữu ở server. Truy cập tài nguyên của người khác trả về 404, không để lộ sự tồn tại của tài nguyên |
| `NFR-SEC-001` | Bảo mật | Mật khẩu băm bằng thuật toán chuẩn của ASP.NET Core Identity hoặc tương đương được chọn ở ADR. Đăng nhập giới hạn 5 lần sai liên tiếp mỗi 15 phút cho mỗi tài khoản. Bắt buộc HTTPS |
| `NFR-SEC-002` | Bảo mật | Không lưu secret trong repository. Cấu hình theo environment; có `.env.example` |
| `NFR-PERF-001` | Hiệu năng | API đọc và ghi mục kiến thức có P95 ≤ 300 ms; tìm kiếm có P95 ≤ 500 ms với kho 5.000 mục mỗi user, đo trên môi trường staging |
| `NFR-UX-001` | Giao diện | Desktop-first: thiết kế chính ở 1440 px và 1280 px; responsive xuống 768 px và 375 px, không cuộn ngang |
| `NFR-A11Y-001` | Tiếp cận | Đạt WCAG 2.2 AA cho mọi theme: tương phản chữ ≥ 4.5:1, thao tác được hoàn toàn bằng bàn phím, tôn trọng `prefers-reduced-motion` |
| `NFR-DATA-001` | Dữ liệu | Timestamp lưu UTC. Backup database hằng ngày, đã thử restore trước khi phát hành MVP |
| `NFR-I18N-001` | Ngôn ngữ | Giao diện tiếng Việt ở MVP; chuỗi giao diện tách khỏi code để thêm tiếng Anh sau (`Q-11`) |

## 6. Giả định và ràng buộc

- **Giả định:** người dùng có email hoặc tài khoản Google; persona ở mục 2 chưa được kiểm chứng (R-01).
- **Ràng buộc:**
  - Stack đã định hướng trong `AGENTS.md`: Next.js App Router, React, TypeScript strict; ASP.NET Core Web API, .NET 10 LTS; SQL Server, EF Core; Modular Monolith. Phiên bản cụ thể sẽ xác minh bằng ADR ở Vòng 0.
  - Mỗi vòng 2 tuần, theo [lộ trình](roadmap.md).
- **Phụ thuộc:**
  - Google OAuth client cho FEAT-01.
  - Dịch vụ gửi email để xác thực và đặt lại mật khẩu, chọn ở ADR.
  - Quyền truy cập Figma.
  - Nhà cung cấp AI ở Vòng 4.

## 7. Lịch sử sửa đổi

| Phiên bản | Ngày | Thay đổi |
| --- | --- | --- |
| 0.1.0 | 2026-11-08 | Bản Lean PRD đầu tiên cho Vòng 0 |
