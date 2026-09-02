/**
 * The HTTP transport. Everything in `api/` goes through here.
 *
 * This module knows about tokens and status codes. It does not know about
 * React, routing or screens: when the session dies it *announces* that and
 * lets the app decide where to send the user. An interceptor that calls
 * `window.location.href = '/login'` cannot be tested without a browser, and
 * throws away whatever the user had typed.
 */

import axios, { type AxiosRequestConfig, type InternalAxiosRequestConfig } from 'axios'
import { tokens } from './tokens'

const BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://127.0.0.1:8000/api'

/**
 * Bounded, so a lossy connection fails with a message instead of hanging on
 * "Signing in…" until some unpredictable OS-level timeout fires.
 */
const TIMEOUT_MS = 30_000

export const http = axios.create({
  baseURL: BASE_URL,
  timeout: TIMEOUT_MS,
  headers: { 'Content-Type': 'application/json' },
})

// ---------------------------------------------------------------------------
// Session death, announced rather than acted on
// ---------------------------------------------------------------------------

type SessionExpiredListener = () => void

const sessionExpiredListeners = new Set<SessionExpiredListener>()

/**
 * Called when the refresh token is spent or rejected — the one case where the
 * user genuinely has to sign in again. The auth feature subscribes and
 * handles the redirect; `api/` stays unaware that routes exist.
 */
export function onSessionExpired(listener: SessionExpiredListener): () => void {
  sessionExpiredListeners.add(listener)
  return () => sessionExpiredListeners.delete(listener)
}

function announceSessionExpired(): void {
  tokens.clear()
  for (const listener of sessionExpiredListeners) listener()
}

// ---------------------------------------------------------------------------
// Requests carry the access token
// ---------------------------------------------------------------------------

http.interceptors.request.use((config) => {
  const token = tokens.access
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// ---------------------------------------------------------------------------
// A 401 buys exactly one refresh, shared by every request that saw it
// ---------------------------------------------------------------------------

/**
 * Single-flight refresh.
 *
 * When an access token expires, a screen with six queries on it fails six
 * times at once. Without this guard each failure would fire its own refresh;
 * because the server rotates refresh tokens and blacklists the spent one,
 * the first would succeed and the other five would 401 — signing the user
 * out mid-task. Ten simultaneous 401s must cause exactly one refresh.
 */
let refreshing: Promise<string> | null = null

async function refreshAccessToken(): Promise<string> {
  const refresh = tokens.refresh
  if (!refresh) throw new Error('No refresh token')

  // Deliberately a bare axios call: routing it through `http` would attach a
  // dead access token and recurse back into this interceptor.
  const { data } = await axios.post<{ access: string; refresh: string }>(
    `${BASE_URL}/auth/refresh/`,
    { refresh },
    { timeout: TIMEOUT_MS },
  )

  tokens.set({ access: data.access, refresh: data.refresh })
  return data.access
}

type Retriable = InternalAxiosRequestConfig & { _retried?: boolean }

/**
 * Endpoints where a 401 means "wrong credentials", not "my token expired".
 * Refreshing in front of them adds a round-trip to an error the user needs
 * to see immediately — a wrong password would look like a hang.
 */
const NO_REFRESH = ['/auth/login/', '/auth/refresh/', '/auth/logout/']

http.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) throw error

    const original = error.config as Retriable | undefined
    const status = error.response?.status
    const exempt = NO_REFRESH.some((path) => original?.url?.includes(path))

    // A 403 is a permission decision, not an expired token. Refreshing and
    // retrying would get the same answer, so it goes straight to the caller.
    if (status !== 401 || !original || original._retried || exempt) throw error

    original._retried = true

    try {
      refreshing ??= refreshAccessToken().finally(() => {
        refreshing = null
      })
      const access = await refreshing
      original.headers.Authorization = `Bearer ${access}`
      return http(original)
    } catch {
      announceSessionExpired()
      throw error
    }
  },
)

// ---------------------------------------------------------------------------
// Verbs
// ---------------------------------------------------------------------------

/**
 * Every backend route requires a trailing slash — Django redirects without
 * one, and a redirected POST arrives without its body. Callers build paths
 * with the slash; this guard catches the ones that forget in development.
 */
function assertTrailingSlash(url: string): void {
  if (import.meta.env.DEV && !url.split('?')[0].endsWith('/')) {
    throw new Error(`API paths need a trailing slash: "${url}"`)
  }
}

export async function get<T>(url: string, params?: QueryParams): Promise<T> {
  assertTrailingSlash(url)
  const { data } = await http.get<T>(url, { params: clean(params) })
  return data
}

export async function post<T>(url: string, body?: unknown, config?: AxiosRequestConfig): Promise<T> {
  assertTrailingSlash(url)
  const { data } = await http.post<T>(url, body, config)
  return data
}

export async function patch<T>(url: string, body: unknown): Promise<T> {
  assertTrailingSlash(url)
  const { data } = await http.patch<T>(url, body)
  return data
}

export async function del(url: string): Promise<void> {
  assertTrailingSlash(url)
  await http.delete(url)
}

export type QueryParams = Record<string, string | number | boolean | undefined | null>

/**
 * Drop empty filters instead of sending `?warehouse=`, which DRF reads as a
 * filter on the empty string and answers with nothing.
 */
function clean(params?: QueryParams): QueryParams | undefined {
  if (!params) return undefined
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== ''),
  )
}
