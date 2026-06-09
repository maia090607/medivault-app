import React, { useState } from 'react';
import { collection, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase';

export default function MigrarFechasView({ darkMode }) {
  const [running, setRunning] = useState(false);
  const [logs, setLogs] = useState([]);
  const [stats, setStats] = useState({ recetas: 0, historiales: 0, fallas: 0 });

  const agregarLog = (msg, tipo = 'info') => setLogs(prev => [...prev, { msg, tipo }]);

  const iniciar = async () => {
    setRunning(true);
    setLogs([]);
    const st = { recetas: 0, historiales: 0, fallas: 0 };

    const migrar = async (nombreCol, campoFecha) => {
      agregarLog(`📂 Leyendo ${nombreCol}...`);
      const snap = await getDocs(collection(db, nombreCol));
      agregarLog(`   → ${snap.docs.length} documentos`);
      let ok = 0;
      for (let i = 0; i < snap.docs.length; i++) {
        const d = snap.docs[i];
        const data = d.data();
        const val = data[campoFecha];
        agregarLog(`   🔍 #${d.id.slice(0,8)}… "${campoFecha}" → tipo: ${typeof val} | valor: ${JSON.stringify(val)}`, 'info');
        if (val === undefined || val === null) {
          agregarLog(`   ⏭️ campo ausente`, 'info');
          continue;
        }
        let fecha = null;
        if (typeof val === 'string' && val.includes('T')) {
          const iso = new Date(val);
          if (!isNaN(iso.getTime())) {
            const m = iso.getMonth();
            const dia = iso.getDate();
            fecha = new Date(2026, dia - 1, m + 1);
            agregarLog(`   🔄 ISO: ${val.split('T')[0]} → swap (mes=${m+1}, día=${dia}) → ${fecha.toISOString().split('T')[0]}`, 'info');
          }
        } else if (typeof val === 'string') {
          const pts = val.match(/(\d{1,2})\/(\d{1,2})/);
          if (pts) {
            const m = parseInt(pts[2], 10) - 1;
            const dia = parseInt(pts[1], 10);
            fecha = new Date(2026, m, dia);
          } else {
            fecha = new Date(val);
            if (!isNaN(fecha.getTime())) {
              fecha = new Date(2026, fecha.getDate() - 1, fecha.getMonth() + 1);
            }
          }
        } else if (typeof val === 'object' && typeof val.toDate === 'function') {
          const d = val.toDate();
          fecha = new Date(2026, d.getDate() - 1, d.getMonth() + 1);
        } else if (val instanceof Date) {
          fecha = new Date(2026, val.getDate() - 1, val.getMonth() + 1);
        } else if (typeof val === 'number') {
          const d = new Date(val);
          fecha = new Date(2026, d.getDate() - 1, d.getMonth() + 1);
        }
        if (!fecha || isNaN(fecha.getTime())) {
          st.fallas++;
          agregarLog(`   ❌ no se pudo parsear`, 'err');
          continue;
        }
        const iso = fecha.toISOString();
        try {
          await updateDoc(doc(db, nombreCol, d.id), { [campoFecha]: iso });
          ok++;
          agregarLog(`   ✅ "${val}" → ${iso.split('T')[0]}`, 'ok');
        } catch (e) {
          st.fallas++;
          agregarLog(`   ❌ error Firestore: ${e.message}`, 'err');
        }
      }
      agregarLog(`   ✅ ${ok} fechas migradas en ${nombreCol}`, 'ok');
      return ok;
    };

    try {
      st.recetas = await migrar('recetas', 'fecha');
      st.historiales = await migrar('historiales', 'ultimaVisita');
      setStats(st);
      const total = st.recetas + st.historiales;
      const msg = `\n✅ Migración completada. ${total} fechas actualizadas.${st.fallas ? ` ⚠️ ${st.fallas} no pudieron parsearse.` : ''}`;
      agregarLog(msg, st.fallas ? 'err' : 'ok');
    } catch (err) {
      agregarLog(`❌ Error: ${err.message}`, 'err');
    } finally {
      setRunning(false);
    }
  };

  const bg = darkMode ? '#1e293b' : '#ffffff';
  const fg = darkMode ? '#f1f5f9' : '#1f2937';
  const logBg = darkMode ? '#0f172a' : '#f8fafc';

  return (
    <div style={{ background: bg, color: fg, padding: '24px', borderRadius: '12px', maxWidth: '600px', margin: '0 auto' }}>
      <h2 style={{ margin: '0 0 8px 0' }}>🔄 Migrar Fechas a ISO</h2>
      <p style={{ color: '#64748b', margin: '0 0 16px 0', fontSize: '0.9rem' }}>
        Convierte fechas en formato local (ej: <code>6/8/2026</code>) a ISO (<code>2026-06-08T...</code>)
        en las colecciones <strong>recetas</strong> e <strong>historiales</strong>.
      </p>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '16px' }}>
        <div style={{ flex: 1, background: logBg, padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>{stats.recetas}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Recetas</div>
        </div>
        <div style={{ flex: 1, background: logBg, padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#2563eb' }}>{stats.historiales}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Historiales</div>
        </div>
        <div style={{ flex: 1, background: logBg, padding: '12px', borderRadius: '8px', textAlign: 'center' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 700, color: stats.fallas ? '#ef4444' : '#22c55e' }}>{stats.fallas}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748b', textTransform: 'uppercase' }}>Errores</div>
        </div>
      </div>

      <div style={{ background: logBg, padding: '12px', borderRadius: '8px', maxHeight: '300px', overflowY: 'auto', fontFamily: 'monospace', fontSize: '0.8rem', marginBottom: '16px', whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
        {logs.length === 0 && <span style={{ color: '#94a3b8' }}>Presiona "Iniciar migración" para comenzar.</span>}
        {logs.map((l, i) => (
          <div key={i} style={{ color: l.tipo === 'ok' ? '#22c55e' : l.tipo === 'err' ? '#ef4444' : '#60a5fa' }}>{l.msg}</div>
        ))}
      </div>

      <button onClick={iniciar} disabled={running} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: 'none', fontWeight: 600, fontSize: '1rem', cursor: running ? 'not-allowed' : 'pointer', opacity: running ? 0.5 : 1, background: '#2563eb', color: '#fff' }}>
        {running ? 'Migrando…' : '▶ Iniciar migración'}
      </button>
    </div>
  );
}