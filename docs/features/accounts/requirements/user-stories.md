# User story và tiêu chí nghiệm thu — FEAT-01 Tài khoản

- Cập nhật: 2026-11-09 (v0.3: đăng nhập không mật khẩu bằng mã email; Facebook thay Apple). Trạng thái: **chờ duyệt**.
- Quy ước: mỗi story có kịch bản thành công, lỗi và biên (`rules/08`). Mã BR và ERR xem [srs/README.md](../srs/README.md).
- Câu trong ngoặc kép là thông báo hiển thị; câu chữ cuối cùng nằm trong `messages/vi.json`.
- Thay đổi so với v0.2: không còn mật khẩu. Mã story được giữ để truy vết; US-AUTH-03 và US-AUTH-07 đổi nội dung.

## US-AUTH-01 — Yêu cầu mã đăng nhập bằng email

Là người dùng, tôi muốn nhập email để nhận mã đăng nhập, không cần nhớ mật khẩu.

```gherkin
Scenario: AC-01 Gửi mã tới email mới
  Given tôi mở "Đăng nhập" và chọn "Tiếp tục với email"
  When tôi nhập "an@example.com" và bấm "Gửi mã"
  Then hệ thống gửi một mã 6 số tới "an@example.com" (BR-AUTH-001)
  And tôi thấy màn hình "Nhập mã" có 6 ô và đếm ngược 10 phút

Scenario: AC-02 Email sai định dạng
  When tôi nhập "an@" và bấm "Gửi mã"
  Then không gửi gì và ô email hiện "Email không đúng định dạng" (ERR-AUTH-400-01)

Scenario: AC-03 Gửi lại quá nhanh
  Given tôi vừa yêu cầu mã cách đây 30 giây
  When tôi bấm "Gửi mã" lần nữa
  Then không có thư mới được gửi và thấy "Vui lòng đợi 30 giây trước khi gửi lại" (ERR-AUTH-429-01)

Scenario: AC-04 Email đã có tài khoản không bị lộ
  Given đã có tài khoản "an@example.com"
  When ai đó yêu cầu mã cho "an@example.com"
  Then tôi thấy đúng màn hình "Nhập mã" như AC-01, và cùng phản hồi HTTP
  And mã đăng nhập vẫn được gửi (BR-AUTH-007)

Scenario: AC-05 Vượt giới hạn trong một giờ
  Given email "an@example.com" đã nhận 5 mã trong giờ này
  When có yêu cầu thứ sáu
  Then không gửi thêm và trả ERR-AUTH-429-01 (BR-AUTH-009)
```

## US-AUTH-02 — Nhập mã để đăng nhập hoặc tạo tài khoản

Là người dùng, tôi muốn nhập mã từ email để vào thư viện; lần đầu thì tài khoản được tạo luôn.

```gherkin
Scenario: AC-01 Mã đúng với email mới
  Given tôi đã yêu cầu mã cho "an@example.com" chưa có tài khoản
  When tôi nhập đúng mã
  Then hệ thống tạo tài khoản với email đã xác minh (BR-AUTH-003)
  And tôi được đăng nhập và chuyển tới "Thư viện"

Scenario: AC-02 Mã đúng với email đã có tài khoản
  Given "an@example.com" đã có tài khoản
  When tôi nhập đúng mã
  Then tôi được đăng nhập vào tài khoản đó, không tạo tài khoản mới

Scenario: AC-03 Mã sai
  When tôi nhập sai mã
  Then tôi thấy "Mã không đúng. Bạn còn 4 lần thử." (ERR-AUTH-401-01)
  And các ô mã được xóa và focus về ô đầu tiên

Scenario: AC-04 Sai đủ 5 lần
  Given tôi đã nhập sai 4 lần
  When tôi nhập sai lần thứ 5
  Then mã đó bị vô hiệu và tôi thấy ERR-AUTH-403-02 với nút "Gửi mã mới" (BR-AUTH-002)
  And mã đó không dùng được nữa dù nhập đúng

Scenario: AC-05 Mã hết hạn
  Given đã quá 10 phút kể từ khi gửi mã
  When tôi nhập mã đó
  Then tôi thấy ERR-AUTH-400-03 "Mã đã hết hạn hoặc đã dùng" và nút "Gửi mã mới"

Scenario: AC-06 Mã đã dùng
  Given tôi đã đăng nhập bằng mã này
  When tôi nhập lại đúng mã đó
  Then tôi thấy ERR-AUTH-400-03 (BR-AUTH-001)

Scenario: AC-07 Mã mới làm mã cũ mất hiệu lực
  Given tôi có hai mã đã gửi cho cùng email
  When tôi nhập mã cũ sau khi đã có mã mới
  Then mã cũ bị từ chối với ERR-AUTH-400-03
```

## US-AUTH-03 — Giữ phiên đăng nhập

Là người dùng, tôi muốn không phải đăng nhập lại mỗi lần mở trình duyệt.

```gherkin
Scenario: AC-01 Phiên còn hạn
  Given tôi đã đăng nhập cách đây 3 ngày
  When tôi mở lại website
  Then tôi vẫn ở trong thư viện (BR-AUTH-008)

Scenario: AC-02 Phiên hết hạn
  Given phiên của tôi đã không hoạt động trong 14 ngày
  When tôi mở "Thư viện"
  Then tôi được chuyển tới "Đăng nhập" với returnUrl (ERR-AUTH-401-02)

Scenario: AC-03 Không có ô mật khẩu ở đâu
  When tôi mở bất kỳ trang nào trong "/auth/*"
  Then không có ô nhập mật khẩu và không có liên kết "Quên mật khẩu"
```

## US-AUTH-04 — Đăng nhập bằng Google

Là người dùng, tôi muốn đăng nhập bằng Google để không phải nhập mã.

```gherkin
Scenario: AC-01 Lần đầu dùng Google
  Given chưa có tài khoản Lingozi nào với email Google "binh@gmail.com"
  When tôi chọn "Tiếp tục với Google" và đồng ý trên Google
  Then hệ thống tạo tài khoản với email đã xác minh bởi Google
  And tôi được đăng nhập và chuyển tới "Thư viện"

Scenario: AC-02 Email Google trùng tài khoản sẵn có
  Given đã có tài khoản Lingozi với "binh@gmail.com"
  And Google báo email đã xác minh
  When tôi tiếp tục với Google
  Then Google được liên kết vào tài khoản đó và tôi được đăng nhập (BR-AUTH-004)

Scenario: AC-03 Google chưa xác minh email
  Given Google trả email "binh@gmail.com" với email_verified = false
  When tôi tiếp tục với Google
  Then không đăng nhập và không tạo tài khoản
  And tôi thấy "Email này chưa được Google xác minh. Hãy dùng Tiếp tục với email." (ERR-AUTH-409-02)

Scenario: AC-04 Hủy hoặc lỗi ở phía Google
  When tôi hủy trên Google, hoặc Google trả lỗi
  Then tôi quay về "Đăng nhập" với ERR-AUTH-502-01 và không có tài khoản nào được tạo
```

## US-AUTH-05 — Đăng nhập bằng Facebook

Là người dùng, tôi muốn đăng nhập bằng Facebook thay cho Apple. Vì Facebook có thể không trả email hoặc trả email chưa xác minh, tôi phải nhập mã gửi tới email đó trước khi tài khoản được tạo hay liên kết.

```gherkin
Scenario: AC-01 Facebook trả email chưa có tài khoản
  Given Facebook trả email "chi@example.com" chưa có tài khoản Lingozi
  When tôi tiếp tục với Facebook
  Then hệ thống gửi mã tới "chi@example.com" và hiển thị "Nhập mã" (BR-AUTH-005)
  And sau khi nhập đúng mã, tài khoản được tạo với Facebook đã liên kết

Scenario: AC-02 Facebook không trả email
  Given Facebook không trả email
  When tôi tiếp tục với Facebook
  Then tôi thấy "Nhập email để tiếp tục"
  And sau khi nhập email, hệ thống gửi mã như AC-01 (ERR-AUTH-400-01 nếu email sai định dạng)

Scenario: AC-03 Email trùng tài khoản đã có
  Given đã có tài khoản Lingozi "chi@example.com"
  When tôi tiếp tục với Facebook có email "chi@example.com"
  Then hệ thống không tạo tài khoản mới và không liên kết ngay
  And hệ thống gửi mã tới "chi@example.com"; sau khi nhập đúng mã, Facebook được liên kết vào tài khoản đó (ERR-AUTH-409-02 hiển thị kèm lý do)

Scenario: AC-04 Facebook đã liên kết
  Given tài khoản Facebook của tôi đã liên kết với một tài khoản Lingozi
  When tôi tiếp tục với Facebook
  Then tôi được đăng nhập vào đúng tài khoản đó, không cần mã, dù email Facebook đã đổi

Scenario: AC-05 Hết thời gian chờ
  Given tôi đang ở bước nhập mã sau Facebook quá 10 phút
  When tôi nhập mã
  Then tôi thấy ERR-AUTH-400-04 và được đưa về "Đăng nhập" để bắt đầu lại
```

## US-AUTH-06 — Liên kết Google hoặc Facebook trong Cài đặt tài khoản

Là người dùng đã đăng nhập, tôi muốn thêm Google hoặc Facebook để đăng nhập nhanh hơn.

```gherkin
Scenario: AC-01 Liên kết thành công
  Given tôi đang đăng nhập và chưa liên kết Facebook
  When tôi chọn "Liên kết Facebook" và đồng ý trên Facebook
  Then Facebook xuất hiện trong danh sách phương thức đăng nhập của tôi

Scenario: AC-02 Tài khoản ngoài đã thuộc người khác
  Given Facebook này đã liên kết với một tài khoản Lingozi khác
  When tôi liên kết nó
  Then không liên kết và tôi thấy ERR-AUTH-409-01

Scenario: AC-03 Đã liên kết rồi
  Given tôi đã liên kết Google
  Then nút "Liên kết Google" không hiển thị; thay bằng "Đã liên kết"
```

## US-AUTH-07 — Mã không đến hoặc đã hết hạn

Là người dùng không nhận được mã, tôi muốn biết cách xử lý và có thể yêu cầu mã mới. (Thay cho "quên mật khẩu" của v0.2.)

```gherkin
Scenario: AC-01 Gửi lại mã sau thời gian chờ
  Given tôi đã chờ 60 giây kể từ lần gửi trước
  When tôi bấm "Gửi mã mới"
  Then một mã mới được gửi và mã cũ bị vô hiệu (US-AUTH-02 AC-07)

Scenario: AC-02 Không thấy thư
  When tôi bấm "Không nhận được mã?"
  Then tôi thấy hướng dẫn kiểm tra mục Spam, và thời gian chờ để gửi lại

Scenario: AC-03 Email không có tài khoản
  Given "chua-co@example.com" chưa có tài khoản
  When tôi yêu cầu mã cho email đó
  Then màn hình và thời gian chờ giống hệt trường hợp email đã có tài khoản (BR-AUTH-007)
```

## US-AUTH-08 — Đăng xuất

```gherkin
Scenario: AC-01 Đăng xuất
  Given tôi đang đăng nhập
  When tôi chọn "Đăng xuất"
  Then cookie phiên bị xóa và tôi về "Đăng nhập"

Scenario: AC-02 Quay lại trang cũ sau khi đăng xuất
  Given tôi vừa đăng xuất
  When tôi bấm "Quay lại" của trình duyệt về "Thư viện"
  Then tôi không thấy dữ liệu thư viện và được chuyển tới "Đăng nhập"

Scenario: AC-03 Đăng xuất khi phiên đã hết hạn
  Given phiên của tôi đã hết hạn
  When tôi chọn "Đăng xuất"
  Then thao tác vẫn thành công và không hiện lỗi
```

## US-AUTH-09 — Bảo vệ thư viện riêng tư

```gherkin
Scenario: AC-01 Chưa đăng nhập
  When tôi mở một trang trong "Thư viện" khi chưa đăng nhập
  Then tôi được chuyển tới "Đăng nhập", rồi quay lại đúng trang đó sau khi đăng nhập
  And mọi API thư viện trả 401 ERR-AUTH-401-02

Scenario: AC-02 Request thay đổi dữ liệu thiếu token antiforgery
  Given tôi đang đăng nhập
  When một request POST/PUT/DELETE không có header antiforgery hợp lệ
  Then API trả 400 ERR-AUTH-400-05 và không thay đổi dữ liệu

Scenario: AC-03 Không chuyển hướng ra ngoài
  When tôi mở đăng nhập với returnUrl trỏ tới domain khác
  Then sau khi đăng nhập tôi về "Thư viện", không bị chuyển ra domain đó (BR-AUTH-011)
```

## US-AUTH-10 — Chính sách quyền riêng tư và hướng dẫn xóa dữ liệu

```gherkin
Scenario: AC-01 Trang công khai
  When tôi mở "/privacy" hoặc "/data-deletion" khi chưa đăng nhập
  Then tôi đọc được nội dung, không cần đăng nhập

Scenario: AC-02 Hướng dẫn xóa dữ liệu
  When tôi đọc "/data-deletion"
  Then trang nêu email nhận yêu cầu, thông tin cần gửi, thời hạn tối đa 30 ngày (Q-12), và dữ liệu nào bị xóa

Scenario: AC-03 Liên kết ở trang đăng nhập
  When tôi ở trang "Đăng nhập"
  Then có liên kết tới "/privacy" và "/data-deletion" ở chân trang
```

Nội dung pháp lý của hai trang do chủ dự án duyệt. Trước khi duyệt, trang ghi rõ "Bản nháp chờ duyệt" và không bật Facebook ở staging/production.
