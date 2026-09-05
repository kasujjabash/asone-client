/**
 * Route paths, in one place.
 *
 * Separate from AppRoutes so importing a path does not pull a component graph
 * with it — and so Fast Refresh keeps working on the routes file.
 */

export const paths = {
  welcome: '/',
  signIn: '/sign-in',
  /** Signed-in confirmation. The dashboard takes this slot once it exists. */
  session: '/session',
} as const
