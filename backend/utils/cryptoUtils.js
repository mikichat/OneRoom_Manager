const crypto = require('crypto');

const algorithm = 'aes-256-cbc';
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 256 bits (32 characters)
const IV_LENGTH = 16; // For AES, this is always 16

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
  console.error('Error: ENCRYPTION_KEY must be defined and be 32 characters long in your .env file.');
  // In a real application, you might want to throw an error or handle this more gracefully
  // For now, we'll just log an error.
}

function encrypt(text) {
  if (!text) return text;
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    console.warn('Encryption key is not properly set. Returning original text.');
    return text;
  }
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
  let encrypted = cipher.update(text);
  encrypted = Buffer.concat([encrypted, cipher.final()]);
  return iv.toString('hex') + ':' + encrypted.toString('hex');
}

function decrypt(text) {
  if (!text) return text;
  if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    console.warn('Encryption key is not properly set. Returning original text.');
    return text;
  }
  const textParts = text.split(':');
  if (textParts.length !== 2) {
    // Not an encrypted string, return as is or handle error
    return text;
  }
  try {
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption failed:', error.message);
    return text; // Return original text if decryption fails
  }
}

module.exports = {
  encrypt,
  decrypt
};
