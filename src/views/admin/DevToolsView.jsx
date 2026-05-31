import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';

const MEDICAMENTOS = [
  { nombre: 'Acetaminofén', concentracion: '500mg' },
  { nombre: 'Ibuprofeno', concentracion: '400mg' },
  { nombre: 'Amoxicilina', concentracion: '500mg' },
  { nombre: 'Losartán', concentracion: '50mg' },
  { nombre: 'Metformina', concentracion: '850mg' },
  { nombre: 'Omeprazol', concentracion: '20mg' },
  { nombre: 'Salbutamol', concentracion: '100mcg' },
  { nombre: 'Atorvastatina', concentracion: '20mg' },
  { nombre: 'Aspirina', concentracion: '100mg' },
  { nombre: 'Dexametasona', concentracion: '8mg' },
  { nombre: 'Diazepam', concentracion: '10mg' },
  { nombre: 'Ranitidina', concentracion: '150mg' },
  { nombre: 'Captopril', concentracion: '25mg' },
  { nombre: 'Enalapril', concentracion: '10mg' },
  { nombre: 'Amlodipino', concentracion: '5mg' },
  { nombre: 'Hidroclorotiazida', concentracion: '25mg' },
  { nombre: 'Furosemida', concentracion: '40mg' },
  { nombre: 'Digoxina', concentracion: '0.25mg' },
  { nombre: 'Warfarina', concentracion: '5mg' },
  { nombre: 'Levotiroxina', concentracion: '100mcg' },
  { nombre: 'Metoclopramida', concentracion: '10mg' },
  { nombre: 'Loratadina', concentracion: '10mg' },
  { nombre: 'Cetirizina', concentracion: '10mg' },
  { nombre: 'Prednisona', concentracion: '20mg' },
  { nombre: 'Azitromicina', concentracion: '500mg' },
  { nombre: 'Ciprofloxacino', concentracion: '500mg' },
  { nombre: 'Diclofenaco', concentracion: '50mg' },
  { nombre: 'Naproxeno', concentracion: '500mg' },
  { nombre: 'Clonazepam', concentracion: '2mg' },
  { nombre: 'Fluoxetina', concentracion: '20mg' },
  { nombre: 'Sertralina', concentracion: '50mg' },
  { nombre: 'Hidroxizina', concentracion: '25mg' },
  { nombre: 'Bromuro de Ipratropio', concentracion: '20mcg' },
  { nombre: 'Espironolactona', concentracion: '25mg' },
  { nombre: 'Carvedilol', concentracion: '6.25mg' },
  { nombre: 'Bisoprolol', concentracion: '5mg' },
  { nombre: 'Simvastatina', concentracion: '20mg' },
  { nombre: 'Albuterol', concentracion: '100mcg' },
  { nombre: 'Clindamicina', concentracion: '300mg' },
  { nombre: 'Paracetamol', concentracion: '650mg' },
  { nombre: 'Tramadol', concentracion: '50mg' },
  { nombre: 'Morfina', concentracion: '10mg' },
  { nombre: 'Ketorolaco', concentracion: '30mg' },
  { nombre: 'Meloxicam', concentracion: '15mg' },
  { nombre: 'Celecoxib', concentracion: '200mg' },
  { nombre: 'Metronidazol', concentracion: '500mg' },
  { nombre: 'Cefalexina', concentracion: '500mg' },
  { nombre: 'Ceftriaxona', concentracion: '1g' },
  { nombre: 'Doxiciclina', concentracion: '100mg' },
  { nombre: 'Levofloxacino', concentracion: '500mg' },
  { nombre: 'Sulfametoxazol-Trimetoprima', concentracion: '800-160mg' },
  { nombre: 'Gentamicina', concentracion: '80mg' },
  { nombre: 'Vancomicina', concentracion: '500mg' },
  { nombre: 'Terbinafina', concentracion: '250mg' },
  { nombre: 'Fluconazol', concentracion: '150mg' },
  { nombre: 'Itraconazol', concentracion: '100mg' },
  { nombre: 'Nistatina', concentracion: '500000UI' },
  { nombre: 'Albendazol', concentracion: '400mg' },
  { nombre: 'Aciclovir', concentracion: '400mg' },
  { nombre: 'Oseltamivir', concentracion: '75mg' },
  { nombre: 'Lopinavir-Ritonavir', concentracion: '100-25mg' },
  { nombre: 'Montelukast', concentracion: '10mg' },
  { nombre: 'Beclometasona', concentracion: '250mcg' },
  { nombre: 'Budesonida', concentracion: '200mcg' },
  { nombre: 'Teofilina', concentracion: '200mg' },
  { nombre: 'Metoprolol', concentracion: '100mg' },
  { nombre: 'Atenolol', concentracion: '50mg' },
  { nombre: 'Propranolol', concentracion: '40mg' },
  { nombre: 'Nifedipina', concentracion: '30mg' },
  { nombre: 'Verapamilo', concentracion: '80mg' },
  { nombre: 'Diltiazem', concentracion: '120mg' },
  { nombre: 'Clonidina', concentracion: '0.1mg' },
  { nombre: 'Prazosina', concentracion: '2mg' },
  { nombre: 'Isosorbida', concentracion: '10mg' },
  { nombre: 'Nitroglicerina', concentracion: '0.4mg' },
  { nombre: 'Heparina', concentracion: '5000UI' },
  { nombre: 'Enoxaparina', concentracion: '40mg' },
  { nombre: 'Clopidogrel', concentracion: '75mg' },
  { nombre: 'Dalteparina', concentracion: '5000UI' },
  { nombre: 'Insulina NPH', concentracion: '100UI' },
  { nombre: 'Insulina Regular', concentracion: '100UI' },
  { nombre: 'Insulina Glargina', concentracion: '100UI' },
  { nombre: 'Insulina Lispro', concentracion: '100UI' },
  { nombre: 'Glibenclamida', concentracion: '5mg' },
  { nombre: 'Pioglitazona', concentracion: '30mg' },
  { nombre: 'Acarbosa', concentracion: '50mg' },
  { nombre: 'Empagliflozina', concentracion: '25mg' },
  { nombre: 'Dapagliflozina', concentracion: '10mg' },
  { nombre: 'Sitagliptina', concentracion: '100mg' },
  { nombre: 'Liraglutida', concentracion: '1.8mg' },
  { nombre: 'Lansoprazol', concentracion: '30mg' },
  { nombre: 'Pantoprazol', concentracion: '40mg' },
  { nombre: 'Esomeprazol', concentracion: '40mg' },
  { nombre: 'Bismuto Subsalicilato', concentracion: '262mg' },
  { nombre: 'Hioscina', concentracion: '10mg' },
  { nombre: 'Ondansetrón', concentracion: '8mg' },
  { nombre: 'Domperidona', concentracion: '10mg' },
  { nombre: 'Loperamida', concentracion: '2mg' },
  { nombre: 'Lactulosa', concentracion: '10g' },
  { nombre: 'Bisacodilo', concentracion: '5mg' },
  { nombre: 'Senósidos', concentracion: '8.6mg' },
  { nombre: 'Carbamazepina', concentracion: '200mg' },
  { nombre: 'Valproato de Sodio', concentracion: '250mg' },
  { nombre: 'Fenitoína', concentracion: '100mg' },
  { nombre: 'Gabapentina', concentracion: '300mg' },
  { nombre: 'Pregabalina', concentracion: '75mg' },
  { nombre: 'Topiramato', concentracion: '50mg' },
  { nombre: 'Lamotrigina', concentracion: '100mg' },
  { nombre: 'Levetiracetam', concentracion: '500mg' },
  { nombre: 'Ácido Valproico', concentracion: '500mg' },
  { nombre: 'Alprazolam', concentracion: '0.5mg' },
  { nombre: 'Lorazepam', concentracion: '2mg' },
  { nombre: 'Bromazepam', concentracion: '3mg' },
  { nombre: 'Clorpromazina', concentracion: '100mg' },
  { nombre: 'Haloperidol', concentracion: '5mg' },
  { nombre: 'Risperidona', concentracion: '2mg' },
  { nombre: 'Olanzapina', concentracion: '10mg' },
  { nombre: 'Quetiapina', concentracion: '100mg' },
  { nombre: 'Amitriptilina', concentracion: '25mg' },
  { nombre: 'Imipramina', concentracion: '50mg' },
  { nombre: 'Paroxetina', concentracion: '20mg' },
  { nombre: 'Venlafaxina', concentracion: '75mg' },
  { nombre: 'Citalopram', concentracion: '20mg' },
  { nombre: 'Escitalopram', concentracion: '10mg' },
  { nombre: 'Metilfenidato', concentracion: '10mg' },
  { nombre: 'Donepezilo', concentracion: '10mg' },
  { nombre: 'Rivastigmina', concentracion: '3mg' },
  { nombre: 'Levodopa-Carbidopa', concentracion: '250-25mg' },
  { nombre: 'Biperideno', concentracion: '2mg' },
  { nombre: 'Alopurinol', concentracion: '300mg' },
  { nombre: 'Colchicina', concentracion: '0.5mg' },
  { nombre: 'Baclofeno', concentracion: '10mg' },
  { nombre: 'Ciclobenzaprina', concentracion: '10mg' },
  { nombre: 'Metocarbamol', concentracion: '500mg' },
  { nombre: 'Hidroxicobalamina', concentracion: '1000mcg' },
  { nombre: 'Ácido Fólico', concentracion: '5mg' },
  { nombre: 'Sulfato Ferroso', concentracion: '200mg' },
  { nombre: 'Vitamina D3', concentracion: '2000UI' },
  { nombre: 'Vitamina C', concentracion: '500mg' },
  { nombre: 'Complejo B', concentracion: '100mg' },
  { nombre: 'Calcio Carbonato', concentracion: '500mg' },
  { nombre: 'Potasio Cloruro', concentracion: '600mg' },
  { nombre: 'Magnesio Sulfato', concentracion: '500mg' },
  { nombre: 'Zinc Sulfato', concentracion: '50mg' },
  { nombre: 'Ursodeoxicólico', concentracion: '300mg' },
  { nombre: 'Silimarina', concentracion: '140mg' },
  { nombre: 'Finasterida', concentracion: '5mg' },
  { nombre: 'Tamsulosina', concentracion: '0.4mg' },
  { nombre: 'Oxibutinina', concentracion: '5mg' },
  { nombre: 'Sildenafil', concentracion: '50mg' },
  { nombre: 'Tadalafilo', concentracion: '20mg' },
  { nombre: 'Dutasterida', concentracion: '0.5mg' },
  { nombre: 'Misoprostol', concentracion: '200mcg' },
  { nombre: 'Oxitocina', concentracion: '10UI' },
  { nombre: 'Metilergonovina', concentracion: '0.2mg' },
  { nombre: 'Clorfenamina', concentracion: '4mg' },
  { nombre: 'Desloratadina', concentracion: '5mg' },
  { nombre: 'Fexofenadina', concentracion: '120mg' },
  { nombre: 'Tranexámico Ácido', concentracion: '500mg' },
  { nombre: 'Enoxaparina Sódica', concentracion: '60mg' },
  { nombre: 'Ácido Zoledrónico', concentracion: '4mg' },
  { nombre: 'Alendronato', concentracion: '70mg' },
  { nombre: 'Raloxifeno', concentracion: '60mg' },
  { nombre: 'Calcitonina', concentracion: '200UI' },
  { nombre: 'Desmopresina', concentracion: '0.1mg' },
  { nombre: 'Octreotida', concentracion: '100mcg' },
  { nombre: 'Latanoprost', concentracion: '50mcg' },
  { nombre: 'Timolol', concentracion: '0.5mg' },
  { nombre: 'Dorzolamida', concentracion: '20mg' },
  { nombre: 'Ciclofosfamida', concentracion: '500mg' },
  { nombre: 'Metotrexato', concentracion: '2.5mg' },
  { nombre: 'Azatioprina', concentracion: '50mg' },
  { nombre: 'Micofenolato', concentracion: '500mg' },
  { nombre: 'Hidroxicloroquina', concentracion: '200mg' },
  { nombre: 'Sulfasalazina', concentracion: '500mg' },
  { nombre: 'Mesalazina', concentracion: '500mg' },
  { nombre: 'Infliximab', concentracion: '100mg' },
];

function generarCodigo(nombre, concentracion) {
  const prefijo = (nombre || '')
    .replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑ\s]/g, '')
    .slice(0, 7)
    .toUpperCase()
    .replace(/\s+/g, '');
  const digitos = (concentracion || '').replace(/\D/g, '');
  return prefijo ? `${prefijo}-${digitos || '000'}` : '';
}

function DevToolsView({ inventarioValido, darkMode, st, db, toast }) {
  const [estados, setEstados] = useState({});
  const [poblando, setPoblando] = useState(false);

  const codigosExistentes = new Set(
    (inventarioValido || []).map(i => i.codigo).filter(Boolean)
  );

  const poblarInventario = async () => {
    if (poblando) return;
    setPoblando(true);
    setEstados({});

    const batch = MEDICAMENTOS.map(m => ({
      ...m,
      codigo: generarCodigo(m.nombre, m.concentracion),
    }));

    let insertados = 0;
    let existentes = 0;
    let errores = 0;

    for (const item of batch) {
      const yaExiste = codigosExistentes.has(item.codigo);

      if (yaExiste) {
        setEstados(prev => ({ ...prev, [item.codigo]: 'existe' }));
        existentes++;
        continue;
      }

      try {
        await addDoc(collection(db, 'inventario'), {
          codigo: item.codigo,
          nombre: item.nombre.trim(),
          concentracion: item.concentracion.trim() || 'N/A',
          stock: 100,
        });
        setEstados(prev => ({ ...prev, [item.codigo]: 'ok' }));
        insertados++;
      } catch (err) {
        console.error(err);
        setEstados(prev => ({ ...prev, [item.codigo]: 'error' }));
        errores++;
      }
    }

    toast.success(`Insertados: ${insertados} | Ya existían: ${existentes} | Errores: ${errores}`);
    setPoblando(false);
  };

  const todosOk = Object.values(estados).every(v => v === 'ok' || v === 'existe');
  const hayAlgunoOk = Object.keys(estados).length > 0 && todosOk;

  return (
    <div key="devtools" style={{ ...st.card, animation: 'fadeIn 0.25s ease' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '700', color: darkMode ? '#ffffff' : '#1e293b' }}>
            🛠️ Dev Tools — Poblar Inventario
          </h2>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>
            Inserta {MEDICAMENTOS.length} medicamentos comunes con stock inicial de 100 Uds cada uno.
          </p>
        </div>
        <button
          onClick={poblarInventario}
          disabled={poblando}
          style={{
            background: poblando ? '#94a3b8' : '#8b5cf6',
            color: '#fff', border: 'none', padding: '14px 28px',
            borderRadius: '10px', fontWeight: '700', fontSize: '1rem',
            cursor: poblando ? 'not-allowed' : 'pointer',
            opacity: poblando ? 0.7 : 1,
            display: 'flex', alignItems: 'center', gap: '8px',
          }}
        >
          {poblando ? (
            <>
              <span style={{ display: 'inline-block', width: '16px', height: '16px', border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.6s linear infinite' }} />
              Poblando...
            </>
          ) : hayAlgunoOk ? (
            '🔄 Repoblar'
          ) : (
            '🚀 Poblar Inventario'
          )}
        </button>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
        gap: '8px',
      }}>
        {MEDICAMENTOS.map(m => {
          const codigo = generarCodigo(m.nombre, m.concentracion);
          const existePrevio = codigosExistentes.has(codigo);
          const estado = estados[codigo];

          let bg = darkMode ? '#0f172a' : '#f8fafc';
          let icono = existePrevio ? '📦' : '⬜';
          let textColor = darkMode ? '#94a3b8' : '#64748b';

          if (estado === 'ok') { bg = darkMode ? '#064e3b' : '#d1fae5'; icono = '✅'; textColor = darkMode ? '#ffffff' : '#065f46'; }
          else if (estado === 'existe') { bg = darkMode ? '#1e3a5f' : '#dbeafe'; icono = '📦'; textColor = darkMode ? '#ffffff' : '#1e40af'; }
          else if (estado === 'error') { bg = darkMode ? '#7f1d1d' : '#fee2e2'; icono = '❌'; textColor = darkMode ? '#ffffff' : '#991b1b'; }

          return (
            <div key={codigo} style={{
              padding: '12px 14px',
              borderRadius: '8px',
              background: bg,
              border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              transition: 'all 0.2s ease',
            }}>
              <span style={{ fontSize: '1.1rem' }}>{icono}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{
                  fontWeight: '600',
                  fontSize: '0.88rem',
                  color: textColor,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>{m.nombre}</div>
                <div style={{
                  fontSize: '0.75rem',
                  color: textColor,
                  opacity: 0.7,
                  fontFamily: 'monospace',
                }}>{codigo}</div>
              </div>
              <span style={{
                fontSize: '0.75rem',
                fontWeight: '600',
                color: textColor,
                opacity: estado ? 1 : 0.5,
                whiteSpace: 'nowrap',
              }}>
                {estado === 'ok' ? 'Insertado' : estado === 'existe' ? 'Ya existe' : estado === 'error' ? 'Error' : existePrevio ? 'Existente' : `${m.concentracion}`}
              </span>
            </div>
          );
        })}
      </div>

      {Object.keys(estados).length > 0 && (
        <div style={{
          marginTop: '20px',
          padding: '14px 18px',
          borderRadius: '8px',
          background: darkMode ? '#0f172a' : '#f1f5f9',
          display: 'flex',
          gap: '24px',
          flexWrap: 'wrap',
          fontSize: '0.85rem',
          fontWeight: '600',
        }}>
          <span style={{ color: '#10b981' }}>✅ Insertados: {Object.values(estados).filter(v => v === 'ok').length}</span>
          <span style={{ color: '#2563eb' }}>📦 Ya existían: {Object.values(estados).filter(v => v === 'existe').length}</span>
          <span style={{ color: '#ef4444' }}>❌ Errores: {Object.values(estados).filter(v => v === 'error').length}</span>
          <span style={{ color: darkMode ? '#ffffff' : '#1e293b' }}>Total: {Object.keys(estados).length} / {MEDICAMENTOS.length}</span>
        </div>
      )}
    </div>
  );
}

export default DevToolsView;
