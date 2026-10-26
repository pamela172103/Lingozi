---
name: ac
description: "Acceptance criteria dạng Given / When / Then cho từng story"
metadata:
  phase: 04-usecase-story
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /ac — Acceptance Criteria dạng Gherkin BDD 🌟 [CORE WORKFLOW]

Acceptance criteria dạng Given / When / Then cho từng story

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/ac`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/08-gherkin-acceptance-criteria.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/28-acceptance-criteria.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/userstories/acceptance-criteria.md`

## Workflow thực hiện
1. Đọc User Story mục tiêu.
2. Viết tối thiểu 03 kịch bản kiểm thử BDD:
   - Scenario 1: Happy Path (Thành công).
   - Scenario 2: Business Error / Negative Path (Thất bại có kiểm soát).
   - Scenario 3: Boundary & Security (Biên và bảo mật).
3. Tuân thủ cú pháp Given - When - Then theo Rule 08.
4. Lưu vào `docs/{feature}/userstories/acceptance-criteria.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
