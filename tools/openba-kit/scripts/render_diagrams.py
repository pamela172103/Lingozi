#!/usr/bin/env python3
"""
render_diagrams.py — Tự động quét Markdown và render Mermaid thành visual diagram HTML/SVG
theo chuẩn phong cách Diagram Design (https://diagramdesign.dev).
"""

import os
import sys
import json
import re
import subprocess
import html
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent
SKILL_DIR = REPO_ROOT / "skills" / "diagram-design"
if not SKILL_DIR.exists():
    for fallback in [Path.home() / ".claude" / "skills" / "diagram-design", Path.home() / ".hermes" / "skills" / "diagram-design"]:
        if fallback.exists():
            SKILL_DIR = fallback
            break
MERMAID_EXTRACT = SKILL_DIR / "scripts" / "mermaid_extract.py"
EXPORT_SVG = SKILL_DIR / "scripts" / "export_svg.py"

def escape(text):
    return html.escape(str(text or ''))

def clean_label(text):
    if not text:
        return ""
    # strip quotes, <br/> to newline or space, html entities
    text = re.sub(r'<br\s*/?>', ' ', text)
    text = text.replace('\\"', '"').replace('\\n', ' ')
    return text.strip()

def render_sequence_svg(data, title="Sequence Diagram"):
    """
    Render sequenceDiagram IR thành SVG chuẩn phong cách Diagram Design
    """
    nodes = data.get("nodes", [])
    edges = data.get("edges", [])
    fragments = data.get("fragments", [])
    notes = data.get("notes", [])
    
    if not nodes:
        return None
        
    num_nodes = len(nodes)
    width = max(960, num_nodes * 200 + 100)
    top_y = 120
    row_height = 48
    bottom_y = top_y + max(300, (len(edges) + len(fragments) * 2 + len(notes) * 2 + 3) * row_height)
    height = bottom_y + 80
    
    # Calculate X for each participant
    spacing = (width - 160) / max(1, num_nodes - 1)
    node_x = {}
    for idx, node in enumerate(nodes):
        nid = node["id"]
        x = int(80 + idx * spacing)
        node_x[nid] = x

    svg_lines = []
    svg_lines.append(f'<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="seq-title seq-desc">')
    svg_lines.append(f'  <title id="seq-title">{escape(title)}</title>')
    svg_lines.append(f'  <desc id="seq-desc">Sequence diagram with {num_nodes} participants and {len(edges)} messages.</desc>')
    
    # Defs
    svg_lines.append('''  <defs>
    <pattern id="seq-dots" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="0.9" fill="rgba(45,49,66,0.10)"/>
    </pattern>
    <marker id="arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#4f5d75"/>
    </marker>
    <marker id="arrow-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#bf4520"/>
    </marker>
    <marker id="arrow-link" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#2e5aa8"/>
    </marker>
  </defs>''')
    
    # Background
    svg_lines.append('  <rect width="100%" height="100%" fill="#f5f5f5"/>')
    svg_lines.append('  <rect width="100%" height="100%" fill="url(#seq-dots)" opacity="0.6"/>')
    
    # Lifelines
    svg_lines.append('  <!-- Lifelines -->')
    for nid, x in node_x.items():
        svg_lines.append(f'  <line x1="{x}" y1="{top_y}" x2="{x}" y2="{bottom_y - 20}" stroke="rgba(45,49,66,0.25)" stroke-width="1.2" stroke-dasharray="4,4"/>')

    # Draw messages and fragments
    curr_y = top_y + 40
    svg_lines.append('  <!-- Messages & Annotations -->')
    
    edge_idx = 1
    for edge in edges:
        s_id = edge["source"]
        t_id = edge["target"]
        lbl = clean_label(edge.get("label", ""))
        style = edge.get("style", "solid")
        
        sx = node_x.get(s_id, 100)
        tx = node_x.get(t_id, 200)
        
        is_accent = ("err" in lbl.lower() or "401" in lbl or "fail" in lbl.lower() or "vượt" in lbl.lower())
        marker = "url(#arrow-accent)" if is_accent else "url(#arrow)"
        stroke_color = "#bf4520" if is_accent else "#4f5d75"
        dash = ' stroke-dasharray="4,3"' if style == "dashed" else ''
        
        if sx == tx:
            # Self message loop
            loop_w = 40
            loop_h = 24
            svg_lines.append(f'  <path d="M {sx} {curr_y} L {sx+loop_w} {curr_y} L {sx+loop_w} {curr_y+loop_h} L {sx} {curr_y+loop_h}" fill="none" stroke="{stroke_color}" stroke-width="1.2"{dash} marker-end="{marker}"/>')
            if lbl:
                t_lbl = lbl if len(lbl) <= 50 else lbl[:47] + "..."
                mask_w = len(t_lbl) * 6.5 + 16
                svg_lines.append(f'  <rect x="{sx + loop_w + 6}" y="{curr_y + 6}" width="{mask_w}" height="16" rx="3" fill="#f5f5f5" opacity="0.95"/>')
                svg_lines.append(f'  <text x="{sx + loop_w + 12}" y="{curr_y + 18}" fill="{stroke_color}" font-size="10" font-family="\'Geist Mono\', monospace">{escape(t_lbl)}</text>')
            curr_y += loop_h + 20
        else:
            # Message between 2 lifelines
            target_offset = 6 if tx > sx else -6
            svg_lines.append(f'  <line x1="{sx}" y1="{curr_y}" x2="{tx}" y2="{curr_y}" stroke="{stroke_color}" stroke-width="1.2"{dash} marker-end="{marker}"/>')
            if lbl:
                mid_x = (sx + tx) / 2
                t_lbl = f"{edge_idx}. {lbl}" if not lbl.startswith(str(edge_idx)) else lbl
                t_lbl = t_lbl if len(t_lbl) <= 65 else t_lbl[:62] + "..."
                mask_w = len(t_lbl) * 6.2 + 16
                svg_lines.append(f'  <rect x="{mid_x - mask_w/2}" y="{curr_y - 14}" width="{mask_w}" height="16" rx="3" fill="#f5f5f5" stroke="rgba(45,49,66,0.15)" stroke-width="0.6"/>')
                svg_lines.append(f'  <text x="{mid_x}" y="{curr_y - 3}" fill="{stroke_color}" font-size="9.5" font-family="\'Geist Mono\', monospace" text-anchor="middle">{escape(t_lbl)}</text>')
            curr_y += row_height
            edge_idx += 1

    # Participant header boxes (drawn on top of lines)
    svg_lines.append('  <!-- Participant Boxes -->')
    for node in nodes:
        nid = node["id"]
        lbl = clean_label(node.get("label", nid))
        shape = node.get("shape", "lifeline")
        cx = node_x[nid]
        box_w = 140
        box_h = 50
        bx = cx - box_w / 2
        by = top_y - box_h - 10
        
        is_actor = shape == "actor" or "user" in nid.lower() or "agent" in nid.lower()
        fill_color = "rgba(191,69,32,0.06)" if is_actor else "#ffffff"
        stroke_box = "#bf4520" if is_actor else "#2d3142"
        badge_text = "ACTOR" if is_actor else "SERVICE"
        
        svg_lines.append(f'  <g transform="translate({bx}, {by})">')
        svg_lines.append(f'    <rect width="{box_w}" height="{box_h}" rx="6" fill="{fill_color}" stroke="{stroke_box}" stroke-width="1.2"/>')
        svg_lines.append(f'    <rect x="8" y="6" width="46" height="11" rx="2" fill="transparent" stroke="{stroke_box}" stroke-width="0.7"/>')
        svg_lines.append(f'    <text x="31" y="14.5" fill="{stroke_box}" font-size="7" font-family="\'Geist Mono\', monospace" text-anchor="middle" letter-spacing="0.08em">{badge_text}</text>')
        disp_label = lbl if len(lbl) <= 20 else lbl[:18] + ".."
        svg_lines.append(f'    <text x="{box_w/2}" y="36" fill="#2d3142" font-size="11" font-weight="600" font-family="\'Geist\', sans-serif" text-anchor="middle">{escape(disp_label)}</text>')
        svg_lines.append('  </g>')

    svg_lines.append('</svg>')
    return "\n".join(svg_lines)

def render_state_svg(data, title="State Machine"):
    """
    Render stateDiagram IR thành SVG chuẩn phong cách Diagram Design
    """
    nodes = [n for n in data.get("nodes", []) if not n.get("id", "").startswith("__start")]
    edges = [e for e in data.get("edges", []) if not e.get("source", "").startswith("__start")]
    
    num_nodes = len(nodes)
    width = max(960, num_nodes * 180 + 120)
    height = 560
    
    # Layout states horizontally or in a 2-row grid
    cols = min(4, max(2, num_nodes))
    node_pos = {}
    col_spacing = (width - 160) / max(1, cols - 1)
    
    for idx, node in enumerate(nodes):
        c = idx % cols
        r = idx // cols
        x = int(80 + c * col_spacing)
        y = 140 + r * 160
        node_pos[node["id"]] = (x, y)
        
    svg_lines = []
    svg_lines.append(f'<svg viewBox="0 0 {width} {height}" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="state-title state-desc">')
    svg_lines.append(f'  <title id="state-title">{escape(title)}</title>')
    svg_lines.append(f'  <desc id="state-desc">State machine diagram showing {num_nodes} states and transitions.</desc>')
    
    svg_lines.append('''  <defs>
    <pattern id="state-dots" width="22" height="22" patternUnits="userSpaceOnUse">
      <circle cx="1" cy="1" r="0.9" fill="rgba(45,49,66,0.10)"/>
    </pattern>
    <marker id="s-arrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#4f5d75"/>
    </marker>
    <marker id="s-arrow-accent" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
      <polygon points="0 0, 8 3, 0 6" fill="#bf4520"/>
    </marker>
  </defs>''')
    
    svg_lines.append('  <rect width="100%" height="100%" fill="#f5f5f5"/>')
    svg_lines.append('  <rect width="100%" height="100%" fill="url(#state-dots)" opacity="0.6"/>')
    
    # Draw Transitions
    svg_lines.append('  <!-- Transitions -->')
    box_w, box_h = 150, 72
    for edge in edges:
        s_id = edge["source"]
        t_id = edge["target"]
        lbl = clean_label(edge.get("label", ""))
        
        if s_id in node_pos and t_id in node_pos:
            sx, sy = node_pos[s_id]
            tx, ty = node_pos[t_id]
            is_accent = ("fail" in lbl.lower() or "error" in lbl.lower() or "vượt" in lbl.lower() or "halt" in t_id.lower())
            stroke_col = "#bf4520" if is_accent else "#4f5d75"
            marker = "url(#s-arrow-accent)" if is_accent else "url(#s-arrow)"
            
            # Straight or curved line
            if sy == ty:
                # Same row
                start_x = sx + (box_w/2 if tx > sx else -box_w/2)
                end_x = tx + (-box_w/2 if tx > sx else box_w/2)
                svg_lines.append(f'  <line x1="{start_x}" y1="{sy + box_h/2}" x2="{end_x}" y2="{ty + box_h/2}" stroke="{stroke_col}" stroke-width="1.2" marker-end="{marker}"/>')
                if lbl:
                    mx = (start_x + end_x) / 2
                    disp_lbl = lbl if len(lbl) <= 30 else lbl[:27] + "..."
                    mw = len(disp_lbl) * 6 + 12
                    svg_lines.append(f'  <rect x="{mx - mw/2}" y="{sy + box_h/2 - 16}" width="{mw}" height="14" rx="2" fill="#f5f5f5" stroke="rgba(45,49,66,0.15)" stroke-width="0.6"/>')
                    svg_lines.append(f'  <text x="{mx}" y="{sy + box_h/2 - 6}" fill="{stroke_col}" font-size="8.5" font-family="\'Geist Mono\', monospace" text-anchor="middle">{escape(disp_lbl)}</text>')
            else:
                # Cross row orthogonal elbow
                start_y = sy + box_h
                end_y = ty
                svg_lines.append(f'  <path d="M {sx + box_w/2} {start_y} L {sx + box_w/2} {(start_y+end_y)/2} L {tx + box_w/2} {(start_y+end_y)/2} L {tx + box_w/2} {end_y}" fill="none" stroke="{stroke_col}" stroke-width="1.2" marker-end="{marker}"/>')

    # Draw State Boxes
    svg_lines.append('  <!-- State Boxes -->')
    for node in nodes:
        nid = node["id"]
        lbl = clean_label(node.get("label", nid))
        if nid not in node_pos:
            continue
        x, y = node_pos[nid]
        is_focal = ("emergency" in nid.lower() or "open" in nid.lower() or "halt" in nid.lower())
        bg_col = "rgba(191,69,32,0.06)" if is_focal else "#ffffff"
        bd_col = "#bf4520" if is_focal else "#2d3142"
        
        svg_lines.append(f'  <g transform="translate({x}, {y})">')
        svg_lines.append(f'    <rect width="{box_w}" height="{box_h}" rx="8" fill="{bg_col}" stroke="{bd_col}" stroke-width="1.2"/>')
        svg_lines.append(f'    <rect x="8" y="8" width="36" height="11" rx="2" fill="transparent" stroke="{bd_col}" stroke-width="0.7"/>')
        svg_lines.append(f'    <text x="26" y="16.5" fill="{bd_col}" font-size="7" font-family="\'Geist Mono\', monospace" text-anchor="middle" letter-spacing="0.08em">STATE</text>')
        disp_title = lbl if len(lbl) <= 22 else lbl[:20] + ".."
        svg_lines.append(f'    <text x="{box_w/2}" y="42" fill="#2d3142" font-size="11.5" font-weight="600" font-family="\'Geist\', sans-serif" text-anchor="middle">{escape(disp_title)}</text>')
        svg_lines.append('  </g>')

    svg_lines.append('</svg>')
    return "\n".join(svg_lines)

def wrap_html_template(svg_content, title="Editorial Diagram", eyebrow="Architecture & Specification · Diagram Design"):
    """
    Bọc SVG vào template HTML chuẩn của Diagram Design
    """
    return f"""<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{escape(title)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    *, *::before, *::after {{ box-sizing: border-box; margin: 0; padding: 0; }}
    :root {{
      --color-paper:   #f5f5f5;
      --color-ink:     #2d3142;
      --color-muted:   #4f5d75;
      --color-accent:  #bf4520;
      --font-sans:     'Geist', system-ui, sans-serif;
      --font-serif:    'Instrument Serif', serif;
      --font-mono:     'Geist Mono', ui-monospace, monospace;
    }}
    body {{
      font-family: var(--font-sans);
      background: var(--color-paper);
      color: var(--color-ink);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 2.5rem 1.5rem;
    }}
    .frame {{ max-width: 1200px; width: 100%; }}
    .eyebrow {{
      font-family: var(--font-mono);
      font-size: 0.68rem;
      font-weight: 500;
      letter-spacing: 0.18em;
      text-transform: uppercase;
      color: var(--color-muted);
      margin-bottom: 0.5rem;
    }}
    h1 {{
      font-family: var(--font-serif);
      font-size: clamp(1.6rem, 2.5vw + 0.8rem, 2.2rem);
      font-weight: 400;
      letter-spacing: -0.02em;
      line-height: 1.15;
      color: var(--color-ink);
      margin-bottom: 1.25rem;
    }}
    .diagram-container {{
      width: 100%;
      overflow-x: auto;
      border: 1px solid rgba(45,49,66,0.12);
      border-radius: 8px;
      background: #ffffff;
      box-shadow: 0 4px 20px rgba(0,0,0,0.03);
    }}
    svg {{ width: 100%; min-width: 900px; display: block; }}
    .footer-bar {{
      margin-top: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 0.75rem;
      color: var(--color-muted);
      font-family: var(--font-mono);
    }}
  </style>
</head>
<body>
  <div class="frame">
    <p class="eyebrow">{escape(eyebrow)}</p>
    <h1>{escape(title)}</h1>
    <div class="diagram-container">
      {svg_content}
    </div>
    <div class="footer-bar">
      <span>BA-Kit Open × Diagram Design</span>
      <span>Tự động xuất bản HTML + SVG vector</span>
    </div>
  </div>
</body>
</html>"""

def process_markdown_file(md_path, out_dir=None):
    """
    Quét và xuất bản tất cả diagrams trong 1 file Markdown
    """
    md_path = Path(md_path).resolve()
    if not md_path.exists():
        print(f"[!] Không tìm thấy tệp: {md_path}")
        return []
        
    content = md_path.read_text(encoding="utf-8")
    blocks = re.findall(r'```mermaid\s*\n(.*?)\n```', content, re.DOTALL)
    if not blocks:
        return []
        
    if out_dir is None:
        target_dir = md_path.parent / "diagrams"
    else:
        target_dir = Path(out_dir).resolve()
    target_dir.mkdir(parents=True, exist_ok=True)
    
    stem = md_path.stem
    results = []
    
    print(f"\n📄 Đang xử lý file: {md_path.name} ({len(blocks)} diagram blocks)")
    
    # Chạy extractor lấy JSON
    cmd = ["python3", str(MERMAID_EXTRACT), str(md_path), "--diagram", "all", "--json"]
    try:
        proc = subprocess.run(cmd, capture_output=True, text=True, check=True)
        ir_data = json.loads(proc.stdout)
    except Exception as e:
        print(f"[-] Lỗi extract Mermaid IR: {e}")
        return []
        
    diagrams = ir_data.get("diagrams", [])
    
    for idx, diag in enumerate(diagrams):
        kind = diag.get("kind", "")
        diag_title = f"{stem} — Sơ đồ {idx + 1} ({kind})"
        
        # Thử lấy tiêu đề từ dòng comment hoặc heading phía trước nếu có
        svg_content = None
        if kind == "sequenceDiagram":
            svg_content = render_sequence_svg(diag, title=diag_title)
        elif "state" in kind:
            svg_content = render_state_svg(diag, title=diag_title)
        else:
            # Fallback sequence or state
            svg_content = render_sequence_svg(diag, title=diag_title)
            
        if not svg_content:
            continue
            
        html_content = wrap_html_template(svg_content, title=diag_title)
        out_html = target_dir / f"{stem}-{idx + 1}.html"
        out_svg = target_dir / f"{stem}-{idx + 1}.svg"
        
        out_html.write_text(html_content, encoding="utf-8")
        
        # Export SVG bằng script chính thống của diagram-design
        export_cmd = ["python3", str(EXPORT_SVG), str(out_html), str(out_svg)]
        subprocess.run(export_cmd, capture_output=True, text=True)
        
        print(f"  ✓ Đã sinh Diagram {idx + 1}:")
        print(f"    - HTML: {out_html}")
        print(f"    - SVG : {out_svg}")
        
        results.append({
            "index": idx + 1,
            "filename": f"{stem}-{idx + 1}",
            "kind": kind,
            "title": diag_title,
            "html": str(out_html),
            "svg": str(out_svg)
        })

    # Tạo file gallery index.html trong target_dir
    if results:
        index_file = target_dir / "index.html"
        cards_html = []
        for r in results:
            cards_html.append(f'''
            <div style="border: 1px solid #e2e8f0; border-radius: 8px; padding: 1.25rem; background: #fff; margin-bottom: 1.5rem;">
              <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 0.75rem;">
                <h3 style="font-family:'Geist', sans-serif; font-size: 1.1rem; color: #2d3142; margin: 0;">{escape(r['title'])}</h3>
                <div>
                  <a href="{r['filename']}.html" target="_blank" style="margin-right: 0.75rem; text-decoration: none; color: #bf4520; font-weight: 500; font-size: 0.85rem;">Mở HTML ↗</a>
                  <a href="{r['filename']}.svg" target="_blank" style="text-decoration: none; color: #4f5d75; font-weight: 500; font-size: 0.85rem;">Tải SVG ↗</a>
                </div>
              </div>
              <iframe src="{r['filename']}.html" style="width: 100%; height: 420px; border: 1px solid #edf2f7; border-radius: 6px;"></iframe>
            </div>
            ''')
        gallery_html = f'''<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8">
  <title>Diagrams Gallery — {escape(stem)}</title>
  <link href="https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Geist:wght@400;500;600&family=Geist+Mono:wght@400;500;600&display=swap" rel="stylesheet">
  <style>
    body {{ font-family: 'Geist', sans-serif; background: #f8fafc; padding: 2rem; max-width: 1200px; margin: 0 auto; color: #1e293b; }}
    h1 {{ font-family: 'Instrument Serif', serif; font-size: 2.2rem; margin-bottom: 0.5rem; }}
    p.lead {{ color: #64748b; margin-bottom: 2rem; }}
  </style>
</head>
<body>
  <h1>Bộ Sưu tập Sơ đồ Thiết kế (Diagram Design)</h1>
  <p class="lead">Tự động kết xuất từ {escape(md_path.name)} · {len(results)} diagrams chuẩn vector SVG</p>
  {''.join(cards_html)}
</body>
</html>'''
        index_file.write_text(gallery_html, encoding="utf-8")
        print(f"  ✨ Đã cập nhật Gallery: {index_file}")

        
    return results

def main():
    if len(sys.argv) < 2:
        print("Cách dùng:")
        print("  python3 scripts/render_diagrams.py <file-or-dir> [output-dir]")
        sys.exit(1)
        
    target = Path(sys.argv[1]).resolve()
    out_dir = Path(sys.argv[2]).resolve() if len(sys.argv) > 2 else None
    
    if target.is_file():
        files = [target]
    else:
        files = list(target.rglob("*.md"))
        
    all_rendered = []
    for f in files:
        res = process_markdown_file(f, out_dir)
        all_rendered.extend(res)
        
    print(f"\n🎉 Hoàn thành! Đã tạo tổng cộng {len(all_rendered)} visual diagrams.")

if __name__ == "__main__":
    main()
