import React, { useState } from 'react';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="login-screen">
      <div className="login-card">
        <header className="login-header">
          <div style={{fontSize: '3rem', marginBottom: '1rem'}}>🔐</div>
          <h1>MediVault</h1>
          <p>Sistema Central de Gestión Farmacéutica</p>
        </header>

        <form onSubmit={(e) => { e.preventDefault(); onLogin(email, password); }}>
          <div className="form-group">
            <label>Usuario Autorizado</label>
            <input 
              className="input-style" type="email" placeholder="correo@medivault.com"
              value={email} onChange={(e) => setEmail(e.target.value)} required
            />
          </div>
          <div className="form-group">
            <label>Contraseña de Seguridad</label>
            <input 
              className="input-style" type="password" placeholder="••••••••"
              value={password} onChange={(e) => setPassword(e.target.value)} required
            />
          </div>
          <button type="submit" className="btn-primary">ENTRAR AL SISTEMA</button>
        </form>
      </div>
    </div>
  );
}

export default Login;