function listarTop(arr, campo, limite = 5) {
  if (!arr || arr.length === 0) return 'Ninguno';
  const conteo = {};
  arr.forEach(item => {
    const val = item[campo] || 'Desconocido';
    conteo[val] = (conteo[val] || 0) + 1;
  });
  return Object.entries(conteo)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limite)
    .map(([k, v]) => `${k} (${v})`)
    .join(', ');
}

function listarStockCritico(inventario, limite = 5) {
  const criticos = (inventario || []).filter(i => (parseInt(i.stock, 10) || 0) <= 10);
  if (criticos.length === 0) return 'Ninguno con stock crítico';
  return criticos.slice(0, limite).map(i => `${i.nombre}: ${i.stock} Uds`).join(', ');
}

export function construirContexto(datos) {
  const {
    recetasValidas = [],
    recetasPendientes = [],
    recetasDispensadas = [],
    inventarioValido = [],
    pacientesValidos = [],
    usuariosValidos = [],
    solicitudesValidas = [],
    vistaActual = 'dashboard',
  } = datos;

  const seccion = vistaActual === 'dashboard' ? 'Panel principal'
    : vistaActual === 'recetas' ? 'Sección de Recetas'
    : vistaActual === 'solicitudes' ? 'Sección de Solicitudes'
    : vistaActual === 'usuarios' ? 'Sección de Usuarios'
    : vistaActual === 'inventario' ? 'Sección de Inventario'
    : vistaActual === 'pacientes' ? 'Sección de Pacientes'
    : 'Notificaciones';

  const criticos = inventarioValido.filter(i => (parseInt(i.stock, 10) || 0) <= 10);
  const medicos = usuariosValidos.filter(u => u.role === 'medico').length;
  const farmacias = usuariosValidos.filter(u => u.role === 'farmacia').length;
  const admins = usuariosValidos.filter(u => u.role === 'admin').length;

  return `- Vista actual del usuario: ${seccion}
- Recetas totales: ${recetasValidas.length} (Pendientes: ${recetasPendientes.length}, Dispensadas/Entregadas: ${recetasDispensadas.length})
- Pacientes registrados: ${pacientesValidos.length}
- Usuarios: ${usuariosValidos.length} (Médicos: ${medicos}, Farmacia: ${farmacias}, Admin: ${admins})
- Medicamentos en inventario: ${inventarioValido.length} (Stock crítico: ${criticos.length})
- Solicitudes de demo: ${solicitudesValidas.length}
- Top 5 médicos con más recetas: ${listarTop(recetasValidas, 'medico')}
- Top 5 medicamentos más recetados: ${listarTop(recetasValidas.flatMap(r => Array.isArray(r.medicamento) ? r.medicamento : []), 'nombre')}
- Stock crítico: ${listarStockCritico(inventarioValido)}`;
}
