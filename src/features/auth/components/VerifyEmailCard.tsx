/**
 * Confirming the address a just-requested account was created against.
 *
 * Mirrors `VerifyCodeCard`'s shape (same card, same OTP input) since both
 * are "enter the 6-digit code we emailed you" moments — this one sits after
 * Create Account rather than after a password.
 */

import { Mail } from 'lucide-react'
import { useState } from 'react'
import { Alert, Button, OtpInput } from '@/components'
import type { ApiError } from '@/api/errors'

const CODE_LENGTH = 6

interface VerifyEmailCardProps {
  emailHint: string
  onSubmit: (code: string) => void
  onResend: () => void
  pending: boolean
  error: ApiError | null
}

export function VerifyEmailCard({
  emailHint,
  onSubmit,
  onResend,
  pending,
  error,
}: VerifyEmailCardProps) {
  const [code, setCode] = useState('')
  const complete = code.length === CODE_LENGTH

  return (
    <div className="auth-card">
      <div className="auth-card__halo">
        <Mail size={30} aria-hidden />
      </div>

      <h1 className="auth-card__title">Verify Your Email</h1>

      <p className="auth-card__body">
        We've sent a {CODE_LENGTH}-digit verification code to <strong>{emailHint}</strong>
      </p>

      {error && <Alert tone="error">{error.message}</Alert>}

      <OtpInput
        value={code}
        onChange={setCode}
        onComplete={onSubmit}
        length={CODE_LENGTH}
        disabled={pending}
        invalid={Boolean(error)}
      />

      <Button size="lg" disabled={!complete || pending} onClick={() => onSubmit(code)}>
        {pending ? 'Verifying…' : 'Verify Code'}
      </Button>

      <div className="auth-card__links">
        <button type="button" className="link-quiet link-button" onClick={onResend} disabled={pending}>
          Didn't receive the code? Resend Code
        </button>
      </div>
    </div>
  )
}
