---
name: playwright-gen
description: "Sinh script Playwright tự động chạy test trên trình duyệt"
metadata:
  phase: 07-testing
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /playwright-gen — Sinh Script Automation Test Playwright [STANDARD WORKFLOW]

Sinh script Playwright tự động chạy test trên trình duyệt

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/playwright-gen`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/14-test-case-traceability.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/44-playwright-gen.spec.ts`

## Vị trí lưu tệp mặc định
- `docs/{feature}/test/e2e.spec.ts`

## Workflow thực hiện
1. Đọc Test Cases và HTML Wireframe / Live URL.
2. Viết mã tự động kiểm thử Playwright TypeScript: `page.goto()`, `page.fill()`, `page.click()`, `expect()`.
3. Lưu vào `docs/{feature}/test/e2e.spec.ts`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
