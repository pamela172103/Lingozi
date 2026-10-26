---
name: bpmn
description: "Quy trình chuẩn BPMN 2.0, import được vào Camunda / Bizagi"
metadata:
  phase: 03-diagrams
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /bpmn — Quy trình chuẩn BPMN 2.0 [STANDARD WORKFLOW]

Quy trình chuẩn BPMN 2.0, import được vào Camunda / Bizagi

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/bpmn`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/02-br-naming-convention.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/18-bpmn-process.bpmn`

## Vị trí lưu tệp mặc định
- `docs/{feature}/srs/process.bpmn`

## Workflow thực hiện
1. Tạo quy trình nghiệp vụ theo chuẩn XML BPMN 2.0.
2. Định nghĩa Start Event, Tasks (User Task, Service Task), Exclusive Gateway, End Event.
3. Đảm bảo file import được trực tiếp vào Camunda Modeler hoặc Bizagi.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
