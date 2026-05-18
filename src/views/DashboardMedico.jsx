import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

function DashboardMedico({ user, onLogout, inventario, recetasEmitidas, pacientesDB, historialesDB }) {
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
  
  // Estados para registro de pacientes
  const [showModalPaciente, setShowModalPaciente] = useState(false);
  const [nuevoNombrePac, setNuevoNombrePac] = useState('');
  const [nuevoDNIPac, setNuevoDNIPac] = useState('');
  const [nuevoCorreoPac, setNuevoCorreoPac] = useState('');
  const [nuevasAlergiasPac, setNuevasAlergiasPac] = useState('');
  const [nuevaClinicaPac, setNuevaClinicaPac] = useState('');

  // FILTRADO EXCLUSIVO POR DOCTOR (PRIVACIDAD)
  const misRecetasFiltradas = recetasEmitidas.filter(r => 
    r.medicoId === user?.uid || r.medico === user?.nombre
  );

  // Filtro del archivo de recetas aplicando buscador y segmentación por estado
  const recetasHistorialFiltradas = misRecetasFiltradas.filter(r => {
    const query = busquedaHistorial.toLowerCase().trim();
    const cumpleBuscador = (
      r.paciente?.toLowerCase().includes(query) ||
      String(r.dniPaciente).includes(query) ||
      String(r.token).includes(query)
    );

    if (filtroEstado === 'todos') return cumpleBuscador;
    if (filtroEstado === 'pendiente') return cumpleBuscador && r.estado?.toLowerCase() === 'pendiente';
    if (filtroEstado === 'dispensado') return cumpleBuscador && (r.estado?.toLowerCase() === 'dispensado' || r.estado?.toLowerCase() === 'entregado');
    
    return cumpleBuscador;
  });

  const sugerenciasPac = busquedaPac.length > 0 && !pacienteSel
    ? pacientesDB.filter(p => p.nombre?.toLowerCase().includes(busquedaPac.toLowerCase()) || String(p.dni).includes(busquedaPac))
    : [];

  const sugerenciasMed = busquedaMed.length > 0
    ? inventario.filter(m => m.nombre?.toLowerCase().includes(busquedaMed.toLowerCase()))
    : [];

  const verificarRiesgoAlergia = () => {
    if (!pacienteSel || !pacienteSel.alergias || pacienteSel.alergias.toLowerCase().includes('ninguna')) return null;
    const alergiasPaciente = pacienteSel.alergias.toLowerCase();
    
    const farmacoPeligroso = medicamentosSeleccionados.find(m => {
      const nombreMed = m.nombre.toLowerCase();
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

  const agregarMedicamentoALista = (med) => {
    if (medicamentosSeleccionados.some(item => item.id === med.id)) {
      alert("Este medicamento ya está agregado a la lista actual.");
      return;
    }
    setMedicamentosSeleccionados([...medicamentosSeleccionados, { id: med.id, nombre: med.nombre, posologia: '' }]);
    setBusquedaMed('');
  };

  const manejarCambioPosologia = (id, valor) => {
    setMedicamentosSeleccionados(
      medicamentosSeleccionados.map(item => item.id === id ? { ...item, posologia: valor } : item)
    );
  };

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
        idHistorial: historial?.id || null,
        nombre: pacienteBase.nombre,
        dni: pacienteBase.dni,
        email: pacienteBase.email || 'No registrado',
        clinica: pacienteBase.clinica || 'No especificada',
        alergias: pacienteBase.alergias || 'Ninguna registrada',
        diagnosticosLista: historial?.diagnosticos || [],
        antecedentesTexto: historial?.antecedentes || 'Sin antecedentes registrados.',
        notesTexto: historial?.notas || 'No hay notas importantes registradas.',
        ultimaVisita: historial?.ultimaVisita || 'Primera consulta hoy',
        historialRecetas: ordenesPaciente,
        vitals: {
          presion: historial?.presion || "120/80 mmHg",
          pulso: historial?.pulso || "72 lpm",
          temperatura: historial?.temperatura || "36.5 °C",
          peso: historial?.peso || "70 kg"
        }
      });
      setNuevosDiagnosticos('');
      setNuevosAntecedentes('');
      setNuevaNotaConsulta('');
      setMostrarEditor(false);
    } else {
      alert("No se encontró ningún paciente registrado con ese número de DNI.");
      setFichaPaciente(null);
    }
  };

  const guardarCambiosExpediente = async () => {
    if (!fichaPaciente) return;
    const fechaHoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const listaNuevos = nuevosDiagnosticos.split(',').map(d => d.trim()).filter(d => d.length > 0);
    const listaDiagnosticosActualizada = [...fichaPaciente.diagnosticosLista, ...listaNuevos];

    let antecedentesActualizados = fichaPaciente.antecedentesTexto;
    if (nuevosAntecedentes.trim()) {
      antecedentesActualizados = antecedentesActualizados === 'Sin antecedentes registrados.' 
        ? nuevosAntecedentes.trim() 
        : `${antecedentesActualizados}\n• ${nuevosAntecedentes.trim()}`;
    }

    let notasActualizadas = fichaPaciente.notesTexto;
    if (nuevaNotaConsulta.trim()) {
      const nuevaEntradaNota = `[Evolución ${fechaHoy}]: ${nuevaNotaConsulta.trim()}`;
      notasActualizadas = notasActualizadas === 'No hay notas importantes registradas.' || notasActualizadas === 'Sin notas.'
        ? nuevaEntradaNota
        : `${notasActualizadas}\n\n${nuevaEntradaNota}`;
    }

    try {
      if (fichaPaciente.idHistorial) {
        const historialRef = doc(db, "historiales", fichaPaciente.idHistorial);
        await updateDoc(historialRef, {
          diagnosticos: listaDiagnosticosActualizada,
          antecedentes: antecedentesActualizados,
          notas: notasActualizadas,
          ultimaVisita: fechaHoy
        });
      } else {
        await addDoc(collection(db, "historiales"), {
          dniPaciente: String(fichaPaciente.dni),
          diagnosticos: listaDiagnosticosActualizada,
          antecedentes: antecedentesActualizados,
          notas: notasActualizadas,
          ultimaVisita: fechaHoy
        });
      }
      
      alert(`¡Expediente de ${fichaPaciente.nombre} actualizado con éxito!`);
      setFichaPaciente({
        ...fichaPaciente,
        diagnosticosLista: listaDiagnosticosActualizada,
        antecedentesTexto: antecedentesActualizados,
        notesTexto: notasActualizadas,
        ultimaVisita: fechaHoy
      });
      setMostrarEditor(false); 
    } catch (error) {
      console.error("Error al actualizar: ", error);
      alert("Error al intentar salvar los datos.");
    }
  };

  const handleFirma = async () => {
    const pinCorrectoDelMedico = user?.pin || "1234"; 
    if (pin !== pinCorrectoDelMedico) return alert("PIN de Firma de Médico Incorrecto.");
    if (medicamentosSeleccionados.length === 0) return alert("Debe agregar al menos un medicamento.");
    if (medicamentosSeleccionados.some(m => !m.posologia.trim())) return alert("Debe ingresar la posología para todos los medicamentos.");
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const fechaHoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    try {
      await addDoc(collection(db, "recetas"), {
        paciente: pacienteSel.nombre,
        dniPaciente: pacienteSel.dni,
        medicamento: medicamentosSeleccionados.map(m => ({ nombre: m.nombre, posologia: m.posologia })), 
        token,
        fecha: fechaHoy,
        fechaEntrega: "", 
        estado: 'Pendiente',
        medico: user?.nombre || "Médico Autorizado",
        medicoId: user?.uid || "anonimo"
      });
      setRecetaReciente({ 
        token, paciente: pacienteSel.nombre, dniPaciente: pacienteSel.dni,
        medicamentos: medicamentosSeleccionados, email: pacienteSel.email || "No registrado",
        medico: user?.nombre || "Médico Especialista", fecha: fechaHoy, clinica: pacienteSel.clinica || "MediVault"
      });
      setPacienteSel(null); setBusquedaPac(''); setMedicamentosSeleccionados([]); setPin(''); setShowFirma(false);
    } catch (err) { console.error(err); }
  };

  const despacharImpresion = () => window.print();

  const manejarGuardarPaciente = async (e) => {
    e.preventDefault();
    if (!nuevoNombrePac.trim() || !nuevoDNIPac.trim()) return alert("Nombre y DNI son obligatorios.");
    const dniLimpio = nuevoDNIPac.trim();
    const fechaHoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    try {
      await addDoc(collection(db, "pacientes"), {
        nombre: nuevoNombrePac.trim(), dni: dniLimpio, email: nuevoCorreoPac.trim() || "No registrado",
        alergias: nuevasAlergiasPac.trim() || "Ninguna registrada", clinica: nuevaClinicaPac.trim() || "Hospital Clínico Sede Central"
      });
      await addDoc(collection(db, "historiales"), { dniPaciente: dniLimpio, diagnosticos: ["Paciente ingresado"], antecedentes: "Abierto digitalmente.", notas: "Sin notas.", ultimaVisita: fechaHoy });
      alert(`¡Paciente registrado correctamente!`);
      setNuevoNombrePac(''); setNuevoDNIPac(''); setNuevoCorreoPac(''); setNuevasAlergiasPac(''); setNuevaClinicaPac('');
      setShowModalPaciente(false);
    } catch (error) { console.error(error); }
  };

  const st = {
    wrapper: { background: darkMode ? '#0f172a' : '#f8fafc', minHeight: '100vh', width: '100%', padding: '30px 40px', boxSizing: 'border-box', fontFamily: '"Inter", sans-serif', color: darkMode ? '#f1f5f9' : '#0f172a', overflowX: 'hidden', transition: 'all 0.3s ease' },
    card: { background: darkMode ? '#1e293b' : '#ffffff', borderRadius: '24px', padding: '35px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 4px 12px rgba(0,0,0,0.01)', marginBottom: '35px', width: '100%', boxSizing: 'border-box', transition: 'all 0.3s ease' },
    input: { width: '100%', padding: '16px', border: darkMode ? '2px solid #334155' : '2px solid #e2e8f0', background: darkMode ? '#0f172a' : '#ffffff', borderRadius: '12px', fontSize: '1rem', color: darkMode ? '#ffffff' : '#0f172a', outline: 'none', boxSizing: 'border-box', marginBottom: '15px', transition: 'all 0.2s ease' },
    label: { fontSize: '0.85rem', fontWeight: '900', color: darkMode ? '#94a3b8' : '#334155', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    topNavOuter: { width: '100%', display: 'flex', justifyContent: 'center', borderBottom: darkMode ? '2px solid #1e293b' : '2px solid #e2e8f0', marginBottom: '35px', paddingBottom: '15px' },
    topNavContainer: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', maxWidth: '1200px', boxSizing: 'border-box', padding: '0 10px', gap: '20px' },
    tabsWrapper: { display: 'flex', gap: '12px', alignItems: 'center' },
    btnLogout: { padding: '12px 18px', background: '#fff1f2', color: '#991b1b', border: '1px solid #fecdd3', borderRadius: '10px', fontWeight: '900', cursor: 'pointer', fontSize: '0.88rem', whiteSpace: 'nowrap' },
    btnAction: { background: '#2563eb', color: 'white', border: 'none', padding: '16px 28px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 'auto', gap: '8px', lineHeight: '1.2' },
    btnSuccess: { background: 'transparent', color: '#2563eb', border: '2px solid #2563eb', padding: '16px 28px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', fontSize: '0.95rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', height: 'auto', gap: '8px', lineHeight: '1.2', transition: 'all 0.2s' },
    headerContainer: { display: 'flex', flexDirection: 'column', alignItems: 'flex-start', minWidth: '160px' },
    
    // EL ARREGLO VISUAL: El logo mantiene su azul MediVault corporativo nítido en modo claro y oscuro
    headerTitle: { fontSize: '2.2rem', fontWeight: '900', color: '#2563eb', margin: 0, letterSpacing: '-1px', lineHeight: '1' },
    
    headerSubtitle: { color: darkMode ? '#cbd5e1' : '#334155', fontWeight: '800', fontSize: '1rem', marginTop: '6px', lineHeight: '1.2' },
    
    modalOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, backdropFilter: 'blur(20px)', animation: 'fadeIn 0.2s ease-out' },
    modalContent: { background: darkMode ? '#1e293b' : '#ffffff', padding: '40px', borderRadius: '32px', width: '540px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: darkMode ? '0 25px 50px rgba(0,0,0,0.4)' : '0 25px 60px -15px rgba(15, 23, 42, 0.12)', boxSizing: 'border-box', maxHeight: '92vh', overflowY: 'auto', animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)' },
    modalHeader: { textAlign: 'center', marginBottom: '28px' },
    modalIconCircle: { width: '56px', height: '56px', borderRadius: '16px', background: '#eff6ff', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', color: '#2563eb', marginBottom: '12px' },
    modalTitle: { fontSize: '1.8rem', fontWeight: '950', color: darkMode ? '#ffffff' : '#0f172a', margin: 0, letterSpacing: '-1.2px' },
    modalSub: { color: '#64748b', fontSize: '0.9rem', fontWeight: '600', marginTop: '6px' },
    modalGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '18px' },
    modalInputGroup: { display: 'flex', flexDirection: 'column', textAlign: 'left', marginBottom: '18px' },
    modalLabel: { fontSize: '0.72rem', fontWeight: '900', color: darkMode ? '#94a3b8' : '#64748b', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.8px' },
    modalInput: { width: '100%', padding: '14px 16px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', background: darkMode ? '#0f172a' : '#f8fafc', color: darkMode ? '#ffffff' : '#0f172a', outline: 'none', boxSizing: 'border-box', borderRadius: '12px', transition: 'all 0.2s ease' },
    
    patientReviewCard: { background: darkMode ? '#0f172a' : '#f8fafc', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', padding: '20px', borderRadius: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' },
    medTable: { width: '100%', borderCollapse: 'collapse', marginTop: '10px' },
    medTh: { padding: '12px', borderBottom: darkMode ? '2px solid #334155' : '2px solid #e2e8f0', textAlign: 'left', fontSize: '0.8rem', fontWeight: '800', color: darkMode ? '#94a3b8' : '#475569' },
    medTd: { padding: '12px', borderBottom: darkMode ? '1px solid #1e293b' : '1px solid #f1f5f9', fontSize: '0.95rem', color: darkMode ? '#cbd5e1' : '#0f172a', verticalAlign: 'middle' },
    histTh: { padding: '16px 14px', color: darkMode ? '#94a3b8' : '#475569', fontSize: '0.8rem', fontWeight: '900', letterSpacing: '0.5px', textTransform: 'uppercase', borderBottom: darkMode ? '2px solid #334155' : '2px solid #e2e8f0', textAlign: 'left' },
    histTd: { padding: '18px 14px', fontSize: '0.9rem', borderBottom: darkMode ? '1px solid #1e293b' : '1px solid #f1f5f9', verticalAlign: 'middle', color: darkMode ? '#cbd5e1' : '#0f172a' },
    vitalsGrid: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '15px', marginBottom: '30px' },
    vitalCard: { background: darkMode ? '#0f172a' : '#f8fafc', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', padding: '16px 20px', borderRadius: '14px', display: 'flex', flexDirection: 'column', gap: '4px' },
    themeToggleBtn: { position: 'fixed', bottom: '30px', right: '30px', width: '56px', height: '56px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.3)', zIndex: 5000, transition: 'transform 0.2s' }
  };

  return (
    <div style={st.wrapper}>
      <style>{`
        @media print {
          body, html, #root { background: #ffffff !important; color: #000000 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .no-print, header, aside, button, form, .top-nav-outer { display: none !important; }
          .print-receta-card { border: 2px dashed #000000 !important; box-shadow: none !important; padding: 40px !important; margin: 0 !important; border-radius: 0 !important; width: 100% !important; }
          .print-token-text { font-size: 3rem !important; color: #000000 !important; }
        }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        .saas-input:focus { border-color: #2563eb !important; background: ${darkMode ? '#0f172a' : '#ffffff'} !important; box-shadow: 0 0 0 4px rgba(37, 99, 235, 0.06) !important; }
      `}</style>
      
      {/* BOTÓN FLOTANTE TEMA */}
      <button 
        style={st.themeToggleBtn} 
        onClick={() => setDarkMode(!darkMode)}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
        className="no-print"
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {/* NAV SUPERIOR */}
      <div style={st.topNavOuter} className="no-print">
        <div style={st.topNavContainer}>
          <div style={st.headerContainer}>
            <h1 style={st.headerTitle}>MediVault</h1>
            <p style={{ color: darkMode ? '#cbd5e1' : '#334155', fontWeight: '800', fontSize: '1rem', marginTop: '6px', lineHeight: '1.2' }}>Dr(a). {user?.nombre || "Moises"}</p>
          </div>
          <div style={st.tabsWrapper}>
            <button onClick={() => setVista('nueva')} style={{ padding: '12px 18px', border: 'none', borderRadius: '10px', background: vista === 'nueva' ? '#2563eb' : 'transparent', color: vista === 'nueva' ? '#ffffff' : (darkMode ? '#94a3b8' : '#334155'), fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }}>➕ Nueva Receta</button>
            <button onClick={() => setVista('historial')} style={{ padding: '12px 18px', border: 'none', borderRadius: '10px', background: vista === 'historial' ? '#2563eb' : 'transparent', color: vista === 'historial' ? '#ffffff' : (darkMode ? '#94a3b8' : '#334155'), fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }}>📋 Archivo de Recetas</button>
            <button onClick={() => setVista('clinico')} style={{ padding: '12px 18px', border: 'none', borderRadius: '10px', background: vista === 'clinico' ? '#2563eb' : 'transparent', color: vista === 'clinico' ? '#ffffff' : (darkMode ? '#94a3b8' : '#334155'), fontWeight: '900', fontSize: '0.88rem', cursor: 'pointer', transition: '0.2s', whiteSpace: 'nowrap' }}>👥 Vista Pacientes</button>
            <button onClick={onLogout} style={st.btnLogout}>Cerrar Sesión</button>
          </div>
        </div>
      </div>

      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* RECIENTE EMISIÓN */}
        {vista === 'nueva' && recetaReciente && (
          <div className="print-receta-card" style={{ background: darkMode ? '#1e293b' : '#ffffff', padding: '30px 40px', borderRadius: '24px', borderLeft: '8px solid #10b981', marginBottom: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              <div>
                <span style={{ fontWeight: '900', color: '#10b981', fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 RECETARIO CLÍNICO DIGITAL — MEDIVAULT</span>
                <div style={{ color: darkMode ? '#ffffff' : '#0f172a', fontWeight: '800', fontSize: '1.8rem', marginTop: '15px' }}>{recetaReciente.paciente}</div>
                <div style={{ color: darkMode ? '#94a3b8' : '#475569', fontWeight: '700', fontSize: '1rem', marginTop: '5px' }}>DNI: {recetaReciente.dniPaciente} | Sede: {recetaReciente.clinica}</div>
                <div style={{ color: '#2563eb', fontWeight: '900', fontSize: '1.2rem', marginTop: '20px' }}>💊 TRATAMIENTO PRESCRITO:</div>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recetaReciente.medicamentos.map((med, index) => (
                    <div key={index} style={{ color: darkMode ? '#cbd5e1' : '#0f172a', fontSize: '1.1rem', fontWeight: '600' }}>
                      • <strong>{med.nombre}</strong> — <span style={{ fontStyle: 'italic', color: darkMode ? '#94a3b8' : '#475569' }}>{med.posologia}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ color: '#475569', fontSize: '0.8rem', fontWeight: '900', textTransform: 'uppercase', display: 'block' }}>Token de Retiro</span>
                <span className="print-token-text" style={{ color: '#2563eb', fontSize: '2.8rem', fontWeight: '950', display: 'block', marginTop: '5px' }}>{recetaReciente.token}</span>
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '2px dashed #f1f5f9', paddingTop: '20px' }} className="no-print">
              <button onClick={despacharImpresion} style={{ ...st.btnAction, background: darkMode ? '#ffffff' : '#0f172a', color: darkMode ? '#0f172a' : '#ffffff', fontWeight: '900', padding: '14px 30px', borderRadius: '10px' }}>🖨️ IMPRIMIR RECETARIO</button>
            </div>
          </div>
        )}

        {/* PESTAÑA 1: NUEVA RECETA */}
        {vista === 'nueva' && (
          <div style={{ maxWidth: '700px', margin: '0 auto', width: '100%' }} className="no-print">
            <div style={st.card}>
              <div style={{ marginBottom: '25px' }}>
                <label style={st.label}>1. Identificar Paciente</label>
                <input 
                  style={{ ...st.input, border: pacienteSel ? '2px solid #10b981' : (darkMode ? '2px solid #334155' : '2px solid #e2e8f0') }} 
                  placeholder="Escriba DNI o Apellido del paciente..." 
                  value={busquedaPac} 
                  onChange={e => { setBusquedaPac(e.target.value); setPacienteSel(null); }} 
                />
                {sugerenciasPac.length > 0 && (
                  <div style={{ border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', borderRadius: '12px', marginTop: '-5px', background: darkMode ? '#1e293b' : 'white', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', position: 'relative', zIndex: 10 }}>
                    {sugerenciasPac.map(p => (
                      <div key={p.id} onClick={() => { setPacienteSel(p); setBusquedaPac(p.nombre); }} style={{ padding: '14px 16px', cursor: 'pointer', borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9', fontWeight: '700', color: darkMode ? '#ffffff' : '#0f172a' }}>
                        👤 {p.nombre} ({p.dni})
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {pacienteSel && (
                <div style={st.patientReviewCard}>
                  <div>
                    <strong style={{ fontSize: '1.1rem', color: darkMode ? '#ffffff' : '#0f172a', display: 'block' }}>{pacienteSel.nombre}</strong>
                    <span style={{ fontSize: '0.85rem', color: darkMode ? '#94a3b8' : '#475569', fontWeight: '600' }}>DNI: {pacienteSel.dni} | {pacienteSel.email}</span>
                  </div>
                  <div style={{ background: pacienteSel.alergias?.toLowerCase().includes('ninguna') ? '#ecfdf5' : '#fff1f1', border: '1px solid', borderColor: pacienteSel.alergias?.toLowerCase().includes('ninguna') ? '#a7f3d0' : '#fca5a5', padding: '6px 14px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: '800', color: pacienteSel.alergias?.toLowerCase().includes('ninguna') ? '#15803d' : '#b91c1c' }}>
                    {pacienteSel.alergias?.toLowerCase().includes('ninguna') ? '🟢 SIN ALERGIAS' : `⚠️ ALERGIA: ${pacienteSel.alergias}`}
                  </div>
                </div>
              )}

              <div style={{ marginBottom: '30px' }}>
                <label style={st.label}>2. Agregar Medicamentos a la Receta</label>
                <input style={{ ...st.input, marginBottom: 0 }} placeholder="Busque el fármaco por nombre activo..." value={busquedaMed} onChange={e => setBusquedaMed(e.target.value)} disabled={!pacienteSel} />
                {sugerenciasMed.length > 0 && (
                  <div style={{ border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', borderRadius: '12px', marginTop: '10px', background: darkMode ? '#1e293b' : 'white', maxHeight: '200px', overflowY: 'auto', position: 'relative', zIndex: 5 }}>
                    {sugerenciasMed.map(m => (
                      <div key={m.id} onClick={() => agregarMedicamentoALista(m)} style={{ padding: '14px 15px', cursor: 'pointer', borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9', fontWeight: '700', color: '#2563eb', display: 'flex', justifyContent: 'space-between', background: darkMode ? '#1e293b' : '#fdfdfd' }}>
                        <span>💊 {m.nombre}</span> 
                        <span style={{ color: '#10b981', fontSize: '0.85rem' }}>➕ PRESCRIBIR</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {medicamentosSeleccionados.length > 0 && (
                <div style={{ marginBottom: '35px' }}>
                  <label style={st.label}>Tratamiento en curso</label>
                  <table style={st.medTable}>
                    <thead>
                      <tr>
                        <th style={st.medTh}>FÁRMACO</th>
                        <th style={st.medTh}>DOSIFICACIÓN / POSOLOGÍA</th>
                        <th style={{ ...st.medTh, width: '50px', textAlign: 'center' }}>ACCION</th>
                      </tr>
                    </thead>
                    <tbody>
                      {medicamentosSeleccionados.map((item) => (
                        <tr key={item.id} style={{ borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9' }}>
                          <td style={st.medTd}><strong>{item.nombre}</strong></td>
                          <td style={st.medTd}>
                            <input 
                              style={{ ...st.input, marginBottom: 0, padding: '10px 14px', fontSize: '0.9rem', border: darkMode ? '1px solid #334155' : '1px solid #cbd5e1', borderRadius: '8px' }} 
                              type="text" 
                              placeholder="Tomar 1 tableta cada 8 horas por 5 días..."
                              value={item.posologia}
                              onChange={(e) => manejarCambioPosologia(item.id, e.target.value)} 
                            />
                          </td>
                          <td style={{ ...st.medTd, textAlign: 'center' }}>
                            <button onClick={() => eliminarMedicamentoDeLista(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '900', cursor: 'pointer', fontSize: '1.1rem' }}>🗑️</button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {alertaAlergia && (
                <div style={{ background: '#fff1f1', border: '2px solid #fca5a5', padding: '18px 24px', borderRadius: '14px', marginBottom: '30px', color: '#991b1b', fontSize: '0.95rem', fontWeight: '800' }}>
                  ⚠️ DETECCIÓN PREVENTIVA DE RIESGO: El medicamento "{alertaAlergia.medicamento}" genera contraindicación por historial de: "{alertaAlergia.motivo}".
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '10px' }}>
                <button 
                  onClick={() => (pacienteSel && medicamentosSeleccionados.length > 0) ? setShowFirma(true) : alert("Por favor, seleccione un paciente y añada al menos un medicamento.")} 
                  style={{ ...st.btnAction, width: '100%', padding: '18px', borderRadius: '14px', fontSize: '1.05rem' }}
                >
                  🔒 FIRMAR EMISIÓN DE RECETA CLÍNICA
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PESTAÑA ARCHIVO DE RECETAS - PRIVADA: SÓLO DOCTOR DE LA SESIÓN */}
        {vista === 'historial' && (
          <div style={{ width: '100%' }} className="no-print">
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center', marginBottom: '25px', flexWrap: 'wrap' }}>
              <div style={{ flexGrow: 1, minWidth: '300px' }}>
                <input style={{ ...st.input, marginBottom: 0 }} type="text" placeholder="🔍 Buscar por nombre, DNI o token de retiro..." value={busquedaHistorial} onChange={(e) => setBusquedaHistorial(e.target.value)} />
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button onClick={() => setFiltroEstado('todos')} style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: '800', borderRadius: '20px', border: filtroEstado === 'todos' ? '2px solid #2563eb' : (darkMode ? '2px solid #334155' : '2px solid #e2e8f0'), background: filtroEstado === 'todos' ? '#eff6ff' : (darkMode ? '#1e293b' : '#ffffff'), color: filtroEstado === 'todos' ? '#2563eb' : (darkMode ? '#94a3b8' : '#475569'), cursor: 'pointer', transition: 'all 0.2s' }}>Todas</button>
                <button onClick={() => setFiltroEstado('pendiente')} style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: '800', borderRadius: '20px', border: filtroEstado === 'pendiente' ? '2px solid #2563eb' : (darkMode ? '2px solid #334155' : '2px solid #e2e8f0'), background: filtroEstado === 'pendiente' ? '#eff6ff' : (darkMode ? '#1e293b' : '#ffffff'), color: filtroEstado === 'pendiente' ? '#2563eb' : (darkMode ? '#94a3b8' : '#475569'), cursor: 'pointer', transition: 'all 0.2s' }}>⏳ Pendientes</button>
                <button onClick={() => setFiltroEstado('dispensado')} style={{ padding: '10px 20px', fontSize: '0.85rem', fontWeight: '800', borderRadius: '20px', border: filtroEstado === 'dispensado' ? '2px solid #2563eb' : (darkMode ? '2px solid #334155' : '2px solid #e2e8f0'), background: filtroEstado === 'dispensado' ? '#eff6ff' : (darkMode ? '#1e293b' : '#ffffff'), color: filtroEstado === 'dispensado' ? '#2563eb' : (darkMode ? '#94a3b8' : '#475569'), cursor: 'pointer', transition: 'all 0.2s' }}>🟢 Dispensadas</button>
              </div>
            </div>

            <div style={{ ...st.card, padding: '20px 10px', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed', minWidth: '950px' }}>
                <thead>
                  <tr>
                    <th style={st.histTh}>Paciente</th>
                    <th style={st.histTh}>Medicamentos e Indicaciones</th>
                    <th style={st.histTh}>Fecha Emisión</th>
                    <th style={st.histTh}>Fecha Entrega</th>
                    <th style={{ ...st.histTh, textAlign: 'center' }}>Estado</th>
                    <th style={{ ...st.histTh, textAlign: 'right' }}>Token</th>
                  </tr>
                </thead>
                <tbody>
                  {recetasHistorialFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '50px', textAlign: 'center', color: '#64748b', fontWeight: '700' }}>No se encontraron órdenes médicas emitidas por usted.</td>
                    </tr>
                  ) : (
                    recetasHistorialFiltradas.map(r => (
                      <tr key={r.id} style={{ borderBottom: darkMode ? '1px solid #334155' : '1px solid #f1f5f9', verticalAlign: 'middle' }}>
                        <td style={st.histTd}>
                          <div style={{ fontWeight: '700', color: darkMode ? '#ffffff' : '#0f172a' }}>{r.paciente}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', fontWeight: '500' }}>DNI: {r.dniPaciente}</div>
                        </td>
                        <td style={{ ...st.histTd, color: darkMode ? '#cbd5e1' : '#334155', fontWeight: '600', lineHeight: '1.4' }}>
                          {Array.isArray(r.medicamento) ? (
                            r.medicamento.map((med, i) => (
                              <div key={i} style={{ marginBottom: '4px' }}>
                                • <strong>{med.nombre || med}</strong> {med.posologia ? `— (${med.posologia})` : ''}
                              </div>
                            ))
                          ) : (
                            <div>• <strong>{r.medicamento}</strong></div>
                          )}
                        </td>
                        <td style={st.histTd}>{r.fecha}</td>
                        <td style={{ ...st.histTd, color: r.fechaEntrega ? '#16a34a' : '#64748b', fontWeight: '700' }}>{r.fechaEntrega || '—'}</td>
                        <td style={{ ...st.histTd, textAlign: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 12px', borderRadius: '20px', background: r.estado === 'Pendiente' ? '#fef3c7' : '#dcfce7', color: r.estado === 'Pendiente' ? '#d97706' : '#16a34a', fontWeight: '800', fontSize: '0.72rem', textTransform: 'uppercase' }}>
                            {r.estado}
                          </span>
                        </td>
                        <td style={{ ...st.histTd, textAlign: 'right', color: '#2563eb', fontWeight: '900', fontSize: '1.05rem' }}>{r.token}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA PACIENTES */}
        {vista === 'clinico' && (
          <div style={{ width: '100%' }} className="no-print">
            <div style={{ ...st.card, display: 'flex', gap: '20px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
              <div style={{ flexGrow: 1, minWidth: '280px' }}>
                <label style={st.label}>Consultar Expediente Clínico</label>
                <input style={{ ...st.input, marginBottom: 0 }} placeholder="Ingrese número de DNI del paciente..." value={busquedaDNI} onChange={(e) => setBusquedaDNI(e.target.value)} />
              </div>
              <button onClick={buscarHistorialCompleto} style={st.btnAction}>BUSCAR</button>
              <button 
                onClick={() => setShowModalPaciente(true)} 
                style={st.btnSuccess}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#2563eb'; e.currentTarget.style.color = '#ffffff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#2563eb'; }}
              >
                👤 REGISTRAR PACIENTE
              </button>
            </div>

            {fichaPaciente && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                <div style={{ ...st.card, borderTop: '8px solid #2563eb', paddingBottom: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
                    <div>
                      <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: darkMode ? '#ffffff' : '#0f172a', margin: 0 }}>{fichaPaciente.nombre}</h2>
                      <p style={{ fontSize: '1.1rem', color: darkMode ? '#94a3b8' : '#334155', fontWeight: '700', margin: '6px 0' }}>DNI: <span style={{color: '#2563eb'}}>{fichaPaciente.dni}</span> | {fichaPaciente.email}</p>
                      <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '800' }}> Sede: {fichaPaciente.clinica}</span>
                    </div>
                    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '12px 20px', borderRadius: '12px', minWidth: '240px' }}>
                      <span style={{ color: '#b91c1c', fontWeight: '900', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase' }}>⚠️ Alergias Críticas</span>
                      <strong style={{ color: '#7f1d1d', fontSize: '1.1rem', display: 'block', marginTop: '4px' }}>{fichaPaciente.alergias}</strong>
                    </div>
                  </div>

                  <div style={st.vitalsGrid}>
                    <div style={st.vitalCard}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>💓 PRESION ARTERIAL</span>
                      <strong style={{ fontSize: '1.25rem', color: darkMode ? '#ffffff' : '#0f172a', marginTop: '4px' }}>{fichaPaciente.vitals.presion}</strong>
                    </div>
                    <div style={st.vitalCard}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>🫀 RITMO CARDIACO</span>
                      <strong style={{ fontSize: '1.25rem', color: darkMode ? '#ffffff' : '#0f172a', marginTop: '4px' }}>{fichaPaciente.vitals.pulso}</strong>
                    </div>
                    <div style={st.vitalCard}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>🌡️ TEMPERATURA</span>
                      <strong style={{ fontSize: '1.25rem', color: darkMode ? '#ffffff' : '#0f172a', marginTop: '4px' }}>{fichaPaciente.vitals.temperatura}</strong>
                    </div>
                    <div style={st.vitalCard}>
                      <span style={{ fontSize: '0.75rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase' }}>⚖️ PESO CORPORAL</span>
                      <strong style={{ fontSize: '1.25rem', color: darkMode ? '#ffffff' : '#0f172a', marginTop: '4px' }}>{fichaPaciente.vitals.peso}</strong>
                    </div>
                  </div>

                  {!mostrarEditor && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                      <button onClick={() => setMostrarEditor(true)} style={{ ...st.btnAction, padding: '14px 28px', fontSize: '0.9rem' }}>
                        ✏️ AGREGAR / ACTUALIZAR EXPEDIENTE
                      </button>
                    </div>
                  )}
                </div>

                {mostrarEditor && (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '-15px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                      <div style={st.card}>
                        <label style={st.label}>Añadir Nuevos Diagnósticos (Separados por comas)</label>
                        <input style={st.input} type="text" value={nuevosDiagnosticos} onChange={(e) => setNuevosDiagnosticos(e.target.value)} placeholder="Ej. Insuficiencia Renal, Asma Bronquial" />
                      </div>
                      <div style={st.card}>
                        <label style={st.label}>Anexar Nuevos Antecedentes Médicos</label>
                        <textarea style={{ ...st.input, height: '70px', resize: 'none' }} value={nuevosAntecedentes} onChange={(e) => setNuevosAntecedentes(e.target.value)} placeholder="Escriba cirugías u observaciones históricas a anexar..." />
                        <label style={st.label}>Redactar Nota de Evolución (Consulta de Hoy)</label>
                        <textarea style={{ ...st.input, height: '90px', resize: 'none', border: '2px solid #bfdbfe' }} value={nuevaNotaConsulta} onChange={(e) => setNuevaNotaConsulta(e.target.value)} placeholder="Describa el estado sintomático actual del paciente..." />
                      </div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '15px', marginTop: '-15px' }}>
                      <button onClick={() => setMostrarEditor(false)} style={{ ...st.btnAction, background: '#64748b' }}>Cancelar</button>
                      <button onClick={guardarCambiosExpediente} style={st.btnSuccess}>💾 COMPILAR Y SALVAR CAMBIOS</button>
                    </div>
                  </div>
                )}

                {!mostrarEditor && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                    <div style={st.card}>
                      <h4 style={{ color: '#2563eb', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Diagnósticos Registrados Históricos</h4>
                      {fichaPaciente.diagnosticosLista.length === 0 ? (
                        <div style={{ color: '#475569', fontWeight: '700', fontSize: '0.95rem' }}>Sin diagnósticos críticos registrados.</div>
                      ) : (
                        fichaPaciente.diagnosticosLista.map((d, i) => (
                          <div key={i} style={{ background: darkMode ? '#0f172a' : '#f0f9ff', padding: '14px', borderRadius: '10px', marginBottom: '10px', color: darkMode ? '#ffffff' : '#0c4a6e', fontWeight: '800', border: darkMode ? '1px solid #334155' : '1px solid #bae6fd', fontSize: '0.95rem' }}>• {d}</div>
                        ))
                      )}
                    </div>
                    <div style={st.card}>
                      <h4 style={{ color: '#2563eb', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Ficha de Antecedentes y Evolución</h4>
                      <div style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '18px', borderRadius: '12px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', color: darkMode ? '#cbd5e1' : '#0f172a', lineHeight: '1.5', marginBottom: '15px', fontWeight: '600', whiteSpace: 'pre-line' }}>{fichaPaciente.antecedentesTexto}</div>
                      <div style={{ background: darkMode ? '#020617' : '#eff6ff', padding: '18px', borderRadius: '12px', border: darkMode ? '1px solid #1e3a8a' : '1px solid #bfdbfe' }}>
                        <strong style={{ color: '#2563eb', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>HISTORIAL ACUMULATIVO DE EVOLUCIÓN:</strong>
                        <p style={{ color: darkMode ? '#ffffff' : '#1e3a8a', margin: 0, fontStyle: 'italic', fontWeight: '700', whiteSpace: 'pre-line', fontSize: '0.95rem' }}>{fichaPaciente.notesTexto}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div style={{ ...st.card, padding: '25px 15px' }}>
                  <h4 style={{ color: darkMode ? '#ffffff' : '#0f172a', fontWeight: '900', marginBottom: '20px', fontSize: '1.3rem' }}>Historial de Tratamientos</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead>
                      <tr style={{ borderBottom: darkMode ? '2px solid #334155' : '2px solid #f1f5f9', textAlign: 'left', color: '#334155', fontSize: '0.8rem', fontWeight: '900' }}>
                        <th style={{ padding: '12px 10px', width: '35%' }}>MEDICAMENTOS PRESCRITOS</th>
                        <th style={{ padding: '12px 10px', width: '20%' }}>FECHA EMISIÓN</th>
                        <th style={{ padding: '12px 10px', width: '20%' }}>FECHA ENTREGA</th>
                        <th style={{ padding: '12px 10px', width: '15%' }}>ESTADO</th>
                        <th style={{ padding: '12px 10px', width: '10%', textAlign: 'right' }}>TOKEN</th>
                      </tr>
                    </thead>
                    <tbody>
                      {fichaPaciente.historialRecetas.length === 0 ? (
                        <tr><td colSpan="5" style={{ padding: '20px', textAlign: 'center', color: '#64748b', fontWeight: '700' }}>No hay registros de recetas emitidas para este paciente.</td></tr>
                      ) : (
                        fichaPaciente.historialRecetas.map(receta => (
                          <tr key={receta.id} style={{ borderBottom: darkMode ? '1px solid #334155' : '1px solid #f8fafc', verticalAlign: 'top' }}>
                            <td style={{ padding: '14px 10px', fontSize: '0.88rem', fontWeight: '800', color: darkMode ? '#cbd5e1' : '#1e293b' }}>
                              {Array.isArray(receta.medicamento) ? receta.medicamento.map((m, idx) => <div key={idx}>• {m.nombre || m} <span style={{fontSize:'0.8rem', fontStyle:'italic', color:'#64748b'}}>{m.posologia ? `(${m.posologia})` : ''}</span></div>) : receta.medicamento}
                            </td>
                            <td style={{ padding: '14px 10px', fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{receta.fecha}</td>
                            <td style={{ padding: '14px 10px', fontSize: '0.85rem', color: '#15803d', fontWeight: '700' }}>{receta.fechaEntrega || '—'}</td>
                            <td style={{ padding: '14px 10px' }}>
                              <span style={{ display: 'inline-flex', padding: '4px 8px', borderRadius: '6px', fontSize: '0.7rem', fontWeight: '800', background: receta.estado === 'Pendiente' ? '#fef3c7' : '#dcfce7', color: receta.estado === 'Pendiente' ? '#78350f' : '#14532d' }}>{receta.estado}</span>
                            </td>
                            <td style={{ padding: '14px 10px', textAlign: 'right', color: '#2563eb', fontWeight: '900' }}>{receta.token}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}
          </div>
        )}

      </div>

      {/* MODAL PACIENTES */}
      {showModalPaciente && (
        <div style={st.modalOverlay} className="no-print" onClick={() => setShowModalPaciente(false)}>
          <div style={st.modalContent} onClick={(e) => e.stopPropagation()}>
            <div style={st.modalHeader}>
              <div style={st.modalIconCircle}>🏥</div> 
              <h3 style={st.modalTitle}>Crear Expediente Médico</h3>
              <p style={st.modalSub}>Ingrese la información del paciente para abrir su ficha digital</p>
            </div>
            
            <form onSubmit={manejarGuardarPaciente}>
              <div style={st.modalInputGroup}>
                <label style={st.modalLabel}>Nombre Completo del Paciente</label>
                <input className="saas-input" style={st.modalInput} type="text" placeholder="Dr. Carlos Mendoza" value={nuevoNombrePac} onChange={e => setNuevoNombrePac(e.target.value)} required />
              </div>
              
              <div style={st.modalGrid}>
                <div style={st.modalInputGroup}>
                  <label style={st.modalLabel}>Número de DNI</label>
                  <input className="saas-input" style={st.modalInput} type="text" placeholder="DNI Paciente" value={nuevoDNIPac} onChange={e => setNuevoDNIPac(e.target.value)} required />
                </div>
                <div style={st.modalInputGroup}>
                  <label style={st.modalLabel}>Centro Médico / Sede</label>
                  <input className="saas-input" style={st.modalInput} type="text" placeholder="Clínica Central" value={nuevaClinicaPac} onChange={e => setNuevaClinicaPac(e.target.value)} required />
                </div>
              </div>

              <div style={st.modalInputGroup}>
                <label style={st.modalLabel}>Correo Electrónico Notificable</label>
                <input className="saas-input" style={st.modalInput} type="email" placeholder="paciente@correo.com" value={nuevoCorreoPac} onChange={e => setNuevoCorreoPac(e.target.value)} />
              </div>
              
              <div style={st.modalInputGroup}>
                <label style={{ ...st.modalLabel, color: '#ef4444' }}>Alergias Críticas Conocidas</label>
                <input className="saas-input" style={{ ...st.modalInput, border: darkMode ? '1px solid #ef4444' : '1px solid #fee2e2', background: darkMode ? '#1a1010' : '#fffcfc', color: darkMode ? '#ffffff' : '#0f172a' }} type="text" placeholder="Ej: Penicilina, AINES..." value={nuevasAlergiasPac} onChange={e => setNuevasAlergiasPac(e.target.value)} />
              </div>
              
              <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
                <button type="button" onClick={() => setShowModalPaciente(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#ffffff' : '#475569', fontWeight: '900', cursor: 'pointer', fontSize: '0.92rem' }}>
                  Cancelar
                </button>
                <button type="submit" style={{ ...st.btnAction, flex: 1, padding: '14px', borderRadius: '14px', background: '#2563eb', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.15)', fontSize: '0.92rem' }}>
                  ABRIR FICHA
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL DE FIRMA */}
      {showFirma && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 3000, backdropFilter: 'blur(8px)' }} className="no-print">
          <div style={{ background: darkMode ? '#1e293b' : 'white', padding: '40px', borderRadius: '24px', textAlign: 'center', width: '380px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2563eb' }}>Firma Autorizada</h3>
            <input type="password" style={{ ...st.input, textAlign: 'center', fontSize: '2.5rem', letterSpacing: '12px', marginTop: '15px', color: darkMode ? '#ffffff' : '#0f172a', background: darkMode ? '#0f172a' : '#ffffff' }} value={pin} onChange={e => setPin(e.target.value)} maxLength="4" placeholder="••••" />
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button onClick={() => setShowFirma(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: darkMode ? '#334155' : '#f1f5f9', color: darkMode ? '#ffffff' : '#475569' }}>Cerrar</button>
              <button onClick={handleFirma} style={{ flex: 1, padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '14px' }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DashboardMedico;