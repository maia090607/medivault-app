import React from 'react';
import { formatearFecha } from '../utils';

export default function NotificacionesList({ recetas = [], darkMode, st, showMedico = false, style }) {
  return (
    <div style={{ ...st.card, ...style }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
        Notificaciones de Recetas
      </h2>
      {recetas.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: '500' }}>
          No hay recetas dispensadas recientemente.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {recetas.map(r => r && (
            <div key={r.id} style={{ background: darkMode ? '#0f172a' : '#f0fdf4', borderRadius: '10px', padding: '16px', border: '1px solid #bbf7d0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '12px' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b', fontSize: '0.95rem' }}>✔️ {r.paciente}</div>
                <div style={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : '#64748b', marginTop: '2px' }}>
                  Token: <strong style={{ color: '#2563eb' }}>{r.token}</strong>
                  {showMedico && <> | Médico: {r.medico}</>}
                  {' | '}{formatearFecha(r.fecha)}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#065f46', marginTop: '4px' }}>
                  {Array.isArray(r.medicamento) ? r.medicamento.map(m => m && m.nombre).filter(Boolean).join(', ') : 'Medicamentos no listados'}
                </div>
              </div>
              <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 10px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '700', whiteSpace: 'nowrap' }}>Dispensado</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
