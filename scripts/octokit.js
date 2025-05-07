const { Octokit } = require("@octokit/rest");
const core = require("@actions/core");

async function main() {
  try {
    const octokit = new Octokit({ auth: process.env.NICHOLAS_MONIZ_GITHUB_TOKEN });

    const owner = process.env.GITHUB_REPOSITORY.split('/')[0];
    const repo = process.env.GITHUB_REPOSITORY.split('/')[1];
    const runId = process.env.GITHUB_RUN_ID;

    const run = await octokit.request('GET /repos/{owner}/{repo}/actions/runs/{run_id}', {
      owner,
      repo,
      run_id: runId
    });

    const runName = run.data.name;
    core.info(`Run name: ${runName}`);

    const buildPath = runName.replace(/^build-/, "").trim();
    core.setOutput("build-properties-path", buildPath);
  } catch (err) {
    core.setFailed(`❌ ${err.message}`);
  }
}

main();
