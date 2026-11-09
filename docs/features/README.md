# Hồ sơ tính năng

Mỗi tính năng dùng một thư mục kebab-case, chỉ tạo khi có công việc thực tế:

```text
<feature>/
├── README.md       # Phạm vi, trạng thái, DoR, mục lục
├── requirements/   # Brainstorm, BRD/URD, use case, user story kèm AC (nguồn chính thức của AC)
├── srs/            # Đặc tả theo từng user story
│   ├── README.md                   # Danh mục chung: FR, BR, ERR, NFR, quy ước API, ngữ cảnh
│   └── US-XXX-NN-<slug>.md         # Mỗi story một file: FR chi tiết, BR, ERR, luồng, sequence, state, wireframe, API, AC
└── testing/        # Checklist, test case và truy vết về AC
```

**Cách viết một file SRS theo story** (`srs/US-XXX-NN-<slug>.md`), mỗi mục dùng skill OpenBA phù hợp:

| Mục | Nội dung | Skill |
| --- | --- | --- |
| 1 | Giới thiệu, phạm vi, ngoài phạm vi | `srs` |
| 2 | Yêu cầu áp dụng: FR (input, xử lý, output), BR, ERR, NFR | `srs` |
| 3 | Luồng: user flow và trạng thái giao diện; sequence; state khi có vòng đời | `user-flow`, `sequence`, `state` |
| 4 | Acceptance criteria (Gherkin) và bảng AC → FR, BR, ERR, wireframe, test case | `ac` |
| 5 | Wireframe (đủ mọi màn hình và trạng thái của AC) | `wireframe-ascii` |
| 6 | API | `api-design` |
| 7 | Truy vết test case | `test-cases` |

Quy ước:

- `requirements/user-stories.md` giữ nguyên, là nơi sửa AC đầu tiên. SRS của story chép lại đúng văn bản Gherkin đó.
- BR và ERR chỉ có một bản chính thức trong `srs/README.md`; file story chép lại các dòng áp dụng.
- Chạy `python3 tools/feature-docs/check_feature_docs.py` sau khi sửa: script kiểm tra AC, BR, ERR khớp và liên kết hợp lệ.
- **Quy tắc wireframe (bắt buộc khi viết hoặc sửa SRS):**
  1. Đọc từng AC của story, liệt kê mọi màn hình, hộp thoại, thông báo và trạng thái mà AC nhắc tới (ban đầu, đang tải, trống, lỗi từng mã ERR, thành công, bị khóa, hết hạn).
  2. Vẽ mỗi thứ một khung ASCII trong mục `## 5. Wireframe` của file story, tiêu đề `### W-<MODULE>-NN — <tên>`, khung trong khối ```` ```text ````, kèm ghi chú hành vi (focus, trạng thái nút, vùng `aria-live`). Mọi dòng của khung phải cùng độ rộng.
  3. Cột "Wireframe" của bảng AC liệt kê mã W trong file đó; AC chỉ có API thì ghi "Không có UI"; màn hình thuộc tính năng khác thì liên kết tới khung của nó.
  4. Màn hình dùng chung giữa các story của một tính năng được vẽ lại giống hệt ở từng file (script kiểm tra nội dung trùng khớp). Sửa một nơi thì sửa mọi nơi.
  5. Chỉ vẽ thành phần có trong AC hoặc FR; không thêm UI để "đẹp".
  Script `check_feature_docs.py` kiểm tra các điểm 2–4.
- Không có thư mục `design/`. Wireframe, luồng và API nằm trong SRS của story. Liên kết Figma (khi có) ghi ở mục 5 của story.
- Giữ ID yêu cầu ổn định và liên kết tương đối. Tên tính năng trong ví dụ của bộ skill không phải phạm vi đã được duyệt cho Lingozi.

## Tính năng hiện có

| Feature | Thư mục | Vòng | Trạng thái |
| --- | --- | --- | --- |
| FEAT-01 Tài khoản | [accounts](accounts/README.md) | 1 | Thiết kế xong, chờ duyệt (DoR) |
| FEAT-02 Mục kiến thức | [knowledge-items](knowledge-items/README.md) | 1 | Thiết kế xong, chờ duyệt (DoR) |
