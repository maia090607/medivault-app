import React from 'react';

export default function MetricCard({ label, value, color, darkMode }) {
  return (
    <div style={{
      background: darkMode ? '#1e293b' : '#ffffff',
      borderRadius: '12px',
      padding: '24px',
      textAlign: 'center',
      border: darkMode ? '1px solid #334155' : '1px solid #e2e8f0',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)'
    }}>
      <div style={{ fontSize: '2rem', fontWeight: '800', color: color || '#2563eb' }}>{value}</div>
      <div style={{ fontSize: '0.85rem', color: darkMode ? '#94a3b8' : '#64748b', fontWeight: '600', marginTop: '4px' }}>{label}</div>
    </div>
  );
}
