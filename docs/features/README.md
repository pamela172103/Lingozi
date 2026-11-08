# Hồ sơ tính năng

Mỗi tính năng dùng một thư mục kebab-case, chỉ tạo khi có công việc thực tế:

```text
<feature>/
├── README.md       # Phạm vi, trạng thái, mục lục
├── requirements/   # Brainstorm, BRD/URD, use case, user story, AC
├── srs/            # Đặc tả, FR/NFR, business rules, error matrix
├── design/         # Luồng, sơ đồ, wireframe, prototype
└── testing/        # Checklist, test case và truy vết về AC
```

Giữ ID yêu cầu ổn định và liên kết tương đối giữa tài liệu. Tên tính năng trong ví dụ của bộ skill không phải phạm vi đã được duyệt cho Lingozi.

## Tính năng hiện có

| Feature | Thư mục | Vòng | Trạng thái |
| --- | --- | --- | --- |
| FEAT-01 Tài khoản | [accounts](accounts/README.md) | 1 | Thiết kế xong, chờ duyệt (DoR) |
| FEAT-02 Mục kiến thức | [knowledge-items](knowledge-items/README.md) | 1 | Thiết kế xong, chờ duyệt (DoR) |
