# -*- coding: utf-8 -*-
"""Build the SVG wireframes of every registered screen.

Usage (from the repository root):
    python3 tools/wireframes/build.py            # write docs/features/<feature>/wireframes/W-*.svg
    python3 tools/wireframes/build.py --check    # fail if a committed SVG differs from what the code generates
    python3 tools/wireframes/build.py W-LIB-08   # build one screen
"""
from __future__ import annotations

import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[1]
sys.path.insert(0, str(HERE))

from screens import REGISTRY  # noqa: E402
import screens.accounts  # noqa: E402,F401  (registers screens)
import screens.library  # noqa: E402,F401


def render(s) -> str:
    return s.build().render(f"{s.wid} — {s.title}", s.title)


def target(s) -> Path:
    return ROOT / "docs" / "features" / s.feature / s.svg_name


def main(argv: list[str]) -> int:
    check = "--check" in argv
    only = [a for a in argv if a.startswith("W-")]
    problems, built = [], 0
    for wid in sorted(REGISTRY):
        s = REGISTRY[wid]
        if s.build is None or (only and wid not in only):
            continue
        svg = render(s)
        path = target(s)
        if check:
            if not path.exists() or path.read_text(encoding="utf-8") != svg:
                problems.append(f"{path.relative_to(ROOT)} is missing or out of date (run python3 tools/wireframes/build.py)")
            continue
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_text(svg, encoding="utf-8")
        built += 1
    if check:
        for p in problems:
            print("  -", p)
        print("wireframes:", "OK" if not problems else f"{len(problems)} problem(s)")
        return 1 if problems else 0
    print(f"wireframes: wrote {built} SVG files")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
