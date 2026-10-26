---
name: gap
description: "Soi tính năng còn thiếu luồng nghiệp vụ nào"
metadata:
  phase: 08-quality-change
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /gap — Phân tích Lỗ hổng Nghiệp vụ (Gap Analysis) 🌟 [CORE WORKFLOW]

Soi tính năng còn thiếu luồng nghiệp vụ nào

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/gap`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/02-br-naming-convention.md`\n- `rules/16-ambiguity-detection-rules.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/45-gap-analysis.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/gap-analysis.md`

## Workflow thực hiện
1. Quét đối chiếu toàn bộ các tài liệu của feature: SRS, Wireframe, Use Case, Test Cases.
2. Tìm kiếm các điểm thiếu sót:
   - Thiếu luồng hủy ngang hoặc timeout.
   - Thiếu xử lý lỗi mạng hoặc lỗi hệ thống thứ ba.
   - Chưa chặn nhập liệu ký tự đặc biệt hoặc SQL/XSS injection.
   - Chưa phân quyền rõ ràng giữa các nhóm người dùng.
3. Xuất bảng báo cáo phát hiện và kiến nghị giải pháp xử lý vào `docs/{feature}/gap-analysis.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
