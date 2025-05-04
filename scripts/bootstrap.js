const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const runtimeEnvPath = path.join(process.env.GITHUB_WORKSPACE || '.', "runtime.env");
if (fs.existsSync(runtimeEnvPath)) {
  dotenv.config({ path: runtimeEnvPath });
} else {
  console.log("No runtime.env found");
}

const entrypoint = path.join(process.env.GITHUB_ACTION_PATH, "index.js");
if (!fs.existsSync(entrypoint)) {
  console.error(`index.js not found at ${entrypoint}`);
  process.exit(1);
}

require(entrypoint);
