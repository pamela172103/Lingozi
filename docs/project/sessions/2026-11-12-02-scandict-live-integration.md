# Phiên 2026-11-12 · 02 · Tích hợp Scandict và xác minh luồng thật

- Ngày / múi giờ: 2026-11-12, UTC+7.
- Mục tiêu: lấy phiên âm, nghĩa, ví dụ từ Scandict, dropdown theo ảnh chủ dự án.
- Nhánh: `feat/scandict-suggestions`, nền `00e531fc5c62fd1afd37499e3fc9f5022425d7ed`; tiếp tục toàn bộ thay đổi chưa commit của phiên trước, không ghi đè.
- Status: **PASS cho phạm vi tra từ và chọn/lưu gợi ý hiện tại**, với giới hạn adapter HTML dưới đây. Không khẳng định Scandict có API JSON chính thức.

## Kết quả

- Mạng của môi trường mới đã được mở bởi người dùng. Không áp dụng lại draft cũ, không đổi cấu hình môi trường hoặc publish.
- Xác minh `/api/autocomplete?q=abandon` trả 500, còn `/search-redirect?q=abandon` chuyển tới trang HTML `/dictionary/abandon-o2Qj3` có đủ dữ liệu. Từ không tồn tại chuyển tới `/search` với `.note-null`.
- `ScandictProvider.cs`: parser AngleSharp (pin 1.10.2), lấy IPA có nhãn Anh–Anh, nghĩa tiếng Việt và tối đa 5 ví dụ kèm bản dịch. Không dùng giọng Mỹ khi thiếu UK. Loại IPA không hợp lệ và ví dụ vượt giới hạn/trùng/trống. Không tải ảnh, chạy JavaScript hoặc crawl từ khác.
- HTTP có timeout tổng 3 giây, giới hạn body 1 MiB, tối đa 3 redirect và chỉ cùng HTTPS host Scandict/port 443 tới đường dẫn lookup/search; lỗi markup/HTTP được báo qua cơ chế nguồn không khả dụng hiện có.
- `LibraryModule`, `PronunciationOptions`: thêm provider `scandict`, giữ `none` và `dictionaryapi`. Development bật Scandict; production vẫn tắt mặc định, bật qua `Pronunciation__Provider=scandict`; không cần API key.
- Response gợi ý thêm `provider` và `examples`. Form hiển thị nhãn Scandict đúng nguồn; dropdown nghĩa/ví dụ đã có từ phiên trước, chọn ví dụ điền cả bản dịch và vẫn sửa được.
- Không thay schema/migration. Vì dữ liệu IPA đã lưu chỉ có dictionary/user, trang chi tiết dùng nhãn từ điển chung thay vì gán toàn bộ thành Wiktionary. Nguồn chính xác hiện ở gợi ý mới.
- Cập nhật hướng dẫn local, ADR 0007 bổ sung, SRS/hợp đồng API/test case, generator và 4 wireframe W-LIB-32 đến 35. CI E2E đặt provider `none`; bài E2E Scandict opt-in riêng.

## Bằng chứng kiểm tra

- Adapter gọi Scandict thật: `abandon` → `/əˈbændən/`, 5 nghĩa, 5 ví dụ dịch; `water` có IPA/ý nghĩa/ví dụ; từ không tồn tại → null.
- Build API `dotnet build -warnaserror`: đạt, 0 warning/error. Test parser/HTTP Scandict cuối cùng **11/11 đạt** (bao gồm nhãn UK, từ không có, đổi markup, giới hạn, encoding, redirect ngoài host và lỗi/oversize HTTP, IPA không hợp lệ).
- `SuggestionTests` với SQL Server Testcontainers: **12/12 đạt**, gồm test mới về ví dụ có bản dịch, loại trùng/giới hạn và không tự lưu.
- Web: **40/40** test form/dropdown liên quan đạt; lint/TypeScript/Prettier đạt; production build đạt. Không chạy lại toàn bộ Vitest trong phiên này; lần chạy toàn bộ ở phiên trước có lỗi focus đã biết ở `code-entry` (127/128).
- Live Playwright **2/2 đạt** trên desktop Chromium và Pixel 7: đăng nhập bằng mã gửi Mailpit; nhận dữ liệu Scandict thật qua API; IPA và nhãn nguồn đúng; chọn nghĩa bằng bàn phím; chọn ví dụ và bản dịch; sửa ví dụ; lưu, gọi GET để đối chiếu dữ liệu chính xác và tải lại trang để xác minh lưu bền trong SQL Server.
- Khi dropdown ví dụ mở, axe không có vi phạm serious/critical; không cuộn ngang. Ảnh được tạo từ lượt test thành công trong `tests/e2e/test-results/` (ignored).
- Hai lượt live E2E đầu bị lỗi locator của test (option đầu khớp select loại từ; exact text của li bao gồm cả bản dịch). Đã sửa selector có scope/đối chiếu API, không nới điều kiện lưu dữ liệu; lượt cuối cả hai viewport đạt.
- E2E typecheck đạt; kiểm tra truy vết tài liệu, wireframe build/sync và `git diff --check` đạt. Chưa chạy full E2E/CI GitHub trong phiên này.

## Giới hạn và bảo mật

- Nguồn được nối qua HTML công khai, không có endpoint JSON chi tiết được xác minh. Markup/khả dụng của Scandict có thể thay đổi; khi đó form vẫn nhập tay được.
- Dữ liệu dịch giữ theo Scandict, không tự sinh nghĩa/ví dụ giả. Các test parser dùng excerpt nhỏ theo trang đã quan sát, không gọi website trong unit test.
- Chỉ từ tra được gửi ra ngoài; không gửi user ID/email/nội dung thư viện, không log từ tra. Kết quả render text React, không dùng HTML thô. Giới hạn đầu vào/lưu hiện có vẫn áp dụng.
- SQL Server và Mailpit cho kiểm tra dùng dữ liệu tài khoản `example.com` và credential ngẫu nhiên local ở file bên ngoài checkout; không ghi giá trị vào Git/tài liệu.

## Bàn giao

- Chủ dự án đã yêu cầu commit code trong phiên này; bàn giao được đưa vào cùng commit tích hợp Scandict. Kết quả commit/push được xác minh bằng Git và báo sau khi thực hiện. Không publish môi trường.
- Khởi động lại theo `docs/guides/local-development.md`. Process không được giả định còn sau khi môi trường được khôi phục; Development chọn Scandict, test suite thường đặt `Pronunciation__Provider=none`.
- Khi cần kiểm tra lại nguồn thật: bật `SCANDICT_LIVE_E2E=1` rồi chạy riêng `library-scandict.spec.ts` với các service local đã chạy.
- Bước tiếp theo: review/commit khi chủ dự án cho phép; nếu cần API JSON chính thức ổn định, cần tài liệu/đầu mối từ Scandict. Không cần secret mới cho adapter hiện tại.
