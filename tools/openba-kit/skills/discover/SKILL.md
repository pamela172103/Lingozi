---
name: discover
description: "Điều tra ý tưởng còn phân vân: nhu cầu, đối thủ — nên làm hay bỏ"
metadata:
  phase: 01-planning
  category: business-analysis
  version: 1.0.0
  is_core: false
---

# /discover — Điều tra & Thẩm định Ý tưởng (Product Discovery) [STANDARD WORKFLOW]

Điều tra ý tưởng còn phân vân: nhu cầu, đối thủ — nên làm hay bỏ

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/discover`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/16-ambiguity-detection-rules.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/03-discover.md`

## Vị trí lưu tệp mặc định
- `docs/{product_name}/03-discovery-report.md`

## Workflow thực hiện
1. Xác định giả thuyết cần kiểm chứng (Hypothesis).
2. Phân tích đối thủ cạnh tranh (Direct & Indirect Competitors), so sánh feature matrix và pricing.
3. Đánh giá tính khả thi theo 4 rủi ro: Value, Usability, Feasibility, Viability.
4. Đưa ra kết luận rõ ràng: GO, NO-GO hoặc PIVOT kèm số liệu dẫn chứng.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
