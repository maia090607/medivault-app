import React, { useState } from 'react';
import { doc, addDoc, updateDoc, collection } from 'firebase/firestore';

const POR_PAGINA = 10;

function InventarioView({ inventarioValido, darkMode, st, db, toast }) {
  const [pagina, setPagina] = useState(1);
  const [busqueda, setBusqueda] = useState('');
  const [mostrarForm, setMostrarForm] = useState(false);
  const [nuevoNombre, setNuevoNombre] = useState('');
  const [nuevaConcentracion, setNuevaConcentracion] = useState('');
  const [nuevoStock, setNuevoStock] = useState('');

  const [mostrarModal, setMostrarModal] = useState(false);
  const [medSeleccionado, setMedSeleccionado] = useState(null);
  const [cantidadAñadir, setCantidadAñadir] = useState('');
  const [loading, setLoading] = useState(false);

  const filtrados = inventarioValido.filter(item =>
    item && item.nombre && (
      item.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      (item.codigo || '').toLowerCase().includes(busqueda.toLowerCase())
    )
  );

  const totalPaginas = Math.max(1, Math.ceil(filtrados.length / POR_PAGINA));
  const paginaActual = Math.min(pagina, totalPaginas);
  const datosPagina = filtrados.slice((paginaActual - 1) * POR_PAGINA, paginaActual * POR_PAGINA);

  const cambiarPagina = (nueva) => {
    if (nueva >= 1 && nueva <= totalPaginas) {
      setPagina(nueva);
      window.scrollTo(0, 0);
    }
  };

  const codigoGenerado = (() => {
    const prefijo = (nuevoNombre || '').replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '').slice(0, 7).toUpperCase().replace(/\s+/g, '');
    const digitos = (nuevaConcentracion || '').replace(/\D/g, '');
    return prefijo ? `${prefijo}-${digitos || '000'}` : '';
  })();

  const registrarNuevoMedicamento = async (e) => {
    e.preventDefault();
    if (!nuevoNombre || !nuevoStock) return toast.warning("Nombre y stock inicial son obligatorios.");
    try {
      await addDoc(collection(db, "inventario"), {
        codigo: codigoGenerado,
        nombre: nuevoNombre.trim(),
        concentracion: nuevaConcentracion.trim() || "N/A",
        stock: parseInt(nuevoStock, 10) || 0
      });
      toast.success("Fármaco registrado en el inventario.");
      setNuevoNombre('');
      setNuevaConcentracion('');
      setNuevoStock('');
      setMostrarForm(false);
    } catch (err) {
      console.error(err);
      toast.error("Error al guardar el medicamento.");
    }
  };

  const abrirModal = (med) => {
    setMedSeleccionado(med);
    setCantidadAñadir('');
    setMostrarModal(true);
  };

  const procesarAbastecimiento = async (e) => {
    e.preventDefault();
    if (!medSeleccionado || !cantidadAñadir) return;
    const cantidad = parseInt(cantidadAñadir, 10);
    if (!cantidad || cantidad <= 0) return toast.warning("Ingrese una cantidad válida.");
    try {
      setLoading(true);
      const stockActual = parseInt(medSeleccionado.stock, 10) || 0;
      await updateDoc(doc(db, "inventario", medSeleccionado.id), { stock: stockActual + cantidad });
      toast.success(`Stock actualizado: ${stockActual} → ${stockActual + cantidad}`);
      setMostrarModal(false);
      setMedSeleccionado(null);
      setCantidadAñadir('');
    } catch (err) {
      console.error(err);
      toast.error("Error al abastecer.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div key="inventario" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
          <h2 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>Inventario Global</h2>
          <button onClick={() => setMostrarForm(!mostrarForm)} style={st.btnAction}>
            {mostrarForm ? '✖ Cancelar' : '➕ Registrar Nuevo Fármaco'}
          </button>
        </div>

        {mostrarForm && (
          <form onSubmit={registrarNuevoMedicamento} style={{ background: darkMode ? '#0f172a' : '#f8fafc', padding: '30px', borderRadius: '16px', border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0', marginBottom: '30px' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.1rem', marginBottom: '16px', color: '#2563eb', fontWeight: '700' }}>Crear Registro en Inventario</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr', gap: '20px' }}>
              <div>
                <label style={st.label}>Código (auto)</label>
                <input style={{ ...st.input, marginBottom: 0, background: darkMode ? '#1e293b' : '#f1f5f9', color: '#2563eb', fontWeight: '700', fontFamily: 'monospace' }} value={codigoGenerado} readOnly />
              </div>
              <div>
                <label style={st.label}>Nombre Comercial / Genérico</label>
                <input style={st.input} placeholder="Ej. Acetaminofén" value={nuevoNombre} onChange={e => setNuevoNombre(e.target.value)} required />
              </div>
              <div>
                <label style={st.label}>Concentración</label>
                <input style={st.input} placeholder="Ej. 500 mg" value={nuevaConcentracion} onChange={e => setNuevaConcentracion(e.target.value)} />
              </div>
              <div>
                <label style={st.label}>Stock Inicial</label>
                <input type="number" min="0" style={st.input} placeholder="Ej. 100" value={nuevoStock} onChange={e => setNuevoStock(e.target.value)} required />
              </div>
            </div>
            <div style={{ textAlign: 'right', marginTop: '10px' }}>
              <button type="submit" style={st.btnSuccess}>Guardar en Sistema</button>
            </div>
          </form>
        )}

        <input
          style={st.input}
          placeholder="Buscar medicamento..."
          value={busqueda}
          onChange={e => { setBusqueda(e.target.value); setPagina(1); }}
        />
        <div style={{ overflowX: 'auto' }}>
          <table style={st.table}>
            <thead>
              <tr>
                <th style={st.th}>Código</th>
                <th style={st.th}>Medicamento</th>
                <th style={st.th}>Concentración</th>
                <th style={st.th}>Stock</th>
                <th style={st.th}>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {datosPagina.map(item => {
                const critico = (parseInt(item.stock, 10) || 0) <= 10;
                return (
                  <tr key={item.id}>
                    <td style={st.td}><strong style={{ color: '#2563eb' }}>{item.codigo || '—'}</strong></td>
                    <td style={st.td}><strong>{item.nombre}</strong></td>
                    <td style={st.td}>{item.concentracion || 'N/A'}</td>
                    <td style={{ ...st.td, color: critico ? '#ef4444' : 'inherit', fontWeight: critico ? '700' : '400' }}>
                      {item.stock} Uds {critico && <span style={{ color: '#ef4444', fontSize: '0.75rem', fontWeight: '700' }}>⚠️</span>}
                    </td>
                    <td style={st.td}>
                      <button onClick={() => abrirModal(item)} style={{ background: '#2563eb', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '6px', fontWeight: '600', cursor: 'pointer', fontSize: '0.8rem' }}>📥 Reabastecer</button>
                    </td>
                  </tr>
                );
              })}
              {datosPagina.length === 0 && (
                <tr><td colSpan="5" style={{ ...st.td, textAlign: 'center', color: '#94a3b8' }}>No hay medicamentos en inventario.</td></tr>
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
      </div>

      {/* MODAL REABASTECER */}
      {mostrarModal && medSeleccionado && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000
        }} onClick={() => setMostrarModal(false)}>
          <div style={{
            background: darkMode ? '#1e293b' : '#ffffff', padding: '30px',
            borderRadius: '16px', width: '420px', maxWidth: '90%',
            border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0'
          }} onClick={e => e.stopPropagation()}>
            <h3 style={{ margin: '0 0 8px 0', color: darkMode ? '#ffffff' : '#1e293b', fontSize: '1.2rem' }}>
              Reabastecer Medicamento
            </h3>
            <p style={{ color: '#64748b', margin: '0 0 14px 0', fontSize: '0.9rem' }}>
              <strong>{medSeleccionado.nombre}</strong> — Stock actual: <strong>{medSeleccionado.stock}</strong> Uds
            </p>
            <form onSubmit={procesarAbastecimiento}>
              <input
                type="number" min="1" required autoFocus
                style={{ ...st.input, marginBottom: '14px' }}
                placeholder="Cantidad a agregar"
                value={cantidadAñadir}
                onChange={e => setCantidadAñadir(e.target.value)}
              />
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setMostrarModal(false)}
                  style={{ background: darkMode ? '#334155' : '#e2e8f0', color: darkMode ? '#f1f5f9' : '#334155', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer' }}>
                  Cancelar
                </button>
                <button type="submit" disabled={loading}
                  style={{ background: loading ? '#94a3b8' : '#2563eb', color: '#fff', border: 'none', padding: '10px 18px', borderRadius: '8px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer' }}>
                  {loading ? 'Procesando...' : 'Confirmar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default InventarioView;
