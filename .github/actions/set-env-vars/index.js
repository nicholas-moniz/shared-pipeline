const core = require("@actions/core");
const fs = require("fs");
const path = require("path");

try {
  const workspace = process.env.GITHUB_WORKSPACE;
  const envFile = path.join(workspace, "runtime.env");

  const entries = [
    { key: "PATH", value: `${workspace}/tools/bin:${process.env.PATH}` },
    { key: "CALLER_PATH", value: `${workspace}/${process.env.GITHUB_REPOSITORY.split("/").pop()}` },
    { key: "LIBRARY_PATH", value: `${workspace}/shared-pipeline` },
    { key: "SCRIPTS_PATH", value: `${workspace}/scripts` },
    { key: "BUILD_PROPERTIES_PATH", value: `${workspace}/${process.env.BUILD_PROPERTIES_PATH}` },
    { key: "BUILD_PATH", value: `${workspace}/build.json` },
    { key: "LIBRARY_VERSION", value: process.env.LIBRARY_VERSION },
    { key: "WORKFLOW", value: process.env.WORKFLOW },
  ];

  const secrets = JSON.parse(process.env.SECRETS || "{}");
  
  for (const [key, value] of Object.entries(secrets)) {
    entries.push({ key, value });
  }

  const buildTypeEntry = { key: "BUILD_TYPE", value: "" };
  const match = process.env.WORKFLOW.match(/-(.*?)\./);
  if (!match) {
    throw new Error(`Unable to determine build type from workflow ${process.env.WORKFLOW}`);
  }
  
  const buildType = match[1];
  const supportedBuildTypes = {
    nodejs: "NODE",
    python: "PYTHON",
    go: "GO",
    java: "JAVA"
  };
  
  if (!(buildType in supportedBuildTypes)) {
    const validTypes = Object.keys(supportedBuildTypes).join(", ");
    throw new Error(`Invalid build type: ${buildType}. Valid types are: ${validTypes}`);
  }

  
  buildTypeEntry.value = supportedBuildTypes[buildType];
  entries.push(buildTypeEntry);

  fs.writeFileSync(envFile, "");
  entries.forEach(({ key, value }) => {
    fs.appendFileSync(envFile, `${key}=${value}\n`);
  });

  core.info(`Succesfully wrote all environment variables to runtime.env`);
} catch (err) {
  core.setFailed(`Failed to write runtime.env: ${err.message}`);
}
