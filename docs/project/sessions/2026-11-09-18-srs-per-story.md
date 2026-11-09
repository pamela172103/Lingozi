# Phiên 2026-11-09 · 18 · SRS theo từng user story

- Ngày / múi giờ: 2026-11-09, UTC.
- Mục tiêu do người dùng yêu cầu: đổi cách ghi `docs/features`: `requirements/` giữ nguyên; `srs/` thành file chi tiết cho từng user story (flows, wireframe, acceptance criteria); `testing/` giữ nguyên; dùng các skill trong repo cho từng loại nội dung.
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` tại `cf49cf4`.
- Status: PASS (chỉ tài liệu).

## Cấu trúc mới

```text
docs/features/<feature>/
├── README.md
├── requirements/user-stories.md      (giữ nguyên nội dung)
├── srs/
│   ├── README.md                     (danh mục chung: FR, BR, ERR, NFR, quy ước API)
│   └── US-XXX-NN-<slug>.md           (mỗi story một file)
└── testing/test-cases.md             (giữ nguyên)
```

Thư mục `design/` và file `srs/srs.md` được bỏ (`git rm`, lịch sử còn trong git).

## Nội dung mỗi file story

1. Giới thiệu (phạm vi, ngoài phạm vi). 2. Yêu cầu áp dụng: FR (input, xử lý, output), BR, ERR, NFR. 3. Luồng: user flow và trạng thái giao diện (Bình thường, Đang tải, Trống, Lỗi, Mất kết nối); sequence; state khi có vòng đời. 4. Wireframe. 5. API. 6. Acceptance criteria (Gherkin) và bảng AC → FR, BR, ERR, test case. 7. Truy vết test case. 8. Lịch sử.

Skill OpenBA áp dụng cho từng mục: `srs`, `user-flow`, `sequence`, `state`, `wireframe-ascii`, `api-design`, `ac`. Đã đọc `SKILL.md`, template và rules tương ứng (`rules/05`, `08`, `11`, `12`, `13`) trước khi viết. Các skill này mặc định lưu ở `docs/{feature}/srs/` hoặc `ui/`; vị trí cuối cùng theo yêu cầu của chủ dự án.

## Kết quả

- FEAT-01: `srs/README.md` + 10 file story (US-AUTH-01 đến 10). FEAT-02: `srs/README.md` + 9 file story (US-LIB-01 đến 09).
- Mới so với bản cũ: FR có input, xử lý, output; ma trận lỗi có điều kiện phát sinh, khóa i18n, mức độ (theo `rules/11`); sequence có `autonumber`; sơ đồ trạng thái cho vòng đời mã đăng nhập, phiên đăng nhập, trạng thái chờ Facebook, ô phiên âm.
- Script mới `tools/feature-docs/check_feature_docs.py`: kiểm tra mỗi story có file SRS, Gherkin khớp với `requirements/`, mọi AC có test case, BR và ERR chép khớp danh mục chung, liên kết hợp lệ.
- Cập nhật quy ước: `docs/features/README.md`, README của hai tính năng, `docs/guides/using-openba.md`, `AGENTS.md` mục 14, `docs/product/roadmap.md`, `docs/architecture/design-system.md` (nơi ghi link Figma).

## Quyết định và giả định

- **Chủ dự án yêu cầu:** cấu trúc trên.
- **Đề xuất của nhóm, chờ xác nhận:**
  - Giữ `srs/README.md` làm danh mục chung (BR, ERR, NFR) thay vì lặp lại đầy đủ ở từng story.
  - Vì Gherkin có ở hai nơi, nguồn chính thức là `requirements/`; script chặn lệch.
  - Sửa `AGENTS.md` mục 14 cho khớp cấu trúc mới (đây là file quy tắc làm việc).
- `requirements/user-stories.md`: chỉ đổi một liên kết (srs.md thành srs/README.md); nội dung story và AC không đổi.
- `testing/test-cases.md`: không đổi.

## Kiểm tra

- `python3 tools/feature-docs/check_feature_docs.py`: OK cho `accounts` và `knowledge-items`.
- Liên kết trong `docs/`, `README.md`, `AGENTS.md`: không có liên kết hỏng.
- Mermaid: 41 sơ đồ; không còn dấu `;` trong sơ đồ; ngoặc cân bằng. **Chưa render** bằng trình dựng Mermaid; cần xem trên GitHub.
- Không có code, không chạy test ứng dụng.

## Việc còn lại

- Thêm script kiểm tra vào CI (đề xuất, chưa làm).
- Nếu chủ dự án muốn nhúng toàn văn BR và ERR vào từng story thay vì sao chép dòng áp dụng, báo để điều chỉnh.

## Bàn giao

- Việc tiếp theo: duyệt FEAT-01 và FEAT-02 để đạt DoR; sau đó code.
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`.
