const core = require("@actions/core");
const github = require("@actions/github");
const ocktokit = require(`${process.env.GITHUB_WORKSPACE}/shared-pipeline/scripts/octokit`);
const fs = require("fs");
const path = require("path");

try {
  const workspace = process.env.GITHUB_WORKSPACE;
  const envFile = path.join(workspace, "runtime.env");

  const entries = [
    { key: "PATH", value: `${workspace}/tools/bin:${process.env.PATH}` }, 
    { key: "CALLER_PATH", value: `${workspace}/${process.env.GITHUB_REPOSITORY.split("/")[-1]}` },
    { key: "LIBRARY_PATH", value: `${workspace}/shared-pipeline` },
    { key: "SCRIPTS_PATH", value: `${workspace}/scripts` },
    { key: "BUILD_PROPERTIES_PATH", value: `${workspace}/${core.getInput("build-properties-path")}` },
    { key: "BUILD_PATH", value: `${workspace}/build.json` }
  ];

  if(process.env.GITHUB_REF.includes("nodejs")) {
    entries.push({ key: "BUILD_TYPE", value: "NODE" });
  }
  
  fs.writeFileSync(envFile, "");
  entries.forEach(({ key, value }) => {
    fs.appendFileSync(envFile, `${key}=${value}\n`);
  });
} catch (err) {
  core.setFailed(err.message);
}
