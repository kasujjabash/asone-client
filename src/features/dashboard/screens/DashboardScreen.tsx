/**
 * Dashboard — Figma 2001:424.
 *
 * Composes the panels and owns nothing else. Every figure comes from
 * `useDashboardData`, which is one query per section so a slow or forbidden
 * one cannot blank the rest.
 *
 * The heading names what is being shown: a warehouse when the filter is
 * narrowed to one, "All warehouses" otherwise. The design's "Namayemba
 * Central Hub" is that heading for a warehouse-scoped user.
 *
 * The weekly-report banner renders with its download disabled — there is no
 * report endpoint — and the daily-orders chart rolls its series up on the
 * client because there is no daily-totals endpoint either. Both say so
 * where it matters rather than in a comment nobody reads.
 */

import { useAuth } from '@/features/auth/hooks/useAuth'
import { AppShell } from '@/features/shell/components/AppShell'
import { useWarehouseFilter } from '@/features/shell/hooks/useWarehouseFilter'
import { ActivityTimeline } from '../components/ActivityTimeline'
import { DailyOrdersChart } from '../components/DailyOrdersChart'
import { KpiRow } from '../components/KpiRow'
import { NeedsAttention } from '../components/NeedsAttention'
import { WarehouseBreakdown } from '../components/WarehouseBreakdown'
import { WeeklyReportBanner } from '../components/WeeklyReportBanner'
import { useDailyOrders } from '../hooks/useDailyOrders'
import { useDashboardData } from '../hooks/useDashboardData'

export function DashboardScreen() {
  const { user } = useAuth()
  const { warehouseName, canSwitch } = useWarehouseFilter()
  const data = useDashboardData()
  const daily = useDailyOrders()

  const heading = warehouseName ?? (canSwitch ? 'All warehouses' : 'All locations')

  return (
    <AppShell title="Dashboard overview">
      <header className="page-head">
        <h1 className="page-head__title">{heading}</h1>
        <p className="page-head__subtitle">
          {warehouseName
            ? `Showing ${warehouseName} only`
            : 'Uniform inventory, picking queue and tailoring reconciliation'}
          {user ? ` · ${user.role_display}` : ''}
        </p>
      </header>

      <KpiRow data={data} />

      <div className="dashboard__columns">
        <div className="dashboard__col">
          <NeedsAttention data={data} />
          <ActivityTimeline data={data} />
        </div>
        <div className="dashboard__col dashboard__col--narrow">
          <WeeklyReportBanner />
          <WarehouseBreakdown data={data} />
          <DailyOrdersChart data={daily} />
        </div>
      </div>
    </AppShell>
  )
}
