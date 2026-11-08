# Luồng — FEAT-02 Mục kiến thức

- Cập nhật: 2026-11-08. Trạng thái: **chờ duyệt**.

## 1. Tạo mục và gợi ý mục tương tự

```mermaid
flowchart TD
    A[Mở /library/items/new<br/>client sinh clientRequestId] --> B[Nhập nội dung, nghĩa, ...] --> C[Bấm Lưu]
    C --> V{Hợp lệ ở client?}
    V -- Không --> B1[Lỗi dưới ô] --> B
    V -- Có --> S[GET /similar?term=]
    S --> D{Có mục tương tự?}
    D -- Không --> P[POST /items]
    D -- Có --> DLG[Dialog 'Bạn đã lưu nội dung tương tự']
    DLG -- Mở mục cũ để bổ sung --> E[/library/items/id/edit<br/>+ panel 'Nội dung bạn vừa nhập'/]
    DLG -- Vẫn tạo mục mới --> P
    DLG -- Hủy / Esc --> B
    P --> R{Kết quả}
    R -- 201 hoặc 200 --> OK[/library/items/id + Toast 'Đã lưu'/]
    R -- 400-01 --> B1
    R -- 422-01 --> L[InlineAlert giới hạn]
    R -- Lỗi mạng --> RT[InlineAlert + nút 'Thử lại'<br/>gửi lại cùng clientRequestId] --> P
```

Panel "Nội dung bạn vừa nhập" chỉ hiển thị để người dùng tự chép sang mục cũ, không tự gộp vào mục cũ (tổng quan §4.1). Dữ liệu panel chỉ nằm trong bộ nhớ của trang. Nếu rời trang thì mất, và trước khi rời có hộp thoại xác nhận.

## 2. Sửa có kiểm tra xung đột

```mermaid
sequenceDiagram
    actor U as Người dùng
    participant W as Web
    participant A as API (Library)
    participant DB as SQL Server
    U->>W: Mở /library/items/{id}/edit
    W->>A: GET /api/library/items/{id}
    A->>DB: SELECT ... WHERE Id=@id AND UserId=@currentUser
    A-->>W: 200 Detail (version=V1)
    U->>W: Sửa, bấm Lưu thay đổi
    W->>A: PUT /api/library/items/{id} { ..., version: V1 }
    A->>DB: UPDATE ... WHERE Id=@id AND UserId=@u AND RowVersion=V1; thay ví dụ (một transaction)
    alt 0 dòng bị ảnh hưởng, nhưng mục vẫn tồn tại
        A-->>W: 409 ERR-LIB-409-01 + current (version=V2)
        W-->>U: Giữ form, nút 'Tải bản mới nhất'
    else Mục không tồn tại hoặc không thuộc người dùng
        A-->>W: 404 ERR-LIB-404-01
    else Thành công
        A-->>W: 200 Detail (version=V2)
        W-->>U: /library/items/{id} + 'Đã lưu thay đổi'
    end
```

## 3. Chọn loại, form theo loại và gợi ý (cập nhật 2026-11-08)

```mermaid
flowchart TD
    A[Bấm Lưu kiến thức] --> K[Hai thẻ: Từ vựng, Ngữ pháp<br/>chưa có ô nhập]
    K --> T{Chọn loại}
    T -- Từ vựng --> W[Form: Từ* · Phiên âm · Nghĩa · Ví dụ · Ghi chú · Nguồn]
    T -- Ngữ pháp --> G[Form: Điểm ngữ pháp* · Nghĩa · Ví dụ · Ghi chú · Nguồn]
    W --> WT{Rời ô Từ hoặc 500 ms}
    WT --> SG[GET /suggestions?term&kind=word]
    SG --> IPA{ipa có giá trị?}
    IPA -- Có --> PF[Điền phiên âm, nhãn 'Tự động từ điển']
    IPA -- Không --> PE[Ô phiên âm trống<br/>hoặc 'Không lấy được phiên âm tự động']
    G --> GT{Rời ô Điểm ngữ pháp}
    GT --> SG2[GET /suggestions?term&kind=grammar]
    SG2 --> M[Chip gợi ý nghĩa 'Từ mục của bạn' / 'Từ từ điển']
    PF --> M
    PE --> M
    M -- Bấm chip --> F[Điền ô Nghĩa, vẫn sửa được]
    M -- Không bấm --> S[Ô nghĩa trống, vẫn lưu được]
    F --> SAVE[POST /items]
    S --> SAVE
    SAVE --> R{Kết quả}
    R -- 201/200 --> OK[Chi tiết + 'Đã lưu']
    R -- 400-01/02 --> E[Lỗi dưới ô]
```

- Gợi ý chỉ gọi khi có term; với Ngữ pháp không gọi nguồn phiên âm (AC-08 US-LIB-08).
- Đổi loại khi đã nhập dữ liệu: giữ các trường chung (nội dung, nghĩa, ví dụ, ghi chú, nguồn); phiên âm bị xóa khi chuyển sang Ngữ pháp, có hộp xác nhận trước khi xóa.

