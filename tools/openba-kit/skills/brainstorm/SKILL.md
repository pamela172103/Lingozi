---
name: brainstorm
description: "Ghi ý tưởng thô rồi phỏng vấn làm rõ trước khi viết tài liệu"
metadata:
  phase: 02-elicit-spec
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /brainstorm — Phỏng vấn làm rõ nghiệp vụ thô 🌟 [CORE WORKFLOW]

Ghi ý tưởng thô rồi phỏng vấn làm rõ trước khi viết tài liệu

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/brainstorm`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/16-ambiguity-detection-rules.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/04-brainstorm.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/brainstorms/{concept_name}.md`

## Workflow thực hiện
1. **Ghi nhận ý tưởng thô**:
   - Yêu cầu người dùng hoặc stakeholder mô tả bằng ngôn ngữ tự nhiên.
2. **Socratic Interview (Phỏng vấn phản biện)**:
   - AI đóng vai trò Senior BA, đặt lại 3-5 câu hỏi trúng đích vào các góc khuất:
     + Luồng ngoại lệ khi lỗi mạng / lỗi bên thứ ba?
     + Trùng lặp dữ liệu xử lý thế nào?
     + Trường hợp người dùng hủy ngang?
     + Quyền hạn truy cập giữa các vai trò?
3. **Chốt Scope thống nhất**:
   - Tổng kết thành bảng Scope: Cần làm (In-scope) vs Không làm (Out-of-scope).
   - Ghi lại các quyết định nghiệp vụ đã chốt vào `docs/{feature}/brainstorms/{concept_name}.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
