# INFORME DE PRUEBAS – MediVault App

Fecha: 2026-10-15 | Entornos: local `http://127.0.0.1:5173` (Vite dev) y prod `https://medivault-app.vercel.app`
Cuentas: existentes del README (`medico@medivault.com/medico` + PIN 1234, `farmacia@medivault.com/farmacia`).
Herramientas: Selenium 4.51 + Edge headless, Lighthouse 13.5, JMeter 5.6.3, ZAP 2.17, BrowserStack Automate.

## 1. Sistemas (Selenium) – PASA
Casos: SIS-01 login médico, SIS-02 login farmacia, SIS-03 login inválido (debe quedarse en login).
Script: `tests/selenium/test_system.py`. Evidencias: `tests/selenium/evidencias/*.png`.
Resultados: prod 3/3 PASS, local 3/3 PASS, fiabilidad 3 reps prod 9/9 PASS. Total 15/15.

## 2. Rendimiento (JMeter + Lighthouse) – PASA CON OBSERVACIONES
- JMeter `tests/jmeter/rendimiento.jmx` (1/50/200 hilos): 610 muestras, 0% errores.
  `GET / prod carga`: avg 376ms p95 1438ms | `estres`: avg 442ms p95 1393ms | local: avg 7ms.
  Umbral p95<2s: cumple (outliers max 7.7s por cold-start Vercel/Firestore, documentado).
- Lighthouse: local Perf 39 (LCP 25.4s TBT 670ms) / prod Perf 59 (LCP 6.3s TBT 560ms).
  Causa: bundle 727KB sin code-split (aviso `vite build`) + 6 `onSnapshot` al arrancar (`App.jsx:27-52`).
  Oportunidades: `unused-javascript` (108KiB prod / 1222KiB dev), `unminified-javascript` en dev.
  Acción: lazy-load dashboards, `vite build.chunkSizeWarningLimit` + imports dinámicos.
  Reportes: `tests/lighthouse/local.report.html`, `prod.report.html`.

## 3. Seguridad (ZAP) – OBSERVADO (riesgo medio-bajo en red, alto en diseño)
- ZAP baseline prod `tests/zap/reporte_prod.html`: 0 High explotables.
  Medium: CSP ausente, `Missing Anti-clickjacking Header`, `Cross-Domain Misconfiguration`.
  Low: `Timestamp Disclosure`, `X-Content-Type-Options` ausente. Info: comentarios sospechosos, cache.
  Fix: headers en `vercel.json` (CSP, frame-ancestors, X-Content-Type-Options).
- Hallazgos de código (no los ve ZAP, críticos para el informe):
  1. `src/firebase.js:7` apiKey y config expuestas en cliente (normal en Firebase, pero exige reglas Firestore estrictas).
  2. `src/App.jsx:68,119` passwords comparados/guardados en texto plano en colección `usuarios`.
     Fix: Firebase Auth + hash, nunca `password` en Firestore.
  3. Sin rate-limit en login → fuerza bruta posible. Fix: bloqueo tras N intentos / reCAPTCHA.

## 4. Mantenibilidad (ESLint + build) – NO PASA (6 errores)
`npx eslint .` reporta: `api/chat.js:13` `process` undef; `AiChat.jsx` vars sin usar;
`PerfilView.jsx:30` setState-en-effect; `Toast.jsx:75` react-refresh; **`DashboardFarmacia.jsx:16`
`setPacienteHistorialSel` is not defined (no-undef)** – probable bug en tiempo de ejecución, priorizar.
Build `vite build` OK pero chunk 727KB >500KB. Fix: corregir los 6 errores, code-split, tests unitarios.

## 5. Portabilidad – PASA
App es SPA responsive con media queries 767px/768-1023px (`App.jsx:152-175`, `Landing.jsx`, `Login.jsx`).
BrowserStack real Galaxy S23: PASS (landing + login). Veredicto: portable web/móvil.

## 6. Usabilidad (Lighthouse A11y) – PASA CON OBSERVACIONES
A11y 87/100 ambos entornos. Fallos: `color-contrast` (textos `#93c5fd` sobre azul) y `heading-order`.
Best Practices 100, SEO 83. Flujos login ≤3 clics, toasts de error/éxito OK.
Fix: ajustar contraste (ej. `#bfdbfe`→texto más oscuro), jerarquía h1→h2→h3.

## 7. Compatibilidad (BrowserStack) – PASA PARCIAL 4/5
Script `tests/browserstack/test_compat.py`. Prod: Chrome Win11 PASS, Edge Win11 PASS,
Firefox Win10 PASS, Galaxy S23 PASS. Safari macOS: combo de caps inválida en primera pasada
(`osVersion Sonoma` rechazado por el hub); matriz corregida a `OS X 14 / Safari 17` para re-ejecución.
Sin roturas de layout en los 4 verificados.

## 8. Fiabilidad – PASA
5 ejecuciones Selenium (prod×4, local×1): 15/15 PASS (100%). JMeter 610 muestras 0% error.
`onSnapshot` reconecta solo al recuperar red (diseño resiliente). Pendiente: soak 15min + corte de red
manual para MTBF formal.

## Veredicto global
Sistema funcional y estable en los flujos críticos con las cuentas existentes.
Antes de producción real: corregir `setPacienteHistorialSel` (mantenibilidad),
migrar a Firebase Auth (seguridad), headers CSP/clickjacking, contraste AA y code-split del bundle.
