import React from 'react';
import { formatearFecha } from '../../utils';
import MetricCard from '../../components/MetricCard';

function DashboardView({
  recetasValidas, recetasPendientes, recetasDispensadas,
  pacientesValidos, usuariosValidos, solicitudesValidas,
  darkMode, st
}) {
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

  const recetasDispensadasOrdenadas = [...recetasDispensadas].sort((a, b) => {
    const da = new Date(a.fecha || 0);
    const db = new Date(b.fecha || 0);
    return db - da;
  });

  const rankingDoctores = (() => {
    const conteo = {};
    recetasValidas.forEach(r => {
      const medico = (r.medico || '').trim();
      if (medico) {
        conteo[medico] = (conteo[medico] || 0) + 1;
      }
    });
    return Object.entries(conteo)
      .map(([nombre, total]) => ({ nombre, total }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 8);
  })();

  return (
    <div key="dashboard" style={{ animation: 'fadeIn 0.25s ease' }}>
      <div className="metrics-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '20px', marginBottom: '24px' }}>
        <MetricCard label="Recetas Emitidas" value={recetasValidas.length} color="#2563eb" darkMode={darkMode} />
        <MetricCard label="Pendientes" value={recetasPendientes.length} color="#f59e0b" darkMode={darkMode} />
        <MetricCard label="Dispensadas" value={recetasDispensadas.length} color="#10b981" darkMode={darkMode} />
        <MetricCard label="Pacientes" value={pacientesValidos.length} color="#8b5cf6" darkMode={darkMode} />
        <MetricCard label="Usuarios" value={usuariosValidos.length} color="#06b6d4" darkMode={darkMode} />
        <MetricCard label="Solicitudes" value={solicitudesValidas.length} color="#ec4899" darkMode={darkMode} />
      </div>

      {recetasValidas.length > 0 && (
        <>
          <div className="dashboard-charts-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
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
              <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: '700', color: '#2563eb' }}>Médicos con Mayor Actividad</h3>
              {rankingDoctores.length > 0 ? rankingDoctores.map((item, idx) => {
                const maxCant = rankingDoctores[0].total || 1;
                const pct = (item.total / maxCant) * 100;
                return (
                  <div key={item.nombre} style={{ marginBottom: '10px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: darkMode ? '#ffffff' : '#1e293b', marginBottom: '4px' }}>
                      <span>{idx + 1}. Dr(a). {item.nombre}</span>
                      <span>{item.total} recetas</span>
                    </div>
                    <div style={{ height: '10px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: '#10b981', borderRadius: '6px', transition: 'width 0.5s ease' }} />
                    </div>
                  </div>
                );
              }) : <div style={{ color: '#94a3b8', fontSize: '0.9rem', padding: '10px 0' }}>Sin datos de médicos.</div>}
            </div>
          </div>

          <div className="summary-boxes" style={{ marginBottom: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
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
        </>
      )}

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
            {recetasDispensadasOrdenadas.length > 0 ? recetasDispensadasOrdenadas.slice(0, 5).map(r => (
              <tr key={r.id}>
                <td style={st.td}><strong>{r.paciente}</strong></td>
                <td style={st.td}>{r.medico}</td>
                <td style={st.td}><strong style={{ color: '#2563eb' }}>{r.token}</strong></td>
                <td style={st.td}><span style={st.badge(r.estado)}>{r.estado}</span></td>
              </tr>
            )) : recetasValidas.slice(-5).reverse().map(r => (
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
  );
}

export default DashboardView;
