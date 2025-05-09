const fs = require("fs").promises;
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

let octokit;

(async () => {
  try {
    const runtimeEnvPath = path.join(process.env.GITHUB_WORKSPACE, "runtime.env");
    try {
      await fs.access(runtimeEnvPath);
      dotenv.config({ path: runtimeEnvPath });
      core.info(`Loaded environment variables from ${runtimeEnvPath} into env context`);
    } catch {
      core.warning(`${runtimeEnvPath} was not found, custom env variables not available in env context`);
    }

    let build;
    const buildPath = path.join(process.env.GITHUB_WORKSPACE, "build.json");
    try {
      await fs.access(buildPath);
      const buildData = await fs.readFile(buildPath, "utf8");
      build = JSON.parse(buildData);
      core.info(`Loaded ${buildPath} and applied defaults into build context`);
    } catch {
      core.warning(`${buildPath} was not found, build context is unavailable`);
    }

    if (process.env.NICHOLAS_MONIZ_GITHUB_TOKEN) {
      octokit = github.getOctokit(process.env.NICHOLAS_MONIZ_GITHUB_TOKEN);
      core.info("Created octokit context with github token from NICHOLAS_MONIZ_GITHUB_TOKEN environment variable");
    } else {
      core.warning(`Environment variable NICHOLAS_MONIZ_GITHUB_TOKEN was not set, octokit context is unavailable`);
    }

    const entrypoint = path.join(__dirname, "index.js");
    try {
      await fs.access(entrypoint);
    } catch {
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
    try {
      const { data } = await octokit.rest.actions.listJobsForWorkflowRunAttempt({
        owner: github.context.repo.owner,
        repo: github.context.repo.repo,
        run_id: github.context.runId,
        attempt_number: process.env.GITHUB_RUN_ATTEMPT,
      });

      let stepName;
      let jobName = process.env.GITHUB_JOB;

      const currentJob = data.jobs.find(job => job.name.includes(jobName));
      if (!currentJob) {
        throw new Error(`Could not find job '${jobName}' in current workflow run`);
      } else {
        const currentStep = currentJob.steps.find(step => step.status === "in_progress");
        if (!currentStep) {
          throw new Error(`Could not determine current step in job '${jobName}' — no 'in_progress' step found.`);
        } else {
          stepName = currentStep.name;
        }
      }

      core.setFailed(`Step '${stepName}' in job '${jobName}' failed with error: ${err.message}. See step logs for details.`);
    } catch (fallbackErr) {
      core.error(`Failed to resolve job/step metadata: ${fallbackErr.message}`);
      core.setFailed(`Action failed: ${err.message}.`);
    }
  }
})();
