---
name: user-flow
description: "Phân tích luồng người dùng, phủ happy / error / edge case"
metadata:
  phase: 05-screen-design
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /user-flow — Phân tích Luồng Người dùng (User Flow) 🌟 [CORE WORKFLOW]

Phân tích luồng người dùng, phủ happy / error / edge case

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/user-flow`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/02-br-naming-convention.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/29-user-flow.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/ui/user-flow.md`

## Workflow thực hiện
1. Liệt kê các màn hình người dùng đi qua từ điểm chạm đầu tiên tới khi hoàn tất.
2. Vẽ sơ đồ luồng thao tác (Screen transitions).
3. Liệt kê các trạng thái: Normal, Loading, Empty, Error, Offline.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
