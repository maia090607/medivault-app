import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';



function DashboardFarmacia({ user = {}, onLogout, recetasEmitidas = [], inventario = [] }) {
  const [vista, setVista] = useState('dispensar'); // 'dispensar', 'inventario', 'auditoria', 'estadisticas'
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

  // ESTADOS PARA EL MODAL DE ABASTECIMIENTO
  const [mostrarModalAbastecer, setMostrarModalAbastecer] = useState(false);
  const [medSeleccionado, setMedSeleccionado] = useState(null);
  const [cantidadAñadir, setCantidadAñadir] = useState('');

  // ESTADO NUEVO: Doctor seleccionado para la gráfica cruzada de estadísticas
  const [doctorSeleccionado, setDoctorSeleccionado] = useState('');

  // CONTROL SEGURO DE ARRAYS
  const recetasValidas = Array.isArray(recetasEmitidas) ? recetasEmitidas : [];
  const inventarioValido = Array.isArray(inventario) ? inventario : [];

  // Filtrar recetas entregadas/dispensadas para la tabla de auditoría
  const recetasEntregadas = recetasValidas.filter(r => r && (r.estado === 'Entregado' || r.estado === 'Dispensado'));

  // ==========================================
  //     PROCESAMIENTO SEGURO DE ESTADÍSTICAS
  // ==========================================
  
  // 1. Medicamentos más dispensados en general
  const conteoMedicamentos = {};
  recetasEntregadas.forEach(r => {
    if (r && Array.isArray(r.medicamento)) {
      r.medicamento.forEach(m => {
        if (m && m.nombre) {
          const cant = parseInt(m.cantidad || m.amount || 1, 10);
          conteoMedicamentos[m.nombre] = (conteoMedicamentos[m.nombre] || 0) + cant;
        }
      });
    }
  });
  
  const rankingMedicamentos = Object.entries(conteoMedicamentos)
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  const maxMedValue = rankingMedicamentos[0]?.total || 1;

  // 2. Doctores más activos (Total de fórmulas emitidas)
  const conteoDoctores = {};
  recetasValidas.forEach(r => {
    if (r && r.medico) {
      conteoDoctores[r.medico] = (conteoDoctores[r.medico] || 0) + 1;
    }
  });

  const rankingDoctores = Object.entries(conteoDoctores)
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  const maxDocValue = rankingDoctores[0]?.total || 1;

  // Lista única de doctores para el menú desplegable interactivo
  const listaDoctoresUnicos = Object.keys(conteoDoctores).sort();

  // 3. Medicamentos más recetados POR el doctor seleccionado
  const conteoMedsPorDoctor = {};
  
  // Si no hay doctor inicial seleccionado, tomamos el primero disponible
  const doctorFiltroEfectivo = doctorSeleccionado || listaDoctoresUnicos[0] || '';

  recetasValidas.forEach(r => {
    if (r && r.medico === doctorFiltroEfectivo && Array.isArray(r.medicamento)) {
      r.medicamento.forEach(m => {
        if (m && m.nombre) {
          const cant = parseInt(m.cantidad || m.amount || 1, 10);
          conteoMedsPorDoctor[m.nombre] = (conteoMedsPorDoctor[m.nombre] || 0) + cant;
        }
      });
    }
  });

  const rankingMedsPorDoctor = Object.entries(conteoMedsPorDoctor)
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  const maxMedDocValue = rankingMedsPorDoctor[0]?.total || 1;


  // --- PALETA DE ESTILOS PREMIUM ULTRA-PULIDA ---
  const st = {
    container: {
      padding: '32px 50px',
      fontFamily: '"Plus Jakarta Sans", "Inter", -apple-system, sans-serif',
      background: darkMode ? '#0f172a' : '#f8fafc',
      minHeight: '100vh',
      width: '100%',
      boxSizing: 'border-box',
      color: darkMode ? '#f1f5f9' : '#1e293b',
      transition: 'background-color 0.3s ease'
    },
    topBar: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: darkMode ? '#1e293b' : '#ffffff',
      padding: '18px 36px',
      borderRadius: '16px',
      boxShadow: darkMode ? '0 4px 30px rgba(0,0,0,0.2)' : '0 10px 30px -10px rgba(0,0,0,0.04)',
      marginBottom: '32px',
      border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
    },
    logoTitle: {
      margin: 0,
      fontSize: '1.4rem',
      fontWeight: '800',
      color: '#0052cc', 
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    navBar: {
      display: 'flex',
      gap: '8px',
      marginBottom: '32px',
      background: darkMode ? '#1e293b' : '#e2e8f0',
      padding: '6px',
      borderRadius: '14px',
      width: 'fit-content'
    },
    navTab: (activo) => ({
      padding: '12px 24px',
      fontSize: '0.9rem',
      fontWeight: '700',
      cursor: 'pointer',
      background: activo ? (darkMode ? '#334155' : '#ffffff') : 'transparent',
      border: 'none',
      color: activo ? (darkMode ? '#38bdf8' : '#0052cc') : (darkMode ? '#94a3b8' : '#64748b'),
      borderRadius: '10px',
      boxShadow: activo && !darkMode ? '0 4px 12px rgba(0,0,0,0.05)' : 'none',
      transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
    }),
    gridAnalytics: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '32px',
      marginBottom: '32px'
    },
    card: {
      background: darkMode ? '#1e293b' : '#ffffff',
      padding: '36px',
      borderRadius: '20px',
      boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.3)' : '0 12px 36px -4px rgba(0,0,0,0.03)',
      border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
      marginBottom: '32px',
    },
    analyticsCard: {
      background: darkMode ? '#1e293b' : '#ffffff',
      padding: '30px',
      borderRadius: '20px',
      border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
      boxShadow: darkMode ? '0 10px 40px rgba(0,0,0,0.2)' : '0 10px 25px -5px rgba(0,0,0,0.02)',
      color: darkMode ? '#f1f5f9' : '#1e293b'
    },
    input: {
      width: '100%',
      padding: '14px 18px',
      fontSize: '0.95rem',
      borderRadius: '10px',
      border: darkMode ? '1px solid #475569' : '1px solid #cbd5e1',
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#ffffff' : '#0f172a',
      boxSizing: 'border-box',
      marginBottom: '18px',
      outline: 'none',
      transition: 'all 0.2s ease'
    },
    select: {
      padding: '10px 16px',
      fontSize: '0.95rem',
      borderRadius: '8px',
      border: darkMode ? '1px solid #475569' : '1px solid #cbd5e1',
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#ffffff' : '#0f172a',
      outline: 'none',
      fontWeight: '600',
      cursor: 'pointer'
    },
    label: {
      display: 'block',
      fontWeight: '700',
      fontSize: '0.78rem',
      marginBottom: '8px',
      color: darkMode ? '#94a3b8' : '#64748b',
      textTransform: 'uppercase',
      letterSpacing: '0.8px'
    },
    btnAction: {
      background: 'linear-gradient(135deg, #0052cc 0%, #0065ff 100%)',
      color: '#ffffff',
      border: 'none',
      padding: '14px 28px',
      borderRadius: '10px',
      fontWeight: '700',
      fontSize: '0.95rem',
      cursor: 'pointer',
      transition: 'transform 0.1s ease, opacity 0.2s ease',
      boxShadow: '0 4px 14px rgba(0, 82, 204, 0.25)'
    },
    btnSuccess: {
      background: 'linear-gradient(135deg, #00875a 0%, #36b37e 100%)',
      color: '#ffffff',
      border: 'none',
      padding: '14px 28px',
      borderRadius: '10px',
      fontWeight: '700',
      fontSize: '0.95rem',
      cursor: 'pointer',
      boxShadow: '0 4px 14px rgba(0, 135, 90, 0.25)'
    },
    btnSecondary: {
      background: darkMode ? '#334155' : '#f1f5f9',
      color: darkMode ? '#f1f5f9' : '#334155',
      border: 'none',
      padding: '12px 20px',
      borderRadius: '10px',
      fontWeight: '700',
      fontSize: '0.9rem',
      cursor: 'pointer',
      transition: 'all 0.2s'
    },
    table: {
      width: '100%',
      borderCollapse: 'separate',
      borderSpacing: '0',
      marginTop: '15px',
    },
    th: {
      background: darkMode ? '#0f172a' : '#f8fafc',
      color: darkMode ? '#94a3b8' : '#64748b',
      padding: '16px 20px',
      fontWeight: '700',
      fontSize: '0.8rem',
      textAlign: 'left',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      borderBottom: darkMode ? '2px solid #334155' : '2px solid #e2e8f0'
    },
    td: {
      padding: '18px 20px',
      borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
      color: darkMode ? '#e2e8f0' : '#334155',
      fontSize: '0.95rem',
      verticalAlign: 'middle'
    },
    badge: (tipo) => {
      let bg = darkMode ? '#3a2a00' : '#fff9e6'; 
      let col = darkMode ? '#ffcb42' : '#b78103';
      if (tipo === 'Entregado' || tipo === 'Dispensado') { 
        bg = darkMode ? '#052e16' : '#e3fcef'; 
        col = darkMode ? '#4ade80' : '#006644'; 
      }
      return {
        padding: '6px 14px',
        borderRadius: '20px',
        fontSize: '0.75rem',
        fontWeight: '800',
        background: bg,
        color: col,
        display: 'inline-block'
      };
    },
    chartRow: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '20px',
      gap: '14px'
    },
    chartBarContainer: {
      flex: 1,
      background: darkMode ? '#0f172a' : '#f1f5f9',
      height: '14px',
      borderRadius: '20px',
      overflow: 'hidden',
      padding: '2px'
    },
    chartBarFill: (width, color) => ({
      width: `${width}%`,
      background: color,
      height: '100%',
      borderRadius: '20px',
      transition: 'width 1.2s cubic-bezier(0.4, 0, 0.2, 1)'
    })
  };

  // --- LÓGICA DE NEGOCIO ---
  const buscarRecetaPorToken = () => {
    const t = tokenBusqueda.trim();
    if (!t) return alert("Por favor, digite un token de receta válido.");

    const encontrada = recetasValidas.find(r => r && String(r.token) === t);

    if (encontrada) {
      setRecetaEncontrada(encontrada);
      setDespachoReciente(null);
    } else {
      alert("No se encontró ninguna prescripción con el token ingresado.");
      setRecetaEncontrada(null);
    }
  };

  const dispensarMedicamentosReceta = async () => {
    if (!recetaEncontrada) return;

    try {
      const medicamentosEnOrden = recetaEncontrada.medicamento || [];
      
      for (const med of medicamentosEnOrden) {
        const itemInventario = inventarioValido.find(i => i && i.nombre?.toLowerCase() === med.nombre?.toLowerCase());
        
        if (itemInventario) {
          const stockActual = parseInt(itemInventario.stock, 10) || 0;
          const cantidadRequerida = parseInt(med.cantidad || med.amount, 10) || 0;
          const nuevoStockCalculado = Math.max(0, stockActual - cantidadRequerida);

          await updateDoc(doc(db, "inventario", itemInventario.id), {
            stock: nuevoStockCalculado
          });
        }
      }

      await updateDoc(doc(db, "recetas", recetaEncontrada.id), {
        estado: 'Entregado'
      });

      setDespachoReciente({
        token: recetaEncontrada.token,
        paciente: recetaEncontrada.paciente,
        dniPaciente: recetaEncontrada.dniPaciente,
        meds: medicamentosEnOrden,
        fechaDespacho: new Date().toLocaleString()
      });

      alert("Medicamentos dispensados y descargados de inventario exitosamente.");
      setRecetaEncontrada(null);
      setTokenBusqueda('');
    } catch (err) {
      console.error(err);
      alert("Ocurrió un inconveniente al actualizar el estado de dispensación.");
    }
  };

  const registrarNuevoMedicamento = async (e) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoStock) return alert("El nombre y stock inicial son obligatorios.");

    try {
      await addDoc(collection(db, "inventario"), {
        nombre: nuevoNombre.trim(),
        concentracion: nuevaConcentracion.trim() || "N/A",
        stock: parseInt(nuevoStock, 10) || 0
      });

      alert("Fármaco registrado en el catálogo maestro de la farmacia.");
      setNuevoNombre('');
      setNuevaConcentracion('');
      setNuevoStock('');
      setMostrarForm(false);
    } catch (err) {
      console.error(err);
      alert("Error al guardar el medicamento.");
    }
  };

  const abrirModalAbastecer = (med) => {
    setMedSeleccionado(med);
    setCantidadAñadir('');
    setMostrarModalAbastecer(true);
  };

  const procesarAbastecimientoModal = async (e) => {
    e.preventDefault();
    if (!medSeleccionado || !cantidadAñadir) return;

    try {
      const stockActual = parseInt(medSeleccionado.stock, 10) || 0;
      const adicion = parseInt(cantidadAñadir, 10) || 0;

      await updateDoc(doc(db, "inventario", medSeleccionado.id), {
        stock: stockActual + adicion
      });

      alert(`Inventario actualizado para ${medSeleccionado.nombre}.`);
      setMostrarModalAbastecer(false);
      setMedSeleccionado(null);
      setCantidadAñadir('');
    } catch (err) {
      console.error(err);
      alert("Error al procesar el reabastecimiento.");
    }
  };

  const inventarioFiltrado = inventarioValido.filter(item => 
    item && item.nombre && item.nombre.toLowerCase().includes(busquedaInventario.toLowerCase())
  );

  return (
    <div style={st.container}>
      
      {/* HEADER SUPERIOR */}
      <div style={st.topBar} className="no-print">
        <div style={st.logoTitle}>
          <span style={{ background: 'linear-gradient(135deg, #0052cc 0%, #0065ff 100%)', color: '#fff', padding: '8px 12px', borderRadius: '10px', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(0,82,204,0.3)' }}>☁️</span> 
          <span style={{ color: darkMode ? '#ffffff' : '#0f172a' }}>siigo nube <span style={{ fontWeight: '300', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '1.1rem' }}>| Gestión de Farmacia</span></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          <button 
            onClick={() => setDarkMode(!darkMode)} 
            style={{ background: 'none', border: 'none', fontSize: '0.9rem', cursor: 'pointer', color: darkMode ? '#94a3b8' : '#475569', fontWeight: '700' }}
          >
            {darkMode ? '☀️ Modo Claro' : '🌙 Modo Oscuro'}
          </button>
          <div style={{ height: '20px', width: '1px', background: darkMode ? '#334155' : '#e2e8f0' }}></div>
          <span style={{ fontWeight: '700', color: darkMode ? '#cbd5e1' : '#334155', fontSize: '0.9rem' }}>
            Regente: <span style={{ color: '#0052cc', fontWeight: '800' }}>{user?.nombre || 'Administrador'}</span>
          </span>
          <button 
            onClick={onLogout} 
            style={{ background: 'linear-gradient(135deg, #ff8b00 0%, #ffab00 100%)', color: '#ffffff', border: 'none', padding: '10px 20px', borderRadius: '10px', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 12px rgba(255,139,0,0.25)' }}
          >
            Salir del Sistema
          </button>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN TABULAR */}
      <div style={st.navBar} className="no-print">
        <button style={st.navTab(vista === 'dispensar')} onClick={() => { setVista('dispensar'); setDespachoReciente(null); }}>
          📋 Panel de Dispensación
        </button>
        <button style={st.navTab(vista === 'inventario')} onClick={() => { setVista('inventario'); setDespachoReciente(null); }}>
          📦 Catálogo e Inventario
        </button>
        <button style={st.navTab(vista === 'auditoria')} onClick={() => { setVista('auditoria'); setDespachoReciente(null); }}>
          📜 Historial e Informes
        </button>
        <button style={st.navTab(vista === 'estadisticas')} onClick={() => { setVista('estadisticas'); setDespachoReciente(null); }}>
          📊 Estadísticas
        </button>
      </div>

      {/* VISTA 1: DISPENSAR MEDICAMENTOS */}
      {vista === 'dispensar' && !despachoReciente && (
        <div style={st.card}>
          <div style={{ marginBottom: '25px' }}>
            <h2 style={{ marginTop: 0, fontSize: '1.5rem', fontWeight: '800', color: darkMode ? '#fff' : '#0f172a' }}>
              Validación y Entrega de Fórmulas
            </h2>
            <p style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.95rem', marginTop: '-8px' }}>Ingrese el token de seguridad provisto por el paciente para consultar el estado del documento.</p>
          </div>
          
          <div style={{ display: 'flex', gap: '15px', alignItems: 'flex-end', maxWidth: '650px', background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px', borderRadius: '14px', border: darkMode ? '1px dashed #334155' : '1px dashed #cbd5e1' }}>
            <div style={{ flex: 1 }}>
              <label style={st.label}>Código Token de la Receta</label>
              <input 
                style={{ ...st.input, marginBottom: 0 }} 
                placeholder="Ej. 104582" 
                value={tokenBusqueda} 
                onChange={e => setTokenBusqueda(e.target.value)} 
              />
            </div>
            <button onClick={buscarRecetaPorToken} style={st.btnAction}>
              Consultar Receta
            </button>
          </div>

          {/* RECETA ENCONTRADA */}
          {recetaEncontrada && (
            <div style={{ marginTop: '40px', borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', paddingTop: '30px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h3 style={{ margin: 0, color: darkMode ? '#38bdf8' : '#0052cc', fontSize: '1.3rem', fontWeight: '800' }}>
                  Prescripción Autorizada Encontrada
                </h3>
                <span style={st.badge(recetaEncontrada.estado)}>{recetaEncontrada.estado}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px', borderRadius: '14px', marginBottom: '30px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', color: darkMode ? '#e2e8f0' : '#334155' }}>
                <p style={{ margin: 0 }}><strong>Paciente:</strong> {recetaEncontrada.paciente}</p>
                <p style={{ margin: 0 }}><strong>DNI Paciente:</strong> {recetaEncontrada.dniPaciente}</p>
                <p style={{ margin: 0 }}><strong>Médico Emisor:</strong> {recetaEncontrada.medico}</p>
                <p style={{ margin: 0 }}><strong>Fecha Emisión:</strong> {recetaEncontrada.fecha}</p>
              </div>

              <h4 style={st.label}>Detalle de Fármacos Solicitados</h4>
              <table style={st.table}>
                <thead>
                  <tr>
                    <th style={st.th}>Medicamento</th>
                    <th style={st.th}>Posología e Indicaciones</th>
                    <th style={st.th}>Cantidad Requerida</th>
                  </tr>
                </thead>
                <tbody>
                  {(recetaEncontrada.medicamento || []).map((m, idx) => (
                    <tr key={idx}>
                      <td style={st.td}><strong style={{color: darkMode ? '#ffffff' : '#0f172a'}}>{m?.nombre}</strong></td>
                      <td style={st.td}>
                        <div style={{ fontWeight: '600', color: darkMode ? '#cbd5e1' : '#334155' }}>{m?.posologia}</div>
                        <small style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>{m?.indicaciones}</small>
                      </td>
                      <td style={st.td}><strong style={{ color: darkMode ? '#38bdf8' : '#0052cc', fontSize: '1.05rem' }}>{(m?.cantidad || m?.amount)} Uds</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {recetaEncontrada.estado === 'Pendiente' ? (
                <div style={{ marginTop: '35px', textAlign: 'right' }}>
                  <button onClick={dispensarMedicamentosReceta} style={st.btnSuccess}>
                    ✔ Confirmar y Despachar Medicamentos
                  </button>
                </div>
              ) : (
                <div style={{ marginTop: '30px', padding: '18px', background: darkMode ? '#4c1d15' : '#ffebe6', color: darkMode ? '#fca5a5' : '#bf2600', borderRadius: '12px', fontWeight: '700', textAlign: 'center', border: '1px solid rgba(255,0,0,0.1)' }}>
                  ⚠️ Bloqueo de Seguridad: Esta receta ya fue surtida previamente. No se permite duplicar la entrega.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* COMPROBANTE DE DESPACHO INTERNO */}
      {despachoReciente && (
        <div style={{ background: '#ffffff', color: '#172b4d', padding: '45px', borderRadius: '24px', border: '1px solid #e2e8f0', maxWidth: '680px', margin: '0 auto', boxShadow: '0 30px 60px rgba(0,0,0,0.08)' }}>
          <div style={{ borderBottom: '2px solid #0052cc', paddingBottom: '18px', marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <h2 style={{ margin: 0, color: '#0052cc', fontSize: '1.5rem', fontWeight: '900', letterSpacing: '-0.5px' }}>SIIGO NUBE</h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: '700', textTransform: 'uppercase' }}>Comprobante de Dispensación</span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontWeight: '800', color: '#00875a', fontSize: '1.1rem', background: '#e3fcef', padding: '6px 14px', borderRadius: '20px' }}>RECETA SURTIDA</span>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#64748b', fontWeight: '700' }}>Token: {despachoReciente.token}</p>
            </div>
          </div>

          <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', marginBottom: '30px', fontSize: '0.95rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', color: '#1e293b', border: '1px solid #edf2f7' }}>
            <p style={{ margin: 0 }}><strong>Paciente:</strong> {despachoReciente.paciente}</p>
            <p style={{ margin: 0 }}><strong>Identificación:</strong> {despachoReciente.dniPaciente}</p>
            <p style={{ margin: 0, gridColumn: 'span 2' }}><strong>Fecha Entrega:</strong> {despachoReciente.fechaDespacho}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #0f172a' }}>
                <th style={{ textAlign: 'left', paddingBottom: '12px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Fármaco Entregado</th>
                <th style={{ textAlign: 'right', paddingBottom: '12px', width: '120px', fontWeight: '800', color: '#0f172a', textTransform: 'uppercase', fontSize: '0.8rem', letterSpacing: '0.5px' }}>Cant. Surtida</th>
              </tr>
            </thead>
            <tbody>
              {despachoReciente.meds?.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px dashed #e2e8f0' }}>
                  <td style={{ padding: '16px 0', color: '#1e293b' }}>
                    <strong style={{color: '#0f172a', fontSize: '1.05rem'}}>{m?.nombre}</strong> <br />
                    <span style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px', display: 'inline-block' }}>Indicaciones: {m?.indicaciones || 'N/A'}</span>
                  </td>
                  <td style={{ textAlign: 'right', padding: '16px 0', fontWeight: '800', color: '#00875a', fontSize: '1.1rem' }}>{(m?.cantidad || m?.amount)} Uds</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '45px', textAlign: 'center' }} className="no-print">
            <button onClick={() => window.print()} style={st.btnAction}>
              🖨 Imprimir Soporte de Entrega
            </button>
          </div>
        </div>
      )}

      {/* VISTA 2: INVENTARIO */}
      {vista === 'inventario' && (
        <div style={st.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: darkMode ? '#fff' : '#0f172a' }}>Catálogo Maestro de Inventario</h2>
            <button onClick={() => setMostrarForm(!mostrarForm)} style={st.btnAction}>
              {mostrarForm ? '✖ Cancelar' : '➕ Registrar Nuevo Fármaco'}
            </button>
          </div>

          {/* FORMULARIO AGREGAR MEDICAMENTO */}
          {mostrarForm && (
            <form onSubmit={registrarNuevoMedicamento} style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '30px', borderRadius: '16px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', marginBottom: '30px' }}>
              <h3 style={{ marginTop: 0, fontSize: '1.15rem', marginBottom: '20px', color: darkMode ? '#38bdf8' : '#0052cc', fontWeight: '800' }}>Crear Registro en Inventario</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={st.label}>Nombre Comercial / Genérico</label>
                  <input style={st.input} placeholder="Ej. Acetaminofén" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} required />
                </div>
                <div>
                  <label style={st.label}>Concentración</label>
                  <input style={st.input} placeholder="Ej. 500 mg" value={nuevaConcentracion} onChange={e => setNuevaConcentracion(e.target.value)} />
                </div>
                <div>
                  <label style={st.label}>Stock Inicial</label>
                  <input type="number" min="0" style={st.input} placeholder="Ej. 100" value={nuevoStock} onChange={e => setNuevoStock(e.target.value)} required />
                </div>
              </div>
              <div style={{ textAlign: 'right', marginTop: '10px' }}>
                <button type="submit" style={st.btnSuccess}>Guardar en Sistema</button>
              </div>
            </form>
          )}

          {/* BUSCADOR DE INVENTARIO */}
          <div style={{ maxWidth: '400px', marginBottom: '25px' }}>
            <label style={st.label}>Filtrar Catálogo</label>
            <input 
              style={{ ...st.input, marginBottom: 0 }} 
              placeholder="🔍 Escriba el nombre a buscar..." 
              value={busquedaInventario} 
              onChange={e => setBusquedaInventario(e.target.value)} 
            />
          </div>

          {/* TABLA DE ELEMENTOS */}
          <table style={st.table}>
            <thead>
              <tr>
                <th style={st.th}>Descripción del Medicamento</th>
                <th style={st.th}>Concentración</th>
                <th style={st.th}>Existencias Disponibles</th>
                <th style={{ ...st.th, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventarioFiltrado.map((item, idx) => {
                if (!item) return null;
                const stockCritico = (parseInt(item.stock, 10) || 0) <= 10;
                return (
                  <tr key={item.id || idx}>
                    <td style={st.td}><strong style={{color: darkMode ? '#ffffff' : '#0f172a'}}>{item.nombre}</strong></td>
                    <td style={st.td}>{item.concentracion || 'N/A'}</td>
                    <td style={{ ...st.td, color: stockCritico ? '#ef4444' : 'inherit', fontWeight: stockCritico ? '800' : '600' }}>
                      {item.stock} Uds {stockCritico && <span style={{ color: '#ef4444', background: darkMode ? '#450a0a' : '#ffeeed', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', marginLeft: '8px', fontWeight: '700' }}>⚠️ Stock Crítico</span>}
                    </td>
                    <td style={{ ...st.td, textAlign: 'center' }}>
                      <button onClick={() => abrirModalAbastecer(item)} style={st.btnSecondary}>
                        📥 Reabastecer
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* VISTA 3: HISTORIAL E INFORMES */}
      {vista === 'auditoria' && (
        <div style={st.card}>
          <h2 style={{ marginTop: 0, fontSize: '1.5rem', fontWeight: '800', marginBottom: '25px', color: darkMode ? '#fff' : '#0f172a' }}>
            Historial y Auditoría de Fórmulas Dispensadas
          </h2>
          <p style={{ color: darkMode ? '#94a3b8' : '#64748b', marginTop: '-15px', marginBottom: '25px', fontSize: '0.95rem' }}>
            Listado oficial de recetas surtidas en la farmacia para control de inventarios y trazabilidad médica.
          </p>

          <table style={st.table}>
            <thead>
              <tr>
                <th style={st.th}>Beneficiario / Paciente</th>
                <th style={st.th}>Identificación</th>
                <th style={st.th}>Fórmulas Entregadas</th>
                <th style={{ ...st.th, textAlign: 'center' }}>Código Único (Token)</th>
                <th style={{ ...st.th, textAlign: 'center' }}>Estado Operación</th>
              </tr>
            </thead>
            <tbody>
              {recetasEntregadas.map((r, index) => {
                if (!r) return null;
                return (
                  <tr key={r.id || index}>
                    <td style={st.td}><strong style={{color: darkMode ? '#ffffff' : '#0f172a'}}>{r.paciente}</strong></td>
                    <td style={st.td}>{r.dniPaciente}</td>
                    <td style={st.td}>
                      {Array.isArray(r.medicamento) ? r.medicamento.map((m, i) => (
                        <div key={i} style={{ fontSize: '0.9rem', padding: '4px 0', color: darkMode ? '#cbd5e1' : '#334155' }}>• <span style={{ fontWeight: '700' }}>{m?.nombre}</span> ({(m?.cantidad || m?.amount || 1)} Uds)</div>
                      )) : 'Fórmula estructurada anterior'}
                    </td>
                    <td style={{ ...st.td, textAlign: 'center', fontWeight: '800', color: darkMode ? '#38bdf8' : '#0052cc', fontSize: '1.05rem' }}>{r.token}</td>
                    <td style={{ ...st.td, textAlign: 'center' }}>
                      <span style={st.badge(r.estado)}>{r.estado}</span>
                    </td>
                  </tr>
                );
              })}
              {recetasEntregadas.length === 0 && (
                <tr>
                  <td colSpan="5" style={{ ...st.td, textAlign: 'center', padding: '50px', color: '#64748b', fontWeight: '600' }}>
                    No se registran despachos procesados en la jornada actual.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VISTA 4: ESTADÍSTICAS EXCLUSIVAS (INCLUYE NUEVO FILTRO POR DOCTOR) */}
      {vista === 'estadisticas' && (
        <div>
          <div style={st.gridAnalytics} className="no-print">
            
            {/* GRÁFICA 1: MEDICAMENTOS MÁS VENDIDOS / DISPENSADOS */}
            <div style={st.analyticsCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: darkMode ? '#38bdf8' : '#0052cc', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  🔥 Fármacos de Mayor Demanda (Unidades)
                </h3>
                <span style={{ fontSize: '0.75rem', background: darkMode ? '#052e16' : '#e3fcef', color: darkMode ? '#4ade80' : '#006644', padding: '6px 12px', borderRadius: '20px', fontWeight: '800' }}>En Tiempo Real</span>
              </div>

              {rankingMedicamentos.length > 0 ? (
                rankingMedicamentos.map((item, idx) => {
                  const porcentaje = Math.round((item.total / maxMedValue) * 100);
                  const colores = ['#0052cc', '#00875a', '#ff8b00', '#6554c0'];
                  return (
                    <div key={idx} style={{ marginBottom: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', color: darkMode ? '#ffffff' : '#0f172a' }}>{idx + 1}. {item.nombre}</span>
                        <span style={{ fontWeight: '800', color: darkMode ? '#38bdf8' : '#0052cc' }}>{item.total} Uds</span>
                      </div>
                      <div style={st.chartRow}>
                        <div style={st.chartBarContainer}>
                          <div style={st.chartBarFill(porcentaje, colores[idx % colores.length])}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', minWidth: '40px', textAlign: 'right', fontWeight: '700', color: darkMode ? '#94a3b8' : '#64748b' }}>{porcentaje}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: '0.95rem', color: '#64748b', textAlign: 'center', padding: '30px 0', fontWeight: '600' }}>No hay suficientes datos de ventas acumulados hoy.</p>
              )}
            </div>

            {/* GRÁFICA 2: DOCTORES CON MAYOR EMISIÓN */}
            <div style={st.analyticsCard}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '25px' }}>
                <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: darkMode ? '#4ade80' : '#00875a', textTransform: 'uppercase', letterSpacing: '0.8px' }}>
                  👨‍⚕️ Médicos con Mayor Actividad (Órdenes)
                </h3>
                <span style={{ fontSize: '0.75rem', background: darkMode ? '#03285c' : '#deebff', color: darkMode ? '#38bdf8' : '#0052cc', padding: '6px 12px', borderRadius: '20px', fontWeight: '800' }}>Auditoría Activa</span>
              </div>

              {rankingDoctores.length > 0 ? (
                rankingDoctores.map((item, idx) => {
                  const porcentaje = Math.round((item.total / maxDocValue) * 100);
                  return (
                    <div key={idx} style={{ marginBottom: '22px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '8px' }}>
                        <span style={{ fontWeight: '700', color: darkMode ? '#ffffff' : '#0f172a' }}>Dr(a). {item.nombre}</span>
                        <span style={{ fontWeight: '800', color: darkMode ? '#4ade80' : '#00875a' }}>{item.total} Fórmulas</span>
                      </div>
                      <div style={st.chartRow}>
                        <div style={st.chartBarContainer}>
                          <div style={st.chartBarFill(porcentaje, '#00875a')}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', minWidth: '40px', textAlign: 'right', fontWeight: '700', color: darkMode ? '#94a3b8' : '#64748b' }}>{porcentaje}%</span>
                      </div>
                    </div>
                  );
                })
              ) : (
                <p style={{ fontSize: '0.95rem', color: '#64748b', textAlign: 'center', padding: '30px 0', fontWeight: '600' }}>Esperando registros de órdenes médicas entrantes.</p>
              )}
            </div>

          </div>

          {/* NUEVO APARTADO SEPARADO: MEDICAMENTOS MÁS RECETADOS POR DOCTOR */}
          <div style={st.card} className="no-print">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '800', color: darkMode ? '#ffffff' : '#0f172a' }}>
                  💊 Medicamentos más Recetados por Médico
                </h3>
                <p style={{ margin: '4px 0 0 0', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.9rem' }}>
                  Seleccione un doctor para evaluar las preferencias de dosificación e indicaciones cruzadas.
                </p>
              </div>

              {/* Selector interactivo de doctores con colores corregidos */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontWeight: '700', fontSize: '0.85rem', color: darkMode ? '#cbd5e1' : '#475569', textTransform: 'uppercase' }}>Doctor:</span>
                <select 
                  style={st.select} 
                  value={doctorFiltroEfectivo} 
                  onChange={(e) => setDoctorSeleccionado(e.target.value)}
                >
                  {listaDoctoresUnicos.length === 0 && <option value="">No hay doctores registrados</option>}
                  {listaDoctoresUnicos.map((docName, i) => (
                    <option key={i} value={docName}>Dr(a). {docName}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Renderizado dinámico de la gráfica cruzada */}
            {doctorFiltroEfectivo && rankingMedsPorDoctor.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px', borderRadius: '14px', border: darkMode ? '1px solid #334155' : '1px solid #edf2f7' }}>
                <div style={{ marginBottom: '10px', fontSize: '0.9rem', fontWeight: '700', color: darkMode ? '#38bdf8' : '#0052cc' }}>
                  Top Fármacos Emitidos por el Dr(a). {doctorFiltroEfectivo}:
                </div>
                {rankingMedsPorDoctor.map((item, idx) => {
                  const porcentaje = Math.round((item.total / maxMedDocValue) * 100);
                  return (
                    <div key={idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.95rem', marginBottom: '6px' }}>
                        <span style={{ fontWeight: '700', color: darkMode ? '#ffffff' : '#0f172a' }}>{item.nombre}</span>
                        <span style={{ fontWeight: '800', color: darkMode ? '#38bdf8' : '#0052cc' }}>{item.total} Unidades prescritas</span>
                      </div>
                      <div style={st.chartRow}>
                        <div style={st.chartBarContainer}>
                          <div style={st.chartBarFill(porcentaje, '#6554c0')}></div>
                        </div>
                        <span style={{ fontSize: '0.85rem', minWidth: '40px', textAlign: 'right', fontWeight: '700', color: darkMode ? '#94a3b8' : '#64748b' }}>{porcentaje}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p style={{ fontSize: '0.95rem', color: '#64748b', textAlign: 'center', padding: '30px 0', fontWeight: '600' }}>
                No existen registros de prescripciones médicas cargadas para el doctor seleccionado.
              </p>
            )}
          </div>
        </div>
      )}

      {/* MODAL GLOBAL PARA REABASTECIMIENTO */}
      {mostrarModalAbastecer && medSeleccionado && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(8px)' }}>
          <div style={{ ...st.card, width: '440px', margin: 0, padding: '36px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <h3 style={{ marginTop: 0, color: darkMode ? '#38bdf8' : '#0052cc', fontSize: '1.3rem', fontWeight: '800', marginBottom: '10px' }}>
              Entrada de Inventario
            </h3>
            <p style={{ fontSize: '0.95rem', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '24px' }}>
              Incrementar existencias para: <strong style={{ color: darkMode ? '#ffffff' : '#0f172a' }}>{medSeleccionado.nombre}</strong>
            </p>

            <form onSubmit={procesarAbastecimientoModal}>
              <label style={st.label}>Cantidad de unidades a ingresar</label>
              <input 
                style={{ ...st.input, fontSize: '1.4rem', textAlign: 'center', fontWeight: '800', marginBottom: '28px', padding: '14px', borderRadius: '12px' }} 
                type="number" 
                placeholder="Ej. 50" 
                min="1" 
                value={cantidadAñadir} 
                onChange={(e) => setCantidadAñadir(e.target.value)} 
                required 
                autoFocus
              />

              <div style={{ display: 'flex', gap: '14px' }}>
                <button 
                  type="button" 
                  onClick={() => setMostrarModalAbastecer(false)} 
                  style={{ ...st.btnSecondary, flex: 1, padding: '14px' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ ...st.btnSuccess, flex: 1, padding: '14px' }}
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