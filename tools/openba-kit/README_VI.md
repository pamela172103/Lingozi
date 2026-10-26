# BA-Kit Open — Trọn bộ 56 AI Skills cho IT Business Analyst & Product Owner

[![Tiếng Việt](https://img.shields.io/badge/Lang-Ti%E1%BA%BFng%20Vi%E1%BB%87t-red.svg)](README_VI.md)
[![English](https://img.shields.io/badge/English-README-blue.svg)](README.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

> [English Version available here](README.md)

Bộ kỹ năng mở rộng (Agent Skills) chuẩn hóa, biến mọi AI Coding Agent (**Claude Code, Antigravity, OpenAI Codex, Hermes Agent, Cursor...**) thành trợ lý Business Analyst chuyên nghiệp. Tự động hóa toàn diện quy trình tài liệu phần mềm: từ ý tưởng thô, phân tích nghiệp vụ, vẽ sơ đồ trực quan (HTML/SVG), thiết kế wireframe, bóc tách backlog, sinh test cases cho đến bàn giao kỹ thuật.

---

## 🌟 Điểm nổi bật & Tính năng mới

- **56 AI Skills chuyên sâu**: Bao trọn 9 giai đoạn phát triển phần mềm theo chuẩn quốc tế (IEEE 830, Cockburn Use Cases, INVEST Stories, Gherkin AC).
- **Tích hợp Diagram Design (v2.6)**: Tự động chuyển đổi sơ đồ text Mermaid khô cứng thành **bản vẽ vector HTML/SVG chuẩn Editorial** (lưới 4px, font Instrument Serif + Geist, không lo vỡ hình hay mất công convert thủ công).
- **19 Bộ Quy chuẩn Bắt buộc (Rules)**: Loại bỏ các mô tả mơ hồ, tự động chuẩn hóa quy ước đặt mã `FR-`, `BR-`, `ERR-`, `UC-`, `US-`.
- **47 Biểu mẫu Thực chiến (Templates)**: Sẵn sàng đưa vào dự án thực tế ngay lập tức.
- **Preview & Handoff một chạm**: Tạo file `preview.html` tổng hợp kèm thanh điều hướng và sơ đồ tương tác cho stakeholder.

---

## 📁 Cấu trúc Thư mục Dự án

```
ba-kit-open/
├── skills/              # 56 AI Skills chuẩn Agent Skill (.claude/skills hoặc .hermes/skills)
│   ├── brainstorm/      # Làm rõ nghiệp vụ thô
│   ├── srs/             # Đặc tả kỹ thuật IEEE 830
│   ├── sequence/        # Sơ đồ tuần tự Mermaid
│   ├── render-diagrams/ # Tự động kết xuất Mermaid thành HTML & SVG trực quan
│   ├── diagram-design/  # Hệ thống 45 visual diagram types chuẩn editorial
│   ├── erd/             # Sơ đồ quan hệ thực thể
│   ├── wireframe-html/  # Wireframe HTML xem và tương tác trực tiếp
│   ├── userstory/       # Backlog User Story chuẩn INVEST
│   ├── test-cases/      # Test cases chi tiết
│   ├── preview/         # Trang HTML tổng duyệt hồ sơ tính năng
│   ├── cr/              # Xử lý Change Request & Phân tích tác động
│   └── ... (đủ 56 skills)
├── rules/               # 19 Quy ước viết tài liệu & mã hóa chuẩn BA
│   ├── 01-fr-naming-convention.md
│   ├── 02-br-naming-convention.md
│   ├── 03-err-naming-convention.md
│   ├── 04-nfr-standards.md
│   ├── 05-srs-ieee-830.md
│   ├── 06-cockburn-use-case.md
│   ├── 07-invest-user-story.md
│   ├── 08-gherkin-acceptance-criteria.md
│   ├── 09-data-dictionary-standard.md
│   ├── 10-api-contract-standards.md
│   ├── 11-error-matrix-convention.md
│   ├── 12-state-transition-rules.md
│   ├── 13-wireframe-html-guidelines.md
│   ├── 14-test-case-traceability.md
│   ├── 15-change-request-impact-matrix.md
│   ├── 16-ambiguity-detection-rules.md
│   ├── 17-actor-role-definition.md
│   ├── 18-knowledge-graph-metadata.md
│   └── 19-document-versioning-rules.md
├── _templates/          # 47 Biểu mẫu tài liệu chuẩn
│   ├── 01-prd.md
│   ├── 02-roadmap.md
│   ├── 04-brainstorm.md
│   ├── 08-srs.md
│   ├── 15-sequence-diagram.md
│   ├── 19-state-diagram.md
│   ├── 20-erd-mermaid.md
│   ├── 26-usecase-cockburn.md
│   ├── 27-userstory.md
│   ├── 28-acceptance-criteria.md
│   ├── 31-wireframe-html.html
│   ├── 43-test-cases.md
│   ├── 45-gap-analysis.md
│   ├── 47-change-request.md
│   └── ... (đủ 47 templates)
└── scripts/             # Công cụ tiện ích
    └── render_diagrams.py # Script quét và xuất bản HTML/SVG tự động
```

---

## ⚡ 9 Giai đoạn & Toàn bộ 56 Lệnh Skills

| Giai đoạn | Số lượng | Danh sách Lệnh `/skill` |
| :--- | :---: | :--- |
| **1. Lập kế hoạch sản phẩm** | 3 | `/prd`, `/roadmap`, `/discover` |
| **2. Thu thập & Đặc tả yêu cầu** | 7 | `/brainstorm`, `/urd`, `/brd`, `/prd-epic`, `/srs`, `/reverse-doc`, `/code-to-srs` |
| **3. Sơ đồ nghiệp vụ & Dữ liệu** | 12 | `/sequence`, `/render-diagrams`, `/diagram-design`, `/activity`, `/activity-swimlane`, `/bpmn`, `/state`, `/erd`, `/d2-erd`, `/d2-activity`, `/dbdiagram`, `/usecase-diagram` |
| **4. Use case & User story** | 3 | `/usecase`, `/userstory`, `/ac` |
| **5. Thiết kế màn hình & Prototype** | 6 | `/user-flow`, `/wireframe-ascii`, `/wireframe-html`, `/prototype-html`, `/prototype-next`, `/figma` |
| **6. Tích hợp API** | 7 | `/api-assess`, `/api-doc`, `/api-design`, `/api-map`, `/api-checklist`, `/api-test`, `/api-readiness` |
| **7. Kiểm thử (QA/QC)** | 3 | `/test-checklist`, `/test-cases`, `/playwright-gen` |
| **8. Kiểm soát chất lượng & Thay đổi** | 6 | `/gap`, `/doc-drift`, `/ask`, `/cr`, `/dashboard`, `/kg` |
| **9. Bàn giao & Vận hành** | 9 | `/jira`, `/confluence`, `/export`, `/preview`, `/reverse-preview`, `/userguide`, `/meet`, `/update-overview`, `/delegate` |

---

## 🚀 Luồng Xương sống Cốt lõi (Core Workflow)

Một ngày làm việc mẫu của BA với Core Skills:
1. `09:00` `/brainstorm`: Phỏng vấn làm rõ ý tưởng thô và chốt phạm vi (Scope).
2. `09:40` `/srs`: Sinh đặc tả kỹ thuật IEEE 830 (FR, BR, ERR, NFR).
3. `10:30` `/sequence` + `/erd`: Vẽ sơ đồ luồng tương tác và mô hình dữ liệu.
4. `10:45` `/render-diagrams`: Tự động chuyển toàn bộ sơ đồ sang bản vẽ vector HTML/SVG.
5. `11:00` `/wireframe-html`: Dựng giao diện tương tác nguyên khối xem trực tiếp trên trình duyệt.
6. `14:00` `/userstory` + `/ac`: Bóc tách backlog chuẩn INVEST và Acceptance Criteria Gherkin.
7. `16:00` `/test-cases`: Sinh bộ test cases kiểm thử bám sát AC và Error Matrix.
8. `16:45` `/preview`: Đóng gói trang tổng quan cho stakeholder duyệt với 1 cú click.
9. `Hôm sau` `/cr`: Tiếp nhận thay đổi của khách hàng, phân tích tác động và đồng bộ tài liệu.

---

## 🎨 Trực quan hóa Sơ đồ với Diagram Design

Khi viết tài liệu, BA thường dùng cú pháp Mermaid trong Markdown. Nhược điểm là stakeholder không có tool chuyên dụng sẽ thấy các khối text khô cứng.

Với lệnh `/render-diagrams`:
```bash
# Quét và xuất bản cho 1 file tài liệu:
python3 scripts/render_diagrams.py docs/{feature}/srs/flows.md

# Hoặc quét toàn bộ thư mục tài liệu:
python3 scripts/render_diagrams.py docs/{feature}/
```
Kết quả sinh ra:
- File `.html` độc lập mở ngay trên mọi trình duyệt.
- File `.svg` chuẩn vector để đưa vào Figma, PowerPoint hoặc bản in.
- File `diagrams/index.html` tạo gallery xem toàn bộ sơ đồ của tính năng.

---

## 📦 Cài đặt & Tích hợp vào AI Agent

### 1. Dùng với Claude Code
```bash
# Thêm skills vào thư mục cấu hình Claude Code
mkdir -p ~/.claude/skills
ln -s /path/to/ba-kit-open/skills/* ~/.claude/skills/
```

### 2. Dùng với Hermes Agent / Antigravity / Codex
```bash
# Thêm skills vào thư mục cấu hình Hermes
mkdir -p ~/.hermes/skills
ln -s /path/to/ba-kit-open/skills/* ~/.hermes/skills/
```

### 3. Dùng trực tiếp trong Workspace
Clone repository này vào workspace của dự án và hướng dẫn Agent đọc thư mục `skills/` và `rules/`.

---

## 📄 Bản quyền & Đóng góp
Dự án được phát hành dưới giấy phép [MIT License](LICENSE). Mọi đóng góp (PR, Issue, bổ sung biểu mẫu thực chiến) đều được hoan nghênh!
