// tests/pages/auth/ResetPasswordPage.test.tsx
vi.mock('@/hooks/useResetPassword');
vi.mock('@/lib/toast', () => ({ toast: { success: vi.fn() } }));
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>();
  return { ...actual, useNavigate: vi.fn(), useSearchParams: vi.fn() };
});

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, useNavigate, useSearchParams } from 'react-router-dom';
import ResetPasswordPage from '@/pages/auth/ResetPasswordPage';
import { useResetPassword } from '@/hooks/useResetPassword';
import { toast } from '../../../src/lib/toast';

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

// ★ FIXED: Regex matches both "Reset password" and "Resetting…"
const submitButton = () => screen.getByRole('button', { name: /reset password|resetting/i });

describe('ResetPasswordPage', () => {
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
    const form = submitButton().closest('form');
    expect(form?.textContent?.length ?? 0).toBeGreaterThan(0);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('disables the submit button while isPending is true', () => {
    mockUseResetPassword({ isPending: true });
    renderPage();

    expect(submitButton()).toBeDisabled();
  });

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

  it('clears the root error when the user corrects the token/password and submits successfully', async () => {
    const user = userEvent.setup();
    const mutateAsyncFail = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 400, data: { message: 'Invalid reset link' } },
    });
    mockUseResetPassword({ mutateAsync: mutateAsyncFail });
    const { rerender } = renderPage();

    await user.type(screen.getByPlaceholderText('New password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'password123');
    await user.click(submitButton());

    expect(await screen.findByText('Invalid reset link')).toBeInTheDocument();

    const mutateAsyncSuccess = vi.fn().mockResolvedValue(null);
    mockUseResetPassword({ mutateAsync: mutateAsyncSuccess });
    rerender(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    await user.click(submitButton());

    await vi.waitFor(() => {
      expect(mutateAsyncSuccess).toHaveBeenCalled();
      expect(screen.queryByText('Invalid reset link')).not.toBeInTheDocument();
    });
  });

  it('shows a generic error on a non‑Axios rejection (e.g. network drop)', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Network Error'));
    mockUseResetPassword({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByPlaceholderText('New password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'password123');
    await user.click(submitButton());

    await vi.waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    const form = submitButton().closest('form');
    expect(form?.textContent?.trim().length ?? 0).toBeGreaterThan(0);
    expect(navigate).not.toHaveBeenCalled();
  });

  it('disables the button and shows pending state while mutation is in‑flight', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockReturnValue(new Promise(() => {}));
    mockUseResetPassword({ mutateAsync, isPending: false });
    const { rerender } = renderPage();

    await user.type(screen.getByPlaceholderText('New password'), 'password123');
    await user.type(screen.getByPlaceholderText('Confirm password'), 'password123');
    await user.click(submitButton());

    mockUseResetPassword({ mutateAsync, isPending: true });
    rerender(
      <MemoryRouter>
        <ResetPasswordPage />
      </MemoryRouter>
    );

    const button = submitButton();
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/resetting/i);
  });
});
