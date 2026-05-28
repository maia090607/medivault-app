export const COLORS = {
  primary: '#2563eb',
  primaryDark: '#1d4ed8',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  info: '#06b6d4',
  purple: '#8b5cf6',
  pink: '#ec4899',
};

export const FONT = '"Inter", "Segoe UI", Roboto, sans-serif';

export const container = (dark) => ({
  padding: '24px 30px',
  fontFamily: FONT,
  background: dark ? '#0f172a' : '#f8fafc',
  minHeight: '100vh',
  width: '100%',
  boxSizing: 'border-box',
  color: dark ? '#f1f5f9' : '#1e293b',
});

export const topBar = (dark) => ({
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  background: dark ? '#1e293b' : '#1e3a8a',
  padding: '16px 24px',
  borderRadius: '12px',
  boxShadow: '0 2px 8px rgba(0,0,0,0.08)',
  marginBottom: '24px',
  color: '#ffffff',
});

export const nav = {
  display: 'flex',
  flexWrap: 'wrap',
  gap: '10px',
  marginBottom: '24px',
};

export const btnNav = (act, dark) => ({
  padding: '12px 22px',
  borderRadius: '8px',
  fontWeight: '700',
  fontSize: '0.9rem',
  cursor: 'pointer',
  border: act ? 'none' : (dark ? '1px solid #334155' : '1px solid #cbd5e1'),
  background: act ? COLORS.primary : (dark ? '#1e293b' : '#ffffff'),
  color: act ? '#ffffff' : (dark ? '#94a3b8' : '#4b5563'),
  boxShadow: act ? `0 4px 6px rgba(37,99,235,0.15)` : 'none',
});

export const card = (dark) => ({
  background: dark ? '#1e293b' : '#ffffff',
  padding: '30px',
  borderRadius: '12px',
  border: dark ? '1px solid #334155' : '1px solid #e2e8f0',
  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  marginBottom: '24px',
  width: '100%',
  boxSizing: 'border-box',
  position: 'relative',
});

export const input = (dark) => ({
  padding: '12px 14px',
  width: '100%',
  boxSizing: 'border-box',
  border: dark ? '1px solid #475569' : '1px solid #cbd5e1',
  borderRadius: '8px',
  background: dark ? '#0f172a' : '#ffffff',
  color: dark ? '#ffffff' : '#0f172a',
  marginBottom: '16px',
  outline: 'none',
  fontSize: '0.95rem',
});

export const label = (dark) => ({
  fontWeight: '700',
  display: 'block',
  marginBottom: '8px',
  color: dark ? '#cbd5e1' : '#1e293b',
  fontSize: '0.95rem',
});

export const btnAction = {
  background: COLORS.primary,
  color: '#ffffff',
  border: 'none',
  padding: '12px 24px',
  borderRadius: '8px',
  fontWeight: '700',
  fontSize: '0.95rem',
  cursor: 'pointer',
};

export const badge = (tipo) => {
  let bg = '#fef3c7', col = '#92400e';
  if (tipo === 'Entregado' || tipo === 'Dispensado') { bg = '#d1fae5'; col = '#065f46'; }
  if (tipo === 'contactado') { bg = '#dbeafe'; col = '#1e40af'; }
  if (tipo === 'Pendiente') { bg = '#fef3c7'; col = '#92400e'; }
  return {
    padding: '4px 8px',
    borderRadius: '12px',
    fontSize: '0.8rem',
    fontWeight: '600',
    background: bg,
    color: col,
    display: 'inline-block',
  };
};

export const sugBox = {
  background: '#ffffff',
  border: '1px solid #cbd5e1',
  borderRadius: '8px',
  overflow: 'hidden',
  marginTop: '-12px',
  marginBottom: '20px',
  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  zIndex: 50,
  position: 'relative',
};

export const sugItem = {
  padding: '12px 16px',
  cursor: 'pointer',
  borderBottom: '1px solid #f1f5f9',
  color: '#0f172a',
  fontSize: '0.95rem',
  fontWeight: '600',
  textAlign: 'left',
  backgroundColor: '#ffffff',
  transition: 'background-color 0.2s ease',
};

export const pagBtn = (disabled, dark) => ({
  padding: '8px 16px',
  borderRadius: '6px',
  border: '1px solid #cbd5e1',
  background: dark ? '#1e293b' : '#ffffff',
  color: dark ? '#ffffff' : '#1e293b',
  cursor: disabled ? 'not-allowed' : 'pointer',
  opacity: disabled ? 0.5 : 1,
  fontWeight: '600',
  fontSize: '0.85rem',
});

export const fadeInKeyframes = `@keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }`;

export function createStyles(dark) {
  return {
    container: container(dark),
    topBar: topBar(dark),
    nav,
    btnNav: (act) => btnNav(act, dark),
    card: card(dark),
    input: input(dark),
    label: label(dark),
    btnAction,
    btnSuccess: { background: COLORS.success, color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' },
    btnSecondary: { background: '#64748b', color: '#ffffff', border: 'none', padding: '12px 24px', borderRadius: '8px', fontWeight: '700', fontSize: '0.95rem', cursor: 'pointer' },
    sugBox,
    sugItem,
    badge: (tipo) => badge(tipo),
    pagBtn: (disabled) => pagBtn(disabled, dark),
    table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' },
    th: { padding: '12px', textAlign: 'left', color: dark ? '#ffffff' : '#1f2937', borderBottom: '1px solid #e5e7eb', background: dark ? '#0f172a' : '#f9fafb', fontWeight: '700' },
    td: { padding: '12px', borderBottom: '1px solid #f3f4f6', color: dark ? '#ffffff' : '#1f2937', fontSize: '0.9rem' },
    select: { padding: '12px 14px', width: '100%', boxSizing: 'border-box', border: dark ? '1px solid #475569' : '1px solid #cbd5e1', borderRadius: '8px', background: dark ? '#0f172a' : '#ffffff', color: dark ? '#ffffff' : '#0f172a', marginBottom: '16px', outline: 'none', fontSize: '0.95rem', cursor: 'pointer' },
  };
}
