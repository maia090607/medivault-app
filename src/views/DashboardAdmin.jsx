import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, deleteDoc } from 'firebase/firestore';
import { useToast } from '../components/Toast';
import { createStyles, fadeInKeyframes } from '../theme';
import PacientesDirectory from '../components/PacientesDirectory';
import NotificacionesList from '../components/NotificacionesList';
import DashboardView from './admin/DashboardView';
import RecetasView from './admin/RecetasView';
import SolicitudesView from './admin/SolicitudesView';
import UsuariosView from './admin/UsuariosView';
import InventarioView from './admin/InventarioView';
import AiChat from '../components/AiChat';

function DashboardAdmin({
  user = {},
  onLogout,
  inventario = [],
  recetasEmitidas = [],
  pacientesDB = [],
  usuariosDB = [],
  solicitudes = [],
}) {
  const toast = useToast();
  const [vista, setVista] = useState('dashboard');
  const cambiarVista = (v) => { window.scrollTo(0, 0); setVista(v); };
  const [darkMode, setDarkMode] = useState(false);

  const recetasValidas = Array.isArray(recetasEmitidas) ? recetasEmitidas : [];
  const inventarioValido = Array.isArray(inventario) ? inventario : [];
  const pacientesValidos = Array.isArray(pacientesDB) ? pacientesDB : [];
  const usuariosValidos = Array.isArray(usuariosDB) ? usuariosDB : [];
  const solicitudesValidas = Array.isArray(solicitudes) ? solicitudes : [];

  const recetasPendientes = recetasValidas.filter(r => r && r.estado === 'Pendiente');
  const recetasDispensadas = recetasValidas.filter(r => r && (r.estado === 'Entregado' || r.estado === 'Dispensado'));

  const recetasDispensadasOrdenadas = [...recetasDispensadas].sort((a, b) => {
    const da = new Date(a.fecha || 0);
    const db2 = new Date(b.fecha || 0);
    return db2 - da;
  });

  const st = createStyles(darkMode);

  const breadcrumb = vista === 'dashboard' ? 'Dashboard'
    : vista === 'recetas' ? 'Recetas'
    : vista === 'solicitudes' ? 'Solicitudes'
    : vista === 'usuarios' ? 'Usuarios'
    : vista === 'inventario' ? 'Inventario'
    : vista === 'pacientes' ? 'Pacientes'
    : 'Notificaciones';

  return (
    <div style={st.container} className="admin-container">
      <style>{fadeInKeyframes}</style>

      <div style={st.topBar} className="admin-topbar no-print">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>
            Panel de Administración
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <span style={{ fontWeight: '600' }}>{user?.nombre || 'Admin'}</span>
          <button onClick={() => {
            if (window.confirm('¿Está seguro de cerrar sesión?')) onLogout();
          }} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      <div style={st.nav} className="admin-nav no-print">
        <button style={st.btnNav(vista === 'dashboard')} onClick={() => cambiarVista('dashboard')}>Dashboard</button>
        <button style={st.btnNav(vista === 'recetas')} onClick={() => cambiarVista('recetas')}>Recetas</button>
        <button style={st.btnNav(vista === 'solicitudes')} onClick={() => cambiarVista('solicitudes')}>Solicitudes</button>
        <button style={st.btnNav(vista === 'usuarios')} onClick={() => cambiarVista('usuarios')}>Usuarios</button>
        <button style={st.btnNav(vista === 'inventario')} onClick={() => cambiarVista('inventario')}>Inventario</button>
        <button style={st.btnNav(vista === 'pacientes')} onClick={() => cambiarVista('pacientes')}>Pacientes</button>
        <button style={st.btnNav(vista === 'notificaciones')} onClick={() => cambiarVista('notificaciones')}>Notificaciones</button>
      </div>

      <div className="admin-breadcrumb" style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px', fontWeight: '600' }}>
        Admin &gt; {breadcrumb}
      </div>

      {vista === 'dashboard' && (
        <DashboardView
          recetasValidas={recetasValidas}
          recetasPendientes={recetasPendientes}
          recetasDispensadas={recetasDispensadas}
          pacientesValidos={pacientesValidos}
          usuariosValidos={usuariosValidos}
          solicitudesValidas={solicitudesValidas}
          darkMode={darkMode}
          st={st}
        />
      )}

      {vista === 'recetas' && (
        <RecetasView
          recetasValidas={recetasValidas}
          darkMode={darkMode}
          st={st}
          db={db}
          toast={toast}
        />
      )}

      {vista === 'solicitudes' && (
        <SolicitudesView
          solicitudesValidas={solicitudesValidas}
          darkMode={darkMode}
          st={st}
          db={db}
          toast={toast}
        />
      )}

      {vista === 'usuarios' && (
        <UsuariosView
          usuariosValidos={usuariosValidos}
          darkMode={darkMode}
          st={st}
          db={db}
          toast={toast}
        />
      )}

      {vista === 'inventario' && (
        <InventarioView
          inventarioValido={inventarioValido}
          darkMode={darkMode}
          st={st}
          db={db}
          toast={toast}
        />
      )}

      {vista === 'pacientes' && (
        <PacientesDirectory
          key="pacientes"
          pacientes={pacientesValidos}
          darkMode={darkMode}
          st={st}
          style={{ animation: 'fadeIn 0.25s ease' }}
          renderActions={(p) => (
            <button
              onClick={async () => {
                if (!window.confirm(`¿Está seguro de eliminar al paciente "${p.nombre}"?`)) return;
                try {
                  await deleteDoc(doc(db, "pacientes", p.id));
                  toast.success('Paciente eliminado correctamente.');
                } catch (err) {
                  console.error(err);
                  toast.error('Error al eliminar el paciente.');
                }
              }}
              style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '4px 10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.75rem' }}
            >
              🗑️ Eliminar
            </button>
          )}
        />
      )}

      {vista === 'notificaciones' && (
        <NotificacionesList
          key="notificaciones"
          recetas={recetasDispensadasOrdenadas}
          darkMode={darkMode}
          st={st}
          showMedico={true}
          style={{ animation: 'fadeIn 0.25s ease' }}
        />
      )}

      <AiChat
        datos={{
          recetasValidas,
          recetasPendientes,
          recetasDispensadas,
          inventarioValido,
          pacientesValidos,
          usuariosValidos,
          solicitudesValidas,
          vistaActual: vista,
        }}
        darkMode={darkMode}
        cambiarVista={cambiarVista}
      />
    </div>
  );
}

export default DashboardAdmin;
