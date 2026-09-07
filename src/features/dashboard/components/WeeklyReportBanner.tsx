import { useMutation, useQuery } from '@tanstack/react-query'
import * as dashboardApi from '@/api/dashboard'
import { Spinner, snackbar } from '@/components'
import { useWarehouseFilter } from '@/features/shell/hooks/useWarehouseFilter'

/**
 * Inventory Weekly Report — Figma 2001:415.
 *
 * Poppins at the design's sizes: SemiBold 20px headline, Medium 12px for the
 * range and the button.
 *
 * The week comes from the server, not from the client's clock. It reports
 * `date_from` and `date_to` for the report it actually built, so the banner
 * cannot claim a week the file does not cover — and the design's fixed
 * "01 - 07, September 2026" would have been wrong the following Monday.
 *
 * The download goes through the transport rather than a plain link: the
 * endpoint needs the bearer token, and an anchor cannot send one. The file
 * comes back as a blob and is handed to the browser here.
 */

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]

/** "31 August - 06 September 2026" from the server's two dates. */
function formatRange(from: string, to: string): string {
  const start = new Date(from)
  const end = new Date(to)
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return ''

  const pad = (value: number) => String(value).padStart(2, '0')
  const sameMonth = start.getMonth() === end.getMonth()

  return sameMonth
    ? `${pad(start.getDate())} - ${pad(end.getDate())}, ${MONTHS[end.getMonth()]} ${end.getFullYear()}`
    : `${pad(start.getDate())} ${MONTHS[start.getMonth()]} - ${pad(end.getDate())} ${MONTHS[end.getMonth()]} ${end.getFullYear()}`
}

export function WeeklyReportBanner() {
  const { warehouseId } = useWarehouseFilter()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard', 'weekly-report', warehouseId],
    queryFn: () => dashboardApi.weeklyReport({ warehouse: warehouseId }),
  })

  const download = useMutation({
    mutationFn: () => dashboardApi.downloadWeeklyReport({ warehouse: warehouseId }),
    onSuccess: ({ blob, filename }) => {
      // Object URLs leak until revoked, so the handle is released as soon as
      // the click has been dispatched.
      const url = URL.createObjectURL(blob)
      const anchor = document.createElement('a')
      anchor.href = url
      anchor.download = filename
      anchor.click()
      URL.revokeObjectURL(url)
      snackbar.success('Weekly report downloaded', filename)
    },
    // The failure message comes from the shared mutation handler.
  })

  const range = data ? formatRange(data.date_from, data.date_to) : ''
  const hasRows = (data?.rows.length ?? 0) > 0

  return (
    <section className="promo">
      <h2 className="promo__title">
        {hasRows ? 'Inventory Weekly Report is ready' : 'Inventory Weekly Report'}
      </h2>
      <p className="promo__range">
        {isLoading ? 'Preparing…' : range || 'No movements this week'}
      </p>
      <button
        type="button"
        className="promo__action"
        disabled={!hasRows || download.isPending}
        onClick={() => download.mutate()}
      >
        {download.isPending && <Spinner size={12} label="Preparing the report" />}
        {download.isPending ? 'Preparing…' : 'Download Now'}
      </button>
    </section>
  )
}
