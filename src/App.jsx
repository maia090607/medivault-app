import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import Landing from './views/Landing';
import DashboardMedico from './views/DashboardMedico';
import DashboardFarmacia from './views/DashboardFarmacia';

function App() {
  const [paso, setPaso] = useState('landing'); 
  const [user, setUser] = useState(null);

  const [inventario, setInventario] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [historiales, setHistoriales] = useState([]);
  const [usuariosDB, setUsuariosDB] = useState([]);

  useEffect(() => {
    const unsubInv = onSnapshot(collection(db, "inventario"), (snap) => {
      setInventario(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubRec = onSnapshot(collection(db, "recetas"), (snap) => {
      setRecetas(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
    const unsubPac = onSnapshot(collection(db, "pacientes"), (snap) => {
      setPacientes(snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        dni: d.data().dni ? String(d.data().dni).trim() : "" 
      })));
    });
    const unsubHist = onSnapshot(collection(db, "historiales"), (snap) => {
      setHistoriales(snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        dniPaciente: d.data().dniPaciente ? String(d.data().dniPaciente).trim() : "" 
      })));
    });
    const unsubUser = onSnapshot(collection(db, "usuarios"), (snap) => {
      setUsuariosDB(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });

    return () => { unsubInv(); unsubRec(); unsubPac(); unsubHist(); unsubUser(); };
  }, []);

  const manejarLoginDirecto = (credenciales) => {
    const { email, password, rol } = credenciales;
    
    if (!usuariosDB || usuariosDB.length === 0) {
      alert("⚠️ Conectando con la base de datos... Intente de nuevo en un segundo.");
      return;
    }

    const usuarioEncontrado = usuariosDB.find(u => {
      const correoFirestore = u.correo || u.email || "";
      const emailMatch = correoFirestore.toLowerCase().trim() === email.toLowerCase().trim();
      const passwordMatch = u.password && String(u.password).trim() === String(password).trim();
      const roleMatch = u.role && u.role.toLowerCase().trim() === rol.toLowerCase().trim();
      
      return emailMatch && passwordMatch && roleMatch;
    });

    if (usuarioEncontrado) {
      setUser({
        email: usuarioEncontrado.correo || usuarioEncontrado.email,
        nombre: usuarioEncontrado.nombre || (rol === 'medico' ? "Dr. Especialista" : "Operador Farmacia"),
        role: usuarioEncontrado.role,
        pin: usuarioEncontrado.pin || "1234"
      });
      setPaso('app'); 
    } else {
      alert(`❌ Error de acceso.\n\nNo se encontró ninguna cuenta que coincida con:\n• Correo: ${email}\n• Rol: ${rol}\n\nVerifique sus datos o regístrese.`);
    }
  };

  const manejarRegistroDirecto = async (nuevoUsuario) => {
    try {
      const emailLimpio = nuevoUsuario.email ? nuevoUsuario.email.toLowerCase().trim() : "";
      const rolFiltrado = (nuevoUsuario.rol || nuevoUsuario.role || 'medico').toLowerCase().trim();

      const existe = usuariosDB.some(u => {
        const correoF = u.correo || u.email || "";
        return correoF.toLowerCase().trim() === emailLimpio;
      });
      
      if (existe) {
        alert("⚠️ Este correo electrónico ya está registrado.");
        return false;
      }

      await addDoc(collection(db, "usuarios"), {
        nombre: (nuevoUsuario.nombre || "Usuario").trim(),
        correo: emailLimpio,
        password: String(nuevoUsuario.password || "").trim(),
        role: rolFiltrado,
        especialidad: rolFiltrado === 'medico' ? "general" : "",
        pin: rolFiltrado === 'medico' ? "4567" : "",
        uid: "uid_" + Math.random().toString(36).substr(2, 9)
      });

      alert("🎉 ¡Registro guardado exitosamente en Firestore! Ahora puede iniciar sesión.");
      return true;
    } catch (error) {
      console.error("Error al escribir en la colección 'usuarios':", error);
      alert(`❌ Error en Firebase: ${error.message}`);
      return false;
    }
  };

  if (paso === 'landing') {
    return (
      <Landing 
        alIniciar={manejarLoginDirecto} 
        alRegistrar={manejarRegistroDirecto}
        recetasEmitidas={recetas} 
        inventario={inventario} 
      />
    );
  }

  return (
    <div>
      {user?.role === 'medico' ? (
        <DashboardMedico 
          user={user} 
          onLogout={() => { setUser(null); setPaso('landing'); }} 
          inventario={inventario} 
          recetasEmitidas={recetas} 
          pacientesDB={pacientes} 
          historialesDB={historiales} 
        />
      ) : (
        <DashboardFarmacia 
          user={user} 
          onLogout={() => { setUser(null); setPaso('landing'); }} 
          recetasEmitidas={recetas} 
          inventario={inventario} 
        />
      )}
    </div>
  );
}

export default App;