---
name: update-overview
description: "Cập nhật tài liệu dùng chung của dự án"
metadata:
  phase: 09-handoff-ops
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /update-overview — Cập nhật Tài liệu Tổng quan Dự án [STANDARD WORKFLOW]

Cập nhật tài liệu dùng chung của dự án

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/update-overview`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/19-document-versioning-rules.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/01-prd.md`

## Vị trí lưu tệp mặc định
- `README.md`

## Workflow thực hiện
1. Quét các tính năng mới đã hoàn thành.
2. Cập nhật lại file `README.md` hoặc tài liệu tổng quan hệ thống `docs/OVERVIEW.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
