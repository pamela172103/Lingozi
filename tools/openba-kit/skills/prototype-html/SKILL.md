---
name: prototype-html
description: "Prototype bấm được như app thật, lưu trạng thái"
metadata:
  phase: 05-screen-design
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /prototype-html — Prototype HTML/JS lưu trạng thái [STANDARD WORKFLOW]

Prototype bấm được như app thật, lưu trạng thái

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/prototype-html`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/13-wireframe-html-guidelines.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/32-prototype-html.html`

## Vị trí lưu tệp mặc định
- `docs/{feature}/prototype/{app_name}.html`

## Workflow thực hiện
1. Dựng prototype web tương tác đa màn hình (SPA) gói trong 1 file HTML.
2. Sử dụng `localStorage` để lưu state dữ liệu giả lập (mock data).
3. Khách hàng có thể trải nghiệm thêm, sửa, xóa, duyệt đơn như app thật.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
