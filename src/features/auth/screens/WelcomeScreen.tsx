/**
 * Welcome — the way into the system.
 *
 * Brand deck on the left, an invitation on the right. Two ways on: start
 * onboarding, or sign in with an account you already have.
 *
 * "Get Started Onboarding" has nothing behind it. Accounts in this system
 * are created by a Program Lead or Operations Manager through
 * `POST /auth/users/` — there is no self-service sign-up endpoint, and given
 * that every transaction records who performed it, self-registration may not
 * be something AsOne wants at all. The button is rendered because the design
 * calls for it; it needs either an endpoint or a decision.
 */

import { Link } from 'react-router-dom'
import { BrandMark, Button } from '@/components'
import { SplitAuthLayout } from '../components/SplitAuthLayout'
import { paths } from '@/routes/paths'

export function WelcomeScreen() {
  return (
    <SplitAuthLayout>
      <div className="welcome">
        <header className="signin__head">
          <BrandMark width={80} label="AsOne" />
          <h1 className="signin__title">AsOne Logistics</h1>
          <p className="signin__subtitle">Inventory Management</p>
        </header>

        <p className="welcome__body">
          Streamline your warehouse operations, track uniforms across regions, and manage
          inventory allocations all in one unified logistics dashboard.
        </p>

        <Button size="lg" disabled>
          Get Started Onboarding
        </Button>

        <p className="signin__request">
          Already have an account?{' '}
          <Link className="link-accent" to={paths.signIn}>
            Sign In
          </Link>
        </p>
      </div>
    </SplitAuthLayout>
  )
}
