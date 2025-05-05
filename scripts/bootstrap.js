const fs = require("fs");
const path = require("path");
const core = require("@actions/core");
const dotenv = require("dotenv");

try {
  const currentJob = process.env.GITHUB_JOB;
  const isPrepareJob = currentJob === "prepare";

  const runtimeEnvPath = path.join(process.env.GITHUB_WORKSPACE || ".", "runtime.env");
  if (fs.existsSync(runtimeEnvPath)) {
    dotenv.config({ path: runtimeEnvPath });
    core.info("Loaded runtime.env");
  } else if (isPrepareJob) {
    core.info("runtime.env not found in prepare job (allowed)");
  } else {
    throw new Error(`runtime.env not found at ${runtimeEnvPath} in job '${currentJob}'`);
  }

  const buildPath = process.env.BUILD_PATH;
  if (buildPath && fs.existsSync(buildPath)) {
    global.build = JSON.parse(fs.readFileSync(buildPath, "utf8"));
    core.info("Loaded build properties");
  } else if (isPrepareJob) {
    core.info("build.json not found in prepare job (allowed)");
  } else {
    throw new Error(`BUILD_PATH not found or missing in job '${currentJob}': ${buildPath}`);
  }

  const entrypoint = path.join(process.env.GITHUB_ACTION_PATH, "index.js");
  if (!fs.existsSync(entrypoint)) {
    throw new Error(`index.js not found at ${entrypoint}`);
  }

  global._entrypointPath = entrypoint;

} catch (err) {
  core.setFailed(`${err.message}`);
  process.exit(1);
}

require(global._entrypointPath);
