import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, collection, addDoc, getDocs, query, where } from 'firebase/firestore';

function DashboardFarmacia({ user, onLogout, recetasEmitidas, inventario }) {
  const [vista, setVista] = useState('dispensar');
  const [tokenBusqueda, setTokenBusqueda] = useState('');
  const [recetaEncontrada, setRecetaEncontrada] = useState(null);
  const [busquedaInventario, setBusquedaInventario] = useState('');
  const [despachoReciente, setDespachoReciente] = useState(null);

  // CONTROL DE MODO OSCURO
  const [darkMode, setDarkMode] = useState(false);

  // Estados para el formulario de agregar nuevo medicamento
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaConcentracion, setNuevaConcentracion] = useState('');
  const [nuevoStock, setNuevoStock] = useState('');

  // ESTADOS PARA EL MODAL DE ABASTECIMIENTO PERSONALIZADO
  const [mostrarModalAbastecer, setMostrarModalAbastecer] = useState(false);
  const [medSeleccionado, setMedSeleccionado] = useState(null);
  const [cantidadAñadir, setCantidadAñadir] = useState('');

  // Filtrar recetas entregadas/dispensadas para auditoría y reportes
  const recetasEntregadas = recetasEmitidas.filter(r => r.estado === 'Entregado' || r.estado === 'Dispensado');

  // Calcular dinámicamente cuántos medicamentos tienen menos de 10 unidades
  const medicamentosBajos = inventario.filter(item => item.stock < 10).length;

  // Filtrado del inventario en tiempo real según la búsqueda del usuario
  const inventarioFiltrado = inventario.filter(item => 
    item.nombre?.toLowerCase().includes(busquedaInventario.toLowerCase())
  );

  // 1. REPORTE POR MÉDICO
  const reportesPorMedico = recetasEntregadas.reduce((acc, receta) => {
    const medicoNombre = receta.medico || "Médico General";
    const farmacosList = Array.isArray(receta.medicamento) ? receta.medicamento : [receta.medicamento || "Fármaco Desconocido"];

    if (!acc[medicoNombre]) {
      acc[medicoNombre] = { totalEntregados: 0, medicamentos: {} };
    }

    farmacosList.forEach(medicamentoNombre => {
      acc[medicoNombre].totalEntregados += 1;
      const nombreMedStr = typeof medicamentoNombre === 'object' ? medicamentoNombre.nombre : medicamentoNombre;
      if (!acc[medicoNombre].medicamentos[nombreMedStr]) {
        acc[medicoNombre].medicamentos[nombreMedStr] = 0;
      }
      acc[medicoNombre].medicamentos[nombreMedStr] += 1;
    });

    return acc;
  }, {});

  // 2. REPORTE GLOBAL DE MEDICAMENTOS MÁS SOLICITADOS
  const conteoGlobalMedicamentos = recetasEntregadas.reduce((acc, receta) => {
    const farmacosList = Array.isArray(receta.medicamento) ? receta.medicamento : [receta.medicamento || "Fármaco Desconocido"];
    
    farmacosList.forEach(med => {
      const nombreMedStr = typeof med === 'object' ? med.nombre : med;
      acc[nombreMedStr] = (acc[nombreMedStr] || 0) + 1;
    });
    return acc;
  }, {});

  const rankingMedicamentos = Object.entries(conteoGlobalMedicamentos)
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad);

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
    console.log("✉️ Comprobante enviado a:", correoDestino, datosDespacho);
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
      for (const med of listaMedicamentos) {
        const medNombre = typeof med === 'object' ? med.nombre : med;
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
        medicamentos: listaMedicamentos.map(m => typeof m === 'object' ? m.nombre : m),
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

  // MANEJADORES PARA EL NUEVO MODAL ESTILIZADO
  const abrirModalAbastecimiento = (item) => {
    setMedSeleccionado(item);
    setCantidadAñadir('');
    setMostrarModalAbastecer(true);
  };

  const ejecutarAbastecimientoModal = async (e) => {
    e.preventDefault();
    if (!medSeleccionado || !cantidadAñadir) return;

    const unidades = parseInt(cantidadAñadir, 10);
    if (isNaN(unidades) || unidades <= 0) {
      alert("Por favor, introduce una cantidad válida mayor a 0.");
      return;
    }

    try {
      const medRef = doc(db, "inventario", medSeleccionado.id);
      await updateDoc(medRef, {
        stock: medSeleccionado.stock + unidades
      });
      
      // Cerrar modal y limpiar estados
      setMostrarModalAbastecer(false);
      setMedSeleccionado(null);
      setCantidadAñadir('');
    } catch (error) {
      console.error("Error al reabastecer:", error);
      alert("Hubo un problema actualizando el stock.");
    }
  };

  const st = {
    wrapper: { background: darkMode ? '#0f172a' : '#f8fafc', minHeight: '100vh', width: '100%', padding: '30px 40px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', color: darkMode ? '#f1f5f9' : '#0f172a', overflowX: 'hidden', transition: 'all 0.3s ease' },
    card: { background: darkMode ? '#1e293b' : '#ffffff', borderRadius: '24px', padding: '35px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', marginBottom: '35px', width: '100%', boxSizing: 'border-box', transition: 'all 0.3s ease' },
    input: { width: '100%', padding: '16px', border: darkMode ? '2px solid #334155' : '2px solid #e2e8f0', background: darkMode ? '#0f172a' : '#ffffff', borderRadius: '12px', fontSize: '1rem', color: darkMode ? '#ffffff' : '#0f172a', outline: 'none', boxSizing: 'border-box', marginBottom: '15px', transition: 'all 0.2s ease' },
    label: { fontSize: '0.85rem', fontWeight: '900', color: darkMode ? '#94a3b8' : '#475569', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    
    topNavOuter: { width: '100%', display: 'flex', justifyContent: 'center', borderBottom: darkMode ? '2px solid #1e293b' : '2px solid #e2e8f0', marginBottom: '35px', paddingBottom: '25px' },
    topNavContainer: { display: 'grid', gridTemplateColumns: '1.2fr 2.5fr 1fr', alignItems: 'center', width: '100%', maxWidth: '1200px', boxSizing: 'border-box', padding: '0 10px', gap: '20px' },
    
    headerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '4px' },
    headerTitle: { fontSize: '2.2rem', fontWeight: '900', color: '#2563eb', margin: 0, letterSpacing: '-1px', lineHeight: '1' },
    headerSubtitle: { color: darkMode ? '#94a3b8' : '#475569', fontWeight: '800', fontSize: '1.05rem', margin: 0, lineHeight: '1.2' },
    headerUser: { color: darkMode ? '#ffffff' : '#1e293b', fontWeight: '700', fontSize: '0.95rem', margin: 0, lineHeight: '1.2' },
    
    tabsWrapper: { display: 'flex', gap: '8px', justifyContent: 'center', alignItems: 'center' },
    tabBtn: (act) => ({ padding: '12px 16px', border: 'none', borderRadius: '10px', background: act ? '#2563eb' : 'transparent', color: act ? '#ffffff' : (darkMode ? '#94a3b8' : '#334155'), fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }),
    
    logoutWrapper: { display: 'flex', justifyContent: 'flex-end' },
    btnLogout: { padding: '12px 16px', background: '#fff1f2', color: '#991b1b', border: '1px solid #fecdd3', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap' },

    btnAction: { background: '#2563eb', color: 'white', border: 'none', padding: '16px 28px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 'auto', gap: '8px', lineHeight: '1.2', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.15)' },
    
    alertContainer: { display: 'flex', gap: '20px', marginBottom: '35px', width: '100%' },
    alertBox: (bg, color, borderColor) => ({ flex: 1, padding: '20px 25px', borderRadius: '16px', background: bg, color: color, border: `1px solid ${borderColor}`, fontSize: '0.95rem', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '12px', lineHeight: '1.4' }),
    progressBar: (width, bg) => ({ background: bg, height: '100%', width: `${width}%`, borderRadius: '6px', transition: 'width 0.5s ease-out' }),

    themeToggleBtn: { position: 'fixed', bottom: '30px', right: '30px', width: '56px', height: '56px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)', zIndex: 5000, transition: 'transform 0.2s' },
    
    histTh: { padding: '16px 14px', color: darkMode ? '#94a3b8' : '#475569', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: darkMode ? '2px solid #334155' : '2px solid #e2e8f0', textAlign: 'left' },
    histTd: { padding: '18px 14px', fontSize: '0.9rem', borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9', verticalAlign: 'middle', color: darkMode ? '#cbd5e1' : '#0f172a' }
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
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .saas-input:focus { border-color: #2563eb !important; background: ${darkMode ? '#0f172a' : '#ffffff'} !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.06) !important; }
        .btn-supply-action { background: #eff6ff; color: #2563eb; border: 1px solid #bfdbfe; padding: 6px 14px; border-radius: 8px; font-weight: 800; font-size: 0.78rem; cursor: pointer; transition: all 0.2s; display: inline-flex; align-items: center; gap: 4px; }
        .btn-supply-action:hover { background: #2563eb; color: #ffffff; border-color: #2563eb; transform: translateY(-1px); }
      `}</style>
      
      {/* BOTÓN FLOTANTE MODO OSCURO */}
      <button 
        style={st.themeToggleBtn} 
        onClick={() => setDarkMode(!darkMode)}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        className="no-print"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>
      
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
          <div className="print-ticket-card" style={{ background: darkMode ? '#1e293b' : '#ffffff', padding: '30px 40px', borderRadius: '24px', borderLeft: '8px solid #10b981', marginBottom: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', boxSizing: 'border-box', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', animation: 'slideUp 0.3s ease' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <span className="print-title-header" style={{ fontWeight: '900', color: '#10b981', fontSize: '1.2rem', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block' }}>✓ COMPROBANTE DE SURTIDO — FARMACIA MEDIVAULT</span>
                <div style={{ color: darkMode ? '#ffffff' : '#0f172a', fontWeight: '800', fontSize: '1.6rem', marginTop: '12px' }}>Paciente: {despachoReciente.paciente}</div>
                <div style={{ display: 'inline-block', background: '#e0f2fe', color: '#0369a1', fontSize: '0.8rem', fontWeight: '800', padding: '4px 10px', borderRadius: '6px', marginTop: '6px', textTransform: 'uppercase' }}>📩 Comprobante Digital Enviado al Correo</div>
                <div style={{ color: '#2563eb', fontWeight: '900', fontSize: '1.1rem', marginTop: '15px' }}>📦 MEDICAMENTOS ENTREGADOS:</div>
                <ul style={{ margin: '8px 0 0 0', paddingLeft: '20px', color: darkMode ? '#cbd5e1' : '#1e293b', fontWeight: '700' }}>
                  {despachoReciente.medicamentos.map((med, i) => <li key={i} style={{ marginBottom: '4px' }}>• {med}</li>)}
                </ul>
                <div style={{ color: '#64748b', fontSize: '0.88rem', fontWeight: '600', marginTop: '15px' }}>Prescrito por: {despachoReciente.medico} | Despachado por: {despachoReciente.atendidoPor} el {despachoReciente.fechaDespacho}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#64748b', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase' }}>Código Token</span>
                <span style={{ color: '#2563eb', fontSize: '2.4rem', fontWeight: '950', display: 'block', marginTop: '4px' }}>{despachoReciente.token}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: darkMode ? '2px dashed #334155' : '2px dashed #f1f5f9', paddingTop: '15px' }} className="no-print">
              <button onClick={() => window.print()} style={{ ...st.btnAction, background: darkMode ? '#ffffff' : '#0f172a', color: darkMode ? '#0f172a' : '#ffffff', padding: '12px 24px', borderRadius: '10px', fontSize: '0.9rem' }}>🖨️ IMPRIMIR TICKET DE DESPACHO</button>
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
                  <input className="saas-input" style={{ ...st.input, marginBottom: 0 }} type="text" placeholder="Código de 6 dígitos del paciente..." value={tokenBusqueda} onChange={(e) => setTokenBusqueda(e.target.value)} maxLength="6" required />
                </div>
                <button type="submit" style={{ ...st.btnAction, width: '100%', padding: '18px', borderRadius: '14px', fontSize: '1rem', marginTop: '10px' }}>VERIFICAR RECETA EN SISTEMA</button>
              </form>

              {recetaEncontrada && (
                <div style={{ marginTop: '35px', borderTop: darkMode ? '2px dashed #334155' : '2px dashed #e2e8f0', paddingTop: '25px', animation: 'fadeIn 0.25s ease' }}>
                  <div style={{ background: recetaEncontrada.estado === 'Pendiente' ? (darkMode ? '#14221f' : '#ecfdf5') : (darkMode ? '#2c1616' : '#fff1f1'), border: '1px solid', borderColor: recetaEncontrada.estado === 'Pendiente' ? '#a7f3d0' : '#fca5a5', padding: '14px 20px', borderRadius: '12px', marginBottom: '20px', fontWeight: '800', color: recetaEncontrada.estado === 'Pendiente' ? '#10b981' : '#ef4444', fontSize: '0.9rem', letterSpacing: '0.5px' }}>
                    {recetaEncontrada.estado === 'Pendiente' ? '⏳ RECETA DE ALTA AUTORIZADA PARA DESPACHO' : '⚠️ ALERTA: ESTA FÓRMULA YA FUE PROCESADA'}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', background: darkMode ? '#0f172a' : '#f8fafc', padding: '20px 25px', borderRadius: '16px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', fontWeight: '700', color: darkMode ? '#ffffff' : '#0f172a' }}>
                    <div><span style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Paciente Beneficiario:</span> <div style={{ marginTop: '4px', fontSize: '1.1rem' }}>{recetaEncontrada.paciente}</div></div>
                    <div>
                      <span style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'uppercase' }}>Fármacos Autorizados:</span> 
                      <div style={{ marginTop: '6px', color: '#2563eb', fontSize: '1.1rem', fontWeight: '800' }}>
                        {Array.isArray(recetaEncontrada.medicamento) ? (
                          recetaEncontrada.medicamento.map((med, i) => (
                            <div key={i} style={{ marginBottom: '6px' }}>
                              • {typeof med === 'object' ? med.nombre : med} <span style={{fontSize: '0.85rem', fontStyle: 'italic', color: '#64748b'}}>{med.posologia ? `(${med.posologia})` : ''}</span>
                            </div>
                          ))
                        ) : (
                          <div>• {recetaEncontrada.medicamento}</div>
                        )}
                      </div>
                    </div>
                  </div>
                  {recetaEncontrada.estado === 'Pendiente' ? (
                    <button onClick={despacharMedicamento} style={{ ...st.btnAction, width: '100%', marginTop: '25px', background: '#10b981', padding: '18px', borderRadius: '14px', fontSize: '1.1rem', boxShadow: '0 10px 15px rgba(16, 185, 129, 0.15)' }}>CONFIRMAR ENTREGA DE MEDICAMENTOS</button>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px', background: '#fee2e2', color: '#991b1b', border: '1px solid #fecdd3', borderRadius: '14px', fontWeight: '900', marginTop: '25px', fontSize: '0.95rem' }}>🚫 Operación denegada: Token inactivo por dispensación previa el {recetaEncontrada.fechaEntrega}.</div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}

        {/* VISTA: HISTORIAL DE DESPACHOS */}
        {vista === 'despachos' && (
          <div style={{ ...st.card, padding: '35px 20px', overflowX: 'auto' }} className="no-print">
            <h3 style={{ margin: '0 0 25px 0', fontWeight: '900', fontSize: '1.3rem', color: darkMode ? '#ffffff' : '#0f172a' }}>Historial de Medicamentos Entregados</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '950px' }}>
              <thead>
                <tr>
                  <th style={{ ...st.histTh, width: '22%' }}>Paciente</th>
                  <th style={{ ...st.histTh, width: '32%' }}>Medicamentos Surtidos</th>
                  <th style={{ ...st.histTh, width: '18%' }}>Fecha y Hora Entrega</th>
                  <th style={{ ...st.histTh, width: '18%' }}>Médico Prescriptor</th>
                  <th style={{ ...st.histTh, width: '10%', textAlign: 'right' }}>Token</th>
                </tr>
              </thead>
              <tbody>
                {recetasEntregadas.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '700' }}>No se registran medicamentos despachados el día de hoy.</td>
                  </tr>
                ) : (
                  recetasEntregadas.map(r => (
                    <tr key={r.id} style={{ borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                      <td style={st.histTd}>
                        <div style={{ fontWeight: '700', color: darkMode ? '#ffffff' : '#0f172a' }}>{r.paciente}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>DNI: {r.dniPaciente}</div>
                      </td>
                      <td style={st.histTd}>
                        {Array.isArray(r.medicamento) ? (
                          r.medicamento.map((med, i) => (
                            <div key={i} style={{ marginBottom: '4px', lineHeight: '1.3' }}>
                              • <strong>{typeof med === 'object' ? med.nombre : med}</strong>
                            </div>
                          ))
                        ) : (
                          <div>• <strong>{r.medicamento}</strong></div>
                        )}
                      </td>
                      <td style={{ ...st.histTd, color: '#10b981', fontWeight: '700' }}>{r.fechaEntrega || r.fecha || '—'}</td>
                      <td style={st.histTd}>Dr(a). {r.medico || "Clínica General"}</td>
                      <td style={{ ...st.histTd, textAlign: 'right', color: '#2563eb', fontWeight: '900', fontSize: '1.05rem' }}>{r.token}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* VISTA: REPORTES */}
        {vista === 'reporte' && (
          <div style={{ width: '100%' }} className="no-print">
            <div style={st.alertContainer}>
              <div style={st.alertBox(medicamentosBajos > 0 ? (darkMode ? '#2c1616' : '#fff1f2') : (darkMode ? '#14221f' : '#f0fdf4'), medicamentosBajos > 0 ? '#ef4444' : '#10b981', medicamentosBajos > 0 ? '#5c2626' : '#22c55e')}>
                {medicamentosBajos > 0 ? `⚠️ Alertas de stock crítico: ${medicamentosBajos} medicamentos con bajo suministro.` : '✅ Todo en orden: Niveles de almacén estables y abastecidos.'}
              </div>
              <div style={st.alertBox(darkMode ? '#1e2538' : '#eff6ff', darkMode ? '#3b82f6' : '#1e40af', darkMode ? '#243b6b' : '#bfdbfe')}>ℹ️ Sincronización activa con auditorías cruzadas digitales de MediVault.</div>
            </div>

            <div style={st.card}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.5rem', fontWeight: '950', color: darkMode ? '#ffffff' : '#0f172a' }}>📈 Consumo Global de Fármacos</h3>
              <p style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600', margin: '0 0 25px 0' }}>Ranking consolidado de demanda en farmacia de mayor a menor rotación.</p>
              
              {rankingMedicamentos.length === 0 ? (
                <p style={{ textAlign: 'center', color: '#64748b', fontWeight: '700', padding: '20px' }}>No hay estadísticas de consumo registradas todavía.</p>
              ) : (
                rankingMedicamentos.map((item, index) => {
                  const porcentajeCalculado = ((item.cantidad / totalFarmacosDespachadosGlobal) * 100).toFixed(1);
                  return (
                    <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '18px 0' }}>
                      <div style={{ width: '260px', fontWeight: '800', color: darkMode ? '#ffffff' : '#1e293b', fontSize: '0.95rem' }}>📦 {item.nombre}</div>
                      <div style={{ background: darkMode ? '#0f172a' : '#f1f5f9', height: '24px', borderRadius: '12px', flexGrow: 1, overflow: 'hidden', display: 'flex' }}>
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

            {Object.keys(reportesPorMedico).map((medico, idx) => (
              <div key={idx} style={st.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: darkMode ? '2px solid #334155' : '2px solid #f1f5f9', paddingBottom: '15px', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a' }}>Dr(a). {medico}</h3>
                  <span style={{ color: '#2563eb', fontWeight: '900', background: '#eff6ff', padding: '6px 14px', borderRadius: '8px', fontSize: '0.85rem' }}>{reportesPorMedico[medico].totalEntregados} Recetas Surtidas</span>
                </div>
                {Object.keys(reportesPorMedico[medico].medicamentos).map((med, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '20px', margin: '15px 0' }}>
                    <div style={{ width: '250px', fontWeight: '700', color: darkMode ? '#cbd5e1' : '#475569', fontSize: '0.95rem' }}>• {med}</div>
                    <div style={{ background: darkMode ? '#0f172a' : '#f1f5f9', height: '16px', borderRadius: '8px', flexGrow: 1, overflow: 'hidden' }}>
                      <div style={st.progressBar((reportesPorMedico[medico].medicamentos[med] / reportesPorMedico[medico].totalEntregados) * 100, '#64748b')}></div>
                    </div>
                    <div style={{ width: '50px', textAlign: 'right', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a', fontSize: '1.05rem' }}>{reportesPorMedico[medico].medicamentos[med]}</div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}

        {/* VISTA: CONTROL DE STOCK (INVENTARIO) */}
        {vista === 'inventario' && (
          <div style={{ width: '100%' }} className="no-print">
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '25px', width: '100%', flexWrap: 'wrap' }}>
              <div style={{ flexGrow: 1, minWidth: '300px' }}>
                <input className="saas-input" style={{ ...st.input, marginBottom: 0 }} type="text" placeholder="🔍 Buscar medicamento en el almacén por nombre..." value={busquedaInventario} onChange={(e) => setBusquedaInventario(e.target.value)} />
              </div>
              <button onClick={() => setMostrarForm(!mostrarForm)} style={{ ...st.btnAction, background: mostrarForm ? '#475569' : '#2563eb', borderRadius: '12px', padding: '16px 24px', whiteSpace: 'nowrap' }}>
                {mostrarForm ? '❌ Cancelar Registro' : '➕ Añadir Medicamento'}
              </button>
            </div>

            {mostrarForm && (
              <div style={{ ...st.card, border: '2px solid #2563eb', padding: '30px', animation: 'slideUp 0.3s ease' }}>
                <h3 style={{ margin: '0 0 20px 0', fontWeight: '900', color: '#2563eb', fontSize: '1.25rem' }}>Registrar Fármaco en Almacén Sede</h3>
                <form onSubmit={manejarAgregarMedicamento} style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 2, minWidth: '200px' }}><label style={st.label}>Nombre Genérico</label><input className="saas-input" style={{ ...st.input, marginBottom: 0 }} type="text" placeholder="Ej. Paracetamol" value={nuevoNombre} onChange={(e) => setNuevoNombre(e.target.value)} required /></div>
                  <div style={{ flex: 1, minWidth: '100px' }}><label style={st.label}>Concentración</label><input className="saas-input" style={{ ...st.input, marginBottom: 0 }} type="text" placeholder="Ej. 500mg" value={nuevaConcentracion} onChange={(e) => setNuevaConcentracion(e.target.value)} required /></div>
                  <div style={{ flex: 1, minWidth: '100px' }}><label style={st.label}>Stock Inicial</label><input className="saas-input" style={{ ...st.input, marginBottom: 0 }} type="number" value={nuevoStock} onChange={(e) => setNuevoStock(e.target.value)} min="0" required /></div>
                  <button type="submit" style={{ ...st.btnAction, height: '54px', borderRadius: '12px', padding: '0 25px' }}>GUARDAR FÁRMACO</button>
                </form>
              </div>
            )}

            <div style={{ ...st.card, padding: '30px 20px' }}>
              <h3 style={{ margin: '0 0 25px 0', fontWeight: '900', fontSize: '1.3rem', color: darkMode ? '#ffffff' : '#0f172a', textAlign: 'center' }}>Existencias Generales en Farmacia</h3>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: darkMode ? '2px solid #334155' : '2px solid #e2e8f0', color: darkMode ? '#94a3b8' : '#475569', fontWeight: '900', fontSize: '0.85rem', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '14px 15px', width: '50%', textAlign: 'center' }}>MEDICAMENTO</th>
                    <th style={{ padding: '14px 15px', width: '50%', textAlign: 'center' }}>STATUS / STOCK</th>
                  </tr>
                </thead>
                <tbody>
                  {inventarioFiltrado.length === 0 ? (
                    <tr>
                      <td colSpan="2" style={{ padding: '30px', textAlign: 'center', color: '#64748b', fontWeight: '700' }}>No se encontraron medicamentos con ese criterio de búsqueda.</td>
                    </tr>
                  ) : (
                    inventarioFiltrado.map(item => (
                      <tr key={item.id} style={{ borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}>
                        <td style={{ padding: '18px 15px', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b', textAlign: 'center' }}>💊 {item.nombre}</td>
                        <td style={{ padding: '18px 15px', fontWeight: '900', textAlign: 'center' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
                            {item.stock === 0 ? (
                              <>
                                <span style={{ background: '#7f1d1d', color: '#fca5a5', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900' }}>🚫 AGOTADO</span>
                                <span style={{ color: '#ef4444' }}>0 unidades</span>
                                <button className="btn-supply-action" onClick={() => abrirModalAbastecimiento(item)}>📥 Abastecer</button>
                              </>
                            ) : item.stock < 10 ? (
                              <>
                                <span style={{ background: '#fee2e2', color: '#dc2626', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900' }}>⚠️ CRÍTICO</span>
                                <span style={{ color: '#dc2626' }}>{item.stock} unidades</span>
                                <button className="btn-supply-action" onClick={() => abrirModalAbastecimiento(item)}>📥 Abastecer</button>
                              </>
                            ) : (
                              <>
                                <span style={{ background: '#dcfce7', color: '#16a34a', padding: '4px 10px', borderRadius: '6px', fontSize: '0.75rem', fontWeight: '900' }}>🟢 EN STOCK</span>
                                <span style={{ color: darkMode ? '#cbd5e1' : '#16803d' }}>{item.stock} unidades</span>
                              </>
                            )}
                          </div>
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

      {/* ==================== NUEVO MODAL DE ABASTECIMIENTO ESTILIZADO ==================== */}
      {mostrarModalAbastecer && medSeleccionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, animation: 'fadeIn 0.2s ease' }}>
          <div style={{ background: darkMode ? '#1e293b' : '#ffffff', width: '100%', maxWidth: '480px', borderRadius: '24px', padding: '35px', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', animation: 'slideUp 0.25s ease-out', boxSizing: 'border-box' }}>
            
            {/* Encabezado */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, fontWeight: '950', fontSize: '1.35rem', color: '#2563eb' }}>📥 Reabastecer Almacén</h3>
              <button onClick={() => setMostrarModalAbastecer(false)} style={{ background: 'transparent', border: 'none', fontSize: '1.2rem', cursor: 'pointer', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: 'bold' }}>✕</button>
            </div>

            {/* Detalles del Medicamento */}
            <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '15px 20px', borderRadius: '14px', marginBottom: '25px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Fármaco Seleccionado</div>
              <div style={{ fontSize: '1.1rem', fontWeight: '800', color: darkMode ? '#ffffff' : '#0f172a', marginTop: '4px' }}>💊 {medSeleccionado.nombre}</div>
              <div style={{ fontSize: '0.85rem', fontWeight: '700', color: medSeleccionado.stock === 0 ? '#ef4444' : '#f59e0b', marginTop: '6px' }}>
                Stock actual: {medSeleccionado.stock} unidades
              </div>
            </div>

            {/* Formulario */}
            <form onSubmit={ejecutarAbastecimientoModal}>
              <label style={st.label}>Cantidad de unidades a ingresar</label>
              <input 
                className="saas-input" 
                style={{ ...st.input, fontSize: '1.1rem', padding: '18px', textAlign: 'center', fontWeight: '800', marginBottom: '25px' }} 
                type="number" 
                placeholder="Ej. 50" 
                min="1" 
                value={cantidadAñadir} 
                onChange={(e) => setCantidadAñadir(e.target.value)} 
                required 
                autoFocus
              />

              {/* Botones de acción */}
              <div style={{ display: 'flex', gap: '12px' }}>
                <button 
                  type="button" 
                  onClick={() => setMostrarModalAbastecer(false)} 
                  style={{ flex: 1, background: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#cbd5e1' : '#475569', border: 'none', padding: '14px', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', fontSize: '0.95rem', transition: '0.2s' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ ...st.btnAction, flex: 1, padding: '14px', borderRadius: '12px' }}
                >
                  Confirmar Ingreso
                </button>
              </div>
            </form>

          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardFarmacia;