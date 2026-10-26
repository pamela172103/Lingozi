# Quy tắc Thiết kế Máy Trạng thái Hữu hạn (Finite State Machine - FSM)

## 1. Các thành phần bắt buộc
- **Trạng thái ban đầu (Initial State)**: Điểm bắt đầu của vòng đời đối tượng.
- **Trạng thái kết thúc (Terminal / Final States)**: Các trạng thái kết thúc (vd: `COMPLETED`, `CANCELLED`, `REFUNDED`).
- **Sự kiện kích hoạt (Event / Trigger)**: Hành động từ người dùng, đối tác hoặc hệ thống.
- **Điều kiện bảo vệ (Guard Condition)**: Ràng buộc logic kiểm tra trước khi chuyển trạng thái.

## 2. Ma trận chuyển dịch trạng thái
Bắt buộc có ma trận đối chiếu: Trạng thái hiện tại | Sự kiện kích hoạt | Điều kiện kiểm tra | Trạng thái tiếp theo | Vai trò thực hiện.
