import React from 'react';

function Landing({ alIniciar }) {
  const s = {
    container: { minHeight: '100vh', fontFamily: '"Inter", sans-serif', backgroundColor: '#ffffff', color: '#0f172a' },
    nav: { padding: '25px 80px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f1f5f9' },
    hero: { display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '120px 20px', textAlign: 'center', background: 'radial-gradient(circle at top, #eff6ff 0%, #ffffff 100%)' },
    titleBlack: { fontSize: '4.5rem', fontWeight: '900', color: '#0f172a', margin: 0, lineHeight: '1.0', letterSpacing: '-3px' },
    titleBlue: { fontSize: '4.5rem', fontWeight: '900', color: '#2563eb', margin: '15px 0 35px', lineHeight: '1.0', letterSpacing: '-3px' },
    btn: { padding: '18px 45px', background: '#2563eb', color: 'white', borderRadius: '14px', fontWeight: '800', border: 'none', cursor: 'pointer', fontSize: '1.1rem', boxShadow: '0 15px 30px -10px rgba(37, 99, 235, 0.5)' },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '40px', padding: '80px', maxWidth: '1200px', margin: '0 auto' },
    card: { padding: '40px', borderRadius: '24px', background: '#f8fafc', border: '1px solid #e2e8f0', textAlign: 'left' }
  };

  return (
    <div style={s.container}>
      <nav style={s.nav}>
        <div style={{ fontSize: '2rem', fontWeight: '900', color: '#2563eb' }}>MediVault</div>
        <button style={{ ...s.btn, padding: '12px 28px', fontSize: '0.9rem' }} onClick={alIniciar}>Acceso Profesional</button>
      </nav>

      <section style={s.hero}>
        <h1 style={s.titleBlack}>La receta electrónica</h1>
        <h1 style={s.titleBlue}>segura e instantánea</h1>
        <p style={{ fontSize: '1.4rem', color: '#475569', maxWidth: '800px', marginBottom: '50px', lineHeight: '1.6', fontWeight: '500' }}>
          La red de prescripción digital más avanzada. Seguridad jurídica y eficiencia clínica en un solo clic.
        </p>
        <button style={s.btn} onClick={alIniciar}>Empezar ahora</button>
      </section>

      <div style={s.grid}>
        <div style={s.card}>
          <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🔒</div>
          <h3 style={{ fontWeight: '800', fontSize: '1.3rem' }}>Seguridad Total</h3>
          <p style={{ color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>Firma digital biométrica y encriptación de datos bajo estándares internacionales.</p>
        </div>
        <div style={s.card}>
          <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>⚡</div>
          <h3 style={{ fontWeight: '800', fontSize: '1.3rem' }}>Rapidez Clínica</h3>
          <p style={{ color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>Emisión de recetas y consulta de historial clínico en segundos.</p>
        </div>
        <div style={s.card}>
          <div style={{ fontSize: '2.5rem', marginBottom: '20px' }}>🤝</div>
          <h3 style={{ fontWeight: '800', fontSize: '1.3rem' }}>Conectividad</h3>
          <p style={{ color: '#475569', lineHeight: '1.6', fontWeight: '500' }}>Sincronización instantánea entre el médico y la farmacia.</p>
        </div>
      </div>
    </div>
  );
}

export default Landing;