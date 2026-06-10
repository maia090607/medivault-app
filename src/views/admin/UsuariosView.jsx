import React, { useState } from 'react';
import { doc, updateDoc } from 'firebase/firestore';

const POR_PAGINA = 10;

function UsuariosView({ usuariosValidos, darkMode, st, db, toast }) {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [editando, setEditando] = useState(null);
  const [form, setForm] = useState({});
  const [guardando, setGuardando] = useState(false);

  const filtrados = usuariosValidos.filter(u => {
    if (!u) return false;
    const q = busqueda.toLowerCase();
    return (u.nombre || '').toLowerCase().includes(q)
      || (u.correo || u.email || '').toLowerCase().includes(q)
      || (u.role || '').toLowerCase().includes(q)
      || (u.cedula || '').toLowerCase().includes(q);
  });

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const datosPagina = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) {
      setPagina(nueva);
      window.scrollTo(0, 0);
    }
  };

  const toggleActivo = async (usuario) => {
    const nuevoEstado = usuario.activo !== false ? false : true;
    const accion = nuevoEstado ? 'activar' : 'desactivar';
    if (!window.confirm(`¿Está seguro de ${accion} al usuario "${usuario.nombre}"?`)) return;
    try {
      await updateDoc(doc(db, "usuarios", usuario.id), { activo: nuevoEstado });
      toast.success(`Usuario ${nuevoEstado ? 'activado' : 'desactivado'} correctamente.`);
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar el usuario.');
    }
  };

  const abrirEdicion = (usuario) => {
    setEditando(usuario.id);
    setForm({
      nombre: usuario.nombre || '',
      correo: usuario.correo || usuario.email || '',
      cedula: usuario.cedula || '',
      telefono: usuario.telefono || '',
      tarjetaProfesional: usuario.tarjetaProfesional || '',
      especialidad: usuario.especialidad || '',
      sucursal: usuario.sucursal || '',
      pin: usuario.pin || ''
    });
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      toast.warning('El nombre no puede estar vacío.');
      return;
    }
    setGuardando(true);
    try {
      const updates = {
        nombre: form.nombre.trim(),
        correo: form.correo.trim().toLowerCase(),
        cedula: form.cedula.trim(),
        telefono: form.telefono.trim(),
        tarjetaProfesional: form.tarjetaProfesional.trim(),
        especialidad: form.especialidad.trim(),
        sucursal: form.sucursal.trim(),
        pin: form.pin
      };
      await updateDoc(doc(db, 'usuarios', editando), updates);
      toast.success('Usuario actualizado correctamente.');
      setEditando(null);
    } catch (err) {
      console.error(err);
      toast.error('Error al actualizar el usuario.');
    } finally {
      setGuardando(false);
    }
  };

  const c = {
    overlay: {
      position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
      background: 'rgba(15,23,42,0.5)', display: 'flex', alignItems: 'center',
      justifyContent: 'center', zIndex: 5000, backdropFilter: 'blur(4px)'
    },
    modal: {
      background: darkMode ? '#1e293b' : '#ffffff',
      padding: '28px', borderRadius: '16px', maxWidth: '500px', width: '90%',
      border: '1px solid ' + (darkMode ? '#334155' : '#e2e8f0'),
      maxHeight: '85vh', overflowY: 'auto', position: 'relative'
    },
    input: {
      width: '100%', padding: '10px 12px',
      border: '1px solid ' + (darkMode ? '#475569' : '#cbd5e1'),
      borderRadius: '8px', fontSize: '0.9rem', fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box', marginTop: '4px',
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#ffffff' : '#0f172a', outline: 'none'
    },
    label: {
      color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600', fontSize: '0.85rem', display: 'block', marginTop: '12px'
    }
  };

  return (
    <div key="usuarios" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
      <h2 style={{ margin: '0 0 16px 0', fontSize: '1.2rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
        Usuarios del Sistema
      </h2>
      <input
        style={st.input}
        placeholder="Buscar por nombre, email, rol o cédula..."
        value={busqueda}
        onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
      />
      <div style={{ overflowX: 'auto' }}>
        <table style={st.table}>
          <thead>
            <tr>
              <th style={st.th}>Nombre</th>
              <th style={st.th}>Email</th>
              <th style={st.th}>Rol</th>
              <th style={st.th}>Cédula</th>
              <th style={st.th}>Teléfono</th>
              <th style={st.th}>Especialidad / Sucursal</th>
              <th style={st.th}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.map(u => {
              const inactivo = u.activo === false;
              return (
                <tr key={u.id} style={{ opacity: inactivo ? 0.5 : 1 }}>
                  <td style={st.td}><strong>{u.nombre}</strong></td>
                  <td style={st.td}>{u.correo || u.email}</td>
                  <td style={st.td}>
                    <span style={{ ...st.badge(u.role), textTransform: 'capitalize' }}>{u.role}</span>
                    {inactivo && <span style={{ marginLeft: '6px', ...st.badge('contactado') }}>Inactivo</span>}
                  </td>
                  <td style={st.td}>{u.cedula || '—'}</td>
                  <td style={st.td}>{u.telefono || '—'}</td>
                  <td style={st.td}>{u.especialidad || u.sucursal || '—'}</td>
                  <td style={st.td}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                      <button onClick={() => abrirEdicion(u)} style={{
                        background: '#2563eb', color: '#fff', border: 'none',
                        padding: '6px 10px', borderRadius: '6px', fontWeight: '600',
                        cursor: 'pointer', fontSize: '0.75rem'
                      }}>
                        ✏️ Editar
                      </button>
                      <button onClick={() => toggleActivo(u)} style={{
                        background: inactivo ? '#10b981' : '#f59e0b',
                        color: '#fff', border: 'none', padding: '6px 10px',
                        borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.75rem'
                      }}>
                        {inactivo ? '🟢 Activar' : '🔴 Desactivar'}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {datosPagina.length === 0 && (
              <tr><td colSpan="7" style={{ ...st.td, textAlign: 'center', color: '#94a3b8' }}>No se encontraron usuarios.</td></tr>
            )}
          </tbody>
        </table>
      </div>
      {totalPaginas > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '20px' }}>
          <button style={st.pagBtn(paginaActual <= 1)} onClick={() => cambiarPagina(paginaActual - 1)} disabled={paginaActual <= 1}>
            ← Anterior
          </button>
          <span style={{ fontSize: '0.9rem', fontWeight: '600', color: darkMode ? '#ffffff' : '#1e293b' }}>
            {paginaActual} / {totalPaginas}
          </span>
          <button style={st.pagBtn(paginaActual >= totalPaginas)} onClick={() => cambiarPagina(paginaActual + 1)} disabled={paginaActual >= totalPaginas}>
            Siguiente →
          </button>
        </div>
      )}

      {editando && (
        <div style={c.overlay} onClick={() => setEditando(null)}>
          <div style={c.modal} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 16px 0', fontSize: '1.1rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#0f172a' }}>
              Editar Usuario
            </h3>

            <label style={c.label}>Nombre</label>
            <input style={c.input} value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />

            <label style={c.label}>Correo electrónico</label>
            <input style={c.input} value={form.correo} onChange={e => setForm(f => ({ ...f, correo: e.target.value }))} />

            <label style={c.label}>Cédula / Documento</label>
            <input style={c.input} value={form.cedula} onChange={e => setForm(f => ({ ...f, cedula: e.target.value }))} />

            <label style={c.label}>Teléfono</label>
            <input style={c.input} value={form.telefono} onChange={e => setForm(f => ({ ...f, telefono: e.target.value }))} />

            <label style={c.label}>Tarjeta Profesional</label>
            <input style={c.input} value={form.tarjetaProfesional} onChange={e => setForm(f => ({ ...f, tarjetaProfesional: e.target.value }))} />

            <label style={c.label}>Especialidad / Sucursal</label>
            <input style={c.input} value={form.especialidad || form.sucursal} onChange={e => setForm(f => ({ ...f, especialidad: e.target.value, sucursal: e.target.value }))} />

            <label style={c.label}>PIN (4 dígitos)</label>
            <input style={c.input} value={form.pin} onChange={e => setForm(f => ({ ...f, pin: e.target.value.replace(/\D/g, '').slice(0, 4) }))} maxLength={4} />

            <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
              <button onClick={() => setEditando(null)} style={{
                flex: 1, padding: '12px',
                background: darkMode ? '#334155' : '#f1f5f9',
                color: darkMode ? '#e2e8f0' : '#475569',
                border: 'none', borderRadius: '10px', fontWeight: '600', cursor: 'pointer'
              }}>
                Cancelar
              </button>
              <button onClick={handleGuardar} disabled={guardando} style={{
                flex: 1, padding: '12px', background: '#10b981', color: '#fff',
                border: 'none', borderRadius: '10px', fontWeight: '700',
                cursor: guardando ? 'not-allowed' : 'pointer', opacity: guardando ? 0.6 : 1
              }}>
                {guardando ? 'Guardando...' : '💾 Guardar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UsuariosView;