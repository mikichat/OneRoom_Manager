const crypto = require('crypto');
const algorithm = 'aes-256-cbc'; // Changed to aes-256-cbc
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY; // Must be 32 bytes (256 bits)
const IV_LENGTH = 16; // For AES, this is always 16 bytes

if (!ENCRYPTION_KEY || ENCRYPTION_KEY.length !== 32) {
    console.error('Encryption key (ENCRYPTION_KEY) must be 32 bytes long in .env');
    // Consider exiting or throwing an error in a production environment
}

exports.encrypt = (text) => {
    if (!text) return null;
    const iv = crypto.randomBytes(IV_LENGTH);
    const cipher = crypto.createCipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
};

exports.decrypt = (text) => {
    if (!text) return null;
    const textParts = text.split(':');
    if (textParts.length !== 2) {
      console.error('Invalid encrypted text format');
      return null;
    }
    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    try {
      const decipher = crypto.createDecipheriv(algorithm, Buffer.from(ENCRYPTION_KEY), iv);
      let decrypted = decipher.update(encryptedText);
      decrypted = Buffer.concat([decrypted, decipher.final()]);
      return decrypted.toString();
    } catch (error) {
      console.error('Decryption error:', error.message);
      return null;
    }
}; 