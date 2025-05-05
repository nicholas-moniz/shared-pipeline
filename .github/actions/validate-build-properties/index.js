const fs = require("fs");
const path = require("path");
const core = require("@actions/core");
const { node } = require("./schemas/index");

module.exports = function (build) {
  try {
    let schema;
    switch(process.env.BUILD_TYPE) {
      case "NODE":
        schema = node;
        break;
      default:
        
    }
    // Validate and apply defaults
    const parsed = schema.parse(build);
    core.info("✅ build-properties.json is valid.");

    // Overwrite the original file with normalized version (optional)
    const filePath = process.env.BUILD_PATH || path.resolve(process.cwd(), "build-properties.json");
    fs.writeFileSync(filePath, JSON.stringify(parsed, null, 2));
    core.info("✅ build-properties.json updated with defaults.");
  } catch (err) {
    // Handle Zod validation errors
    if (err.errors) {
      core.error("❌ Validation failed:");
      err.errors.forEach(e => core.error(JSON.stringify(e, null, 2)));
    } else {
      core.error("❌ Unexpected error:");
      core.error(err.message);
    }

    // Let the caller (bootstrap) handle the actual exit/failure
    throw err;
  }
};
