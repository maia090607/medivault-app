import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot, addDoc } from 'firebase/firestore';
import Landing from './views/Landing';
import Login from './views/Login';
import DashboardMedico from './views/DashboardMedico';
import DashboardFarmacia from './views/DashboardFarmacia';
import DashboardAdmin from './views/DashboardAdmin';
import { useToast } from './components/Toast';

function App() {
  const toast = useToast();
  const [paso, setPaso] = useState('landing'); 
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const [inventario, setInventario] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [historiales, setHistoriales] = useState([]);
  const [usuariosDB, setUsuariosDB] = useState([]);
  const [solicitudes, setSolicitudes] = useState([]);

  useEffect(() => {
    let loaded = 0;
    const checkLoaded = () => { loaded++; if (loaded >= 6) setLoading(false); };
    const unsubInv = onSnapshot(collection(db, "inventario"), (snap) => {
      setInventario(snap.docs.map(d => ({ id: d.id, ...d.data() }))); checkLoaded();
    });
    const unsubRec = onSnapshot(collection(db, "recetas"), (snap) => {
      setRecetas(snap.docs.map(d => ({ id: d.id, ...d.data() }))); checkLoaded();
    });
    const unsubPac = onSnapshot(collection(db, "pacientes"), (snap) => {
      setPacientes(snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        dni: d.data().dni ? String(d.data().dni).trim() : "" 
      }))); checkLoaded();
    });
    const unsubHist = onSnapshot(collection(db, "historiales"), (snap) => {
      setHistoriales(snap.docs.map(d => ({ 
        id: d.id, 
        ...d.data(),
        dniPaciente: d.data().dniPaciente ? String(d.data().dniPaciente).trim() : "" 
      }))); checkLoaded();
    });
    const unsubUser = onSnapshot(collection(db, "usuarios"), (snap) => {
      setUsuariosDB(snap.docs.map(d => ({ id: d.id, ...d.data() }))); checkLoaded();
    });
    const unsubSolicitudes = onSnapshot(collection(db, "solicitudes"), (snap) => {
      setSolicitudes(snap.docs.map(d => ({ id: d.id, ...d.data() }))); checkLoaded();
    });

    return () => { unsubInv(); unsubRec(); unsubPac(); unsubHist(); unsubUser(); unsubSolicitudes(); };
  }, []);

  const manejarLoginDirecto = (credenciales) => {
    const { email, password, rol } = credenciales;
    
    if (!usuariosDB || usuariosDB.length === 0) {
      toast.warning("Conectando con la base de datos... Intente de nuevo en un segundo.");
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
      toast.success(`Bienvenido ${usuarioEncontrado.nombre || ''}`);
      setUser({
        email: usuarioEncontrado.correo || usuarioEncontrado.email,
        nombre: usuarioEncontrado.nombre || (rol === 'medico' ? "Dr. Especialista" : rol === 'farmacia' ? "Operador Farmacia" : "Administrador"),
        role: usuarioEncontrado.role,
        pin: usuarioEncontrado.pin || "1234"
      });
      setPaso('app'); 
    } else {
      toast.error("Credenciales incorrectas. Verifique sus datos e intente nuevamente.");
    }
  };

  const manejarRegistroDirecto = async (nuevoUsuario) => {
    try {
      const emailLimpio = nuevoUsuario.email ? nuevoUsuario.email.toLowerCase().trim() : "";
      const rolFiltrado = (nuevoUsuario.rol || 'medico').toLowerCase().trim();

      const existe = usuariosDB.some(u => {
        const correoF = u.correo || u.email || "";
        return correoF.toLowerCase().trim() === emailLimpio;
      });
      
      if (existe) {
        toast.warning("Este correo electrónico ya está registrado.");
        return false;
      }

      const docData = {
        nombre: nuevoUsuario.nombre.trim(),
        correo: emailLimpio,
        password: String(nuevoUsuario.password || "").trim(),
        role: rolFiltrado,
        uid: "uid_" + Math.random().toString(36).substr(2, 9)
      };

      if (rolFiltrado === 'medico') {
        docData.especialidad = nuevoUsuario.extraInfo;
        docData.pin = nuevoUsuario.pinFirma;
      } else if (rolFiltrado === 'farmacia') {
        docData.sucursal = nuevoUsuario.extraInfo;
      }

      await addDoc(collection(db, "usuarios"), docData);

      toast.success("Registro guardado exitosamente. Ahora puede iniciar sesión.");
      return true;
    } catch (error) {
      console.error("Error al escribir en la colección 'usuarios':", error);
      toast.error(`Error en Firebase: ${error.message}`);
      return false;
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh', fontFamily: 'Inter, sans-serif', background: '#f8fafc', color: '#1e293b' }}>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <div style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: '#2563eb', borderRadius: '50%', animation: 'spin 0.8s linear infinite', marginBottom: '16px' }} />
        <span style={{ fontWeight: '600', fontSize: '1rem', color: '#64748b' }}>Conectando con MediVault...</span>
      </div>
    );
  }

  if (paso === 'landing') {
    return (
      <Landing 
        onNavigateToLogin={() => setPaso('login')} 
        recetasEmitidas={recetas} 
        inventario={inventario} 
      />
    );
  }

  if (paso === 'login') {
    return (
      <Login 
        alIniciar={manejarLoginDirecto} 
        alRegistrar={manejarRegistroDirecto} 
        onVolver={() => setPaso('landing')} 
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
      ) : user?.role === 'admin' ? (
        <DashboardAdmin
          user={user}
          onLogout={() => { setUser(null); setPaso('landing'); }}
          inventario={inventario}
          recetasEmitidas={recetas}
          pacientesDB={pacientes}
          usuariosDB={usuariosDB}
          solicitudes={solicitudes}
        />
      ) : (
        <DashboardFarmacia 
          user={user} 
          onLogout={() => { setUser(null); setPaso('landing'); }} 
          recetasEmitidas={recetas} 
          inventario={inventario} 
          pacientesDB={pacientes} 
        />
      )}
    </div>
  );
}

export default App;