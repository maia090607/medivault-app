
# MediVault - Sistema de Gestión Sanitaria Digital

MediVault es una plataforma integral diseñada para optimizar el ciclo de prescripción médica y el control de inventario farmacológico. El sistema resuelve la problemática de la falsificación de recetas mediante el uso de tokens de seguridad de un solo uso y centraliza la información clínica en un Historial Clínico Digital accesible en tiempo real.


## 🚀 Tecnologías y Herramientas
* **Frontend**: React.js (Biblioteca para interfaces de usuario dinámicas).
* **Construcción**: Vite (Entorno de desarrollo de alto rendimiento).
* **Backend-as-a-Service (BaaS)**: Firebase (Firestore para base de datos NoSQL).
* **Diseño**: CSS-in-JS con enfoque en accesibilidad y alto contraste.

---

## ⚙️ Instalación y Configuración
1. **Clonar el repositorio**:
   ```bash
   git clone (https://github.com/maia090607/medivault-app.git)

2. Instalar dependencias 
    npm install

3. Lanzar el entorno de desarrollo:
    npm run dev

## Gestión de Roles y Accesos
El sistema implementa una validación estricta de credenciales para garantizar la seguridad:

1. Portal Médico:

    Usuario: medico@medivault.com
    Contraseña: medico
    Funciones: Emisión de recetas con token de 6 dígitos, consulta de historial clínico y firma con PIN (1234).

2. Portal Farmacia:

    Usuario: farmacia@medivault.com
    Contraseña: farmacia
    Funciones: Validación de tokens en tiempo real y despacho de medicamentos.

## Estructura del Proyecto (src/)
1.  views/: Componentes principales (Landing, Login, DashboardMedico, DashboardFarmacia).

2. firebase.js: Configuración de la conexión con Google Cloud Firestore.

3. App.jsx: Enrutamiento y gestión de estados globales.