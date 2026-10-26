---
name: state
description: "Sơ đồ trạng thái cho một đối tượng (đơn hàng, tài khoản)"
metadata:
  phase: 03-diagrams
  category: business-analysis
  version: 1.0.0
  is_core: true
---

# /state — Sơ đồ Trạng thái Đối tượng (State Machine) 🌟 [CORE WORKFLOW]

Sơ đồ trạng thái cho một đối tượng (đơn hàng, tài khoản)

## Mục tiêu
Cung cấp hướng dẫn chuyên gia BA để thực thi lệnh `/state`, sinh ra tài liệu chất lượng cao, có thể đưa vào sản xuất ngay lập tức mà không cần chỉnh sửa lại format.

## Quy chuẩn bắt buộc tuân thủ (Rules)
- `rules/12-state-transition-rules.md`

## Biểu mẫu tham chiếu (Template)
- `_templates/19-state-diagram.md`

## Vị trí lưu tệp mặc định
- `docs/{feature}/srs/states.md`

## Workflow thực hiện
1. Xác định đối tượng quản lý vòng đời (Đơn hàng, Hợp đồng, Tài khoản).
2. Vẽ sơ đồ trạng thái Mermaid `stateDiagram-v2`.
3. Xác định rõ Initial State, Intermediate States, Terminal States.
4. Lập Ma trận chuyển dịch trạng thái (Current State -> Trigger -> Guard -> Target State) theo Rule 12.
5. Ghi vào `docs/{feature}/srs/states.md`.

## Tiêu chí Nghiệm thu (Quality Checklist)
- [ ] Sử dụng ngôn ngữ tiếng Việt chuyên nghiệp, đúng thuật ngữ IT BA.
- [ ] Không chứa các từ ngữ mơ hồ định tính (Rule 16).
- [ ] Tuân thủ quy ước đặt mã chuẩn (FR/BR/ERR/UC/US).
- [ ] Lưu đúng vị trí tệp quy định trong dự án.
