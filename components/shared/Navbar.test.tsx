import { render, screen, fireEvent } from '@testing-library/react';
import { Navbar } from './Navbar';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { logoutUser } from '@/services/authService';

// Mock dependencies
vi.mock('@/context/AuthContext', () => ({
  useAuth: vi.fn(),
}));

vi.mock('next/navigation', () => ({
  useRouter: vi.fn(),
}));

vi.mock('@/services/authService', () => ({
  logoutUser: vi.fn(),
}));

vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

describe('Navbar', () => {
  const mockPush = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as any).mockReturnValue({
      push: mockPush,
    });
  });

  it('renders sign in and create account links when user is not logged in', () => {
    (useAuth as any).mockReturnValue({
      user: null,
      userData: null,
      loading: false,
    });

    render(<Navbar />);

    expect(screen.getByText('Sign In')).toBeInTheDocument();
    expect(screen.getByText('Create Account')).toBeInTheDocument();
  });

  it('renders dashboard and logout buttons when user is logged in', () => {
    (useAuth as any).mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      userData: { displayName: 'Test User', role: 'student' },
      loading: false,
    });

    render(<Navbar />);

    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.getByText('Test User')).toBeInTheDocument();
  });

  it('calls logoutUser and redirects to home on logout', async () => {
    (useAuth as any).mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      userData: { displayName: 'Test User', role: 'student' },
      loading: false,
    });

    render(<Navbar />);

    const logoutButton = screen.getByText('Logout');
    await fireEvent.click(logoutButton);

    expect(logoutUser).toHaveBeenCalled();
  });

  it('redirects to correct dashboard based on role', () => {
    (useAuth as any).mockReturnValue({
      user: { uid: '123', email: 'test@example.com' },
      userData: { displayName: 'Test User', role: 'manager' },
      loading: false,
    });

    render(<Navbar />);

    const dashboardButton = screen.getByText('Dashboard');
    fireEvent.click(dashboardButton);

    expect(mockPush).toHaveBeenCalledWith('/manager/dashboard');
  });
});
