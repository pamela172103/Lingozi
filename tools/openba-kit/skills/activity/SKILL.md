---
name: activity
description: "Sơ đồ hoạt động có nhánh quyết định"
metadata:
  phase: 03-diagrams
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /activity — Sơ đồ Hoạt động (Activity Diagram) 🌟 [CORE WORKFLOW]

Sơ đồ hoạt động có nhánh quyết định

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/activity`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/02-br-naming-convention.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/16-activity-diagram.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/srs/activity.md`

## Workflow thực hiện
1. Xác định điểm bắt đầu (`[*]`) và điểm kết thúc.
2. Vẽ các bước xử lý nghiệp vụ theo sơ đồ Mermaid flow hoặc state.
3. Thể hiện rõ các điểm rẽ nhánh quyết định (Decision diamonds) và điều kiện đi kèm.
4. Xuất file vào `docs/{feature}/srs/activity.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
