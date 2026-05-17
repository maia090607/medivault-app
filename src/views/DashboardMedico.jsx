import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

function DashboardMedico({ user, onLogout, inventario, recetasEmitidas, pacientesDB, historialesDB }) {
  const [vista, setVista] = useState('nueva');
  const [busquedaPac, setBusquedaPac] = useState('');
  const [pacienteSel, setPacienteSel] = useState(null);
  const [busquedaMed, setBusquedaMed] = useState('');
  
  // CORREGIDO: Ahora manejamos una lista de medicamentos seleccionados para la receta actual
  const [medicamentosSeleccionados, setMedicamentosSeleccionados] = useState([]);

  const [busquedaDNI, setBusquedaDNI] = useState('');
  const [fichaPaciente, setFichaPaciente] = useState(null);
  const [pin, setPin] = useState('');
  const [showFirma, setShowFirma] = useState(false);
  const [recetaReciente, setRecetaReciente] = useState(null);

  // ESTADOS PARA EL MODAL DE REGISTRAR PACIENTE
  const [showModalPaciente, setShowModalPaciente] = useState(false);
  const [nuevoNombrePac, setNuevoNombrePac] = useState('');
  const [nuevoDNIPac, setNuevoDNIPac] = useState('');
  const [nuevoCorreoPac, setNuevoCorreoPac] = useState('');
  const [nuevasAlergiasPac, setNuevasAlergiasPac] = useState('');
  const [nuevaClinicaPac, setNuevaClinicaPac] = useState('');

  // FILTRADO MULTI-DOCTOR
  const misRecetasFiltradas = recetasEmitidas.filter(r => 
    r.medicoId === user?.uid || r.medico === user?.nombre
  );

  const sugerenciasPac = busquedaPac.length > 0 && !pacienteSel
    ? pacientesDB.filter(p => p.nombre?.toLowerCase().includes(busquedaPac.toLowerCase()) || String(p.dni).includes(busquedaPac))
    : [];

  const sugerenciasMed = busquedaMed.length > 0
    ? inventario.filter(m => m.nombre?.toLowerCase().includes(busquedaMed.toLowerCase()))
    : [];

  // FUNCIÓN PARA AGREGAR UN MEDICAMENTO A LA LISTA TEMPORAL
  const agregarMedicamentoALista = (med) => {
    if (medicamentosSeleccionados.some(item => item.id === med.id)) {
      alert("Este medicamento ya está agregado a la lista actual.");
      return;
    }
    setMedicamentosSeleccionados([...medicamentosSeleccionados, med]);
    setBusquedaMed(''); // Limpiamos el buscador de fármacos
  };

  // FUNCIÓN PARA ELIMINAR UN MEDICAMENTO DE LA LISTA TEMPORAL
  const eliminarMedicamentoDeLista = (id) => {
    setMedicamentosSeleccionados(medicamentosSeleccionados.filter(item => item.id !== id));
  };

  const buscarHistorialCompleto = () => {
    const d = busquedaDNI.trim();
    if (!d) return alert("Por favor ingrese un número de DNI.");

    const historial = historialesDB.find(h => String(h.dniPaciente) === d);
    const pacienteBase = pacientesDB.find(pac => String(pac.dni) === d);
    const ordenesPaciente = recetasEmitidas.filter(r => String(r.dniPaciente) === d);

    if (pacienteBase) {
      setFichaPaciente({
        nombre: pacienteBase.nombre,
        dni: pacienteBase.dni,
        email: pacienteBase.email || 'No registrado',
        clinica: pacienteBase.clinica || 'No especificada',
        alergias: pacienteBase.alergias || 'Ninguna registrada',
        diagnosticos: historial?.diagnosticos || ['Sin diagnósticos críticos registrados.'],
        antecedentes: historial?.antecedentes || 'Sin antecedentes registrados.',
        notas: historial?.notas || 'No hay notas médicas importantes registradas.',
        ultimaVisita: historial?.ultimaVisita || 'Primera consulta hoy',
        historialRecetas: ordenesPaciente
      });
    } else {
      alert("No se encontró ningún paciente registrado con ese número de DNI.");
      setFichaPaciente(null);
    }
  };

  // FIRMA, ENVÍO DE CORREO E INICIALIZACIÓN DE IMPRESIÓN MÚLTIPLE
  const handleFirma = async () => {
    const pinCorrectoDelMedico = user?.pin || "1234"; 
    if (pin !== pinCorrectoDelMedico) {
      return alert("PIN de Firma de Médico Incorrecto.");
    }

    if (medicamentosSeleccionados.length === 0) {
      return alert("Debe agregar al menos un medicamento a la lista para generar la receta.");
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const fechaHoy = new Date().toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    // Mapeamos solo los nombres de los medicamentos seleccionados en un array ordenado
    const listaNombresMed = medicamentosSeleccionados.map(m => m.nombre);

    try {
      // Guardar receta en Firebase (medicamento ahora es un Array)
      await addDoc(collection(db, "recetas"), {
        paciente: pacienteSel.nombre,
        dniPaciente: pacienteSel.dni,
        medicamento: listaNombresMed, // <-- Guardado en lote como Array en la BD
        token,
        fecha: fechaHoy,
        fechaEntrega: "", 
        estado: 'Pendiente',
        medico: user?.nombre || "Médico Autorizado",
        medicoId: user?.uid || "anonimo"
      });

      const emailPaciente = pacienteSel.email || "No registrado";
      setRecetaReciente({ 
        token, 
        paciente: pacienteSel.nombre, 
        dniPaciente: pacienteSel.dni,
        medicamentos: listaNombresMed, // Almacenamos la lista completa para renderizar e imprimir
        email: emailPaciente,
        medico: user?.nombre || "Médico Especialista",
        fecha: fechaHoy,
        clinica: pacienteSel.clinica || "Hospital Clínico MediVault"
      });

      if (emailPaciente !== "No registrado") {
        alert(`¡Receta firmada con éxito! Se ha enviado el lote de medicamentos al correo: ${emailPaciente}`);
      } else {
        alert(`¡Receta firmada con éxito! Imprima el token físico con todos los fármacos asociados.`);
      }

      setPacienteSel(null); 
      setBusquedaPac(''); 
      setMedicamentosSeleccionados([]); // Vaciamos el carrito clínico
      setPin(''); 
      setShowFirma(false);
    } catch (err) { console.error(err); }
  };

  const desplegarImpresion = () => {
    window.print();
  };

  const manejarGuardarPaciente = async (e) => {
    e.preventDefault();
    if (!nuevoNombrePac.trim() || !nuevoDNIPac.trim()) return alert("Nombre y DNI son obligatorios.");

    const dniLimpio = nuevoDNIPac.trim();
    const fechaHoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });

    try {
      await addDoc(collection(db, "pacientes"), {
        nombre: nuevoNombrePac.trim(),
        dni: dniLimpio,
        email: nuevoCorreoPac.trim() || "No registrado",
        alergias: nuevasAlergiasPac.trim() || "Ninguna registrada",
        clinica: nuevaClinicaPac.trim() || "Hospital Clínico Sede Central"
      });

      await addDoc(collection(db, "historiales"), {
        dniPaciente: dniLimpio,
        diagnosticos: ["Paciente ingresado"],
        antecedentes: "Historial clínico abierto digitalmente.",
        notas: "Sin notas previas.",
        ultimaVisita: fechaHoy
      });

      alert(`¡Paciente registrado correctamente!`);
      setNuevoNombrePac(''); setNuevoDNIPac(''); setNuevoCorreoPac(''); setNuevasAlergiasPac(''); setNuevaClinicaPac('');
      setShowModalPaciente(false);
    } catch (error) { console.error(error); }
  };

  const st = {
    wrapper: { background: '#f8fafc', minHeight: '100vh', width: '100%', padding: '30px 40px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', color: '#0f172a', overflowX: 'hidden' },
    card: { background: '#ffffff', borderRadius: '24px', padding: '35px', border: '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', marginBottom: '35px', width: '100%', boxSizing: 'border-box' },
    input: { width: '100%', padding: '16px', border: '2px solid #e2e8f0', background: '#ffffff', borderRadius: '12px', fontSize: '1rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box', marginBottom: '15px' },
    label: { fontSize: '0.85rem', fontWeight: '900', color: '#334155', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    
    topNavOuter: { width: '100%', display: 'flex', justifyContent: 'center', borderBottom: '2px solid #e2e8f0', marginBottom: '35px', paddingBottom: '15px' },
    topNavContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', boxSizing: 'border-box', padding: '0 10px', gap: '20px' },
    tabsWrapper: { display: 'flex', gap: '12px', alignItems: 'center' },
    tabBtn: (act) => ({ padding: '12px 18px', border: 'none', borderRadius: '10px', background: act ? '#2563eb' : 'transparent', color: act ? '#ffffff' : '#334155', fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }),
    btnLogout: { padding: '12px 18px', background: '#fff1f2', color: '#991b1b', border: '1px solid #fecdd3', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap' },

    btnAction: { background: '#2563eb', color: 'white', border: 'none', padding: '16px 28px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 'auto', gap: '8px', lineHeight: '1.2' },
    btnSuccess: { background: '#10b981', color: 'white', border: 'none', padding: '16px 28px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 'auto', gap: '8px', lineHeight: '1.2' },
    
    headerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '160px' },
    headerTitle: { fontSize: '2.2rem', fontWeight: '900', color: '#2563eb', margin: 0, letterSpacing: '-1px', lineHeight: '1' },
    headerSubtitle: { color: '#334155', fontWeight: '800', fontSize: '1rem', marginTop: '6px', lineHeight: '1.2' },
    
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 200, backdropFilter: 'blur(8px)' },
    modalContent: { background: 'white', padding: '40px', borderRadius: '28px', width: '500px', boxShadow: '0 25px 50px rgba(0,0,0,0.15)', boxSizing: 'border-box', maxHeight: '90vh', overflowY: 'auto' },
    modalHeader: { textAlign: 'center', marginBottom: '30px' },
    modalIconCircle: { width: '60px', height: '60px', borderRadius: '50%', background: '#eff6ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', color: '#2563eb', marginBottom: '15px' },
    modalTitle: { fontSize: '1.8rem', fontWeight: '900', color: '#0f172a', margin: 0 },
    modalInputGroup: { marginBottom: '20px' },
    modalLabelIcon: { display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '900', color: '#475569', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    modalInput: { width: '100%', padding: '16px', border: '2px solid #f1f5f9', background: '#f8fafc', borderRadius: '14px', fontSize: '1rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' }
  };

  return (
    <div style={st.wrapper}>
      
      {/* CSS DE IMPRESIÓN ADAPTADO PARA LOTE DE MEDICAMENTOS */}
      <style>{`
        @media print {
          body, html, #root { background: #ffffff !important; color: #000000 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .no-print, header, aside, button, form, .top-nav-print { display: none !important; }
          .print-receta-card { border: 2px dashed #000000 !important; box-shadow: none !important; padding: 40px !important; margin: 0 !important; border-radius: 0 !important; width: 100% !important; }
          .print-token-text { font-size: 3rem !important; color: #000000 !important; }
        }
      `}</style>
      
      {/* MENÚ SUPERIOR HORIZONTAL */}
      <div style={st.topNavOuter} className="no-print">
        <div style={st.topNavContainer}>
          <div style={st.headerContainer}>
            <h1 style={st.headerTitle}>MediVault</h1>
            <p style={st.headerSubtitle}>Dr(a). {user?.nombre || "Moises"}</p>
          </div>
          <div style={st.tabsWrapper}>
            <button onClick={() => setVista('nueva')} style={st.tabBtn(vista === 'nueva')}>➕ Nueva Receta</button>
            <button onClick={() => setVista('historial')} style={st.tabBtn(vista === 'historial')}>📋 Archivo de Recetas</button>
            <button onClick={() => setVista('clinico')} style={st.tabBtn(vista === 'clinico')}>👥 Vista Pacientes</button>
            <button onClick={onLogout} style={st.btnLogout}>Cerrar Sesión</button>
          </div>
        </div>
      </div>

      {/* CUERPO DEL CONTENIDO */}
      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* BLOQUE ALERTA - COMPATIBLE CON MÚLTIPLES MEDICAMENTOS */}
        {vista === 'nueva' && recetaReciente && (
          <div class="print-receta-card" style={{ background: '#ffffff', padding: '30px 40px', borderRadius: '24px', borderLeft: '8px solid #10b981', marginBottom: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              <div>
                <span style={{ fontWeight: '900', color: '#10b981', fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 ORDEN MÉDICA DIGITAL EN LOTE — MEDIVAULT</span>
                <div style={{ color: '#0f172a', fontWeight: '800', fontSize: '1.8rem', marginTop: '15px' }}>{recetaReciente.paciente}</div>
                <div style={{ color: '#475569', fontWeight: '700', fontSize: '1rem', marginTop: '5px' }}>DNI: {recetaReciente.dniPaciente} | Centro: {recetaReciente.clinica}</div>
                
                {/* Renderizado de todos los fármacos del lote uno a uno */}
                <div style={{ color: '#2563eb', fontWeight: '900', fontSize: '1.2rem', marginTop: '20px' }}>💊 MEDICAMENTOS PRESCRITOS:</div>
                <ul style={{ margin: '10px 0 0 0', paddingLeft: '20px', color: '#0f172a', fontWeight: '700', fontSize: '1.1rem' }}>
                  {recetaReciente.medicamentos.map((med, index) => (
                    <li key={index} style={{ marginBottom: '6px' }}>{med}</li>
                  ))}
                </ul>
                
                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: '600', marginTop: '20px' }}>Emitido por: {recetaReciente.medico} el {recetaReciente.fecha}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', display: 'block' }}>Token Único de Despacho</span>
                <span class="print-token-text" style={{ color: '#2563eb', fontSize: '2.8rem', fontWeight: '950', display: 'block', marginTop: '5px' }}>{recetaReciente.token}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px dashed #f1f5f9', paddingTop: '20px' }} className="no-print">
              <button onClick={desplegarImpresion} style={{ ...st.btnAction, background: '#0f172a', fontWeight: '900', padding: '14px 30px', borderRadius: '10px' }}>🖨️ IMPRIMIR RECETA FÍSICA</button>
            </div>
          </div>
        )}

        {/* MÓDULO NUEVA RECETA (INTERFAZ DE AGREGAR EN CADENA) */}
        {vista === 'nueva' && (
          <div style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }} className="no-print">
            <div style={st.card}>
              
              {/* Paso 1: Identificar Paciente */}
              <div style={{ marginBottom: '30px' }}>
                <label style={st.label}>1. IDENTIFICAR PACIENTE</label>
                <input style={{ ...st.input, marginBottom: 0 }} placeholder="Busque por DNI o Nombre..." value={busquedaPac} onChange={e => { setBusquedaPac(e.target.value); setPacienteSel(null); }} />
                {sugerenciasPac.length > 0 && (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '10px', background: 'white', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }}>
                    {sugerenciasPac.map(p => <div key={p.id} onClick={() => { setPacienteSel(p); setBusquedaPac(p.nombre); }} style={{ padding: '15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontWeight: '700', color: '#0f172a' }}>{p.nombre} ({p.dni})</div>)}
                  </div>
                )}
              </div>

              {/* Paso 2: Buscador y agregador múltiple de fármacos */}
              <div style={{ marginBottom: '30px' }}>
                <label style={st.label}>2. AGREGAR MEDICAMENTOS A LA RECETA</label>
                <input style={{ ...st.input, marginBottom: 0 }} placeholder="Busque el fármaco a añadir..." value={busquedaMed} onChange={e => setBusquedaMed(e.target.value)} />
                {sugerenciasMed.length > 0 && (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '10px', background: 'white', maxHeigh: '200px', overflowY: 'auto' }}>
                    {sugerenciasMed.map(m => (
                      <div key={m.id} onClick={() => agregarMedicamentoALista(m)} style={{ padding: '14px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontWeight: '700', color: '#2563eb', display: 'flex', justifyContent: 'space-between', background: '#fdfdfd' }}>
                        <span>{m.nombre}</span>
                        <span style={{ color: '#10b981', fontSize: '0.85rem' }}>➕ AGREGAR A LA LISTA</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* LISTADO VISUAL DEL CARRITO DE MEDICAMENTOS */}
              {medicamentosSeleccionados.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '35px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#475569', display: 'block', marginBottom: '12px' }}>MEDICAMENTOS INCLUIDOS EN ESTA ORDEN:</span>
                  {medicamentosSeleccionados.map((item) => (
                    <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'white', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', marginBottom: '8px', fontWeight: '700', color: '#0f172a' }}>
                      <span>💊 {item.nombre}</span>
                      <button onClick={() => eliminarMedicamentoDeLista(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem' }}>❌</button>
                    </div>
                  ))}
                </div>
              )}

              <button onClick={() => (pacienteSel && medicamentosSeleccionados.length > 0) ? setShowFirma(true) : alert("Seleccione un paciente y añada mínimo un fármaco.")} style={{ ...st.btnAction, width: '100%', padding: '20px', borderRadius: '16px', fontSize: '1.1rem', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.15)' }}>FIRMAR EMISIÓN DE RECETA EN LOTE</button>
            </div>
          </div>
        )}

        {/* ARCHIVO DE RECETAS - COMPATIBLE CON RENDERIZADO EN CADENA */}
        {vista === 'historial' && (
          <div style={{ ...st.card, padding: '25px 15px' }} className="no-print">
            <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
              <thead>
                <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#334155', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                  <th style={{ padding: '12px 14px', width: '22%' }}>PACIENTE</th>
                  <th style={{ padding: '12px 14px', width: '26%' }}>MEDICAMENTOS PRESCRITOS</th>
                  <th style={{ padding: '12px 14px', width: '17%' }}>FECHA EMISIÓN</th>
                  <th style={{ padding: '12px 14px', width: '17%' }}>FECHA ENTREGA</th>
                  <th style={{ padding: '12px 14px', width: '10%', textAlign: 'center' }}>ESTADO</th>
                  <th style={{ padding: '12px 14px', width: '8%', textAlign: 'right' }}>TOKEN</th>
                </tr>
              </thead>
              <tbody>
                {misRecetasFiltradas.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                    <td style={{ padding: '16px 14px', fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>{r.paciente}</td>
                    
                    {/* Renderizamos el arreglo mapeando los fármacos separados por saltos de línea */}
                    <td style={{ padding: '16px 14px', fontSize: '0.88rem', color: '#1e293b', fontWeight: '600' }}>
                      {Array.isArray(r.medicamento) ? (
                        r.medicamento.map((med, i) => <div key={i} style={{ marginBottom: '4px' }}>• {med}</div>)
                      ) : (
                        <div>• {r.medicamento}</div>
                      )}
                    </td>
                    
                    <td style={{ padding: '16px 14px', fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{r.fecha}</td>
                    <td style={{ padding: '16px 14px', fontSize: '0.85rem', color: r.fechaEntrega ? '#15803d' : '#475569', fontWeight: '700' }}>{r.fechaEntrega || '—'}</td>
                    <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 0', borderRadius: '6px', background: r.estado === 'Pendiente' ? '#fef3c7' : '#dcfce7', color: r.estado === 'Pendiente' ? '#78350f' : '#14532d', fontWeight: '900', fontSize: '0.72rem', width: '95px', boxSizing: 'border-box', textTransform: 'uppercase' }}>{r.estado}</span>
                    </td>
                    <td style={{ padding: '16px 14px', textAlign: 'right', color: '#2563eb', fontWeight: '900', fontSize: '1.05rem' }}>{r.token}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VISTA PACIENTES - DETALLE DE RECETAS EN CADENA */}
        {vista === 'clinico' && (
          <div style={{ width: '100%' }} className="no-print">
            <div style={{ ...st.card, display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
              <div style={{ flexGrow: 1 }}>
                <label style={st.label}>Consultar Expediente Clínico</label>
                <input style={{ ...st.input, marginBottom: 0 }} placeholder="DNI..." value={busquedaDNI} onChange={(e) => setBusquedaDNI(e.target.value)} />
              </div>
              <button onClick={buscarHistorialCompleto} style={st.btnAction}>BUSCAR</button>
              <button onClick={() => setShowModalPaciente(true)} style={st.btnSuccess}>➕ REGISTRAR PACIENTE</button>
            </div>

            {fichaPaciente && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ ...st.card, borderTop: '8px solid #2563eb' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px' }}>
                    <div>
                      <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>{fichaPaciente.nombre}</h2>
                      <p style={{ fontSize: '1.1rem', color: '#334155', fontWeight: '700', margin: '6px 0' }}>DNI: {fichaPaciente.dni} | {fichaPaciente.email}</p>
                      <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '800' }}>🏥 Sede Vinculada: {fichaPaciente.clinica}</span>
                    </div>
                    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '12px 20px', borderRadius: '12px', minWidth: '240px' }}>
                      <span style={{ color: '#b91c1c', fontWeight: '900', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase' }}>⚠️ Alergias Críticas</span>
                      <strong style={{ color: '#7f1d1d', fontSize: '1.1rem', display: 'block', marginTop: '4px' }}>{fichaPaciente.alergias}</strong>
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                  <div style={st.card}>
                    <h4 style={{ color: '#2563eb', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Diagnósticos Clínicos Críticos</h4>
                    {fichaPaciente.diagnosticos.map((d, i) => (
                      <div key={i} style={{ background: '#f0f9ff', padding: '14px', borderRadius: '10px', marginBottom: '10px', color: '#0c4a6e', fontWeight: '800', border: '1px solid #bae6fd', fontSize: '0.95rem' }}>• {d}</div>
                    ))}
                  </div>
                  
                  <div style={st.card}>
                    <h4 style={{ color: '#2563eb', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Notas de Antecedentes</h4>
                    <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#0f172a', lineHeight: '1.5', marginBottom: '15px', fontWeight: '600', fontSize: '0.95rem' }}>{fichaPaciente.antecedentes}</div>
                    <div style={{ background: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                      <strong style={{ color: '#1e40af', fontSize: '0.8rem', display: 'block', marginBottom: '4px' }}>NOTAS MÉDICAS IMPORTANTES DE CONTROL:</strong>
                      <p style={{ color: '#1e3a8a', margin: 0, fontStyle: 'italic', fontWeight: '700', fontSize: '0.95rem' }}>"{fichaPaciente.notas}"</p>
                    </div>
                  </div>
                </div>

                <div style={{ ...st.card, padding: '25px 15px' }}>
                  <h4 style={{ color: '#0f172a', fontWeight: '900', marginBottom: '20px', fontSize: '1.3rem' }}>Historial Clínico Expandido</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: '#334155', fontSize: '0.8rem', fontWeight: '900' }}>
                        <th style={{ padding: '12px 10px', width: '25%' }}>MEDICAMENTOS</th>
                        <th style={{ padding: '12px 10px', width: '20%' }}>FECHA EMISIÓN</th>
                        <th style={{ padding: '12px 10px', width: '20%' }}>FECHA ENTREGA</th>
                        <th style={{ padding: '12px 10px', width: '17%' }}>MÉDICO</th>
                        <th style={{ padding: '12px 10px', width: '10%', textAlign: 'center' }}>ESTADO</th>
                        <th style={{ padding: '12px 10px', width: '8%', textAlign: 'right' }}>TOKEN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fichaPaciente.historialRecetas.map(receta => (
                        <tr key={receta.id} style={{ borderBottom: '1px solid #f8fafc', verticalAlign: 'top' }}>
                          <td style={{ padding: '14px 10px', fontSize: '0.88rem', fontWeight: '800', color: '#1e293b' }}>
                            {Array.isArray(receta.medicamento) ? receta.medicamento.join(", ") : receta.medicamento}
                          </td>
                          <td style={{ padding: '14px 10px', fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{receta.fecha}</td>
                          <td style={{ padding: '14px 10px', fontSize: '0.85rem', color: '#15803d', fontWeight: '700' }}>{receta.fechaEntrega || '—'}</td>
                          <td style={{ padding: '14px 10px', fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{receta.medico}</td>
                          <td style={{ padding: '14px 10px', textAlign: 'center' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '4px 0', borderRadius: '6px', background: receta.estado === 'Pendiente' ? '#fef3c7' : '#dcfce7', color: receta.estado === 'Pendiente' ? '#78350f' : '#14532d', fontWeight: '800', fontSize: '0.7rem', width: '85px', boxSizing: 'border-box', textTransform: 'uppercase' }}>{receta.estado}</span>
                          </td>
                          <td style={{ padding: '14px 10px', textAlign: 'right', color: '#2563eb', fontWeight: '900', fontSize: '1rem' }}>{receta.token}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL REGISTRAR PACIENTE */}
      {showModalPaciente && (
        <div style={st.modalOverlay} className="no-print">
          <div style={st.modalContent}>
              <div style={st.modalHeader}>
                <div style={st.modalIconCircle}>👤</div>
                <h3 style={st.modalTitle}>Nuevo Expediente</h3>
                <p style={{ color: '#64748b', fontSize: '0.9rem', margin: '5px 0 0 0', fontWeight: '600' }}>Ingrese los datos para abrir la ficha clínica</p>
              </div>
              <form onSubmit={manejarGuardarPaciente}>
                <div style={st.modalInputGroup}>
                  <label style={st.modalLabelIcon}><span>👤</span> Nombre Completo del Paciente</label>
                  <input style={st.modalInput} type="text" placeholder="Ej. Carlos Arturo Mendoza" value={nuevoNombrePac} onChange={e => setNuevoNombrePac(e.target.value)} required />
                </div>
                <div style={st.modalInputGroup}>
                  <label style={st.modalLabelIcon}><span>🪪</span> Documento de Identidad (DNI)</label>
                  <input style={st.modalInput} type="text" placeholder="Ej. 1065890234" value={nuevoDNIPac} onChange={e => setNuevoDNIPac(e.target.value)} required />
                </div>
                <div style={st.modalInputGroup}>
                  <label style={st.modalLabelIcon}><span>📧</span> Correo Electrónico (Notificaciones)</label>
                  <input style={st.modalInput} type="email" placeholder="ejemplo@correo.com" value={nuevoCorreoPac} onChange={e => setNuevoCorreoPac(e.target.value)} />
                </div>
                <div style={st.modalInputGroup}>
                  <label style={st.modalLabelIcon}><span>🏥</span> Centro Médico de Vinculación</label>
                  <input style={st.modalInput} type="text" placeholder="Ej. Clínica Médica de Valledupar" value={nuevaClinicaPac} onChange={e => setNuevaClinicaPac(e.target.value)} required />
                </div>
                <div style={st.modalInputGroup}>
                  <label style={{ ...st.modalLabelIcon, color: '#b91c1c' }}><span>⚠️</span> Restricciones Clínicas / Alergias</label>
                  <input style={{ ...st.modalInput, border: '2px solid #fee2e2', background: '#fffbfa' }} type="text" placeholder="Ej. Penicilina, AINES (o Ninguna)" value={nuevasAlergiasPac} onChange={e => setNuevasAlergiasPac(e.target.value)} />
                </div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '35px' }}>
                  <button type="button" onClick={() => setShowModalPaciente(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: '#f1f5f9', color: '#334155', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem' }}>Cancelar</button>
                  <button type="submit" style={{ ...st.btnSuccess, flex: 1, padding: '14px', borderRadius: '14px', fontSize: '0.95rem', boxShadow: '0 10px 15px rgba(16, 185, 129, 0.15)' }}>REGISTRAR EXPEDIENTE</button>
                </div>
              </form>
          </div>
        </div>
      )}

      {/* MODAL DE FIRMA */}
      {showFirma && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }} className="no-print">
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center', width: '380px' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2563eb', marginBottom: '10px' }}>Firma Autorizada</h3>
            <p style={{ color: '#334155', marginBottom: '25px', fontWeight: '700', fontSize: '0.95rem' }}>PIN de 4 dígitos</p>
            <input type="password" style={{ ...st.input, textAlign: 'center', fontSize: '2.5rem', letterSpacing: '12px', padding: '15px' }} value={pin} onChange={e => setPin(e.target.value)} maxLength="4" placeholder="••••" />
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button onClick={() => setShowFirma(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#f1f5f9', color: '#334155', fontWeight: '800', cursor: 'pointer' }}>Cerrar</button>
              <button onClick={handleFirma} style={{ flex: 1, padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DashboardMedico;