import React, { useState } from 'react';
import { db } from '../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

function Login({ rol, onLogin, onVolver }) {
  const [esRegistro, setEsRegistro] = useState(false);
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const [extraInfo, setExtraInfo] = useState('');
  const [pinFirma, setPinFirma] = useState(''); // Estado para capturar el PIN único del médico

  const manejarSubmit = async (e) => {
    e.preventDefault();

    if (!correo || !password) return alert("Por favor complete los campos principales.");

    try {
      const usuariosRef = collection(db, "usuarios");

      if (esRegistro) {
        if (!nombre) return alert("Por favor ingrese su nombre completo.");
        if (rol === 'medico' && pinFirma.length !== 4) return alert("El PIN de firma debe ser de exactamente 4 dígitos.");

        const qCheck = query(usuariosRef, where("correo", "==", correo.trim().toLowerCase()));
        const snapCheck = await getDocs(qCheck);
        if (!snapCheck.empty) return alert("Este correo ya se encuentra registrado.");

        const nuevoUsuario = {
          nombre: nombre.trim(),
          correo: correo.trim().toLowerCase(),
          password: password, 
          role: rol, 
          uid: "uid_" + Math.random().toString(36).substr(2, 9),
          ...(rol === 'medico' ? { 
            especialidad: extraInfo || "General",
            pin: pinFirma.trim() // Se guarda el PIN único en la base de datos
          } : { 
            sucursal: extraInfo || "Sede Central" 
          })
        };

        await addDoc(usuariosRef, nuevoUsuario);
        alert(`¡Registro exitoso! Iniciando sesión automáticamente...`);
        onLogin(nuevoUsuario);

      } else {
        const qLogin = query(
          usuariosRef, 
          where("correo", "==", correo.trim().toLowerCase()), 
          where("password", "==", password)
        );
        const querySnapshot = await getDocs(qLogin);

        if (querySnapshot.empty) {
          return alert("Credenciales incorrectas o usuario no registrado.");
        }

        const datosUsuario = querySnapshot.docs[0].data();
        
        if (datosUsuario.role !== rol) {
          return alert(`Este usuario no está registrado como ${rol === 'medico' ? 'Médico' : 'Farmacéutico'}.`);
        }

        onLogin(datosUsuario);
      }
    } catch (error) {
      console.error("Error en autenticación Firebase: ", error);
      alert("Ocurrió un error en el servidor.");
    }
  };

  const st = {
    container: { height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc', fontFamily: '"Inter", sans-serif' },
    card: { background: 'white', padding: '40px', borderRadius: '32px', border: '1px solid #e2e8f0', width: '420px', boxShadow: '0 20px 40px rgba(0,0,0,0.03)', boxSizing: 'border-box', maxHeight: '95vh', overflowY: 'auto' },
    input: { width: '100%', padding: '14px 16px', border: '2px solid #f1f5f9', background: '#f8fafc', borderRadius: '12px', fontSize: '1rem', color: '#0f172a', outline: 'none', marginBottom: '20px', boxSizing: 'border-box' },
    label: { fontSize: '0.8rem', fontWeight: '900', color: '#475569', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' },
    btnSubmit: { width: '100%', padding: '16px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '14px', fontWeight: '800', fontSize: '1.05rem', cursor: 'pointer', marginTop: '10px' },
    toggleText: { textAlign: 'center', marginTop: '25px', color: '#64748b', fontSize: '0.9rem', fontWeight: '600' },
    link: { color: '#2563eb', cursor: 'pointer', fontWeight: '800', textDecoration: 'underline', marginLeft: '5px' }
  };

  return (
    <div style={st.container}>
      <div style={st.card}>
        <div style={{ textAlign: 'center', marginBottom: '35px' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: '900', color: '#2563eb', background: '#eff6ff', padding: '6px 14px', borderRadius: '20px', textTransform: 'uppercase' }}>
            Módulo {rol === 'medico' ? 'Médico 👨‍⚕️' : 'Farmacia 💊'}
          </span>
          <h2 style={{ fontSize: '2rem', fontWeight: '900', color: '#0f172a', marginTop: '15px', margin: '10px 0 0' }}>
            {esRegistro ? 'Crear Cuenta' : 'Iniciar Sesión'}
          </h2>
        </div>

        <form onSubmit={manejarSubmit}>
          {esRegistro && (
            <>
              <div>
                <label style={st.label}>Nombre Completo</label>
                <input style={st.input} type="text" placeholder="Dr/Dra..." value={nombre} onChange={e => setNombre(e.target.value)} required />
              </div>
              <div>
                <label style={st.label}>{rol === 'medico' ? 'Especialidad médica' : 'Nombre de la Sucursal'}</label>
                <input style={st.input} type="text" placeholder={rol === 'medico' ? 'Cardiología, General...' : 'Sede Norte...'} value={extraInfo} onChange={e => setExtraInfo(e.target.value)} />
              </div>
              {rol === 'medico' && (
                <div>
                  <label style={st.label}>🔑 Crear PIN de Firma (4 dígitos)</label>
                  <input style={st.input} type="password" placeholder="Ej. 8520" value={pinFirma} onChange={e => setPinFirma(e.target.value.replace(/\D/g, ''))} maxLength="4" required />
                </div>
              )}
            </>
          )}

          <div>
            <label style={st.label}>Correo Electrónico</label>
            <input style={st.input} type="email" placeholder="nombre@medivault.com" value={correo} onChange={e => setCorreo(e.target.value)} required />
          </div>

          <div>
            <label style={st.label}>Contraseña</label>
            <input style={st.input} type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>

          <button type="submit" style={st.btnSubmit}>
            {esRegistro ? 'REGISTRARSE E INGRESSAR' : 'INGRESAR'}
          </button>
        </form>

        <div style={st.toggleText}>
          {esRegistro ? '¿Ya tiene una cuenta?' : '¿No tiene credenciales registrados?'}
          <span style={st.link} onClick={() => setEsRegistro(!esRegistro)}>
            {esRegistro ? 'Inicie Sesión' : 'Regístrese aquí'}
          </span>
        </div>

        <button onClick={onVolver} style={{ marginTop: '30px', width: '100%', background: 'none', border: 'none', color: '#94a3b8', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.85rem' }}>
          ← Cambiar de Rol
        </button>
      </div>
    </div>
  );
}

export default Login;