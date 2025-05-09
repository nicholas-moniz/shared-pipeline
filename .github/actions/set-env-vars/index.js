module.exports = async function ({ env, core, fs, path }) {
  try {
    const workspace = env.GITHUB_WORKSPACE;
    const envFile = path.join(workspace, "runtime.env");
    const repoName = env.GITHUB_REPOSITORY.split("/").pop();

    const entries = [
      { key: "PATH", value: `${workspace}/tools/bin:${env.PATH}` },
      { key: "CALLER_PATH", value: `${workspace}/${repoName}` },
      { key: "LIBRARY_PATH", value: `${workspace}/shared-pipeline` },
      { key: "BUILD_PROPERTIES_PATH", value: `${workspace}/${repoName}/${env.BUILD_PROPERTIES_PATH}` },
      { key: "LIBRARY_VERSION", value: env.LIBRARY_VERSION },
      { key: "WORKFLOW", value: env.WORKFLOW },
    ];

    const secrets = JSON.parse(env.SECRETS || "{}");
    for (const [key, value] of Object.entries(secrets)) {
      entries.push({ key, value });
    }

    const buildTypeEntry = { key: "BUILD_TYPE", value: "" };
    const match = env.WORKFLOW.match(/-(.*?)\./);
    if (!match) {
      throw new Error(`Unable to determine build type from workflow ${env.WORKFLOW}`);
    }

    const buildType = match[1];
    const supportedBuildTypes = {
      nodejs: "NODE",
      python: "PYTHON",
      go: "GO",
      java: "JAVA",
    };

    if (!(buildType in supportedBuildTypes)) {
      const validTypes = Object.keys(supportedBuildTypes).join(", ");
      throw new Error(`Invalid build type: ${buildType}. Valid types are: ${validTypes}`);
    }

    buildTypeEntry.value = supportedBuildTypes[buildType];
    entries.push(buildTypeEntry);

    const lines = entries.map(({ key, value }) => `${key}=${value}`).join("\n") + "\n";
    await fs.writeFile(envFile, lines, "utf8");

    core.info(`Successfully wrote all environment variables to runtime.env`);
  } catch (err) {
    core.error(`An error occurred while trying to create runtime.env: ${err}`, { logOnly: true });
    throw err;
  }
};
