---
name: render-diagrams
description: "Quét và chuyển đổi toàn bộ sơ đồ Mermaid trong tài liệu thành visual diagrams HTML + SVG chuẩn editorial"
metadata:
  phase: 03-diagrams
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /render-diagrams — Kết xuất Sơ đồ Thiết kế Trực quan (Diagram Design) 🌟 [CORE WORKFLOW]

Tự động quét các tệp tài liệu Markdown chứa khối Mermaid (`sequenceDiagram`, `stateDiagram-v2`, `flowchart`, `erDiagram`), phân tích cú pháp AST và xuất bản thành các file visual **HTML + SVG độc lập**, loại bỏ nhược điểm phải mất công render hoặc convert thủ công.

## Mục tiêu
- Biến các khối Mermaid thô thành bản vẽ thiết kế đạt tiêu chuẩn **Editorial Design** (lưới 4px, font Instrument Serif + Geist, màu accent chọn lọc, không đổ bóng rẻ tiền).
- Cung cấp file `.html` mở trực tiếp trên trình duyệt không cần internet/server và file `.svg` chuẩn vector dùng cho Slide, Figma hoặc in ấn.
- Tạo trang `diagrams/index.html` tổng hợp trực quan giúp stakeholder và dev xem nhanh toàn bộ luồng.

## Quy chuẩn bắt buộc tuân thủ
- `skills/diagram-design/SKILL.md` — Quy chuẩn thiết kế diagram-design (triết lý tối giản, quy tắc connector góc vuông r=8, khoảng hở nhãn 6-10px, 1-2 điểm nhấn coral #bf4520).
- `rules/10-api-contract-standards.md` — Chuẩn đặt tên và định tuyến luồng.

## Lệnh thực thi tự động

Chạy script tự động có sẵn trong BA-Kit:
```bash
# Quét 1 tệp markdown cụ thể:
python3 scripts/render_diagrams.py docs/{feature}/srs/flows.md

# Hoặc quét toàn bộ thư mục tài liệu của tính năng:
python3 scripts/render_diagrams.py docs/{feature}/
```

## Workflow thực hiện
1. **Quét tệp đầu vào**: Xác định các tệp `.md` trong `docs/{feature}/srs/` hoặc thư mục chỉ định có chứa khối ` ```mermaid `.
2. **Trích xuất IR**: Sử dụng `skills/diagram-design/scripts/mermaid_extract.py` để lấy cây AST chuẩn hóa (Nodes, Edges, Fragments, Lifelines, States).
3. **Kết xuất Visual HTML**:
   - Áp dụng token màu chuẩn (`paper: #f5f5f5`, `ink: #2d3142`, `muted: #4f5d75`, `accent: #bf4520`).
   - Căn chỉnh toạ độ trên lưới 4px, nhãn thông điệp có mask che nét vẽ, góc bo mềm mại.
   - Lưu vào thư mục `docs/{feature}/srs/diagrams/{filename}-{index}.html`.
4. **Xuất bản Vector SVG**:
   - Sử dụng `skills/diagram-design/scripts/export_svg.py` để trích xuất file `.svg` vector độc lập từ file HTML.
5. **Cập nhật Gallery & Báo cáo**:
   - Tự động sinh `docs/{feature}/srs/diagrams/index.html` hiển thị toàn bộ sơ đồ.
   - Thông báo đường dẫn các file đã kết xuất để người dùng click xem ngay.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Mọi sơ đồ sinh ra có thể mở trực tiếp bằng trình duyệt mà không bị vỡ layout hoặc phụ thuộc mạng.
- [ ] File SVG chứa đầy đủ font @import và namespace an toàn để nhúng vào Figma hoặc slide.
- [ ] Đúng số lượng sơ đồ tương ứng với các khối Mermaid trong file nguồn.
