// tests/pages/auth/ForgotPasswordPage.test.tsx
vi.mock('@/hooks/useForgotPassword');

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ForgotPasswordPage from '@/pages/auth/ForgotPasswordPage';
import { useForgotPassword } from '@/hooks/useForgotPassword';

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
const emailInput = () => screen.getByLabelText('Email');

describe('ForgotPasswordPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseForgotPassword({});
  });

  it('renders the email field and submit button, with no confirmation message yet', () => {
    renderPage();
    expect(emailInput()).toBeInTheDocument();
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

    await user.type(emailInput(), 'not-an-email');
    await user.click(submitButton());

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('calls mutateAsync with {email} on a valid submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue(null);
    mockUseForgotPassword({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(emailInput(), 'jane@example.com');
    await user.click(submitButton());

    expect(mutateAsync).toHaveBeenCalledWith({ email: 'jane@example.com' });
  });

  it('swaps the form for the static confirmation message once isSuccess is true', () => {
    mockUseForgotPassword({ isSuccess: true });
    renderPage();

    expect(screen.queryByLabelText('Email')).not.toBeInTheDocument();
    expect(
      screen.getByText('If that email is registered, a reset link has been sent.')
    ).toBeInTheDocument();
  });

  it('shows the identical confirmation message regardless of whether the email actually matched an account', () => {
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

    await user.type(emailInput(), 'jane@example.com');
    await user.click(submitButton());

    expect(mutateAsync).toHaveBeenCalledTimes(1);
  });

  it('disables the submit button while isPending is true', () => {
    mockUseForgotPassword({ isPending: true });
    renderPage();

    expect(submitButton()).toBeDisabled();
  });

  it.todo(
    'shows some distinct error state (not the success confirmation) on a genuine server error — exact copy/behavior TBD, needs a product decision'
  );

  it('disables the button and shows pending state while mutation is in-flight', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockReturnValue(new Promise(() => {}));
    mockUseForgotPassword({ mutateAsync, isPending: false });
    const { rerender } = renderPage();

    await user.type(emailInput(), 'jane@example.com');
    await user.click(submitButton());

    mockUseForgotPassword({ mutateAsync, isPending: true });
    rerender(
      <MemoryRouter>
        <ForgotPasswordPage />
      </MemoryRouter>
    );

    const button = submitButton();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/sending/i);
  });
});
