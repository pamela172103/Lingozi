# Phiên 2026-11-09 · 17 · FEAT-01: đăng nhập bằng mã email

- Ngày / múi giờ: 2026-11-09, UTC.
- Mục tiêu do người dùng yêu cầu: xem luồng đăng ký, đăng nhập của luyentu.com và sửa toàn bộ FEAT-01 cho giống, thay Apple bằng Facebook.
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` tại `6855c2c`.
- Status: PASS (chỉ tài liệu). Thiết kế chờ duyệt; chưa code.

## Quan sát luồng tham khảo

Đã đọc trang đăng nhập công khai của luyentu.com (chỉ đọc, không đăng nhập, không gửi form):

- Ba lựa chọn: Tiếp tục với Google, Tiếp tục với Apple, Tiếp tục với email.
- "Tiếp tục với email" mở bước nhập email và nút "Gửi mã". Nội dung cho biết hệ thống gửi mã 6 số. Không có ô mật khẩu.
- Mã nguồn client cho thấy có bước xác minh mã và có đăng ký trên cùng luồng.

Chỉ tham khảo cấu trúc luồng. Không sao chép giao diện, văn bản, logo hay tài sản.

## Kết quả

- `docs/features/accounts/` v0.3:
  - user-stories: 10 story, 39 AC. Mã story giữ nguyên; US-AUTH-03 là giữ phiên, US-AUTH-07 là mã không đến.
  - srs: FR-AUTH-CODE-001/002 thay cho đăng ký và đăng nhập bằng mật khẩu; BR-AUTH-001 đến 013 (BR-AUTH-010 đổi nội dung); bỏ ERR-AUTH-400-02 và 403-01.
  - api-contract: `email-code/request`, `email-code/verify`, `external/complete-email`, `external/verify`; bỏ đăng ký, đăng nhập, đặt lại mật khẩu.
  - flows: luồng mã email, Google, Facebook (qua mã), outbox, và các luồng theo story.
  - wireframes: W-AUTH-01 đến 07, không mật khẩu, không theo theme.
  - test-cases: 43 TC, 39 AC đều có test case.
- `docs/decisions/0004-authentication.md`: thêm mục "Sửa đổi 2026-11-09" thay thế phần mật khẩu.
- `docs/architecture/erd.md`: thêm `accounts.EmailLoginCodes`; `EmailOutbox.Type` 3 = LoginCode.
- `docs/product/prd.md` 0.3.0, `mvp-scope.md`, brainstorm quyết định 12, README của FEAT-01, STATUS, nhật ký.

## Quyết định và giả định

- **Chủ dự án yêu cầu (2026-11-09):** FEAT-01 giống luồng tham khảo; Facebook thay Apple.
- **Đề xuất của nhóm, chờ xác nhận:**
  - Mã 6 số, hiệu lực 10 phút, dùng một lần, lưu HMAC.
  - 5 lần sai thì vô hiệu mã.
  - 1 mã mỗi 60 giây và 5 mã mỗi giờ cho một email.
  - Facebook không tạo hay liên kết tài khoản trước khi có mã.
- Luồng không mật khẩu làm mất khả năng đăng nhập khi mất email. Đã ghi là rủi ro chấp nhận ở MVP.

## Kiểm tra

- Script truy vết AC → TC: 39/39 AC, 43 TC.
- Kiểm tra liên kết trong `docs/`.
- Không có code, không chạy test.

## Việc còn lại

- AUTH-01: chủ dự án xác nhận các con số bảo mật của mã.
- Các phần đã có ở v0.2 vẫn chờ duyệt: FEAT-02 và PRD.

## Bàn giao

- Việc tiếp theo: xác nhận AUTH-01; sau đó code FEAT-01 (bảng `EmailLoginCodes`, endpoint mã, luồng Google và Facebook).
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`.
