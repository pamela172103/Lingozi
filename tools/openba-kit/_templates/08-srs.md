# Tài liệu Đặc tả Yêu cầu Kỹ thuật (SRS Master)

## 1. Giới thiệu (Introduction)
- **Tên dự án**: [Project Name]
- **Mục tiêu tài liệu**: Đặc tả toàn diện hành vi chức năng, phi chức năng và ràng buộc kỹ thuật của hệ thống.
- **Tiêu chuẩn áp dụng**: IEEE Std 830-1998 / ISO/IEC/IEEE 29148.

## 2. Bảng Yêu cầu Chức năng (Functional Requirements)
| Mã FR | Tên chức năng | Phân loại | Mô tả tóm tắt | Input | Output | BR tham chiếu | Mã lỗi |
| :--- | :--- | :---: | :--- | :--- | :--- | :--- | :--- |
| `FR-AUTH-001` | Đăng nhập bằng Email/Pass | P0 | Xác thực người dùng bằng email và mật khẩu | email, password | JWT token, user info | `BR-SEC-001` | `ERR-AUTH-401-01` |
| `FR-AUTH-002` | Đăng nhập bằng Google SSO | P0 | Xác thực OAuth2 qua Google Cloud | google_id_token | JWT token, user info | `BR-SEC-003` | `ERR-AUTH-400-02` |

## 3. Bảng Quy tắc Nghiệp vụ (Business Rules Matrix)
| Mã BR | Tên quy tắc | Lĩnh vực | Phát biểu điều kiện (When - Then) | Ngoại lệ |
| :--- | :--- | :--- | :--- | :--- |
| `BR-SEC-001` | Khóa đăng nhập sai | Bảo mật | KHI nhập sai quá 5 lần THÌ khóa tài khoản 15 phút | Admin có quyền unlock thủ công |
| `BR-SEC-002` | Thời hạn phiên token | Bảo mật | Access Token sống 15 phút, Refresh Token sống 7 ngày | Thu hồi ngay nếu đổi mật khẩu |

## 4. Ma trận Mã Lỗi (Error Matrix)
| Mã ERR | HTTP Code | Điều kiện phát sinh | Thông báo người dùng | Hành động khuyến nghị |
| :--- | :---: | :--- | :--- | :--- |
| `ERR-AUTH-401-01` | 401 | Email hoặc mật khẩu không chính xác | "Email hoặc mật khẩu không đúng." | Yêu cầu nhập lại hoặc bấm Quên mật khẩu |
| `ERR-AUTH-423-01` | 423 | Tài khoản bị tạm khóa do brute-force | "Tài khoản bị tạm khóa 15 phút do nhập sai nhiều lần." | Đợi hết thời gian đếm ngược hoặc liên hệ hỗ trợ |
