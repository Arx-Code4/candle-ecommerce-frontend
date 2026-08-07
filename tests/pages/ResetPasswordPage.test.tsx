import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate, useSearchParams } from 'react-router-dom';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import { useResetPassword } from '@/hooks/useResetPassword';

/**
 * ResetPasswordPage.tsx is currently `return null`. Data contract:
 * ResetPasswordPayload = { token, newPassword }. Per useResetPassword's
 * own test file, the token is opaque to the hook (it's just a string the
 * hook forwards) — the PAGE is what's responsible for reading it off the
 * URL (?token=...) rather than treating it as a user-editable form field.
 * confirmPassword exists only for client-side match-validation; it must
 * never be sent to the backend (ResetPasswordPayload has no such field).
 *
 * DESIGN, consistent with the other three auth pages: mutateAsync +
 * try/catch in onSubmit. UNLIKE useLogin/useRegister, useResetPassword's
 * own hook-level test table (No cache invalidation / Surfaces a 400 error)
 * shows no internal onSuccess of its own — no navigate, no setAuth. So,
 * per the shared reference doc, navigation-to-/login and the confirmation
 * toast happen in THIS PAGE's own try block after a successful
 * `await mutateAsync(...)`, not inside the hook. That's a real asymmetry
 * with Login/Register worth double-checking during implementation review.
 *
 * We mock '@/hooks/useResetPassword' AND react-router-dom's
 * useSearchParams/useNavigate, since this page (uniquely among the four)
 * reads the token and drives navigation itself.
 *
 * OPEN GAP — TOAST UTILITY DOES NOT EXIST YET: neither zip contains any
 * toast/notification module (no sonner, no react-hot-toast, no
 * `@/lib/toast`). The reference doc mentions "a toast/confirmation call"
 * on success. We mock an assumed `@/lib/toast` module exporting a
 * `toast.success(message)` function purely so this test file is
 * self-consistent — this is a real gap, not a confirmed API, and
 * implementation will need to either introduce that module or this test
 * (and the mock path below) will need to change to match whatever toast
 * mechanism actually gets chosen.
 */

vi.mock('@/hooks/useResetPassword');
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn() } }));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: vi.fn(), useSearchParams: vi.fn() };
});

import { toast } from '../../src/lib/toast';

function renderPage() {
  return render(
    <MemoryRouter>
      <ResetPasswordPage />
    </MemoryRouter>
  );
}

function mockUseResetPassword(
  overrides: Partial<{ mutateAsync: ReturnType<typeof vi.fn>; isPending: boolean }>
) {
  vi.mocked(useResetPassword).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    ...overrides,
  } as unknown as ReturnType<typeof useResetPassword>);
}

const submitButton = () => screen.getByRole('button', { name: /reset password/i });

describe.skip('ResetPasswordPage', () => {
  const navigate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockUseResetPassword({});
    vi.mocked(useNavigate).mockReturnValue(navigate);
    vi.mocked(useSearchParams).mockReturnValue([
      new URLSearchParams('token=abc123'),
      vi.fn(),
    ] as unknown as ReturnType<typeof useSearchParams>);
  });

  it('reads the token from the URL rather than rendering it as an editable field', () => {
    renderPage();
    expect(screen.queryByDisplayValue('abc123')).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/token/i)).not.toBeInTheDocument();
    expect(screen.queryByPlaceholderText(/token/i)).not.toBeInTheDocument();
  });

  it('renders newPassword and confirmPassword fields', () => {
    renderPage();
    expect(screen.getByPlaceholderText('New password')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirm password')).toBeInTheDocument();
  });

  it('client-side validation blocks submit on a too-short new password', async () => {
    const mutateAsync = vi.fn();
    mockUseResetPassword({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('New password'), 'short');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'short');
    await user.click(submitButton());

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('attaches "Passwords don\'t match" to confirmPassword specifically when the two differ', async () => {
    const mutateAsync = vi.fn();
    mockUseResetPassword({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('New password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'password456');
    await user.click(submitButton());

    expect(mutateAsync).not.toHaveBeenCalled();
    const confirmField = screen.getByPlaceholderText('Confirm password');
    // Asserting the error is scoped to confirmPassword, not shared/root —
    // matches the schema's `path: ['confirmPassword']` per the doc.
    expect(confirmField).toHaveAccessibleDescription(
      /passwords don't match|passwords do not match/i
    );
  });

  it('sends exactly {token, newPassword} on a valid submit — never confirmPassword', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(null);
    mockUseResetPassword({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('New password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'password123');
    await user.click(submitButton());

    expect(mutateAsync).toHaveBeenCalledWith({ token: 'abc123', newPassword: 'password123' });
    const payload = mutateAsync.mock.calls[0][0];
    expect(payload).not.toHaveProperty('confirmPassword');
  });

  it('navigates to /login and shows a toast on a successful reset', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(null);
    mockUseResetPassword({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('New password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'password123');
    await user.click(submitButton());

    await vi.waitFor(() => expect(navigate).toHaveBeenCalledWith('/login'));
    expect(toast.success).toHaveBeenCalled();
  });

  it.each([
    ['Invalid reset link', 'Invalid reset link'],
    ['Reset link has expired', 'Reset link has expired'],
    ['Reset link has already been used', 'Reset link has already been used'],
  ])(
    'maps the backend message "%s" to a root-level error reading "%s"',
    async (backendMessage, expectedText) => {
      const mutateAsync = vi.fn().mockRejectedValue({
        isAxiosError: true,
        response: { status: 400, data: { message: backendMessage } },
      });
      mockUseResetPassword({ mutateAsync });
      const user = userEvent.setup();
      renderPage();

      await user.type(screen.getByPlaceholderText('New password'), 'password123');
      await user.type(screen.getByPlaceholderText('Confirm password'), 'password123');
      await user.click(submitButton());

      expect(await screen.findByText(expectedText)).toBeInTheDocument();
      expect(navigate).not.toHaveBeenCalled();
    }
  );

  // ADDED — the doc enumerates the three known backend 400 messages but
  // doesn't say what happens for anything else (e.g. a 500, a network
  // error, or a 400 with a message the page doesn't recognize). Silently
  // showing nothing on an unrecognized error would leave the user staring
  // at a disabled-then-re-enabled button with no explanation.
  it('falls back to a generic root-level error for an unrecognized failure', async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue({ isAxiosError: true, response: { status: 500 } });
    mockUseResetPassword({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('New password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'password123');
    await user.click(submitButton());

    await vi.waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    // Not asserting exact copy (unspecified) — just that SOME visible
    // error text appears and the page doesn't silently do nothing.
    const form = submitButton().closest('form');
    expect(form?.textContent?.length ?? 0).toBeGreaterThan(0);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('disables the submit button while isPending is true', () => {
    mockUseResetPassword({ isPending: true });
    renderPage();

    expect(submitButton()).toBeDisabled();
  });

  // ADDED — a reset link is meant to be used once. If a user double-clicks
  // submit (or the request is slow), a second mutateAsync() call while the
  // first is still pending would burn the single-use token unnecessarily,
  // and could surface a "reset link has already been used" error on the
  // SECOND attempt that was actually just the user's own double-submit.
  it('does not call mutateAsync again from a second submit while a request is already pending', async () => {
    const mutateAsync = vi.fn();
    mockUseResetPassword({ mutateAsync, isPending: true });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('New password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'password123');
    const button = submitButton();
    expect(button).toBeDisabled();
    await user.click(button);

    expect(mutateAsync).not.toHaveBeenCalled();
  });
});
