---
name: test-cases
description: "Test case chi tiết chạy được, sinh từ checklist"
metadata:
  phase: 07-testing
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /test-cases — Bảng Đặc tả Test Cases Chi tiết 🌟 [CORE WORKFLOW]

Test case chi tiết chạy được, sinh từ checklist

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/test-cases`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/14-test-case-traceability.md`\n- `rules/08-gherkin-acceptance-criteria.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/43-test-cases.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/test/test-cases.md`

## Workflow thực hiện
1. Đọc các kịch bản Acceptance Criteria và Checklist.
2. Sinh bảng Test Case chi tiết gồm: Test Case ID, Story ID, Test Steps, Test Data, Expected Result theo Rule 14.
3. Đảm bảo 100% các mã `ERR-xxx` và `BR-xxx` đều có test case kiểm thử tương ứng.
4. Lưu vào `docs/{feature}/test/test-cases.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
