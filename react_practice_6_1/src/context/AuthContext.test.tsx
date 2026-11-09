import { afterEach, beforeEach, expect, it, vi } from 'vitest';
import { act, cleanup, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import type { User } from 'firebase/auth';
import { AuthProvider } from './AuthContext';
import ProtectedRoute from '../components/ProtectedRoute';
import Login from '../pages/Login';
import Profile from '../pages/Profile';
import * as authService from '../services/authService';

const mocks = vi.hoisted(() => ({
  observe: null as null | ((user: User | null) => void),
  unsubscribe: vi.fn(),
  login: vi.fn(),
  signup: vi.fn(),
  google: vi.fn(),
  logout: vi.fn(),
}));
vi.mock('../config/firebase', () => ({ firebaseConfigured: true }));
vi.mock('../services/authService', () => ({
  initializeAuth: vi.fn(async () => {}),
  observeAuth: vi.fn((next: (user: User | null) => void) => {
    mocks.observe = next;
    return mocks.unsubscribe;
  }),
  login: mocks.login,
  signup: mocks.signup,
  loginWithGoogle: mocks.google,
  logout: mocks.logout,
  authErrorMessage: (error: Error) => error.message,
}));
const user = {
  uid: 'test-uid',
  email: 'student@example.com',
  providerData: [{ providerId: 'password' }],
} as User;
beforeEach(() => {
  mocks.observe = null;
  mocks.login.mockReset();
  mocks.signup.mockReset();
  mocks.google.mockReset();
  mocks.logout.mockReset();
});
afterEach(cleanup);
function mount(path = '/profile') {
  return render(
    <AuthProvider>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Login signup />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/profile" element={<Profile />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </AuthProvider>,
  );
}
async function restore(value: User | null) {
  await waitFor(() => expect(mocks.observe).not.toBeNull());
  act(() => mocks.observe!(value));
}
it('waits for restored auth before redirecting and displays email and UID', async () => {
  mount();
  expect(screen.getByRole('status').textContent).toContain('Restoring');
  await restore(user);
  expect(screen.getByText('test-uid')).toBeTruthy();
  expect(screen.getByText('student@example.com')).toBeTruthy();
});
it('redirects guests to login, logs in, and logs out of a protected route', async () => {
  mocks.login.mockImplementation(async () => mocks.observe!(user));
  mocks.logout.mockImplementation(async () => mocks.observe!(null));
  mount();
  await restore(null);
  const browser = userEvent.setup();
  await browser.type(
    screen.getByLabelText('Email address'),
    'student@example.com',
  );
  await browser.type(screen.getByLabelText('Password'), 'secret123');
  await browser.click(screen.getByRole('button', { name: 'Sign in' }));
  expect(await screen.findByText('test-uid')).toBeTruthy();
  await browser.click(screen.getByRole('button', { name: 'Logout' }));
  expect(await screen.findByLabelText('Email address')).toBeTruthy();
});
it('Google button does not submit the password form', async () => {
  mount('/login');
  await restore(null);
  const browser = userEvent.setup();
  await browser.type(
    screen.getByLabelText('Email address'),
    'student@example.com',
  );
  await browser.type(screen.getByLabelText('Password'), 'secret123');
  await browser.click(
    screen.getByRole('button', { name: 'Continue with Google' }),
  );
  expect(authService.loginWithGoogle).toHaveBeenCalledTimes(1);
  expect(authService.login).not.toHaveBeenCalled();
});
it('shows an error for mismatched passwords without calling Firebase', async () => {
  mount('/signup');
  await restore(null);
  const browser = userEvent.setup();
  await browser.type(
    screen.getByLabelText('Email address'),
    'student@example.com',
  );
  await browser.type(
    screen.getByLabelText('Password', { exact: true }),
    'secret123',
  );
  await browser.type(screen.getByLabelText('Confirm password'), 'different');
  await browser.click(screen.getByRole('button', { name: 'Create account' }));
  expect(screen.getByRole('alert').textContent).toBe('Passwords do not match.');
  expect(authService.signup).not.toHaveBeenCalled();
});
it('shows sign-in failures and allows retry', async () => {
  mocks.login.mockRejectedValue(new Error('Incorrect credentials'));
  mount('/login');
  await restore(null);
  const browser = userEvent.setup();
  await browser.type(
    screen.getByLabelText('Email address'),
    'student@example.com',
  );
  await browser.type(screen.getByLabelText('Password'), 'secret123');
  await browser.click(screen.getByRole('button', { name: 'Sign in' }));
  expect((await screen.findByRole('alert')).textContent).toBe(
    'Incorrect credentials',
  );
});
