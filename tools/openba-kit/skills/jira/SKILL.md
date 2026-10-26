---
name: jira
description: "Đồng bộ 2 chiều backlog với Jira Cloud"
metadata:
  phase: 09-handoff-ops
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /jira — Đồng bộ 2 chiều Jira Cloud [STANDARD WORKFLOW]

Đồng bộ 2 chiều backlog với Jira Cloud

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/jira`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/07-invest-user-story.md`\n- `rules/08-gherkin-acceptance-criteria.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/27-userstory.md`

## Vị trí lưu tệp mặc định
- `docs/jira-sync-log.md`

## Workflow thực hiện
1. Đọc User Stories và Acceptance Criteria trong `docs/{feature}/userstories/`.
2. Tạo payload tương thích Jira REST API v3 (Epics, Issues, Story Points, Gherkin custom fields).
3. Hỗ trợ xuất file CSV để import thủ công hoặc gọi API đẩy trực tiếp.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
