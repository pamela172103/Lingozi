---
name: usecase
description: "Use case chi tiết chuẩn Cockburn: actor, điều kiện, luồng chính, ngoại lệ"
metadata:
  phase: 04-usecase-story
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /usecase — Đặc tả Use Case chi tiết chuẩn Cockburn 🌟 [CORE WORKFLOW]

Use case chi tiết chuẩn Cockburn: actor, điều kiện, luồng chính, ngoại lệ

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/usecase`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/06-cockburn-use-case.md`\n- `rules/17-actor-role-definition.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/26-usecase-cockburn.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/usecases/{usecase_id}.md`

## Workflow thực hiện
1. Đặt mã `UC-[MODULE]-[SEQ]` và tên theo dạng Động từ + Danh từ.
2. Xác định Primary Actor, Pre-conditions, Post-conditions.
3. Viết Luồng sự kiện chính (Main Success Scenario) theo từng bước tương tác 1, 2, 3...
4. Viết toàn bộ Luồng ngoại lệ & Nhánh rẽ (Extensions: 3a, 3b, 5a...) có trích dẫn mã lỗi `ERR-xxx`.
5. Lưu file vào `docs/{feature}/usecases/{usecase_id}.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
