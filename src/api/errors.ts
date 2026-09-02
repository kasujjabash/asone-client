/**
 * Turning an HTTP failure into something a screen can render.
 *
 * DRF has four shapes worth telling apart, and the brief's error table maps
 * each to a different response from the UI:
 *
 *   400  the input was rejected; the body is keyed by field name
 *   403  signed in, but this role may not do this — the session is fine
 *   409  the row is still referenced; nothing about the request will help
 *   429  rate limited (login is 10/min per email address)
 *
 * A 401 never reaches here: `http.ts` refreshes and retries, and a failed
 * refresh raises an auth-failure event instead.
 */

import { AxiosError } from 'axios'

/** Field name -> messages. `non_field_errors` carries whole-record rules. */
export type FieldErrors = Record<string, string[]>

export interface ApiError {
  status: number | null
  /** One sentence, safe to show a person. */
  message: string
  /** Present on a 400, so a form can attach messages to its inputs. */
  fields: FieldErrors | null
  /** Present on a 409 — what is still referring to the row. */
  inUseBy: string[] | null
  /** The role was refused. Hiding the control is cosmetic; this is the truth. */
  isForbidden: boolean
  /** Never reached the server. Worth saying so rather than blaming the input. */
  isNetwork: boolean
}

const GENERIC = 'Something went wrong. Please try again.'

/**
 * A 400 body is `{field: [messages]}`, sometimes nested for write-through
 * serializers (`{lines: [{sku: ["..."]}]}`). Flatten to one message per key
 * so a form can find its field, and keep the order the server used.
 */
function flatten(body: unknown, prefix = ''): FieldErrors {
  if (body === null || typeof body !== 'object') return {}

  const out: FieldErrors = {}

  for (const [key, value] of Object.entries(body as Record<string, unknown>)) {
    const path = prefix ? `${prefix}.${key}` : key

    if (typeof value === 'string') {
      out[path] = [value]
    } else if (Array.isArray(value)) {
      const messages = value.filter((v): v is string => typeof v === 'string')
      if (messages.length) out[path] = messages
      // A list of objects — one entry per line of a write-through serializer.
      value.forEach((entry, i) => {
        if (entry && typeof entry === 'object') {
          Object.assign(out, flatten(entry, `${path}.${i}`))
        }
      })
    } else if (value && typeof value === 'object') {
      Object.assign(out, flatten(value, path))
    }
  }

  return out
}

/** The sentence to show, preferring whatever the server said. */
function messageFrom(status: number | null, fields: FieldErrors, body: unknown): string {
  const detail = (body as { detail?: unknown } | null)?.detail
  if (typeof detail === 'string' && detail) return detail

  const nonField = fields.non_field_errors?.[0]
  if (nonField) return nonField

  const first = Object.values(fields)[0]?.[0]
  if (first) return first

  switch (status) {
    case 403:
      return 'Your role does not allow that.'
    case 404:
      return 'That record no longer exists.'
    case 405:
      return 'That is not something this system deletes. Deactivate it instead.'
    case 429:
      return 'Too many attempts. Wait a minute and try again.'
    default:
      return GENERIC
  }
}

export function toApiError(error: unknown): ApiError {
  if (!(error instanceof AxiosError)) {
    return {
      status: null,
      message: error instanceof Error ? error.message : GENERIC,
      fields: null,
      inUseBy: null,
      isForbidden: false,
      isNetwork: false,
    }
  }

  const status = error.response?.status ?? null
  const body = error.response?.data ?? null

  // No response at all. The brief rules out offline working, so the honest
  // message is that the server is unreachable — not that the input was wrong.
  if (!error.response) {
    return {
      status: null,
      message: 'Cannot reach the server. Check your connection and try again.',
      fields: null,
      inUseBy: null,
      isForbidden: false,
      isNetwork: true,
    }
  }

  const fields = status === 400 ? flatten(body) : {}
  const inUseBy = (body as { in_use_by?: unknown } | null)?.in_use_by

  return {
    status,
    message: messageFrom(status, fields, body),
    fields: status === 400 && Object.keys(fields).length ? fields : null,
    inUseBy: Array.isArray(inUseBy) ? inUseBy.filter((v): v is string => typeof v === 'string') : null,
    isForbidden: status === 403,
    isNetwork: false,
  }
}
