/**
 * Simple password generator for admin panel
 * Run with: node generate-password.js
 */

function generateSecurePassword(length = 12) {
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    const allChars = lowercase + uppercase + numbers + symbols;

    let password = '';

    // Ensure at least one character from each category
    password += lowercase[Math.floor(Math.random() * lowercase.length)];
    password += uppercase[Math.floor(Math.random() * uppercase.length)];
    password += numbers[Math.floor(Math.random() * numbers.length)];
    password += symbols[Math.floor(Math.random() * symbols.length)];

    // Fill the rest randomly
    for (let i = 4; i < length; i++) {
        password += allChars[Math.floor(Math.random() * allChars.length)];
    }

    // Shuffle the password
    password = password.split('').sort(() => Math.random() - 0.5).join('');

    return password;
}

// Generate and display a secure password
const securePassword = generateSecurePassword(16);
console.log('🔐 Generated Secure Password:');
console.log('===============================');
console.log(securePassword);
console.log('===============================');
console.log('');
console.log('📋 Copy this password and update it in admin.html:');
console.log('   const ADMIN_PASSWORD = \'' + securePassword + '\';');
console.log('');
console.log('⚠️  IMPORTANT: Keep this password secure and don\'t share it!');
console.log('   Store it in a password manager for safe keeping.');
