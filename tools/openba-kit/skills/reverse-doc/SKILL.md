---
name: reverse-doc
description: "Tái lập bộ tài liệu SRS từ file rời rạc (Word, PDF, ảnh chụp)"
metadata:
  phase: 02-elicit-spec
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /reverse-doc — Tái lập tài liệu SRS từ file rời rạc [STANDARD WORKFLOW]

Tái lập bộ tài liệu SRS từ file rời rạc (Word, PDF, ảnh chụp)

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/reverse-doc`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/05-srs-ieee-830.md`\n- `rules/18-knowledge-graph-metadata.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/13-reverse-doc.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/srs/reverse-spec.md`

## Workflow thực hiện
1. Quét nội dung các file rời rạc (Word, PDF, text OCR).
2. Trích xuất các thực thể nghiệp vụ, quy tắc ẩn, logic phân quyền.
3. Tái cấu trúc thành định dạng SRS chuẩn IEEE 830, kèm đánh giá độ tin cậy (Confidence score: High/Medium/Low) cho từng mục.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
