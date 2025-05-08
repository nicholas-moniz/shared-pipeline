const core = require("@actions/core");
const exec = require("@actions/exec");
const fs = require("fs");
const path = require("path");

(async () => {
  try {
    const workspace = process.env.GITHUB_WORKSPACE;
    const actionsDir = path.join(workspace, "shared-pipeline/.github/actions");
    const bootstrapJs = path.join(workspace, "shared-pipeline/shared/bootstrap.js");
    const bootstrapSh = path.join(workspace, "shared-pipeline/scripts/bootstrap.sh");

    const entries = fs.readdirSync(actionsDir, { withFileTypes: true })
      .filter(dirent => dirent.isDirectory())
      .map(dirent => path.join(actionsDir, dirent.name));

    for (const actionPath of entries) {
      const files = fs.readdirSync(actionPath);

      const hasJs = files.some(file => file.endsWith(".js"));
      const hasSh = files.some(file => file.endsWith(".sh"));

      if (hasJs) {
        const dest = path.join(actionPath, "bootstrap.js");
        await exec.exec("cp", [bootstrapJs, dest]);
        core.info(`Copied bootstrap.js to ${dest}`);
      } else if (hasSh) {
        const dest = path.join(actionPath, "bootstrap.sh");
        await exec.exec("cp", [bootstrapSh, dest]);
        core.info(`Copied bootstrap.sh to ${dest}`);
      } else {
        core.info(`No matching .js or .sh file in ${actionPath}, skipping.`);
      }
    }
  } catch (err) {
    core.setFailed(`Error during bootstrap propagation: ${err.message}`);
  }
})();
