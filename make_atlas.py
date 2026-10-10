"""Build the public MXene Atlas pages in atlas/ (v2, 2026-10-11, MXENE-T1).
EN map/explore come from the share package (build_share_package.py, private fields removed); KO map/explore from the
internal presentations (only the maker tag is internal there). Book = make_public_book.py (run after this).
Layout: index.html (EN map) · explore.html (EN) · ko.html (KO map) · explore.ko.html (KO) · guide.html (kept, not rebuilt) · book/
Adds noindex, "How to cite", fixes cross-links, removes status-board links (the status board is an internal work log).
"""
import os
import re

EN = r"C:\Users\samsung\2026\02\share-DRAFT\mxene-atlas-public-full"
KO = r"C:\Users\samsung\2026\02\monet\presentations\mxene-atlas-p2-map-2026-10-07"
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "atlas")
NOINDEX = '<meta name="robots" content="noindex, nofollow">'
URL = "https://songt-50.github.io/mxene-3d/atlas/"
CITE_EN = " · How to cite: Song, T.-E. MXene Atlas (2026), " + URL
CITE_KO = " · 인용: Song, T.-E. MXene Atlas (2026), " + URL
EXPLAINER = "https://songt-50.github.io/mxene-3d/"

PLAN = [
    (os.path.join(EN, "index.en.html"), "index.html", "en", [
        ('href="explore.en.html"', 'href="explore.html"'), ('href="index.html">한국어', 'href="ko.html">한국어'),
        ('href="../mxene-explainer-en-2026-10-06/mxene-explainer.html"', 'href="' + EXPLAINER + '"')]),
    (os.path.join(EN, "explore.en.html"), "explore.html", "en", [
        ('href="explore.html">한국어', 'href="explore.ko.html">한국어'), ('href="index.en.html"', 'href="index.html"')]),
    (os.path.join(KO, "index.html"), "ko.html", "ko", [
        ('href="explore.html"', 'href="explore.ko.html"'), ('href="index.en.html"', 'href="index.html"'),
        ('href="../mxene-atlas-book-2026-10-08/index.html"', 'href="book/index.html"'),
        ('href="../mxene-explainer-en-2026-10-06/mxene-explainer.html"', 'href="' + EXPLAINER + '"')]),
    (os.path.join(KO, "explore.html"), "explore.ko.html", "ko", [
        ('href="explore.en.html"', 'href="explore.html"'), ('href="index.html"', 'href="ko.html"')]),
]
STATUS_LINK = re.compile(r'<a [^>]*href="(status/index\.en\.html|\.\./mxene-atlas-status-2026-10-07/index\.html)"[^>]*>.*?</a>\s*(·\s*)?', re.S)
MAKER = re.compile(r"(Made by terminal|제작 터미널):?\s*MXENE-T1\s*·?\s*")
COPY = re.compile(r"(© 2026 (Tae-Eun Song|송태은)[^<]*?(permission|금지))")

for src, dst, lang, pairs in PLAN:
    t = open(src, encoding="utf-8").read()
    for old, new in pairs:
        t = t.replace(old, new)
    if lang == "en":   # the "한국어" button: point to the Korean page whatever the attribute order
        ko = "ko.html" if dst == "index.html" else "explore.ko.html"
        t = re.sub(r'(<a[^>]*?)href="[^"]*"([^>]*>한국어</a>)', lambda m: m.group(1) + 'href="' + ko + '"' + m.group(2), t)
    t, ns = STATUS_LINK.subn("", t)
    t, nm = MAKER.subn("", t)
    if "Song, T.-E. MXene Atlas" not in t:
        t, nc = COPY.subn(lambda m: m.group(1) + (CITE_EN if lang == "en" else CITE_KO), t)
    else:
        nc = 0
    assert t.count("<head>") == 1
    if NOINDEX not in t:
        t = t.replace("<head>", "<head>\n" + NOINDEX, 1)
    if dst == "index.html" and 'href="guide.html"' not in t:
        o = '<a class="lang" href="explore.html">🧭 Explore mode (3D)</a>'
        if o in t:
            t = t.replace(o, o + '<a class="lang" href="guide.html">📖 How to use</a>')
    open(os.path.join(DST, dst), "w", encoding="utf-8").write(t)
    local = sorted(set(re.findall(r'href="([^"#]*\.html)"', t)) - {"index.html", "ko.html", "explore.html", "explore.ko.html", "guide.html", "book/index.html", "book/index.en.html"})
    local = [h for h in local if not h.startswith("http")]
    print(dst, "status links removed", ns, "maker", nm, "cite", nc, "| other local links:", local)
