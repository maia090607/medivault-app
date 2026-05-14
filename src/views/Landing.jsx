import React from 'react';

function Landing({ alIniciar }) {
  const s = {
    container: { 
      minHeight: '100vh', 
      fontFamily: '"Inter", sans-serif', 
      backgroundColor: '#ffffff', 
      color: '#1e293b', 
      overflowX: 'hidden' 
    },
    nav: { 
      padding: '25px 60px', 
      display: 'flex', 
      justifyContent: 'space-between', 
      alignItems: 'center', 
      position: 'fixed', 
      top: 0, 
      width: '100%', 
      background: 'rgba(255,255,255,0.92)', 
      backdropFilter: 'blur(15px)', 
      zIndex: 100, 
      boxSizing: 'border-box',
      borderBottom: '1px solid #f1f5f9'
    },
    hero: { 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center',
      padding: '220px 20px 140px', 
      textAlign: 'center', 
      background: 'linear-gradient(180deg, #f0f7ff 0%, #ffffff 100%)' 
    },
    title: { 
      fontSize: '5.5rem', 
      fontWeight: '950', 
      color: '#0f172a', 
      margin: 0, 
      lineHeight: '1', 
      letterSpacing: '-5px',
      maxWidth: '1100px'
    },
    accent: { color: '#2563eb' },
    btnMain: { 
      padding: '22px 50px', 
      background: '#2563eb', 
      color: '#ffffff', 
      borderRadius: '18px', 
      fontWeight: '700', 
      border: 'none', 
      cursor: 'pointer', 
      fontSize: '1.1rem', 
      transition: '0.3s cubic-bezier(0.4, 0, 0.2, 1)',
      boxShadow: '0 15px 30px -5px rgba(37, 99, 235, 0.3)'
    },
    section: { 
      padding: '120px 60px', 
      maxWidth: '1400px', 
      margin: '0 auto' 
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(3, 1fr)',
      gap: '20px',
      margin: '40px 0 100px',
      background: '#f8fafc',
      padding: '80px 40px',
      borderRadius: '50px',
      border: '1px solid #f1f5f9'
    },
    statBlock: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      textAlign: 'center'
    },
    statNumber: { 
      fontSize: '4.5rem', 
      fontWeight: '950', 
      color: '#2563eb', 
      letterSpacing: '-4px',
      lineHeight: '1',
      marginBottom: '15px' 
    },
    statLabel: { 
      fontSize: '0.95rem', 
      fontWeight: '800', 
      color: '#475569', 
      textTransform: 'uppercase', 
      letterSpacing: '2px'
    },
    featureGrid: { 
      display: 'grid', 
      gridTemplateColumns: 'repeat(3, 1fr)', 
      gap: '24px', 
      marginTop: '80px' 
    },
    featureCard: { 
      padding: '65px 45px', 
      borderRadius: '45px', 
      background: '#ffffff', 
      border: '1px solid #f1f5f9', 
      textAlign: 'left',
      minHeight: '350px',
      boxShadow: '0 10px 30px rgba(0,0,0,0.02)'
    },
    ctaSection: {
      background: '#0f172a',
      borderRadius: '60px',
      margin: '0 60px 100px',
      padding: '120px 40px',
      textAlign: 'center',
      color: '#ffffff'
    },
    footer: { 
      padding: '100px 60px 50px', 
      background: '#ffffff',
      borderTop: '1px solid #f1f5f9'
    },
    footerGrid: {
      display: 'grid',
      gridTemplateColumns: '1.5fr repeat(3, 1fr)',
      gap: '60px',
      maxWidth: '1400px',
      margin: '0 auto 80px',
      textAlign: 'left'
    }
  };

  return (
    <div style={s.container}>
      {/* HEADER */}
      <nav style={s.nav}>
        <div style={{ fontSize: '1.8rem', fontWeight: '950', color: '#2563eb', letterSpacing: '-2.5px' }}>MEDIVAULT</div>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <span style={{ fontWeight: '700', color: '#475569', cursor: 'pointer', fontSize: '0.9rem' }}>SOLUCIONES</span>
          <span style={{ fontWeight: '700', color: '#475569', cursor: 'pointer', fontSize: '0.9rem' }}>SEGURIDAD</span>
          <button style={{ ...s.btnMain, padding: '12px 30px', fontSize: '0.85rem', boxShadow: 'none' }} onClick={alIniciar}>LOGIN</button>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section style={s.hero}>
        <div style={{ color: '#2563eb', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '3px', marginBottom: '25px', textTransform: 'uppercase' }}>Infraestructura Sanitaria 2.0</div>
        <h1 style={s.title}>Tecnología que</h1>
        <h1 style={{ ...s.title, color: '#2563eb' }}>redefine el cuidado.</h1>
        <p style={{ fontSize: '1.4rem', color: '#475569', maxWidth: '650px', margin: '45px 0', lineHeight: '1.6' }}>
          Elevamos el estándar de la receta electrónica. Una plataforma robusta, diseñada para la precisión clínica y la seguridad inalterable del paciente.
        </p>
        <button style={s.btnMain} onClick={alIniciar}>EXPLORAR PLATAFORMA</button>
      </section>

      {/* STATS SECTION */}
      <section style={{ maxWidth: '1300px', margin: '0 auto', padding: '0 60px' }}>
        <div style={s.statsGrid}>
          <div style={s.statBlock}>
            <div style={s.statNumber}>99.9%</div>
            <div style={s.statLabel}>Disponibilidad</div>
          </div>
          <div style={s.statBlock}>
            <div style={s.statNumber}>10ms</div>
            <div style={s.statLabel}>Validación</div>
          </div>
          <div style={s.statBlock}>
            <div style={s.statNumber}>0</div>
            <div style={s.statLabel}>Falsificaciones</div>
          </div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section style={s.section}>
        <div style={{ textAlign: 'left', maxWidth: '800px', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '3.8rem', fontWeight: '950', letterSpacing: '-4px', color: '#0f172a', lineHeight: '1', marginBottom: '25px' }}>
            Innovación en cada proceso.
          </h2>
          <p style={{ fontSize: '1.4rem', color: '#475569', lineHeight: '1.6', fontWeight: '400', maxWidth: '600px' }}>
            Nuestras herramientas ofrecen un rendimiento excepcional, garantizando que la gestión clínica sea tan precisa como su diagnóstico.
          </p>
        </div>
        
        <div style={s.featureGrid}>
          <div style={s.featureCard}>
            <span style={{fontSize: '2rem', display: 'block', marginBottom: '25px', color: '#2563eb'}}>✦</span>
            <h3 style={{fontWeight: '900', fontSize: '1.8rem', marginBottom: '15px', color: '#0f172a', letterSpacing: '-1.5px'}}>Arquitectura Cifrada</h3>
            <p style={{color: '#64748b', lineHeight: '1.7', fontSize: '1.1rem'}}>Tokens de validación efímeros para proteger la integridad de cada diagnóstico emitido.</p>
          </div>
          <div style={s.featureCard}>
            <span style={{fontSize: '2rem', display: 'block', marginBottom: '25px', color: '#2563eb'}}>✦</span>
            <h3 style={{fontWeight: '900', fontSize: '1.8rem', marginBottom: '15px', color: '#0f172a', letterSpacing: '-1.5px'}}>Doble Autenticación</h3>
            <p style={{color: '#64748b', lineHeight: '1.7', fontSize: '1.1rem'}}>Control total de acceso mediante firmas digitales personales y protocolos de seguridad avanzada.</p>
          </div>
          <div style={s.featureCard}>
            <span style={{fontSize: '2rem', display: 'block', marginBottom: '25px', color: '#2563eb'}}>✦</span>
            <h3 style={{fontWeight: '900', fontSize: '1.8rem', marginBottom: '15px', color: '#0f172a', letterSpacing: '-1.5px'}}>Interoperabilidad</h3>
            <p style={{color: '#64748b', lineHeight: '1.7', fontSize: '1.1rem'}}>Historiales clínicos que fluyen instantáneamente entre especialistas y farmacias autorizadas.</p>
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section style={s.ctaSection}>
        <h2 style={{ fontSize: '4rem', fontWeight: '950', letterSpacing: '-4px', marginBottom: '30px' }}>¿Listo para el cambio?</h2>
        <p style={{ fontSize: '1.25rem', opacity: 0.8, marginBottom: '50px', maxWidth: '600px', margin: '0 auto 50px' }}>
          Únase a la red de salud más eficiente y segura. Transforme su práctica médica hoy mismo.
        </p>
        <button style={{ ...s.btnMain, background: '#ffffff', color: '#2563eb', boxShadow: 'none' }} onClick={alIniciar}>COMENZAR AHORA</button>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerGrid}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '950', color: '#2563eb', letterSpacing: '-2px', marginBottom: '25px' }}>MEDIVAULT</div>
            <p style={{ color: '#64748b', fontSize: '1rem', lineHeight: '1.6', maxWidth: '300px' }}>
              Redefiniendo el futuro de la gestión médica a través de la excelencia técnica y el diseño humano.
            </p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px' }}>Plataforma</h4>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '15px' }}>Receta Digital</span>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '15px' }}>Ficha Clínica</span>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '15px' }}>Inventario</span>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px' }}>Compañía</h4>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '15px' }}>Nosotros</span>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '15px' }}>Seguridad</span>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '15px' }}>Contacto</span>
          </div>
          <div>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '900', color: '#0f172a', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '30px' }}>Legal</h4>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '15px' }}>Privacidad</span>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '15px' }}>Términos</span>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '15px' }}>Cookies</span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '50px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.85rem', fontWeight: '600' }}>© 2026 MEDIVAULT. TODOS LOS DERECHOS RESERVADOS.</p>
          <span style={{ color: '#0f172a', fontWeight: '800', fontSize: '0.85rem', letterSpacing: '1px' }}>VALLEDUPAR / COLOMBIA</span>
        </div>
      </footer>
    </div>
  );
}

export default Landing;