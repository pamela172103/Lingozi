"""Check WCAG 2.2 contrast ratios for every theme in design-tokens.json.

Usage (from repository root):
    python3 tools/design-tokens/check_contrast.py docs/architecture/design-tokens.json
Exit code 1 if any pair is below its required ratio.
"""
import json
import sys


def relative_luminance(hex_color: str) -> float:
    value = hex_color.lstrip("#")
    channels = [int(value[i : i + 2], 16) / 255 for i in (0, 2, 4)]
    linear = [c / 12.92 if c <= 0.04045 else ((c + 0.055) / 1.055) ** 2.4 for c in channels]
    return 0.2126 * linear[0] + 0.7152 * linear[1] + 0.0722 * linear[2]


def contrast_ratio(a: str, b: str) -> float:
    high, low = sorted((relative_luminance(a), relative_luminance(b)), reverse=True)
    return (high + 0.05) / (low + 0.05)


def main(path: str) -> int:
    with open(path, encoding="utf-8") as handle:
        tokens = json.load(handle)
    failures = 0
    for theme_key, theme in tokens["themes"].items():
        colors = theme["color"]
        print(f"## {theme_key}")
        for foreground, background, required in tokens["contrastChecks"]:
            ratio = contrast_ratio(colors[foreground], colors[background])
            status = "PASS" if ratio >= required else "FAIL"
            failures += status == "FAIL"
            print(f"{status}  {ratio:5.2f} >= {required}  {foreground} on {background}")
    print(f"\n{failures} failure(s)")
    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1] if len(sys.argv) > 1 else "docs/architecture/design-tokens.json"))
