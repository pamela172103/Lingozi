# Trạng thái dự án Lingozi

- Cập nhật: 2026-11-11.
- Giai đoạn: **Vòng 1 — Lưu được kiến thức của riêng mình** (2026-11-08 → 2026-11-21), đang ở bước ② Thiết kế. Vòng 0 xong phần việc. Xem [lộ trình](../product/roadmap.md) §5.
- Phiên gần nhất: [Code US-LIB-06 (xóa từ vựng và ngữ pháp)](sessions/2026-11-11-29-code-us-lib-06.md).
- Đã đọc và gộp 4 commit từ `origin/work` vào `main` theo fast-forward, tới `61514e0`. Bàn giao phiên 05 được lưu cùng commit tài liệu tiếp theo; tra bằng `git log -- docs/project/`.

## Đã hoàn thành

- Tạo cấu trúc repo cho tài liệu phát triển, nội dung học, website và kiểm thử.
- Nhập nguyên bản OpenBA: 413 file, 56 skill, 19 rules, 47 templates, giữ giấy phép MIT và ghi hash archive.
- Thêm 56 symlink skill cho Codex, hướng dẫn phân giải đường dẫn, quy trình Git, mẫu issue/PR và `.gitignore`.
- Bổ sung nơi lưu trạng thái và nhật ký phiên; quy định đọc lúc bắt đầu và cập nhật khi kết thúc trong `AGENTS.md`.
- Tích hợp quy tắc người dùng về chất lượng production, bảo mật, kiểm thử, báo cáo và định hướng stack; giữ các quy ước OpenBA. Dùng `docs/project/STATUS.md` làm nguồn trạng thái chính; chỉ đọc thêm `STATUS_STATUS.md` nếu sau này tồn tại.
- Thêm [tổng quan sản phẩm](../product/overview.md) đã được chủ dự án duyệt ngày 2026-10-26 (phiên 2026-11-08-01, đã gộp vào `main`). Chưa phải PRD/MVP.
- Soạn [lộ trình phát triển](../product/roadmap.md) theo cách làm Agile chủ dự án chọn (2026-11-08): mỗi vòng thiết kế → phát triển → demo một vài tính năng; Vòng 0 nền, Vòng 1–3 = MVP đề xuất, Vòng 4–5 mở rộng; cổng DoR/DoD. Đã duyệt 2026-11-08 (vòng 2 tuần).
- Vòng 0: tái lập brainstorm và discovery từ tổng quan; viết Lean PRD và phạm vi MVP (Draft). Quyết định: desktop-first; đăng nhập email + mật khẩu và Google.
- Vòng 0: viết [ADR 0001–0006](../decisions/README.md) (Proposed), đã xác minh phiên bản ngày 2026-11-08: .NET 10.0.14 LTS, EF Core/Identity 10.0.14, SQL Server 2025, Next.js 16.4.5, React 19.3.1.
- Vòng 0: chủ dự án duyệt ADR 0001–0006 (2026-11-08), chọn máy chủ riêng + SQL Server. Viết [ERD tổng thể](../architecture/erd.md); duyệt 2026-11-08.
- Chủ dự án yêu cầu thêm **đăng nhập Facebook** (2026-11-08): cập nhật ADR 0004, PRD 0.2.0, MVP, ERD, brainstorm (`Q-12` về xóa dữ liệu).
- Vòng 0: viết [design system nền](../architecture/design-system.md) với token trong `design-tokens.json`, gồm 2 theme (default, coquette; chủ dự án chọn Coquette 2026-11-08) đạt WCAG AA cho 19/19 cặp màu mỗi theme; script `tools/design-tokens/check_contrast.py` (Draft).

- Phiên 24 (2026-11-11): FEAT-02 tách thành hai thư viện Từ vựng và Ngữ pháp (thiết kế v0.5, chờ duyệt); toàn bộ wireframe FEAT-01 và FEAT-02 đổi từ ASCII sang SVG sinh bằng `tools/wireframes/` (50 màn hình), CI thêm job `feature-docs`.

- Phiên 25 (2026-11-11): code US-LIB-01 — module `Library` (migration, POST/GET API), web `/library/vocabulary` và `/library/grammar` (form, chi tiết và danh sách tối thiểu), 97 integration test, 93 Vitest, 42 E2E; đổi ERD sang `NormalizedTermHash` (chờ xác nhận).

- Phiên 26 (2026-11-11): code US-LIB-02 (`GET /api/library/items/similar`, hộp thoại khi lưu); AC-02 còn thiếu màn hình sửa (US-LIB-05). 106 integration test, 44 E2E đạt.

- Phiên 27 (2026-11-11): code US-LIB-03 (phân trang, trang ngoài phạm vi, trạng thái tải, lỗi); 104 Vitest, 50 E2E đạt.

- Phiên 28 (2026-11-11): code US-LIB-05 (PUT có kiểm tra version, form sửa, xung đột, trang sửa); US-LIB-02 AC-02 hoàn tất. 116 integration test, 56 E2E đạt. AC-03 còn một phần, US-LIB-06 chưa làm.

- Phiên 29 (2026-11-11): code US-LIB-06 (DELETE có xác nhận, thông báo "Đã xóa" và "không còn tồn tại"). 123 integration test, 60 E2E đạt. FEAT-02 còn guard điều hướng cho US-LIB-05 AC-03 và chờ duyệt thiết kế v0.5.

## Hiện trạng các phần

| Phần | Trạng thái thực tế |
| --- | --- |
| Tài liệu sản phẩm | Có tổng quan đã duyệt (`docs/product/overview.md`); có brainstorm/discovery tái lập; PRD và MVP ở trạng thái Draft chờ duyệt; discovery chưa có bằng chứng người dùng |
| Nội dung học | Có cấu trúc; chưa có giáo trình, bài học hoặc bài tập |
| Website | Khung Next.js 16.4.5, TS 6.0.3 strict, Tailwind 4, next-intl; trang "Trạng thái hệ thống"; `/auth/login` và `/auth/code` (US-AUTH-01, theo ảnh Figma), gọi API thật. Chưa nhập và xác nhận được mã (US-AUTH-02); từ phiên 25: `/library/vocabulary` và `/library/grammar` (danh sách tối thiểu, form thêm, chi tiết) gọi API thật |
| Backend/database | ASP.NET Core Minimal APIs .NET 10.0.14, EF Core 10.0.14, SQL Server 2025; module Accounts với migration `InitialDataProtectionKeys` và `AddEmailCodeSignIn`; endpoint health, `/api/system/status`, `/api/auth/antiforgery`, `/api/auth/email-code/request`; outbox gửi thư (SMTP, Mailpit ở local). Mới có US-AUTH-01; từ phiên 25: module Library (schema `library`, migration `InitialLibrary`), endpoint `POST/GET /api/library/items`, `GET /api/library/items/{id}` |
| Kiểm thử ứng dụng | xUnit v3 + Testcontainers (97 test, phiên 25), Vitest (93 test; `code-entry.test.tsx` có 1 test không ổn định từ trước), Playwright + axe (42 test, desktop và mobile); CI GitHub Actions `.github/workflows/ci.yml` (chưa chạy với phiên 25) |
| OpenBA | Đã nhập và kiểm tra tính toàn vẹn, đường dẫn; chưa xác minh toàn bộ khả năng thực thi của 56 skill |
| Đồng bộ GitHub | Đã gộp `origin/work` (`61514e0`) vào `main` cục bộ; phiên 05 sẽ push cùng bàn giao và đối chiếu GitHub sau push |

## Công việc đang làm và bước tiếp theo

Không có công việc triển khai đang dở. Thứ tự dưới đây là đề xuất để bắt đầu phát triển, chưa phải yêu cầu tính năng đã duyệt.

| ID | Trạng thái | Công việc | Đầu ra / điều kiện hoàn thành |
| --- | --- | --- | --- |
| PLAN-01 | in-progress | Làm rõ người học mục tiêu và mục tiêu học tiếng Anh | Persona giả định trong PRD; chờ trả lời `Q-01` và phỏng vấn 3–5 người (H-01, H-02) |
| DOC-01 | done | Bổ sung brainstorm và discovery được tổng quan liên kết | Đã tái lập từ tổng quan theo yêu cầu chủ dự án |
| ROAD-01 | done | Chủ dự án duyệt lộ trình | `docs/product/roadmap.md` chuyển trạng thái đã duyệt; nhóm tính năng theo vòng và độ dài vòng được xác nhận |
| PLAN-02 | in-progress | Viết PRD và chốt phạm vi MVP (Draft xong, chờ duyệt) | `docs/product/prd.md`, `docs/product/mvp-scope.md`, có xác nhận phạm vi |
| PLAN-03 | done | Xác minh phiên bản/tương thích và thiết kế chi tiết theo stack người dùng cung cấp (ADR Accepted; ghi nhận khi dựng khung trong ADR 0001–0003) | Bằng chứng kiểm tra và quyết định tại `docs/decisions/`; không tự thay đổi stack |
| SKEL-01 | done | Walking skeleton + CI (Vòng 0) | Build/test/E2E đạt ở local; CI GitHub run #1 (commit `2c98e96`) có 4/4 job success |
| ADR-07 | in-progress | Nguồn phiên âm: API từ điển miễn phí (B), giọng Anh-Anh (2026-11-08) | Cổng còn mở: (1) pháp lý về CC BY-SA 3.0 (share-alike) khi lưu phiên âm; (2) trang điều khoản chưa tìm được; (3) độ phủ Anh-Anh ~6/13 từ mẫu, cần đo; US-LIB-08/09 chỉ ghi hoạt động khi đạt |
| PLAN-04 | in-progress | Vòng 1: thiết kế FEAT-01 Tài khoản và FEAT-02 Mục kiến thức, rồi phát triển | Thiết kế xong ([accounts](../features/accounts/README.md), [knowledge-items](../features/knowledge-items/README.md)); chờ chủ dự án duyệt DoR; US-AUTH-01 đã code (2026-11-10), các story còn lại chưa |
| ADR-01 | done | Chủ dự án duyệt ADR 0001–0006 | Accepted 2026-11-08; hosting: máy chủ riêng + SQL Server |
| HOST-01 | todo | Chủ dự án cung cấp thông tin máy chủ `HOST-01`–`HOST-05` (OS/cấu hình, edition SQL Server, domain, nơi backup, staging) | Ghi vào ADR 0006; hạn cuối Vòng 1 |
| AUTH-01 | done | Chủ dự án xác nhận quy tắc mã: 6 số, 10 phút, dùng một lần; 5 lần sai thì vô hiệu; 60 giây giữa các lần gửi; 5 mã mỗi giờ (xác nhận 2026-11-09) | ADR 0004 sửa đổi chuyển sang Accepted; chưa code |
| FB-01 | todo | Chủ dự án tạo Meta App (Facebook Login), chuẩn bị URL chính sách quyền riêng tư và chốt cách xóa dữ liệu (`Q-12`) | Có App ID/Secret trong secret store trước khi bật Facebook ở staging; trước đó trạng thái là `integration ready` |
| MAIL-01 | todo | Chọn nhà cung cấp email production | ADR 0005 cập nhật; hạn trước khi phát hành staging |
| ERD-01 | done | Chủ dự án duyệt ERD tổng thể | Duyệt 2026-11-08 |
| DS-01 | todo | Chủ dự án duyệt design system (theme thứ hai đã chọn: Coquette) | `docs/architecture/design-system.md` chuyển trạng thái đã duyệt |
| ENV-01 | done | Môi trường để dựng walking skeleton | Cài .NET SDK 10.0.114 (runtime 10.0.14) từ kho Ubuntu; Docker 29.9.2 chạy được; đã chạy thử SQL Server 2025 Express 17.0.5035.5. Môi trường cloud "Lingozi" tự cài .NET SDK; Docker daemon phải khởi động tay mỗi phiên (xem Cách tiếp tục) |
| DES-01 | in-progress | Vẽ design system nền trong Figma | Đã dựng biến (màu hai theme, khoảng cách, bo góc) và trang xem trước trong file Lingozi; còn component và text style. Xem [design-system.md](../architecture/design-system.md) §7.1 |

## Vướng mắc và quyết định còn thiếu

- PRD/MVP chờ duyệt. Câu hỏi mở cần cho Vòng 0–1: `Q-01`, `Q-02`, `Q-04`, `Q-09`, `Q-11` trong [brainstorm](../product/brainstorms/personal-english-knowledge.md).
- Đã ghi định hướng Next.js, ASP.NET Core, .NET 10 LTS, SQL Server/EF Core từ người dùng; chưa xác minh phiên bản/tương thích và thiết kế chi tiết. Phương thức đăng nhập đã chốt (email + mật khẩu, Google); cách triển khai đề xuất ở ADR 0004. Hosting: máy chủ riêng (ADR 0006); còn thiếu thông tin `HOST-01`–`HOST-05`. Chưa chọn nhà cung cấp email production hay giấy phép cho mã Lingozi.
- Credential sẽ cần (chưa xin): Google OAuth client và Facebook App ID/Secret cho FEAT-01, tài khoản dịch vụ gửi email. Chưa cần ở bước tài liệu.

## Bằng chứng kiểm tra

- Phiên 2026-11-08-09 (walking skeleton), chạy trên Node 22.23.4, .NET SDK 10.0.114, Docker 29.9.2:
  - `dotnet build -warnaserror` đạt.
  - `dotnet ef migrations has-pending-model-changes` báo không có thay đổi.
  - `dotnet test` 3/3 đạt trên SQL Server 2025 qua Testcontainers.
  - Web: `pnpm lint` (0 cảnh báo), `typecheck`, `format:check` đạt; `pnpm test` 6/6; `pnpm build` đạt.
  - E2E Playwright 8/8 đạt (desktop 1440 px và Pixel 7; axe không có vi phạm serious/critical; không cuộn ngang).
  - Kiểm tra tay: tắt SQL Server thì `/api/system/status` trả `database: unavailable`, bật lại thì `ok`.
  - Script token: 0 lỗi tương phản; `tokens.css` khớp với nguồn.
  - CI GitHub Actions run #1 (Node 26, ubuntu-24.04): 4/4 job success.
- Phiên 2026-11-09-18: đổi cấu trúc `docs/features/<feature>/`: SRS theo từng user story (19 file), bỏ thư mục `design/`; `python3 tools/feature-docs/check_feature_docs.py` báo OK cho cả hai tính năng (AC, BR, ERR khớp, liên kết hợp lệ); kiểm tra cú pháp Mermaid chỉ bằng script đếm ngoặc (chưa render).
- Phiên 2026-11-09-17: FEAT-01 v0.3 theo luồng đăng nhập không mật khẩu (mã 6 số qua email); Facebook thay Apple; ADR 0004 sửa đổi; ERD thêm `EmailLoginCodes`; PRD 0.3.0. Các con số bảo mật của mã chờ chủ dự án xác nhận.
- Phiên 2026-11-09-16: sửa lỗi phiên 15. Trang đăng nhập và đăng ký KHÔNG theo theme; đã gỡ theme, bộ chọn theme, vùng trang trí và TC-AUTH-039 khỏi wireframe và test case.
- Phiên 2026-11-09-15: (đã sửa ở phiên 16) thêm theme vào trang xác thực.
- Phiên 2026-11-08-14: dựng biến và trang xem trước design system nền trong Figma (file tIrqU4XF6eEOTraGqv2EpY). Gói Free giới hạn một chế độ mỗi bộ biến, nên theme tách thành hai bộ.
- Phiên 2026-11-08-13: chủ dự án chọn phương án B và chỉ mở 2 loại ở Vòng 1. Không truy cập được dictionaryapi.dev từ máy cloud nên chưa kiểm tra điều khoản. Script truy vết: 45/45 AC, 50 TC.
- Phiên 2026-11-08-12: cập nhật FEAT-02 v0.2 và ERD (sửa đổi có ghi); ADR 0007 Proposed; script truy vết: 45/45 AC có test case, 50 TC.
- Phiên 2026-11-08-11: script kiểm tra truy vết AC → TC: FEAT-01 có 37/37 AC có test case (38 TC), FEAT-02 có 28/28 AC (32 TC); kiểm tra liên kết trong `docs/`.
- Phiên 2026-11-08-10: chỉ thay đổi tài liệu; kiểm tra liên kết trong `docs/`.
- Phiên 2026-11-08-08: `dotnet --list-sdks` → 10.0.114; `docker info` → 29.9.2; chạy container SQL Server 2025 Express và truy vấn `SERVERPROPERTY` thành công, sau đó đã xóa container.
- Phiên 2026-11-08-07 (bổ sung): đổi theme Garden sang Coquette; script tương phản vẫn 0 failure.
- Phiên 2026-11-08-07: `python3 tools/design-tokens/check_contrast.py docs/architecture/design-tokens.json` cho 0 failure (19 cặp × 2 theme); đã kiểm tra liên kết trong `docs/`.
- Phiên 2026-11-08-06: kiểm tra cú pháp sơ đồ Mermaid trong ERD bằng script (12 entity, 14 quan hệ, không có tham chiếu thiếu). Chưa render được hình, vì lệnh cài mermaid-cli bị chặn quyền. Đã kiểm tra liên kết trong `docs/`.
- Phiên 2026-11-08-05: tra cứu phiên bản qua trang chính sách hỗ trợ .NET, npm registry, NuGet, trang vòng đời SQL Server 2025; kiểm tra liên kết trong `docs/`. Không có build/test ứng dụng.
- Phiên 2026-11-08-04: kiểm tra mọi liên kết tương đối trong `docs/product/`; chỉ thay đổi tài liệu.
- Phiên 2026-11-08-03: kiểm tra liên kết tương đối trong `docs/product/roadmap.md` sau khi viết lại; chỉ thay đổi tài liệu.
- Phiên 2026-11-08-02: kiểm tra liên kết tương đối trong `docs/product/roadmap.md`; chỉ thay đổi tài liệu.

- Phiên 2026-11-08-01: file tổng quan khớp từng byte với bản người dùng gửi; liên kết `../project/STATUS.md` hợp lệ, hai liên kết brainstorm/discovery chưa có đích.

- Phiên nền repo: 413 file nhập khớp từng byte với ZIP, 56 symlink hợp lệ, liên kết tài liệu và quy tắc ignore đã kiểm tra; commit `9feddba`.
- Phiên 05: xác minh lịch sử fast-forward, 56 symlink và liên kết Markdown nội bộ. Whitespace tài liệu Lingozi đạt; bộ OpenBA nhập sẵn có trailing whitespace, giữ nguyên nguồn.
- Không có build/test ứng dụng để chạy; không coi đây là kiểm thử đã pass.

## Cách tiếp tục

Đọc [quy trình bàn giao](README.md), kiểm tra nhánh và lịch sử Git thực tế, rồi tiếp tục Vòng 0 theo bảng tiến độ trong lộ trình §5 nếu người dùng chưa có ưu tiên khác.

Trong phiên cloud trên môi trường "Lingozi": .NET SDK được setup script cài sẵn (cần kiểm tra lại `dotnet --version` ở phiên mới, vì script chưa được chứng minh trên container mới). Docker daemon không tự chạy; khởi động bằng `nohup dockerd > /tmp/dockerd.log 2>&1 &`, rồi kiểm tra bằng `docker info`. Trạng thái này đi cùng repository; không phụ thuộc lịch sử chat hoặc các tiến trình đang chạy.
- Phiên 2026-11-09-19: vẽ 74 wireframe ASCII đủ mọi màn hình và trạng thái nêu trong AC của 19 story (W-AUTH-01 → 23, W-LIB-01 → 30); bảng AC có cột Wireframe; quy tắc ghi ở `AGENTS.md` §14 và `docs/features/README.md`; `check_feature_docs.py` kiểm tra tự động (OK). Chưa render trên GitHub.
- Phiên 2026-11-10-20: code US-AUTH-01. `dotnet build -warnaserror` sạch; `dotnet test` 40/40 (SQL Server 2025 + Mailpit); web lint/typecheck/format đạt, Vitest 50/50, `pnpm build` đạt; Playwright 24/24 trên desktop và Pixel 7 (có gửi mã thật qua Mailpit, axe sạch). Chưa chạy CI GitHub với thay đổi này; chưa gửi thư thật (chờ `MAIL-01`).
- Phiên 2026-11-10-21: code US-AUTH-02 (xác minh mã, tạo tài khoản, cookie phiên, màn nhập mã theo Figma W-AUTH-06 đến 08). Backend 49/49, web 61/61, E2E 32/32. Đã commit cùng phiên này.
- Phiên 2026-11-11-22: US-LIB-01 đổi form theo loại (từ vựng: Từ*, Nghĩa*, phiên âm, loại từ, ví dụ, ghi chú; ngữ pháp: Tên cấu trúc*, Công thức*, ý nghĩa, ví dụ, ghi chú; bỏ Nguồn). Cập nhật đặc tả, BR, wireframe, test case, ERD. Còn lại: US-LIB-09 và màn hình chi tiết/sửa.
- Phiên 2026-11-11-23: cập nhật chi tiết (W-LIB-14, 15), sửa (W-LIB-18, 19), gợi ý nghĩa (US-LIB-09, AC-05) và danh mục theo form mới; bỏ Nguồn. Còn lại: ERD cột Source chờ xác nhận.
