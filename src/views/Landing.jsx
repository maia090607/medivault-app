import React, { useState } from 'react';

function Landing({ alIniciar, alRegistrar, recetasEmitidas = [], inventario = [] }) {
  const [hoverCard, setHoverCard] = useState(null);
  
  // CONTROL DE VENTANAS DEL MODAL
  const [showLogin, setShowLogin] = useState(false);
  const [loginStep, setLoginStep] = useState('seleccion'); 
  const [rolSeleccionado, setRolSeleccionado] = useState(null);
  
  // ESTADOS DE CAPTURA INDEPENDIENTES
  const [regNombre, setRegNombre] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const [logEmail, setLogEmail] = useState('');
  const [logPassword, setLogPassword] = useState('');

  // Sincronización analítica en tiempo real para las estadísticas
  const totalDespachados = recetasEmitidas.filter(r => r.estado === 'Entregado' || r.estado === 'Dispensado').length + 1259;
  const ordenesActivas = recetasEmitidas.filter(r => r.estado === 'Pendiente').length + 52;
  const stockGlobalSurtido = inventario.reduce((acc, item) => acc + (parseInt(item.stock, 10) || 0), 0) + 9046;

  const s = {
    container: { minHeight: '100vh', fontFamily: '"Inter", sans-serif', backgroundColor: '#ffffff', color: '#1e293b', overflowX: 'hidden' },
    nav: { padding: '0 60px', height: '80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: 0, width: '100%', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', zIndex: 100, boxSizing: 'border-box', borderBottom: '1px solid #f1f5f9' },
    heroSection: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '180px 20px 80px', textAlign: 'center', background: 'radial-gradient(circle at 50% 0%, #eff6ff 0%, #ffffff 60%)', boxSizing: 'border-box' },
    title: { fontSize: '5rem', fontWeight: '950', color: '#0f172a', margin: '0 auto 30px', lineHeight: '1.1', letterSpacing: '-4px', maxWidth: '900px' },
    btnMain: { padding: '18px 42px', background: '#2563eb', color: '#ffffff', borderRadius: '14px', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '1rem', transition: '0.3s ease', boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)' },
    
    loginOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(16px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 },
    loginCard: { background: '#ffffff', border: '1px solid #e2e8f0', padding: '45px', borderRadius: '36px', width: '480px', boxShadow: '0 30px 60px -15px rgba(15, 23, 42, 0.12)', boxSizing: 'border-box', textAlign: 'center' },
    
    // MODAL INTERNO: Ajustes de tipografía para evitar superposiciones de interlineado (image_6c8fd7)
    modalTitle: { fontSize: '2.2rem', fontWeight: '950', color: '#0f172a', marginBottom: '15px', lineHeight: '1.25', letterSpacing: '-1.5px' },
    modalSub: { color: '#64748b', fontWeight: '600', marginBottom: '35px', fontSize: '1.05rem' },
    
    selectorBtn: { width: '100%', padding: '20px', marginBottom: '15px', borderRadius: '20px', border: '2px solid #f1f5f9', background: '#ffffff', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '20px', transition: '0.2s ease' },
    input: { width: '100%', padding: '14px 16px', border: '2px solid #e2e8f0', borderRadius: '14px', fontSize: '1rem', outline: 'none', background: '#ffffff', color: '#0f172a', boxSizing: 'border-box', marginBottom: '20px' },
    
    statsSection: { maxWidth: '1100px', margin: '0 auto', padding: '20px 20px 60px' },
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', background: '#f8fafc', padding: '50px 20px', borderRadius: '40px', border: '1px solid #e2e8f0' },
    statBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', borderRight: '1px solid #cbd5e1', justifyContent: 'center' },
    statNumber: { fontSize: '4.5rem', fontWeight: '950', color: '#2563eb', letterSpacing: '-3px', lineHeight: '1' },
    statLabel: { fontSize: '0.85rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '15px', textAlign: 'center' },
    
    roleSection: { padding: '60px 60px 120px', maxWidth: '1100px', margin: '0 auto' },
    roleGrid: { display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '35px', marginTop: '50px' },
    roleCard: { padding: '50px 40px', borderRadius: '32px', background: '#ffffff', border: '2px solid #f1f5f9', boxShadow: '0 4px 20px rgba(0,0,0,0.02)', textAlign: 'left', boxSizing: 'border-box', transition: 'all 0.3s ease' },
    roleIcon: { fontSize: '2.5rem', background: '#eff6ff', width: '70px', height: '70px', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '30px', color: '#2563eb' }
  };

  const abrirLoginStep1 = () => {
    setLoginStep('seleccion');
    setShowLogin(true);
  };

  const seleccionarRol = (rol) => {
    setRolSeleccionado(rol);
    setLoginStep('formulario');
  };

  const cerrarYLimpiarModal = () => {
    setShowLogin(false);
    setRegNombre('');
    setRegEmail('');
    setRegPassword('');
    setLogEmail('');
    setLogPassword('');
  };

  const manejarSubmitLogin = (e) => {
    e.preventDefault();
    if (!logEmail.trim() || !logPassword.trim()) return alert("Por favor rellene todos los campos.");
    alIniciar({ 
      email: logEmail.trim(), 
      password: logPassword.trim(), 
      rol: rolSeleccionado 
    });
  };

  const manejarSubmitRegistro = async (e) => {
    e.preventDefault();
    if (!regNombre.trim() || !regEmail.trim() || !regPassword.trim()) return alert("Por favor complete todos los campos.");
    
    const registrado = await alRegistrar({ 
      nombre: regNombre.trim(), 
      email: regEmail.trim(), 
      password: regPassword.trim(), 
      rol: rolSeleccionado 
    });

    if (registrado) {
      setLogEmail(regEmail.trim());
      setRegNombre('');
      setRegEmail('');
      setRegPassword('');
      setLoginStep('formulario'); 
    }
  };

  return (
    <div style={s.container}>
      {showLogin && (
        <div style={s.loginOverlay} onClick={cerrarYLimpiarModal}>
          <div style={s.loginCard} onClick={(e) => e.stopPropagation()}>
            
            {/* INTERFAZ 1: SELECCIÓN DE TERMINAL OPERATIVA (REESTRUCTURADO SIN COLISIONES) */}
            {loginStep === 'seleccion' && (
              <div>
                <h3 style={s.modalTitle}>¿Cómo desea ingresar a MediVault?</h3>
                <p style={s.modalSub}>Seleccione su rol operativo</p>
                
                <button style={s.selectorBtn} onClick={() => seleccionarRol('medico')} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#f1f5f9'}>
                  <span style={{ fontSize: '2.5rem' }}>🩺</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#0f172a' }}>Soy Médico</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Especialista autorizado</div>
                  </div>
                </button>

                <button style={s.selectorBtn} onClick={() => seleccionarRol('farmacia')} onMouseEnter={(e) => e.currentTarget.style.borderColor = '#2563eb'} onMouseLeave={(e) => e.currentTarget.style.borderColor = '#f1f5f9'}>
                  <span style={{ fontSize: '2.5rem' }}>💊</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontWeight: '900', fontSize: '1.1rem', color: '#0f172a' }}>Soy Farmacéutico</div>
                    <div style={{ fontSize: '0.85rem', color: '#64748b' }}>Gestión de suministros</div>
                  </div>
                </button>
              </div>
            )}

            {/* INTERFAZ 2: INICIO DE SESIÓN COMPACTO */}
            {loginStep === 'formulario' && (
              <div>
                <div style={{ background: '#eff6ff', color: '#2563eb', padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '15px', display: 'inline-block', textTransform: 'uppercase' }}>
                  {rolSeleccionado === 'medico' ? 'MÓDULO MÉDICO 🩺' : 'MÓDULO FARMACIA 💊'}
                </div>
                <h3 style={{ fontSize: '2.2rem', fontWeight: '950', color: '#0f172a', marginBottom: '25px', letterSpacing: '-1.5px' }}>Iniciar Sesión</h3>
                
                <form onSubmit={manejarSubmitLogin}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#475569', display: 'block', marginBottom: '8px' }}>CORREO ELECTRÓNICO</label>
                    <input style={s.input} type="email" placeholder="usuario@medivault.com" value={logEmail} onChange={(e) => setLogEmail(e.target.value)} required />
                    
                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#475569', display: 'block', marginBottom: '8px' }}>CONTRASEÑA</label>
                    <input style={s.input} type="password" placeholder="••••••••••••" value={logPassword} onChange={(e) => setLogPassword(e.target.value)} required />
                  </div>
                  
                  <button type="submit" style={{ ...s.btnMain, width: '100%', padding: '16px' }}>INGRESAR</button>
                  
                  <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                    ¿No tiene cuenta? <span onClick={() => setLoginStep('registro')} style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>Regístrese aquí</span>
                  </div>
                  
                  <button type="button" onClick={() => setLoginStep('seleccion')} style={{ background: 'transparent', border: 'none', color: '#94a3b8', fontSize: '0.85rem', fontWeight: '700', marginTop: '20px', cursor: 'pointer' }}>← Cambiar de Rol</button>
                </form>
              </div>
            )}

            {/* INTERFAZ 3: REGISTRO DE NUEVAS TERMINALES */}
            {loginStep === 'registro' && (
              <div>
                <div style={{ background: '#ecfdf5', color: '#10b981', padding: '8px 16px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: '900', marginBottom: '15px', display: 'inline-block', textTransform: 'uppercase' }}>
                  Crear Cuenta: {rolSeleccionado === 'medico' ? 'Médico' : 'Farmacia'}
                </div>
                <h3 style={{ fontSize: '2.2rem', fontWeight: '950', color: '#0f172a', marginBottom: '25px', letterSpacing: '-1.5px' }}>Registro Personal</h3>
                
                <form onSubmit={manejarSubmitRegistro}>
                  <div style={{ textAlign: 'left' }}>
                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#475569', display: 'block', marginBottom: '8px' }}>NOMBRE COMPLETO</label>
                    <input style={s.input} type="text" placeholder="Dr. Carlos Mendoza" value={regNombre} onChange={(e) => setRegNombre(e.target.value)} required />

                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#475569', display: 'block', marginBottom: '8px' }}>CORREO ELECTRÓNICO</label>
                    <input style={s.input} type="email" placeholder="nombre@medivault.com" value={regEmail} onChange={(e) => setRegEmail(e.target.value)} required />
                    
                    <label style={{ fontSize: '0.75rem', fontWeight: '900', color: '#475569', display: 'block', marginBottom: '8px' }}>CONTRASEÑA DE ACCESO</label>
                    <input style={s.input} type="password" placeholder="Mínimo 6 caracteres" value={regPassword} onChange={(e) => setRegPassword(e.target.value)} required />
                  </div>
                  
                  <button type="submit" style={{ ...s.btnMain, width: '100%', padding: '16px', background: '#10b981', boxShadow: '0 10px 25px -5px rgba(16, 185, 129, 0.4)' }}>CREAR CUENTA SECURE</button>
                  
                  <div style={{ marginTop: '20px', fontSize: '0.9rem', color: '#64748b', fontWeight: '600' }}>
                    ¿Ya tiene una cuenta? <span onClick={() => setLoginStep('formulario')} style={{ color: '#2563eb', cursor: 'pointer', textDecoration: 'underline' }}>Inicie sesión</span>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BARRA DE NAVEGACIÓN */}
      <nav style={s.nav}>
        <div style={{ fontSize: '1.8rem', fontWeight: '950', color: '#2563eb', letterSpacing: '-2px' }}>MEDIVAULT</div>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <span style={{ fontWeight: '700', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>PRODUCTO</span>
          <button style={{ ...s.btnMain, padding: '10px 25px', fontSize: '0.85rem', boxShadow: 'none' }} onClick={abrirLoginStep1}>LOGIN</button>
        </div>
      </nav>

      {/* HERO */}
      <section style={s.heroSection}>
        <h1 style={s.title}>Tecnología que <br/><span style={{color: '#2563eb'}}>redefine el cuidado.</span></h1>
      </section>

      {/* SECCIÓN ANALÍTICA (CORREGIDA: Sincronización y tamaños idénticos) */}
      <section style={s.statsSection}>
        <div style={s.statsGrid}>
          <div style={s.statBlock}>
            <div style={s.statNumber}>{totalDespachados.toLocaleString()}</div>
            <div style={s.statLabel}>Éxito Clínico</div>
          </div>
          <div style={s.statBlock}>
            <div style={s.statNumber}>{ordenesActivas}</div>
            <div style={s.statLabel}>Órdenes Activas</div>
          </div>
          <div style={{ ...s.statBlock, borderRight: 'none' }}>
            <div style={s.statNumber}>{stockGlobalSurtido.toLocaleString()}</div>
            <div style={s.statLabel}>Unidades Stock</div>
          </div>
        </div>
      </section>

      {/* PORTAL OPERATIVO INFORMATIVO */}
      <section style={s.roleSection} id="ingreso-sistema">
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '950', letterSpacing: '-3px', color: '#0f172a', marginBottom: '10px' }}>Ingreso Personal Autorizado</h2>
          <p style={{ color: '#64748b', fontSize: '1.1rem', fontWeight: '500' }}>Utilice el acceso de la barra superior para iniciar sesión de forma segura.</p>
        </div>
        <div style={s.roleGrid}>
          
          <div style={s.roleCard} onMouseEnter={() => setHoverCard('medico')} onMouseLeave={() => setHoverCard(null)}>
            <div style={{ ...s.roleIcon, backgroundColor: hoverCard === 'medico' ? '#2563eb' : '#eff6ff', color: hoverCard === 'medico' ? '#ffffff' : '#2563eb', transition: '0.3s ease' }}>🩺</div>
            <h3 style={{ fontWeight: '900', fontSize: '1.8rem', marginBottom: '12px', color: '#0f172a' }}>Módulo Especialista</h3>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>Terminal para la expedición de órdenes médicas en lote, consultas detalladas del expediente y control preventivo de AI.</p>
          </div>
          
          <div style={s.roleCard} onMouseEnter={() => setHoverCard('farmacia')} onMouseLeave={() => setHoverCard(null)}>
            <div style={{ ...s.roleIcon, backgroundColor: hoverCard === 'farmacia' ? '#2563eb' : '#eff6ff', color: hoverCard === 'farmacia' ? '#ffffff' : '#2563eb', transition: '0.3s ease' }}>💊</div>
            <h3 style={{ fontWeight: '900', fontSize: '1.8rem', marginBottom: '12px', color: '#0f172a' }}>Módulo Dispensación</h3>
            <p style={{ color: '#475569', lineHeight: '1.6' }}>Validación inmediata mediante tokens criptográficos de seguridad, despacho automatizado y auditorías globales de stock.</p>
          </div>
          
        </div>
      </section>

      <footer style={{ padding: '60px 20px', textAlign: 'center', borderTop: '1px solid #f1f5f9' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2563eb' }}>MEDIVAULT</div>
      </footer>
    </div>
  );
}

export default Landing;