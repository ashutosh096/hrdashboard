import crypto from 'node:crypto';
const ALGORITHM = 'aes-256-gcm';
const SECRET_KEY = process.env.TOKEN_ENCRYPTION_KEY || 'hros_default_secret_encryption_key_32bytes!!';
// Ensure secret key is 32 bytes
const key = crypto.scryptSync(SECRET_KEY, 'hros_salt', 32);
export function encrypt(text) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(ALGORITHM, key, iv);
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag().toString('hex');
    return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}
export function decrypt(cipherText) {
    const parts = cipherText.split(':');
    if (parts.length !== 3)
        return cipherText; // Fallback if plain text
    const [ivHex, authTagHex, encryptedText] = parts;
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = crypto.createDecipheriv(ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);
    let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
}
