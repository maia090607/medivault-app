import json
for env in ("prod", "local"):
    d = json.load(open(f"tests/lighthouse/{env}.report.json", encoding="utf-8"))
    print(f"== {env} a11y fails ==")
    for k, a in d["audits"].items():
        if a.get("score") == 0 and "accessibility" in str(a.get("metricGroup", "")) or (a.get("score") == 0 and k in ("color-contrast", "image-alt", "label", "link-name", "button-name", "aria-allowed-attr", "heading-order", "html-has-lang", "meta-viewport", "focus-traps", "interactive-supports-focus", "offscreen-content-hidden", "tabindex")):
            print("-", k, "|", (a.get("title") or "")[:80])
    # listar todas score 0/None con peso a11y
    print(f"== {env} perf top opportunities ==")
    for k in ("render-blocking-resources", "unused-javascript", "unminified-javascript", "uses-long-cache-ttl", "efficient-animated-content"):
        a = d["audits"].get(k)
        if a:
            print("-", k, "|", (a.get("displayValue") or a.get("score")), "|", (a.get("title") or "")[:70])
