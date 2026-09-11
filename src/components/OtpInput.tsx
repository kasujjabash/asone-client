/**
 * One-time code entry.
 *
 * Six boxes that behave like one field. The behaviours people expect here
 * are easy to get wrong and annoying when missing, so all of them are
 * handled: typing advances, Backspace on an empty box steps back and clears
 * the previous one, arrow keys move without editing, and pasting a whole
 * code fills every box rather than dropping five characters into the first.
 *
 * The value is owned by the caller — this renders `value` and reports
 * changes. `onComplete` fires when the last character lands, so a caller can
 * submit without making the user reach for a button.
 */

import { useEffect, useRef, type ChangeEvent, type ClipboardEvent, type KeyboardEvent } from 'react'

interface OtpInputProps {
  value: string
  onChange: (value: string) => void
  /** Fires once the code reaches full length. */
  onComplete?: (value: string) => void
  length?: number
  disabled?: boolean
  invalid?: boolean
  /** Names the group for screen readers. */
  label?: string
}

const DIGITS = /\d/g

export function OtpInput({
  value,
  onChange,
  onComplete,
  length = 6,
  disabled = false,
  invalid = false,
  label = 'Verification code',
}: OtpInputProps) {
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    if (!disabled && boxes.current[0]) {
      boxes.current[0].focus()
    }
  }, [disabled])

  const focusBox = (index: number) => {
    boxes.current[Math.max(0, Math.min(index, length - 1))]?.focus()
  }

  const commit = (next: string) => {
    onChange(next)
    if (next.length === length) onComplete?.(next)
  }

  const handleChange = (index: number) => (event: ChangeEvent<HTMLInputElement>) => {
    // Take the last digit typed: overwriting a filled box should replace it
    // rather than be ignored because the box is "full".
    const typed = event.target.value.match(DIGITS)?.pop()
    if (!typed) return

    const next = (value.padEnd(length, ' ').slice(0, index) + typed + value.slice(index + 1))
      .slice(0, length)
      .trimEnd()

    commit(next)
    focusBox(index + 1)
  }

  const handleKeyDown = (index: number) => (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Backspace') {
      event.preventDefault()
      if (value[index]) {
        commit(value.slice(0, index) + value.slice(index + 1))
      } else if (index > 0) {
        // Empty box: clear the one before it and go there.
        commit(value.slice(0, index - 1) + value.slice(index))
        focusBox(index - 1)
      }
      return
    }

    if (event.key === 'ArrowLeft') {
      event.preventDefault()
      focusBox(index - 1)
    }

    if (event.key === 'ArrowRight') {
      event.preventDefault()
      focusBox(index + 1)
    }
  }

  const handlePaste = (event: ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault()
    const pasted = event.clipboardData.getData('text').match(DIGITS)?.join('') ?? ''
    if (!pasted) return

    const next = pasted.slice(0, length)
    commit(next)
    focusBox(next.length)
  }

  return (
    <div
      className={`otp${invalid ? ' otp--invalid' : ''}`}
      role="group"
      aria-label={label}
    >
      {Array.from({ length }, (_, index) => (
        <input
          key={index}
          ref={(element) => {
            boxes.current[index] = element
          }}
          className={`otp__box${value[index] ? ' otp__box--filled' : ''}`}
          type="text"
          inputMode="numeric"
          autoComplete={index === 0 ? 'one-time-code' : 'off'}
          maxLength={1}
          disabled={disabled}
          value={value[index] ?? ''}
          aria-label={`Digit ${index + 1} of ${length}`}
          onChange={handleChange(index)}
          onKeyDown={handleKeyDown(index)}
          onPaste={handlePaste}
        />
      ))}
    </div>
  )
}
