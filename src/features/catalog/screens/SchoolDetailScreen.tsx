/**
 * School detail — header, KPIs, and sections.
 *
 * The header, Active Orders, and Status are real. Total Students and Total
 * Revenue remain honest gaps: there is no student roster anywhere in the
 * system (a student is a free-text name on an order, not a record), and
 * Total Revenue would need summing every one of a school's orders, which —
 * unlike the count behind Active Orders — no endpoint this role can read
 * currently exposes. All four tabs are gaps too; see each one's own message
 * for exactly what is missing and why. Two of the four (Shipments,
 * Backorders) are closer to real than the other two:
 * `/orders/reports/part-processed/` and `/orders/reports/backorders/` are
 * actually readable by this role (`CanReadFulfilmentReports` /
 * `CanReadBackorderReport` both grant leads "all sites"), unlike the raw
 * `/orders/school-orders/` endpoint the Orders tab would need. Worth wiring
 * those two first once Monday settles what these figures should mean.
 *
 * Earlier drafts of this screen filled the gaps with fake numbers — a
 * hardcoded demo-orders table shown for every school regardless of which
 * one was open, and per-school KPI figures keyed off the school's name.
 * Both are removed: a dash that says why is honest, but numbers that look
 * real and are not are actively misleading, worse than the gap they were
 * covering.
 */

import {
  MapPin,
  Package,
  PackageX,
  School as SchoolIcon,
  TrendingUp,
  Truck,
  Users,
  Warehouse as WarehouseIcon,
} from 'lucide-react'
import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { Badge, Button, EmptyState, LoadingScreen } from '@/components'
import { AppShell } from '@/features/shell/components/AppShell'
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
      <div className="school-detail-header">
        <p className="school-detail__overline">Schools / Details</p>
        <h1 className="school-detail__main-title">{school.name}</h1>
        <p className="school-detail__subtitle">
          Registration, order statuses, and batch fulfillment schedules.
        </p>
      </div>

      <div className="school-summary-card">
        <div className="school-summary-card__top">
          <div className="school-summary-card__title-row">
            <h2 className="school-summary-card__title">{school.name}</h2>
            <Badge tone={school.level === 'HS' ? 'purple' : 'info'}>{school.level_display}</Badge>
            <Badge tone={school.is_active ? 'success' : 'neutral'}>
              {school.is_active ? 'Active' : 'Inactive'}
            </Badge>
          </div>

          <div className="school-summary-card__actions">
            <button
              type="button"
              className="school-summary-card__btn-secondary"
              onClick={() => navigate(paths.schoolEdit(school.id))}
            >
              Edit Details
            </button>
            <Button
              disabled
              title="Placing an order is School Staff only — a lead's account has no school to place one for."
            >
              + New Student Order
            </Button>
          </div>
        </div>

        <div className="school-summary-card__meta">
          {school.address && (
            <span className="school-summary-card__meta-item">
              <MapPin size={14} className="school-summary-card__meta-icon" aria-hidden />
              {school.address}
            </span>
          )}
          <span className="school-summary-card__meta-item">
            <WarehouseIcon size={14} className="school-summary-card__meta-icon" aria-hidden />
            {school.primary_warehouse_name}
          </span>
        </div>
      </div>

      <div className="school-kpi-grid">
        <div className="school-kpi-card">
          <div className="school-kpi-card__value">—</div>
          <div className="school-kpi-card__footer">
            <Users size={16} aria-hidden />
            <span>Total Students</span>
          </div>
        </div>

        <div className="school-kpi-card">
          <div className="school-kpi-card__value">{school.active_orders_count}</div>
          <div className="school-kpi-card__footer">
            <Package size={16} aria-hidden />
            <span>Active Orders</span>
          </div>
        </div>

        <div className="school-kpi-card">
          <div className="school-kpi-card__value">—</div>
          <div className="school-kpi-card__footer">
            <TrendingUp size={16} aria-hidden />
            <span>Total Revenue</span>
          </div>
        </div>

        <div className="school-kpi-card">
          <div className="school-kpi-card__value">—</div>
          <div className="school-kpi-card__footer">
            <Truck size={16} aria-hidden />
            <span>Pending Shipments</span>
          </div>
        </div>
      </div>

      <div className="school-tabs-container">
        <div className="school-tabs-nav">
          {TABS.map((t) => (
            <button
              key={t}
              type="button"
              className={`school-tabs-nav__item ${
                tab === t ? 'school-tabs-nav__item--active' : ''
              }`}
              onClick={() => setTab(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="detail-tabs__panel">
          <EmptyState icon={PackageX} title={gap.title} body={gap.body} />
        </div>
      </div>
    </AppShell>
  )
}
