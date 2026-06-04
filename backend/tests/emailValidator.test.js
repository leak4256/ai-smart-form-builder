const { isValidEmail } = require('../src/validators/emailValidator');

describe('isValidEmail', () => {
  it('accepts a trimmed valid email', () => {
    expect(isValidEmail('  name@example.com  ')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isValidEmail('invalid-email')).toBe(false);
    expect(isValidEmail(null)).toBe(false);
    expect(isValidEmail(undefined)).toBe(false);
  });
});
