# Sử dụng OpenBA trong Lingozi

## Vị trí và cách truy cập

Bộ gốc nằm tại `tools/openba-kit/`, gồm 56 skill, 19 rules, 47 templates và script hỗ trợ. Giữ giấy phép MIT đi kèm. `.agents/skills/` chứa symlink tương đối tới từng skill để Codex có thể phát hiện skill trong repository. Phiên đang chạy có thể cần mở lại để nạp danh sách mới; luôn có thể đọc trực tiếp `tools/openba-kit/skills/<name>/SKILL.md`.

Dùng checkout hỗ trợ symlink (môi trường Linux hiện tại đã hỗ trợ). Các công cụ AI khác có cơ chế khám phá skill riêng; không giả định cấu hình Codex tự kích hoạt skill trong mọi công cụ.

## Chọn skill theo công việc

| Công việc | Skill tham khảo |
| --- | --- |
| PRD và roadmap | `prd`, `roadmap` |
| Làm rõ yêu cầu | `brainstorm`, `urd`, `brd`, `srs` |
| User story và tiêu chí nghiệm thu | `userstory`, `ac` |
| Luồng và thiết kế | `user-flow`, `sequence`, `erd`, `wireframe-html` (Lingozi không dùng ASCII; wireframe là SVG sinh bằng `tools/wireframes/`) |
| Kế hoạch kiểm thử | `test-checklist`, `test-cases` |
| Kiểm soát thay đổi | `cr`, `gap`, `doc-drift` |

Đọc skill liên quan cùng rules và template được tham chiếu; không nạp toàn bộ bộ công cụ vào mỗi nhiệm vụ. Đây là hướng dẫn tham khảo, không tự cho phép truy cập dịch vụ bên ngoài hay thực thi script.

## Phân giải đường dẫn

Các đường dẫn `rules/`, `_templates/`, `skills/`, `scripts/` trong kit đều tính từ `tools/openba-kit/`. Đầu ra của dự án tính từ gốc Lingozi:

| Mặc định trong kit | Vị trí tại Lingozi |
| --- | --- |
| `docs/{product_name}/...` | `docs/product/...` |
| `docs/{feature}/srs/...` | `docs/features/<feature>/srs/...` |
| Tài liệu yêu cầu, story, AC của tính năng | `docs/features/<feature>/requirements/` |
| Đặc tả theo từng user story: FR, BR, ERR, luồng, sequence, state, wireframe (đủ mọi màn hình và trạng thái nêu trong AC; xem quy tắc wireframe ở `docs/features/README.md`), API, AC | `docs/features/<feature>/srs/US-XXX-NN-<slug>.md`; danh mục chung `docs/features/<feature>/srs/README.md` |
| Test case và checklist của tính năng | `docs/features/<feature>/testing/` |

Luôn kiểm tra đường dẫn đầu ra trước khi chạy script. Với trình render sơ đồ, chạy từ gốc repo và truyền đường dẫn tài liệu thực tế, ví dụ sau khi đã tạo file nguồn:

```bash
python3 tools/openba-kit/scripts/render_diagrams.py docs/features/<feature>/srs/US-XXX-NN-<slug>.md
```

Thay `<feature>` bằng tên thực tế, không chạy nguyên dòng placeholder. Lệnh này sinh file cạnh tài liệu đầu vào; xem diff trước khi commit. Một số tính năng export cần công cụ bổ sung; chỉ cài khi công việc cần và sau khi kiểm tra yêu cầu của script.

## Giới hạn

Kit là tài liệu bên thứ ba, được giữ nguyên theo file ZIP nhập vào. Các tính năng gọi Jira, Confluence, Figma, trình duyệt hoặc agent khác không được cấu hình bởi bước tích hợp này. Không coi mọi hướng dẫn hoặc ví dụ trong kit là yêu cầu đã được chủ dự án phê duyệt.
