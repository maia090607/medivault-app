"""Compatibilidad MediVault en BrowserStack Automate.
Lee credenciales de env BS_USER / BS_KEY (no hardcodear en repo).
Matriz: Chrome Win11, Edge Win11, Firefox Win10, Safari macOS, Galaxy S23.
Prueba humo: carga prod, verifica landing + navega a login.
Uso: $env:BS_USER='...'; $env:BS_KEY='...'; python test_compat.py
"""
import os, sys, time
from selenium import webdriver

URL = "https://medivault-app.vercel.app"
USER = os.getenv("BS_USER", "")
KEY = os.getenv("BS_KEY", "")
if not USER or not KEY:
    print("Faltan env BS_USER / BS_KEY")
    sys.exit(2)

MATRIX = [
    {"os": "Windows", "osVersion": "11", "browserName": "Chrome", "browserVersion": "latest", "name": "Chrome Win11"},
    {"os": "Windows", "osVersion": "11", "browserName": "Edge", "browserVersion": "latest", "name": "Edge Win11"},
    {"os": "Windows", "osVersion": "10", "browserName": "Firefox", "browserVersion": "latest", "name": "Firefox Win10"},
    {"os": "OS X", "osVersion": "14", "browserName": "Safari", "browserVersion": "17", "name": "Safari macOS"},
    {"deviceName": "Samsung Galaxy S23", "osVersion": "13.0", "browserName": "Chrome", "name": "Galaxy S23"},
]

results = []
for caps in MATRIX:
    bstack = {
        "userName": USER, "accessKey": KEY,
        "projectName": "MediVault", "buildName": "Compat-1",
        "sessionName": caps.pop("name"),
        "seleniumVersion": "4.0.0",
    }
    caps["bstack:options"] = bstack
    print(f"[{caps['bstack:options']['sessionName']}] iniciando...")
    # Selenium 4: pasar caps via Options set_capability
    from selenium.webdriver.chrome.options import Options as C
    opts = C()
    for k, v in caps.items():
        if k != "bstack:options":
            opts.set_capability(k, v)
    opts.set_capability("bstack:options", bstack)
    try:
        d = webdriver.Remote(command_executor=f"https://{USER}:{KEY}@hub-cloud.browserstack.com/wd/hub", options=opts)
        d.set_page_load_timeout(60)
        d.get(URL)
        time.sleep(5)
        title_ok = "MediVault" in (d.title or "") or "MediVault" in d.page_source or "farmacia" in d.page_source.lower()
        # intentar ir a login
        try:
            btn = None
            for xp in ["//button[contains(.,'Ingresar al Sistema')]", "//button[contains(.,'Iniciar Sesi')]"]:
                els = d.find_elements("xpath", xp)
                if els:
                    btn = els[0]; break
            if btn:
                btn.click(); time.sleep(3)
            login_ok = len(d.find_elements("xpath", "//input[@type='email']")) > 0
        except Exception as e:
            login_ok = False
            print("  nav login:", str(e)[:100])
        ok = title_ok and login_ok
        print(f"  {'PASS' if ok else 'FAIL'} title={title_ok} login={login_ok}")
        results.append((bstack["sessionName"], ok))
        try:
            d.execute_script('browserstack_executor: {"action": "setSessionStatus", "arguments": {"status":"passed" if ok else "failed"}}'.replace("passed" if ok else "failed", "passed" if ok else "failed"))
        except Exception:
            pass
        d.quit()
    except Exception as e:
        print("  ERROR:", str(e)[:300])
        results.append((bstack["sessionName"], False))

print("\n=== COMPATIBILIDAD ===")
for n, r in results:
    print(f"{n}: {'PASS' if r else 'FAIL'}")
sys.exit(0 if all(r for _, r in results) else 1)
