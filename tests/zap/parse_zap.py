import re
html = open('tests/zap/reporte_prod.html', encoding='utf-8').read()
alerts = re.findall(r'<tr>\s*<td[^>]*>(.*?)</td>\s*<td[^>]*>(High|Medium|Low|Informational)', html, re.S)
seen = set()
for a, r in alerts:
    a = re.sub(r'<[^>]+>', '', a).strip()[:100]
    if (a, r) not in seen:
        seen.add((a, r))
        print(r, '|', a)
