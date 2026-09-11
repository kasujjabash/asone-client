/**
 * Query keys.
 *
 * Plain arrays describing resource identity — no React here, which is why
 * they sit beside the resources they name rather than in a feature. Keeping
 * them central is what makes cross-feature invalidation possible: posting a
 * receipt has to invalidate stock levels, and the receipt code should not
 * have to guess how the inventory feature spelled its key.
 */

export const keys = {
  // Dashboard — all scoped by warehouse, so the filter is part of the key.
  summary: (warehouseId: number | null) => ['dashboard', 'summary', warehouseId] as const,
  attention: (warehouseId: number | null) => ['dashboard', 'attention', warehouseId] as const,
  activity: (warehouseId: number | null) => ['dashboard', 'activity', warehouseId] as const,
  orderVolume: (warehouseId: number | null) =>
    ['dashboard', 'order-volume', warehouseId] as const,
  notifications: (warehouseId: number | null) =>
    ['dashboard', 'notifications', warehouseId] as const,
  inventoryByWarehouse: (warehouseId: number | null) =>
    ['dashboard', 'inventory-by-warehouse', warehouseId] as const,

  stockLevels: (warehouseId: number | null) => ['stock-levels', warehouseId] as const,
  reorderAlerts: (warehouseId: number | null) => ['reorder-alerts', warehouseId] as const,
  movements: (warehouseId: number | null) => ['movements', warehouseId] as const,
  ordersOnHold: () => ['orders', 'on-hold'] as const,
  ordersPartProcessed: () => ['orders', 'part-processed'] as const,
  backorders: () => ['orders', 'backorders'] as const,
  receipts: () => ['receipts'] as const,
  warehouses: () => ['warehouses'] as const,

  // Locations. Listed separately rather than under one 'catalog' key so
  // saving a school does not refetch every tailoring center.
  tailoringCenters: () => ['tailoring-centers'] as const,
  schools: () => ['schools'] as const,

  // Users & Roles. `roles` is the fixed list of five and never changes, so
  // it can be cached hard; `users` changes whenever a lead adds somebody.
  users: (filters?: Record<string, unknown>) =>
    filters ? (['users', filters] as const) : (['users'] as const),
  user: (id: number) => ['users', id] as const,
  roles: () => ['roles'] as const,

  // Settings — the signed-in user. Invalidate after editing own details or
  // changing a password, since the password change returns fresh tokens.
  me: () => ['me'] as const,
} as const
