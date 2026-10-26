---
name: dashboard
description: "Dashboard tổng quan: tiến độ, độ phủ, rủi ro toàn dự án"
metadata:
  phase: 08-quality-change
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /dashboard — Dashboard Tiến độ & Sức khỏe Dự án [STANDARD WORKFLOW]

Dashboard tổng quan: tiến độ, độ phủ, rủi ro toàn dự án

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/dashboard`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/14-test-case-traceability.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/45-project-health-dashboard.md`

## Vị trí lưu tệp mặc định
- `docs/project-dashboard.md`

## Workflow thực hiện
1. Quét toàn bộ thư mục `docs/`.
2. Tính toán các chỉ số: Tổng số FR, % đã có Story, % đã có Test Case, % đã có Wireframe.
3. Vẽ bảng tổng hợp độ phủ (Coverage Rate) và danh sách các rủi ro tồn đọng.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
