---
name: figma
description: "Vẽ màn hình thật lên Figma, bám design system"
metadata:
  phase: 05-screen-design
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /figma — Vẽ Màn hình lên Figma qua MCP [STANDARD WORKFLOW]

Vẽ màn hình thật lên Figma, bám design system

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/figma`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/13-wireframe-html-guidelines.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/34-figma-spec.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/ui/figma-spec.md`

## Workflow thực hiện
1. Đọc cấu trúc wireframe đã chốt.
2. Gọi công cụ Figma MCP để tạo Frame, Component, Text styles và Auto-layout bám theo Design System dự án.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
