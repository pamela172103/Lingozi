# Lộ trình phát triển sản phẩm Lingozi

- Cập nhật: 2026-11-08.
- Trạng thái: **bản đề xuất, chờ chủ dự án duyệt**. Chủ dự án đã chọn cách làm Agile theo vòng lặp (2026-11-08). Phạm vi MVP, thứ tự tính năng trong từng vòng và độ dài vòng vẫn là đề xuất.
- Nguồn: [Tổng quan website](overview.md) (đã duyệt 2026-10-26), [trạng thái dự án](../project/STATUS.md), bộ OpenBA trong `tools/openba-kit/`.
- Hiện trạng: repository mới có tài liệu. Chưa có ứng dụng, database hay bản thiết kế giao diện.

## 1. Cách làm: Agile theo vòng lặp

Sản phẩm được làm dần qua nhiều **vòng** (increment). Mỗi vòng chọn **một vài tính năng**, làm trọn **thiết kế → phát triển → kiểm thử → demo**, rồi mới sang vòng tiếp theo. Cuối mỗi vòng, phần đã làm phải dùng được thật trên dữ liệu thật. Kết quả review quyết định nội dung vòng sau.

```text
Vòng 0 (nền) → Vòng 1 → Vòng 2 → Vòng 3 = MVP → Vòng 4 → Vòng 5 → ... → sản phẩm hoàn chỉnh

Bên trong mỗi vòng:
 ① Lập kế hoạch → ② Thiết kế → ③ Phát triển → ④ Kiểm thử + Demo → ⑤ Review + Retro
       ↑                                                                    │
       └──────── cập nhật backlog, roadmap và STATUS cho vòng sau ──────────┘
```

| Bước | Nội dung | Đầu ra |
| --- | --- | --- |
| ① Lập kế hoạch | Chọn tính năng từ backlog, chốt mục tiêu vòng và tiêu chí demo | Mục tiêu vòng được ghi trong `STATUS.md` |
| ② Thiết kế | Tài liệu BA và giao diện cho **chỉ các tính năng của vòng này** (mục 3) | Tính năng đạt **DoR** |
| ③ Phát triển | Backend, frontend, database, test tự động (mục 4) | Tính năng đạt **DoD** |
| ④ Kiểm thử + Demo | Chạy test case, E2E, accessibility; demo cho chủ dự án trên môi trường chạy thật | Biên bản demo, danh sách lỗi |
| ⑤ Review + Retro | Chủ dự án nghiệm thu; rút kinh nghiệm quy trình; sắp lại backlog | Nhật ký phiên, cập nhật file này |

**Độ dài vòng:** chưa chốt. Đề xuất mỗi vòng kéo dài cố định 2–4 tuần (time-box) và chốt ở Vòng 0 theo nguồn lực thực tế. Tính năng nào chưa đạt DoD khi hết vòng thì chuyển sang vòng sau, không tính là xong.

**Hai cổng chất lượng** áp dụng cho mọi vòng:

- **Definition of Ready (DoR):** tính năng chỉ bắt đầu code khi có đủ:
  1. User story có ID và tiêu chí nghiệm thu dạng Gherkin.
  2. Business rules và mã lỗi.
  3. Màn hình Figma (hoặc wireframe) đã duyệt, đủ các trạng thái loading, empty, error, success, disabled.
  4. Hợp đồng API và phần ERD liên quan.
  5. Test case truy vết về AC.
- **Definition of Done (DoD):** tính năng chỉ được coi là xong khi:
  1. Luồng frontend → API → SQL Server chạy thật, không dùng mock hay localStorage thay database.
  2. Có test unit và integration với SQL Server thật, E2E cho luồng chính.
  3. Typecheck, lint, build và migration đều pass.
  4. Server kiểm tra quyền sở hữu dữ liệu.
  5. Đã kiểm tra accessibility và giao diện phone/desktop.
  6. Tài liệu và `STATUS.md` đã cập nhật.

## 2. Backlog tính năng (từ tổng quan)

| Feature ID | Mã module | Tính năng | Không gian | Đề xuất vòng |
| --- | --- | --- | --- | --- |
| `FEAT-01` | `AUTH` | Tài khoản, đăng nhập, thư viện riêng tư theo chủ sở hữu | Chung | Vòng 1 |
| `FEAT-02` | `LIB` | Lưu, xem, sửa, xóa mục kiến thức (bắt buộc từ + nghĩa) và gợi ý mục trùng | Library | Vòng 1 |
| `FEAT-03` | `ORG` | Bộ sưu tập, thẻ, xem theo dòng thời gian | Library | Vòng 2 |
| `FEAT-04` | `SRCH` | Tìm kiếm kết hợp lọc theo bộ sưu tập, thẻ, thời gian | Library | Vòng 2 |
| `FEAT-05` | `PRAC` | Luyện gõ: nhìn nghĩa tiếng Việt, gõ từ tiếng Anh | Practice | Vòng 3 |
| `FEAT-07` | `THEM` | 1–2 theme có sẵn, chế độ giảm trang trí | Chung | Vòng 3 |
| `FEAT-06` | `PRAC` | Đặt câu có AI nhận xét và gợi ý sửa | Practice | Vòng 4 |
| `FEAT-08` | `THEM` | Tùy chỉnh theme (màu, nền, font, linh vật, sticker) và thêm theme | Chung | Vòng 5 |
| — | — | Flashcard, trắc nghiệm, nghe → gõ, ôn cách quãng, nhắc học, thống kê, xuất dữ liệu, phục hồi sau xóa | — | Sau Vòng 5, chọn theo review (tổng quan mục 5: chưa ưu tiên) |

Đề xuất để FEAT-06 ở Vòng 4 vì nhà cung cấp AI, chi phí và hạn mức chưa chốt. Nếu chủ dự án muốn có AI trong MVP, có thể chuyển FEAT-06 vào Vòng 3, sau khi có ADR về nhà cung cấp và giới hạn chi phí. Backlog được sắp lại ở bước ⑤ của mỗi vòng.

## 3. Bước Thiết kế trong một vòng

Chỉ thiết kế cho các tính năng của vòng hiện tại, không làm trước toàn bộ sản phẩm.

| Bước | Việc | Skill OpenBA | Nơi lưu |
| --- | --- | --- | --- |
| Yêu cầu | User story (INVEST), AC Gherkin, use case cho luồng phức tạp | `userstory`, `ac`, `usecase` | `docs/features/<feature>/requirements/` |
| Đặc tả | FR `FR-[MODULE]-[FEATURE]-[SEQ]`, business rules `BR-`, ma trận lỗi `ERR-`; cập nhật NFR nếu cần | `srs` | `docs/features/<feature>/srs/` |
| Giải pháp | User flow, sequence, state; mở rộng ERD; API contract | `user-flow`, `sequence`, `state`, `erd`, `api-design` | `docs/features/<feature>/design/`, `docs/architecture/` |
| Giao diện | Wireframe → màn hình Figma dùng design system → đặc tả bàn giao `figma-spec.md` → prototype; thử với người dùng khi luồng mới | `wireframe-html`, `figma`, `prototype-html` | `docs/features/<feature>/design/` |
| Test | Test checklist, test case truy vết về AC, kịch bản E2E | `test-checklist`, `test-cases`, `playwright-gen` | `docs/features/<feature>/testing/` |

**Figma:** phiên làm việc hiện tại chưa có quyền truy cập Figma, nên việc vẽ tự động bằng skill `figma` đang BLOCKED. Có hai cách gỡ:

- Người thiết kế tự vẽ trên Figma từ wireframe và đặc tả.
- Kết nối Figma cho môi trường làm việc.

## 4. Bước Phát triển trong một vòng

Thực hiện theo thứ tự:

1. Migration database.
2. Domain/application logic.
3. API có DTO, validation và authorization.
4. Giao diện Next.js.
5. Test unit, integration và E2E.
6. Cập nhật OpenAPI và tài liệu.

Mỗi tính năng nằm trên một nhánh, review qua PR, CI phải xanh trước khi gộp. Khi kết thúc vòng, bản đã gộp được triển khai lên môi trường demo/staging.

## 5. Kế hoạch các vòng

### Vòng 0 — Nền dự án (một lần)

- **Thiết kế:**
  - Hoàn thiện brainstorm và discovery (`DOC-01`).
  - Lean PRD: mục tiêu, persona, chỉ số thành công đo được, NFR nền; phạm vi MVP dạng danh sách tính năng.
  - Design system nền: token màu/chữ/khoảng cách, component cơ bản, kiến trúc theme (token nền + ghi đè theo theme), tương phản WCAG AA, chế độ giảm trang trí.
- **Phát triển:**
  - ADR xác minh phiên bản ổn định và tương thích của Next.js App Router, .NET 10 LTS, ASP.NET Core, SQL Server và EF Core; chọn xác thực, hosting, CI, cấu trúc repo, backup.
  - Walking skeleton (khung chạy được end-to-end tối thiểu): Next.js (TS strict) + ASP.NET Core Web API (Modular Monolith) + SQL Server qua Docker Compose, migration đầu tiên, OpenAPI, health check, logging an toàn, `.env.example`, CI.
- **Kết quả demo:** một request thật đi từ frontend → API → DB; CI xanh.
- **Mốc M0:** chủ dự án duyệt PRD, MVP, lộ trình và độ dài vòng.

### Vòng 1 — Lưu được kiến thức của riêng mình

- **Tính năng:** FEAT-01 (tài khoản, quyền riêng tư) và FEAT-02 (mục kiến thức).
- **Điểm kỹ thuật chính:**
  - Mọi endpoint kiểm tra chủ sở hữu.
  - Rate limit, CSRF/XSS.
  - Idempotency khi tạo mục.
  - Gợi ý mục trùng nhưng không tự gộp.
- **Kết quả demo:** người dùng đăng ký, đăng nhập, lưu, sửa, xóa mục kiến thức. Có test chứng minh user A không truy cập được dữ liệu của user B.

### Vòng 2 — Tổ chức và tìm lại (Library alpha)

- **Tính năng:** FEAT-03 (bộ sưu tập, thẻ, dòng thời gian) và FEAT-04 (tìm kiếm).
- **Điểm kỹ thuật chính:**
  - Quan hệ nhiều-nhiều tham chiếu cùng một bản ghi.
  - Quy tắc xóa theo BR đã duyệt.
  - Phân trang.
  - Index cho tìm kiếm, ngưỡng thời gian phản hồi lấy từ NFR.
- **Kết quả demo (Mốc M2):** một người dùng thật dùng Library hằng ngày trên dữ liệu bền vững.

### Vòng 3 — Luyện tập và phát hành MVP

- **Tính năng:** FEAT-05 (luyện gõ) và FEAT-07 (theme cơ bản).
- **Điểm kỹ thuật chính:**
  - Chấm đáp án ở server, không gửi đáp án về client trước khi người dùng nộp.
  - Lựa chọn theme được lưu vào tài khoản.
- **Ổn định trước phát hành:** E2E toàn luồng, rà soát bảo mật và accessibility, thử backup/restore thật, triển khai production.
- **Kết quả (Mốc M3 — MVP):** toàn bộ tính năng Vòng 1–3 đạt DoD và đã triển khai.

### Vòng 4 — Đặt câu có AI nhận xét

- **Tính năng:** FEAT-06.
- **Điều kiện trước:** có ADR về nhà cung cấp AI, chi phí, hạn mức và ngôn ngữ phản hồi.
- **Điểm kỹ thuật chính:**
  - Abstraction cho nhà cung cấp, cấu hình theo environment.
  - Timeout và retry có kiểm soát.
  - Giới hạn chi phí theo user.
  - Chống prompt injection.
  - Giữ câu gốc để đối chiếu; thông báo khi không nhận xét được.
  - Không tuyên bố hoạt động nếu chưa có credential thật.

### Vòng 5 — Cá nhân hóa giao diện

- **Tính năng:** FEAT-08, gồm tùy chỉnh nhiều lớp và thêm các theme tham khảo trong tổng quan.

### Vòng 6 trở đi — Mở rộng theo phản hồi

Chọn từ mục "sau Vòng 5" của backlog dựa trên kết quả review và dữ liệu sử dụng thật. Lặp lại vòng cho tới khi sản phẩm đạt các mục tiêu trong PRD.

## 6. Rủi ro và giả định

- **Giả định:** nhóm tính năng theo từng vòng và phạm vi MVP (Vòng 1–3) là đề xuất, chưa được duyệt.
- **Giả định:** dùng stack ghi trong `AGENTS.md`. Mọi phiên bản phải được xác minh ở Vòng 0.
- **Rủi ro:** chỉ thiết kế cho từng vòng có thể làm ERD hoặc API phải sửa ở vòng sau. Giảm rủi ro bằng cách giữ ERD tổng thể dạng phác thảo từ Vòng 0 và chỉ dùng migration không phá hủy dữ liệu.
- **Rủi ro:** cá nhân hóa giao diện có thể làm giảm khả năng đọc. Giảm rủi ro bằng kiến trúc token, kiểm tra tương phản và chế độ giảm trang trí.
- **Phụ thuộc bên ngoài:**
  - Quyền truy cập Figma: BLOCKED cho việc vẽ tự động.
  - Credential nhà cung cấp AI: cần ở Vòng 4.
  - Hạ tầng triển khai: chọn ở Vòng 0.

## 7. Bước tiếp theo ngay

1. Chủ dự án duyệt hoặc chỉnh cách nhóm tính năng theo vòng và độ dài vòng.
2. Bắt đầu Vòng 0: brainstorm/discovery → Lean PRD → design system nền → ADR → walking skeleton.
