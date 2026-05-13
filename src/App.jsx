import React, { useState, useEffect } from 'react';
import { db } from './firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import Landing from './views/Landing';
import Login from './views/Login';
import DashboardMedico from './views/DashboardMedico';
import DashboardFarmacia from './views/DashboardFarmacia';

function App() {
  const [paso, setPaso] = useState('landing'); 
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [user, setUser] = useState(null);

  const [inventario, setInventario] = useState([]);
  const [recetas, setRecetas] = useState([]);
  const [pacientes, setPacientes] = useState([]);
  const [historiales, setHistoriales] = useState([]);

  useEffect(() => {
    // Escucha de colecciones en tiempo real
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

    return () => { unsubInv(); unsubRec(); unsubPac(); unsubHist(); };
  }, []);

  const irALogin = (rol) => {
    setRolSeleccionado(rol);
    setPaso('login');
  };

  if (paso === 'landing') return <Landing alIniciar={() => setPaso('seleccion')} />;

  if (paso === 'seleccion') {
    return (
      <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: 'sans-serif' }}>
        <h2 style={{ fontSize: '2.2rem', color: '#0f172a', marginBottom: '40px', fontWeight: '900' }}>¿Cómo desea ingresar a <span style={{color: '#2563eb'}}>MediVault</span>?</h2>
        <div style={{ display: 'flex', gap: '30px' }}>
          <div onClick={() => irALogin('medico')} style={{ padding: '40px', background: 'white', borderRadius: '24px', border: '2px solid #e2e8f0', cursor: 'pointer', textAlign: 'center', width: '220px', transition: '0.3s' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>👨‍⚕️</div>
            <h3 style={{ fontWeight: '800', color: '#1e293b' }}>Soy Médico</h3>
          </div>
          <div onClick={() => irALogin('farmacia')} style={{ padding: '40px', background: 'white', borderRadius: '24px', border: '2px solid #e2e8f0', cursor: 'pointer', textAlign: 'center', width: '220px', transition: '0.3s' }}>
            <div style={{ fontSize: '3.5rem', marginBottom: '15px' }}>💊</div>
            <h3 style={{ fontWeight: '800', color: '#1e293b' }}>Soy Farmacéutico</h3>
          </div>
        </div>
        <button onClick={() => setPaso('landing')} style={{ marginTop: '40px', background: 'none', border: 'none', color: '#64748b', fontWeight: 'bold', cursor: 'pointer' }}>← Volver al inicio</button>
      </div>
    );
  }

  if (paso === 'login') return <Login rol={rolSeleccionado} onLogin={(u) => { setUser(u); setPaso('app'); }} />;

  return (
    <div>
      {user.role === 'medico' ? (
        <DashboardMedico 
          user={user} 
          onLogout={() => setPaso('landing')} 
          inventario={inventario} 
          recetasEmitidas={recetas} 
          pacientesDB={pacientes} 
          historialesDB={historiales} 
        />
      ) : (
        <DashboardFarmacia 
          user={user} 
          onLogout={() => setPaso('landing')} 
          recetasEmitidas={recetas} 
          inventario={inventario} 
        />
      )}
    </div>
  );
}

export default App;