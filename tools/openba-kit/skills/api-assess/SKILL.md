---
name: api-assess
description: "Đánh giá đối tác API, cân nhắc tự xây hay mua"
metadata:
  phase: 06-api-integration
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /api-assess — Đánh giá Đối tác & Dịch vụ API [STANDARD WORKFLOW]

Đánh giá đối tác API, cân nhắc tự xây hay mua

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/api-assess`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/10-api-contract-standards.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/35-api-assess.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/api/api-assessment.md`

## Workflow thực hiện
1. Lập bảng so sánh giữa các nhà cung cấp API (vd: VNPAY vs PayOS vs Stripe).
2. Đánh giá chi phí giao dịch, SLA cam kết, tính năng hỗ trợ, bảo mật và sandbox.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
