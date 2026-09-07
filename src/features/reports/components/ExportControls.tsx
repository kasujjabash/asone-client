/**
 * Export CSV — Figma 58:3595 `export-controls`.
 *
 * The design also shows "Export PDF" and "Print Statement". Both are out for
 * now at ERA 92's request.
 *
 * If they come back: PDF should be server-rendered, where the figures
 * already live, rather than shipping a PDF library to the browser to
 * reproduce a table it would render worse. Print needs no endpoint — the
 * print stylesheet for it is still in `reports.css`, so restoring that
 * button is a few lines.
 *
 * CSV is generated from the rows on screen, so what exports is exactly what
 * was filtered — not a second query that might disagree.
 */

import { FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components'

interface ExportControlsProps {
  onExportCsv: () => void
  /** Nothing to export yet. */
  disabled?: boolean
}

export function ExportControls({ onExportCsv, disabled = false }: ExportControlsProps) {
  return (
    <div className="exports">
      <Button variant="secondary" size="sm" onClick={onExportCsv} disabled={disabled}>
        <FileSpreadsheet size={16} aria-hidden />
        Export CSV
      </Button>
    </div>
  )
}
