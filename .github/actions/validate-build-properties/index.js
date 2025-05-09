const { node } = require("./schemas/index");
const { ZodError } = require("zod");

module.exports = async function ({ fs, path, core, env }) {
  try {
    let schema;
    switch (env.BUILD_TYPE) {
      case "NODE":
        schema = node;
        break;
      default:
        throw new Error(`Invalid build type ${env.BUILD_TYPE}`);
    }

    const buildPath = env.BUILD_PROPERTIES_PATH;
    const workspacePath = env.GITHUB_WORKSPACE;
    const outputPath = path.join(workspacePath, "build.json");

    let rawJson;
    try {
      rawJson = await fs.readFile(buildPath, "utf-8");
    } catch (readErr) {
      throw new Error(`Failed to read build properties from ${buildPath}: ${readErr.message}`);
    }

    let parsed;
    try {
      parsed = schema.parse(JSON.parse(rawJson));
    } catch (validationErr) {
      if (validationErr instanceof ZodError) {
        core.error(`Failed to validate ${buildPath} due to the following issues:`, { logOnly: true });
        validationErr.errors.forEach(e => core.error(JSON.stringify(e, null, 2), { logOnly: true }));
        validationErr.message = `${buildPath} does match defined schema`;
        throw validationErr;
      } else {
        throw new Error(`Invalid JSON in ${buildPath}: ${validationErr.message}`);
      }
    }

    await fs.writeFile(outputPath, JSON.stringify(parsed, null, 2), "utf-8");
    core.info(`${buildPath} has been validated and parsed at ${outputPath}`);
  } catch (err) {
    core.error(`An error occurred while validating ${env.BUILD_PROPERTIES_PATH}: ${err}`, { logOnly: true });
    throw err;
  }
};
