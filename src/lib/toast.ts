// CONFIRMED CONTRACT: `toast.success(message)` is the only method any
// test currently mocks/asserts on (see ResetPasswordPage.test.tsx,
// which does `vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn() } }))`).
// `error` and `info` are added proactively so checkout failures / admin
// CRUD errors don't each invent their own ad-hoc surface — but they are
// NOT yet locked in by any test, so treat their exact shape as
// negotiable during review.
function log(level: 'success' | 'error' | 'info', message: string): void {
  console.log(`[toast:${level}]`, message);
}

export const toast = {
  success: (message: string): void => log('success', message),
  error: (message: string): void => log('error', message),
  info: (message: string): void => log('info', message),
};
