# -*- coding: utf-8 -*-
"""FEAT-02 Mục kiến thức: wireframes of the two separate libraries (Từ vựng, Ngữ pháp)."""
from __future__ import annotations

from wf import (C, Alert, AppShell, Badge, Button, Card, Center, Chip, Chips, Code, Col, Dialog, Disc, Divider, Field,
                Fragment, H2, H3, Header, Link, Muted, Note, Pad, Pagination, Row, Secondary, Skeleton, Spacer, Text,
                Toast)
from . import screen

F = "knowledge-items"
POS = ["Danh từ", "Động từ", "Tính từ", "Trạng từ", "Giới từ", "Liên từ", "Thán từ", "Cụm từ", "Khác"]
FORM_PAD = 168  # content is 888 wide; forms are at most 720


# ---------------------------------------------------------------- building blocks
def vocab_card(term, ipa, pos, meaning, date):
    head = Row(H3(term), Badge(pos, "accent") if pos else None, widths=[1, "auto"], align="center")
    return Card(head, Muted(ipa, 13) if ipa else None, Secondary(meaning, 14, maxw=300), Muted(date, 12), pad=20, gap=8)


def grammar_card(name, formula, meaning, date):
    return Card(H3(name), Code(formula, 13), Secondary(meaning, 14) if meaning else None, Muted(date, 12), pad=20, gap=10)


VOCAB = [
    ("give up", "/ɡɪv ʌp/", "Động từ", "từ bỏ; ngừng cố gắng làm việc gì đó", "08/11/2026"),
    ("break the ice", "", "Cụm từ", "phá vỡ sự ngại ngùng ban đầu khi mới gặp nhau", "07/11/2026"),
    ("water", "/ˈwɔːtə/", "Danh từ", "nước", "06/11/2026"),
    ("although", "/ɔːlˈðəʊ/", "Liên từ", "mặc dù, dù cho", "05/11/2026"),
    ("look forward to", "", "Cụm từ", "mong đợi điều gì sắp xảy ra", "04/11/2026"),
    ("reliable", "/rɪˈlaɪəbl/", "Tính từ", "đáng tin cậy", "03/11/2026"),
]
GRAMMAR = [
    ("Present perfect", "have/has + V3", "Hành động đã xảy ra, còn liên quan đến hiện tại", "08/11/2026"),
    ("Used to V", "S + used to + V", "Thói quen hoặc trạng thái trong quá khứ", "07/11/2026"),
    ("Second conditional", "If + S + V2, S + would + V", "Giả định không có thật ở hiện tại", "06/11/2026"),
    ("Passive voice", "be + V3", "", "05/11/2026"),
    ("Past perfect", "had + V3", "Hành động xảy ra trước một mốc trong quá khứ", "04/11/2026"),
    ("Relative clause", "N + who/which/that + V", "Mệnh đề bổ nghĩa cho danh từ", "03/11/2026"),
]


def grid(cards):
    rows = [Row(*cards[i:i + 2], stretch=True) for i in range(0, len(cards), 2)]
    return Col(*rows, gap=16)


def vocab_list(items=VOCAB, count="25 từ", page=1, pages=2):
    return Col(Header("Từ vựng", count=count, actions=[Button("+ Thêm từ vựng", "primary")]),
               grid([vocab_card(*i) for i in items]), Pagination(page, pages), gap=20)


def grammar_list(items=GRAMMAR, count="12 mục", page=1, pages=1):
    return Col(Header("Ngữ pháp", count=count, actions=[Button("+ Thêm ngữ pháp", "primary")]),
               grid([grammar_card(*i) for i in items]), Pagination(page, pages), gap=20)


def examples(items=(), maximum=20, add="secondary", note=None, tone="danger", counter=None):
    head = Row(H3("Ví dụ"), Muted(counter or f"{len(items)}/{maximum}"), Button("+ Thêm ví dụ", add), widths=[1, "auto", "auto"], align="center")
    rows = [Card(Row(Field("Câu ví dụ", a), Field("Nghĩa tiếng Việt", b), Button("✕", "ghost", w=36), widths=[1, 1, "auto"], align="bottom"),
                 pad=14, gap=8, fill=C["bg_subtle"]) for a, b in items]
    body = [head] + (rows or [Muted("Chưa có ví dụ. Không bắt buộc.")])
    if note:
        body.append(Note(note, tone))
    return Col(*body, gap=10)


def buttons(primary="Lưu", kind="primary"):
    return Row(Button("Hủy", "secondary"), Button(primary, kind), right=True, widths=["auto", "auto"], gap=12)


def vocab_form(term="", ipa="", meaning="", pos="", examples_=(), note_="", errors=None, chips=None, primary="Lưu", pkind="primary",
               ex_note=None, ex_add="secondary", ex_counter=None, ipa_tag=None, ipa_help=None):
    e = errors or {}
    ex = examples(examples_, add=ex_add, note=ex_note, counter=ex_counter)
    return Card(
        Field("Từ", term, req=True, error=e.get("term"), placeholder="Ví dụ: give up"),
        Field("Phiên âm", ipa, placeholder="Tự điền từ từ điển (Anh-Anh), bạn có thể sửa", tag=ipa_tag, help=ipa_help),
        Field("Nghĩa", meaning, req=True, kind="area", rows=2, error=e.get("meaning"), placeholder="Nhập nghĩa của từ"),
        Chips(*chips) if chips else None,
        Field("Loại từ", pos or "Chọn loại từ", kind="select"),
        ex, Field("Ghi chú", note_, kind="area", rows=2, placeholder="Cách dùng, lưu ý cá nhân"),
        Divider(), buttons(primary, pkind), pad=28, gap=18)


def grammar_form(name="", formula="", meaning="", examples_=(), note_="", errors=None, primary="Lưu", pkind="primary"):
    e = errors or {}
    return Card(
        Field("Tên cấu trúc", name, req=True, error=e.get("term"), placeholder="Ví dụ: Present perfect"),
        Field("Công thức", formula, req=True, mono=True, error=e.get("formula"), placeholder="Ví dụ: S + have/has + V3"),
        Field("Ý nghĩa", meaning, kind="area", rows=2, placeholder="Cấu trúc này dùng khi nào (không bắt buộc)"),
        examples(examples_), Field("Ghi chú", note_, kind="area", rows=2, placeholder="Cách dùng, lưu ý cá nhân"),
        Divider(), buttons(primary, pkind), pad=28, gap=18)


def page(active, body, **k):
    return AppShell(active, body, **k)


def form_page(active, title, back, form, banner=None, **k):
    return page(active, Pad(Col(Header(title, back=back), form, gap=18), r=FORM_PAD), banner=banner, **k)


def section(label, *content):
    return Col(Text(label, size=13, weight=600, color=C["text_muted"]), *content, gap=6)


def example_rows(items):
    out = []
    for i, (a, b) in enumerate(items, 1):
        out.append(Col(Text(f"{i}. {a}", size=15), Muted(b, 13) if b else None, gap=2))
    return Col(*out, gap=10)


def vocab_detail(toast=None, overlay=None):
    body = Col(
        Header("give up", back="Từ vựng", actions=[Button("Sửa", "secondary"), Button("Xóa", "danger", icon="⚠")]),
        Card(Row(Badge("Động từ", "accent"), Text("/ɡɪv ʌp/", size=15), Muted("Phiên âm từ từ điển (Anh-Anh)"),
                 widths=["auto", "auto", "auto"], align="center", gap=12),
             Divider(), section("Nghĩa", Text("từ bỏ; ngừng cố gắng làm việc gì đó", size=17)),
             section("Ví dụ", example_rows([("Don't give up.", "Đừng bỏ cuộc."), ("He never gives up.", "Anh ấy không bao giờ bỏ cuộc.")])),
             section("Ghi chú", Text("Thường dùng trong văn nói.", size=15)),
             Divider(), Muted("Tạo 08/11/2026 14:00 · Sửa 08/11/2026 14:05"), pad=28, gap=18), gap=18)
    return page("vocab", Pad(body, r=FORM_PAD), toast=toast, overlay=overlay)


# ---------------------------------------------------------------- list screens (US-LIB-03)
@screen("W-LIB-01", F, "Thư viện Từ vựng: có dữ liệu (`/library/vocabulary`)", [
    "Thư viện Từ vựng chỉ có từ vựng; ngữ pháp nằm ở thư viện riêng (menu Ngữ pháp).",
    "Mới nhất trước, 20 mục mỗi trang (tối đa 50); lưới 2 cột ở ≥ 1280 px, 1 cột ở < 1024 px.",
    "Mỗi thẻ là một liên kết tới trang chi tiết: từ (h3), loại từ (`Badge`), phiên âm nếu có, nghĩa cắt ở 2 dòng, ngày tạo trong thẻ `<time>`.",
    "Nút \"+ Thêm từ vựng\" ở đầu trang (phím tắt `N`) mở `/library/vocabulary/new`. Chưa có ô tìm kiếm (Vòng 2).",
])
def w01():
    return page("vocab", vocab_list())


@screen("W-LIB-02", F, "Thư viện Từ vựng: trống", [
    "`EmptyState` có nút hành động chính \"+ Thêm từ vựng đầu tiên\"; hình trang trí `aria-hidden`, ẩn khi giảm trang trí.",
    "Chỉ hiện khi chưa có từ vựng nào; việc có hay không ngữ pháp không ảnh hưởng.",
])
def w02():
    empty = Card(Center(Disc("Aa")), H2("Thư viện Từ vựng đang trống", align="center"),
                 Secondary("Lưu từ hoặc cụm từ đầu tiên bạn gặp hôm nay.", align="center"),
                 Center(Button("+ Thêm từ vựng đầu tiên", "primary")), pad=48, gap=16)
    return page("vocab", Col(Header("Từ vựng", count="0 từ"), empty, gap=24))


@screen("W-LIB-03", F, "Thư viện Ngữ pháp: có dữ liệu (`/library/grammar`)", [
    "Thư viện Ngữ pháp chỉ có ngữ pháp, tách khỏi thư viện Từ vựng.",
    "Mới nhất trước, 20 mục mỗi trang; mỗi thẻ hiện tên cấu trúc (h3), công thức trong khối mã, ý nghĩa cắt ở 2 dòng (nếu có), ngày tạo.",
    "Nút \"+ Thêm ngữ pháp\" mở `/library/grammar/new`.",
])
def w03():
    return page("grammar", grammar_list())


@screen("W-LIB-04", F, "Thư viện Ngữ pháp: trống", [
    "`EmptyState` có nút hành động chính \"+ Thêm ngữ pháp đầu tiên\".",
])
def w04():
    empty = Card(Center(Disc("Σ")), H2("Thư viện Ngữ pháp đang trống", align="center"),
                 Secondary("Lưu cấu trúc ngữ pháp đầu tiên bạn muốn nhớ.", align="center"),
                 Center(Button("+ Thêm ngữ pháp đầu tiên", "primary")), pad=48, gap=16)
    return page("grammar", Col(Header("Ngữ pháp", count="0 mục"), empty, gap=24))


@screen("W-LIB-05", F, "Danh sách: lỗi tải", [
    "`InlineAlert` (danger) kèm icon và chữ; \"Thử lại\" gọi lại API. Thư viện Ngữ pháp có màn hình giống hệt, chỉ đổi tiêu đề.",
    "Không hiện dữ liệu cũ hay dữ liệu của người khác.",
])
def w05():
    return page("vocab", Col(Header("Từ vựng"), Alert("danger", "Không tải được thư viện.", action=Button("Thử lại", "secondary")), gap=20))


@screen("W-LIB-06", F, "Danh sách: trang ngoài phạm vi", [
    "Hiện khi `page` vượt tổng số trang; `pageSize` lớn hơn 50 được giới hạn về 50 và không hiện thông báo riêng.",
    "Thư viện Ngữ pháp có màn hình giống hệt, chỉ đổi tiêu đề.",
])
def w06():
    empty = Card(H3("Trang này không có mục nào.", align="center"), Center(Link("Về trang 1")), pad=40, gap=12)
    return page("vocab", Col(Header("Từ vựng", count="25 từ"), empty, gap=20))


@screen("W-LIB-07", F, "Danh sách: đang tải", [
    "6 `Skeleton` dạng thẻ; danh sách có `aria-busy=\"true\"`. Thư viện Ngữ pháp giống hệt.",
])
def w07():
    sk = lambda: Card(Skeleton(18, 0.5), Skeleton(14, 0.3), Skeleton(14), Skeleton(14, 0.7), pad=20, gap=10)  # noqa: E731
    return page("vocab", Col(Header("Từ vựng"), grid([sk() for _ in range(6)]), gap=20))


# ---------------------------------------------------------------- create (US-LIB-01)
@screen("W-LIB-08", F, "Thêm từ vựng: form mặc định (`/library/vocabulary/new`)", [
    "Mở từ nút \"+ Thêm từ vựng\" của thư viện Từ vựng; không có bước chọn loại (chọn thư viện đã là chọn loại).",
    "Thứ tự trường: Từ\\*, Phiên âm, Nghĩa\\*, Loại từ, Ví dụ, Ghi chú. Dấu \\* là bắt buộc (Từ, Nghĩa).",
    "Phiên âm tự điền từ nguồn từ điển (Anh-Anh) khi rời ô \"Từ\"; người dùng sửa được. Loại từ là danh sách chọn: Danh từ, Động từ, Tính từ, Trạng từ, Giới từ, Liên từ, Thán từ, Cụm từ, Khác; để trống được.",
    "Đang lưu: nút \"Lưu\" có spinner, các ô bị khóa, \"Hủy\" vẫn dùng được.",
    "Mỗi lần mở form sinh một `clientRequestId`; bấm Lưu hai lần hoặc gửi lại chỉ tạo một mục.",
])
def w08():
    return form_page("vocab", "Thêm từ vựng", "Từ vựng", vocab_form())


@screen("W-LIB-09", F, "Thêm ngữ pháp: form mặc định (`/library/grammar/new`)", [
    "Mở từ nút \"+ Thêm ngữ pháp\" của thư viện Ngữ pháp.",
    "Thứ tự trường: Tên cấu trúc\\*, Công thức\\*, Ý nghĩa, Ví dụ, Ghi chú. Bắt buộc: Tên cấu trúc và Công thức.",
    "Không có ô phiên âm và không có ô loại từ. Ý nghĩa chỉ gồm khoảng trắng được lưu là trống.",
    "Ô \"Công thức\" dùng phông đơn cách (monospace) để thẳng hàng các ký hiệu.",
])
def w09():
    return form_page("grammar", "Thêm ngữ pháp", "Ngữ pháp", grammar_form())


@screen("W-LIB-10", F, "Thêm từ vựng: lỗi nhập liệu (ERR-LIB-400-01)", [
    "Lỗi dưới từng ô; tóm tắt phía trên có liên kết tới ô lỗi; focus vào ô lỗi đầu tiên.",
    "Trống hoặc chỉ có khoảng trắng: \"Vui lòng nhập từ.\" và \"Vui lòng nhập nghĩa.\". Độ dài: \"Từ\" tối đa 1000 ký tự; \"Nghĩa\" tối đa 2000; \"Ghi chú\" tối đa 4000.",
    "Tối đa 20 ví dụ: đủ 20 thì nút \"+ Thêm ví dụ\" bị vô hiệu kèm dòng \"Tối đa 20 ví dụ.\". Đếm ký tự hiện dưới ô khi còn dưới 10% giới hạn.",
])
def w10():
    form = vocab_form(term="", meaning="x" * 24 + " … (2001 ký tự)", errors={"term": "Vui lòng nhập từ.", "meaning": "Tối đa 2000 ký tự."},
                      examples_=[("… (ví dụ thứ 20)", "")], ex_counter="20/20", ex_add="disabled", ex_note="Tối đa 20 ví dụ.")
    return form_page("vocab", "Thêm từ vựng", "Từ vựng", form,
                     banner=Alert("danger", "Vui lòng kiểm tra lại thông tin đã nhập: Từ, Nghĩa."))


@screen("W-LIB-11", F, "Thêm ngữ pháp: lỗi nhập liệu (ERR-LIB-400-01)", [
    "\"Vui lòng nhập tên cấu trúc.\" và \"Vui lòng nhập công thức.\" khi để trống hoặc chỉ có khoảng trắng; \"Tên cấu trúc\" và \"Công thức\" tối đa 1000 ký tự, \"Ý nghĩa\" tối đa 2000.",
    "Tóm tắt phía trên có liên kết tới ô lỗi; focus vào ô lỗi đầu tiên.",
])
def w11():
    form = grammar_form(errors={"term": "Vui lòng nhập tên cấu trúc.", "formula": "Vui lòng nhập công thức."})
    return form_page("grammar", "Thêm ngữ pháp", "Ngữ pháp", form,
                     banner=Alert("danger", "Vui lòng kiểm tra lại thông tin đã nhập: Tên cấu trúc, Công thức."))


@screen("W-LIB-12", F, "Thêm: đã đạt giới hạn số mục (ERR-LIB-422-01)", [
    "`InlineAlert` (danger) trên form; mục không được lưu. Giới hạn 10.000 mục tính chung cho cả hai thư viện.",
    "Lỗi mạng dùng cùng kiểu thông báo \"Mất kết nối\" với nút \"Thử lại\"; thử lại gửi cùng `clientRequestId` nên không tạo trùng.",
])
def w12():
    form = vocab_form(term="give up", meaning="từ bỏ", pos="Động từ", ipa="/ɡɪv ʌp/")
    return form_page("vocab", "Thêm từ vựng", "Từ vựng", form, banner=Alert("danger", "Bạn đã đạt giới hạn 10.000 mục."))


# ---------------------------------------------------------------- similar items (US-LIB-02)
def similar_row(term, meaning, date):
    return Card(Row(Col(H3(term), Muted(f"{meaning} · tạo {date}", 13), gap=2), Link("Mở"), widths=[1, "auto"], align="center"),
                pad=14, gap=4, fill=C["bg_subtle"])


@screen("W-LIB-13", F, "Hộp thoại mục tương tự", [
    "`role=\"dialog\"`, `aria-modal`; focus vào tiêu đề khi mở; Esc tương đương đóng hộp thoại và trả focus về nút Lưu (mục chưa được lưu).",
    "Chỉ tìm trong cùng thư viện (từ vựng so với từ vựng, ngữ pháp so với ngữ pháp). Nút \"Mở mục cũ để bổ sung\" mở mục mới nhất; không bao giờ tự gộp.",
])
def w13():
    form = vocab_form(term="  give   UP ", meaning="bỏ cuộc", pos="Động từ")
    dlg = Dialog("Bạn đã lưu nội dung tương tự", Secondary("Trong Từ vựng đã có mục này. Bạn muốn làm gì?"),
                 similar_row("Give up", "từ bỏ", "08/11/2026"),
                 actions=[Button("Vẫn tạo mục mới", "secondary"), Button("Mở mục cũ để bổ sung", "primary")], w=560)
    return page("vocab", Pad(Col(Header("Thêm từ vựng", back="Từ vựng"), form, gap=18), r=FORM_PAD), overlay=dlg)


@screen("W-LIB-14", F, "Hộp thoại mục tương tự: nhiều mục", [
    "Liệt kê tối đa 5 mục mới nhất; nhiều hơn thì hiện dòng \"và N mục khác\" (ví dụ \"và 2 mục khác\" khi có 7 mục).",
    "Nút \"Mở\" trên từng dòng mở đúng mục đó.",
])
def w14():
    form = vocab_form(term="give up", meaning="bỏ cuộc", pos="Động từ")
    rows = [similar_row("Give up", "từ bỏ", "08/11/2026"), similar_row("give up", "ngừng làm", "05/11/2026"),
            similar_row("Give up", "bỏ", "01/11/2026"), similar_row("GIVE UP", "nhượng bộ", "28/10/2026"),
            similar_row("give  up", "từ bỏ", "20/10/2026")]
    dlg = Dialog("Bạn đã lưu nội dung tương tự", Secondary("Trong Từ vựng đã có 7 mục này:"), *rows, Muted("và 2 mục khác"),
                 actions=[Button("Vẫn tạo mục mới", "secondary"), Button("Mở mục cũ để bổ sung", "primary")], w=560, gap=8)
    return page("vocab", Pad(Col(Header("Thêm từ vựng", back="Từ vựng"), form, gap=18), r=FORM_PAD), overlay=dlg, min_h=980)


@screen("W-LIB-15", F, "Sửa mục cũ kèm nội dung vừa nhập (từ hộp thoại mục tương tự)", [
    "Panel \"Nội dung bạn vừa nhập\" chỉ để người dùng tự chép sang mục cũ; không tự gộp vào mục cũ.",
    "Dữ liệu panel chỉ nằm trong bộ nhớ của trang; rời trang thì mất và có hộp thoại xác nhận.",
])
def w15():
    side = Card(H3("Nội dung bạn vừa nhập"), Muted("Chỉ đọc, để bạn tự chép sang."), Divider(),
                section("Nghĩa", Text("bỏ cuộc", size=15)), section("Ví dụ", Text("1. Never give up.", size=15)),
                Button("Đóng", "ghost"), pad=20, gap=12, dashed=True)
    form = vocab_form(term="give up", ipa="/ɡɪv ʌp/", meaning="từ bỏ", pos="Động từ", primary="Lưu thay đổi")
    return page("vocab", Col(Header("Sửa từ vựng", back="Từ vựng"), Row(form, side, widths=[2, 1], gap=20), gap=18))


# ---------------------------------------------------------------- detail (US-LIB-04)
@screen("W-LIB-16", F, "Chi tiết từ vựng: đầy đủ (`/library/vocabulary/{id}`)", [
    "Từ cỡ `text.term`; hàng thông tin: loại từ (nếu có), phiên âm (nếu có, kèm nguồn khi do hệ thống điền). Các khối: Nghĩa, Ví dụ theo thứ tự, Ghi chú; ngày tạo và ngày sửa ở cuối.",
    "Nút \"Xóa\" kiểu viền, có icon cảnh báo, không dùng nền đặc giống nút chính.",
    "Toast \"Đã lưu\" (`role=\"status\"`) chỉ hiện ngay sau khi lưu; sau khi sửa thì toast là \"Đã lưu thay đổi\".",
])
def w16():
    return vocab_detail(toast=Toast("Đã lưu"))


@screen("W-LIB-17", F, "Chi tiết ngữ pháp: đầy đủ (`/library/grammar/{id}`)", [
    "Tên cấu trúc cỡ `text.term`; các khối: Công thức (khối mã), Ý nghĩa (nếu có), Ví dụ, Ghi chú; không có phiên âm và loại từ.",
    "Nút \"Sửa\" mở `/library/grammar/{id}/edit`; \"Xóa\" như thư viện Từ vựng.",
])
def w17():
    body = Col(
        Header("Present perfect", back="Ngữ pháp", actions=[Button("Sửa", "secondary"), Button("Xóa", "danger", icon="⚠")]),
        Card(section("Công thức", Code("S + have/has + V3", 16)),
             section("Ý nghĩa", Text("Diễn tả hành động đã xảy ra nhưng còn liên quan đến hiện tại.", size=16)),
             section("Ví dụ", example_rows([("I have lived here for five years.", "Tôi đã sống ở đây năm năm."), ("She has just left.", "Cô ấy vừa rời đi.")])),
             section("Ghi chú", Text("Thường đi với just, already, yet, for, since.", size=15)),
             Divider(), Muted("Tạo 08/11/2026 14:00 · Sửa 08/11/2026 14:05"), pad=28, gap=18), gap=18)
    return page("grammar", Pad(body, r=FORM_PAD))


@screen("W-LIB-18", F, "Chi tiết: tối thiểu (không có trường tùy chọn)", [
    "Mục từ vựng chỉ có từ và nghĩa: không hiện khối Ví dụ, Ghi chú, phiên âm, loại từ.",
    "Khối không có dữ liệu không hiển thị và không để khoảng trống. Mục ngữ pháp tối thiểu chỉ có tên cấu trúc và công thức.",
])
def w18():
    body = Col(Header("although", back="Từ vựng", actions=[Button("Sửa", "secondary"), Button("Xóa", "danger", icon="⚠")]),
               Card(section("Nghĩa", Text("mặc dù, dù cho", size=17)), Divider(), Muted("Tạo 05/11/2026 09:12 · Sửa 05/11/2026 09:12"), pad=28, gap=18),
               gap=18)
    return page("vocab", Pad(body, r=FORM_PAD))


@screen("W-LIB-19", F, "Chi tiết: không tìm thấy (ERR-LIB-404-01)", [
    "Cùng một màn hình cho mục không tồn tại, mục của người khác và mục thuộc thư viện khác loại (ví dụ mở ngữ pháp ở `/library/vocabulary/{id}`); không để lộ sự tồn tại.",
    "Nút về đúng thư viện đang mở (\"Về Từ vựng\" hoặc \"Về Ngữ pháp\"). Body lỗi giống hệt giữa các trường hợp.",
])
def w19():
    card = Card(Center(Disc("?", tone="warning")), H2("Không tìm thấy mục này", align="center"),
                Secondary("Mục không tồn tại hoặc không thuộc thư viện của bạn.", align="center"),
                Center(Button("‹ Về Từ vựng", "primary")), pad=48, gap=16)
    return page("vocab", Pad(Col(Header("Từ vựng"), card, gap=24), r=0))


@screen("W-LIB-20", F, "Chi tiết: đang tải", [
    "`Skeleton` cho tiêu đề, nghĩa hoặc công thức và ví dụ; trang có `aria-busy=\"true\"`.",
])
def w20():
    body = Col(Header("", back="Từ vựng"),
               Card(Skeleton(26, 0.35), Skeleton(14, 0.5), Divider(), Skeleton(16), Skeleton(16, 0.8), Skeleton(16, 0.9), pad=28, gap=14), gap=18)
    return page("vocab", Pad(body, r=FORM_PAD))


# ---------------------------------------------------------------- edit (US-LIB-05)
@screen("W-LIB-21", F, "Sửa từ vựng: form mặc định (`/library/vocabulary/{id}/edit`)", [
    "Điền sẵn dữ liệu hiện tại; thứ tự trường giống form thêm. Thêm và xóa ví dụ bằng bàn phím; xóa ví dụ thì focus sang ví dụ kế bên.",
    "Có thay đổi chưa lưu mà rời trang thì trình duyệt hiện hộp thoại xác nhận của chính nó (`beforeunload`).",
    "Đang lưu: nút \"Lưu thay đổi\" có spinner. Các quy tắc bắt buộc giống form thêm (Từ, Nghĩa).",
])
def w21():
    form = vocab_form(term="give up", ipa="/ɡɪv ʌp/", meaning="từ bỏ", pos="Động từ", examples_=[("Don't give up.", "Đừng bỏ cuộc.")],
                      note_="Thường dùng trong văn nói.", primary="Lưu thay đổi", ipa_tag="✓ Tự động từ điển (Anh-Anh)")
    return form_page("vocab", "Sửa từ vựng", "give up", form)


@screen("W-LIB-22", F, "Sửa ngữ pháp: form mặc định (`/library/grammar/{id}/edit`)", [
    "Điền sẵn dữ liệu hiện tại; thứ tự trường giống form thêm ngữ pháp. Bắt buộc: Tên cấu trúc và Công thức.",
    "Có thay đổi chưa lưu mà rời trang thì trình duyệt hỏi xác nhận trước khi rời.",
])
def w22():
    form = grammar_form(name="Present perfect", formula="S + have/has + V3", meaning="Hành động đã xảy ra, còn liên quan đến hiện tại",
                        examples_=[("I have lived here for five years.", "Tôi đã sống ở đây năm năm.")], primary="Lưu thay đổi")
    return form_page("grammar", "Sửa ngữ pháp", "Present perfect", form)


@screen("W-LIB-23", F, "Sửa: xung đột khi sửa ở hai nơi (ERR-LIB-409-01)", [
    "Không ghi đè; nội dung đang nhập được giữ lại ở panel bên phải để người dùng tự chép lại.",
    "\"Tải bản mới nhất\" thay form bằng bản mới nhất từ máy chủ. Áp dụng giống nhau cho từ vựng và ngữ pháp.",
])
def w23():
    side = Card(H3("Bản bạn đang sửa (giữ lại)"), Divider(), section("Nghĩa", Text("bỏ cuộc", size=15)), section("Ghi chú", Text("Dùng khi nói chuyện thân mật.", size=15)),
                pad=20, gap=12, dashed=True)
    form = vocab_form(term="give up", ipa="/ɡɪv ʌp/", meaning="bỏ cuộc", pos="Động từ", primary="Lưu thay đổi")
    alert = Alert("warning", "Mục này vừa được sửa ở nơi khác.", action=Button("Tải bản mới nhất", "secondary"))
    return page("vocab", Col(Header("Sửa từ vựng", back="Từ vựng"), alert, Row(form, side, widths=[2, 1], gap=20), gap=18))


# ---------------------------------------------------------------- delete (US-LIB-06)
@screen("W-LIB-24", F, "Hộp thoại xác nhận xóa", [
    "Focus mặc định ở \"Hủy\"; Esc tương đương \"Hủy\" và trả focus về nút \"Xóa\".",
    "Nút \"Xóa\" kiểu viền, màu `status.danger`, có icon cảnh báo, phân biệt với nút chính. Xác nhận xong thì xóa cứng; không phục hồi được ở MVP.",
    "Hộp thoại giống hệt cho ngữ pháp, chỉ đổi tên mục trong câu hỏi.",
])
def w24():
    dlg = Dialog("Xóa \"give up\"?", Secondary("Hành động này không thể hoàn tác. Mục và các ví dụ của nó sẽ bị xóa."),
                 actions=[Button("Hủy", "secondary"), Button("Xóa", "danger", icon="⚠")], w=480)
    return vocab_detail(overlay=dlg)


@screen("W-LIB-25", F, "Thư viện sau khi xóa", [
    "Xóa thành công: về đúng thư viện của mục vừa xóa (Từ vựng hoặc Ngữ pháp) với toast \"Đã xóa\".",
])
def w25():
    return page("vocab", vocab_list(VOCAB[1:], count="24 từ"), toast=Toast("Đã xóa"))


@screen("W-LIB-26", F, "Thư viện: mục không còn tồn tại", [
    "Mục đã bị xóa ở nơi khác: hiện thông báo \"Mục này không còn tồn tại\" và về thư viện của loại đó; không hiện lỗi hệ thống.",
])
def w26():
    return page("vocab", vocab_list(VOCAB[1:], count="24 từ"), banner=Alert("info", "Mục này không còn tồn tại."))


# ---------------------------------------------------------------- IPA field states (US-LIB-08)
def ipa_fragment(ipa, tag=None, help=None, error=None):
    return Fragment(Card(Field("Từ", "water", req=True), Field("Phiên âm", ipa, placeholder="Ví dụ: /ˈwɔːtə/", tag=tag, help=help, error=error), pad=24, gap=16),
                    caption="Một phần của form Thêm từ vựng")


@screen("W-LIB-27", F, "Ô phiên âm: tự điền từ nguồn", [
    "Gọi nguồn khi rời ô \"Từ\" hoặc sau 500 ms không gõ; chỉ điền khi nguồn có phiên âm Anh-Anh (file audio `-uk`). Chỉ có ở form từ vựng.",
    "Hiện nhãn nguồn bằng chữ và ghi nguồn bắt buộc theo giấy phép; lưu không sửa gì thì `ipaSource` là `dictionary`.",
])
def w27():
    return ipa_fragment("/ˈwɔːtə/", tag="✓ Tự động từ điển (Anh-Anh)", help="Nguồn: Wiktionary, CC BY-SA 3.0")


@screen("W-LIB-28", F, "Ô phiên âm: người dùng sửa hoặc tự nhập", [
    "Sau khi sửa phiên âm do hệ thống điền, nhãn đổi thành \"Bạn đã chỉnh sửa\"; tự nhập thì nhãn \"Bạn đã nhập\". Lưu thì `ipaSource` là `user`.",
])
def w28():
    return ipa_fragment("/ˈwɔːtɚ/", tag="Bạn đã chỉnh sửa")


@screen("W-LIB-29", F, "Ô phiên âm: trống (chưa có phiên âm Anh-Anh)", [
    "Hiện khi nguồn không có phiên âm Anh-Anh được gắn nhãn; không điền phiên âm Anh-Mỹ hay không nhãn.",
    "Xóa hết phiên âm rồi lưu thì `ipa` và `ipaSource` là trống. Lưu vẫn được khi ô trống.",
])
def w29():
    return ipa_fragment("", help="Chưa có phiên âm Anh-Anh, bạn có thể tự nhập.")


@screen("W-LIB-30", F, "Ô phiên âm: nguồn lỗi hoặc quá 3 giây", [
    "Dòng thông báo màu `text.muted`, không đỏ; form vẫn dùng bình thường.",
])
def w30():
    return ipa_fragment("", help="Không lấy được phiên âm tự động.")


@screen("W-LIB-31", F, "Ô phiên âm: ký tự không hợp lệ (ERR-LIB-400-02)", [
    "Lỗi dưới ô; không lưu được cho tới khi sửa.",
])
def w31():
    return ipa_fragment("/ˈwɔːtə$/", error="Phiên âm chỉ được chứa ký tự IPA.")


# ---------------------------------------------------------------- meaning suggestions (US-LIB-09)
def meaning_fragment(value="", chips=None, error=None, example_menu=False):
    menu = Card(*(Col(Text(option.label, 14), Muted(option.sub or "", 12), gap=4)
                  for option in (chips or [])), pad=12, gap=14) if chips and not value else None
    return Fragment(Card(Field("Từ", "abandon", req=True),
                         Col(Field("Nghĩa", value, req=True, kind="area", rows=2, placeholder="Nhập nghĩa của từ"),
                             menu, gap=0),
                         Col(Field("Câu ví dụ", "", placeholder="Chọn hoặc nhập ví dụ"),
                             Card(Col(Text("We abandoned the old car", 14), Muted("Chúng tôi bỏ lại chiếc xe cũ", 12), gap=4),
                                  Col(Text("To abandon a hope", 14), Muted("Từ bỏ hy vọng", 12), gap=4), pad=12, gap=14), gap=0) if example_menu else None,
                         pad=24, gap=16), caption="Dropdown khi ô nghĩa hoặc ví dụ có focus (dữ liệu minh họa)")


@screen("W-LIB-32", F, "Gợi ý nghĩa: từ mục của bạn", [
    "Dropdown gợi ý xuất hiện khi focus ô nghĩa, có nhãn nguồn bằng chữ; ô \"Nghĩa\" vẫn trống cho tới khi chọn gợi ý. Vùng gợi ý có `aria-live=\"polite\"`.",
    "Chỉ gợi ý từ mục cùng loại của chính người dùng (ở form từ vựng thì từ thư viện Từ vựng).",
    "Form Ngữ pháp dùng cùng thành phần cho ô \"Ý nghĩa\": chỉ gợi ý từ mục ngữ pháp của chính người dùng, không có gợi ý từ điển.",
])
def w32():
    return meaning_fragment(chips=[Chip("từ bỏ", "Từ mục của bạn")])


@screen("W-LIB-33", F, "Gợi ý nghĩa: từ mục của bạn và từ điển", [
    "Tối đa 5 gợi ý; gợi ý của chính người dùng luôn hiện trước gợi ý từ điển.",
])
def w33():
    return meaning_fragment(chips=[Chip("từ bỏ", "Từ mục của bạn"), Chip("ngừng cố gắng", "Từ mục của bạn"), Chip("từ bỏ; bỏ lại phía sau", "Scandict")], example_menu=True)


@screen("W-LIB-34", F, "Gợi ý nghĩa: không có gợi ý", [
    "Không hiện dropdown và không có thông báo lỗi; ô \"Nghĩa\" vẫn trống để người dùng tự nhập (nghĩa của từ vựng là bắt buộc).",
    "Gợi ý của người dùng khác không bao giờ xuất hiện: người dùng chưa có mục nào thì không có gợi ý \"Từ mục của bạn\".",
])
def w34():
    return meaning_fragment()


@screen("W-LIB-35", F, "Gợi ý nghĩa: sau khi bấm một gợi ý", [
    "Chọn gợi ý mới điền vào ô \"Nghĩa\"; người dùng vẫn sửa được. Danh sách đóng sau khi chọn; ArrowUp/ArrowDown, Enter, Escape được hỗ trợ.",
])
def w35():
    return meaning_fragment(value="từ bỏ", chips=[Chip("từ bỏ", "Từ mục của bạn", active=True), Chip("to stop trying", "Từ từ điển")])
