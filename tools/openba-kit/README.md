# BA-Kit Open — 56 AI Skills for IT Business Analysts & Product Owners

[![English](https://img.shields.io/badge/Language-English-blue.svg)](README.md)
[![Tiếng Việt](https://img.shields.io/badge/Ng%C3%B4n%20ng%E1%BB%AF-Ti%E1%BA%BFng%20Vi%E1%BB%87t-red.svg)](README_VI.md)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)
[![Agent Skills Compatible](https://img.shields.io/badge/Standard-Agent%20Skills-orange.svg)](https://skills.sh)

> 🇻🇳 **Đọc bản tiếng Việt tại [README_VI.md](README_VI.md)**

**BA-Kit Open** is an open-source suite of **56 specialized Agent Skills**, **19 strict requirements engineering rules**, and **47 production-ready templates**. It transforms any AI Coding Agent (**Claude Code, Antigravity, OpenAI Codex, Hermes Agent, Cursor, Windsurf**) into an elite Senior IT Business Analyst and Technical Product Owner.

Automate the full software specification lifecycle: from vague brainstorms and discovery reports to IEEE 830 technical specifications, editorial-grade architecture diagrams, interactive HTML wireframes, INVEST backlogs, Gherkin acceptance criteria, and traceable test cases.

---

## ⚡ The Problem: Why Coding Agents Need BA Skills

AI coding agents are exceptional at writing implementation code—but they fail when requirements are vague, inconsistent, or undocumented. 

```
Vague Prompt ──> Hallucinated Assumptions ──> Bugs & Rework ──> Failed Sprint
                                   VS
Raw Idea ──[ BA-Kit Open ]──> Verified Specs + Visual Diagrams ──> Flawless Code
```

1. **No More Ambiguity:** 19 rules automatically detect and eliminate qualitative words (*"fast"*, *"secure"*, *"user-friendly"*), replacing them with quantifiable metrics and codified error states (`FR-`, `BR-`, `ERR-`).
2. **Beyond Plain Text Diagrams:** Plain Mermaid blocks in markdown are tedious for non-technical stakeholders to render. BA-Kit integrates **Diagram Design** to compile Mermaid into **standalone, editorial HTML + vector SVG diagrams** right out of the box.
3. **One-Click Stakeholder Handoff:** Build single-page interactive documentation portals (`/preview`) that stakeholders can browse, review, and sign off in seconds.

---

## 🌟 Key Capabilities

- **IEEE 830 & Cockburn Standards:** Industry-standard technical requirements and structured use case specifications.
- **Editorial Diagram Engine:** 45 visual diagram types via `diagram-design` (v2.6) with zero runtime dependencies, 4px grid layout, and crisp typography.
- **Traceability Matrix:** Full end-to-end alignment: `Idea` $\rightarrow$ `PRD` $\rightarrow$ `SRS` $\rightarrow$ `Flows` $\rightarrow$ `User Stories` $\rightarrow$ `AC` $\rightarrow$ `Test Cases`.
- **Built-in Change Management:** Full `/cr` workflow with automated impact matrix analysis when client scope shifts.

---

## 📁 Repository Structure

```
ba-kit-open/
├── skills/              # 56 AI Skills conforming to the Agent Skills standard
│   ├── brainstorm/      # Socratic interviewing for vague requirements
│   ├── srs/             # IEEE 830 technical specification generator
│   ├── sequence/        # Interaction & message sequence modeling
│   ├── render-diagrams/ # Compile Mermaid into editorial HTML & vector SVG
│   ├── diagram-design/  # Complete 45-type editorial diagram design system
│   ├── erd/             # Entity relationship modeling
│   ├── wireframe-html/  # Standalone interactive HTML wireframes
│   ├── userstory/       # INVEST backlog splitting
│   ├── ac/              # Gherkin Acceptance Criteria (Given/When/Then)
│   ├── test-cases/      # Traceable test suites matching Error Matrix
│   ├── preview/         # Unified HTML documentation viewer with live diagrams
│   ├── cr/              # Change request & blast-radius impact analysis
│   └── ... (56 total skills)
├── rules/               # 19 Non-negotiable BA & Specification Rules
│   ├── 01-fr-naming-convention.md
│   ├── 02-br-naming-convention.md
│   ├── 03-err-naming-convention.md
│   ├── 05-srs-ieee-830.md
│   ├── 06-cockburn-use-case.md
│   ├── 07-invest-user-story.md
│   ├── 08-gherkin-acceptance-criteria.md
│   ├── 10-api-contract-standards.md
│   ├── 16-ambiguity-detection-rules.md
│   └── ... (19 rules)
├── _templates/          # 47 Standardized deliverables ready to ship
│   ├── 01-prd.md
│   ├── 08-srs.md
│   ├── 15-sequence-diagram.md
│   ├── 26-usecase-cockburn.md
│   ├── 27-userstory.md
│   ├── 31-wireframe-html.html
│   └── ... (47 templates)
└── scripts/
    └── render_diagrams.py # CLI tool to scan & render Markdown Mermaid diagrams
```

---

## 🚀 The 56 Skills Across 9 SDLC Phases

| Phase | Count | Available `/slash` Commands |
| :--- | :---: | :--- |
| **1. Product Planning** | 3 | `/prd`, `/roadmap`, `/discover` |
| **2. Requirements & Elicitation** | 7 | `/brainstorm`, `/urd`, `/brd`, `/prd-epic`, `/srs`, `/reverse-doc`, `/code-to-srs` |
| **3. Business & Data Diagrams** | 12 | `/sequence`, `/render-diagrams`, `/diagram-design`, `/activity`, `/activity-swimlane`, `/bpmn`, `/state`, `/erd`, `/d2-erd`, `/d2-activity`, `/dbdiagram`, `/usecase-diagram` |
| **4. Use Cases & User Stories** | 3 | `/usecase`, `/userstory`, `/ac` |
| **5. UI Prototyping & Flows** | 6 | `/user-flow`, `/wireframe-ascii`, `/wireframe-html`, `/prototype-html`, `/prototype-next`, `/figma` |
| **6. API Integration** | 7 | `/api-assess`, `/api-doc`, `/api-design`, `/api-map`, `/api-checklist`, `/api-test`, `/api-readiness` |
| **7. Quality Assurance (QA/QC)** | 3 | `/test-checklist`, `/test-cases`, `/playwright-gen` |
| **8. Governance & Change Control** | 6 | `/gap`, `/doc-drift`, `/ask`, `/cr`, `/dashboard`, `/kg` |
| **9. Handoff & Operations** | 9 | `/jira`, `/confluence`, `/export`, `/preview`, `/reverse-preview`, `/userguide`, `/meet`, `/update-overview`, `/delegate` |

---

## 💡 A Day in the Life of an AI Business Analyst

Here is how you build a complete, verified feature specification in 1 day:

```
09:00  /brainstorm      Elicit requirements and define project boundaries
09:40  /srs             Draft IEEE 830 specification (FR, BR, ERR, NFR)
10:30  /sequence + /erd Model interaction sequences and entity relationships
10:45  /render-diagrams Compile diagrams into editorial HTML & vector SVGs
11:00  /wireframe-html  Generate clickable, standalone HTML prototypes
14:00  /userstory + /ac Slice INVEST user stories with Gherkin scenarios
16:00  /test-cases      Generate comprehensive test suites mapped to Error Matrix
16:45  /preview         Assemble the single-page stakeholder review bundle
```

---

## 🎨 Automated Visual Diagrams with Diagram Design

BA-Kit includes the `/render-diagrams` command and automated rendering script. It inspects any markdown file, extracts Mermaid blocks (`sequenceDiagram`, `stateDiagram-v2`, `flowchart`, `erDiagram`), and renders them as:
- **Standalone `.html` files**: Double-clickable in any browser without needing extensions or Node.js runtimes.
- **Pure `.svg` vector files**: Cleanly scoped for Figma, presentation decks, or print materials.
- **Interactive `index.html` Gallery**: Instant overview for clients and engineers.

```bash
# Scan and render a single markdown file:
python3 scripts/render_diagrams.py docs/{feature}/srs/flows.md

# Scan and render all documentation in a feature folder:
python3 scripts/render_diagrams.py docs/{feature}/
```

---

## 📦 Quickstart & Installation

BA-Kit Open is completely file-based and adheres to the **Agent Skills standard**.

### Option A: Install for Claude Code
```bash
# Symlink skills into Claude's skill directory
mkdir -p ~/.claude/skills
ln -s /path/to/ba-kit-open/skills/* ~/.claude/skills/
```

### Option B: Install for Hermes Agent / Antigravity / Codex
```bash
# Symlink skills into Hermes' skill directory
mkdir -p ~/.hermes/skills
ln -s /path/to/ba-kit-open/skills/* ~/.hermes/skills/
```

### Option C: In-Workspace Usage
Clone this repository directly into your project root or subfolder. Your agent will automatically discover the `skills/` and `rules/` instructions whenever you prompt it.

---

## 🤝 Contributing & Community

Contributions are warmly welcome! Whether you are an experienced IT BA, a Product Owner, or an AI agent developer:
- Submit new domain templates (Fintech, E-commerce, Healthcare, Logistics).
- Propose new rules and naming conventions.
- Report issues and help refine agent prompts.

Licensed under the [MIT License](LICENSE).
