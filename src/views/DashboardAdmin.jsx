import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { useToast } from '../components/Toast';
import { formatearFecha } from '../utils';
import { createStyles, fadeInKeyframes } from '../theme';
import MetricCard from '../components/MetricCard';
import PacientesDirectory from '../components/PacientesDirectory';
import NotificacionesList from '../components/NotificacionesList';

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
  const cambiarVista = (v) => { window.scrollTo(0, 0); setVista(v); };
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

  // --- DATOS PARA NUEVAS PESTAÑAS ---
  const conteoMedicamentos = (() => {
    const map = {};
    recetasValidas.forEach(r => {
      if (Array.isArray(r.medicamento)) {
        r.medicamento.forEach(m => {
          const nom = m.nombre || 'Desconocido';
          map[nom] = (map[nom] || 0) + (m.amount || m.cantidad || 1);
        });
      }
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  })();

  const conteoPacientes = (() => {
    const map = {};
    recetasValidas.forEach(r => {
      const nom = r.paciente || 'Desconocido';
      map[nom] = (map[nom] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  })();

  const st = createStyles(darkMode);

  return (
    <div style={st.container}>
      <style>{fadeInKeyframes}</style>

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
          <button onClick={() => {
            if (window.confirm('¿Está seguro de cerrar sesión?')) onLogout();
          }} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      <div style={st.nav} className="no-print">
        <button style={st.btnNav(vista === 'resumen')} onClick={() => cambiarVista('resumen')}>📊 Resumen</button>
        <button style={st.btnNav(vista === 'recetas')} onClick={() => cambiarVista('recetas')}>📋 Recetas</button>
        <button style={st.btnNav(vista === 'solicitudes')} onClick={() => cambiarVista('solicitudes')}>📩 Solicitudes Demo</button>
        <button style={st.btnNav(vista === 'usuarios')} onClick={() => cambiarVista('usuarios')}>👥 Usuarios</button>
        <button style={st.btnNav(vista === 'inventario')} onClick={() => cambiarVista('inventario')}>📦 Inventario</button>
        <button style={st.btnNav(vista === 'pacientes')} onClick={() => cambiarVista('pacientes')}>👤 Pacientes</button>
        <button style={st.btnNav(vista === 'estadisticas')} onClick={() => cambiarVista('estadisticas')}>📊 Estadísticas</button>
        <button style={st.btnNav(vista === 'notificaciones')} onClick={() => cambiarVista('notificaciones')}>🔔 Notificaciones</button>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px', fontWeight: '600' }}>
        Admin {vista === 'resumen' ? '> Resumen' : vista === 'recetas' ? '> Recetas' : vista === 'solicitudes' ? '> Solicitudes Demo' : vista === 'usuarios' ? '> Usuarios' : vista === 'inventario' ? '> Inventario' : vista === 'pacientes' ? '> Pacientes' : vista === 'estadisticas' ? '> Estadísticas' : '> Notificaciones'}
      </div>

      {/* RESUMEN */}
      {vista === 'resumen' && (
        <div key="resumen" style={{ animation: 'fadeIn 0.25s ease' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '24px' }}>
            <MetricCard label="Recetas Emitidas" value={recetasValidas.length} color="#2563eb" darkMode={darkMode} />
            <MetricCard label="Pendientes" value={recetasPendientes.length} color="#f59e0b" darkMode={darkMode} />
            <MetricCard label="Dispensadas" value={recetasDispensadas.length} color="#10b981" darkMode={darkMode} />
            <MetricCard label="Pacientes" value={pacientesValidos.length} color="#8b5cf6" darkMode={darkMode} />
            <MetricCard label="Usuarios" value={usuariosValidos.length} color="#06b6d4" darkMode={darkMode} />
            <MetricCard label="Solicitudes Demo" value={solicitudesValidas.length} color="#ec4899" darkMode={darkMode} />
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
                    <td style={st.td}>{formatearFecha(r.fecha)}</td>
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
                    <td style={st.td}>{formatearFecha(s.fecha)}</td>
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

      {/* PACIENTES */}
      {vista === 'pacientes' && (
        <PacientesDirectory
          key="pacientes"
          pacientes={pacientesValidos}
          darkMode={darkMode}
          st={st}
          style={{ animation: 'fadeIn 0.25s ease' }}
        />
      )}

      {/* ESTADÍSTICAS */}
      {vista === 'estadisticas' && (
        <div key="estadisticas" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.2rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>Estadísticas del Sistema</h2>
          {recetasValidas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: '500' }}>No hay datos de recetas para mostrar estadísticas.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: darkMode ? '#0f172a' : '#f9fafb', borderRadius: '10px', padding: '20px', border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: '700', color: '#2563eb' }}>Top Medicamentos Recetados</h3>
                {conteoMedicamentos.length > 0 ? conteoMedicamentos.map(([nom, cant], idx) => {
                  const maxCant = conteoMedicamentos[0][1] || 1;
                  const pct = (cant / maxCant) * 100;
                  return (
                    <div key={nom} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: darkMode ? '#ffffff' : '#1e293b', marginBottom: '4px' }}>
                        <span>{idx + 1}. {nom}</span>
                        <span>{cant} uds</span>
                      </div>
                      <div style={{ height: '10px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#2563eb', borderRadius: '6px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                }) : <div style={{ color: '#94a3b8', fontSize: '0.9rem', padding: '10px 0' }}>Sin datos de medicamentos.</div>}
              </div>
              <div style={{ background: darkMode ? '#0f172a' : '#f9fafb', borderRadius: '10px', padding: '20px', border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: '700', color: '#2563eb' }}>Pacientes Más Atendidos</h3>
                {conteoPacientes.length > 0 ? conteoPacientes.map(([nom, cant], idx) => {
                  const maxCant = conteoPacientes[0][1] || 1;
                  const pct = (cant / maxCant) * 100;
                  return (
                    <div key={nom} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: darkMode ? '#ffffff' : '#1e293b', marginBottom: '4px' }}>
                        <span>{idx + 1}. {nom}</span>
                        <span>{cant} recetas</span>
                      </div>
                      <div style={{ height: '10px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#10b981', borderRadius: '6px', transition: 'width 0.5s ease' }} />
                      </div>
                    </div>
                  );
                }) : <div style={{ color: '#94a3b8', fontSize: '0.9rem', padding: '10px 0' }}>Sin datos de pacientes.</div>}
              </div>
            </div>
          )}
          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div style={{ background: darkMode ? '#0f172a' : '#f9fafb', borderRadius: '10px', padding: '18px', textAlign: 'center', border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2563eb' }}>{recetasValidas.length}</div>
              <div style={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600' }}>Totales</div>
            </div>
            <div style={{ background: darkMode ? '#0f172a' : '#f9fafb', borderRadius: '10px', padding: '18px', textAlign: 'center', border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f59e0b' }}>{recetasPendientes.length}</div>
              <div style={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600' }}>Pendientes</div>
            </div>
            <div style={{ background: darkMode ? '#0f172a' : '#f9fafb', borderRadius: '10px', padding: '18px', textAlign: 'center', border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#10b981' }}>{recetasDispensadas.length}</div>
              <div style={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600' }}>Dispensadas</div>
            </div>
          </div>
        </div>
      )}

      {/* NOTIFICACIONES */}
      {vista === 'notificaciones' && (
        <NotificacionesList
          key="notificaciones"
          recetas={[...recetasDispensadas].sort((a, b) => {
            const da = new Date(a.fecha || 0);
            const db = new Date(b.fecha || 0);
            return db - da;
          })}
          darkMode={darkMode}
          st={st}
          showMedico={true}
          style={{ animation: 'fadeIn 0.25s ease' }}
        />
      )}
    </div>
  );
}

export default DashboardAdmin;
