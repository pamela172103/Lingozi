# User story và tiêu chí nghiệm thu — FEAT-01 Tài khoản

- Cập nhật: 2026-11-08. Trạng thái: **chờ duyệt**.
- Áp dụng `rules/07-invest-user-story.md` và `rules/08-gherkin-acceptance-criteria.md`: mỗi story có ít nhất một kịch bản thành công, một kịch bản lỗi và một kịch bản biên.
- Persona: `PER-01`, `PER-02` ([PRD](../../../product/prd.md) §2). Mã BR và ERR xem [srs.md](../srs/srs.md).
- **Câu chữ trong AC:** câu đặt trong ngoặc kép là thông báo hiển thị cho người dùng. Câu chữ cuối cùng nằm trong `messages/vi.json`; khi đổi câu chữ thì cập nhật cả AC lẫn test.

## US-AUTH-01 — Đăng ký bằng email

Là người dùng mới, tôi muốn tạo tài khoản bằng email và mật khẩu để có thư viện riêng của mình.

```gherkin
Scenario: AC-01 Đăng ký thành công
  Given tôi chưa có tài khoản với email "an@example.com"
  When tôi đăng ký với email "an@example.com", mật khẩu hợp lệ theo BR-AUTH-001
  Then hệ thống tạo tài khoản chưa xác thực email
  And gửi một thư xác thực tới "an@example.com"
  And tôi thấy màn hình "Kiểm tra hộp thư của bạn"

Scenario: AC-02 Mật khẩu không đạt quy tắc
  When tôi đăng ký với mật khẩu "abc12"
  Then tài khoản không được tạo
  And ô mật khẩu hiện lỗi ERR-AUTH-400-02 mô tả quy tắc còn thiếu

Scenario: AC-03 Email đã có tài khoản không bị lộ
  Given đã có tài khoản với email "an@example.com"
  When ai đó đăng ký lại bằng "an@example.com"
  Then hệ thống trả về đúng màn hình "Kiểm tra hộp thư của bạn" như AC-01
  And không tạo tài khoản mới
  And gửi tới "an@example.com" thư báo "có người vừa thử đăng ký bằng email của bạn" kèm link đăng nhập và quên mật khẩu (BR-AUTH-007)

Scenario: AC-04 Biên độ dài và định dạng
  When tôi đăng ký với email dài 257 ký tự, hoặc mật khẩu dài 129 ký tự, hoặc email sai định dạng
  Then tài khoản không được tạo và ô tương ứng hiện lỗi ERR-AUTH-400-01
```

## US-AUTH-02 — Xác thực email

Là người vừa đăng ký, tôi muốn xác thực email để bắt đầu dùng thư viện.

```gherkin
Scenario: AC-01 Xác thực bằng link hợp lệ
  Given tôi có thư xác thực còn hạn (BR-AUTH-006)
  When tôi mở link trong thư
  Then email của tôi được đánh dấu đã xác thực
  And tôi được chuyển tới trang Đăng nhập với thông báo "Email đã được xác thực"
  # Không tự đăng nhập qua link trong thư, để link bị chuyển tiếp cho người khác không mở được phiên.

Scenario: AC-02 Link hết hạn hoặc đã dùng
  When tôi mở link xác thực đã quá 24 giờ hoặc đã dùng
  Then tôi thấy lỗi ERR-AUTH-400-03 và nút "Gửi lại thư xác thực"

Scenario: AC-03 Gửi lại thư bị giới hạn tần suất
  Given tôi vừa yêu cầu gửi lại thư cách đây 30 giây
  When tôi yêu cầu gửi lại lần nữa
  Then không có thư mới được gửi
  And tôi thấy "Vui lòng đợi trước khi gửi lại" kèm số giây còn lại (BR-AUTH-009)

Scenario: AC-04 Chưa xác thực thì không vào được thư viện
  Given tài khoản của tôi chưa xác thực email
  When tôi đăng nhập đúng mật khẩu
  Then tôi không vào được Thư viện
  And thấy ERR-AUTH-403-01 kèm nút "Gửi lại thư xác thực"
```

## US-AUTH-03 — Đăng nhập bằng email

Là người dùng đã có tài khoản, tôi muốn đăng nhập bằng email và mật khẩu để quay lại thư viện của mình.

```gherkin
Scenario: AC-01 Đăng nhập thành công
  Given tài khoản "an@example.com" đã xác thực email
  When tôi đăng nhập đúng email và mật khẩu
  Then tôi được chuyển tới Thư viện (hoặc trang tôi định mở trước đó)
  And phiên đăng nhập được giữ 14 ngày kể từ lần hoạt động cuối (BR-AUTH-008)

Scenario: AC-02 Sai email hoặc mật khẩu
  When tôi đăng nhập sai mật khẩu, hoặc bằng email không tồn tại
  Then tôi thấy cùng một lỗi ERR-AUTH-401-01 "Email hoặc mật khẩu không đúng" cho cả hai trường hợp

Scenario: AC-03 Khóa tạm sau 5 lần sai
  Given tôi đã đăng nhập sai 4 lần liên tiếp
  When tôi đăng nhập sai lần thứ 5
  Then tài khoản bị khóa 15 phút (BR-AUTH-002)
  And mọi lần đăng nhập trong 15 phút đó, kể cả đúng mật khẩu, đều thấy ERR-AUTH-403-02

Scenario: AC-04 Đăng nhập đúng thì xóa bộ đếm
  Given tôi đã đăng nhập sai 3 lần
  When tôi đăng nhập đúng
  Then bộ đếm sai được đặt lại về 0
```

## US-AUTH-04 — Đăng nhập bằng Google

Là người dùng, tôi muốn đăng nhập bằng Google để không phải nhớ thêm mật khẩu.

```gherkin
Scenario: AC-01 Lần đầu dùng Google
  Given chưa có tài khoản Lingozi nào với email Google "binh@gmail.com"
  When tôi chọn "Tiếp tục với Google" và đồng ý trên Google
  Then hệ thống tạo tài khoản với email đã xác thực (Google xác minh email)
  And tôi được đăng nhập và chuyển tới Thư viện

Scenario: AC-02 Email Google trùng tài khoản email đã xác thực
  Given đã có tài khoản email/mật khẩu "binh@gmail.com" đã xác thực
  And Google báo email "binh@gmail.com" đã xác minh
  When tôi tiếp tục với Google
  Then Google được liên kết vào tài khoản sẵn có (BR-AUTH-004) và tôi được đăng nhập

Scenario: AC-03 Email Google trùng tài khoản chưa xác thực
  Given đã có tài khoản "binh@gmail.com" nhưng chưa xác thực email
  When tôi tiếp tục với Google
  Then không tự liên kết
  And tôi thấy màn hình "Cần đăng nhập để liên kết" (ERR-AUTH-409-02)

Scenario: AC-04 Hủy hoặc lỗi ở phía Google
  When tôi hủy trên màn hình Google, hoặc Google trả lỗi
  Then tôi quay về trang Đăng nhập với thông báo ERR-AUTH-502-01 và không có tài khoản nào được tạo
```

## US-AUTH-05 — Đăng nhập bằng Facebook

Là người dùng, tôi muốn đăng nhập bằng Facebook để vào nhanh.

```gherkin
Scenario: AC-01 Facebook trả email chưa có tài khoản
  Given Facebook trả email "chi@example.com" chưa có tài khoản Lingozi
  When tôi tiếp tục với Facebook
  Then hệ thống tạo tài khoản với email chưa xác thực và liên kết Facebook
  And gửi thư xác thực, tôi thấy "Kiểm tra hộp thư của bạn" (BR-AUTH-005)

Scenario: AC-02 Facebook không trả email
  Given Facebook không trả email
  When tôi tiếp tục với Facebook
  Then tôi thấy màn hình "Nhập email của bạn"
  And sau khi nhập email hợp lệ chưa có tài khoản, hệ thống tạo tài khoản chưa xác thực, liên kết Facebook và gửi thư xác thực

Scenario: AC-03 Email trùng tài khoản đã có
  Given đã có tài khoản Lingozi "chi@example.com"
  When Facebook trả, hoặc tôi nhập, email "chi@example.com"
  Then hệ thống không tự liên kết và không tạo tài khoản mới
  And tôi thấy màn hình "Cần đăng nhập để liên kết" (ERR-AUTH-409-02)

Scenario: AC-04 Tài khoản Facebook đã liên kết
  Given tài khoản Facebook của tôi đã liên kết với một tài khoản Lingozi
  When tôi tiếp tục với Facebook
  Then tôi được đăng nhập vào đúng tài khoản đó, bất kể email Facebook hiện tại là gì

Scenario: AC-05 Phiên chờ nhập email hết hạn
  Given tôi ở màn hình "Nhập email của bạn" quá 10 phút
  When tôi gửi email
  Then tôi thấy ERR-AUTH-400-04 và được đưa về trang Đăng nhập để bắt đầu lại
```

## US-AUTH-06 — Liên kết Google hoặc Facebook vào tài khoản đang đăng nhập

Là người dùng đã đăng nhập, tôi muốn liên kết Google hoặc Facebook để lần sau đăng nhập nhanh.

```gherkin
Scenario: AC-01 Liên kết thành công
  Given tôi đang đăng nhập và chưa liên kết Facebook
  When tôi chọn "Liên kết Facebook" trong Cài đặt tài khoản và đồng ý trên Facebook
  Then Facebook xuất hiện trong danh sách phương thức đăng nhập của tôi

Scenario: AC-02 Tài khoản ngoài đã thuộc người khác
  Given tài khoản Facebook này đã liên kết với một tài khoản Lingozi khác
  When tôi liên kết nó
  Then không liên kết và tôi thấy ERR-AUTH-409-01

Scenario: AC-03 Đã liên kết rồi
  Given tôi đã liên kết Google
  Then nút "Liên kết Google" không hiển thị, thay bằng nhãn "Đã liên kết"
```

## US-AUTH-07 — Quên và đặt lại mật khẩu

Là người dùng quên mật khẩu, tôi muốn đặt lại mật khẩu qua email.

```gherkin
Scenario: AC-01 Đặt lại thành công
  Given tài khoản "an@example.com" tồn tại
  When tôi yêu cầu quên mật khẩu, mở link trong thư và nhập mật khẩu mới hợp lệ
  Then mật khẩu được đổi, mọi phiên đăng nhập cũ bị đăng xuất (BR-AUTH-010)
  And tôi thấy "Đã đặt lại mật khẩu" với nút "Đăng nhập"

Scenario: AC-02 Không lộ email có tồn tại hay không
  When tôi yêu cầu quên mật khẩu cho email không có tài khoản
  Then tôi thấy cùng thông báo "Nếu email có tài khoản, chúng tôi đã gửi hướng dẫn" như AC-01, và không có thư nào được gửi

Scenario: AC-03 Link hết hạn hoặc đã dùng
  When tôi mở link đặt lại sau 60 phút hoặc đã dùng
  Then tôi thấy ERR-AUTH-400-03 và nút "Gửi lại hướng dẫn"

Scenario: AC-04 Tài khoản chỉ dùng Google/Facebook
  Given tài khoản chưa có mật khẩu
  When tôi đặt lại mật khẩu qua link hợp lệ
  Then tài khoản có thêm mật khẩu và vẫn giữ các liên kết Google/Facebook
```

## US-AUTH-08 — Đăng xuất

Là người dùng, tôi muốn đăng xuất để người khác dùng chung máy không xem được thư viện của tôi.

```gherkin
Scenario: AC-01 Đăng xuất
  Given tôi đang đăng nhập
  When tôi chọn "Đăng xuất"
  Then cookie phiên bị xóa và tôi về trang Đăng nhập

Scenario: AC-02 Quay lại trang cũ sau khi đăng xuất
  Given tôi vừa đăng xuất
  When tôi bấm "Quay lại" của trình duyệt về trang Thư viện
  Then tôi không thấy dữ liệu thư viện và được chuyển tới Đăng nhập

Scenario: AC-03 Đăng xuất khi phiên đã hết hạn
  Given phiên của tôi đã hết hạn
  When tôi chọn "Đăng xuất"
  Then thao tác vẫn thành công và không hiện lỗi
```

## US-AUTH-09 — Bảo vệ thư viện riêng tư

Là người dùng, tôi muốn chỉ mình tôi truy cập được dữ liệu của tôi.

```gherkin
Scenario: AC-01 Chưa đăng nhập
  When tôi mở một trang trong Thư viện khi chưa đăng nhập
  Then tôi được chuyển tới Đăng nhập, rồi quay lại đúng trang đó sau khi đăng nhập
  And mọi API thư viện trả 401 ERR-AUTH-401-02

Scenario: AC-02 Request thay đổi dữ liệu thiếu token antiforgery
  Given tôi đang đăng nhập
  When một request POST/PUT/DELETE không có header antiforgery hợp lệ
  Then API trả 400 ERR-AUTH-400-05 và không thay đổi dữ liệu

Scenario: AC-03 Không chuyển hướng ra trang ngoài
  When tôi mở link đăng nhập có returnUrl trỏ tới domain khác
  Then sau khi đăng nhập tôi về Thư viện, không bị chuyển ra domain đó (BR-AUTH-011)
```

## US-AUTH-10 — Chính sách quyền riêng tư và hướng dẫn xóa dữ liệu

Là người dùng (và theo yêu cầu của Meta), tôi muốn đọc chính sách quyền riêng tư và biết cách yêu cầu xóa dữ liệu.

```gherkin
Scenario: AC-01 Trang công khai
  When tôi mở "/privacy" hoặc "/data-deletion" khi chưa đăng nhập
  Then tôi đọc được nội dung, không cần đăng nhập

Scenario: AC-02 Hướng dẫn xóa dữ liệu
  When tôi đọc "/data-deletion"
  Then trang nêu địa chỉ email nhận yêu cầu, thông tin cần gửi, thời hạn xử lý tối đa 30 ngày (Q-12), và dữ liệu nào bị xóa

Scenario: AC-03 Liên kết từ màn hình đăng nhập
  When tôi ở trang Đăng nhập hoặc Đăng ký
  Then có liên kết tới "/privacy" ở chân trang
```

Nội dung pháp lý của hai trang do chủ dự án duyệt. Bản nháp do nhóm viết phải ghi rõ "bản nháp chờ duyệt" cho tới khi được duyệt, và không bật Facebook ở staging/production trước khi duyệt.
