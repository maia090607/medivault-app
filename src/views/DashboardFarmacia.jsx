import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc } from 'firebase/firestore';

function DashboardFarmacia({ onLogout, recetasEmitidas, inventario }) {
  const [token, setToken] = useState('');
  const [receta, setReceta] = useState(null);
  const [vista, setVista] = useState('dispensar'); // 'dispensar', 'inventario', 'stats'

  // --- LÓGICA DE ANALÍTICA ---
  const totalDispensados = recetasEmitidas.filter(r => r.estado === 'Entregado').length;
  
  // Agrupar ventas por medicamento para la gráfica
  const ventasPorMed = inventario.map(item => {
    const cantidad = recetasEmitidas.filter(r => r.medicamento === item.nombre && r.estado === 'Entregado').length;
    return { nombre: item.nombre, cantidad };
  }).filter(v => v.cantidad > 0);

  const buscar = (e) => {
    e.preventDefault();
    const r = recetasEmitidas.find(rec => rec.token === token && rec.estado === 'Pendiente');
    if (r) setReceta(r); else alert("Código no válido o ya procesado");
  };

  const dispensar = async () => {
    try {
      await updateDoc(doc(db, "recetas", receta.id), { estado: 'Entregado' });
      const item = inventario.find(i => i.nombre === receta.medicamento);
      if (item) await updateDoc(doc(db, "inventario", item.id), { stock: Number(item.stock) - 1 });
      alert("✅ Medicamento dispensado con éxito");
      setReceta(null); setToken('');
    } catch (err) { 
      console.error(err);
      alert("Error al procesar"); 
    }
  };

  const btnStyle = (act) => ({
    width: '100%', padding: '14px 20px', textAlign: 'left', border: 'none', cursor: 'pointer',
    background: act ? '#334155' : 'transparent', color: 'white', fontWeight: '600',
    borderLeft: act ? '4px solid #38bdf8' : '4px solid transparent', transition: '0.2s'
  });

  return (
    <div style={{ display: 'flex', minHeight: '100vh', background: '#f8fafc', fontFamily: 'sans-serif' }}>
      {/* SIDEBAR DARK STYLE */}
      <aside style={{ width: '260px', background: '#1e293b', color: 'white', position: 'fixed', height: '100vh', zIndex: 10 }}>
        <div style={{ padding: '30px 20px', color: '#38bdf8', fontSize: '1.4rem', fontWeight: 'bold', borderBottom: '1px solid #334155' }}>REMPe Farmacia</div>
        <nav style={{ marginTop: '20px' }}>
          <button style={btnStyle(vista === 'dispensar')} onClick={() => setVista('dispensar')}>📦 Dispensar</button>
          <button style={btnStyle(vista === 'inventario')} onClick={() => setVista('inventario')}>📊 Inventario</button>
          <button style={btnStyle(vista === 'stats')} onClick={() => setVista('stats')}>📈 Reporte de Ventas</button>
        </nav>
        <button onClick={onLogout} style={{ position: 'absolute', bottom: '25px', left: '25px', color: '#f87171', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>Cerrar Sistema</button>
      </aside>

      <main style={{ marginLeft: '260px', padding: '40px', width: 'calc(100% - 260px)' }}>
        <h1 style={{ color: '#1e293b', marginBottom: '35px', fontWeight: '800' }}>
          {vista === 'dispensar' ? 'Módulo de Dispensación' : vista === 'inventario' ? 'Control de Stock' : 'Estadísticas de Farmacia'}
        </h1>

        {/* VISTA: DISPENSAR */}
        {vista === 'dispensar' && (
          <div style={{ maxWidth: '550px', margin: '0 auto', background: 'white', padding: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
            {!receta ? (
              <form onSubmit={buscar}>
                <p style={{ textAlign: 'center', color: '#64748b', marginBottom: '20px' }}>Ingrese el código de la receta electrónica</p>
                <input style={{ width: '100%', padding: '15px', borderRadius: '8px', border: '2px solid #cbd5e1', fontSize: '2.5rem', textAlign: 'center', letterSpacing: '8px', marginBottom: '25px', outline: 'none' }} value={token} onChange={e => setToken(e.target.value)} maxLength="6" placeholder="000000" />
                <button type="submit" style={{ width: '100%', padding: '16px', background: '#0070f3', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: 'pointer', fontSize: '1rem' }}>CONSULTAR RECETA</button>
              </form>
            ) : (
              <div>
                <h3 style={{ color: '#0070f3', borderBottom: '1px solid #f1f5f9', paddingBottom: '15px' }}>Verificación de Prescripción</h3>
                <div style={{ margin: '25px 0' }}>
                  <p style={{ marginBottom: '10px' }}><strong>Paciente:</strong> {receta.paciente}</p>
                  <p style={{ marginBottom: '10px' }}><strong>Medicamento:</strong> {receta.medicamento}</p>
                  <p style={{ marginBottom: '10px', color: '#059669' }}><strong>Médico que recetó:</strong> {receta.medico || "Dr. García"}</p>
                </div>
                <button onClick={dispensar} style={{ width: '100%', padding: '16px', background: '#16a34a', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', fontSize: '1rem' }}>FINALIZAR ENTREGA</button>
                <button onClick={() => setReceta(null)} style={{ width: '100%', marginTop: '15px', background: 'none', border: 'none', color: '#64748b', cursor: 'pointer' }}>Cancelar consulta</button>
              </div>
            )}
          </div>
        )}

        {/* VISTA: INVENTARIO */}
        {vista === 'inventario' && (
          <div style={{ background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: '#64748b', fontSize: '0.8rem' }}>
                  <th style={{ padding: '15px' }}>PRODUCTO</th>
                  <th style={{ padding: '15px' }}>STOCK</th>
                  <th style={{ padding: '15px' }}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {inventario.map(i => (
                  <tr key={i.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '15px', fontWeight: '600' }}>{i.nombre}</td>
                    <td style={{ padding: '15px' }}>{i.stock} unidades</td>
                    <td style={{ padding: '15px' }}>
                      <span style={{ color: i.stock < 10 ? '#ef4444' : '#10b981', fontWeight: 'bold' }}>● {i.stock < 10 ? 'Bajo Stock' : 'Disponible'}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VISTA: ESTADÍSTICAS (GRÁFICAS) */}
        {vista === 'stats' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '30px' }}>
              <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.8rem' }}>TOTAL ENTREGADOS</div>
                <div style={{ fontSize: '3rem', fontWeight: '800', color: '#0070f3' }}>{totalDispensados}</div>
              </div>
              <div style={{ background: 'white', padding: '25px', borderRadius: '12px', border: '1px solid #e2e8f0', textAlign: 'center' }}>
                <div style={{ color: '#64748b', fontWeight: 'bold', fontSize: '0.8rem' }}>MÉDICO MÁS ACTIVO</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#1e293b', marginTop: '20px' }}>Dr. García</div>
              </div>
            </div>

            <div style={{ background: 'white', padding: '30px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
              <h3 style={{ marginBottom: '25px', fontSize: '1rem', color: '#1e293b' }}>Demanda por Medicamento</h3>
              {ventasPorMed.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {ventasPorMed.map((v, index) => (
                    <div key={index}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.9rem' }}>
                        <span>{v.nombre}</span>
                        <span style={{ fontWeight: 'bold' }}>{v.cantidad} ventas</span>
                      </div>
                      <div style={{ height: '10px', background: '#f1f5f9', borderRadius: '10px', overflow: 'hidden' }}>
                        <div style={{ width: `${(v.cantidad / totalDispensados) * 100}%`, height: '100%', background: '#38bdf8', borderRadius: '10px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: '#94a3b8', textAlign: 'center' }}>No hay ventas registradas aún.</p>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardFarmacia;