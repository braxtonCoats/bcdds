// scripts/validate-env.mjs
import * as figmaJSON from "../figma.config.json" with { type: "json" };

const TOKEN = process.env.FIGMA_ACCESS_TOKEN;
const FILE_KEY = process.env.FIGMA_FILE_KEY;
const URL_BASE = "https://api.figma.com/v1/files";

let hasErrors = false;

console.log("🔍 Validating Figma Code Connect environment...\n");

// 1. Check if env vars are set
console.log("1. Checking environment variables...");
if (!TOKEN) {
  console.error("   ❌ FIGMA_ACCESS_TOKEN is not set");
  hasErrors = true;
} else {
  console.log("   ✅ FIGMA_ACCESS_TOKEN is set");
}

if (!FILE_KEY) {
  console.error("   ❌ FIGMA_FILE_KEY is not set");
  hasErrors = true;
} else {
  console.log(`   ✅ FIGMA_FILE_KEY is set: ${FILE_KEY}`);
}

if (hasErrors) {
  console.error("\n❌ Please set both environment variables in your .env file");
  process.exit(1);
}

// 2. Validate token by checking user info
console.log("\n2. Validating access token...");
try {
  const userResponse = await fetch("https://api.figma.com/v1/me", {
    headers: { "X-FIGMA-TOKEN": TOKEN },
  });

  if (!userResponse.ok) {
    const error = await userResponse.json();
    console.error(`   ❌ Token validation failed: ${error.err || userResponse.statusText}`);
    hasErrors = true;
  } else {
    const user = await userResponse.json();
    console.log(`   ✅ Token is valid (user: ${user.email || user.handle || "unknown"})`);
  }
} catch (error) {
  console.error(`   ❌ Error validating token: ${error.message}`);
  hasErrors = true;
}

// 3. Validate file key by accessing the file
console.log("\n3. Validating file key...");
try {
  const fileResponse = await fetch(`${URL_BASE}/${FILE_KEY}`, {
    headers: { "X-FIGMA-TOKEN": TOKEN },
  });

  if (!fileResponse.ok) {
    const error = await fileResponse.json();
    console.error(`   ❌ File access failed: ${error.err || fileResponse.statusText}`);
    console.error(`   💡 Make sure the file key is correct and you have access to the file`);
    hasErrors = true;
  } else {
    const file = await fileResponse.json();
    console.log(`   ✅ File is accessible: ${file.name || "Unknown"}`);
    console.log(`   📄 File key: ${FILE_KEY}`);
  }
} catch (error) {
  console.error(`   ❌ Error accessing file: ${error.message}`);
  hasErrors = true;
}

// 4. Check if file key matches figma.config.json
console.log("\n4. Checking file key consistency with figma.config.json...");
const configUrls = figmaJSON.default.codeConnect.documentUrlSubstitutions;
const configFileKeys = new Set();

for (const url of Object.values(configUrls)) {
  const match = url.match(/figma\.com\/design\/([^/?]+)/i);
  if (match) {
    configFileKeys.add(match[1]);
  }
}

if (configFileKeys.size === 0) {
  console.log("   ⚠️  No file keys found in figma.config.json");
} else if (configFileKeys.size === 1) {
  const configKey = Array.from(configFileKeys)[0];
  if (configKey === FILE_KEY) {
    console.log(`   ✅ File key matches figma.config.json`);
  } else {
    console.warn(`   ⚠️  File key mismatch:`);
    console.warn(`      .env: ${FILE_KEY}`);
    console.warn(`      figma.config.json: ${configKey}`);
    console.warn(`   💡 Update figma.config.json URLs to use your file key`);
  }
} else {
  console.warn(`   ⚠️  Multiple file keys found in figma.config.json: ${Array.from(configFileKeys).join(", ")}`);
  if (configFileKeys.has(FILE_KEY)) {
    console.log(`   ✅ Your file key is present in the config`);
  } else {
    console.warn(`   ⚠️  Your file key is not in the config`);
  }
}

// 5. Test Code Connect publish capability (dry run)
console.log("\n5. Testing Code Connect configuration...");
try {
  // Check if figma.config.json is valid
  if (!configUrls || Object.keys(configUrls).length === 0) {
    console.warn("   ⚠️  No documentUrlSubstitutions found in figma.config.json");
  } else {
    console.log(`   ✅ Found ${Object.keys(configUrls).length} document URL substitutions`);
  }
  
  // Note: We can't fully test publish without actually running it,
  // but we can verify the config structure
  if (figmaJSON.default.codeConnect) {
    console.log("   ✅ figma.config.json structure looks valid");
    console.log(`   📝 Include paths: ${figmaJSON.default.codeConnect.include?.length || 0} patterns`);
  }
} catch (error) {
  console.error(`   ❌ Error reading figma.config.json: ${error.message}`);
  hasErrors = true;
}

// Final summary
console.log("\n" + "=".repeat(50));
if (hasErrors) {
  console.error("❌ Validation failed. Please fix the errors above.");
  console.error("\n💡 Next steps:");
  console.error("   1. Ensure your .env file has both FIGMA_ACCESS_TOKEN and FIGMA_FILE_KEY");
  console.error("   2. Verify your token has Code Connect scope");
  console.error("   3. Make sure you have access to the Figma file");
  process.exit(1);
} else {
  console.log("✅ All validations passed!");
  console.log("\n💡 You can now run:");
  console.log("   npx figma connect publish");
  console.log("\n📚 For more info, see: https://www.figma.com/developers/api#code-connect");
}