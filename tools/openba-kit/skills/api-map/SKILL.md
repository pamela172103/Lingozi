---
name: api-map
description: "Mapping field 3 tầng: API, dữ liệu hệ thống, màn hình"
metadata:
  phase: 06-api-integration
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /api-map — Ma trận Mapping Dữ liệu 3 Tầng 🌟 [CORE WORKFLOW]

Mapping field 3 tầng: API, dữ liệu hệ thống, màn hình

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/api-map`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/09-data-dictionary-standard.md`\n- `rules/10-api-contract-standards.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/38-api-map.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/api/data-mapping.md`

## Workflow thực hiện
1. Lập bảng đối chiếu 3 tầng:
   - Tầng 1: Trường giao diện người dùng (UI Input/Label).
   - Tầng 2: Cột cơ sở dữ liệu nội bộ (Database Column).
   - Tầng 3: Payload JSON của API đối tác (API Field Name).
2. Ghi rõ quy tắc chuyển đổi dữ liệu (Transformation Rules: format ngày tháng, mã hóa, đơn vị tiền tệ).
3. Lưu vào `docs/{feature}/api/data-mapping.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
