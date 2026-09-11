/**
 * Step 4 — the finalized cargo receipt, as a document rather than a screen.
 *
 * Printable, because this is the sheet that gets signed and filed. It reads
 * off the posted receipt the server returned, not off the form state, so
 * what is printed is what was actually stored — including the receipt
 * number, which only exists after posting.
 *
 * `variance` here is the server's own `discrepancy` (counted minus claimed),
 * so the paper and the database cannot disagree about which way a line went
 * wrong.
 */

import { CheckCircle2, PackagePlus, Printer } from 'lucide-react'
import { BrandMark, Button } from '@/components'
import { formatQuantity } from '@/domain/money'
import { lineStatus, reconcile } from '@/domain/receiving'
import type { Receipt } from '@/api/types'

const STATUS_CLASS = {
  MATCHED: 'matched',
  SHORTAGE: 'shortage',
  SURPLUS: 'surplus',
} as const

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

interface FinalManifestProps {
  receipt: Receipt
  /** Clears the flow for the next van. */
  onRecordAnother: () => void
}

export function FinalManifest({ receipt, onRecordAnother }: FinalManifestProps) {
  const lines = receipt.lines ?? []

  /*
   * `expected` falls back to the count only so a line the paper said nothing
   * about does not read as a shortage of its whole quantity — the server
   * treats a null packing-list figure as "nothing to disagree with", and its
   * own `discrepancy` is 0 for exactly that reason.
   *
   * The status below is then derived from that same `discrepancy` rather
   * than re-computed, which is the bug this replaced: comparing against the
   * fallback printed a green MATCHED chip beside a non-zero variance, and
   * the manifest total quietly understated a real shortage. On a document
   * that gets signed and filed.
   */
  const summary = reconcile(
    lines.map((line) => ({
      expected: line.quantity_received - line.discrepancy,
      received: line.quantity_received,
    })),
  )

  return (
    <>
      <div className="manifest-actions no-print">
        <Button variant="secondary" onClick={() => window.print()}>
          <Printer size={16} aria-hidden />
          Print Receipt
        </Button>
        <Button onClick={onRecordAnother}>
          <PackagePlus size={16} aria-hidden />
          Record Another Delivery
        </Button>
      </div>

      <article className="manifest">
        <header className="manifest__head">
          <div className="manifest__brand">
            <BrandMark width={110} />
            <div>
              <p className="manifest__org">AsOne Logistics</p>
              <p className="manifest__org-sub">
                Uganda Operations · {receipt.warehouse_name}
              </p>
            </div>
          </div>

          <div className="manifest__stamps">
            <span className="pill pill--mint">
              {receipt.is_posted ? 'COMPLETED' : 'RECORDED'}
            </span>
            <span className="manifest__stamp">
              {receipt.is_posted ? 'FINALIZED' : 'NOT POSTED'}
            </span>
          </div>
        </header>

        <h1 className="manifest__title">Finalized Cargo Receipt &amp; Manifest</h1>

        <dl className="manifest__meta">
          <div>
            <dt>Production Order</dt>
            <dd>{receipt.production_order_number}</dd>
          </div>
          <div>
            <dt>Warehouse Location</dt>
            <dd>{receipt.warehouse_name}</dd>
          </div>
          <div>
            <dt>Receipt Date</dt>
            <dd>{formatDate(receipt.date_received)}</dd>
          </div>
          <div>
            <dt>Received By Operator</dt>
            <dd>{receipt.created_by_name}</dd>
          </div>
          <div>
            <dt>Packing List</dt>
            <dd>{receipt.packing_list_number}</dd>
          </div>
          <div>
            <dt>Supplier (Shipping TC)</dt>
            <dd>{receipt.tailoring_center_name}</dd>
          </div>
          {receipt.carrier_name && (
            <div>
              <dt>Carrier / Driver</dt>
              <dd>{receipt.carrier_name}</dd>
            </div>
          )}
          <div>
            <dt>Receipt Number</dt>
            <dd>{receipt.number}</dd>
          </div>
        </dl>

        <div className="table-scroll">
          <table className="ledger manifest__table">
            <thead>
              <tr>
                <th>SKU</th>
                <th>Description</th>
                <th className="ledger__num">Expected</th>
                <th className="ledger__num">Received</th>
                <th className="ledger__num">Variance</th>
                <th className="ledger__num">Status</th>
              </tr>
            </thead>
            <tbody>
              {lines.map((line) => {
                const variance = line.discrepancy
                // Read back off the server's own figure so the chip, the
                // variance and the total can never tell three stories.
                const expected = line.quantity_received - variance
                const status = lineStatus(expected, line.quantity_received)

                return (
                  <tr
                    key={line.id}
                    className={
                      status === 'MATCHED'
                        ? undefined
                        : `validation__row--${STATUS_CLASS[status]}`
                    }
                  >
                    <td className="ledger__code">{line.sku_number}</td>
                    <td className="ledger__wrap">{line.sku_description}</td>
                    <td className="ledger__num">{formatQuantity(expected)}</td>
                    <td className="ledger__num">
                      {formatQuantity(line.quantity_received)}
                    </td>
                    <td className={`ledger__num validation__diff--${STATUS_CLASS[status]}`}>
                      {variance > 0 ? `+${variance}` : variance}
                    </td>
                    <td className="ledger__num">
                      <span className={`chip chip--${STATUS_CLASS[status]}`}>{status}</span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
            <tfoot>
              <tr>
                <td className="ledger__code">MANIFEST TOTAL</td>
                <td>Aggregate PO Units</td>
                <td className="ledger__num">{formatQuantity(summary.totalExpected)} pcs</td>
                <td className="ledger__num">{formatQuantity(summary.totalReceived)} pcs</td>
                <td className="ledger__num">
                  {summary.netDiscrepancy > 0 ? '+' : ''}
                  {summary.netDiscrepancy} pcs
                </td>
                <td className="ledger__num">
                  {summary.discrepancyCount === 0
                    ? 'CLEAN'
                    : summary.offsetting
                      ? 'OFFSETTING'
                      : summary.netDiscrepancy < 0
                        ? 'NET SHORT'
                        : 'NET SURPLUS'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        {receipt.notes && (
          <section className="callout callout--warning manifest__notes">
            <h2>Official Reconciliation Notes &amp; Variance Filing</h2>
            <p>{receipt.notes}</p>
          </section>
        )}

        <footer className="manifest__foot">
          <div>
            <p className="manifest__sync">
              <CheckCircle2 size={16} aria-hidden />
              {receipt.is_posted ? 'Inventory updated' : 'Not yet posted to inventory'}
            </p>
            <p className="manifest__sync-body">
              {receipt.is_posted
                ? `Stock levels for ${receipt.warehouse_name} have been raised to reflect the reconciled quantities.`
                : `This delivery is recorded but stock has not been raised. Post it to inventory to update ${receipt.warehouse_name}.`}
            </p>
            {receipt.posted_at && (
              <p className="manifest__timestamp">
                POSTED: {new Date(receipt.posted_at).toISOString()}
              </p>
            )}
          </div>

          <div className="manifest__sign">
            <p className="manifest__sign-label">Warehouse Lead Authorization</p>
            <p className="manifest__sign-name">{receipt.created_by_name}</p>
            <p className="manifest__sign-note">
              Recorded by {receipt.created_by_name} · {receipt.number}
            </p>
          </div>
        </footer>
      </article>
    </>
  )
}
