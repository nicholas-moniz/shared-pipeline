const fs = require("fs");
const path = require("path");
const core = require("@actions/core");
const { node } = require("./schemas/index");
const { ZodError } = require("zod");

module.exports = function (build) {
  try {
    let schema;
    switch(process.env.BUILD_TYPE) {
      case "NODE":
        schema = node;
        break;
      default:
        throw new Error(`Invalid build type ${process.env.BUILD_TYPE}`);
    }
    
    const parsed = schema.parse(JSON.parse(process.env.BUILD_PROPERTIES_PATH));
    fs.writeFileSync(process.env.BUILD_PATH, JSON.stringify(parsed, null, 2));
    core.info(`${process.env.BUILD_PROPERTIES_PATH} has been validated and parsed at ${process.env.BUILD_PATH}`);
  } catch (err) {
    if (err instanceof ZodError) {
      core.error(`Failed to validate ${process.env.BUILD_PROPERTIES_PATH} for the following reasons`);
      err.errors.forEach(e => core.error(JSON.stringify(e, null, 2)));
    } else {
      core.error(`An unexpected error occured while trying to validate ${process.env.BUILD_PROPERTIES_PATH} for the following reason: ${err.message}`);
    }

    core.setFailed(`An error occured while trying to validate ${process.env.BUILD_PROPERTIES_PATH}. See step logs for more info`)
  }
};
