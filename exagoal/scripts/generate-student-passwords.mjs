// scripts/generate-student-passwords.mjs
// Run this script using: node scripts/generate-student-passwords.mjs

import crypto from 'crypto';
import fs from 'fs';
import path from 'path';

// --- CONFIGURATION ---
// Add your students here (or read from a CSV file in a real scenario)
const students = [
  { name: 'Alice Smith', email: 'alice@university.edu' },
  { name: 'Bob Jones', email: 'bob@university.edu' },
  { name: 'Charlie Brown', email: 'charlie@university.edu' },
  { name: 'Diana Prince', email: 'diana@university.edu' },
];

const PASSWORD_LENGTH = 12;

// Character sets for secure passwords
const UPPERCASE = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const LOWERCASE = 'abcdefghijklmnopqrstuvwxyz';
const NUMBERS = '0123456789';
const SYMBOLS = '!@#$%^&*';
const ALL_CHARS = UPPERCASE + LOWERCASE + NUMBERS + SYMBOLS;

/**
 * Generates a cryptographically secure random password
 */
function generateSecurePassword(length) {
  let password = '';
  
  // Ensure at least one of each character type for security
  password += UPPERCASE[crypto.randomInt(0, UPPERCASE.length)];
  password += LOWERCASE[crypto.randomInt(0, LOWERCASE.length)];
  password += NUMBERS[crypto.randomInt(0, NUMBERS.length)];
  password += SYMBOLS[crypto.randomInt(0, SYMBOLS.length)];

  // Fill the rest randomly
  for (let i = password.length; i < length; i++) {
    password += ALL_CHARS[crypto.randomInt(0, ALL_CHARS.length)];
  }

  // Shuffle the password so the first 4 characters aren't predictable
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}

console.log('Generating unique passwords for students...\n');

const generatedData = [];

// Generate passwords
students.forEach((student) => {
  const password = generateSecurePassword(PASSWORD_LENGTH);
  
  // In a real scenario, you would hash this password using bcrypt
  // and insert it into your Supabase database here.
  
  generatedData.push({
    name: student.name,
    email: student.email,
    initial_password: password,
  });
});

// Create CSV content
const csvHeader = 'Name,Email,Initial Password\n';
const csvRows = generatedData.map(s => `"${s.name}","${s.email}","${s.initial_password}"`).join('\n');
const csvContent = csvHeader + csvRows;

// Save to file
const outputPath = path.join(process.cwd(), 'student-credentials.csv');
fs.writeFileSync(outputPath, csvContent);

console.log('✅ Success! Generated passwords for ' + students.length + ' students.');
console.log('📁 Saved to: ' + outputPath);
console.log('\n⚠️  IMPORTANT: Keep this file secure. It contains raw passwords.');
console.log('You can now open student-credentials.csv in Excel/Numbers to distribute these to students.');
