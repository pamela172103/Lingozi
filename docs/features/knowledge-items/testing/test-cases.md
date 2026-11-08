# Test case và ma trận truy vết — FEAT-02 Mục kiến thức

- Cập nhật: 2026-11-08. Trạng thái: **chờ duyệt**.
- **Loại test:** INT (API + SQL Server thật qua Testcontainers), UNIT (.NET hoặc Vitest), E2E (Playwright + axe, chạy ở cả hai theme).
- Dữ liệu test là dữ liệu giả, tạo qua API trong từng test. Mỗi test dùng user riêng.

## 1. Test case

| TC | Story / AC | Loại | Bước chính | Kết quả mong đợi |
| --- | --- | --- | --- | --- |
| `TC-LIB-001` | US-LIB-01 AC-01 | INT + E2E | POST chỉ có term và meaning | 201; `kind=word`; có `Location`; UI hiện trang chi tiết và toast "Đã lưu" |
| `TC-LIB-002` | US-LIB-01 AC-02 | INT | POST đủ trường, 2 ví dụ | Chi tiết trả đúng mọi trường; ví dụ đúng thứ tự |
| `TC-LIB-003` | US-LIB-01 AC-03 | INT + UNIT (Vitest) | term hoặc meaning rỗng, hoặc chỉ có khoảng trắng | 400 ERR-LIB-400-01, có lỗi theo từng trường; UI focus ô lỗi đầu tiên |
| `TC-LIB-004` | US-LIB-01 AC-04 | INT | term 1000 và 1001 ký tự; 20 và 21 ví dụ; note 4000 và 4001 ký tự | Giá trị đúng giới hạn: 201; vượt giới hạn: 400-01 |
| `TC-LIB-005` | US-LIB-01 AC-05 | INT | POST 2 lần cùng `clientRequestId`, gồm cả gửi song song | Đúng 1 dòng trong database; lần sau trả 200 với cùng `id` |
| `TC-LIB-006` | US-LIB-01 AC-06 | INT | Seed 10.000 mục (insert hàng loạt bằng SQL) → POST | 422 ERR-LIB-422-01 |
| `TC-LIB-007` | BR-LIB-003 | UNIT (.NET) | Chuẩn hóa `"  Give   UP "`, `"give\tup"`, `"GIVE UP"`, `"İ"` | Đều thành `"give up"`; dùng culture-invariant |
| `TC-LIB-008` | US-LIB-02 AC-01 | INT + E2E | Có "Give up" → tạo "  give   UP " | `/similar` trả 1 mục; UI hiện dialog; database chưa có mục mới |
| `TC-LIB-009` | US-LIB-02 AC-02 | E2E | Chọn "Mở mục cũ để bổ sung" | Tới trang sửa mục cũ; panel hiện nội dung vừa nhập; số mục không đổi |
| `TC-LIB-010` | US-LIB-02 AC-03 | E2E | Chọn "Vẫn tạo mục mới" | Có 2 mục cùng `NormalizedTerm`; mục cũ không đổi |
| `TC-LIB-011` | US-LIB-02 AC-04 | INT | User B có "give up", user A gọi `/similar` | A nhận danh sách rỗng |
| `TC-LIB-012` | US-LIB-02 AC-05 | INT | 7 mục trùng → `/similar` | 5 mục mới nhất; `totalCount = 7` |
| `TC-LIB-013` | US-LIB-03 AC-01 | INT + E2E | 25 mục → trang 1 và trang 2 | Trang 1 có 20 mục mới nhất, trang 2 có 5; `totalCount = 25`; thứ tự ổn định khi cùng `CreatedAt` |
| `TC-LIB-014` | US-LIB-03 AC-02 | E2E | User mới mở /library | `EmptyState` và nút "Lưu kiến thức đầu tiên" |
| `TC-LIB-015` | US-LIB-03 AC-03 | UNIT (Vitest) | Render danh sách khi fetch lỗi | Hiện `InlineAlert` + "Thử lại"; bấm Thử lại thì gọi lại |
| `TC-LIB-016` | US-LIB-03 AC-04 | INT | `page=999`; `pageSize=1000`; `page=0`; `pageSize=abc` | 999: items rỗng; 1000 → 50; 0 và abc → 400-01 |
| `TC-LIB-017` | US-LIB-04 AC-01, 03 | E2E | Mở mục đủ trường và mục tối thiểu | Đủ khối với mục đủ trường; không có khối trống với mục tối thiểu |
| `TC-LIB-018` | US-LIB-04 AC-02 | INT | GET id không tồn tại; id của user khác; id sai định dạng | Đều trả 404-01 với body giống nhau |
| `TC-LIB-019` | US-LIB-05 AC-01 | INT + E2E | PUT sửa nghĩa, thêm và xóa ví dụ | 200; `version` mới; `UpdatedAt` tăng; ví dụ đúng như gửi lên |
| `TC-LIB-020` | US-LIB-05 AC-02 | INT + E2E | Hai PUT cùng `version` | Lần sau trả 409-01 kèm `current`; dữ liệu bằng kết quả lần đầu; UI giữ nội dung đang nhập |
| `TC-LIB-021` | US-LIB-05 AC-03 | E2E | Sửa form rồi điều hướng đi | Có hộp thoại `beforeunload` |
| `TC-LIB-022` | US-LIB-05 AC-04, US-LIB-07 AC-02 | INT | A gọi PUT và DELETE trên mục của B | 404-01; dữ liệu của B không đổi |
| `TC-LIB-023` | US-LIB-06 AC-01 | INT + E2E | DELETE | 204; mục và ví dụ không còn trong database; UI về /library với toast "Đã xóa" |
| `TC-LIB-024` | US-LIB-06 AC-02 | E2E | Mở dialog xóa → Esc | Focus về nút "Xóa"; mục vẫn còn |
| `TC-LIB-025` | US-LIB-06 AC-03 | INT + E2E | DELETE 2 lần | Lần 2 trả 404-01; UI hiện "Mục này không còn tồn tại" và về /library |
| `TC-LIB-026` | US-LIB-07 AC-01 | INT | A và B mỗi người có mục → list, detail, similar | Mỗi người chỉ thấy mục của mình |
| `TC-LIB-027` | US-LIB-07 AC-03 | INT | POST và PUT kèm `userId` của B | Mục thuộc A; `userId` bị bỏ qua |
| `TC-LIB-028` | ERD §1 | INT | Insert trực tiếp `ItemExamples` với `UserId` khác chủ mục | Database từ chối nhờ FK ghép |
| `TC-LIB-029` | NFR-A11Y-001 | E2E | axe trên /library (empty và có dữ liệu), form, chi tiết, dialog; ở cả theme default và coquette | Không có vi phạm serious/critical |
| `TC-LIB-030` | NFR-A11Y-001 | E2E | Tạo mục 2 ví dụ, xóa 1 ví dụ, lưu, chỉ dùng bàn phím | Thành công; focus chuyển hợp lý sau khi xóa ví dụ |
| `TC-LIB-031` | NFR-UX-001 | E2E | /library và form ở 1440, 1024, 768, 375 px | Không cuộn ngang; form 2 cột ở 1440, 1 cột ở < 1024 |
| `TC-LIB-032` | Log an toàn | INT | Tạo mục có term đặc biệt, rồi đọc log thu được trong test | Log không chứa term, meaning, note |

## 2. Ma trận truy vết

| FR | Story | Test case |
| --- | --- | --- |
| `FR-LIB-ITEM-001` | US-LIB-01 | TC-LIB-001 → 007 |
| `FR-LIB-ITEM-002` | US-LIB-02 | TC-LIB-007 → 012 |
| `FR-LIB-ITEM-003` | US-LIB-03 | TC-LIB-013 → 016 |
| `FR-LIB-ITEM-004` | US-LIB-04 | TC-LIB-017, 018 |
| `FR-LIB-ITEM-005` | US-LIB-05 | TC-LIB-019 → 022 |
| `FR-LIB-ITEM-006` | US-LIB-06 | TC-LIB-023 → 025 |
| `FR-LIB-SEC-001` | US-LIB-07 | TC-LIB-018, 022, 026 → 028 |

Mọi FR và mọi AC đều có ít nhất một test case. TC-LIB-029 → 032 kiểm tra NFR.
