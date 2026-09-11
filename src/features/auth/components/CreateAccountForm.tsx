/**
 * The create-account form.
 *
 * Presentational, like `SignInForm`: collects the three fields the design
 * calls for and hands them up. Does not call the API and does not decide
 * what happens on success.
 */

import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { Alert, Button, TextField } from '@/components'
import { paths } from '@/routes/paths'
import type { ApiError } from '@/api/errors'
import type { AccountRequest } from '@/api/types'

interface CreateAccountFormProps {
  onSubmit: (input: AccountRequest) => void
  pending: boolean
  error: ApiError | null
}

export function CreateAccountForm({ onSubmit, pending, error }: CreateAccountFormProps) {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [agreed, setAgreed] = useState(true)

  const fieldError = (name: string) => error?.fields?.[name]?.[0]
  const complete = fullName.trim() && email.trim() && phoneNumber.trim() && agreed

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!complete) return
    onSubmit({ full_name: fullName, email, phone_number: phoneNumber })
  }

  return (
    <form className="signin__form" onSubmit={handleSubmit} noValidate>
      {error && !error.fields && <Alert tone="error">{error.message}</Alert>}

      <TextField
        label="Full Name"
        autoComplete="name"
        required
        autoFocus
        value={fullName}
        error={fieldError('full_name')}
        onChange={(event) => setFullName(event.target.value)}
      />

      <TextField
        label="Email Address"
        type="email"
        autoComplete="email"
        required
        value={email}
        error={fieldError('email')}
        onChange={(event) => setEmail(event.target.value)}
      />

      <TextField
        label="Phone Number"
        type="tel"
        autoComplete="tel"
        required
        value={phoneNumber}
        error={fieldError('phone_number')}
        onChange={(event) => setPhoneNumber(event.target.value)}
      />

      <label className="signin__agree">
        <input type="checkbox" checked={agreed} onChange={(event) => setAgreed(event.target.checked)} />
        <span>
          I agree to the <a href="#terms">Terms of Service</a> and{' '}
          <a href="#privacy">Privacy Policy</a>
        </span>
      </label>

      <div className="signin__actions">
        <Button type="submit" size="lg" disabled={!complete || pending}>
          {pending ? 'Creating account…' : 'Create Account'}
        </Button>
      </div>

      <p className="signin__request">
        Already have an account?{' '}
        <Link className="link-quiet" to={paths.signIn}>
          Sign In
        </Link>
      </p>
    </form>
  )
}
