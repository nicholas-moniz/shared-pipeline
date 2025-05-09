module.exports = async function({ core, env, exec, fs, path }) {
  try {
    const workspace = env.GITHUB_WORKSPACE;
    const actionsDir = path.join(workspace, "shared-pipeline/.github/actions");
    const bootstrapJs = path.join(workspace, "shared-pipeline/shared/bootstrap.js");
    const bootstrapSh = path.join(workspace, "shared-pipeline/shared/bootstrap.sh");

    const entries = await fs.readdir(actionsDir, { withFileTypes: true });
    const actionDirs = entries
      .filter(dirent => dirent.isDirectory())
      .map(dirent => path.join(actionsDir, dirent.name));

    for (const actionPath of actionDirs) {
      const files = await fs.readdir(actionPath);
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
        core.info(`ℹNo matching .js or .sh file in ${actionPath}, skipping.`);
      }
    }
  } catch (err) {
    core.error(`Error during bootstrap propagation: ${err}`, { logOnly: true });
    throw err;
  }
};
