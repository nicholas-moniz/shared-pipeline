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

(async () => {
  try {
    const runtimeEnvPath = path.join(process.env.GITHUB_WORKSPACE, "runtime.env");
    if (fs.existsSync(runtimeEnvPath)) {
      dotenv.config({ path: runtimeEnvPath });
      core.info(`Loaded environment variables from ${runtimeEnvPath} into env context`);
    } else {
      core.warning(`${runtimeEnvPath} was not found, custom env variables not available in env context`);
    }
  
    let build;
    const buildPath = path.join(process.env.GITHUB_WORKSPACE, "build.json");;
    if (fs.existsSync(buildPath)) {
      build = JSON.parse(fs.readFileSync(buildPath, "utf8"));
      core.info(`Loaded ${buildPath} and applied defaults into build context`);
    } else {
      core.warning(`${buildPath} was not found, build context is unavailable`);
    }
  
    let octokit;
    if (process.env.NICHOLAS_MONIZ_GITHUB_TOKEN) {
      octokit = github.getOctokit(process.env.NICHOLAS_MONIZ_GITHUB_TOKEN);
      core.info("Created octokit context with github token from NICHOLAS_MONIZ_GITHUB_TOKEN environment variable");
    } else {
      core.warning(`Environment variable NICHOLAS_MONIZ_GITHUB_TOKEN was not set, octokit context is unavailable`);
    }
  
    const entrypoint = path.join(__dirname, "index.js");
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
  
    await run(context);
  } catch (err) {
    const { data } = await octokit.rest.actions.listJobsForWorkflowRun({
      owner: github.context.repo.owner,
      repo: github.context.repo.repo,
      run_id: github.context.runId
    });

    const currentJob = data.jobs.find(job => job.name === process.env.GITHUB_JOB);
    if (!currentJob) throw new Error(`Job '${jobName}' not found in workflow run`);

    const currentStep = currentJob.steps.find(step => step.status === "in_progress");
    if (!currentStep) throw new Error("No step in progress found");
        
    core.setFailed(`Step ${step}' in job '${job}' failed with error: ${err.message}. See step logs for details.`);
  }
})();
