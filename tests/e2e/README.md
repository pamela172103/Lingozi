# Kiểm thử hành trình người dùng (E2E)

Playwright 1.65.0 cộng `@axe-core/playwright` 4.14.0. Chạy với hai cấu hình: desktop 1440 px và mobile (Pixel 7).

- `specs/walking-skeleton.spec.ts`: luồng web → API → SQL Server, rewrite `/api`, accessibility (WCAG 2.2 AA, không có vi phạm serious/critical), không cuộn ngang.
- Test cần web, API và SQL Server đang chạy; `BASE_URL` mặc định là `http://localhost:3000`. Xem [hướng dẫn chạy local](../../docs/guides/local-development.md).
- Chỉ dùng dữ liệu giả lập, không dùng tài khoản hoặc dữ liệu người học thật.
