/**
 * CSV, for the export buttons.
 *
 * Escaping is the whole job and it is easy to get wrong. A field is quoted
 * when it contains a comma, a quote or a newline, and an embedded quote is
 * doubled — anything less produces a file that opens misaligned in Excel and
 * is blamed on the data rather than the export.
 *
 * A UTF-8 byte-order mark leads the file because Excel on Windows otherwise
 * reads it as the system codepage and mangles any non-ASCII name.
 */

const NEEDS_QUOTING = /[",\r\n]/

function escapeField(value: string | number | null | undefined): string {
  if (value === null || value === undefined) return ''
  const text = String(value)
  return NEEDS_QUOTING.test(text) ? `"${text.replace(/"/g, '""')}"` : text
}

export function toCsv(
  headers: readonly string[],
  rows: readonly (readonly (string | number | null | undefined)[])[],
): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeField).join(','))
  // CRLF: the line ending every spreadsheet agrees on.
  return `﻿${lines.join('\r\n')}\r\n`
}

/**
 * Hands a generated file to the browser.
 *
 * The object URL is revoked immediately after the click is dispatched —
 * these handles are not garbage collected and each one pins its blob in
 * memory for the life of the document.
 */
export function downloadFile(filename: string, contents: string, mime = 'text/csv'): void {
  const blob = new Blob([contents], { type: `${mime};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.click()
  URL.revokeObjectURL(url)
}
