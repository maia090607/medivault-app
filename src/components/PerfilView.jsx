import React, { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
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
    tarjetaProfesional: user?.tarjetaProfesional || '',
    fotoPerfil: user?.fotoPerfil || ''
  };

  const [form, setForm] = useState(datosIniciales);
  const [guardando, setGuardando] = useState(false);
  const [subiendoImg, setSubiendoImg] = useState(false);
  const [subiendoFoto, setSubiendoFoto] = useState(false);
  const [cargandoDatos, setCargandoDatos] = useState(true);
  const [verTarjeta, setVerTarjeta] = useState(false);

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
            tarjetaProfesional: data.tarjetaProfesional || '',
            fotoPerfil: data.fotoPerfil || ''
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

  const comprimirImagen = (dataUrl, maxAncho = 800, calidad = 0.7) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let ancho = img.width, alto = img.height;
        if (ancho > maxAncho) { alto = alto * maxAncho / ancho; ancho = maxAncho; }
        canvas.width = ancho; canvas.height = alto;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, ancho, alto);
        resolve(canvas.toDataURL('image/jpeg', calidad));
      };
      img.src = dataUrl;
    });
  };

  const handleArchivo = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.warning('Solo se permiten imágenes.');
      return;
    }
    setSubiendoImg(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const comprimida = await comprimirImagen(dataUrl);
      setForm(prev => ({ ...prev, tarjetaProfesional: comprimida }));
    } catch {
      toast.error('Error al leer la imagen.');
    } finally {
      setSubiendoImg(false);
    }
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
      const updates = {
        nombre: form.nombre.trim(),
        correo: form.email.trim().toLowerCase(),
        pin: form.pin,
        cedula: form.cedula.trim(),
        telefono: form.telefono.trim(),
        fotoPerfil: form.fotoPerfil
      };
      if (user?.role === 'medico') updates.especialidad = form.especialidad.trim();
      if (user?.role === 'farmacia') updates.sucursal = form.sucursal.trim();
      if (user?.role !== 'admin') updates.tarjetaProfesional = form.tarjetaProfesional;

      if (user?.id) {
        await updateDoc(doc(db, 'usuarios', user.id), updates);
      }

      if (onUserUpdate) {
        onUserUpdate({
          nombre: form.nombre.trim(),
          email: form.email.trim().toLowerCase(),
          especialidad: form.especialidad.trim(),
          sucursal: form.sucursal.trim(),
          pin: form.pin,
          cedula: form.cedula.trim(),
          telefono: form.telefono.trim(),
          tarjetaProfesional: form.tarjetaProfesional,
          fotoPerfil: form.fotoPerfil
        });
      }

      toast.success('Perfil actualizado correctamente.');
      setEditando(false);
    } catch (error) {
      console.error('Error al guardar perfil:', error);
      const msg = error?.message || '';
      if (msg.includes('exceed') || msg.includes('too large')) {
        toast.error('La imagen es demasiado grande. Seleccione una más pequeña.');
      } else {
        toast.error('Error al guardar. Intente de nuevo.');
      }
    } finally {
      setGuardando(false);
    }
  };

  const handleCancelar = () => {
    setForm(datosIniciales);
    setEditando(false);
  };

  const esImagenTarjeta = form.tarjetaProfesional && (
    form.tarjetaProfesional.startsWith('http') ||
    form.tarjetaProfesional.startsWith('data:image')
  );

  const esImagenFoto = form.fotoPerfil && (
    form.fotoPerfil.startsWith('http') ||
    form.fotoPerfil.startsWith('data:image')
  );

  const handleArchivoFoto = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      toast.warning('Solo se permiten imágenes.');
      return;
    }
    setSubiendoFoto(true);
    try {
      const dataUrl = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const comprimida = await comprimirImagen(dataUrl, 400, 0.7);
      setForm(prev => ({ ...prev, fotoPerfil: comprimida }));
    } catch {
      toast.error('Error al leer la imagen.');
    } finally {
      setSubiendoFoto(false);
    }
  };

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
      <div style={{ ...c.avatar, overflow: 'hidden', background: esImagenFoto ? 'transparent' : '#2563eb' }}>
        {esImagenFoto ? (
          <img src={form.fotoPerfil} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          inicial
        )}
      </div>
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

          {user?.role !== 'admin' && (
            <div style={c.fieldRow}>
              <span style={c.fieldLabel}>Tarjeta Profesional</span>
              <span style={c.fieldValue}>
                {esImagenTarjeta ? (
                  <img
                    src={form.tarjetaProfesional}
                    alt="Tarjeta Profesional"
                    style={{ maxWidth: '200px', maxHeight: '120px', borderRadius: '6px', objectFit: 'contain', cursor: 'pointer' }}
                    onClick={() => setVerTarjeta(true)}
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

          <div style={{ textAlign: 'center', marginBottom: '20px' }}>
            <div style={{ ...c.avatar, overflow: 'hidden', background: esImagenFoto ? 'transparent' : '#2563eb', margin: '0 auto 8px auto' }}>
              {esImagenFoto ? (
                <img src={form.fotoPerfil} alt="Foto de perfil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                inicial
              )}
            </div>
            <label style={{ fontSize: '0.8rem', color: '#2563eb', fontWeight: '600', cursor: 'pointer', display: 'inline-block' }}>
              {subiendoFoto ? 'Cargando...' : '📷 Cambiar foto'}
              <input type="file" accept="image/*" onChange={handleArchivoFoto} style={{ display: 'none' }} />
            </label>
          </div>

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

          {user?.role !== 'admin' && (
            <>
              <label style={{ ...c.fieldLabel, display: 'block', marginTop: '14px', marginBottom: '2px' }}>Tarjeta Profesional (imagen)</label>
              {esImagenTarjeta && (
                <div style={{ marginTop: '6px', marginBottom: '6px' }}>
                  <img
                    src={form.tarjetaProfesional}
                    alt="Tarjeta Profesional"
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
              {subiendoImg && <span style={{ fontSize: '0.8rem', color: '#2563eb', marginTop: '4px', display: 'block' }}>Leyendo imagen...</span>}
            </>
          )}

          <div style={c.btnGroup}>
            <button style={c.btnCancel} onClick={handleCancelar}>Cancelar</button>
            <button style={c.btnSave} onClick={handleGuardar} disabled={guardando}>
              {guardando ? 'Guardando...' : '💾 Guardar Cambios'}
            </button>
          </div>
        </>
      )}

      {verTarjeta && (
        <div
          style={{
            position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
            background: 'rgba(0,0,0,0.75)', zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer'
          }}
          onClick={() => setVerTarjeta(false)}
        >
          <img
            src={form.tarjetaProfesional}
            alt="Tarjeta Profesional"
            style={{
              maxWidth: '90vw', maxHeight: '90vh',
              borderRadius: '12px', objectFit: 'contain',
              boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
            }}
            onClick={e => e.stopPropagation()}
          />
        </div>
      )}
    </div>
  );
}

export default PerfilView;