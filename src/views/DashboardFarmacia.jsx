import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';

function DashboardFarmacia({ user, onLogout, recetasEmitidas, inventario }) {
  const [vista, setVista] = useState('dispensar');
  const [tokenBusqueda, setTokenBusqueda] = useState('');
  const [recetaEncontrada, setRecetaEncontrada] = useState(null);

  // Estados para el formulario de medicamentos
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaConcentracion, setNuevaConcentracion] = useState('');
  const [nuevoStock, setNuevoStock] = useState('');

  // Filtrar recetas entregadas
  const recetasEntregadas = recetasEmitidas.filter(r => r.estado === 'Entregado' || r.estado === 'Dispensado');

  // Lógica para agrupar las demandas por cada doctor
  const reportesPorMedico = recetasEntregadas.reduce((acc, receta) => {
    const medicoNombre = receta.medico || "Médico General";
    const farmacosList = Array.isArray(receta.medicamento) ? receta.medicamento : [receta.medicamento || "Fármaco Desconocido"];

    if (!acc[medicoNombre]) {
      acc[medicoNombre] = { totalEntregados: 0, medicamentos: {} };
    }

    farmacosList.forEach(medicamentoNombre => {
      acc[medicoNombre].totalEntregados += 1;
      if (!acc[medicoNombre].medicamentos[medicamentoNombre]) {
        acc[medicoNombre].medicamentos[medicamentoNombre] = 0;
      }
      acc[medicoNombre].medicamentos[medicamentoNombre] += 1;
    });

    return acc;
  }, {});

  const coloresBarras = ['#ef4444', '#f59e0b', '#10b981', '#3b82f6', '#6366f1', '#a855f7'];

  const buscarToken = (e) => {
    e.preventDefault();
    const encontrada = recetasEmitidas.find(r => String(r.token) === tokenBusqueda.trim());
    if (encontrada) setRecetaEncontrada(encontrada);
    else {
      alert("No se encontró ninguna receta activa con ese token.");
      setRecetaEncontrada(null);
    }
  };

  const despacharMedicamento = async () => {
    if (!recetaEncontrada) return;

    const fechaHoy = new Date().toLocaleDateString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    try {
      const recetaRef = doc(db, "recetas", recetaEncontrada.id);
      await updateDoc(recetaRef, {
        estado: 'Entregado',
        fechaEntrega: fechaHoy
      });

      alert(`¡Medicamentos entregados con éxito el ${fechaHoy}!`);
      setTokenBusqueda('');
      setRecetaEncontrada(null);
    } catch (error) {
      console.error("Error al despachar: ", error);
      alert("Hubo un error al procesar el despacho.");
    }
  };

  const manejarAgregarMedicamento = async (e) => {
    e.preventDefault();
    if (!nuevoNombre.trim() || !nuevoStock) return;

    const nombreCompleto = nuevaConcentracion.trim() ? `${nuevoNombre.trim()} ${nuevaConcentracion.trim()}` : nuevoNombre.trim();
    try {
      await addDoc(collection(db, "inventario"), {
        nombre: nombreCompleto,
        concentracion: nuevaConcentracion.trim(),
        stock: parseInt(nuevoStock, 10)
      });
      alert(`¡${nombreCompleto} agregado correctamente al inventario!`);
      setNuevoNombre(''); setNuevaConcentracion(''); setNuevoStock('');
      setMostrarForm(false);
    } catch (error) { console.error(error); }
  };

  const st = {
    wrapper: { background: '#f8fafc', minHeight: '100vh', width: '100%', padding: '30px 40px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', color: '#0f172a', overflowX: 'hidden' },
    card: { background: '#ffffff', borderRadius: '24px', padding: '35px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', marginBottom: '35px', width: '100%', boxSizing: 'border-box' },
    input: { width: '100%', padding: '16px', border: '2px solid #e2e8f0', background: '#ffffff', borderRadius: '14px', fontSize: '1rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', marginBottom: '15px' },
    label: { fontSize: '0.85rem', fontWeight: '900', color: '#475569', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    
    // ACOMODO PERFECTO SUPERIOR: Evita solapamientos e integra las tres secciones en la grilla superior
    topNavOuter: { width: '100%', display: 'flex', justifyContent: 'center', borderBottom: '2px solid #e2e8f0', marginBottom: '40px', paddingBottom: '20px' },
    topNavContainer: { display: 'grid', gridTemplateColumns: '1.2fr 2fr 1fr', alignItems: 'center', width: '100%', maxWidth: '1200px', boxSizing: 'border-box', padding: '0 10px', gap: '20px' },
    
    headerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '3px' },
    headerTitle: { fontSize: '2.4rem', fontWeight: '900', color: '#2563eb', margin: 0, letterSpacing: '-1px', lineHeight: '1' },
    headerSubtitle: { color: '#475569', fontWeight: '800', fontSize: '1rem', margin: 0, lineHeight: '1.2' },
    headerUser: { color: '#1e293b', fontWeight: '700', fontSize: '0.95rem', margin: 0, lineHeight: '1.2' },
    
    tabsWrapper: { display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' },
    tabBtn: (act) => ({ padding: '12px 18px', border: 'none', borderRadius: '10px', background: act ? '#2563eb' : 'transparent', color: act ? '#ffffff' : '#475569', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }),
    
    logoutWrapper: { display: 'flex', justifyContent: 'flex-end' },
    btnLogout: { padding: '12px 20px', background: '#fff1f2', color: '#991b1b', border: '1px solid #fecdd3', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap' },

    btnAction: { background: '#2563eb', color: 'white', border: 'none', padding: '16px 28px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 'auto', gap: '8px', lineHeight: '1.2' },
    btnSuccess: { background: '#10b981', color: 'white', border: 'none', padding: '16px 28px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 'auto', gap: '8px', lineHeight: '1.2' },
    
    alertContainer: { display: 'flex', gap: '20px', marginBottom: '35px', width: '100%' },
    alertBox: (bg, color, borderColor) => ({ flex: 1, padding: '20px 25px', borderRadius: '16px', background: bg, color: color, border: `1px solid ${borderColor}`, fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', lineHeight: '1.4' }),
    progressBar: (width, bg) => ({ background: bg, height: '100%', width: `${width}%`, borderRadius: '6px', transition: 'width 0.5s ease-out' })
  };

  return (
    <div style={st.wrapper}>
      
      {/* MENÚ SUPERIOR HORIZONTAL REORGANIZADO */}
      <div style={st.topNavOuter}>
        <div style={st.topNavContainer}>
          {/* Bloque Identidad (Izquierda) */}
          <div style={st.headerContainer}>
            <h1 style={st.headerTitle}>MediVault</h1>
            <h2 style={st.headerSubtitle}>Módulo Farmacia</h2>
            <h3 style={st.headerUser}>{user?.nombre || "Carlos Mendoza"}</h3>
          </div>
          
          {/* Bloque Navegación (Centro) */}
          <div style={st.tabsWrapper}>
            <button onClick={() => setVista('dispensar')} style={st.tabBtn(vista === 'dispensar')}>📦 Dispensar</button>
            <button onClick={() => setVista('inventario')} style={st.tabBtn(vista === 'inventario')}>📊 Inventario</button>
            <button onClick={() => setVista('reporte')} style={st.tabBtn(vista === 'reporte')}>📈 Reportes</button>
          </div>

          {/* Bloque Salida (Derecha) */}
          <div style={st.logoutWrapper}>
            <button onClick={onLogout} style={st.btnLogout}>Cerrar Sesión</button>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONTENIDO SEGURO */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

        {/* VISTA: DISPENSAR */}
        {vista === 'dispensar' && (
          <div style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }}>
            <div style={st.card}>
              <form onSubmit={buscarToken} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', marginBottom: '10px', flexDirection: 'column' }}>
                <div style={{ width: '100%' }}>
                  <label style={st.label}>🔑 Ingrese Token de Seguridad</label>
                  <input style={{ ...st.input, marginBottom: 0 }} type="text" placeholder="Código de 6 dígitos del paciente..." value={tokenBusqueda} onChange={(e) => setTokenBusqueda(e.target.value)} maxLength="6" required />
                </div>
                <button type="submit" style={{ ...st.btnAction, width: '100%', padding: '18px', borderRadius: '14px', fontSize: '1rem', marginTop: '10px' }}>VERIFICAR RECETA EN SISTEMA</button>
              </form>

              {recetaEncontrada && (
                <div style={{ marginTop: '35px', borderTop: '2px dashed #e2e8f0', paddingTop: '25px' }}>
                  <h4 style={{ margin: '0 0 20px 0', fontSize: '1.25rem', fontWeight: '900', color: '#10b981', textTransform: 'uppercase', letterSpacing: '0.5px' }}>✓ Validación Exitosa</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: '#f8fafc', padding: '20px 25px', borderRadius: '16px', border: '1px solid #e2e8f0', fontWeight: '700', color: '#0f172a' }}>
                    <div><span style={{ color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Paciente:</span> <div style={{ marginTop: '4px', fontSize: '1.1rem' }}>{recetaEncontrada.paciente}</div></div>
                    <div>
                      <span style={{ color: '#475569', fontSize: '0.85rem', textTransform: 'uppercase' }}>Fármacos Autorizados:</span> 
                      <div style={{ marginTop: '6px', color: '#2563eb', fontSize: '1.1rem' }}>
                        {Array.isArray(recetaEncontrada.medicamento) ? recetaEncontrada.medicamento.map((med, i) => <div key={i} style={{ marginBottom: '4px' }}>• {med}</div>) : `• ${recetaEncontrada.medicamento}`}
                      </div>
                    </div>
                  </div>
                  {recetaEncontrada.estado === 'Pendiente' ? (
                    <button onClick={despacharMedicamento} style={{ ...st.btnAction, width: '100%', marginTop: '25px', background: '#10b981', padding: '18px', borderRadius: '14px', fontSize: '1.1rem', boxShadow: '0 10px 15px rgba(16, 185, 129, 0.15)' }}>CONFIRMAR ENTREGA DE MEDICAMENTOS</button>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecdd3', borderRadius: '14px', fontWeight: '900', marginTop: '25px', fontSize: '0.95rem' }}>⚠️ Esta orden médica ya fue entregada y procesada previamente.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA: REPORTE DE VENTAS */}
        {vista === 'reporte' && (
          <div style={{ width: '100%' }}>
            <div style={st.alertContainer}>
              <div style={st.alertBox('#fff1f2', '#991b1b', '#fecdd3')}>⚠️ Sin alertas de quiebre de stock clínico registrado hoy.</div>
              <div style={st.alertBox('#eff6ff', '#1e40af', '#bfdbfe')}>ℹ️ Sincronización activa con auditorías cruzadas digitales de MediVault.</div>
            </div>

            {Object.keys(reportesPorMedico).length === 0 ? (
              <div style={st.card}>
                <p style={{ textAlign: 'center', color: '#475569', margin: 0, fontWeight: '700' }}>No se registran despachos farmacéuticos asociados a ningún facultativo.</p>
              </div>
            ) : (
              Object.keys(reportesPorMedico).map((medico, idx) => (
                <div key={idx} style={st.card}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
                    <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#0f172a' }}>Dr(a). {medico}</h3>
                    <span style={{ color: '#2563eb', fontWeight: '900', background: '#eff6ff', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', textTransform: 'uppercase' }}>{reportesPorMedico[medico].totalEntregados} Medicamentos Surtidos</span>
                  </div>
                  {Object.keys(reportesPorMedico[medico].medicamentos).map((med, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '15px 0' }}>
                      <div style={{ width: '250px', fontWeight: '700', color: '#1e293b', fontSize: '0.95rem' }}>💊 {med}</div>
                      <div style={{ background: '#f1f5f9', height: '20px', borderRadius: '10px', flexGrow: 1, overflow: 'hidden' }}>
                        <div style={st.progressBar((reportesPorMedico[medico].medicamentos[med] / reportesPorMedico[medico].totalEntregados) * 100, coloresBarras[i % coloresBarras.length])}></div>
                      </div>
                      <div style={{ width: '50px', textAlign: 'right', fontWeight: '900', color: '#0f172a', fontSize: '1.05rem' }}>{reportesPorMedico[medico].medicamentos[med]}</div>
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>
        )}

        {/* VISTA: CONTROL DE STOCK */}
        {vista === 'inventario' && (
          <div style={{ width: '100%' }}>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '25px' }}>
              <button onClick={() => setMostrarForm(!mostrarForm)} style={{ ...st.btnAction, background: mostrarForm ? '#475569' : '#2563eb', borderRadius: '10px', padding: '12px 24px' }}>
                {mostrarForm ? '❌ Cancelar Registro' : '➕ Añadir Medicamento'}
              </button>
            </div>

            {mostrarForm && (
              <div style={{ ...st.card, border: '2px solid #2563eb', padding: '30px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontWeight: '1.25rem', color: '#2563eb', fontSize: '1.25rem' }}>Registrar Fármaco en Base de Datos</h3>
                <form onSubmit={manejarAgregarMedicamento} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end' }}>
                  <div style={{ flex: 2 }}><label style={st.label}>Nombre Genérico</label><input style={{ ...st.input, marginBottom: 0 }} type="text" placeholder="Ej. Paracetamol" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required /></div>
                  <div style={{ flex: 1 }}><label style={st.label}>Concentración</label><input style={{ ...st.input, marginBottom: 0 }} type="text" placeholder="Ej. 500mg" value={nuevaConcentracion} onChange={(e) => setNuevaConcentracion(e.target.value)} required /></div>
                  <div style={{ flex: 1 }}><label style={st.label}>Stock Inicial</label><input style={{ ...st.input, marginBottom: 0 }} type="number" value={nuevoStock} onChange={(e) => setNuevoStock(e.target.value)} min="0" required /></div>
                  <button type="submit" style={{ ...st.btnAction, height: '52px', borderRadius: '14px', padding: '0 25px' }}>GUARDAR FÁRMACO</button>
                </form>
              </div>
            )}

            <div style={{ ...st.card, padding: '30px 20px' }}>
              <h3 style={{ margin: '0 0 20px 0', fontWeight: '900', fontSize: '1.3rem', color: '#0f172a' }}>Existencias Generales en Farmacia</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#475569', fontWeight: '900', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '14px 15px' }}>MEDICAMENTO</th>
                    <th style={{ padding: '14px 15px', textAlign: 'right' }}>STOCK DISPONIBLE</th>
                  </tr>
                </thead>
                <tbody>
                  {inventario.map(item => (
                    <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                      <td style={{ padding: '18px 15px', fontWeight: '700', color: '#1e293b' }}>💊 {item.nombre}</td>
                      <td style={{ padding: '18px 15px', textAlign: 'right', fontWeight: '900', color: item.stock > 10 ? '#16803d' : '#dc2626', fontSize: '1rem' }}>{item.stock} unidades</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default DashboardFarmacia;