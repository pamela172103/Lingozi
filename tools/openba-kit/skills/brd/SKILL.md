---
name: brd
description: "Tài liệu yêu cầu nghiệp vụ: mục tiêu, phạm vi, rủi ro, ROI"
metadata:
  phase: 02-elicit-spec
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /brd — Tài liệu Yêu cầu Nghiệp vụ (BRD) [STANDARD WORKFLOW]

Tài liệu yêu cầu nghiệp vụ: mục tiêu, phạm vi, rủi ro, ROI

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/brd`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/15-change-request-impact-matrix.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/06-brd.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/06-brd.md`

## Workflow thực hiện
1. Phân tích bối cảnh kinh doanh, bài toán cần giải quyết của doanh nghiệp.
2. Tính toán hiệu quả đầu tư dự kiến (ROI), chi phí phát triển và rủi ro vận hành.
3. Xác định các chỉ số thành công chính (Success Metrics/KPIs).

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
