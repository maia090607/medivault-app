import React, { useState } from 'react';

function Landing({ alIniciar }) {
  const [showTour, setShowTour] = useState(false);

  const s = {
    container: { 
      minHeight: '100vh', 
      fontFamily: '"Inter", sans-serif', 
      backgroundColor: '#ffffff', 
      color: '#1e293b', // Gris carbón para máxima legibilidad
      overflowX: 'hidden' 
    },
    nav: { 
      padding: '0 60px', 
      height: '80px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      position: 'fixed', 
      top: 0, 
      width: '100%', 
      background: 'rgba(255,255,255,0.95)', 
      backdropFilter: 'blur(20px)', 
      zIndex: 100, 
      boxSizing: 'border-box', 
      borderBottom: '1px solid #f1f5f9' 
    },
    // HERO: Espaciado equilibrado y fondo con luz sutil
    heroSection: { 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      padding: '180px 20px 100px', 
      textAlign: 'center', 
      background: 'radial-gradient(circle at 50% 0%, #eff6ff 0%, #ffffff 60%)',
      boxSizing: 'border-box'
    },
    title: { 
      fontSize: '5rem', 
      fontWeight: '950', 
      color: '#0f172a', // Azul casi negro para títulos
      margin: '0 auto 30px', 
      lineHeight: '1', 
      letterSpacing: '-4px', 
      maxWidth: '900px' 
    },
    btnMain: { 
      padding: '18px 42px', 
      background: '#2563eb', // Azul vibrante
      color: '#ffffff', 
      borderRadius: '14px', 
      fontWeight: '700', 
      border: 'none', 
      cursor: 'pointer', 
      fontSize: '1rem', 
      transition: '0.3s ease', 
      boxShadow: '0 10px 25px -5px rgba(37, 99, 235, 0.4)' 
    },
    // STATS: Bloque limpio con contrastes claros
    statsSection: { 
      maxWidth: '1100px', 
      margin: '0 auto', 
      padding: '40px 20px' 
    },
    statsGrid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      background: '#f8fafc', // Fondo gris muy suave
      padding: '60px 20px', 
      borderRadius: '40px', 
      border: '1px solid #e2e8f0' 
    },
    statBlock: { 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      borderRight: '1px solid #cbd5e1' 
    },
    statNumber: { fontSize: '3.8rem', fontWeight: '950', color: '#2563eb', letterSpacing: '-3px', lineHeight: '1' },
    statLabel: { fontSize: '0.8rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '1.5px', marginTop: '10px' },
    
    // FEATURES: Tarjetas blancas con sombras suaves
    featureSection: { 
      padding: '100px 60px 140px', 
      maxWidth: '1200px', 
      margin: '0 auto' 
    },
    featureGrid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '25px', 
      marginTop: '60px' 
    },
    featureCard: { 
      padding: '50px 40px', 
      borderRadius: '32px', 
      background: '#ffffff', 
      border: '1px solid #f1f5f9', 
      boxShadow: '0 4px 20px rgba(0,0,0,0.03)' 
    },

    // TOUR OVERLAY
    tourOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#ffffff', zIndex: 1000, overflowY: 'auto' }
  };

  const tourSteps = [
    { badge: "Portal Médico", title: "Prescripción Segura", desc: "Interfaz intuitiva para la emisión de recetas digitales.", img: "https://images.pexels.com/photos/7579831/pexels-photo-7579831.jpeg?auto=compress&w=1200" },
    { badge: "Portal Farmacia", title: "Validación Instantánea", desc: "Sincronización en tiempo real para el despacho seguro.", img: "https://images.pexels.com/photos/5910956/pexels-photo-5910956.jpeg?auto=compress&w=1200" },
    { badge: "Logística", title: "Inventario en Tiempo Real", desc: "Control de stock automatizado para optimizar suministros.", img: "https://images.pexels.com/photos/4481258/pexels-photo-4481258.jpeg?auto=compress&w=1200" },
    { badge: "Data Clínica", title: "Historial de Usuario", desc: "Línea de tiempo unificada con diagnósticos previos.", img: "https://images.pexels.com/photos/7688336/pexels-photo-7688336.jpeg?auto=compress&w=1200" }
  ];

  return (
    <div style={s.container}>
      
      {/* VISTA DEL TOUR (OVERLAY) */}
      {showTour && (
        <div style={s.tourOverlay}>
          <div style={{ padding: '20px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: 'white', zIndex: 1100 }}>
            <span style={{ fontWeight: '950', color: '#2563eb', fontSize: '1.2rem' }}>TOUR MEDIVAULT</span>
            <button style={{ ...s.btnMain, padding: '10px 20px', fontSize: '0.8rem', background: '#0f172a' }} onClick={() => setShowTour(false)}>CERRAR</button>
          </div>
          <div style={{ padding: '60px 20px', maxWidth: '900px', margin: '0 auto' }}>
            {tourSteps.map((step, i) => (
              <div key={i} style={{ marginBottom: '80px', textAlign: 'center', background: '#f8fafc', padding: '50px', borderRadius: '40px', border: '1px solid #e2e8f0' }}>
                <div style={{ background: '#dbeafe', color: '#2563eb', padding: '8px 16px', borderRadius: '12px', fontSize: '0.7rem', fontWeight: '900', marginBottom: '20px', display: 'inline-block' }}>{step.badge}</div>
                <h3 style={{ fontSize: '2.5rem', fontWeight: '950', marginBottom: '20px', color: '#0f172a' }}>{step.title}</h3>
                <p style={{ color: '#475569', fontSize: '1.1rem', marginBottom: '40px', lineHeight: '1.6' }}>{step.desc}</p>
                <div style={{ height: '400px', borderRadius: '24px', overflow: 'hidden', border: '1px solid #cbd5e1', boxShadow: '0 10px 30px rgba(0,0,0,0.05)' }}>
                  <img src={step.img} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt={step.title} />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* NAVEGACIÓN */}
      <nav style={s.nav}>
        <div style={{ fontSize: '1.8rem', fontWeight: '950', color: '#2563eb', letterSpacing: '-2px' }}>MEDIVAULT</div>
        <div style={{ display: 'flex', gap: '30px', alignItems: 'center' }}>
          <span style={{ fontWeight: '700', color: '#64748b', fontSize: '0.85rem', cursor: 'pointer' }}>PRODUCTO</span>
          <button style={{ ...s.btnMain, padding: '10px 25px', fontSize: '0.85rem', boxShadow: 'none' }} onClick={alIniciar}>LOGIN</button>
        </div>
      </nav>

      {/* SECCIÓN HERO */}
      <section style={s.heroSection}>
        <div style={{ background: '#dbeafe', color: '#2563eb', padding: '8px 18px', borderRadius: '20px', fontWeight: '900', fontSize: '0.7rem', marginBottom: '30px', letterSpacing: '1.5px' }}>MODERNO • SEGURO • RÁPIDO</div>
        <h1 style={s.title}>Tecnología que <br/><span style={{color: '#2563eb'}}>redefine el cuidado.</span></h1>
        <p style={{ fontSize: '1.35rem', color: '#475569', maxWidth: '650px', margin: '0 auto 45px', lineHeight: '1.6' }}>
          Elevamos el estándar de la receta electrónica con seguridad inalterable y precisión clínica de alto nivel.
        </p>
        <button style={s.btnMain} onClick={() => setShowTour(true)}>EXPLORAR PLATAFORMA</button>
      </section>

      {/* SECCIÓN ESTADÍSTICAS */}
      <section style={s.statsSection}>
        <div style={s.statsGrid}>
          <div style={s.statBlock}>
            <div style={s.statNumber}>99.9%</div>
            <div style={s.statLabel}>Disponibilidad</div>
          </div>
          <div style={s.statBlock}>
            <div style={s.statNumber}>10ms</div>
            <div style={s.statLabel}>Validación</div>
          </div>
          <div style={{ ...s.statBlock, borderRight: 'none' }}>
            <div style={s.statNumber}>0</div>
            <div style={s.statLabel}>Fraudes</div>
          </div>
        </div>
      </section>

      {/* SECCIÓN CARACTERÍSTICAS */}
      <section style={s.featureSection}>
        <div style={{ textAlign: 'center', marginBottom: '60px' }}>
          <h2 style={{ fontSize: '3.5rem', fontWeight: '950', letterSpacing: '-3px', color: '#0f172a' }}>Innovación operativa.</h2>
          <p style={{ fontSize: '1.2rem', color: '#64748b', marginTop: '10px' }}>Un ecosistema robusto diseñado para la medicina actual.</p>
        </div>
        <div style={s.featureGrid}>
          <div style={s.featureCard}>
            <div style={{ color: '#2563eb', fontSize: '2.2rem', marginBottom: '25px' }}>✦</div>
            <h3 style={{ fontWeight: '900', fontSize: '1.6rem', marginBottom: '15px', color: '#0f172a' }}>Arquitectura Cifrada</h3>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.7' }}>Tokens inalterables para blindar la integridad absoluta de cada diagnóstico emitido.</p>
          </div>
          <div style={s.featureCard}>
            <div style={{ color: '#2563eb', fontSize: '2.2rem', marginBottom: '25px' }}>✦</div>
            <h3 style={{ fontWeight: '900', fontSize: '1.6rem', marginBottom: '15px', color: '#0f172a' }}>Doble Autenticación</h3>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.7' }}>Firmas digitales personales y protocolos de seguridad para un control de acceso total.</p>
          </div>
          <div style={s.featureCard}>
            <div style={{ color: '#2563eb', fontSize: '2.2rem', marginBottom: '25px' }}>✦</div>
            <h3 style={{ fontWeight: '900', fontSize: '1.6rem', marginBottom: '15px', color: '#0f172a' }}>Interoperabilidad</h3>
            <p style={{ color: '#475569', fontSize: '1rem', lineHeight: '1.7' }}>Conectividad instantánea y fluida entre especialistas, centros médicos y farmacias.</p>
          </div>
        </div>
      </section>

      <footer style={{ padding: '60px 20px', textAlign: 'center', borderTop: '1px solid #f1f5f9', background: '#fcfdfe' }}>
        <div style={{ fontSize: '1.4rem', fontWeight: '900', color: '#2563eb', marginBottom: '15px' }}>MEDIVAULT</div>
        <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>© 2026 VALLEDUPAR, COLOMBIA • TECNOLOGÍA SANITARIA</p>
      </footer>
    </div>
  );
}

export default Landing;