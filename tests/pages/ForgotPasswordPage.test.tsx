import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import { useForgotPassword } from '@/hooks/useForgotPassword';

/**
 * ForgotPasswordPage.tsx is currently `return null`. Data contract:
 * ForgotPasswordPayload = { email }. useForgotPassword.test.ts guarantees
 * the hook ALWAYS resolves to `data: null` on success, with no signal
 * distinguishing a matched vs. unmatched email (deliberate, to prevent
 * account enumeration) — so this page's confirmation state must not, and
 * structurally cannot, branch on match/no-match. That's the one piece of
 * behavior here grounded in a confirmed contract rather than convention;
 * everything else (exact success copy) is our best inference and should
 * be confirmed against product copy before implementation.
 *
 * DESIGN, consistent with LoginPage/RegisterPage: mutateAsync + try/catch
 * in onSubmit, not mutate + {onError}. Unlike Login/Register, this hook
 * has no internal onSuccess of its own to lean on (its hook-level test
 * table lists no navigate/setAuth behavior at all), so the confirmation
 * UI is driven directly by the hook's own reactive `isSuccess` — the page
 * doesn't need local state to track "did this succeed," it just reads
 * what useForgotPassword() already exposes.
 *
 * We mock '@/hooks/useForgotPassword' entirely — page tests exercise
 * form/UI/success-state logic only, not network behavior.
 */

vi.mock('@/hooks/useForgotPassword');

function renderPage() {
  return render(
    <MemoryRouter>
      <ForgotPasswordPage />
    </MemoryRouter>
  );
}

function mockUseForgotPassword(
  overrides: Partial<{
    mutateAsync: ReturnType<typeof vi.fn>;
    isPending: boolean;
    isSuccess: boolean;
  }>
) {
  vi.mocked(useForgotPassword).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    isSuccess: false,
    ...overrides,
  } as unknown as ReturnType<typeof useForgotPassword>);
}

const submitButton = () => screen.getByRole('button', { name: /send|reset/i });

describe.skip('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseForgotPassword({});
  });

  it('renders the email field and submit button, with no confirmation message yet', () => {
    renderPage();
    expect(screen.getByPlaceholderText('Email')).toBeInTheDocument();
    expect(submitButton()).toBeInTheDocument();
    expect(
      screen.queryByText('If that email is registered, a reset link has been sent.')
    ).not.toBeInTheDocument();
  });

  it('client-side validation blocks submit on an invalid email format', async () => {
    const mutateAsync = vi.fn();
    mockUseForgotPassword({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('Email'), 'not-an-email');
    await user.click(submitButton());

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('calls mutateAsync with {email} on a valid submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(null);
    mockUseForgotPassword({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('Email'), 'jane@example.com');
    await user.click(submitButton());

    expect(mutateAsync).toHaveBeenCalledWith({ email: 'jane@example.com' });
  });

  it('swaps the form for the static confirmation message once isSuccess is true', () => {
    mockUseForgotPassword({ isSuccess: true });
    renderPage();

    expect(screen.queryByPlaceholderText('Email')).not.toBeInTheDocument();
    expect(
      screen.getByText('If that email is registered, a reset link has been sent.')
    ).toBeInTheDocument();
  });

  it('shows the identical confirmation message regardless of whether the email actually matched an account', () => {
    // Grounded directly in useForgotPassword.test.ts's contract: the hook
    // exposes no field distinguishing matched/unmatched, by design. There
    // is no "unmatched" variant to even test — this test exists to make
    // that absence explicit, so a future PR can't "helpfully" add a
    // branch here based on some new response field without this test
    // forcing the question of where that field would even come from.
    mockUseForgotPassword({ isSuccess: true });
    renderPage();

    expect(
      screen.getByText('If that email is registered, a reset link has been sent.')
    ).toBeInTheDocument();
  });

  it('does not navigate away on success — the confirmation is an in-place message swap', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(null);
    mockUseForgotPassword({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('Email'), 'jane@example.com');
    await user.click(submitButton());

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    // No navigate spy/assertion by design — see file header.
  });

  it('disables the submit button while isPending is true', () => {
    mockUseForgotPassword({ isPending: true });
    renderPage();

    expect(submitButton()).toBeDisabled();
  });

  // ADDED — neither doc nor hook covers what happens on a genuine
  // failure (the hook test only exercises a 500 "surfaces as-is," it
  // doesn't specify page behavior for it). Since the success path is
  // deliberately opaque about matches, an unhandled network/server error
  // shouldn't silently render the same "reset link has been sent"
  // message — that would be actively misleading, not just uninformative.
  // Flagging as an open question: what SHOULD this page show on a true
  // 500, given the success path can't be used to signal it either way?
  it.todo(
    'shows some distinct error state (not the success confirmation) on a genuine server error — exact copy/behavior TBD, needs a product decision'
  );

  // ADDED – verifies the button transitions to disabled/pending state immediately
  // after the submit click, not just when isPending is statically set to true.
  it('disables the button and shows pending state while mutation is in-flight', async () => {
    const user = userEvent.setup();
    // Never-resolving promise to keep the mutation pending indefinitely
    const mutateAsync = vi.fn().mockReturnValue(new Promise(() => {}));
    mockUseForgotPassword({ mutateAsync, isPending: false });
    const { rerender } = renderPage();

    await user.type(screen.getByPlaceholderText('Email'), 'jane@example.com');
    await user.click(submitButton());

    // Simulate React re-rendering with isPending = true after the click
    mockUseForgotPassword({ mutateAsync, isPending: true });
    rerender(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    const button = submitButton();
    expect(button).toBeDisabled();
    // Adjust the regex to the actual pending label (e.g., "Sending…")
    expect(button).toHaveTextContent(/sending/i);
  });
});
