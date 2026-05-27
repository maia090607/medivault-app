import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';

function DashboardMedico({ user, onLogout, inventario, recetasEmitidas, pacientesDB, historialesDB }) {
  const [vista, setVista] = useState('nueva');
  const [busquedaPac, setBusquedaPac] = useState('');
  const [pacienteSel, setPacienteSel] = useState(null);

  // CAPA DE SEGURIDAD 1: Forzamos array si llega undefined
  const listaPacientes = Array.isArray(pacientesDB) ? pacientesDB : [];

  // CAPA DE SEGURIDAD 2: Filtro ultra seguro
  const sugerenciasPac = busquedaPac.trim().length > 0 && !pacienteSel
    ? listaPacientes.filter(p => 
        p?.nombre && typeof p.nombre === 'string' && 
        p.nombre.toLowerCase().includes(busquedaPac.toLowerCase())
      )
    : [];

  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif' }}>
      <h2>Dashboard Médico</h2>

      <div style={{ border: '1px solid #ccc', padding: '20px', borderRadius: '8px' }}>
        <h3>Nueva Receta</h3>
        <input 
          placeholder="Buscar paciente..." 
          value={busquedaPac} 
          onChange={(e) => setBusquedaPac(e.target.value)} 
          style={{ padding: '8px', width: '300px' }}
        />

        {/* CAPA DE SEGURIDAD 3: Mapeo con validación */}
        <div style={{ marginTop: '10px' }}>
          {sugerenciasPac.length > 0 ? (
            sugerenciasPac.map((p, index) => (
              <div 
                key={p?.id || index} 
                onClick={() => { setPacienteSel(p); setBusquedaPac(''); }}
                style={{ cursor: 'pointer', padding: '5px', borderBottom: '1px solid #eee' }}
              >
                {/* Uso de p?.nombre para evitar el error de lectura */}
                {p?.nombre || 'Paciente sin nombre'}
              </div>
            ))
          ) : busquedaPac.length > 0 && (
            <p style={{ color: 'red' }}>No se encontraron pacientes.</p>
          )}
        </div>

        {/* Renderizado de selección seguro */}
        {pacienteSel && (
          <div style={{ marginTop: '15px', background: '#e0f7fa', padding: '10px', borderRadius: '4px' }}>
            <strong>Paciente activo:</strong> {pacienteSel?.nombre || 'Desconocido'}
            <button onClick={() => setPacienteSel(null)} style={{ marginLeft: '10px' }}>Cambiar</button>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardMedico;