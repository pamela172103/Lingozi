# Ứng dụng web Lingozi

Next.js 16.4.5 (App Router), React 19.3.1, TypeScript 6.0.3 strict, Tailwind CSS 4.3.5, next-intl 4.14.9 ([ADR 0003](../../docs/decisions/0003-frontend-stack.md)).

Hiện có: trang "Trạng thái hệ thống" (Vòng 0) và, từ US-AUTH-01, trang `/auth/login` (nhập email, nhận mã) và `/auth/code` (màn "Nhập mã", chưa xác nhận được mã vì thuộc US-AUTH-02), dựng theo ảnh Figma trong `docs/features/accounts/design-assets/`.

| Đường dẫn               | Nội dung                                                                  |
| ----------------------- | ------------------------------------------------------------------------- |
| `src/app/`              | Route App Router; `layout.tsx` đặt font, `data-theme`, `data-decor`       |
| `src/components/`       | Component và unit test (`*.test.tsx`)                                     |
| `src/lib/`              | Gọi API phía server; `API_ORIGIN` đọc từ môi trường                       |
| `src/styles/tokens.css` | **Sinh tự động** từ `docs/architecture/design-tokens.json`; không sửa tay |
| `messages/vi.json`      | Chuỗi giao diện tiếng Việt                                                |

- Biến môi trường: `API_ORIGIN`, là origin của API mà server Next.js gọi tới. Next.js rewrite `/api/*` sang origin này, nên trình duyệt không bao giờ gọi API trực tiếp.
- Lệnh chạy và kiểm tra: xem [hướng dẫn chạy local](../../docs/guides/local-development.md).
