/**
 * A select, styled as the same Material 3 outlined field as `TextField`.
 *
 * No screen needed a select with a floating label until the Schools form —
 * `WarehouseSwitcher` and `ReportFilters` both hand-roll a plain `<select>`
 * inside their own chrome because they sit in a top bar or filter band, not
 * a form. This is for a form field, so it reuses `.textfield`'s box and
 * label rather than introducing a third input shape.
 */

import { ChevronDown } from 'lucide-react'
import { useId, type ReactNode, type SelectHTMLAttributes } from 'react'

interface SelectProps
  extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'className' | 'id'> {
  label: string
  error?: string
  children: ReactNode
}

export function Select({ label, error, children, ...select }: SelectProps) {
  const id = useId()
  const errorId = `${id}-error`
  const invalid = Boolean(error)

  return (
    <div className={`textfield${invalid ? ' textfield--invalid' : ''}`}>
      <div className="textfield__frame">
        <label className="textfield__label" htmlFor={id}>
          {label}
        </label>

        <select
          id={id}
          className="textfield__input textfield__input--select"
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          {...select}
        >
          {children}
        </select>

        <div className="textfield__trailing textfield__trailing--static">
          <ChevronDown size={18} aria-hidden />
        </div>
      </div>

      {error && (
        <p className="textfield__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
