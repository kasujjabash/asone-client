/**
 * School detail — header, KPIs, and sections.
 *
 * The header is real: everything on it is an actual field on `School`. The
 * four KPI tiles and all four tabs are deliberately built as honest gaps
 * rather than wired to invented numbers — see each tab's own message for
 * exactly what is missing and why. Two of the four (Shipments, Backorders)
 * are closer to real than the other two: `/orders/reports/part-processed/`
 * and `/orders/reports/backorders/` are actually readable by this role
 * (`CanReadFulfilmentReports` / `CanReadBackorderReport` both grant leads
 * "all sites"), unlike the raw `/orders/school-orders/` endpoint the Orders
 * tab would need. Worth wiring those two first once Monday settles what
 * these figures should mean.
 */

import { MapPin, PackageX, School as SchoolIcon, Users, Warehouse as WarehouseIcon } from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, EmptyState, LoadingScreen, Tabs } from '@/components'
import { AppShell } from '@/features/shell/components/AppShell'
import { KpiCard } from '@/features/dashboard/components/KpiCard'
import { paths } from '@/routes/paths'
import { useSchool } from '../hooks/useSchool'

const TABS = ['Orders', 'Students', 'Shipments', 'Backorders'] as const
type SchoolTab = (typeof TABS)[number]

const TAB_GAPS: Record<SchoolTab, { title: string; body: string }> = {
  Orders: {
    title: 'Orders — not available for this role yet',
    body: 'This needs /orders/school-orders/, which only School Staff and Finance can read today; Program Leads and Operations Managers get a 403. Worth asking Monday whether a lead should be able to view any school’s orders.',
  },
  Students: {
    title: 'Students — not a concept in the system yet',
    body: 'AsOne has no student roster. A student is a free-text name on an order, not a database record — showing a list here means deciding whether students become a real entity first.',
  },
  Shipments: {
    title: 'Shipments — not wired yet, but the data is reachable',
    body: '/orders/reports/part-processed/ (picked, awaiting despatch) is actually readable by this role already. Held back only because it has no school filter yet and the KPI definitions aren’t settled — a good candidate to build first.',
  },
  Backorders: {
    title: 'Backorders — not wired yet, but the data is reachable',
    body: '/orders/reports/backorders/ is readable by this role already, and it is the widest-audience report in the system. Held back for the same reason as Shipments: no school filter yet, and the figures haven’t been agreed.',
  },
}

export function SchoolDetailScreen() {
  const { id } = useParams<{ id: string }>()
  const schoolId = Number(id)
  const navigate = useNavigate()
  const { school, isLoading } = useSchool(schoolId)
  const [tab, setTab] = useState<SchoolTab>('Orders')

  if (isLoading) return <LoadingScreen message="Loading school…" />

  if (!school) {
    return (
      <AppShell title="School not found">
        <EmptyState
          icon={SchoolIcon}
          title="School not found"
          body="It may have been removed, or the link is wrong."
          action={{ label: 'Back to Schools', onClick: () => navigate(paths.schools) }}
        />
      </AppShell>
    )
  }

  const gap = TAB_GAPS[tab]

  return (
    <AppShell title={school.name}>
      <p className="t-overline">Schools / Details</p>

      <header className="page-head page-head--split">
        <div className="stack">
          <div className="detail-head__title-row">
            <h1 className="page-head__title">{school.name}</h1>
            <Badge tone={school.level === 'HS' ? 'neutral' : 'info'}>
              {school.level_display}
            </Badge>
          </div>

          <div className="detail-head__meta">
            {school.address && (
              <span className="detail-head__meta-item">
                <MapPin size={14} aria-hidden />
                {school.address}
              </span>
            )}
            <span className="detail-head__meta-item">
              <WarehouseIcon size={14} aria-hidden />
              {school.primary_warehouse_name}
            </span>
          </div>
        </div>

        <div className="detail-head__actions">
          <Button variant="secondary" onClick={() => navigate(paths.schoolEdit(school.id))}>
            Edit Details
          </Button>
          <Button
            disabled
            title="Placing an order is School Staff only — a lead's account has no school to place one for."
          >
            + New Student Order
          </Button>
        </div>
      </header>

      <div className="kpi-row">
        <KpiCard label="Total Students" value="—" caption="No student roster exists yet" icon={Users} />
        <KpiCard
          label="Active Orders"
          value="—"
          caption="Needs an endpoint this role can read"
          icon={PackageX}
        />
        <KpiCard
          label="Total Revenue"
          value="—"
          caption="Needs an endpoint this role can read"
          icon={PackageX}
        />
        <KpiCard
          label="Pending Shipments"
          value="—"
          caption="Reachable — not wired to this school yet"
          icon={PackageX}
        />
      </div>

      <div className="detail-tabs">
        <Tabs tabs={TABS} active={tab} onChange={setTab} label="School sections" />

        <div className="detail-tabs__panel">
          <EmptyState icon={PackageX} title={gap.title} body={gap.body} />
        </div>
      </div>
    </AppShell>
  )
}
