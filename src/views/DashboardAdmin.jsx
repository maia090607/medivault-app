import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '../components/Toast';

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
  const [vista, setVista] = useState('resumen');
  const [darkMode, setDarkMode] = useState(false);
  const [busquedaReceta, setBusquedaReceta] = useState('');
  const [busquedaSolicitud, setBusquedaSolicitud] = useState('');
  const [busquedaUsuario, setBusquedaUsuario] = useState('');
  const [busquedaInventario, setBusquedaInventario] = useState('');

  const recetasValidas = Array.isArray(recetasEmitidas) ? recetasEmitidas : [];
  const inventarioValido = Array.isArray(inventario) ? inventario : [];
  const pacientesValidos = Array.isArray(pacientesDB) ? pacientesDB : [];
  const usuariosValidos = Array.isArray(usuariosDB) ? usuariosDB : [];
  const solicitudesValidas = Array.isArray(solicitudes) ? solicitudes : [];

  const recetasPendientes = recetasValidas.filter(r => r && r.estado === 'Pendiente');
  const recetasDispensadas = recetasValidas.filter(r => r && (r.estado === 'Entregado' || r.estado === 'Dispensado'));
  const solicitudesPendientes = solicitudesValidas;

  const recetasFiltradas = recetasValidas.filter(r => {
    if (!r) return false;
    const q = busquedaReceta.toLowerCase();
    return (r.paciente || '').toLowerCase().includes(q)
      || (r.medico || '').toLowerCase().includes(q)
      || String(r.token || '').includes(q)
      || (r.dniPaciente || '').includes(q);
  });

  const solicitudesFiltradas = solicitudesValidas.filter(s => {
    if (!s) return false;
    const q = busquedaSolicitud.toLowerCase();
    return (s.nombre || '').toLowerCase().includes(q)
      || (s.email || '').toLowerCase().includes(q)
      || (s.mensaje || '').toLowerCase().includes(q);
  });

  const usuariosFiltrados = usuariosValidos.filter(u => {
    if (!u) return false;
    const q = busquedaUsuario.toLowerCase();
    return (u.nombre || '').toLowerCase().includes(q)
      || (u.correo || u.email || '').toLowerCase().includes(q)
      || (u.role || '').toLowerCase().includes(q);
  });

  const inventarioFiltrado = inventarioValido.filter(item =>
    item && item.nombre && item.nombre.toLowerCase().includes(busquedaInventario.toLowerCase())
  );

  const marcarContactado = async (id) => {
    try {
      await updateDoc(doc(db, "solicitudes", id), { estado: 'contactado' });
      toast.success('Solicitud marcada como contactada.');
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar la solicitud.');
    }
  };

  const st = {
    container: {
      padding: '24px 30px',
      fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif',
      background: darkMode ? '#0f172a' : '#f8fafc',
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
      color: darkMode ? '#f1f5f9' : '#1e293b'
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: darkMode ? '#1e293b' : '#1e3a8a',
      padding: '16px 24px',
      borderRadius: '12px',
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
      marginBottom: '24px',
      color: '#ffffff'
    },
    nav: {
      display: 'flex',
      gap: '10px',
      marginBottom: '24px',
      flexWrap: 'wrap',
    },
    btnNav: (act) => ({
      padding: '12px 22px',
      borderRadius: '8px',
      fontWeight: '700',
      fontSize: '0.9rem',
      cursor: 'pointer',
      border: act ? 'none' : (darkMode ? '1px solid #334155' : '1px solid #cbd5e1'),
      background: act ? '#2563eb' : (darkMode ? '#1e293b' : '#ffffff'),
      color: act ? '#ffffff' : (darkMode ? '#94a3b8' : '#4b5563'),
      boxShadow: act ? '0 4px 6px rgba(37,99,235,0.15)' : 'none'
    }),
    card: {
      background: darkMode ? '#1e293b' : '#ffffff',
      padding: '30px',
      borderRadius: '12px',
      border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
      marginBottom: '24px',
      width: '100%',
      boxSizing: 'border-box',
    },
    input: {
      padding: '12px 14px',
      width: '100%',
      boxSizing: 'border-box',
      border: darkMode ? '1px solid #475569' : '1px solid #cbd5e1',
      borderRadius: '8px',
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#ffffff' : '#0f172a',
      marginBottom: '16px',
      outline: 'none',
      fontSize: '0.95rem'
    },
    label: {
      fontWeight: '700',
      display: 'block',
      marginBottom: '8px',
      color: darkMode ? '#cbd5e1' : '#1e293b',
      fontSize: '0.95rem'
    },
    btnAction: {
      background: '#2563eb',
      color: '#ffffff',
      border: 'none',
      padding: '12px 24px',
      borderRadius: '8px',
      fontWeight: '700',
      fontSize: '0.95rem',
      cursor: 'pointer'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: '0.9rem'
    },
    th: {
      padding: '12px',
      textAlign: 'left',
      color: darkMode ? '#ffffff' : '#1f2937',
      borderBottom: '1px solid #e5e7eb',
      background: darkMode ? '#0f172a' : '#f9fafb',
      fontWeight: '700',
    },
    td: {
      padding: '12px',
      borderBottom: '1px solid #f3f4f6',
      color: darkMode ? '#ffffff' : '#1f2937',
      fontSize: '0.9rem'
    },
    badge: (tipo) => {
      let bg = '#fef3c7', col = '#92400e';
      if (tipo === 'Entregado' || tipo === 'Dispensado') { bg = '#d1fae5'; col = '#065f46'; }
      if (tipo === 'contactado') { bg = '#dbeafe'; col = '#1e40af'; }
      return { padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600', background: bg, color: col, display: 'inline-block' };
    }
  };

  const MetricCard = ({ label, value, color }) => (
    <div style={{ ...st.card, textAlign: 'center', padding: '24px', marginBottom: 0 }}>
      <div style={{ fontSize: '2rem', fontWeight: '800', color: color || '#2563eb' }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600', marginTop: '4px' }}>{label}</div>
    </div>
  );

  return (
    <div style={st.container}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>

      <div style={st.topBar} className="no-print">
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
          <button onClick={onLogout} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      <div style={st.nav} className="no-print">
        <button style={st.btnNav(vista === 'resumen')} onClick={() => setVista('resumen')}>📊 Resumen</button>
        <button style={st.btnNav(vista === 'recetas')} onClick={() => setVista('recetas')}>📋 Recetas</button>
        <button style={st.btnNav(vista === 'solicitudes')} onClick={() => setVista('solicitudes')}>📩 Solicitudes Demo</button>
        <button style={st.btnNav(vista === 'usuarios')} onClick={() => setVista('usuarios')}>👥 Usuarios</button>
        <button style={st.btnNav(vista === 'inventario')} onClick={() => setVista('inventario')}>📦 Inventario</button>
      </div>

      {/* RESUMEN */}
      {vista === 'resumen' && (
        <div key="resumen" style={{ animation: 'fadeIn 0.25s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <MetricCard label="Recetas Emitidas" value={recetasValidas.length} color="#2563eb" />
            <MetricCard label="Pendientes" value={recetasPendientes.length} color="#f59e0b" />
            <MetricCard label="Dispensadas" value={recetasDispensadas.length} color="#10b981" />
            <MetricCard label="Pacientes" value={pacientesValidos.length} color="#8b5cf6" />
            <MetricCard label="Usuarios" value={usuariosValidos.length} color="#06b6d4" />
            <MetricCard label="Solicitudes Demo" value={solicitudesValidas.length} color="#ec4899" />
          </div>

          <div style={st.card}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
              Últimas Recetas Emitidas
            </h2>
            <table style={st.table}>
              <thead>
                <tr>
                  <th style={st.th}>Paciente</th>
                  <th style={st.th}>Médico</th>
                  <th style={st.th}>Token</th>
                  <th style={st.th}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recetasValidas.slice(-5).reverse().map(r => (
                  <tr key={r.id}>
                    <td style={st.td}><strong>{r.paciente}</strong></td>
                    <td style={st.td}>{r.medico}</td>
                    <td style={st.td}><strong style={{ color: '#2563eb' }}>{r.token}</strong></td>
                    <td style={st.td}><span style={st.badge(r.estado)}>{r.estado}</span></td>
                  </tr>
                ))}
                {recetasValidas.length === 0 && (
                  <tr><td colSpan="4" style={{ ...st.td, textAlign: 'center', color: '#94a3b8' }}>No hay recetas registradas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* RECETAS */}
      {vista === 'recetas' && (
        <div key="recetas" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
            Todas las Recetas del Sistema
          </h2>
          <input
            style={st.input}
            placeholder="Buscar por paciente, médico, token o DNI..."
            value={busquedaReceta}
            onChange={e => setBusquedaReceta(e.target.value)}
          />
          <div style={{ overflowX: 'auto' }}>
            <table style={st.table}>
              <thead>
                <tr>
                  <th style={st.th}>Paciente</th>
                  <th style={st.th}>DNI</th>
                  <th style={st.th}>Médico</th>
                  <th style={st.th}>Token</th>
                  <th style={st.th}>Estado</th>
                  <th style={st.th}>Fecha</th>
                </tr>
              </thead>
              <tbody>
                {recetasFiltradas.map(r => (
                  <tr key={r.id}>
                    <td style={st.td}><strong>{r.paciente}</strong></td>
                    <td style={st.td}>{r.dniPaciente}</td>
                    <td style={st.td}>{r.medico}</td>
                    <td style={st.td}><strong style={{ color: '#2563eb' }}>{r.token}</strong></td>
                    <td style={st.td}><span style={st.badge(r.estado)}>{r.estado}</span></td>
                    <td style={st.td}>{r.fecha}</td>
                  </tr>
                ))}
                {recetasFiltradas.length === 0 && (
                  <tr><td colSpan="6" style={{ ...st.td, textAlign: 'center', color: '#94a3b8' }}>No se encontraron recetas.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SOLICITUDES DEMO */}
      {vista === 'solicitudes' && (
        <div key="solicitudes" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
            Solicitudes de Demo
          </h2>
          <input
            style={st.input}
            placeholder="Buscar por nombre, email o mensaje..."
            value={busquedaSolicitud}
            onChange={e => setBusquedaSolicitud(e.target.value)}
          />
          <div style={{ overflowX: 'auto' }}>
            <table style={st.table}>
              <thead>
                <tr>
                  <th style={st.th}>Nombre</th>
                  <th style={st.th}>Email</th>
                  <th style={st.th}>Teléfono</th>
                  <th style={st.th}>Mensaje</th>
                  <th style={st.th}>Fecha</th>
                  <th style={st.th}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {solicitudesFiltradas.map(s => (
                  <tr key={s.id}>
                    <td style={st.td}><strong>{s.nombre}</strong></td>
                    <td style={st.td}>{s.email}</td>
                    <td style={st.td}>{s.telefono || '—'}</td>
                    <td style={{ ...st.td, maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.mensaje || '—'}</td>
                    <td style={st.td}>{s.fecha ? new Date(s.fecha).toLocaleDateString() : '—'}</td>
                    <td style={st.td}>
                      {s.estado === 'contactado' ? (
                        <span style={st.badge('contactado')}>Contactado</span>
                      ) : (
                        <button onClick={() => marcarContactado(s.id)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>
                          Marcar Contactado
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
                {solicitudesFiltradas.length === 0 && (
                  <tr><td colSpan="6" style={{ ...st.td, textAlign: 'center', color: '#94a3b8' }}>No hay solicitudes de demo.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USUARIOS */}
      {vista === 'usuarios' && (
        <div key="usuarios" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
            Usuarios del Sistema
          </h2>
          <input
            style={st.input}
            placeholder="Buscar por nombre, email o rol..."
            value={busquedaUsuario}
            onChange={e => setBusquedaUsuario(e.target.value)}
          />
          <div style={{ overflowX: 'auto' }}>
            <table style={st.table}>
              <thead>
                <tr>
                  <th style={st.th}>Nombre</th>
                  <th style={st.th}>Email</th>
                  <th style={st.th}>Rol</th>
                  <th style={st.th}>Especialidad / Sucursal</th>
                </tr>
              </thead>
              <tbody>
                {usuariosFiltrados.map(u => (
                  <tr key={u.id}>
                    <td style={st.td}><strong>{u.nombre}</strong></td>
                    <td style={st.td}>{u.correo || u.email}</td>
                    <td style={st.td}>
                      <span style={{ ...st.badge(u.role), textTransform: 'capitalize' }}>{u.role}</span>
                    </td>
                    <td style={st.td}>{u.especialidad || u.sucursal || '—'}</td>
                  </tr>
                ))}
                {usuariosFiltrados.length === 0 && (
                  <tr><td colSpan="4" style={{ ...st.td, textAlign: 'center', color: '#94a3b8' }}>No se encontraron usuarios.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* INVENTARIO */}
      {vista === 'inventario' && (
        <div key="inventario" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
            Inventario Global
          </h2>
          <input
            style={st.input}
            placeholder="Buscar medicamento..."
            value={busquedaInventario}
            onChange={e => setBusquedaInventario(e.target.value)}
          />
          <div style={{ overflowX: 'auto' }}>
            <table style={st.table}>
              <thead>
                <tr>
                  <th style={st.th}>Medicamento</th>
                  <th style={st.th}>Concentración</th>
                  <th style={st.th}>Stock</th>
                </tr>
              </thead>
              <tbody>
                {inventarioFiltrado.map(item => {
                  const critico = (parseInt(item.stock, 10) || 0) <= 10;
                  return (
                    <tr key={item.id}>
                      <td style={st.td}><strong>{item.nombre}</strong></td>
                      <td style={st.td}>{item.concentracion || 'N/A'}</td>
                      <td style={{ ...st.td, color: critico ? '#ef4444' : 'inherit', fontWeight: critico ? '700' : '400' }}>
                        {item.stock} Uds {critico && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '700' }}>⚠️</span>}
                      </td>
                    </tr>
                  );
                })}
                {inventarioFiltrado.length === 0 && (
                  <tr><td colSpan="3" style={{ ...st.td, textAlign: 'center', color: '#94a3b8' }}>No hay medicamentos en inventario.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardAdmin;
