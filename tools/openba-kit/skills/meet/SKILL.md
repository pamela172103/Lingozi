---
name: meet
description: "Biến ghi chú họp thành biên bản có quyết định và việc cần làm"
metadata:
  phase: 09-handoff-ops
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /meet — Chuyển Biên bản Họp thành Quyết định & Action Items 🌟 [CORE WORKFLOW]

Biến ghi chú họp thành biên bản có quyết định và việc cần làm

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/meet`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/15-change-request-impact-matrix.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/48-meeting-minutes.md`

## Vị trí lưu tệp mặc định
- `docs/meetings/{date}-meeting.md`

## Workflow thực hiện
1. Đọc raw notes hoặc transcript cuộc họp dự án.
2. Bóc tách 3 phần quan trọng:
   - Các nội dung đã thảo luận.
   - Các quyết định chính thức đã chốt (Decisions).
   - Danh sách công việc cần làm (Action Items) kèm người chịu trách nhiệm (Owner) và thời hạn (Deadline).
3. Lưu vào `docs/meetings/{date}-meeting.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
