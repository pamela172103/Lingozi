# Phiên 2026-11-08 · 08 · Cài .NET SDK và Docker cho phiên cloud

- Ngày / múi giờ: 2026-11-08, UTC.
- Mục tiêu do người dùng yêu cầu: cài .NET SDK và Docker để dựng walking skeleton.
- Nhánh và commit nền đã kiểm tra: `claude/friendly-brahmagupta-yzqxik` tại `53fb2fa`.
- Status: PASS (phạm vi phiên).

## Kết quả và file liên quan

- Cài `dotnet-sdk-10.0` từ kho Ubuntu 24.04 (`noble-updates`): SDK 10.0.114, runtime Microsoft.NETCore.App và Microsoft.AspNetCore.App 10.0.14, khớp ADR 0002.
- Docker: binary đã có sẵn; khởi động `dockerd` thủ công, server 29.9.2.
- Kéo image `mcr.microsoft.com/mssql/server:2025-latest` và chạy với `MSSQL_PID=Express`. Truy vấn trả về 17.0.5035.5, Express Edition. Container kiểm tra đã bị xóa; mật khẩu chỉ sinh ngẫu nhiên tạm thời, không lưu lại.
- Tạo môi trường cloud cá nhân "Lingozi" (gắn repo `pamela172103/lingozi`), có setup script cài `dotnet-sdk-10.0`. Phiên này đã chuyển sang dùng môi trường đó.
- Cập nhật `docs/project/STATUS.md` (ENV-01 → done, thêm hướng dẫn chạy Docker) và mục lục phiên.

## Quyết định và giả định

- Dùng gói .NET của Ubuntu thay cho script `dotnet-install`, vì host `dot.net` bị chặn mà kho Ubuntu vẫn truy cập được.
- Docker daemon không được đưa vào setup script, vì setup script không được chạy tiến trình nền.

## Kiểm tra

- `dotnet --list-sdks`, `dotnet --list-runtimes`.
- `docker info`.
- `sqlcmd` trong container SQL Server.
- Đã chạy thử setup script một lần trong phiên này (exit 0). Script **chưa được chứng minh** trên container mới.

## Database/API/UI

Không áp dụng.

## Security checks

Không lưu secret. Mật khẩu SA tạm thời chỉ tồn tại trong lệnh kiểm tra.

## Việc còn lại và vướng mắc

- Chưa dựng walking skeleton.
- Ở phiên mới, cần kiểm tra lại setup script và khởi động `dockerd` bằng tay.

## Bàn giao

- Việc tiếp theo: walking skeleton + CI (Vòng 0).
- Công cụ: `nohup dockerd > /tmp/dockerd.log 2>&1 &` ở mỗi phiên cloud.
- Trạng thái lưu Git: đi cùng commit phiên này.
- Trạng thái đồng bộ: push lên `claude/friendly-brahmagupta-yzqxik`.
