---
name: srs
description: "Đặc tả kỹ thuật: FR / NFR / business rule / ma trận lỗi"
metadata:
  phase: 02-elicit-spec
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /srs — Đặc tả Kỹ thuật Hệ thống (SRS) 🌟 [CORE WORKFLOW]

Đặc tả kỹ thuật: FR / NFR / business rule / ma trận lỗi

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/srs`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/01-fr-naming-convention.md`\n- `rules/02-br-naming-convention.md`\n- `rules/03-err-naming-convention.md`\n- `rules/04-nfr-standards.md`\n- `rules/05-srs-ieee-830.md`\n- `rules/11-error-matrix-convention.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/08-srs.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/srs/spec.md`

## Workflow thực hiện
1. **Chuẩn bị đầu vào**: Đọc kết quả từ `/brainstorm` hoặc yêu cầu tính năng.
2. **Viết Functional Requirements (FR)**:
   - Đánh mã chuẩn `FR-[MODULE]-[FEATURE]-[SEQ]` theo Rule 01.
   - Bắt buộc mô tả Input, Processing Logic, Output.
3. **Xây dựng Business Rules (BR)**:
   - Đánh mã `BR-[DOMAIN]-[SEQ]` theo Rule 02.
   - Phát biểu chuẩn WHEN ... THEN ... UNLESS ...
4. **Xây dựng Ma trận Lỗi (Error Matrix)**:
   - Đánh mã `ERR-[MODULE]-[HTTP_STATUS]-[SEQ]` theo Rule 03 & 11.
   - Ghi rõ thông báo người dùng và gợi ý xử lý.
5. **Yêu cầu phi chức năng (NFR)**:
   - Định lượng hiệu năng (P95 latency, TPS), bảo mật (OWASP, mã hóa) theo Rule 04.
6. **Lưu file**: Ghi file vào `docs/{feature}/srs/spec.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
