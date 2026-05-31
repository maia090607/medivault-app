import React, { useState } from 'react';

const POR_PAGINA = 10;

function UsuariosView({ usuariosValidos, darkMode, st }) {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');

  const filtrados = usuariosValidos.filter(u => {
    if (!u) return false;
    const q = busqueda.toLowerCase();
    return (u.nombre || '').toLowerCase().includes(q)
      || (u.correo || u.email || '').toLowerCase().includes(q)
      || (u.role || '').toLowerCase().includes(q);
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const datosPagina = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) {
      setPagina(nueva);
      window.scrollTo(0, 0);
    }
  };

  return (
    <div key="usuarios" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
        Usuarios del Sistema
      </h2>
      <input
        style={st.input}
        placeholder="Buscar por nombre, email o rol..."
        value={busqueda}
        onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
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
            {datosPagina.map(u => (
              <tr key={u.id}>
                <td style={st.td}><strong>{u.nombre}</strong></td>
                <td style={st.td}>{u.correo || u.email}</td>
                <td style={st.td}>
                  <span style={{ ...st.badge(u.role), textTransform: 'capitalize' }}>{u.role}</span>
                </td>
                <td style={st.td}>{u.especialidad || u.sucursal || '—'}</td>
              </tr>
            ))}
            {datosPagina.length === 0 && (
              <tr><td colSpan="4" style={{ ...st.td, textAlign: 'center', color: '#94a3b8' }}>No se encontraron usuarios.</td></tr>
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
  );
}

export default UsuariosView;
