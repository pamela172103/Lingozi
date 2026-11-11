#!/usr/bin/env python3
"""Write the wireframe images and notes of every story SRS from the screen registry.

    python3 tools/wireframes/sync_docs.py           # rewrite "## 5. Wireframe" blocks in docs/features/*/srs/US-*.md
    python3 tools/wireframes/sync_docs.py --check   # exit 1 if any file differs from what would be written

For each `### W-XXX-NN — title` block the title, image and bullet notes come from tools/wireframes/screens/*.py.
Other sub-sections of section 5 (e.g. "### Thiết kế Figma") are kept as they are. Which screens a story draws is
listed in story_screens.py (FEAT-02) or taken from the existing `### W-…` headings (FEAT-01).
"""
from __future__ import annotations

import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE))
from screens import REGISTRY  # noqa: E402
import screens.accounts, screens.library  # noqa: E402,F401
from story_screens import STORY_SCREENS  # noqa: E402

ROOT = HERE.parents[1]
FEATURES = ROOT / "docs" / "features"
INTRO = ("_Wireframe mức thấp (khung xám, đúng bố cục màn hình thật) vẽ bằng script `tools/wireframes/` và lưu ở "
         "[wireframes/](../wireframes/); sửa script rồi chạy `python3 tools/wireframes/build.py` và "
         "`python3 tools/wireframes/sync_docs.py`, không sửa tay file SVG. Quy tắc: vẽ đủ mọi màn hình, hộp thoại và trạng thái mà AC của story nhắc tới._")
FIGMA_NOTE = (" Các màn hình đăng nhập và nhập mã (W-AUTH-01 → 08) là ảnh xuất từ Figma, đặt ở "
              "[design-assets/](../design-assets/).")


def block(sid: str) -> str:
    s = REGISTRY[sid]
    img = f"../{s.image}" if s.image else f"../{s.svg_name}"
    out = [f"### {sid} — {s.title}", "", f"![{sid} {s.title.split(' (')[0]}]({img})", ""]
    out += [f"- {n}" for n in s.notes]
    return "\n".join(out).rstrip() + "\n"


def render(path: Path, text: str, ids: list[str] | None) -> str:
    m = re.search(r"^## 5\. Wireframe\n(.*?)(?=^## )", text, flags=re.S | re.M)
    if not m:
        return text
    body = m.group(1)
    parts = re.split(r"(?=^### )", body, flags=re.M)
    head, subs = parts[0], parts[1:]
    existing = [re.match(r"### (W-[A-Z]+-\d+) — ", p).group(1) for p in subs if p.startswith("### W-")]
    if ids is None:
        ids = existing
    others = [p for p in subs if not p.startswith("### W-")]
    intro = INTRO[:-1] + FIGMA_NOTE + "_" if "/accounts/" in path.as_posix() else INTRO
    new = intro + "\n\n" + "\n".join(block(i) for i in ids)
    if others:
        new += "\n" + "".join(o if o.endswith("\n\n") else o.rstrip("\n") + "\n\n" for o in others).rstrip("\n") + "\n"
    new = new.rstrip("\n") + "\n\n"
    return text[:m.start(1)] + "\n" + new + text[m.end(1):]


def main(argv: list[str]) -> int:
    check = "--check" in argv
    bad = 0
    for path in sorted(FEATURES.glob("*/srs/US-*.md")):
        rel = path.relative_to(FEATURES).as_posix()
        ids = [f"W-LIB-{n:02d}" for n in STORY_SCREENS[rel]] if rel in STORY_SCREENS else None
        text = path.read_text(encoding="utf-8")
        new = render(path, text, ids)
        if new != text:
            if check:
                print(f"out of date: {rel}")
                bad += 1
            else:
                path.write_text(new, encoding="utf-8")
                print(f"wrote {rel}")
    return 1 if bad else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
