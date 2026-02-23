#!/usr/bin/env node

/**
 * IntervuAI Project Initialization Script
 * Runs setup and verification for the project
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

function checkFileExists(filePath, description) {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    log(colors.green, `✓ ${description}`);
    return true;
  } else {
    log(colors.red, `✗ ${description} - NOT FOUND`);
    return false;
  }
}

async function main() {
  log(colors.blue, '\n╔════════════════════════════════════════╗');
  log(colors.blue, '║   IntervuAI Project Setup & Validation   ║');
  log(colors.blue, '╚════════════════════════════════════════╝\n');

  // Check Node.js version
  log(colors.yellow, '📋 Checking prerequisites...\n');
  const nodeVersion = process.version;
  log(colors.green, `✓ Node.js ${nodeVersion}`);

  // Check project structure
  log(colors.yellow, '\n📁 Checking project structure...\n');

  const requiredFiles = [
    ['package.json', 'Root package.json'],
    ['README.md', 'Root README.md'],
    ['SETUP_GUIDE.md', 'Setup guide'],
    ['.env.example', 'Environment template'],
    ['backend/package.json', 'Backend package.json'],
    ['backend/src/index.js', 'Backend entry point'],
    ['backend/src/config/env.js', 'Environment config'],
    ['backend/src/config/database.js', 'Database config'],
    ['backend/src/models/User.js', 'User model'],
    ['backend/src/models/Interview.js', 'Interview model'],
    ['backend/src/services/gptService.js', 'GPT service'],
    ['backend/src/services/deepgramService.js', 'Deepgram service'],
    ['frontend/package.json', 'Frontend package.json'],
    ['frontend/src/main.jsx', 'Frontend entry point'],
    ['frontend/vite.config.js', 'Vite config'],
    ['frontend/tailwind.config.js', 'Tailwind config'],
  ];

  let allFilesExist = true;
  requiredFiles.forEach(([filePath, description]) => {
    if (!checkFileExists(filePath, description)) {
      allFilesExist = false;
    }
  });

  if (allFilesExist) {
    log(colors.green, '\n✓ All required files found!\n');
  } else {
    log(colors.red, '\n✗ Some files are missing. Please re-run setup.\n');
    process.exit(1);
  }

  // Summary
  log(colors.bright + colors.blue, '\n╔════════════════════════════════════════╗');
  log(colors.bright + colors.blue, '║           Setup Complete! ✨             ║');
  log(colors.bright + colors.blue, '╚════════════════════════════════════════╝\n');

  log(colors.yellow, '📝 Next Steps:\n');
  console.log('  1. Copy .env.example to .env');
  console.log('     Edit .env with your API keys:\n');
  console.log('     - OPENAI_API_KEY (from platform.openai.com)');
  console.log('     - DEEPGRAM_API_KEY (from console.deepgram.com)');
  console.log('     - ELEVENLABS_API_KEY (from elevenlabs.io)');
  console.log('     - RAZORPAY_KEY_* (from razorpay.com)');
  console.log('     - JWT_SECRET (any 32+ character string)');
  console.log('     - MONGODB_URI (local or MongoDB Atlas)\n');

  console.log('  2. Start MongoDB:');
  console.log('     mongod\n');

  console.log('  3. Install dependencies:');
  console.log('     npm install\n');

  console.log('  4. Run development servers:');
  console.log('     npm run dev\n');

  console.log('  5. Visit:');
  console.log('     Backend:  http://localhost:3000/api/health');
  console.log('     Frontend: http://localhost:5173\n');

  log(colors.bright + colors.green, '🎉 Happy coding! Start with PHASE_1_GUIDE.md\n');
}

main().catch(error => {
  log(colors.red, `✗ Error: ${error.message}`);
  process.exit(1);
});
