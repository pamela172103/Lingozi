# -*- coding: utf-8 -*-
"""Low-fidelity SVG wireframe toolkit (stdlib only).

Wireframes are described as small trees of nodes (Col, Row, Card, Field, Button...) and rendered to SVG
that GitHub shows inline. Colours come from docs/architecture/design-tokens.json (default theme), so wireframes
share the design system. Screens live in tools/wireframes/screens/*.py; build.py writes the SVG files.
"""
from __future__ import annotations

import html
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
_TOKENS = json.loads((ROOT / "docs/architecture/design-tokens.json").read_text(encoding="utf-8"))["themes"]["default"]["color"]
C = {k.replace(".", "_"): v for k, v in _TOKENS.items()}

FONT = "'Be Vietnam Pro','Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif"
MONO = "'Cascadia Mono',Consolas,'SF Mono',Menlo,monospace"


def tint(hex_color: str, amount: float) -> str:
    """Mix a colour with white (amount 0 = original, 1 = white)."""
    h = hex_color.lstrip("#")
    r, g, b = (int(h[i:i + 2], 16) for i in (0, 2, 4))
    mix = lambda v: round(v + (255 - v) * amount)  # noqa: E731
    return "#{:02X}{:02X}{:02X}".format(mix(r), mix(g), mix(b))


TONES = {
    "danger": (C["status_danger"], tint(C["status_danger"], 0.92), tint(C["status_danger"], 0.6)),
    "warning": (C["status_warning"], tint(C["status_warning"], 0.92), tint(C["status_warning"], 0.6)),
    "success": (C["status_success"], tint(C["status_success"], 0.92), tint(C["status_success"], 0.6)),
    "info": (C["status_info"], tint(C["status_info"], 0.92), tint(C["status_info"], 0.6)),
}

# ---------------------------------------------------------------- text measuring
_NARROW = set("iljtfI.,:;|!'`()[]/ ")
_WIDE = set("mwMW@%")


def tw(s: str, size: float, weight: int = 400, mono: bool = False) -> float:
    """Approximate rendered width. Good enough for layout; fonts differ a little between machines."""
    if mono:
        return len(s) * size * 0.6
    total = 0.0
    for ch in s:
        if ch == " ":
            total += 0.28
        elif ch in _NARROW:
            total += 0.3
        elif ch in _WIDE:
            total += 0.86
        elif ch.isupper() or ch.isdigit():
            total += 0.64
        else:
            total += 0.54
    return total * size * (1.06 if weight >= 600 else 1.0)


def wrap(s: str, size: float, width: float, weight: int = 400, mono: bool = False) -> list[str]:
    lines: list[str] = []
    for para in s.split("\n"):
        cur = ""
        for word in para.split(" "):
            trial = word if not cur else cur + " " + word
            if cur and tw(trial, size, weight, mono) > width:
                lines.append(cur)
                cur = word
            else:
                cur = trial
        lines.append(cur)
    return lines


def esc(s: str) -> str:
    return html.escape(s, quote=True)


# ---------------------------------------------------------------- primitives
def rect(x, y, w, h, fill="none", stroke=None, sw=1, rx=0, extra="") -> str:
    st = f' stroke="{stroke}" stroke-width="{sw}"' if stroke else ""
    return f'<rect x="{x:.1f}" y="{y:.1f}" width="{w:.1f}" height="{h:.1f}" rx="{rx}" fill="{fill}"{st}{extra}/>'


def text(x, y, s, size=15, weight=400, fill=None, anchor="start", mono=False, italic=False, deco=None) -> str:
    fill = fill or C["text_primary"]
    fam = MONO if mono else FONT
    it = ' font-style="italic"' if italic else ""
    de = f' text-decoration="{deco}"' if deco else ""
    return (f'<text x="{x:.1f}" y="{y + size * 0.8:.1f}" font-family="{fam}" font-size="{size}" '
            f'font-weight="{weight}" fill="{fill}" text-anchor="{anchor}"{it}{de} xml:space="preserve">{esc(s)}</text>')


def line(x1, y1, x2, y2, stroke=None, sw=1, dash=None) -> str:
    d = f' stroke-dasharray="{dash}"' if dash else ""
    return f'<line x1="{x1:.1f}" y1="{y1:.1f}" x2="{x2:.1f}" y2="{y2:.1f}" stroke="{stroke or C["border_default"]}" stroke-width="{sw}"{d}/>'


# ---------------------------------------------------------------- node base
class Node:
    def h(self, w: float) -> float:  # height needed at width w
        raise NotImplementedError

    def nw(self) -> float | None:  # natural width, if the node has one
        return None

    def svg(self, x: float, y: float, w: float) -> str:
        raise NotImplementedError


class Spacer(Node):
    def __init__(self, h: float = 12):
        self._h = h

    def h(self, w):
        return self._h

    def svg(self, x, y, w):
        return ""


class Text(Node):
    def __init__(self, s, size=15, weight=400, color=None, lh=1.45, align="left", mono=False, italic=False, maxw=None):
        self.s, self.size, self.weight = s, size, weight
        self.color = color or C["text_primary"]
        self.lh, self.align, self.mono, self.italic, self.maxw = lh, align, mono, italic, maxw

    def _lines(self, w):
        return wrap(self.s, self.size, min(w, self.maxw) if self.maxw else w, self.weight, self.mono)

    def h(self, w):
        return len(self._lines(w)) * self.size * self.lh

    def nw(self):
        return max(tw(l, self.size, self.weight, self.mono) for l in self.s.split("\n"))

    def svg(self, x, y, w):
        out = []
        for i, l in enumerate(self._lines(w)):
            ax = x if self.align == "left" else (x + w / 2 if self.align == "center" else x + w)
            anchor = {"left": "start", "center": "middle", "right": "end"}[self.align]
            out.append(text(ax, y + i * self.size * self.lh, l, self.size, self.weight, self.color, anchor, self.mono, self.italic))
        return "".join(out)


def H1(s, **k): return Text(s, size=28, weight=700, lh=1.25, **k)
def H2(s, **k): return Text(s, size=18, weight=600, lh=1.3, **k)
def H3(s, **k): return Text(s, size=16, weight=600, lh=1.3, **k)
def Muted(s, size=13, **k): return Text(s, size=size, color=C["text_muted"], **k)
def Secondary(s, size=15, **k): return Text(s, size=size, color=C["text_secondary"], **k)


class Link(Text):
    def __init__(self, s, size=14, **k):
        super().__init__(s, size=size, color=C["accent_text"], **k)

    def svg(self, x, y, w):
        base = super().svg(x, y, w)
        return base + line(x, y + self.size * 1.1, x + min(self.nw(), w), y + self.size * 1.1, C["accent_text"], 1)


class Col(Node):
    def __init__(self, *children, gap=12):
        self.children, self.gap = [c for c in children if c is not None], gap

    def h(self, w):
        return sum(c.h(w) for c in self.children) + self.gap * max(0, len(self.children) - 1)

    def svg(self, x, y, w):
        out, cy = [], y
        for c in self.children:
            out.append(c.svg(x, cy, w))
            cy += c.h(w) + self.gap
        return "".join(out)


class Row(Node):
    """Children side by side. widths: list of weights (relative) or None for equal. 'auto' uses the natural width."""

    def __init__(self, *children, gap=16, widths=None, align="top", right=False, stretch=False):
        self.children, self.gap, self.widths, self.align, self.right = [c for c in children if c is not None], gap, widths, align, right
        self.stretch = stretch

    def nw(self):
        widths = [c.nw() for c in self.children]
        return None if any(v is None for v in widths) else sum(widths) + self.gap * (len(widths) - 1)

    def _w(self, w):
        n = len(self.children)
        avail = w - self.gap * (n - 1)
        ws = self.widths or [1] * n
        fixed = sum((self.children[i].nw() or 0) for i in range(n) if ws[i] == "auto")
        flex = sum(v for v in ws if v != "auto") or 1
        out = []
        for i, v in enumerate(ws):
            out.append(self.children[i].nw() if v == "auto" else (avail - fixed) * v / flex)
        return out

    def h(self, w):
        return max(c.h(cw) for c, cw in zip(self.children, self._w(w)))

    def svg(self, x, y, w):
        ws = self._w(w)
        total = sum(ws) + self.gap * (len(ws) - 1)
        cx = x + (w - total if self.right else 0)
        hh = self.h(w)
        out = []
        for c, cw in zip(self.children, ws):
            dy = 0
            if self.align == "center":
                dy = (hh - c.h(cw)) / 2
            elif self.align == "bottom":
                dy = hh - c.h(cw)
            out.append(c.svg(cx, y + dy, cw, hh) if self.stretch and isinstance(c, Card) else c.svg(cx, y + dy, cw))
            cx += cw + self.gap
        return "".join(out)


class Pad(Node):
    def __init__(self, child, l=0, t=0, r=0, b=0):
        self.child, self.l, self.t, self.r, self.b = child, l, t, r, b

    def h(self, w):
        return self.child.h(w - self.l - self.r) + self.t + self.b

    def svg(self, x, y, w):
        return self.child.svg(x + self.l, y + self.t, w - self.l - self.r)


class Card(Node):
    def __init__(self, *children, pad=24, gap=16, fill=None, stroke=None, rx=12, title=None, dashed=False):
        self.title = H2(title) if isinstance(title, str) else title
        self.body = Col(*([self.title] if self.title else []), *children, gap=gap)
        self.pad, self.fill, self.stroke, self.rx, self.dashed = pad, fill or C["bg_surface"], stroke or C["border_default"], rx, dashed

    def h(self, w):
        return self.body.h(w - 2 * self.pad) + 2 * self.pad

    def svg(self, x, y, w, h=None):
        extra = ' stroke-dasharray="6 4"' if self.dashed else ""
        return rect(x, y, w, h or self.h(w), self.fill, self.stroke, 1, self.rx, extra) + self.body.svg(x + self.pad, y + self.pad, w - 2 * self.pad)


class Divider(Node):
    def h(self, w):
        return 1

    def svg(self, x, y, w):
        return line(x, y + 0.5, x + w, y + 0.5)


class Button(Node):
    KINDS = ("primary", "secondary", "ghost", "danger", "disabled", "loading")

    def __init__(self, label, kind="primary", w=None, h=40, icon=None, full=False):
        assert kind in self.KINDS, kind
        self.label, self.kind, self.w, self._h, self.icon, self.full = label, kind, w, h, icon, full

    def nw(self):
        return self.w or tw(self.label, 14, 600) + 36 + (22 if self.icon or self.kind == "loading" else 0)

    def h(self, w):
        return self._h

    def svg(self, x, y, w):
        bw = w if self.full else self.nw()
        fills = {
            "primary": (C["accent_default"], None, C["accent_on"]),
            "loading": (C["accent_default"], None, C["accent_on"]),
            "secondary": (C["bg_surface"], C["border_strong"], C["text_primary"]),
            "ghost": ("none", None, C["accent_text"]),
            "danger": (C["bg_surface"], C["status_danger"], C["status_danger"]),
            "disabled": (C["bg_subtle"], C["border_default"], C["text_muted"]),
        }
        fill, stroke, color = fills[self.kind]
        out = [rect(x, y, bw, self._h, fill, stroke, 1, 8)]
        label = f"{self.icon}  {self.label}" if self.icon else self.label
        cx = x + bw / 2
        if self.kind == "loading":
            out.append(f'<circle cx="{cx - tw(label, 14, 600) / 2 - 10:.1f}" cy="{y + self._h / 2:.1f}" r="7" fill="none" stroke="{color}" stroke-width="2" stroke-dasharray="26 18"/>')
            cx += 10
        out.append(text(cx, y + (self._h - 14) / 2 - 1, label, 14, 600, color, "middle"))
        return "".join(out)


class Badge(Node):
    def __init__(self, label, tone="neutral"):
        self.label, self.tone = label, tone

    def nw(self):
        return tw(self.label, 12, 600) + 20

    def h(self, w):
        return 22

    def svg(self, x, y, w):
        if self.tone in TONES:
            fg, bg, _ = TONES[self.tone]
        elif self.tone == "accent":
            fg, bg = C["accent_text"], C["accent_subtle"]
        else:
            fg, bg = C["text_secondary"], C["bg_subtle"]
        bw = self.nw()
        return rect(x, y, bw, 22, bg, None, 0, 11) + text(x + bw / 2, y + 4, self.label, 12, 600, fg, "middle")


class Chip(Node):
    """A suggestion chip: 'text · source'."""

    def __init__(self, label, sub=None, active=False):
        self.label, self.sub, self.active = label, sub, active

    def nw(self):
        return tw(self.label, 13, 500) + (tw(" · " + self.sub, 12) if self.sub else 0) + 28

    def h(self, w):
        return 32

    def svg(self, x, y, w):
        bw = self.nw()
        fill, stroke = (C["accent_subtle"], C["accent_default"]) if self.active else (C["bg_surface"], C["border_strong"])
        sub = f'<tspan font-size="12" font-weight="400" fill="{C["text_muted"]}"> · {esc(self.sub)}</tspan>' if self.sub else ""
        return (rect(x, y, bw, 32, fill, stroke, 1, 16)
                + f'<text x="{x + 14:.1f}" y="{y + 8 + 13 * 0.8:.1f}" font-family="{FONT}" font-size="13" font-weight="500" '
                  f'fill="{C["text_primary"]}" xml:space="preserve">{esc(self.label)}{sub}</text>')


class Chips(Node):
    def __init__(self, *chips, gap=8):
        self.chips, self.gap = chips, gap

    def _rows(self, w):
        rows, cur, cw = [], [], 0
        for c in self.chips:
            n = c.nw()
            if cur and cw + self.gap + n > w:
                rows.append(cur)
                cur, cw = [], 0
            cw += (self.gap if cur else 0) + n
            cur.append(c)
        if cur:
            rows.append(cur)
        return rows

    def h(self, w):
        return len(self._rows(w)) * 32 + max(0, len(self._rows(w)) - 1) * 8

    def svg(self, x, y, w):
        out, cy = [], y
        for row in self._rows(w):
            cx = x
            for c in row:
                out.append(c.svg(cx, cy, w))
                cx += c.nw() + self.gap
            cy += 40
        return "".join(out)


class Alert(Node):
    def __init__(self, tone, message, action=None, icon=None):
        self.tone, self.message, self.action = tone, message, action
        self.icon = icon or {"danger": "!", "warning": "!", "success": "✓", "info": "i"}[tone]

    def _tw(self, w):
        return w - 32 - 32 - (self.action.nw() + 16 if self.action else 0)

    def h(self, w):
        return max(48, len(wrap(self.message, 14, self._tw(w))) * 20 + 28)

    def svg(self, x, y, w):
        fg, bg, bd = TONES[self.tone]
        hh = self.h(w)
        out = [rect(x, y, w, hh, bg, bd, 1, 8),
               f'<circle cx="{x + 24:.1f}" cy="{y + hh / 2:.1f}" r="10" fill="{fg}"/>',
               text(x + 24, y + hh / 2 - 8, self.icon, 13, 700, "#FFFFFF", "middle")]
        lines = wrap(self.message, 14, self._tw(w))
        ty = y + (hh - len(lines) * 20) / 2
        for i, l in enumerate(lines):
            out.append(text(x + 46, ty + i * 20 + 1, l, 14, 500, C["text_primary"]))
        if self.action:
            aw = self.action.nw()
            out.append(self.action.svg(x + w - aw - 12, y + (hh - 40) / 2, aw))
        return "".join(out)


class Field(Node):
    """Label + control + help or error. kind: text | area | select | readonly."""

    def __init__(self, label, value="", placeholder="", req=False, error=None, help=None, kind="text", rows=3,
                 state=None, tag=None, mono=False, caret=None, extra=None):
        self.label, self.value, self.placeholder, self.req = label, value, placeholder, req
        self.error, self.help, self.kind, self.rows, self.state = error, help, kind, rows, state
        self.tag, self.mono, self.caret, self.extra = tag, mono, caret, extra

    def _ch(self):
        return {"area": self.rows * 22 + 20}.get(self.kind, 44)

    def _below(self, w):
        t = self.error or self.help
        return len(wrap(t, 13, w)) * 18 + 6 if t else 0

    def h(self, w):
        return (24 if self.label else 0) + self._ch() + self._below(w)

    def svg(self, x, y, w):
        out = []
        cy = y
        if self.label:
            lab = self.label + (" *" if self.req else "")
            out.append(text(x, cy, lab, 14, 600))
            if self.tag:
                out.append(text(x + w, cy + 1, self.tag, 13, 400, C["text_muted"], "end"))
            cy += 24
        ch = self._ch()
        state = "error" if self.error else self.state
        stroke, sw, fill = C["border_strong"], 1, C["bg_surface"]
        if state == "error":
            stroke = C["status_danger"]
        elif state == "focus":
            stroke, sw = C["accent_default"], 2
        elif state == "disabled":
            fill, stroke = C["bg_subtle"], C["border_default"]
        elif state == "readonly":
            fill = C["bg_subtle"]
        out.append(rect(x, cy, w, ch, fill, stroke, sw, 8))
        shown = self.value or self.placeholder
        color = C["text_primary"] if self.value else C["text_muted"]
        if state == "disabled":
            color = C["text_muted"]
        if self.kind == "area":
            for i, l in enumerate(wrap(shown, 15, w - 32)[: self.rows]):
                out.append(text(x + 16, cy + 10 + i * 22 + 1, l, 15, 400, color, mono=self.mono))
        else:
            tx = x + 16
            out.append(text(tx, cy + (ch - 15) / 2 - 1, shown, 15, 400, color, mono=self.mono))
        if self.kind == "select":
            out.append(text(x + w - 18, cy + (ch - 14) / 2 - 1, "▾", 14, 400, C["text_secondary"], "middle"))
        if self.caret:
            out.append(text(x + w - 16, cy + (ch - 14) / 2, self.caret, 14, 400, C["text_muted"], "end"))
        cy += ch
        msg = self.error or self.help
        if msg:
            color = C["status_danger"] if self.error else C["text_muted"]
            prefix = "(!) " if self.error else ""
            for i, l in enumerate(wrap(prefix + msg, 13, w)):
                out.append(text(x, cy + 6 + i * 18, l, 13, 400, color))
        return "".join(out)


class Skeleton(Node):
    def __init__(self, h=16, frac=1.0, rx=4):
        self._h, self.frac, self.rx = h, frac, rx

    def h(self, w):
        return self._h

    def svg(self, x, y, w):
        return rect(x, y, w * self.frac, self._h, C["bg_subtle"], None, 0, self.rx)


class Block(Node):
    """Free-form box with a label, for placeholders (illustrations, long text)."""

    def __init__(self, h, label="", fill=None, dashed=True):
        self._h, self.label, self.fill, self.dashed = h, label, fill, dashed

    def h(self, w):
        return self._h

    def svg(self, x, y, w):
        d = ' stroke-dasharray="6 4"' if self.dashed else ""
        out = rect(x, y, w, self._h, self.fill or C["bg_subtle"], C["border_strong"], 1, 8, d)
        if self.label:
            out += text(x + w / 2, y + self._h / 2 - 8, self.label, 14, 400, C["text_muted"], "middle")
        return out


class Pagination(Node):
    def __init__(self, page=1, pages=2):
        self.page, self.pages = page, pages

    def h(self, w):
        return 40

    def svg(self, x, y, w):
        prev = Button("‹ Trước", "secondary" if self.page > 1 else "disabled")
        nxt = Button("Sau ›", "secondary" if self.page < self.pages else "disabled")
        label = f"Trang {self.page} / {self.pages}"
        mid = x + w / 2
        return (prev.svg(mid - tw(label, 14) / 2 - 24 - prev.nw(), y, prev.nw()) + text(mid, y + 11, label, 14, 400, C["text_secondary"], "middle")
                + nxt.svg(mid + tw(label, 14) / 2 + 24, y, nxt.nw()))


class Center(Node):
    """Centres a node that has a natural width (or draws it full width)."""

    def __init__(self, child):
        self.child = child

    def h(self, w):
        return self.child.h(self.child.nw() or w)

    def svg(self, x, y, w):
        cw = self.child.nw() or w
        return self.child.svg(x + (w - cw) / 2, y, cw)


class Disc(Node):
    """A round icon placeholder with a glyph (empty states, error screens)."""

    def __init__(self, glyph, d=72, tone=None):
        self.glyph, self.d, self.tone = glyph, d, tone

    def nw(self):
        return self.d

    def h(self, w):
        return self.d

    def svg(self, x, y, w):
        fg, bg = (TONES[self.tone][0], TONES[self.tone][1]) if self.tone else (C["accent_text"], C["accent_subtle"])
        return (f'<circle cx="{x + self.d / 2:.1f}" cy="{y + self.d / 2:.1f}" r="{self.d / 2:.1f}" fill="{bg}"/>'
                + text(x + self.d / 2, y + self.d / 2 - self.d * 0.28, self.glyph, self.d * 0.5, 600, fg, "middle"))


class Code(Node):
    """A formula or code snippet in a tinted box (grammar formulas)."""

    def __init__(self, s, size=15):
        self.s, self.size = s, size

    def h(self, w):
        return len(wrap(self.s, self.size, w - 32, 400, True)) * self.size * 1.5 + 20

    def svg(self, x, y, w):
        out = [rect(x, y, w, self.h(w), C["bg_subtle"], C["border_default"], 1, 8)]
        for i, l in enumerate(wrap(self.s, self.size, w - 32, 400, True)):
            out.append(text(x + 16, y + 10 + i * self.size * 1.5, l, self.size, 500, C["accent_text"], mono=True))
        return "".join(out)


def Note(s, tone="danger", size=13, **k):
    """Small coloured helper text, e.g. an inline error."""
    return Text(s, size=size, color=TONES[tone][0], **k)


# ---------------------------------------------------------------- page chrome
class Header(Node):
    """Page header: optional back link, title (+ count badge) and right-aligned actions."""

    def __init__(self, title, back=None, count=None, actions=(), sub=None):
        self.title, self.back, self.count, self.actions, self.sub = title, back, count, list(actions), sub

    def h(self, w):
        return (22 if self.back else 0) + 40 + (24 if self.sub else 0)

    def svg(self, x, y, w):
        out, cy = [], y
        if self.back:
            out.append(text(x, cy, "‹  " + self.back, 14, 500, C["accent_text"]))
            cy += 22
        out.append(text(x, cy, self.title, 28, 700))
        if self.count:
            out.append(Badge(self.count, "neutral").svg(x + tw(self.title, 28, 700) + 14, cy + 8, 0))
        ax = x + w
        for a in reversed(self.actions):
            ax -= a.nw()
            out.append(a.svg(ax, cy - 2, a.nw()))
            ax -= 12
        if self.sub:
            out.append(text(x, cy + 40, self.sub, 14, 400, C["text_muted"]))
        return "".join(out)


class Toast(Node):
    def __init__(self, message, tone="success"):
        self.message, self.tone = message, tone

    def nw(self):
        return tw(self.message, 14, 500) + 64

    def h(self, w):
        return 44

    def svg(self, x, y, w):
        fg, bg, bd = TONES[self.tone]
        bw = self.nw()
        return (rect(x, y, bw, 44, bg, bd, 1, 8) + f'<circle cx="{x + 22:.1f}" cy="{y + 22:.1f}" r="9" fill="{fg}"/>'
                + text(x + 22, y + 12, "✓" if self.tone == "success" else "!", 12, 700, "#FFFFFF", "middle")
                + text(x + 42, y + 13, self.message, 14, 500))


class Dialog(Node):
    def __init__(self, title, *body, actions=(), w=520, gap=12):
        self.title, self.body, self.actions, self.w, self.gap = title, Col(*body, gap=gap), list(actions), w, gap

    def _h(self):
        return 28 + 30 + 12 + self.body.h(self.w - 56) + 24 + (40 + 24 if self.actions else 0) + 4

    def svg(self, x, y, w):  # x, y, w ignored: centred by the screen
        raise NotImplementedError

    def draw_at(self, cx, cy):
        bw, bh = self.w, self._h()
        x, y = cx - bw / 2, cy - bh / 2
        out = [rect(x, y, bw, bh, C["bg_surface"], C["border_default"], 1, 12),
               text(x + 28, y + 28, self.title, 20, 700),
               self.body.svg(x + 28, y + 28 + 42, bw - 56)]
        if self.actions:
            ax = x + bw - 28
            for a in reversed(self.actions):
                ax -= a.nw()
                out.append(a.svg(ax, y + bh - 28 - 40, a.nw()))
                ax -= 12
        return "".join(out)


# ---------------------------------------------------------------- shells and screens
NAV = [("section", "Thư viện"), ("vocab", "Từ vựng"), ("grammar", "Ngữ pháp"), ("section", "Học"), ("practice", "Luyện tập")]


class AppShell:
    """Signed-in layout: sidebar + content (desktop-first, design-system §4)."""

    SIDEBAR = 232

    def __init__(self, active, body: Node, toast: Toast | None = None, banner: Node | None = None, overlay: Dialog | None = None,
                 w=1200, min_h=720, user="an@example.com", settings_active=False):
        self.active, self.body, self.toast, self.banner, self.overlay = active, body, toast, banner, overlay
        self.w, self.min_h, self.user, self.settings_active = w, min_h, user, settings_active

    def render(self, title, desc="") -> str:
        cw = self.w - self.SIDEBAR - 2 * 40
        top = 40
        parts_body = []
        cy = top
        if self.banner:
            parts_body.append(self.banner.svg(self.SIDEBAR + 40, cy, cw))
            cy += self.banner.h(cw) + 20
        parts_body.append(self.body.svg(self.SIDEBAR + 40, cy, cw))
        total_h = max(self.min_h, cy + self.body.h(cw) + 48)
        out = [rect(0, 0, self.w, total_h, C["bg_canvas"]),
               rect(0, 0, self.SIDEBAR, total_h, C["bg_surface"]), line(self.SIDEBAR, 0, self.SIDEBAR, total_h),
               text(28, 28, "Lingozi", 22, 700, C["accent_text"])]
        ny = 84
        for key, label in NAV:
            if key == "section":
                ny += 6
                out.append(text(28, ny, label.upper(), 11, 600, C["text_muted"]))
                ny += 24
                continue
            if key == self.active:
                out.append(rect(14, ny - 6, self.SIDEBAR - 28, 40, C["accent_subtle"], None, 0, 8))
                out.append(rect(14, ny + 2, 3, 24, C["accent_default"], None, 0, 2))
            col = C["accent_text"] if key == self.active else C["text_secondary"]
            out.append(rect(30, ny + 4, 18, 18, "none", col, 1.6, 4))
            out.append(text(62, ny + 4, label, 15, 600 if key == self.active else 400, col))
            ny += 44
        # bottom: settings + user
        sy = total_h - 130
        out.append(line(14, sy - 12, self.SIDEBAR - 14, sy - 12))
        if self.settings_active:
            out.append(rect(14, sy - 6 + 8, self.SIDEBAR - 28, 40, C["accent_subtle"], None, 0, 8))
        col = C["accent_text"] if self.settings_active else C["text_secondary"]
        out.append(text(30, sy + 14, "⚙", 16, 400, col))
        out.append(text(62, sy + 14, "Cài đặt", 15, 600 if self.settings_active else 400, col))
        out.append(f'<circle cx="46" cy="{total_h - 52:.1f}" r="15" fill="{C["accent_subtle"]}"/>')
        out.append(text(46, total_h - 62, self.user[0].upper(), 14, 700, C["accent_text"], "middle"))
        out.append(text(70, total_h - 60, self.user, 13, 400, C["text_muted"]))
        out += parts_body
        if self.toast:
            tw_ = self.toast.nw()
            out.append(self.toast.svg(self.w - 40 - tw_, 24, tw_))
        if self.overlay:
            out.append(rect(0, 0, self.w, total_h, "#1B1B22", None, 0, 0, ' fill-opacity="0.45"'))
            out.append(self.overlay.draw_at(self.SIDEBAR + (self.w - self.SIDEBAR) / 2, min(total_h / 2, 420)))
        return wrap_svg("".join(out), self.w, total_h, title, desc)


class AuthShell:
    """Sign-in layout (Figma frames W-AUTH-01 to 08): logo, 440 px card, legal footer. Never themed."""

    def __init__(self, body: Node, w=1000, min_h=640, footer=True, wide=None, banner: Node | None = None):
        self.body, self.w, self.min_h, self.footer, self.wide, self.banner = body, w, min_h, footer, wide, banner

    def render(self, title, desc="") -> str:
        cw = self.wide or 440
        inner = cw - 64
        card_h = self.body.h(inner) + 64
        content_h = 36 + card_h + (40 if self.footer else 0)
        total_h = max(self.min_h, content_h + 160)
        y0 = (total_h - content_h) / 2
        x0 = (self.w - cw) / 2
        out = [rect(0, 0, self.w, total_h, C["bg_canvas"]),
               text(self.w / 2, y0, "Lingozi", 22, 700, C["accent_text"], "middle"),
               rect(x0, y0 + 36, cw, card_h, C["bg_surface"], C["border_default"], 1, 16),
               self.body.svg(x0 + 32, y0 + 36 + 32, inner)]
        if self.footer:
            out.append(text(self.w / 2, y0 + 36 + card_h + 24, "Chính sách quyền riêng tư · Xóa dữ liệu", 12, 400, C["text_muted"], "middle"))
        return wrap_svg("".join(out), self.w, total_h, title, desc)


class Fragment:
    """A piece of a screen (for example one form field in several states), drawn on a plain canvas."""

    def __init__(self, body: Node, w=760, pad=28, caption=None):
        self.body, self.w, self.pad, self.caption = body, w, pad, caption

    def render(self, title, desc="") -> str:
        iw = self.w - 2 * self.pad
        total_h = self.body.h(iw) + 2 * self.pad + (28 if self.caption else 0)
        out = [rect(0, 0, self.w, total_h, C["bg_canvas"])]
        y = self.pad
        if self.caption:
            out.append(text(self.pad, y - 4, self.caption, 12, 600, C["text_muted"]))
            y += 24
        out.append(self.body.svg(self.pad, y, iw))
        return wrap_svg("".join(out), self.w, total_h, title, desc)


def wrap_svg(inner: str, w: float, h: float, title: str, desc: str) -> str:
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w:.0f} {h:.0f}" width="{w:.0f}" height="{h:.0f}" role="img" '
            f'aria-labelledby="t d"><title id="t">{esc(title)}</title><desc id="d">{esc(desc)}</desc>{inner}</svg>\n')
