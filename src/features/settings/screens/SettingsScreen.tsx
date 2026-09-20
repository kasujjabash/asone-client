/**
 * Settings — Figma "AsOne Logistics - era92" node 2152:26008.
 *
 * One document, not a form-per-section: every field here lives on the same
 * `Settings` row, so one Save Settings button commits the whole screen and
 * Discard Changes reverts every section to the server's last-saved values.
 *
 * Readable by anyone signed in; every control is disabled for anyone but
 * Program Lead or Operations Manager — the same "Table Updates" gate as the
 * rest of master data, mirrored here for feel but enforced by the server,
 * which is the real check.
 *
 * **The Synchronization panel the design draws is deliberately not here.**
 * Decision D3 is explicit — no offline data entry; a site that loses
 * internet loses access until it returns. Offering to tune a sync interval
 * advertises a feature that was chosen against, which is worse than the
 * setting not existing. Dropped with AsOne (Jim) on 18 September 2026, along
 * with the "Online · Synced just now" indicator the same design draws in the
 * top bar and `TopBar.tsx` also omits.
 *
 * What each remaining section actually does, because it is not uniform:
 *
 *   General Settings      Organization Name names the app in the sidebar.
 *                         Default Warehouse Hub is where a new session's
 *                         warehouse filter starts. Timezone and Currency are
 *                         one-option selects — they state what the system
 *                         does rather than offer a choice it cannot honour.
 *   Inventory Parameters  The threshold pre-fills a new SKU's minimum. The
 *                         two below it are stored only, and say so.
 *   System Alerts         Real and immediate. Each toggle removes that alert
 *                         kind from `needs_attention()` for everyone the
 *                         instant it saves — org-wide, because there is no
 *                         per-user notification delivery in this system.
 *   Printing Preferences  Stored only; there is no print or export feature
 *                         for them to configure yet.
 */

import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Alert, Button, LoadingScreen, Select, TabBar, TextField } from '@/components'
import { AppShell } from '@/features/shell/components/AppShell'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { canEditOrgSettings, canReadReasonCodes } from '@/domain/access'
import * as catalogApi from '@/api/catalog'
import { ReasonCodesSection } from '../components/ReasonCodesSection'
import { useOrgSettings, useUpdateOrgSettings } from '../hooks/useOrgSettings'
import type { OrgSettings } from '@/api/types'

type Draft = Pick<
  OrgSettings,
  | 'organization_name'
  | 'default_warehouse'
  | 'timezone'
  | 'currency'
  | 'default_minimum_stock_threshold'
  | 'critical_safety_buffer_percent'
  | 'auto_trigger_tailoring_center_reorder'
  | 'low_stock_alerts_enabled'
  | 'receipt_discrepancy_alerts_enabled'
  | 'backorder_allocation_alerts_enabled'
  | 'default_paper_size'
  | 'packing_list_layout'
>

const TABS = [
  { key: 'system', label: 'System Settings' },
  { key: 'reason-codes', label: 'Adjustment Reason Codes' },
] as const
type TabKey = (typeof TABS)[number]['key']

function draftFrom(settings: OrgSettings): Draft {
  return {
    organization_name: settings.organization_name,
    default_warehouse: settings.default_warehouse ?? null,
    timezone: settings.timezone,
    currency: settings.currency,
    default_minimum_stock_threshold: settings.default_minimum_stock_threshold,
    critical_safety_buffer_percent: settings.critical_safety_buffer_percent,
    auto_trigger_tailoring_center_reorder: settings.auto_trigger_tailoring_center_reorder,
    low_stock_alerts_enabled: settings.low_stock_alerts_enabled,
    receipt_discrepancy_alerts_enabled: settings.receipt_discrepancy_alerts_enabled,
    backorder_allocation_alerts_enabled: settings.backorder_allocation_alerts_enabled,
    default_paper_size: settings.default_paper_size,
    packing_list_layout: settings.packing_list_layout,
  }
}

export function SettingsScreen() {
  const { user } = useAuth()
  const canEdit = canEditOrgSettings(user)
  /* Warehouse and school staff are refused the reason-code table outright, so
     they get no tab for it — the tab was fetching a 403 on open. */
  const seesReasonCodes = canReadReasonCodes(user)

  const { data: settings, isLoading } = useOrgSettings()
  const updateSettings = useUpdateOrgSettings()

  const { data: warehouses } = useQuery({
    queryKey: ['warehouses', 'all'],
    queryFn: () => catalogApi.warehouses(),
    /*
     * Only for the roles that can change the setting this fills. The
     * warehouse list is leads-only on the server, so every other role was
     * fetching a 403 on a screen they are entitled to read — and the Default
     * Warehouse picker they were loading it for is disabled for them anyway.
     */
    enabled: canEdit,
  })

  /*
   * The tab lives in the URL, not in component state. Three things follow
   * from that: it survives a refresh, it can be linked to, and the Help
   * button can tell the two tabs apart — they are different subjects, and one
   * help entry covering both would be two explanations stapled together.
   */
  const [params, setParams] = useSearchParams()
  const tab: TabKey = params.get('tab') === 'reason-codes' ? 'reason-codes' : 'system'

  function selectTab(key: TabKey) {
    // `replace` so flipping tabs does not fill the back button with them.
    setParams(key === 'system' ? {} : { tab: key }, { replace: true })
  }

  const [draft, setDraft] = useState<Draft | null>(null)

  /*
   * Seeded from the server's row the first time it arrives, and re-seeded
   * only when that row itself changes underneath the draft (Discard
   * Changes, or a save completing) — never on every render, or a keystroke
   * would be overwritten by the same query cache entry that keystroke has
   * not yet touched. `lastSeenSettings` is what makes that "only when it
   * changes" — updating state during render like this, guarded so it fires
   * at most once per new `settings` reference, is the documented way to
   * derive state from a prop without an effect.
   */
  const [lastSeenSettings, setLastSeenSettings] = useState<OrgSettings | null>(null)
  if (settings && settings !== lastSeenSettings) {
    setLastSeenSettings(settings)
    setDraft(draftFrom(settings))
  }

  if (isLoading || !draft) return <LoadingScreen message="Loading settings…" />

  function update<K extends keyof Draft>(key: K, value: Draft[K]) {
    setDraft((current) => (current ? { ...current, [key]: value } : current))
  }

  function handleDiscard() {
    if (settings) setDraft(draftFrom(settings))
  }

  function handleSave() {
    if (!draft) return
    updateSettings.mutate(draft)
  }

  return (
    <AppShell title="Settings">
      <header className="page-head">
        <h1 className="page-head__title">Settings</h1>
        <p className="page-head__subtitle">
          Organization defaults, inventory parameters, alert preferences, and
          the reason codes behind every stock adjustment.
        </p>
      </header>

      {/*
        An Alert, not a clause on the end of the subtitle.
        "Read-only for your role" is the single most useful thing on the
        screen for somebody who cannot edit it — it explains why every field
        below refuses them — and as the tail of a descriptive sentence it read
        as more description and was missed.
      */}
      {!canEdit && (
        <Alert tone="info">
          <strong>Read-only for your role.</strong> You can see everything here,
          but a Program Lead or Operations Manager makes the changes.
        </Alert>
      )}

      {/*
        Two tabs, not one long page. System settings are a form committed
        by one Save; reason codes are a table that saves as you go. Stacked,
        the Save button sat in the middle of the screen with more editable
        content below it, which made one button look like it committed
        everything.
      */}
      <TabBar
        label="Settings views"
        active={tab}
        onSelect={(key) => selectTab(key as TabKey)}
        tabs={seesReasonCodes ? TABS : TABS.filter((entry) => entry.key === 'system')}
      />

      {tab === 'system' || !seesReasonCodes ? (
        <>
        {/* Paired for the same reason as the row below: neither section is
            wide enough to earn a band of its own. */}
        <div className="settings-row-2col settings-row-2col--stretch">
          <fieldset className="settings-section" disabled={!canEdit}>
            <legend className="settings-section__title">General Settings</legend>
            <div className="settings-grid">
              <TextField
                label="Organization Name"
                value={draft.organization_name}
                onChange={(event) => update('organization_name', event.target.value)}
              />
              <Select
                label="Default Warehouse Hub"
                value={draft.default_warehouse ?? ''}
                onChange={(event) =>
                  update('default_warehouse', event.target.value ? Number(event.target.value) : null)
                }
              >
                <option value="">None</option>
                {(warehouses?.results ?? []).map((warehouse) => (
                  <option key={warehouse.id} value={warehouse.id}>
                    {warehouse.name}
                  </option>
                ))}
              </Select>
              <Select
                label="Timezone"
                value={draft.timezone}
                onChange={(event) => update('timezone', event.target.value as Draft['timezone'])}
              >
                <option value="Africa/Kampala">East Africa Time (EAT) / Kampala (UTC+3)</option>
              </Select>
              <Select
                label="Currency"
                value={draft.currency}
                onChange={(event) => update('currency', event.target.value as Draft['currency'])}
              >
                <option value="UGX">Ugandan Shilling (UGX)</option>
              </Select>
            </div>
          </fieldset>

          <fieldset className="settings-section" disabled={!canEdit}>
            <legend className="settings-section__title">Inventory Parameters</legend>
            <TextField
              label="Default Minimum Stock Alert Threshold (Units)"
              type="number"
              min={0}
              value={draft.default_minimum_stock_threshold}
              onChange={(event) => update('default_minimum_stock_threshold', Number(event.target.value))}
            />
            <p className="settings-section__hint">
              Pre-fills the minimum when a new SKU is created. Minimums already set
              are per SKU per warehouse and are not changed by this.
            </p>

            {/*
              Split out and labelled, rather than sitting beside a control that
              works. A ticked box reading "auto-trigger tailoring center reorder"
              is a statement of fact, and it is not a true one — nothing raises a
              production order automatically. Leaving it looking live was the most
              misleading thing on this screen.
            */}
            <div className="settings-subsection">
              <p className="settings-section__note">
                Stored for a future automatic-reorder feature. Nothing reads these
                values today — production orders are raised by hand.
              </p>
              <TextField
                label="Critical Safety Buffer Level (%)"
                type="number"
                min={0}
                max={100}
                value={draft.critical_safety_buffer_percent}
                onChange={(event) => update('critical_safety_buffer_percent', Number(event.target.value))}
              />
              <label className="settings-checkbox">
                <input
                  type="checkbox"
                  checked={draft.auto_trigger_tailoring_center_reorder}
                  onChange={(event) => update('auto_trigger_tailoring_center_reorder', event.target.checked)}
                />
                Auto-trigger tailoring center reorder when safety stock breached
              </label>
            </div>
          </fieldset>
        </div>

        {/*
          Two short sections side by side. Both are lists of a few controls
          that read at a glance — full width each, they would be two wide bands
          of mostly empty card. The row collapses to one column below 900px.
        */}
        <div className="settings-row-2col settings-row-2col--stretch">
          <fieldset className="settings-section" disabled={!canEdit}>
            <legend className="settings-section__title">System Alerts</legend>
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={draft.low_stock_alerts_enabled}
                onChange={(event) => update('low_stock_alerts_enabled', event.target.checked)}
              />
              Low stock warnings digest
            </label>
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={draft.receipt_discrepancy_alerts_enabled}
                onChange={(event) => update('receipt_discrepancy_alerts_enabled', event.target.checked)}
              />
              Receipt discrepancies instant alert
            </label>
            <label className="settings-checkbox">
              <input
                type="checkbox"
                checked={draft.backorder_allocation_alerts_enabled}
                onChange={(event) => update('backorder_allocation_alerts_enabled', event.target.checked)}
              />
              Backorder allocation notifications
            </label>
          </fieldset>


          <fieldset className="settings-section" disabled={!canEdit}>
            <legend className="settings-section__title">Printing Preferences</legend>
            <p className="settings-section__note">
              Stored for a future print/export feature. Nothing reads these values today.
            </p>
            <div className="settings-grid">
              <Select
                label="Default Paper Size"
                value={draft.default_paper_size}
                onChange={(event) => update('default_paper_size', event.target.value as Draft['default_paper_size'])}
              >
                <option value="A4">A4 (Standard Ugandan Format)</option>
                <option value="LETTER">US Letter</option>
              </Select>
              <Select
                label="Packing List Layout"
                value={draft.packing_list_layout}
                onChange={(event) =>
                  update('packing_list_layout', event.target.value as Draft['packing_list_layout'])
                }
              >
                <option value="SKU_GROUPED">Standard SKU-Grouped</option>
                <option value="ORDER_GROUPED">Grouped by Order</option>
              </Select>
            </div>
          </fieldset>
        </div>

        {/*
          Below the Save/Discard pair on purpose. Everything above is one
          document committed by one button; reason codes are their own table
          that saves as you go, and folding them into that Save would have made
          one button mean two different things.
        */}
        {canEdit && (
          <div className="settings-actions">
            <Button variant="secondary" onClick={handleDiscard} disabled={updateSettings.isPending}>
              Discard Changes
            </Button>
            <Button onClick={handleSave} disabled={updateSettings.isPending}>
              {updateSettings.isPending ? 'Saving…' : 'Save Settings'}
            </Button>
          </div>
        )}
        </>
      ) : (
        <ReasonCodesSection canEdit={canEdit} />
      )}
    </AppShell>
  )
}
