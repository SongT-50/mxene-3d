#!/usr/bin/env python
# -*- coding: utf-8 -*-
"""Build a single self-contained HTML (works offline): template + three.js r147 (MIT) + OrbitControls + app.js.
Usage: python build.py  -> vapor.html
"""
import os

HERE = os.path.dirname(os.path.abspath(__file__))
rd = lambda *p: open(os.path.join(HERE, *p), encoding="utf-8").read()
t = rd("src-vapor", "template.html")
for key, body in [("/*__THREE__*/", rd("vendor", "three.min.js")), ("/*__ORBIT__*/", rd("vendor", "OrbitControls.js")), ("/*__APP__*/", rd("src-vapor", "app.js"))]:
    assert t.count(key) == 1, key
    assert "</script" not in body.lower(), key
    t = t.replace(key, body)
out = os.path.join(HERE, "vapor.html")
open(out, "w", encoding="utf-8").write(t)
print("built", out, round(len(t.encode("utf-8")) / 1024), "KB")
