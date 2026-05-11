const CryptoJS = require('crypto-js');

// Use environment variable for encryption key
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'MeShreyaencrypt123456789012345';

// Encrypt message before storing in database
const encryptMessage = (text) => {
  try {
    const encrypted = CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
    return encrypted;
  } catch (error) {
    console.error('Encryption error:', error);
    return text;
  }
};

// Decrypt message when reading from database
const decryptMessage = (encryptedText) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedText, ENCRYPTION_KEY);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    return decrypted;
  } catch (error) {
    console.error('Decryption error:', error);
    return encryptedText;
  }
};

// Encrypt message metadata (optional)
const encryptMetadata = (data) => {
  try {
    return CryptoJS.AES.encrypt(JSON.stringify(data), ENCRYPTION_KEY).toString();
  } catch (error) {
    console.error('Metadata encryption error:', error);
    return data;
  }
};

const decryptMetadata = (encryptedData) => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return JSON.parse(bytes.toString(CryptoJS.enc.Utf8));
  } catch (error) {
    console.error('Metadata decryption error:', error);
    return encryptedData;
  }
};

module.exports = {
  encryptMessage,
  decryptMessage,
  encryptMetadata,
  decryptMetadata
};