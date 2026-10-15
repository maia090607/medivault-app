import os, time, re
from selenium import webdriver
from selenium.webdriver.safari.options import Options as S
USER = os.getenv("BS_USER"); KEY = os.getenv("BS_KEY")
opts = S()
opts.set_capability("os", "OS X")
opts.set_capability("osVersion", "Sonoma")
opts.set_capability("browserVersion", "17.6")
opts.set_capability("bstack:options", {"userName": USER, "accessKey": KEY, "projectName": "MediVault", "buildName": "Compat-retry", "sessionName": "Safari retry", "seleniumVersion": "4.0.0"})
d = webdriver.Remote(command_executor=f"https://{USER}:{KEY}@hub-cloud.browserstack.com/wd/hub", options=opts)
d.set_page_load_timeout(90)
d.get("https://medivault-app.vercel.app")
time.sleep(8)
print("TITLE:", repr((d.title or "")[:120]))
src = d.page_source
print("LEN:", len(src))
print("HAS_EMAIL_INPUT:", len(d.find_elements("xpath", "//input[@type='email']")))
btns = [(e.text or "")[:60] for e in d.find_elements("xpath", "//button")[:8]]
print("BUTTONS:", btns)
print("HAS_INGRESAR:", "Ingresar" in src or "Iniciar" in src)
d.quit()
