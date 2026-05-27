import React, { useState } from 'react';

// LOGO PRINCIPAL
const MediVaultLogo = () => (
  <svg width="26" height="26" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect width="32" height="32" rx="8" fill="#2563eb"/>
    <path d="M16 7L24 11V17C24 21.42 19.58 25 16 25C12.42 25 8 21.42 8 17V11L16 7Z" fill="white"/>
    <path d="M16 12V20" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"/>
    <path d="M12 16H20" stroke="#2563eb" strokeWidth="2.5" strokeLinecap="round"/>
  </svg>
);

// ILUSTRACIÓN VECTORIAL PREMIUM REEMPLAZO DE IMAGEN
const CloudNetworkIllustration = () => (
  <svg width="180" height="140" viewBox="0 0 200 160" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginBottom: '24px' }}>
    {/* Círculos de Red en el Fondo */}
    <circle cx="100" cy="80" r="60" stroke="rgba(255, 255, 255, 0.08)" strokeWidth="1" strokeDasharray="4 4" />
    <circle cx="100" cy="80" r="40" stroke="rgba(255, 255, 255, 0.15)" strokeWidth="1.5" />
    
    {/* Brillos / Destellos de Datos */}
    <circle cx="50" cy="50" r="5" fill="#38bdf8" opacity="0.7" />
    <circle cx="150" cy="110" r="4" fill="#38bdf8" opacity="0.6" />
    <circle cx="140" cy="40" r="6" fill="#fbbf24" opacity="0.8" />
    
    {/* Conexiones de Líneas */}
    <path d="M60 80 L100 45 L140 80 L100 115 Z" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="2" strokeLinejoin="round" />
    <line x1="100" y1="45" x2="100" y2="115" stroke="rgba(255, 255, 255, 0.2)" strokeWidth="1.5" />
    
    {/* Servidor / Escudo Central Centralizado */}
    <rect x="75" y="60" width="50" height="40" rx="6" fill="#2563eb" stroke="#ffffff" strokeWidth="2.5" style={{ filter: 'drop-shadow(0px 8px 16px rgba(0,0,0,0.3))' }} />
    <path d="M90 75H110M90 85H105" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" />
    <circle cx="115" cy="85" r="2" fill="#10b981" />
  </svg>
);

function Login({ alIniciar, alRegistrar, onVolver }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [rol, setRol] = useState('medico'); // 'medico' o 'farmacia'
  
  // Estados del Formulario
  const [nombre, setNombre] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [extraInfo, setExtraInfo] = useState(''); 
  const [pinFirma, setPinFirma] = useState(''); 
  const [mostrarPassword, setMostrarPassword] = useState(false); 

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      alert("Por favor complete todos los campos obligatorios.");
      return;
    }

    if (esRegistro) {
      if (!nombre) {
        alert("Por favor ingrese su nombre completo.");
        return;
      }
      if (rol === 'medico' && pinFirma.length !== 4) {
        alert("El PIN de firma digital debe ser de exactamente 4 dígitos.");
        return;
      }
      
      const exito = await alRegistrar({ 
        nombre, 
        email, 
        password, 
        rol, 
        extraInfo: extraInfo || (rol === 'medico' ? "General" : "Sede Central"),
        pinFirma 
      });
      if (exito) {
        setEsRegistro(false); 
      }
    } else {
      alIniciar({ email, password, rol });
    }
  };

  const st = {
    container: {
      display: 'flex',
      height: '100vh',
      width: '100vw',
      fontFamily: '"Inter", "Segoe UI", sans-serif',
      backgroundColor: '#f8fafc', // Fondo sutilmente grisáceo para resaltar las tarjetas blancas
      margin: 0,
      padding: 0,
      boxSizing: 'border-box',
      overflow: 'hidden',
    },
    // Distribución perfecta 60 / 40
    formSide: {
      flex: '0 0 60%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      padding: '0 10%',
      backgroundColor: '#ffffff',
      boxSizing: 'border-box',
      height: '100vh',
      overflow: 'hidden'
    },
    brandSide: {
      flex: '0 0 40%',
      background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 50%, #1d4ed8 100%)', // Gradiente multinivel más rico
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '35px',
      color: '#ffffff',
      textAlign: 'center',
      boxSizing: 'border-box',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative'
    },
    btnVolver: {
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      background: '#f1f5f9',
      border: 'none',
      color: '#475569',
      padding: '6px 14px',
      borderRadius: '8px',
      fontSize: '0.8rem',
      fontWeight: '700',
      cursor: 'pointer',
      alignSelf: 'flex-start',
      marginBottom: '12px',
      transition: 'all 0.15s ease',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
    },
    brandHeader: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      marginBottom: '6px'
    },
    logoText: {
      fontSize: '1.4rem',
      fontWeight: '800',
      color: '#0f172a',
      letterSpacing: '-0.5px',
    },
    title: {
      fontSize: '1.9rem', 
      fontWeight: '800',
      color: '#0f172a',
      margin: '0 0 3px 0',
      letterSpacing: '-0.8px',
    },
    subtitle: {
      fontSize: '0.88rem',
      color: '#64748b',
      marginBottom: '16px',
      fontWeight: '500',
      lineHeight: '1.3'
    },
    roleSelector: {
      display: 'flex',
      background: '#f1f5f9',
      padding: '4px',
      borderRadius: '10px',
      marginBottom: '14px',
    },
    roleTab: (activo) => ({
      flex: 1,
      padding: '9px',
      border: 'none',
      background: activo ? '#ffffff' : 'transparent',
      color: activo ? '#2563eb' : '#475569',
      fontWeight: '700',
      fontSize: '0.85rem',
      borderRadius: '8px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      boxShadow: activo ? '0 2px 5px rgba(0,0,0,0.06)' : 'none',
    }),
    inputGroup: {
      marginBottom: '8px', 
      display: 'flex',
      flexDirection: 'column',
      gap: '4px',
    },
    label: {
      fontSize: '0.78rem', 
      fontWeight: '700',
      color: '#334155',
    },
    input: {
      padding: '9px 14px', 
      borderRadius: '8px',
      border: '1px solid #cbd5e1',
      fontSize: '0.9rem',
      outline: 'none',
      transition: 'all 0.15s ease',
      backgroundColor: '#f8fafc',
      boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.02)',
    },
    btnSubmit: {
      width: '100%',
      padding: '11px',
      background: '#2563eb',
      color: '#ffffff',
      border: 'none',
      borderRadius: '8px',
      fontWeight: '700',
      fontSize: '0.95rem',
      cursor: 'pointer',
      marginTop: '6px',
      transition: 'all 0.15s ease',
      boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)',
    },
    toggleModeText: {
      textAlign: 'center',
      marginTop: '10px',
      fontSize: '0.82rem',
      color: '#64748b',
      fontWeight: '500',
    },
    toggleLink: {
      color: '#2563eb',
      fontWeight: '700',
      cursor: 'pointer',
      textDecoration: 'none',
      marginLeft: '4px',
    },
    // CAJA AZUL CON GLASSMORPHISM ULTRA PREMIUM
    bgPattern: {
      width: '92%',
      height: '88%',
      background: 'rgba(255, 255, 255, 0.05)',
      borderRadius: '24px',
      border: '1px solid rgba(255, 255, 255, 0.12)',
      backdropFilter: 'blur(10px)',
      WebkitBackdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '32px',
      boxSizing: 'border-box',
      boxShadow: '0 20px 40px rgba(0, 0, 0, 0.2)',
    }
  };

  return (
    <div style={st.container}>
      <style>{`
        html, body, #root {
          margin: 0 !important;
          padding: 0 !important;
          height: 100vh !important;
          width: 100vw !important;
          overflow: hidden !important;
          background-color: #ffffff !important;
        }
        * { box-sizing: border-box !important; }
        .input-modern:focus { border-color: #2563eb !important; background-color: #ffffff !important; box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.15) !important; }
        .btn-submit-login:hover { background: #1d4ed8 !important; transform: translateY(-1px); }
        .btn-submit-login:active { transform: translateY(0); }
        .btn-volver-action:hover { background: #e2e8f0 !important; color: #0f172a !important; }
        .toggle-link-action:hover { text-decoration: underline !important; }
      `}</style>

      {/* SECCIÓN IZQUIERDA: FORMULARIO */}
      <div style={st.formSide}>
        <div style={{ maxWidth: '360px', width: '100%', margin: '0 auto' }}>
          
          <button onClick={onVolver} style={st.btnVolver} className="btn-volver-action">
            ← Volver al Inicio
          </button>

          <div style={st.brandHeader}>
            <MediVaultLogo />
            <span style={st.logoText}>MediVault</span>
          </div>

          <h2 style={st.title}>
            {esRegistro ? 'Crear cuenta cloud' : 'Ingresar al ecosistema'}
          </h2>
          <p style={st.subtitle}>
            {esRegistro ? 'Apertura un nuevo nodo seguro en nuestra red.' : 'Introduce tus credenciales autorizadas corporativas.'}
          </p>

          <form onSubmit={handleSubmit}>
            <div style={st.roleSelector}>
              <button 
                type="button" 
                style={st.roleTab(rol === 'medico')} 
                onClick={() => { setRol('medico'); setExtraInfo(''); }}
              >
                👨‍⚕️ Módulo Médico
              </button>
              <button 
                type="button" 
                style={st.roleTab(rol === 'farmacia')} 
                onClick={() => { setRol('farmacia'); setExtraInfo(''); }}
              >
                📦 Punto Farmacia
              </button>
            </div>

            {esRegistro && (
              <>
                <div style={st.inputGroup}>
                  <label style={st.label}>Nombre Completo / Razón Social</label>
                  <input 
                    type="text" 
                    placeholder={rol === 'medico' ? "Ej. Dr. Alejandro Mendoza" : "Ej. Droguerías Cruz Verde"} 
                    style={st.input} 
                    className="input-modern" 
                    value={nombre} 
                    onChange={(e) => setNombre(e.target.value)} 
                  />
                </div>

                <div style={st.inputGroup}>
                  <label style={st.label}>{rol === 'medico' ? 'Especialidad Médica' : 'Nombre de la Sucursal'}</label>
                  <input 
                    type="text" 
                    placeholder={rol === 'medico' ? "Ej. Cardiología, Pediatría..." : "Ej. Sede Central..."} 
                    style={st.input} 
                    className="input-modern" 
                    value={extraInfo} 
                    onChange={(e) => setExtraInfo(e.target.value)} 
                  />
                </div>

                {rol === 'medico' && (
                  <div style={st.inputGroup}>
                    <label style={st.label}>🔑 PIN de Firma Digital (4 dígitos)</label>
                    <input 
                      type="password" 
                      placeholder="Ej. 8520" 
                      style={st.input} 
                      className="input-modern" 
                      value={pinFirma} 
                      onChange={(e) => setPinFirma(e.target.value.replace(/\D/g, ''))} 
                      maxLength="4" 
                    />
                  </div>
                )}
              </>
            )}

            <div style={st.inputGroup}>
              <label style={st.label}>Correo Electrónico</label>
              <input 
                type="email" 
                placeholder="usuario@medivault.com" 
                style={st.input} 
                className="input-modern" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
              />
            </div>

            <div style={st.inputGroup}>
              <label style={st.label}>Contraseña</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type={mostrarPassword ? 'text' : 'password'} 
                  placeholder="••••••••" 
                  style={{ ...st.input, paddingRight: '40px' }} 
                  className="input-modern" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                />
                <button
                  type="button"
                  onClick={() => setMostrarPassword(!mostrarPassword)}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    fontSize: '1.1rem',
                    color: '#94a3b8',
                    padding: '4px',
                    lineHeight: 1,
                  }}
                >
                  {mostrarPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn-submit-login" style={st.btnSubmit}>
              {esRegistro ? 'Registrar Nodo Cloud' : 'Iniciar Sesión Segura'}
            </button>
          </form>

          <p style={st.toggleModeText}>
            {esRegistro ? '¿Ya tienes una cuenta?' : '¿Tu institución es nueva?'}
            <span style={st.toggleLink} className="toggle-link-action" onClick={() => setEsRegistro(!esRegistro)}>
              {esRegistro ? 'Inicia sesión aquí' : 'Crea un nodo de acceso'}
            </span>
          </p>
        </div>
      </div>

      {/* SECCIÓN DERECHA: PANEL DE MARCA PREMIUM */}
      <div style={st.brandSide}>
        <div style={st.bgPattern}>
          <CloudNetworkIllustration />

          {rol === 'medico' ? (
            <>
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <span style={{ background: 'rgba(56, 189, 248, 0.15)', color: '#38bdf8', padding: '5px 12px', borderRadius: '30px', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Módulo Clínico
                </span>
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: '1.3', margin: '0 0 10px 0', color: '#ffffff', letterSpacing: '-0.5px' }}>
                Prescripción Digital Segura
              </h3>

              <p style={{ fontSize: '0.85rem', color: '#93c5fd', lineHeight: '1.5', margin: '0 0 20px 0', fontWeight: '500', maxWidth: '300px' }}>
                Emite recetas electrónicas con firma digital, accede al historial clínico de tus pacientes y coordina tratamientos en tiempo real con la red farmacéutica.
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px 0', textAlign: 'left', fontSize: '0.78rem', color: '#bfdbfe', lineHeight: '1.8' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Firma digital con PIN</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Historial unificado del paciente</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Recetas electrónicas trazables</li>
              </ul>
            </>
          ) : (
            <>
              <div style={{ textAlign: 'center', marginBottom: '12px' }}>
                <span style={{ background: 'rgba(251, 191, 36, 0.15)', color: '#fbbf24', padding: '5px 12px', borderRadius: '30px', fontSize: '0.68rem', fontWeight: '700', letterSpacing: '1px', textTransform: 'uppercase' }}>
                  Red de Dispensación
                </span>
              </div>

              <h3 style={{ fontSize: '1.5rem', fontWeight: '800', lineHeight: '1.3', margin: '0 0 10px 0', color: '#ffffff', letterSpacing: '-0.5px' }}>
                Validación y Despacho Express
              </h3>

              <p style={{ fontSize: '0.85rem', color: '#93c5fd', lineHeight: '1.5', margin: '0 0 20px 0', fontWeight: '500', maxWidth: '300px' }}>
                Recibe y valida recetas digitales al instante, gestiona tu inventario y despacha medicamentos con total trazabilidad y respaldo legal.
              </p>

              <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 12px 0', textAlign: 'left', fontSize: '0.78rem', color: '#bfdbfe', lineHeight: '1.8' }}>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Validación de recetas en vivo</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Control de stock automatizado</li>
                <li style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>✓ Historial de dispensación</li>
              </ul>
            </>
          )}

          <div style={{ marginTop: 'auto', display: 'flex', alignItems: 'center', gap: '6px', paddingTop: '14px', borderTop: '1px solid rgba(255,255,255,0.1)', width: '100%', justifyContent: 'center' }}>
            <div style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></div>
            <span style={{ fontSize: '0.68rem', color: '#94a3b8', fontWeight: '600' }}>Cifrado de extremo a extremo activo</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;