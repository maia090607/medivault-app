import React, { useState } from 'react';

function DashboardFarmacia({ user, onLogout, recetasEmitidas, setRecetasEmitidas, inventario, setInventario }) {
  const [tokenInput, setTokenInput] = useState('');
  const [ordenEncontrada, setOrdenEncontrada] = useState(null);
  const [vista, setVista] = useState('entrega');

  const iniciales = user.nombre.split(' ').map(n => n[0]).join('').toUpperCase();

  // Función para buscar el token
  const buscarToken = (e) => {
    e.preventDefault();
    const receta = recetasEmitidas.find(r => r.token === tokenInput && !r.entregada);
    
    if (receta) {
      setOrdenEncontrada(receta);
    } else {
      alert("Token inválido, ya entregado o inexistente.");
      setOrdenEncontrada(null);
    }
  };

  // Función para entregar medicamentos y descontar inventario
  const procesarEntrega = () => {
    // 1. Descontar del inventario
    const nuevoInventario = inventario.map(item => {
      if (item.nombre === ordenEncontrada.medicamento) {
        return { ...item, stock: item.stock - 1 };
      }
      return item;
    });
    setInventario(nuevoInventario);

    // 2. Marcar receta como entregada
    const nuevasRecetas = recetasEmitidas.map(r => {
      if (r.token === ordenEncontrada.token) {
        return { ...r, entregada: true };
      }
      return r;
    });
    setRecetasEmitidas(nuevasRecetas);

    alert(`✅ Entrega exitosa: ${ordenEncontrada.medicamento} entregado a ${ordenEncontrada.paciente}`);
    setOrdenEncontrada(null);
    setTokenInput('');
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar">
        <h2 style={{color: 'var(--success)', fontWeight: '800'}}>MediVault</h2>
        <nav className="sidebar-nav">
          <button className={`nav-link farmacia ${vista === 'entrega' ? 'active' : ''}`} onClick={() => setVista('entrega')}>📦 Entrega</button>
          <button className={`nav-link farmacia ${vista === 'inventario' ? 'active' : ''}`} onClick={() => setVista('inventario')}>📊 Inventario</button>
        </nav>
        <div className="sidebar-footer">
          <div className="profile-box">
            <div className="avatar-small" style={{background: 'rgba(16,185,129,0.1)', color: 'var(--success)'}}>{iniciales}</div>
            <div>
              <div style={{fontWeight: '700', fontSize: '0.9rem'}}>{user.nombre}</div>
              <div style={{fontSize: '0.75rem', color: 'var(--text-dim)'}}>Farmacéutico</div>
            </div>
          </div>
          <button onClick={onLogout} style={{color: 'var(--danger)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: '700'}}>Cerrar Sesión</button>
        </div>
      </aside>

      <main className="content-area">
        <h1 className="page-header">{vista === 'entrega' ? 'Validar Token de Entrega' : 'Control de Inventario'}</h1>

        {vista === 'entrega' ? (
          <div className="main-card" style={{maxWidth: '600px', margin: '0 auto'}}>
            {!ordenEncontrada ? (
              <form onSubmit={buscarToken} style={{textAlign: 'center'}}>
                <p style={{color: 'var(--text-dim)', marginBottom: '1.5rem'}}>Ingrese el código de 6 dígitos para ver la orden:</p>
                <input 
                  className="input-style" 
                  value={tokenInput}
                  onChange={(e) => setTokenInput(e.target.value)}
                  placeholder="000000" 
                  style={{fontSize: '3rem', textAlign: 'center', letterSpacing: '10px', marginBottom: '2rem'}} 
                  maxLength="6"
                />
                <button type="submit" className="btn-primary" style={{background: 'var(--success)'}}>BUSCAR ORDEN</button>
              </form>
            ) : (
              <div style={{textAlign: 'left'}}>
                <h3 style={{color: 'var(--success)', marginBottom: '1.5rem', borderBottom: '1px solid var(--border)', paddingBottom: '10px'}}>Detalles de la Orden</h3>
                <div style={{display: 'grid', gap: '15px', marginBottom: '2rem'}}>
                  <div><label style={{color: 'var(--text-dim)', fontSize: '0.8rem'}}>PACIENTE</label><p style={{fontSize: '1.2rem', fontWeight: '700'}}>{ordenEncontrada.paciente}</p></div>
                  <div><label style={{color: 'var(--text-dim)', fontSize: '0.8rem'}}>MEDICAMENTO</label><p style={{fontSize: '1.2rem', fontWeight: '700', color: 'var(--success)'}}>{ordenEncontrada.medicamento}</p></div>
                  <div><label style={{color: 'var(--text-dim)', fontSize: '0.8rem'}}>FECHA DE EMISIÓN</label><p>{ordenEncontrada.fecha}</p></div>
                </div>
                <div style={{display: 'flex', gap: '10px'}}>
                  <button className="btn-primary" style={{background: 'var(--success)'}} onClick={procesarEntrega}>CONFIRMAR ENTREGA</button>
                  <button className="btn-primary" style={{background: 'rgba(255,255,255,0.1)'}} onClick={() => setOrdenEncontrada(null)}>CANCELAR</button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="main-card">
            <table style={{width: '100%', borderCollapse: 'collapse'}}>
              <thead>
                <tr style={{textAlign: 'left', borderBottom: '1px solid var(--border)'}}>
                  <th style={{padding: '1rem'}}>PRODUCTO</th>
                  <th style={{padding: '1rem'}}>STOCK ACTUAL</th>
                  <th style={{padding: '1rem'}}>ESTADO</th>
                </tr>
              </thead>
              <tbody>
                {inventario.map(item => (
                  <tr key={item.id} style={{borderBottom: '1px solid rgba(255,255,255,0.05)'}}>
                    <td style={{padding: '1rem', fontWeight: '600'}}>{item.nombre}</td>
                    <td style={{padding: '1rem'}}>{item.stock} uds</td>
                    <td style={{padding: '1rem'}}>
                      <span style={{
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '0.8rem',
                        background: item.stock > 10 ? 'rgba(16,185,129,0.1)' : 'rgba(239,68,68,0.1)',
                        color: item.stock > 10 ? 'var(--success)' : 'var(--danger)'
                      }}>
                        {item.stock > 10 ? 'Suficiente' : 'Bajo Stock'}
                      </span>
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

export default DashboardFarmacia;