# Quy chuẩn Metadata cho Tài liệu & Knowledge Graph

Để AI Agent tra cứu chéo tài liệu mà không cần đọc lại toàn bộ thư mục, mọi file tài liệu `.md` trong dự án bắt buộc phải có Frontmatter header:

```yaml
---
id: DOC-SRS-AUTH-001
title: Đặc tả Kỹ thuật Phân hệ Xác thực & Đăng nhập
version: 1.2.0
phase: Specification
domain: Authentication
tags: [auth, srs, oauth, security]
depends_on:
  - DOC-BRD-CORE-001
  - BR-SEC-001
related_diagrams:
  - DIAG-SEQ-AUTH-001
author: BA Agent
last_updated: 2026-10-15
---
```
