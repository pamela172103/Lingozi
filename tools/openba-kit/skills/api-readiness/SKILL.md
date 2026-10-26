---
name: api-readiness
description: "Cổng kiểm tra trước khi lên production"
metadata:
  phase: 06-api-integration
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /api-readiness — Cổng Kiểm định Sẵn sàng Production (API Gate) [STANDARD WORKFLOW]

Cổng kiểm tra trước khi lên production

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/api-readiness`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/04-nfr-standards.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/41-api-readiness.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/api/production-readiness.md`

## Workflow thực hiện
1. Rà soát danh mục Go-Live: SSL Certificate, IP Whitelisting, Production API Keys, Alerting & Monitoring, Circuit Breaker.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
