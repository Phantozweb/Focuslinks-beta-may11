'use client';
import CryptoJS from 'crypto-js';

const SECRET_KEY = 'Focuslinks.in';

/**
 * Encrypts a membership ID into a profile token.
 */
export const encryptMembershipId = (membershipId: string): string => {
  return CryptoJS.AES.encrypt(membershipId, SECRET_KEY).toString();
};

/**
 * Decrypts a profile token back into a membership ID.
 */
export const decryptProfileToken = (token: string): string => {
  if (!token || typeof token !== 'string') return '';
  
  try {
    const bytes = CryptoJS.AES.decrypt(token, SECRET_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted || token; // Return original token if decryption results in empty string
  } catch (error) {
    // Silently return original token if decryption fails (likely not encrypted yet)
    return token;
  }
};
