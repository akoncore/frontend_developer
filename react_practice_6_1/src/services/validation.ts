export function validateSignup(
  email: string,
  password: string,
  confirmation: string,
) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()))
    return 'Enter a valid email address.';
  if (password.length < 6)
    return 'Password must contain at least 6 characters.';
  if (password !== confirmation) return 'Passwords do not match.';
  return null;
}
export function safeReturnPath(value: unknown) {
  return typeof value === 'string' &&
    value.startsWith('/') &&
    !value.startsWith('//') &&
    !value.includes('\\') &&
    !/^\/(login|signup|signin|signout)(\/|\?|$)/.test(value)
    ? value
    : '/profile';
}
