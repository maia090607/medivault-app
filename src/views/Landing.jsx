import React, { useState } from 'react';

function Landing({ alIniciar }) {
  const [showTour, setShowTour] = useState(false);

  const s = {
    container: { minHeight: '100vh', fontFamily: '"Inter", sans-serif', backgroundColor: '#ffffff', color: '#1e293b', overflowX: 'hidden' },
    nav: { padding: '25px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'fixed', top: 0, width: '100%', background: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(20px)', zIndex: 100, boxSizing: 'border-box', borderBottom: '1px solid #f1f5f9' },
    hero: { display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '240px 20px 160px', textAlign: 'center', background: 'radial-gradient(circle at 50% 0%, #eff6ff 0%, #ffffff 70%)' },
    title: { fontSize: '5.2rem', fontWeight: '950', color: '#0f172a', margin: 0, lineHeight: '0.95', letterSpacing: '-4px', maxWidth: '1000px' },
    btnMain: { padding: '20px 48px', background: '#2563eb', color: '#ffffff', borderRadius: '16px', fontWeight: '700', border: 'none', cursor: 'pointer', fontSize: '1.05rem', transition: '0.3s ease', boxShadow: '0 12px 24px -6px rgba(37, 99, 235, 0.4)' },
    
    // STATS: Proporciones corregidas para legibilidad total
    statsGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '40px', margin: '0 60px 120px', background: '#f8fafc', padding: '100px 40px', borderRadius: '60px', border: '1px solid #f1f5f9' },
    statBlock: { display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' },
    statNumber: { fontSize: '4.8rem', fontWeight: '950', color: '#2563eb', letterSpacing: '-5px', lineHeight: '0.8', marginBottom: '25px' },
    statLabel: { fontSize: '0.85rem', fontWeight: '800', color: '#64748b', textTransform: 'uppercase', letterSpacing: '2px' },

    // FEATURES: Espaciado premium
    section: { padding: '140px 60px', maxWidth: '1400px', margin: '0 auto' },
    featureGrid: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '30px', marginTop: '80px' },
    featureCard: { padding: '70px 50px', borderRadius: '48px', background: '#ffffff', border: '1px solid #f1f5f9', textAlign: 'left', minHeight: '380px', transition: '0.3s', boxShadow: '0 4px 20px rgba(0,0,0,0.02)' },
    
    // TOUR: Ajuste de colores para que sea luminoso
    tourOverlay: { position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: '#ffffff', zIndex: 1000, overflowY: 'auto' },
    tourImageSide: { flex: 1.2, background: '#f1f5f9', borderRadius: '40px', height: '480px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid #e2e8f0', color: '#94a3b8', fontWeight: '800', fontSize: '1.2rem' }
  };

  return (
    <div style={s.container}>
      
      {/* TOUR PRODUCTO */}
      {showTour && (
        <div style={s.tourOverlay}>
          <div style={{ padding: '25px 60px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9', position: 'sticky', top: 0, background: 'white', zIndex: 10 }}>
            <div style={{ fontSize: '1.6rem', fontWeight: '950', color: '#2563eb', letterSpacing: '-2px' }}>MODO EXPLORACIÓN</div>
            <button style={{ ...s.btnMain, padding: '12px 25px', fontSize: '0.85rem', background: '#f1f5f9', color: '#0f172a', boxShadow: 'none' }} onClick={() => setShowTour(false)}>CERRAR</button>
          </div>
          <div style={{ padding: '120px 60px', maxWidth: '1200px', margin: '0 auto' }}>
             <div style={{ display: 'flex', gap: '80px', alignItems: 'center', marginBottom: '140px' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ background: '#dbeafe', color: '#2563eb', padding: '6px 14px', borderRadius: '10px', display: 'inline-block', fontWeight: '800', fontSize: '0.75rem', marginBottom: '25px' }}>ECOSISTEMA MÉDICO</div>
                  <h3 style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-2px', marginBottom: '25px' }}>Prescripción Inteligente.</h3>
                  <p style={{ fontSize: '1.25rem', color: '#475569', lineHeight: '1.7' }}>Dashboard intuitivo para la emisión de recetas digitales con validación automática de protocolos médicos.</p>
                </div>
                <div style={s.tourImageSide}>[DASHBOARD_DOCTOR_PREVIEW]</div>
             </div>
             <div style={{ display: 'flex', gap: '80px', alignItems: 'center', flexDirection: 'row-reverse' }}>
                <div style={{ flex: 1 }}>
                  <div style={{ background: '#dbeafe', color: '#2563eb', padding: '6px 14px', borderRadius: '10px', display: 'inline-block', fontWeight: '800', fontSize: '0.75rem', marginBottom: '25px' }}>ECOSISTEMA FARMACIA</div>
                  <h3 style={{ fontSize: '3rem', fontWeight: '900', color: '#0f172a', letterSpacing: '-2px', marginBottom: '25px' }}>Dispensación Segura.</h3>
                  <p style={{ fontSize: '1.25rem', color: '#475569', lineHeight: '1.7' }}>Validación de tokens en tiempo real que garantiza la entrega del medicamento correcto al paciente correcto.</p>
                </div>
                <div style={s.tourImageSide}>[PHARMACY_VERIFICATION_PREVIEW]</div>
             </div>
          </div>
        </div>
      )}

      {/* LANDING PAGE */}
      <nav style={s.nav}>
        <div style={{ fontSize: '1.8rem', fontWeight: '950', color: '#2563eb', letterSpacing: '-2.5px' }}>MEDIVAULT</div>
        <div style={{ display: 'flex', gap: '40px', alignItems: 'center' }}>
          <span style={{ fontWeight: '700', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}>PRODUCTO</span>
          <span style={{ fontWeight: '700', color: '#64748b', cursor: 'pointer', fontSize: '0.85rem' }}>SEGURIDAD</span>
          <button style={{ ...s.btnMain, padding: '12px 28px', fontSize: '0.85rem', boxShadow: 'none' }} onClick={alIniciar}>ACCESO</button>
        </div>
      </nav>

      <section style={s.hero}>
        <div style={{ background: '#dbeafe', color: '#2563eb', padding: '8px 20px', borderRadius: '30px', fontWeight: '800', fontSize: '0.75rem', marginBottom: '30px', letterSpacing: '2px' }}>INFRAESTRUCTURA SANITARIA 2.0</div>
        <h1 style={s.title}>Tecnología que</h1>
        <h1 style={{ ...s.title, color: '#2563eb' }}>redefine el cuidado.</h1>
        <p style={{ fontSize: '1.4rem', color: '#475569', maxWidth: '680px', margin: '45px 0 60px', lineHeight: '1.6' }}>
          Elevamos el estándar de la receta electrónica. Una plataforma robusta diseñada para la precisión clínica y la seguridad inalterable del paciente.
        </p>
        <button style={s.btnMain} onClick={() => setShowTour(true)}>EXPLORAR PLATAFORMA</button>
      </section>

      {/* STATS */}
      <section style={s.statsGrid}>
        <div style={s.statBlock}>
          <div style={s.statNumber}>99.9%</div>
          <div style={s.statLabel}>Uptime Sistema</div>
        </div>
        <div style={s.statBlock}>
          <div style={s.statNumber}>10ms</div>
          <div style={s.statLabel}>Validación</div>
        </div>
        <div style={s.statBlock}>
          <div style={s.statNumber}>0</div>
          <div style={s.statLabel}>Falsificaciones</div>
        </div>
      </section>

      {/* FEATURES */}
      <section style={s.section}>
        <div style={{ textAlign: 'left', maxWidth: '800px', marginBottom: '80px' }}>
          <h2 style={{ fontSize: '3.8rem', fontWeight: '950', letterSpacing: '-4px', color: '#0f172a', lineHeight: '1', marginBottom: '30px' }}>Innovación en cada proceso.</h2>
          <p style={{ fontSize: '1.4rem', color: '#64748b', lineHeight: '1.6', maxWidth: '600px' }}>Herramientas de alto rendimiento diseñadas específicamente para el flujo de trabajo médico moderno.</p>
        </div>
        
        <div style={s.featureGrid}>
          <div style={s.featureCard}>
            <span style={{ fontSize: '2.5rem', color: '#2563eb', display: 'block', marginBottom: '30px' }}>✦</span>
            <h3 style={{ fontWeight: '900', fontSize: '1.8rem', color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '20px' }}>Arquitectura Cifrada</h3>
            <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.05rem' }}>Tokens de validación efímeros para proteger la integridad de cada diagnóstico emitido.</p>
          </div>
          <div style={s.featureCard}>
            <span style={{ fontSize: '2.5rem', color: '#2563eb', display: 'block', marginBottom: '30px' }}>✦</span>
            <h3 style={{ fontWeight: '900', fontSize: '1.8rem', color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '20px' }}>Doble Autenticación</h3>
            <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.05rem' }}>Control total de acceso mediante firmas digitales personales y protocolos de seguridad.</p>
          </div>
          <div style={s.featureCard}>
            <span style={{ fontSize: '2.5rem', color: '#2563eb', display: 'block', marginBottom: '30px' }}>✦</span>
            <h3 style={{ fontWeight: '900', fontSize: '1.8rem', color: '#0f172a', letterSpacing: '-1.5px', marginBottom: '20px' }}>Interoperabilidad</h3>
            <p style={{ color: '#64748b', lineHeight: '1.8', fontSize: '1.05rem' }}>Historiales clínicos que fluyen instantáneamente entre especialistas y farmacias autorizadas.</p>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer style={s.footer}>
        <div style={s.footerGrid}>
          <div>
            <div style={{ fontSize: '1.8rem', fontWeight: '950', color: '#2563eb', letterSpacing: '-2px', marginBottom: '25px' }}>MEDIVAULT</div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', lineHeight: '1.6' }}>Redefiniendo la gestión médica con excelencia técnica.</p>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#0f172a', letterSpacing: '1px', marginBottom: '25px' }}>PRODUCTO</h4>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '12px', fontSize: '0.9rem' }}>Receta Digital</span>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '12px', fontSize: '0.9rem' }}>Seguridad</span>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#0f172a', letterSpacing: '1px', marginBottom: '25px' }}>LEGAL</h4>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '12px', fontSize: '0.9rem' }}>Privacidad</span>
            <span style={{ display: 'block', color: '#64748b', marginBottom: '12px', fontSize: '0.9rem' }}>Términos</span>
          </div>
          <div>
            <h4 style={{ fontSize: '0.8rem', fontWeight: '900', color: '#0f172a', letterSpacing: '1px', marginBottom: '25px' }}>UBICACIÓN</h4>
            <span style={{ display: 'block', color: '#0f172a', fontWeight: '800', fontSize: '0.9rem' }}>VALLEDUPAR / COL</span>
          </div>
        </div>
        <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '40px', textAlign: 'center' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', fontWeight: '600' }}>© 2026 MEDIVAULT. TODOS LOS DERECHOS RESERVADOS.</p>
        </div>
      </footer>
    </div>
  );
}

export default Landing;