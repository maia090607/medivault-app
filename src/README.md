# MediVault - Sistema de Gestión Farmacéutica

Este es un prototipo navegable para la gestión de recetas digitales y control de inventario.

## Requisitos Previos
* Node.js instalado (versión 16 o superior).

## Instalación
1. Clonar el repositorio.
2. Abrir una terminal en la carpeta del proyecto.
3. Ejecutar el comando para instalar dependencias:
   ```bash
   npm install


para ejecutar:
     npm run dev

### Credenciales de Acceso
 -  Médico: medico@medivault.com (Contraseña: cualquiera)

 - Farmacia: farmacia@medivault.com (Contraseña: cualquiera)

 ### Verificación de Roles y Navegabilidad
El código proporcionado en `App.jsx` gestiona los roles de forma automática. Al ingresar con el correo de médico, el sistema solo muestra las opciones de "Nueva Receta" e "Historial". Al ingresar como farmacéutico, se habilitan "Entrega" e "Inventario".

