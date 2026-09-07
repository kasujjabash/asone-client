/**
 * Renders the messages anything in the app pushed.
 *
 * Mounted once, near the root. It holds no domain knowledge — it listens to
 * the bus and draws what arrives.
 *
 * The region is a live one, so a screen reader announces a message without
 * the focus moving: an operation that succeeded should not steal the cursor
 * from the next field somebody was about to type in.
 */

import { useEffect, useState, type ReactNode } from 'react'
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react'
import { subscribeToSnackbars, type Snackbar, type SnackbarTone } from './snackbarBus'

const ICONS: Record<SnackbarTone, typeof Info> = {
  success: CheckCircle2,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
}

/** Older messages drop off rather than stacking down the whole screen. */
const MAX_VISIBLE = 4

export function SnackbarProvider({ children }: { children: ReactNode }) {
  const [snackbars, setSnackbars] = useState<Snackbar[]>([])

  useEffect(
    () =>
      subscribeToSnackbars((snackbar) => {
        setSnackbars((current) => [...current, snackbar].slice(-MAX_VISIBLE))
      }),
    [],
  )

  // One timer per snackbar, cleared on unmount so a dismissed message cannot
  // schedule work against a gone component.
  useEffect(() => {
    const timers = snackbars
      .filter((snackbar) => snackbar.duration && snackbar.duration > 0)
      .map((snackbar) =>
        window.setTimeout(() => {
          setSnackbars((current) => current.filter((item) => item.id !== snackbar.id))
        }, snackbar.duration),
      )

    return () => timers.forEach(window.clearTimeout)
  }, [snackbars])

  function dismiss(id: number) {
    setSnackbars((current) => current.filter((snackbar) => snackbar.id !== id))
  }

  return (
    <>
      {children}

      <div className="snackbars" role="region" aria-label="Notifications">
        {snackbars.map((snackbar) => {
          const Icon = ICONS[snackbar.tone]
          return (
            <div
              key={snackbar.id}
              className={`snackbar snackbar--${snackbar.tone}`}
              /* Errors interrupt; everything else waits its turn. */
              role={snackbar.tone === 'error' ? 'alert' : 'status'}
              aria-live={snackbar.tone === 'error' ? 'assertive' : 'polite'}
            >
              <Icon className="snackbar__icon" size={18} aria-hidden />
              <div className="snackbar__body">
                <p className="snackbar__message">{snackbar.message}</p>
                {snackbar.detail && <p className="snackbar__detail">{snackbar.detail}</p>}
              </div>
              <button
                type="button"
                className="snackbar__close"
                onClick={() => dismiss(snackbar.id)}
                aria-label="Dismiss"
              >
                <X size={16} aria-hidden />
              </button>
            </div>
          )
        })}
      </div>
    </>
  )
}
