# Tiêu chuẩn Acceptance Criteria (Cú pháp Gherkin BDD)

Mỗi User Story bắt buộc phải có tối thiểu 03 kịch bản Acceptance Criteria:
1. Kịch bản Thành công (Happy Path)
2. Kịch bản Lỗi nghiệp vụ (Business Error / Negative Path)
3. Kịch bản Biên / Giới hạn (Edge Case & Boundary)

## Cấu trúc cú pháp
```gherkin
Scenario: [Tên kịch bản mô tả mục tiêu kiểm thử]
  Given [Trạng thái / Tiền đề ban đầu của hệ thống và người dùng]
  And [Bổ sung thêm điều kiện tiên quyết nếu có]
  When [Hành động cụ thể do người dùng hoặc hệ thống kích hoạt]
  And [Bổ sung thêm hành động nếu có]
  Then [Kết quả mong đợi hoặc trạng thái thay đổi của hệ thống]
  And [Thông báo hiển thị hoặc mã lỗi trả về (nếu có)]
```
