export const ROLES = {
  ADMIN_MAX: "ADMIN_MAX",
  ADMIN_LOGISTICA: "ADMIN_LOGISTICA",
  ADMIN_CONTABILIDAD: "ADMIN_CONTABILIDAD",
};

export const menuByRole = {
  ADMIN_MAX: [
    { label: "Dashboard", path: "/dashboard/admin" },
    { label: "Usuarios", path: "/dashboard/admin/usuarios" },
    { label: "Cursos", path: "/dashboard/admin/cursos" },
    { label: "Secciones", path: "/dashboard/admin/secciones" },
    { label: "Pagos", path: "/dashboard/admin/pagos" },
    { label: "Facturas", path: "/dashboard/admin/facturas" },
    { label: "Auditoría", path: "/dashboard/admin/auditoria" },
  ],

  ADMIN_COMPRAS: [
    { label: "Dashboard", path: "/compras" },
    { label: "Movimientos", path: "/compras/movimientos" },
    { label: "Nuevo Producto", path: "/compras/productos/nuevo" }
  ],
  ADMIN_LOGISTICA: [
    { label: "Pendientes", path: "/logistica" },
    { label: "Cambios de almacén", path: "/logistica/cambios" }
  ],
  ADMIN_CONTABILIDAD: [
    { label: "Pendientes", path: "/contabilidad" },
    { label: "Historial", path: "/contabilidad/historial" },
    { label: "Productos", path: "/contabilidad/productos" },
  ],
};
