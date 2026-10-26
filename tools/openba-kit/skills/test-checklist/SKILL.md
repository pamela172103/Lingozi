---
name: test-checklist
description: "Outline các kịch bản cần test để review trước"
metadata:
  phase: 07-testing
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /test-checklist — Khung Kịch bản Kiểm thử Tổng quan (Test Outline) 🌟 [CORE WORKFLOW]

Outline các kịch bản cần test để review trước

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/test-checklist`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/14-test-case-traceability.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/42-test-checklist.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/test/checklist.md`

## Workflow thực hiện
1. Tổng hợp toàn bộ các nhánh nghiệp vụ từ SRS và User Story.
2. Lập danh mục outline các nhóm kiểm thử: Chức năng, Giao diện, Hiệu năng, Bảo mật, Dữ liệu ranh giới.
3. BA và QA review thống nhất độ phủ trước khi viết test case chi tiết.
4. Lưu vào `docs/{feature}/test/checklist.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
