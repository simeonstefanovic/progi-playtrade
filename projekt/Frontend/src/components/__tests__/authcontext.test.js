import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../authcontext';

const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('initial state - not logged in when no token', () => {
    localStorageMock.getItem.mockReturnValue(null);

    const TestComponent = () => {
      const { isLoggedIn } = React.useContext(AuthContext);
      return <div data-testid="status">{isLoggedIn ? 'logged-in' : 'logged-out'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('status')).toHaveTextContent('logged-out');
  });

  test('initial state - logged in when token exists', () => {
    localStorageMock.getItem.mockReturnValue('test-token');

    const TestComponent = () => {
      const { isLoggedIn } = React.useContext(AuthContext);
      return <div data-testid="status">{isLoggedIn ? 'logged-in' : 'logged-out'}</div>;
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('status')).toHaveTextContent('logged-in');
  });

  test('login function sets token and updates state', async () => {
    localStorageMock.getItem.mockReturnValue(null);

    const TestComponent = () => {
      const { isLoggedIn, login } = React.useContext(AuthContext);
      return (
        <div>
          <div data-testid="status">{isLoggedIn ? 'logged-in' : 'logged-out'}</div>
          <button onClick={() => login('new-token')}>Login</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('status')).toHaveTextContent('logged-out');
    
    fireEvent.click(screen.getByText('Login'));
    
    await waitFor(() => {
      expect(localStorageMock.setItem).toHaveBeenCalledWith('token', 'new-token');
      expect(screen.getByTestId('status')).toHaveTextContent('logged-in');
    });
  });

  test('logout function removes token and updates state', async () => {
    localStorageMock.getItem.mockReturnValue('existing-token');

    const TestComponent = () => {
      const { isLoggedIn, logout } = React.useContext(AuthContext);
      return (
        <div>
          <div data-testid="status">{isLoggedIn ? 'logged-in' : 'logged-out'}</div>
          <button onClick={logout}>Logout</button>
        </div>
      );
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('status')).toHaveTextContent('logged-in');
    
    fireEvent.click(screen.getByText('Logout'));
    
    await waitFor(() => {
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('email');
      expect(screen.getByTestId('status')).toHaveTextContent('logged-out');
    });
  });
});
