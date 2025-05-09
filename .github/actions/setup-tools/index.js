module.exports = async function ({ core, env, exec, fs, path }) {
  try {
    await fs.mkdir(env.TOOLS_DIR, { recursive: true });
    
    const tools = JSON.parse(await fs.readFile(path.join(__dirname, "tools.json"), "utf-8"));
    const installScriptPath = path.join(__dirname, "install.sh");

    for (const tool of tools) {
      core.info(`Installing ${tool.name}`);
      const { name, url, method, bashArgs = [] } = tool;
      await exec.exec("bash", [installScriptPath, method, name, url, ...bashArgs]);
    }
  } catch (err) {
    core.error(`Tool installation failed: ${err}`);
    throw err;
  }
};
