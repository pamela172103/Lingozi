# User story và tiêu chí nghiệm thu — FEAT-02 Mục kiến thức

- Cập nhật: 2026-11-08. Trạng thái: **chờ duyệt**.
- Mọi story yêu cầu người dùng đã đăng nhập và đã xác thực email (FEAT-01, BR-AUTH-003). Mã BR và ERR xem [srs.md](../srs/srs.md).
- Câu đặt trong ngoặc kép là thông báo hiển thị cho người dùng. Câu chữ cuối cùng nằm trong `messages/vi.json`.

## US-LIB-01 — Chọn loại và lưu mục kiến thức

Là người tự học, tôi muốn chọn loại kiến thức trước (từ vựng, ngữ pháp, cụm từ…) và chỉ phải nhập đúng phần bắt buộc của loại đó, để lưu nhanh.

Quy ước (cập nhật 2026-11-08): loại không có mặc định; Vòng 1 chỉ có hai loại là Từ vựng và Ngữ pháp; mỗi loại chỉ có một trường bắt buộc; nghĩa không bắt buộc và được gợi ý (US-LIB-09).

```gherkin
Scenario: AC-01 Chọn loại trước khi nhập
  Given tôi mở "Lưu kiến thức"
  Then tôi thấy hai loại: "Từ vựng" và "Ngữ pháp"
  And chưa có ô nhập nào hiện ra cho tới khi tôi chọn một loại

Scenario: AC-02 Từ vựng chỉ bắt buộc "Từ"
  Given tôi chọn "Từ vựng"
  When tôi nhập "Từ" là "give up", để trống nghĩa, rồi bấm "Lưu"
  Then mục được lưu với loại "word" và nghĩa là null
  And tôi thấy trang chi tiết với thông báo "Đã lưu"

Scenario: AC-03 Ngữ pháp chỉ bắt buộc "Điểm ngữ pháp"
  Given tôi chọn "Ngữ pháp"
  When tôi để trống "Điểm ngữ pháp" và bấm "Lưu"
  Then mục không được lưu và ô hiện "Vui lòng nhập điểm ngữ pháp" (ERR-LIB-400-01)
  When tôi nhập "Present perfect" và để trống nghĩa rồi bấm "Lưu"
  Then mục được lưu với loại "grammar"

Scenario: AC-04 Chỉ có hai loại trong Vòng 1
  Given tôi mở form tạo
  Then không có loại nào khác "Từ vựng" và "Ngữ pháp" để chọn
  And API từ chối "kind" nằm ngoài {word, grammar} với ERR-LIB-400-01

Scenario: AC-05 Nghĩa không bắt buộc, khoảng trắng được coi là trống
  Given tôi chọn "Ngữ pháp" và nhập điểm ngữ pháp "Present perfect"
  When tôi nhập nghĩa chỉ gồm khoảng trắng rồi bấm "Lưu"
  Then mục được lưu và nghĩa được lưu là null

Scenario: AC-06 Giới hạn độ dài
  When tôi nhập nội dung dài 1001 ký tự, hoặc nghĩa dài 2001 ký tự
  Then không lưu được và ô tương ứng hiện lỗi ERR-LIB-400-01
  And nội dung dài đúng 1000 ký tự và nghĩa dài đúng 2000 ký tự thì lưu được

Scenario: AC-07 Ví dụ không bắt buộc
  Given tôi đã nhập đủ trường bắt buộc
  When tôi không thêm ví dụ nào
  Then mục vẫn được lưu
  And khi thêm ví dụ thứ 21 thì hiện "Tối đa 20 ví dụ" (BR-LIB-004)

Scenario: AC-08 Bấm Lưu hai lần hoặc mạng gửi lại
  When cùng một yêu cầu tạo được gửi hai lần với cùng clientRequestId
  Then chỉ có một mục được tạo (BR-LIB-008)

Scenario: AC-09 Đạt giới hạn số mục
  Given tôi đã có 10.000 mục
  When tôi lưu thêm một mục
  Then không lưu được và thấy ERR-LIB-422-01

Scenario: AC-10 API từ chối yêu cầu thiếu loại
  When một client gửi POST không có "kind"
  Then API trả 400 ERR-LIB-400-01 với lỗi ở trường "kind" và không tạo mục
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

## US-LIB-08 — Tự điền phiên âm IPA cho từ vựng

Là người học từ vựng, tôi muốn có phiên âm IPA tự động, nhưng vẫn sửa được hoặc tự nhập nếu không có.

Phụ thuộc: nguồn từ điển chưa được chọn (ADR 0007). Trạng thái hiện tại: **integration ready** với provider giả trong test; không ghi là hoạt động cho tới khi có nguồn thật.

```gherkin
Scenario: AC-01 Tự điền phiên âm
  Given tôi chọn "Từ vựng" và nhập "give up"
  When tôi rời ô "Từ" (hoặc sau 500 ms không gõ)
  Then ô "Phiên âm" được điền "/ɡɪv ʌp/" với nhãn "Tự động từ điển"
  And tôi có thể lưu mà không sửa gì

Scenario: AC-02 Sửa phiên âm do máy điền
  Given ô phiên âm đang có giá trị từ điển
  When tôi sửa thành "/ɡɪv ʌp/ (ghi chú của tôi)" hoặc thay bằng giá trị khác rồi lưu
  Then mục lưu IpaSource = 2 (người dùng) và nhãn chuyển thành "Bạn đã chỉnh sửa"

Scenario: AC-03 Không có phiên âm từ nguồn
  Given nguồn không có phiên âm cho "xyzzy"
  When tôi nhập "xyzzy"
  Then ô phiên âm trống với gợi ý "Chưa có phiên âm, bạn có thể tự nhập"
  And tôi lưu được mục với Ipa là null

Scenario: AC-04 Tự nhập phiên âm
  Given ô phiên âm trống
  When tôi nhập "/ˈzɪzli/" rồi lưu
  Then mục lưu Ipa = "/ˈzɪzli/" và IpaSource = 2

Scenario: AC-05 Phiên âm sai ký tự
  When tôi nhập "<b>give</b>" vào ô phiên âm
  Then không lưu được và thấy ERR-LIB-400-02 "Phiên âm chỉ được chứa ký tự IPA"

Scenario: AC-06 Nguồn lỗi hoặc quá thời gian
  Given nguồn không phản hồi trong 3 giây
  When tôi nhập "give up"
  Then form vẫn dùng được, ô phiên âm trống
  And có dòng "Không lấy được phiên âm tự động" (BR-LIB-015), không hiện lỗi đỏ

Scenario: AC-07 Xóa phiên âm
  Given ô phiên âm có giá trị
  When tôi xóa hết và lưu
  Then mục lưu Ipa = null và IpaSource = null

Scenario: AC-08 Không có ô phiên âm cho Ngữ pháp
  When tôi chọn "Ngữ pháp"
  Then không có ô phiên âm và không gọi nguồn phiên âm
```

## US-LIB-09 — Gợi ý nghĩa khi nhập

Là người học, tôi muốn được gợi ý nghĩa để nhanh hơn, nhưng gợi ý không tự điền vào form.

```gherkin
Scenario: AC-01 Gợi ý từ mục của chính tôi
  Given tôi đã lưu "give up" với nghĩa "từ bỏ"
  When tôi nhập "give up" ở bất kỳ loại nào
  Then ô nghĩa hiện gợi ý "từ bỏ" với nhãn "Từ mục của bạn"
  And ô nghĩa vẫn trống cho tới khi tôi bấm gợi ý

Scenario: AC-02 Gợi ý từ nguồn từ điển
  Given nguồn trả về nghĩa "to stop trying" cho "give up"
  When tôi nhập "give up"
  Then gợi ý hiện với nhãn "Từ từ điển"

Scenario: AC-03 Không gợi ý dữ liệu của người khác
  Given người dùng B đã lưu "give up" với nghĩa "bỏ cuộc"
  When tôi (người dùng A, chưa có mục nào) nhập "give up"
  Then không có gợi ý "bỏ cuộc"

Scenario: AC-04 Bấm gợi ý mới điền
  When tôi bấm gợi ý "từ bỏ"
  Then ô nghĩa được điền "từ bỏ" và tôi vẫn sửa được

Scenario: AC-05 Không có gợi ý
  When không có nguồn nào trả nghĩa cho từ tôi nhập
  Then không hiện gợi ý, không có thông báo lỗi, và nghĩa vẫn không bắt buộc
```
