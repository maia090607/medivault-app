import React, { useState } from 'react';

const PACIENTES_POR_PAGINA = 8;

export default function PacientesDirectory({ pacientes = [], darkMode, st, renderActions, style }) {
  const [busqueda, setBusqueda] = useState('');
  const [pagina, setPagina] = useState(1);

  const filtro = (busqueda || '').trim()
    ? pacientes.filter(p => {
        if (!p) return false;
        return (p.nombre || '').toLowerCase().includes(busqueda.toLowerCase()) ||
               String(p.dni || '').includes(busqueda);
      })
    : pacientes;

  const totalPaginas = Math.ceil(filtro.length / PACIENTES_POR_PAGINA) || 1;
  const inicio = (pagina - 1) * PACIENTES_POR_PAGINA;
  const fin = inicio + PACIENTES_POR_PAGINA;
  const pacientesPaginados = filtro.slice(inicio, fin);

  return (
    <div style={{ ...st.card, ...style }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
        Directorio de Pacientes
      </h2>
      <input
        style={st.input}
        placeholder="Buscar por nombre o DNI..."
        value={busqueda}
        onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
      />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '14px' }}>
        {pacientesPaginados.length > 0 ? pacientesPaginados.map(p => (
          <div key={p.id} style={{ background: darkMode ? '#0f172a' : '#f9fafb', borderRadius: '10px', padding: '18px', border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontWeight: '700', fontSize: '1rem', color: '#2563eb' }}>{p.nombre}</div>
            <div style={{ fontSize: '0.85rem', color: darkMode ? '#94a3b8' : '#64748b' }}>DNI: {p.dni} | {p.email || 'Sin correo'}</div>
            <div style={{ fontSize: '0.85rem', color: darkMode ? '#94a3b8' : '#64748b' }}>Alergias: {p.alergias || 'Ninguna'}</div>
            {renderActions && (
              <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                {renderActions(p)}
              </div>
            )}
          </div>
        )) : (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: '500' }}>
            {busqueda.trim() ? 'No se encontraron pacientes con ese criterio.' : 'No hay pacientes registrados.'}
          </div>
        )}
      </div>
      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '20px' }}>
          <button disabled={pagina <= 1} onClick={() => setPagina(p => Math.max(1, p - 1))} style={st.pagBtn(pagina <= 1)}>Anterior</button>
          <span style={{ display: 'flex', alignItems: 'center', fontWeight: '600', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>Página {pagina}</span>
          <button disabled={pagina >= totalPaginas} onClick={() => setPagina(p => p + 1)} style={st.pagBtn(pagina >= totalPaginas)}>Siguiente</button>
        </div>
      )}
    </div>
  );
}
