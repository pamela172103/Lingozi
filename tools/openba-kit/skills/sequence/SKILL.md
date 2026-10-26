---
name: sequence
description: "Sơ đồ tuần tự: ai gọi ai, theo thứ tự nào"
metadata:
  phase: 03-diagrams
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /sequence — Sơ đồ Tuần tự (Sequence Diagram) 🌟 [CORE WORKFLOW]

Sơ đồ tuần tự: ai gọi ai, theo thứ tự nào

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/sequence`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/01-fr-naming-convention.md`\n- `rules/10-api-contract-standards.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/15-sequence-diagram.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/srs/flows.md`

## Workflow thực hiện
1. Xác định các Actor và Participants (User, Frontend, API Gateway, Service, Database, 3rd Party).
2. Vẽ sơ đồ tương tác chuẩn Mermaid (`sequenceDiagram`) với `autonumber`.
3. Phủ đầy đủ nhánh thành công (`alt Hợp lệ`) và nhánh lỗi (`else Lỗi`).
4. Ghi chú mã lỗi `ERR-xxx` tại các điểm rẽ nhánh lỗi.
5. Ghi vào `docs/{feature}/srs/flows.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
