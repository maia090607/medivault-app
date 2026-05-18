import React, { useState, useEffect } from 'react';

function Landing({ alIniciar, alRegistrar, recetasEmitidas = [], inventario = [] }) {
  const [hoverFeature, setHoverFeature] = useState(null);
  const [showLogin, setShowLogin] = useState(false);
  const [loginStep, setLoginStep] = useState('seleccion'); 
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [animarBarras, setAnimarBarras] = useState(false);
  const [faqAbierta, setFaqAbierta] = useState(null);

  // MODO OSCURO
  const [darkMode, setDarkMode] = useState(false);

  // ESTADOS FORMULARIOS
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [logEmail, setLogEmail] = useState('');
  const [logPassword, setLogPassword] = useState('');

  // VISIBILIDAD CONTRASEÑAS
  const [verLogPassword, setVerLogPassword] = useState(false);
  const [verRegPassword, setVerRegPassword] = useState(false);

  useEffect(() => {
    setTimeout(() => setAnimarBarras(true), 800);
  }, []);

  const esEmailValido = (correo) => {
    if (!correo) return null;
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(correo);
  };

  const totalDespachados = recetasEmitidas.filter(r => r.estado === 'Entregado' || r.estado === 'Dispensado').length + 1259;
  const ordenesActivas = recetasEmitidas.filter(r => r.estado === 'Pendiente').length + 52;
  const stockGlobalSurtido = inventario.reduce((acc, item) => acc + (parseInt(item.stock, 10) || 0), 0) + 9046;

  const caracteristicas = [
    { id: 'historial', icono: '📂', titulo: 'Historial Clínico Unificado', descripcion: 'Acceso centralizado e inmediato a los expedientes médicos de los pacientes en tiempo real.' },
    { id: 'cripto', icono: '🔐', titulo: 'Fórmulas Criptográficas', descripcion: 'Validación automatizada mediante tokens de seguridad para evitar duplicidad de recetas.' },
    { id: 'stock', icono: '📊', titulo: 'Control Inteligente de Stock', descripcion: 'Monitoreo dinámico del inventario farmacéutico con alertas tempranas de caducidad.' },
    { id: 'alergias', icono: '🛡️', titulo: 'Seguridad Preventiva', descripcion: 'Alertas inmediatas ante interacciones medicamentosas adversas antes de emitir la orden.' }
  ];

  const metricasBI = [
    { nombre: 'Amoxicilina 500mg', porcentaje: 85, color: '#2563eb' },
    { nombre: 'Acetaminofén Genérico', porcentaje: 65, color: '#3b82f6' },
    { nombre: 'Losartán Potásico', porcentaje: 40, color: '#60a5fa' }
  ];

  const faqs = [
    { id: 1, pregunta: '¿Cómo se garantiza la seguridad de los expedientes médicos?', respuesta: 'MediVault utiliza las reglas de seguridad avanzadas de Firebase Firestore combinadas con filtros de autenticación del lado del cliente, asegurando que solo el personal médico y farmacéutico con roles validados pueda consultar o alterar información.' },
    { id: 2, pregunta: '¿Qué sucede si una receta digital ya fue dispensada?', respuesta: 'El sistema actualiza de forma instantánea el estado de la receta en la base de datos a "Dispensado". Si otra terminal intenta procesar el mismo token criptográfico, el sistema bloqueará la orden y emitirá una alerta de duplicidad.' },
    { id: 3, pregunta: '¿Cómo funcionan las alertas preventivas de alergias?', respuesta: 'Al momento en que el especialista redacta la orden médica, el sistema cruza los compuestos activos del fármaco seleccionado con la lista de alergias e historial del paciente registrado en Firestore, gatillando un bloqueo visual si detecta riesgo.' }
  ];

  const s = {
    container: { minHeight: '100vh', fontFamily: '"Inter", sans-serif', backgroundColor: darkMode ? '#0f172a' : '#ffffff', color: darkMode ? '#f1f5f9' : '#1e293b', overflowX: 'hidden', transition: 'background-color 0.3s ease, color 0.3s ease' },
    nav: { padding: '0 60px', height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: 0, width: '100%', background: darkMode ? 'rgba(15,23,42,0.95)' : 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', zIndex: 100, boxSizing: 'border-box', borderBottom: darkMode ? '1px solid #1e293b' : '1px solid #f1f5f9' },
    heroSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '180px 20px 80px', textAlign: 'center', background: darkMode ? 'radial-gradient(circle at 50% 0%, #1e3a8a 0%, #0f172a 60%)' : 'radial-gradient(circle at 50% 0%, #eff6ff 0%, #ffffff 60%)', boxSizing: 'border-box' },
    title: { fontSize: '5rem', fontWeight: '950', color: darkMode ? '#ffffff' : '#0f172a', margin: '0 auto 30px', lineHeight: '1.1', letterSpacing: '-4px', maxWidth: '900px' },
    btnMain: { padding: '18px 42px', background: '#2563eb', color: '#ffffff', borderRadius: '14px', fontWeight: '700', border: 'none', cursor: 'pointer', transition: '0.3s ease', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)' },
    
    loginOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.6)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000, animation: 'fadeIn 0.3s' },
    loginCard: { background: darkMode ? '#1e293b' : '#ffffff', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', padding: '45px', borderRadius: '36px', width: '480px', boxShadow: '0 30px 60px -15px rgba(0,0,0,0.3)', boxSizing: 'border-box', textAlign: 'center', position: 'relative', animation: 'slideUp 0.4s' },
    cerrarModalBtn: { position: 'absolute', top: '25px', right: '25px', background: darkMode ? '#334155' : '#f1f5f9', border: 'none', borderRadius: '50%', width: '36px', height: '36px', cursor: 'pointer', color: darkMode ? '#cbd5e1' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' },
    modalTitle: { fontSize: '2.2rem', fontWeight: '950', color: darkMode ? '#ffffff' : '#0f172a', marginBottom: '15px', lineHeight: '1.25', letterSpacing: '-1.5px', paddingRight: '20px' },
    modalSub: { color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600', marginBottom: '35px', fontSize: '1.05rem' },
    selectorBtn: { width: '100%', padding: '20px', marginBottom: '15px', borderRadius: '20px', border: darkMode ? '2px solid #334155' : '2px solid #f1f5f9', background: darkMode ? '#1e293b' : '#ffffff', color: darkMode ? '#ffffff' : '#0f172a', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', transition: '0.2s ease' },
    inputBase: (valido) => ({ width: '100%', padding: '14px 16px', borderRadius: '14px', fontSize: '1rem', outline: 'none', background: darkMode ? '#0f172a' : '#ffffff', color: darkMode ? '#ffffff' : '#0f172a', boxSizing: 'border-box', marginBottom: '20px', transition: 'all 0.3s ease', border: valido === null ? (darkMode ? '2px solid #334155' : '2px solid #e2e8f0') : valido ? '2px solid #10b981' : '2px solid #ef4444' }),
    passwordWrapper: { position: 'relative', width: '100%' },
    ojoBtn: { position: 'absolute', right: '16px', top: '15px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.2rem', color: '#64748b', outline: 'none' },
    
    statsSection: { maxWidth: '1100px', margin: '0 auto', padding: '20px 20px 40px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: darkMode ? '#1e293b' : '#f8fafc', padding: '50px 20px', borderRadius: '40px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0' },
    statBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: darkMode ? '1px solid #334155' : '1px solid #cbd5e1', justifyContent: 'center' },
    statNumber: { fontSize: '4.5rem', fontWeight: '950', color: '#2563eb', letterSpacing: '-3px', lineHeight: '1' },
    statLabel: { fontSize: '0.85rem', fontWeight: '800', color: darkMode ? '#94a3b8' : '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '15px', textAlign: 'center' },
    
    featuresSection: { padding: '80px 60px 40px', maxWidth: '1100px', margin: '0 auto', textAlign: 'center' },
    featuresGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '25px', marginTop: '50px' },
    featureCard: (isHovered) => ({ padding: '40px', borderRadius: '28px', background: darkMode ? '#1e293b' : '#ffffff', border: isHovered ? '2px solid #2563eb' : (darkMode ? '2px solid #334155' : '2px solid #f1f5f9'), boxShadow: isHovered ? '0 20px 40px -15px rgba(37, 99, 235, 0.2)' : '0 4px 20px rgba(0,0,0,0.01)', textAlign: 'left', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }),
    featureIcon: { fontSize: '2rem', background: darkMode ? '#0f172a' : '#eff6ff', width: '56px', height: '56px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '25px', color: '#2563eb' },

    analyticsSection: { padding: '100px 60px', background: darkMode ? '#020617' : '#0f172a', color: '#ffffff' },
    analyticsContainer: { maxWidth: '1100px', margin: '0 auto', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center' },
    barWrapper: { marginBottom: '30px' },
    barBackground: { height: '12px', background: 'rgba(255,255,255,0.1)', borderRadius: '10px', overflow: 'hidden', marginTop: '10px' },
    barFill: (ancho, color) => ({ height: '100%', width: animarBarras ? `${ancho}%` : '0%', background: color, transition: 'width 1.5s cubic-bezier(0.65, 0, 0.35, 1)', borderRadius: '10px' }),

    faqSection: { padding: '100px 60px 40px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' },
    faqItem: { background: darkMode ? '#1e293b' : '#f8fafc', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', borderRadius: '20px', padding: '24px', marginBottom: '15px', textAlign: 'left', cursor: 'pointer', transition: 'all 0.2s ease' },
    faqHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: '800', fontSize: '1.1rem', color: darkMode ? '#ffffff' : '#0f172a' },
    faqBody: (isOpen) => ({ marginTop: isOpen ? '16px' : '0px', color: darkMode ? '#cbd5e1' : '#475569', fontSize: '0.98rem', lineHeight: '1.6', maxHeight: isOpen ? '200px' : '0px', overflow: 'hidden', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', opacity: isOpen ? 1 : 0 }),

    roleSection: { padding: '60px 60px 120px', maxWidth: '1100px', margin: '0 auto' },
    roleGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '35px', marginTop: '50px' },
    roleCard: { padding: '50px 40px', borderRadius: '32px', background: darkMode ? '#1e293b' : '#ffffff', border: darkMode ? '2px solid #334155' : '2px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', textAlign: 'left', boxSizing: 'border-box' },
    
    // CORREGIDO: Sintaxis limpia usando estructura condicional correcta para evitar errores de parseo (image_6d142e)
    roleIcon: { fontSize: '2.5rem', background: darkMode ? '#0f172a' : '#eff6ff', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', color: '#2563eb' },

    themeToggleBtn: { position: 'fixed', bottom: '30px', right: '30px', width: '60px', height: '60px', borderRadius: '50%', background: '#2563eb', color: '#ffffff', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.6rem', boxShadow: '0 10px 25px rgba(37, 99, 235, 0.4)', zIndex: 5000, transition: 'transform 0.2s' },

    footerContainer: { padding: '60px 20px 40px', borderTop: darkMode ? '1px solid #334155' : '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' },
    statusCintillo: { display: 'flex', alignItems: 'center', gap: '10px', background: darkMode ? '#1e293b' : '#f1f5f9', padding: '8px 16px', borderRadius: '30px', fontSize: '0.85rem', fontWeight: '700', color: darkMode ? '#cbd5e1' : '#475569' },
    statusDotWrapper: { position: 'relative', display: 'inline-block', width: '10px', height: '10px' },
    statusDot: { width: '10px', height: '10px', background: '#10b981', borderRadius: '50%' },
    statusPulse: { position: 'absolute', top: 0, left: 0, width: '10px', height: '10px', background: '#10b981', borderRadius: '50%', animation: 'pulseHeartbeat 1.8s infinite ease-in-out', opacity: 0.6 }
  };

  const seleccionarRol = (rol) => { setRolSeleccionado(rol); setLoginStep('formulario'); };
  const cerrarYLimpiarModal = () => {
    setShowLogin(false);
    setRegNombre(''); setRegEmail(''); setRegPassword('');
    setLogEmail(''); setLogPassword('');
    setVerLogPassword(false); setVerRegPassword(false); setCargando(false);
  };

  const manejarSubmitLogin = async (e) => {
    e.preventDefault();
    setCargando(true);
    await alIniciar({ email: logEmail.trim(), password: logPassword.trim(), rol: rolSeleccionado });
    setCargando(false);
  };

  const manejarSubmitRegistro = async (e) => {
    e.preventDefault();
    setCargando(true);
    const reg = await alRegistrar({ nombre: regNombre.trim(), email: regEmail.trim(), password: regPassword.trim(), rol: rolSeleccionado });
    setCargando(false);
    if (reg) { setLogEmail(regEmail.trim()); setLoginStep('formulario'); }
  };

  const alternarFaq = (id) => { setFaqAbierta(faqAbierta === id ? null : id); };

  return (
    <div style={s.container}>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(40px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes pulseHeartbeat { 0% { transform: scale(1); opacity: 0.6; } 100% { transform: scale(3.2); opacity: 0; } }
      `}</style>

      {/* BOTÓN FLOTANTE DE MODO OSCURO */}
      <button 
        style={s.themeToggleBtn} 
        onClick={() => setDarkMode(!darkMode)}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
      >
        {darkMode ? '☀️' : '🌙'}
      </button>

      {showLogin && (
        <div style={s.loginOverlay} onClick={cerrarYLimpiarModal}>
          <div style={s.loginCard} onClick={(e) => e.stopPropagation()}>
            <button style={s.cerrarModalBtn} onClick={cerrarYLimpiarModal}>✕</button>
            
            {loginStep === 'seleccion' && (
              <div>
                <h3 style={s.modalTitle}>¿Cómo desea ingresar a MediVault?</h3>
                <p style={s.modalSub}>Seleccione su rol operativo</p>
                <button style={s.selectorBtn} onClick={() => seleccionarRol('medico')} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.borderColor = darkMode ? '#334155' : '#f1f5f9'}>
                  <span style={{ fontSize: '2.5rem' }}>🩺</span>
                  <div style={{ textAlign: 'left' }}><div style={{ fontWeight: '900', fontSize: '1.1rem' }}>Soy Médico</div><div style={{ fontSize: '0.85rem', color: '#64748b' }}>Especialista autorizado</div></div>
                </button>
                <button style={s.selectorBtn} onClick={() => seleccionarRol('farmacia')} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.borderColor = darkMode ? '#334155' : '#f1f5f9'}>
                  <span style={{ fontSize: '2.5rem' }}>💊</span>
                  <div style={{ textAlign: 'left' }}><div style={{ fontWeight: '900', fontSize: '1.1rem' }}>Soy Farmacéutico</div><div style={{ fontSize: '0.85rem', color: '#64748b' }}>Gestión de suministros</div></div>
                </button>
              </div>
            )}

            {loginStep === 'formulario' && (
              <div>
                <div style={{ background: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '15px', display: 'inline-block', textTransform: 'uppercase' }}>{rolSeleccionado === 'medico' ? 'MÓDULO MÉDICO 🩺' : 'MÓDULO FARMACIA 💊'}</div>
                <h3 style={s.modalTitle}>Iniciar Sesión</h3>
                <form onSubmit={manejarSubmitLogin}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: darkMode ? '#cbd5e1' : '#475569', display: 'block', marginBottom: '8px' }}>CORREO ELECTRÓNICO</label>
                    <input style={s.inputBase(esEmailValido(logEmail))} type="email" placeholder="usuario@medivault.com" value={logEmail} onChange={(e) => setLogEmail(e.target.value)} required disabled={cargando} />
                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: darkMode ? '#cbd5e1' : '#475569', display: 'block', marginBottom: '8px' }}>CONTRASEÑA</label>
                    <div style={s.passwordWrapper}>
                      <input style={{ ...s.inputBase(null), paddingRight: '50px' }} type={verLogPassword ? "text" : "password"} placeholder="••••••••••••" value={logPassword} onChange={(e) => setLogPassword(e.target.value)} required disabled={cargando} />
                      <button type="button" style={s.ojoBtn} onClick={() => setVerLogPassword(!verLogPassword)}>{verLogPassword ? '👁️‍🗨️' : '👁'}</button>
                    </div>
                  </div>
                  <button type="submit" style={{ ...s.btnMain, width: '100%', padding: '16px', opacity: cargando ? 0.7 : 1 }} disabled={cargando}>{cargando ? '⏳ PROCESANDO...' : 'INGRESAR'}</button>
                  <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>¿No tiene cuenta? <span onClick={() => !cargando && setLoginStep('registro')} style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>Regístrese aquí</span></div>
                  <button type="button" onClick={() => !cargando && setLoginStep('seleccion')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '700', marginTop: '20px', cursor: 'pointer' }}>← Cambiar de Rol</button>
                </form>
              </div>
            )}

            {loginStep === 'registro' && (
              <div>
                <div style={{ background: '#ecfdf5', color: '#10b981', padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '15px', display: 'inline-block', textTransform: 'uppercase' }}>Crear Cuenta: {rolSeleccionado === 'medico' ? 'Médico' : 'Farmacia'}</div>
                <h3 style={s.modalTitle}>Registro Personal</h3>
                <form onSubmit={manejarSubmitRegistro}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: darkMode ? '#cbd5e1' : '#475569', display: 'block', marginBottom: '8px' }}>NOMBRE COMPLETO</label>
                    <input style={s.inputBase(regNombre ? true : null)} type="text" placeholder="Dr. Carlos Mendoza" value={regNombre} onChange={(e) => setRegNombre(e.target.value)} required disabled={cargando} />
                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: darkMode ? '#cbd5e1' : '#475569', display: 'block', marginBottom: '8px' }}>CORREO ELECTRÓNICO</label>
                    <input style={s.inputBase(esEmailValido(regEmail))} type="email" placeholder="nombre@medivault.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required disabled={cargando} />
                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: darkMode ? '#cbd5e1' : '#475569', display: 'block', marginBottom: '8px' }}>CONTRASEÑA DE ACCESO</label>
                    <div style={s.passwordWrapper}>
                      <input style={{ ...s.inputBase(regPassword.length >= 6 ? true : regPassword ? false : null), paddingRight: '50px' }} type={verRegPassword ? "text" : "password"} placeholder="Mínimo 6 caracteres" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required disabled={cargando} />
                      <button type="button" style={s.ojoBtn} onClick={() => setVerRegPassword(!verRegPassword)}>{verRegPassword ? '👁️‍🗨️' : '👁'}</button>
                    </div>
                  </div>
                  <button type="submit" style={{ ...s.btnMain, width: '100%', padding: '16px', background: '#10b981', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)', opacity: cargando ? 0.7 : 1 }} disabled={cargando}>{cargando ? '⏳ CREANDO TERMINAL...' : 'CREAR CUENTA SECURE'}</button>
                  <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>¿Ya tiene una cuenta? <span onClick={() => !cargando && setLoginStep('formulario')} style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>Inicie sesión</span></div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* NAVBAR */}
      <nav style={s.nav}>
        <div style={{ fontSize: '1.8rem', fontWeight: '950', color: '#2563eb', letterSpacing: '-2px' }}>MEDIVAULT</div>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <span style={{ fontWeight: '700', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>PRODUCTO</span>
          <button style={{ ...s.btnMain, padding: '10px 25px', fontSize: '0.85rem', boxShadow: 'none' }} onClick={() => { setLoginStep('seleccion'); setShowLogin(true); }}>LOGIN</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.heroSection}>
        <h1 style={s.title}>Tecnología que <br/><span style={{color: '#2563eb'}}>redefine el cuidado.</span></h1>
      </section>

      {/* SECCIÓN ANALÍTICA */}
      <section style={s.statsSection}>
        <div style={s.statsGrid}>
          <div style={s.statBlock}><div style={s.statNumber}>{totalDespachados.toLocaleString()}</div><div style={s.statLabel}>Éxito Clínico</div></div>
          <div style={s.statBlock}><div style={s.statNumber}>{ordenesActivas}</div><div style={s.statLabel}>Órdenes Activas</div></div>
          <div style={{ ...s.statBlock, borderRight: 'none' }}><div style={s.statNumber}>{stockGlobalSurtido.toLocaleString()}</div><div style={s.statLabel}>Unidades Stock</div></div>
        </div>
      </section>

      {/* CARACTERÍSTICAS */}
      <section style={s.featuresSection}>
        <h2 style={{ fontSize: '3.5rem', fontWeight: '950', letterSpacing: '-3px', color: darkMode ? '#ffffff' : '#0f172a', marginBottom: '15px' }}>Seguridad de extremo a extremo</h2>
        <div style={s.featuresGrid}>
          {caracteristicas.map(f => (
            <div key={f.id} style={s.featureCard(hoverFeature === f.id)} onMouseEnter={() => setHoverFeature(f.id)} onMouseLeave={() => setHoverFeature(null)}>
              <div style={s.featureIcon}>{f.icono}</div>
              <h3 style={{ fontWeight: '900', fontSize: '1.4rem', marginBottom: '10px', color: darkMode ? '#ffffff' : '#0f172a' }}>{f.titulo}</h3>
              <p style={{ color: darkMode ? '#94a3b8' : '#475569', fontSize: '0.95rem', lineHeight: '1.6', margin: 0 }}>{f.descripcion}</p>
            </div>
          ))}
        </div>
      </section>

      {/* PANEL ANALÍTICO */}
      <section style={s.analyticsSection}>
        <div style={s.analyticsContainer}>
          <div>
            <div style={{ background: '#2563eb', color: '#fff', padding: '8px 16px', borderRadius: '8px', display: 'inline-block', fontSize: '0.8rem', fontWeight: '900', marginBottom: '20px' }}>MEDIVAULT INSIGHTS 📈</div>
            <h2 style={{ fontSize: '3.5rem', fontWeight: '950', lineHeight: '1.1', marginBottom: '25px', letterSpacing: '-2px' }}>Decisiones basadas <br/> en datos reales.</h2>
            <p style={{ color: '#94a3b8', fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '40px' }}>Visualice tendencias epidemiológicas y optimice el flujo de suministros con nuestro motor analítico avanzado integrado en el núcleo del sistema.</p>
            <button style={{ ...s.btnMain, background: 'transparent', border: '2px solid #ffffff', color: '#ffffff', boxShadow: 'none' }}>CONOCER MÁS</button>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '50px', borderRadius: '40px', border: '1px solid rgba(255,255,255,0.1)' }}>
            <p style={{ fontWeight: '800', fontSize: '0.9rem', color: '#38bdf8', textTransform: 'uppercase', marginBottom: '30px' }}>Demanda por fármaco (Mes actual)</p>
            {metricasBI.map((m, idx) => (
              <div key={idx} style={s.barWrapper}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', fontWeight: '700' }}>
                  <span>{m.nombre}</span>
                  <span style={{ color: m.color }}>{m.porcentaje}%</span>
                </div>
                <div style={s.barBackground}>
                  <div style={s.barFill(m.porcentaje, m.color)}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECCIÓN PREGUNTAS FRECUENTES */}
      <section style={s.faqSection}>
        <h2 style={{ fontSize: '3.5rem', fontWeight: '950', letterSpacing: '-3px', color: darkMode ? '#ffffff' : '#0f172a', marginBottom: '15px' }}>Preguntas Frecuentes</h2>
        <p style={{ color: darkMode ? '#94a3b8' : '#64748b', fontSize: '1.1rem', fontWeight: '500', marginBottom: '50px' }}>Todo lo que necesita saber sobre la operatividad y estándares del ecosistema MediVault.</p>
        {faqs.map((faq) => (
          <div key={faq.id} style={s.faqItem} onClick={() => alternarFaq(faq.id)} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.borderColor = darkMode ? '#334155' : '#e2e8f0'}>
            <div style={s.faqHeader}>
              <span>{faq.pregunta}</span>
              <span style={{ transition: 'transform 0.3s', transform: faqAbierta === faq.id ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
            </div>
            <div style={s.faqBody(faqAbierta === faq.id)}>{faq.respuesta}</div>
          </div>
        ))}
      </section>

      {/* PORTAL OPERATIVO INFORMATIVO */}
      <section style={s.roleSection} id="ingreso-sistema">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '950', letterSpacing: '-3px', color: darkMode ? '#ffffff' : '#0f172a', marginBottom: '10px' }}>Ingreso Personal Autorizado</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Utilice el acceso de la barra superior para iniciar sesión de forma segura.</p>
        </div>
        <div style={s.roleGrid}>
          <div style={s.roleCard}>
            <div style={s.roleIcon}>💼</div>
            <h3 style={{ fontWeight: '900', fontSize: '1.8rem', marginBottom: '12px', color: darkMode ? '#ffffff' : '#0f172a' }}>Módulo Especialista</h3>
            <p style={{ color: darkMode ? '#94a3b8' : '#475569', lineHeight: '1.6' }}>Terminal para la expedición de órdenes médicas en lote, consultas detalladas del expediente y control preventivo de AI.</p>
          </div>
          <div style={s.roleCard}>
            <div style={s.roleIcon}>💊</div>
            <h3 style={{ fontWeight: '900', fontSize: '1.8rem', marginBottom: '12px', color: darkMode ? '#ffffff' : '#0f172a' }}>Módulo Dispensación</h3>
            <p style={{ color: darkMode ? '#94a3b8' : '#475569', lineHeight: '1.6' }}>Validación inmediata mediante tokens criptográficos de seguridad, despacho automatizado y auditorías globales de stock.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footerContainer}>
        <div style={s.statusCintillo}>
          <div style={s.statusDotWrapper}>
            <div style={s.statusDot}></div>
            <div style={s.statusPulse}></div>
          </div>
          <span>🟢 TODOS LOS SISTEMAS OPERATIVOS – CLOUD FIRESTORE SINCRONIZADO</span>
        </div>
        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2563eb', marginTop: '10px' }}>MEDIVAULT</div>
      </footer>
    </div>
  );
}

export default Landing;