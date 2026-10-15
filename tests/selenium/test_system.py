"""Pruebas de Sistemas MediVault - Selenium + Edge/Chrome.
Usa correos existentes: medico@medivault.com/medico, farmacia@medivault.com/farmacia
URL: env BASE_URL o arg. Default prod Vercel.
"""
import os, sys, time
from datetime import datetime
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

BASE_URL = os.getenv("BASE_URL", sys.argv[1] if len(sys.argv) > 1 else "https://medivault-app.vercel.app")
OUT = os.path.join(os.path.dirname(__file__), "evidencias")
os.makedirs(OUT, exist_ok=True)

def make_driver():
    opts = webdriver.EdgeOptions() if os.getenv("USE_EDGE", "1") == "1" else webdriver.ChromeOptions()
    opts.add_argument("--headless=new")
    opts.add_argument("--window-size=1366,900")
    opts.add_argument("--no-sandbox")
    try:
        if "Edge" in type(webdriver.EdgeOptions()).__name__ and os.getenv("USE_EDGE", "1") == "1":
            return webdriver.Edge(options=opts)
    except Exception as e:
        print(f"Edge fallo ({e}), pruebo Chrome...")
    return webdriver.Chrome(options=opts)

def shot(driver, name):
    p = os.path.join(OUT, f"{datetime.now().strftime('%H%M%S')}_{name}.png")
    driver.save_screenshot(p)
    print(f"  evidencia: {p}")

def goto_login(driver):
    driver.get(BASE_URL)
    w = WebDriverWait(driver, 25)
    # Esperar landing y click Ingresar
    try:
        btn = w.until(EC.element_to_be_clickable((By.XPATH, "//button[contains(.,'Ingresar al Sistema') or contains(.,'Iniciar Sesi')]")))
        btn.click()
    except Exception:
        pass  # quizas ya esta en login
    w.until(EC.presence_of_element_located((By.XPATH, "//input[@type='email']")))
    shot(driver, "login_visible")

def do_login(driver, email, password, rol_text):
    w = WebDriverWait(driver, 20)
    # seleccionar rol
    try:
        tab = w.until(EC.element_to_be_clickable((By.XPATH, f"//button[contains(.,'{rol_text}')]")))
        tab.click()
        time.sleep(0.5)
    except Exception as e:
        print(f"  tab rol no clickeable: {e}")
    email_i = driver.find_element(By.XPATH, "//input[@type='email']")
    pass_i = driver.find_element(By.XPATH, "//input[@type='password']")
    email_i.clear(); email_i.send_keys(email)
    pass_i.clear(); pass_i.send_keys(password)
    submit = driver.find_element(By.XPATH, "//button[@type='submit']")
    submit.click()
    time.sleep(4)  # espera onSnapshot Firestore
    shot(driver, f"post_login_{email.split('@')[0]}")

def test_login_medico(driver):
    print("[SIS-01] Login medico existente...")
    goto_login(driver)
    do_login(driver, "medico@medivault.com", "medico", "Médico")
    src = driver.page_source
    ok = "Receta" in src or "Paciente" in src or "Inventario" in src or "Dashboard" in src or "Historial" in src
    print(f"  {'PASS' if ok else 'FAIL'} - dashboard medico visible: {ok}")
    return ok

def test_login_farmacia(driver):
    print("[SIS-02] Login farmacia existente...")
    goto_login(driver)
    do_login(driver, "farmacia@medivault.com", "farmacia", "Farmacia")
    src = driver.page_source
    ok = "Token" in src or "Receta" in src or "Despacho" in src or "Inventario" in src or "Validar" in src
    print(f"  {'PASS' if ok else 'FAIL'} - dashboard farmacia visible: {ok}")
    return ok

def test_login_invalido(driver):
    print("[SIS-03] Login invalido debe fallar...")
    goto_login(driver)
    do_login(driver, "noexiste@medivault.com", "wrong123", "Médico")
    time.sleep(2)
    src = driver.page_source
    # debe seguir en login (input email visible) y NO entrar a dashboard
    sigue_login = len(driver.find_elements(By.XPATH, "//input[@type='email']")) > 0
    print(f"  {'PASS' if sigue_login else 'FAIL'} - se queda en login: {sigue_login}")
    return sigue_login

if __name__ == "__main__":
    print(f"BASE_URL={BASE_URL}")
    d = make_driver()
    results = []
    try:
        results.append(("SIS-01 medico", test_login_medico(d)))
        results.append(("SIS-02 farmacia", test_login_farmacia(d)))
        results.append(("SIS-03 invalido", test_login_invalido(d)))
    finally:
        d.quit()
    print("\n=== RESUMEN SISTEMAS ===")
    for n, r in results:
        print(f"{n}: {'PASS' if r else 'FAIL'}")
    sys.exit(0 if all(r for _, r in results) else 1)
