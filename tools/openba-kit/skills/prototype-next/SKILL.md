---
name: prototype-next
description: "Prototype Next.js chạy thật: điều hướng, lưu trạng thái, nhánh lỗi"
metadata:
  phase: 05-screen-design
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /prototype-next — Prototype Next.js chạy thật [STANDARD WORKFLOW]

Prototype Next.js chạy thật: điều hướng, lưu trạng thái, nhánh lỗi

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/prototype-next`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/10-api-contract-standards.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/33-prototype-next.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/prototype-next/README.md`

## Workflow thực hiện
1. Tạo code scaffold cho ứng dụng Next.js App Router.
2. Tạo các routes trang, Server Actions giả lập API delay và trả mã lỗi theo SRS.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
