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

  // Schools — master data, so the list is invalidated as a whole on any
  // write rather than patched row by row.
  schools: (
    level: string | null,
    warehouseId: number | null,
    isActive: boolean | null,
    page: number,
  ) => ['schools', level, warehouseId, isActive, page] as const,
  school: (id: number) => ['schools', 'detail', id] as const,
} as const
