import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useToast } from './Toast';

function PerfilView({ user, darkMode, onUserUpdate }) {
  const toast = useToast();
  const [editando, setEditando] = useState(false);

  const datosIniciales = {
    nombre: user?.nombre || '',
    email: user?.email || '',
    especialidad: user?.especialidad || '',
    sucursal: user?.sucursal || '',
    pin: user?.pin || '1234',
    cedula: user?.cedula || '',
    telefono: user?.telefono || '',
    tarjetaProfesional: user?.tarjetaProfesional || ''
  };

  const [form, setForm] = useState(datosIniciales);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImg, setSubiendoImg] = useState(false);
  const [nuevoArchivo, setNuevoArchivo] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [cargandoDatos, setCargandoDatos] = useState(true);

  useEffect(() => {
    if (!user?.id) { setCargandoDatos(false); return; }
    const fetchUser = async () => {
      try {
        const snap = await getDoc(doc(db, 'usuarios', user.id));
        if (snap.exists()) {
          const data = snap.data();
          const fresco = {
            nombre: data.nombre || '',
            email: data.correo || data.email || '',
            especialidad: data.especialidad || '',
            sucursal: data.sucursal || '',
            pin: data.pin || '1234',
            cedula: data.cedula || '',
            telefono: data.telefono || '',
            tarjetaProfesional: data.tarjetaProfesional || ''
          };
          setForm(fresco);
        }
      } catch (err) {
        console.error('Error al cargar perfil:', err);
      } finally {
        setCargandoDatos(false);
      }
    };
    fetchUser();
  }, [user?.id]);

  const inicial = (user?.nombre || form.nombre || 'U').charAt(0).toUpperCase();

  const handleChange = (campo, valor) => {
    setForm(prev => ({ ...prev, [campo]: valor }));
  };

  const handleArchivo = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.warning('Solo se permiten imágenes.');
      return;
    }
    setNuevoArchivo(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleGuardar = async () => {
    if (!form.nombre.trim()) {
      toast.warning('El nombre no puede estar vacío.');
      return;
    }
    if (!form.email.includes('@')) {
      toast.warning('Correo electrónico inválido.');
      return;
    }
    if (user?.role === 'medico' && form.pin.length !== 4) {
      toast.warning('El PIN debe tener exactamente 4 dígitos.');
      return;
    }

    setGuardando(true);
    try {
      let tarjetaUrl = form.tarjetaProfesional;

      if (nuevoArchivo) {
        setSubiendoImg(true);
        const imgRef = ref(storage, `usuarios/${user.id}/tarjetaProfesional`);
        await uploadBytes(imgRef, nuevoArchivo);
        tarjetaUrl = await getDownloadURL(imgRef);
        setSubiendoImg(false);
      }

      const updates = {
        nombre: form.nombre.trim(),
        correo: form.email.trim().toLowerCase(),
        pin: form.pin,
        cedula: form.cedula.trim(),
        telefono: form.telefono.trim()
      };
      if (user?.role === 'medico') updates.especialidad = form.especialidad.trim();
      if (user?.role === 'farmacia') updates.sucursal = form.sucursal.trim();
      if (user?.role === 'medico') updates.tarjetaProfesional = tarjetaUrl;

      if (user?.id) {
        await updateDoc(doc(db, 'usuarios', user.id), updates);
      }

      setForm(prev => ({ ...prev, tarjetaProfesional: tarjetaUrl }));
      setNuevoArchivo(null);
      setPreviewUrl(null);

      if (onUserUpdate) {
        onUserUpdate({
          nombre: form.nombre.trim(),
          email: form.email.trim().toLowerCase(),
          especialidad: form.especialidad.trim(),
          sucursal: form.sucursal.trim(),
          pin: form.pin,
          cedula: form.cedula.trim(),
          telefono: form.telefono.trim(),
          tarjetaProfesional: tarjetaUrl
        });
      }

      toast.success('Perfil actualizado correctamente.');
      setEditando(false);
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      toast.error('Error al guardar. Intente de nuevo.');
    } finally {
      setGuardando(false);
      setSubiendoImg(false);
    }
  };

  const handleCancelar = () => {
    setForm(datosIniciales);
    setNuevoArchivo(null);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
    setEditando(false);
  };

  const esImagenTarjeta = form.tarjetaProfesional && (
    form.tarjetaProfesional.startsWith('http') ||
    form.tarjetaProfesional.startsWith('data:image')
  );

  const labelRole = {
    medico: 'Médico',
    farmacia: 'Farmacia',
    admin: 'Administrador'
  };

  const badgeColor = {
    medico: '#2563eb',
    farmacia: '#d97706',
    admin: '#16a34a'
  };

  const c = {
    card: {
      background: darkMode ? '#1e293b' : '#ffffff',
      border: '1px solid ' + (darkMode ? '#334155' : '#e2e8f0'),
      borderRadius: '16px',
      padding: '40px',
      maxWidth: '600px',
      margin: '0 auto',
      animation: 'fadeIn 0.25s ease',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)'
    },
    avatar: {
      width: '80px',
      height: '80px',
      borderRadius: '50%',
      background: '#2563eb',
      color: '#ffffff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '2rem',
      fontWeight: '700',
      margin: '0 auto 16px auto',
      fontFamily: 'Inter, sans-serif'
    },
    nombre: {
      fontSize: '1.5rem',
      fontWeight: '700',
      color: darkMode ? '#ffffff' : '#0f172a',
      textAlign: 'center',
      margin: '0 0 4px 0'
    },
    email: {
      fontSize: '0.95rem',
      color: darkMode ? '#94a3b8' : '#64748b',
      textAlign: 'center',
      margin: '0 0 20px 0'
    },
    badge: {
      display: 'inline-block',
      padding: '4px 14px',
      borderRadius: '20px',
      fontSize: '0.85rem',
      fontWeight: '700',
      color: '#ffffff',
      background: badgeColor[user?.role] || '#64748b',
      marginBottom: '24px'
    },
    fieldRow: {
      display: 'flex',
      justifyContent: 'space-between',
      padding: '12px 0',
      borderBottom: '1px solid ' + (darkMode ? '#334155' : '#f1f5f9'),
      fontSize: '0.95rem'
    },
    fieldLabel: {
      color: darkMode ? '#94a3b8' : '#64748b',
      fontWeight: '600'
    },
    fieldValue: {
      color: darkMode ? '#e2e8f0' : '#1e293b',
      fontWeight: '500'
    },
    input: {
      width: '100%',
      padding: '10px 12px',
      border: '1px solid ' + (darkMode ? '#475569' : '#cbd5e1'),
      borderRadius: '8px',
      fontSize: '0.95rem',
      fontFamily: 'Inter, sans-serif',
      boxSizing: 'border-box',
      background: darkMode ? '#0f172a' : '#ffffff',
      color: darkMode ? '#ffffff' : '#0f172a',
      outline: 'none',
      marginTop: '4px'
    },
    btnEdit: {
      display: 'block',
      width: '100%',
      padding: '12px',
      background: '#2563eb',
      color: '#ffffff',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '700',
      fontSize: '1rem',
      cursor: 'pointer',
      marginTop: '24px'
    },
    btnGroup: {
      display: 'flex',
      gap: '12px',
      marginTop: '24px'
    },
    btnSave: {
      flex: 1,
      padding: '12px',
      background: '#10b981',
      color: '#ffffff',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '700',
      fontSize: '1rem',
      cursor: guardando ? 'not-allowed' : 'pointer',
      opacity: guardando ? 0.6 : 1
    },
    btnCancel: {
      flex: 1,
      padding: '12px',
      background: darkMode ? '#334155' : '#f1f5f9',
      color: darkMode ? '#e2e8f0' : '#475569',
      border: 'none',
      borderRadius: '10px',
      fontWeight: '600',
      fontSize: '1rem',
      cursor: 'pointer'
    }
  };

  if (cargandoDatos) {
    return (
      <div style={c.card}>
        <div style={{ textAlign: 'center', padding: '40px 0', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600' }}>
          Cargando perfil...
        </div>
      </div>
    );
  }

  return (
    <div style={c.card}>
      <div style={c.avatar}>{inicial}</div>
      {!editando ? (
        <>
          <h2 style={c.nombre}>{form.nombre || 'Sin nombre'}</h2>
          <p style={c.email}>{form.email || ''}</p>
          <div style={{ textAlign: 'center' }}>
            <span style={c.badge}>{labelRole[user?.role] || user?.role || '—'}</span>
          </div>

          <div style={c.fieldRow}>
            <span style={c.fieldLabel}>Rol</span>
            <span style={c.fieldValue}>{labelRole[user?.role] || user?.role || '—'}</span>
          </div>

          {user?.role === 'medico' && (
            <div style={c.fieldRow}>
              <span style={c.fieldLabel}>Especialidad</span>
              <span style={c.fieldValue}>{form.especialidad || '—'}</span>
            </div>
          )}

          {user?.role === 'farmacia' && (
            <div style={c.fieldRow}>
              <span style={c.fieldLabel}>Sucursal</span>
              <span style={c.fieldValue}>{form.sucursal || '—'}</span>
            </div>
          )}

          {user?.role === 'medico' && (
            <div style={c.fieldRow}>
              <span style={c.fieldLabel}>PIN de firma</span>
              <span style={c.fieldValue}>{'•'.repeat((form.pin || '1234').length)}</span>
            </div>
          )}

          <div style={c.fieldRow}>
            <span style={c.fieldLabel}>Cédula</span>
            <span style={c.fieldValue}>{form.cedula || '—'}</span>
          </div>

          <div style={c.fieldRow}>
            <span style={c.fieldLabel}>Teléfono</span>
            <span style={c.fieldValue}>{form.telefono || '—'}</span>
          </div>

          {user?.role === 'medico' && (
            <div style={c.fieldRow}>
              <span style={c.fieldLabel}>Tarjeta Profesional</span>
              <span style={c.fieldValue}>
                {esImagenTarjeta ? (
                  <img
                    src={form.tarjetaProfesional}
                    alt="Tarjeta Profesional"
                    style={{ maxWidth: '200px', maxHeight: '120px', borderRadius: '6px', objectFit: 'contain', cursor: 'pointer' }}
                    onClick={() => window.open(form.tarjetaProfesional, '_blank')}
                  />
                ) : (
                  form.tarjetaProfesional || '—'
                )}
              </span>
            </div>
          )}

          <div style={c.fieldRow}>
            <span style={c.fieldLabel}>ID de usuario</span>
            <span style={{ ...c.fieldValue, fontSize: '0.8rem', fontFamily: 'monospace' }}>{user?.uid || '—'}</span>
          </div>

          <button style={c.btnEdit} onClick={() => setEditando(true)}>
            ✏️ Editar Perfil
          </button>
        </>
      ) : (
        <>
          <h2 style={{ ...c.nombre, fontSize: '1.2rem', marginBottom: '20px' }}>Editar Perfil</h2>

          <label style={{ ...c.fieldLabel, display: 'block', marginBottom: '2px' }}>Nombre</label>
          <input style={c.input} value={form.nombre} onChange={e => handleChange('nombre', e.target.value)} />

          <label style={{ ...c.fieldLabel, display: 'block', marginTop: '14px', marginBottom: '2px' }}>Correo electrónico</label>
          <input style={c.input} value={form.email} onChange={e => handleChange('email', e.target.value)} />

          {user?.role === 'medico' && (
            <>
              <label style={{ ...c.fieldLabel, display: 'block', marginTop: '14px', marginBottom: '2px' }}>Especialidad</label>
              <input style={c.input} value={form.especialidad} onChange={e => handleChange('especialidad', e.target.value)} />
            </>
          )}

          {user?.role === 'farmacia' && (
            <>
              <label style={{ ...c.fieldLabel, display: 'block', marginTop: '14px', marginBottom: '2px' }}>Sucursal</label>
              <input style={c.input} value={form.sucursal} onChange={e => handleChange('sucursal', e.target.value)} />
            </>
          )}

          {user?.role === 'medico' && (
            <>
              <label style={{ ...c.fieldLabel, display: 'block', marginTop: '14px', marginBottom: '2px' }}>PIN de firma (4 dígitos)</label>
              <input style={c.input} value={form.pin} onChange={e => handleChange('pin', e.target.value.replace(/\D/g, '').slice(0, 4))} maxLength={4} placeholder="1234" />
            </>
          )}

          <label style={{ ...c.fieldLabel, display: 'block', marginTop: '14px', marginBottom: '2px' }}>Cédula / Documento</label>
          <input style={c.input} value={form.cedula} onChange={e => handleChange('cedula', e.target.value)} />

          <label style={{ ...c.fieldLabel, display: 'block', marginTop: '14px', marginBottom: '2px' }}>Teléfono</label>
          <input style={c.input} value={form.telefono} onChange={e => handleChange('telefono', e.target.value)} />

          {user?.role === 'medico' && (
            <>
              <label style={{ ...c.fieldLabel, display: 'block', marginTop: '14px', marginBottom: '2px' }}>Tarjeta Profesional (imagen)</label>
              {esImagenTarjeta && !nuevoArchivo && (
                <div style={{ marginTop: '6px', marginBottom: '6px' }}>
                  <img
                    src={form.tarjetaProfesional}
                    alt="Tarjeta Profesional actual"
                    style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', objectFit: 'contain' }}
                  />
                </div>
              )}
              {previewUrl && (
                <div style={{ marginTop: '6px', marginBottom: '6px' }}>
                  <img
                    src={previewUrl}
                    alt="Nueva imagen"
                    style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px', objectFit: 'contain' }}
                  />
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleArchivo}
                style={{ ...c.input, padding: '8px' }}
              />
              {subiendoImg && <span style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '4px', display: 'block' }}>Subiendo imagen...</span>}
            </>
          )}

          <div style={c.btnGroup}>
            <button style={c.btnCancel} onClick={handleCancelar}>Cancelar</button>
            <button style={c.btnSave} onClick={handleGuardar} disabled={guardando || subiendoImg}>
              {guardando || subiendoImg ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default PerfilView;