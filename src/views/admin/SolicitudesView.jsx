import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { formatearFecha } from '../../utils';

const POR_PAGINA = 10;

function SolicitudesView({ solicitudesValidas, darkMode, st, db, toast }) {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [seleccionada, setSeleccionada] = useState(null);

  const filtradas = solicitudesValidas.filter(s => {
    if (!s) return false;
    const q = busqueda.toLowerCase();
    return (s.nombre || '').toLowerCase().includes(q)
      || (s.email || '').toLowerCase().includes(q)
      || (s.mensaje || '').toLowerCase().includes(q);
  });

  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const datosPagina = filtradas.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) {
      setPagina(nueva);
      window.scrollTo(0, 0);
    }
  };

  const confirmarContactado = async () => {
    if (!seleccionada) return;
    try {
      await updateDoc(doc(db, "solicitudes", seleccionada.id), { estado: 'contactado' });
      toast.success('Solicitud marcada como contactada.');
      setSeleccionada(null);
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar la solicitud.');
    }
  };

  return (
    <>
      <div key="solicitudes" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
        <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
          Solicitudes de Demo
        </h2>
        <input
          style={st.input}
          placeholder="Buscar por nombre, email o mensaje..."
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
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
              {datosPagina.map(s => (
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
                      <button onClick={() => setSeleccionada(s)} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>
                        Marcar Contactado
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {datosPagina.length === 0 && (
                <tr><td colSpan="6" style={{ ...st.td, textAlign: 'center', color: '#94a3b8' }}>No hay solicitudes de demo.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {totalPaginas > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
            <button style={st.pagBtn(paginaActual <= 1)} onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual <= 1}>
              ← Anterior
            </button>
            <span style={{ fontSize: '0.9rem', fontWeight: '600', color: darkMode ? '#ffffff' : '#1e293b' }}>
              {paginaActual} / {totalPaginas}
            </span>
            <button style={st.pagBtn(paginaActual >= totalPaginas)} onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual >= totalPaginas}>
              Siguiente →
            </button>
          </div>
        )}
      </div>

      {/* MODAL DETALLES SOLICITUD */}
      {seleccionada && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000
        }} onClick={() => setSeleccionada(null)}>
          <div className="modal-content" style={{
            background: darkMode ? '#1e293b' : '#ffffff', padding: '30px',
            borderRadius: '16px', width: '520px', maxWidth: '90%',
            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 20px 0', color: darkMode ? '#ffffff' : '#1e293b', fontSize: '1.2rem', fontWeight: '700' }}>
              Detalles de la Solicitud
            </h3>
            <div style={{ display: 'grid', gap: '14px', marginBottom: '24px' }}>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Nombre</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: darkMode ? '#ffffff' : '#1e293b' }}>{seleccionada.nombre}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Email</div>
                <div style={{ fontSize: '1rem', color: '#2563eb', fontWeight: '600' }}>{seleccionada.email}</div>
              </div>
              {seleccionada.telefono && (
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Teléfono</div>
                  <div style={{ fontSize: '1rem', fontWeight: '600', color: darkMode ? '#ffffff' : '#1e293b' }}>{seleccionada.telefono}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Mensaje</div>
                <div style={{
                  fontSize: '0.95rem', color: darkMode ? '#ffffff' : '#1e293b',
                  background: darkMode ? '#0f172a' : '#f8fafc',
                  padding: '16px', borderRadius: '8px', lineHeight: '1.6',
                  border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                  maxHeight: '150px', overflowY: 'auto', whiteSpace: 'pre-wrap'
                }}>{seleccionada.mensaje || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Fecha de Solicitud</div>
                <div style={{ fontSize: '1rem', fontWeight: '600', color: darkMode ? '#ffffff' : '#1e293b' }}>{formatearFecha(seleccionada.fecha)}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', fontWeight: '700', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '4px' }}>Estado Actual</div>
                <div><span style={st.badge(seleccionada.estado)}>{seleccionada.estado || 'Pendiente'}</span></div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setSeleccionada(null)}
                style={{ background: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#f1f5f9' : '#334155', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                Cancelar
              </button>
              <button type="button" onClick={confirmarContactado}
                style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer' }}>
                ✓ Marcar como Contactado
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default SolicitudesView;
