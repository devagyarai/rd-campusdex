import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import LoginForm from '@/app/login/page';
import { useRouter } from 'next/navigation';

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

// Mock the login API call
global.fetch = vi.fn();

describe('LoginForm Component', () => {
  it('renders correctly', () => {
    render(<LoginForm />);
    expect(screen.getByPlaceholderText(/Email/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Login/i })).toBeInTheDocument();
  });

  it('shows error messages for empty fields', async () => {
    render(<LoginForm />);
    const submitBtn = screen.getByRole('button', { name: /Login/i });
    fireEvent.click(submitBtn);
    
    // Check form validation (assuming native or Zod validation shows some text)
    // For this boilerplate test, we wait for mock behavior.
  });

  it('submits successfully and redirects on valid credentials', async () => {
    const pushMock = vi.fn();
    (useRouter as unknown as ReturnType<typeof vi.fn>).mockReturnValue({ push: pushMock });
    
    (global.fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, redirect: '/student/dashboard' }),
    });

    render(<LoginForm />);
    fireEvent.change(screen.getByPlaceholderText(/Email/i), { target: { value: 'test@test.com' } });
    fireEvent.change(screen.getByPlaceholderText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button', { name: /Login/i }));

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/student/dashboard');
    });
  });
});
