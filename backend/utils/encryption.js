const crypto = require('crypto');

// The encryption key should ideally be an environment variable (e.g., process.env.ENCRYPTION_KEY).
// We use a fallback constant here for demonstration/local testing. Ensure this is 32 bytes (256 bits).
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'vOVH6sdmpNWjRRIqCc7rdxs01lwHzfr3'; 
const ALGORITHM = 'aes-256-cbc';

/**
 * Encrypts a plain text string into a hex ciphertext
 * @param {string} text - The plain text string to encrypt
 * @returns {string} The encrypted string (iv:encryptedData format)
 */
function encrypt(text) {
  if (!text) return text;
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let encrypted = cipher.update(text);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    return iv.toString('hex') + ':' + encrypted.toString('hex');
  } catch (error) {
    console.error('Encryption failed:', error);
    return null;
  }
}

/**
 * Decrypts a ciphertext back to plain text
 * @param {string} text - The ciphertext string in iv:encryptedData format
 * @returns {string} The decrypted plain text string
 */
function decrypt(text) {
  if (!text) return text;
  try {
    const textParts = text.split(':');
    if (textParts.length !== 2) return text; // Probably not encrypted

    const iv = Buffer.from(textParts.shift(), 'hex');
    const encryptedText = Buffer.from(textParts.join(':'), 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENCRYPTION_KEY), iv);
    let decrypted = decipher.update(encryptedText);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    return decrypted.toString();
  } catch (error) {
    console.error('Decryption failed:', error);
    return text; // Return original text if decryption fails
  }
}

module.exports = { encrypt, decrypt };
