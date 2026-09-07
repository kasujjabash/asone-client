/**
 * Is the server actually there?
 *
 * `/api/health/` is unauthenticated and cheap, and exists to answer the one
 * question a failed request cannot: was that the session, or the server?
 *
 * A 503 means the process is up but the database is not, which is still
 * "cannot serve you" — so it counts as down.
 *
 * Deliberately a bare axios call. Routing it through `http` would attach a
 * token and recurse back into the very interceptor that is asking.
 */

import axios from 'axios'

const TIMEOUT_MS = 5_000

export async function isServerReachable(baseUrl: string): Promise<boolean> {
  try {
    const response = await axios.get(`${baseUrl}/health/`, {
      timeout: TIMEOUT_MS,
      // Read the status ourselves rather than having axios throw on 5xx.
      validateStatus: () => true,
    })
    // Up *and* able to do the job. 503 is the database being unreachable.
    return response.status >= 200 && response.status < 400
  } catch {
    // No response at all — down, or no connection.
    return false
  }
}
