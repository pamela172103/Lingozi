---
name: doc-drift
description: "Đối chiếu code dev với tài liệu: chỗ nào lệch, chỗ nào chưa làm"
metadata:
  phase: 08-quality-change
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /doc-drift — Kiểm tra Độ lệch Tài liệu và Source Code 🌟 [CORE WORKFLOW]

Đối chiếu code dev với tài liệu: chỗ nào lệch, chỗ nào chưa làm

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/doc-drift`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/14-test-case-traceability.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/46-doc-drift.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/doc-drift-report.md`

## Workflow thực hiện
1. Đọc SRS / User Stories và đọc codebase thực tế của lập trình viên.
2. So sánh danh mục FR xem tính năng nào đã làm, tính năng nào chưa làm.
3. Phát hiện chỗ bị "lệch pha" (Drift):
   - Code làm khác so với tài liệu đặc tả.
   - Validation trong code lỏng hơn hoặc chặt hơn Business Rule.
4. Xuất báo cáo đối chiếu vào `docs/{feature}/doc-drift-report.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
