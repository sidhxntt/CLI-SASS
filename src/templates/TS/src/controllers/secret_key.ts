import CryptoJS from 'crypto-js';

// Generate a random secret key
const secretKey = CryptoJS.lib.WordArray.random(16).toString(CryptoJS.enc.Hex);
console.log('Generated Secret Key:', secretKey);

// Hash the secret key using SHA-256
const hashedSecretKey = CryptoJS.SHA256(secretKey).toString(CryptoJS.enc.Hex);
console.log('Hashed Secret Key:', hashedSecretKey);

