import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc } from 'firebase/firestore';

function DashboardMedico({ user, onLogout, inventario, recetasEmitidas, pacientesDB, historialesDB }) {
  const [vista, setVista] = useState('nueva');
  const [busquedaPac, setBusquedaPac] = useState('');
  const [pacienteSel, setPacienteSel] = useState(null);
  const [busquedaMed, setBusquedaMed] = useState('');
  const [medicamentoSel, setMedicamentoSel] = useState(null);
  const [busquedaDNI, setBusquedaDNI] = useState('');
  const [fichaPaciente, setFichaPaciente] = useState(null);
  const [pin, setPin] = useState('');
  const [showFirma, setShowFirma] = useState(false);
  const [recetaReciente, setRecetaReciente] = useState(null);

  const sugerenciasPac = busquedaPac.length > 0 && !pacienteSel
    ? pacientesDB.filter(p => p.nombre?.toLowerCase().includes(busquedaPac.toLowerCase()) || String(p.dni).includes(busquedaPac))
    : [];

  const sugerenciasMed = busquedaMed.length > 0 && !medicamentoSel
    ? inventario.filter(m => m.nombre?.toLowerCase().includes(busquedaMed.toLowerCase()))
    : [];

  const buscarHistorial = () => {
    const d = busquedaDNI.trim();
    const f = historialesDB.find(h => String(h.dniPaciente) === d);
    const p = pacientesDB.find(pac => String(pac.dni) === d);
    if (f && p) setFichaPaciente({ ...f, nombre: p.nombre });
    else alert("No se encontró el historial clínico.");
  };

  const handleFirma = async () => {
    if (pin !== "1234") return alert("PIN Incorrecto");
    const token = Math.floor(100000 + Math.random() * 900000).toString();
    const fechaHoy = new Date().toLocaleDateString('es-ES', {
      day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit'
    });

    try {
      await addDoc(collection(db, "recetas"), {
        paciente: pacienteSel.nombre,
        dniPaciente: pacienteSel.dni,
        medicamento: medicamentoSel.nombre,
        token,
        fecha: fechaHoy,
        estado: 'Pendiente',
        medico: user?.nombre || "Dr. García"
      });
      setRecetaReciente({ token, paciente: pacienteSel.nombre, email: pacienteSel.email });
      setPacienteSel(null); setBusquedaPac(''); setMedicamentoSel(null); setBusquedaMed('');
      setPin(''); setShowFirma(false);
    } catch (err) { console.error(err); }
  };

  const st = {
    sidebar: { width: '280px', background: '#ffffff', borderRight: '1px solid #e2e8f0', position: 'fixed', height: '100vh', padding: '40px 24px', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' },
    main: { marginLeft: '280px', background: '#f8fafc', minHeight: '100vh', padding: '60px', width: 'calc(100% - 280px)', boxSizing: 'border-box' },
    card: { background: '#ffffff', borderRadius: '24px', padding: '40px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px rgba(0,0,0,0.02)' },
    btnNav: (act) => ({ width: '100%', padding: '16px', border: 'none', borderRadius: '14px', background: act ? '#eff6ff' : 'transparent', color: act ? '#2563eb' : '#64748b', textAlign: 'left', fontWeight: '800', cursor: 'pointer', marginBottom: '10px', transition: '0.2s' }),
    input: { width: '100%', padding: '16px', border: '2px solid #f1f5f9', background: '#ffffff', borderRadius: '12px', fontSize: '1rem', color: '#0f172a', outline: 'none', boxSizing: 'border-box' },
    label: { fontSize: '0.85rem', fontWeight: '900', color: '#475569', display: 'block', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.5px' }
  };

  return (
    <div style={{ display: 'flex', fontFamily: '"Inter", sans-serif', color: '#0f172a' }}>
      <aside style={st.sidebar}>
        <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#2563eb', marginBottom: '50px', letterSpacing: '-2px' }}>MediVault</div>
        <div style={{ flexGrow: 1 }}>
          <button onClick={() => setVista('nueva')} style={st.btnNav(vista === 'nueva')}>➕ Nueva Receta</button>
          <button onClick={() => setVista('historial')} style={st.btnNav(vista === 'historial')}>📋 Mis Recetas</button>
          <button onClick={() => setVista('clinico')} style={st.btnNav(vista === 'clinico')}>📁 Historial Clínico</button>
        </div>
        <button onClick={onLogout} style={{ padding: '16px', background: '#fff1f2', color: '#e11d48', border: '1px solid #fecdd3', borderRadius: '12px', fontWeight: '900', cursor: 'pointer' }}>Cerrar Sesión</button>
      </aside>

      <main style={st.main}>
        <header style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h1 style={{ fontSize: '3.5rem', fontWeight: '900', color: '#2563eb', margin: 0, lineHeight: '1.1' }}>
            {vista === 'nueva' ? 'Prescripción' : vista === 'historial' ? 'Archivo de Recetas' : 'Historial Clínico'}
          </h1>
          <p style={{ color: '#64748b', fontWeight: '700', fontSize: '1.2rem', marginTop: '10px' }}>Sesión activa: {user?.nombre || "Dr. García"}</p>
        </header>

        {recetaReciente && (
          <div style={{ background: '#ffffff', padding: '25px 40px', borderRadius: '20px', borderLeft: '8px solid #10b981', marginBottom: '40px', boxShadow: '0 10px 15px rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div><span style={{ fontWeight: '900', color: '#0f172a', fontSize: '1.2rem' }}>✅ Receta Generada</span><br /><span style={{ color: '#475569' }}>Paciente: {recetaReciente.paciente}</span></div>
            <div style={{ textAlign: 'right' }}><span style={{ color: '#2563eb', fontSize: '2rem', fontWeight: '900' }}>{recetaReciente.token}</span></div>
          </div>
        )}

        {vista === 'nueva' && (
          <div style={{ maxWidth: '650px', margin: '0 auto' }}>
            <div style={st.card}>
              <div style={{ marginBottom: '30px' }}>
                <label style={st.label}>1. Identificar Paciente</label>
                <input style={st.input} placeholder="DNI o Nombre..." value={busquedaPac} onChange={e => { setBusquedaPac(e.target.value); setPacienteSel(null); }} />
                {sugerenciasPac.length > 0 && (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '10px', background: 'white', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }}>
                    {sugerenciasPac.map(p => <div key={p.id} onClick={() => { setPacienteSel(p); setBusquedaPac(p.nombre); }} style={{ padding: '15px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9', fontWeight: '700', color: '#0f172a' }}>{p.nombre} ({p.dni})</div>)}
                  </div>
                )}
              </div>
              <div style={{ marginBottom: '40px' }}>
                <label style={st.label}>2. Medicamento</label>
                <input style={st.input} placeholder="Fármaco..." value={busquedaMed} onChange={e => { setBusquedaMed(e.target.value); setMedicamentoSel(null); }} />
                {sugerenciasMed.length > 0 && (
                  <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', marginTop: '10px', background: 'white', boxShadow: '0 10px 15px rgba(0,0,0,0.05)' }}>
                    {sugerenciasMed.map(m => <div key={m.id} onClick={() => { setMedicamentoSel(m); setBusquedaMed(m.nombre); }} style={{ padding: '15px', cursor: 'pointer', fontWeight: '700', color: '#0f172a' }}>{m.nombre}</div>)}
                  </div>
                )}
              </div>
              <button onClick={() => (pacienteSel && medicamentoSel) ? setShowFirma(true) : alert("Complete los datos")} style={{ width: '100%', padding: '20px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '16px', fontWeight: '900', fontSize: '1.2rem', cursor: 'pointer', boxShadow: '0 10px 20px rgba(37, 99, 235, 0.2)' }}>FIRMAR PRESCRIPCIÓN</button>
            </div>
          </div>
        )}

        {vista === 'historial' && (
          <div style={st.card}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '3px solid #f1f5f9', textAlign: 'left', color: '#475569', fontSize: '0.9rem' }}>
                  <th style={{ padding: '20px' }}>PACIENTE</th>
                  <th style={{ padding: '20px' }}>MEDICAMENTO</th>
                  <th style={{ padding: '20px' }}>FECHA</th>
                  <th style={{ padding: '20px' }}>ESTADO</th>
                  <th style={{ padding: '20px', textAlign: 'right' }}>CÓDIGO</th>
                </tr>
              </thead>
              <tbody>
                {recetasEmitidas.map(r => (
                  <tr key={r.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '22px 20px', fontWeight: '800', color: '#0f172a' }}>{r.paciente}</td>
                    <td style={{ padding: '22px 20px', color: '#334155', fontWeight: '600' }}>{r.medicamento}</td>
                    <td style={{ padding: '22px 20px', color: '#64748b', fontSize: '0.9rem' }}>{r.fecha}</td>
                    <td style={{ padding: '22px 20px' }}><span style={{ padding: '6px 12px', borderRadius: '8px', background: '#eff6ff', color: '#2563eb', fontWeight: '900', fontSize: '0.8rem' }}>{r.estado}</span></td>
                    <td style={{ padding: '22px 20px', textAlign: 'right', color: '#2563eb', fontWeight: '900', fontSize: '1.2rem' }}>{r.token}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {vista === 'clinico' && (
          <div style={{ maxWidth: '900px', margin: '0 auto' }}>
            <div style={{ ...st.card, marginBottom: '40px', display: 'flex', gap: '20px', alignItems: 'flex-end' }}>
              <div style={{ flexGrow: 1 }}>
                <label style={st.label}>Consulta de Historial por DNI</label>
                <input style={st.input} placeholder="Ingrese número de identificación..." value={busquedaDNI} onChange={(e) => setBusquedaDNI(e.target.value)} />
              </div>
              <button onClick={buscarHistorial} style={{ background: '#2563eb', color: 'white', border: 'none', padding: '16px 40px', borderRadius: '12px', fontWeight: '900', cursor: 'pointer', height: '56px' }}>BUSCAR</button>
            </div>
            {fichaPaciente && (
              <div style={{ ...st.card, borderTop: '8px solid #2563eb' }}>
                <div style={{ textAlign: 'center', marginBottom: '45px', borderBottom: '2px solid #f1f5f9', paddingBottom: '25px' }}>
                  <h2 style={{ fontSize: '2.8rem', fontWeight: '900', color: '#0f172a', margin: 0 }}>{fichaPaciente.nombre}</h2>
                  <p style={{ fontSize: '1.3rem', color: '#2563eb', fontWeight: '900', marginTop: '5px' }}>ID: {fichaPaciente.dniPaciente}</p>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '50px' }}>
                  <div>
                    <h4 style={{ color: '#2563eb', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Diagnósticos Activos</h4>
                    {fichaPaciente.diagnosticos?.map((d, i) => (
                      <div key={i} style={{ background: '#f0f9ff', padding: '15px', borderRadius: '12px', marginBottom: '10px', color: '#0c4a6e', fontWeight: '800', border: '1px solid #bae6fd' }}>• {d}</div>
                    ))}
                  </div>
                  <div>
                    <h4 style={{ color: '#2563eb', fontWeight: '900', marginBottom: '20px', textTransform: 'uppercase', fontSize: '0.9rem' }}>Notas y Antecedentes</h4>
                    <div style={{ background: 'white', padding: '25px', borderRadius: '16px', border: '1px solid #e2e8f0', color: '#1e293b', lineHeight: '1.7', marginBottom: '25px', fontWeight: '500' }}>{fichaPaciente.antecedentes}</div>
                    <div style={{ background: '#f8fafc', padding: '25px', borderRadius: '20px', border: '1px solid #e2e8f0' }}>
                      <strong style={{ color: '#475569', fontSize: '0.9rem', display: 'block', marginBottom: '10px' }}>ÚLTIMA NOTA CLÍNICA:</strong>
                      <p style={{ color: '#0f172a', margin: 0, fontStyle: 'italic', fontWeight: '600' }}>"{fichaPaciente.notas || fichaPaciente.notes}"</p>
                      <small style={{ color: '#64748b', fontWeight: 'bold', display: 'block', marginTop: '15px' }}>Actualizado: {fichaPaciente.ultimaVisita}</small>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {showFirma && (
          <div style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100, backdropFilter: 'blur(10px)' }}>
            <div style={{ background: 'white', padding: '50px', borderRadius: '30px', textAlign: 'center', width: '400px', boxShadow: '0 25px 50px rgba(0,0,0,0.2)' }}>
              <h3 style={{ fontSize: '1.8rem', fontWeight: '900', color: '#2563eb', marginBottom: '10px' }}>Firma Autorizada</h3>
              <p style={{ color: '#475569', marginBottom: '35px', fontWeight: '700' }}>PIN de 4 dígitos</p>
              <input type="password" style={{ ...st.input, textAlign: 'center', fontSize: '3rem', letterSpacing: '15px', padding: '20px' }} value={pin} onChange={e => setPin(e.target.value)} maxLength="4" placeholder="••••" />
              <div style={{ display: 'flex', gap: '20px', marginTop: '40px' }}>
                <button onClick={() => setShowFirma(false)} style={{ flex: 1, padding: '16px', borderRadius: '14px', border: 'none', background: '#f1f5f9', fontWeight: '800', cursor: 'pointer', color: '#64748b' }}>Cerrar</button>
                <button onClick={handleFirma} style={{ flex: 1, padding: '16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '900', cursor: 'pointer' }}>Confirmar</button>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardMedico;