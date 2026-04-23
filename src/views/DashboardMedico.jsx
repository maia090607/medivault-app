import React, { useState } from 'react';

function DashboardMedico({ user, onLogout, inventario, recetasEmitidas, setRecetasEmitidas }) {
  const [vista, setVista] = useState('receta');
  const [paciente, setPaciente] = useState('');
  const [medicamentoSel, setMedicamentoSel] = useState('');

  const iniciales = user.nombre.split(' ').map(n => n[0]).join('').toUpperCase();

  const manejarEnvio = (e) => {
    e.preventDefault();
    if (!paciente || !medicamentoSel) return alert("Por favor complete todos los campos.");

    const tokenGenerado = Math.floor(100000 + Math.random() * 900000).toString();
    
    const nuevaReceta = {
      id: Date.now(),
      paciente: paciente,
      medicamento: medicamentoSel,
      token: tokenGenerado,
      fecha: new Date().toLocaleString(),
      entregada: false, // IMPORTANTE: Para que el farmacéutico sepa que está pendiente
      medicoNombre: user.nombre
    };


    setRecetasEmitidas([nuevaReceta, ...recetasEmitidas]);
    
    alert(`✅ Token Generado: ${tokenGenerado}\nEntréguelo al paciente.`);
    setPaciente('');
    setMedicamentoSel('');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 style={{color: 'var(--accent)', fontWeight: '800', marginBottom: '2rem'}}>MediVault</h2>
        <nav className="sidebar-nav">
          <button className={`nav-link ${vista === 'receta' ? 'active' : ''}`} onClick={() => setVista('receta')}>📝 Nueva Receta</button>
          <button className={`nav-link ${vista === 'historial' ? 'active' : ''}`} onClick={() => setVista('historial')}>📋 Historial</button>
        </nav>
        <div className="sidebar-footer">
          <div className="profile-box">
            <div className="avatar-small" style={{background: 'rgba(14,165,233,0.1)', color: 'var(--accent)'}}>{iniciales}</div>
            <div className="user-text-info">
              <div style={{fontWeight: '700', fontSize: '0.9rem'}}>{user.nombre}</div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-dim)'}}>Médico</div>
            </div>
          </div>
          <button onClick={onLogout} className="btn-exit">Cerrar Sesión</button>
        </div>
      </aside>

      <main className="content-area">
        <h1 className="page-header">{vista === 'receta' ? 'Generar Prescripción' : 'Historial de Recetas'}</h1>
        
        {vista === 'receta' ? (
          <div className="main-card" style={{maxWidth: '550px'}}>
            <form onSubmit={manejarEnvio}>
              <div className="form-group">
                <label>Nombre del Paciente</label>
                <input className="input-style" value={paciente} onChange={(e) => setPaciente(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Medicamento</label>
                <select className="input-style" value={medicamentoSel} onChange={(e) => setMedicamentoSel(e.target.value)} required>
                  <option value="">Seleccione...</option>
                  {inventario.filter(m => m.stock > 0).map(m => (
                    <option key={m.id} value={m.nombre}>{m.nombre} ({m.stock} disp.)</option>
                  ))}
                </select>
              </div>
              <button type="submit" className="btn-primary">GENERAR TOKEN</button>
            </form>
          </div>
        ) : (
          <div className="main-card">
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{textAlign: 'left', borderBottom: '1px solid var(--border)'}}>
                  <th style={{padding: '1rem'}}>PACIENTE</th>
                  <th style={{padding: '1rem'}}>MEDICAMENTO</th>
                  <th style={{padding: '1rem'}}>TOKEN</th>
                  <th style={{padding: '1rem'}}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {recetasEmitidas.map(r => (
                  <tr key={r.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                    <td style={{padding: '1rem'}}>{r.paciente}</td>
                    <td style={{padding: '1rem'}}>{r.medicamento}</td>
                    <td style={{padding: '1rem', fontWeight: 'bold', color: 'var(--accent)'}}>{r.token}</td>
                    <td style={{padding: '1rem'}}>
                      {r.entregada ? <span style={{color: 'var(--success)'}}>● Entregado</span> : <span style={{color: '#eab308'}}>● Pendiente</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}

export default DashboardMedico;