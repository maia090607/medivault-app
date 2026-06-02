import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { formatearFecha } from '../../utils';

const POR_PAGINA = 10;

function RecetasView({ recetasValidas, darkMode, st, db, toast }) {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');

  const filtradas = recetasValidas.filter(r => {
    if (!r) return false;
    const q = busqueda.toLowerCase();
    return (r.paciente || '').toLowerCase().includes(q)
      || (r.medico || '').toLowerCase().includes(q)
      || String(r.token || '').includes(q)
      || (r.dniPaciente || '').includes(q);
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

  const eliminar = async (receta) => {
    if (!window.confirm(`¿Está seguro de eliminar la receta de "${receta.paciente}"?`)) return;
    try {
      await deleteDoc(doc(db, "recetas", receta.id));
      toast.success('Receta eliminada correctamente.');
    } catch (err) {
      console.error(err);
      toast.error('Error al eliminar la receta.');
    }
  };

  return (
    <div key="recetas" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
        Todas las Recetas del Sistema
      </h2>
      <input
        style={st.input}
        placeholder="Buscar por paciente, médico, token o DNI..."
        value={busqueda}
        onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
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
              <th style={st.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.map(r => (
              <tr key={r.id}>
                <td style={st.td}><strong>{r.paciente}</strong></td>
                <td style={st.td}>{r.dniPaciente}</td>
                <td style={st.td}>{r.medico}</td>
                <td style={st.td}><strong style={{ color: '#2563eb' }}>{r.token}</strong></td>
                <td style={st.td}><span style={st.badge(r.estado)}>{r.estado}</span></td>
                <td style={st.td}>{formatearFecha(r.fecha)}</td>
                <td style={st.td}>
                  <button onClick={() => eliminar(r)} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.75rem' }}>
                    🗑️
                  </button>
                </td>
              </tr>
            ))}
            {datosPagina.length === 0 && (
              <tr><td colSpan="7" style={{ ...st.td, textAlign: 'center', color: '#94a3b8' }}>No se encontraron recetas.</td></tr>
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

export default RecetasView;
