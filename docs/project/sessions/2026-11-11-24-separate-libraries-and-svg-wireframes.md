# Phiên 2026-11-11 · 24 · Tách thư viện Từ vựng và Ngữ pháp, vẽ lại wireframe bằng SVG

- Ngày / múi giờ: 2026-11-11, UTC.
- Mục tiêu do chủ dự án yêu cầu: (1) thư viện Từ vựng và Ngữ pháp phải tách nhau, cập nhật các US liên quan; (2) vẽ lại tất cả wireframe vì wireframe ASCII xấu, không giống màn hình thật, nút và ô sắp xếp thiếu khoa học (kèm ảnh GitHub hiển thị lệch khung W-LIB-14).
- Nhánh: `claude/friendly-brahmagupta-yzqxik`.
- Status: PASS cho phạm vi tài liệu và công cụ wireframe; chưa kiểm thử ứng dụng (không đổi code ứng dụng).

## Kết quả và file liên quan

- **Công cụ wireframe SVG** (`tools/wireframes/`, chỉ dùng thư viện chuẩn của Python): `wf.py` (bộ dựng bố cục: app shell có menu, thẻ, form một cột, hộp thoại, toast, ô nhập mã…), `screens/library.py` (35 màn hình W-LIB-01 → 35), `screens/accounts.py` (W-AUTH-01 → 08 đăng ký ảnh Figma có sẵn; W-AUTH-09 → 23 vẽ SVG), `build.py` (sinh `docs/features/*/wireframes/W-*.svg`, có `--check`), `sync_docs.py` (ghi tiêu đề, ảnh, ghi chú vào mục 5 của từng SRS, có `--check`), `story_screens.py` (story nào vẽ màn hình nào). Màu lấy từ `docs/architecture/design-tokens.json`.
- **Thay toàn bộ khung ASCII** ở 10 story FEAT-01 và 9 story FEAT-02 bằng ảnh (SVG hoặc ảnh Figma). Mã W-AUTH giữ nguyên; W-LIB được đánh số lại 01 → 35 (xem bảng AC của từng story).
- **Tách thư viện (FEAT-02):** [user-stories.md](../../features/knowledge-items/requirements/user-stories.md) viết lại US-LIB-01 (đổi tên "Lưu từ vựng và ngữ pháp", file `US-LIB-01-save-vocabulary-and-grammar.md`; AC-01, AC-04), US-LIB-02 (thêm AC-06), US-LIB-03 (AC-01, 02 theo hai thư viện; thêm AC-05), US-LIB-04, 05, 06, 07, 08, 09 (câu chữ, route). SRS: [srs/README.md](../../features/knowledge-items/srs/README.md) sửa BR-LIB-002, 003, 011, thêm BR-LIB-017, bỏ `GET /api/library/item-kinds`, `kind` bắt buộc ở danh sách và `/similar`, bảng route mới, NFR-UX-001 (form một cột). [test-cases.md](../../features/knowledge-items/testing/test-cases.md): sửa TC-LIB-014, 033 → 036, 045; thêm TC-LIB-052 → 054; bỏ TC-LIB-050.
- **Quy tắc và kiểm tra:** `AGENTS.md` §14, `docs/features/README.md`, `docs/guides/using-openba.md`, `docs/architecture/design-system.md` (sidebar có hai mục thư viện, nút thêm ở đầu danh sách) cập nhật; `tools/feature-docs/check_feature_docs.py` kiểm tra khối ảnh thay cho khung ASCII; CI thêm job `feature-docs` (checker, `build.py --check`, `sync_docs.py --check`).

## Quyết định và giả định

- Chủ dự án chọn (2026-11-11): wireframe là ảnh SVG sinh bằng script lưu trong repo; thư viện tách bằng hai mục menu riêng "Từ vựng" và "Ngữ pháp", bỏ màn hình chọn loại.
- Giả định **chưa xác nhận**: route `/library/vocabulary`, `/library/grammar` (`/library` chuyển hướng về từ vựng); mục tương tự và gợi ý chỉ tính trong cùng thư viện; không cho đổi loại khi sửa; giới hạn 10.000 mục tính chung; mục mở sai thư viện hiện "Không tìm thấy"; bỏ endpoint `item-kinds`; gợi ý "Ý nghĩa" của ngữ pháp chỉ lấy từ mục ngữ pháp của chính người dùng; form một cột (đổi NFR-UX-001 từ hai cột); nút "Thêm" nằm ở đầu từng danh sách thay cho nút "Lưu kiến thức" trên thanh trên.
- Hạn chế: SVG dùng font hệ thống nên chữ có thể lệch nhẹ giữa các trình duyệt; wireframe là mức thấp, không thay thế Figma (`DES-01`).

## Kiểm tra

- `python3 -I tools/feature-docs/check_feature_docs.py`: accounts OK, knowledge-items OK (AC ↔ story, Gherkin trùng, BR/ERR trùng danh mục, liên kết, ảnh tồn tại).
- `python3 tools/wireframes/build.py --check` và `python3 tools/wireframes/sync_docs.py --check`: OK.
- Đã xem ảnh PNG dựng từ SVG bằng Chromium của Playwright cho 6 màn hình: W-LIB-01, 08, 13, 23 và W-AUTH-09, 15: bố cục, thứ tự ô và nút đúng. Chưa đối chiếu từng ảnh trong 50 ảnh; chưa kiểm tra hiển thị SVG trên GitHub sau khi push.
- Không chạy build/test ứng dụng (không đổi code).

## Database/API/UI

- Database: không áp dụng (ERD không đổi).
- API (thiết kế, chưa code): `kind` bắt buộc ở `GET /api/library/items` và `/similar`; bỏ `GET /api/library/item-kinds`; `PUT` không đổi `kind`.
- UI (thiết kế): hai mục menu thư viện; route mới; form một cột.

## Security checks

- Không đổi code. Thiết kế giữ nguyên quy tắc 404 cho mục của người khác (BR-LIB-006) và bổ sung 404 tương đương khi mở sai thư viện. Script wireframe không gọi mạng và không đọc dữ liệu thật.

## Việc còn lại và vướng mắc

- Chờ chủ dự án xem lại các giả định trên và wireframe mới (đặc biệt form một cột và vị trí nút "Thêm").
- Cột "Nguồn" của `KnowledgeItems` trong ERD vẫn chờ quyết định xóa.
- US-AUTH-01 đã code theo ảnh Figma; các story khác chưa code.

## Bàn giao

- Việc tiếp theo, theo thứ tự ưu tiên: (1) chủ dự án duyệt thiết kế FEAT-02 v0.5 (DoR); (2) code US-AUTH-02; (3) dựng Figma cho các màn hình W-LIB nếu muốn thay wireframe thấp.
- Công cụ cần khởi tạo lại: Python 3 (không cần thư viện ngoài). Xem ảnh PNG thì cần trình duyệt, không bắt buộc.
- Trạng thái lưu Git: sẽ đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik` sau khi commit.
