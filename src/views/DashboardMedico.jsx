import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { useToast } from '../components/Toast';

function DashboardMedico({ 
  user = {}, 
  onLogout, 
  inventario = [], 
  recetasEmitidas = [], 
  pacientesDB = [], 
  historialesDB = [] 
}) {
  const toast = useToast();
  const [vista, setVista] = useState('nueva');
  const [busquedaPac, setBusquedaPac] = useState('');
  const [pacienteSel, setPacienteSel] = useState(null);
  const [busquedaMed, setBusquedaMed] = useState('');
  const [medicamentosSeleccionados, setMedicamentosSeleccionados] = useState([]);
  const [busquedaHistorial, setBusquedaHistorial] = useState('');
  const [filtroEstado, setFiltroEstado] = useState('todos');

  // CONTROL DE MODO OSCURO
  const [darkMode, setDarkMode] = useState(false);

  const [busquedaDNI, setBusquedaDNI] = useState('');
  const [fichaPaciente, setFichaPaciente] = useState(null);
  const [pin, setPin] = useState('');
  const [showFirma, setShowFirma] = useState(false);
  const [recetaReciente, setRecetaReciente] = useState(null);
  
  // Estados para expediente clínico
  const [nuevosDiagnosticos, setNuevosDiagnosticos] = useState('');
  const [nuevosAntecedentes, setNuevosAntecedentes] = useState('');
  const [nuevaNotaConsulta, setNuevaNotaConsulta] = useState('');
  const [mostrarEditor, setMostrarEditor] = useState(false);
  
  // Estados para registro de nuevo paciente
  const [showModalPaciente, setShowModalPaciente] = useState(false);
  const [nuevoNombrePac, setNuevoNombrePac] = useState('');
  const [nuevoDNIPac, setNuevoDNIPac] = useState('');
  const [nuevoCorreoPac, setNuevoCorreoPac] = useState('');
  const [nuevasAlergiasPac, setNuevasAlergiasPac] = useState('');
  const [nuevaClinicaPac, setNuevaClinicaPac] = useState('');

  // --- FILTRADOS ---
  const misRecetasFiltradas = (recetasEmitidas || []).filter(r => {
    if (!r) return false;
    const medicoIdActual = user?.uid || '';
    const medicoNombreActual = user?.nombre || '';
    return (r.medicoId && r.medicoId === medicoIdActual) || (r.medico && r.medico === medicoNombreActual);
  });

  const recetasHistorialFiltradas = misRecetasFiltradas.filter(r => {
    if (!r) return false;
    const query = (busquedaHistorial || '').toLowerCase().trim();
    
    const nombrePaciente = (r.paciente || '').toLowerCase();
    const dniPaciente = String(r.dniPaciente || '');
    const tokenReceta = String(r.token || '');
    const estadoReceta = (r.estado || '').toLowerCase();

    const cumpleBuscador = (
      nombrePaciente.includes(query) ||
      dniPaciente.includes(query) ||
      tokenReceta.includes(query)
    );

    if (filtroEstado === 'todos') return cumpleBuscador;
    if (filtroEstado === 'pendiente') return cumpleBuscador && estadoReceta === 'pendiente';
    if (filtroEstado === 'dispensado') return cumpleBuscador && (estadoReceta === 'dispensado' || estadoReceta === 'entregado');
    
    return cumpleBuscador;
  });

  const sugerenciasPac = (busquedaPac || '').trim().length > 0 && !pacienteSel
    ? (pacientesDB || []).filter(p => {
        if (!p) return false;
        const nombre = (p.nombre || '').toLowerCase();
        const dni = String(p.dni || '');
        const termino = busquedaPac.toLowerCase();
        return nombre.includes(termino) || dni.includes(termino);
      })
    : [];

  const sugerenciasMed = (busquedaMed || '').trim().length > 0
    ? (inventario || []).filter(m => {
        if (!m) return false;
        const nombreMed = (m.nombre || '').toLowerCase();
        return nombreMed.includes(busquedaMed.toLowerCase());
      })
    : [];

  // --- COMPROBACIÓN DE ALERGIAS ---
  const verificarRiesgoAlergia = () => {
    if (!pacienteSel || !pacienteSel.alergias) return null;
    const alergiasPaciente = String(pacienteSel.alergias).toLowerCase();
    if (alergiasPaciente.includes('ninguna') || alergiasPaciente.trim() === '') return null;
    
    const farmacoPeligroso = medicamentosSeleccionados.find(m => {
      if (!m || !m.nombre) return false;
      const nombreMed = String(m.nombre).toLowerCase();
      return (
        alergiasPaciente.includes(nombreMed) || 
        nombreMed.includes(alergiasPaciente) ||
        (alergiasPaciente.includes('aines') && (nombreMed.includes('ibuprofeno') || nombreMed.includes('naproxeno') || nombreMed.includes('diclofenaco') || nombreMed.includes('aspirina'))) ||
        (alergiasPaciente.includes('penicilina') && (nombreMed.includes('amoxicilina') || nombreMed.includes('ampicilina') || nombreMed.includes('penicilina')))
      );
    });

    return farmacoPeligroso ? { medicamento: farmacoPeligroso.nombre, motivo: pacienteSel.alergias } : null;
  };

  const alertaAlergia = verificarRiesgoAlergia();

  // --- MANEJO DE MEDICAMENTOS ---
  const agregarMedicamentoALista = (med) => {
    if (!med) return;
    if (medicamentosSeleccionados.some(item => item.id === med.id)) {
      toast.warning("Este medicamento ya está en la orden actual.");
      return;
    }
    setMedicamentosSeleccionados([...medicamentosSeleccionados, { 
      id: med.id, 
      nombre: med.nombre, 
      posologia: '', 
      cantidad: 1, 
      indicaciones: '' 
    }]);
    setBusquedaMed('');
  };

  const manejarCambioPosologia = (id, valor) => {
    setMedicamentosSeleccionados(medicamentosSeleccionados.map(item => item.id === id ? { ...item, posologia: valor } : item));
  };

  const manejarCambioCantidad = (id, valor) => {
    setMedicamentosSeleccionados(medicamentosSeleccionados.map(item => item.id === id ? { ...item, cantidad: parseInt(valor) || 1 } : item));
  };

  const manejarCambioIndicaciones = (id, valor) => {
    setMedicamentosSeleccionados(medicamentosSeleccionados.map(item => item.id === id ? { ...item, indicaciones: valor } : item));
  };

  const eliminarMedicamentoDeLista = (id) => {
    setMedicamentosSeleccionados(medicamentosSeleccionados.filter(item => item.id !== id));
  };

  // --- PROCESOS CLÍNICOS Y REGISTROS ---
  const buscarHistorialCompleto = () => {
    const d = busquedaDNI.trim();
    if (!d) return toast.warning("Ingrese un DNI válido.");

    const historial = (historialesDB || []).find(h => h && String(h.dniPaciente) === d);
    const pacienteBase = (pacientesDB || []).find(pac => pac && String(pac.dni) === d);

    if (pacienteBase) {
      setFichaPaciente({
        idHistorial: historial?.id || null,
        nombre: pacienteBase.nombre,
        dni: pacienteBase.dni,
        email: pacienteBase.email || 'No registrado',
        clinica: pacienteBase.clinica || 'No especificada',
        alergias: pacienteBase.alergias || 'Ninguna',
        diagnosticosLista: historial?.diagnosticos || [],
        antecedentesTexto: historial?.antecedentes || 'Sin antecedentes registrados.',
        notesTexto: historial?.notas || 'Sin notas de evolución previas.',
        vitals: {
          presion: historial?.presion || "120/80",
          pulso: historial?.pulso || "72",
          temperatura: historial?.temperatura || "36.5",
          peso: historial?.peso || "70"
        }
      });
      setMostrarEditor(false);
    } else {
      toast.error("Paciente no localizado.");
    }
  };

  const guardarCambiosExpediente = async () => {
    if (!fichaPaciente) return;
    const fechaHoy = new Date().toLocaleDateString();
    const listaNuevos = nuevosDiagnosticos.split(',').map(d => d.trim()).filter(d => d.length > 0);
    const listaDiagnosticosActualizada = [...(fichaPaciente.diagnosticosLista || []), ...listaNuevos];

    try {
      if (fichaPaciente.idHistorial) {
        await updateDoc(doc(db, "historiales", fichaPaciente.idHistorial), {
          diagnosticos: listaDiagnosticosActualizada,
          antecedentes: nuevosAntecedentes || fichaPaciente.antecedentesTexto,
          notas: nuevaNotaConsulta || fichaPaciente.notesTexto,
          ultimaVisita: fechaHoy
        });
      } else {
        const docRef = await addDoc(collection(db, "historiales"), {
          dniPaciente: String(fichaPaciente.dni),
          diagnosticos: listaDiagnosticosActualizada,
          antecedentes: nuevosAntecedentes,
          notas: nuevaNotaConsulta,
          ultimaVisita: fechaHoy
        });
        setFichaPaciente({ ...fichaPaciente, idHistorial: docRef.id });
      }
      toast.success("Expediente clínico actualizado.");
      setMostrarEditor(false);
      setNuevosDiagnosticos('');
      setNuevosAntecedentes('');
      setNuevaNotaConsulta('');
      buscarHistorialCompleto();
    } catch (err) {
  console.error(err);
  toast.error("Error al guardar el expediente.");
}

  };

  const registrarNuevoPaciente = async (e) => {
    e.preventDefault();
    if (!nuevoNombrePac || !nuevoDNIPac) return toast.warning("Nombre y DNI son obligatorios.");
    try {
      await addDoc(collection(db, "pacientes"), {
        nombre: nuevoNombrePac,
        dni: String(nuevoDNIPac),
        email: nuevoCorreoPac || "No registrado",
        alergias: nuevasAlergiasPac || "Ninguna",
        clinica: nuevaClinicaPac || "General"
      });
      toast.success("Paciente registrado.");
      setShowModalPaciente(false);
      setNuevoNombrePac(''); setNuevoDNIPac(''); setNuevoCorreoPac(''); setNuevasAlergiasPac(''); setNuevaClinicaPac('');
    } catch (err) {
  console.error(err);
  toast.error("Error al procesar al paciente");
}

  };

  const handleFirma = async () => {
    if (pin !== (user?.pin || "1234")) {
      toast.error("PIN incorrecto.");
      return;
    }

    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const fechaHoy = new Date().toLocaleDateString();

    try {
      await addDoc(collection(db, "recetas"), {
        paciente: pacienteSel.nombre,
        dniPaciente: String(pacienteSel.dni),
        medicamento: medicamentosSeleccionados.map(m => ({
          nombre: m.nombre,
          posologia: m.posologia || 'Según criterio médico',
          amount: m.cantidad || 1,
          cantidad: m.cantidad || 1,
          indicaciones: m.indicaciones || 'Ninguna'
        })),
        token,
        fecha: fechaHoy,
        estado: 'Pendiente',
        medico: user?.nombre || "Médico Especialista",
        medicoId: user?.uid || "anonimo"
      });

      setRecetaReciente({
        token,
        paciente: pacienteSel.nombre,
        dniPaciente: pacienteSel.dni,
        fecha: fechaHoy,
        medicamentos: medicamentosSeleccionados
      });

      setPacienteSel(null);
      setMedicamentosSeleccionados([]);
      setPin('');
      setShowFirma(false);
      setBusquedaPac('');
    } catch (err) {
  console.error(err);
  toast.error("Error al procesar la receta");
}

  };

  // --- ESTILOS GENERALES ADAPTADOS ---
  const st = {
    container: { 
      padding: '24px 30px', 
      fontFamily: '"Inter", "Segoe UI", Roboto, sans-serif', 
      background: darkMode ? '#0f172a' : '#f8fafc', 
      minHeight: '100vh', 
      width: '100%',
      boxSizing: 'border-box',
      color: darkMode ? '#f1f5f9' : '#1e293b'
    },
    topBar: { 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      background: darkMode ? '#1e293b' : '#1e3a8a', 
      padding: '16px 24px', 
      borderRadius: '12px', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.08)', 
      marginBottom: '24px', 
      color: '#ffffff'
    },
    nav: { 
      display: 'flex', 
      gap: '10px', 
      marginBottom: '24px'
    },
    btnNav: (act) => ({ 
      padding: '12px 22px', 
      borderRadius: '8px', 
      fontWeight: '700', 
      fontSize: '0.9rem',
      cursor: 'pointer', 
      border: act ? 'none' : (darkMode ? '1px solid #334155' : '1px solid #cbd5e1'), 
      background: act ? '#2563eb' : (darkMode ? '#1e293b' : '#ffffff'), 
      color: act ? '#ffffff' : (darkMode ? '#94a3b8' : '#4b5563'), 
      boxShadow: act ? '0 4px 6px rgba(37,99,235,0.15)' : 'none'
    }),
    card: { 
      background: darkMode ? '#1e293b' : '#ffffff', 
      padding: '30px', 
      borderRadius: '12px', 
      border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', 
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)', 
      marginBottom: '24px',
      width: '100%',
      boxSizing: 'border-box',
      position: 'relative'
    },
    input: { 
      padding: '12px 14px', 
      width: '100%', 
      boxSizing: 'border-box', 
      border: darkMode ? '1px solid #475569' : '1px solid #cbd5e1', 
      borderRadius: '8px', 
      background: darkMode ? '#0f172a' : '#ffffff', 
      color: darkMode ? '#ffffff' : '#0f172a', 
      marginBottom: '16px', 
      outline: 'none',
      fontSize: '0.95rem'
    },
    label: {
      fontWeight: '700',
      display: 'block',
      marginBottom: '8px',
      color: darkMode ? '#cbd5e1' : '#1e293b', 
      fontSize: '0.95rem'
    },
    btnAction: { 
      background: '#2563eb', 
      color: '#ffffff', 
      border: 'none', 
      padding: '12px 24px', 
      borderRadius: '8px', 
      fontWeight: '700', 
      fontSize: '0.95rem',
      cursor: 'pointer'
    },
    /* SOLUCIÓN RÍGIDA PARA EL CUADRO DE SUGERENCIAS INVISIBLES */
    sugBox: { 
      background: '#ffffff', 
      border: '1px solid #cbd5e1', 
      borderRadius: '8px', 
      overflow: 'hidden', 
      marginTop: '-12px', 
      marginBottom: '20px',
      boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
      zIndex: 50,
      position: 'relative'
    },
    sugItem: { 
      padding: '12px 16px', 
      cursor: 'pointer', 
      borderBottom: '1px solid #f1f5f9', 
      color: '#0f172a', // Texto 100% oscuro visible siempre
      fontSize: '0.95rem',
      fontWeight: '600',
      textAlign: 'left',
      backgroundColor: '#ffffff',
      transition: 'background-color 0.2s ease'
    }
  };

  return (
    <div style={st.container}>
      <style>{`@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`}</style>
      {/* HEADER SUPERIOR */}
      <div style={st.topBar} className="no-print">
        <div>
          <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '700' }}>
            Panel Control Médico
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <button onClick={() => setDarkMode(!darkMode)} style={{ background: 'none', border: 'none', fontSize: '1.2rem', cursor: 'pointer' }}>
            {darkMode ? '☀️' : '🌙'}
          </button>
          <span style={{ fontWeight: '600' }}>Dr(a). {user?.nombre || 'Especialista'}</span>
          <button onClick={onLogout} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '8px 14px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>Salir</button>
        </div>
      </div>

      {/* PESTAÑAS DE NAVEGACIÓN */}
      <div style={st.nav} className="no-print">
        <button style={st.btnNav(vista === 'nueva')} onClick={() => { setVista('nueva'); setRecetaReciente(null); }}>Nueva Receta</button>
        <button style={st.btnNav(vista === 'historial')} onClick={() => { setVista('historial'); setRecetaReciente(null); }}>Historial Recetas</button>
        <button style={st.btnNav(vista === 'clinico')} onClick={() => { setVista('clinico'); setRecetaReciente(null); }}>Expediente Clínico</button>
      </div>

      {/* PESTAÑA: NUEVA RECETA */}
      {vista === 'nueva' && !recetaReciente && (
        <div key="nueva" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
            <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
              Emitir Nueva Prescripción
            </h2>
            <button onClick={() => setShowModalPaciente(true)} style={{ background: '#10b981', color: '#ffffff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: 'pointer', fontSize: '0.85rem' }}>
              + Registrar Paciente
            </button>
          </div>

          <label style={st.label}>Seleccionar Paciente</label>
          <input style={st.input} placeholder="Escriba nombre o DNI del paciente..." value={busquedaPac} onChange={e => setBusquedaPac(e.target.value)} />
          
          {/* DESPLEGABLE PREDICTIVO PACIENTES */}
          {sugerenciasPac.length > 0 && (
            <div style={st.sugBox}>
              {sugerenciasPac.map(p => (
                <div 
                  key={p.id} 
                  style={st.sugItem} 
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
                  onClick={() => { setPacienteSel(p); setBusquedaPac(p.nombre); }}
                >
                  👤 <strong style={{color: '#2563eb'}}>{p.nombre}</strong> — DNI: {p.dni}
                </div>
              ))}
            </div>
          )}

          {pacienteSel && (
            <div style={{ background: darkMode ? '#0f172a' : '#f0fdf4', padding: '16px', borderRadius: '8px', border: '1px solid #bbf7d0', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: darkMode ? '#ffffff' : '#1f2937' }}>Paciente Activo: <strong style={{ color: '#2563eb' }}>{pacienteSel.nombre}</strong> (DNI: {pacienteSel.dni})</span>
                <button onClick={() => { setPacienteSel(null); setBusquedaPac(''); setMedicamentosSeleccionados([]); }} style={{ background: '#64748b', color: '#ffffff', border: 'none', padding: '4px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem' }}>Cambiar</button>
              </div>
              <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: '#dc2626', fontWeight: '600' }}>⚠️ Alergias: {pacienteSel.alergias || 'Ninguna registrada'}</p>
            </div>
          )}

          {pacienteSel && (
            <div style={{ marginTop: '24px' }}>
              <label style={st.label}>Agregar Medicamentos</label>
              <input style={st.input} placeholder="Escriba el nombre del fármaco..." value={busquedaMed} onChange={e => setBusquedaMed(e.target.value)} />
              
              {/* DESPLEGABLE PREDICTIVO MEDICAMENTOS */}
              {sugerenciasMed.length > 0 && (
                <div style={st.sugBox}>
                  {sugerenciasMed.map(m => (
                    <div 
                      key={m.id} 
                      style={st.sugItem} 
                      onMouseEnter={(e) => e.target.style.backgroundColor = '#f1f5f9'}
                      onMouseLeave={(e) => e.target.style.backgroundColor = '#ffffff'}
                      onClick={() => agregarMedicamentoALista(m)}
                    >
                      📦 <strong style={{color: '#1e3a8a'}}>{m.nombre}</strong> — Stock Disponible: {m.stock || 0}
                    </div>
                  ))}
                </div>
              )}

              {medicamentosSeleccionados.map((m, idx) => (
                <div key={m.id} style={{ background: darkMode ? '#0f172a' : '#f9fafb', padding: '16px', borderRadius: '8px', border: darkMode ? '1px solid #334155' : '1px solid #e5e7eb', marginTop: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{ fontWeight: '700', color: '#2563eb' }}>{idx + 1}. {m.nombre}</span>
                    <button onClick={() => eliminarMedicamentoDeLista(m.id)} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '4px 8px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: '600' }}>Remover</button>
                  </div>
                  
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div>
                      <label style={st.label}>Posología</label>
                      <input style={{ ...st.input, marginBottom: 0 }} placeholder="Frecuencia / Dosis" value={m.posologia} onChange={e => manejarCambioPosologia(m.id, e.target.value)} />
                    </div>
                    <div>
                      <label style={st.label}>Cantidad</label>
                      <input type="number" min="1" style={{ ...st.input, marginBottom: 0 }} value={m.amount || m.cantidad} onChange={e => manejarCambioCantidad(m.id, e.target.value)} />
                    </div>
                  </div>
                  <div style={{ marginTop: '10px' }}>
                    <label style={st.label}>Indicaciones de consumo</label>
                    <input style={{ ...st.input, marginBottom: 0 }} placeholder="Ej: Tomar después de los alimentos" value={m.indicaciones} onChange={e => manejarCambioIndicaciones(m.id, e.target.value)} />
                  </div>
                </div>
              ))}

              {alertaAlergia && (
                <div style={{ backgroundColor: '#fee2e2', border: '1px solid #fca5a5', color: '#991b1b', padding: '12px', borderRadius: '8px', marginTop: '16px', fontWeight: '600', fontSize: '0.9rem' }}>
                  ⚠️ RIESGO DETECTADO: El paciente presenta alergia a "{alertaAlergia.motivo}" y se está recetando "{alertaAlergia.medicamento}".
                </div>
              )}

              <div style={{ marginTop: '24px', textAlign: 'right' }}>
                <button onClick={() => setShowFirma(true)} disabled={medicamentosSeleccionados.length === 0} style={{ ...st.btnAction, opacity: medicamentosSeleccionados.length === 0 ? 0.5 : 1 }}>
                  Firmar Receta
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* COMPROBANTE DE RECETA GENERADA */}
      {recetaReciente && (
        <div key="receta" style={{ background: '#ffffff', color: '#1f2937', padding: '32px', borderRadius: '12px', border: '1px solid #cbd5e1', maxWidth: '600px', margin: '0 auto', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', animation: 'fadeIn 0.3s ease' }}>
          <div style={{ borderBottom: '2px solid #2563eb', paddingBottom: '12px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 style={{ margin: 0, color: '#2563eb', fontSize: '1.3rem', fontWeight: '700' }}>ORDEN RECETA MÉDICA</h2>
            <div style={{ textAlign: 'right' }}>
              <span style={{ fontWeight: 'bold', color: '#dc2626' }}>TOKEN: {recetaReciente.token}</span>
              <p style={{ margin: 0, fontSize: '0.8rem', color: '#6b7280' }}>Fecha: {recetaReciente.fecha}</p>
            </div>
          </div>

          <div style={{ background: '#f9fafb', padding: '12px', borderRadius: '8px', marginBottom: '20px', fontSize: '0.9rem' }}>
            <p style={{ margin: '0 0 4px 0' }}><strong>Paciente:</strong> {recetaReciente.paciente}</p>
            <p style={{ margin: 0 }}><strong>DNI Paciente:</strong> {recetaReciente.dniPaciente}</p>
          </div>

          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #1f2937' }}>
                <th style={{ textAlign: 'left', paddingBottom: '8px' }}>Descripción Fármaco</th>
                <th style={{ textAlign: 'center', paddingBottom: '8px', width: '80px' }}>Cantidad</th>
              </tr>
            </thead>
            <tbody>
              {recetaReciente.medicamentos?.map((m, i) => (
                <tr key={i} style={{ borderBottom: '1px dashed #e5e7eb' }}>
                  <td style={{ padding: '10px 0' }}>
                    <strong>{m.nombre}</strong> <br />
                    <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Indicaciones: {m.indicaciones || 'Ninguna'}</span>
                  </td>
                  <td style={{ textAlign: 'center', padding: '10px 0', fontWeight: '700' }}>{m.amount || m.cantidad}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ marginTop: '30px', textAlign: 'center' }} className="no-print">
            <button onClick={() => window.print()} style={st.btnAction}>Imprimir Documento</button>
          </div>
        </div>
      )}

      {/* HISTORIAL DE RECETAS */}
      {vista === 'historial' && (
        <div key="historial" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>Historial de Recetas Emitidas</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '12px', marginBottom: '16px' }}>
            <input style={{ ...st.input, marginBottom: 0 }} placeholder="Buscar por paciente, DNI o Token..." value={busquedaHistorial} onChange={e => setBusquedaHistorial(e.target.value)} />
            <select style={{ ...st.input, marginBottom: 0 }} value={filtroEstado} onChange={e => setFiltroEstado(e.target.value)}>
              <option value="todos">Todos los Estados</option>
              <option value="pendiente">Pendientes</option>
              <option value="dispensado">Dispensados / Entregados</option>
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
                {recetasHistorialFiltradas.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f3f4f6' }}>
                    <td style={{ padding: '12px', color: darkMode ? '#ffffff' : '#1f2937' }}><strong>{r.paciente}</strong></td>
                    <td style={{ padding: '12px', color: darkMode ? '#ffffff' : '#1f2937' }}>{r.fecha}</td>
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
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* EXPEDIENTE CLÍNICO */}
      {vista === 'clinico' && (
        <div key="clinico" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
          <h2 style={{ margin: '0 0 16px 0', fontSize: '1.3rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>Búsqueda de Expediente Clínico</h2>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', maxWidth: '400px' }}>
            <input style={{ ...st.input, marginBottom: 0 }} placeholder="Ingrese DNI del paciente..." value={busquedaDNI} onChange={e => setBusquedaDNI(e.target.value)} />
            <button onClick={buscarHistorialCompleto} style={st.btnAction}>Consultar</button>
          </div>

          {fichaPaciente && (
            <div style={{ border: '1px solid #cbd5e1', borderRadius: '8px', overflow: 'hidden' }}>
              <div style={{ background: '#2563eb', color: '#ffffff', padding: '16px' }}>
                <h3 style={{ margin: 0 }}>Historial: {fichaPaciente.nombre}</h3>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', opacity: 0.9 }}>DNI: {fichaPaciente.dni} | Correo: {fichaPaciente.email}</p>
              </div>

              <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div>
                  <h4 style={{ color: '#2563eb', margin: '0 0 8px 0' }}>Signos Vitales</h4>
                  <p style={{ color: darkMode ? '#ffffff' : '#1f2937' }}>• P. Arterial: {fichaPaciente.vitals?.presion}</p>
                  <p style={{ color: darkMode ? '#ffffff' : '#1f2937' }}>• Pulso: {fichaPaciente.vitals?.pulso} lpm</p>
                  <p style={{ color: darkMode ? '#ffffff' : '#1f2937' }}>• Temperatura: {fichaPaciente.vitals?.temperatura} °C</p>
                  <p style={{ color: darkMode ? '#ffffff' : '#1f2937' }}>• Peso: {fichaPaciente.vitals?.peso} kg</p>

                  <h4 style={{ color: '#2563eb', margin: '16px 0 8px 0' }}>Antecedentes Médicos</h4>
                  <p style={{ background: darkMode ? '#0f172a' : '#f9fafb', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: darkMode ? '#ffffff' : '#1f2937' }}>{fichaPaciente.antecedentesTexto}</p>
                </div>

                <div>
                  <h4 style={{ color: '#2563eb', margin: '0 0 8px 0' }}>Diagnósticos Registrados</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {fichaPaciente.diagnosticosLista?.map((d, idx) => (
                      <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: '600' }}>{d}</span>
                    ))}
                  </div>

                  <h4 style={{ color: '#2563eb', margin: '16px 0 8px 0' }}>Notas de Evolución</h4>
                  <p style={{ background: darkMode ? '#0f172a' : '#f9fafb', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1', color: darkMode ? '#ffffff' : '#1f2937' }}>{fichaPaciente.notesTexto}</p>
                </div>
              </div>

              <div style={{ padding: '12px 20px', background: darkMode ? '#0f172a' : '#f9fafb', textAlign: 'right', borderTop: '1px solid #cbd5e1' }}>
                <button onClick={() => setMostrarEditor(!mostrarEditor)} style={st.btnAction}>{mostrarEditor ? 'Cerrar Panel Edición' : 'Modificar Expediente'}</button>
              </div>

              {mostrarEditor && (
                <div style={{ padding: '20px', borderTop: '1px solid #cbd5e1', background: darkMode ? '#1e293b' : '#ffffff' }}>
                  <label style={st.label}>Nuevos Diagnósticos (separados por comas):</label>
                  <input style={st.input} placeholder="Asma, Obesidad..." value={nuevosDiagnosticos} onChange={e => setNuevosDiagnosticos(e.target.value)} />
                  
                  <label style={st.label}>Actualizar Antecedentes:</label>
                  <textarea style={{ ...st.input, height: '60px' }} value={nuevosAntecedentes} onChange={e => setNuevosAntecedentes(e.target.value)} />
                  
                  <label style={st.label}>Nueva Nota de Consulta:</label>
                  <textarea style={{ ...st.input, height: '80px' }} value={nuevaNotaConsulta} onChange={e => setNuevaNotaConsulta(e.target.value)} />

                  <button onClick={guardarCambiosExpediente} style={st.btnAction}>Guardar Modificaciones</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* MODAL: REGISTRO DE PACIENTE */}
      {showModalPaciente && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 4000 }}>
          <div style={{ ...st.card, maxWidth: '440px', margin: 0 }}>
            <h3 style={{ marginTop: 0, color: '#2563eb', fontWeight: '700' }}>Registrar Paciente Nuevo</h3>
            <form onSubmit={registrarNuevoPaciente}>
              <input style={st.input} placeholder="Nombre Completo" value={nuevoNombrePac} onChange={e => setNuevoNombrePac(e.target.value)} required />
              <input style={st.input} placeholder="DNI / Cédula" value={nuevoDNIPac} onChange={e => setNuevoDNIPac(e.target.value)} required />
              <input style={st.input} type="email" placeholder="Correo Electrónico" value={nuevoCorreoPac} onChange={e => setNuevoCorreoPac(e.target.value)} />
              <input style={st.input} placeholder="Alergias Conocidas" value={nuevasAlergiasPac} onChange={e => setNuevasAlergiasPac(e.target.value)} />
              <input style={st.input} placeholder="Clínica / Centro" value={nuevaClinicaPac} onChange={e => setNuevaClinicaPac(e.target.value)} />
              <div style={{ display: 'flex', gap: '10px' }}>
                <button type="submit" style={{ ...st.btnAction, flex: 1, background: '#10b981' }}>Dar de Alta</button>
                <button type="button" onClick={() => setShowModalPaciente(false)} style={{ background: '#ef4444', color: '#ffffff', border: 'none', padding: '12px', borderRadius: '8px', cursor: 'pointer', flex: 1, fontWeight: '600' }}>Cerrar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PIN AUTORIZACIÓN */}
      {showFirma && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(4px)' }}>
          <div style={{ background: darkMode ? '#1e293b' : '#ffffff', padding: '30px', borderRadius: '16px', textAlign: 'center', maxWidth: '340px', width: '100%', border: '1px solid #e2e8f0' }}>
            <h3 style={{ fontSize: '1.3rem', fontWeight: '700', color: '#2563eb', margin: '0 0 10px 0' }}>Confirmar Firma Médica</h3>
            <input type="password" style={{ ...st.input, textAlign: 'center', fontSize: '2rem', letterSpacing: '8px', color: darkMode ? '#ffffff' : '#0f172a', background: darkMode ? '#0f172a' : '#ffffff' }} value={pin} onChange={e => setPin(e.target.value)} maxLength="4" placeholder="••••" />
            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setShowFirma(false)} style={{ flex: 1, padding: '10px', background: '#64748b', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Cancelar</button>
              <button onClick={handleFirma} style={{ flex: 1, padding: '10px', background: '#2563eb', color: '#ffffff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>Autorizar</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default DashboardMedico;