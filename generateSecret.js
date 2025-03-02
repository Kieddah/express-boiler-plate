// Load the crypto module
const crypto = require('crypto');

// Generate a 64-byte random string and convert it to hexadecimal
const secret = crypto.randomBytes(64).toString('hex');

// Output the generated secret
console.log(`Your JWT Secret: ${secret}`);
