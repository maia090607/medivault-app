import React, { useState, useRef, useEffect } from 'react';
import { construirContexto } from '../services/aiEngine';

const SUGERENCIAS = [
  '📊 Resumen del sistema',
  '📦 Stock crítico',
  '📋 Recetas pendientes',
  '👥 Total de pacientes',
];

function AiChat({ datos, darkMode, cambiarVista }) {
  const [abierto, setAbierto] = useState(false);
  const [mensajes, setMensajes] = useState([
    { rol: 'assistant', texto: '🤖 Hola, soy **MediBot**. Pregúntame lo que quieras sobre la plataforma.' }
  ]);
  const [input, setInput] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [mensajes]);

  useEffect(() => {
    if (abierto && inputRef.current) {
      inputRef.current.focus();
    }
  }, [abierto]);

  const enviar = async (texto) => {
    const msg = (texto || input).trim();
    if (!msg || cargando) return;

    setMensajes(prev => [...prev, { rol: 'user', texto: msg }]);
    setInput('');
    setCargando(true);
    setError(null);

    try {
      const contexto = construirContexto(datos);
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: msg, contexto }),
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || 'Error del servidor');
      }

      const data = await res.json();
      setMensajes(prev => [...prev, { rol: 'assistant', texto: data.reply }]);
    } catch (err) {
      console.error(err);
      setError('No pude conectar con el asistente. Intenta de nuevo.');
      setMensajes(prev => [...prev, { rol: 'assistant', texto: '⚠️ Ocurrió un error al comunicarme con el servidor.' }]);
    } finally {
      setCargando(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      enviar();
    }
  };

  const sugerenciaClic = (sug) => {
    enviar(sug);
  };

  const cerrar = () => setAbierto(false);

  const botonStyle = {
    position: 'fixed', bottom: '24px', right: '24px',
    width: '56px', height: '56px', borderRadius: '50%',
    background: '#2563eb', color: '#fff', border: 'none',
    fontSize: '1.5rem', cursor: 'pointer', zIndex: 9999,
    boxShadow: '0 4px 16px rgba(37, 99, 235, 0.35)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    transition: 'transform 0.2s ease',
  };

  const panelStyle = {
    position: 'fixed', bottom: '92px', right: '24px',
    width: '360px', height: '520px',
    background: darkMode ? '#1e293b' : '#ffffff',
    borderRadius: '16px',
    border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
    display: 'flex', flexDirection: 'column', zIndex: 9999,
    animation: 'fadeIn 0.2s ease',
    overflow: 'hidden',
  };

  const headerStyle = {
    padding: '16px 18px',
    borderBottom: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    background: darkMode ? '#0f172a' : '#f8fafc',
  };

  const messagesStyle = {
    flex: 1, overflowY: 'auto', padding: '14px 16px',
    display: 'flex', flexDirection: 'column', gap: '10px',
  };

  const msgStyle = (rol) => ({
    maxWidth: '85%',
    padding: '10px 14px',
    borderRadius: rol === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
    background: rol === 'user'
      ? '#2563eb'
      : (darkMode ? '#0f172a' : '#f1f5f9'),
    color: rol === 'user' ? '#ffffff' : (darkMode ? '#f1f5f9' : '#1e293b'),
    fontSize: '0.85rem',
    lineHeight: '1.5',
    alignSelf: rol === 'user' ? 'flex-end' : 'flex-start',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  });

  return (
    <>
      <style>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px) scale(0.96); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes pulse { 0%, 100% { opacity: 0.4; } 50% { opacity: 1; } }
        .medibot-msg p { margin: 0 0 6px 0; }
        .medibot-msg p:last-child { margin-bottom: 0; }
        .medibot-msg strong { font-weight: 700; }
        .medibot-msg ul { margin: 4px 0; padding-left: 18px; }
      `}</style>

      <button
        onClick={() => setAbierto(!abierto)}
        style={botonStyle}
        onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.08)'}
        onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
      >
        {abierto ? '✕' : '🤖'}
      </button>

      {abierto && (
        <div style={panelStyle}>
          <div style={headerStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '1.2rem' }}>🤖</span>
              <span style={{ fontWeight: '700', fontSize: '0.9rem', color: darkMode ? '#ffffff' : '#1e293b' }}>MediBot</span>
              {cargando && (
                <span style={{ fontSize: '0.7rem', color: '#2563eb', fontWeight: '600', animation: 'pulse 1.2s infinite' }}>
                  escribiendo...
                </span>
              )}
            </div>
            <button
              onClick={cerrar}
              style={{ background: 'none', border: 'none', color: darkMode ? '#94a3b8' : '#64748b', fontSize: '1.1rem', cursor: 'pointer', padding: '4px', lineHeight: 1 }}
            >
              ✕
            </button>
          </div>

          <div ref={chatRef} style={messagesStyle}>
            {mensajes.map((m, i) => (
              <div key={i} className="medibot-msg" style={msgStyle(m.rol)}>
                {m.texto}
              </div>
            ))}
            {mensajes.length === 1 && (
              <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px',
                justifyContent: 'center',
              }}>
                {SUGERENCIAS.map(s => (
                  <button
                    key={s}
                    onClick={() => sugerenciaClic(s)}
                    style={{
                      background: darkMode ? '#0f172a' : '#f1f5f9',
                      border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
                      color: darkMode ? '#e2e8f0' : '#334155',
                      padding: '6px 12px', borderRadius: '20px', fontSize: '0.75rem',
                      fontWeight: '600', cursor: 'pointer',
                    }}
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div style={{
            padding: '12px 16px',
            borderTop: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
            display: 'flex', gap: '8px',
            background: darkMode ? '#0f172a' : '#f8fafc',
          }}>
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Pregunta lo que quieras..."
              disabled={cargando}
              style={{
                flex: 1, padding: '10px 14px', borderRadius: '10px',
                border: darkMode ? '1px solid #475569' : '1px solid #cbd5e1',
                background: darkMode ? '#1e293b' : '#ffffff',
                color: darkMode ? '#ffffff' : '#0f172a',
                fontSize: '0.85rem', outline: 'none',
              }}
            />
            <button
              onClick={() => enviar()}
              disabled={cargando || !input.trim()}
              style={{
                background: !input.trim() || cargando ? '#94a3b8' : '#2563eb',
                color: '#fff', border: 'none', borderRadius: '10px',
                padding: '10px 16px', fontWeight: '700', fontSize: '0.85rem',
                cursor: !input.trim() || cargando ? 'not-allowed' : 'pointer',
              }}
            >
              Enviar
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default AiChat;
