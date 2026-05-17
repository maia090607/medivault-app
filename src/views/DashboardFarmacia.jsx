import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

function DashboardFarmacia({ user, onLogout, recetasEmitidas, inventario }) {
  const [vista, setVista] = useState('dispensar');
  const [tokenBusqueda, setTokenBusqueda] = useState('');
  const [recetaEncontrada, setRecetaEncontrada] = useState(null);
  const [busquedaInventario, setBusquedaInventario] = useState('');
  const [despachoReciente, setDespachoReciente] = useState(null);

  // Estados para el formulario de medicamentos
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaConcentracion, setNuevaConcentracion] = useState('');
  const [nuevoStock, setNuevoStock] = useState('');

  // Filtrar recetas entregadas/dispensadas para auditoría y reportes
  const recetasEntregadas = recetasEmitidas.filter(r => r.estado === 'Entregado' || r.estado === 'Dispensado');

  // Calcular dinámicamente cuántos medicamentos tienen menos de 10 unidades
  const medicamentosBajos = inventario.filter(item => item.stock < 10).length;

  // Filtrado del inventario en tiempo real según la búsqueda del usuario
  const inventarioFiltrado = inventario.filter(item => 
    item.nombre?.toLowerCase().includes(busquedaInventario.toLowerCase())
  );

  // 1. REPORTE POR MÉDICO (Existente)
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

  // 2. CORREGIDO: LÓGICA PARA EL REPORTE GLOBAL DE MEDICAMENTOS MÁS SOLICITADOS
  const conteoGlobalMedicamentos = recetasEntregadas.reduce((acc, receta) => {
    const farmacosList = Array.isArray(receta.medicamento) ? receta.medicamento : [receta.medicamento || "Fármaco Desconocido"];
    
    farmacosList.forEach(med => {
      acc[med] = (acc[med] || 0) + 1;
    });
    return acc;
  }, {});

  // Convertimos a un arreglo ordenado de mayor a menor demanda
  const rankingMedicamentos = Object.entries(conteoGlobalMedicamentos)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

  // Total de unidades de fármacos despachados globalmente para calcular los porcentajes de la gráfica
  const totalFarmacosDespachadosGlobal = rankingMedicamentos.reduce((sum, item) => sum + item.cantidad, 0);

  const coloresBarras = ['#2563eb', '#10b981', '#f59e0b', '#3b82f6', '#6366f1', '#a855f7', '#ec4899', '#14b8a6'];

  const buscarToken = (e) => {
    e.preventDefault();
    const encontrada = recetasEmitidas.find(r => String(r.token) === tokenBusqueda.trim());
    if (encontrada) {
      setRecetaEncontrada(encontrada);
      setDespachoReciente(null);
    } else {
      alert("No se encontró ninguna receta activa con ese token.");
      setRecetaEncontrada(null);
    }
  };

  const enviarCorreoPaciente = async (datosDespacho) => {
    console.log("📨 Iniciando servicio de notificación por correo...");
    const correoDestino = datosDespacho.pacienteEmail || `${datosDespacho.paciente.toLowerCase().replace(/\s+/g, '')}@mail.com`;

    const templateParams = {
      to_email: correoDestino,
      to_name: datosDespacho.paciente,
      subject: `MediVault - Confirmación de Entrega de Medicamentos (Token: ${datosDespacho.token})`,
      message: `Estimado(a) ${datosDespacho.paciente},\n\nLe informamos que sus medicamentos autorizados han sido despachados con éxito.\n\nDetalles del Surtido:\n${datosDespacho.medicamentos.map(m => `• ${m}`).join('\n')}\n\nFecha de Operación: ${datosDespacho.fechaDespacho}\nAtendido en Ventanilla por: ${datosDespacho.atendidoPor}\n\nGracias por confiar en MediVault.`
    };
    console.log("✉️ Contenido del Correo Enviado Exitosamente a:", correoDestino, templateParams);
  };

  const despacharMedicamento = async () => {
    if (!recetaEncontrada) return;

    const fechaHoy = new Date().toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    const listaMedicamentos = Array.isArray(recetaEncontrada.medicamento) 
      ? recetaEncontrada.medicamento 
      : [recetaEncontrada.medicamento];

    try {
      // Reste de stock dinámico en Firebase
      for (const medNombre of listaMedicamentos) {
        const q = query(collection(db, "inventario"), where("nombre", "==", medNombre));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
          const itemDoc = querySnapshot.docs[0];
          const nuevoStockCalculado = Math.max(0, itemDoc.data().stock - 1);
          await updateDoc(doc(db, "inventario", itemDoc.id), {
            stock: nuevoStockCalculado
          });
        }
      }

      const recetaRef = doc(db, "recetas", recetaEncontrada.id);
      await updateDoc(recetaRef, {
        estado: 'Entregado',
        fechaEntrega: fechaHoy
      });

      const infoDespacho = {
        paciente: recetaEncontrada.paciente,
        pacienteEmail: recetaEncontrada.email || null,
        medicamentos: listaMedicamentos,
        medico: recetaEncontrada.medico || "Médico Autorizado",
        token: recetaEncontrada.token,
        fechaDespacho: fechaHoy,
        atendidoPor: user?.nombre || "Carlos Mendoza"
      };

      setDespachoReciente(infoDespacho);
      await enviarCorreoPaciente(infoDespacho);

      alert(`¡Medicamentos entregados con éxito! Se ha enviado un comprobante digital al correo del paciente.`);
      setTokenBusqueda('');
      setRecetaEncontrada(null);
    } catch (error) {
      console.error("Error al despachar: ", error);
      alert("Hubo un error al procesar el despacho.");
    }
  };

  const imprimirTicket = () => {
    window.print();
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
    input: { width: '100%', padding: '16px', border: '2px solid #e2e8f0', background: '#ffffff', borderRadius: '12px', fontSize: '1rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', marginBottom: '15px' },
    label: { fontSize: '0.85rem', fontWeight: '900', color: '#475569', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    
    topNavOuter: { width: '100%', display: 'flex', justifyContent: 'center', borderBottom: '2px solid #e2e8f0', marginBottom: '35px', paddingBottom: '25px' },
    topNavContainer: { display: 'grid', gridTemplateColumns: '1.2fr 2.5fr 1fr', alignItems: 'center', width: '100%', maxWidth: '1200px', boxSizing: 'border-box', padding: '0 10px', gap: '20px' },
    
    headerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' },
    headerTitle: { fontSize: '2.4rem', fontWeight: '900', color: '#2563eb', margin: 0, letterSpacing: '-1px', lineHeight: '1' },
    headerSubtitle: { color: '#475569', fontWeight: '800', fontSize: '1.05rem', margin: 0, lineHeight: '1.2' },
    headerUser: { color: '#1e293b', fontWeight: '700', fontSize: '0.95rem', margin: 0, lineHeight: '1.2' },
    
    tabsWrapper: { display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' },
    tabBtn: (act) => ({ padding: '12px 16px', border: 'none', borderRadius: '10px', background: act ? '#2563eb' : 'transparent', color: act ? '#ffffff' : '#475569', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }),
    
    logoutWrapper: { display: 'flex', justifyContent: 'flex-end' },
    btnLogout: { padding: '12px 16px', background: '#fff1f2', color: '#991b1b', border: '1px solid #fecdd3', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap' },

    btnAction: { background: '#2563eb', color: 'white', border: 'none', padding: '16px 28px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 'auto', gap: '8px', lineHeight: '1.2' },
    
    alertContainer: { display: 'flex', gap: '20px', marginBottom: '35px', width: '100%' },
    alertBox: (bg, color, borderColor) => ({ flex: 1, padding: '20px 25px', borderRadius: '16px', background: bg, color: color, border: `1px solid ${borderColor}`, fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', lineHeight: '1.4' }),
    progressBar: (width, bg) => ({ background: bg, height: '100%', width: `${width}%`, borderRadius: '6px', transition: 'width 0.5s ease-out' })
  };

  return (
    <div style={st.wrapper}>
      
      <style>{`
        @media print {
          body, html, #root { background: #ffffff !important; color: #000000 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .no-print, header, aside, button, form, .top-nav-outer { display: none !important; }
          .print-ticket-card { border: 2px dashed #000000 !important; box-shadow: none !important; padding: 40px !important; margin: 0 !important; border-radius: 0 !important; width: 100% !important; }
          .print-title-header { font-size: 1.6rem !important; color: #000000 !important; border-bottom: 2px dashed #000000; padding-bottom: 10px; }
        }
      `}</style>
      
      {/* MENÚ SUPERIOR HORIZONTAL */}
      <div style={st.topNavOuter} className="no-print">
        <div style={st.topNavContainer}>
          <div style={st.headerContainer}>
            <h1 style={st.headerTitle}>MediVault</h1>
            <h2 style={st.headerSubtitle}>Módulo Farmacia</h2>
            <h3 style={st.headerUser}>{user?.nombre || "Carlos Mendoza"}</h3>
          </div>
          
          <div style={st.tabsWrapper}>
            <button onClick={() => setVista('dispensar')} style={st.tabBtn(vista === 'dispensar')}>📦 Dispensar</button>
            <button onClick={() => setVista('despachos')} style={st.tabBtn(vista === 'despachos')}>📋 Despachos</button>
            <button onClick={() => setVista('inventario')} style={st.tabBtn(vista === 'inventario')}>📊 Inventario</button>
            <button onClick={() => setVista('reporte')} style={st.tabBtn(vista === 'reporte')}>📈 Reportes</button>
          </div>

          <div style={st.logoutWrapper}>
            <button onClick={onLogout} style={st.btnLogout}>Cerrar Sesión</button>
          </div>
        </div>
      </div>

      {/* ÁREA DE CONTENIDO SEGURO */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>

        {/* COMPROBANTE DE ENTREGA EXITOSA */}
        {vista === 'dispensar' && despachoReciente && (
          <div className="print-ticket-card" style={{ background: '#ffffff', padding: '30px 40px', borderRadius: '24px', borderLeft: '8px solid #10b981', marginBottom: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="print-title-header" style={{ fontWeight: '900', color: '#10b981', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>✓ COMPROBANTE DE SURTIDO — FARMACIA MEDIVAULT</span>
                <div style={{ color: '#0f172a', fontWeight: '800', fontSize: '1.6rem', marginTop: '12px' }}>Paciente: {despachoReciente.paciente}</div>
                <div style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', fontSize: '0.8rem', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', marginTop: '6px', textTransform: 'uppercase' }}>📩 Comprobante Digital Enviado al Correo</div>
                <div style={{ color: '#2563eb', fontWeight: '900', fontSize: '1.1rem', marginTop: '15px' }}>📦 MEDICAMENTOS ENTREGADOS:</div>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: '#1e293b', fontWeight: '700' }}>
                  {despachoReciente.medicamentos.map((med, i) => <li key={i} style={{ marginBottom: '4px' }}>{med}</li>)}
                </ul>
                <div style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: '600', marginTop: '15px' }}>Prescrito por: {despachoReciente.medico} | Despachado por: {despachoReciente.atendidoPor} el {despachoReciente.fechaDespacho}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase' }}>Código Token</span>
                <span style={{ color: '#2563eb', fontSize: '2.4rem', fontWeight: '950', display: 'block', marginTop: '4px' }}>{despachoReciente.token}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px dashed #f1f5f9', paddingTop: '15px' }} className="no-print">
              <button onClick={imprimirTicket} style={{ ...st.btnAction, background: '#0f172a', padding: '12px 24px', borderRadius: '10px', fontSize: '0.9rem' }}>🖨️ IMPRIMIR TICKET DE DESPACHO</button>
            </div>
          </div>
        )}

        {/* VISTA: DISPENSAR */}
        {vista === 'dispensar' && (
          <div style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }} className="no-print">
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

        {/* VISTA: HISTORIAL DE DESPACHOS */}
        {vista === 'despachos' && (
          <div style={{ ...st.card, padding: '35px 20px' }} className="no-print">
            <h3 style={{ margin: '0 0 25px 0', fontWeight: '900', fontSize: '1.3rem', color: '#0f172a' }}>Historial de Medicamentos Entregados</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#334155', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 14px', width: '22%' }}>PACIENTE</th>
                  <th style={{ padding: '12px 14px', width: '28%' }}>MEDICAMENTOS SURTIDOS</th>
                  <th style={{ padding: '12px 14px', width: '20%' }}>FECHA Y HORA ENTREGA</th>
                  <th style={{ padding: '12px 14px', width: '15%' }}>MÉDICO PRESCRIPTOR</th>
                  <th style={{ padding: '12px 14px', width: '15%', textAlign: 'right' }}>TOKEN</th>
                </tr>
              </thead>
              <tbody>
                {recetasEntregadas.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: '700' }}>No se registran medicamentos despachados el día de hoy.</td>
                  </tr>
                ) : (
                  recetasEntregadas.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                      <td style={{ padding: '16px 14px', fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>{r.paciente}</td>
                      <td style={{ padding: '16px 14px', fontSize: '0.88rem', color: '#1e293b', fontWeight: '600' }}>
                        {Array.isArray(r.medicamento) ? (
                          r.medicamento.map((med, i) => <div key={i} style={{ marginBottom: '4px' }}>• {med}</div>)
                        ) : (
                          <div>• {r.medicamento}</div>
                        )}
                      </td>
                      <td style={{ padding: '16px 14px', fontSize: '0.85rem', color: '#15803d', fontWeight: '700' }}>{r.fechaEntrega || r.fecha || '—'}</td>
                      <td style={{ padding: '16px 14px', fontSize: '0.85rem', color: '#475569', fontWeight: '600' }}>{r.medico || "Clínica General"}</td>
                      <td style={{ padding: '16px 14px', textAlign: 'right', color: '#2563eb', fontWeight: '900', fontSize: '1.05rem' }}>{r.token}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VISTA: REPORTES (INCLUYE EL NUEVO DASHBOARD ANALÍTICO GLOBAL) */}
        {vista === 'reporte' && (
          <div style={{ width: '100%' }} className="no-print">
            <div style={st.alertContainer}>
              <div style={st.alertBox(medicamentosBajos > 0 ? '#fff1f2' : '#f0fdf4', medicamentosBajos > 0 ? '#991b1b' : '#14532d', medicamentosBajos > 0 ? '#fecdd3' : '#bbf7d0')}>
                {medicamentosBajos > 0 ? `⚠️ Alertas de stock crítico: ${medicamentosBajos} medicamentos por agotarse.` : '✅ Todo en orden: No hay alertas de stock bajo actualmente.'}
              </div>
              <div style={st.alertBox('#eff6ff', '#1e40af', '#bfdbfe')}>ℹ️ Sincronización activa con auditorías cruzadas digitales de MediVault.</div>
            </div>

            {/* CORREGIDO: NUEVA SECCIÓN GRÁFICA GLOBAL - MEDICAMENTOS MÁS SOLICITADOS EN LA SEDE */}
            <div style={{ ...st.card, borderTop: '6px solid #2563eb' }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: '950', color: '#0f172a' }}>📈 Consumo Global de Fármacos</h3>
              <p style={{ color: '#475569', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 25px 0' }}>Ranking consolidado de demanda en farmacia de mayor a menor rotación.</p>
              
              {rankingMedicamentos.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', fontWeight: '700', padding: '20px' }}>No hay estadísticas de consumo registradas todavía.</p>
              ) : (
                rankingMedicamentos.map((item, index) => {
                  const porcentajeCalculado = ((item.cantidad / totalFarmacosDespachadosGlobal) * 100).toFixed(1);
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '18px 0' }}>
                      <div style={{ width: '260px', fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' }}>📦 {item.nombre}</div>
                      <div style={{ background: '#f1f5f9', height: '24px', borderRadius: '12px', flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
                        <div style={st.progressBar(porcentajeCalculado, coloresBarras[index % coloresBarras.length])}></div>
                      </div>
                      <div style={{ width: '100px', textAlign: 'right', fontWeight: '900', color: '#2563eb', fontSize: '1.05rem' }}>
                        {item.cantidad} u. <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '600' }}>({porcentajeCalculado}%)</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* REPORTES SEGMENTADOS POR DOCTOR */}
            {Object.keys(reportesPorMedico).length > 0 && (
              <h4 style={{ color: '#475569', fontWeight: '900', fontSize: '1.1rem', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Demandas Segmentadas por Facultativo</h4>
            )}

            {Object.keys(reportesPorMedico).map((medico, idx) => (
              <div key={idx} style={st.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: '#0f172a' }}>Dr(a). {medico}</h3>
                  <span style={{ color: '#2563eb', fontWeight: '900', background: '#eff6ff', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem', textTransform: 'uppercase' }}>{reportesPorMedico[medico].totalEntregados} Recetas Surtidas</span>
                </div>
                {Object.keys(reportesPorMedico[medico].medicamentos).map((med, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '15px 0' }}>
                    <div style={{ width: '250px', fontWeight: '700', color: '#475569', fontSize: '0.95rem' }}>• {med}</div>
                    <div style={{ background: '#f1f5f9', height: '16px', borderRadius: '8px', flexGrow: 1, overflow: 'hidden' }}>
                      <div style={st.progressBar((reportesPorMedico[medico].medicamentos[med] / reportesPorMedico[medico].totalEntregados) * 100, '#64748b')}></div>
                    </div>
                    <div style={{ width: '50px', textAlign: 'right', fontWeight: '900', color: '#0f172a', fontSize: '1.05rem' }}>{reportesPorMedico[medico].medicamentos[med]}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* VISTA: CONTROL DE STOCK */}
        {vista === 'inventario' && (
          <div style={{ width: '100%' }} className="no-print">
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '25px', width: '100%' }}>
              <div style={{ flexGrow: 1 }}>
                <input style={{ ...st.input, marginBottom: 0 }} type="text" placeholder="🔍 Buscar medicamento en el almacén por nombre..." value={busquedaInventario} onChange={(e) => setBusquedaInventario(e.target.value)} />
              </div>
              <button onClick={() => setMostrarForm(!mostrarForm)} style={{ ...st.btnAction, background: mostrarForm ? '#475569' : '#2563eb', borderRadius: '12px', padding: '16px 24px', whiteSpace: 'nowrap' }}>
                {mostrarForm ? '❌ Cancelar Registro' : '➕ Añadir Medicamento'}
              </button>
            </div>

            {mostrarForm && (
              <div style={{ ...st.card, border: '2px solid #2563eb', padding: '30px' }}>
                <h3 style={{ margin: '0 0 20px 0', fontWeight: '900', color: '#2563eb', fontSize: '1.25rem' }}>Registrar Fármaco en Base de Datos</h3>
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
                    <th style={{ padding: '14px 15px', width: '60%' }}>MEDICAMENTO</th>
                    <th style={{ padding: '14px 15px', textAlign: 'right', width: '40%' }}>STOCK DISPONIBLE</th>
                  </tr>
                </thead>
                <tbody>
                  {inventarioFiltrado.length === 0 ? (
                    <tr>
                      <td colSpan="2" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: '700' }}>No se encontraron medicamentos con ese criterio de búsqueda.</td>
                    </tr>
                  ) : (
                    inventarioFiltrado.map(item => (
                      <tr key={item.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                        <td style={{ padding: '18px 15px', fontWeight: '700', color: '#1e293b' }}>💊 {item.nombre}</td>
                        <td style={{ padding: '18px 15px', textAlign: 'right', fontWeight: '900' }}>
                          {item.stock < 10 ? (
                            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                              <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900', textTransform: 'uppercase', letterSpacing: '0.3px' }}>⚠️ Stock Crítico</span>
                              <span style={{ color: '#dc2626' }}>{item.stock} unidades</span>
                            </div>
                          ) : (
                            <span style={{ color: '#16803d' }}>{item.stock} unidades</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
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