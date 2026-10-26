---
name: wireframe-html
description: "Wireframe HTML đen trắng, render element thật"
metadata:
  phase: 05-screen-design
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /wireframe-html — Wireframe HTML Đơn sắc Tương tác 🌟 [CORE WORKFLOW]

Wireframe HTML đen trắng, render element thật

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/wireframe-html`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/13-wireframe-html-guidelines.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/31-wireframe-html.html`

## Vị trí lưu tệp mặc định
- `docs/{feature}/html-wireframe/{screen_name}.html`

## Workflow thực hiện
1. Tạo 01 file HTML duy nhất không phụ thuộc thư viện ngoài.
2. Áp dụng bảng màu xám chuẩn (Grayscale & High contrast) theo Rule 13.
3. Dựng form nhập liệu với các thẻ HTML5 ngữ nghĩa.
4. Thêm JavaScript mô phỏng hành vi: bấm nút submit báo thành công, hiện lỗi validate đỏ khi nhập sai, toggle modal.
5. Lưu file vào `docs/{feature}/html-wireframe/{screen_name}.html`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
