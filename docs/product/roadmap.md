# Lộ trình phát triển sản phẩm Lingozi

- Cập nhật: 2026-11-08.
- Trạng thái: **bản đề xuất, chờ chủ dự án duyệt**. Chưa phải phạm vi MVP đã chốt. Phạm vi và thứ tự đều có thể đổi sau khi duyệt PRD.
- Nguồn: [Tổng quan website](overview.md) (đã duyệt 2026-10-26), [trạng thái dự án](../project/STATUS.md), bộ OpenBA trong `tools/openba-kit/`.
- Hiện trạng: repository mới có tài liệu. Chưa có ứng dụng, database hay bản thiết kế giao diện.

## 1. Cách tổ chức

Dự án chạy song song hai quy trình (dual-track):

- **Thiết kế (D):** tài liệu BA và giao diện, gồm yêu cầu, đặc tả, luồng, wireframe, Figma và test case.
- **Phát triển (V):** nền tảng kỹ thuật, backend, frontend, database, kiểm thử tự động và triển khai.

Thiết kế luôn đi trước phát triển **một tính năng**. Tính năng N đang được code thì tính năng N+1 đang được thiết kế. Hai quy trình nối với nhau bằng hai cổng kiểm soát:

- **Definition of Ready (DoR):** một tính năng chỉ được đưa vào phát triển khi có đủ:
  1. User story có ID và tiêu chí nghiệm thu dạng Gherkin.
  2. Business rules và mã lỗi.
  3. Màn hình Figma (hoặc wireframe) đã duyệt, có đủ trạng thái loading, empty, error, success và disabled.
  4. Hợp đồng API (API contract) và phần ERD liên quan đã duyệt.
  5. Test case đã truy vết về AC.
- **Definition of Done (DoD):** một tính năng chỉ được coi là xong khi:
  1. Luồng frontend → API → SQL Server chạy thật, không dùng mock hay localStorage thay database.
  2. Có test tự động unit và integration với SQL Server thật, E2E cho luồng chính.
  3. Typecheck, lint, build và migration đều pass.
  4. Server kiểm tra quyền sở hữu dữ liệu.
  5. Đã kiểm tra accessibility và giao diện phone/desktop.
  6. Tài liệu và `STATUS.md` đã cập nhật.

```text
Thiết kế  │ D0 Nền BA │ D1 PRD+MVP │ D2-D5 FEAT-01 │ D2-D5 FEAT-02 │ D2-D5 FEAT-03 │ ...
          │           │            │       ↓ DoR   │       ↓ DoR   │       ↓ DoR   │
Phát triển│           │ V0 ADR     │ V1 Skeleton   │ V2 FEAT-01    │ V3 FEAT-02    │ ...
```

## 2. Danh mục tính năng (từ tổng quan)

| Feature ID | Mã module | Tính năng | Không gian | Đề xuất đợt |
| --- | --- | --- | --- | --- |
| `FEAT-01` | `AUTH` | Tài khoản, đăng nhập, thư viện riêng tư theo chủ sở hữu | Chung | Now |
| `FEAT-02` | `LIB` | Lưu, xem, sửa, xóa mục kiến thức (bắt buộc từ + nghĩa) và gợi ý mục trùng | Library | Now |
| `FEAT-03` | `ORG` | Bộ sưu tập, thẻ, xem theo dòng thời gian | Library | Now |
| `FEAT-04` | `SRCH` | Tìm kiếm kết hợp lọc theo bộ sưu tập, thẻ, thời gian | Library | Now |
| `FEAT-05` | `PRAC` | Luyện gõ: nhìn nghĩa tiếng Việt, gõ từ tiếng Anh | Practice | Now |
| `FEAT-06` | `PRAC` | Đặt câu có AI nhận xét và gợi ý sửa | Practice | Next |
| `FEAT-07` | `THEM` | Theme có sẵn (1–2 theme ở Now), chế độ giảm trang trí | Chung | Now (cơ bản) |
| `FEAT-08` | `THEM` | Tùy chỉnh theme: màu, nền, font, linh vật, sticker; thêm theme | Chung | Next |
| — | — | Flashcard, trắc nghiệm, nghe → gõ, ôn cách quãng, nhắc học, thống kê, xuất dữ liệu, phục hồi sau xóa | — | Later (chưa ưu tiên, theo mục 5 của tổng quan) |

Lý do đề xuất xếp FEAT-06 vào Next: nhà cung cấp AI, chi phí, hạn mức và ngôn ngữ phản hồi chưa chốt. Nếu chủ dự án coi AI nhận xét câu là bắt buộc cho MVP, chuyển FEAT-06 về Now sau khi có ADR về nhà cung cấp và giới hạn chi phí.

## 3. Quy trình Thiết kế

### D0 — Hoàn thiện đầu vào BA

- Bổ sung brainstorm và discovery mà tổng quan đang liên kết (`DOC-01`).
- Lập danh sách câu hỏi mở từ tổng quan, mỗi câu có người quyết định. Các câu chính:
  - Người dùng mục tiêu và thiết bị ưu tiên.
  - Form cho nội dung ngoài từ vựng.
  - Quy tắc chấp nhận đáp án khi luyện gõ.
  - Quy tắc xóa mục và bộ sưu tập.
  - Phương thức đăng nhập.
- Skill OpenBA: `brainstorm`, `discover`.
- Đầu ra: `docs/product/brainstorms/`, `docs/product/03-discovery-report.md`.

### D1 — PRD và phạm vi MVP

- Viết PRD gồm mục tiêu, chỉ số thành công đo được, persona, phạm vi Now/Next/Later và NFR nền (riêng tư, accessibility, hiệu năng có ngưỡng số).
- Chủ dự án duyệt PRD, phạm vi MVP và lộ trình này.
- Skill OpenBA: `prd`, `roadmap`, `srs` (phần NFR).
- Đầu ra: `docs/product/prd.md`, `docs/product/mvp-scope.md`, cập nhật file này.
- **Mốc M0:** PRD và MVP được duyệt.

### D2 — Yêu cầu theo tính năng (lặp lại cho từng FEAT)

- User story (INVEST), tiêu chí nghiệm thu Gherkin, use case cho luồng phức tạp.
- Skill OpenBA: `userstory`, `ac`, `usecase`.
- Đầu ra: `docs/features/<feature>/requirements/`.

### D3 — Đặc tả và thiết kế giải pháp

- Đặc tả FR theo `FR-[MODULE]-[FEATURE]-[SEQ]`, business rules (`BR-`), ma trận lỗi (`ERR-`).
- Luồng người dùng, sequence, state diagram khi cần.
- ERD tổng thể, thiết kế lần đầu ở FEAT-01/02 rồi mở rộng dần.
- Thiết kế API dùng chung.
- Skill OpenBA: `srs`, `user-flow`, `sequence`, `state`, `erd`, `api-design`.
- Đầu ra: `docs/features/<feature>/srs/`, `docs/features/<feature>/design/`, `docs/architecture/`.

### D4 — Giao diện: wireframe → design system → Figma

1. **Wireframe** cho từng màn hình, đủ các trạng thái loading, empty, error, success, disabled. Skill: `wireframe-ascii`, `wireframe-html`.
2. **Design system nền**, làm một lần trước màn hình đầu tiên:
   - Design token: màu, typography, spacing, radius.
   - Component cơ bản.
   - Kiến trúc theme: token nền dùng chung cho mọi theme, mỗi theme chỉ ghi đè token và thêm lớp trang trí.
   - Đảm bảo tương phản WCAG AA ở mọi theme.
   - Chế độ giảm trang trí và reduced-motion.
3. **Figma**: thiết kế màn hình theo design system. Ghi đặc tả bàn giao bằng `_templates/34-figma-spec.md` vào `docs/features/<feature>/design/figma-spec.md`, gồm link Figma, component dùng, trạng thái và ghi chú responsive.
4. **Prototype và thử nghiệm**: prototype click-through, thử với 3–5 người dùng mục tiêu cho luồng lưu → tìm → luyện, ghi kết quả. Skill: `prototype-html`.

Phụ thuộc: phiên làm việc hiện tại chưa có quyền truy cập Figma, nên việc vẽ Figma tự động qua skill `figma` đang **BLOCKED**. Có hai cách gỡ:

- Người thiết kế tự vẽ trên Figma từ wireframe và đặc tả.
- Kết nối Figma cho môi trường làm việc rồi dùng skill `figma`.

### D5 — Thiết kế kiểm thử

- Test checklist và test case truy vết về AC (`TC-` → `AC-`).
- Kịch bản E2E cho luồng chính.
- Skill OpenBA: `test-checklist`, `test-cases`, `playwright-gen`.
- Đầu ra: `docs/features/<feature>/testing/`.
- Hoàn tất D2–D5 nghĩa là tính năng đạt **DoR**.

## 4. Quy trình Phát triển

| Bước | Nội dung | Phụ thuộc | Điều kiện hoàn thành |
| --- | --- | --- | --- |
| **V0 — Quyết định kỹ thuật** | ADR xác minh phiên bản ổn định và tương thích của Next.js App Router, .NET 10 LTS, ASP.NET Core, SQL Server và EF Core; chọn xác thực, hosting, CI, cấu trúc monorepo, chiến lược backup | M0 | ADR trong `docs/decisions/` được duyệt |
| **V1 — Walking skeleton** | Khung chạy được end-to-end tối thiểu: Next.js (TS strict) + ASP.NET Core Web API (Modular Monolith) + SQL Server qua Docker Compose; EF Core migration đầu tiên; OpenAPI; health check; logging an toàn; `.env.example`; CI chạy restore/build/test/lint | V0 | CI xanh; một request thật đi từ frontend → API → DB; có hướng dẫn chạy |
| **V2 — FEAT-01 Tài khoản và quyền riêng tư** | Đăng ký, đăng nhập, phiên đăng nhập; mọi endpoint kiểm tra chủ sở hữu; rate limit; CSRF/XSS | V1, DoR FEAT-01 | DoD; có test chứng minh user A không đọc hoặc sửa được dữ liệu của user B |
| **V3 — FEAT-02 Mục kiến thức** | CRUD mục kiến thức, validation server, gợi ý mục trùng (không tự gộp), idempotency khi tạo | V2, DoR FEAT-02 | DoD |
| **V4 — FEAT-03 Bộ sưu tập, thẻ, dòng thời gian** | Quan hệ nhiều-nhiều tham chiếu cùng một bản ghi, quy tắc xóa theo BR đã duyệt, phân trang | V3 | DoD |
| **V5 — FEAT-04 Tìm kiếm** | Tìm theo các trường đã chốt ở D3, lọc kết hợp, index phù hợp | V4 | DoD; có ngưỡng thời gian phản hồi đo được, lấy từ NFR |
| **V6 — FEAT-05 Luyện gõ** | Phiên luyện từ dữ liệu đã lưu; chấm đáp án ở server, không gửi đáp án về client trước khi người dùng nộp | V3 | DoD |
| **V7 — FEAT-07 Theme cơ bản** | Hệ token theme, 1–2 theme, lưu lựa chọn theme vào tài khoản (DB), chế độ giảm trang trí | V1, design system D4 | DoD; kiểm tra tương phản AA ở mỗi theme |
| **V8 — Ổn định và phát hành MVP** | E2E toàn luồng, accessibility, rà soát bảo mật, backup/restore thử thật, triển khai môi trường staging rồi production | V2–V7 | Mọi test P0 pass; checklist bảo mật đạt; **Mốc M3** |
| **V9 — FEAT-06 Đặt câu có AI** (Next) | Lớp abstraction cho nhà cung cấp AI, cấu hình theo environment, timeout/retry, giới hạn chi phí và hạn mức theo user, chống prompt injection, giữ câu gốc để đối chiếu, thông báo khi không nhận xét được | ADR AI, DoR FEAT-06 | DoD; không tuyên bố hoạt động nếu chưa có credential thật |
| **V10 — FEAT-08 Tùy chỉnh theme** (Next) | Tùy chỉnh nhiều lớp, thêm theme | V7 | DoD |

## 5. Các mốc phát hành

Ngày mục tiêu **chưa xác định**. Sẽ điền sau khi chốt nguồn lực, số người và thời gian mỗi tuần, ở bước D1.

| Mốc | Tên | Bao gồm | Tiêu chí đạt |
| --- | --- | --- | --- |
| M0 | Baseline sản phẩm | D0, D1 | PRD, MVP và lộ trình được chủ dự án duyệt |
| M1 | Nền kỹ thuật | V0, V1, design system | ADR duyệt; skeleton chạy end-to-end; CI xanh |
| M2 | Library alpha (dùng nội bộ) | FEAT-01 → FEAT-04 | Một người dùng thật lưu, tổ chức và tìm lại kiến thức của mình trên dữ liệu bền vững |
| M3 | MVP | M2 + FEAT-05, FEAT-07 | DoD toàn bộ tính năng Now; checklist bảo mật và accessibility đạt; đã triển khai |
| M4 | Practice mở rộng | FEAT-06, FEAT-08 | DoD; tích hợp AI có giới hạn chi phí đã kiểm chứng |
| Later | Theo dữ liệu sử dụng | Mục Later ở bảng 2 | Quyết định sau M3 dựa trên phản hồi người dùng |

## 6. Rủi ro và giả định

- **Giả định:** thứ tự Now/Next/Later và việc gom FEAT-01–05, 07 vào MVP là đề xuất của bản này, chưa được duyệt.
- **Giả định:** dùng stack đã ghi trong `AGENTS.md`. Mọi phiên bản phải xác minh ở V0.
- **Rủi ro:** cá nhân hóa giao diện mạnh có thể làm giảm khả năng đọc. Giảm rủi ro bằng kiến trúc token, kiểm tra tương phản và chế độ giảm trang trí.
- **Rủi ro:** chi phí và độ ổn định của AI. Giảm rủi ro bằng cách để FEAT-06 ở Next, có hạn mức theo user và có abstraction để đổi nhà cung cấp.
- **Phụ thuộc bên ngoài:**
  - Quyền truy cập Figma: hiện BLOCKED cho việc vẽ tự động.
  - Credential nhà cung cấp AI: cần ở V9.
  - Hạ tầng triển khai: chọn ở V0.

## 7. Bước tiếp theo ngay

1. Chủ dự án xem và duyệt hoặc chỉnh lộ trình này, đặc biệt danh sách Now ở bảng 2.
2. D0: cung cấp brainstorm/discovery hoặc làm lại bằng skill `brainstorm`, `discover`.
3. D1: viết PRD và `mvp-scope.md`.
