---
name: ask
description: "Hỏi và được giải thích nghiệp vụ đang chạy thế nào"
metadata:
  phase: 08-quality-change
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /ask — Hỏi đáp & Giải thích Nghiệp vụ Dự án [STANDARD WORKFLOW]

Hỏi và được giải thích nghiệp vụ đang chạy thế nào

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/ask`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/18-knowledge-graph-metadata.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/08-srs.md`

## Vị trí lưu tệp mặc định
- `stdout`

## Workflow thực hiện
1. Tiếp nhận câu hỏi nghiệp vụ từ dev, QA hoặc stakeholder.
2. Tra cứu tài liệu liên quan trong `docs/` thông qua Knowledge Graph metadata.
3. Trả lời súc tích, dẫn nguồn chính xác từ file tài liệu và mã điều khoản.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
