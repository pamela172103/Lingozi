# Tổng quan website Lingozi

- Cập nhật: 2026-10-26.
- Trạng thái: chủ dự án đã duyệt bản tổng quan ngày 2026-10-26. Đây là cơ sở định hướng sản phẩm; chưa phải PRD hoặc phạm vi MVP đã duyệt.
- Hiện trạng: repository có tài liệu; chưa triển khai các chức năng mô tả dưới đây.

## 1. Lingozi là gì?

Lingozi là website lưu giữ tri thức tiếng Anh cá nhân, giúp người dùng xây dựng kho kiến thức của riêng mình qua những gì đã đọc, nghe, học và trải nghiệm.

Người dùng có thể ghi lại một từ, cụm từ, cấu trúc hoặc cách diễn đạt; tổ chức chúng theo chủ đề; tìm lại khi cần; và luyện sử dụng bằng chính nội dung mình đã lưu. Mục tiêu là giữ được kiến thức cùng ý nghĩa, bối cảnh và cách dùng, đồng thời tạo cơ hội quay lại thực hành theo thời gian.

Lingozi hướng tới một không gian có thể thể hiện cá tính: người dùng chọn theme rồi tùy chỉnh, cảm thấy muốn chăm sóc kho tri thức và quay lại sử dụng. Đây là mục tiêu trải nghiệm cần được kiểm chứng; giao diện phải giữ nội dung dễ đọc và thao tác nhất quán.

## 2. Người dùng và giá trị hướng tới

Đối tượng ban đầu là cá nhân muốn có thư viện tiếng Anh riêng, đặc biệt những người có thói quen lưu kiến thức từ phim, sách, bài hát, video, công việc hoặc hội thoại. Nhóm tuổi, trình độ và thiết bị ưu tiên chưa chốt.

Các nhu cầu website hướng tới:

- Giữ lại kiến thức đã gặp thay vì để rải rác và khó tìm lại.
- Tổ chức cùng một kiến thức theo nhiều mục đích mà không phải sao chép.
- Tìm lại nội dung ngay cả khi không nhớ mình đã xếp ở đâu.
- Luyện nhớ và luyện sử dụng từ đã lưu trong câu.
- Có một không gian học tập thể hiện sở thích cá nhân.

## 3. Hai không gian trải nghiệm

**Library — Thư viện tri thức:** nơi lưu, tổ chức, tìm kiếm, xem và chỉnh sửa kiến thức.

**Practice — Luyện tập:** nơi gõ từ vựng và đặt câu bằng từ đã lưu, với AI nhận xét và gợi ý sửa câu.

Luồng sử dụng dự kiến: **Bắt gặp kiến thức → lưu từ/nội dung và nghĩa → tổ chức khi cần → tìm lại → luyện nhớ và đặt câu → tiếp tục bổ sung kiến thức.** Journal đã được bỏ khỏi phạm vi hiện tại. Dòng thời gian là cách xem thư viện, không phải một khu nhật ký riêng.

## 4. Các nhóm chức năng định xây dựng

### 4.1. Lưu và quản lý kiến thức

- Thêm mục kiến thức với ít nhất **từ và nghĩa**, theo quyết định hiện hành.
- Bổ sung ví dụ và ghi chú cá nhân khi có; không yêu cầu điền tất cả trước khi lưu.
- Xem lại và chỉnh sửa nội dung đã lưu.
- Khi phát hiện nội dung tương tự, gợi ý mục cũ để người dùng quyết định bổ sung vào đó hay tạo riêng; không tự gộp.

Phạm vi tri thức mong muốn gồm từ vựng, cụm từ, phrasal verbs, thành ngữ, ngữ pháp, cấu trúc câu, mẫu giao tiếp, câu/đoạn trích và ghi chú cách dùng. Cách thể hiện yêu cầu “từ và nghĩa” đối với nội dung ngoài từ vựng cần làm rõ; chưa chốt mô hình dữ liệu hoặc form riêng cho từng loại.

### 4.2. Bộ sưu tập, thẻ và dòng thời gian

- Dùng **bộ sưu tập** để nhóm theo chủ đề hoặc mục đích, ví dụ English for Work hoặc Phrases from Movies.
- Dùng **thẻ** để phân loại chéo, ví dụ Informal, Business English hoặc Phrasal Verb.
- Một mục có thể thuộc nhiều bộ sưu tập và mang nhiều thẻ; các nơi đó cùng tham chiếu một bản ghi.

Tên bộ sưu tập và thẻ trên là ví dụ, không phải dữ liệu bắt buộc. Mốc thời gian sắp xếp và quy tắc xóa mục/bộ sưu tập cần đặc tả sau.

### 4.3. Tìm kiếm và truy xuất

Cho phép tìm lại kiến thức mà không cần nhớ bộ sưu tập. Dự kiến kết hợp tìm kiếm với bộ sưu tập, thẻ và thời gian.

Các trường đang được cân nhắc gồm nội dung tiếng Anh, nghĩa tiếng Việt, ví dụ, ghi chú, thẻ và bộ sưu tập. Chưa chốt phạm vi tìm kiếm, xử lý gần đúng, từ đồng nghĩa hoặc tìm kiếm ngữ nghĩa.

### 4.4. Luyện gõ từ vựng

Hình thức ưu tiên là nhìn nghĩa tiếng Việt rồi gõ từ tiếng Anh đã lưu. Website cần cung cấp phản hồi để người dùng đối chiếu đáp án và nhận ra phần cần luyện lại.

Quy tắc chấp nhận đáp án, từ đồng nghĩa, biến thể, hoa/thường và dấu câu còn cần làm rõ. Bài gõ hướng tới luyện nhớ nội dung đã lưu; không tự coi gõ đúng là bằng chứng đã sử dụng được từ trong mọi ngữ cảnh.

### 4.5. Đặt câu có AI nhận xét

Người dùng viết câu sử dụng từ đã lưu, sau đó nhận nhận xét và gợi ý sửa từ AI. Nội dung gợi ý phải có thể xem lại và chỉnh sửa.

Đề xuất cần đặc tả tiếp: nhận xét ngữ pháp và cách dùng từ, giải thích lý do sửa, giữ câu gốc để đối chiếu, thông báo khi không nhận xét được. Chưa chốt nhà cung cấp, điểm số, ngôn ngữ phản hồi, hạn mức hoặc việc lưu câu thành ví dụ trong thư viện.

AI hỗ trợ hoạt động đặt câu; chưa có quyết định dùng AI tự tạo nghĩa, tự phân loại hoặc tự điền toàn bộ kiến thức.

### 4.6. Cá nhân hóa giao diện

Đã chọn hướng **chọn theme có sẵn rồi tùy chỉnh thêm**. Các phong cách tham khảo gồm Coquette/Girly, Hiphop/Street, Cosmic/Space, Garden/Nature, Pet Lover và Dark Academia;

Các lớp tùy chỉnh đang được đề xuất gồm màu sắc, nền, kiểu chữ, minh họa, linh vật và sticker. Mức tùy chỉnh cụ thể chưa chốt.

Nguyên tắc: đổi theme giữ luồng lưu/tìm/ôn nhất quán; trang trí không che hoặc làm giảm khả năng đọc; cân nhắc chế độ giảm trang trí và hiệu ứng.

### 4.7. Thư viện riêng tư

Thư viện hoàn toàn riêng tư, không chia sẻ công khai. Nội dung phải được lưu và truy cập đúng chủ sở hữu. Phương thức đăng nhập và quản lý tài khoản cần được lựa chọn khi đặc tả

## 5. Các chức năng chưa thuộc ưu tiên hiện tại

Flashcard, trắc nghiệm và nghe → gõ lại từng được đề cập nhưng chưa chọn làm ưu tiên. Lịch ôn cách quãng, nhắc học, thống kê tiến bộ, xuất dữ liệu và phục hồi sau xóa còn cần thảo luận; không tự đưa vào MVP.

## 6. Ranh giới của bản tổng quan

Đây là mô tả chức năng định xây dựng, không phải danh sách tính năng đã hoạt động hoặc cam kết làm tất cả trong bản đầu. Chưa chốt MVP, chi phí vận hành, mô hình thu phí, schema hoặc cách tích hợp AI. Các định hướng công nghệ đã ghi trong repository cần được xác minh khi bước sang thiết kế và triển khai.

Cách đo tiến bộ còn mở; số mục đã lưu không phải thước đo duy nhất về kết quả học tập. Phỏng vấn và thử nghiệm được đề xuất trong discovery chưa được thực hiện.

## Tài liệu liên quan

- [Brainstorm và các quyết định nghiệp vụ](brainstorms/personal-english-knowledge.md).
- [Discovery: bằng chứng, rủi ro và kế hoạch kiểm chứng](03-discovery-report.md).
- [Trạng thái dự án](../project/STATUS.md).
