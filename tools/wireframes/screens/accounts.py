# -*- coding: utf-8 -*-
"""FEAT-01 Tài khoản: sign-in screens (Figma exports for W-AUTH-01..08) and the remaining screens drawn here."""
from __future__ import annotations

from wf import (C, Alert, AppShell, AuthShell, Badge, Button, Card, Col, Divider, Field, Header, Link, Muted, Note, Node, Pad,
                Row, Secondary, Skeleton, Spacer, Text, Toast, rect, text)
from . import figma, screen

F = "accounts"
D = "design-assets/"

# ---------------------------------------------------------------- screens that already have a Figma export
figma("W-AUTH-01", F, "Đăng nhập: trạng thái ban đầu (`/auth/login`)", [
    "Ba phương thức theo thứ tự: Google, Facebook, email. Facebook thay cho Apple. Không có ô mật khẩu và không có liên kết \"Quên mật khẩu\".",
    "Ô email ẩn cho tới khi bấm \"Tiếp tục với email\". Chân trang có liên kết tới `/privacy` và `/data-deletion`.",
    "Nút Google và Facebook hiện nhưng không bấm được cho tới US-AUTH-04 và US-AUTH-05; mô tả cho trình đọc màn hình: \"chưa khả dụng\".",
], D + "W-AUTH-01-login-initial.webp")
figma("W-AUTH-02", F, "Đăng nhập: bước nhập email", [
    "Mở ra khi bấm \"Tiếp tục với email\"; focus vào ô email. Enter trong ô email tương đương bấm \"Gửi mã\".",
    "Đang gửi: nút \"Gửi mã\" có spinner, giữ nguyên chiều rộng, ô email bị khóa.",
], D + "W-AUTH-02-email-step.webp")
figma("W-AUTH-03", F, "Đăng nhập: email sai định dạng (ERR-AUTH-400-01)", [
    "Viền ô email đổi sang màu lỗi; lỗi gắn với ô qua `aria-describedby`, có icon và chữ.",
    "Không gửi gì; nội dung đã nhập được giữ lại.",
], D + "W-AUTH-03-email-invalid.webp")
figma("W-AUTH-04", F, "Đăng nhập: vượt giới hạn gửi (ERR-AUTH-429-01)", [
    "Nút \"Gửi mã\" bị vô hiệu và đếm ngược theo header `Retry-After`. Cùng hiển thị cho giới hạn theo email (1 mã mỗi 60 giây, 5 mã mỗi giờ) và theo IP.",
    "Số giây trong ảnh (30) là ví dụ; số thật lấy từ `Retry-After`.",
], D + "W-AUTH-04-rate-limited.webp")
figma("W-AUTH-05", F, "Nhập mã: trạng thái ban đầu (`/auth/code`)", [
    "Sáu ô, mỗi ô có nhãn riêng; `autocomplete=\"one-time-code\"`, `inputmode=\"numeric\"`. Dán 6 số vào ô đầu thì điền cả sáu ô; đủ 6 số thì tự gửi xác nhận.",
    "Đếm ngược 10 phút theo thời hạn của mã. Không có ô mật khẩu.",
], D + "W-AUTH-05-code-entry.webp")
figma("W-AUTH-06", F, "Nhập mã: mã sai (ERR-AUTH-401-01)", [
    "Cả sáu ô được xóa và focus về ô đầu tiên; thông báo có `role=\"alert\"`. Số lần còn lại giảm theo mỗi lần sai (tối đa 5 lần).",
], D + "W-AUTH-06-code-wrong.webp")
figma("W-AUTH-07", F, "Nhập mã: mã bị khóa (ERR-AUTH-403-02)", [
    "Sáu ô bị vô hiệu; nút \"Gửi mã mới\" nổi bật (tuân thủ giới hạn BR-AUTH-009). Mã đã khóa không dùng được dù nhập đúng.",
], D + "W-AUTH-07-code-locked.webp")
figma("W-AUTH-08", F, "Nhập mã: hết hạn hoặc đã dùng (ERR-AUTH-400-03)", [
    "Dùng chung cho mã quá 10 phút, mã đã dùng, và mã bị thay bằng mã mới hơn.",
], D + "W-AUTH-08-code-expired.webp")


# ---------------------------------------------------------------- shared pieces (same look as the Figma frames)
def title(s):
    return Text(s, size=30, weight=700, lh=1.2)


class CodeBoxes(Node):
    """Six one-digit cells, left aligned like the Figma frame (48 x 56, gap 8)."""

    def __init__(self, filled=""):
        self.filled = filled

    def h(self, w):
        return 56

    def svg(self, x, y, w):
        out = []
        for i in range(6):
            bx = x + i * 56
            out.append(rect(bx, y, 48, 56, C["bg_surface"], C["border_strong"], 1, 8))
            if i < len(self.filled):
                out.append(text(bx + 24, y + 15, self.filled[i], 22, 600, anchor="middle"))
        return "".join(out)


def provider_buttons():
    return Col(Button("Tiếp tục với Google", "secondary", full=True, h=48), Button("Tiếp tục với Facebook", "secondary", full=True, h=48), gap=16)


def login_card(alert=None, google_error=None):
    google = Col(Button("Tiếp tục với Google", "secondary", full=True, h=48), Note(f"(!) {google_error}") if google_error else None, gap=8)
    return Col(title("Đăng nhập"), Secondary("Đăng nhập hoặc tạo tài khoản mới.", 16), alert, google,
               Button("Tiếp tục với Facebook", "secondary", full=True, h=48), Muted("hoặc", 12),
               Button("Tiếp tục với email", "primary", full=True, h=48), gap=16)


def code_card(email="an@example.com", banner=None, extra=None, footer_links=True):
    return Col(banner, title("Nhập mã"), Secondary(f"Chúng tôi đã gửi mã 6 số tới {email}.\nMã có hiệu lực 10 phút (còn 09:58).", 16), CodeBoxes(),
               Button("Xác nhận", "primary", full=True, h=48), extra,
               Row(Muted("Không nhận được mã?", 12), Muted("Đổi email", 12), widths=["auto", "auto"], gap=12) if footer_links else None, gap=16)


# ---------------------------------------------------------------- sign-in screens
@screen("W-AUTH-09", F, "Nhập mã: không nhận được mã", [
    "\"Gửi mã mới\" bị vô hiệu trong 60 giây, đếm ngược; hết thời gian thì bật. Gửi mã mới làm mã cũ mất hiệu lực.",
    "Hướng dẫn và thời gian chờ giống hệt cho email có và không có tài khoản (BR-AUTH-007).",
])
def w09():
    help_ = Card(H3_("Không nhận được mã?"), Secondary("• Kiểm tra mục Spam hoặc Quảng cáo.\n• Mã có hiệu lực 10 phút.", 14),
                 Button("Gửi mã mới (sau 42 giây)", "disabled", full=True, h=44), Link("Đổi email"), pad=18, gap=12, fill=C["bg_subtle"], rx=12)
    return AuthShell(code_card(extra=help_, footer_links=False), min_h=760)


def H3_(s):
    return Text(s, size=16, weight=600)


@screen("W-AUTH-10", F, "Đăng nhập: lỗi nhà cung cấp hoặc phiên chờ hết hạn (ERR-AUTH-502-01, ERR-AUTH-400-04)", [
    "Hiện khi trang mở với `?error=external` (hủy hoặc lỗi nhà cung cấp) hoặc khi phiên chờ Facebook hết hạn (400-04: \"Phiên đăng nhập bằng Facebook đã hết hạn. Vui lòng thử lại.\").",
    "Không có tài khoản nào được tạo.",
])
def w10():
    return AuthShell(login_card(alert=Alert("danger", "Không đăng nhập được bằng Facebook. Vui lòng thử lại.")), min_h=720)


@screen("W-AUTH-11", F, "Đăng nhập: Google chưa xác minh email (ERR-AUTH-409-02)", [
    "Hiện khi trang mở với `?error=google-unverified`. Thông báo nằm ngay dưới nút Google; không đăng nhập và không tạo tài khoản.",
])
def w11():
    return AuthShell(login_card(google_error="Email này chưa được Google xác minh. Hãy dùng \"Tiếp tục với email\"."), min_h=720)


@screen("W-AUTH-12", F, "Facebook: nhập email (`/auth/facebook-email`)", [
    "Chỉ mở khi cookie chờ Facebook còn hạn (10 phút); hết hạn thì hiện W-AUTH-10 (ERR-AUTH-400-04).",
    "Email sai định dạng hiện lỗi dưới ô như W-AUTH-03.",
])
def w12():
    body = Col(title("Nhập email để tiếp tục"), Secondary("Facebook không chia sẻ email của bạn. Chúng tôi sẽ gửi mã xác nhận tới email này.", 16),
               Field("Email", "", req=True, placeholder="an@example.com"), Button("Gửi mã", "primary", full=True, h=48),
               Link("Hủy và quay lại đăng nhập"), gap=16)
    return AuthShell(body, min_h=640)


@screen("W-AUTH-13", F, "Nhập mã sau Facebook: tài khoản mới", [
    "Dòng thông báo (info) ở đầu màn hình Nhập mã khi luồng đến từ Facebook và email chưa có tài khoản.",
    "Tài khoản chỉ được tạo sau khi nhập đúng mã (BR-AUTH-005).",
])
def w13():
    return AuthShell(code_card(email="chi@example.com", banner=Alert("info", "Nhập mã để hoàn tất đăng ký.")), min_h=720)


@screen("W-AUTH-14", F, "Nhập mã sau Facebook: liên kết vào tài khoản đã có (ERR-AUTH-409-02)", [
    "Không tạo tài khoản mới và không liên kết trước khi có mã đúng.",
    "Facebook đã thuộc tài khoản khác thì hiện lỗi ERR-AUTH-409-01 sau khi nhập mã.",
])
def w14():
    return AuthShell(code_card(email="chi@example.com", banner=Alert("info", "Email này đã có tài khoản Lingozi. Nhập mã để xác nhận và liên kết Facebook vào tài khoản đó.")), min_h=760)


# ---------------------------------------------------------------- account settings (US-AUTH-06, 08, 09)
def method_row(name, status):
    return Row(Text(name, size=15), status, widths=[1, "auto"], align="center")


def settings_body(facebook="button", loading=False, signing_out=False, error=False):
    if error:
        return Col(Header("Cài đặt tài khoản"), Alert("danger", "Không tải được thông tin tài khoản.", action=Button("Thử lại", "secondary")), gap=20)
    if loading:
        return Col(Header("Cài đặt tài khoản"), Card(Skeleton(18, 0.3), Skeleton(16, 0.6), pad=24, gap=14), Card(Skeleton(18, 0.4), Skeleton(16), Skeleton(16), Skeleton(16), pad=24, gap=14), gap=20)
    fb = Badge("Đã liên kết", "success") if facebook == "linked" else Button("Liên kết Facebook", "secondary")
    return Col(
        Header("Cài đặt tài khoản"),
        Card(method_row("Email", Row(Text("an@example.com", size=15), Badge("Đã xác minh", "success"), widths=["auto", "auto"], gap=10, align="center")),
             title="Thông tin", pad=24, gap=14),
        Card(method_row("Email (mã đăng nhập)", Badge("Luôn có", "neutral")), Divider(), method_row("Google", Badge("Đã liên kết", "success")), Divider(),
             method_row("Facebook", fb), title="Phương thức đăng nhập", pad=24, gap=14),
        Button("Đang đăng xuất", "loading") if signing_out else Button("Đăng xuất", "secondary"), gap=20)


def settings_page(body, **k):
    return AppShell(None, Pad(body, r=120), settings_active=True, **k)


@screen("W-AUTH-15", F, "Cài đặt tài khoản: mặc định (`/settings/account`)", [
    "Nằm trong khung ứng dụng có menu bên. Phương thức đã liên kết hiện \"Đã liên kết\" thay cho nút; chưa liên kết thì hiện nút \"Liên kết ...\".",
    "Không có mục đổi hoặc đặt mật khẩu. Nút \"Đăng xuất\": đang xử lý thì có spinner và giữ nguyên chiều rộng (xem W-AUTH-23).",
])
def w15():
    return settings_page(settings_body())


@screen("W-AUTH-16", F, "Cài đặt tài khoản: đang tải", [
    "`Skeleton` cho các khối thông tin; trang có `aria-busy=\"true\"`.",
])
def w16():
    return settings_page(settings_body(loading=True))


@screen("W-AUTH-17", F, "Cài đặt tài khoản: đã liên kết Facebook (thông báo thành công)", [
    "Hiện khi trang mở với `?linked=facebook`; `Toast` có `role=\"status\"`. Cả Google và Facebook đều hiện \"Đã liên kết\", không còn nút liên kết.",
])
def w17():
    return settings_page(settings_body(facebook="linked"), toast=Toast("Đã liên kết Facebook."))


@screen("W-AUTH-18", F, "Cài đặt tài khoản: tài khoản ngoài đã thuộc người khác (ERR-AUTH-409-01)", [
    "Hiện khi trang mở với `?error=409-01`; không liên kết. Người dùng ở lại Cài đặt tài khoản.",
])
def w18():
    return settings_page(settings_body(), banner=Alert("danger", "Tài khoản Facebook này đã liên kết với một tài khoản Lingozi khác."))


@screen("W-AUTH-19", F, "Cài đặt tài khoản: lỗi tải", [
    "Hiện khi `/api/auth/me` lỗi (không phải 401). 401 thì chuyển tới đăng nhập.",
])
def w19():
    return settings_page(settings_body(error=True))


@screen("W-AUTH-23", F, "Cài đặt tài khoản: đang đăng xuất", [
    "Sau khi xong, chuyển tới W-AUTH-01. Đăng xuất luôn thành công, không hiện lỗi (kể cả khi phiên đã hết hạn).",
])
def w23():
    return settings_page(settings_body(signing_out=True))


# ---------------------------------------------------------------- legal pages (US-AUTH-10) and session error (US-AUTH-09)
def legal_page(heading, sections):
    body = Col(title(heading), Alert("info", "Bản nháp chờ duyệt."),
               *[Col(Text(h, size=18, weight=600), Skeleton(12), Skeleton(12, 0.9), Skeleton(12, 0.6), gap=8) for h in sections],
               Link("← Về trang đăng nhập"), gap=20)
    return AuthShell(body, wide=720, footer=True, min_h=800)


@screen("W-AUTH-20", F, "Chính sách quyền riêng tư (`/privacy`)", [
    "Trang công khai, không cần đăng nhập; văn bản một cột, rộng tối đa 72 ký tự.",
    "Khi nội dung chưa được chủ dự án duyệt, đầu trang có thông báo \"Bản nháp chờ duyệt\".",
])
def w20():
    return legal_page("Chính sách quyền riêng tư", ["Dữ liệu chúng tôi thu thập", "Cách chúng tôi dùng dữ liệu", "Quyền của bạn"])


@screen("W-AUTH-21", F, "Hướng dẫn xóa dữ liệu (`/data-deletion`)", [
    "Nêu đủ bốn nội dung: email nhận yêu cầu, thông tin cần gửi, thời hạn tối đa 30 ngày (`Q-12`), dữ liệu nào bị xóa.",
    "Địa chỉ nhận yêu cầu là biến cấu hình, chưa có giá trị thật; nội dung do chủ dự án duyệt.",
])
def w21():
    return legal_page("Hướng dẫn xóa dữ liệu", ["Cách gửi yêu cầu", "Thông tin cần gửi", "Thời hạn xử lý", "Dữ liệu bị xóa"])


@screen("W-AUTH-22", F, "Thông báo lỗi phiên làm việc (ERR-AUTH-400-05)", [
    "Hiện trên mọi form khi request thay đổi dữ liệu thiếu hoặc sai token antiforgery.",
    "Giao diện lấy lại token và cho thử lại một lần; không mất dữ liệu đã nhập (form giữ nguyên nội dung).",
])
def w22():
    from . import library as lib
    form = lib.vocab_form(term="give up", meaning="từ bỏ", pos="Động từ")
    return lib.form_page("vocab", "Thêm từ vựng", "Từ vựng", form,
                         banner=Alert("danger", "Phiên làm việc không hợp lệ. Vui lòng tải lại trang.", action=Button("Tải lại", "secondary")))
