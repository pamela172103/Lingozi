---
name: userstory
description: "Sinh user story sẵn sàng đưa vào backlog"
metadata:
  phase: 04-usecase-story
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /userstory — Bóc tách User Story Backlog 🌟 [CORE WORKFLOW]

Sinh user story sẵn sàng đưa vào backlog

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/userstory`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/07-invest-user-story.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/27-userstory.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/userstories/backlog.md`

## Workflow thực hiện
1. Bóc tách Use Case / FR thành các User Story độc lập.
2. Định dạng câu chuẩn: Là một [Actor], tôi muốn [Hành động] để [Giá trị mang lại].
3. Kiểm tra đạt chuẩn INVEST theo Rule 07.
4. Gán Story Points và độ ưu tiên P0/P1/P2.
5. Lưu vào `docs/{feature}/userstories/backlog.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
