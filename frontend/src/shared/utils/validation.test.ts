import { describe, expect, it } from 'vitest';
import { getInvalidEmails, isValidEmail, parseMailingList } from './validation';

describe('validation utils', () => {
  it('parses a mailing list from mixed separators', () => {
    expect(parseMailingList('a@example.com, b@example.com; c@example.com')).toEqual([
      'a@example.com',
      'b@example.com',
      'c@example.com'
    ]);
  });

  it('identifies invalid email addresses', () => {
    expect(isValidEmail('valid@example.com')).toBe(true);
    expect(getInvalidEmails(['valid@example.com', 'bad-email'])).toEqual(['bad-email']);
  });
});
