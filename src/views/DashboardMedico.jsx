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

  const [busquedaDNI, setBusquedaDNI] = useState('');
  const [fichaPaciente, setFichaPaciente] = useState(null);
  const [pin, setPin] = useState('');
  const [showFirma, setShowFirma] = useState(false);
  const [recetaReciente, setRecetaReciente] = useState(null);

  // Estados para añadir/actualizar información en el expediente
  const [nuevosDiagnosticos, setNuevosDiagnosticos] = useState('');
  const [nuevosAntecedentes, setNuevosAntecedentes] = useState('');
  const [nuevaNotaConsulta, setNuevaNotaConsulta] = useState('');
  const [mostrarEditor, setMostrarEditor] = useState(false);

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

  const recetasHistorialFiltradas = misRecetasFiltradas.filter(r => {
    const query = busquedaHistorial.toLowerCase().trim();
    return (
      r.paciente?.toLowerCase().includes(query) ||
      String(r.dniPaciente).includes(query) ||
      String(r.token).includes(query)
    );
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
        notasTexto: historial?.notas || 'No hay notas importantes registradas.',
        ultimaVisita: historial?.ultimaVisita || 'Primera consulta hoy',
        historialRecetas: ordenesPaciente
      });

      // Inicializamos campos de adición vacíos listos para capturar lo nuevo
      setNuevosDiagnosticos('');
      setNuevosAntecedentes('');
      setNuevaNotaConsulta('');
      setMostrarEditor(false); 
    } else {
      alert("No se encontró ningún paciente registrado con ese número de DNI.");
      setFichaPaciente(null);
    }
  };

  // CORREGIDO: Lógica de acumulación y adición en Firebase sin machacar los registros históricos
  const guardarCambiosExpediente = async () => {
    if (!fichaPaciente) return;
    
    const fechaHoy = new Date().toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
    
    // 1. Procesamos los nuevos diagnósticos ingresados y los sumamos a la lista anterior
    const listaNuevos = nuevosDiagnosticos.split(',').map(d => d.trim()).filter(d => d.length > 0);
    const listaDiagnosticosActualizada = [...fichaPaciente.diagnosticosLista, ...listaNuevos];

    // 2. Concatenamos antecedentes si se agregó información nueva
    let antecedentesActualizados = fichaPaciente.antecedentesTexto;
    if (nuevosAntecedentes.trim()) {
      antecedentesActualizados = antecedentesActualizados === 'Sin antecedentes registrados.' 
        ? nuevosAntecedentes.trim() 
        : `${antecedentesActualizados}\n• ${nuevosAntecedentes.trim()}`;
    }

    // 3. Concatenamos la nueva nota médica con la fecha de la consulta actual para la bitácora de evolución
    let notasActualizadas = fichaPaciente.notasTexto;
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
      
      // Actualizamos el estado visual de la ficha con la acumulación consolidada
      setFichaPaciente({
        ...fichaPaciente,
        diagnosticosLista: listaDiagnosticosActualizada,
        antecedentesTexto: antecedentesActualizados,
        notasTexto: notasActualizadas,
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
    if (medicamentosSeleccionados.some(m => !m.posologia.trim())) return alert("Digite la posología.");

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
      <style>{`
        @media print {
          body, html, #root { background: #ffffff !important; color: #000000 !important; width: 100% !important; margin: 0 !important; padding: 0 !important; }
          .no-print, header, aside, button, form, .top-nav-outer { display: none !important; }
          .print-receta-card { border: 2px dashed #000000 !important; box-shadow: none !important; padding: 40px !important; margin: 0 !important; border-radius: 0 !important; width: 100% !important; }
          .print-token-text { font-size: 3rem !important; color: #000000 !important; }
        }
      `}</style>
      
      {/* NAV SUPERIOR */}
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

      <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* RECIENTE EMISIÓN */}
        {vista === 'nueva' && recetaReciente && (
          <div className="print-receta-card" style={{ background: '#ffffff', padding: '30px 40px', borderRadius: '24px', borderLeft: '8px solid #10b981', marginBottom: '35px', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', display: 'flex', flexDirection: 'column', gap: '20px', width: '100%', boxSizing: 'border-box', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', width: '100%' }}>
              <div>
                <span style={{ fontWeight: '900', color: '#10b981', fontSize: '1.4rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>📋 RECETARIO CLÍNICO DIGITAL — MEDIVAULT</span>
                <div style={{ color: '#0f172a', fontWeight: '800', fontSize: '1.8rem', marginTop: '15px' }}>{recetaReciente.paciente}</div>
                <div style={{ color: '#475569', fontWeight: '700', fontSize: '1rem', marginTop: '5px' }}>DNI: {recetaReciente.dniPaciente} | Sede: {recetaReciente.clinica}</div>
                <div style={{ color: '#2563eb', fontWeight: '900', fontSize: '1.2rem', marginTop: '20px' }}>💊 TRATAMIENTO PRESCRITO:</div>
                <div style={{ marginTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {recetaReciente.medicamentos.map((med, index) => (
                    <div key={index} style={{ color: '#0f172a', fontSize: '1.1rem', fontWeight: '600' }}>
                      • <strong>{med.nombre}</strong> — <span style={{ fontStyle: 'italic', color: '#475569' }}>{med.posologia}</span>
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
              <button onClick={despacharImpresion} style={{ ...st.btnAction, background: '#0f172a', fontWeight: '900', padding: '14px 30px', borderRadius: '10px' }}>🖨️ IMPRIMIR RECETARIO</button>
            </div>
          </div>
        )}

        {/* VISTA NUEVA RECETA */}
        {vista === 'nueva' && (
          <div style={{ maxWidth: '650px', margin: '0 auto', width: '100%' }} className="no-print">
            <div style={st.card}>
              <div style={{ marginBottom: '30px' }}>
                <label style={st.label}>1. IDENTIFICAR PACIENTE</label>
                <input style={{ ...st.input, marginBottom: 0 }} placeholder="Busque por DNI o Nombre..." value={busquedaPac} onChange={e => { setBusquedaPac(e.target.value); setPacienteSel(null); }} />
                {sugerenciasPac.length > 0 && (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '10px', background: 'white', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }}>
                    {sugerenciasPac.map(p => <div key={p.id} onClick={() => { setPacienteSel(p); setBusquedaPac(p.nombre); }} style={{ padding: '15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontWeight: '700', color: '#0f172a' }}>{p.nombre} ({p.dni})</div>)}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '30px' }}>
                <label style={st.label}>2. AGREGAR MEDICAMENTOS A LA RECETA</label>
                <input style={{ ...st.input, marginBottom: 0 }} placeholder="Busque el fármaco a añadir..." value={busquedaMed} onChange={e => setBusquedaMed(e.target.value)} />
                {sugerenciasMed.length > 0 && (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '10px', background: 'white', maxHeight: '200px', overflowY: 'auto' }}>
                    {sugerenciasMed.map(m => (
                      <div key={m.id} onClick={() => agregarMedicamentoALista(m)} style={{ padding: '14px 15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontWeight: '700', color: '#2563eb', display: 'flex', justifyContent: 'space-between', background: '#fdfdfd' }}>
                        <span>{m.nombre}</span> <span style={{ color: '#10b981', fontSize: '0.85rem' }}>➕ AÑADIR</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {medicamentosSeleccionados.length > 0 && (
                <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '14px', border: '1px solid #e2e8f0', marginBottom: '35px' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: '900', color: '#475569', display: 'block', marginBottom: '15px' }}>DOSIFICACIÓN Y POSOLOGÍA:</span>
                  {medicamentosSeleccionados.map((item) => (
                    <div key={item.id} style={{ background: 'white', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', color: '#0f172a' }}>
                        <span>💊 {item.nombre}</span>
                        <button onClick={() => eliminarMedicamentoDeLista(item.id)} style={{ background: 'transparent', border: 'none', color: '#ef4444', fontWeight: '900', cursor: 'pointer' }}>❌</button>
                      </div>
                      <input style={{ ...st.input, marginBottom: 0, padding: '10px 14px', fontSize: '0.9rem', border: '1px solid #cbd5e1' }} type="text" placeholder="Tomar 1 tableta cada 8 horas por 5 días..." value={item.posologia} onChange={(e) => manejarCambioPosologia(item.id, e.target.value)} />
                    </div>
                  ))}
                </div>
              )}

              {alertaAlergia && (
                <div style={{ background: '#fff1f1', border: '2px solid #fca5a5', padding: '18px 24px', borderRadius: '14px', marginBottom: '30px', color: '#991b1b', fontSize: '0.95rem', fontWeight: '800' }}>
                  ⚠️ ALERTA DE ALERGIA DETECTADA: El medicamento choca con la restricción de: "{alertaAlergia.motivo}".
                </div>
              )}

              <button onClick={() => (pacienteSel && medicamentosSeleccionados.length > 0) ? setShowFirma(true) : alert("Complete datos.")} style={{ ...st.btnAction, width: '100%', padding: '20px', borderRadius: '16px', fontSize: '1.1rem' }}>FIRMAR EMISIÓN DE RECETA</button>
            </div>
          </div>
        )}

        {/* VISTA: ARCHIVO DE RECETAS */}
        {vista === 'historial' && (
          <div style={{ width: '100%' }} className="no-print">
            <div style={{ marginBottom: '25px', width: '100%' }}>
              <input style={{ ...st.input, marginBottom: 0 }} type="text" placeholder="🔍 Buscar receta en el archivo por nombre de paciente, DNI o código Token..." value={busquedaHistorial} onChange={(e) => setBusquedaHistorial(e.target.value)} />
            </div>

            <div style={{ ...st.card, padding: '25px 15px' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left', color: '#334155', fontSize: '0.85rem', fontWeight: '900', letterSpacing: '0.5px' }}>
                    <th style={{ padding: '12px 14px', width: '20%' }}>PACIENTE</th>
                    <th style={{ padding: '12px 14px', width: '30%' }}>MEDICAMENTOS E INDICACIONES</th>
                    <th style={{ padding: '12px 14px', width: '16%' }}>FECHA EMISIÓN</th>
                    <th style={{ padding: '12px 14px', width: '16%' }}>FECHA ENTREGA</th>
                    <th style={{ padding: '12px 14px', width: '10%', textAlign: 'center' }}>ESTADO</th>
                    <th style={{ padding: '12px 14px', width: '8%', textAlign: 'right' }}>TOKEN</th>
                  </tr>
                </thead>
                <tbody>
                  {recetasHistorialFiltradas.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={{ padding: '40px', textAlign: 'center', color: '#64748b', fontWeight: '700', fontSize: '1rem' }}>No se encontraron registros en el archivo que coincidan con la búsqueda.</td>
                    </tr>
                  ) : (
                    recetasHistorialFiltradas.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', verticalAlign: 'top' }}>
                        <td style={{ padding: '16px 14px', fontSize: '0.88rem', fontWeight: '700', color: '#0f172a' }}>{r.paciente}</td>
                        <td style={{ padding: '16px 14px', fontSize: '0.88rem', color: '#1e293b', fontWeight: '600' }}>
                          {Array.isArray(r.medicamento) ? (
                            r.medicamento.map((med, i) => (
                              <div key={i} style={{ marginBottom: '6px', lineHeight: '1.3' }}>
                                • <strong>{med.nombre || med}</strong> {med.posologia ? `— (${med.posologia})` : ''}
                              </div>
                            ))
                          ) : (
                            <div>• <strong>{r.medicamento}</strong></div>
                          )}
                        </td>
                        <td style={{ padding: '16px 14px', fontSize: '0.85rem', color: '#334155', fontWeight: '600' }}>{r.fecha}</td>
                        <td style={{ padding: '16px 14px', fontSize: '0.85rem', color: r.fechaEntrega ? '#15803d' : '#475569', fontWeight: '700' }}>{r.fechaEntrega || '—'}</td>
                        <td style={{ padding: '16px 14px', textAlign: 'center' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', padding: '6px 0', borderRadius: '6px', background: r.estado === 'Pendiente' ? '#fef3c7' : '#dcfce7', color: r.estado === 'Pendiente' ? '#78350f' : '#14532d', fontWeight: '900', fontSize: '0.72rem', width: '95px', boxSizing: 'border-box', textTransform: 'uppercase' }}>{r.estado}</span>
                        </td>
                        <td style={{ padding: '16px 14px', textAlign: 'right', color: '#2563eb', fontWeight: '900', fontSize: '1.05rem' }}>{r.token}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VISTA PACIENTES INTERACTIVA CLÍNICA */}
        {vista === 'clinico' && (
          <div style={{ width: '100%' }} className="no-print">
            <div style={{ ...st.card, display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
              <div style={{ flexGrow: 1 }}>
                <label style={st.label}>Consultar Expediente Clínico</label>
                <input style={{ ...st.input, marginBottom: 0 }} placeholder="Ingrese número de DNI del paciente..." value={busquedaDNI} onChange={(e) => setBusquedaDNI(e.target.value)} />
              </div>
              <button onClick={buscarHistorialCompleto} style={st.btnAction}>BUSCAR</button>
              <button onClick={() => setShowModalPaciente(true)} style={st.btnSuccess}>➕ REGISTRAR PACIENTE</button>
            </div>

            {fichaPaciente && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
                
                {/* FICHA INFORMATIVA DEL PACIENTE ACTUAL */}
                <div style={{ ...st.card, borderTop: '8px solid #2563eb', paddingBottom: '30px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '20px', marginBottom: '25px' }}>
                    <div>
                      <h2 style={{ fontSize: '2.4rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>{fichaPaciente.nombre}</h2>
                      <p style={{ fontSize: '1.1rem', color: '#334155', fontWeight: '700', margin: '6px 0' }}>DNI: <span style={{color: '#2563eb'}}>{fichaPaciente.dni}</span> | {fichaPaciente.email}</p>
                      <span style={{ display: 'inline-block', background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', fontWeight: '800' }}> Sede: {fichaPaciente.clinica}</span>
                    </div>
                    <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', padding: '12px 20px', borderRadius: '12px', minWidth: '240px' }}>
                      <span style={{ color: '#b91c1c', fontWeight: '900', fontSize: '0.8rem', display: 'block', textTransform: 'uppercase' }}>⚠️ Alergias Críticas</span>
                      <strong style={{ color: '#7f1d1d', fontSize: '1.1rem', display: 'block', marginTop: '4px' }}>{fichaPaciente.alergias}</strong>
                    </div>
                  </div>

                  {/* CORREGIDO: Botón interactivo relocalizado exactamente abajito de las alertas críticas */}
                  {!mostrarEditor && (
                    <div style={{ display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid #f1f5f9', paddingTop: '20px' }}>
                      <button onClick={() => setMostrarEditor(true)} style={{ ...st.btnAction, padding: '14px 28px', fontSize: '0.9rem' }}>
                        ✏️ AGREGAR / ACTUALIZAR EXPEDIENTE
                      </button>
                    </div>
                  )}
                </div>

                {/* FORMULARIO DE ADICIÓN/EVOLUCIÓN (Se despliega dinámicamente) */}
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

                {/* HISTORIAL COMPLETO DE EXPEDIENTE (VISTA LECTURA LIMPIA POR DEFECTO) */}
                {!mostrarEditor && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '30px' }}>
                    <div style={st.card}>
                      <h4 style={{ color: '#2563eb', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Diagnósticos Registrados Históricos</h4>
                      {fichaPaciente.diagnosticosLista.length === 0 ? (
                        <div style={{ color: '#475569', fontWeight: '700', fontSize: '0.95rem' }}>Sin diagnósticos críticos registrados.</div>
                      ) : (
                        fichaPaciente.diagnosticosLista.map((d, i) => (
                          <div key={i} style={{ background: '#f0f9ff', padding: '14px', borderRadius: '10px', marginBottom: '10px', color: '#0c4a6e', fontWeight: '800', border: '1px solid #bae6fd', fontSize: '0.95rem' }}>• {d}</div>
                        ))
                      )}
                    </div>
                    <div style={st.card}>
                      <h4 style={{ color: '#2563eb', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', fontSize: '0.85rem' }}>Ficha de Antecedentes y Evolución</h4>
                      <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '12px', border: '1px solid #e2e8f0', color: '#0f172a', lineHeight: '1.5', marginBottom: '15px', fontWeight: '600', whiteSpace: 'pre-line' }}>{fichaPaciente.antecedentesTexto}</div>
                      <div style={{ background: '#eff6ff', padding: '18px', borderRadius: '12px', border: '1px solid #bfdbfe' }}>
                        <strong style={{ color: '#1e40af', fontSize: '0.8rem', display: 'block', marginBottom: '8px' }}>HISTORIAL ACUMULATIVO DE EVOLUCIÓN:</strong>
                        <p style={{ color: '#1e3a8a', margin: 0, fontStyle: 'italic', fontWeight: '700', whiteSpace: 'pre-line', fontSize: '0.95rem' }}>{fichaPaciente.notasTexto}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* HISTORIAL DE RECETAS EMITIDAS A SU NOMBRE EN MEDIVAULT */}
                <div style={{ ...st.card, padding: '25px 15px' }}>
                  <h4 style={{ color: '#0f172a', fontWeight: '900', marginBottom: '20px', fontSize: '1.3rem' }}>Historial de Tratamientos Farmacéuticos</h4>
                  <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #f1f5f9', textAlign: 'left', color: '#334155', fontSize: '0.8rem', fontWeight: '900' }}>
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
                          <tr key={receta.id} style={{ borderBottom: '1px solid #f8fafc', verticalAlign: 'top' }}>
                            <td style={{ padding: '14px 10px', fontSize: '0.88rem', fontWeight: '800', color: '#1e293b' }}>
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
        <div style={st.modalOverlay} className="no-print">
          <div style={st.modalContent}>
              <div style={st.modalHeader}>
                <div style={st.modalIconCircle}>👤</div> <h3 style={st.modalTitle}>Nuevo Expediente</h3>
              </div>
              <form onSubmit={manejarGuardarPaciente}>
                <div style={st.modalInputGroup}><label style={st.modalLabelIcon}>Nombre Paciente</label><input style={st.modalInput} type="text" value={nuevoNombrePac} onChange={e => setNuevoNombrePac(e.target.value)} required /></div>
                <div style={st.modalInputGroup}><label style={st.modalLabelIcon}>DNI</label><input style={st.modalInput} type="text" value={nuevoDNIPac} onChange={e => setNuevoDNIPac(e.target.value)} required /></div>
                <div style={st.modalInputGroup}><label style={st.modalLabelIcon}>Correo</label><input style={st.modalInput} type="email" value={nuevoCorreoPac} onChange={e => setNuevoCorreoPac(e.target.value)} /></div>
                <div style={st.modalInputGroup}><label style={st.modalLabelIcon}>Centro Médico</label><input style={st.modalInput} type="text" value={nuevaClinicaPac} onChange={e => setNuevaClinicaPac(e.target.value)} required /></div>
                <div style={st.modalInputGroup}><label style={st.modalLabelIcon}>Alergias</label><input style={{ ...st.modalInput, border: '2px solid #fee2e2' }} type="text" value={nuevasAlergiasPac} onChange={e => setNuevasAlergiasPac(e.target.value)} /></div>
                <div style={{ display: 'flex', gap: '15px', marginTop: '35px' }}>
                  <button type="button" onClick={() => setShowModalPaciente(false)} style={{ flex: 1, padding: '14px', borderRadius: '14px', border: 'none', background: '#f1f5f9', fontWeight: '900' }}>Cancelar</button>
                  <button type="submit" style={{ ...st.btnSuccess, flex: 1, padding: '16px', borderRadius: '14px' }}>REGISTRAR EXPEDIENTE</button>
                </div>
              </form>
          </div>
        </div>
      )}

      {/* MODAL DE FIRMA */}
      {showFirma && (
        <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(8px)' }} className="no-print">
          <div style={{ background: 'white', padding: '40px', borderRadius: '24px', textAlign: 'center', width: '380px' }}>
            <h3 style={{ fontSize: '1.6rem', fontWeight: '900', color: '#2563eb' }}>Firma Autorizada</h3>
            <input type="password" style={{ ...st.input, textAlign: 'center', fontSize: '2.5rem', letterSpacing: '12px' }} value={pin} onChange={e => setPin(e.target.value)} maxLength="4" placeholder="••••" />
            <div style={{ display: 'flex', gap: '15px', marginTop: '30px' }}>
              <button onClick={() => setShowFirma(false)} style={{ flex: 1, padding: '14px', borderRadius: '12px', border: 'none', background: '#f1f5f9' }}>Cerrar</button>
              <button onClick={handleFirma} style={{ flex: 1, padding: '14px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '14px' }}>Confirmar</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

export default DashboardMedico;