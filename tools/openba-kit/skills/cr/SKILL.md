---
name: cr
description: "Phân tích tác động thay đổi rồi sửa tài liệu liên quan"
metadata:
  phase: 08-quality-change
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /cr — Xử lý Yêu cầu Thay đổi (Change Request) 🌟 [CORE WORKFLOW]

Phân tích tác động thay đổi rồi sửa tài liệu liên quan

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/cr`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/15-change-request-impact-matrix.md`\n- `rules/19-document-versioning-rules.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/47-change-request.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/cr/{cr_id}.md`

## Workflow thực hiện
1. Tiếp nhận yêu cầu thay đổi từ khách hàng hoặc PO.
2. Thực hiện Đánh giá Tác động (Impact Analysis) theo Rule 15:
   - Những tài liệu nào bị ảnh hưởng (SRS, Diagram, Story, Test case)?
   - Ảnh hưởng database schema hoặc API contract không?
   - Ước tính thời gian và rủi ro.
3. Xuất báo cáo CR và trình người dùng phê duyệt.
4. Sau khi người dùng duyệt, tự động cập nhật đồng bộ toàn bộ các tài liệu liên quan và tăng version theo Rule 19.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
