---
name: preview
description: "Trang HTML xem toàn bộ tài liệu của một tính năng"
metadata:
  phase: 09-handoff-ops
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /preview — Trang HTML Duyệt Toàn bộ Tài liệu Tính năng [STANDARD WORKFLOW]

Trang HTML xem toàn bộ tài liệu của một tính năng

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/preview`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/18-knowledge-graph-metadata.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/31-wireframe-html.html`

## Vị trí lưu tệp mặc định
- `docs/{feature}/preview.html`

## Workflow thực hiện
1. **Kết xuất trực quan toàn bộ sơ đồ**:
   - Chạy lệnh `python3 scripts/render_diagrams.py docs/{feature}/` để tự động biến các khối Mermaid thô thành bản vẽ visual HTML/SVG chuẩn `diagram-design`.
2. **Tổng hợp dữ liệu**:
   - Gom toàn bộ hồ sơ tính năng: Brainstorm, SRS, Wireframe, Stories, Test Cases, và thư mục `diagrams/` vừa kết xuất.
3. **Tạo trang HTML tổng hợp**:
   - Nhúng trực tiếp bản vẽ visual SVG/HTML vào mục Sơ đồ kiến trúc / Luồng dữ liệu (có kèm nút xem Fullscreen hoặc tải file SVG vector).
   - Có thanh điều hướng bên trái (Sidebar) giúp stakeholder xem toàn bộ hồ sơ tính năng chỉ với 1 click.
4. **Ghi file**:
   - Lưu vào `docs/{feature}/preview.html`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
