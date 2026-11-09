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
| 4 | Wireframe | `wireframe-ascii` |
| 5 | API | `api-design` |
| 6 | Acceptance criteria (Gherkin) và bảng AC → FR, BR, ERR, test case | `ac` |
| 7 | Truy vết test case | `test-cases` |

Quy ước:

- `requirements/user-stories.md` giữ nguyên, là nơi sửa AC đầu tiên. SRS của story chép lại đúng văn bản Gherkin đó.
- BR và ERR chỉ có một bản chính thức trong `srs/README.md`; file story chép lại các dòng áp dụng.
- Chạy `python3 tools/feature-docs/check_feature_docs.py` sau khi sửa: script kiểm tra AC, BR, ERR khớp và liên kết hợp lệ.
- Không có thư mục `design/`. Wireframe, luồng và API nằm trong SRS của story. Liên kết Figma (khi có) ghi ở mục 4 của story.
- Giữ ID yêu cầu ổn định và liên kết tương đối. Tên tính năng trong ví dụ của bộ skill không phải phạm vi đã được duyệt cho Lingozi.

## Tính năng hiện có

| Feature | Thư mục | Vòng | Trạng thái |
| --- | --- | --- | --- |
| FEAT-01 Tài khoản | [accounts](accounts/README.md) | 1 | Thiết kế xong, chờ duyệt (DoR) |
| FEAT-02 Mục kiến thức | [knowledge-items](knowledge-items/README.md) | 1 | Thiết kế xong, chờ duyệt (DoR) |
