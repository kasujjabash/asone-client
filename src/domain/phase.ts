/**
 * TEMPORARY — phased client testing. Delete this file when Phase 3 ships.
 *
 * ---------------------------------------------------------------------------
 * How to remove it, when the time comes
 * ---------------------------------------------------------------------------
 * `grep -rn "TEMPORARY: phase gate" src` finds every call site. There are two,
 * both one-liners, both marked. Delete them, delete this file, drop `VITE_PHASE`
 * from the deploy environment. Nothing else in the app knows this exists.
 *
 * That is the whole point of the shape below. The obvious implementation was
 * to put `requires: inPhase(3)` on each nav item, but `requires` is a
 * permanent statement about **who** may see a screen, and this is a temporary
 * statement about **when**. Mixing them would mean unpicking a dozen edits
 * later, in a file where a slip silently hands somebody access they should not
 * have. So the phase map lives here, alone, and `navigation.ts` never learns
 * about it.
 *
 * ---------------------------------------------------------------------------
 * What it does
 * ---------------------------------------------------------------------------
 * AsOne is tested with the client phase by phase, and the app is ahead of the
 * testing. A build handed over for Phase 1 should not offer shipping and
 * backorders — not because they are broken, but because a tester who wanders
 * into them reports on work nobody asked them to look at yet, and the session
 * stops being about receipts.
 *
 * **A presentation gate, not a permission.** It hides work in progress from a
 * client; it protects nothing. The server knows nothing about phases and will
 * answer a Phase 3 request from a Phase 1 build. Never reach for this to keep
 * anybody away from data — that is `domain/access.ts` and the server's own
 * permission classes, enforced where it matters.
 *
 * ---------------------------------------------------------------------------
 * Where the number comes from
 * ---------------------------------------------------------------------------
 * `VITE_PHASE`, read at **build time** — Vite inlines `import.meta.env`, so it
 * is fixed when the build is made and no tester can flip it from the browser.
 *
 * **Unset means everything is on.** Development, the test suite and any build
 * made without thinking about this behave exactly as they did before the gate
 * existed. The failure mode of forgetting is "the developer sees the whole
 * app", never "half the app vanished and nobody knows why".
 */

/** Everything, for any build that has not asked for a phase. */
const ALL_PHASES = 3

/**
 * The phase each screen opens in. **Anything absent is open from Phase 1.**
 *
 * Phases come from the project plan in the server's README:
 *
 * | 1 | Inbound: master data, group and production orders, receipts |
 * | 2 | Inventory adjustments |
 * | 3 | Outbound: orders, picking, shipping, backorders |
 *
 * Paths are matched by prefix, so `/shipments` also covers
 * `/shipments/SH-5007`. That matters: gating the list and leaving the detail
 * page reachable is worse than not gating at all, because the tester who
 * finds it has been told the area is closed.
 */
const OPENS_IN: Readonly<Record<string, number>> = {
  // Phase 3 — outbound. The school-facing point of sale and everything the
  // warehouse does to get a parcel out of the door.
  '/orders': 3,
  '/shipments': 3,
  '/backorders': 3,

  // Phase 2 — inventory adjustments, including the warehouse-to-warehouse
  // transfers that post through the same ledger.
  '/adjustments': 2,
  '/transfers': 2,
}

function readPhase(): number {
  const raw = import.meta.env.VITE_PHASE
  if (raw === undefined || raw === '') return ALL_PHASES
  const parsed = Number(raw)
  if (!Number.isInteger(parsed) || parsed < 1) {
    // Loud, because a typo here would otherwise ship a crippled build quietly.
    console.warn(`VITE_PHASE is "${raw}", which is not a phase number. Showing every phase.`)
    return ALL_PHASES
  }
  return parsed
}

export const PHASE = readPhase()

/** True when this build is showing phase `n`. */
export function phaseOpen(n: number): boolean {
  return PHASE >= n
}

/**
 * Is this path open in this build?
 *
 * Used by `visibleNavigation` (to drop the menu entry) and `RequireAccess`
 * (to refuse the URL). Both, from one map — hiding the entry while leaving
 * the address reachable is theatre, since testers paste and type URLs.
 */
export function pathOpenInThisPhase(path: string): boolean {
  if (PHASE >= ALL_PHASES) return true // The common case: nothing is gated.

  for (const [prefix, opensIn] of Object.entries(OPENS_IN)) {
    if (path === prefix || path.startsWith(`${prefix}/`)) {
      return PHASE >= opensIn
    }
  }
  return true
}
