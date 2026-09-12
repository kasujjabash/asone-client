/**
 * A row of tabs.
 *
 * Presentational only, the same rule every shared component here follows:
 * this renders the strip and reports a change; it does not know what a tab
 * panel contains. The caller owns which panel is showing.
 */

interface TabsProps<T extends string> {
  tabs: readonly T[]
  active: T
  onChange: (tab: T) => void
  /** Names the group for screen readers, e.g. "School sections". */
  label: string
}

export function Tabs<T extends string>({ tabs, active, onChange, label }: TabsProps<T>) {
  return (
    <div className="tabs" role="tablist" aria-label={label}>
      {tabs.map((tab) => (
        <button
          key={tab}
          type="button"
          role="tab"
          aria-selected={tab === active}
          className={`tabs__tab${tab === active ? ' tabs__tab--active' : ''}`}
          onClick={() => onChange(tab)}
        >
          {tab}
        </button>
      ))}
    </div>
  )
}
