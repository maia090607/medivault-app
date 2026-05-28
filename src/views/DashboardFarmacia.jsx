import React, { useState } from 'react';
import { db } from '../firebase';
import { doc, updateDoc, collection, addDoc } from 'firebase/firestore';
import { useToast } from '../components/Toast';
import { formatearFecha } from '../utils';
import { createStyles, fadeInKeyframes } from '../theme';
import PacientesDirectory from '../components/PacientesDirectory';
import NotificacionesList from '../components/NotificacionesList';


function DashboardFarmacia({ user = {}, onLogout, recetasEmitidas = [], inventario = [], pacientesDB = [], usuariosDB = [] }) {
  const toast = useToast();
  const [vista, setVista] = useState('dispensar');
  const cambiarVista = (v) => { window.scrollTo(0, 0); setVista(v); setDespachoReciente(null); setRecetaEncontrada(null); setTokenBusqueda(''); setPacienteHistorialSel(null); setBusquedaHistorialPac(''); };
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
  const [loading, setLoading] = useState(false);
  const [medSeleccionado, setMedSeleccionado] = useState(null);
  const [cantidadAñadir, setCantidadAñadir] = useState('');

  // Estado para la gráfica cruzada de estadísticas
  const [doctorSeleccionado, setDoctorSeleccionado] = useState('');

  // Estados para búsqueda y filtro en historial
  const [busquedaAuditoria, setBusquedaAuditoria] = useState('');
  const [filtroEstadoAuditoria, setFiltroEstadoAuditoria] = useState('todos');

  // CONTROL SEGURO DE ARRAYS
  const recetasValidas = Array.isArray(recetasEmitidas) ? recetasEmitidas : [];
  const inventarioValido = Array.isArray(inventario) ? inventario : [];

  const pacientesValidos = Array.isArray(pacientesDB) ? pacientesDB : [];

  // Filtrar recetas entregadas/dispensadas para la tabla de auditoría
  const recetasEntregadas = recetasValidas.filter(r => r && (r.estado === 'Entregado' || r.estado === 'Dispensado'));

  const inventarioFiltrado = inventarioValido.filter(item => 
    item && item.nombre && (
      item.nombre.toLowerCase().includes(busquedaInventario.toLowerCase()) ||
      (item.codigo || '').toLowerCase().includes(busquedaInventario.toLowerCase())
    )
  );

  const recetasFiltradasAuditoria = recetasValidas.filter(r => {
    if (!r) return false;
    const query = (busquedaAuditoria || '').toLowerCase().trim();
    const nombrePaciente = (r.paciente || '').toLowerCase();
    const dniPaciente = String(r.dniPaciente || '');
    const tokenReceta = String(r.token || '');
    const estadoReceta = (r.estado || '').toLowerCase();
    const cumpleBuscador = !query || nombrePaciente.includes(query) || dniPaciente.includes(query) || tokenReceta.includes(query);
    if (filtroEstadoAuditoria === 'todos') return cumpleBuscador;
    if (filtroEstadoAuditoria === 'pendiente') return cumpleBuscador && estadoReceta === 'pendiente';
    if (filtroEstadoAuditoria === 'entregado') return cumpleBuscador && (estadoReceta === 'entregado' || estadoReceta === 'dispensado');
    return cumpleBuscador;
  });

  const recetasEntregadasOrdenadas = [...recetasEntregadas].sort((a, b) => {
    const da = new Date(a.fecha || 0);
    const db = new Date(b.fecha || 0);
    return db - da;
  });

  const st = createStyles(darkMode);
  st.logoTitle = { margin: 0, fontSize: '1.4rem', fontWeight: '700', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '12px' };
  st.btnSecondary = { background: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#f1f5f9' : '#334155', border: 'none', padding: '12px 20px', borderRadius: '8px', fontWeight: '700', fontSize: '0.9rem', cursor: 'pointer' };

  const codigoGenerado = (() => {
    const prefijo = (nuevoNombre || '').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 7).toUpperCase().replace(/\s+/g, '');
    const digitos = (nuevaConcentracion || '').replace(/\D/g, '');
    return prefijo ? `${prefijo}-${digitos || '000'}` : '';
  })();

  const buscarRecetaPorToken = () => {
    const t = tokenBusqueda.trim();
    if (!t) return toast.warning("Digite un token de receta válido.");
    const encontrada = recetasValidas.find(r => r && String(r.token) === t);
    if (encontrada) {
      setRecetaEncontrada(encontrada);
      setDespachoReciente(null);
    } else {
      toast.error("No se encontró prescripción con ese token.");
      setRecetaEncontrada(null);
    }
  };

  const dispensarMedicamentosReceta = async () => {
    if (!recetaEncontrada) return;
    setLoading(true);
    try {
      const medicamentosEnOrden = recetaEncontrada.medicamento || [];
      for (const med of medicamentosEnOrden) {
        const itemInventario = inventarioValido.find(i => i && i.nombre?.toLowerCase() === med.nombre?.toLowerCase());
        if (itemInventario) {
          const stockActual = parseInt(itemInventario.stock, 10) || 0;
          const cantidadRequerida = parseInt(med.cantidad || med.amount, 10) || 0;
          const nuevoStockCalculado = Math.max(0, stockActual - cantidadRequerida);
          await updateDoc(doc(db, "inventario", itemInventario.id), { stock: nuevoStockCalculado });
        }
      }
      await updateDoc(doc(db, "recetas", recetaEncontrada.id), { estado: 'Entregado' });
      setDespachoReciente({
        token: recetaEncontrada.token,
        paciente: recetaEncontrada.paciente,
        dniPaciente: recetaEncontrada.dniPaciente,
        meds: medicamentosEnOrden,
        fechaDespacho: new Date().toLocaleString()
      });
      toast.success("Medicamentos dispensados exitosamente.");
      setRecetaEncontrada(null);
      setTokenBusqueda('');
    } catch (err) {
      console.error(err);
      toast.error("Error al actualizar el estado de dispensación.");
    } finally {
      setLoading(false);
    }
  };

  const registrarNuevoMedicamento = async (e) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoStock) return toast.warning("Nombre y stock inicial son obligatorios.");
    try {
      await addDoc(collection(db, "inventario"), {
        codigo: codigoGenerado,
        nombre: nuevoNombre.trim(),
        concentracion: nuevaConcentracion.trim() || "N/A",
        stock: parseInt(nuevoStock, 10) || 0
      });
      toast.success("Fármaco registrado en el inventario.");
      setNuevoNombre('');
      setNuevaConcentracion('');
      setNuevoStock('');
      setMostrarForm(false);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar el medicamento.");
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
    setLoading(true);
    try {
      const stockActual = parseInt(medSeleccionado.stock, 10) || 0;
      const adicion = parseInt(cantidadAñadir, 10) || 0;
      await updateDoc(doc(db, "inventario", medSeleccionado.id), { stock: stockActual + adicion });
      toast.success(`Inventario actualizado: ${medSeleccionado.nombre}.`);
      setMostrarModalAbastecer(false);
      setMedSeleccionado(null);
      setCantidadAñadir('');
    } catch (err) {
      console.error(err);
      toast.error("Error al procesar el reabastecimiento.");
    } finally {
      setLoading(false);
    }
  };

  // ==========================================
  //     PROCESAMIENTO SEGURO DE ESTADÍSTICAS
  // ==========================================
  
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

  const medicosActivos = (usuariosDB || [])
    .filter(u => u && u.role === 'medico')
    .map(u => (u.nombre || '').trim().toLowerCase())
    .filter(Boolean);

  const conteoDoctores = {};
  recetasValidas.forEach(r => {
    const medico = (r.medico || '').trim();
    if (medico && medicosActivos.includes(medico.toLowerCase())) {
      conteoDoctores[medico] = (conteoDoctores[medico] || 0) + 1;
    }
  });

  const rankingDoctores = Object.entries(conteoDoctores)
    .map(([nombre, total]) => ({ nombre, total }))
    .sort((a, b) => b.total - a.total)
    .slice(0, 4);

  const listaDoctoresUnicos = Object.keys(conteoDoctores).sort();

  const conteoMedsPorDoctor = {};
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

  return (
    <div style={st.container}>
      <style>{fadeInKeyframes}</style>
      {/* HEADER SUPERIOR */}
      <div style={st.topBar} className="no-print">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>
            Gestión de Farmacia
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
            {darkMode ? '☀️' : '🌙'}
          </button>

          <span style={{ fontWeight: '600' }}>Regente: {user?.nombre || 'Administrador'}</span>
          <button onClick={() => {
            if (window.confirm('¿Está seguro de cerrar sesión?')) onLogout();
          }} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      {/* MENÚ DE NAVEGACIÓN TABULAR */}
      <div style={st.nav} className="no-print">
        <button style={st.btnNav(vista === 'dispensar')} onClick={() => cambiarVista('dispensar')}>
          📋 Panel de Dispensación
        </button>
        <button style={st.btnNav(vista === 'inventario')} onClick={() => cambiarVista('inventario')}>
          📦 Catálogo e Inventario
        </button>
        <button style={st.btnNav(vista === 'auditoria')} onClick={() => cambiarVista('auditoria')}>
          📜 Historial e Informes
        </button>
        <button style={st.btnNav(vista === 'estadisticas')} onClick={() => cambiarVista('estadisticas')}>
          📊 Estadísticas
        </button>
        <button style={st.btnNav(vista === 'pacientes')} onClick={() => cambiarVista('pacientes')}>
          👤 Pacientes
        </button>
        <button style={st.btnNav(vista === 'notificaciones')} onClick={() => cambiarVista('notificaciones')}>
          🔔 Notificaciones
        </button>
      </div>

      <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '16px', fontWeight: '600' }}>
        Farmacia {vista === 'dispensar' ? '> Panel de Dispensación' : vista === 'inventario' ? '> Catálogo e Inventario' : vista === 'auditoria' ? '> Historial e Informes' : vista === 'estadisticas' ? '> Estadísticas' : vista === 'pacientes' ? '> Pacientes' : '> Notificaciones'}
      </div>

      {/* VISTA 1: DISPENSAR MEDICAMENTOS */}
      {vista === 'dispensar' && !despachoReciente && (
        <div key="dispensar" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
          <div style={{ marginBottom: '20px' }}>
            <h2 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
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
                <h3 style={{ margin: 0, color: '#2563eb', fontSize: '1.2rem', fontWeight: '700' }}>
                  Prescripción Autorizada Encontrada
                </h3>
                <span style={st.badge(recetaEncontrada.estado)}>{recetaEncontrada.estado}</span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px', borderRadius: '14px', marginBottom: '30px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', color: darkMode ? '#e2e8f0' : '#334155' }}>
                <p style={{ margin: 0 }}><strong>Paciente:</strong> {recetaEncontrada.paciente}</p>
                <p style={{ margin: 0 }}><strong>DNI Paciente:</strong> {recetaEncontrada.dniPaciente}</p>
                <p style={{ margin: 0 }}><strong>Médico Emisor:</strong> {recetaEncontrada.medico}</p>
                <p style={{ margin: 0 }}><strong>Fecha Emisión:</strong> {formatearFecha(recetaEncontrada.fecha)}</p>
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
                      <td style={st.td}><strong style={{ color: '#2563eb', fontSize: '1.05rem' }}>{(m?.cantidad || m?.amount)} Uds</strong></td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {recetaEncontrada.estado === 'Pendiente' ? (
                <div style={{ marginTop: '35px', textAlign: 'right' }}>
                  <button onClick={() => {
                    if (window.confirm('¿Confirmar el despacho de estos medicamentos? Se descontarán del inventario.')) {
                      dispensarMedicamentosReceta();
                    }
                  }} disabled={loading} style={{ ...st.btnSuccess, opacity: loading ? 0.6 : 1 }}>
                    {loading ? 'Despachando...' : '✔ Confirmar y Despachar Medicamentos'}
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
        <div key="despacho" style={{ background: '#ffffff', color: '#1f2937', padding: '32px', borderRadius: '12px', border: '1px solid #cbd5e1', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: '#2563eb', fontSize: '1.3rem', fontWeight: '700' }}>COMPROBANTE DE DISPENSACIÓN</h2>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontWeight: 'bold', color: '#10b981' }}>Token: {despachoReciente.token}</span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Fecha: {despachoReciente.fechaDespacho}</p>
            </div>
          </div>

          <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
            <p style={{ margin: '0 0 4px 0' }}><strong>Paciente:</strong> {despachoReciente.paciente}</p>
            <p style={{ margin: 0 }}><strong>DNI Paciente:</strong> {despachoReciente.dniPaciente}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f2937' }}>
                <th style={{ textAlign: 'left', paddingBottom: '8px' }}>Descripción Fármaco</th>
                <th style={{ textAlign: 'center', paddingBottom: '8px', width: '80px' }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {despachoReciente.meds?.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px dashed #e5e7eb' }}>
                  <td style={{ padding: '10px 0' }}>
                    <strong>{m?.nombre}</strong> <br />
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Indicaciones: {m?.indicaciones || 'N/A'}</span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px 0', fontWeight: '700', color: '#10b981' }}>{m?.cantidad || m?.amount} Uds</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '30px', textAlign: 'center' }} className="no-print">
            <button onClick={() => window.print()} style={st.btnAction}>🖨 Imprimir Documento</button>
          </div>
        </div>
      )}

      {/* VISTA 2: INVENTARIO */}
      {vista === 'inventario' && (
        <div key="inventario" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>Catálogo Maestro de Inventario</h2>
            <button onClick={() => setMostrarForm(!mostrarForm)} style={st.btnAction}>
              {mostrarForm ? '✖ Cancelar' : '➕ Registrar Nuevo Fármaco'}
            </button>
          </div>

          {/* FORMULARIO AGREGAR MEDICAMENTO */}
          {mostrarForm && (
            <form onSubmit={registrarNuevoMedicamento} style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '30px', borderRadius: '16px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', marginBottom: '30px' }}>
              <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '16px', color: '#2563eb', fontWeight: '700' }}>Crear Registro en Inventario</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '20px' }}>
                <div>
                  <label style={st.label}>Código (auto)</label>
                  <input style={{ ...st.input, marginBottom: 0, background: darkMode ? '#1e293b' : '#f1f5f9', color: '#2563eb', fontWeight: '700', fontFamily: 'monospace' }} value={codigoGenerado} readOnly />
                </div>
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
                <th style={st.th}>Código</th>
                <th style={st.th}>Descripción del Medicamento</th>
                <th style={st.th}>Concentración</th>
                <th style={st.th}>Existencias Disponibles</th>
                <th style={{ ...st.th, textAlign: 'center' }}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {inventarioFiltrado.length > 0 ? inventarioFiltrado.map((item, idx) => {
                if (!item) return null;
                const stockCritico = (parseInt(item.stock, 10) || 0) <= 10;
                return (
                  <tr key={item.id || idx}>
                    <td style={st.td}><strong style={{ color: '#2563eb' }}>{item.codigo || '—'}</strong></td>
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
              }) : (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: '500' }}>No se encontraron medicamentos en el inventario.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* VISTA 3: HISTORIAL E INFORMES */}
      {vista === 'auditoria' && (
        <div key="auditoria" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>Historial y Auditoría de Recetas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <input style={{ ...st.input, marginBottom: 0 }} placeholder="Buscar por paciente, DNI o Token..." value={busquedaAuditoria} onChange={e => setBusquedaAuditoria(e.target.value)} />
            <select style={{ ...st.input, marginBottom: 0 }} value={filtroEstadoAuditoria} onChange={e => setFiltroEstadoAuditoria(e.target.value)}>
              <option value="todos">Todos los Estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="entregado">Entregados / Dispensados</option>
            </select>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ background: darkMode ? '#0f172a' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                  <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#ffffff' : '#1f2937' }}>Paciente</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#ffffff' : '#1f2937' }}>Fecha</th>
                  <th style={{ padding: '12px', textAlign: 'left', color: darkMode ? '#ffffff' : '#1f2937' }}>Medicamentos</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: darkMode ? '#ffffff' : '#1f2937' }}>Token</th>
                  <th style={{ padding: '12px', textAlign: 'center', color: darkMode ? '#ffffff' : '#1f2937' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {recetasFiltradasAuditoria.length > 0 ? recetasFiltradasAuditoria.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', color: darkMode ? '#ffffff' : '#1f2937' }}><strong>{r.paciente}</strong></td>
                    <td style={{ padding: '12px', color: darkMode ? '#ffffff' : '#1f2937' }}>{formatearFecha(r.fecha)}</td>
                    <td style={{ padding: '12px', color: darkMode ? '#ffffff' : '#1f2937' }}>
                      {Array.isArray(r.medicamento) ? r.medicamento.map((m, idx) => (
                        <div key={idx}>• {m.nombre} ({m.amount || m.cantidad || 1} Uds)</div>
                      )) : 'Formato anterior'}
                    </td>
                    <td style={{ padding: '12px', textAlign: 'center', fontWeight: '700', color: '#2563eb' }}>{r.token}</td>
                    <td style={{ padding: '12px', textAlign: 'center' }}>
                      <span style={{ background: r.estado === 'Pendiente' ? '#fef3c7' : '#d1fae5', color: r.estado === 'Pendiente' ? '#92400e' : '#065f46', padding: '4px 8px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: '600' }}>{r.estado}</span>
                    </td>
                  </tr>
                )) : (
                  <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: '#94a3b8', fontWeight: '500' }}>No hay recetas que coincidan con la búsqueda.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* VISTA 4: ESTADÍSTICAS */}
      {vista === 'estadisticas' && (
        <div key="estadisticas" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
          <h2 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>Estadísticas de Dispensación</h2>
          {recetasValidas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8', fontWeight: '500' }}>No hay recetas registradas en el sistema.</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div style={{ background: darkMode ? '#0f172a' : '#f9fafb', borderRadius: '10px', padding: '20px', border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb' }}>
                <h3 style={{ margin: '0 0 14px 0', fontSize: '1rem', fontWeight: '700', color: '#2563eb' }}>Top Medicamentos Dispensados</h3>
                {rankingMedicamentos.length > 0 ? rankingMedicamentos.map((item, idx) => {
                  const maxCant = rankingMedicamentos[0].total || 1;
                  const pct = (item.total / maxCant) * 100;
                  return (
                    <div key={item.nombre} style={{ marginBottom: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: darkMode ? '#ffffff' : '#1e293b', marginBottom: '4px' }}>
                        <span>{idx + 1}. {item.nombre}</span>
                        <span>{item.total} uds</span>
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
          )}
          <div style={{ marginTop: '24px', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '14px' }}>
            <div style={{ background: darkMode ? '#0f172a' : '#f9fafb', borderRadius: '10px', padding: '18px', textAlign: 'center', border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#2563eb' }}>{recetasValidas.length}</div>
              <div style={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600' }}>Totales</div>
            </div>
            <div style={{ background: darkMode ? '#0f172a' : '#f9fafb', borderRadius: '10px', padding: '18px', textAlign: 'center', border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#f59e0b' }}>{recetasValidas.filter(r => r.estado === 'Pendiente').length}</div>
              <div style={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600' }}>Pendientes</div>
            </div>
            <div style={{ background: darkMode ? '#0f172a' : '#f9fafb', borderRadius: '10px', padding: '18px', textAlign: 'center', border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb' }}>
              <div style={{ fontSize: '1.6rem', fontWeight: '700', color: '#10b981' }}>{recetasEntregadas.length}</div>
              <div style={{ fontSize: '0.8rem', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600' }}>Entregadas</div>
            </div>
          </div>

          {/* APARTADO: MEDICAMENTOS MÁS RECETADOS POR DOCTOR */}
          <div style={{ ...st.card, marginTop: '24px' }} className="no-print">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '15px', marginBottom: '25px' }}>
              <div>
                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
                  Medicamentos más Recetados por Médico
                </h3>
                <p style={{ margin: '4px 0 0 0', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.85rem' }}>
                  Seleccione un doctor para evaluar las preferencias de dosificación e indicaciones cruzadas.
                </p>
              </div>
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

            {doctorFiltroEfectivo && rankingMedsPorDoctor.length > 0 ? (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px', background: darkMode ? '#0f172a' : '#f8fafc', padding: '24px', borderRadius: '14px', border: darkMode ? '1px solid #334155' : '1px solid #edf2f7' }}>
                <div style={{ marginBottom: '10px', fontSize: '0.9rem', fontWeight: '700', color: '#2563eb' }}>
                  Top Fármacos Emitidos por el Dr(a). {doctorFiltroEfectivo}:
                </div>
                {rankingMedsPorDoctor.map((item, idx) => {
                  const maxCantM = rankingMedsPorDoctor[0].total || 1;
                  const pct = (item.total / maxCantM) * 100;
                  return (
                    <div key={item.nombre || idx}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '600', color: darkMode ? '#ffffff' : '#1e293b', marginBottom: '4px' }}>
                        <span>{idx + 1}. {item.nombre}</span>
                        <span>{item.total} uds</span>
                      </div>
                      <div style={{ height: '10px', background: darkMode ? '#1e293b' : '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                        <div style={{ height: '100%', width: `${pct}%`, background: '#6554c0', borderRadius: '6px', transition: 'width 0.5s ease' }} />
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
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
          <div style={{ ...st.card, maxWidth: '440px', margin: 0 }}>
            <h3 style={{ marginTop: 0, color: '#2563eb', fontWeight: '700' }}>
              Entrada de Inventario
            </h3>
            <p style={{ fontSize: '0.95rem', color: '#64748b', marginBottom: '24px' }}>
              Incrementar existencias para: <strong style={{ color: '#0f172a' }}>{medSeleccionado.codigo || '—'} — {medSeleccionado.nombre}</strong>
            </p>

            <form onSubmit={procesarAbastecimientoModal}>
              <label style={st.label}>Cantidad de unidades a ingresar</label>
              <input 
                style={st.input}
                type="number" 
                placeholder="Ej. 50" 
                min="1" 
                value={cantidadAñadir} 
                onChange={(e) => setCantidadAñadir(e.target.value)} 
                required 
                autoFocus
              />

              <div style={{ display: 'flex', gap: '10px' }}>
                <button 
                  type="button" 
                  onClick={() => setMostrarModalAbastecer(false)} 
                  style={{ background: '#64748b', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', flex: 1, fontWeight: '600' }}
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  style={{ ...st.btnSuccess, flex: 1 }}
                >
                  Confirmar Ingreso
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PACIENTES */}
      {vista === 'pacientes' && (
        <PacientesDirectory
          key="pacientes"
          pacientes={pacientesValidos}
          darkMode={darkMode}
          st={st}
          style={{ animation: 'fadeIn 0.25s ease' }}
          renderActions={(p) => (
            <button onClick={() => { setBusquedaAuditoria(p.nombre); cambiarVista('auditoria'); }} style={{ flex: 1, background: '#2563eb', color: '#ffffff', border: 'none', padding: '8px 0', borderRadius: '6px', fontWeight: '600', fontSize: '0.8rem', cursor: 'pointer' }}>Ver Recetas</button>
          )}
        />
      )}

      {/* NOTIFICACIONES */}
      {vista === 'notificaciones' && (
        <NotificacionesList
          key="notificaciones"
          recetas={recetasEntregadasOrdenadas}
          darkMode={darkMode}
          st={st}
          showMedico={true}
          style={{ animation: 'fadeIn 0.25s ease' }}
        />
      )}

    </div>
  );
}

export default DashboardFarmacia;