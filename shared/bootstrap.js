const fs = require("fs");
const path = require("path");
const dotenv = require("dotenv");

const core = require("@actions/core");
const github = require("@actions/github");
const exec = require("@actions/exec");
const io = require("@actions/io");
const cache = require("@actions/cache");
const glob = require("@actions/glob");
const httpClient = require("@actions/http-client");
const toolCache = require("@actions/tool-cache");
const artifact = require("@actions/artifact");
const attest = require("@actions/attest");

try {
  const runtimeEnvPath = path.join(process.env.GITHUB_WORKSPACE, "runtime.env");
  if (fs.existsSync(runtimeEnvPath)) {
    dotenv.config({ path: runtimeEnvPath });
    core.info(`Loaded environment variables from ${runtimeEnvPath} into env context`);
  } else {
    core.warning(`${runtimeEnvPath} was not found, custom env variables not available in env context`);
  }

  let build;
  const buildPath = process.env.BUILD_PATH;
  if (buildPath && fs.existsSync(buildPath)) {
    build = JSON.parse(fs.readFileSync(buildPath, "utf8"));
    core.info(`Loaded ${buildPath} and applied defaults into build context`);
  } else {
    core.warning(`No file found at ${buildPath}, build context is unavailable`);
  }

  let octokit;
  if (process.env.NICHOLAS_MONIZ_GITHUB_TOKEN) {
    octokit = github.getOctokit(process.env.NICHOLAS_MONIZ_GITHUB_TOKEN);
    core.info("Created octokit context with github token from NICHOLAS_MONIZ_GITHUB_TOKEN");
  } else {
    core.warning(`Environment variable NICHOLAS_MONIZ_GITHUB_TOKEN was not set, octokit context is unavailable`);
  }

  const entrypoint = path.join(process.env.GITHUB_ACTION_PATH, "index.js");
  if (!fs.existsSync(entrypoint)) {
    throw new Error(`${entrypoint} was not found`);
  }

  const run = require(entrypoint);
  if (typeof run !== "function") {
    throw new Error(`Expected ${entrypoint} to export a function`);
  }

  const context = {
    fs,
    path,
    core,
    github,
    exec,
    io,
    cache,
    glob,
    httpClient,
    toolCache,
    artifact,
    attest,
    env: process.env,
    ...(build ? { build } : {}),
    ...(octokit ? { octokit } : {}),
  };

  run(context);
} catch (err) {
  core.setFailed(`${err.message}`);
}
