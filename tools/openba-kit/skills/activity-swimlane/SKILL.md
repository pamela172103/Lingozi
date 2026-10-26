---
name: activity-swimlane
description: "Sơ đồ hoạt động chia làn theo vai trò (PlantUML)"
metadata:
  phase: 03-diagrams
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /activity-swimlane — Sơ đồ Hoạt động phân làn (PlantUML) [STANDARD WORKFLOW]

Sơ đồ hoạt động chia làn theo vai trò (PlantUML)

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/activity-swimlane`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/17-actor-role-definition.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/17-activity-swimlane.puml`

## Vị trí lưu tệp mặc định
- `docs/{feature}/srs/activity-swimlane.puml`

## Workflow thực hiện
1. Phân chia các làn (swimlanes) theo từng vai trò: Khách hàng, Thu ngân, Hệ thống, Kế toán.
2. Viết cú pháp PlantUML `|Làn 1| ... |Làn 2|`.
3. Thể hiện sự chuyển giao trách nhiệm giữa các phòng ban/thành phần.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
