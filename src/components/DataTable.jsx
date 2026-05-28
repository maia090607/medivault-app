import React from 'react';
import { input as inputStyle, badge as badgeStyle } from '../theme';

export default function DataTable({
  columns = [],
  data = [],
  searchValue = '',
  onSearchChange,
  searchPlaceholder = 'Buscar...',
  emptyMessage = 'No hay datos disponibles.',
  darkMode = false,
  keyExtractor = (item) => item.id,
  renderRow,
  children,
}) {
  const stInput = inputStyle(darkMode);

  return (
    <div>
      {onSearchChange && (
        <input
          style={stInput}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={e => onSearchChange(e.target.value)}
        />
      )}
      {children ? children : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ background: darkMode ? '#0f172a' : '#f9fafb', borderBottom: '1px solid #e5e7eb' }}>
                {columns.map((col, i) => (
                  <th key={i} style={{
                    padding: '12px',
                    textAlign: col.align || 'left',
                    color: darkMode ? '#ffffff' : '#1f2937',
                    fontWeight: '700',
                    borderBottom: '1px solid #e5e7eb',
                  }}>{col.label}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.length > 0 ? data.map(item => (
                <tr key={keyExtractor(item)} style={{ borderBottom: '1px solid #f3f4f6' }}>
                  {columns.map((col, i) => (
                    <td key={i} style={{
                      padding: '12px',
                      textAlign: col.align || 'left',
                      color: darkMode ? '#ffffff' : '#1f2937',
                      fontSize: '0.9rem',
                    }}>
                      {col.render ? col.render(item) : item[col.key]}
                    </td>
                  ))}
                </tr>
              )) : (
                <tr>
                  <td colSpan={columns.length} style={{
                    padding: '40px',
                    textAlign: 'center',
                    color: '#94a3b8',
                    fontWeight: '500',
                  }}>{emptyMessage}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function Badge({ type, children }) {
  const st = badgeStyle(type);
  return <span style={st}>{children}</span>;
}
