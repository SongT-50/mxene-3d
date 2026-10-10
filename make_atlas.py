"""Copy the shared MXene Atlas files into atlas/ for GitHub Pages (2026-10-11, MXENE-T1).
- index.en.html -> atlas/index.html (map) · explore.en.html -> atlas/explore.html · START-HERE.html -> atlas/guide.html
- adds <meta name="robots" content="noindex"> (early-stage data; reachable by link, kept out of search)
- fixes cross-links; adds a "How to use" link on the map; adapts the guide's "How to open" for the web
"""
import os
import re

SRC = r"C:\Users\samsung\2026\02\share-DRAFT\mxene-atlas-for-gogotsi"
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "atlas")
os.makedirs(DST, exist_ok=True)
NOINDEX = '<meta name="robots" content="noindex, nofollow">'


def links(t):
    return t.replace('href="index.en.html"', 'href="index.html"').replace('href="explore.en.html"', 'href="explore.html"').replace('href="START-HERE.html"', 'href="guide.html"')


def noindex(t):
    assert t.count("<head>") == 1
    return t.replace("<head>", "<head>\n" + NOINDEX, 1)


for src, dst in [("index.en.html", "index.html"), ("explore.en.html", "explore.html"), ("START-HERE.html", "guide.html")]:
    t = open(os.path.join(SRC, src), encoding="utf-8").read()
    t = noindex(links(t))
    if dst == "index.html":
        o = '<a class="lang" href="explore.html">🧭 Explore mode (3D)</a>'
        assert t.count(o) == 1, "explore link"
        t = t.replace(o, o + '<a class="lang" href="guide.html">📖 How to use</a>')
    if dst == "guide.html":
        o = "<li>Unzip the folder and double-click <b>START-HERE.html</b> (or the two pages directly). Chrome or Edge recommended.</li>"
        assert t.count(o) == 1, "guide open line"
        t = t.replace(o, "<li>Open the links above in any modern browser (Chrome, Edge, Safari or Firefox); the map also works on a phone, though a larger screen is easier.</li>")
        o2 = "<li>Browsing works offline. Internet is needed only for <b>the 3D network on the Map page</b> (it loads a public graphics library) and for external links such as DOIs.</li>"
        assert t.count(o2) == 1, "guide offline line"
        t = t.replace(o2, "<li>The 3D network on the Map page loads a public graphics library, so give it a few seconds on the first visit.</li>")
    open(os.path.join(DST, dst), "w", encoding="utf-8").write(t)
    left = re.findall(r'href="[^"]*\.en\.html"|START-HERE', t)
    print(dst, len(t) // 1024, "KB", "leftover links:", left)
