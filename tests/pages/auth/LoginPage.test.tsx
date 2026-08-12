// tests/pages/auth/LoginPage.test.tsx
vi.mock('@/hooks/useLogin');

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from '@/pages/auth/LoginPage';
import { useLogin } from '@/hooks/useLogin';

function renderPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
}

function mockUseLogin(
  overrides: Partial<{ mutateAsync: ReturnType<typeof vi.fn>; isPending: boolean }>
) {
  vi.mocked(useLogin).mockReturnValue({
    mutateAsync: vi.fn(),
    isPending: false,
    ...overrides,
  } as unknown as ReturnType<typeof useLogin>);
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockUseLogin({});
  });

  it('renders email and password fields', () => {
    renderPage();
    expect(screen.getByLabelText('Email')).toBeInTheDocument();
    expect(screen.getByLabelText('Password')).toBeInTheDocument();
  });

  it('client-side validation blocks submit on an invalid email format', async () => {
    const mutateAsync = vi.fn();
    mockUseLogin({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'not-an-email');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Enter a valid email')).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('does not block submit on a short (but non-empty) password', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockUseLogin({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'short');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(mutateAsync).toHaveBeenCalledWith({ email: 'jane@example.com', password: 'short' });
  });

  it('blocks submit on an empty password', async () => {
    const mutateAsync = vi.fn();
    mockUseLogin({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Password is required')).toBeInTheDocument();
    expect(mutateAsync).not.toHaveBeenCalled();
  });

  it('calls mutateAsync with the form values on a valid submit', async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockUseLogin({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(mutateAsync).toHaveBeenCalledWith({
      email: 'jane@example.com',
      password: 'password123',
    });
  });

  it('shows a generic root-level error on failure, with no field-specific styling on email/password', async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue({ isAxiosError: true, response: { status: 401 } });
    mockUseLogin({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpassword');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
    expect(screen.queryByText('Enter a valid email')).not.toBeInTheDocument();
    expect(screen.queryByText('Password must be at least 8 characters')).not.toBeInTheDocument();
  });

  it('shows the same generic root-level error regardless of the failure status code', async () => {
    const mutateAsync = vi
      .fn()
      .mockRejectedValue({ isAxiosError: true, response: { status: 429 } });
    mockUseLogin({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });

  it('disables the submit button and shows a pending label while isPending is true', () => {
    mockUseLogin({ isPending: true });
    renderPage();

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });

  it("does not itself call useNavigate — navigation on success is entirely useLogin's responsibility", async () => {
    const mutateAsync = vi.fn().mockResolvedValue({});
    mockUseLogin({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(mutateAsync).toHaveBeenCalledTimes(1);
    expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
  });

  it('clears the root error when the user corrects credentials and submits successfully', async () => {
    const user = userEvent.setup();
    const mutateAsyncFail = vi.fn().mockRejectedValue({
      isAxiosError: true,
      response: { status: 401 },
    });
    mockUseLogin({ mutateAsync: mutateAsyncFail });
    const { rerender } = renderPage();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'wrongpass');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();

    const mutateAsyncSuccess = vi.fn().mockResolvedValue({});
    mockUseLogin({ mutateAsync: mutateAsyncSuccess });
    rerender(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    await user.click(screen.getByRole('button', { name: /login/i }));

    await waitFor(() => {
      expect(mutateAsyncSuccess).toHaveBeenCalled();
      expect(screen.queryByText('Invalid email or password')).not.toBeInTheDocument();
    });
  });

  it('shows generic error on a non‑Axios rejection (e.g. network drop)', async () => {
    const mutateAsync = vi.fn().mockRejectedValue(new Error('Network Error'));
    mockUseLogin({ mutateAsync });
    const user = userEvent.setup();
    renderPage();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    expect(await screen.findByText('Invalid email or password')).toBeInTheDocument();
  });

  it('disables the button and shows pending label while mutation is in-flight', async () => {
    const user = userEvent.setup();
    const mutateAsync = vi.fn().mockReturnValue(new Promise(() => {}));
    mockUseLogin({ mutateAsync, isPending: false });
    const { rerender } = renderPage();

    await user.type(screen.getByLabelText('Email'), 'jane@example.com');
    await user.type(screen.getByLabelText('Password'), 'password123');
    await user.click(screen.getByRole('button', { name: /login/i }));

    mockUseLogin({ mutateAsync, isPending: true });
    rerender(
      <MemoryRouter>
        <LoginPage />
      </MemoryRouter>
    );

    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled();
  });
});
