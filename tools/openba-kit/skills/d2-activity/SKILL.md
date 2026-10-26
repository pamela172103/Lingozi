---
name: d2-activity
description: "Sơ đồ hoạt động bản đẹp, đứng riêng (D2)"
metadata:
  phase: 03-diagrams
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /d2-activity — Sơ đồ Hoạt động độc lập (D2) [STANDARD WORKFLOW]

Sơ đồ hoạt động bản đẹp, đứng riêng (D2)

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/d2-activity`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/02-br-naming-convention.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/22-activity-d2.d2`

## Vị trí lưu tệp mặc định
- `docs/{feature}/srs/activity.d2`

## Workflow thực hiện
1. Viết sơ đồ hoạt động dạng pipeline/flowchart bằng D2lang.
2. Phân nhóm các khối (step containers) và rẽ nhánh rõ ràng.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
