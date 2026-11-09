import { describe, expect, it } from 'vitest';
import { safeReturnPath, validateSignup } from './validation';
describe('signup validation', () => {
  it('accepts a valid matching password', () => {
    expect(
      validateSignup('student@example.com', 'secret123', 'secret123'),
    ).toBeNull();
  });
  it('rejects mismatched passwords before sending a request', () => {
    expect(
      validateSignup('student@example.com', 'secret123', 'different'),
    ).toBe('Passwords do not match.');
  });
  it('rejects invalid email and short password', () => {
    expect(validateSignup('wrong', 'secret123', 'secret123')).toBeTruthy();
    expect(
      validateSignup('student@example.com', 'short', 'short'),
    ).toBeTruthy();
  });
});
describe('post-login redirect', () => {
  it.each([
    'https://example.com',
    '//example.com',
    '/login',
    '/signup?x=1',
    null,
  ])('rejects unsafe or looping destination %s', (path) => {
    expect(safeReturnPath(path)).toBe('/profile');
  });
  it('preserves an internal destination and query', () => {
    expect(safeReturnPath('/community?page=2')).toBe('/community?page=2');
  });
});
