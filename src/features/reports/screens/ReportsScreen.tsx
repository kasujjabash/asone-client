/**
 * System Reports — Figma 58:3595.
 *
 * Composes the filter bar, four figures, the category comparison and the SKU
 * ledger. Filtering by SKU happens here so the table, the count and the CSV
 * all see the same rows — exporting a different set from the one on screen
 * is the classic way an export loses trust.
 */

import { useMemo, useState } from 'react'
import { snackbar } from '@/components'
import { toCsv, downloadFile } from '@/domain/csv'
import { formatQuantity } from '@/domain/money'
import { AppShell } from '@/features/shell/components/AppShell'
import { CategoryChart } from '../components/CategoryChart'
import { ExportControls } from '../components/ExportControls'
import { ReportFilters, type ReportFilterState } from '../components/ReportFilters'
import { ReportKpiRow } from '../components/ReportKpiRow'
import { SkuLedgerTable } from '../components/SkuLedgerTable'
import { useStockReport } from '../hooks/useStockReport'
import { filterRows } from '../pivot'

/** Today, as the date input wants it. */
function today(): string {
  return new Date().toISOString().slice(0, 10)
}

export function ReportsScreen() {
  const [filters, setFilters] = useState<ReportFilterState>({
    asOf: today(),
    skuQuery: '',
  })
  const [page, setPage] = useState(1)

  /** Any filter change invalidates the current page position. */
  function applyFilters(next: ReportFilterState) {
    setFilters(next)
    setPage(1)
  }

  const report = useStockReport({
    // Today is the default; sending it is the same answer with a colder cache.
    asOf: filters.asOf === today() ? undefined : filters.asOf,
  })

  const visibleRows = useMemo(
    () => filterRows(report.rows, filters.skuQuery),
    [report.rows, filters.skuQuery],
  )

  function exportCsv() {
    const headers = [
      'SKU',
      'Garment description',
      ...report.columns.map((column) => `${column.name} qty`),
      'Total stock',
      'Estimated value (UGX)',
    ]

    const rows = visibleRows.map((row) => [
      row.skuNumber,
      row.description,
      ...report.columns.map((column) => row.byWarehouse.get(column.id) ?? 0),
      row.totalUnits,
      // The unrounded figure — a spreadsheet wants the number, not "6.78M".
      row.totalValue,
    ])

    const filename = `asone-stock-report-${filters.asOf}.csv`
    downloadFile(filename, toCsv(headers, rows))
    snackbar.success(
      `Exported ${rows.length} ${rows.length === 1 ? 'SKU' : 'SKUs'}`,
      filename,
    )
  }

  return (
    <AppShell title="Reports">
      <header className="page-head page-head--split">
        <div>
          <h1 className="page-head__title">System Reports</h1>
          <p className="page-head__subtitle">
            Stock on hand, valuation and per-SKU breakdown as at{' '}
            {filters.asOf === today() ? 'today' : filters.asOf}
            {report.rows.length > 0 && ` · ${formatQuantity(report.rows.length)} SKUs`}
          </p>
        </div>

        <ExportControls
          onExportCsv={exportCsv}
          disabled={report.loading.stock || visibleRows.length === 0}
        />
      </header>

      <ReportFilters
        value={filters}
        onChange={applyFilters}
        onWarehouseChange={() => setPage(1)}
      />

      <ReportKpiRow report={report} />

      <div className="reports__stack">
        <CategoryChart
          categories={report.categories}
          columns={report.columns}
          loading={report.loading.stock}
        />
        <SkuLedgerTable
          rows={visibleRows}
          columns={report.columns}
          loading={report.loading.stock}
          totalRows={report.rows.length}
          page={page}
          onPageChange={setPage}
        />
      </div>
    </AppShell>
  )
}
