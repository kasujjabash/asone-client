/**
 * Button — section 03.
 *
 * Four variants, three sizes. Disabled is a first-class state here, not an
 * afterthought: this system deactivates rather than deletes, and refuses
 * actions by role, so "present but not available" is common.
 */

import type { ButtonHTMLAttributes, ReactNode } from 'react'

/**
 * `inverse` is for brand surfaces — the teal backdrop on onboarding and
 * sign-in. A primary button there would be teal on teal and disappear.
 */
type Variant =
  | 'primary'
  | 'secondary'
  | 'danger'
  /** Outlined red — a destructive action that should not shout. */
  | 'danger-outline'
  | 'ghost'
  | 'inverse'
type Size = 'sm' | 'md' | 'lg'

interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'className'> {
  variant?: Variant
  size?: Size
  /** Fills its container — for the primary action at the foot of a form. */
  full?: boolean
  children: ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  full = false,
  children,
  ...rest
}: ButtonProps) {
  const classes = ['btn', `btn--${variant}`]
  if (size !== 'md') classes.push(`btn--${size}`)
  if (full) classes.push('btn--full')

  return (
    <button className={classes.join(' ')} {...rest}>
      {children}
    </button>
  )
}
