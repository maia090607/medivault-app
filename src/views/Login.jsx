import React, { useState } from 'react';

function Login({ rol, onLogin }) {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validación estricta por correo y rol
    if (rol === 'medico' && email === 'medico@medivault.com') {
      onLogin({ nombre: 'Dr. García', role: 'medico', email });
    } else if (rol === 'farmacia' && email === 'farmacia@medivault.com') {
      onLogin({ nombre: 'Farmacia Central', role: 'farmacia', email });
    } else {
      alert("Acceso denegado: El correo no corresponde al portal seleccionado.");
    }
  };

  const s = {
    container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: '"Inter", sans-serif' },
    card: { background: 'white', padding: '50px', borderRadius: '30px', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', width: '400px', textAlign: 'center' },
    input: { width: '100%', padding: '15px', margin: '10px 0', borderRadius: '12px', border: '2px solid #f1f5f9', fontSize: '1rem', outline: 'none', boxSizing: 'border-box', color: '#0f172a' },
    btn: { width: '100%', padding: '16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '12px', fontWeight: '800', cursor: 'pointer', marginTop: '20px', fontSize: '1rem' }
  };

  return (
    <div style={s.container}>
      <div style={s.card}>
        <h2 style={{ color: '#0f172a', marginBottom: '10px', fontWeight: '900' }}>Iniciar Sesión</h2>
        <p style={{ color: '#64748b', marginBottom: '30px', fontWeight: '600' }}>Acceso: {rol === 'medico' ? 'Portal Médico' : 'Portal Farmacia'}</p>
        <form onSubmit={handleSubmit}>
          <input 
            style={s.input} 
            type="email" 
            placeholder="Correo electrónico" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            required 
          />
          <input 
            style={s.input} 
            type="password" 
            placeholder="Contraseña" 
            value={pass} 
            onChange={e => setPass(e.target.value)} 
            required 
          />
          <button style={s.btn} type="submit">Entrar al Sistema</button>
        </form>
      </div>
    </div>
  );
}

export default Login;