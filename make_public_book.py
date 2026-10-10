"""Public edition of the MXene Atlas book (KO + EN) → atlas/book/ (2026-10-11, MXENE-T1).
Removes: who downloaded paywalled papers (colleague / zip), internal file paths, internal maker tag,
the named plan to ask Prof. Gogotsi last, and the named quote of his private reply. Nothing else changes.
EN base = the share copy (private sentence fields already removed by build_share_package.py).
"""
import os
import re

KO_SRC = r"C:\Users\samsung\2026\02\monet\presentations\mxene-atlas-book-2026-10-08\index.html"
EN_SRC = r"C:\Users\samsung\2026\02\share-DRAFT\mxene-atlas-public-full\book\index.en.html"
DST = os.path.join(os.path.dirname(os.path.abspath(__file__)), "atlas", "book")
os.makedirs(DST, exist_ok=True)
NOINDEX = '<meta name="robots" content="noindex, nofollow">'

KO = [
    ("그 목록을 동료에게 건넸더니, 동료가 하나씩 손으로 내려받아 압축 파일 두 묶음으로 보내 주었다.", "그중 정당하게 열 수 있는 논문을 사람이 하나씩 손으로 받았다."),
    ("동료가 손으로 받아 온 논문", "사람이 손으로 받은 논문"),
    ("동료와 브라우저로 받아 온 논문은", "사람이 브라우저로 받은 논문은"),
    ("동료와 브라우저로 받은 출판사 본문도", "사람이 브라우저로 받은 출판사 본문도"),
    ("앞으로 동료가 받아 올 새 논문", "앞으로 새로 받을 논문"),
    ("이 분야의 대가인 고고치 교수께는", "이 분야의 대가께는"),
    ("고고치 교수가 «그룹에 공유하고 수업에 쓰겠다」고 답했다", "이 분야를 이끄는 교수 한 분이 «그룹에 공유하고 수업에 쓰겠다」고 답했다"),
    ("G3 = 동료 + 고고치 교수", "G3 = 동료 + 이 분야 전문가"),
    ("(zip 1차 38", "(1차 38"),
]
EN = [
    ("We handed that list to a colleague, who downloaded them one by one by hand and sent them back in two compressed archives.", "Those that could be opened legitimately were then retrieved by hand, one by one."),
    ("(The story of papers blocked to programs being fetched by hand by a person is in Chapter 7.)", "(Papers that publishers blocked from programs are covered in Chapter 7.)"),
    ("Hand-downloaded by a colleague", "Retrieved by hand"),
    ("Papers a colleague downloaded by hand", "Papers retrieved by hand"),
    ("papers a colleague downloaded by hand", "papers retrieved by hand"),
    ("Papers a colleague downloaded through a browser", "Papers retrieved through a browser"),
    ("publisher full texts obtained through a colleague and a browser", "publisher full texts retrieved through a browser"),
    ("new papers that colleagues bring in", "new papers obtained"),
    ("(zip batch 1:", "(batch 1:"),
    ("G3 = colleagues + Professor Gogotsi", "G3 = colleagues + specialists in the field"),
]
REGEX = [  # both languages: internal paths and maker tag
    (r"(동료 부탁 목록|List sent to the colleague):\s*(<[^>]+>)*\s*p16_nonti_oa/REQUEST-colleague-nonTi-137-ordered\.md\s*(</[^>]+>)*\s*\.", ""),
    (r"(초안|draft)\s*(<[^>]+>)*\s*intelligence/mxene-atlas/DRAFT-book-closing-chapter-2026-10-09\.md\s*(</[^>]+>)*\s*\.", ""),
    (r"(제작 터미널|Made by terminal):\s*MXENE-T1\s*·\s*", ""),
]
CHECK = re.compile(r"압축|zip|REQUEST-colleague|DRAFT-book|MXENE-T1|고고치|Gogotsi|colleague who|동료에게 건넸|C:\\\\Users", re.I)


def build(src, pairs, out):
    t = open(src, encoding="utf-8").read()
    for old, new in pairs:
        n = t.count(old)
        print(("  ok " if n else "  MISS ") + str(n), old[:60])
        t = t.replace(old, new)
    for pat, rep in REGEX:
        t, n = re.subn(pat, rep, t)
        print("  regex", n, pat[:50])
    assert t.count("<head>") == 1
    t = t.replace("<head>", "<head>\n" + NOINDEX, 1)
    open(os.path.join(DST, out), "w", encoding="utf-8").write(t)
    vis = re.sub(r"<script.*?</script>|<style.*?</style>", " ", t, flags=re.S)
    vis = re.sub(r"<[^>]+>", " ", vis)
    left = sorted({m.group(0) for m in CHECK.finditer(vis)})
    print(out, "left (visible):", left)


print("KO"); build(KO_SRC, KO, "index.html")
print("EN"); build(EN_SRC, EN, "index.en.html")
