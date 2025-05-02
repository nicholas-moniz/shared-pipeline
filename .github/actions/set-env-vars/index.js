const fs = require("fs");
const path = require("path");

const workspace = process.env.GITHUB_WORKSPACE;
const envFile = path.join(workspace, "runtime.env");

const entries = [
  { key: "PATH", value: `${workspace}/tools/bin:${process.env.PATH}` },
  { key: "CALLER_PATH", value: `${workspace}/${process.env.GITHUB_REPOSITORY.split("/")[-1]}` },
  { key: "LIBRARY_PATH", value: `${workspace}/shared-pipeline` },
  { key: "ACTIONS_PATH", value: `${workspace}/shared-pipeline/.github/actions` },
  { key: "SCRIPTS_PATH", value: `${workspace}/shared-pipeline/scripts`}
];

// Write to runtime.env
fs.writeFileSync(envFile, '');
entries.forEach(({ key, value }) => {
  fs.appendFileSync(envFile, `${key}=${value}\n`);
});
