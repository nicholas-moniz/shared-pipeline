const { node } = require("./schemas/index");
const { ZodError } = require("zod");

module.exports = async function ({ fs, path, core, env }) {
  try {
    let schema;
    switch(env.BUILD_TYPE) {
      case "NODE":
        schema = node;
        break;
      default:
        throw new Error(`Invalid build type ${env.BUILD_TYPE}`);
    }

    const parsed = schema.parse(JSON.parse(fs.readFileSync(env.BUILD_PROPERTIES_PATH, "utf-8")));
    
    fs.writeFileSync(`${env.GITHUB_WORKSPACE}/build.json`, JSON.stringify(parsed, null, 2));
    core.info(`${process.env.BUILD_PROPERTIES_PATH} has been validated and parsed at ${env.GITHUB_WORKSPACE}/build.json`);
  } catch (err) {
    if (err instanceof ZodError) {
      core.error(`Failed to validate ${env.BUILD_PROPERTIES_PATH} for the following reasons`);
      err.errors.forEach(e => core.error(JSON.stringify(e, null, 2)));
    } else {
      core.error(`An unexpected error occured while trying to validate ${env.BUILD_PROPERTIES_PATH} for the following reason: ${err}`);
    }

    throw err;
  }
};
