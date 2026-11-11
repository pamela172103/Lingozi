# Test case và ma trận truy vết — FEAT-02 Mục kiến thức

- Cập nhật: 2026-11-11 (v0.5). Trạng thái: **chờ duyệt**.
- **Loại test:** INT (API + SQL Server thật qua Testcontainers), UNIT (.NET hoặc Vitest), E2E (Playwright + axe, chạy ở cả hai theme).
- Dữ liệu test là dữ liệu giả, tạo qua API trong từng test. Mỗi test dùng user riêng.

## 1. Test case

| TC | Story / AC | Loại | Bước chính | Kết quả mong đợi |
| --- | --- | --- | --- | --- |
| `TC-LIB-001` | US-LIB-01 AC-02 | INT + E2E | POST `kind=word`, term "give up", meaning "từ bỏ", không có partOfSpeech | 201; `kind=word`; `meaning` "từ bỏ"; `partOfSpeech` null; có `Location`; UI hiện trang chi tiết và toast "Đã lưu" |
| `TC-LIB-002` | US-LIB-01 AC-07 | INT | POST đủ trường (`kind=word`, `partOfSpeech` "Động từ", 2 ví dụ, ghi chú) | Chi tiết trả đúng mọi trường; ví dụ đúng thứ tự; `ipa` null nếu không nhập |
| `TC-LIB-003` | US-LIB-01 AC-03, 05 | INT + UNIT (Vitest) | `kind=grammar` thiếu `term` hoặc `formula`; `kind=word` thiếu `meaning` hoặc `term` chỉ khoảng trắng; `kind=grammar` có `meaning` chỉ khoảng trắng | 400 ERR-LIB-400-01 đúng trường (`term`, `formula`, `meaning`); meaning grammar chỉ khoảng trắng → lưu null; UI focus ô lỗi đầu tiên |
| `TC-LIB-004` | US-LIB-01 AC-06 | INT | term 1000 và 1001 ký tự; meaning (word) 2000 và 2001; formula 1000 và 1001; 20 và 21 ví dụ; note 4000 và 4001 | Đúng giới hạn: 201; vượt: 400-01 |
| `TC-LIB-005` | US-LIB-01 AC-08 | INT | POST 2 lần cùng `clientRequestId`, gồm cả gửi song song | Đúng 1 dòng trong database; lần sau trả 200 với cùng `id` |
| `TC-LIB-006` | US-LIB-01 AC-09 | INT | Seed 10.000 mục (insert hàng loạt bằng SQL) → POST | 422 ERR-LIB-422-01 |
| `TC-LIB-007` | BR-LIB-003 | UNIT (.NET) | Chuẩn hóa `"  Give   UP "`, `"give\tup"`, `"GIVE UP"`, `"İ"` | Đều thành `"give up"`; dùng culture-invariant |
| `TC-LIB-008` | US-LIB-02 AC-01 | INT + E2E | Có từ vựng "Give up" → thêm từ vựng "  give   UP " | `/similar` trả 1 mục; UI hiện dialog; database chưa có mục mới |
| `TC-LIB-009` | US-LIB-02 AC-02 | E2E | Chọn "Mở mục cũ để bổ sung" | Tới trang sửa mục cũ; panel hiện nội dung vừa nhập; số mục không đổi |
| `TC-LIB-010` | US-LIB-02 AC-03 | E2E | Chọn "Vẫn tạo mục mới" | Có 2 mục cùng `NormalizedTerm`; mục cũ không đổi |
| `TC-LIB-011` | US-LIB-02 AC-04 | INT | User B có "give up", user A gọi `/similar` | A nhận danh sách rỗng |
| `TC-LIB-012` | US-LIB-02 AC-05 | INT | 7 mục trùng → `/similar` | 5 mục mới nhất; `totalCount = 7` |
| `TC-LIB-013` | US-LIB-03 AC-01 | INT + E2E | 25 mục → trang 1 và trang 2 | Trang 1 có 20 mục mới nhất, trang 2 có 5; `totalCount = 25`; thứ tự ổn định khi cùng `CreatedAt` |
| `TC-LIB-014` | US-LIB-03 AC-02 | E2E | User mới mở /library/vocabulary rồi /library/grammar | `EmptyState` "Chưa có từ vựng nào" và nút "Thêm từ vựng đầu tiên"; `EmptyState` "Chưa có ngữ pháp nào" và nút "Thêm ngữ pháp đầu tiên" |
| `TC-LIB-015` | US-LIB-03 AC-03 | UNIT (Vitest) | Render danh sách khi fetch lỗi | Hiện `InlineAlert` + "Thử lại"; bấm Thử lại thì gọi lại |
| `TC-LIB-016` | US-LIB-03 AC-04 | INT | `page=999`; `pageSize=1000`; `page=0`; `pageSize=abc` | 999: items rỗng; 1000 → 50; 0 và abc → 400-01 |
| `TC-LIB-017` | US-LIB-04 AC-01, 03 | E2E | Mở mục đủ trường và mục tối thiểu | Đủ khối với mục đủ trường; không có khối trống với mục tối thiểu |
| `TC-LIB-018` | US-LIB-04 AC-02 | INT | GET id không tồn tại; id của user khác; id sai định dạng | Đều trả 404-01 với body giống nhau |
| `TC-LIB-019` | US-LIB-05 AC-01 | INT + E2E | PUT sửa nghĩa, thêm và xóa ví dụ | 200; `version` mới; `UpdatedAt` tăng; ví dụ đúng như gửi lên |
| `TC-LIB-020` | US-LIB-05 AC-02 | INT + E2E | Hai PUT cùng `version` | Lần sau trả 409-01 kèm `current`; dữ liệu bằng kết quả lần đầu; UI giữ nội dung đang nhập |
| `TC-LIB-021` | US-LIB-05 AC-03 | E2E | Sửa form rồi điều hướng đi | Có hộp thoại `beforeunload` |
| `TC-LIB-022` | US-LIB-05 AC-04, US-LIB-07 AC-02 | INT | A gọi PUT và DELETE trên mục của B | 404-01; dữ liệu của B không đổi |
| `TC-LIB-023` | US-LIB-06 AC-01 | INT + E2E | DELETE | 204; mục và ví dụ không còn trong database; UI về đúng thư viện (Từ vựng hoặc Ngữ pháp) với toast "Đã xóa" |
| `TC-LIB-024` | US-LIB-06 AC-02 | E2E | Mở dialog xóa → Esc | Focus về nút "Xóa"; mục vẫn còn |
| `TC-LIB-025` | US-LIB-06 AC-03 | INT + E2E | DELETE 2 lần | Lần 2 trả 404-01; UI hiện "Mục này không còn tồn tại" và về /library |
| `TC-LIB-026` | US-LIB-07 AC-01 | INT | A và B mỗi người có mục → list, detail, similar | Mỗi người chỉ thấy mục của mình |
| `TC-LIB-027` | US-LIB-07 AC-03 | INT | POST và PUT kèm `userId` của B | Mục thuộc A; `userId` bị bỏ qua |
| `TC-LIB-028` | ERD §1 | INT | Insert trực tiếp `ItemExamples` với `UserId` khác chủ mục | Database từ chối nhờ FK ghép |
| `TC-LIB-029` | NFR-A11Y-001 | E2E | axe trên /library (empty và có dữ liệu), form, chi tiết, dialog; ở cả theme default và coquette | Không có vi phạm serious/critical |
| `TC-LIB-030` | NFR-A11Y-001 | E2E | Tạo mục 2 ví dụ, xóa 1 ví dụ, lưu, chỉ dùng bàn phím | Thành công; focus chuyển hợp lý sau khi xóa ví dụ |
| `TC-LIB-031` | NFR-UX-001 | E2E | /library và form ở 1440, 1024, 768, 375 px | Không cuộn ngang; form 2 cột ở 1440, 1 cột ở < 1024 |
| `TC-LIB-032` | Log an toàn | INT | Tạo mục có term đặc biệt, rồi đọc log thu được trong test | Log không chứa term, meaning, note |
| `TC-LIB-033` | US-LIB-01 AC-01 | E2E | Mở thư viện Từ vựng rồi bấm "+ Thêm từ vựng"; mở thư viện Ngữ pháp rồi bấm "+ Thêm ngữ pháp" | Form từ vựng có đúng 6 ô theo thứ tự Từ, Phiên âm, Nghĩa, Loại từ, Ví dụ, Ghi chú; form ngữ pháp có đúng 5 ô theo thứ tự Tên cấu trúc, Công thức, Ý nghĩa, Ví dụ, Ghi chú; không có ô hay nút chọn loại ở cả hai |
| `TC-LIB-034` | US-LIB-01 AC-02 | E2E | Mở form thêm từ vựng, nhập "give up", để trống "Nghĩa", Lưu; rồi nhập "từ bỏ" và Lưu | Lần đầu: lỗi "Vui lòng nhập nghĩa." dưới ô Nghĩa, không lưu; lần sau lưu được |
| `TC-LIB-035` | US-LIB-01 AC-03 | E2E | Mở form thêm ngữ pháp; để trống "Tên cấu trúc", Lưu; nhập "Present perfect", để trống "Công thức", Lưu; nhập "have/has + V3", Lưu | Lỗi "Vui lòng nhập tên cấu trúc.", rồi "Vui lòng nhập công thức."; cuối cùng lưu được với `kind=grammar` |
| `TC-LIB-036` | US-LIB-01 AC-04 | INT + E2E | Mở form (chỉ 2 thẻ); POST với `kind=idiom` (mã ngoài Vòng 1) | UI không có loại thứ ba; API trả 400-01 ở trường `kind`; không tạo mục |
| `TC-LIB-037` | US-LIB-01 AC-10 | INT | POST không có `kind`; `kind=99` | 400-01 ở trường `kind`; không tạo mục |
| `TC-LIB-038` | US-LIB-08 AC-01, AC-01a | INT + E2E | Provider giả trả `/ˈwɔːtə/` (nhãn `-uk.mp3`) cho "water"; thêm trường hợp chỉ có bản Anh-Mỹ → ô trống → `GET /suggestions?kind=word` → UI | Ô phiên âm điền sẵn, nhãn "Tự động từ điển"; lưu được với `ipaSource=dictionary` |
| `TC-LIB-039` | US-LIB-08 AC-02 | INT + E2E | Sửa phiên âm do máy điền rồi lưu | `ipaSource=user`; nhãn "Bạn đã chỉnh sửa" |
| `TC-LIB-040` | US-LIB-08 AC-03, 04 | INT + E2E | Provider không có phiên âm; người dùng nhập "/ˈzɪzli/" | Ô trống với gợi ý; lưu với `ipa="/ˈzɪzli/"`, `ipaSource=user` |
| `TC-LIB-041` | US-LIB-08 AC-05 | INT + UNIT (.NET) | Gửi `ipa = "<b>give</b>"`; ký tự điều khiển; 201 ký tự | 400-02; danh sách ký tự hợp lệ được chấp nhận: `/ ˈ ˌ ː . ‿ [ ]` và chữ IPA |
| `TC-LIB-042` | US-LIB-08 AC-06, BR-LIB-015 | INT + UNIT (Vitest) | Provider timeout 3 giây | `suggestions` trả 200 với `sourceAvailable=false`; form lưu được; không có thông báo đỏ |
| `TC-LIB-043` | US-LIB-08 AC-07 | INT | Xóa phiên âm rồi lưu | `ipa` null; `ipaSource` null |
| `TC-LIB-044` | US-LIB-08 AC-08, BR-LIB-013 | INT | POST `kind=grammar` kèm `ipa` khác null | 400-01 ở trường `ipa`; nguồn phiên âm không được gọi (đếm lần gọi bằng provider giả) |
| `TC-LIB-045` | US-LIB-09 AC-01 | INT + E2E | Có mục "give up"/"từ bỏ" của A; A nhập "give up" ở form thêm từ vựng | `suggestions.meanings` có `{source: own}`; chip hiện; ô nghĩa trống cho tới khi bấm |
| `TC-LIB-046` | US-LIB-09 AC-02 | INT | Provider trả nghĩa | Gợi ý có `source=dictionary` |
| `TC-LIB-047` | US-LIB-09 AC-03, BR-LIB-014 | INT | B có "give up"/"bỏ cuộc"; A không có mục nào, gọi suggestions | Không có "bỏ cuộc" trong kết quả của A; SQL truy vấn có điều kiện `UserId` |
| `TC-LIB-048` | US-LIB-09 AC-04 | E2E | Bấm chip "từ bỏ" | Ô nghĩa điền "từ bỏ"; sửa được |
| `TC-LIB-049` | US-LIB-09 AC-05 | UNIT (Vitest) | Suggestions rỗng | Không có chip và không có thông báo lỗi |
| `TC-LIB-051` | US-LIB-01 AC-11 | INT + E2E | POST `kind=word` không có `partOfSpeech`; có "Động từ"; có "Idiom" (ngoài danh sách) | Lưu được với null hoặc "Động từ"; "Idiom" → 400-01 ở trường `partOfSpeech`; form chỉ có danh sách cố định |
| `TC-LIB-052` | US-LIB-04 AC-02 | E2E | Mở mục ngữ pháp bằng `/library/vocabulary/{id}` và mục từ vựng bằng `/library/grammar/{id}` | Cả hai hiện màn hình "Không tìm thấy mục này" như ERR-LIB-404-01, nút "Về thư viện" |
| `TC-LIB-053` | US-LIB-02 AC-06 | INT + E2E | Có ngữ pháp tên "give up"; thêm từ vựng "give up" (và ngược lại) | `/similar?kind=word` trả rỗng; UI không hiện hộp thoại, lưu ngay |
| `TC-LIB-054` | US-LIB-03 AC-05 | INT + E2E | Có 3 từ vựng và 2 ngữ pháp; GET `kind=word`, `kind=grammar`, không có `kind`; mở hai mục menu | `word` trả đúng 3, `grammar` trả đúng 2; thiếu `kind` → 400-01; menu có hai mục riêng, mục đang mở được đánh dấu |

## 2. Ma trận truy vết

| FR | Story | Test case |
| --- | --- | --- |
| `FR-LIB-ITEM-001` | US-LIB-01 | TC-LIB-001 → 006, 034, 035, 051 |
| `FR-LIB-ITEM-002` | US-LIB-02 | TC-LIB-007 → 012, 053 |
| `FR-LIB-ITEM-003` | US-LIB-03 | TC-LIB-013 → 016, 054 |
| `FR-LIB-ITEM-004` | US-LIB-04 | TC-LIB-017, 018, 052 |
| `FR-LIB-ITEM-005` | US-LIB-05 | TC-LIB-019 → 022 |
| `FR-LIB-ITEM-006` | US-LIB-06 | TC-LIB-023 → 025 |
| `FR-LIB-ITEM-007` | US-LIB-01, US-LIB-03 | TC-LIB-033 → 037, 054 |
| `FR-LIB-ITEM-008` | US-LIB-08 | TC-LIB-038 → 044 |
| `FR-LIB-ITEM-009` | US-LIB-09 | TC-LIB-045 → 049 |
| `FR-LIB-SEC-001` | US-LIB-07 | TC-LIB-018, 022, 026 → 028, 047 |

Mọi FR và mọi AC đều có ít nhất một test case. TC-LIB-029 → 032 kiểm tra NFR.
