import React, { useState } from 'react';
import Login from './views/Login';
import DashboardMedico from './views/DashboardMedico';
import DashboardFarmacia from './views/DashboardFarmacia';
import './App.css';

function App() {
  // 1. ESTADO DE AUTENTICACIÓN
  const [user, setUser] = useState(null);

  // 2. ESTADO GLOBAL DE INVENTARIO (Compartido entre roles)
  const [inventario, setInventario] = useState([
    { id: 1, nombre: "Insulina", stock: 45 },
    { id: 2, nombre: "Metformina", stock: 120 },
    { id: 3, nombre: "Ibuprofeno", stock: 80 },
    { id: 4, nombre: "Paracetamol", stock: 15 },
    { id: 5, nombre: "Amoxicilina", stock: 60 }
  ]);

  // 3. ESTADO GLOBAL DE RECETAS (Para validación de Token en tiempo real)
  const [recetasEmitidas, setRecetasEmitidas] = useState([]);

  // Lógica de Login Corregida: Ahora utiliza la variable 'password'
  const handleLogin = (email, password) => {
    // Verificación básica de campos vacíos
    if (!email || !password) {
      alert("Por favor, complete todos los campos para ingresar.");
      return;
    }

    // Validación de credenciales y asignación de roles
    // Puedes usar cualquier contraseña para este prototipo
    if (email === "medico@medivault.com" && password !== "") {
      setUser({ id: 'M01', nombre: "Dr. Casas", rol: "medico" });
    } else if (email === "farmacia@medivault.com" && password !== "") {
      setUser({ id: 'F01', nombre: "Farm. Ana", rol: "farmacia" });
    } else {
      alert("Credenciales incorrectas. Intente con medico@medivault.com o farmacia@medivault.com");
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  // RENDERIZADO CONDICIONAL: Garantiza que el prototipo sea navegable por roles
  return (
    <div className="app-container">
      {!user ? (
        <Login onLogin={handleLogin} />
      ) : user.rol === "medico" ? (
        /* Vista de Médico: Nueva Receta e Historial */
        <DashboardMedico 
          user={user} 
          onLogout={handleLogout} 
          inventario={inventario}
          recetasEmitidas={recetasEmitidas}
          setRecetasEmitidas={setRecetasEmitidas} 
        />
      ) : (
        /* Vista de Farmacia: Validación de Token e Inventario */
        <DashboardFarmacia 
          user={user} 
          onLogout={handleLogout} 
          inventario={inventario}
          setInventario={setInventario}
          recetasEmitidas={recetasEmitidas}
          setRecetasEmitidas={setRecetasEmitidas}
        />
      )}
    </div>
  );
}

export default App;