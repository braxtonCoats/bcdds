// scripts/publish-figma-connect.mjs
// Wrapper script to publish Figma Code Connect using token from .env file
import { execSync } from 'child_process';

const TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY;

if (!TOKEN) {
  console.error('❌ FIGMA_ACCESS_TOKEN is not set in .env file');
  process.exit(1);
}

if (!FILE_KEY) {
  console.warn('⚠️  FIGMA_FILE_KEY is not set in .env file');
}

console.log('🚀 Publishing to Figma Code Connect...\n');
console.log(`📄 Using file key: ${FILE_KEY || 'not set'}\n`);

try {
  execSync(`npx figma connect publish --token ${TOKEN}`, { 
    stdio: 'inherit' 
  });
  console.log('\n✅ Published successfully!');
} catch (error) {
  console.error('\n❌ Publish failed');
  process.exit(1);
}
