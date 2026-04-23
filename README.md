# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.




# MediVault - Sistema de Gestión Farmacéutica

Este es un prototipo navegable para la gestión de recetas digitales y control de inventario desarrollado con **React**. El sistema resuelve la problemática de la falsificación de recetas y el descontrol de inventario mediante el uso de tokens de seguridad de un solo uso.

## 📋 Requisitos Previos
* Node.js instalado (versión 16 o superior).
* Gestor de paquetes **npm** (viene incluido con Node.js).

## ⚙️ Instalación
Siga estos pasos para configurar el proyecto en su entorno local:

1. Clonar el repositorio:
   ```bash
   git clone [https://github.com/maia090607/medivault-app.git](https://github.com/maia090607/medivault-app.git)

2. Entrar al directorio del proyecto
    cd medivault-app

3. Instalar las dependencias
    npm install

4. Credenciales de Acceso (Roles)
El sistema implementa una gestión de roles para separar las funciones médicas de las farmacéuticas:
Rol Médico:
    Usuario: medico@medivault.com
    Contraseña: 123 (o cualquier texto)
    Funciones: Emisión de recetas y consulta de historial.

Rol Farmacia:
    Usuario: farmacia@medivault.com
    Contraseña: 123 (o cualquier texto)
    Funciones: Validación de tokens y control de inventario.

5. Pantallas del Prototipo
Para cumplir con los requisitos del proyecto, el sistema incluye las siguientes 5 pantallas navegables:
    Login: Interfaz de autenticación segura.
    Emisión de Receta (Médico): Formulario para generar órdenes con selección de medicamentos en stock.
    Historial de Recetas (Médico): Registro de pacientes atendidos y tokens generados.
    Validación de Token (Farmacia): Buscador de órdenes mediante código de seguridad.
    Inventario (Farmacia): Visualización y descuento automático de stock tras la entrega.