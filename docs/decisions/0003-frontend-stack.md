# ADR 0003 — Frontend: Next.js App Router, React, TypeScript strict

- **Trạng thái:** Accepted — chủ dự án duyệt ngày 2026-11-08.
- **Ngày:** 2026-11-08.
- **Liên quan:** [ADR 0001](0001-system-architecture-and-repo-layout.md), [ADR 0004](0004-authentication.md), [PRD §5](../product/prd.md) (desktop-first, WCAG 2.2 AA, i18n).

## Xác minh phiên bản (2026-11-08, npm registry)

| Gói | Phiên bản ổn định mới nhất | Ghi chú |
| --- | --- | --- |
| `next` | 16.4.5 (2026-11-03) | Cần Node ≥ 20.9; nhánh 15.x vẫn nhận bản backport (15.5.29) |
| `react`, `react-dom` | 19.3.1 | Next 16 hỗ trợ `^19.0.0` |
| `typescript` | 7.0.2 | Bản lớn mới. Cần xác minh `next build` và type check chạy được với 7.x khi dựng khung; nếu lỗi thì dùng phiên bản mà `create-next-app@16.4` cài |
| `tailwindcss` | 4.3.5 | |
| `vitest` | 5.1.0 | |
| `@playwright/test` | 1.65.0 | Next 16 khai báo peer `^1.51.1` |
| Node.js | Dùng bản LTS đang Active khi dựng khung | Phiên cloud hiện có Node 22.23 và pnpm |

## Quyết định

- **Framework:** Next.js 16.x App Router, React 19, TypeScript `strict: true`, bật thêm `noUncheckedIndexedAccess`.
- **Package manager:** pnpm, có lockfile, CI cài bằng `--frozen-lockfile`. Ghim phiên bản Node qua `engines` và `.nvmrc`.
- **Giao diện và theme:**
  - Design token là CSS custom properties (biến CSS), đặt trên `:root`.
  - Mỗi theme ghi đè token qua thuộc tính `data-theme` trên thẻ `<html>`. Tailwind CSS 4 đọc trực tiếp các biến này.
  - Chế độ giảm trang trí dùng `data-decor="reduced"`. Tôn trọng `prefers-reduced-motion`.
  - Đây là nền cho FEAT-07/08, chi tiết nằm trong design system.
- **Bố cục:** desktop-first. Breakpoint chính 1440 px và 1280 px, responsive xuống 768 px và 375 px (NFR-UX-001).
- **i18n:** dùng `next-intl`. Chuỗi giao diện đặt trong `messages/vi.json`; cấu trúc sẵn sàng thêm `en.json` (NFR-I18N-001).
- **Gọi API:**
  - Trình duyệt và server component đều gọi qua đường `/api/*`. Next.js rewrite sang API (ADR 0001).
  - Có một client typed sinh từ OpenAPI của backend, để contract không lệch giữa hai bên.
  - Không có mock API trong code production. Dữ liệu giả chỉ dùng trong test.
- **Form:** validate ở client chỉ để báo lỗi nhanh cho người dùng; server luôn validate lại.
- **Kiểm thử và chất lượng:**
  - ESLint (cấu hình của Next) và Prettier.
  - `tsc --noEmit`.
  - Vitest + Testing Library cho component.
  - Playwright cho E2E trong `tests/e2e/`.
  - `@axe-core/playwright` kiểm tra accessibility tự động.
- **Trạng thái UI:** mỗi màn hình có đủ loading, empty, error, success, disabled. Không đánh dấu xong nếu chỉ có layout tĩnh.

## Phương án bị loại

- **Pages Router:** đi ngược định hướng App Router.
- **CSS-in-JS lúc runtime:** không hợp với React Server Components, và tốn chi phí khi đổi theme.
- **Next.js 15.x:** vẫn được backport, nhưng 16.x là bản `latest` ổn định; dự án mới không có lý do dùng bản cũ.

## Hệ quả

- Phải xác minh khả năng tương thích TypeScript 7 ngay ở bước dựng khung.
- Client typed sinh từ OpenAPI nên chạy trong CI để phát hiện contract bị lệch.
