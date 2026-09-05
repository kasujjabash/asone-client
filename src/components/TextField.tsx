/**
 * Material 3 outlined text field.
 *
 * The label sits notched into the top border and stays there whether or not
 * the field has content. M3 normally floats it up from inside on focus; this
 * system is a data-entry tool used all day, where a form of eight fields
 * animating their labels is noise, and a label that never moves is one less
 * thing to track. The rendered result matches the design, which shows every
 * label already floated.
 *
 * `trailing` is for an adornment inside the border — the password reveal,
 * a unit, a clear button.
 */

import { useId, type InputHTMLAttributes, type ReactNode } from 'react'

interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id'> {
  label: string
  /** One message, from the server. Puts the field into its error state. */
  error?: string
  trailing?: ReactNode
}

export function TextField({ label, error, trailing, ...input }: TextFieldProps) {
  const id = useId()
  const errorId = `${id}-error`
  const invalid = Boolean(error)

  return (
    <div className={`textfield${invalid ? ' textfield--invalid' : ''}`}>
      <div className="textfield__frame">
        <label className="textfield__label" htmlFor={id}>
          {label}
        </label>

        <input
          id={id}
          className="textfield__input"
          aria-invalid={invalid || undefined}
          aria-describedby={invalid ? errorId : undefined}
          {...input}
        />

        {trailing && <div className="textfield__trailing">{trailing}</div>}
      </div>

      {error && (
        <p className="textfield__error" id={errorId}>
          {error}
        </p>
      )}
    </div>
  )
}
