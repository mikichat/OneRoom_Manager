const { encrypt, decrypt } = require('../../utils/crypto');

describe('Crypto Utilities', () => {
  test('encrypt and decrypt work correctly', () => {
    const original = 'Hello World';
    const encrypted = encrypt(original);
    const decrypted = decrypt(encrypted);
    expect(decrypted).toBe(original);
  });

  test('encrypt returns null for null input', () => {
    expect(encrypt(null)).toBeNull();
  });

  test('encrypt returns null for undefined input', () => {
    expect(encrypt(undefined)).toBeNull();
  });

  test('decrypt returns null for null input', () => {
    expect(decrypt(null)).toBeNull();
  });

  test('decrypt throws for invalid format', () => {
    expect(() => decrypt('invalid')).toThrow();
  });

  test('different encryptions for same text (random IV)', () => {
    const original = 'Test Text';
    const encrypted1 = encrypt(original);
    const encrypted2 = encrypt(original);
    expect(encrypted1).not.toBe(encrypted2);
    expect(decrypt(encrypted1)).toBe(original);
    expect(decrypt(encrypted2)).toBe(original);
  });
});
