# User story và tiêu chí nghiệm thu — FEAT-02 Mục kiến thức

- Cập nhật: 2026-11-08. Trạng thái: **chờ duyệt**.
- Mọi story yêu cầu người dùng đã đăng nhập và đã xác thực email (FEAT-01, BR-AUTH-003). Mã BR và ERR xem [srs.md](../srs/srs.md).
- Câu đặt trong ngoặc kép là thông báo hiển thị cho người dùng. Câu chữ cuối cùng nằm trong `messages/vi.json`.

## US-LIB-01 — Lưu một mục kiến thức

Là người tự học, tôi muốn lưu nhanh một từ hoặc cách diễn đạt kèm nghĩa vừa gặp, để không quên và tìm lại được.

```gherkin
Scenario: AC-01 Lưu với thông tin tối thiểu
  Given tôi đang ở Thư viện
  When tôi chọn "Lưu kiến thức", nhập nội dung "give up", nghĩa "từ bỏ" và bấm "Lưu"
  Then mục được lưu với loại mặc định "Từ vựng"
  And tôi thấy trang chi tiết của mục cùng thông báo "Đã lưu"

Scenario: AC-02 Lưu đầy đủ
  When tôi nhập nội dung, nghĩa, chọn loại "Cụm động từ", thêm 2 ví dụ (một ví dụ có bản dịch), ghi chú và nguồn "Phim Friends S01E01"
  Then mục và 2 ví dụ được lưu đúng thứ tự tôi nhập

Scenario: AC-03 Thiếu trường bắt buộc
  When tôi bấm "Lưu" khi nội dung hoặc nghĩa để trống, hoặc chỉ có khoảng trắng
  Then mục không được lưu
  And ô thiếu hiện "Vui lòng nhập nội dung tiếng Anh" hoặc "Vui lòng nhập nghĩa" (ERR-LIB-400-01), focus vào ô lỗi đầu tiên

Scenario: AC-04 Biên độ dài và số ví dụ
  When nội dung dài 1001 ký tự, hoặc tôi thêm ví dụ thứ 21
  Then không lưu được, và hiện lỗi giới hạn cụ thể (BR-LIB-001, BR-LIB-004)
  And nội dung dài đúng 1000 ký tự với 20 ví dụ thì lưu được

Scenario: AC-05 Bấm Lưu hai lần hoặc mạng gửi lại
  When cùng một yêu cầu tạo được gửi hai lần với cùng mã yêu cầu (clientRequestId)
  Then chỉ có một mục được tạo, và lần gửi thứ hai nhận về chính mục đó (BR-LIB-008)

Scenario: AC-06 Đạt giới hạn số mục
  Given tôi đã có 10.000 mục
  When tôi lưu thêm một mục
  Then không lưu được và thấy ERR-LIB-422-01
```

## US-LIB-02 — Được gợi ý khi lưu mục tương tự

Là người tự học, tôi muốn biết mình đã lưu nội dung này chưa, để bổ sung vào mục cũ thay vì tạo bản trùng.

```gherkin
Scenario: AC-01 Có mục tương tự
  Given tôi đã có mục "Give up" nghĩa "từ bỏ"
  When tôi tạo mục mới với nội dung "  give   UP " và bấm "Lưu"
  Then mục chưa được lưu
  And hộp thoại "Bạn đã lưu nội dung tương tự" liệt kê mục "Give up" với nghĩa và ngày tạo
  And có hai lựa chọn "Mở mục cũ để bổ sung" và "Vẫn tạo mục mới"

Scenario: AC-02 Mở mục cũ
  When tôi chọn "Mở mục cũ để bổ sung"
  Then tôi tới màn hình sửa mục cũ, và nội dung đang nhập không bị lưu thành mục mới
  And nghĩa, ví dụ, ghi chú tôi đã nhập được giữ lại, hiện bên cạnh để tôi tự chép sang (không tự gộp)

Scenario: AC-03 Vẫn tạo mục mới
  When tôi chọn "Vẫn tạo mục mới"
  Then mục mới được lưu, và mục cũ không thay đổi

Scenario: AC-04 Không gợi ý mục của người khác
  Given người dùng khác có mục "give up"
  And tôi chưa có
  When tôi lưu "give up"
  Then không có hộp thoại gợi ý và mục được lưu ngay

Scenario: AC-05 Nhiều mục tương tự
  Given tôi có 7 mục cùng nội dung chuẩn hóa "give up"
  Then hộp thoại hiện 5 mục mới nhất và dòng "và 2 mục khác"
```

## US-LIB-03 — Xem danh sách thư viện

Là người tự học, tôi muốn xem các mục đã lưu, mới nhất trước.

```gherkin
Scenario: AC-01 Danh sách có dữ liệu
  Given tôi có 25 mục
  When tôi mở Thư viện
  Then tôi thấy 20 mục mới nhất, mỗi mục hiện nội dung, nghĩa (cắt ở 2 dòng), loại và ngày tạo
  And có phân trang để xem 5 mục còn lại

Scenario: AC-02 Thư viện trống
  Given tôi chưa có mục nào
  Then tôi thấy trạng thái trống "Thư viện của bạn đang trống" kèm nút "Lưu kiến thức đầu tiên"

Scenario: AC-03 Lỗi tải
  When API trả lỗi hoặc mạng mất
  Then tôi thấy "Không tải được thư viện" kèm nút "Thử lại", và không hiện dữ liệu cũ của người khác

Scenario: AC-04 Tham số trang ngoài giới hạn
  When tôi mở trang 999 hoặc pageSize 1000 qua URL
  Then trang ngoài phạm vi hiện danh sách trống kèm link về trang 1
  And pageSize lớn hơn 50 được giới hạn về 50
```

## US-LIB-04 — Xem chi tiết một mục

```gherkin
Scenario: AC-01 Xem chi tiết
  When tôi mở một mục của mình
  Then tôi thấy nội dung (cỡ chữ term), loại, nghĩa, các ví dụ theo thứ tự, ghi chú, nguồn, ngày tạo và ngày sửa

Scenario: AC-02 Mục không tồn tại hoặc của người khác
  When tôi mở đường dẫn tới mục không tồn tại, hoặc mục của người khác
  Then tôi thấy cùng màn hình "Không tìm thấy mục này" (ERR-LIB-404-01)

Scenario: AC-03 Mục không có trường tùy chọn
  Given mục chỉ có nội dung và nghĩa
  Then các khối ví dụ, ghi chú, nguồn không hiển thị, không để khối trống
```

## US-LIB-05 — Sửa mục

Là người tự học, tôi muốn bổ sung hoặc sửa mục đã lưu khi hiểu thêm về nó.

```gherkin
Scenario: AC-01 Sửa thành công
  When tôi sửa nghĩa, thêm một ví dụ, xóa một ví dụ cũ và bấm "Lưu thay đổi"
  Then mục được cập nhật, ngày sửa đổi theo, và tôi thấy "Đã lưu thay đổi"

Scenario: AC-02 Xung đột do sửa ở hai nơi
  Given tôi mở form sửa mục ở hai tab
  And tab 1 đã lưu thay đổi
  When tab 2 bấm "Lưu thay đổi"
  Then tab 2 không ghi đè, và thấy "Mục này vừa được sửa ở nơi khác" (ERR-LIB-409-01)
  And có lựa chọn "Tải bản mới nhất", nội dung đang nhập ở tab 2 được giữ để tự chép lại

Scenario: AC-03 Rời trang khi chưa lưu
  Given tôi đã thay đổi form
  When tôi rời trang
  Then trình duyệt hỏi xác nhận trước khi rời

Scenario: AC-04 Sửa mục của người khác
  When có request sửa mục của người khác
  Then API trả 404 ERR-LIB-404-01, dữ liệu không đổi
```

## US-LIB-06 — Xóa mục

```gherkin
Scenario: AC-01 Xóa có xác nhận
  When tôi chọn "Xóa" ở một mục
  Then hộp thoại "Xóa mục 'give up'? Hành động này không thể hoàn tác." hiện ra, focus mặc định ở nút "Hủy"
  And khi tôi chọn "Xóa" (nút kiểu viền, có icon cảnh báo, theo design system) thì mục và các ví dụ bị xóa
  And tôi về Thư viện với thông báo "Đã xóa"

Scenario: AC-02 Hủy xóa
  When tôi chọn "Hủy" hoặc nhấn Esc
  Then mục không bị xóa và focus quay về nút "Xóa"

Scenario: AC-03 Xóa mục đã bị xóa ở nơi khác
  When tôi xác nhận xóa một mục vừa bị xóa ở tab khác
  Then tôi thấy "Mục này không còn tồn tại" và được đưa về Thư viện (không hiện lỗi hệ thống)
```

## US-LIB-07 — Thư viện riêng tư

```gherkin
Scenario: AC-01 Không thấy dữ liệu người khác
  Given user A và user B đều có mục
  Then danh sách, chi tiết, gợi ý trùng của A chỉ chứa mục của A

Scenario: AC-02 Mọi thao tác với ID của người khác
  When A gọi GET, PUT, DELETE với ID mục của B
  Then đều trả 404 ERR-LIB-404-01 và dữ liệu của B không đổi

Scenario: AC-03 Không tin UserId từ client
  When request tạo hoặc sửa gửi kèm trường userId của người khác
  Then trường đó bị bỏ qua; mục luôn thuộc người đang đăng nhập
```
