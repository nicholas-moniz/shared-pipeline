const fs = require("fs");
const path = require("path");

const workspace = process.env.GITHUB_WORKSPACE;
const envFile = path.join(workspace, "runtime.env");

const entries = [
  { key: "PATH", value: `${workspace}/tools/bin:${process.env.PATH}` }
];

fs.writeFileSync(envFile, "");
entries.forEach(({ key, value }) => {
  fs.appendFileSync(envFile, `${key}=${value}\n`);
});
