const fs = require("fs");
const path = require("path");
const { node } = require("./schemas/index")

// Read the file
const filePath = process.env.BUILD_PROPS || path.resolve(process.cwd(), "build-properties.json");
const raw = fs.readFileSync(filePath, "utf-8");
let data;

try {
  data = JSON.parse(raw);
} catch (err) {
  console.error("❌ Failed to parse build-properties.json as valid JSON.");
  process.exit(1);
}

// Validate and apply defaults
try {
  const parsed = schema.parse(data);
  console.log("✅ build-properties.json is valid.");
  fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2)); // Overwrite with default-applied
} catch (err) {
  console.error("❌ Validation failed:");
  console.error(err.errors);
  process.exit(1);
}
