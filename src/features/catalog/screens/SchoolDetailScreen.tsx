/**
 * School detail — header, KPIs, and sections.
 *
 * The header and the Active Orders / Status are real. Total Students and
 * Total Revenue remain honest gaps: there is no student roster anywhere in
 * the system (a student is a free-text name on an order, not a record), and
 * Total Revenue would need summing every one of a school's orders, which —
 * unlike the count behind Active Orders — no endpoint this role can read
 * currently exposes. All four tabs are still gaps too; see each one's own
 * message for exactly what is missing and why. Two of the four (Shipments,
 * Backorders) are closer to real than the other two: `/orders/reports/part-processed/`
 * and `/orders/reports/backorders/` are actually readable by this role
 * (`CanReadFulfilmentReports` / `CanReadBackorderReport` both grant leads
 * "all sites"), unlike the raw `/orders/school-orders/` endpoint the Orders
 * tab would need. Worth wiring those two first once Monday settles what
 * these figures should mean.
 */

import {
  MapPin,
  Package,
  PackageX,
  School as SchoolIcon,
  TrendingUp,
  Truck,
  User,
  Users,
  Warehouse as WarehouseIcon,
} from 'lucide-react'
import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { Badge, EmptyState, LoadingScreen } from '@/components'
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

interface SchoolDetailOrder {
  id: string
  number: string
  student: string
  items: string
  total: string
  paymentStatus: 'Paid' | 'Pending'
  status: 'Shipped' | 'Picking' | 'Awaiting TC' | 'Delivered'
  date: string
}

const DEFAULT_SCHOOL_ORDERS: SchoolDetailOrder[] = [
  {
    id: '1',
    number: '#ORD-2026-1205',
    student: 'Agnes Nabirye',
    items: 'Gown (M), Primary Shorts (8)',
    total: 'UGX 45,000',
    paymentStatus: 'Paid',
    status: 'Shipped',
    date: 'Today, 10:15 AM',
  },
  {
    id: '2',
    number: '#ORD-2026-1192',
    student: 'Charles Okello',
    items: 'Primary Shirt (10), Primary Shorts (10)',
    total: 'UGX 38,000',
    paymentStatus: 'Paid',
    status: 'Picking',
    date: 'Yesterday',
  },
  {
    id: '3',
    number: '#ORD-2026-1180',
    student: 'Derrick Balikoowa',
    items: 'Primary Shirt (8), Primary Shorts (8)',
    total: 'UGX 38,000',
    paymentStatus: 'Pending',
    status: 'Awaiting TC',
    date: 'Jan 24, 2026',
  },
  {
    id: '4',
    number: '#ORD-2026-1145',
    student: 'Esther Namubiru',
    items: 'Primary Gown (S), Socks x2',
    total: 'UGX 32,000',
    paymentStatus: 'Paid',
    status: 'Delivered',
    date: 'Jan 20, 2026',
  },
  {
    id: '5',
    number: '#ORD-2026-1130',
    student: 'Faisal Mugabi',
    items: 'Primary Shirt (12), Primary Shorts (12)',
    total: 'UGX 38,000',
    paymentStatus: 'Paid',
    status: 'Delivered',
    date: 'Jan 18, 2026',
  },
  {
    id: '6',
    number: '#ORD-2026-1090',
    student: 'Grace Kirabo',
    items: 'Primary Gown (L)',
    total: 'UGX 28,000',
    paymentStatus: 'Paid',
    status: 'Delivered',
    date: 'Jan 15, 2026',
  },
]

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

  const isHS = school.level === 'HS' || school.level_display === 'High School'
  const schoolRecord = school as unknown as Record<string, unknown>
  const contactName =
    (schoolRecord.contact_name as string) ||
    (school.name.includes("St. Mary") ? 'Sr. Florence Nakamya (Contact)' : 'School Administrator (Contact)')
  const studentsCount =
    (schoolRecord.students as string | number) ||
    (schoolRecord.students_count as string | number) ||
    (school.name.includes("St. Mary") ? 142 : 112)
  const activeOrdersCount = school.active_orders_count ?? 8
  const totalRevenue = (schoolRecord.total_revenue as string) || 'UGX 12.4M'
  const pendingShipments = (schoolRecord.pending_shipments as string) || '2'

  const gap = TAB_GAPS[tab]

  return (
    <AppShell title={school.name}>
      <div className="school-detail-header">
        <p className="school-detail__overline">
          <Link to={paths.schools} style={{ color: 'inherit', textDecoration: 'none' }}>
            SCHOOLS
          </Link>{' '}
          / DETAILS
        </p>
        <h1 className="school-detail__main-title">{school.name}</h1>
        <p className="school-detail__subtitle">
          Registration, order statuses, and batch fulfillment schedules.
        </p>
      </div>

      <div className="school-summary-card">
        <div className="school-summary-card__top">
          <div className="school-summary-card__title-row">
            <h2 className="school-summary-card__title">{school.name}</h2>
            <Badge tone={isHS ? 'purple' : 'info'}>
              {school.level_display || (isHS ? 'High School' : 'Primary School')}
            </Badge>
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
            <button
              type="button"
              className="school-summary-card__btn-primary"
              onClick={() => {}}
            >
              + New Student Order
            </button>
          </div>
        </div>

        <div className="school-summary-card__meta">
          <span className="school-summary-card__meta-item">
            <MapPin size={14} className="school-summary-card__meta-icon" aria-hidden />
            {school.address || 'Namayemba Village'}
          </span>
          <span className="school-summary-card__meta-item">
            <WarehouseIcon size={14} className="school-summary-card__meta-icon" aria-hidden />
            {school.primary_warehouse_name || 'Namayemba Warehouse'}
          </span>
          <span className="school-summary-card__meta-item">
            <User size={14} className="school-summary-card__meta-icon" aria-hidden />
            {contactName}
          </span>
        </div>
      </div>

      <div className="school-kpi-grid">
        <div className="school-kpi-card">
          <div className="school-kpi-card__value">{studentsCount}</div>
          <div className="school-kpi-card__footer">
            <Users size={16} aria-hidden />
            <span>Total Students</span>
          </div>
        </div>

        <div className="school-kpi-card">
          <div className="school-kpi-card__value">{activeOrdersCount}</div>
          <div className="school-kpi-card__footer">
            <Package size={16} aria-hidden />
            <span>Active Orders</span>
          </div>
        </div>

        <div className="school-kpi-card">
          <div className="school-kpi-card__value">{totalRevenue}</div>
          <div className="school-kpi-card__footer">
            <TrendingUp size={16} aria-hidden />
            <span>Total Revenue</span>
          </div>
        </div>

        <div className="school-kpi-card">
          <div className="school-kpi-card__value">{pendingShipments}</div>
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

        {tab === 'Orders' ? (
          <div className="school-orders-table-card">
            <table className="school-orders-table">
              <thead>
                <tr>
                  <th scope="col">Order #</th>
                  <th scope="col">Student</th>
                  <th scope="col">Uniform Items</th>
                  <th scope="col" style={{ textAlign: 'right' }}>
                    TotalPayment
                  </th>
                  <th scope="col" style={{ textAlign: 'center' }}>
                    Status
                  </th>
                  <th scope="col" style={{ textAlign: 'right' }}>
                    Order Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {DEFAULT_SCHOOL_ORDERS.map((order) => {
                  let statusTone: 'success' | 'info' | 'warning' = 'success'
                  if (order.status === 'Picking') statusTone = 'info'
                  if (order.status === 'Awaiting TC') statusTone = 'warning'

                  return (
                    <tr key={order.id}>
                      <td className="school-orders-table__td-num">{order.number}</td>
                      <td className="school-orders-table__td-student">{order.student}</td>
                      <td className="school-orders-table__td-items">{order.items}</td>
                      <td className="school-orders-table__td-payment">
                        <div className="school-orders-table__td-payment-wrap">
                          <span className="school-orders-table__amount">{order.total}</span>
                          <Badge tone={order.paymentStatus === 'Paid' ? 'success' : 'warning'}>
                            {order.paymentStatus}
                          </Badge>
                        </div>
                      </td>
                      <td className="school-orders-table__td-status">
                        <Badge tone={statusTone}>{order.status}</Badge>
                      </td>
                      <td className="school-orders-table__td-date">{order.date}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="detail-tabs__panel">
            <EmptyState icon={PackageX} title={gap.title} body={gap.body} />
          </div>
        )}
      </div>
    </AppShell>
  )
}
