---
name: urd
description: "Tài liệu yêu cầu người dùng: persona, nhu cầu, hành trình"
metadata:
  phase: 02-elicit-spec
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /urd — Tài liệu Yêu cầu Người dùng (URD) [STANDARD WORKFLOW]

Tài liệu yêu cầu người dùng: persona, nhu cầu, hành trình

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/urd`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/17-actor-role-definition.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/05-urd.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/05-urd.md`

## Workflow thực hiện
1. Định nghĩa chân dung người dùng (User Personas) và hành vi thực tế.
2. Lập bản đồ hành trình người dùng (User Journey Map): Nhận biết -> Xem -> Thao tác -> Nhận kết quả.
3. Tổng hợp danh sách nhu cầu người dùng (User Needs) kèm mức độ cấp bách.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
