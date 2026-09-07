/**
 * A tiny event bus for messages.
 *
 * Deliberately free of React, because the things that most need to speak to
 * the user are not components: the axios interceptor discovering the server
 * is unreachable, and react-query's mutation cache seeing a write fail.
 * Neither can call a hook.
 *
 * So anything may `pushSnackbar`, and the provider is the only listener.
 */

export type SnackbarTone = 'success' | 'error' | 'warning' | 'info'

export interface Snackbar {
  id: number
  tone: SnackbarTone
  /** One line. What happened, in the user's terms. */
  message: string
  /** Optional second line — what to do about it, or the server's detail. */
  detail?: string
  /** Milliseconds. Errors stay until dismissed unless told otherwise. */
  duration?: number
}

export type SnackbarInput = Omit<Snackbar, 'id'>

type Listener = (snackbar: Snackbar) => void

const listeners = new Set<Listener>()
let nextId = 1

/**
 * Errors do not disappear on their own. A message someone missed is a
 * message that was not delivered, and an error usually needs an action.
 */
const DEFAULTS: Record<SnackbarTone, number> = {
  success: 4000,
  info: 5000,
  warning: 8000,
  error: 0,
}

export function pushSnackbar(input: SnackbarInput): void {
  const snackbar: Snackbar = {
    ...input,
    id: nextId++,
    duration: input.duration ?? DEFAULTS[input.tone],
  }
  for (const listener of listeners) listener(snackbar)
}

export function subscribeToSnackbars(listener: Listener): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Convenience wrappers, so callers do not repeat the tone strings. */
export const snackbar = {
  success: (message: string, detail?: string) => pushSnackbar({ tone: 'success', message, detail }),
  error: (message: string, detail?: string) => pushSnackbar({ tone: 'error', message, detail }),
  warning: (message: string, detail?: string) => pushSnackbar({ tone: 'warning', message, detail }),
  info: (message: string, detail?: string) => pushSnackbar({ tone: 'info', message, detail }),
}
