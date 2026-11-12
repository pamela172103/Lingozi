# Phiên 2026-11-12 · 01 · Dropdown nghĩa và ví dụ, chuẩn bị kết nối Scandict

- Ngày / múi giờ: 2026-11-12, UTC+7.
- Mục tiêu: dùng Scandict lấy phiên âm, nghĩa, ví dụ; gợi ý dạng dropdown dưới ô theo ảnh người dùng.
- Nhánh: `feat/scandict-suggestions`; commit nền `00e531fc5c62fd1afd37499e3fc9f5022425d7ed` lấy từ nhánh phát triển `claude/friendly-brahmagupta-yzqxik`. `main` vẫn là bản tài liệu cũ.
- Status: **PARTIAL**. UI và hợp đồng dữ liệu đã code; chưa có adapter Scandict vì chưa quan sát được API thật.

## Kết quả và file liên quan

- `apps/web/src/components/library/suggestion-input.tsx`: combobox dùng chung cho nghĩa và câu ví dụ; dropdown nằm ngay dưới ô, có cuộn, trạng thái chọn, điều khiển ArrowUp/ArrowDown/Enter/Escape và đóng khi blur. Nhãn và liên kết ARIA, thông báo polite. Nội dung gợi ý render dạng text.
- `item-form.tsx`: thay chip nghĩa bằng dropdown khi focus; ví dụ có dropdown tương tự. Chọn ví dụ điền câu và bản dịch; người dùng tiếp tục sửa được; không tự lưu.
- Thay thế component `meaning-suggestions.tsx` cũ; thêm test component và cập nhật test form/E2E theo role mới.
- `IWordReferenceProvider.cs`, `SuggestionService.cs`: thêm `Examples` vào mô hình nguồn và response `examples: [{ text, translation }]`; tối đa 5, loại trùng không phân biệt hoa/thường, trim, bỏ câu trống hoặc vượt giới hạn lưu. Không thay database/migration.
- **Provider hiện tại vẫn là `none` hoặc `dictionaryapi`. Chưa có provider Scandict và chưa đổi cấu hình nguồn.** Các provider hiện tại chưa điền ví dụ; API thực tế trả mảng ví dụ rỗng. Dữ liệu ví dụ trong kiểm thử là fixture, không phải bằng chứng Scandict hoạt động.
- SRS danh mục cập nhật hợp đồng API và ghi rõ phần còn thiếu; wireframe generator/SVG chưa đổi sang dropdown.

## Kiểm tra

- Cài dependency theo lockfile bằng pnpm 10.28.0. Không đổi lockfile hoặc manifest.
- Web: 39/39 kiểm thử liên quan đạt; TypeScript, lint, Prettier đạt.
- Toàn bộ Vitest: 127/128 đạt; lỗi test `code-entry` về focus đã được ghi nhận trước trong AGENTS.md, không sửa trong phạm vi này.
- Browser component harness bên ngoài checkout, dùng component/CSS thật và dữ liệu mẫu có nhãn: Chromium 1440×900 và 393×851 đạt kiểm tra chọn chuột, bàn phím, sửa sau khi chọn, vị trí dropdown và không cuộn ngang. Đây là kiểm thử component, **không phải E2E frontend → API → SQL Server**.
- API: `dotnet build --no-restore -warnaserror` đạt, 0 warning/error; parser Dictionary API 4/4 đạt.
- Test `SuggestionTests` đã chạy nhưng 12/12 thất bại ở khởi tạo fixture: Docker không tải được image SQL Server (`mcr.microsoft.com/mssql/server:2025-latest`, Forbidden). Chưa thực thi các assertion, gồm test mới về ví dụ. Docker daemon hoạt động; pull riêng tái hiện lỗi.
- Production build web thất bại do tải Google Fonts (Be Vietnam Pro, Playfair Display). Không tắt TLS hoặc thay font để làm test qua.
- Full E2E chưa chạy do SQL Server không có. Test E2E cũ đã cập nhật selector theo dropdown.

## Kết nối và cấu hình

- Yêu cầu HTTPS tới `https://scandict.com/` bị proxy từ chối CONNECT (HTTP 403). Chưa xác định endpoint, authentication hoặc schema; không đoán URL API, không dùng scraper thay API.
- Đã lưu draft network bổ sung `scandict.com`, `fonts.googleapis.com`, `fonts.gstatic.com`, giữ preset package managers. Đây chỉ là draft; chưa áp dụng runtime, chưa publish. Không áp dụng lại install/start skill cũ.
- Đã hỏi đường dẫn tài liệu API nếu người dùng có; không yêu cầu secret trong chat.

## Security checks

- Không thêm credential hoặc dữ liệu thật; không thay quyền truy cập/antiforgery, không thay đổi nguồn đang bật.
- Giữ cách gửi duy nhất từ cần tra ra provider, timeout 3 giây và log không ghi từ tra.
- Dropdown render React text, không chèn HTML từ nguồn ngoài. Chọn gợi ý vẫn qua validation/lưu hiện có.

## Bàn giao

1. Mở quyền truy cập Scandict trong environment settings và kiểm tra lại bằng kết nối mới; đọc API thật/tài liệu trước khi viết adapter. Nếu endpoint dùng host khác, bổ sung đúng host sau khi xác minh.
2. Viết adapter Scandict và parser/test theo response thật, thêm cấu hình provider, cập nhật nhãn nguồn, nối phiên âm/nghĩa/ví dụ; kiểm tra thực tế với từ người dùng.
3. Cập nhật wireframe generator và SVG theo dropdown sau khi chốt dữ liệu nguồn.
4. Khắc phục quyền tải Google Fonts/SQL Server rồi chạy production build, integration và E2E. Không ghi nhận hoàn tất tích hợp khi các bước này chưa đạt.

Thay đổi chưa commit, chưa push; chỉ có trong workspace này. Không publish môi trường.
