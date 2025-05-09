module.exports = async function ({ core, env, exec, fs, path }) {
  const installScriptPath = path.join(__dirname, "install.sh");

  async function installTool(tool) {
    const { name, url, method, bashArgs = "" } = tool;
    await exec.exec("bash", [installScriptPath, method, name, url, bashArgs]);
  }

  try {
    await fs.mkdir(env.TOOLS_DIR);
    const tools = JSON.parse(await fs.readFile(path.join(__dirname, "tools.json"), "utf-8"));

    for (const tool of tools) {
      core.startGroup(`Installing ${tool.name}`);
      await installTool(tool);
      core.endGroup();
    }
  } catch (err) {
    core.error(`Tool installation failed: ${err}`);
    throw err;
  }
};
