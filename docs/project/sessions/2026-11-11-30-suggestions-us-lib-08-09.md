# Phiên 2026-11-11 · 30 · Gợi ý phiên âm và nghĩa (US-LIB-08 integration ready, US-LIB-09)

- Ngày / múi giờ: 2026-11-11, UTC.
- Mục tiêu do chủ dự án yêu cầu: "làm luôn đi, làm cả US-LIB-09 nữa" (sau khi đã chọn làm phần integration ready và cách lấy nguồn thử).
- Nhánh: `claude/friendly-brahmagupta-yzqxik`.
- Status: **PASS** cho US-LIB-09 AC-01 đến AC-05. **PARTIAL** cho US-LIB-08: code và test đã có ("integration ready"), nguồn ngoài **mặc định tắt**; ADR 0007 vẫn Proposed nên **không ghi là hoạt động**.

## Kết quả và file liên quan

- **Nguồn ngoài (ADR 0007):** `Pronunciation:Provider` (`none` mặc định | `dictionaryapi`), `DictionaryApiBaseUrl`. Interface `IWordReferenceProvider`; `NoWordReferenceProvider` khi tắt (không có yêu cầu nào ra ngoài); `DictionaryApiProvider` đọc định dạng đã quan sát (phiên âm Anh-Anh là mục có `audio` kết thúc `-uk.mp3`, tối đa 5 định nghĩa). Timeout 3 giây (BR-LIB-015). Log chỉ ghi tên nguồn và loại lỗi, không ghi từ tra.
- **API:** `GET /api/library/suggestions?kind=&term=` (`SuggestionService`): nghĩa của chính người dùng cùng loại và cùng từ chuẩn hóa (BR-LIB-014), rồi nghĩa từ nguồn ngoài nếu bật; phiên âm Anh-Anh chỉ cho từ vựng; trả `sourceEnabled` và `sourceAvailable`. Không ghi gì vào database.
- **Ghi `ipaSource`** (BR-LIB-013): `POST` và `PUT` nhận `ipaSource` (`dictionary` khi phiên âm là giá trị gợi ý chưa bị sửa, còn lại `user`); giá trị khác → 400 ở trường `ipaSource`. Đây là nhãn do client gửi; server không kiểm tra lại với nguồn ngoài (ghi rõ trong SRS).
- **Web:**
  - Ô "Phiên âm" tự điền từ gợi ý sau 500 ms không gõ, có nhãn "Tự động từ từ điển (Anh-Anh) · Nguồn: Wiktionary, CC BY-SA 3.0"; người dùng sửa thì nhãn đổi thành "Bạn đã chỉnh sửa"; không có phiên âm thì gợi ý nhập tay; nguồn lỗi thì dòng ghi chú (không đỏ). Gợi ý không được ghi vào giá trị form cho đến khi lưu, nên form luôn gửi đúng những gì hiển thị.
  - Chip gợi ý nghĩa dưới ô "Nghĩa" và "Ý nghĩa" ("Từ mục của bạn", "Từ từ điển"); bấm để điền, vẫn sửa được; vùng `aria-live="polite"`.
  - Trang chi tiết hiện dòng "Nguồn: Wiktionary, CC BY-SA 3.0" khi phiên âm lấy từ nguồn.
- **Tài liệu:** SRS danh mục (bảng API có `sourceEnabled`, quy tắc `ipaSource`); ADR 0007 có ghi chép kiểm tra ngày 2026-11-11.

## Kiểm tra

- API: `dotnet test`: **138/138 đạt**, gồm 15 test mới: 11 test gợi ý (nghĩa của chính người dùng, nguồn bị tắt không gửi yêu cầu, phiên âm Anh-Anh và chuẩn hóa từ gửi đi, grammar không có phiên âm, không tìm thấy, nguồn lỗi, nguồn chậm bị cắt sau 3 giây, từ rỗng và thiếu `kind`, `ipaSource`, sửa `ipaSource`) và 4 test phân tích định dạng dictionaryapi.dev (dùng mẫu thật đã kiểm tra).
- Web: `tsc`, `eslint --max-warnings 0`, `prettier` đạt. `vitest`: 124 test, 123 đạt; 1 test cũ không ổn định (`code-entry`).
- Playwright (desktop và mobile, chạy thật): **64/64 đạt**, gồm 4 scenario mới (chip nghĩa của chính người dùng, grammar không có phiên âm, không có ghi chú về nguồn khi nguồn tắt).
- **Nguồn thật (một lần, máy phát triển):** bật `Pronunciation__Provider=dictionaryapi`, nhập "water" trên trình duyệt: ô phiên âm được điền `/ˈwɔːtə/` với nhãn nguồn; chip nghĩa từ từ điển hiện. Sau đó đã tắt lại (mặc định `none`). Đây không phải kiểm thử tự động; không có test tự động nào gọi dịch vụ thật.
- Chưa kiểm tra: độ phủ trên bộ từ thật của người dùng; giới hạn gọi; điều khoản sử dụng; giao diện chip trên màn hình hẹp.

## Security checks

- Chỉ từ cần tra (đã chuẩn hóa thường) được gửi ra ngoài; không có `UserId`, email, hay nội dung khác. Mặc định tắt, nên không có yêu cầu nào ra ngoài nếu chưa bật. Nhãn `ipaSource` do client gửi, không ảnh hưởng quyền truy cập. Gợi ý chỉ lấy theo `UserId` của phiên (test người khác không thấy nghĩa của mình).

## Việc còn lại và vướng mắc

- **ADR 0007 chưa Accepted**: cần chủ dự án/pháp lý quyết định về điều khoản dictionaryapi.dev, share-alike CC BY-SA 3.0 khi lưu phiên âm, và đo độ phủ trên bộ từ thật. Cho đến khi đó, không bật `Pronunciation:Provider` ở môi trường người dùng thật.
- Quyết định sau khi chấp nhận: có lưu đệm (cache) hay không. Hiện không lưu đệm, đúng mặc định ADR.
- Test `code-entry` vẫn thỉnh thoảng thất bại.
- Chưa có test tự động gọi dịch vụ thật (không đưa vào CI, vì nguồn ngoài có thể thay đổi và chưa được duyệt).

## Bàn giao

- Việc tiếp theo, theo thứ tự ưu tiên: (1) chủ dự án quyết định ADR 0007 (đọc điều khoản, hỏi pháp lý); (2) chủ dự án duyệt thiết kế FEAT-02 v0.5 và ERD `NormalizedTermHash`; (3) guard điều hướng cho US-LIB-05 AC-03; (4) điều tra hai E2E đôi khi hết thời gian chờ; (5) sửa test `code-entry`; (6) FEAT-01 US-AUTH-03 đến 10.
- Biến môi trường để thử nguồn trên máy phát triển: `Pronunciation__Provider=dictionaryapi` (mặc định `none`). Cần biến này cùng với các biến trong `.env`.
- Trạng thái lưu Git: sẽ đi cùng commit phiên này. Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik` sau khi commit.
