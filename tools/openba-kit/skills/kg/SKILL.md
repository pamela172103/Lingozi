---
name: kg
description: "Knowledge Graph của toàn bộ tài liệu, tra cứu liên kết"
metadata:
  phase: 08-quality-change
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /kg — Đồ thị Tri thức Tài liệu (Knowledge Graph) 🌟 [CORE WORKFLOW]

Knowledge Graph của toàn bộ tài liệu, tra cứu liên kết

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/kg`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/18-knowledge-graph-metadata.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/46-knowledge-graph-index.md`

## Vị trí lưu tệp mặc định
- `docs/knowledge-graph.json`

## Workflow thực hiện
1. Quét frontmatter YAML của mọi file `.md` trong thư mục `docs/` theo Rule 18.
2. Trích xuất danh sách nodes (Documents, FRs, BRs, ERD entities) và edges (`depends_on`, `related_diagrams`).
3. Xuất đồ thị sang file `docs/knowledge-graph.json` và bảng tra cứu tóm tắt.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
