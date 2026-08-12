// tests/pages/auth/RegisterPage.test.tsx
vi.mock('@/hooks/useRegister');

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from '@/pages/auth/RegisterPage';
import { useRegister } from '@/hooks/useRegister';

function renderPage() {
  return render(
    <MemoryRouter>
      <RegisterPage />
    </MemoryRouter>
  );
}

function mockUseRegister(
  overrides: Partial<{ mutateAsync: ReturnType<typeof vi.fn>; isPending: boolean }>
) {
  vi.mocked(useRegister).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    ...overrides,
  } as unknown as ReturnType<typeof useRegister>);
}

describe('RegisterPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseRegister({});
  });

  it('renders name, email, and password fields', () => {
    renderPage();
    expect(screen.getByLabelText('Name')).toBeInTheDocument();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('client-side validation blocks submit on a too-short password', async () => {
    const mutateAsync = vi.fn();
    mockUseRegister({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Name'), 'Jane');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(await screen.findByText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('client-side validation blocks submit on an invalid email format', async () => {
    const mutateAsync = vi.fn();
    mockUseRegister({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Name'), 'Jane');
    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mutateAsync).not.toHaveBeenCalled();
    expect(await screen.findByText(/valid email/i)).toBeInTheDocument();
  });

  it('client-side validation blocks submit on a too-short name', async () => {
    const mutateAsync = vi.fn();
    mockUseRegister({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Name'), 'J');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('calls mutateAsync with exactly {name, email, password} on a valid submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockUseRegister({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Name'), 'Jane');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mutateAsync).toHaveBeenCalledWith({
      name: 'Jane',
      email: 'jane@example.com',
      password: 'password123',
    });
  });

  it('sets a root-level "Email already in use" message on a 409 conflict', async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue({ isAxiosError: true, response: { status: 409 } });
    mockUseRegister({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Name'), 'Jane');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Email already in use')).toBeInTheDocument();
  });

  it('does NOT show the 409-specific "Email already in use" message for a non-409 error', async () => {
    const mutateAsync = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: {
        status: 400,
        data: { message: 'Validation failed', errors: ['body.email: Invalid email'] },
      },
    });
    mockUseRegister({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Name'), 'Jane');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await vi.waitFor(() => expect(mutateAsync).toHaveBeenCalled());
    expect(screen.queryByText('Email already in use')).not.toBeInTheDocument();
  });

  it('disables the submit button while isPending is true', () => {
    mockUseRegister({ isPending: true });
    renderPage();

    // When isPending is true, the button text becomes "Creating account…"
    const button = screen.getByRole('button', { name: /creating account/i });
    expect(button).toBeDisabled();
  });

  it("does not itself navigate on success — that's useRegister's responsibility", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockUseRegister({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Name'), 'Jane');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Email already in use')).not.toBeInTheDocument();
  });

  it('clears the root error when the user corrects data and registers successfully', async () => {
    const user = userEvent.setup();
    const mutateAsyncFail = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 409 },
    });
    mockUseRegister({ mutateAsync: mutateAsyncFail });
    const { rerender } = renderPage();

    await user.type(screen.getByLabelText('Name'), 'Jane');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('Email already in use')).toBeInTheDocument();

    const mutateAsyncSuccess = vi.fn().mockResolvedValue({});
    mockUseRegister({ mutateAsync: mutateAsyncSuccess });
    rerender(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mutateAsyncSuccess).toHaveBeenCalled();
      expect(screen.queryByText('Email already in use')).not.toBeInTheDocument();
    });
  });

  it('shows a generic error on a non‑Axios rejection (e.g. network drop)', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Network Error'));
    mockUseRegister({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Name'), 'Jane');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(await screen.findByText('An unexpected error occurred')).toBeInTheDocument();
  });

  it('disables the button and shows pending state while mutation is in‑flight', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockReturnValue(new Promise(() => {}));
    mockUseRegister({ mutateAsync, isPending: false });
    const { rerender } = renderPage();

    await user.type(screen.getByLabelText('Name'), 'Jane');
    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    mockUseRegister({ mutateAsync, isPending: true });
    rerender(
      <MemoryRouter>
        <RegisterPage />
      </MemoryRouter>
    );

    const button = screen.getByRole('button', { name: /creating account/i });
    expect(button).toBeDisabled();
    expect(button).toHaveTextContent(/creating account/i);
  });
});
