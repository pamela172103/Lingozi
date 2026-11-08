# ADR 0005 — Gửi email giao dịch

- **Trạng thái:** Accepted (2026-11-08) cho abstraction, outbox và Mailpit ở local. **Nhà cung cấp production chưa chọn.** Hosting là máy chủ riêng, nên vẫn cần một dịch vụ gửi email bên ngoài; không khuyến nghị tự vận hành mail server vì khó đảm bảo email tới được hộp thư.
- **Ngày:** 2026-11-08.
- **Liên quan:** [ADR 0004](0004-authentication.md), FEAT-01.

## Bối cảnh

Xác thực email và đặt lại mật khẩu đều cần gửi email giao dịch. `AGENTS.md` §6 yêu cầu mọi tích hợp bên thứ ba có abstraction, cấu hình theo environment, timeout, retry có kiểm soát và logging an toàn.

## Quyết định

- **Abstraction:** interface `IEmailSender` đặt trong module `Accounts`, với một implementation cho mỗi nhà cung cấp, chọn bằng cấu hình (`Email:Provider`).
- **Gửi bất đồng bộ:** email được ghi vào bảng outbox trong cùng transaction với thao tác nghiệp vụ. Một background worker gửi đi, retry tối đa 5 lần với backoff tăng dần, timeout 10 giây mỗi lần gửi. Không mất email khi nhà cung cấp lỗi tạm thời và không chặn request của người dùng.
- **Local:** container Mailpit trong `compose.yaml` nhận email qua SMTP và hiện trên giao diện web. Chỉ dùng cho môi trường dev và test, có nhãn rõ ràng, không bao giờ cấu hình ở production.
- **Production:** chọn một trong các phương án dưới, sau khi chốt hosting.

| Phương án | Ưu điểm | Lưu ý |
| --- | --- | --- |
| Azure Communication Services Email | Cùng nhà cung cấp nếu hosting trên Azure | Phải xác minh domain |
| Amazon SES | Chi phí thấp theo lượng gửi | Tài khoản bắt đầu ở sandbox, phải xin mở |
| Dịch vụ SMTP/API chuyên email (Resend, Postmark…) | Tích hợp đơn giản, theo dõi giao nhận tốt | Thêm một nhà cung cấp và một hợp đồng |

- **Logging:** chỉ ghi ID thư, loại thư và kết quả gửi. Không ghi địa chỉ đầy đủ, token hay nội dung thư.

## Hệ quả

- FEAT-01 vẫn code và test được trọn vẹn với Mailpit. Khi chưa có nhà cung cấp production, trạng thái gửi email thật là `BLOCKED`.
- Cần một domain gửi thư (SPF, DKIM, DMARC) do chủ dự án sở hữu.
