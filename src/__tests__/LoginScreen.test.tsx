import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginScreen from '../components/LoginScreen';

// Mock the auth store
const mockSetAuthenticated = jest.fn();
const mockUseAuth = jest.fn();

jest.mock('@/store/analysisStore', () => ({
  useAuth: () => mockUseAuth(),
}));

// Mock react-router-dom navigation
const mockNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

// Mock LoadingOverlay component
jest.mock('../components/LoadingOverlay', () => {
  return function MockLoadingOverlay({ loading }: { loading: boolean }) {
    return loading ? <div data-testid="loading-overlay">Loading...</div> : null;
  };
});

// Helper function to render component with router
const renderWithRouter = (component: React.ReactElement) => {
  return render(
    <MemoryRouter>
      {component}
    </MemoryRouter>
  );
};

describe('LoginScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
    
    // Default mock return values
    mockUseAuth.mockReturnValue({
      isAuthenticated: false,
      setAuthenticated: mockSetAuthenticated,
    });
  });

  afterEach(() => {
    jest.runOnlyPendingTimers();
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe('Component Rendering', () => {
    test('renders all essential UI elements', () => {
      renderWithRouter(<LoginScreen />);
      
      expect(screen.getByRole('heading', { name: /cortexreel/i })).toBeInTheDocument();
      expect(screen.getByText(/professional screenplay analysis platform/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      expect(screen.getByText(/demo password:/i)).toBeInTheDocument();
      expect(screen.getByText(/test123/i)).toBeInTheDocument();
    });

    test('displays password input with correct attributes', () => {
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      
      expect(passwordInput).toHaveAttribute('type', 'password');
      expect(passwordInput).toHaveAttribute('placeholder', 'Enter password');
      expect(passwordInput).toHaveAttribute('autoFocus');
      expect(passwordInput).toHaveValue('');
    });

    test('shows initial password length helper text', () => {
      renderWithRouter(<LoginScreen />);
      
      expect(screen.getByText(/password length: 0 characters/i)).toBeInTheDocument();
    });

    test('displays debug information', () => {
      renderWithRouter(<LoginScreen />);
      
      expect(screen.getByText(/button enabled: NO/i)).toBeInTheDocument();
      expect(screen.getByText(/loading: NO/i)).toBeInTheDocument();
    });

    test('does not show error alert initially', () => {
      renderWithRouter(<LoginScreen />);
      
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    });

    test('does not show loading overlay initially', () => {
      renderWithRouter(<LoginScreen />);
      
      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
    });
  });

  describe('Password Input Handling', () => {
    test('updates password value on user input', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(passwordInput, 'testpassword');
      
      expect(passwordInput).toHaveValue('testpassword');
    });

    test('updates password length helper text as user types', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(passwordInput, 'test');
      
      expect(screen.getByText(/password length: 4 characters/i)).toBeInTheDocument();
    });

    test('enables login button when password is not empty', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      expect(loginButton).toBeDisabled();
      
      await user.type(passwordInput, 'a');
      
      expect(loginButton).toBeEnabled();
      expect(screen.getByText(/button enabled: YES/i)).toBeInTheDocument();
    });

    test('disables login button when password is only whitespace', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(passwordInput, '   ');
      
      expect(loginButton).toBeDisabled();
      expect(screen.getByText(/please enter the password to enable login button/i)).toBeInTheDocument();
    });

    test('clears error when user starts typing', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      // First, trigger an error
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);
      
      // Fast-forward the async delay
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
      });
      
      // Now type to clear the error
      await user.clear(passwordInput);
      await user.type(passwordInput, 'n');
      
      expect(screen.queryByText(/invalid password/i)).not.toBeInTheDocument();
    });
  });

  describe('Form Submission and Authentication', () => {
    test('successfully authenticates with correct password', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(passwordInput, 'test123');
      await user.click(loginButton);
      
      // Verify loading state
      expect(screen.getByText(/logging in\.\.\./i)).toBeInTheDocument();
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
      expect(screen.getByText(/processing\.\.\./i)).toBeInTheDocument();
      
      // Fast-forward the async delay
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      await waitFor(() => {
        expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
      });
    });

    test('shows error for incorrect password', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);
      
      // Fast-forward the async delay
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/invalid password\. try "test123"/i)).toBeInTheDocument();
      });
      
      expect(screen.getByRole('alert')).toBeInTheDocument();
      expect(mockSetAuthenticated).not.toHaveBeenCalled();
    });

    test('handles form submission via Enter key', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      
      await user.type(passwordInput, 'test123');
      await user.keyboard('{Enter}');
      
      expect(screen.getByText(/logging in\.\.\./i)).toBeInTheDocument();
      
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      await waitFor(() => {
        expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
      });
    });

    test('prevents form submission when password is empty', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      // Button should be disabled
      expect(loginButton).toBeDisabled();
      
      // Try to click anyway (should not work)
      await user.click(loginButton);
      
      expect(mockSetAuthenticated).not.toHaveBeenCalled();
      expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
    });

    test('disables button during loading state', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(passwordInput, 'test123');
      await user.click(loginButton);
      
      expect(loginButton).toBeDisabled();
      expect(screen.getByText(/logging in\.\.\./i)).toBeInTheDocument();
    });
  });

  describe('Authentication State Management', () => {
    test('redirects to home when already authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        setAuthenticated: mockSetAuthenticated,
      });
      
      renderWithRouter(<LoginScreen />);
      
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });

    test('does not redirect when not authenticated', () => {
      mockUseAuth.mockReturnValue({
        isAuthenticated: false,
        setAuthenticated: mockSetAuthenticated,
      });
      
      renderWithRouter(<LoginScreen />);
      
      expect(mockNavigate).not.toHaveBeenCalled();
    });

    test('handles authentication state changes', () => {
      const { rerender } = renderWithRouter(<LoginScreen />);
      
      // Initially not authenticated
      expect(mockNavigate).not.toHaveBeenCalled();
      
      // Simulate authentication state change
      mockUseAuth.mockReturnValue({
        isAuthenticated: true,
        setAuthenticated: mockSetAuthenticated,
      });
      
      rerender(
        <MemoryRouter>
          <LoginScreen />
        </MemoryRouter>
      );
      
      expect(mockNavigate).toHaveBeenCalledWith('/', { replace: true });
    });
  });

  describe('Loading States and UI Feedback', () => {
    test('shows loading overlay during authentication', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(passwordInput, 'test123');
      await user.click(loginButton);
      
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
      expect(screen.getByText(/loading\.\.\./i)).toBeInTheDocument();
    });

    test('updates button text during loading', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      expect(loginButton).toHaveTextContent('Login');
      
      await user.type(passwordInput, 'test123');
      await user.click(loginButton);
      
      expect(screen.getByRole('button', { name: /logging in\.\.\./i })).toBeInTheDocument();
    });

    test('shows processing alert during loading', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(passwordInput, 'test123');
      await user.click(loginButton);
      
      expect(screen.getByText(/processing\.\.\./i)).toBeInTheDocument();
    });

    test('updates debug information during loading', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(passwordInput, 'test123');
      await user.click(loginButton);
      
      expect(screen.getByText(/loading: YES/i)).toBeInTheDocument();
      expect(screen.getByText(/button enabled: NO/i)).toBeInTheDocument();
    });
  });

  describe('Error Handling and Recovery', () => {
    test('displays error alert with correct styling', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);
      
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      await waitFor(() => {
        const alert = screen.getByRole('alert');
        expect(alert).toBeInTheDocument();
        expect(alert).toHaveTextContent(/invalid password\. try "test123"/i);
      });
    });

    test('clears loading state after failed authentication', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);
      
      // Initially loading
      expect(screen.getByTestId('loading-overlay')).toBeInTheDocument();
      
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      await waitFor(() => {
        expect(screen.queryByTestId('loading-overlay')).not.toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
      });
    });

    test('allows retry after failed authentication', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      // First failed attempt
      await user.type(passwordInput, 'wrongpassword');
      await user.click(loginButton);
      
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      await waitFor(() => {
        expect(screen.getByText(/invalid password/i)).toBeInTheDocument();
      });
      
      // Clear and try again with correct password
      await user.clear(passwordInput);
      await user.type(passwordInput, 'test123');
      await user.click(loginButton);
      
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      await waitFor(() => {
        expect(mockSetAuthenticated).toHaveBeenCalledWith(true);
      });
    });
  });

  describe('Edge Cases and Robustness', () => {
    test('handles rapid consecutive form submissions', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(passwordInput, 'test123');
      
      // Rapid clicks
      await user.click(loginButton);
      await user.click(loginButton);
      await user.click(loginButton);
      
      // Only the first click should be processed due to disabled state
      expect(loginButton).toBeDisabled();
      
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      await waitFor(() => {
        expect(mockSetAuthenticated).toHaveBeenCalledTimes(1);
      });
    });

    test('handles extremely long passwords', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const longPassword = 'a'.repeat(1000);
      
      await user.type(passwordInput, longPassword);
      
      expect(passwordInput).toHaveValue(longPassword);
      expect(screen.getByText(`Password length: ${longPassword.length} characters`)).toBeInTheDocument();
    });

    test('handles special characters in password', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const specialPassword = '!@#$%^&*()_+-=[]{}|;:,.<>?';
      
      await user.type(passwordInput, specialPassword);
      
      expect(passwordInput).toHaveValue(specialPassword);
    });

    test('maintains component state during re-renders', () => {
      const { rerender } = renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      
      fireEvent.change(passwordInput, { target: { value: 'test' } });
      expect(passwordInput).toHaveValue('test');
      
      rerender(
        <MemoryRouter>
          <LoginScreen />
        </MemoryRouter>
      );
      
      // Password should reset on re-render since it's not persisted
      expect(screen.getByLabelText(/password/i)).toHaveValue('');
    });

    test('handles empty string password correctly', async () => {
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      // Type and then clear
      await user.type(passwordInput, 'test');
      await user.clear(passwordInput);
      
      expect(loginButton).toBeDisabled();
      expect(screen.getByText(/password length: 0 characters/i)).toBeInTheDocument();
    });
  });

  describe('Console Logging (Integration)', () => {
    test('logs appropriate messages during authentication flow', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      const loginButton = screen.getByRole('button', { name: /login/i });
      
      await user.type(passwordInput, 'test123');
      await user.click(loginButton);
      
      expect(consoleSpy).toHaveBeenCalledWith('Login button clicked, password:', '[HIDDEN]');
      
      act(() => {
        jest.advanceTimersByTime(250);
      });
      
      await waitFor(() => {
        expect(consoleSpy).toHaveBeenCalledWith('Password correct, setting authenticated...');
      });
      
      consoleSpy.mockRestore();
    });

    test('logs empty password attempts', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const user = userEvent.setup({ advanceTimers: jest.advanceTimersByTime });
      renderWithRouter(<LoginScreen />);
      
      const passwordInput = screen.getByLabelText(/password/i);
      
      // Somehow trigger form submission with empty password (edge case)
      fireEvent.submit(passwordInput.closest('form')!);
      
      // Even though button is disabled, form submission handler should handle empty password
      expect(consoleSpy).toHaveBeenCalledWith('Login button clicked, password:', '[EMPTY]');
      
      consoleSpy.mockRestore();
    });
  });
});