const core = require("@actions/core");
const fs = require("fs");
const path = require("path");

try {
  const workspace = process.env.GITHUB_WORKSPACE;
  const envFile = path.join(workspace, "runtime.env");

  const entries = [
    { key: "PATH", value: `${workspace}/tools/bin:${process.env.PATH}` }, 
    { key: "CALLER_PATH": `${workspace}/${process.env.GITHUB_REPOSITORY.split("/")[-1]}` },
    { key: "SCRIPTS_PATH": `${workspace}/scripts` },
    { key: "BUILD_PROPERTIES_PATH": `${workspace}/${core.getInput("build-properties-path")}` },
    { key: "BUILD_PATH": `${workspace}/build.json` }
  ];

  if(process.env.GITHUB_REF.includes("nodejs") {
    entries.push({ key: "BUILD_TYPE": "NODE" });
  }
  
  fs.writeFileSync(envFile, "");
  entries.forEach(({ key, value }) => {
    fs.appendFileSync(envFile, `${key}=${value}\n`);
  });
} catch (err) {
  core.setFailed(err.message);
}
