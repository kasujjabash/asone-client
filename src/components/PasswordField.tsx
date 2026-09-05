/**
 * Password field with a reveal toggle.
 *
 * Shared rather than local to sign-in: the same control is needed on the
 * set-a-password screen that the password gate forces every new account
 * through, and again wherever a lead sets someone else's password.
 *
 * The toggle is a real button so it can be reached from the keyboard, and it
 * announces which action it performs rather than what the state currently is.
 */

import { Eye, EyeOff } from 'lucide-react'
import { useState, type InputHTMLAttributes } from 'react'
import { TextField } from './TextField'

interface PasswordFieldProps
  extends Omit<InputHTMLAttributes<HTMLInputElement>, 'className' | 'id' | 'type'> {
  label?: string
  error?: string
}

export function PasswordField({ label = 'Password', error, ...input }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false)

  return (
    <TextField
      label={label}
      error={error}
      type={visible ? 'text' : 'password'}
      trailing={
        <button
          type="button"
          className="textfield__adornment"
          onClick={() => setVisible((shown) => !shown)}
          aria-label={visible ? 'Hide password' : 'Show password'}
        >
          {visible ? <EyeOff size={20} aria-hidden /> : <Eye size={20} aria-hidden />}
        </button>
      }
      {...input}
    />
  )
}
