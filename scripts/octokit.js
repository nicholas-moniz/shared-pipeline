const github = require("@actions/github");

if (!process.env.NICHOLAS_MONIZ_GITHUB_TOKEN) {
  throw new Error("GitHub token not found in environment variable NICHOLAS_MONIZ_GITHUB_TOKEN");
}

const octokit = github.getOctokit(process.env.NICHOLAS_MONIZ_GITHUB_TOKEN);

module.exports = octokit;
