# User story và tiêu chí nghiệm thu — FEAT-02 Mục kiến thức

- Cập nhật: 2026-11-11. Trạng thái: **chờ duyệt**.
- Mọi story yêu cầu người dùng đã đăng nhập và đã xác thực email (FEAT-01, BR-AUTH-003). Mã BR và ERR xem [srs/README.md](../srs/README.md).
- Thư viện **Từ vựng** và **Ngữ pháp** là hai mục riêng trong menu (quyết định 2026-11-11): mỗi thư viện có danh sách, form thêm, chi tiết, sửa và xóa riêng; không có màn hình "chọn loại". Loại của mục do thư viện đang mở quyết định.
- Câu đặt trong ngoặc kép là thông báo hiển thị cho người dùng. Câu chữ cuối cùng nằm trong `messages/vi.json`.

## US-LIB-01 — Lưu từ vựng và ngữ pháp

Là người tự học, tôi muốn lưu từ vựng trong thư viện Từ vựng và lưu cấu trúc ngữ pháp trong thư viện Ngữ pháp, mỗi nơi chỉ có đúng các ô cần thiết, để lưu nhanh và dễ tìm lại.

Quy ước (cập nhật 2026-11-11): hai thư viện tách riêng, không có bước chọn loại. Form Từ vựng gồm các ô theo thứ tự: Từ\*, Phiên âm, Nghĩa\*, Loại từ, Ví dụ, Ghi chú. Form Ngữ pháp gồm: Tên cấu trúc\*, Công thức\*, Ý nghĩa, Ví dụ, Ghi chú. Dấu \* là bắt buộc; các trường còn lại không bắt buộc. Form không có trường "Nguồn". Mỗi form là một cột, các ô xếp từ trên xuống theo đúng thứ tự trên. Gợi ý nghĩa (US-LIB-09) vẫn áp dụng cho ô "Nghĩa" của từ vựng.

```gherkin
Scenario: AC-01 Mỗi thư viện có form riêng
  Given tôi đang ở thư viện "Từ vựng"
  When tôi bấm "Thêm từ vựng"
  Then tôi thấy form với các ô theo thứ tự: "Từ" (bắt buộc), "Phiên âm", "Nghĩa" (bắt buộc), "Loại từ", "Ví dụ", "Ghi chú"
  And không có ô "Tên cấu trúc", "Công thức" hay "Ý nghĩa"
  Given tôi đang ở thư viện "Ngữ pháp"
  When tôi bấm "Thêm ngữ pháp"
  Then tôi thấy form với các ô theo thứ tự: "Tên cấu trúc" (bắt buộc), "Công thức" (bắt buộc), "Ý nghĩa", "Ví dụ", "Ghi chú"
  And không có ô "Từ", "Phiên âm", "Nghĩa" hay "Loại từ"

Scenario: AC-02 Từ vựng bắt buộc "Từ" và "Nghĩa"
  Given tôi mở form thêm từ vựng
  When tôi nhập "Từ" là "give up", "Nghĩa" là "từ bỏ", rồi bấm "Lưu"
  Then mục được lưu với loại "word", và tôi thấy trang chi tiết từ vựng với thông báo "Đã lưu"
  When tôi để trống "Nghĩa" hoặc chỉ nhập khoảng trắng, rồi bấm "Lưu"
  Then mục không được lưu và ô "Nghĩa" hiện "Vui lòng nhập nghĩa." (ERR-LIB-400-01)

Scenario: AC-03 Ngữ pháp bắt buộc "Tên cấu trúc" và "Công thức"
  Given tôi mở form thêm ngữ pháp
  When tôi để trống "Tên cấu trúc" hoặc "Công thức", rồi bấm "Lưu"
  Then mục không được lưu và ô trống hiện "Vui lòng nhập tên cấu trúc." hoặc "Vui lòng nhập công thức." (ERR-LIB-400-01)
  When tôi nhập "Tên cấu trúc" là "Present perfect" và "Công thức" là "have/has + V3", rồi bấm "Lưu"
  Then mục được lưu với loại "grammar", và tôi thấy trang chi tiết ngữ pháp với thông báo "Đã lưu"

Scenario: AC-04 Loại do thư viện quyết định, không có bước chọn loại
  Given tôi mở form thêm ở thư viện "Từ vựng" hoặc "Ngữ pháp"
  Then form không có ô hay nút chọn loại, và mục lưu ra có loại tương ứng với thư viện đang mở
  And API từ chối "kind" nằm ngoài {word, grammar} với ERR-LIB-400-01

Scenario: AC-05 Ý nghĩa ngữ pháp không bắt buộc, khoảng trắng được coi là trống
  Given tôi mở form thêm ngữ pháp và đã nhập "Tên cấu trúc" và "Công thức"
  When tôi nhập "Ý nghĩa" chỉ gồm khoảng trắng rồi bấm "Lưu"
  Then mục được lưu và ý nghĩa được lưu là null

Scenario: AC-06 Giới hạn độ dài
  When tôi nhập "Từ", "Tên cấu trúc" hoặc "Công thức" dài 1001 ký tự, hoặc "Nghĩa" hoặc "Ý nghĩa" dài 2001 ký tự
  Then không lưu được và ô tương ứng hiện lỗi ERR-LIB-400-01
  And độ dài đúng 1000 ký tự (với "Từ", "Tên cấu trúc", "Công thức") và đúng 2000 ký tự (với "Nghĩa", "Ý nghĩa") thì lưu được

Scenario: AC-07 Ví dụ không bắt buộc
  Given tôi đã nhập đủ trường bắt buộc
  When tôi không thêm ví dụ nào
  Then mục vẫn được lưu
  And khi thêm ví dụ thứ 21 thì hiện "Tối đa 20 ví dụ" (BR-LIB-004)

Scenario: AC-08 Bấm Lưu hai lần hoặc mạng gửi lại
  When cùng một yêu cầu tạo được gửi hai lần với cùng clientRequestId
  Then chỉ có một mục được tạo (BR-LIB-008)

Scenario: AC-09 Đạt giới hạn số mục
  Given tôi đã có 10.000 mục (tính chung cả từ vựng và ngữ pháp)
  When tôi lưu thêm một mục ở thư viện nào
  Then không lưu được và thấy ERR-LIB-422-01

Scenario: AC-10 API từ chối yêu cầu thiếu loại
  When một client gửi POST không có "kind"
  Then API trả 400 ERR-LIB-400-01 với lỗi ở trường "kind" và không tạo mục

Scenario: AC-11 Loại từ không bắt buộc, chỉ nhận giá trị trong danh sách
  Given tôi mở form thêm từ vựng và đã nhập "Từ" và "Nghĩa"
  When tôi không chọn "Loại từ" rồi bấm "Lưu", hoặc chọn "Động từ" rồi bấm "Lưu"
  Then mục được lưu và loại từ được lưu là null hoặc "Động từ"
  And API từ chối loại từ ngoài danh sách với ERR-LIB-400-01 ở trường "partOfSpeech"

```

## US-LIB-02 — Được gợi ý khi lưu mục tương tự

Là người tự học, tôi muốn biết mình đã lưu nội dung này trong cùng thư viện chưa, để bổ sung vào mục cũ thay vì tạo bản trùng. Mục tương tự chỉ được tìm trong **cùng thư viện** đang lưu (từ vựng với từ vựng, ngữ pháp với ngữ pháp).

```gherkin
Scenario: AC-01 Có mục tương tự
  Given tôi đã có từ vựng "Give up" nghĩa "từ bỏ"
  When tôi thêm từ vựng mới với nội dung "  give   UP " và bấm "Lưu"
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
  Given người dùng khác có từ vựng "give up"
  And tôi chưa có
  When tôi lưu từ vựng "give up"
  Then không có hộp thoại gợi ý và mục được lưu ngay

Scenario: AC-05 Nhiều mục tương tự
  Given tôi có 7 mục cùng loại và cùng nội dung chuẩn hóa "give up"
  Then hộp thoại hiện 5 mục mới nhất và dòng "và 2 mục khác"

Scenario: AC-06 Không gợi ý mục ở thư viện kia
  Given tôi có mục ngữ pháp tên "give up" nhưng chưa có từ vựng "give up"
  When tôi thêm từ vựng "give up" và bấm "Lưu"
  Then không có hộp thoại gợi ý và từ vựng được lưu ngay
```

## US-LIB-03 — Xem danh sách thư viện Từ vựng và Ngữ pháp

Là người tự học, tôi muốn xem các từ vựng và các cấu trúc ngữ pháp đã lưu ở hai thư viện riêng, mới nhất trước.

```gherkin
Scenario: AC-01 Danh sách có dữ liệu
  Given tôi có 25 từ vựng và 12 mục ngữ pháp
  When tôi mở thư viện "Từ vựng"
  Then tôi thấy 20 từ vựng mới nhất, mỗi mục hiện từ, phiên âm (nếu có), loại từ (nếu có), nghĩa (cắt ở 2 dòng) và ngày tạo
  And có phân trang để xem 5 mục còn lại
  When tôi mở thư viện "Ngữ pháp"
  Then tôi thấy 12 mục mới nhất, mỗi mục hiện tên cấu trúc, công thức, ý nghĩa (nếu có, cắt ở 2 dòng) và ngày tạo

Scenario: AC-02 Thư viện trống
  Given tôi chưa có từ vựng nào
  When tôi mở thư viện "Từ vựng"
  Then tôi thấy trạng thái trống "Chưa có từ vựng nào" kèm nút "Thêm từ vựng đầu tiên"
  Given tôi chưa có mục ngữ pháp nào
  When tôi mở thư viện "Ngữ pháp"
  Then tôi thấy trạng thái trống "Chưa có ngữ pháp nào" kèm nút "Thêm ngữ pháp đầu tiên"

Scenario: AC-03 Lỗi tải
  When API trả lỗi hoặc mạng mất
  Then tôi thấy "Không tải được thư viện" kèm nút "Thử lại", và không hiện dữ liệu cũ của người khác

Scenario: AC-04 Tham số trang ngoài giới hạn
  When tôi mở trang 999 hoặc pageSize 1000 qua URL
  Then trang ngoài phạm vi hiện danh sách trống kèm link về trang 1
  And pageSize lớn hơn 50 được giới hạn về 50

Scenario: AC-05 Hai thư viện tách nhau trong menu
  Given tôi có 3 từ vựng và 2 mục ngữ pháp
  Then menu bên trái có hai mục riêng "Từ vựng" và "Ngữ pháp", mục đang mở được đánh dấu
  When tôi mở "Từ vựng"
  Then tôi chỉ thấy 3 từ vựng, không thấy mục ngữ pháp
  When tôi mở "Ngữ pháp"
  Then tôi chỉ thấy 2 mục ngữ pháp, không thấy từ vựng
```

## US-LIB-04 — Xem chi tiết từ vựng hoặc ngữ pháp

```gherkin
Scenario: AC-01 Xem chi tiết
  When tôi mở một mục của mình trong thư viện tương ứng
  Then với từ vựng tôi thấy từ (cỡ chữ term), phiên âm (nếu có), loại từ (nếu có) và nghĩa
  And với ngữ pháp tôi thấy tên cấu trúc (cỡ chữ term), công thức và ý nghĩa (nếu có)
  And cả hai đều có các ví dụ theo thứ tự, ghi chú, ngày tạo và ngày sửa, cùng nút "Sửa" và "Xóa", và nút quay lại về đúng thư viện của mục

Scenario: AC-02 Mục không tồn tại hoặc của người khác
  When tôi mở đường dẫn tới mục không tồn tại, mục của người khác, hoặc mục mở sai thư viện (ví dụ một mục ngữ pháp mở bằng đường dẫn của từ vựng)
  Then tôi thấy cùng màn hình "Không tìm thấy mục này" (ERR-LIB-404-01)

Scenario: AC-03 Mục không có trường tùy chọn
  Given mục từ vựng chỉ có từ và nghĩa
  Then các khối ví dụ, ghi chú, loại từ, phiên âm không hiển thị, không để khối trống
  Given mục ngữ pháp chỉ có tên cấu trúc và công thức
  Then các khối ý nghĩa, ví dụ, ghi chú không hiển thị, không để khối trống
```

## US-LIB-05 — Sửa từ vựng hoặc ngữ pháp

Là người tự học, tôi muốn bổ sung hoặc sửa từ vựng hoặc ngữ pháp đã lưu khi hiểu thêm về nó. Form sửa có cùng các ô, cùng thứ tự với form thêm của thư viện đó, và không cho đổi sang loại khác.

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

## US-LIB-06 — Xóa từ vựng hoặc ngữ pháp

```gherkin
Scenario: AC-01 Xóa có xác nhận
  When tôi chọn "Xóa" ở một mục
  Then hộp thoại "Xóa mục 'give up'? Hành động này không thể hoàn tác." hiện ra, focus mặc định ở nút "Hủy"
  And khi tôi chọn "Xóa" (nút kiểu viền, có icon cảnh báo, theo design system) thì mục và các ví dụ bị xóa
  And tôi về đúng thư viện của mục đó (Từ vựng hoặc Ngữ pháp) với thông báo "Đã xóa"

Scenario: AC-02 Hủy xóa
  When tôi chọn "Hủy" hoặc nhấn Esc
  Then mục không bị xóa và focus quay về nút "Xóa"

Scenario: AC-03 Xóa mục đã bị xóa ở nơi khác
  When tôi xác nhận xóa một mục vừa bị xóa ở tab khác
  Then tôi thấy "Mục này không còn tồn tại" và được đưa về đúng thư viện của mục (không hiện lỗi hệ thống)
```

## US-LIB-07 — Thư viện riêng tư

```gherkin
Scenario: AC-01 Không thấy dữ liệu người khác
  Given user A và user B đều có mục
  Then danh sách (cả Từ vựng và Ngữ pháp), chi tiết, gợi ý trùng của A chỉ chứa mục của A

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
Scenario: AC-01 Tự điền phiên âm Anh-Anh
  Given tôi mở form thêm từ vựng và nhập "water"
  When tôi rời ô "Từ" (hoặc sau 500 ms không gõ)
  Then ô "Phiên âm" được điền "/ˈwɔːtə/" với nhãn "Tự động từ điển (Anh-Anh)" và "Nguồn: Wiktionary, CC BY-SA 3.0"
  And tôi có thể lưu mà không sửa gì

Scenario: AC-01a Chỉ điền khi có phiên âm Anh-Anh được gắn nhãn
  Given tôi nhập "learn", nguồn có phiên âm nhưng không có bản Anh-Anh được gắn nhãn
  Then ô "Phiên âm" trống, không điền phiên âm Anh-Mỹ hay không nhãn vào ô này

Scenario: AC-02 Sửa phiên âm do máy điền
  Given ô phiên âm đang có giá trị từ điển
  When tôi sửa thành "/ˈwɔːtə/ (ghi chú của tôi)" hoặc thay bằng giá trị khác rồi lưu
  Then mục lưu IpaSource = 2 (người dùng) và nhãn chuyển thành "Bạn đã chỉnh sửa"

Scenario: AC-03 Không có phiên âm từ nguồn
  Given nguồn không có phiên âm Anh-Anh cho "learn"
  When tôi nhập "learn"
  Then ô phiên âm trống với gợi ý "Chưa có phiên âm Anh-Anh, bạn có thể tự nhập"
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
  When tôi mở form thêm ngữ pháp
  Then không có ô phiên âm và không gọi nguồn phiên âm
```

## US-LIB-09 — Gợi ý nghĩa khi nhập

Là người học, tôi muốn được gợi ý nghĩa để nhanh hơn, nhưng gợi ý không tự điền vào form. Gợi ý áp dụng cho ô "Nghĩa" của từ vựng (bắt buộc) và ô "Ý nghĩa" của ngữ pháp (không bắt buộc). Gợi ý không thay thế việc tự nhập: với từ vựng, người dùng vẫn phải bấm chọn hoặc tự nhập nghĩa.

```gherkin
Scenario: AC-01 Gợi ý từ mục của chính tôi
  Given tôi đã lưu từ vựng "give up" với nghĩa "từ bỏ"
  When tôi nhập "give up" ở form thêm từ vựng
  Then ô nghĩa hiện gợi ý "từ bỏ" với nhãn "Từ mục của bạn"
  And ở form thêm ngữ pháp, ô "Ý nghĩa" chỉ gợi ý từ các mục ngữ pháp của chính tôi (không từ từ vựng, không từ từ điển)
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
  Then không hiện gợi ý, không có thông báo lỗi, và ô nghĩa vẫn trống để tôi tự nhập (nghĩa của từ vựng là bắt buộc, BR-LIB-001)
```
