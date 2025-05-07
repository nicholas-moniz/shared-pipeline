const fs = require("fs");
const path = require("path");
const core = require("@actions/core");
const dotenv = require("dotenv");

try {
  const isPrepareJob = process.env.GITHUB_JOB === "prepare";

  const runtimeEnvPath = path.join(process.env.GITHUB_WORKSPACE, "runtime.env");
  if (fs.existsSync(runtimeEnvPath)) {
    dotenv.config({ path: runtimeEnvPath });
    core.info(`Loaded environment variables from ${runtimeEnvPath}`);
  } else if (isPrepareJob) {
    core.info(`${runtimeEnvPath} not found in prepare job (allowed)`);
  } else {
    throw new Error(`${runtimeEnvPath} was not found`);
  }

  let build;
  const buildPath = process.env.BUILD_PATH;
  const buildPropertiesPath = process.env.BUILD_PROPERTIES_PATH;
  if (fs.existsSync(buildPath)) {
    build = JSON.parse(fs.readFileSync(buildPropertiesPath, "utf8"));
    core.info(`Loaded ${buildPropertiesPath} and applied defaults into ${buildPath}`);
  } else if (isPrepareJob) {
    core.info(`${buildPath} not found in prepare job (allowed)`);
  } else {
    throw new Error(`${buildPath} was not found`);
  }

  const entrypoint = path.join(process.env.GITHUB_ACTION_PATH, "index.js");
  if (!fs.existsSync(entrypoint)) {
    throw new Error(`${entrypoint} was not found`);
  }

  global._entrypointPath = entrypoint;
} catch (err) {
  core.setFailed(`${err.message}`);
  process.exit(1);
}

require(global._entrypointPath);
